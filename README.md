# aloo Marketing Feedback

Filial xodimlaridan anonim marketing/SMM fikrlarini yig‘ish va admin panelda statistikasini ko‘rish uchun GitHub-ready loyiha.

## Tayyor URL struktura

- `https://feedback.aloo.uz/` — xodimlar so‘rovnomasi
- `https://feedback.aloo.uz/admin/login` — admin login
- `https://feedback.aloo.uz/admin` — statistika dashboard

## Imkoniyatlar

- ALOO brendiga mos `#1690F5` dizayn
- Anonim survey
- Filial va lavozim
- 1–10 marketing bahosi
- Multi-select marketing kanallari / yordam turlari
- Ochiq + / − feedback
- Supabase bazasi
- Supabase Auth orqali admin login
- Filial bo‘yicha filter
- Jami javob, o‘rtacha baho, support KPI
- Top marketing yordam ehtiyojlari
- Top reklama kanallari
- Javoblar jadvali
- CSV eksport
- Telefon va desktopga mos responsive UI

## 1. GitHub'ga yuklash

Repo oching va ushbu papkadagi barcha fayllarni push qiling.

```bash
git init
git add .
git commit -m "Initial ALOO marketing feedback"
git branch -M main
git remote add origin https://github.com/USERNAME/aloo-marketing-feedback.git
git push -u origin main
```

## 2. Supabase

1. `https://supabase.com` da loyiha yarating.
2. SQL Editor oching.
3. `supabase/schema.sql` faylidagi SQL'ni to‘liq ishga tushiring.
4. Project Settings → API bo‘limidan:
   - Project URL
   - anon public key
   ni oling.

## 3. Admin yaratish

Supabase → Authentication → Users → Add user.

Masalan:
- email: `marketing@aloo.uz`
- parol: kuchli parol

**Muhim:** bazani o‘qish huquqi faqat Supabase’da authenticated bo‘lgan foydalanuvchilarga berilgan. Admin akkauntlarni faqat ishonchli xodimlarga yarating.

## 4. Environment variables

`.env.example` dan `.env.local` yarating:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

## 5. Lokal ishga tushirish

```bash
npm install
npm run dev
```

Keyin:
- survey: `http://localhost:3000`
- admin: `http://localhost:3000/admin/login`

## 6. Vercel deploy

1. `https://vercel.com` → Add New Project
2. GitHub repository'ni tanlang
3. Environment Variables'ga Supabase qiymatlarini kiriting
4. Deploy

## 7. Domen ulash

Vercel → Project → Settings → Domains.

Tavsiya:
- `feedback.aloo.uz`

DNS'da Vercel ko‘rsatgan CNAME/A record'ni qo‘shing.

Admin alohida subdomen shart emas:
- `feedback.aloo.uz/admin/login`

Agar alohida admin domen istasangiz, masalan `feedback-admin.aloo.uz`, keyin Next.js middleware orqali host bo‘yicha routing qo‘shish mumkin.

## Brand

Asosiy rang: `#1690F5`.

CSS font stack Gilroy'ni birinchi o‘ringa qo‘yadi:
```css
font-family: Gilroy, Inter, system-ui, sans-serif;
```

GitHub repo ichiga litsenziyalangan Gilroy webfontingizni o‘zingiz qo‘shishingiz mumkin. Font fayli bu paketga kiritilmagan.


## Railway

Repository'ni Railway'ga ulang va Environment Variables sifatida quyidagilarni kiriting:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

`railway.toml` tayyor:
- Build: `npm run build`
- Start: `npm start`
- Healthcheck: `/`

Ushbu v1.0.1 versiyada Railway build'dagi `MapIterator` / TypeScript ES5 xatosi tuzatilgan.
