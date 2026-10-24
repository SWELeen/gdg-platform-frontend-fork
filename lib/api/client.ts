// Shared client for the NestJS API. Pages keep working on demo data unless
// NEXT_PUBLIC_USE_API=true, so turning the API on is an explicit choice.
// Supabase Auth sessions are held only for the current browser tab and attached
// here so protected API calls consistently use the existing auth integration.

import { clearAuthSession, readAuthSession, storeAuthSession, type AuthSession } from "@/lib/auth/session";
//
import { getApiAccessToken } from "./session";

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

function requestHeaders(body: unknown, accessToken?: string): Record<string, string> {
  const headers: Record<string, string> = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
  return headers;
}

async function refreshAuthSession(): Promise<boolean> {
  const session = readAuthSession();
  if (!session) return false;
  try {
    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: session.refreshToken }),
      cache: "no-store",
    });
    const envelope = await response.json().catch(() => null) as ApiEnvelope<AuthSession>;
    if (!response.ok || !envelope?.success || !envelope.data?.accessToken || !envelope.data.refreshToken) {
      clearAuthSession();
      return false;
    }
    storeAuthSession(envelope.data);
    return true;
  } catch {
    return false;
  }
}

export async function apiRequest<T>(
  path: string,
  init: { method?: string; body?: unknown } = {},
): Promise<ApiResult<T>> {
  const headers: Record<string, string> = {};
  const token = getApiAccessToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  if (init.body !== undefined) headers["Content-Type"] = "application/json";

  const session = readAuthSession();
  const makeRequest = (accessToken?: string) => fetch(`${API_URL}${path}`, {
    method: init.method ?? "GET",
    headers: requestHeaders(init.body, accessToken),
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
    cache: "no-store",
  });

  let response: Response;
  try {
    response = await makeRequest(session?.accessToken);
    if (response.status === 401 && session && path !== "/auth/refresh" && await refreshAuthSession()) {
      response = await makeRequest(readAuthSession()?.accessToken);
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
