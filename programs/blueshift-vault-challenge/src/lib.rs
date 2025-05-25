use anchor_lang::prelude::*;
use anchor_lang::system_program::{transfer, Transfer};

// Declare the program ID for this Solana program
declare_id!("22222222222222222222222222222222222222222222");

#[program]
pub mod blueshift_vault_challenge {
    use super::*;
 
    /// Handles the deposit of funds into the vault.
    /// 
    /// # Arguments
    /// * `ctx` - The context containing all accounts and data required for the operation.
    /// * `amount` - The amount of lamports to deposit into the vault.
    pub fn deposit(ctx: Context<VaultAction>, amount: u64) -> Result<()> {
        // Ensure the vault is empty before depositing (vault should not already exist).
        require_eq!(ctx.accounts.vault.lamports(), 0, VaultError::VaultAlreadyExists);

        // Ensure the deposit amount is greater than the minimum rent-exempt balance.
        require_gt!(amount, Rent::get()?.minimum_balance(0), VaultError::InvalidAmount);
     
        // Perform the transfer of lamports from the signer to the vault.
        transfer(
            CpiContext::new(
                ctx.accounts.system_program.to_account_info(), 
                Transfer {
                    from: ctx.accounts.signer.to_account_info(),
                    to: ctx.accounts.vault.to_account_info(),
                }
            ),
            amount,
        )?;
     
        Ok(())
    }
 
    /// Handles the withdrawal of all funds from the vault.
    /// 
    /// # Arguments
    /// * `ctx` - The context containing all accounts and data required for the operation.
    pub fn withdraw(ctx: Context<VaultAction>) -> Result<()> {
        // Derive the signer seeds for the vault PDA (Program Derived Address).
        let bindings = ctx.accounts.signer.key();
        let signer_seeds = &[b"vault", bindings.as_ref(), &[ctx.bumps.vault]];
     
        // Perform the transfer of all lamports from the vault back to the signer.
        transfer(
            CpiContext::new_with_signer(
                ctx.accounts.system_program.to_account_info(), 
                Transfer {
                    from: ctx.accounts.vault.to_account_info(),
                    to: ctx.accounts.signer.to_account_info(),
                },
                &[&signer_seeds[..]] // Pass the signer seeds for PDA authority.
            ),
            ctx.accounts.vault.lamports(), // Withdraw all lamports from the vault.
        )?;
     
        Ok(())
    }
}

/// Context for the `deposit` and `withdraw` instructions.
/// Defines the accounts required for these operations.
#[derive(Accounts)]
pub struct VaultAction<'info> {
    /// The signer account initiating the transaction.
    #[account(mut)]
    pub signer: Signer<'info>,
   
    /// The vault account where funds are stored.
    /// This is a PDA (Program Derived Address) with a specific seed.
    #[account(
      mut, // The account is mutable because we will modify its lamports.
      seeds = [b"vault", signer.key().as_ref()], // Seed for the PDA.
      bump, // The bump seed for the PDA.
    )]
    pub vault: SystemAccount<'info>,
   
    /// The system program account, required for CPI (Cross-Program Invocation) calls.
    pub system_program: Program<'info, System>,
}
 
/// Custom error codes for the vault program.
#[error_code]
pub enum VaultError {
    /// Error indicating that the vault already exists.
    #[msg("Vault already exists")]
    VaultAlreadyExists,

    /// Error indicating that the deposit amount is invalid (e.g., too small).
    #[msg("Invalid amount")]
    InvalidAmount,
}