import { Transaction } from 'algosdk'

export interface TokenizerContractMethods {
  modify_asa: (args: { asa_id: bigint }) => Promise<Transaction>
  modify_admin: (args: { admin: string }) => Promise<Transaction>
  verified_airdrop: (args: { 
    amount: bigint,
    recipient: string 
  }) => Promise<Transaction>
}

export interface ContractState {
  admin: string
  asa_id: bigint
}

export interface AirdropRecord {
  recipient: string
  amount: bigint
  timestamp: number
  txId: string
} 