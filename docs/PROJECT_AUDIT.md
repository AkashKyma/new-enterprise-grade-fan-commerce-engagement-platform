# Fan Platform — Project Audit & Gap Analysis

**Date:** 2026-05-19  
**Scope:** Single-tenant Coxa ID–style fan commerce platform (One Fan = One Identity = One Wallet = One Access)  
**Repo:** `new-enterprise-grade-fan-commerce-engagement-platform`

---

## Executive summary

The agentic build produced a **strong backend data model and API skeleton** across all required domains. Entities, controllers, and services exist for identity, membership/ticketing, F&B POS, retail POS (2 locations + central inventory), marketplace, checkout, loyalty, CDP, personalization, AI concierge, and Brazil adapters (Pix, Gupshup, Zenvia).

**Main gaps today:**

1. **Seven+ modules are not imported in `app.module.ts`** — code exists but routes are unreachable unless pulled in via Concierge’s dependency chain.
2. **External integrations are placeholders** — Pix, WhatsApp outbound, LLM (Gemini), facial recognition.
3. **Frontend** — Next.js app is a dashboard stub; legacy `src/` React pages are not connected.

**Recommended immediate fix:** Wire all modules in `backend/src/modules/app.module.ts` and restart the API.

---

## Target architecture (requirements)

```
Coxa ID = Central Identity Layer (SSO)
  └── One Fan = One Identity = One Wallet = One Access

Connected surfaces:
  • Sócio membership portal
  • Ticketing (+ facial recognition SSO stub)
  • Stadium access / check-in
  • F&B POS + per-outlet inventory
  • Retail POS (2 stores + central inventory)
  • Marketplace (internal + third-party vendors)
  • Checkout (Pix, offline sync)
  • Loyalty ledger
  • CDP + omnichannel (WhatsApp, push, email, SMS)
  • Personalization + AI Concierge
  • Brazil: Pix, Gupshup, Zenvia
```

**Deployment model:** Single-tenant acceptable (not full SaaS multi-tenant required for v1).

---

## Local development ports

| Service   | URL / port        | Notes                          |
|-----------|-------------------|--------------------------------|
| Backend   | `http://localhost:3001` | `PORT` in repo-root `.env` |
| Frontend  | `http://localhost:8844` | `next dev -p 8844`         |
| PostgreSQL| `localhost:5432` (or `5434` per your `.env`) | `fan_platform` DB |
| Paperclip / other tools | 3000, 3002, 8080, 3100 | Do not use for this app |

---

## Module-by-module status

### Module 1 — Identity (Coxa ID / One Identity)

| Feature | Status |
|---------|--------|
| User entity (email, phone, role) | **Done** |
| Customer profile with `traits` (name, CPF, address) | **Done** |
| Identity links to external providers (ticketing, loyalty, marketplace, pos, fr) | **Done** |
| Wallet reference stub | **Done** |
| Membership reference | **Done** |
| Biometric / facial recognition placeholder (`pending` / `enrolled` / `revoked`) | **Done** (stub) |
| JWT sessions table | **Done** |
| Auth module (JWT + Passport + bcrypt) | **Done** (code) |
| Auth loaded in `AppModule` | **Gap** — not imported |
| Real facial recognition provider | **Gap** |

**Paths:** `backend/src/modules/identity/`, `backend/src/modules/auth/`

---

### Module 2 — Membership & Ticketing (Sócio / Coxa strategy)

| Feature | Status |
|---------|--------|
| Membership plans (Bronze / Prata / Ouro style) | **Done** |
| Member subscriptions | **Done** |
| Match events, venue sections, capacity | **Done** |
| Ticket inventory (total / reserved / sold) | **Done** |
| Ticket entitlements per user | **Done** |
| Allocations (sponsor, hospitality, waiting_list, resale_pool) | **Done** |
| Check-in records (gate, device, `fr_ref` in meta) | **Done** |
| Access credential reference for FR | **Done** (stub) |
| Pix on ticket checkout | **Gap** — placeholder Pix adapter |
| Real facial recognition at gate | **Gap** |

**Paths:** `backend/src/modules/membership_ticketing/`

**Note:** Loaded indirectly via `ConciergeModule` imports; should also be top-level in `AppModule` for direct API access.

---

### Module 3 — F&B POS + Inventory

