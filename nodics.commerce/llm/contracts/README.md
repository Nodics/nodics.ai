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


## Explicit release contribution composition

Commerce contributes 33 selected sections from 10 source owners: Profile access definitions and five Process publication workflow definitions.
The group owns ordinary `data.dataReleases.contributions` source selectors,
expressed with `$config: "keyed"`, `key: "moduleName"`, and explicit replacement
of each owner's `sections`. Duplicate source entries from retired role buckets
are combined once. No `runtimeRoleProfiles` fold or role-to-destination map remains.

Source visibility does not activate modules, install releases or grant permissions.
The selected immutable headers and existing nImport destination contract admit
only actual module/schema owners, or the explicitly configured owner installer.
Environment, tenant, lifecycle, publication, prerequisite and permission checks
remain authoritative. Existing manifest selection policies and checksums are
unchanged; this migration does not add startup profile selections or imports.
Later customer layers may narrow/remove sources through the same collection
operators, without copying framework defaults or enabling business capabilities.

The cross-group offline regression is
`nodics.commerce/test/frameworkReleaseContributionComposition.test.js`; it uses
real manifests/headers and isolated destination ports, including wrong-host,
Online denial, collection projection and no-autoimport checks.
