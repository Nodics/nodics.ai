# wasteApi Contracts

Waste API owns secured generic routes. It must not expose partner-prefixed,
role-prefixed, Loyalty, Commerce coupon, or Location provider routes.

The read-only installed-data inspection route follows
[Waste Core's prerequisite contract](../../../wasteCore/llm/contracts/README.md#installed-evidence-inspection).
Its explicit human/admin inspection permission is independent of API exposure.
Reference records may be inspected; transactions expose only code and fingerprints.
No body-supplied tenant, query, grant, file path or release selector is accepted.

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
