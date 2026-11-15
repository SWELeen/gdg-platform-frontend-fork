import createMiddleware from "next-intl/middleware";
import { getSessionCookie } from "better-auth/cookies";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "./i18n/routing";
import { loginRedirect } from "./lib/auth/proxy-routing";

const internationalize = createMiddleware(routing);
export default function proxy(request: NextRequest) {
  const destination = loginRedirect(request.nextUrl.pathname, request.nextUrl.search, Boolean(getSessionCookie(request)));
  if (destination) return NextResponse.redirect(new URL(destination, request.url));
  return internationalize(request);
}
export const config = { matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"] };
