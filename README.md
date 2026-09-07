# ALOO Marketing Feedback v4 ENTERPRISE

ALOO filiallari uchun professional ichki marketing feedback tizimi.

## Asosiy qismlar

### Xodimlar uchun
- 4 bosqichli premium survey
- filiallar standart ro‘yxati
- lavozim tanlash
- 1–10 marketing bahosi
- multi-select marketing kanallari
- + / − feedback
- filial uchun aniq yordam so‘rovi
- anonim
- responsive
- spam rate-limit
- bot honeypot

### Admin uchun
- professional Marketing Intelligence dashboard
- filial filter
- lavozim filter
- 7 / 30 / 90 kun filter
- matn bo‘yicha qidiruv
- jami javob
- o‘rtacha marketing bahosi
- support %
- oxirgi 7 kundagi feedback
- asosiy ehtiyoj insight
- eng kuchli reklama kanali
- risk signali
- top marketing yordamlar
- top marketing kanallari
- support distribution
- eng yoqayotgan marketing ishlari
- CSV eksport
- individual javobni modal oynada to‘liq ko‘rish

## Stack

- Next.js 14
- Railway
- Railway PostgreSQL
- Dockerfile
- custom secure admin session
- Supabase yo‘q

## Railway Variables

```env
DATABASE_URL=${{Postgres.DATABASE_URL}}
ADMIN_EMAIL=marketing@aloo.uz
ADMIN_PASSWORD=KUCHLI_PAROL
SESSION_SECRET=KAMIDA_32_BELGILI_MAXFIY_KOD
DB_SSL=false
DB_POOL_MAX=10
```

## Endpointlar

- `/` — survey
- `/admin/login` — admin login
- `/admin` — dashboard
- `/health` — Railway healthcheck
- `/api/health` — app health
- `/api/health/db` — PostgreSQL diagnostika

## Deploy

1. ZIP ichidagi fayllarni GitHub repository'ga yuklang.
2. Railway app service repository bilan bog‘langan bo‘lsin.
3. PostgreSQL service mavjud bo‘lsin.
4. `DATABASE_URL` ni PostgreSQL service'dan Reference Variable qiling.
5. `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `SESSION_SECRET` kiriting.
6. Redeploy.

Railway healthcheck: `/health`
