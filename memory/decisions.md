# Decisions (THU-7)
- Require idempotency keys for all ledger mutations.
- Use pessimistic_write locks on account updates to avoid race conditions.
- Reward redemption returns a placeholder voucher; wire Voucherify adapter later.
