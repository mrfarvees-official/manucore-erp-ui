import "server-only";

import type { AppNotification } from "@/lib/notifications";

/** No notifications service yet. Replace the body with a backend call later. */
export async function loadNotifications(): Promise<AppNotification[]> {
  return [];
}
