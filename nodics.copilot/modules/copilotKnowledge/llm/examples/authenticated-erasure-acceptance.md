# Authenticated Local Erasure Acceptance

## Purpose and Boundary

### Full Axis Initialization Prerequisite

The separate opt-in initialization test creates Platform, Process, WCMS Staged
and WCMS Online with four unique test databases. It pins the bundled Axis
baseline version from its owner manifest, installs the CMS approval definition
through nImport, initiates Staged publication, completes the human approval task,
checks Online evidence and registers/activates Copilot through BackOffice.
It also verifies the public bootstrap selects the owned Online origin and that
the authenticated dashboard resolves from the published content.
It never fabricates readiness, grants wildcard human access or edits Kickoff.

```bash
NODICS_COPILOT_AXIS_ACCEPTANCE=1 \
NODICS_ERASURE_ES_HOME=/opt/homebrew/opt/elasticsearch-full/libexec \
NODICS_ERASURE_MONGO_URI='mongodb://127.0.0.1:27017/?replicaSet=nodicsLocal' \
node --test nodics.copilot/modules/copilotKnowledge/test/copilotAxisInitialization.live.test.js
```

The operator alone inherits the existing configuration-administrator group
required by the Axis initialization route. Negative actors do not. Process
explicitly allowlists the CMS publication callback. Scoped service identities
come from normal local Profile bootstrap and declared runtime modules.
Both WCMS servers explicitly select the shared CMS capabilities. Their aliases
are role-specific; Staged must not claim the shared `cms` or `editorial` names.
Canonical configuration preflight rejects a remote-only CMS listener on either
WCMS server. A generated OpenAPI route alone does not prove it is mounted.
Fixture lease/heartbeat timing is 60/30 seconds; authorization still rechecks
current registration and credentials. A refused or ambiguous mutation is not
automatically retried.

For a held backend, additionally set `NODICS_COPILOT_RUNTIME_ACCEPTANCE=1`,
`NODICS_COPILOT_REGISTER_ACCEPTANCE=1` and `NODICS_COPILOT_AXIS_ACCEPTANCE=1`
when starting `test/helpers/runtimeAcceptance/runtimeSession.js`. Its private
manifest supplies loopback coordinates to `initializeAxis.initialize`.
Start the separate Axis frontend only after initialization reports READY.
The session accepts `restart-process`, `restart-staged`, `restart-online`,
`restart`, `diagnostics` and `close`. Diagnostics contain bounded codes/frames,
not credentials or content. Always close the session after browser acceptance.
Backend initialization alone does not certify the full browser journey.

### Full Application Browser Journey

1. Set `NODICS_COPILOT_RESOURCE_LEDGER` to an absolute output path when starting
   the held session. Its sanitized topology is written at readiness and again
   after cleanup, including failed cleanup states if teardown throws.
2. Initialize the private manifest through `initializeAxis.initialize`. Do this
   once for a fresh composition; do not replay ambiguous approval commands.
3. Start Axis on a free local port with `AXIS_BACKOFFICE_BASE_URL` from the
   manifest, `AXIS_PROJECT_CODE=nodics.repository-build` and
   `AXIS_BROWSER_SESSION_CSRF_COOKIE_NAME=copilot_acceptance_csrf`. Use the
   scoped operator credentials only at that local Profile sign-in surface.
4. Verify Dashboard > Details opens Copilot Workspace. Then select Knowledge
   Studio under AI & Copilot. The default unconfigured model/allowance is shown
   as unavailable, not unlimited or zero usage.
5. Preview the synthetic source, review the file/chunk count, then explicitly
   confirm source refresh. Review replacement, cancel, review again and retire.
   Retirement alone retains the legacy data.
6. Send `revoke` to the held backend to invalidate only its native fixture writer.
   Review permanent removal, cancel, review again and confirm the disposable
   target. Verify the acknowledged absence message.
7. Send `restart-read-only`, reload the full route and inspect original removal.
   The replacement source stays Indexed and acknowledged removal is recoverable.
