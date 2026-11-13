# Recorded release preparation

The Import owner provides bounded, operator-driven continuation of one immutable release plan. It does not orchestrate publication, approval, compensation or cross-domain workflows; those retain their existing owners and Process contracts.

## API and authority

The existing POST `/{init|core|sample}/install` accepts optional `continuation: true` and `executionCode`. All native route permissions, destination, tenant, exact-release, prerequisite and installer admission still apply. The response carries the owner catalogue and execution evidence. One call dispatches at most one pending release. Existing synchronous clients retain their contract when continuation is omitted.

GET `/{type}/executions` lists the current native operator's plans for this runtime, project, environment, tenant and enterprise. GET `/{type}/executions/:executionCode` reads one same-scope receipt. Neither GET executes, creates, reconciles or retries work. The list uses `data.dataReleases.continuationHistoryLimit` (Framework default 20; validated maximum 100). A current permission projection controls presentation; every continuation reauthorizes the actual command.

The immutable plan includes ordered release codes, versions, checksums and foreign receipt-only prerequisite references. The deterministic receipt binds that plan to the authenticated scope. A caller cannot supply a plan object, persistence model, actor, execution admission or destination. A pinned execution code must match the requalified current source exactly. No credential or bearer token is persisted.

## Persistence and recovery

`dataReleaseExecutionRecord` is a router-disabled, administrator-policy generated model with a unique code and database-managed revision. Native command admission precedes internal evidence persistence. Begin is insert-only; competing starts cannot overwrite a receipt. Before an import effect, a revision-fenced intent changes exactly one pending step to RUNNING. Only a matching installation CURRENT receipt with the same execution ID, release version and checksum acknowledges completion. Custom installers may have no ordinary importRun ID; their exact installation receipt remains required.

READY permits one next stage. COMPLETED is an idempotent readback. RUNNING or UNCERTAIN never redispatches a release. A continuation in those states may reconcile a subsequently established exact owner receipt and returns without dispatching another stage. Missing, failed, foreign or mismatched receipts stay inspection-only. There is no elapsed-time takeover, queue worker, blind retry, or promise of row-level recovery from an importer killed mid-write. Explicit repair remains a separate governed owner operation.

Read-only validation can attach the original actor's existing execution without creating evidence. Dry-run impact remains the importer's actual available release/record evidence; continuation does not invent create/update counts.

## Consumers

Axis reads catalogue continuation support before choosing this mode, shows recorded preparations on the same import workbench, and reloads receipts from the owner. Continue and reconciliation require explicit user actions; refresh is GET-only. An uncertain response triggers inspection, with no mutation retry. Setup preparation can select the same mode for a compatible owner group, retaining completed releases in the plan and returning after one stage. Publication remains a separate action.

## Qualification

The owner tests cover reload, a new service instance, concurrency, failed intent persistence, source changes, actor/tenant/service denials, revocation and lost acknowledgement. Live acceptance must additionally retain exact owner receipts, record identities and write timestamps before/after a real restart, plus Axis evidence. Source-only checks do not close that acceptance.
