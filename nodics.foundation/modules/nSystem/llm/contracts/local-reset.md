# Local reset contract

## Record Reset Is Not A Deployment Reset

The provider is a running, authenticated owner API for selected model records
and explicitly configured tenant search projections. It calls generated
`remove`, not physical database/collection/index drop. Its acknowledgement
does not establish an empty deployment, fresh schema/index state or cleared
authentication state. It does not enumerate or erase Redis security namespaces,
refresh sessions, principal stamps, external handoffs or provider media bytes.
Caller-supplied cache prefixes, database names or physical-drop flags cannot
expand the configured inventory. Model-owned invalidation during removal does
not imply complete auth-state cleanup.

A separately authorized disposable deployment rebuild must account for each
associated provider state before claiming freshness. Dropping persistence while
retaining versioned authentication state can correctly fail subsequent lower
revision principal writes. Preserve monotonic version checks: this failure is
not grounds to lower a cache version, disable CAS or erase security state during
runtime startup. Normal restart, import retry and retained-data acceptance must
never clear auth state automatically.

Before physical destruction, stop every participating writer through its owner;
use nTooling's [maintenance outage evidence](../../../nTooling/llm/contracts/tooling-governance-contracts.md#maintenance-outage-evidence)
and maintain exclusion of remote/custom writers. Resolve exact deployment
database targets and actual cache storage namespaces from effective owner
configuration, not name similarity or request input. Prove exclusive ownership
of any auth namespace, including all issuers and consumers; shared or unresolved
targets are blockers. Preserve shared cache, search and media state. Retained
projections/media are not automatically clean: either prove them irrelevant to
the selected deployment or declare residual state and defer full freshness.

Any approved provider-level recovery is a separate operator action, not an
extension of this reset receipt. Record explicit targets, authorization,
outage evidence, count-only before/after results, acknowledgements and failures;
omit key names, values, credentials and tokens. A previous observed key count
is not a future deletion inventory. Do not use global flush, wildcard database
drop or unscoped search deletion. Restart only after the whole approved scope
is reconciled; then verify startup, authentication and owner readiness separately.

The separate registered nTooling `project:local-reset-maintenance` entry now
composes provider-owned physical database drops and bounded exact auth-key
cleanup under an explicitly attested operator outage. It defaults to dry-run;
execution needs exact effective targets plus execution, exclusivity and writer
exclusion flags. This is not a distributed transaction or independent proof of
all external writers. Failed/uncertain effects and cleanup block completion;
counts, stage and scope remain available without provider secrets/key names.
The ordinary nSystem record-reset API never calls this destructive entry.
No customer runner, new registry or startup purge is introduced. See its
[owner boundaries](../../../nTooling/llm/contracts/tooling-governance-contracts.md#exact-local-reset-maintenance-preflight).
Neither operation may lower principal/cache revisions,
infer authority from caller flags or auto-clear security state during startup.

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
