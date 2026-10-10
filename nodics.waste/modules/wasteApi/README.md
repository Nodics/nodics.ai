# Waste API

`wasteApi` exposes secured, generic Waste capability routes for framework and
partner integrations.

Tenant maintainers can use the read-only
[`installed-data/inspect` operation](../wasteCore/llm/contracts/README.md#installed-evidence-inspection)
to qualify reference upgrades without enabling generated schema CRUD routes.
It requires separate inspection authority; it neither imports nor authorizes migration.

The current API surface is intentionally internal and resource-oriented. It
proves the generic Waste contract without creating customer/public journey
routes inside the framework layer.

| Operation | Method | Route key | Purpose |
| --- | --- | --- | --- |
| `collectionAcceptanceCheck` | `POST` | `/waste/collection-points/:collectionPointCode/acceptance-check` | Check submitted waste facts against schema-driven acceptance rules. |
| `submitWaste` | `POST` | `/waste/submissions` | Create or submit a generic waste submission. |
| `transitionSubmission` | `POST` | `/waste/submissions/:submissionCode/transitions` | Apply the generic submission lifecycle. |
| `calculateImpact` | `POST` | `/waste/impact-results` | Calculate impact metrics from a versioned profile and source facts. |

Project-facing APIs, branded mobile journeys, recycler integrations, logistics
callbacks, public collection discovery, and reward-trigger endpoints belong in
later project or integration modules that extend this route set. They should
reference Waste records by stable code or source reference instead of changing
the framework API owner.

Impact calculation awaits the effective `DefaultWasteImpactCalculationService`
from `SERVICE`, including configured asynchronous providers. Trusted tenant
context comes from the authenticated controller envelope; payload fields cannot
select tenant configuration or adapters. See the
[impact provider guide](../../../nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js).

Route-category defaults belong to this capability; deployments supply only intentional overrides.
Preserve nRouter enforcement and independent route authorization. See [exposure ownership](../../../nodics.foundation/modules/nRouter/llm/contracts/README.md#capability-owned-exposure-defaults).

## Canonical Waste Acceptance

Waste API owns the protected `acceptance:waste-management` command and its
complete exported suite. Customer fixture data is supplied through effective
WASTE runtime `tooling.acceptance.wasteManagement.fixture`, resolved by nConfig.
Declarative fixture properties contain `dataModule`, `ruleRecordsPath`,
`impactProfileRecordsPath` and `impactProfileCode`. The existing module registry
must identify exactly one owner. Paths are owner-relative JS/JSON data files;
absolute paths, traversal and realpath/symlink escapes fail closed. These files
are trusted module source, not an untrusted-code sandbox. Properties must not
load records with require or Object.values. The pure exported runner continues
to accept materialized `rules` and `impactProfile` for isolated tests.
Other required fields are `collectionPoint`, `facts`,
`expectedMetrics` (metricCode/string value pairs),
`requiresReceipt`, `submissionCode`, `resultCode`, and `runId`; `now` is optional.
Use a distinct runId for a new run and preserve it for a deliberate retry.

Default execution validates inputs and prints a plan. Only `--execute` calls
the secured API journey. PLATFORM and WASTE must already be running.
Employee credentials authorize collection/submission operations; the service-only
impact operation requires explicitly supplied `NODICS_WASTE_IMPACT_SERVICE_TOKEN`.
Missing permission or service authority is an error, never an invitation to
modify identity, issue credentials, call internal controllers, or build database
models manually. Help and module imports are inert.

The journey proves acceptance, receipt policy, SUBMITTED -> UNDER_REVIEW ->
APPROVED transitions, exact impact metric identities/values and ownership bounds.
It reports `SECURED_WASTE_API_CONTRACT`, not durable submission persistence.
The present generic facade returns contracts; it does not persist that journey.
Data installation and exact release CURRENT verification remain nImport-owned
gates. Accelerator manifest/header/record checks remain accelerator-owned tests;
customer overlay records and expected values remain customer-owned.

Isolated tests execute the real domain facade with injected transport, alternate
partner fixtures, denied authority, bad lifecycle and mismatched impact values.
They are not live router, import or database evidence. Former customer scripts'
manual bootstrap/generated-model/import paths are intentionally not relocated.
Operators must run separate authorized import/persistence acceptance before
claiming that evidence. No reset, force-current import, or Docker run is implied.
