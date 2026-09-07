import { NextResponse } from "next/server";
import { dbPing, ensureSchema } from "../../../../lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    await ensureSchema();
    const latency_ms = await dbPing();
    return NextResponse.json({
      ok: true,
      database: "connected",
      latency_ms
    });
  } catch (error) {
    console.error("[health/db]", error);
    return NextResponse.json(
      { ok: false, database: "unavailable" },
      { status: 503 }
    );
  }
}
