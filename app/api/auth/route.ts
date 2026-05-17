import { NextResponse } from "next/server";
import {
  AUTH_COOKIE_NAME,
  createSessionToken,
  getConfiguredCredentials,
} from "@/lib/auth";

export async function POST(request: Request) {
  const { email, password } = (await request.json()) as {
    email?: string;
    password?: string;
  };

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password are required." },
      { status: 400 },
    );
  }

  const configuredCredentials = getConfiguredCredentials();

  if (!configuredCredentials) {
    return NextResponse.json(
      {
        error:
          "Auth credentials are missing. Set LAW_AI_LOGIN_EMAIL and LAW_AI_LOGIN_PASSWORD in .env.",
      },
      { status: 500 },
    );
  }

  const normalizedEmail = email.trim().toLowerCase();
  const expectedEmail = configuredCredentials.email.trim().toLowerCase();

  if (
    normalizedEmail !== expectedEmail ||
    password !== configuredCredentials.password
  ) {
    return NextResponse.json(
      { error: "Invalid email or password." },
      { status: 401 },
    );
  }

  const response = NextResponse.json({
    ok: true,
    redirectTo: "/dashboard",
  });

  response.cookies.set(AUTH_COOKIE_NAME, await createSessionToken(expectedEmail), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  });

  return response;
}
