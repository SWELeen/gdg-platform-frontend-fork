"use client";

import { useSyncExternalStore } from "react";

const subscribeToNothing = () => () => {};
// Rounded to the minute so the snapshot stays stable between renders.
const getMinuteNow = () => Math.floor(Date.now() / 60_000) * 60_000;

/**
 * The browser's current time, or null during server rendering and hydration.
 * Pages that are prerendered must not split events into upcoming/past with the
 * build machine's clock, so they render a neutral state until this is known.
 */
export function useClientNow(): number | null {
  return useSyncExternalStore(subscribeToNothing, getMinuteNow, () => null);
}
