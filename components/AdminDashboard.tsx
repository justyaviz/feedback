"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { FeedbackResponse } from "../lib/types";

type DatePreset = "all" | "7" | "30" | "90";

function countList(
  rows: FeedbackResponse[],
  key: "liked_activities" | "best_channels" | "needed_help"
) {
  const map = new Map<string, number>();
  rows.forEach((r) => {
    (r[key] || []).forEach((item) =>
      map.set(item, (map.get(item) || 0) + 1)
    );
  });
  return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
}

function pct(value: number, total: number) {
  return total ? Math.round((value / total) * 100) : 0;
}

function exportCSV(rows: FeedbackResponse[]) {
  const headers = [
    "Filial",
    "Lavozim",
    "Baho",
    "Yoqtirgan ishlar",
    "Kamchilik",
    "Eng yaxshi kanallar",
    "Yordam darajasi",
    "Kerakli yordam",
    "Mijoz fikri",
    "Raqobatchi g‘oya",
    "Bitta harakat",
    "Plus",
    "Minus",
    "Aniq yordam",
    "Sana"
  ];

  const data = rows.map((r) => [
    r.branch,
    r.role,
    r.marketing_score,
    (r.liked_activities || []).join(" | "),
    r.biggest_problem,
    (r.best_channels || []).join(" | "),
    r.support_level,
    (r.needed_help || []).join(" | "),
    r.customer_feedback,
    r.competitor_idea,
    r.one_action,
    r.plus_feedback,
    r.minus_feedback,
    r.exact_help,
    new Date(r.created_at).toLocaleString("uz-UZ")
  ]);

  const csv = [headers, ...data]
    .map((row) =>
      row
        .map((v) => `"${String(v ?? "").replaceAll('"', '""')}"`)
        .join(",")
    )
    .join("\n");

  const blob = new Blob(["\uFEFF" + csv], {
    type: "text/csv;charset=utf-8;"
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `aloo-marketing-feedback-${new Date()
    .toISOString()
    .slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function AdminDashboard() {
  const router = useRouter();
  const [rows, setRows] = useState<FeedbackResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [branch, setBranch] = useState("Barchasi");
  const [role, setRole] = useState("Barchasi");
  const [datePreset, setDatePreset] = useState<DatePreset>("all");
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<FeedbackResponse | null>(null);

  async function load() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/responses?limit=1000", {
        cache: "no-store"
      });

      if (response.status === 401) {
        router.replace("/admin/login");
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Ma’lumotlarni olib bo‘lmadi."
        );
      }

      setRows((data.rows || []) as FeedbackResponse[]);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Server xatosi."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const branches = useMemo(
    () => [
      "Barchasi",
      ...Array.from(new Set(rows.map((r) => r.branch))).sort()
    ],
    [rows]
  );

  const roles = useMemo(
    () => [
      "Barchasi",
      ...Array.from(new Set(rows.map((r) => r.role))).sort()
    ],
    [rows]
  );

  const filtered = useMemo(() => {
    const now = Date.now();
    const q = search.trim().toLowerCase();

    return rows.filter((r) => {
      if (branch !== "Barchasi" && r.branch !== branch) return false;
      if (role !== "Barchasi" && r.role !== role) return false;

      if (datePreset !== "all") {
        const days = Number(datePreset);
        const age = now - new Date(r.created_at).getTime();
        if (age > days * 24 * 60 * 60 * 1000) return false;
      }

      if (q) {
        const haystack = [
          r.branch,
          r.role,
          r.biggest_problem,
          r.customer_feedback,
          r.competitor_idea,
          r.one_action,
          r.plus_feedback,
          r.minus_feedback,
          r.exact_help,
          ...(r.needed_help || []),
          ...(r.best_channels || [])
        ]
          .join(" ")
          .toLowerCase();

        if (!haystack.includes(q)) return false;
      }

      return true;
    });
  }, [rows, branch, role, datePreset, search]);

  const avgScore = filtered.length
    ? (
        filtered.reduce(
          (sum, r) => sum + Number(r.marketing_score || 0),
          0
        ) / filtered.length
      ).toFixed(1)
    : "0.0";

  const support = useMemo(() => {
    const out = { Ha: 0, Qisman: 0, "Yo‘q": 0 };
    filtered.forEach((r) => {
      if (r.support_level in out) {
        out[r.support_level as keyof typeof out] += 1;
      }
    });
    return out;
  }, [filtered]);

  const topHelp = countList(filtered, "needed_help").slice(0, 7);
  const topChannels = countList(filtered, "best_channels").slice(0, 7);
  const topLiked = countList(filtered, "liked_activities").slice(0, 5);

  const maxHelp = Math.max(1, ...topHelp.map((x) => x[1]));
  const maxChannel = Math.max(1, ...topChannels.map((x) => x[1]));

  const lowScores = filtered.filter(
    (r) => Number(r.marketing_score) <= 5
  ).length;

  const thisWeek = rows.filter(
    (r) =>
      Date.now() - new Date(r.created_at).getTime() <=
      7 * 24 * 60 * 60 * 1000
  ).length;

  const topNeed = topHelp[0]?.[0] || "Hali yetarli ma’lumot yo‘q";
  const topChannel =
    topChannels[0]?.[0] || "Hali yetarli ma’lumot yo‘q";

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
  }

  if (loading) {
    return (
      <main className="admin-shell">
        <div className="loading-box">
          <div className="spinner" />
          <strong>Dashboard yuklanmoqda...</strong>
        </div>
      </main>
    );
  }

  return (
    <main className="admin-shell">
      <header className="admin-top">
        <div>
          <div className="brand-lockup">
            <div className="brand-mark">◔</div>
            <div className="brand-word">aloo</div>
          </div>
          <div className="admin-brand-sub">Marketing Intelligence</div>
        </div>

        <div className="admin-actions">
          <button className="ghost-btn" onClick={load}>
            Yangilash
          </button>
          <button
            className="ghost-btn"
            onClick={() => exportCSV(filtered)}
          >
            CSV eksport
          </button>
          <button className="dark-btn" onClick={logout}>
            Chiqish
          </button>
        </div>
      </header>

      <section className="admin-heading">
        <div>
          <div className="eyebrow">ALOO MARKETING FEEDBACK</div>
          <h1>Filiallar fikri va marketing ehtiyojlari</h1>
          <p>
            Xodimlar feedback’i asosida qaysi filialga qanday marketing
            yordami kerakligini bir joyda kuzating.
          </p>
        </div>
      </section>

      <section className="filter-panel">
        <div className="filter-field">
          <span>Filial</span>
          <select value={branch} onChange={(e) => setBranch(e.target.value)}>
            {branches.map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </div>

        <div className="filter-field">
          <span>Lavozim</span>
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            {roles.map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </div>

        <div className="filter-field">
          <span>Davr</span>
          <select
            value={datePreset}
            onChange={(e) =>
              setDatePreset(e.target.value as DatePreset)
            }
          >
            <option value="all">Barcha vaqt</option>
            <option value="7">Oxirgi 7 kun</option>
            <option value="30">Oxirgi 30 kun</option>
            <option value="90">Oxirgi 90 kun</option>
          </select>
        </div>

        <div className="filter-field search-field">
          <span>Qidiruv</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Kamchilik, g‘oya, yordam..."
          />
        </div>
      </section>

      {error && <div className="form-message error">{error}</div>}

      <section className="kpi-grid kpi-grid-pro">
        <div className="kpi-card">
          <span>Jami javob</span>
          <strong>{filtered.length}</strong>
          <small>tanlangan filtr bo‘yicha</small>
        </div>

        <div className="kpi-card">
          <span>O‘rtacha marketing bahosi</span>
          <strong>
            {avgScore}
            <small>/10</small>
          </strong>
          <small>{lowScores} ta past baho (1–5)</small>
        </div>

        <div className="kpi-card">
          <span>Yordam yetarli</span>
          <strong>{pct(support.Ha, filtered.length)}%</strong>
          <small>{support.Ha} ta “Ha” javobi</small>
        </div>

        <div className="kpi-card">
          <span>Oxirgi 7 kun</span>
          <strong>{thisWeek}</strong>
          <small>yangi feedback</small>
        </div>
      </section>

      <section className="insight-grid">
        <div className="insight-card">
          <span className="insight-label">ASOSIY EHTIYOJ</span>
          <h3>{topNeed}</h3>
          <p>
            Hozir filiallardan eng ko‘p so‘ralayotgan marketing yordami.
          </p>
        </div>

        <div className="insight-card">
          <span className="insight-label">ENG KUCHLI KANAL</span>
          <h3>{topChannel}</h3>
          <p>
            Xodimlar fikriga ko‘ra, mijoz olib kelishda eng samarali kanal.
          </p>
        </div>

        <div className="insight-card">
          <span className="insight-label">RISK SIGNALI</span>
          <h3>{support["Yo‘q"]} ta filial fikri</h3>
          <p>
            Marketing yordami yetarli emas deb hisoblagan javoblar soni.
          </p>
        </div>
      </section>

      <section className="chart-grid">
        <div className="panel">
          <div className="panel-head">
            <div>
              <span className="panel-kicker">TALAB</span>
              <h3>Eng ko‘p so‘ralgan marketing yordami</h3>
            </div>
            <span>{branch}</span>
          </div>

          <div className="bars">
            {topHelp.length ? (
              topHelp.map(([label, value]) => (
                <div className="bar-item" key={label}>
                  <div className="bar-label">
                    <span>{label}</span>
                    <b>{value}</b>
                  </div>
                  <div className="bar-track">
                    <div
                      className="bar-fill"
                      style={{
                        width: `${(value / maxHelp) * 100}%`
                      }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="empty">Hali ma’lumot yo‘q</div>
            )}
          </div>
        </div>

        <div className="panel">
          <div className="panel-head">
            <div>
              <span className="panel-kicker">KANALLAR</span>
              <h3>Eng samarali deb hisoblangan kanallar</h3>
            </div>
            <span>{branch}</span>
          </div>

          <div className="bars">
            {topChannels.length ? (
              topChannels.map(([label, value]) => (
                <div className="bar-item" key={label}>
                  <div className="bar-label">
                    <span>{label}</span>
                    <b>{value}</b>
                  </div>
                  <div className="bar-track">
                    <div
                      className="bar-fill"
                      style={{
                        width: `${(value / maxChannel) * 100}%`
                      }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="empty">Hali ma’lumot yo‘q</div>
            )}
          </div>
        </div>
      </section>

      <section className="chart-grid chart-grid-secondary">
        <div className="panel">
          <div className="panel-head">
            <div>
              <span className="panel-kicker">SUPPORT</span>
              <h3>Marketing yordami bahosi</h3>
            </div>
          </div>

          <div className="support-list">
            {[
              ["Ha", support.Ha],
              ["Qisman", support.Qisman],
              ["Yo‘q", support["Yo‘q"]]
            ].map(([label, value]) => (
              <div className="support-row" key={String(label)}>
                <span>{label}</span>
                <div className="support-track">
                  <div
                    className="support-fill"
                    style={{
                      width: `${pct(
                        Number(value),
                        filtered.length
                      )}%`
                    }}
                  />
                </div>
                <b>{pct(Number(value), filtered.length)}%</b>
              </div>
            ))}
          </div>
        </div>

        <div className="panel">
          <div className="panel-head">
            <div>
              <span className="panel-kicker">YOQAYOTGAN ISHLAR</span>
              <h3>Nimani davom ettirish kerak?</h3>
            </div>
          </div>

          <div className="tag-cloud">
            {topLiked.length ? (
              topLiked.map(([label, value]) => (
                <span key={label} className="metric-tag">
                  {label}
                  <b>{value}</b>
                </span>
              ))
            ) : (
              <div className="empty">Hali ma’lumot yo‘q</div>
            )}
          </div>
        </div>
      </section>

      <section className="panel responses-panel">
        <div className="panel-head">
          <div>
            <span className="panel-kicker">RAW FEEDBACK</span>
            <h3>Javoblar</h3>
          </div>
          <span>{filtered.length} ta</span>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Filial</th>
                <th>Lavozim</th>
                <th>Baho</th>
                <th>Support</th>
                <th>Eng katta kamchilik</th>
                <th>Bizdan kutgan yordami</th>
                <th>Sana</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id}>
                  <td>
                    <b>{r.branch}</b>
                  </td>
                  <td>{r.role}</td>
                  <td>
                    <span className="score-mini">
                      {r.marketing_score}/10
                    </span>
                  </td>
                  <td>
                    <span
                      className={`status-pill status-${r.support_level
                        .toLowerCase()
                        .replace("‘", "")}`}
                    >
                      {r.support_level}
                    </span>
                  </td>
                  <td className="wide-cell">
                    {r.biggest_problem || "—"}
                  </td>
                  <td className="wide-cell">
                    {r.exact_help || "—"}
                  </td>
                  <td>
                    {new Date(r.created_at).toLocaleDateString(
                      "uz-UZ"
                    )}
                  </td>
                  <td>
                    <button
                      className="table-action"
                      onClick={() => setSelected(r)}
                    >
                      Ko‘rish
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {!filtered.length && (
            <div className="empty">
              Tanlangan filtr bo‘yicha javob topilmadi.
            </div>
          )}
        </div>
      </section>

      {selected && (
        <div
          className="modal-backdrop"
          onClick={() => setSelected(null)}
        >
          <div
            className="response-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-head">
              <div>
                <span className="panel-kicker">TO‘LIQ JAVOB</span>
                <h2>{selected.branch}</h2>
                <p>
                  {selected.role} ·{" "}
                  {new Date(selected.created_at).toLocaleString(
                    "uz-UZ"
                  )}
                </p>
              </div>
              <button
                className="modal-close"
                onClick={() => setSelected(null)}
              >
                ×
              </button>
            </div>

            <div className="response-grid">
              <div>
                <span>Marketing bahosi</span>
                <strong>{selected.marketing_score}/10</strong>
              </div>
              <div>
                <span>Marketing yordami</span>
                <strong>{selected.support_level}</strong>
              </div>
            </div>

            {[
              ["Eng katta kamchilik", selected.biggest_problem],
              ["Mijozlardan eshitilgan fikr", selected.customer_feedback],
              ["Raqobatchidan olingan g‘oya", selected.competitor_idea],
              ["Bitta marketing harakati", selected.one_action],
              ["+ Yaxshi tomon", selected.plus_feedback],
              ["− Yaxshilash kerak", selected.minus_feedback],
              ["Bizdan aniq kutayotgan yordam", selected.exact_help]
            ].map(([label, value]) => (
              <div className="response-block" key={label}>
                <span>{label}</span>
                <p>{value || "—"}</p>
              </div>
            ))}

            <div className="response-block">
              <span>Kerakli yordamlar</span>
              <div className="tag-cloud">
                {(selected.needed_help || []).map((x) => (
                  <span className="metric-tag" key={x}>
                    {x}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
