"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Kirishda xatolik.");
      }

      router.replace("/admin");
      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Kirishda xatolik."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="admin-login admin-login-pro">
      <div className="login-shell">
        <section className="login-visual">
          <div className="brand-lockup">
            <div className="brand-mark">◔</div>
            <div className="brand-word">aloo</div>
          </div>

          <div className="login-visual-copy">
            <span className="eyebrow">MARKETING INTELLIGENCE</span>
            <h1>Filiallar fikrini qarorga aylantiring.</h1>
            <p>
              Feedback, ehtiyoj, marketing bahosi va filiallar kesimidagi
              muammolar — barchasi bitta dashboard’da.
            </p>
          </div>

          <div className="login-stats">
            <div>
              <strong>1</strong>
              <span>markaziy dashboard</span>
            </div>
            <div>
              <strong>100%</strong>
              <span>filial feedback’i</span>
            </div>
          </div>
        </section>

        <section className="login-card login-card-pro">
          <span className="eyebrow">ADMIN PANEL</span>
          <h2>Xush kelibsiz</h2>
          <p>
            Statistikani ko‘rish uchun administrator akkaunti bilan kiring.
          </p>

          <form onSubmit={submit}>
            <label>
              Email
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="marketing@aloo.uz"
                required
                autoComplete="email"
              />
            </label>

            <label>
              Parol
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                autoComplete="current-password"
              />
            </label>

            {error && (
              <div className="form-message error">{error}</div>
            )}

            <button
              className="primary-btn primary-btn-lg login-submit"
              disabled={loading}
            >
              {loading ? "Kirilmoqda..." : "Dashboard’ga kirish"}
            </button>
          </form>

          <div className="login-security">
            <span>🔒</span>
            <p>
              Sessiya HttpOnly cookie orqali himoyalangan. Login urinishlari
              cheklangan.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
