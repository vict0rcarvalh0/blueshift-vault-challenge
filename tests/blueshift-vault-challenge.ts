import * as anchor from "@coral-xyz/anchor";
import { BN, Program } from "@coral-xyz/anchor";
import { BlueshiftVaultChallenge } from "../target/types/blueshift_vault_challenge";
import { Keypair, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";

describe("blueshift-vault-challenge", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const connection = provider.connection;
  const program = anchor.workspace.blueshiftVaultChallenge as Program<BlueshiftVaultChallenge>;

  const confirm = async (signature: string): Promise<string> => {
    const block = await connection.getLatestBlockhash();
    await connection.confirmTransaction({
      signature,
      blockhash: block.blockhash,
      lastValidBlockHeight: block.lastValidBlockHeight,
    });

    return signature;
  };

  const log = async (signature: string): Promise<string> => {
    if (connection.rpcEndpoint === "https://api.devnet.solana.com") {
      console.log(
        `Your transaction signature: https://explorer.solana.com/transaction/${signature}?cluster=devnet`
      );
    } else {
      console.log(
        `Your transaction signature: https://explorer.solana.com/transaction/${signature}?cluster=custom&customUrl=${connection.rpcEndpoint}`
      );
    }

    return signature;
  };

  let signer = Keypair.generate();
  let vault: PublicKey;
  let accountsPublicKeys: any = {};

  it("setup", async () => {
    await connection.confirmTransaction(
      await connection.requestAirdrop(signer.publicKey, 5 * LAMPORTS_PER_SOL),
      "confirmed"
    );

    console.log("user balance: ", await connection.getBalance(signer.publicKey) )

    vault = PublicKey.findProgramAddressSync(
      [Buffer.from("vault", "utf-8"), signer.publicKey.toBuffer()],
      program.programId
    )[0];

    console.log("vault: ", vault);

    accountsPublicKeys = {
      signer: signer.publicKey,
      vault: vault,
    };
  });

  it("deposit", async () => {
    const accounts = {
      signer: accountsPublicKeys["signer"],
      vaultState: accountsPublicKeys["vault_state"],
      vault: accountsPublicKeys["vault"],
    };

    await program.methods
      .deposit(new BN(0.02 * LAMPORTS_PER_SOL))
      .accounts(accounts)
      .signers([signer])
      .rpc()
      .then(confirm)
      .then(log);
  });

  it("withdraw", async () => {
    const accounts = {
      signer: accountsPublicKeys["signer"],
      vaultState: accountsPublicKeys["vault_state"],
      vault: accountsPublicKeys["vault"],
    };

    await program.methods
      .withdraw()
      .accounts(accounts)
      .signers([signer])
      .rpc()
      .then(confirm)
      .then(log);
  });
});
