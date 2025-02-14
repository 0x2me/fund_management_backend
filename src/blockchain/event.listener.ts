import { ethers } from 'ethers';
import { db } from '../database/database.module';
import { investments, redemptions } from '../database/schema';
import { Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';

@Injectable()
export class EventListener {
  private provider: ethers.Provider;
  private unsubscribe: () => void;
  constructor() {
    this.provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
  }
    onModuleInit() {
    console.log('🔄 Starting block listener...');
    this.startBlockListener();
  }

  onModuleDestroy() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }

  private startBlockListener() {
    this.provider.on('block', async (blockNumber) => {
      console.log(`📦 New block: ${blockNumber}`);
      await this.checkPendingTransactions();
    });

    this.unsubscribe = () => {
      this.provider.removeAllListeners('block');
    };
  }

  async checkPendingTransactions() {
    const pendingInvestments = await db
      .select()
      .from(investments)
      .where(eq(investments.status, 'pending'));

    const pendingRedemptions = await db
      .select()
      .from(redemptions)
      .where(eq(redemptions.status, 'pending'));

    // Handle investments
    for (const investment of pendingInvestments) {
      console.log("Checking Investment: ", investment);
      if (!investment.txHash) continue;
      const receipt = await this.provider.getTransactionReceipt(
        investment.txHash as string,
      );
      if (!receipt) continue; // Skip if no receipt yet

      const confirmations = await receipt?.confirmations();

      if (receipt && confirmations && confirmations >= 6) {
        console.log(`✅ Investment ${investment.txHash} confirmed!`);
        await db
          .update(investments)
          .set({
            status: 'confirmed',
            sharesIssued: investment.sharesIssued,
          })
          .where(eq(investments.id, investment.id));
      }
    }

    // Handle redemptions
    for (const redemption of pendingRedemptions) {
      
      if (!redemption.txHash) continue;

      const receipt = await this.provider.getTransactionReceipt(
        redemption.txHash as string,
      );
      if (!receipt) continue; // Skip if no receipt yet

      const confirmations = await receipt?.confirmations();

      if (receipt && confirmations && confirmations >= 6) {
        console.log(`✅ Redemption ${redemption.txHash} confirmed!`);
        await db
          .update(redemptions)
          .set({
            status: 'confirmed',
            shares: redemption.shares,
          })
          .where(eq(redemptions.id, redemption.id));
      }
    }
  }
}
