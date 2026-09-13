# Store contracts

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
