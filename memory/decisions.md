# Decisions (THU-12)
- externalId from retail POS is idempotency key for sale ingestion.
- Use pessimistic locks for all stock mutations under load.
- Movement log is canonical history; levels are derived state for quick views.
