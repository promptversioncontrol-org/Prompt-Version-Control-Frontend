export interface TelegramNotificationPayload {
  userId: string;
  workspaceSlug: string;
  event: {
    sessionId: string;
    ruleId: string;
    severity: 'low' | 'medium' | 'high';
    message: string;
    snippet: string;
    source: string;
    timestamp: string;
    username: string;
  };
}

export async function sendTelegramNotification(
  payload: TelegramNotificationPayload,
) {
  const { userId, workspaceSlug, event } = payload;

  console.log('[telegram] Attempting to send notification', {
    userId,
    workspaceSlug,
    ruleId: event.ruleId,
    severity: event.severity,
  });

  if (!userId) {
    console.warn(
      '[telegram] Missing userId in payload. Skipping notification.',
    );
    return;
  }

  const tgUrl = process.env.TG_URL;

  if (!tgUrl) {
    console.warn('[telegram] TG_URL is not defined. Skipping notification.');
    return;
  }

  try {
    const response = await fetch(`${tgUrl}/notify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error(
        `[telegram] Failed to send notification: ${response.status} ${response.statusText}`,
      );
      const text = await response.text();
      console.error('[telegram] Response body:', text);
    } else {
      console.log('[telegram] Notification sent successfully');
    }
  } catch (error) {
    console.error('[telegram] Error sending notification:', error);
  }
}
