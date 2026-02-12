import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log('--- Debugging Workspace: sigma ---');

  const workspace = await prisma.workspace.findFirst({
    where: { slug: 'sigma' }, // Adjust if slug is different
    include: {
      contributors: {
        include: {
          user: true,
        },
      },
    },
  });

  if (!workspace) {
    console.log('Workspace "sigma" not found!');
    return;
  }

  console.log(`Workspace ID: ${workspace.id}`);
  console.log(`Workspace Name: ${workspace.name}`);
  console.log(`Creator User ID: ${workspace.userId}`);

  console.log('\n--- Contributors ---');
  for (const c of workspace.contributors) {
    console.log(`User: ${c.user.email} (${c.user.name})`);
    console.log(`  Role in DB: "${c.role}"`);
    console.log(`  User Plan: "${c.user.plan}"`);
    console.log(`  Subscription Status: "${c.user.subscriptionStatus}"`);
    console.log('---');
  }

  const contributorsDirect = await prisma.workspaceContributor.findMany({
    where: { workspaceId: workspace.id },
  });
  console.log(`\nDirect Contributors Count: ${contributorsDirect.length}`);

  const creator = await prisma.user.findUnique({
    where: { id: workspace.userId },
  });
  console.log(`\nCreator Plan: ${creator?.plan} (ID: ${workspace.userId})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
