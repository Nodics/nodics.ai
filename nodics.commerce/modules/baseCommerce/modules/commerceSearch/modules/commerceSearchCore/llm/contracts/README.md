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
Publication counts an index write only after nSearch returns exactly one matching
created/updated acknowledgement with no shard failure, followed by an independent
bounded indexed read of the exact document ID. Indexed tenant, Store, locale,
CURRENT status, sourceHash, query scope, dates, actions and benefitRef must match.
The write requests refresh=wait_for before that search; no debug route or direct
provider connection is needed. A resolved nSearch errors array is failure, even
when its outer code is SUC_SRCH_00000. Registered 503 diagnostics INDEX_WRITE,
INDEX_ACK, INDEX_READ, INDEX_MISSING and INDEX_BINDING contain only static stage
text, never raw provider errors, documents, credentials or financial terms.
A failed confirmation retains the existing snapshot; ordinary owner republish
may retry the same approved source. It must not report success from the database
projection alone, and no partial publication count substitutes for confirmation.

Projection lookup uses nSearch bool/term/exists DSL for indexed reads and model
query operators only for generated model reads. Indexed locale matching admits
the exact locale or an absent/null indexed locale; tenant, Store and CURRENT
filters remain mandatory. Never pass Mongo `$or`/`$exists` to a search adapter.

Ranking scans stable pages until completion within maximumRuleScan. Generated
model reads sort by code. Indexed reads pass `options.sort: [{sourceHash:'asc'}]`
through nSearch to the adapter: its `searchOptions` translator carries pagination
only. `sourceHash` is an explicitly mapped keyword and the owner builder binds
rule identity, tenant, Store and locale into it. Do not rely on discarded
`searchOptions.sort` or on an undeclared/dynamically mapped code sort field.
It checks tenant, Store, locale, scope and dates before maximumRulesPerRequest.
Overflow, repeated pages and unknown envelopes reject without partial effects.
Product's configured fail-open/error behavior applies to that rejection.
Successful index acknowledgement/readback does not qualify runtime ranking.
The composed runtime regression exercises the generated nSearch service and
search processor, actual adapter parameters, Agreement benefit resolution,
Product pagination, original customer admission and configured omission/error.
Candidate retrieval, Agreement storage and membership/provider transports are
isolated fixtures; this does not identify a native refusal or qualify installed
Promotion membership. Public membership deliberately rejects service principals.
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

Resolve current Agreement coverage before issuer membership. For selected coverage,
read membership only for the union of selected codes intersecting eligible coupon
candidates. Unrelated coupons cannot block selected coverage. If any current
benefit covers all Enterprise coupons, retain the complete eligible coupon set;
exact issuer proof is still required for every selected candidate. Missing or
foreign-Store coverage contributes no membership selectors. Original caller
authority, completeness checks and fail-closed selected reads remain unchanged.

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
