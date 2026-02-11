import { PrismaClient } from '@prisma/client';

export class PrismaService extends PrismaClient {
  async connect(): Promise<void> {
    await this.$connect();
    console.log('✅ Prisma connected');
  }

  async disconnect(): Promise<void> {
    await this.$disconnect();
    console.log('✅ Prisma disconnected');
  }
}
