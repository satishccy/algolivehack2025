import React, { useState } from 'react'
import algosdk, { Transaction } from 'algosdk'
import { ContractState } from '../interfaces/TokenizerContract'
import { getContractDetails } from '../utils/network/getContractDetails'
import { AlgorandClient } from '@algorandfoundation/algokit-utils/types/algorand-client';
import { getAlgodConfigFromViteEnvironment } from '../utils/network/getAlgoClientConfigs';

const contractDetails = getContractDetails();

interface AdminPanelProps {
  isAdmin: boolean
  contractState: ContractState | null
  onStateUpdate: (state: ContractState) => void
  onError: (error: string) => void
  activeAddress: string
  transactionSigner: (txnGroup: Transaction[], indexesToSign: number[]) => Promise<Uint8Array[]>
  contractAppId: number
}

const AdminPanel: React.FC<AdminPanelProps> = ({
  isAdmin,
  contractState,
  onStateUpdate,
  onError,
  activeAddress,
  transactionSigner,
  contractAppId
}) => {
  const [newAdmin, setNewAdmin] = useState('')
  const [newAssetId, setNewAssetId] = useState('')
  const [loading, setLoading] = useState(false)

  const handleModifyAdmin = async () => {
    if (!newAdmin || !algosdk.isValidAddress(newAdmin)) {
      onError('Please enter a valid admin address')
      return
    }

    try {
      setLoading(true)
      const txn = await contractDetails.appClient.send.modifyAdmin({
        args: {
          admin: newAdmin
        },
        sender: activeAddress,
        signer: transactionSigner
      })
      const txId = txn.txIds[0]
      
      setTimeout(() => {
        const updatedState: ContractState = {
          admin: newAdmin,
          asa_id: contractState?.asa_id || BigInt(0)
        }
        onStateUpdate(updatedState)
        setNewAdmin('')
        setLoading(false)
      }, 1000)
    } catch (error) {
      setLoading(false)
      onError(`Failed to modify admin: ${error}`)
    }
  }

  const handleModifyAssetId = async () => {
    if (!newAssetId || isNaN(Number(newAssetId))) {
      onError('Please enter a valid asset ID')
      return
    }
    try {
        const algodConfig = getAlgodConfigFromViteEnvironment()
  const algorand = AlgorandClient.fromConfig({ algodConfig })       
      const result = await algorand.client.algod.getAssetByID(Number(newAssetId)).do()
      if(result.params.clawback !== contractDetails.appAddress) {
        onError(`Asset ID ${newAssetId} clawback address is not the contract address`)
        return
      }
    } catch (error) {
      onError(`Failed to get asset details: ${error}`)
      return
    }

    try {
      setLoading(true)

      const txn = await contractDetails.appClient.send.modifyAsa({
        args: {
          asaId: BigInt(newAssetId)
        }
      })
      const txId = txn.txIds[0]

      // Mock implementation - replace with actual contract call
      // const txn = await contractClient.modify_asa({ asa_id: BigInt(newAssetId) })
      // await transactionSigner([txn], [0])
      
      // For now, simulate success
      setTimeout(() => {
        const updatedState: ContractState = {
          admin: contractState?.admin || activeAddress,
          asa_id: BigInt(newAssetId)
        }
        onStateUpdate(updatedState)
        setNewAssetId('')
        setLoading(false)
      }, 1000)
    } catch (error) {
      setLoading(false)
      onError(`Failed to modify asset ID: ${error}`)
    }
  }

  if (!isAdmin) {
    return (
      <div className="text-center py-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">Admin Access Required</h3>
          <p className="text-yellow-700">
            Only the contract admin can modify admin settings and asset ID.
          </p>
          <p className="text-sm text-yellow-600 mt-2">
            Current admin: <span className="font-mono">{contractState?.admin || 'Not set'}</span>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-green-800 mb-2">Admin Panel</h3>
        <p className="text-green-700 text-sm">
          You have admin privileges. You can modify the contract admin and asset ID.
        </p>
      </div>

      {/* Modify Admin Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="text-lg font-semibold mb-4">Modify Admin</h4>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Admin Address
            </label>
            <input
              type="text"
              value={contractState?.admin || 'Not set'}
              disabled
              className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 font-mono text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Admin Address
            </label>
            <input
              type="text"
              value={newAdmin}
              onChange={(e) => setNewAdmin(e.target.value)}
              placeholder="Enter new admin address"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
            />
          </div>
          <button
            onClick={handleModifyAdmin}
            disabled={loading || !newAdmin}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Updating Admin...' : 'Update Admin'}
          </button>
        </div>
      </div>

      {/* Modify Asset ID Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="text-lg font-semibold mb-4">Modify Asset ID</h4>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Asset ID
            </label>
            <input
              type="text"
              value={contractState?.asa_id?.toString() || '0'}
              disabled
              className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 font-mono text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Asset ID
            </label>
            <input
              type="number"
              value={newAssetId}
              onChange={(e) => setNewAssetId(e.target.value)}
              placeholder="Enter asset ID"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
            />
          </div>
          <button
            onClick={handleModifyAssetId}
            disabled={loading || !newAssetId}
            className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Updating Asset ID...' : 'Update Asset ID'}
          </button>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-800 mb-2">Instructions</h4>
        <ul className="text-blue-700 text-sm space-y-1">
          <li>Admin changes are permanent and transfer all administrative privileges</li>
          <li>Asset ID should be a valid Algorand Standard Asset (ASA) ID</li>
          <li>Make sure the contract address is the clawback address of the asset</li>
          <li>These operations require transaction fees</li>
        </ul>
      </div>
    </div>
  )
}

export default AdminPanel 