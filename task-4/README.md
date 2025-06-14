# Task 4: Multisig Asset Management

🔐 *Secure your ASA actions through collective approval*

## 📋 Overview

This task demonstrates how to implement multisig asset management on Algorand, where sensitive asset operations require multiple signature approvals. The implementation showcases creating a multisig account, assigning it to critical ASA roles, and performing secure asset management operations through collective authorization.

## 🎯 Task Requirements

- ✅ Create a **multisig account** using AlgoKit
  - 3 participant addresses with 2-of-3 threshold
  - Collective signing capability
- ✅ Assign multisig to sensitive ASA roles
  - Manager role assigned to multisig account
  - Clawback role controlled by multisig
- ✅ Perform multisig asset operations
  - Asset configuration change executed
  - Freeze address modification through multisig

## 🛠️ Implementation Details

### Multisig Configuration
```typescript
const multisig = await algorandClient.account.multisig(
  {
    version: 1,
    threshold: 2,
    addrs: [account1.addr, account2.addr, account3.addr],
  },
  [account1, account2, account3]
);
```

### Asset Configuration with Multisig Roles
```typescript
const assetCreateResult = await algorandClient.send.assetCreate({
  assetName: "MyAsset",
  unitName: "MYA",
  total: BigInt(1000 * 10 ** 6),
  decimals: 6,
  manager: multisig.addr.toString(),    // Multisig as manager
  clawback: multisig.addr.toString(),   // Multisig as clawback
  reserve: account1.addr.toString(),
  freeze: account1.addr.toString(),
  // ...
});
```

### Key Features

1. **2-of-3 Multisig**: Requires 2 signatures from 3 possible signers
2. **Secure Management**: Critical asset roles protected by collective approval
3. **Asset Configuration**: Multisig-controlled asset parameter changes
4. **Role-based Security**: Different roles assigned based on security requirements

## 📁 File Structure

```
task-4/
├── main.ts          # Main implementation
└── README.md        # This documentation
```

## 🚀 Setup & Prerequisites

### Dependencies
Make sure you have installed the dependencies:
```bash
npm install
```

### Environment Configuration
Ensure your `.env` file contains:
```env
MNEMONIC=first_signer_mnemonic
MNEMONIC2=second_signer_mnemonic
MNEMONIC3=third_signer_mnemonic
MNEMONIC4=freeze_authority_mnemonic
NETWORK=testnet
```

## ▶️ Running the Code

Execute the task:
```bash
npm run task-4
```

## 📊 Sample Output

```
Created multisig account: RSEYS5S2ZJIYNCIWRM4OO2GMS54JG3LBJJM5AEKN42OJAS7CREMCAVPHCU with threshold 2 and accounts [QD4H7FKBAGCZVOCPYHICCCNXFTOY4W37IUPTAPB4RG4IBK5BHVLTHGSVSM, SWQU6VR6PTXB3GVKI6QEHTO6JVBSWTXTU37EQALKMWHLXK43RZQAVET7EM, P2QEJVHE2AIF3W4QGJOADAHRIJ2CT3WKMBP3EPUDE4PE6IGSZPCEDPNRLU]

Funded multisig account with 0.2 ALGO
txId: OU5U7ORMSACPOXPWLOACNC46AFHH4A6NDUPBZS4YLVACOV234UVQ

Created asset: 741191467 with manager as multisig account

Asset freeze address changed to: JPOQ6XKUFFI7D6PL2522YRDELJUCAO3G7OSALCJTLQDUNS7Y5IV2NTM7JU
txId: V75MC6WTTBYSO4RWAMIH7UWRVKPFSW35GU736VIB5ZH6SC7J6N6A
```

## 🔗 Explorer Links

### Multisig Account Information
- **Multisig Address**: `RSEYS5S2ZJIYNCIWRM4OO2GMS54JG3LBJJM5AEKN42OJAS7CREMCAVPHCU`
- **Threshold**: 2-of-3 signatures required
- **Explorer Link**: `https://lora.algokit.io/testnet/address/RSEYS5S2ZJIYNCIWRM4OO2GMS54JG3LBJJM5AEKN42OJAS7CREMCAVPHCU`

