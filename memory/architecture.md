# Architecture Notes (THU-7)
- Ledger is the source of truth; account points mirror ledger transactions.
- All earn/redeem mutations require idempotency keys and run in DB transactions with pessimistic row locks.
- Voucherify integration left as adapter boundary via RewardCatalogItem.payload.
