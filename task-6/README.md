# Task 6: Advanced Smart Contracts - On-Demand Tokenization

🌟 *Enable users to re-mint lost or recurring tokens securely*

## 📋 Overview

This task demonstrates advanced smart contract functionality that simulates dynamic token re-issuance on Algorand. Since ASAs are non-mintable after creation, the implementation uses a clever approach where users can earn and claim achievement badges based on their token holdings. The system prevents abuse through balance verification and one-time claiming mechanisms.

## 🧠 Problem & Solution

### Problem
- **ASAs are non-mintable** after creation
- Users may lose access to tokens/certificates
- Need for **dynamic re-issuance** without compromising security

### Solution
- Smart contract verifies user eligibility based on token holdings
- Creates new ASAs (badges) with same metadata on-demand
- Implements anti-abuse mechanisms through balance checks
- Uses Box storage for user tracking

## 🎯 Task Requirements

- ✅ Build advanced smart contract with dynamic tokenization
  - User identifier verification (address-based)
  - Token ownership validation
  - On-demand ASA creation with identical metadata
  - Abuse prevention mechanisms
- ✅ Practical use case implementation
  - Achievement badge system
  - Minimum balance requirements
  - One-time claiming logic
- ✅ Demonstrate contract interactions
  - Badge minting based on criteria
  - Secure claiming process

## 🛠️ Implementation Details

### Smart Contract Architecture
```python
class Contract(ARC4Contract):
    def __init__(self)->None:
        self.assetId = GlobalState(Asset)              # Required token asset
        self.amount_required = GlobalState(UInt64)     # Minimum balance threshold
        self.badge_name = GlobalState(String)          # Badge name
        self.badge_unit = GlobalState(String)          # Badge symbol
        self.badge_metadata_url = GlobalState(String)  # IPFS metadata URL
        self.badge_owners = BoxMap(Address, Asset)     # User -> Badge mapping
```

### Key Features

1. **Eligibility Verification**: Checks minimum token balance (100 TT tokens)
2. **Dynamic ASA Creation**: Mints new badge ASAs with identical metadata
3. **Anti-Abuse Protection**: One badge per user, balance verification
4. **Secure Claiming**: Two-step process (mint → claim)

## 📁 File Structure

```
task-6/
├── main.ts                          # Main implementation
├── 100_badge.jpg                    # Badge image asset
├── task-6-contracts/                # Contract project directory
│   └── projects/task-6-contracts/
│       └── smart_contracts/
│           └── contract/
│               └── contract.py      # Smart contract implementation
└── README.md                       # This documentation
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
MNEMONIC2=user_account_mnemonic
NETWORK=testnet
PINATA_TOKEN=your_pinata_api_token
```

## ▶️ Running the Code

Execute the task:
```bash
npm run task-6
```

## 📊 Sample Output

```
Asset created: 741192855
App created: 741192866
App Funded with 0.3 Algos: D6HTONANDPW3WXM3WU36CBP2DPDSLUTPTSX37SFHLLAAGIKAGJCA
User opted in to asset: CC3RSO3ZHLDKJ5XVYRV64MVDODSLXZHDNVTZEG5IPMZG77IHC2SQ
100 Tokens sent to user: 5NK6FQFC5DMUYDMQQK6XZCLD3AFINBUNSJAHH4FFLMPB7JUC6ZKA
Badge minted with ID: 741192885 in SC After verifying of minimum threshold balance
TxID: RYU2A66B7UP666V674LHMQ6PO5DNMCF2J7JBO426U5IPV6FBMAOA
Badge claimed TxID: 6EMJSLJPHVJZAEQYZWCUUAVW4LQQEXMITZDRLYMHLCBS6NMZXGKQ
```

## 🔗 Explorer Links

### Asset Information
- **Base Token ID**: `741192855` (Tokenizer Token - TT)
- **Explorer Link**: `https://lora.algokit.io/testnet/asset/741192855`

### Smart Contract
- **Application ID**: `741192866`
- **Explorer Link**: `https://lora.algokit.io/testnet/application/741192866`

### Badge Information
- **Century Badge ID**: `741192885`
- **Explorer Link**: `https://lora.algokit.io/testnet/asset/741192885`

