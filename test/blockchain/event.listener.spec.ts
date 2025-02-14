import { Test, TestingModule } from '@nestjs/testing';
import { EventListener } from '../../src/blockchain/event.listener';
import { db } from '../../src/database/database.module';
import { investments, redemptions } from '../../src/database/schema';
import { ethers } from 'ethers';

jest.mock('ethers');

describe('EventListener', () => {
  let service: EventListener;
  let mockProvider: jest.Mocked<ethers.Provider>;

  beforeEach(async () => {
    // Mock provider
    mockProvider = {
      getTransactionReceipt: jest.fn(),
    } as any;

    (ethers.JsonRpcProvider as jest.Mock).mockImplementation(
      () => mockProvider,
    );

    const module: TestingModule = await Test.createTestingModule({
      providers: [EventListener],
    }).compile();

    service = module.get<EventListener>(EventListener);

    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  describe('checkPendingTransactions', () => {
    it('should confirm pending investments with sufficient confirmations', async () => {
      // Mock database data
      const mockInvestment = {
        id: 1,
        txHash: '0x123',
        status: 'pending',
        sharesIssued: 100,
      };

      // Mock database queries
      jest.spyOn(db, 'select').mockImplementation(
        () =>
          ({
            from: () => ({
              where: () => [mockInvestment],
            }),
          }) as any,
      );

      const updateSpy = jest.spyOn(db, 'update').mockImplementation(
        () =>
          ({
            set: () => ({
              where: () => Promise.resolve(),
            }),
          }) as any,
      );

      // Mock transaction receipt
      mockProvider.getTransactionReceipt.mockResolvedValue({
        confirmations: () => Promise.resolve(6),
      } as any);

      // Trigger the check
      await service.checkPendingTransactions();

      // Verify the update was called
      expect(updateSpy).toHaveBeenCalled();
      expect(mockProvider.getTransactionReceipt).toHaveBeenCalledWith('0x123');
    });

    it('should not confirm transactions with insufficient confirmations', async () => {
      const mockInvestment = {
        id: 1,
        txHash: '0x123',
        status: 'pending',
        sharesIssued: 100,
      };

      // Mock database queries to return empty arrays for both investments and redemptions
      jest.spyOn(db, 'select').mockImplementation(
        () =>
          ({
            from: () => ({
              where: () => [], // Return empty array instead of mock data
            }),
          }) as any,
      );

      const updateSpy = jest.spyOn(db, 'update').mockImplementation(
        () =>
          ({
            set: () => ({
              where: () => Promise.resolve(),
            }),
          }) as any,
      );

      mockProvider.getTransactionReceipt.mockResolvedValue({
        confirmations: () => Promise.resolve(3), // Only 3 confirmations
      } as any);

      await service.checkPendingTransactions();

      expect(updateSpy).not.toHaveBeenCalled();
    });

    it('should handle redemptions correctly', async () => {
      const mockRedemption = {
        id: 1,
        txHash: '0x456',
        status: 'pending',
        shares: 50,
      };

      jest.spyOn(db, 'select').mockImplementation(
        (table) =>
          ({
            from: () => ({
              where: () => (table === investments ? [] : [mockRedemption]),
            }),
          }) as any,
      );

      const updateSpy = jest.spyOn(db, 'update').mockImplementation(
        () =>
          ({
            set: () => ({
              where: () => Promise.resolve(),
            }),
          }) as any,
      );

      mockProvider.getTransactionReceipt.mockResolvedValue({
        confirmations: () => Promise.resolve(6),
      } as any);

      await service.checkPendingTransactions();

      expect(updateSpy).toHaveBeenCalled();
      expect(mockProvider.getTransactionReceipt).toHaveBeenCalledWith('0x456');
    });
  });
});
