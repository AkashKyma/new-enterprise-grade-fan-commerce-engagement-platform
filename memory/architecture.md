# Architecture
- Modular monolith (NestJS) with typed modules per domain; clear adapter boundaries.
- PostgreSQL (TypeORM) for persistence; migrations in backend/migrations; seeds in backend/seeds.
- Redis + BullMQ for queues (to be wired by later tickets).
- REST-first APIs; internal events within modules.
- Next.js frontend (TypeScript) for admin/operator UI and fan UI.
- Provider abstractions for payments (Pix-ready), WhatsApp brokers, LLMs (Gemini), and AWS Personalize.
