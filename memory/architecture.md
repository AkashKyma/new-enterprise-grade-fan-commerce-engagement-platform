# Architecture Notes (THU-13)
- Vendors kept behind model; items can be internal (vendorId null) or third-party (vendorId set).
- Cart and cart lines accumulate vendor-aware totals; MpOrder + MpOrderLine persist snapshot.
- SettlementRef prepared per-vendor for future payouts; order status transitions align with unified checkout/payment layer.
