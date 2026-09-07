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

      if (!response.ok) throw new Error(data.error || "Kirishda xatolik");

      router.replace("/admin");
      router.refresh();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Kirishda xatolik.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="admin-login">
      <div className="login-card">
        <div className="brand-lockup">
          <div className="brand-mark">◔</div>
          <div className="brand-word">aloo</div>
        </div>
        <div className="eyebrow">ADMIN PANEL</div>
        <h1>Marketing statistikasi</h1>
        <p>Faqat ruxsat berilgan xodimlar uchun.</p>

        <form onSubmit={submit}>
          <label>
            Email
            <input type="email" value={email}
              onChange={(e) => setEmail(e.target.value)} required />
          </label>
          <label>
            Parol
            <input type="password" value={password}
              onChange={(e) => setPassword(e.target.value)} required />
          </label>
          {error && <div className="form-message error">{error}</div>}
          <button className="primary-btn" disabled={loading}>
            {loading ? "Kirilmoqda..." : "Kirish"}
          </button>
        </form>
      </div>
    </main>
  );
}
