# Architecture

The platform follows a modular monolith architecture style for version 1, with the following components:

- **Frontend**: Next.js + React + TypeScript
- **Backend**: NestJS + Node.js + TypeScript
- **Database**: PostgreSQL
- **Cache/Queue**: Redis + BullMQ

## Key Architectural Decisions

- Modular monolith for maintainability and scalability
- REST-first API with internal event-driven workflows
- Medusa-based commerce/marketplace foundation
- Novu-style notification infrastructure
- AWS Personalize for personalization
- Gemini for AI integration