# Decisions (THU-13)
- Marketplace orders remain vendor-neutral; future provider/fulfillment adapters hook via SettlementRef and item meta.
- Order status flow mirrors unified checkout; payment creation delegated to checkout module in a later integration step.

# Decisions (THU-16)
- Fallback uses Rewards and Events as primary dynamic sources; generic offers provide baseline.
- Provider chain is ordered with ML/external providers pluggable before fallback.
- Kept API read-only and stateless; personalization state can evolve via CDP profiles later.

# Decisions (THU-17)
- Concierge data persisted in Postgres for continuity; summaries simple for now.
- WhatsApp broker abstraction standardizes providers; webhooks normalized to unified inbound.
- Pix kept pluggable via interface; demo adapter included.
- Documentation and seeds ensure immediate local usability.
