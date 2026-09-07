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


## Railway build fix v2.1

Bu paket Railway'da Nixpacks o'rniga to'g'ridan-to'g'ri `Dockerfile` builder ishlatadi.
Shuning uchun `UndefinedVar: $NIXPACKS_PATH` kabi Nixpacks generated Dockerfile warninglari chetlab o'tiladi.

App service Variables:
- `DATABASE_URL` -> Railway PostgreSQL service'dan reference
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `SESSION_SECRET`

Railway repo'ni qayta deploy qilganda `railway.toml` Dockerfile builder'ni tanlaydi.


## v2.2
Oldingi GitHub revisionidan qolgan `lib/supabase.ts` ham dependency-siz stub bilan overwrite qilinadi. Asosiy database faqat Railway PostgreSQL.


## v2.3 Railway Healthcheck fix

Railway healthcheck endi `/` sahifani emas, DB va auth'dan mutlaqo mustaqil `/api/health` endpointni tekshiradi.

Railway app service Variables:
- `DATABASE_URL` — PostgreSQL service'dan reference
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `SESSION_SECRET`

App `0.0.0.0` host va Railway bergan `PORT` bilan ishga tushadi.
