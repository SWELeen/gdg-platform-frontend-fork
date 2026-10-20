// Shared client for the NestJS API. Pages keep working on demo data unless
// NEXT_PUBLIC_USE_API=true, so turning the API on is an explicit choice.
//
// Authentication is not wired yet: once the auth task issues tokens, attach
// the signed-in user's credentials here, in one place, for every request.

export const API_ENABLED = process.env.NEXT_PUBLIC_USE_API === "true";
const RAW_API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";
const API_URL = RAW_API_URL.endsWith("/") ? RAW_API_URL.slice(0, -1) : RAW_API_URL;

export type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; status: number; code: string; message: string };

export async function apiRequest<T>(
  path: string,
  init: { method?: string; body?: unknown } = {},
): Promise<ApiResult<T>> {
  const headers: Record<string, string> = {};
  if (init.body !== undefined) headers["Content-Type"] = "application/json";

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method: init.method ?? "GET",
      headers,
      body: init.body === undefined ? undefined : JSON.stringify(init.body),
      cache: "no-store",
    });
  } catch {
    return { ok: false, status: 0, code: "NETWORK_ERROR", message: "The service is unavailable." };
  }

  const envelope = (await response.json().catch(() => null)) as {
    success?: boolean;
    data?: T;
    message?: string;
    error?: { code?: string };
  } | null;
  if (response.ok && envelope?.success) return { ok: true, data: envelope.data as T };
  return {
    ok: false,
    status: response.status,
    code: envelope?.error?.code ?? "HTTP_ERROR",
    message: envelope?.message ?? "The request could not be completed.",
  };
}
