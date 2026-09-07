"use client";

import { FormEvent, useMemo, useState } from "react";
import { BRANCHES, ROLES } from "../lib/options";

const likedOptions = [
  "Instagram / Reels",
  "Aksiyalar",
  "Banner va dizaynlar",
  "Target reklama",
  "Telegram reklamalari",
  "Influencerlar",
  "Tashqi reklama",
  "Kontent sifati"
];

const channelOptions = [
  "Narx / chegirma reklamasi",
  "Nasiya takliflari",
  "Video / Reels",
  "Mahalliy target",
  "Blogerlar",
  "Telegram kanallar",
  "Tashqi reklama",
  "Aksiya va sovg‘alar"
];

const helpOptions = [
  "Ko‘proq target reklama",
  "Filial uchun alohida Reels",
  "Mahalliy aksiyalar",
  "Banner / plakatlar",
  "Blogerlar bilan reklama",
  "Mahalliy Telegram kanallarida reklama",
  "Sotuv uchun tayyor kontent",
  "Filialni Instagramda ko‘proq ko‘rsatish"
];

type FormData = {
  branch: string;
  other_branch: string;
  role: string;
  marketing_score: number;
  liked_activities: string[];
  biggest_problem: string;
  best_channels: string[];
  support_level: string;
  needed_help: string[];
  customer_feedback: string;
  competitor_idea: string;
  one_action: string;
  plus_feedback: string;
  minus_feedback: string;
  exact_help: string;
  website: string;
};

const initial: FormData = {
  branch: "",
  other_branch: "",
  role: "",
  marketing_score: 8,
  liked_activities: [],
  biggest_problem: "",
  best_channels: [],
  support_level: "",
  needed_help: [],
  customer_feedback: "",
  competitor_idea: "",
  one_action: "",
  plus_feedback: "",
  minus_feedback: "",
  exact_help: "",
  website: ""
};

function CheckboxGroup({
  options,
  value,
  onChange
}: {
  options: string[];
  value: string[];
  onChange: (next: string[]) => void;
}) {
  return (
    <div className="check-grid">
      {options.map((option) => {
        const active = value.includes(option);
        return (
          <button
            type="button"
            key={option}
            className={`check-chip ${active ? "active" : ""}`}
            onClick={() =>
              onChange(
                active
                  ? value.filter((x) => x !== option)
                  : [...value, option]
              )
            }
          >
            <span className="check-box">{active ? "✓" : ""}</span>
            <span>{option}</span>
          </button>
        );
      })}
    </div>
  );
}

const sections = [
  "Siz haqingizda",
  "Marketing bahosi",
  "Filial ehtiyoji",
  "Ochiq fikr"
];

