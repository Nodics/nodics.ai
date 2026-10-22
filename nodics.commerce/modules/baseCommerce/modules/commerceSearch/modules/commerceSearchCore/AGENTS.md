# Commerce Search Core Agent Contract

- Follow `../../AGENTS.md`.
- Own commerce-specific search ranking and query rules only.
- Product remains the source of product/category/search projection data.
- `nSearch` remains the generic search provider abstraction.
- Axis-facing metadata must be provided by this module, not by group roots.
- Customer APIs must not expose rule internals, operator evidence, or unpublished rules.
- Retain rule timing and benefit identity through hash/snapshot/projection/index.
  Independent boost expiry must not alter coupon expiry or availability.
- Rank the complete eligible Product candidate set before caller pagination.
  Scan complete bounded rule pages, apply scope before the applicable-rule bound,
  and reject incomplete reads; never truncate to an arbitrary rule prefix.
- `commercialAgreement` owns commercial assignments and benefit evidence.
  Re-resolve current coverage at ranking time and deduplicate its stable identity.
  Product/Promotion own coupon issuer membership; related Enterprises do not
  inherit coverage. Never accept client-provided issuer or paid flags.
- Use the original caller for owner membership reads. The public membership port
  must be qualified by Promotion/P10; the legacy capped mutable policy reader is
  not a complete source. Never manufacture an Enterprise/service principal.
- Batch membership reads using Promotion's effective
  `couponIssuerMembership.maximumProducts`; never define a Search copy/default.
  Validate exact complete membership per batch and combine only after every read
  succeeds. Preserve original caller authority and the >1000-candidate, overridden
  bound and later-batch rejection regressions in `test/commerceSearchBenefitContract.test.js`.
- Keep owner defaults in properties, normalize scores at the Discovery boundary,
  preserve explicit zero and explicit customer sorts, and retain private evidence.
- Resolve omitted priority only through validated `defaultRulePriority`; retain
  the resolved value in publication snapshots. Canonical Promotion membership
  is required, with no fallback to a different owner read or local policy copy.
- Preserve immutable publication snapshots and owner-only writer interceptors.
  Source snapshots are not proof of live indexing or governed activation.
- Snapshot replay and lost-insert acknowledgement validation dispatch through
  effective `assertSnapshotSource`, never a closed-over business helper. Preserve
  exact tenant/rule/hash binding and the private request-identity write guard;
  extension must not export or synthesize write authority. Keep the owner-local
  publication regression for both paths and stricter later-layer rejection.

This capability declares an inert model-service inventory for [governed Local reset](../../../../../../../nodics.foundation/modules/nSystem/llm/contracts/local-reset.md).
A server must explicitly select it; contributions never enable reset or bypass tenant, environment, confirmation or required-service checks.

Route-category defaults belong to this capability; deployments supply only intentional overrides.
Preserve nRouter enforcement and independent route authorization. See [exposure ownership](../../../../../../../nodics.foundation/modules/nRouter/llm/contracts/README.md#capability-owned-exposure-defaults).
