import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

async function main() {
  console.log('Connecting to database...');
  try {
    await prisma.$connect();
    console.log('Connected successfully.');
    // Try a simple query
    const userCount = await prisma.user.count();
    console.log(`User count: ${userCount}`);
  } catch (e) {
    console.error('Connection failed:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
