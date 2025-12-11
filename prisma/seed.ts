import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

const USERS = [
  'adam.dev',
  'sarah.engineer',
  'mike.ops',
  'jessica.pm',
  'david.security',
  'alex.fe',
  'sam.be',
  'kate.design',
  'chris.qa',
  'emily.docs',
];

const LEAK_MESSAGES = [
  'AWS Secret Key exposed in console.log',
  'Stripe API Key found in git commit',
  'Google Maps API Key leaked in client-side code',
  'Pastebin URL containing credentials detected',
  'Slack Webhook URL found in public repository',
  'Database connection string exposed in error log',
  'JWT secret key hardcoded in source',
  'Private key found in build artifacts',
  'Internal IP address leaked in headers',
  'Password shared in plain text',
];

const SOURCES = [
  'chatgpt',
  'claude.ai',
  'github-copilot',
  'stackoverflow',
  'jira',
  'slack',
];

const SEVERITIES = ['low', 'medium', 'high'];

async function main() {
  console.log('🌱 Starting seed...');

  // 1. Get ALL workspaces to seed them all
  const workspaces = await prisma.workspace.findMany();

  if (workspaces.length === 0) {
    console.log('Creates default workspace if none exist...');

    const owner = await prisma.user.findFirst();
    if (owner) {
      const newWorkspace = await prisma.workspace.create({
        data: {
          name: 'Default Workspace',
          slug: 'default-workspace',
          userId: owner.id,
        },
      });
      workspaces.push(newWorkspace);
    } else {
      console.log('No users found to create workspace for.');
    }
  }

  // 2. Generate Leaks for EACH workspace
  console.log(`🚀 Generating leaks for ${workspaces.length} workspaces...`);

  const leaksData: Prisma.WorkspaceLeakCreateManyInput[] = [];

  for (const workspace of workspaces) {
    console.log(`   - Seeding workspace: ${workspace.slug}`);

    for (let i = 0; i < 50; i++) {
      const user = USERS[Math.floor(Math.random() * USERS.length)];
      const severity =
        SEVERITIES[Math.floor(Math.random() * SEVERITIES.length)];
      const source = SOURCES[Math.floor(Math.random() * SOURCES.length)];
      const message =
        LEAK_MESSAGES[Math.floor(Math.random() * LEAK_MESSAGES.length)];

      // Random date within last 30 days
      const date = new Date();
      date.setDate(date.getDate() - Math.floor(Math.random() * 30));
      date.setHours(
        Math.floor(Math.random() * 24),
        Math.floor(Math.random() * 60),
      );

      leaksData.push({
        workspaceId: workspace.id,
        username: user,
        severity,
        source,
        message,
        snippet: `const key = "sk-${Math.random().toString(36).substring(7)}";\n// TODO: Remove this before committing`,
        detectedAt: date,
      });
    }
  }

  if (leaksData.length > 0) {
    await prisma.workspaceLeak.createMany({
      data: leaksData,
    });
  }

  console.log(`✅ Added ${leaksData.length} fake leaks.`);
  console.log('✨ Seed completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
