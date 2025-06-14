# Task 3: Smart Contract Tokenization (Basic)

📜 *Start adding programmable logic to your ASA (Algorand Standard Assets)*

## 📋 Overview

This task demonstrates how to implement smart contract tokenization on Algorand using Python contracts. The implementation features a tokenizer contract that controls ASA operations through programmable logic, specifically implementing verified airdrop functionality with admin-controlled token distribution.

## 🎯 Task Requirements

- ✅ Write a smart contract with programmable logic
  - Admin-controlled airdrop system
  - Asset ID management within contract
  - Custom business logic implementation
- ✅ Connect ASA with contract logic
  - Contract set as clawback address
  - Asset operations controlled by smart contract
- ✅ Demonstrate contract interactions
  - Verified airdrop execution

## 🛠️ Implementation Details

### Smart Contract (`TokenizerContract`)
```python
class TokenizerContract(ARC4Contract):
    def __init__(self) -> None:
        self.admin = GlobalState(Txn.sender)
        self.asa_id = GlobalState(Asset)

    @abimethod()
    def verified_airdrop(self, amount: UInt64, recipient: Account) -> None:
        assert Txn.sender == self.admin.value, "Only admin can airdrop"
        itxn.AssetTransfer(
            asset_amount=amount,
            asset_receiver=recipient,
            asset_sender=self.asa_id.value.reserve,
            sender=Global.current_application_address,
            xfer_asset=self.asa_id.value, 
        ).submit()
```

### Asset Configuration
```typescript
const assetName = "Tokenizer Token";
const assetUnitName = "TT";
const assetDecimals = 6;
const assetTotal = 10000;
const clawbackAddress = appCreateResult.appAddress; // Contract controls clawback
```

### Key Features

1. **Admin Control**: Only admin can perform airdrop operations
2. **Asset Management**: Contract stores and manages ASA ID
3. **Verified Distribution**: Controlled token distribution through smart contract
4. **Inner Transactions**: Contract executes asset transfers on behalf of reserve

## 📁 File Structure

```
task-3/
├── main.ts                           # Main implementation
├── TokenizerContractClient.ts        # Generated contract client
├── task-3-contracts/                 # Contract project directory
│   └── projects/task-3-contracts/
│       └── smart_contracts/
│           └── contract/
│               └── contract.py       # Smart contract implementation
└── README.md                        # This documentation
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
MNEMONIC=creator_account_mnemonic
MNEMONIC2=admin_account_mnemonic
MNEMONIC3=recipient_account_mnemonic
NETWORK=testnet
```

## ▶️ Running the Code

Execute the task:
```bash
npm run task-3
```

## 📊 Sample Output

```
App created at 3ZMUUC2QSOE7F6XJ4J3YAC64XNVEOFODA2O2QLYZFSIU3SVGVDA2JBGRAQ with ID 741190656
App Funded with 0.2 Algos: 7TG435S5W6G4NJHM7VTULTJ3IJDOPMUXSPLYYNEGWI376FBXTURQ
Asset created with ID 741190669 with clawback address as app address
Asset ID set in contract: AE5NTETG32YPH7IFTCMFDFUINDJLYJLKXCPHWVYJ4TSXQF4XUNMQ
Receiver opted in to asset: CYHBC6H7C6IWQMANDRS3NP2OX2XU6XYGNJHVK7GPEDNMNWF25DQA
Before airdrop recipient balance: 0
Airdropped 100 tokens to P2QEJVHE2AIF3W4QGJOADAHRIJ2CT3WKMBP3EPUDE4PE6IGSZPCEDPNRLU: KRXCZ6OYRPIJ6PQ35A6AYDQLSH253CF7FSG27MV7Q3R6EZTQ7L3A
After airdrop recipient balance: 100
```

## 🔗 Explorer Links

### Contract Information
- **Application ID**: `741190656`
- **Contract Address**: `3ZMUUC2QSOE7F6XJ4J3YAC64XNVEOFODA2O2QLYZFSIU3SVGVDA2JBGRAQ`
- **Explorer Link**: `https://lora.algokit.io/testnet/application/741190656`

