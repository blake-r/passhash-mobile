// hints.ts - Site tag hint filtering and ranking

import type { KeepObj } from "./keeper";

/**
 * Filters keeper entries whose tag contains the input and ranks them:
 * exact match first, then prefix matches, then shorter tags.
 */
export function filterHints(input: string, data: Map<string, KeepObj>): KeepObj[] {
  if (!input || input.trim().length === 0) {
    return [];
  }

  const inputLower = input.toLowerCase();
  const hints: KeepObj[] = [];

  data.forEach((keepObj) => {
    if (keepObj.tag.toLowerCase().includes(inputLower)) {
      hints.push(keepObj);
    }
  });

  hints.sort((a, b) => {
    const aTagLower = a.tag.toLowerCase();
    const bTagLower = b.tag.toLowerCase();

    // Exact match gets highest priority
    if (aTagLower === inputLower) return -1;
    if (bTagLower === inputLower) return 1;

    // Starts with gets second priority
    if (aTagLower.startsWith(inputLower) && !bTagLower.startsWith(inputLower)) return -1;
    if (bTagLower.startsWith(inputLower) && !aTagLower.startsWith(inputLower)) return 1;

    // Then sort by length (shorter matches are typically more relevant)
    return aTagLower.length - bTagLower.length;
  });

  return hints;
}
