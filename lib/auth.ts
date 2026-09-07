import crypto from "crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "aloo_admin_session";
const MAX_AGE_SECONDS = 60 * 60 * 12;

function secret() {
  const value = process.env.SESSION_SECRET;
  if (!value) throw new Error("SESSION_SECRET is not configured.");
  return value;
}

function sign(value: string) {
  return crypto.createHmac("sha256", secret()).update(value).digest("hex");
}

export function createSessionToken(email: string) {
  const payload = Buffer.from(JSON.stringify({
    email,
    exp: Date.now() + MAX_AGE_SECONDS * 1000
  })).toString("base64url");

  return `${payload}.${sign(payload)}`;
}

export function verifySessionToken(token?: string | null) {
  if (!token) return false;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return false;

  const expected = sign(payload);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return false;

  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    return Boolean(data.email && data.exp && Date.now() < data.exp);
  } catch {
    return false;
  }
}

export function isAdminRequest() {
  return verifySessionToken(cookies().get(COOKIE_NAME)?.value);
}

export const authCookie = {
  name: COOKIE_NAME,
  maxAge: MAX_AGE_SECONDS
};
