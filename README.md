# Fan Platform (Coxa ID–style)

Single-tenant fan identity, commerce, membership, ticketing, loyalty, marketplace, personalization, and AI concierge platform.

**Principle:** One Fan = One Identity = One Wallet = One Access

---

## What you get today

| Layer | Status |
|-------|--------|
| **Fan web app** (Next.js) | Login, home, tickets, shop, profile, concierge chat |
| **Backend API** (NestJS) | Identity, auth, loyalty, ticketing, marketplace, checkout, CDP, POS, Brazil adapters |
| **Demo data** | Auto-seeded on backend start (`SEED_DEMO=true`) |

See **[docs/USER_CAPABILITIES.md](docs/USER_CAPABILITIES.md)** for what fans can and cannot do in the UI.  
See **[docs/PROJECT_AUDIT.md](docs/PROJECT_AUDIT.md)** for technical module status and gaps.

---

## Requirements

- **Node.js** 18+ (LTS recommended)
- **PostgreSQL** 14+ (local install or Docker)
- **npm**

Optional: Docker / Docker Compose for `db` + `redis` services.

---

## Quick start (recommended)

### 1. Clone and configure

```bash
git clone https://github.com/AkashKyma/new-enterprise-grade-fan-commerce-engagement-platform.git
cd new-enterprise-grade-fan-commerce-engagement-platform
cp .env.example .env
```

Edit `.env` for your PostgreSQL credentials (`DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`).

Create the database if needed:

```sql
CREATE DATABASE fan_platform;
```

### 2. Install dependencies

Install **backend** and **frontend** separately (the root `package.json` is legacy — use the subfolders):

```powershell
cd backend
npm install
cd ../frontend
npm install
cd ..
```

### 3. Start the API

```powershell
cd backend
npm run start:dev
```

- API: **http://localhost:3001**
- Health: **http://localhost:3001/health**
- On first start, demo data is seeded when `SEED_DEMO=true` (default in `.env.example`).

### 4. Start the fan app

In a second terminal:

```powershell
cd frontend
npm run dev
```

- Fan app: **http://localhost:8844**

If port **8844** is busy, change the port in `frontend/package.json` (`dev` / `start` scripts) and `frontend/.env.example`.

### 5. Sign in

| Account | Password | Notes |
|---------|----------|--------|
| `fan@coxa.com` | `demo1234` | Full demo seed (2,500 pts, Ouro membership, shop, events) |
| Your own email | (your password) | Sign up on `/login` — gets 500 welcome points + sócio card |

---

## Local URLs

| Service | URL | Config |
|---------|-----|--------|
| Fan app | http://localhost:8844 | `frontend/package.json` |
| Backend API | http://localhost:3001 | `PORT` in repo-root `.env` |
| Health check | http://localhost:3001/health | |
| PostgreSQL | `localhost:5432` (or your `DB_PORT`) | `.env` |

---

## Fan app routes

| Route | Purpose |
|-------|---------|
| `/` | Home — events, offers, rewards |
| `/login` | Sign in / sign up |
| `/tickets` | Browse matches, reserve a seat |
| `/marketplace` | Shop, cart, checkout (Pix placeholder) |
| `/profile` | Sócio card, loyalty points, redeem rewards |
| `/concierge` | Chat assistant |

---

## Project structure

```
├── backend/          NestJS API (main backend)
│   └── src/
│       ├── modules/  Feature modules (auth, identity, loyalty, …)
│       └── seeds/    Demo data seed (runs on startup)
├── frontend/         Next.js fan web app
│   ├── pages/        App routes
│   └── components/   Layout, auth context
├── docs/             USER_CAPABILITIES.md, PROJECT_AUDIT.md
├── docker-compose.yml
├── .env.example      Copy to .env at repo root
└── memory/           Agent / project memory bank
```

---

## Environment variables

Copy `.env.example` → `.env` at the **repo root** (backend loads `../.env` and `.env`).

| Variable | Description |
|----------|-------------|
| `PORT` | Backend HTTP port (default **3001**) |
| `DB_*` | PostgreSQL connection |
| `JWT_SECRET` | Auth token signing |
| `SEED_DEMO` | `true` = seed demo fan, shop, events on startup |
| `REDIS_URL` | Optional (queues) |

Frontend optional: copy `frontend/.env.example` → `frontend/.env.local` and set `NEXT_PUBLIC_API_URL=http://localhost:3001`.

---

## Backend scripts

From `backend/`:

```bash
npm run start:dev    # Dev server with watch
npm run build        # Compile
npm run start        # Production
npm run seed         # Manual seed (dist/seeds/seed.js after build)
npm test             # Jest tests
```

---

## API overview

### Auth
- `POST /auth/signup` — `{ email, password }`
- `POST /auth/signin` — `{ email, password }`

### Identity (JWT)
- `GET /identity/me` — profile, wallet, membership

### Personalization
- `GET /personalization/offers?userId=`
- `GET /personalization/events?userId=`
- `GET /personalization/rewards?userId=`

### Membership & ticketing
- `GET /membership-ticketing/events`
- `POST /membership-ticketing/reserve` — `{ userId, eventId, sectionId }`

### Marketplace
- `GET /marketplace/items`
- `POST /marketplace/cart/add`
- `GET /marketplace/cart/:userId`
- `POST /marketplace/order/:userId/create`

### Loyalty
- `GET /loyalty/:userId/balance`
- `POST /loyalty/redeem`

### Concierge
- `POST /concierge/session`
- `POST /concierge/session/:id/message`
- `GET /concierge/loyalty/:userId/balance`

### Brazil (webhooks)
- `POST /webhooks/gupshup`
- `POST /webhooks/zenvia`

---

## Docker (optional)

Start Postgres + Redis only:

```bash
docker compose up db redis -d
```

Then run backend and frontend locally as above.  
Full stack via `docker compose up` is available but local dev is usually easier with native Node + PostgreSQL.

---

## Known limitations (v1)

- **Pix payments** — placeholder (orders created, no real QR)
- **AI concierge** — rule-based replies; LLM not wired
- **WhatsApp outbound** — adapters stubbed
- **Facial recognition** — entity placeholders only
- **POS / CDP** — API for operators; no fan UI

Details: [docs/USER_CAPABILITIES.md](docs/USER_CAPABILITIES.md)

---

## Documentation

- [docs/USER_CAPABILITIES.md](docs/USER_CAPABILITIES.md) — fan-facing features
- [docs/PROJECT_AUDIT.md](docs/PROJECT_AUDIT.md) — module audit and roadmap
- [memory/](memory/) — architecture and agent context

---

## License

Private / internal — see repository owner.
