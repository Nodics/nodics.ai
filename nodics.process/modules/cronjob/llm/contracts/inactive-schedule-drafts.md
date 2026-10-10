# Inactive Schedule Draft Contract

Reviewed lifecycle is independently enabled through `activationEnabled: false`
by default. `DefaultCronJobScheduleLifecycleService` rechecks the exact original
actor/draft, approved target and Process-published version, persists revision-CAS
intent before one runtime dispatch, then verifies the actual matching timer.
Never infer activation from a generic success string or missing pool entry.
Inspection/reconciliation never dispatch; explicit deactivation remains possible
with new activation disabled. Preserve local command exclusion so deactivation
cannot race a still-starting activation, while durable CAS remains authority.
Read the [activation guide](../../data/docs-v001/records/documentation/cronjobDocumentationComponentData.js#reviewed-activation-and-recovery)
and run `test/cronJobScheduleLifecycle.test.js` plus wrapper/runtime contracts.

Timer pipelines persist bookkeeping through the Cron runtime owner's bounded
`persistRuntimeState(job, model)` method. Its private wrapper binding is not a
browser marker or serializable grant. The method fixes tenant, code and node,
allowlists bookkeeping fields, uses canonical internal identity and requires one
matched native record. Human lifecycle intent/definition updates retain human
authority; Process targets retain fresh scoped runtime authority. Completion must
not acquire a new-work gate that would prevent draining jobs from recording results.

Functional owner: `nodics.process`; runtime owner: `cronjob`. Process retains
definition/version/trigger authority. Copilot retains source and policy admission.
Axis is an authorized renderer, never a scheduler or alternate target registry.

## Admission and Configuration

`cronjob.scheduleDrafts.enabled` defaults false; `targets` defaults empty. A later
deployment layer may select approved targets with exact `tenantCode` and
`enterpriseCode`, inert `code`/`label`, fixed `runOnNode`, Process `triggerCode`,
approved `expressions` and bounded flat `context`. No wildcard enterprise scope,
browser-supplied node, URL, handler, context, credentials, instance identity or
version override is accepted. The existing `cron` parser validates expressions;
deployment operators govern frequency and runtime timezone independently.

Limits: 100 configured targets, 24 unique expressions per target (120 characters
each), 16 flat context entries, 256-character context strings and 160-character
names/labels. Codes follow the canonical letter-led 128-character bound. Cron
provenance and principal/credential fields are forbidden context keys. Secret
values must never enter target configuration. Scoped target choices omit context.

Every entry point requires a verified human access principal, exact tenant,
nonempty enterprise/login identity and canonical `cronjob.lifecycle.manage`
permission evaluation. The controller forwards verified identity separately from
the body and marks responses no-store. Generic save access/ownership checks still
apply. The new route does not confer generic Cron CRUD or Process authority.

An approved target may additionally declare `sourceBinding` with exactly
`moduleName`, `sourceCode` and a 64-character lowercase SHA-256 `policyDigest`.
Its source and digest must equal `context.sourceCode` and
`context.expectedPolicyDigest`; malformed or extra binding keys reject the target.
The binding is included in scoped choices, review and the review identity. It is
an inert association, not source authorization or runtime callback qualification.
Unbound targets remain compatible with the general Cron workspace.

Knowledge's `copilot.knowledge.studio.sourceScheduleDraftsEnabled` defaults false.
When enabled, its inventory contributes the Cron surface only for current source
managers. Axis additionally requires authorized available Cron navigation and
connection, a manageable selected source with a fingerprint, and an exact
module/source/digest match. Unbound, foreign and stale targets are excluded in
this surface. No matching choice means no draft, not fallback to general targets.
Changing source or authenticated scope discards the transient review. Cron still
independently authorizes every request. Enabling this surface never activates a
job or enables provisioning in Cron.

## Review and Persistence

Under the normal Cron v0 API:

| Method | Relative Path | Effect |
| --- | --- | --- |
| GET | `/schedules/drafts/capabilities` | Approved scoped choices and owner copy |
| POST | `/schedules/drafts/preview` | Non-mutating review |
| POST | `/schedules/drafts` | One explicit inactive insert |
| POST | `/schedules/drafts/inspect` | Original save inspection, never replay |

Review accepts only `code`, `name`, `targetCode`, `expression`. Creation adds
`confirmed: true` and `reviewDigest`. Recompute the review from current effective
configuration and verified actor before save. The digest is a change detector,
not a signature, grant, durable approval record or activation token.

Use `DefaultCronJobService.save` with `options.insertOnly: true`. Persist NEW state
and status, `active: false`, `runOnInit: false`, zero priority, current start time,
fixed Process target/context and owner receipt metadata inside `jobDetail`.
Pass a distinct model copy so hook mutation cannot change the expected receipt.
Require a successful envelope and exactly one matching record, rejecting negative
acknowledgements at envelope, payload and row levels. No scheduler call, Process
execution, automatic retry, upsert or fallback to generic HTTP save is allowed.

The deployment must qualify the existing generated adapter and unique Cron code
index before enabling provisioning. This public schema cannot use the private
`DURABLE_JOURNAL` protocol. Insert-only semantics are not proof of failover
durability, distributed exactly-once execution or multi-record atomicity.

## Uncertain Outcomes

Any exception or malformed acknowledgement after save dispatch returns stable
`ERR_JOB_00011`; it never means the insert definitely failed. Inspect using the
original code and review digest. Read through the canonical generated owner with
exact receipt tenant, enterprise and actor predicates, bypassing item cache and
bounding the result to two records. Recheck the returned scope and immutable
definition fingerprint, not just the response code. Inspection remains available
after provisioning is disabled, but not after the actor loses authorization.

Only the original unchanged NEW inactive record yields `SAVED_INACTIVE`. Missing,
foreign, changed or activated definitions remain `OUTCOME_UNKNOWN`; malformed or
negative persistence results fail. Absence is not permission to insert again.
The fingerprint is stored owner evidence, not tamper-proof audit history. Existing
generic Cron administrators retain their separately governed edit authority.

Axis clears confirmation at dispatch, freezes a saved/uncertain draft, rejects
offline commands, and offers only original-save inspection after uncertainty.
Transient state is scoped to the credential, enterprise and exact connection;
it is not persisted in browser storage. Leaving/reloading the page loses that
transient review, so operators must retain the original receipt through approved
operational evidence before leaving an unresolved save.

## Verification and Extension

Extend only approved target configuration or owner presentation in a later module;
do not copy this service into a customer kickoff module. Preserve all denials,
limits and protocol versions in alternate implementations. Run
`test/cronJobScheduleDraft.test.js`, route/controller/runtime Cron tests and
Process trigger tests. Axis coverage lives in `test/cron/CronScheduleDraftPanel.test.tsx`.
Test current configuration drift, a lost acknowledgement, negative/multiple/count
responses, real inactive activator behavior and original-scope inspection.

See the canonical [operator and customization guide](../../data/docs-v001/records/documentation/cronjobDocumentationComponentData.js).
