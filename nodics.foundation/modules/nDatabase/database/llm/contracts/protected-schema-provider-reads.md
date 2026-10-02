# Protected Schema Provider Reads

## Effective Declaration And Fixed Interfaces

The effective prepared model's `rawSchema.readProtection` declares one layered
export owner, not another capability registry:

```js
readProtection: {
  owner: "DefaultProfileVerifiedContactInterceptorService",
  qualified: false,
}
```

Foundation has no Profile schema-name knowledge. The existing
`DefaultSchemaReadAccessPolicyService` resolves that declared export through
`SERVICE`. Missing/malformed declarations, absent owners, missing methods and
non-true acknowledgements reject with `ERR_AUTH_00003`. Only an absent declaration
retains ordinary behavior. `qualified: false` is an evidence state, never an
enforcement-disable switch. No migration or activation occurs.

Fixed interfaces are `providerRead(exactRequest, actualPreparedModel)` and
`providerResult(exactRequest, responseWrapper, actualPreparedModel)`.
`responseWrapper.success` holds the existing provider/generated envelope.
Both may be asynchronous and must acknowledge true. The original input object
is passed unchanged: body fields, copied envelopes, system authentication and
another owner's admission confer no private proof rights. Methods are exported
service integrations, not HTTP dispatchers. Later module layers may replace the
declared owner while preserving these interfaces and independent evidence owners.

## Standard Source Coverage

| Path                                    | Source enforcement                                                                                               |
| --------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Generated `lookupCache`                 | Exact query guard before cache selection, including skip-cache requests; protected schemas never read item cache |
| Generated `updateCache`                 | Protected schemas never write item cache, including legacy-policy fallback                                       |
| Cache `isItemCacheable`                 | Independently refuses declared protected schemas                                                                 |
| Mongo `getItems`                        | Guard before `find`; original input retained through count and result projection                                 |
| Mongo `countMatchingItems`              | Guard before native `countDocuments` or cursor count; input/query identity must match                            |
| Mongo durable journal read              | Guard before find/count and projection before returning its envelope                                             |
| Generated result/access policies        | Composed owner projection before response; ordinary cache-hit policy path also projects before stop              |
| Standard cache get/put                  | Effective schema module privacy excludes standard public channels before engine selection                        |
| Canonical safe search / governed export | Their actual generated get traversal receives the same guard and projection                                      |

Mongo model preparation already assigns resolved `schema` to
`schemaModel.rawSchema` for both existing and newly created collections. No
provider-specific schema declaration copy or new registry is necessary.

The standard cache owner uses the existing Database Configuration `getRawSchema`
module map. If any effective schema in that module declares read protection,
schema/router/search cache channels and configured public channel mappings are
excluded for that module. Cache get returns an ordinary miss without inspecting
old values; put returns `{cacheable:false,reason:"schemaReadProtection"}`.
This conservatively reduces caching for unrelated reads in the same module.
Standard `consume` likewise returns an ordinary miss before engine selection;
`putVersioned` rejects the excluded public scope without implying an atomic write
acknowledgement. Authentication channels retain their original versioned-write
and consume contracts. Direct adapter calls are not these standard cache APIs.
It prevents old API-response cache entries from stopping before generated guards,
and prevents private admitted reads from contaminating public item caches.
Authentication channels retain their separate policy unless deliberately mapped
onto a public channel; such channel sharing needs installation review.

Exclusion does not erase old physical entries. It prevents their standard public
use. Physical retirement is a separately approved operation. Effective schema
preparation/readiness must precede public cache use; custom module aliases or
detached caches require qualification against the same authoritative schema map.

## Profile Composition And Independent Admissions

