# Architecture Notes (THU-12)
- Central stock maintained per variant; transfers move stock from central to specific locations with dual movement entries.
- Sales deduct per-location stock transactionally with pessimistic locks; receipts persisted idempotently via externalId.
- Returns increment per-location stock and log return movements; future replenishment can build on transfer + central restock flows.
