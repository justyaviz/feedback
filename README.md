# ALOO Marketing Feedback v3 PRO

Railway + Railway PostgreSQL uchun production-ready feedback va admin statistikasi.

## Stack

- Next.js 14
- Railway
- Railway PostgreSQL
- Dockerfile deploy
- Custom admin auth
- Supabase yo‘q

## URL'lar

- `/` — anonim filial so‘rovnomasi
- `/admin/login` — admin login
- `/admin` — dashboard
- `/health` — Railway healthcheck
- `/api/health` — app health
- `/api/health/db` — PostgreSQL diagnostika

## Railway Variables

```env
DATABASE_URL=${{Postgres.DATABASE_URL}}
ADMIN_EMAIL=marketing@aloo.uz
ADMIN_PASSWORD=KUCHLI_PAROL
SESSION_SECRET=KAMIDA_32_BELGILI_MAXFIY_KOD
DB_SSL=false
DB_POOL_MAX=10
```

`DATABASE_URL` ni Railway PostgreSQL service'dan Reference Variable qilib ulang.

## Kuchaytirilgan joylar

- healthcheck DB'dan mustaqil
- alohida DB diagnostika endpoint
- PostgreSQL connection retry
- configurable connection pool
- schema avtomatik yaratiladi
- admin session HMAC bilan imzolanadi
- HttpOnly cookie
- login rate limit
- survey spam rate limit
- honeypot bot himoyasi
- security headers
- CSV export
- filial filter
- admin dashboard
- Supabase dependency butunlay yo‘q

## Railway deploy

1. GitHub'ga barcha fayllarni push qiling.
2. Railway app service'ni repo bilan ulang.
3. PostgreSQL service yarating yoki mavjudini ishlating.
4. App Variables'ga yuqoridagi qiymatlarni kiriting.
5. `DATABASE_URL` ni Postgres service'dan Reference qiling.
6. Redeploy.

Railway healthcheck path: `/health`

## Diagnostika

Deploy'dan keyin:

- `https://DOMAIN/health` → app ishlayaptimi
- `https://DOMAIN/api/health/db` → database ishlayaptimi

`/health` 200 qaytib, `/api/health/db` 503 qaytarsa, muammo faqat `DATABASE_URL` yoki PostgreSQL ulanishida.
