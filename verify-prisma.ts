import { prisma } from './src/shared/lib/prisma'; // Relative import to avoid alias issues if tsx doesn't pick up tsconfig paths immediately without setup
import { createNewWorkspace } from './src/features/workspaces/services/create-new-workspace';
import { generateSlug } from './src/shared/utils/slug';

// Mock params or just check if function is defined
async function main() {
  try {
    console.log('Checking prisma instance...');
    const count = await prisma.user.count();
    console.log('User count:', count);

    console.log('Checking createNewWorkspace function...');
    if (typeof createNewWorkspace === 'function') {
      console.log('createNewWorkspace is a function.');
    } else {
      console.error('createNewWorkspace is NOT a function.');
    }

    // Attempt a dry run or check if we can call it?
    // We won't call it since we need valid userId and it sends emails.
    // Just checking import success is usually enough to verify syntax/schema compilation.
  } catch (e) {
    console.error('Error:', e);
  } finally {
    // Check if we can close? prisma instance from lib might not have $disconnect exposed if it is global?
    // looking at lib/prisma.ts: export const prisma = ...
    // It typically has $disconnect.
    await prisma.$disconnect();
  }
}

main();