export default function SurveyForm() {
  const [form, setForm] = useState<FormData>(initial);
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  const normalizedBranch =
    form.branch === "Boshqa" ? form.other_branch.trim() : form.branch;

  const canSubmit = useMemo(
    () =>
      Boolean(
        normalizedBranch &&
          form.role &&
          form.support_level &&
          form.exact_help.trim()
      ),
    [normalizedBranch, form.role, form.support_level, form.exact_help]
  );

  const set = <K extends keyof FormData>(key: K, value: FormData[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!canSubmit || status === "loading") return;

    setStatus("loading");
    setMessage("");

    try {
      const payload = {
        ...form,
        branch: normalizedBranch
      };

      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Xatolik yuz berdi.");
      }

      setStatus("done");
      setMessage("Rahmat! Fikringiz muvaffaqiyatli qabul qilindi.");
      setForm(initial);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      setStatus("error");
      setMessage(
        error instanceof Error ? error.message : "Xatolik yuz berdi."
      );
    }
  }

  return (
    <form onSubmit={submit} className="survey">
      <div className="survey-progress" aria-label="So‘rovnoma bo‘limlari">
        {sections.map((label, i) => (
          <div className="progress-item" key={label}>
            <span>{String(i + 1).padStart(2, "0")}</span>
            <small>{label}</small>
          </div>
        ))}
      </div>

      <section className="form-card">
        <div className="section-kicker">
          <span className="section-no">01</span>
          <span>Profil</span>
        </div>
        <h2>Siz haqingizda</h2>
        <p className="section-desc">
          Filial kesimida to‘g‘ri tahlil qilishimiz uchun ushbu ma’lumotlar kerak.
        </p>

        <label>
          Qaysi filialda ishlaysiz? <b>*</b>
          <select
            value={form.branch}
            onChange={(e) => set("branch", e.target.value)}
            required
          >
            <option value="">Filialni tanlang</option>
            {BRANCHES.map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </label>

        {form.branch === "Boshqa" && (
          <label>
            Filial nomini kiriting <b>*</b>
            <input
              value={form.other_branch}
              onChange={(e) => set("other_branch", e.target.value)}
              placeholder="Filial nomi"
              required
            />
          </label>
        )}

        <label>
          Lavozimingiz <b>*</b>
          <select
            value={form.role}
            onChange={(e) => set("role", e.target.value)}
            required
          >
            <option value="">Lavozimni tanlang</option>
            {ROLES.map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </label>
      </section>

      <section className="form-card">
        <div className="section-kicker">
          <span className="section-no">02</span>
          <span>Baholash</span>
        </div>
        <h2>Marketing ishlarini baholang</h2>
        <p className="section-desc">
          Siz ko‘rayotgan real natija va filialdagi taassurotga qarab baholang.
        </p>

        <label>
          Umumiy baho
          <div className="score-row">
            <input
              type="range"
              min="1"
              max="10"
              value={form.marketing_score}
              onChange={(e) =>
                set("marketing_score", Number(e.target.value))
              }
            />
            <div className="score-badge">{form.marketing_score}/10</div>
          </div>
          <div className="score-labels">
            <span>Juda sust</span>
            <span>Juda yaxshi</span>
          </div>
        </label>

        <label>
          Sizga eng yoqayotgan marketing ishlari
          <CheckboxGroup
            options={likedOptions}
            value={form.liked_activities}
            onChange={(v) => set("liked_activities", v)}
          />
        </label>

        <label>
          Sizningcha, marketingdagi eng katta kamchilik nima?
          <textarea
            value={form.biggest_problem}
            onChange={(e) => set("biggest_problem", e.target.value)}
            placeholder="Masalan: filialga yetarli target ajratilmayapti, mahalliy kontent kam..."
          />
        </label>
      </section>

      <section className="form-card">
        <div className="section-kicker">
          <span className="section-no">03</span>
          <span>Ehtiyoj</span>
        </div>
        <h2>Filialingizga nima ko‘proq ishlaydi?</h2>
        <p className="section-desc">
          Bu bo‘lim kelgusi marketing resurslarini filiallar bo‘yicha to‘g‘ri taqsimlashga yordam beradi.
        </p>

        <label>
          Qaysi reklama turlari ko‘proq mijoz olib keladi?
          <CheckboxGroup
            options={channelOptions}
            value={form.best_channels}
            onChange={(v) => set("best_channels", v)}
          />
        </label>

        <label>
          Marketing tomonidan filialingizga yetarlicha yordam berilyaptimi? <b>*</b>
          <div className="radio-row">
            {["Ha", "Qisman", "Yo‘q"].map((x) => (
              <button
                type="button"
                key={x}
                className={`radio-btn ${
                  form.support_level === x ? "active" : ""
                }`}
                onClick={() => set("support_level", x)}
              >
                {x}
              </button>
            ))}
          </div>
        </label>

        <label>
          Filialingizga eng ko‘p qanday yordam kerak?
          <CheckboxGroup
            options={helpOptions}
            value={form.needed_help}
            onChange={(v) => set("needed_help", v)}
          />
        </label>
      </section>

      <section className="form-card">
        <div className="section-kicker">
          <span className="section-no">04</span>
          <span>Feedback</span>
        </div>
        <h2>Ochiq fikringiz</h2>
        <p className="section-desc">
          Eng foydali javoblar aynan shu bo‘limdan chiqadi. Bemalol va ochiq yozing.
        </p>

        <label>
          Mijozlardan marketing yoki reklama bo‘yicha qanday fikr eshitasiz?
          <textarea
            value={form.customer_feedback}
            onChange={(e) => set("customer_feedback", e.target.value)}
          />
        </label>

        <label>
          Raqobatchilarda ko‘rib, “bizda ham bo‘lsa yaxshi edi” degan g‘oya bormi?
          <textarea
            value={form.competitor_idea}
            onChange={(e) => set("competitor_idea", e.target.value)}
          />
        </label>

        <label>
          Sotuvni oshirish uchun hozir bitta marketing ishini qilsangiz, nima qilardingiz?
          <textarea
            value={form.one_action}
            onChange={(e) => set("one_action", e.target.value)}
          />
        </label>

        <div className="two-col">
          <label>
            + Yaxshi tomon
            <textarea
              value={form.plus_feedback}
              onChange={(e) => set("plus_feedback", e.target.value)}
              placeholder="Nimani davom ettirishimiz kerak?"
            />
          </label>

          <label>
            − Yaxshilash kerak
            <textarea
              value={form.minus_feedback}
              onChange={(e) => set("minus_feedback", e.target.value)}
              placeholder="Nimani o‘zgartirish kerak?"
            />
          </label>
        </div>

        <label>
          Filialingiz uchun bizdan aynan qanday yordam kutyapsiz? <b>*</b>
          <textarea
            value={form.exact_help}
            onChange={(e) => set("exact_help", e.target.value)}
            required
            placeholder="Masalan: oyiga 2 ta mahalliy Reels + mahalliy target + filial uchun aksiya..."
          />
        </label>
      </section>

      <div className="hp-field" aria-hidden="true">
        <label>
          Website
          <input
            tabIndex={-1}
            autoComplete="off"
            value={form.website}
            onChange={(e) => set("website", e.target.value)}
          />
        </label>
      </div>

      <div className="submit-wrap">
        <button
          className="primary-btn primary-btn-lg"
          disabled={!canSubmit || status === "loading"}
        >
          {status === "loading" ? "Yuborilmoqda..." : "Fikrni yuborish"}
        </button>

        {message && (
          <div className={`form-message ${status}`}>{message}</div>
        )}

        <p className="privacy-note">
          Ism-familiya so‘ralmaydi. Javoblar ALOO marketing ishlarini yaxshilash uchun tahlil qilinadi.
        </p>
      </div>
    </form>
  );
}
