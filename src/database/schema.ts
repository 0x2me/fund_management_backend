import {
  pgTable,
  serial,
  varchar,
  integer,
  timestamp,
} from 'drizzle-orm/pg-core';

export const investments = pgTable('investments', {
  id: serial('id').primaryKey(),
  investor: varchar('investor', { length: 42 }).notNull(),
  usdAmount: integer('usdAmount').notNull(),
  sharesIssued: integer('sharesIssued').notNull(),
  txHash: varchar('txHash', { length: 66 }), // Store transaction hash
  status: varchar('status', { length: 20 }).default('pending'), // pending, confirmed
  createdAt: timestamp('createdAt').defaultNow(),
});

export const redemptions = pgTable('redemptions', {
  id: serial('id').primaryKey(),
  investor: varchar('investor', { length: 42 }).notNull(),
  shares: integer('shares').notNull(),
  usdAmount: integer('usdAmount').notNull(),
  txHash: varchar('txHash', { length: 66 }), // Store transaction hash
  status: varchar('status', { length: 20 }).default('pending'), // pending, confirmed
  createdAt: timestamp('createdAt').defaultNow(),
});
