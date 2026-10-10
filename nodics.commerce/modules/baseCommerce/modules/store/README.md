# Store

Store, Sales Channel and Point of Service delegate technical `revision` counters
to generated nDatabase CRUD. Core data files omit the counter. Edits retain the
original read token; no-op saves leave it unchanged. This does not change domain
or publication versions. See the Foundation Data Modeling documentation for
project customization and conflict recovery.

Merchant outlet reads preserve original staff authority through Store's private
generated-read admission. The first Mongo envelope is projected before generated
get supplies its success code; the final response must still confirm `SUC_`, exact
count and genuine projection. See [Narrow Merchant Outlet Reads](llm/contracts/README.md#narrow-merchant-outlet-reads).
Run `node --test nodics.commerce/modules/baseCommerce/modules/store/test/merchant*Contract.test.js`
for isolated admission and actual generated-pipeline regressions, not native qualification.

Store is its named Commerce capability boundary. Reusable contracts and behavior belong to this named capability boundary. Archived gComm is reference-only.

Store owns the optional operational `store:core-reference` release declared in
`data/manifest.json`, including Store, Sales Channel and Point of Service records
under `data/core-v001`. The historical `baseCommerce*` filenames are retained for
stable header prefixes; they do not make the composition-only parent the owner.
Axis derives the release selection from this manifest and its COMMERCE destination.
This business release does not install documentation or approve publication.

Points of service may be online or physical. The `locationRef` association is
optional for general records, so Commerce activation does not depend on Location.
Physical-place operations must validate a real reference when they need one.
Projects can strengthen the property through an existing later-loaded schema
overlay; their activation data must satisfy that effective schema.

Run `node --test nodics.commerce/modules/baseCommerce/modules/store/test/coreReferenceLocationContract.test.js`
from the framework root. See the local Store contract and the Base Commerce
documentation for customization and recovery.

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

This capability declares an inert model-service inventory for [governed Local reset](../../../../../nodics.foundation/modules/nSystem/llm/contracts/local-reset.md).
A server must explicitly select it; contributions never enable reset or bypass tenant, environment, confirmation or required-service checks.
