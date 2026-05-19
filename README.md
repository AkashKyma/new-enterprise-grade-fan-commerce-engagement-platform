# Fan Platform

## Overview

This project is a single-tenant unified fan identity, commerce, membership, ticketing, loyalty, inventory, marketplace, personalization, and AI concierge platform.

## Requirements

- Node.js
- Docker

## Getting Started

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/fan-platform.git
   cd fan-platform
   ```

2. Copy the environment variables file:

   ```bash
   cp env.example .env
   ```

3. Start the development environment:

   ```bash
   npm run dev
   ```

4. Local ports: **frontend** `http://localhost:8844` (`cd frontend && npm run dev`), **backend** `http://localhost:3001/health` (`PORT` in repo-root `.env`, default **3001**). If **8844** is taken, edit `frontend/package.json` `dev` / `start` scripts to another free port.

## Project Structure

- **src/**: Contains the frontend and backend code.
- **memory/**: Documentation for project context, architecture, progress, and decisions.
- **docker-compose.yml**: Docker Compose configuration for local development.

## Scripts

- `npm run dev`: Start the development environment.
- `npm run build`: Build the project for production.
- `npm run start`: Start the production server.
- `npm run migrate`: Run database migrations.
- `npm run seed`: Seed the database with initial data.

## Personalization APIs (THU-16)
- POST /personalization/next-best-action { userId?, context? }
- GET /personalization/offers?userId=...
- GET /personalization/rewards?userId=...
- GET /personalization/events?userId=...
- GET /personalization/blocks?userId=...


## AI Concierge (THU-17)
- POST /concierge/session { userId?, context? }
- POST /concierge/session/:id/message { role, content }
- GET  /concierge/session/:id/prompt
- GET  /concierge/identity/:userId
- GET  /concierge/loyalty/:userId/balance
- GET  /concierge/ticket/:userId/eligibility/:eventId
- GET  /concierge/checkin/:userId/:eventId/:sectionId
- GET  /concierge/order/:orderId/status

## Brazil Adapters (THU-17)
- POST /webhooks/gupshup → { events: WhatsAppInbound[] }
- POST /webhooks/zenvia  → { events: WhatsAppInbound[] }

## Local Run (THU-17)
- Configure env: `PORT` (default API **3001**), `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
- Install deps: `npm i && (cd backend && npm i)`
- Start backend: `(cd backend && npm run start:dev)`
- Seed demo: `(cd backend && ts-node src/seeds/seed.ts)`

## Deferred Items (THU-17)
- Real WhatsApp send via Gupshup/Zenvia tokens
- Real Pix provider integration and reconciliation storage
- Richer order status and check-in read models

## PR Summary (THU-17)
Adds AI Concierge foundations (sessions/messages/tools/summaries), Brazil adapters (Gupshup/Zenvia/Pix), seeds, tests, docs. Wires modules and endpoints.

