"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) router.replace("/admin");
    });
  }, [router]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError("Email yoki parol noto‘g‘ri.");
      setLoading(false);
      return;
    }

    router.replace("/admin");
    router.refresh();
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
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </label>
          <label>
            Parol
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
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
