// clipboard.ts - Clipboard writes with mandatory auto-clear.
// Copied passwords and keeper exports must not linger in the system clipboard.

import * as Clipboard from "expo-clipboard";

export const CLIPBOARD_CLEAR_TIMEOUT = 30000;

let clearTimer: ReturnType<typeof setTimeout> | null = null;

export async function copyWithAutoClear(text: string): Promise<void> {
  await Clipboard.setStringAsync(text);
  if (clearTimer) {
    clearTimeout(clearTimer);
  }
  clearTimer = setTimeout(() => {
    Clipboard.setStringAsync("");
    clearTimer = null;
  }, CLIPBOARD_CLEAR_TIMEOUT);
}
