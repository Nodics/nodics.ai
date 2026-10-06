# copilotConversation Agents

Shared customer guidance is domain-neutral. The domain adapter supplies an
owner-authorized minimized `settings.context`; do not trust request-body facts or
hardcode accelerator fields, stages, source lists or customer instructions here.
Absent evidence returns neutral guidance without claiming a domain save occurred.

The opt-in [transactional writer guard](llm/examples/transactional-writer-guard.md)
must touch the exact active parent and save content in one existing nDatabase
transaction. Never fall back after rejection, recreate a tombstoned parent or
conflate this prerequisite with distributed purge qualification. Keep the deployment gate off
until all writer paths and provider topology are qualified.

Explicit retention follows [the bounded execution guide](llm/examples/bounded-retention-execution.md).
Preserve the parent tombstone and private operation evidence. Require independently
authorized review, exact parent CAS, journaled primary-majority persistence,
nDynamo's pinned revision fence and one transactional content page per command.
Never expire a fence, replay uncertain writes, infer legacy content ownership,
delete independent audit/accounting or reopen a stopped conversation. Inspection
and stopping may remain available with deletion disabled. No generic retention CRUD.

Stopped-operation resumption requires a fresh explicit review under current holds,
the original persisted cutoff/actor/operation and released old fence. Preserve
stage/counts and bounded resumption history; never reset work or reopen writers.
Non-destructive closure requires qualified writer fencing and exact parent CAS.
Its private original receipt, not current CLOSED state alone, supports recovery.
Closing conversation writes never claims cancellation of external business work.

Conversation saves require an exact success acknowledgement and matching owned
identity/state. Never return the submitted model when storage returns nothing,
counts, contradictory errors or a foreign record. Run
`test/copilotPersistenceAcknowledgement.test.js` with recording/turn regressions.

Exact conversation, turn and idempotency reads must reject duplicate or mismatched
identities, contradictory envelopes and request-identity drift. Read uncached,
include all trusted ownership predicates, and recheck returned content before
message or event delivery. Never infer enterprise bindings for legacy content.

Persist the model-context eligibility marker independently of recording. Only
explicit true may enter later provider history; live-read exchanges are false
and absent legacy markers fail closed. Do not convert transcript-read permission
into current source access. See Knowledge's live-evidence-conversation guide.

Lifecycle policy and held-conversation validation follow
`llm/examples/retention-and-holds.md`. Retention preview never deletes records or
reads content. Holds win over expiry; active and unknown states are not candidates
for inferred deletion. No TTL index may bypass holds or durable lifecycle work.

Recorded search follows `llm/examples/recorded-content-search.md`. Require all
three activity/inspection/search grants, opt-in and pre-read durable audit.
Never treat regex syntax as executable input or infer legacy enterprise bindings.
Recheck canonical conversation and turn ownership before delivering any snippet.
Run `test/copilotRecordedSearch.test.js` alongside transcript and recording tests.

Transcript inspection follows [its sensitive-read contract](llm/examples/audited-transcript-inspection.md).
Require independent activity and transcript grants, deployment opt-in, trusted
enterprise and acknowledged private access receipt before reading content. Never
read messages for recording-off turns, expose tool bodies, cache transcripts in
Axis, infer successful delivery from a receipt, or enable generic receipt CRUD.
Run `test/copilotTranscript.test.js` when extending this boundary.

Recording changes must follow `llm/examples/recording-policy.md` and
`test/copilotRecording.test.js`. Pin policy per turn. Recording-off suppresses
new titles, messages and content-bearing event payloads while preserving minimal
metadata and allowlisted numeric usage.
Temporary delivery is request-local and always cleared; never create a shared
content cache or recreate lost answers automatically. Business-action audit
remains independent. Admin transcript access and physical retention require
separate authorization/audit/lifecycle contracts.

Activity inventory requires `copilot.activity.read` before storage and exact
tenant/enterprise predicates plus returned-row rechecks. Never expose titles,
messages or event payloads through this metadata endpoint. Read
`llm/examples/enterprise-activity.md` and run `test/copilotActivity.test.js` when
changing it. Generic private-schema CRUD remains disabled.

## Inheritance

- Follow the repository agent contract: `../../../AGENTS.md`.
- Follow the Copilot parent contract: `../../AGENTS.md`.
- Follow global AI/development guidance:
  `../../../nodics.foundation/modules/nSetup/llm/ai-enablement-index.md`.
- Read every applicable ancestor `AGENTS.md` from root to this module before editing.
- Read this module `README.md`, `llm/contracts`, `llm/examples`, and generated context.

This generated capability boundary must preserve Nodics structure, layering, configuration-first behavior, override/customization contracts, tests, documentation, and generated-artifact discipline.

Before implementing non-trivial behavior here, record the business outcome, owning layer, studied sources, current implementation, extension path, security/tenant/data/API/release impact, intended files, and validation route.

Private conversation schemas keep generated persistence services but no generic
CRUD router exposure. Canonical APIs must enforce tenant, actor, and enterprise
before reads and recheck returned records. Never implicitly migrate unbound
history to the current enterprise. Turn idempotency includes its conversation
and enterprise; do not reuse another conversation's turn for a matching key.
