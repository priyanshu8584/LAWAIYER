import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  AUTH_COOKIE_NAME,
  getConfiguredCredentials,
  isValidSessionToken,
} from "@/lib/auth";

const protectedPaths = ["/dashboard", "/chat", "/upload"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!protectedPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  const configuredCredentials = getConfiguredCredentials();

  if (!configuredCredentials) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (!(await isValidSessionToken(configuredCredentials.email, token))) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/chat/:path*", "/upload/:path*"],
};
