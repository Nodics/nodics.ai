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

## Capability-owned inventories

Each owning module may contribute a keyed inventory under
`localResetProvider.contributions.<module>.serviceNames`. These declarations are
inert. A later server selects its allowed capabilities through
`localResetProvider.modules: { inventory: true, cms: false }`. Do not infer this
selection from every loaded module or discover models/collections dynamically.

The existing provider combines selected inventories and any explicit
`serviceNames`, then applies keyed `serviceOverrides`. `false` removes one inherited
service; `true` explicitly adds one. Unknown selected inventories and malformed
maps fail before mutation. Resolved names are unique and sorted. Service ordering
is not a dependency or transactional rollback contract; capabilities with dependent
recovery must use their existing owning operation instead of assuming reset order.

Keep `enabled`, `environmentAllowlist`, confirmation, service-token authentication,
maximum size and `requiredServiceNames` checks on the final resolved inventory.
Removing a required name is rejected before deletion. Adding an inventory never
enables a reset. Request-body module names cannot expand server policy. Missing
optional models follow the explicit existing `allowMissingModelServices` setting;
that setting does not make a missing selected inventory valid.

For example, an Inventory module declares its stock and adjustment model services.
A Local server selects Inventory and can disable the optional adjustment service
through a later keyed override. A Production server remains disabled. A selected
CMS inventory is never inferred merely because the same repository contains CMS.
Search projection targets retain their explicit module/index allowlist.

## Inventory scope and optional compositions

Maintain missing service inventories with the model-owning capability. A server may replace repeated active model names with a selected inventory only after comparing the resolved service set. Preserve explicit optional/historical cleanup names when their owner is inactive; absence from today's graph is not proof that historical cleanup can be removed. Optional accelerator selections follow the same environment composition that activates their inventory. Do not weaken unknown-inventory rejection to hide an invalid selection. Common provider transport defaults never infer new reset targets.
