import React, { useState, useMemo } from 'react'
import { AirdropRecord } from '../interfaces/TokenizerContract'

interface AirdropHistoryProps {
  airdropHistory: AirdropRecord[]
  userAddress: string
}

const AirdropHistory: React.FC<AirdropHistoryProps> = ({
  airdropHistory,
  userAddress
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'sent' | 'received'>('all')

  // For demo purposes, we'll also show some mock received airdrops
  const mockReceivedAirdrops: AirdropRecord[] = [
    {
      recipient: userAddress,
      amount: BigInt(1000),
      timestamp: Date.now() - 86400000, // 1 day ago
      txId: 'mock_received_1'
    },
    {
      recipient: userAddress,
      amount: BigInt(500),
      timestamp: Date.now() - 172800000, // 2 days ago
      txId: 'mock_received_2'
    }
  ]

  const filteredHistory = useMemo(() => {
    let allRecords = [...airdropHistory]
    
    // Add mock received airdrops to show functionality
    if (mockReceivedAirdrops.length > 0) {
      allRecords = [...allRecords, ...mockReceivedAirdrops]
    }

    switch (activeFilter) {
      case 'sent':
        return airdropHistory // Only sent airdrops
      case 'received':
        return mockReceivedAirdrops.filter(record => record.recipient === userAddress)
      default:
        return allRecords.sort((a, b) => b.timestamp - a.timestamp)
    }
  }, [airdropHistory, userAddress, activeFilter, mockReceivedAirdrops])

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString()
  }

  const formatAmount = (amount: bigint) => {
    return amount.toString()
  }

  const getRecordType = (record: AirdropRecord) => {
    return record.recipient === userAddress ? 'received' : 'sent'
  }

  const shortenAddress = (address: string) => {
    if (address.length <= 10) return address
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-blue-800 mb-2">Airdrop History</h3>
        <p className="text-blue-700 text-sm">
          View all sent and received airdrops. Transactions are recorded on the blockchain.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-4 py-2 font-medium text-sm ${
            activeFilter === 'all'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          All ({filteredHistory.length})
        </button>
        <button
          onClick={() => setActiveFilter('sent')}
          className={`px-4 py-2 font-medium text-sm ${
            activeFilter === 'sent'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Sent ({airdropHistory.length})
        </button>
        <button
          onClick={() => setActiveFilter('received')}
          className={`px-4 py-2 font-medium text-sm ${
            activeFilter === 'received'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Received ({mockReceivedAirdrops.filter(r => r.recipient === userAddress).length})
        </button>
      </div>

      {/* Airdrop Records */}
      <div className="space-y-4">
        {filteredHistory.length === 0 ? (
          <div className="text-center py-8">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <h4 className="text-lg font-semibold text-gray-600 mb-2">No Airdrops Found</h4>
              <p className="text-gray-500 text-sm">
                {activeFilter === 'all' && 'No airdrop transactions yet.'}
                {activeFilter === 'sent' && 'No airdrops sent yet.'}
                {activeFilter === 'received' && 'No airdrops received yet.'}
              </p>
            </div>
          </div>
        ) : (
          filteredHistory.map((record, index) => {
            const recordType = getRecordType(record)
            const isReceived = recordType === 'received'
            
            return (
              <div
                key={`${record.txId}-${index}`}
                className={`border rounded-lg p-4 ${
                  isReceived 
                    ? 'border-green-200 bg-green-50' 
                    : 'border-blue-200 bg-blue-50'
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center">
                    <span
                      className={`inline-block w-2 h-2 rounded-full mr-2 ${
                        isReceived ? 'bg-green-500' : 'bg-blue-500'
                      }`}
                    />
                    <span
                      className={`text-sm font-medium ${
                        isReceived ? 'text-green-800' : 'text-blue-800'
                      }`}
                    >
                      {isReceived ? 'Received' : 'Sent'}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {formatDate(record.timestamp)}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      {isReceived ? 'To' : 'Recipient'}
                    </label>
                    <p className="font-mono text-sm text-gray-800">
                      {shortenAddress(record.recipient)}
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Amount
                    </label>
                    <p className="font-semibold text-sm text-gray-800">
                      {formatAmount(record.amount)} tokens
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Transaction ID
                    </label>
                    <p className="font-mono text-xs text-gray-600 break-all">
                      {record.txId}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-3 flex space-x-2">
                  <button
                    onClick={() => {
                      // Mock function to view on block explorer
                      console.log('View transaction:', record.txId)
                    }}
                    className="text-xs text-blue-600 hover:text-blue-800 underline"
                  >
                    View on Explorer
                  </button>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(record.txId)
                    }}
                    className="text-xs text-gray-600 hover:text-gray-800 underline"
                  >
                    Copy TX ID
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Summary Statistics */}
      {filteredHistory.length > 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="font-semibold text-gray-800 mb-3">Summary</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Total Transactions</p>
              <p className="font-semibold text-gray-800">{filteredHistory.length}</p>
            </div>
            <div>
              <p className="text-gray-600">Total Amount</p>
              <p className="font-semibold text-gray-800">
                {filteredHistory.reduce((sum, record) => sum + Number(record.amount), 0)} tokens
              </p>
            </div>
            <div>
              <p className="text-gray-600">Latest Activity</p>
              <p className="font-semibold text-gray-800">
                {filteredHistory.length > 0 
                  ? formatDate(Math.max(...filteredHistory.map(r => r.timestamp)))
                  : 'None'
                }
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AirdropHistory 