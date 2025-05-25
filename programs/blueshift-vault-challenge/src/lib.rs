use anchor_lang::prelude::*;
use anchor_lang::system_program::{transfer, Transfer};

declare_id!("FMQ5TEzxhU4izRbbZimqZW9kTKJnKrs138fgkjhvML2Y");

#[program]
pub mod blueshift_vault_challenge {
    use super::*;
 
    pub fn deposit(ctx: Context<VaultAction>, amount: u64) -> Result<()> {
        require_eq!(ctx.accounts.vault.lamports(), 0, VaultError::VaultAlreadyExists);
        require_gt!(amount, Rent::get()?.minimum_balance(0), VaultError::InvalidAmount);
     
     
        transfer(
            CpiContext::new(ctx.accounts.system_program.to_account_info(), 
                Transfer {
                    from: ctx.accounts.signer.to_account_info(),
                    to: ctx.accounts.vault.to_account_info(),
                }
            ),
            amount,
        )?;
     
        Ok(())
    }
 
    pub fn withdraw(ctx: Context<VaultAction>) -> Result<()> {
        let bindings = ctx.accounts.signer.key();
        let signer_seeds = &[b"vault", bindings.as_ref(), &[ctx.bumps.vault]];
     
        transfer(
            CpiContext::new_with_signer(ctx.accounts.system_program.to_account_info(), 
                Transfer {
                    from: ctx.accounts.vault.to_account_info(),
                    to: ctx.accounts.signer.to_account_info(),
                },
                &[&signer_seeds[..]]
            ),
            ctx.accounts.vault.lamports(),
        )?;
     
        Ok(())
    }
}


#[derive(Accounts)]
pub struct VaultAction<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
   
    #[account(
      mut,
      seeds = [b"vault", signer.key().as_ref()],
      bump,
    )]
    pub vault: SystemAccount<'info>,
   
    pub system_program: Program<'info, System>,
}
 

#[error_code]
pub enum VaultError {
    #[msg("Vault already exists")]
    VaultAlreadyExists,
    #[msg("Invalid amount")]
    InvalidAmount,
}