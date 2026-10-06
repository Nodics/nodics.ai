# Persistent Local Conversation Acceptance

## Purpose and Ownership

This opt-in test exercises real employee authentication, published knowledge,
local Ollama, generated conversation persistence and measured provider accounting.
It is backend acceptance, not a browser or full business-operation qualification.
Core orchestrates; Profile authenticates; Knowledge and Discovery retrieve;
Conversation stores permitted history; Providers reserves and settles usage.

```text
Profile login -> Copilot HTTP turn -> authorized published evidence
                                 -> budget reservation -> local Ollama
                                 -> measured accounting + conversation owner
Runtime restart -> Profile login -> original history and original usage
Recording off -> request-only answer; no stored transcript; accounting retained
```

## Prerequisites

1. Use the supported framework Node runtime and installed dependencies.
2. Start a local MongoDB replica set. Supply its loopback URI explicitly below.
3. Install the Elasticsearch distribution used by the provider-owned isolated
   fixture and local Redis. Do not weaken a shared provider to run this test.
4. Start local Ollama with `qwen2.5-coder:7b`, or select an installed model through
   `NODICS_COPILOT_LOCAL_MODEL`. No external model service is contacted.
5. Run from the framework root, with no production credentials in the shell.

```bash
NODICS_COPILOT_PERSISTENT_ACCEPTANCE=1 \
NODICS_ERASURE_ES_HOME=/opt/homebrew/opt/elasticsearch-full/libexec \
NODICS_ERASURE_MONGO_URI='mongodb://127.0.0.1:27017/?replicaSet=nodicsLocal' \
node --test nodics.copilot/modules/copilotCore/test/copilotPersistentRuntime.live.test.js
```

Without the explicit opt-in, the ordinary source suite skips this test. A skip is
not a live acceptance pass. The runner creates and removes only its own random
database, secured provider, Redis process and temporary runtime composition.

## Scenario Walkthrough

1. Provision scoped synthetic employees through Profile's generated lifecycle.
2. Authenticate the operator through the actual employee HTTP route.
3. Check local provider health and publish one synthetic README through Knowledge.
   Repeat the unchanged refresh with incremental mode enabled; require zero
   rewritten chunks and the same physically verified generation.
4. Retire the fixture's legacy index with erasure still disabled. Require refusal
   of erasure review, revoke only its known writer, then enable erasure through
   authored configuration and a real rebuild/restart. Reauthenticate and execute
   reviewed erasure. Require `ERASED` and an unaffected separate sentinel. Create
   a conversation and ask for the replacement's synthetic collection colour.
5. Require a completed turn, a published-source citation and the expected answer.
6. Read usage: one measured call, positive consumed tokens, no outstanding reserve.
7. Replay the same idempotency key: require the original turn and unchanged usage.
8. Authenticate the reader. Foreign history must return a bounded 404;
   enterprise usage without its independent grant must return 403.
9. Submit a reader turn with a zero allocation. Require 429 and zero provider calls.
10. Restart the actual framework process, retaining the owned persistence.
    Reauthenticate and compare original conversation and accounting evidence.
11. Disable recording in the fixture's authored conversation configuration and
    rebuild/restart. Submit a new question: receive the answer through
    `REQUEST_ONLY` delivery, with no stored title, question or replayable answer.
12. Replay that completed request: no second content delivery or provider charge.
13. Restart again. Verify unrecorded history remains content-free and measured
    usage remains durable. Ordinary previously recorded content is not implicitly
    deleted when recording is disabled.

## Administrative and Source Access Checks

1. Authenticate the metadata-only administrator. List activity and find the
   conversation identifier, but require no title or message text. Direct
   transcript inspection must return 403 without its independent grant.
2. Authenticate the scoped transcript reviewer. Inspect the operator conversation;
   require only permitted user/assistant messages and an inspection receipt.
   Inspect again and require a new receipt, not a reused audit acknowledgement.
3. Authenticate the foreign-enterprise reviewer. Require an empty activity list
   and refusal of the other enterprise's transcript even with inspection grants.
4. Authenticate an employee without the source grant. Ask the same question;
   require insufficient evidence, no citations and no provider calls.
5. Select no knowledge groups explicitly as the authorized operator. Require the
   same evidence refusal and unchanged usage.
6. Remove the source from the enterprise group ceiling through the fixture's
   authored configuration, rebuild and restart. Without a request-level empty
   selection, require refusal and unchanged usage. Restore the original ceiling.
