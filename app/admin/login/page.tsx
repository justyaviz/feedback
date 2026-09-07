"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabase } from "../../../lib/supabase";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const supabase = await getSupabase();
        const { data } = await supabase.auth.getSession();
        if (mounted && data.session) router.replace("/admin");
      } catch {
        // Login form itself should still render if runtime env is not configured yet.
      }
    })();
    return () => { mounted = false; };
  }, [router]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    let supabase;
    try {
      supabase = await getSupabase();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Database konfiguratsiyasi topilmadi.");
      setLoading(false);
      return;
    }

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
