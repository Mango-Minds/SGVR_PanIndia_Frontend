import * as Notifications from "expo-notifications";

let lastWrittenBadge = null;

/**
 * Set the OS home-screen app icon badge (iOS + supported Android launchers).
 * Pass 0 to clear.
 */
export async function setAppIconBadge(count) {
  const next = Math.max(0, Number(count) || 0);
  if (lastWrittenBadge === next) {
    return next;
  }
  try {
    await Notifications.setBadgeCountAsync(next);
    lastWrittenBadge = next;
  } catch (error) {
    console.warn("setAppIconBadge failed:", error?.message || error);
  }
  return next;
}

export async function clearAppIconBadge() {
  return setAppIconBadge(0);
}
