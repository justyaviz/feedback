import { NextResponse } from "next/server";
import crypto from "crypto";
import { authCookie, createSessionToken } from "../../../../lib/auth";
import { rateLimit, requestIp } from "../../../../lib/rateLimit";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function safeEqual(a: string, b: string) {
  const aa = Buffer.from(a);
  const bb = Buffer.from(b);
  return aa.length === bb.length && crypto.timingSafeEqual(aa, bb);
}

export async function POST(request: Request) {
  try {
    const ip = requestIp(request);
    const limited = rateLimit(`login:${ip}`, 6, 10 * 60_000);

    if (!limited.ok) {
      return NextResponse.json(
        { error: "Ko‘p noto‘g‘ri urinish. 10 daqiqadan keyin qayta urinib ko‘ring." },
        { status: 429 }
      );
    }

    const { email, password } = await request.json();
    const adminEmail = process.env.ADMIN_EMAIL || "";
    const adminPassword = process.env.ADMIN_PASSWORD || "";

    if (!adminEmail || !adminPassword || !process.env.SESSION_SECRET) {
      return NextResponse.json(
        { error: "Admin sozlamalari to‘liq kiritilmagan." },
        { status: 500 }
      );
    }

    if (
      !safeEqual(String(email || "").trim().toLowerCase(), adminEmail.trim().toLowerCase()) ||
      !safeEqual(String(password || ""), adminPassword)
    ) {
      return NextResponse.json(
        { error: "Email yoki parol noto‘g‘ri." },
        { status: 401 }
      );
    }

    const response = NextResponse.json({ ok: true });
    response.cookies.set({
      name: authCookie.name,
      value: createSessionToken(adminEmail),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: authCookie.maxAge
    });

    return response;
  } catch (error) {
    console.error("[auth] login error", error);
    return NextResponse.json({ error: "Login xatosi." }, { status: 400 });
  }
}