| Feature | Status |
|---------|--------|
| F&B products, outlets / kiosks | **Done** |
| Per-outlet inventory levels | **Done** |
| Stock movements (in / out / adjust) | **Done** |
| POS receipt ingestion (idempotent `externalId`) | **Done** |
| CDP event on sale | **Gap** — documented hook, not wired |
| `FnbPosModule` in `AppModule` | **Gap** |

**Paths:** `backend/src/modules/fnb_pos/`

---

### Module 4 — Retail POS + Central Inventory (2 stores + central)

| Feature | Status |
|---------|--------|
| Retail products + variants | **Done** |
| Store locations + central inventory (`RetailCentralLevel`, `RetailLocationLevel`) | **Done** |
| Stock movements (in / out / adjust / transfer / return) | **Done** |
| POS sale receipts (idempotent) | **Done** |
| Return records | **Done** |
| Loyalty earn on sale | **Gap** |
| `RetailPosModule` in `AppModule` | **Gap** |

**Paths:** `backend/src/modules/retail_pos/`

---

### Module 5 — Marketplace (internal + third-party vendors)

| Feature | Status |
|---------|--------|
| Vendor registry | **Done** |
| Marketplace items (`vendorId` null = internal) | **Done** |
| Cart + cart lines | **Done** |
| Marketplace orders + lines | **Done** |
| Settlement refs per vendor | **Done** |
| Checkout / Pix for marketplace orders | **Gap** — needs checkout wiring |
| Vendor webhook on order | **Gap** |
| `MarketplaceModule` in `AppModule` | **Gap** |

**Paths:** `backend/src/modules/marketplace/`

---

### Module 6 — Checkout & Payments

| Feature | Status |
|---------|--------|
| Orders with lines (`itemType`: ticket, retail, fnb, marketplace, service) | **Done** |
| Payments + payment attempts (audit trail) | **Done** |
| Offline sync (POS / kiosk queue) | **Done** |
| Pix QR generation | **Placeholder** |
| Real Pix provider (Gerencianet, Sicoob, etc.) | **Gap** |
| `CheckoutModule` in `AppModule` | **Gap** (only via Concierge today) |

**Paths:** `backend/src/modules/checkout/`, `backend/src/modules/brazil/pix.adapter.ts`

---

### Module 7 — Loyalty & Rewards Ledger

| Feature | Status |
|---------|--------|
| Loyalty accounts | **Done** |
| Ledger entries (earn / redeem, idempotent) | **Done** |
| Tiers + benefit rules | **Done** |
| Reward catalog + redemptions | **Done** |
| Auto tier upgrade | **Gap** |
| Earn on POS sale | **Gap** |
| Direct exposure in `AppModule` | **Gap** (via Concierge only) |

**Paths:** `backend/src/modules/loyalty/`

---

### Module 8 — CDP (Customer Data Platform) — Omnichannel marketing core

| Feature | Status |
|---------|--------|
| CDP profiles + event stream | **Done** |
| Segments (criteria-based) | **Done** |
| Campaigns + journeys | **Done** |
| Channel templates (whatsapp, push, email, sms) | **Done** |
| Channel dispatch records | **Done** |
| `CdpModule` in `AppModule` | **Gap** |
| Outbound WhatsApp (Gupshup / Zenvia) | **Gap** — inbound webhooks only |

**Paths:** `backend/src/modules/cdp/`

---

### Module 9 — Brazil adapters

| Feature | Status |
|---------|--------|
| Gupshup + Zenvia webhook normalization | **Done** |
| Pix adapter interface + placeholder | **Done** |
| `BrazilModule` in `AppModule` | **Done** |
| Outbound WhatsApp send | **Gap** (README THU-17 deferred) |
| Real Pix credentials / reconciliation | **Gap** |

**Paths:** `backend/src/modules/brazil/`

---

### Module 10 — Personalization engine

| Feature | Status |
|---------|--------|
| Provider abstraction | **Done** |
| Fallback provider (demo offers / rewards / events / blocks) | **Done** |
| APIs: next-best-action, offers, rewards, events, blocks | **Done** |
| `PersonalizationModule` in `AppModule` | **Done** |
| AWS Personalize / Gemini provider | **Gap** — pluggable, not implemented |

**Paths:** `backend/src/modules/personalization/`

---

### Module 11 — AI Concierge

| Feature | Status |
|---------|--------|
| Sessions, messages, tool calls, summaries | **Done** |
| Safe prompt builder | **Done** |
| Lookups: identity, loyalty, ticketing, order status | **Done** (order status partial) |
| `ConciergeModule` in `AppModule` | **Done** |
| Actual LLM call (Gemini / OpenAI) | **Gap** — prompt built, not sent |