Contact, Employee, Customer, Enterprise, Password and Identity Migration Audit
declare the fixed Profile adapter with source
qualification false. It first invokes Contact `guardContactRead`, then Customer
Eligibility `protectRead`; results invoke Contact `redactContactRead` and then
Eligibility `redactDecision`, historical `redactRetirement` and Team
`redactEnterprise`. Team's strict provider-shape validation precedes less
restrictive projections. Enterprise additionally invokes the existing Consent
`redact` owner for top-level consent fields; its admission is independently held.
Composition runs on all six because recursive
results may contain another schema's evidence. Each existing domain owner keeps
its own exact-request WeakSet. No set is copied, overwritten or broadened.
Contact-private reads therefore retain Contact evidence but redact decision
evidence; decision-private reads retain decision evidence but redact Contact
evidence. A workflow needing both must obtain separately reviewed dual admission,
not infer it from a role or body marker. Historical and Team admissions likewise
retain only their respective evidence. The Team reader admits the exact original
request fingerprint and the one deterministic generated paging normalization
(page size -> limit, first page -> skip zero, snapshot and configured timeout).
Modified selectors, tenants, bounds and copied request objects do not match;
admission is removed in the existing callback finally block. Consent continuations
receive the original request, not an adapter clone.

Actual read exports are `getItems`, `getDurableJournalItems` and
`countMatchingItems`. There is no exported `getItem` or `findOne` read adapter in
the ordinary Mongo model; native collection methods remain outside this contract.
The durable reader guards before find and again before its post-cursor count,
then projects before returning. The count adapter counts the owner-filtered
`request.query`, not a stale original selector. Protected schemas require actual
native `countDocuments`; an externally supplied cursor count has no trustworthy
selector provenance and is conservatively refused. Unprotected schemas retain
their existing cursor count behavior. Mutation return snapshots from save/CAS
are write-owner contracts, not privacy-qualified read exports.

The query-guard claim is specific: Contact and Customer decision selectors are
guarded by their existing owners, and public historical audits receive the
existing fixed exclusion. Team and principal retirement composition here is
result redaction; it does not establish a universal all-private-field query or
count-inference policy. Consent's existing redactor handles top-level Enterprise
rows, not arbitrary nested consent objects. These boundaries must remain explicit
in installed privacy acceptance; no all-proof/all-provider qualification is claimed.

Customer/Employee association PATCH includes `authenticationIdentity` and
`identityLinkRetirement`, including dotted/operator/rename destinations, as
identity-affecting changes. Such changes inspect original retained Contacts even
with no contacts patch. Historical/private write admission cannot reinterpret
or transfer a retained Contact proof. Cross-record historical dependent inventory
and native retained decision checks remain with their respective historical and
decision owners; they must reject affected dependents before credential retirement.

## Installation Gates And Focused Evidence

This source closes the standard generated item-cache and actual Mongo query/count
adapter bypasses. It does not qualify every installation or all 37 batch items.
Raw native `find`/`countDocuments` called outside these adapters, alternative
providers, overridden cache/model methods, index ingestion and query paths,
cross-module route caching/aliases, custom serializers and attached BSON private
properties require explicit inventory and proof. Search-cache exclusion does
not redact index documents or authorize index publication. Existing Contact
redaction bounds/custom-scalar handling remain its domain owner's boundary;
an unsupported public serialization shape cannot be declared privacy-qualified.

Source inventory anchors: Mongo model preparation
`defaultMongodbDatabaseModelHandlerService.retrieveModel/createModel`;
Database generated get pipeline; `DefaultSchemaSafeQueryService.searchGenerated`;
`DataExportService.collectRecords`; generated nested child get; raw concurrency,
reference-integrity and bootstrap model reads; standard Request Handler
`lookupCache` -> Cache Service `get`; and configured schema/search cache channels.
Direct driver/index consumers must not be classified as protected generated reads.

Focused fixture:
`../../../../../../nodics.platform/modules/profile/test/protectedSchemaProviderReadContract.test.js`.
It exercises real source adapters with controlled provider doubles, denied
queries before find/count/cache, independent actual domain admissions, public
projection without row mutation, missing owners, ordinary-schema compatibility,
query identity, old standard cache exclusion and mapped public channels.
`verifiedContactInterceptorIntegration.test.js` additionally covers identity-only
PATCH rejection. Mocked fixture executions and static syntax/documentation checks
do not prove live provider privacy, distributed safety or installed acceptance.
All source and installed qualification remains false pending the joint session.
