# Tokenizer Contract Frontend

This frontend provides a comprehensive interface for interacting with the TokenizerContract smart contract on Algorand.

## Features

### 1. Admin Panel
- **Modify Admin**: Change the contract administrator (admin-only)
- **Modify Asset ID**: Update the asset ID for the contract (admin-only)
- Real-time validation and error handling
- Current state display

### 2. Airdrop Section
- **Send Airdrops**: Distribute tokens to recipients (admin-only)
- Input validation for addresses and amounts
- Asset information display
- Batch airdrop support (coming soon)

### 3. Airdrop History
- **View All Transactions**: Complete history of sent and received airdrops
- **Filter Options**: Filter by all, sent, or received transactions
- **Transaction Details**: Full transaction information with explorer links
- **Summary Statistics**: Total transactions, amounts, and latest activity

## How to Use

1. **Connect Wallet**: Click "Wallet Connection" to connect your Algorand wallet
2. **Open Tokenizer Contract**: Click "Tokenizer Contract" button when wallet is connected
3. **Navigate Tabs**: Use the tab navigation to switch between:
   - Admin Panel (for contract management)
   - Airdrop (for sending tokens)
   - Airdrop History (for viewing transactions)

## Admin Functions

Only the contract admin can:
- Modify the admin address
- Change the asset ID
- Send airdrops to recipients

## Technical Notes

- The frontend currently uses mock implementations for demonstration
- To connect to a real contract, update the `CONTRACT_APP_ID` in `TokenizerApp.tsx`
- Replace mock contract calls with actual AlgoKit client calls
- Ensure proper wallet permissions for contract interactions

## Contract Integration

The frontend is designed to work with the TokenizerContract which has these methods:
- `modify_asa(asa_id: Asset)`: Modify the asset ID
- `modify_admin(admin: Account)`: Change the admin
- `verified_airdrop(amount: UInt64, recipient: Account)`: Send verified airdrops

## Styling

The app uses custom CSS utility classes similar to Tailwind CSS for consistent styling and responsive design.

## Development

To extend functionality:
1. Update the contract interfaces in `src/interfaces/TokenizerContract.ts`
2. Implement actual contract calls in the component methods
3. Add error handling for blockchain interactions
4. Customize styling in `src/styles/App.css` 