### Multisig Participants
- **Signer 1**: `QD4H7FKBAGCZVOCPYHICCCNXFTOY4W37IUPTAPB4RG4IBK5BHVLTHGSVSM`
- **Signer 2**: `SWQU6VR6PTXB3GVKI6QEHTO6JVBSWTXTU37EQALKMWHLXK43RZQAVET7EM`
- **Signer 3**: `P2QEJVHE2AIF3W4QGJOADAHRIJ2CT3WKMBP3EPUDE4PE6IGSZPCEDPNRLU`

### Asset Information
- **Asset ID**: `741191467`
- **Explorer Link**: `https://lora.algokit.io/testnet/asset/741191467`

### Transaction Links
- **Multisig Funding**: [OU5U7ORMSACPOXPWLOACNC46AFHH4A6NDUPBZS4YLVACOV234UVQ](https://lora.algokit.io/testnet/tx/OU5U7ORMSACPOXPWLOACNC46AFHH4A6NDUPBZS4YLVACOV234UVQ)
- **Asset Creation**: View on [Lora Explorer](https://lora.algokit.io/testnet/tx/[ASSET_CREATION_TX_ID])
- **Multisig Asset Config**: [V75MC6WTTBYSO4RWAMIH7UWRVKPFSW35GU736VIB5ZH6SC7J6N6A](https://lora.algokit.io/testnet/tx/V75MC6WTTBYSO4RWAMIH7UWRVKPFSW35GU736VIB5ZH6SC7J6N6A)

## 🔍 Key Operations

### 1. Multisig Account Creation
```typescript
const multisig = await algorandClient.account.multisig(
  {
    version: 1,
    threshold: 2,
    addrs: [account1.addr, account2.addr, account3.addr],
  },
  [account1, account2, account3]
);
```

### 2. Asset Creation with Multisig Roles
```typescript
const assetCreateResult = await algorandClient.send.assetCreate({
  manager: multisig.addr.toString(),    // Multisig controls management
  clawback: multisig.addr.toString(),   // Multisig controls clawback
  // ... other parameters
});
```

### 3. Multisig Asset Configuration
```typescript
const assetFreezeAddressChangeTx = await algorandClient.send.assetConfig({
  assetId: assetCreateResult.assetId,
  freeze: freeze.addr.toString(),       // New freeze address
  sender: multisig.addr.toString(),
  signer: multisig.signer,              // Multisig signature required
});
```

## 🏗️ Security Architecture

### Multisig Structure
- **Version**: 1 (Standard multisig version)
- **Threshold**: 2 (Minimum signatures required)
- **Participants**: 3 (Total number of potential signers)
- **Security Model**: 2-of-3 signature scheme

### Role Assignment Strategy
- **Manager Role**: Multisig (Requires collective approval for changes)
- **Clawback Role**: Multisig (Secure token recovery operations)
- **Reserve Role**: Single account (Operational efficiency)
- **Freeze Role**: Initially single account, then changed via multisig

### Operation Flow
1. **Proposal**: Any participant can initiate a transaction
2. **Signing**: Minimum threshold signatures collected
3. **Execution**: Transaction submitted with required signatures
4. **Verification**: Network validates multisig requirements

## ✅ Success Criteria

- [x] **Multisig Setup**: Created 2-of-3 multisig account successfully
- [x] **Role Assignment**: Manager and clawback roles assigned to multisig
- [x] **Asset Creation**: Asset created with multisig governance
- [x] **Multisig Operation**: Freeze address change executed via multisig
- [x] **Transaction Proof**: All operations recorded with valid transaction IDs
- [x] **Security Demonstration**: Collective approval mechanism working

## 📝 Security Benefits

### Enhanced Security
- **Distributed Control**: No single point of failure
- **Collective Decision Making**: Requires consensus for sensitive operations
- **Reduced Risk**: Multiple signatures prevent unauthorized actions

### Operational Advantages
- **Transparent Governance**: All multisig operations are publicly verifiable
- **Flexible Thresholds**: Configurable signature requirements
- **Scalable Security**: Can be adapted for different organizational needs

## 🔗 Related Files

- `../config.ts` - Algorand client and account configuration
- `../utils.ts` - Utility functions for asset operations

## 💡 Use Cases

### Perfect for:
- **DAO Governance**: Decentralized asset management
- **Corporate Treasuries**: Multi-party approval for sensitive operations
- **Investment Funds**: Collective decision making for asset allocation
- **Security-Critical Applications**: Enhanced protection for valuable assets