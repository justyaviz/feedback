import { NextResponse } from "next/server";
import { isAdminRequest } from "../../../../lib/auth";
import { db, ensureSchema } from "../../../../lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    if (!isAdminRequest()) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await ensureSchema();
    const result = await db().query(
      "SELECT * FROM feedback_responses ORDER BY created_at DESC"
    );

    return NextResponse.json({ rows: result.rows });
  } catch (error) {
    console.error("admin responses error", error);
    return NextResponse.json(
      { error: "Database ulanishida xatolik." },
      { status: 500 }
    );
  }
}