8. For a separate fresh uncertainty fixture, set
   `NODICS_COPILOT_DELETE_RESPONSE_LOSS=1`. Repeat initialization/publication/
   retirement/revocation, review removal, then send `lose-delete-response`
   immediately before confirming. The provider performs DELETE but loses its
   response. Axis must show unconfirmed removal, without another delete action.
9. Inspect, restart read-only, reload and inspect again. Absence alone must not
   convert the unknown outcome to success. Sign out and sign in as the scoped
   reader: it cannot inspect another actor's original receipt.
10. Capture desktop and 390px mobile outcomes, test keyboard Enter on inspection
    and confirmation, and check document width/overlap. Restore viewport sizing.
    Send `close`; verify every owned resource is CLOSED and private directories
    no longer exist. Stop only the separately launched frontend.

For the two distinct durable-journal response faults, start separate fresh held
sessions with `NODICS_COPILOT_JOURNAL_RESPONSE_LOSS=STARTED` or `ERASED`.
The test worker wraps only the Platform-generated receipt service, delegates to
its real durable update, then loses one acknowledgement for that state. It does
not replace MongoDB, alter caller authority or expose a fault HTTP endpoint.
The STARTED fault must cause zero native deletes and persistent uncertainty.
The ERASED fault must initially show uncertainty but recover acknowledged
removal through original inspection. Neither permits another deletion. Run
`copilotErasureRecoveryRuntime.live.test.js` for all three independent fault
positions, real Profile HTTP, gate-disabled restarts and exact delete counts.
The provider fault transport can remain enabled but unarmed to count native
requests for either journal case; it must not drop the provider response then.

The full positive and provider-response-loss journeys were executed on
2026-10-04, including published CMS dashboard delivery and restart inspection.
Distinct lost-claim and lost-completion response tests remain separate evidence;
do not label the provider-response-loss screen as proof of those fault locations.
Shared unavailable/not-started copy deliberately says "original operation" so
neither retirement nor removal is misidentified when access is denied.

This fixture verifies real Profile authentication, Copilot source authority,
generated MongoDB validators and persistence, Discovery publication, secured
Elastic retirement/removal and restart inspection. It creates only synthetic data
in an owned temporary composition and uniquely named test database. It does not
use an existing administrator, grant permissions to existing users, migrate an
existing index, launch Axis or qualify backups and unknown writer inventories.

```text
Profile operator -> registered Copilot HTTP routes -> source admission
  -> Discovery generated manifest -> nSearch replacement publication
  -> reviewed retirement -> native fixture-key revocation
  -> separately reviewed erasure -> private completion receipt
  -> full runtime restart with write gates off -> original inspection
```

The source permission catalogue belongs to nAuth. Catalogue membership permits
Profile to validate a grant; it is not a default employee grant. Both migration
gates remain false outside the fixture. Source, tenant, enterprise and actor
checks are unchanged. Historical retirement bindings register for inspection but
must not provision an index or overwrite the active projection binding at startup.

## Prerequisites

1. Install the repository's supported Node dependencies normally.
2. Run a local MongoDB replica set. Select its loopback URI explicitly; the fixture
   creates and later drops only its new `nodics_erasure_test_*` database.
3. Have `redis-server` available, or set `NODICS_REDIS_BINARY` to its installed
   binary. A new loopback process and port are used; existing Redis is untouched.
4. Set `NODICS_ERASURE_ES_HOME` to an installed supported Elasticsearch
   distribution. The provider-owned fixture starts a separate secured node with
   private temporary files and known API-key-only writers. It does not change the
   shared cluster. The recorded local acceptance used Elasticsearch 7.17.4.
5. Do not reuse the fixture's ephemeral credentials outside this local workflow.

## Automated Backend Run

From the framework root:

```sh
NODICS_COPILOT_RUNTIME_ACCEPTANCE=1 \
NODICS_ERASURE_ES_HOME=/absolute/path/to/elasticsearch/libexec \
NODICS_ERASURE_MONGO_URI='mongodb://127.0.0.1:27017/?replicaSet=nodicsLocal' \
node --test nodics.copilot/modules/copilotKnowledge/test/copilotErasureRuntime.live.test.js
```

