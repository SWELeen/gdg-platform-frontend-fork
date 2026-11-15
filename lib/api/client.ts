// Application APIs use server-verified HttpOnly Better Auth sessions.

import { authClient } from "@/lib/auth/better-auth-client";
import { clearAuthSession } from "@/lib/auth/session";
import { clearApiSession } from "./session";

export const API_ENABLED = process.env.NEXT_PUBLIC_USE_API === "true";
const RAW_API_URL = API_ENABLED
  ? "/api"
  : process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
const API_URL = RAW_API_URL.endsWith("/") ? RAW_API_URL.slice(0, -1) : RAW_API_URL;

export type ApiResult<T> =
  | { ok: true; data: T }
  | {
      ok: false;
      status: number;
      code: string;
      message: string;
      details: readonly { pointer: string; message: string }[];
    };

type ApiEnvelope<T> = {
  success?: boolean;
  data?: T;
  message?: string;
  error?: {
    code?: string;
    details?: readonly { pointer: string; message: string }[];
  };
} | null;

function requestHeaders(body: unknown): Record<string, string> {
  if (typeof FormData !== "undefined" && body instanceof FormData) return {};
  const headers: Record<string, string> = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  return headers;
}

export async function apiRequest<T>(
  path: string,
  init: { method?: string; body?: unknown } = {},
): Promise<ApiResult<T>> {
  clearApiSession();
  const makeRequest = () => fetch(`${API_URL}${path}`, {
    method: init.method ?? "GET",
    headers: {
      ...requestHeaders(init.body),
    },
    body: init.body === undefined
      ? undefined
      : typeof FormData !== "undefined" && init.body instanceof FormData
        ? init.body
        : JSON.stringify(init.body),
    credentials: "include",
    cache: "no-store",
  });

  let response: Response;
  try {
    response = await makeRequest();
    if (response.status === 401) clearAuthSession();
  } catch {
    return { ok: false, status: 0, code: "NETWORK_ERROR", message: "The service is unavailable.", details: [] };
  }

  const envelope = await response.json().catch(() => null) as ApiEnvelope<T>;
  if (response.ok && envelope?.success) return { ok: true, data: envelope.data as T };
  return {
    ok: false,
    status: response.status,
    code: envelope?.error?.code ?? "HTTP_ERROR",
    message: envelope?.message ?? "The request could not be completed.",
    details: envelope?.error?.details ?? [],
  };
}

export async function logoutSession() {
  const result = await authClient.signOut();
  clearAuthSession();
  return { ok: !result.error };
}
