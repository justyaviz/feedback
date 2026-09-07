import { NextResponse } from "next/server";
import { db, ensureSchema } from "../../../lib/db";

export const dynamic = "force-dynamic";

function cleanArray(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.map(String).map((x) => x.trim()).filter(Boolean).slice(0, 30);
}

function cleanText(value: unknown, max = 3000) {
  return String(value ?? "").trim().slice(0, max);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const branch = cleanText(body.branch, 120);
    const role = cleanText(body.role, 80);
    const marketingScore = Number(body.marketing_score);
    const supportLevel = cleanText(body.support_level, 20);
    const exactHelp = cleanText(body.exact_help);

    if (!branch || !role || !Number.isInteger(marketingScore) ||
        marketingScore < 1 || marketingScore > 10 ||
        !["Ha", "Qisman", "Yo‘q"].includes(supportLevel) || !exactHelp) {
      return NextResponse.json(
        { error: "Majburiy maydonlarni to‘ldiring." },
        { status: 400 }
      );
    }

    await ensureSchema();

    await db().query(
      `INSERT INTO feedback_responses (
        branch, role, marketing_score, liked_activities, biggest_problem,
        best_channels, support_level, needed_help, customer_feedback,
        competitor_idea, one_action, plus_feedback, minus_feedback, exact_help
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14
      )`,
      [
        branch,
        role,
        marketingScore,
        cleanArray(body.liked_activities),
        cleanText(body.biggest_problem),
        cleanArray(body.best_channels),
        supportLevel,
        cleanArray(body.needed_help),
        cleanText(body.customer_feedback),
        cleanText(body.competitor_idea),
        cleanText(body.one_action),
        cleanText(body.plus_feedback),
        cleanText(body.minus_feedback),
        exactHelp
      ]
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("feedback POST error", error);
    return NextResponse.json(
      { error: "Server xatosi. DATABASE_URL ni tekshiring." },
      { status: 500 }
    );
  }
}
