export const AUTH_COOKIE_NAME = "law-ai-session";

type Credentials = {
  email: string;
  password: string;
};

function getAuthSecret() {
  return process.env.AUTH_SECRET ?? "law-ai-dev-secret";
}

function toHex(buffer: ArrayBuffer) {
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function constantTimeEqual(a: string, b: string) {
  if (a.length !== b.length) {
    return false;
  }

  let result = 0;

  for (let index = 0; index < a.length; index += 1) {
    result |= a.charCodeAt(index) ^ b.charCodeAt(index);
  }

  return result === 0;
}

export function getConfiguredCredentials(): Credentials | null {
  const email = process.env.LAW_AI_LOGIN_EMAIL;
  const password = process.env.LAW_AI_LOGIN_PASSWORD;

  if (!email || !password) {
    return null;
  }

  return { email, password };
}

export async function createSessionToken(email: string) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(getAuthSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(email));

  return toHex(signature);
}

export async function isValidSessionToken(email: string, token: string) {
  const expected = await createSessionToken(email);
  return constantTimeEqual(token, expected);
}
