import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Testing database connection...');
  try {
    const start = Date.now();
    await prisma.$connect();
    console.log(`Successfully connected in ${Date.now() - start}ms`);

    const userCount = await prisma.user.count();
    console.log(`Connection verified. Found ${userCount} users.`);
  } catch (e: unknown) {
    console.error('Connection failed!');
    if (e instanceof Error) console.error(e.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
