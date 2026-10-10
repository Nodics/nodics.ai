# copilotConversation contracts

Independent audit retention is separately permissioned and default disabled.
`DefaultCopilotAuditRetentionService` owns bounded TRANSCRIPT_ACCESS and terminal
ACTION deletion only. Preserve explicit enterprise/class policy, indefinite
holds, immutable selection fingerprints, journaled atomic removal+receipt and
the existing nDynamo revision fence. Never delete uncertain actions, provider
accounting or the deletion receipt itself. Lost acknowledgement permits original
inspection and stop/release, not automatic command replay. See the
[operator and API guide](../../data/docs-v001/records/documentation/copilotConversationDocumentationComponentData.js#independent-audit-retention)
and `test/copilotAuditRetention.test.js`.

The [bounded retention contract](../examples/bounded-retention-execution.md)
adds a separately authorized, default-disabled lifecycle. Preserve exact durable
CAS, transactional pages, pinned governed policy, independent audit retention,
original-actor inspection and frozen terminal stop. Never infer completion from
a timeout, resume STOPPED or expose private coordination in public records.

A save is acknowledged only by a success envelope containing the exact persisted
record identity and owned scope/state. Missing or contradictory acknowledgements
remain uncertain and must never return the submitted model as fabricated success.
This rule does not provide a writer lease or authorize retention deletion.

Exact and content-history reads require a bounded successful array envelope and
bypass item cache. Exact conversation/turn/idempotency recovery rejects duplicate
or mismatched records rather than choosing the first result. Turn, message and
event queries bind tenant, principal, enterprise and parent identities; returned
content is rechecked before delivery. A missing parent prevents child reads, and
request-identity changes during an awaited read deny delivery. Enterprise-scoped
legacy records without the matching binding are excluded, never implicitly rebound.

- [Audited inspection](../examples/audited-transcript-inspection.md) defines the
  independent sensitive-read and pre-content durable-receipt boundary.

Generated documentation entry for copilotConversation.

- [Scoped customer guidance](customer-guidance.md)
