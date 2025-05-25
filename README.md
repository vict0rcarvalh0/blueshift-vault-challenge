# Blueshift Vault Challenge

This project implements a Solana program using the Anchor framework to manage a simple vault system. The vault allows users to deposit and withdraw funds securely. The project includes both the on-chain program logic and an accompanying test suite to validate its functionality.

## Features

- **Deposit Funds**: Users can deposit SOL into a program-derived vault account.
- **Withdraw Funds**: Users can withdraw all funds from the vault back to their account.
- **Error Handling**: Custom error codes ensure proper validation of operations, such as preventing deposits into an already existing vault or rejecting invalid deposit amounts.

## Program Overview

The Solana program is implemented in Rust and is located in [`programs/blueshift-vault-challenge/src/lib.rs`](programs/blueshift-vault-challenge/src/lib.rs). Key components include:

- **Deposit Function**: Transfers SOL from the user's account to the vault. Ensures the vault is empty and the deposit amount is valid.
- **Withdraw Function**: Transfers all SOL from the vault back to the user's account. Uses program-derived address (PDA) authority for secure withdrawals.
- **VaultAction Context**: Defines the accounts required for deposit and withdrawal operations.
- **Custom Errors**: Includes `VaultAlreadyExists` and `InvalidAmount` error codes for robust error handling.

## Testing

The test suite is written in TypeScript using the Anchor framework and is located in [`tests/blueshift-vault-challenge.ts`](tests/blueshift-vault-challenge.ts). It includes the following test cases:

1. **Setup**: 
   - Airdrops SOL to a test user.
   - Derives the vault's public key using a program-derived address (PDA).
   - Logs the user's balance and vault address.

2. **Deposit**:
   - Deposits a specified amount of SOL into the vault.
   - Confirms and logs the transaction.

3. **Withdraw**:
   - Withdraws all funds from the vault back to the user's account.
   - Confirms and logs the transaction.

## Prerequisites

- **Solana CLI**: Ensure you have the Solana CLI installed and configured(2.1.22).
- **Anchor Framework**: Install the Anchor CLI(0.31.1).

## How to run

1. Clone the repository:
```bash
    git clone https://github.com/vict0rcarvalh0/blueshift-vault-challenge.git
    cd blueshift-vault-challenge
```

2. Build the Solana Program:
```bash
    anchor build
```

3. Run the tests:
```bash
    anchor test
```

The tests output should look like this:
<p align="center">
    <img src=".assets/testevidence.png" alt="Tests evidence">
</p>