// Shared client for the NestJS API. Pages keep working on demo data unless
// NEXT_PUBLIC_USE_API=true, so turning the API on is an explicit choice.
// Supabase Auth sessions are held only for the current browser tab and attached
// here so protected API calls consistently use the existing auth integration.

import { clearAuthSession } from "@/lib/auth/session";
import { clearApiSession } from "./session";

export const API_ENABLED = process.env.NEXT_PUBLIC_USE_API === "true";
const RAW_API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
const API_URL = RAW_API_URL.endsWith("/") ? RAW_API_URL.slice(0, -1) : RAW_API_URL;

export type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; status: number; code: string; message: string };

type ApiEnvelope<T> = {
  success?: boolean;
  data?: T;
  message?: string;
  error?: { code?: string };
} | null;

function requestHeaders(body: unknown): Record<string, string> {
  const headers: Record<string, string> = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  return headers;
}

let refreshPromise: Promise<boolean> | null = null;

function refreshAuthSession(): Promise<boolean> {
  if (refreshPromise) return refreshPromise;
  refreshPromise = (async () => {
  try {
    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include",
      cache: "no-store",
    });
    const envelope = await response.json().catch(() => null) as ApiEnvelope<{ authenticated?: boolean }>;
    if (!response.ok || !envelope?.success || !envelope.data?.authenticated) {
      clearAuthSession();
      return false;
    }
    return true;
  } catch {
    return false;
  }
  })().finally(() => { refreshPromise = null; });
  return refreshPromise;
}

export async function apiRequest<T>(
  path: string,
  init: { method?: string; body?: unknown } = {},
): Promise<ApiResult<T>> {
  clearApiSession();
  const makeRequest = () => fetch(`${API_URL}${path}`, {
    method: init.method ?? "GET",
    headers: requestHeaders(init.body),
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
    credentials: "include",
    cache: "no-store",
  });

  let response: Response;
  try {
    response = await makeRequest();
    if (response.status === 401 && !["/auth/refresh", "/auth/login", "/auth/logout"].includes(path) && await refreshAuthSession()) {
      response = await makeRequest();
    }
  } catch {
    return { ok: false, status: 0, code: "NETWORK_ERROR", message: "The service is unavailable." };
  }

  const envelope = await response.json().catch(() => null) as ApiEnvelope<T>;
  if (response.ok && envelope?.success) return { ok: true, data: envelope.data as T };
  return {
    ok: false,
    status: response.status,
    code: envelope?.error?.code ?? "HTTP_ERROR",
    message: envelope?.message ?? "The request could not be completed.",
  };
}

export async function logoutSession() {
  const result = await apiRequest<{ authenticated: false }>("/auth/logout", { method: "POST" });
  clearAuthSession();
  return result;
}
