import { Injectable, OnModuleInit, UseInterceptors } from '@nestjs/common';
import { ethers } from 'ethers';
import * as dotenv from 'dotenv';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { ContractTransactionResponse } from 'ethers';
import { db } from '../database/database.module';
import { redemptions, investments } from '../database/schema';

dotenv.config();

@Injectable()
@UseInterceptors(CacheInterceptor)
export class BlockchainService implements OnModuleInit {
  private provider: ethers.JsonRpcProvider;
  private wallet: ethers.Wallet;
  private contract: ethers.Contract;

  constructor() {
    this.provider = new ethers.JsonRpcProvider(process.env.RPC_URL); // Connect to Anvil
    this.wallet = new ethers.Wallet(
      process.env.PRIVATE_KEY as string,
      this.provider,
    );
    this.contract = new ethers.Contract(
      process.env.CONTRACT_ADDRESS as string,
      [
        // ABI entries for invest and redeem functions
        'function invest(address investor, uint256 usdAmount) public returns (bool)',
        'function redeem(address investor, uint256 shareAmount) public returns (bool)',
        'function getBalance(address investor) public view returns (uint256)',
        'function getFundMetrics() public view returns (uint256 totalInvested, uint256 totalShares)',
      ],
      this.wallet,
    );
  }

  async onModuleInit() {
    try {
      const network = await this.provider.getNetwork();
      console.log(`✅ Connected to Anvil on chainId: ${network.chainId}`);
    } catch (error) {
      console.error('❌ Failed to connect to Anvil:', error);
      process.exit(1);
    }
  }

  // Define the invest method
  async invest(investor: string, usdAmount: number): Promise<{ success: boolean; txHash: string }> {
    // Execute transaction first
    const transaction: ContractTransactionResponse = await this.contract.invest(
      investor,
      ethers.parseUnits(usdAmount.toString(), 'ether'),
    );

    // Wait for transaction to be mined
    const receipt = await transaction.wait();
    console.log(receipt);

    // Insert investment record using Drizzle
    const [investment] = await db
      .insert(investments)
      .values({
        investor,
        usdAmount,
        txHash: transaction.hash,
        status: 'pending',
        createdAt: new Date(),
        sharesIssued: 0, // This will be updated by the event listener
      })
      .returning();

    return {
      success: true,
      txHash: transaction.hash
    };
  }

  // Define the redeem method
  async redeem(investor: string, shareAmount: number) {
    // Execute transaction first
    const transaction: ContractTransactionResponse = await this.contract.redeem(
      investor,
      ethers.parseUnits(shareAmount.toString(), 'ether'),
    );

    // Wait for transaction to be mined
    const receipt = await transaction.wait();

    // Insert redemption record using Drizzle
    const [redemption] = await db
      .insert(redemptions)
      .values({
        investor,
        shares: shareAmount,
        txHash: transaction.hash,
        status: 'pending',
        createdAt: new Date(),
        usdAmount: 0, // This will be updated by the event listener
      })
      .returning();

    return {
      success: true,
      txHash: transaction.hash
    };
  }

  // Implement getBalance method
  async getBalance(investor: string): Promise<string> {
    const balance = await this.contract.getBalance(investor);
    return ethers.formatUnits(balance, 'ether');
  }

  // Implement getFundMetrics method
  @CacheTTL(10000) // 10 seconds
  async getFundMetrics(): Promise<{
    totalInvested: string;
    totalShares: string;
  }> {
    const metrics = await this.contract.getFundMetrics();
    return {
      totalInvested: ethers.formatUnits(metrics.totalInvested, 'ether'),
      totalShares: ethers.formatUnits(metrics.totalShares, 'ether'),
    };
  }
}
