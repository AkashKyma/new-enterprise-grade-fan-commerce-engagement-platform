# Decisions
- Single-tenant v1; modular monolith to allow future extraction to services.
- TypeORM with autoLoadEntities for rapid dev (migrations directory prepared; switch off synchronize for prod).
- Health endpoint lives at /health for infra checks.
- Config validation added (class-validator) to fail fast on missing env.
