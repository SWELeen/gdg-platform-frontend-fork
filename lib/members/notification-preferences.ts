"use client";

import { useSyncExternalStore } from "react";

// A member's own notification preferences.
//
// No notifications backend or preferences API exists yet, so preferences are stored
// only in this browser (localStorage). Nothing is sent or delivered from them; they are
// ready to be submitted to the documented preferences endpoint once it is published.

export const notificationPreferenceKeys = [
  "taskAssigned",
  "taskDeadline",
  "taskUpdates",
  "newEvents",
  "registrationUpdates",
] as const;

export type NotificationPreferenceKey = (typeof notificationPreferenceKeys)[number];
export type NotificationPreferences = Record<NotificationPreferenceKey, boolean>;

export const defaultNotificationPreferences: NotificationPreferences = {
  taskAssigned: true,
  taskDeadline: true,
  taskUpdates: true,
  newEvents: true,
  registrationUpdates: true,
};

// Scoped and versioned so it never collides with other features' keys.
const STORAGE_KEY = "gdg.memberDashboard.notificationPreferences.v1";
const CHANGE_EVENT = "gdg-notification-preferences-change";
const UNAVAILABLE = "__storage-unavailable__";

function readRaw(): string {
  try {
    return window.localStorage.getItem(STORAGE_KEY) ?? "";
  } catch {
    return UNAVAILABLE;
  }
}

function subscribe(onChange: () => void): () => void {
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) onChange();
  };
  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onStorage);
  };
}

function parse(raw: string): NotificationPreferences {
  if (!raw) return defaultNotificationPreferences;
  try {
    const stored = JSON.parse(raw) as Partial<Record<string, unknown>>;
    const preferences = { ...defaultNotificationPreferences };
    for (const key of notificationPreferenceKeys) {
      if (typeof stored[key] === "boolean") preferences[key] = stored[key] as boolean;
    }
    return preferences;
  } catch {
    return defaultNotificationPreferences;
  }
}

export type PreferencesState =
  | { status: "loading" }
  | { status: "ready"; preferences: NotificationPreferences }
  | { status: "unavailable"; preferences: NotificationPreferences };

/**
 * Current preferences. "loading" during server rendering and hydration (storage is
 * browser-only), "unavailable" when the browser blocks storage.
 */
export function useNotificationPreferences(): PreferencesState {
  const raw = useSyncExternalStore(subscribe, readRaw, () => null);
  if (raw === null) return { status: "loading" };
  if (raw === UNAVAILABLE) return { status: "unavailable", preferences: defaultNotificationPreferences };
  return { status: "ready", preferences: parse(raw) };
}

/** Saves one preference. Returns false when the browser refused to store it. */
export function saveNotificationPreference(key: NotificationPreferenceKey, enabled: boolean): boolean {
  try {
    const next = { ...parse(window.localStorage.getItem(STORAGE_KEY) ?? ""), [key]: enabled };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    if (window.localStorage.getItem(STORAGE_KEY) !== JSON.stringify(next)) return false;
  } catch {
    return false;
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
  return true;
}
