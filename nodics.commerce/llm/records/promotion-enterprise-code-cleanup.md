# Promotion Enterprise Code Cleanup

## Recorded Action

Promotion now stores business associations through `enterpriseRef`, `issuerEnterpriseRef`, and `vendorEnterpriseRef`. The scalar `enterpriseCode` remains transitional because Cart, Checkout, Order, secure coupon reveal, generated persistence queries, and existing Commerce tests still pass runtime business scope through that field.

## Migration Target

- Keep `enterpriseCode` accepted as an input scope while Commerce runtime callers are migrated.
- Persist role-aware enterprise reference objects as the authoritative business association.
- Move Cart, Checkout, Order, Promotion secure reveal, and Promotion operational publication queries to enterprise reference aware filters or a generated query projection.
- Remove the Promotion schema `enterpriseCode` compatibility alias only after the Commerce stack no longer depends on it for lookup, idempotency, reversal, or evidence.

## Status

Deferred. This is a coordinated Commerce migration, not a narrow Promotion-only cleanup.
