# Loyalty Contracts

AI and developer changes must preserve these contracts:

- Loyalty owns reward wallet state and reward movement evidence.
- Wallet owner identity is `ownerType` plus `ownerCode`; tenant/schema context is supplied by auth/runtime layers.
- Ledger entries are append-only and idempotent by business operation.
- Commerce coupon/order/payment behavior is outside this module group.
- API exposure belongs in `loyaltyApi`; schema modules keep generated CRUD routers disabled unless a route is explicitly approved.

Operation services must mutate balances only with corresponding ledger evidence. Capture, release, and reverse operations must use their own idempotency keys rather than reusing the original reservation key.

## Documentation Contract

Business, developer, operator, and customization documentation must be updated
when Loyalty behavior changes. Keep these lanes separate:

- Module `README.md` and `llm/` files explain source-adjacent contracts for
  developers and AI tools.
- Framework documentation under `nodics.docs/docs/pages/nodics.loyalty/`
  explains business value, ownership, customization, topology, and verification.
- Project documentation explains project-specific reward programs, earning
  rules, checkout presentation, and deployment choices.

Do not document coupon purchase as Loyalty functionality. Document it as a
Commerce payment-provider journey that uses Loyalty as the reward-balance
authority.
