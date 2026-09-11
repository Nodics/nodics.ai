# Local reset contract

`DefaultLocalResetProviderService` is disabled unless the environment and exact
confirmation are configured. Only service tokens may call the provider. The
human-facing Platform coordinator retains authorization and reset auditing.

A server may declare `localResetProvider.searchIndexes: [{ moduleName: "product",
indexName: "productLocalized" }]`. Targets come exclusively from layered server
configuration and the active nSearch model registry. The default maximum is 32;
duplicates, invalid names and missing operations fail before model deletion.
Do not add raw database, provider, network or index discovery paths here.

The provider removes only `{ tenant: request.tenant }`, refreshes visibility and
invalidates each search resource cache through existing owning services. It
returns sanitized module/index identifiers with the model-service receipt.
Caller-supplied index targets are ignored. Production environments stay denied.

A search provider failure after model removal is a partial reset and must never be
reported as a fresh baseline. Restore provider readiness and repeat the governed
reset, then verify empty catalogue/publication state through application APIs.
A later server layer can extend the static allowlist; it must preserve tenant,
service-token, confirmation, cache invalidation and failure acknowledgement rules.
