# Decisions (THU-13)
- Marketplace orders remain vendor-neutral; future provider/fulfillment adapters hook via SettlementRef and item meta.
- Order status flow mirrors unified checkout; payment creation delegated to checkout module in a later integration step.