### Asset Information
- **Asset ID**: `741190669`
- **Explorer Link**: `https://lora.algokit.io/testnet/asset/741190669`

### Transaction Links
- **Contract Deployment**: View on [Lora Explorer](https://lora.algokit.io/testnet/tx/[DEPLOYMENT_TX_ID])
- **Asset Creation**: View on [Lora Explorer](https://lora.algokit.io/testnet/tx/[ASSET_CREATION_TX_ID])
- **Contract Funding**: [7TG435S5W6G4NJHM7VTULTJ3IJDOPMUXSPLYYNEGWI376FBXTURQ](https://lora.algokit.io/testnet/tx/7TG435S5W6G4NJHM7VTULTJ3IJDOPMUXSPLYYNEGWI376FBXTURQ)
- **Asset ID Setup**: [AE5NTETG32YPH7IFTCMFDFUINDJLYJLKXCPHWVYJ4TSXQF4XUNMQ](https://lora.algokit.io/testnet/tx/AE5NTETG32YPH7IFTCMFDFUINDJLKXCPHWVYJ4TSXQF4XUNMQ)
- **Recipient Opt-in**: [CYHBC6H7C6IWQMANDRS3NP2OX2XU6XYGNJHVK7GPEDNMNWF25DQA](https://lora.algokit.io/testnet/tx/CYHBC6H7C6IWQMANDRS3NP2OX2XU6XYGNJHVK7GPEDNMNWF25DQA)
- **Airdrop Transaction**: [KRXCZ6OYRPIJ6PQ35A6AYDQLSH253CF7FSG27MV7Q3R6EZTQ7L3A](https://lora.algokit.io/testnet/tx/KRXCZ6OYRPIJ6PQ35A6AYDQLSH253CF7FSG27MV7Q3R6EZTQ7L3A)

## 🔍 Key Operations

### 1. Contract Deployment
```typescript
const tokenizerContract = new TokenizerContractFactory({
  algorand: algorandClient,
  defaultSender: admin.addr,
  defaultSigner: admin.signer,
});

const { result: appCreateResult, appClient } = 
  await tokenizerContract.send.create.bare({});
```

### 2. Asset Creation with Contract Integration
```typescript
const assetCreateResult = await algorandClient.send.assetCreate({
  sender: creator.addr,
  total: BigInt(assetTotal * 10 ** assetDecimals),
  clawback: clawbackAddress, // Contract address as clawback
  // ... other parameters
});
```

### 3. Contract-Controlled Airdrop
```typescript
const airdropResult = await appClient.send.verifiedAirdrop({
  args: {
    amount: 100 * 10 ** assetDecimals,
    recipient: recipient.addr.toString(),
  },
  maxFee: AlgoAmount.Algos(0.002),
  coverAppCallInnerTransactionFees: true,
});
```

## 🏗️ Contract Architecture

### State Management
- **Admin Address**: Stored in global state for access control
- **Asset ID**: Contract maintains reference to controlled ASA

### Access Control
- Only admin can execute airdrop operations
- Admin can modify asset ID and transfer admin rights

### Inner Transactions
- Contract executes asset transfers using inner transactions
- Proper fee handling for contract-initiated operations

## ✅ Success Criteria

- [x] **Smart Contract**: Deployed TokenizerContract with custom logic
- [x] **ASA Integration**: Asset created with contract as clawback address
- [x] **Programmable Logic**: Admin-controlled airdrop system implemented
- [x] **Contract Interaction**: Successful verified airdrop demonstrated
- [x] **State Management**: Asset ID and admin properly managed in contract
- [x] **Transaction Proof**: All operations recorded with valid transaction IDs

## 📝 Technical Notes

- Uses AlgoPy for Python smart contract development
- Contract generates TypeScript client for easy interaction
- Inner transactions enable contract-controlled asset operations
- Global state management for persistent contract data
- ABI methods for standardized contract interaction
- Proper fee management for complex transaction operations

## 🔗 Related Files

- `../config.ts` - Algorand client and account configuration
- `../utils.ts` - Utility functions for asset operations
- `TokenizerContractClient.ts` - Generated contract client interface