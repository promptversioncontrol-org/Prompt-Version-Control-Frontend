import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

// Load env vars
dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log('🔌 Testing Database Connection...');

  const dbUrl =
    'prisma+postgres://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqd3RfaWQiOjEsInNlY3VyZV9rZXkiOiJza19SV1JSX19TSUd2NWNZVXFZQ3dxUWoiLCJhcGlfa2V5IjoiMDFLQ05ZVzZRSEhQUDFZWkpQSllaN05XN1YiLCJ0ZW5hbnRfaWQiOiIyYTkwNGQ3MGNmM2EzZmM0N2E3MzhjMjY5NDczMDcxZDhkNjhmNjI0ZjMxZTBjNmMzNzVlM2QzYmNkZWQwNTBhIiwiaW50ZXJuYWxfc2VjcmV0IjoiY2UxMGM5YjMtNjEwYi00ZDIwLTgxY2YtZmQzNGI4ZTQ2ZWRmIn0.yShbTiEuUCcDEGScA49aXCTuZLflfbuG4UqByDyDcV4';
  if (!dbUrl) {
    console.error('❌ DATABASE_URL is missing in .env');
    process.exit(1);
  }

  // Mask password for safe logging
  console.log('Target:', dbUrl.replace(/:[^:]+@/, ':****@'));

  try {
    const start = Date.now();
    await prisma.$connect();
    const duration = Date.now() - start;
    console.log(`✅ Connected successfully! (${duration}ms)`);

    // Simple query to verify read access
    const userCount = await prisma.user.count();
    console.log(`📊 User count: ${userCount}`);
  } catch (error) {
    console.error('\n❌ CONNECTION FAILED');
    console.error('Error details:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
