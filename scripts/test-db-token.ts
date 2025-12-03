import { PrismaClient } from '@prisma/client';
import { randomBytes } from 'crypto';

const prisma = new PrismaClient();

async function main() {
  console.log('Connecting to database...');

  // Try to find a user to attach the token to
  const user = await prisma.user.findFirst();

  if (!user) {
    console.error('No users found in database. Cannot test token creation.');
    return;
  }

  console.log(`Found user: ${user.id} (${user.email})`);

  const token = randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 1000 * 60 * 15);

  console.log('Attempting to create TelegramToken...');

  try {
    const result = await prisma.telegramToken.create({
      data: {
        token,
        userId: user.id,
        expiresAt,
      },
    });

    console.log('Successfully created token:', result);

    // Verify read
    const readBack = await prisma.telegramToken.findUnique({
      where: { token },
    });

    if (readBack) {
      console.log('Successfully read back token:', readBack);
    } else {
      console.error('FAILED to read back token!');
    }

    // Cleanup
    await prisma.telegramToken.delete({
      where: { id: result.id },
    });
    console.log('Cleaned up test token.');
  } catch (e) {
    console.error('Error creating token:', e);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
