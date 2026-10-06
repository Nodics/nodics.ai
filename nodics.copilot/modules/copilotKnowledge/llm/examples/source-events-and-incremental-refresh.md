# Source Events And Incremental Refresh

## Ownership

Knowledge converts an admitted source-change notification into a Process-owned
start. Process owns persistence, immutable versions, start replay, action claims,
attempts and recovery. Existing nService connections and runtime credentials carry
the handoff. The source publisher owns event delivery. This feature does not
install a file watcher, message broker, event subscription, job queue or scheduler.

Incremental processing is **source-granular**: unchanged sources are not rewritten;
changed sources get a complete replacement generation. Every attempt still reads
all included files, inspects secrets and builds bounded safe projections. There is
no per-file durable chunk cache or filesystem-stat shortcut. Code and documentation
use the same source policy and publication path.

## Configure A Source Event

1. Complete the setup in [Process-backed refresh](process-backed-refresh.md),
   including approved SYSTEM source access, group ceilings, the recorded remote
   action, scoped peers and a matching `workflowRefresh.assignments` entry.
2. Install the explicit `copilotApi:knowledgeRefreshWorkflow` contribution release
   **1.1.0** using existing nImport preflight/install. It preserves release 1.0.0
   source bytes and adds a definition policy allowing only `sourceCode` and
   `expectedPolicyDigest` for service-owned starts. The release number is not the
   Process version number. Inspect the resulting published Process version.
3. Configure Process's existing `process.runtime.internalStarts`: enable only after
   review, select this definition in `allowedDefinitions`, retain its permission
   and bounded context policy. The calling Copilot runtime requires its scoped
   `workflow` and `copilotApi` module grants and the configured internal-start
   permission. The definition must be published and owned by `copilotApi`.
4. Under `copilot.knowledge.eventRefresh.publishers`, add an exact record with
   `tenantCode`, `enterpriseCode`, `projectCode`, `environmentCode`, `publisherId`,
   `sourceCode`, `definitionCode` and positive integer `version`. `publisherId`
   matches the authenticated service ID, not a value from the event body. Duplicate
   matches reject. Maximum configuration window is 100 records.
5. Through the existing runtime identity owner, grant the intended publisher its
   explicit `copilotApi` destination access, `copilot.knowledge.source.notify`,
   `copilot.knowledge.source.manage` and source-required read permissions. These
   are security-sensitive deployment actions, not effects of installing this code.
6. Set `copilot.knowledge.eventRefresh.enabled: true`. Its default is false.
   The existing workflow `actionAuthority` selects the Process peer, role and
   1-30000 ms timeout. No default connection alias is accepted.
7. Configure the approved deployment/content publisher to deliver a notification
   only after the new source bytes are available on the ingestion runtime.
   The bridge does not trust an event as proof that a checkout has changed.

## Event API And Delivery

`POST /knowledge/events/sourceChanged` is service-token-only, `moduleInternal`,
independently permissioned and uncached. Its JSON body contains exactly:

```json
{
  "eventId": "deployment-change-123",
  "sourceCode": "registered-source",
  "expectedPolicyDigest": "<current 64-character lowercase SHA-256 source policy>"
}
```

The publisher must use a stable unique event ID for each source change. Allowed
event ID characters are letters, digits, dot, underscore, colon and hyphen, with
a letter/digit first and a maximum of 128 characters. Never put paths, source
content, credentials, user identity or executable instructions in the event.

```text
Approved publisher -> Copilot source-event API
  signed runtime       -> current publisher assignment + source/group policy
                       -> deterministic event instance ID
                       -> nService -> Process /internal/instances
                                      published owner/version/context check
                                      create-only start or exact existing replay
                                      single-use recorded refresh action
                                      -> Knowledge scan/secret check
                                         -> Discovery generation publication
                       <- START_ACKNOWLEDGED, instance reference
```

`START_ACKNOWLEDGED` confirms Process's exact completed-start acknowledgement,
not successful indexing or a completed business workflow. Inspect Process attempts
and Knowledge durable status for those outcomes. The minimized receipt includes
the instance reference, definition/version, source/fingerprint and evidence label.

One event identity is scoped to publisher, tenant, enterprise, project, environment
and source. The instance identity deliberately excludes the current definition
version and policy digest: re-delivery after changing either cannot silently start
another instance. Process's original-input fingerprint rejects incompatible replay.
Each request makes at most one transport attempt. A lost response yields
`ERR_CPK_00021`; inspect the original instance. Explicit same-event delivery may
return verified existing-start evidence, but an incomplete start remains unknown
and does not re-enter nodes. Never invent a new event ID to bypass an uncertain
outcome. Revocation blocks later delivery and withholds a response when detected
after a dispatch; it does not claim rollback of already-admitted work.

## Enable Source-Granular Incremental Processing

1. Deploy generation publication and its persistence schema before enabling it.
2. Set both `knowledge.generationPublication.enabled` and
   `knowledge.generationPublication.incrementalEnabled` true through established
   configuration governance. Both defaults are false.
3. Run an explicitly authorized first refresh. Discovery persists an optional
   `contentDigest` in its pending/current generation descriptor. Existing manifests
   without it remain readable and get a full replacement on their next refresh.
4. Run a second unchanged source refresh in the designated acceptance environment.
   It still scans and secret-inspects. Matching source policy, canonical derived
   content and expected document count allow a physical-count probe and a second
   manifest read. Only the same current revision with no pending writer is reused.
5. Inspect `publication.unchanged: true` and `chunksWritten: 0` in the ingestion
   report. `chunksProjected` describes the source's derived chunk count, not new
   writes. Current publication time remains the original publication time.
6. Change, delete or exclude a file, or change source policy, then refresh. Changed
   projection content forces complete replacement. A missing physical document
   also prevents reuse. The next successful publication retains existing cleanup
   rules. Reuse itself does not clean historical debt.

The fingerprint canonicalizes object keys and source document order, includes
content, provenance, visibility and index metadata, and ignores only top-level
projection bookkeeping timestamps. Secret-rejected files are never stored in the
fingerprint; the report still counts current rejections. A pending writer requires
inspection, never timeout takeover. Concurrent manifest drift or current-policy
revocation rejects reuse. This is a read-time snapshot, not a lease on readiness.

## Verification And Customization

Run `copilotKnowledgeEventRefresh.test.js`, `copilotRefreshContribution.test.js`,
`copilotKnowledgePublication.test.js`, and Discovery generation tests. They exercise
the real scoped runtime principal, Process service-owned start/replay, retained
release checksum, foreign/partial acknowledgements, source-policy denial, lost
responses, restart-safe reuse and zero unchanged projection writes.

Customize publisher assignments, bounded source partitions and connection aliases
in their owning configuration layers. Do not change immutable release files,
forward publisher credentials as human credentials, copy scheduler state into
Copilot, or let Axis select arbitrary Process endpoints. Real event subscriptions,
grants, persisted schemas and cross-runtime deployment acceptance remain separate
from these isolated local tests.