The test constructs ordinary Foundation configuration through nTooling, then uses
generated Profile services to create an operator, reader, no-erasure, no-source
and foreign-enterprise employee. The foreign enterprise is created through
Profile after normal event initialization.
No fake security context is inserted into HTTP requests. It logs in through
Profile, publishes the synthetic README, reviews/retires the exact legacy target,
proves the active writer blocks removal, revokes only that writer, and removes
the target once. It restarts the actual runtime with both write gates disabled,
logs in again and verifies the original ERASED result. The separate sentinel
replacement remains present. Test teardown stops owned children before dropping
the owned database and temporary files.

Negative checks cover unpublished replacements, forged review, insufficient
employee permission, review without mutation, missing explicit confirmation,
active writer and replay before/after gate closure. Loss of provider, claim and
completion acknowledgements, competing claims and changed UUID are separately
covered by Discovery's real-provider `test/discoveryErasure.live.test.js`.

### Resource Ledger and Cleanup Failure

Set `NODICS_COPILOT_EVIDENCE_FILE` to an absolute `.json` output path for the
automated erasure run. After successful teardown the test writes only scoped
resource identities: runtime and Redis ports/PIDs, provider version and owned
directory, exact generated database, physical UUID, source version, write gates,
capture settings and cleanup states. Credentials remain exclusively in the
temporary private composition and are removed with it. This ledger is evidence
for that run, not a deployment or full-application certificate.

The coordinator registers each resource as soon as it is owned. Close works in
reverse order, attempts every release after an individual failure, retains the
composition on failure, and retries only failed releases. Concurrent close calls
coalesce. Composition deletion is the final step, not a way to hide a failed
database/provider cleanup. Run `test/copilotFixtureCleanup.test.js` to verify
these coordinator failure semantics; individual provider fault qualification
remains the provider owner's responsibility.

### Actual Provider Response-Loss Recovery

Use the same environment variables with:

```sh
node --test nodics.copilot/modules/copilotKnowledge/test/copilotErasureRecoveryRuntime.live.test.js
```

This is an actual HTTP fault, not replacement of the runtime's delete handler:

```text
Profile employee -> Copilot/Discovery original durable claim
  -> nSearch -> owned loopback fault transport -> secured Elasticsearch DELETE
  <- successful provider response consumed; downstream socket closed
  -> bounded refusal -> original inspection: OUTCOME_UNKNOWN
  -> runtime restart with gates off -> same unknown outcome; no second DELETE
```

The transport can arm once and only for the generated exact legacy name. It
forwards other requests and failed responses unchanged, keeps no request bodies
or credentials, and counts native deletes and dropped responses. The acceptance
test requires one delete and one dropped response, an unaffected sentinel, no
automatic replay, and `retainedLegacyData: null` rather than an invented success
or retained-data claim. Physical absence alone does not complete a private
receipt whose acknowledgement is missing. Browser recovery is separately tested.

## Separately Owned Axis Browser Run

This negative-qualification fixture intentionally enables its erasure gate before
writer revocation to prove the provider still rejects a valid writer. The separate
[persistent local acceptance](../../../copilotCore/llm/examples/persistent-local-acceptance.md)
test covers the positive staged flow with erasure disabled until retirement and
native writer qualification. Framework defaults remain disabled in both cases.

1. Start Axis independently on loopback port 3100. Backend acceptance never
   starts or tests the frontend automatically.
2. Run the same environment selection above with the command:

   `node nodics.copilot/modules/copilotKnowledge/test/helpers/runtimeAcceptance/runtimeSession.js`

3. Wait for `READY`. It prints the disposable base URL and the path to a mode-0600
   private manifest. The manifest contains temporary test credentials; do not
   publish it or place it in screenshots, a URL, browser storage or a report.
4. Open Axis's `http://127.0.0.1:3100/test/assistant/knowledge-migration.live.html`.
   Enter the disposable URL and operator credentials. The page uses Axis's real
   Profile browser client and clears the password after submission. Distinct
   fixture cookie names prevent overwriting ordinary Axis cookies.
5. Preview ingestion. Confirm that one synthetic file and one chunk are accepted.
   Select Refresh source index, then Confirm source refresh. Reload inventory;
   it must report durable publication and verified count, not merely a preview.