**Paths:** `backend/src/modules/concierge/`

---

## `AppModule` wiring (critical)

**Currently imported in `backend/src/modules/app.module.ts`:**

- `HealthModule`
- `PersonalizationModule`
- `ConciergeModule` (pulls in Identity, Loyalty, MembershipTicketing, Checkout)
- `BrazilModule`

**Exist in codebase but NOT top-level in `AppModule`:**

| Module | Path |
|--------|------|
| `AuthModule` | `modules/auth/` |
| `IdentityModule` | `modules/identity/` (partially via Concierge) |
| `LoyaltyModule` | `modules/loyalty/` |
| `MembershipTicketingModule` | `modules/membership_ticketing/` |
| `CheckoutModule` | `modules/checkout/` |
| `MarketplaceModule` | `modules/marketplace/` |
| `CdpModule` | `modules/cdp/` |
| `RetailPosModule` | `modules/retail_pos/` |
| `FnbPosModule` | `modules/fnb_pos/` |

---

## API surface (when fully wired)

### Health
- `GET /health`

### Personalization (live)
- `POST /personalization/next-best-action`
- `GET /personalization/offers?userId=`
- `GET /personalization/rewards?userId=`
- `GET /personalization/events?userId=`
- `GET /personalization/blocks?userId=`

### Concierge (live)
- `POST /concierge/session`
- `POST /concierge/session/:id/message`
- `GET /concierge/session/:id/prompt`
- `GET /concierge/identity/:userId`
- `GET /concierge/loyalty/:userId/balance`
- `GET /concierge/ticket/:userId/eligibility/:eventId`
- `GET /concierge/checkin/:userId/:eventId/:sectionId`
- `GET /concierge/order/:orderId/status`

### Identity (via Concierge import)
- `GET /identity/me`
- `POST /identity/:id/link`

### Loyalty
- `GET /loyalty/:userId/balance`
- `GET /loyalty/:userId/history`
- `POST /loyalty/earn`
- `POST /loyalty/redeem`
- `GET /loyalty/rewards`
- `POST /loyalty/rewards`

### Membership & ticketing
- `POST /membership-ticketing/plan`
- `POST /membership-ticketing/subscribe`
- `POST /membership-ticketing/event`
- `GET /membership-ticketing/eligibility/:userId/:eventId`
- `POST /membership-ticketing/reserve`
- `POST /membership-ticketing/checkin`

### Checkout
- `POST /checkout/order`
- `POST /checkout/order/:orderId/line`
- `POST /checkout/order/:orderId/payment`
- `POST /checkout/payment/:paymentId/pix/charge`
- `POST /checkout/payment/:paymentId/reconcile`
- `POST /checkout/offline/queue`
- `POST /checkout/offline/:id/synced`

### Brazil webhooks
- `POST /webhooks/gupshup`
- `POST /webhooks/zenvia`

### CDP (when wired)
- `POST /cdp/ingest`
- `POST /cdp/segment`
- `GET /cdp/segment/:id/run`
- `POST /cdp/template`
- `POST /cdp/campaign`
- `POST /cdp/campaign/:id/trigger`

### Marketplace / Retail / F&B (when wired)
- See controllers under `marketplace/`, `retail_pos/`, `fnb_pos/`

### Auth (when wired)
- See `auth.controller.ts` (register / login)

---

## Frontend status

| Location | Role | Status |
|----------|------|--------|
| `frontend/pages/index.tsx` | Next.js home / API dashboard | **Active** — fetches live personalization + health |
| `frontend/package.json` | Dev on port **8844** | **Active** |
| `src/App.tsx`, `src/components/*` | Legacy React routes (Home, Profile, Marketplace, SignIn) | **Not connected** to Next.js |
| Root `package.json` | Mixed Nest/Next/Medusa | **Broken install** — do not use |

---

## Environment configuration

**Repo-root `.env` (used by backend via `envFilePath: ['../.env', '.env']`):**

```env
PORT=3001
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=<your-password>
DB_NAME=fan_platform
JWT_SECRET=dev-secret
REDIS_URL=redis://localhost:6379
```

**Optional / placeholders (`.env.example`):**

- `GEMINI_API_KEY` — AI Concierge LLM
- `AWS_*` — Personalize / Pinpoint
- `WHATSAPP_PROVIDER`, `WHATSAPP_API_KEY` — outbound messaging

