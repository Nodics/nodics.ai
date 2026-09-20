# Nodics Commerce contracts

Status: Commerce Phases 0-10 implemented. The root remains source-free: child
modules own business behavior while this group owns composition, functional
identity, shared presentation metadata, compatibility policy, and stable
cross-capability operating defaults. Preserve the approved Commerce blueprint,
Phase 0 ownership decisions, exact-money rules, provider maturity labels,
tenant isolation, idempotency, migration evidence, and deployment gates.

Additional contracts:

- `digital-commerce-and-coupon-marketplace-contract.md`: planned backend
  contract for digital products, coupon-code marketplace journeys,
  enterprise-owned business data, tenant-derived runtime context, mandatory cart
  validation/calculation, just-in-time checkout reservation, digital
  entitlements, coupon-code sale/claim/redemption lifecycles, extension points,
  examples, and implementation acceptance checks.

## Fulfillment commercial policy

Fulfillment supplies shipping/return contracts and execution, with empty offered-method lists by default. Stores/deployments explicitly select methods, prices, currencies, delivery promises, address requirements and return eligibility. Inherit technical carrier defaults while retaining explicit provider enablement and qualification. Use nConfig replacement for a complete offered list or keyed changes by method code; never inherit an extra method through positional array merging. Unconfigured policy returns no offered methods.

Apparel contributes its colour/size facet field mappings through the Product configuration only when Apparel is active. Product remains the canonical product and search authority. Store labels, sale collections, application catalogues and publication choices remain customer-owned.