7. With recording disabled, inspect as the reviewer. Require a non-recorded
   conversation with no messages or private question text. Accounting remains.

The fixture provides separate operator, reader, source-denied, metadata-only,
transcript-reviewer and foreign-enterprise identities. These are test-only
Profile groups, not changes to default enterprise roles.

## Configuration and Failure Interpretation

The fixture selects only test-specific provider, budget, source and persistence
values through normal configuration layering. Never copy its private temporary
credentials into application configuration. A provider outage or missing model
must fail the live test; do not replace the response with a stub to obtain a pass.
Model token totals can vary, so assertions check measured accounting invariants
rather than a hardcoded token count.

A missing conversation and another employee's inaccessible conversation use the
same bounded API 404. This does not expose a private identifier or translate
unrelated storage failures into not-found results.

Recording-off disables transcript retention, not mandatory minimal usage and
operational records. This test does not certify retention deletion,
multi-runtime reconciliation, database failover, external log
lake integration or native mutation execution. Those need their own scenarios.

For the administrator/operator's disposable backend and separate browser setup,
see [authenticated erasure acceptance](../../../copilotKnowledge/llm/examples/authenticated-erasure-acceptance.md).

## Provider, Allocation and Recovery Acceptance

Use the same environment variables above with these individual Node test files
under this module's `test/` directory. Each invocation owns its disposable runtime
and tears it down on success or failure. Do not sum overlapping source-suite and
opt-in totals as independent scenarios.

| File | Real boundary exercised |
| --- | --- |
| `copilotProviderFailureRuntime.live.test.js` | Actual Ollama missing model, owned HTTP 503/hung transport, invalid profile, bounded health, failed original turn and retained unknown usage |
| `copilotBudgetRuntime.live.test.js` | Measured Ollama call, scoped allocation preview/confirmation, ceiling refusal, concurrent revision conflict, idempotent audit, restart and no-charge zero-budget refusal |
| `copilotReconciliationRuntime.live.test.js` | Actual measurement receipt followed by controlled settlement failure, authenticated evidence-bound repair, denied/altered commands and restart without another model call |
| `copilotConfigurationRuntime.live.test.js` | nSystem request/approval/activation, durable model setting, delegated Copilot allocation narrowing, denied global-provider editing and stale-revision refusal |
| `copilotRetentionRuntime.live.test.js` | Real journaled transactions, governed holds, stop/resume, closure, purged tombstone and separate audit retention with protected-row preservation |

Provider fault transports never fabricate successful answers or token receipts.
The reconciliation worker fails one normal settlement only after the real provider
wrapper has stored its actual measurement. Missing receipts cannot be reconciled
by an estimate. Exact original turn replay remains FAILED even after accounting
repair: repairing usage does not recreate a lost response or assert task success.

Governance fixtures explicitly compose `dynamo` and enable `dynamoEnabled` plus
durable property persistence. Their control-plane actor and delegated manager
are separate Profile test roles. A manager can propose only delegated sections;
the existing runtime owner must approve and activate. No change is applied by
Copilot preview or proposal submission itself.

### Live Database Source Acceptance

Use the same opt-in environment with
`nodics.copilot/modules/copilotKnowledge/test/copilotDatabaseRuntime.live.test.js`.
It does not require a model response. DATABASE sources require RESTRICTED
classification, explicit tenant/enterprise/environment scopes and the independent
`copilot.data.query` grant. Source visibility does not confer native schema access.

1. Register the owned Profile runtime normally. Live reads must resolve its HTTP
   owner even when Profile is co-located; no generated-service shortcut is allowed.
2. Configure the disposable operator's read-only enterprise/employee schema access.
   These test overlays do not change framework defaults or shared roles.
3. Discover eligible collections through Copilot. Wildcard includes enterprise,
   while the explicitly excluded employee collection remains unselected.
4. Query the synthetic enterprise and compare with the same employee's native
   advertised safe-search result, projected to declared non-sensitive scalars.
5. Reject excluded collections, object-valued search and caller-supplied query or
   tenant overrides. A user with only Copilot/source/discovery grants cannot
   discover or read the native enterprise collection.
6. Restart, reauthenticate and verify the same owner-filtered result. The fixture
   closes its database, registered runtime, provider and Redis resources.

This qualifies the local Profile read path and projection, not every domain's
record policy or a copied database knowledge index. Native domain policies remain
the authority and need their own domain coverage.