6. Review replacement, cancel, and inspect that no retirement began. Reload
   inventory, obtain a fresh review, and explicitly retire legacy writes.
7. Review permanent removal before revocation: it must refuse. In the owning
   backend terminal enter `revoke`; the provider invalidates only the fixture key
   and proves an actual write is rejected. It prints `WRITER_REVOKED`.
8. Review permanent removal again, cancel once, obtain a new review, then confirm
   removal. The UI must report acknowledged original removal and verified absence.
9. Enter `restart-read-only` in the backend terminal. After `RESTARTED_READ_ONLY`,
   reload the browser and sign in again. Mutation controls must be absent; Inspect
   original removal must still show the original ERASED outcome.
10. Sign in as `copilot_acceptance_reader` using the same fixture password.
    The reader must not acquire erase permission or inspect another actor's result.
11. Check desktop and mobile wrapping, keyboard access and no horizontal overflow.
    Capture only cleared-password views. Label these authenticated component
    evidence, not full BackOffice bootstrap/navigation acceptance.
12. Enter `close` in the backend terminal and await exit. The temporary credentials,
    generated composition, owned provider processes and database are removed.

## Failures and Customization

### Full Application Prerequisites

The separate component page does not require a published Axis CMS site. The full
Axis application does. For a disposable backend registration check, set
`NODICS_COPILOT_REGISTER_ACCEPTANCE=1` when starting `runtimeSession.js`.
That opt-in enables normal nService registration and grants only the fixture
operator the two independent functional-module registration/activation grants.
It does not activate a capability, grant Axis initialization administration or
publish an Axis site. The reader never receives those grants.

Use the existing BackOffice lifecycle to register and activate `nodics.copilot`
in the manifest's `projectCode`, with its current `catalogueRevision`. This is a
prerequisite, not a second Copilot registry. The automated backend admission check is:

```bash
NODICS_COPILOT_REGISTRY_ACCEPTANCE=1 \
NODICS_ERASURE_ES_HOME=/opt/homebrew/opt/elasticsearch-full/libexec \
NODICS_ERASURE_MONGO_URI='mongodb://127.0.0.1:27017/?replicaSet=nodicsLocal' \
node --test nodics.copilot/modules/copilotApi/test/copilotBackofficeRuntime.live.test.js
```

The full frontend may be launched independently on `127.0.0.1:3102`, selecting
its existing `AXIS_BACKOFFICE_BASE_URL`, `AXIS_PROJECT_CODE` and
`AXIS_BROWSER_SESSION_CSRF_COOKIE_NAME=copilot_acceptance_csrf` configuration.
Do not launch a second frontend over an occupied port or replace the shared
frontend configuration. Complete the ordinary governed Axis initialization and
Online CMS publication through their owners before claiming full application
acceptance. A successful login followed by initialization denial is a failed
prerequisite, not a successful Knowledge Studio journey. Do not bypass the gate
or rewrite bootstrap responses to make the page appear.

### Failure Boundaries

Migration/removal refusal uses `ERR_CPK_00025` with inspection-first guidance.
It must not describe an unrelated pending-refresh recovery or disclose the private
target, writer keys or authorization reason. This error is not deletion evidence.

- A missing grant, invalid source or unrevoked writer is a refusal, not a reason
  to weaken authorization. Use the existing fixture's Profile/configuration paths.
- An uncertain removal must remain inspection-only. Never reset its receipt or
  rerun a destructive command against the same target. A new independent test
  fixture is a new target, not a retry of an uncertain operation.
- Extend synthetic source fixtures and focused assertions in the test owner.
  Provider fault injection remains in nSearch/nDatabase provider test helpers.
  Do not add test HTTP admin routes or raw provider clients to Copilot or Axis.
- The browser fixture tests real production components and clients but deliberately
  bypasses application mounting. Full signed-in Knowledge Studio admission through
  authenticated BackOffice navigation is a distinct remaining acceptance check.
- Runtime diagnostics minimize failure codes and stack frames. Never expose JWTs,
  passwords, API keys, source bodies or raw provider responses in public evidence.

Run migration permission, generation schema and historical-index startup
regressions after changing these contracts, then rerun the real runtime journey.
