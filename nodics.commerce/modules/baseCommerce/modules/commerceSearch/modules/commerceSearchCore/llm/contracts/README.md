# Commerce Search Core contracts

- `commerceSearchRule` is the staged business rule owned by Commerce Search.
- `commerceSearchRuleVersion` records immutable publication snapshots and evidence.
- `commerceSearchRuleProjection` is the online/search projection used at discovery time.
- Supported scope types are `GLOBAL`, `CATEGORY`, and `SEARCH_TERM`.
- Supported action types are `PIN`, `BOOST`, and `BURY`.
- Publication reads approved staged rules, builds deterministic projections, saves them through generated schema services, and indexes them through nSearch.
- Customer APIs must not expose raw rule internals beyond their effect on product result ordering.

## Timing, Completeness And Configuration

`validFrom` is inclusive; `validTo` is exclusive. The projection builder validates
windows/scopes/actions and includes dates and `benefitRef` in its deterministic
source hash. Date fields survive the generated projection schema and index.
An immutable `commerceSearchRuleVersion` snapshot is saved before projection
and index writes. Its APPROVED state records source evidence, not installed
index success. Retry after an uncertain/failed index write reuses the hash key.
Generic version creation/update/delete is fenced by owner-only interceptors.

Ranking scans stable code-ordered pages until completion within maximumRuleScan.
It checks tenant, Store, locale, scope and dates before maximumRulesPerRequest.
Overflow, repeated pages and unknown envelopes reject without partial effects.
Product's configured fail-open/error behavior applies to that rejection.
The caller supplies a complete available/filter-matching candidate set and
paginates only after ranking; Search neither loads Products nor refills results.

Owner defaults are `maximumRulesPerRequest:50`, `maximumActionsPerRule:200`,
`maximumRuleScan:5000`, `rulePageSize:100`, `maximumCandidateProducts:10000`,
`defaultRulePriority:0`, and weights BOOST 1000/BURY -1000. Limits are
technical completeness bounds, never package quotas or commercial prices.
Invalid effective values reject. Customer/runtime properties may override actual
values but cannot supply missing definitions/defaults. Generic Discovery receives
an explicit score; zero actions are omitted to avoid its legacy zero fallback.
Stable ties and actual PIN positions are identical on local/generic paths.
Priority must be a safe integer; omitted values use the complete framework
baseline, while explicit zero is preserved. Projection snapshots retain the
resolved priority, so changing the default does not rewrite an existing snapshot.
All positive bounds, page/scan relationships, finite signed weights and supported
vocabularies are validated by the owner before use; missing policy fails closed.

## Commercial Coverage

A staged benefit rule has `benefitRef` with agreementCode, enterpriseCode and
benefitCode; `actions` is empty. It retains the ordinary GLOBAL/CATEGORY/SEARCH_TERM
query scope, which is separate from selected/all-Enterprise targeting. The rule
requires explicit dates contained in the referenced benefit period. Publication
calls the agreement owner's authorized read boundary and requires both relevant
owner permissions, preventing foreign-Enterprise coverage selection.

Runtime expansion calls `DefaultCommercialAgreementOperationService.resolveBenefit`
and applies only currently effective coverage. It resolves canonical issuer
membership over the supplied eligible coupons, selects the benefit's exact
Enterprise, and intersects any selected Product codes. Newly eligible coupons
join all-Enterprise coverage dynamically. Related Enterprises, stores and
redemption outlets do not inherit it. Several rules referencing the same
agreement/benefit are reduced to one effect in deterministic priority order.
Distinct separately agreed benefits may overlap. No Search operation charges,
creates invoices, changes Profile status or mutates coupon rights/availability.

Promotion's coordinated `couponIssuerMemberships(request, productCodes)` port
must return complete, unique `{productCode,issuerEnterpriseCode}` rows for the
exact requested coupons. It retains original caller authority and canonical
publication/issuer checks; Search returns none of these rows to customers.
There is no compatibility path through `promotions(request)`. Missing canonical
ports, unselected/legacy capped reads, missing/ambiguous members and
unqualified public scope fail closed for ranking. Public availability summaries
alone are insufficient; the public issuer port is an explicit integration gate.

Search splits the eligible coupon set using the effective
`promotion.couponIssuerMembership.maximumProducts` value. Promotion remains the
sole default/validation owner; Search has no duplicate limit or fallback. Every
call receives the original request. Each batch must return exactly its requested
unique Product identities with nonempty canonical issuers; missing, duplicate,
cross-batch or foreign rows and owner failures abort the entire ranking. Only
complete combined membership can drive benefit expansion. The owner regression
covers 1,001 candidates, a smaller effective Promotion bound, malformed bounds
and failures in later batches without exposing partial coverage.

## Acceptance Boundaries

Unit fixtures exercise persistence recovery, dates, all/selected targeting,
membership rejection, deduplication, score parity and page ordering. The
commercialAgreement suite also uses persisted agreement amendments with actual
Search services. These fixtures do not qualify a live provider, installed unique
indexes, signed HTTP, frontend controls, or global publication rollback. Group
composition and P10/Promotion public membership are coordinated owner changes.

Product's governed catalogue selection remains Product-owned. Commerce Search
ranking receives the already activated, customer-safe Product result set; it
must not refill it from mutable Product sources or hidden prepared projections.
Product graph digests do not freeze independently published ranking rules.
Versioning and governed activation of ranking rules requires its own qualified
owner integration; this Product-only change does not register such a provider.
