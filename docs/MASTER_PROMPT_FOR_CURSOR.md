You are Cursor AI coding assistant for a production-grade MVP.

## Product Summary
Build **Kaspi Card Builder**: a web app that prepares product card assets for Kaspi Marketplace:
- **Photo Fixer**: client-side background removal, resize/crop, compression, validation.
- **Title & Description Helper**: template-based title from brand/type/model/specs; short bullets; RU/KZ.
- **Category Checklist**: preset per category with a list of must-have fields to pass moderation.
- **Export**: ZIP (images/…) + CSV + README; file naming per SKU.

Goal: **landing → working studio** in days, easy deploy, low cost.

## Architecture & Stack (Variant A = MVP)
- Framework: **Next.js 14+ (App Router)** + **TypeScript**.
- UI: TailwindCSS + shadcn/ui. Forms: React-Hook-Form + Zod.
- State: Zustand (local), URL params for shareable presets.
- i18n: (RU default, KZ optional).
- Client-side image pipeline:
  - Background removal: `@imgly/background-removal` (WASM/ONNX fallback).
  - Resize/crop/compress: `browser-image-compression` + canvas/Pica.
  - EXIF strip, format: JPEG/WebP.
  - Validation rules: min/max dimension 500–5000 px; ≤25MB; formats JPEG/PNG/WebP.
- Export: `jszip` + `file-saver`.
- Analytics: Plausible.
- Billing: Lemon Squeezy overlay (later; stubbed for MVP).
- Optional Telegram Bot (later): grammY + Next API route.

**Do NOT introduce a backend for heavy processing in MVP.** Keep it client-only first. Add API routes only for health, analytics events, and later billing webhooks.

## Repository Layout
/app
/(marketing)
page.tsx // Landing
/(studio)
studio/page.tsx // Main tool
/api
/health/route.ts
/ls-webhook/route.ts // later
/components
ui/... // shadcn
studio/...
/lib
image/ // client image utils
csv/
i18n/
public/
styles/

## Core Features (MVP)
1) **Landing**
   - Clean hero, 3 bullets (Kaspi-check, Photo Fixer, ZIP/CSV).
   - CTA: Try Free → /studio.
2) **Studio**
   - Left: Dropzone (drag&drop, file list, per-file status).
   - Center: Preview Before/After with adjustable crop box; batch settings (max size edge px, output format).
   - Right: Form for Title helper (Brand, Type, Model, Key Spec) → live title preview; Short bullets template; Category preset checklist with checkboxes.
   - Bottom: Export → generate ZIP (images + README + CSV).
3) **Validation**
   - On import: detect format/size/dimensions; soft warn & suggest fix; block only on hard fails.
   - Strip EXIF.
4) **Export**
   - Naming: `<SKU>_1.jpg`… Provide SKU input or auto-SKU generator.
   - README includes Kaspi tips and which fields to fill in the Kaspi UI.

## UI/UX Guidelines
- Keep 3-pane studio layout; keyboard shortcuts: 1..9 to jump images, `Cmd/Ctrl+S` export.
- Progress bars for batch operations; non-blocking UI.
- Local persistence (Zustand persist) of last session/presets.

## Tech Choices Rationale
- **Next.js** for 1-project deploy (Vercel). All features client-side → zero server cost.
- **WASM background removal** keeps privacy and speed; quality is “good enough” for MVP.
- **CSV/ZIP client** avoids storage/backend complexity.

## Acceptance Criteria
- Upload 20 mixed photos (5–15 MB each) → process < 60s on modern laptop.
- ZIP/CSV downloads correctly; sample imports succeed for test users.
- RU UI fully localized; KZ copy provided (even via stub).

## Later (Variant B)
- Add Redis (Upstash) + BullMQ worker for heavy batches (server).
- Add S3-compatible storage for paid users.
- Add Lemon Squeezy webhooks and gating by plan.

## ENV & Config (for later)
- NEXT_PUBLIC_APP_NAME, NEXT_PUBLIC_PLAUSIBLE_DOMAIN
- LEMONSQUEEZY_API_KEY, LEMONSQUEEZY_STORE_ID (later)
- TELEGRAM_BOT_TOKEN (later)

## Coding Rules (enforced in repo)
- TypeScript strict, ESLint + Prettier + import sorting.
- No any/implicit any; use Zod for user input.
- UI components are accessible (aria-labels, keyboard nav).
- All long-running ops wrapped with toasts and progress.
- Functions small & pure; shared utils in /lib; no “God” components.

**Task**: Start with Landing, then Studio with Photo pipeline, then Title helper + Checklist, then Export.
Deliver production-ready code with tests for core utils.