**Frontend:** `frontend/.env.example` — `NEXT_PUBLIC_API_URL=http://localhost:3001`

---

## Known technical debt (from this session)

1. **CDP / entity files** — Some files had missing string quotes in imports (fixed in `cdp/`).
2. **TypeORM `string | null` columns** — Need explicit `type: 'varchar'` for Postgres (fixed in several entities).
3. **Root `package.json`** — `@novu/node@^0.1.0` and TypeORM peer conflicts; use `backend/` and `frontend/` only.
4. **`synchronize: true`** — OK for dev; use migrations for production.
5. **Port conflicts** — Use 3001 (API) and 8844 (UI); avoid 3000–3002, 8080 if other tools use them.

---

## Recommended roadmap (priority order)

### Phase 0 — Immediate (hours)
- [ ] Import all modules in `app.module.ts`
- [ ] Run `npm run seed` in backend (if seed script exists)
- [ ] Verify each controller with smoke tests / Postman

### Phase 1 — Identity & access (1–2 weeks)
- [ ] Wire `AuthModule` + JWT guards on protected routes
- [ ] Implement FR provider adapter (stub → vendor)
- [ ] SSO flow for ticketing + stadium access

### Phase 2 — Commerce (2–3 weeks)
- [ ] Real Pix provider + webhook reconciliation
- [ ] Connect marketplace checkout to `CheckoutModule`
- [ ] Loyalty earn hooks on F&B + retail POS receipts
- [ ] CDP ingest on all transaction events

### Phase 3 — Omnichannel (2 weeks)
- [ ] Outbound WhatsApp via Gupshup / Zenvia
- [ ] Campaign trigger → dispatch pipeline
- [ ] Push (FCM / Pinpoint) adapter

### Phase 4 — Intelligence (2 weeks)
- [ ] Gemini (or other) provider for Concierge message loop
- [ ] AWS Personalize or internal rules for personalization
- [ ] Next-best-action from real CDP segments

### Phase 5 — Frontend (ongoing)
- [ ] Port or rebuild `src/` screens in Next.js (`frontend/`)
- [ ] Fan app: profile, wallet, tickets, marketplace, concierge chat
- [ ] Operator: inventory, campaigns, check-in

---

## Suggested open-source references (for integrations)

| Need | Examples |
|------|----------|
| WhatsApp (BR) | Gupshup, Zenvia APIs (already stubbed) |
| Pix | Gerencianet (Efí), Mercado Pago, Sicoob SDKs |
| Loyalty | Voucherify, internal ledger (current approach) |
| Personalization | AWS Personalize, GrowthBook, internal CDP |
| LLM concierge | Google Gemini API, OpenAI |
| Push | Firebase FCM, Amazon Pinpoint |
| NestJS microservices | Nest monorepo or separate services per module later |

---

## Zero Human Multiagents workflow (for future issues)

When using Architect / Grunt / Scribe / Pedant:

| Agent | Use for |
|-------|---------|
| **Architect** | `app.module` wiring, module boundaries, FR/Pix adapter interfaces, multi-service split |
| **Grunt** | Controller/service implementation, entity fixes, frontend pages |
| **Pedant** | E2E tests, idempotency, payment reconciliation, load tests |
| **Scribe** | README, `.env.example`, API docs, runbooks |

**Issue template should include:** goal, acceptance criteria, env vars, API keys (names only, not values), affected modules, test plan.

**MCP useful for this repo:** Filesystem, GitHub, PostgreSQL, Playwright (browser E2E).

---

## Verdict: agentic build vs expectations

| Area | Verdict |
|------|---------|
| Data model / entities | **As expected** — matches Coxa ID + commerce scope |
| API modules | **Better than expected** — breadth is there |
| `AppModule` wiring | **Below expected** — many modules orphaned |
| Integrations | **Expected for v1 scaffold** — placeholders only |
| Frontend | **Below expected** — stub UI only |
| Brazil (Pix, WhatsApp inbound) | **On track** — structure present |

**Conclusion:** The repository is a **valid Phase 0 / Phase 1 backend foundation**, not a finished product. The agentic system delivered the right **shape**; the next step is **wiring, integrations, and UI** — not a greenfield rewrite.

---

## Related docs in repo

- `README.md` — run instructions, THU-16/17 API notes
- `memory/architecture.md` — F&B inventory patterns
- `memory/progress.md` — THU-11–17 feature log
- `env.example` / `.env.example` — configuration templates
