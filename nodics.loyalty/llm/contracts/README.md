# Loyalty Contracts

AI and developer changes must preserve these contracts:

- Loyalty owns reward wallet state and reward movement evidence.
- Wallet owner identity is `ownerType` plus `ownerCode`; tenant/schema context is supplied by auth/runtime layers.
- Ledger entries are append-only and idempotent by business operation.
- Commerce coupon/order/payment behavior is outside this module group.
- Business API exposure belongs in `loyaltyApi`. Loyalty schemas explicitly select
  `router.groups: { schemaOperations: true }` for governed schema utilities;
  broad query/by-ID CRUD groups are not approved. See nRouter's
  [selective schema routes](../../../nodics.foundation/modules/nRouter/README.md#selective-schema-routes).

Schema route opt-in is not mutation authority. Preserve `schemaGoverned`, secured
`schemaApi` exposure, read/write permissions, schema access policy and authenticated
tenant/record scope. Reward operations still require ledger-backed domain services.
Later layers can disable routes with `router.enabled: false` or keyed
`schemaOperations: false`; service generation and HTTP exposure are independent.
The owner schema boundary suite reuses nRouter's `test/helpers/schemaExposure.cjs`
for route projection. It runs without a customer checkout,
listeners, database or generated-service build. `test/loyaltyGeneratedRuntimeContract.test.js`
separately exercises effective model/schema materialization and generated get/save
services in a disposable independent deployment through nTooling's shared driver.
Customer composition tests retain actual runtime selection; static route tests
do not replace generated-service evidence.

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


## Explicit release contribution composition

Loyalty contributes eight selected sections from three source owners: Profile permission, enterprise-reference and wallet access definitions.
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
