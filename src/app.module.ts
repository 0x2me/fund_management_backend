import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { BlockchainService } from './blockchain/blockchain.service';
import { CacheModule } from '@nestjs/cache-manager';
import { InvestmentController } from './investment/investment.controller';
import { EventListener } from './blockchain/event.listener';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    CacheModule.register({
      ttl: 10000, // 10 seconds blocktime assumed
    }),
  ],
  controllers: [AppController, InvestmentController],
  providers: [AppService, BlockchainService, EventListener],
})
export class AppModule {}
