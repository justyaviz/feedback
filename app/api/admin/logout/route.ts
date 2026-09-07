import { NextResponse } from "next/server";
import { authCookie } from "../../../../lib/auth";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set({
    name: authCookie.name,
    value: "",
    path: "/",
    maxAge: 0
  });
  return response;
}
