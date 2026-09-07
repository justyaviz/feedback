"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { FeedbackResponse } from "../lib/types";

function countList(rows: FeedbackResponse[], key: "liked_activities" | "best_channels" | "needed_help") {
  const map = new Map<string, number>();
  rows.forEach((r) => {
    (r[key] || []).forEach((item) => map.set(item, (map.get(item) || 0) + 1));
  });
  return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
}

function exportCSV(rows: FeedbackResponse[]) {
  const headers = [
    "Filial", "Lavozim", "Ball", "Yoqtirgan ishlar", "Kamchilik",
    "Eng yaxshi kanallar", "Yordam darajasi", "Kerakli yordam",
    "Mijoz fikri", "Raqobatchi g‘oya", "Bitta harakat",
    "Plus", "Minus", "Aniq yordam", "Sana"
  ];

  const data = rows.map((r) => [
    r.branch, r.role, r.marketing_score, (r.liked_activities || []).join(" | "),
    r.biggest_problem, (r.best_channels || []).join(" | "), r.support_level,
    (r.needed_help || []).join(" | "), r.customer_feedback, r.competitor_idea,
    r.one_action, r.plus_feedback, r.minus_feedback, r.exact_help,
    new Date(r.created_at).toLocaleString("uz-UZ")
  ]);

  const csv = [headers, ...data]
    .map((row) => row.map((v) => `"${String(v ?? "").replaceAll('"', '""')}"`).join(","))
    .join("\n");

  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "aloo-marketing-feedback.csv";
  a.click();
  URL.revokeObjectURL(url);
}

export default function AdminDashboard() {
  const router = useRouter();
  const [rows, setRows] = useState<FeedbackResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [branch, setBranch] = useState("Barchasi");
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/responses", { cache: "no-store" });

      if (response.status === 401) {
        router.replace("/admin/login");
        return;
      }

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Ma’lumotlarni olib bo‘lmadi.");

      setRows((data.rows || []) as FeedbackResponse[]);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Server xatosi.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const branches = useMemo(
    () => ["Barchasi", ...Array.from(new Set(rows.map((r) => r.branch))).sort()],
    [rows]
  );

  const filtered = useMemo(
    () => branch === "Barchasi" ? rows : rows.filter((r) => r.branch === branch),
    [rows, branch]
  );

  const avgScore = filtered.length
    ? (filtered.reduce((s, r) => s + Number(r.marketing_score || 0), 0) / filtered.length).toFixed(1)
    : "0";

  const support = useMemo(() => {
    const out = { Ha: 0, Qisman: 0, "Yo‘q": 0 };
    filtered.forEach((r) => {
      if (r.support_level in out) out[r.support_level as keyof typeof out] += 1;
    });
    return out;
  }, [filtered]);

  const topHelp = countList(filtered, "needed_help").slice(0, 6);
  const topChannels = countList(filtered, "best_channels").slice(0, 6);
  const maxHelp = Math.max(1, ...topHelp.map((x) => x[1]));
  const maxChannel = Math.max(1, ...topChannels.map((x) => x[1]));

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
  }

  if (loading) {
    return <main className="admin-shell"><div className="loading-box">Ma’lumotlar yuklanmoqda...</div></main>;
  }

  return (
    <main className="admin-shell">
      <header className="admin-top">
        <div className="brand-lockup">
          <div className="brand-mark">◔</div>
          <div className="brand-word">aloo</div>
        </div>
        <div className="admin-actions">
          <select value={branch} onChange={(e) => setBranch(e.target.value)}>
            {branches.map((x) => <option key={x}>{x}</option>)}
          </select>
          <button className="ghost-btn" onClick={load}>Yangilash</button>
          <button className="ghost-btn" onClick={() => exportCSV(filtered)}>CSV</button>
          <button className="dark-btn" onClick={logout}>Chiqish</button>
        </div>
      </header>

      <section className="admin-heading">
        <div>
          <div className="eyebrow">MARKETING DASHBOARD</div>
          <h1>Filiallar fikri va ehtiyojlari</h1>
          <p>Filial kesimida real feedback va marketing yordamiga talab.</p>
        </div>
      </section>

      {error && <div className="form-message error">{error}</div>}

      <section className="kpi-grid">
        <div className="kpi-card"><span>Jami javob</span><strong>{filtered.length}</strong></div>
        <div className="kpi-card"><span>O‘rtacha baho</span><strong>{avgScore}<small>/10</small></strong></div>
        <div className="kpi-card"><span>Yordam yetarli</span><strong>{support.Ha}</strong></div>
        <div className="kpi-card"><span>Yordam yetarli emas</span><strong>{support["Yo‘q"]}</strong></div>
      </section>

      <section className="chart-grid">
        <div className="panel">
          <div className="panel-head"><h3>Eng ko‘p so‘ralgan marketing yordami</h3><span>{branch}</span></div>
          <div className="bars">
            {topHelp.length ? topHelp.map(([label, value]) => (
              <div className="bar-item" key={label}>
                <div className="bar-label"><span>{label}</span><b>{value}</b></div>
                <div className="bar-track"><div className="bar-fill" style={{ width: `${(value / maxHelp) * 100}%` }} /></div>
              </div>
            )) : <div className="empty">Hali ma’lumot yo‘q</div>}
          </div>
        </div>

        <div className="panel">
          <div className="panel-head"><h3>Eng samarali deb hisoblangan kanallar</h3><span>{branch}</span></div>
          <div className="bars">
            {topChannels.length ? topChannels.map(([label, value]) => (
              <div className="bar-item" key={label}>
                <div className="bar-label"><span>{label}</span><b>{value}</b></div>
                <div className="bar-track"><div className="bar-fill" style={{ width: `${(value / maxChannel) * 100}%` }} /></div>
              </div>
            )) : <div className="empty">Hali ma’lumot yo‘q</div>}
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="panel-head"><h3>Oxirgi javoblar</h3><span>{filtered.length} ta</span></div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Filial</th><th>Lavozim</th><th>Baho</th><th>Yordam</th>
                <th>Eng katta kamchilik</th><th>Bizdan kutgan yordami</th><th>Sana</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id}>
                  <td><b>{r.branch}</b></td>
                  <td>{r.role}</td>
                  <td><span className="score-mini">{r.marketing_score}/10</span></td>
                  <td>{r.support_level}</td>
                  <td className="wide-cell">{r.biggest_problem || "—"}</td>
                  <td className="wide-cell">{r.exact_help || "—"}</td>
                  <td>{new Date(r.created_at).toLocaleDateString("uz-UZ")}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!filtered.length && <div className="empty">Javoblar hali kelmagan.</div>}
        </div>
      </section>
    </main>
  );
}
