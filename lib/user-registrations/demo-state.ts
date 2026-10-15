"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";
import { getRegistrationAvailability } from "./rules";
import type { UserRegistration } from "./types";

// DEMO-ONLY registration changes.
//
// The registrations API has no confirm/cancel endpoints yet, so a member's confirm
// or cancel action is recorded as a browser-local override on top of the read-only
// demo records (lib/user-registrations/repository.ts). The source data is never
// mutated, nothing is sent to a server, and no real confirmation or ticket is issued.
// Every member view (My Events, event details, dashboard cards, calendar) applies the
// same overrides so they stay consistent. Replace confirmRegistration/cancelRegistration
// with the documented API calls when they exist.

type Override = Pick<UserRegistration, "status"> &
  Partial<Pick<UserRegistration, "attendanceConfirmationStatus" | "attendanceConfirmedAt">> & {
    updatedAt: string;
  };

const STORAGE_KEY = "gdg.memberDashboard.demoRegistrationChanges.v1";
const CHANGE_EVENT = "gdg-demo-registrations-change";

function readRaw(): string {
  try {
    return window.localStorage.getItem(STORAGE_KEY) ?? "";
  } catch {
    return "";
  }
}

function parse(raw: string | null): Record<string, Override> {
  if (!raw) return {};
  try {
    const value = JSON.parse(raw);
    return value && typeof value === "object" ? (value as Record<string, Override>) : {};
  } catch {
    return {};
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

function write(overrides: Record<string, Override>): boolean {
  try {
    const serialized = JSON.stringify(overrides);
    window.localStorage.setItem(STORAGE_KEY, serialized);
    if (window.localStorage.getItem(STORAGE_KEY) !== serialized) return false;
  } catch {
    return false;
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
  return true;
}

export function applyDemoChanges(registration: UserRegistration, overrides: Record<string, Override>): UserRegistration {
  const override = overrides[registration.id];
  if (!override) return registration;
  return {
    ...registration,
    status: override.status,
    attendanceConfirmationStatus: override.attendanceConfirmationStatus ?? registration.attendanceConfirmationStatus,
    attendanceConfirmedAt: override.attendanceConfirmedAt ?? registration.attendanceConfirmedAt,
  };
}

/**
 * Applies this browser's demo changes to registrations. `ready` is false during server
 * rendering and hydration (the changes live in the browser), so actions wait for it.
 */
export function useDemoRegistrationChanges() {
  const raw = useSyncExternalStore(subscribe, readRaw, () => null);
  const overrides = useMemo(() => parse(raw), [raw]);
  const apply = useCallback(
    (registrations: UserRegistration[]) => registrations.map((registration) => applyDemoChanges(registration, overrides)),
    [overrides],
  );
  return { ready: raw !== null, apply, isChanged: (id: string) => id in overrides };
}

export type RegistrationActionResult =
  | { ok: true; mode: "demo" }
  | { ok: false; reason: "not-allowed" | "storage-unavailable" };

async function record(registration: UserRegistration, change: Omit<Override, "updatedAt">, allowed: boolean) {
  if (!allowed) return { ok: false, reason: "not-allowed" } as const;
  const overrides = parse(readRaw());
  overrides[registration.id] = { ...change, updatedAt: new Date().toISOString() };
  return write(overrides) ? ({ ok: true, mode: "demo" } as const) : ({ ok: false, reason: "storage-unavailable" } as const);
}

/** DEMO: records attendance confirmation in this browser only. */
export async function confirmRegistration(registration: UserRegistration): Promise<RegistrationActionResult> {
  const now = Date.now();
  return record(
    registration,
    { status: "approved", attendanceConfirmationStatus: "confirmed", attendanceConfirmedAt: new Date(now).toISOString() },
    getRegistrationAvailability(registration, now).canConfirm,
  );
}

/** DEMO: records the member's cancellation in this browser only. */
export async function cancelRegistration(registration: UserRegistration): Promise<RegistrationActionResult> {
  return record(registration, { status: "cancelled" }, getRegistrationAvailability(registration, Date.now()).canCancel);
}

/** Removes this browser's demo change for one registration (restores the demo record). */
export function resetDemoRegistration(id: string): boolean {
  const overrides = parse(readRaw());
  if (!(id in overrides)) return true;
  delete overrides[id];
  return write(overrides);
}