### Transaction Links
- **Contract Funding**: [D6HTONANDPW3WXM3WU36CBP2DPDSLUTPTSX37SFHLLAAGIKAGJCA](https://lora.algokit.io/testnet/tx/D6HTONANDPW3WXM3WU36CBP2DPDSLUTPTSX37SFHLLAAGIKAGJCA)
- **User Opt-in**: [CC3RSO3ZHLDKJ5XVYRV64MVDODSLXZHDNVTZEG5IPMZG77IHC2SQ](https://lora.algokit.io/testnet/tx/CC3RSO3ZHLDKJ5XVYRV64MVDODSLXZHDNVTZEG5IPMZG77IHC2SQ)
- **Token Transfer**: [5NK6FQFC5DMUYDMQQK6XZCLD3AFINBUNSJAHH4FFLMPB7JUC6ZKA](https://lora.algokit.io/testnet/tx/5NK6FQFC5DMUYDMQQK6XZCLD3AFINBUNSJAHH4FFLMPB7JUC6ZKA)
- **Badge Minting**: [RYU2A66B7UP666V674LHMQ6PO5DNMCF2J7JBO426U5IPV6FBMAOA](https://lora.algokit.io/testnet/tx/RYU2A66B7UP666V674LHMQ6PO5DNMCF2J7JBO426U5IPV6FBMAOA)
- **Badge Claiming**: [6EMJSLJPHVJZAEQYZWCUUAVW4LQQEXMITZDRLYMHLCBS6NMZXGKQ](https://lora.algokit.io/testnet/tx/6EMJSLJPHVJZAEQYZWCUUAVW4LQQEXMITZDRLYMHLCBS6NMZXGKQ)

## 🔍 Key Operations

### 1. Contract Initialization
```python
@abimethod(create="require")
def create(self, asset_id: Asset, name: String, unit: String, 
          metadata_url: String, amount_required: UInt64) -> None:
    self.assetId.value = asset_id
    self.amount_required.value = amount_required
    # ... store badge configuration
```

### 2. Badge Minting (Eligibility Check)
```python
@abimethod()
def mint_badge(self) -> Asset:
    assert self.assetId.value.balance(Txn.sender) >= self.amount_required.value
    
    result = itxn.AssetConfig(
        total=1, decimals=0,
        unit_name=self.badge_unit.value,
        asset_name=self.badge_name.value,
        url=self.badge_metadata_url.value,
        # ... other parameters
    ).submit()
    
    self.badge_owners[Address(Txn.sender)] = result.created_asset
    return result.created_asset
```

### 3. Badge Claiming (Transfer)
```python
@abimethod()
def claim_badge(self) -> None:
    assert Address(Txn.sender) in self.badge_owners
    asset_id = self.badge_owners[Address(Txn.sender)]
    itxn.AssetTransfer(
        xfer_asset=asset_id, 
        asset_amount=1, 
        asset_receiver=Txn.sender
    ).submit()
    del self.badge_owners[Address(Txn.sender)]  # Prevent re-claiming
```

## 🏗️ Technical Architecture

### Badge Metadata Structure
```typescript
const metadata = {
  name: "Century Badge",
  unit_name: "CB",
  description: "This Badge is for having 100 Tokenizer Tokens",
  creator: creator.addr.toString(),
  image: `ipfs://${imageCid.IpfsHash}#arc3`,
  image_integrity: `sha256-${imageHash}`,
  image_mimetype: mimeType,
  properties: {
    noOfTokens: 100,
    assetId: Number(assetCreateResult.assetId),
  },
};
```

### Anti-Abuse Mechanisms
1. **Balance Verification**: Must hold minimum 100 TT tokens
2. **One-Time Claiming**: Badge owners mapping prevents duplicate claims
3. **Box Storage**: Efficient user tracking with automatic cleanup
4. **Address-Based ID**: Uses Algorand address as unique identifier

### Two-Step Process
1. **Mint Phase**: Contract creates badge ASA after verification
2. **Claim Phase**: User opts in and receives the badge token

## ✅ Success Criteria

- [x] **Advanced Smart Contract**: Dynamic ASA creation with eligibility verification
- [x] **User Identification**: Address-based user tracking system
- [x] **Token Ownership Check**: Minimum balance requirement (100 TT tokens)
- [x] **Dynamic Re-issuance**: On-demand badge creation with identical metadata
- [x] **Abuse Prevention**: One-time claiming and balance verification
- [x] **Practical Use Case**: Achievement badge system for token holders

## 💡 Use Case Applications

### Real-world Scenarios
- **🏆 Achievement Badges**: Gaming platforms, educational certificates
- **🎫 Access Tokens**: Event tickets, membership passes
- **📜 Digital Certificates**: Professional credentials, course completions
- **🔄 Recovery Tokens**: Lost asset replacement system

### Technical Patterns
- **Conditional Minting**: Dynamic ASA creation based on criteria
- **State Management**: Box storage for efficient user tracking
- **Inner Transactions**: Contract-controlled asset operations
- **Metadata Preservation**: Identical token characteristics

## 🔐 Security Features

### Verification Layer
- Balance threshold enforcement
- Address-based unique identification
- Smart contract role controls

### Anti-Abuse Protection
- One badge per user limit
- Automatic cleanup after claiming
- Immutable criteria verification

## 📝 Technical Notes

- Uses AlgoPy Box storage for efficient user data management
- Implements inner transactions for dynamic ASA creation
- Preserves original metadata through IPFS integration
- Two-step claiming process ensures proper opt-in handling
- Contract controls all badge token roles (manager, freeze, etc.)

## 🔗 Related Files

- `../config.ts` - Algorand client and account configuration
- `../utils.ts` - IPFS utilities and helper functions
- `100_badge.jpg` - Achievement badge visual asset