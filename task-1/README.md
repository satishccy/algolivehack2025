# Task 1: Create a Simple Token with Algokit Utils

🔨 *A TypeScript implementation for creating an Algorand Standard Asset (ASA) using Algokit Utils*

## 📋 Overview

This task demonstrates how to create a simple token (ASA) on the Algorand blockchain using the JavaScript/TypeScript Algokit Utils library. The implementation covers:

- Creating an Algorand Standard Asset (ASA)
- Setting asset parameters (total supply, decimals, name, unit)
- Opting in a receiver account to the asset
- Transferring tokens between accounts

## 🎯 Task Requirements

- ✅ Use Algorand JavaScript Algokit Utils
- ✅ Set asset details: total supply, decimals, name, unit
- ✅ Transfer tokens to another address
- ✅ Generate valid Asset ID and transaction proof

## 🛠️ Implementation Details

### Asset Configuration
```typescript
const total = 1000;          // Total supply: 1,000 tokens
const decimals = 6;          // 6 decimal places
const assetName = "MyAsset"; // Full asset name
const unitName = "MYA";      // Asset unit symbol
```

### Key Features

1. **Asset Creation**: Creates an ASA with specified parameters
2. **Opt-in Process**: Receiver account opts in to receive the asset
3. **Token Transfer**: Transfers 100 MYA tokens from creator to receiver
4. **Transaction Logging**: Outputs transaction IDs for verification

## 📁 File Structure

```
task-1/
├── main.ts          # Main implementation file
└── README.md        # This documentation
```

## 🚀 Setup & Prerequisites

### Dependencies
Make sure you have installed the dependencies
```bash
npm install
```

### Environment Configuration
Ensure your `.env` file contains:
```env
MNEMONIC=your_creator_account_mnemonic
MNEMONIC2=your_receiver_account_mnemonic
NETWORK=testnet  # or mainnet/localnet
```

## ▶️ Running the Code

Execute the task using npm:
```bash
npm run task-1
```

Or directly with ts-node:
```bash
ts-node task-1/main.ts
```

## 📊 Sample Output

```
Asset created with ID: 741189700
Receiver opted in to Asset: GMLZBII6BADPG64XJRQBA7ULTTBYKENZ4XAEFJBPWEOXOBWDQQSQ
Asset [100 MYA] sent to receiver: N5L2YG7Q3V45NBKE6MYDTSFH7TER5353QPHHYK5S3QXZ2YZCWOIQ
```

### Output Breakdown:
- **Asset ID**: `741189700` - Unique identifier for the created ASA
- **Opt-in Transaction**: `GMLZBII6...` - Transaction ID for receiver opt-in
- **Transfer Transaction**: `N5L2YG7Q...` - Transaction ID for token transfer

## 🔍 Code Walkthrough

### 1. Asset Creation
```typescript
const assetCreateResult = await algorandClient.send.assetCreate({
  assetName: assetName,
  unitName: unitName,
  total: BigInt(total * 10 ** decimals),
  decimals: decimals,
  sender: creator.addr.toString(),
  signer: creator.signer,
});
```

### 2. Asset Opt-in
```typescript
const assetOptInResult = await algorandClient.send.assetOptIn({
  assetId: assetCreateResult.assetId,
  sender: receiver.addr.toString(),
  signer: receiver.signer,
});
```

### 3. Asset Transfer
```typescript
const assetSendResult = await algorandClient.send.assetTransfer({
  assetId: assetCreateResult.assetId,
  sender: creator.addr.toString(),
  signer: creator.signer,
  receiver: receiver.addr.toString(),
  amount: BigInt(toSend * 10 ** decimals),
});
```

## ✅ Success Criteria

- [x] **Asset Creation**: Successfully created MyAsset (MYA) with ID 741189700
- [x] **Asset Configuration**: Set total supply (1000), decimals (6), name, and unit
- [x] **Opt-in Process**: Receiver successfully opted in to the asset
- [x] **Token Transfer**: Successfully transferred 100 MYA tokens
- [x] **Transaction Proof**: All transactions recorded with valid transaction IDs

## 🔗 Related Files

- `../config.ts` - Algorand client and account configuration
- `../utils.ts` - Utility functions for IPFS and asset operations

## 📝 Notes

- The implementation uses BigInt for precise decimal calculations
- All transactions are performed on the configured network (testnet/mainnet/localnet)
- The asset creator maintains full control over the asset (freeze, clawback permissions not modified)
- Transfer amount is calculated with proper decimal scaling (100 * 10^6 = 100,000,000 base units)