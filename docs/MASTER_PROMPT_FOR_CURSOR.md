You are Cursor AI coding assistant for a production-grade MVP with **backend**.

## Product Summary

Build **Trade Card Builder** with accounts, subscriptions and Magic Fill:

- **Photo Fixer** (client): background removal (WASM), resize/crop, compression, EXIF strip, Kaspi-limits.
- **Title & Description Helper**: template from brand/type/model/key spec; bullets; RU/KZ.
- **Category Checklist** presets.
- **Export**: ZIP (images/…), CSV, README.
- **Accounts & Billing**: Google Sign-In, Lemon Squeezy/Paddle/Polar, webhooks, quotas per plan.
- **Magic Fill**: GTIN + OCR + LLM → `ProductDraft` + prefilled form; GTIN cache.

## Architecture & Stack

- Framework: **Next.js (App Router) + TypeScript**.
- UI: Tailwind + shadcn/ui; Forms: RHF + Zod; State: Zustand.
- i18n: RU (default), KZ.
- **Backend in Next API Routes**: auth, billing/webhooks, magic-fill, export (opt), health.
- ORM: **Prisma** (Postgres). Logging: pino. Analytics: Plausible.
- Barcode: ZXing in browser. OCR: tesseract (fallback) or server provider (mock in dev).
- LLM: OpenAI (4o-mini) or equivalent — via server key.

## Repository Layout (suggested)

app/
(marketing)/
(studio)/studio
api/
auth/[...nextauth]/route.ts
webhooks/billing/route.ts
magic-fill/route.ts
product-drafts/route.ts
export/route.ts
health/route.ts
lib/
image/_ # client image utils
csv/_
i18n/_
server/
prisma.ts
env.ts
billing.ts
quota.ts
logger.ts
components/
ui/, studio/
db/
schema.prisma
migrations/_
docs/

## Non-Negotiables (follow **CODE_RULES.md**)

- TS strict, ESLint/Prettier/import-sort. Zod for request/response schemas. No `any`.
- Accessible UI, no layout shift, with skeletons and empty states.
- Client never contains private keys. All secret operations go via API routes.
- E2E criteria: 20 photos (5–15 MB) → < 60 s on a modern laptop; ZIP/CSV correctness.

## Tasks (high-level)

1. **Prisma + DB**: schema, client singleton, migrations.
2. **Auth**: NextAuth (Google) + PrismaAdapter; session JWT.
3. **Billing**: hosted checkout + webhooks; Subscription model.
4. **Quotas**: `assertQuota` + `UsageStat` increments.
5. **Magic Fill API**: Zod I/O, GTIN lookup (cache), OCR, LLM parse, RU/KZ templates, save draft.
6. **Barcode UI**: ZXing modal; on success → call Magic Fill.
7. **Drafts CRUD**: list/edit/update; optimistic UI.
8. **Export (server opt.)**: parity with client ZIP/CSV; only Pro.
9. **Env & Logging**: env validator, pino logger, health route.

## Acceptance Criteria

- Login/logout works; `/api/*` sees `userId`.
- Successful payment → `Subscription.status='active'`, `plan` applied, quotas increased.
- Magic Fill: with GTIN fills ≥ 80% of base fields (brand/type/model/keySpec/title/desc). Warm GTIN → from cache.
- Validations prevent garbage; API returns clear error codes (400/401/402/429/5xx).
- Tests green; CI strict.

## ENV

- `DATABASE_URL`, `NEXTAUTH_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- `BILLING_PROVIDER`, `LEMON_SQUEEZY_*`/`PADDLE_*`/`POLAR_*`
- `OPENAI_API_KEY`
- `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`

## Prompts (LLM)

- **Title RU/KZ**: “Собери краткий, не спамный заголовок: `<type> <brand> <model> <keySpec>`; 60–80 символов; без лишних знаков; язык: RU.”
- **Bullets RU/KZ**: “3–5 буллетов преимуществ для маркетплейса; по 7–11 слов; без обещаний/суперлативов; без ссылок.”
- **Specs parse**: “Извлеки из OCR/текста: brand, type, model, keySpec, attrs{}; верни JSON строго по схеме.”

## Guardrails

- Do not fetch unlicensed product photos from the internet for primary images.
- Lifestyle background is allowed as additional images only (no misleading edits).
- Respect Kaspi photo limits. Never invent non-existent product details.

**Task:** Start with DB/Auth/Billing, then quotas and Magic Fill; later — server-export. Work iteratively and mark each finished step in `DEV_STEPS_FOR_CURSOR.md`.
