# ALOO Marketing Feedback — Railway PostgreSQL edition

Bu versiyada **Supabase butunlay olib tashlangan**.

## Ishlatiladigan servislar

- Next.js — sayt va admin
- Railway — hosting
- Railway PostgreSQL — barcha survey javoblari
- GitHub — kod

## Railway Variables

App service ichida quyidagi 4 ta variable bo‘lishi kerak:

```env
DATABASE_URL=Railway PostgreSQL connection URL
ADMIN_EMAIL=marketing@aloo.uz
ADMIN_PASSWORD=KUCHLI_PAROL
SESSION_SECRET=UZUN_TASODIFIY_SECRET
```

Railway PostgreSQL service'dagi `DATABASE_URL` ni web/app service'ga **Reference** qilib ulang.

Masalan Railway Variables UI orqali:
- New Variable / Add Reference
- PostgreSQL service
- `DATABASE_URL`

`SESSION_SECRET` uchun kamida 32+ belgili tasodifiy matn ishlating.

## Database jadvali

Alohida migration shart emas.

Birinchi survey yuborilganda yoki admin ma'lumotni ochganda sayt `feedback_responses` jadvalini avtomatik yaratadi.

`sql/schema.sql` faqat qo‘lda yaratmoqchi bo‘lsangiz qo‘shilgan.

## URL

- `/` — anonim so‘rovnoma
- `/admin/login` — admin login
- `/admin` — statistika
- admin ichida CSV eksport mavjud

## Deploy

```bash
npm install
npm run build
npm start
```

Railway uchun `railway.toml` tayyor.

## Muhim

Bu loyiha uchun endi:
- SUPABASE_URL kerak emas
- SUPABASE_ANON_KEY kerak emas
- Supabase account kerak emas
