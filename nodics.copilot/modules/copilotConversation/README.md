# copilotConversation

Customer guidance is shared across domains. Trusted adapters pass minimized
owner-read `settings.context.facts` and `settings.context.stage`; request-body
facts/stages are ignored. Copilot rechecks current evidence, has no execution
tools on this path and does not claim that domain progress was saved. Domain
adapters own their field selection, terminology, corrections and confirmation.

Independent audit retention uses its own permissions and enterprise legal-hold
policy, bounded reviews, atomic deletion receipts and original-operation recovery.
It never inherits transcript expiry or removes provider accounting. See the
[audit retention guide](data/docs-v001/records/documentation/copilotConversationDocumentationComponentData.js#independent-audit-retention).

## Exact History and Recovery

Conversation, turn and idempotency lookups reject ambiguous or mismatched storage
records instead of selecting the first row. These exact and content-history reads
bypass item cache and require a successful bounded array envelope. Message and
event delivery rechecks tenant, enterprise, employee and parent bindings after
storage returns.

New events carry explicit ownership metadata. Legacy unbound events are excluded
from replay; this change does not backfill or infer their enterprise. New messages
and events use insert-only persistence even with the transactional writer guard
disabled. A collision or lost acknowledgement stops the write without replacement
or automatic replay. This does not establish a complete concurrent-turn protocol.

Operator checks:

1. In the intended enterprise, create a synthetic conversation and complete a turn.
2. Reload its history and replay through the canonical authenticated Copilot API.
3. Verify another employee/enterprise cannot retrieve that conversation or turn.
4. Verify recording-off turns retain only permitted metadata after reload.
5. On an unavailable or ambiguous response, inspect owner diagnostics; never
   reconstruct missing messages, change ownership fields or retry business actions.

Partners extending persistence must preserve the success envelope, bounded arrays,
insert-only options and ownership fields. Run the persistence acknowledgement,
recording and phase-acceptance tests, then qualify the actual generated schema and
database deployment. Fixture success alone does not establish live isolation.

An opt-in [transactional writer guard](llm/examples/transactional-writer-guard.md)
binds content writes to an active parent in one existing nDatabase transaction.
It remains a default-disabled prerequisite for the separately authorized
[bounded retention workflow](llm/examples/bounded-retention-execution.md).

[Retention and legal holds](llm/examples/retention-and-holds.md) covers governed
enterprise policy and metadata-only review. Explicit review, bounded execution,
original-operation inspection and terminal stop are implemented behind disabled
deployment gates. Local tests do not qualify distributed writers or failover.
The generated parent schema permits an explicit null title at PURGED, matching
the existing tombstone transition; required ownership and state are unchanged.

The canonical [retention and recovery operator guide](data/docs-v001/records/documentation/copilotConversationDocumentationComponentData.js)
includes configuration, API steps, failure recovery, customization, a sequence
diagram and sanitized Axis screenshots. Its generated documentation release must
follow the existing Platform import/publication process before appearing in Axis;
the frontend does not load these source files directly.

Opt-in [recorded-content search](llm/examples/recorded-content-search.md) adds
purpose-bound, audited literal searches over enterprise-bound recordings.
Legacy unbound messages remain excluded; no implicit migration or export.

[Audited transcript inspection](llm/examples/audited-transcript-inspection.md)
is a separate opt-in sensitive-read workflow with its own grant and durable access
receipt. Activity listing stays metadata-only; physical retention and legal hold
are not implemented by inspection.

Recording is enabled by default. The [recording policy guide](llm/examples/recording-policy.md)
documents configuration, request-only delivery, history limits and verification.
Recording-off does not disable action/accounting audit, grant administrator
transcript access or implement physical retention.

The [enterprise activity guide](llm/examples/enterprise-activity.md) documents the
permission-specific metadata view. It grants no transcript, export or retention
authority and uses the existing private conversation persistence.

Durable conversational sessions, turns, messages, streaming, and recovery.

Production composition uses the generated `copilotConversationRecord`,
`copilotTurn`, `copilotMessage`, `copilotEvent`, and `copilotAction` services.
Owned reads are constrained by tenant, authenticated principal, and trusted
enterprise context. New conversations and turns persist that binding; legacy
unbound conversations are preserved but not silently assigned to an enterprise.
Generic CRUD exposure for the private persistence schemas is disabled; read
and write access remains through the governed owner APIs. Conversation
titles are derived from the first user request so Axis never presents an
internal conversation identifier as the primary label. `VOLATILE_LOCAL` exists
only as an explicitly enabled test seam and is disabled in Kickoff runtime
configuration.

The [Workspace migration guide](../copilotCore/llm/examples/workspace-operations.md)
explains bounded projections, legacy history, and scoped idempotency.

Use this README to understand what this module is for, which capability or composition boundary it owns, how it fits its parent hierarchy, and where developers or AI tools should continue reading.

For implementation rules, read this module `AGENTS.md` after the root-to-leaf ancestor `AGENTS.md` chain. For exact contracts and examples, read this module `llm/` guidance and the relevant global contracts under `modules/nSetup/llm`.
