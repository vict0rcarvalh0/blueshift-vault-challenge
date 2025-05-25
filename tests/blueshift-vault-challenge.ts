import * as anchor from "@coral-xyz/anchor";
import { BN, Program } from "@coral-xyz/anchor";
import { BlueshiftVaultChallenge } from "../target/types/blueshift_vault_challenge"; 
import { Keypair, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";

// Main test suite for the Blueshift Vault Challenge program
describe("blueshift-vault-challenge", () => {
  // Setting up the Anchor provider (connection to the Solana cluster)
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  // Extracting the connection and program instance
  const connection = provider.connection;
  const program = anchor.workspace.blueshiftVaultChallenge as Program<BlueshiftVaultChallenge>;

  // Helper function to confirm a transaction on the blockchain
  const confirm = async (signature: string): Promise<string> => {
    const block = await connection.getLatestBlockhash(); // Fetch the latest blockhash
    await connection.confirmTransaction({
      signature, // Transaction signature to confirm
      blockhash: block.blockhash, // Latest blockhash
      lastValidBlockHeight: block.lastValidBlockHeight, // Last valid block height
    });

    return signature; // Return the confirmed transaction signature
  };

  // Helper function to log the transaction signature with a link to the Solana Explorer
  const log = async (signature: string): Promise<string> => {
    if (connection.rpcEndpoint === "https://api.devnet.solana.com") {
      // Log the transaction link for the Devnet cluster
      console.log(
        `Your transaction signature: https://explorer.solana.com/transaction/${signature}?cluster=devnet`
      );
    } else {
      // Log the transaction link for a custom RPC endpoint
      console.log(
        `Your transaction signature: https://explorer.solana.com/transaction/${signature}?cluster=custom&customUrl=${connection.rpcEndpoint}`
      );
    }

    return signature; // Return the logged transaction signature
  };

  // Keypair for the test user
  let signer = Keypair.generate();
  // Public key for the vault account
  let vault: PublicKey;
  // Object to store public keys of various accounts
  let accountsPublicKeys: any = {};

  // Test case to set up the initial state
  it("setup", async () => {
    // Airdrop SOL to the test user's account
    await connection.confirmTransaction(
      await connection.requestAirdrop(signer.publicKey, 5 * LAMPORTS_PER_SOL), // Request 5 SOL
      "confirmed" // Wait for confirmation
    );

    // Log the user's balance after the airdrop
    console.log("user balance: ", await connection.getBalance(signer.publicKey));

    // Derive the vault's public key using a program-derived address (PDA)
    vault = PublicKey.findProgramAddressSync(
      [Buffer.from("vault", "utf-8"), signer.publicKey.toBuffer()], // Seeds for the PDA
      program.programId // Program ID
    )[0];

    // Log the derived vault public key
    console.log("vault: ", vault);

    // Store the public keys of the signer and vault in the accountsPublicKeys object
    accountsPublicKeys = {
      signer: signer.publicKey,
      vault: vault,
    };
  });

  // Test case to deposit funds into the vault
  it("deposit", async () => {
    // Define the accounts required for the deposit instruction
    const accounts = {
      signer: accountsPublicKeys["signer"], // User's public key
      vaultState: accountsPublicKeys["vault_state"], // Vault state account (not initialized in setup)
      vault: accountsPublicKeys["vault"], // Vault account
    };

    // Call the deposit method on the program
    await program.methods
      .deposit(new BN(0.02 * LAMPORTS_PER_SOL)) // Deposit 0.02 SOL (converted to lamports)
      .accounts(accounts) // Pass the accounts
      .signers([signer]) // Sign the transaction with the user's keypair
      .rpc() // Send the transaction
      .then(confirm) // Confirm the transaction
      .then(log); // Log the transaction signature
  });

  // Test case to withdraw funds from the vault
  it("withdraw", async () => {
    // Define the accounts required for the withdraw instruction
    const accounts = {
      signer: accountsPublicKeys["signer"], // User's public key
      vaultState: accountsPublicKeys["vault_state"], // Vault state account (not initialized in setup)
      vault: accountsPublicKeys["vault"], // Vault account
    };

    // Call the withdraw method on the program
    await program.methods
      .withdraw() // Withdraw funds
      .accounts(accounts) // Pass the accounts
      .signers([signer]) // Sign the transaction with the user's keypair
      .rpc() // Send the transaction
      .then(confirm) // Confirm the transaction
      .then(log); // Log the transaction signature
  });
});
