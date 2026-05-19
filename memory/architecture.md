# Architecture Notes (THU-11)
- FnbInventoryLevel tracks per-outlet on-hand. All changes go through FnbStockMovement for traceability.
- POS ingestion deducts stock atomically and writes FnbReceipt (idempotent by externalId).
- Hooks for publishing CDP events and loyalty earnings are left as adapter integration points.