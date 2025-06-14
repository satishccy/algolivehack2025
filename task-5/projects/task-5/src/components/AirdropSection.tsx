import React, { useEffect, useState } from "react";
import algosdk, { Transaction } from "algosdk";
import { ContractState, AirdropRecord } from "../interfaces/TokenizerContract";
import { getAlgodConfigFromViteEnvironment } from "../utils/network/getAlgoClientConfigs";
import { AlgorandClient } from "@algorandfoundation/algokit-utils/types/algorand-client";
import { getContractDetails } from "../utils/network/getContractDetails";
import { AlgoAmount } from "@algorandfoundation/algokit-utils/types/amount";

interface AirdropSectionProps {
  isAdmin: boolean;
  contractState: ContractState | null;
  onAirdropComplete: (record: AirdropRecord) => void;
  onError: (error: string) => void;
  activeAddress: string;
  transactionSigner: (txnGroup: Transaction[], indexesToSign: number[]) => Promise<Uint8Array[]>;
  contractAppId: number;
}

const contractDetails = getContractDetails();

const AirdropSection: React.FC<AirdropSectionProps> = ({
  isAdmin,
  contractState,
  onAirdropComplete,
  onError,
  activeAddress,
  transactionSigner,
  contractAppId,
}) => {
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [assetBalance, setAssetBalance] = useState(0);
  const [assetDecimals, setAssetDecimals] = useState(0);

  useEffect(() => {
    const fetchAssetBalance = async () => {
      if (activeAddress && contractState) {
        try {
          const algodConfig = getAlgodConfigFromViteEnvironment();
          const algorand = AlgorandClient.fromConfig({ algodConfig });
          const assetInfo = await algorand.client.algod.getAssetByID(contractState.asa_id).do();
          setAssetDecimals(assetInfo.params.decimals);
          try {
            if (assetInfo.params.reserve) {
              const assetBalanceAfterTransfer = await algorand.client.algod
                .accountAssetInformation(assetInfo.params.reserve, contractState.asa_id)
                .do();
              if (assetBalanceAfterTransfer.assetHolding) {
                setAssetBalance(Number(assetBalanceAfterTransfer.assetHolding.amount));
              }
            }
          } catch (error) {
            setAssetBalance(0);
          }
        } catch (error) {
          setAssetDecimals(0);
        }
      }
    };
    fetchAssetBalance();
  }, [activeAddress, contractState]);

  const handleAirdrop = async () => {
    if (!recipient) {
      onError("Please enter a recipient address");
      return;
    }

    if (!algosdk.isValidAddress(recipient)) {
      onError("Please enter a valid recipient address");
      return;
    }

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      onError("Please enter a valid amount");
      return;
    }

    if (Number(amount) > assetBalance / 10 ** assetDecimals) {
      onError("Insufficient asset balance in reserve");
      return;
    }

    if (!contractState) {
      onError("Contract state not set");
      return;
    }

    try {
      const algodConfig = getAlgodConfigFromViteEnvironment();
      const algorand = AlgorandClient.fromConfig({ algodConfig });
      const result = await algorand.client.algod.accountAssetInformation(recipient, contractState.asa_id).do();
      if (!result.assetHolding) {
        onError("Recipient didn't opted in to the asset");
        return;
      }
    } catch (error) {
      onError(`Recipient didn't opted in to the asset`);
      return;
    }

    try {
      setLoading(true);
      const result = await contractDetails.appClient.send.verifiedAirdrop({
        args: {
          amount: BigInt(Number(amount) * 10 ** assetDecimals),
          recipient: recipient
        },
        maxFee: AlgoAmount.Algos(0.002),
        coverAppCallInnerTransactionFees: true,
        sender: activeAddress,
        signer: transactionSigner
      })

      setTimeout(() => {
        const airdropRecord: AirdropRecord = {
          recipient: recipient,
          amount: BigInt(amount),
          timestamp: Date.now(),
          txId: result.txIds[0],
        };
        onAirdropComplete(airdropRecord);
        setRecipient("");
        setAmount("");
        setLoading(false);
      }, 1000);
    } catch (error) {
      setLoading(false);
      onError(`Failed to send airdrop: ${error}`);
    }
  };

  if (!isAdmin) {
    return (
      <div className="text-center py-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">Admin Access Required</h3>
          <p className="text-yellow-700">Only the contract admin can send airdrops.</p>
          <p className="text-sm text-yellow-600 mt-2">
            Current admin: <span className="font-mono">{contractState?.admin || "Not set"}</span>
          </p>
        </div>
      </div>
    );
  }

  if (!contractState?.asa_id) {
    return (
      <div className="text-center py-8">
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-orange-800 mb-2">Asset Not Configured</h3>
          <p className="text-orange-700">Please configure the asset ID in the Admin Panel before sending airdrops.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-green-800 mb-2">Airdrop Tokens</h3>
        <p className="text-green-700 text-sm">Send tokens to recipients. Only the admin can perform airdrops.</p>
      </div>

      {/* Asset Information */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-800 mb-2">Asset Information</h4>
        <p className="text-blue-700 text-sm">
          Asset ID: <span className="font-mono font-semibold">{contractState.asa_id.toString()}</span>
        </p>
        <p className="text-blue-700 text-sm">
          Asset Balance can Airdrop: <span className="font-mono font-semibold">{assetBalance / 10 ** assetDecimals}</span>
        </p>
        <p className="text-blue-700 text-sm">
          Asset Decimals: <span className="font-mono font-semibold">{assetDecimals}</span>
        </p>
      </div>

      {/* Airdrop Form */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="text-lg font-semibold mb-4">Send Airdrop</h4>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Recipient Address</label>
            <input
              type="text"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="Enter recipient address"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount to airdrop"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              min="1"
            />
          </div>

          <button
            onClick={handleAirdrop}
            disabled={loading || !recipient || !amount}
            className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Sending Airdrop..." : "Send Airdrop"}
          </button>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-800 mb-2">Airdrop Instructions</h4>
        <ul className="text-blue-700 text-sm space-y-1">
          <li>Ensure the recipient address is valid and can receive the asset</li>
          <li>The reserve address must have sufficient asset balance for the airdrop</li>
          <li>Each airdrop transaction requires a small fee</li>
          <li>Airdrop amounts are in the asset's base units</li>
          <li>Failed airdrops will be automatically refunded</li>
        </ul>
      </div>
    </div>
  );
};

export default AirdropSection;
