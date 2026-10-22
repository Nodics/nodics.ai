# Commerce Search Core

Commerce Search Core provides the runtime schemas, services, publication API, and backoffice capability registration for commerce-specific search ranking rules.

Published rules retain independent start/end dates in their hash, immutable
approved snapshots, persisted projection and search mapping. Publication retries
reuse the same snapshot after index failures; APPROVED snapshot evidence alone
does not prove a successful index write or governed nPublish activation.

Ranking accepts the complete authorized, available, filter-matching Product
candidate set, orders it, and returns the same product objects. Product must
paginate afterward. Explicit customer sorts are preserved. Rule retrieval scans
bounded, deterministically ordered pages and filters applicability before
enforcing the applicable-rule limit. Incomplete/over-limit scans reject rather
than silently select an arbitrary prefix; Product retains its configured
ranking failure behavior.

Agreement-backed rules carry `benefitRef: {agreementCode, enterpriseCode,
benefitCode}` and no independent actions. `commercialAgreement` owns the
assignment, retained terms and benefit evidence. Publishing requires original
operator agreement-read authority in addition to Search publication permission.
At query time Search re-resolves the current agreed benefit, then intersects
selected/all-Enterprise coverage with canonical coupon issuer membership and
the supplied eligible products. A repeated rule for the same benefit applies
once. Ranking neither bills nor changes availability, coupon rights or Profile.

The required Promotion owner port is
`DefaultPromotionOperationService.couponIssuerMemberships(request, productCodes)`
returning exactly one `{productCode, issuerEnterpriseCode}` per requested coupon.
It must preserve original public/signed caller admission and return complete
canonical membership without private evidence. Missing canonical membership
fails closed; neither activated-policy nor mutable legacy reads substitute for it.
The Promotion port is implemented in source and delegates to its canonical
membership owner. Search does not infer ownership from cards or fabricate
service authority; deployed original-token admission still needs qualification.

All ranking mechanics/defaults are defined in `config/properties.js` and checked
by `DefaultCommerceSearchPolicyService`. Business scope, target, agreement and
dates remain governed records. Later configuration overrides preserve validation.
Normalized scores, explicit zero weights and pin positions agree across the
local path and generic Discovery engine. Rule index caching is disabled so no
Search-owned TTL literal can prolong a changed commercial selection.
Omitted rule priority uses the validated `ranking.defaultRulePriority` baseline
(zero) in publication, ranking and benefit deduplication. Explicit zero remains
zero when that baseline is deliberately overridden. The retired compatibility
membership path and its unused `maximumCouponPolicies` property are removed.

Run `node --test nodics.commerce/modules/baseCommerce/modules/commerceSearch/modules/commerceSearchCore/test/*.test.js`
from the framework root. Tests use synthetic owners/persistence and prove local
behavior only. Product Catalogue Query now ranks its complete filtered eligible
set before slicing recommended/relevance pages. The older page-local discovery
branch is not that complete-set path. Deployment selection, public membership
admission, installed index/interceptor behavior, Axis controls and live acceptance
remain separately qualified integrations.

`acceptance:commerce-search-ranking --execute` reads an explicitly reviewed local
Product discovery fixture twice to prove stable default ranking and deduplication,
then optionally proves explicit-sort bypass. Its reusable bounds live under
`commerceSearch.ranking.acceptance`; project configuration supplies only the
fixture selection and original access token. The runner never publishes rules.

The existing `commerce.search-guide` public guide is canonical CMS content under
`data/docs-v001/records/documentation`, declared by the `documentation` manifest
section with `sourceMode: cms-records`. Preserve its IDs, anchors and verified
detail; update dependent search text/checksums without regenerating other guides.

This capability declares an inert model-service inventory for [governed Local reset](../../../../../../../nodics.foundation/modules/nSystem/llm/contracts/local-reset.md).
A server must explicitly select it; contributions never enable reset or bypass tenant, environment, confirmation or required-service checks.

Route-category defaults belong to this capability; deployments supply only intentional overrides.
Preserve nRouter enforcement and independent route authorization. See [exposure ownership](../../../../../../../nodics.foundation/modules/nRouter/llm/contracts/README.md#capability-owned-exposure-defaults).
