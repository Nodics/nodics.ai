# copilotKnowledge Agents

Read [runtime knowledge configuration](llm/contracts/runtime-knowledge-configuration-contract.md).
Keep source defaults empty and discover candidates through nConfig's active graph.
Do not add application source catalogs or parallel persistence. Selecting a parent
never selects child modules; preserve durable runtime governance and migration.

Dedicated legacy retirement requires current access to every configured
replacement source, exact physical replacement count and sealed publication,
independent read/execute grants, a private Discovery original claim, and native
nSearch barrier acknowledgement. Follow the canonical Knowledge Progress and
Recovery guide. Keep defaults disabled and plans empty. Physical erasure is a
separate reviewed, independently permissioned command after provider-qualified
writer decommissioning; never infer unknown writers, change credentials or infer
original deletion acknowledgement from absence. Unknown/mixed writer mechanisms
cannot use the API-key-only qualification. Preserve the original erasure claim
after any failure and permit inspection with write gates off.
Run `test/copilotKnowledgeMigration.test.js` with the existing generation tests.
Migration refusals use their own bounded `ERR_CPK_00025` status, not the pending
refresh recovery status. Preserve private details and inspection-first guidance.
Migration permissions must be declared in nAuth's canonical
`identityGovernance.permissionCatalog` so Profile can validate scoped operator
groups. A catalogue entry does not grant permission to any default role or enable
commands. Run `test/copilotMigrationPermissionCatalog.test.js` through the real
nConfig merge and Profile group validator; do not bypass group governance in
acceptance fixtures. The opt-in `test/copilotErasureRuntime.live.test.js` composes
a disposable real backend through nTooling and provider-owned test helpers.

Recorded manual refresh follows `llm/examples/recorded-manual-refresh.md`. Reuse
Process starts and exact original-attempt inspection, never a Copilot job store.
Bind scope/actor/source/UUID independently of mutable version/policy. Fresh review,
explicit confirmation, one dispatch, current source access and independent SYSTEM
callback admission are mandatory. Enabled recorded-manual mode must block the old
synchronous endpoint. Do not backfill legacy history or retry uncertain commands.

Maintenance inspection follows `llm/examples/maintenance-receipts.md`. Preserve
independent read grants and exact current source/tenant/enterprise scope. Reads
remain available with write gates disabled, never imply completion from an
authorization receipt, and never expose private review/index identifiers or
enable command replay. Recheck authority after bounded uncached persistence.

Source events follow `llm/examples/source-events-and-incremental-refresh.md`.
Preserve explicit signed publishers, exact assignments, independent notification
and source grants, current groups, single nService dispatch and canonical Process
start/replay. Stable event identity excludes mutable version/policy. Never add
another job/event store. Incremental mode must scan and secret-inspect before
reusing a physically verified stable current generation; legacy fingerprints
cannot be inferred. Changed sources are complete replacements, not file deltas.

Writer recovery follows `llm/examples/pending-writer-recovery.md`. It must remain
default-disabled, independently permissioned, reviewed, age-bounded and audited.
Use Discovery abandonment CAS with a fresh caller-policy guard. Never equate
retirement with stopping workers, removing indexed bytes or successful refresh.
An unknown command or audit result cannot authorize replay.

Every generation-mode projection write uses Discovery's durable start/completion
claim; seal after the exact acknowledged count before publication. Explicit
cleanup can select retired IDLE/SEALED writers only through Discovery's selection
contract. WRITING, legacy and unclassified tokens remain blocked. A late original
completion records quiescence but never adopts a different pending generation.
Policy failure or lost acknowledgement after a write claim remains uncertain;
elapsed time is not physical-write completion evidence.

Generation-mode infrastructure readiness must remain awaited, employee-scoped and
bounded, with physical count evidence. Never substitute process-local reports,
expose hidden-source counts, infer job failures from generation state or label a
capped window complete. BackOffice only aggregates the owner result. Preserve
the synchronous legacy-mode contract and test both modes.

Reviewed cleanup follows `llm/examples/reviewed-cleanup.md`. Require both source
management and independent cleanup permission. Discovery proves published-origin
eligibility; never infer it for old/abandoned debt. Persist exact authorization
and completion receipts through private generated maintenance persistence, and
never report completion after an uncertain index or audit acknowledgement.

Generation mode follows `llm/examples/generation-publication.md`. Discovery
Publication owns private manifests/CAS; nSearch owns physical projection work.
Filter the active generation before and after retrieval. Never fall back to
unqualified chunks, steal uncertain writers by elapsed time, or call an old
generation deletion a complete legacy migration. Strict UTF-8 text decoding and
NUL rejection apply to every supported repository text extension.

Durable refresh inspection uses Process-owned private attempt evidence, never a Copilot job
store. Read `llm/examples/refresh-execution-history.md`. Preserve current source
permissions before and after the read, service runtime scope and strict response
minimization. V2 records individual attempts across the configured definition's
versions; legacy instances and old synchronous manual refreshes are not backfilled. Attempt
history is not index readiness proof; uncertain executions never become retries.
Require recorded claims and accept only bounded canonical Cron/Process metadata
alongside source/digest input. Automatic cleanup selects published-origin debt only.
Reject claim envelopes containing any contradictory failure/error/acknowledgement
at either the outer response or execution payload before invoking ingestion.
Repository `**/*` includes supported authored files at every depth; unsupported
extensions and generated outputs must not consume the accepted-file budget.

