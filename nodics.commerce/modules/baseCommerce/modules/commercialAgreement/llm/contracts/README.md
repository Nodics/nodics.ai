# Agreement Ownership And Contracts

## Placement Decision

Authorized framework-maintainer resolution: `commercialAgreement` is a narrow
Base Commerce capability. The evidence considered was Product's versioned
authoring/publication contract, Pricing's exact `priceRow` records, Profile's
Enterprise administration, immutable Commerce Order/Payment evidence, and
`telcoSubscription`'s required customer, SIM/ESIM and number-intent fields.

Product/Pricing describe the shared saleable package and price; neither owns a
party's retained commercial amendments. Profile owns identity and authority,
not service pricing/renewal. Immutable orders are transaction evidence, not an
editable agreement. Telco subscription has incompatible domain prerequisites.
Search owns ranking, not the agreement granting a benefit. A narrowly scoped
Commerce aggregate therefore supplies the missing owner without expanding any
of those authorities. The existing generated concurrency service supplies
atomic persistence; no new transaction engine, registry or ledger is added.

## Record Contract

An aggregate has `code`, Profile `enterpriseRef`, managed `revision`, and
`versions`. Each version retains its full normalized command, business version,
actor, recorded timestamp, complete terms and an exact agreed-price snapshot.
One atomic generated update appends history; no separately written head/history
pair can diverge. A unique code index protects concurrent creation.

Terms require the selected model, selected payment terms, version-pinned
`{module:'product',schema:'product',code,versionId}` package and
`{module:'pricing',schema:'priceRow',code,versionId}` price references, descriptive
services/allowances, effective start, service start, payment schedule, renewal
mode, termination/financial treatment and agreement evidence. Subscription
also requires the explicit billing period. Automatic renewal requires its
period, notice terms and express evidence. No field executes those terms.

`financialReferences` may name existing `order/commerceOrder` or
`paymentCore/paymentTransaction` records. All are resolved through their
generated owner services with original authenticated authority. Missing or
unsupported invoice references fail; an empty list honestly records absent
financial evidence. No record is labelled paid by this capability.
Failed status codes, negative acknowledgements and error-bearing reference
envelopes refuse even when they contain a plausible record.

Amendments use strictly increasing effective dates and retain prior complete
terms. At time T the last effective version controls new benefit reads. Its
exclusive end can terminate coverage; future versions never take effect early.
Term/model changes carry their own explicit financial treatment; no refund,
proration, renewal debit, carryover or Profile transition is inferred.

## Benefit Contract

Each benefit has stable `code`, source `PACKAGE_INCLUDED|ADD_ON`,
`targetType: SELECTED_COUPONS|ALL_ENTERPRISE_COUPONS`, explicit `productCodes`
(nonempty selected list or empty all-Enterprise list), Store and half-open
`[validFrom,validTo)` interval contained in its agreement term. ADD_ON also
retains `additionalBenefitTerms`. `evidenceRef` identifies the agreed source.

Internal `resolveBenefit(request, reference)` accepts only agreementCode,
enterpriseCode and benefitCode. The tenant remains the original runtime
envelope. Its result contains only coverage identity, source, target type,
Product codes, Store, dates and version; it omits agreement evidence references,
descriptive add-on terms, pricing, history and financial information. Search
rechecks this result at query time rather than freezing entitlement in an
index. Distinct benefits may overlap; repeated rules for the same agreement
benefit apply once. Coupon ownership, availability and publication remain
Product/Promotion decisions.

Operator publication uses `authorizeBenefitPublication`, which additionally
requires agreement read permission and signed Enterprise/admin scope. Internal
runtime benefit resolution has no HTTP route and returns no private history.

## Admission And Recovery

HTTP routes are secured employee commands with owner permissionConfig values.
Services independently check the signed tenant, employee, Enterprise and
permission. Admin commands still require a signed Enterprise; conflicting
signed tenant/Enterprise aliases refuse before persistence. Admin scope does
not imply a charge or change Profile state.
Private system persistence context is created only after command admission.
No schema HTTP route is enabled. Pre-save/update guards require exact in-flight
owner request identity; generic imports and deletes cannot replace history.

Generated managed concurrency increments revisions. Creation uses insertOnly;
updates retain exact expected revision and Enterprise predicates. The service
reads the persisted command back before reporting completion. After uncertain
acknowledgement, replay the original command ID and payload. Competing commands
must reload the returned revision and obtain explicit agreement to new terms;
they cannot overwrite an earlier amendment. Finite record/history bounds reject
before writing rather than truncating evidence.

## Configuration And Consumers

`commercialAgreement` defaults and validation bounds belong to this module's
properties. Later overrides remain subject to validation. Business terms,
currency, rates and dates are records, not runtime property definitions.
Schema access is service-only; named employee commands provide scoped access.
Permission source records are imported through Profile's existing governed
release mechanism; no grant is part of this capability's initialization.

Axis consumes owner commands and history through implemented native source
metadata. `POST /agreements/workspace` projects scoped commands and framework
bounds, not deployment qualification. The optional `agreementWorkspace` release
owns CMS text. The renderer records full reviewed commands and reconciles exact
retained intent before success or same-key retry. Circa may consume Search ordering; it
does not receive commercial administration or private agreement evidence.
Operators retain Profile's existing status action independently of agreements.

## Evidence Limits

Focused unit tests cover generated concurrency with a synthetic provider,
command routing, reference admission, history, timing, recovery and overrides.
Installed indexes/interceptors, real Product/Pricing permission paths, signed
HTTP, Axis rendering and cross-node behavior need later runtime acceptance.
No invoice, recurring-charge or commercial payment provider is implemented or
implicitly selected here.
## Effective Vocabulary

Agreement model, payment-term, benefit-source and target-type choices are the
canonical keys of the effective owner `ENUMS` definitions. Workspace projection
and validation use the same runtime values; source definitions remain in
`src/utils/enums.js` for normal layered loading. Missing or malformed effective
enums refuse. Configurable validation bounds and permission identifiers remain
in owner properties and are not moved into enums.
