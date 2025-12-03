// src/shared/lib/telegram-notifier.ts
import { prisma } from '@/shared/lib/prisma';

interface LeakEvent {
  sessionId: string;
  ruleId: string;
  severity: 'low' | 'medium' | 'high';
  message: string;
  snippet: string;
  source?: string;
  timestamp: string;
  username?: string;
}

export async function notifyTelegramFromSocket2(
  workspaceId: string,
  event: LeakEvent,
  triggeringUser: { username: string; id: string },
) {
  const tgUrl = process.env.TG_URL;

  if (!tgUrl) {
    console.warn('⚠️ TG_URL is not defined. Skipping notification.');
    return;
  }

  try {
    // 1. Musimy pobrać SLUG i Właściciela workspace'u z bazy
    // Socket ma tylko ID, a Twój bot pewnie potrzebuje sluga lub ID właściciela
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: {
        slug: true,
        name: true,
        userId: true, // Zakładamy, że powiadomienie idzie do właściciela
      },
    });

    if (!workspace) {
      console.error(`❌ Workspace not found for ID: ${workspaceId}`);
      return;
    }

    // 2. Budujemy payload
    const payload = {
      userId: workspace.userId, // Wysyłamy do właściciela workspace'u
      workspaceSlug: workspace.slug,
      workspaceName: workspace.name,
      event: {
        ...event,
        username: triggeringUser.username, // Nadpisujemy username dla pewności
        source: event.source || 'CLI-Socket',
      },
    };

    console.log(`📤 Sending TG alert for workspace: ${workspace.slug}`);

    // 3. Strzał do mikroserwisu Telegrama
    const response = await fetch(`${tgUrl}/notify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error(`❌ TG Error (${response.status}): ${errText}`);
    } else {
      console.log('✅ Telegram notification sent.');
    }
  } catch (error) {
    console.error('❌ TG Network Error:', error);
  }
}
