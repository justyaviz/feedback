import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json(
    { ok: true, service: "aloo-feedback", status: "healthy" },
    { status: 200, headers: { "Cache-Control": "no-store" } }
  );
}
