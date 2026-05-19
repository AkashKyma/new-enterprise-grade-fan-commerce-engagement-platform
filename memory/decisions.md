# Decisions (THU-11)
- Use externalId from POS as idempotency key for receipt ingestion.
- Apply pessimistic locks during stock deduction to prevent race conditions under load.
- Defer CDP/Loyalty publishing to background workers; keep clear adapter boundaries.
