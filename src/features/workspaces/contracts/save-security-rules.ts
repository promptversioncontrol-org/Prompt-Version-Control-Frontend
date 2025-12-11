'use server';

import { prisma } from '@/shared/lib/prisma';
import { revalidatePath } from 'next/cache';
import { SecurityRule } from '@prisma/client';

export async function saveSecurityRules(
  workspaceId: string,
  rules: SecurityRule[],
) {
  await prisma.$transaction([
    prisma.securityRule.deleteMany({ where: { workspaceId } }),
    prisma.securityRule.createMany({
      data: rules.map((r) => ({
        workspaceId,
        pattern: r.pattern,
        category: r.category,
        description: r.description,
      })),
    }),
  ]);

  revalidatePath(`/dashboard/workspaces/${workspaceId}/settings`);
}
