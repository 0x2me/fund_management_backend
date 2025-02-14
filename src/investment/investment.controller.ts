import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { BlockchainService } from '../blockchain/blockchain.service';
import { db } from '../database/database.module';
import { investments, redemptions } from '../database/schema';
import { eq } from 'drizzle-orm';

@Controller('investment')
export class InvestmentController {
  constructor(private readonly blockchainService: BlockchainService) {}

  @Post('invest')
  async invest(@Body() body: { investor: string; usdAmount: number }) {
    try {
      // Mark transaction as pending in the DB
      const [investment] = await db
        .insert(investments)
        .values({
          investor: body.investor,
          usdAmount: body.usdAmount,
          sharesIssued: 0,
          status: 'pending',
        })
        .returning({ id: investments.id });

      // Send transaction to the blockchain
      const tx = await this.blockchainService.invest(
        body.investor,
        body.usdAmount,
      );

      // Update the DB after transaction is sent
      await db
        .update(investments)
        .set({ txHash: tx.txHash })
        .where(eq(investments.id, investment.id));

      return { success: true, txHash: tx.txHash };
    } catch (error) {
      console.error('Investment failed:', error);
      return { success: false, error: error.message };
    }
  }

  @Post('redeem')
  async redeem(@Body() body: { investor: string; shares: number }) {
    try {
      // Mark transaction as pending in the DB
      const [redemption] = await db
        .insert(redemptions)
        .values({
          investor: body.investor,
          shares: body.shares,
          usdAmount: 0,
          status: 'pending',
        })
        .returning({ id: redemptions.id });

      // Send transaction to the blockchain
      const tx = await this.blockchainService.redeem(
        body.investor,
        body.shares,
      );
      console.log("Transaction: ", tx);
      // Update the DB after transaction is sent
      await db
        .update(redemptions)
        .set({ txHash: tx.txHash })
        .where(eq(redemptions.id, redemption.id));

      return { success: true, txHash: tx.txHash };
    } catch (error) {
      console.error('Redemption failed:', error);
      return { success: false, error: error.message };
    }
  }

  @Get('balance/:investor')
  async getBalance(@Param('investor') investor: string) {
    return await this.blockchainService.getBalance(investor);
  }

  @Get('fund-metrics')
  async getFundMetrics() {
    return await this.blockchainService.getFundMetrics();
  }
}
