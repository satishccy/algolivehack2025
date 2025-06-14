import React, { useState, useEffect } from "react";
import { useWallet } from "@txnlab/use-wallet-react";
import { useSnackbar } from "notistack";
import AdminPanel from "./AdminPanel";
import AirdropSection from "./AirdropSection";
import { getContractDetails } from "../utils/network/getContractDetails";
import { ContractState, AirdropRecord } from "../interfaces/TokenizerContract";
import { TokenizerContractClient } from "../contracts/TokenizerContractClient";
import { AlgorandClient } from "@algorandfoundation/algokit-utils/types/algorand-client";
import { getAlgodConfigFromViteEnvironment } from "../utils/network/getAlgoClientConfigs";

const contractDetails = getContractDetails();

const TokenizerApp: React.FC = () => {
  const { activeAddress, transactionSigner } = useWallet();
  const { enqueueSnackbar } = useSnackbar();

  const [contractState, setContractState] = useState<ContractState | null>(null);
  const [airdropHistory, setAirdropHistory] = useState<AirdropRecord[]>([]);
  const [activeTab, setActiveTab] = useState<"admin" | "airdrop">("admin");
  const [isAdmin, setIsAdmin] = useState(false);
  const [optedIn, setOptedIn] = useState(false);

  // Mock contract app ID - replace with actual deployed contract ID
  useEffect(() => {
    const fetchContractDetails = async () => {
      const contractAdmin = await contractDetails.appClient.state.global.admin();
      const asaId = await contractDetails.appClient.state.global.asaId();

      setContractState({
        admin: contractAdmin || "",
        asa_id: BigInt(asaId || 0),
      });

      if (activeAddress && contractAdmin) {
        setIsAdmin(activeAddress === contractAdmin);
      }
    };
    fetchContractDetails();
  }, [activeAddress, contractState]);

  useEffect(() => {
    const fetchOptedIn = async () => {
      if (contractState && activeAddress) {
        try {
          const algodConfig = getAlgodConfigFromViteEnvironment();
          const algorand = AlgorandClient.fromConfig({ algodConfig });
          const result = await algorand.client.algod.accountAssetInformation(activeAddress, contractState.asa_id).do();
          setOptedIn(result.assetHolding ? true : false);
        } catch (error) {
          setOptedIn(false);
        }
      }
    };
    fetchOptedIn();
  }, [activeAddress, contractState]);

  const handleContractStateUpdate = (newState: ContractState) => {
    setContractState(newState);
    enqueueSnackbar("Contract state updated successfully!", { variant: "success" });
  };

  const handleAirdropComplete = (record: AirdropRecord) => {
    setAirdropHistory((prev) => [record, ...prev]);
    enqueueSnackbar(`Airdrop of ${record.amount} tokens sent successfully!`, { variant: "success" });
  };

  const handleError = (error: string) => {
    enqueueSnackbar(error, { variant: "error" });
  };

  const handleOptIn = async () => {
    if (!activeAddress) {
      handleError("Please connect your wallet to access the tokenizer contract features.");
      return;
    }

    if (!contractState) {
      handleError("Contract state not set");
      return;
    }

    try {
      const algodConfig = getAlgodConfigFromViteEnvironment();
      const algorand = AlgorandClient.fromConfig({ algodConfig });
      const optinres = await algorand.send.assetTransfer({
        sender: activeAddress,
        receiver: activeAddress,
        assetId: contractState.asa_id,
        amount: BigInt(0),
        signer: transactionSigner,
      });
      enqueueSnackbar("Opted in to the asset successfully!", { variant: "success" });
    } catch (error) {
      handleError(`Failed to opt in to the asset: ${error}`);
    }
  };

  if (!activeAddress) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center max-w-md">
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-8 shadow-lg">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-amber-900 mb-3">Wallet Connection Required</h3>
            <p className="text-amber-700 leading-relaxed">Please connect your wallet to access the tokenizer contract features and manage your assets.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header Section */}
      <div className="text-center py-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
          Tokenizer Contract Manager
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Professional token management and airdrop distribution platform
        </p>
      </div>

      {/* Contract Info Card */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 px-8 py-6 border-b border-gray-100">
          <h3 className="text-2xl font-semibold text-gray-900 mb-2">Contract Overview</h3>
          <p className="text-gray-600">Current contract state and connection details</p>
        </div>
        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Connected Address</p>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="font-mono text-sm text-gray-900 break-all">{activeAddress}</p>
              </div>
            </div>
            {contractState && (
              <>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Contract Admin</p>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="font-mono text-sm text-gray-900 break-all">{contractState.admin}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Asset ID</p>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="font-mono text-lg font-semibold text-gray-900">{contractState.asa_id.toString()}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">User Status</p>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        isAdmin 
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-200" 
                          : "bg-blue-100 text-blue-800 border border-blue-200"
                      }`}
                    >
                      <div className={`w-2 h-2 rounded-full mr-2 ${isAdmin ? "bg-emerald-500" : "bg-blue-500"}`}></div>
                      {isAdmin ? "Administrator" : "User"}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Asset Status</p>
                  <div className="flex items-center space-x-3">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        optedIn 
                          ? "bg-green-100 text-green-800 border border-green-200" 
                          : "bg-red-100 text-red-800 border border-red-200"
                      }`}
                    >
                      {optedIn ? "Opted In" : "Not Opted In"}
                    </span>
                    {!isAdmin && !optedIn && (
                      <button 
                        onClick={handleOptIn} 
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105 shadow-md"
                      >
                        Opt In Now
                      </button>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Interface */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200 bg-gray-50">
          <nav className="flex">
            <button
              onClick={() => setActiveTab("admin")}
              className={`flex-1 py-4 px-6 text-center font-semibold transition-all duration-200 ${
                activeTab === "admin"
                  ? "bg-white text-blue-700 border-b-2 border-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Administration</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab("airdrop")}
              className={`flex-1 py-4 px-6 text-center font-semibold transition-all duration-200 ${
                activeTab === "airdrop"
                  ? "bg-white text-blue-700 border-b-2 border-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                  />
                </svg>
                <span>Token Distribution</span>
              </div>
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-8">
          {activeTab === "admin" && (
            <AdminPanel
              isAdmin={isAdmin}
              contractState={contractState}
              onStateUpdate={handleContractStateUpdate}
              onError={handleError}
              activeAddress={activeAddress}
              transactionSigner={transactionSigner}
              contractAppId={contractDetails.appId}
            />
          )}

          {activeTab === "airdrop" && (
            <AirdropSection
              isAdmin={isAdmin}
              contractState={contractState}
              onAirdropComplete={handleAirdropComplete}
              onError={handleError}
              activeAddress={activeAddress}
              transactionSigner={transactionSigner}
              contractAppId={contractDetails.appId}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default TokenizerApp;
