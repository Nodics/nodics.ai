# Store contracts

`DefaultStoreContextService.resolveMerchantStore` admits exactly one active,
tenant-consistent revisioned outlet with canonical Profile enterprise association.
For human merchant operations it uses `DefaultStoreMerchantReadService.read`;
service callers retain their existing generated Store access. Caller storeCode is
a selector, not evidence. Digital Core remains the authority for fresh signed
staff permission and Profile STORE scope; Promotion owns coupon eligibility.
This source contract remains unqualified pending joint installed-owner acceptance.

## Narrow Merchant Outlet Reads

`DefaultStoreMerchantReadService.list/read` invokes Digital Core's canonical
`staff` owner with the original bearer, identity and enterprise aliases. Neither
caller-provided scopes nor an operator role are substitutes. Workspace derives
at most 100 unique exact Store codes from direct Profile STORE ALLOW scopes,
applies capability/permission/tenant/enterprise qualifiers and DENY precedence,
and reads each selected Store independently. GLOBAL/TENANT/ENTERPRISE ALLOW alone
never enumerates Store records. Known matching denials prevent the query. Actual
Store enterprise association is checked against fresh Profile authority before
any result leaves the generated read owner; an unqualified enterprise reference
cannot reveal a foreign Store record. Scope revocation during the read refuses.

Only Store gains `commerceMerchantUserGroup:1` (read access). Sales Channel, Point
of Service, writes and the common `tenantOwned` policy are unchanged. Store's
`readProtection` selects this owner in the existing generated pre-cache/query/
count and result/export hooks. A narrow caller needs the exact short-lived
in-flight owner request, unchanged original authentication and equality selector.
Copies, arbitrary queries, generic exports, forged scopes and expired admissions
refuse. Generated schema access and later-layer narrowing still apply; no runtime
admin, operator, service identity or privileged schema-access bypass is created.

Generated result protection refreshes Profile and retains only code, tenant,
name, ACTIVE status, revision and canonical enterprise reference. Workspace
returns code/name/revision only. Raw location, currency and custom Store fields
are not part of the merchant projection. Ordinary effective admin/operator/
service read grants retain their original Store access without Digital admission.
Missing Digital/Store protection owners fail closed for narrow merchant callers.

Mongo invokes the protected result hook on its raw `query/options/count/result`
envelope before the generated get initializer adds `SUC_FIND_00000`. Only the
first projection on the exact live private read may omit `code`: the prepared
receiver and query/options object references must still be the original ones.
Any present code must be a string success code; even an explicitly undefined
code is not omission. Failure flags, negative acknowledgements, malformed error
lists, mismatched count/rows and foreign or revoked scope still refuse. A later
projection cannot reuse the omission. The final `readSelected` response always
requires a string `SUC_` code and the private projection checkpoint; callers and
arbitrary service overrides cannot obtain admission by returning a code-less
envelope, copying a request or supplying a flag. Do not rewrite generic identity
or weaken generated schema access to accommodate provider envelope timing.

The cross-owner call is a fixed operation boundary: Store reuses Digital Core's
existing merchant authority parser rather than copying Profile scope resolution
or maintaining a second permission registry. There is no new route, credential,
role installation, schema migration or qualification switch. Restart/generate
the effective owner sources normally before native testing.

Run `node --test nodics.commerce/modules/baseCommerce/modules/store/test/merchantReadAdmissionContract.test.js`
from the framework root. These fixtures exercise real named schema policies,
generated read access, option normalization and protected-read hooks plus real
Digital staff/scope parsing against a controlled Profile response. They are not
live Profile, database, private-capture or end-to-end qualification.

`test/merchantGeneratedPipelineContract.test.js` additionally compiles the
canonical generated Store service and executes the real pipeline engine,
initializer, Mongo adapter and Store protection hooks with controlled external
Profile and cursor/count fixtures. It checks both raw and final envelopes,
unchanged normalized search-option identity, private-field projection, absent
records, code/error/count failures, copied requests, substituted receivers,
fresh scope denial, expired admission and strict final acknowledgement. This
integration regression does not start servers, access a database or qualify a
deployment; native workspace acceptance remains separate.

Store master-data technical counters are framework-managed through the existing
effective `backoffice.concurrency` metadata. Never manually increment them or
author them in core records. Preserve scalar identity, original read tokens,
generated access policies, and provider atomic writes. Do not opt out in a
project merely to suppress genuine conflicts; replacing counter ownership
requires a reviewed, tested domain write contract for every caller.

Store owns selling-context schemas and services for stores, sales channels, and
points of service. Profile owns enterprise/address facts; Location owns physical
places. Preserve their reference metadata without copying their fields.

General `pointOfService.locationRef` is optional. An online service point is a
valid Commerce context without a physical place; required Commerce reference
data must import without activating Location. A physical-location operation must
require a valid authorized reference before executing. Optional storage is not
permission to invent a place or bypass an operation's prerequisites.

Later-loaded project schemas may make `locationRef.required` true when every
service point in that project is physical. Such a project must provide valid
references in its effective activation data and prove both rejection without a
reference and acceptance with one. Use existing schema/data layers, not a new
dependency configuration or direct database writes. Runtime restart refreshes
the generated collection validator without dropping records.

## Explicit store reference resolution

`DefaultStoreContextService.resolveStoreCode(request, persistedStoreCode?)`
validates store identifiers used by Cart and Shopping List without a new layer.
It accepts a non-empty string from request context, payload or query; a supplied
persisted reference comes from an already-authorized record. All values must
agree. Missing, non-string, blank and surrounding-whitespace values fail with
Foundation validation code `ERR_SYS_00001` when Nodics errors are available.
There is no configuration fallback or customer identity in this resolver.

This operation only validates identifier shape and agreement. Existing `resolve`
validates supplied active tenant-scoped Store/Channel master records. Neither
operation grants permissions, invents records or fetches them with elevated
credentials. Later layers may tighten the effective exported methods; Cart and
Shopping List resolve this service through the normal service registry.

Test the Commerce foundation and Cart/Shopping List customer API contracts,
including missing context, mismatches, independent stores and persisted IDs.