The same test also previews and publishes two authored, runtime-bound partitions:
the active Knowledge module's source registry implementation and README. It checks
the resolved module identity, accepted file count and actual published generation.
It accepts canonical dotted hierarchy indexes without flattening or re-sorting the
active runtime order. Absolute filesystem paths are not returned to the employee.

### Recorded and Scheduled Refresh Acceptance

Run `nodics.copilot/modules/copilotKnowledge/test/copilotRefreshRuntime.live.test.js`
with the same opt-in variables. It starts disposable Platform, Process and WCMS
runtimes using normal registration and real runtime credentials. No target result,
Process acknowledgement or timer is substituted.

1. Import the canonical `copilotApi:knowledgeRefreshWorkflow` release on Process
   through nImport. The deployment explicitly admits its remote refresh ACTION,
   published definition/version and exact source-policy fingerprint.
2. Sign in as the scoped employee, preview a source and review a manual refresh.
   An unconfirmed start is rejected. A confirmed start returns only the original
   Process identity; completed source history supplies indexing evidence.
3. Submit the same original command and verify that the instance and attempt
   remain unchanged, without another indexing dispatch.
4. Create the Process-owned CRON trigger. Review and save a Cron-owned inactive
   draft with the deployment-approved target and expression.
5. Review and explicitly activate that draft. Check the real matching timer and
   wait for a distinct completed source attempt from its actual tick.
6. Review and deactivate the schedule. Restart Process and inspect the unchanged
   inactive lifecycle; do not activate again to inspect it.
7. Restart Copilot and inspect the original manual attempt. Disable new manual
   starts, rebuild and restart; new starts are refused while authorized original
   history remains readable.
8. Deliver a source-change event through the service-only HTTP API using the
   fixture runtime's actual registered credential and exact publisher assignment.
   Inspect one completed Process attempt. Deliver the same event before and after
   restart and verify the original identity/attempt remain unchanged.
9. Reject a stale source-policy fingerprint and an employee bearer on the
   service-only event route. The test never exports the runtime credential.

The second scenario drops one acknowledgement after the real Cron timer has
started. The activation returns uncertainty, original inspection remains
`OUTCOME_UNKNOWN`, and replay of the old command is refused. Explicit
reconciliation reads the existing matching timer and finalizes its receipt
without creating or starting another timer. The remaining refresh, event,
deactivation and restart checks then run against that same original schedule.

The restricted test Cron schema permits its synthetic operator and the canonical
`serviceAccountUserGroup` for owner bookkeeping. The owner-created wrapper can
persist only fixed state fields; this does not grant the employee a service
identity or bypass source/Process authorization. Business execution still requires
fresh scoped runtime admission. This evidence is local single-node acceptance,
not distributed scheduling, missed-fire replay or external-lake availability.

### Enterprise Execution And Original-Result Recovery

The same prerequisites run
`nodics.copilot/modules/copilotWorkbench/test/copilotEnterpriseRuntime.live.test.js`.
Its three scenarios cover direct preparation, a real native completion followed
by one lost response, and actual Ollama prose interpretation. They independently
verify Profile records, four PENDING invitations, current reader denial, restart,
receipt-only recovery, fresh approval for never-started rows and no replayed
enterprise or repeated model charge. Read the Workbench
[enterprise guide](../../../copilotWorkbench/llm/examples/enterprise-invitations.md)
for the ordered reproduction and evidence limits.

### Full Axis Walkthrough

1. Start the four-runtime held session with persistent acceptance enabled and
   initialize it using the governed setup in the linked guide.
2. In Knowledge Studio, preview and explicitly publish the synthetic source.
3. From Dashboard Details open Workspace. Check provider connection, then open
   the separate Conversation page and ask the synthetic collection-colour question.
4. Verify the answer and source citation. Compare input plus output with the
   Usage page's measured total and one call. Counts vary between runs.
5. Open Manage allocations, edit the synthetic operator, enter zero and a reason,
   and review. Confirm the below-consumed warning preserves prior usage.
6. Confirm once. Inspect the changed-by history and Workspace capacity warning.
7. Resume the conversation and submit another question. Require exhausted-capacity
   refusal; return to Usage and verify no second call or additional charge.
8. Check the same usage route at desktop and 390px mobile width. Close only the
   owned frontend/backend and inspect its finalized cleanup ledger.

The recorded local run displayed 121 input plus 20 output tokens, 141 consumed,
one measured call, zero outstanding reservation, and unchanged usage after refusal.
This is local synthetic acceptance, not a production capacity or billing promise.
