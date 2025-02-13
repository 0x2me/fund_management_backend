import { Module } from '@nestjs/common';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Client } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config(); // Load environment variables

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

// Connect and return the Drizzle ORM instance
export const db = drizzle(client);

@Module({})
export class DatabaseModule {
  constructor() {
    this.connectDb();
  }

  async connectDb() {
    try {
      await client.connect();
      console.log('✅ Connected to PostgreSQL');
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      process.exit(1);
    }
  }
}
