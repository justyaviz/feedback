import { NextResponse } from "next/server";
import { isAdminRequest } from "../../../../lib/auth";
import { db, ensureSchema } from "../../../../lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    if (!isAdminRequest()) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await ensureSchema();

    const url = new URL(request.url);
    const limit = Math.min(1000, Math.max(1, Number(url.searchParams.get("limit") || 500)));

    const result = await db().query(
      `SELECT *
       FROM feedback_responses
       ORDER BY created_at DESC
       LIMIT $1`,
      [limit]
    );

    return NextResponse.json({
      rows: result.rows,
      meta: {
        count: result.rowCount || 0,
        generated_at: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error("[admin] responses error", error);
    return NextResponse.json(
      { error: "Database ulanishida xatolik." },
      { status: 500 }
    );
  }
}
