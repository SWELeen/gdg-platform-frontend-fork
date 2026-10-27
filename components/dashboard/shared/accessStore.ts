"use client";

import type { LeaderCommittee } from "./types";

const STORAGE_KEY = "gdg_elevated_access";

export interface ElevatedAccessRecord {
  grantedAt: number;
  expiresAt: number;
  durationMinutes: number;
  grantedToEmail: string;
  committee: LeaderCommittee;
}

export function getElevatedAccess(): ElevatedAccessRecord | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const record: ElevatedAccessRecord = JSON.parse(raw);
    if (!["data-analysis", "pr", "content-writing", "web-development", "automation", "artificial-intelligence", "robotics-iot", "cybersecurity", "digital-media-design"].includes(record.committee)) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    if (Date.now() > record.expiresAt) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return record;
  } catch {
    return null;
  }
}

export function setElevatedAccess(
  email: string,
  durationMinutes: number,
  committee: LeaderCommittee
) {
  if (typeof window === "undefined") return;
  const now = Date.now();
  const record: ElevatedAccessRecord = {
    grantedAt: now,
    expiresAt: now + durationMinutes * 60 * 1000,
    durationMinutes,
    grantedToEmail: email,
    committee,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
  window.dispatchEvent(new Event("storage"));
}

export function clearElevatedAccess() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event("storage"));
}
