"use client";

import { FormEvent, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";

const roles = ["Filial rahbari", "Sotuvchi", "Kassir", "Administrator", "Boshqa"];

const likedOptions = [
  "Instagram / Reels",
  "Aksiyalar",
  "Filial uchun banner va dizaynlar",
  "Target reklama",
  "Telegram reklamalari",
  "Influencerlar bilan reklama",
  "Filial tashqi reklamasi",
  "Kontent sifati"
];

const channelOptions = [
  "Narx / chegirma reklamasi",
  "Nasiya takliflari",
  "Video / Reels",
  "Mahalliy target reklama",
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
  "Filialni ko‘proq Instagramda ko‘rsatish"
];

type FormData = {
  branch: string;
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
};

const initial: FormData = {
  branch: "",
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
  exact_help: ""
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
                active ? value.filter((x) => x !== option) : [...value, option]
              )
            }
          >
            <span className="check-box">{active ? "✓" : ""}</span>
            {option}
          </button>
        );
      })}
    </div>
  );
}

export default function SurveyForm() {
  const [form, setForm] = useState<FormData>(initial);
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  const canSubmit = useMemo(
    () => form.branch.trim() && form.role && form.support_level && form.exact_help.trim(),
    [form]
  );

  const set = <K extends keyof FormData>(key: K, value: FormData[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!canSubmit || status === "loading") return;

    setStatus("loading");
    setMessage("");

    const { error } = await supabase.from("feedback_responses").insert({
      ...form,
      branch: form.branch.trim()
    });

    if (error) {
      setStatus("error");
      setMessage("Xatolik yuz berdi. Internetni tekshirib, yana urinib ko‘ring.");
      return;
    }

    setStatus("done");
    setMessage("Rahmat! Fikringiz qabul qilindi.");
    setForm(initial);
  }

  return (
    <form onSubmit={submit} className="survey">
      <section className="form-card">
        <div className="section-no">01</div>
        <h2>Siz haqingizda</h2>

        <label>
          Qaysi filialda ishlaysiz? <b>*</b>
          <input
            value={form.branch}
            onChange={(e) => set("branch", e.target.value)}
            placeholder="Masalan: Qo‘qon filiali"
            required
          />
        </label>

        <label>
          Lavozimingiz <b>*</b>
          <select value={form.role} onChange={(e) => set("role", e.target.value)} required>
            <option value="">Tanlang</option>
            {roles.map((x) => <option key={x}>{x}</option>)}
          </select>
        </label>
      </section>

      <section className="form-card">
        <div className="section-no">02</div>
        <h2>Hozirgi marketingni baholang</h2>

        <label>
          ALOO marketing ishlarini necha ballga baholaysiz?
          <div className="score-row">
            <input
              type="range"
              min="1"
              max="10"
              value={form.marketing_score}
              onChange={(e) => set("marketing_score", Number(e.target.value))}
            />
            <div className="score-badge">{form.marketing_score}/10</div>
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
          Sizningcha, eng katta kamchilik nima?
          <textarea
            value={form.biggest_problem}
            onChange={(e) => set("biggest_problem", e.target.value)}
            placeholder="Ochiq yozishingiz mumkin..."
          />
        </label>
      </section>

      <section className="form-card">
        <div className="section-no">03</div>
        <h2>Filialingizga nima ko‘proq ishlaydi?</h2>

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
                className={`radio-btn ${form.support_level === x ? "active" : ""}`}
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
        <div className="section-no">04</div>
        <h2>Ochiq fikr</h2>

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
            />
          </label>
          <label>
            − Yaxshilash kerak
            <textarea
              value={form.minus_feedback}
              onChange={(e) => set("minus_feedback", e.target.value)}
            />
          </label>
        </div>

        <label>
          Filialingiz uchun bizdan aynan qanday yordam kutyapsiz? <b>*</b>
          <textarea
            value={form.exact_help}
            onChange={(e) => set("exact_help", e.target.value)}
            required
            placeholder="Bu savol biz uchun eng muhim..."
          />
        </label>
      </section>

      <div className="submit-wrap">
        <button className="primary-btn" disabled={!canSubmit || status === "loading"}>
          {status === "loading" ? "Yuborilmoqda..." : "Fikrni yuborish"}
        </button>
        {message && (
          <div className={`form-message ${status}`}>{message}</div>
        )}
        <p className="privacy-note">
          Ism-familiya so‘ralmaydi. Javoblar marketing ishlarini yaxshilash uchun ishlatiladi.
        </p>
      </div>
    </form>
  );
}