Conversational live evidence preserves the database/incident owners, original
employee and caller-selected groups. Do not send records to a model, index them,
infer mutations or replay queries automatically. Read
`llm/examples/live-evidence-conversation.md` and run its focused regressions.

Scheduled refresh uses Process single-use action claims and Cronjob schedule
ownership. Read `llm/examples/process-backed-refresh.md` and run its focused test
plus group/ingestion regressions. Service automation requires explicit SYSTEM
source admission and current service permissions; never synthesize employee
grants or create a Copilot job store. A resolved nSearch save with errors is not
successful projection evidence.

DATABASE sources are live domain reads, never static index ingestion. Preserve
original employee credentials, explicit tenant/enterprise/environment scopes,
current schema discovery, collection exclusions, advertised safe-search routes,
and record/field authorization. Follow `llm/examples/live-database-sources.md`.
Validate each descriptor's module against the selected source and accept only
active canonical `/<schema-lowercase>/safe-search` POST reads with an advertised
API version. A descriptor cannot substitute a write or another collection's path.
Conversational `copilot.data.collections` uses the existing inventory with an
empty input object and displays selected entries only, never records or excluded
collection labels. Preserve no-model execution/history, replay and recording-off
behavior; test these with the database and live-conversation suites.

Selected `copilot.data.schema`, `copilot.data.capabilities` and
`copilot.data.deleteImpact` use the same source admission, fixed canonical native
inspection and original bearer, never an arbitrary operation dispatcher. Impact
requires independent mutation-prepare admission and native delete advertisement;
it neither mutates nor grants deletion. Recheck grants after each awaited native
call. Return bounded field metadata or target-count/blocked summary only, without
defaults, related schema names or native routes. Preserve no-model history and
recording/replay rules. Read the live-evidence guide and run source, conversation
and opt-in native Database tests; a readable enterprise need not permit impact.

Runtime-bound sources use nConfig's existing indexed modules only. Preserve
canonical repository containment and invalidate fingerprints after order changes.
Do not scan dependency folders to invent another active hierarchy. Read
`llm/examples/runtime-source-partitions.md` and its focused contract test.

External logs follow `llm/examples/external-incident-evidence.md`: Discovery owns
registration, observability owns authorization/redaction/audit, and Copilot owns
bounded source/group intersection and evidence checks. Never ingest EXTERNAL_LOG
as static corpus content. Require explicit scope, window, receipt and coverage.

Index chunks carry a normalized source-policy fingerprint. Retrieval filters it
before Discovery and rechecks returned results. Exclusion changes invalidate old
chunks even at the same version; legacy chunks need refresh, never a fallback.
Enterprise activeGroupCodes only narrow groupCodes; an empty list selects none.

When `knowledge.groups.enabled` is true, apply the group/enterprise intersection
to source inventory, employee preview/refresh, status and retrieval. Never fall
back to the unrestricted registry after a configuration or selection error.
Read `llm/examples/knowledge-groups.md` and run `test/copilotKnowledgeGroups.test.js`.
Group configuration selects runtime sources; nPublish retains revision activation.

## Inheritance

- Follow the repository agent contract: `../../../AGENTS.md`.
- Follow the Copilot parent contract: `../../AGENTS.md`.
- Follow global AI/development guidance:
  `../../../nodics.foundation/modules/nSetup/llm/ai-enablement-index.md`.
- Read every applicable ancestor `AGENTS.md` from root to this module before editing.
- Read this module `README.md`, `llm/contracts`, `llm/examples`, and generated context.

This generated capability boundary must preserve Nodics structure, layering, configuration-first behavior, override/customization contracts, tests, documentation, and generated-artifact discipline.

Before registering or retrieving any source, read
`llm/contracts/secure-source-registry-contract.md`,
`llm/contracts/secure-ingestion-and-retrieval-contract.md`, and the parent
`../../llm/contracts/copilot-security-governance-contract.md`. Every source
must be explicitly classified, channel-scoped, provenance-bearing, and subject
to required secret scanning. Missing or weak metadata fails closed. Discovery
and its indexes are derived projections; neither may become authorization
authority or return a chunk outside the policy-produced query scope.

Repository ingestion is permitted only through the registered bounded
repository provider and only for non-public sources. Public documentation must
come from an owning publication-aware provider that proves Online/public state;
repository Markdown is never public merely because it is documentation. Every
file passes secret inspection before chunking. Every query is filtered before
Discovery execution and every returned record is reauthorized before evidence
assembly.

Before implementing non-trivial behavior here, record the business outcome, owning layer, studied sources, current implementation, extension path, security/tenant/data/API/release impact, intended files, and validation route.

Employee refresh and preview require current source visibility as well as source
management permission before service delegation. Bind diagnostics to index tenant
and source; dry-run success/failure must not change active refresh evidence.
Unknown process-local status is not an empty durable index. Follow the source
inventory/preview section of the secure ingestion contract and its Studio guide.

Repository ingestion excludes standard server-generated service/controller/facade `gen` directories and `generated` output before counting files. These are derived copies, not authored repository knowledge. Preserve the existing classification, secret inspection and file/byte bounds; a generated build must not exhaust a source partition budget.
