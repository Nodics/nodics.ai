# Reviewed Knowledge Cleanup

## Purpose And Setup

A refresh may publish successfully while old index cleanup remains unconfirmed.
This journey lets an administrator review and remove obsolete published
generations and proven quiescent retired generations without rereading files, invoking a model or replacing active
knowledge. It is not retention purge, business-record deletion or writer recovery.

1. Deploy the current Discovery manifest schema and private
   `copilotKnowledgeMaintenance` receipt schema with generated services and unique
   receipt identity indexes. Generic browser CRUD remains disabled.
2. Complete the [generation migration](generation-publication.md); generation
   mode still defaults off. Deploy matching Axis Studio source.
3. Through normal Profile administration, grant the intended employee
   `copilot.knowledge.internal.read`, `copilot.knowledge.source.manage` and
   `copilot.knowledge.cleanup.execute`. Installation grants nothing. Source
   permissions, enterprise/tenant scope, active groups and enablement still apply.
4. Verify nSearch removal acknowledgements and private receipt persistence in the
   intended environment. Local fixtures do not provision indexes or credentials.

## Business-User Journey

1. Open Knowledge Studio, reload inventory and select an enabled static source
   showing pending obsolete cleanup. Database/log sources have no static cleanup.
2. Select **Review cleanup**. This only reads current manifest metadata. A claimed
   writer blocks this journey and needs Process/runtime operator inspection.
3. Compare the count of generations eligible for removal with the
   separate count requiring operator inspection. No private generation token,
   physical index name, document content or filesystem path is disclosed.
4. Select **Cancel** or **Confirm cleanup** once. Zero eligible generations
   disables confirmation. Source policy, employee, logical index routing and
   manifest revision must still match the review.
5. After acknowledgement, reload inventory. Operator-only debt can remain; the
   current generation is unchanged. After an unconfirmed response, the view locks
   repeat execution. Reload and obtain a new review rather than rerunning ingestion.
   A physical deletion may have applied even when its journal response was lost.

## Execution And Audit

```text
employee -> source/group + management + cleanup authorization
         -> manifest read -> counts and revision-bound review
         -> explicit confirmation -> fresh authority and routing check
         -> acknowledged CLEANUP_AUTHORIZED receipt
         -> Discovery selects published or proven quiescent obsolete IDs
         -> acknowledged manifest CAS after each deletion
         -> acknowledged CLEANUP_COMPLETED receipt -> reload inventory
```

Immutable generated receipts correlate through `operationCode` and contain
trusted tenant, enterprise, employee, source, review fingerprint, revision and
UTC timestamp. They contain no transcript, model input or index predicate.
Missing authorization acknowledgement prevents deletion. Missing completion
acknowledgement prevents reporting success. An authorization receipt alone means
uncertainty, not proof that nothing happened. There is no receipt deletion,
public CRUD or automatic replay. The separately authorized maintenance-history
panel shows receipts without turning authorization into completion evidence.

## API Contract

Both secured employee routes independently require
`copilot.knowledge.cleanup.execute`; Knowledge additionally rechecks management
and current source visibility before mutation.

| POST path relative to `/v0` | Body | Result |
| --- | --- | --- |
| `/knowledge/sources/:sourceCode/cleanup/preview` | `{}` | REVIEWED, source policy, revision, review digest and bounded counts |
| `/knowledge/sources/:sourceCode/cleanup` | confirmed, expectedRevision, expectedPolicyDigest, reviewDigest | CLEANED, resulting revision and cleanupPending |

Use the standard success envelope and `contractVersion: 1`; responses are
no-store. Extra fields, foreign/stale reviews, browser predicates or token lists
are rejected. `ERR_CPK_00018` withholds raw engine diagnostics. Commands are sent
once and never queued offline. Fresh authorization is checked before every
physical removal and before delivering the result.

## Operator-Only Debt

Only replacement of a completed current generation adds its old token to
`publishedObsoleteGenerations`, a validated subset of obsolete IDs. Abandonment
does not by itself add eligibility. Guarded retired IDLE/SEALED writer evidence
also qualifies; a retired WRITING claim must receive its exact original physical
completion first. Missing legacy evidence means none: age or matching counts
cannot establish provenance. Discovery selects eligible tokens itself and
binds tenant, owner, index configuration and exact generation in each query.

An in-flight or legacy worker may still write unreachable chunks. Unknown work
remains blocked even after runtime restart. This cleanup UI cannot abandon claims,
steal leases, delete current/pending generations or migrate legacy chunks. Use the
separate writer-retirement review where available. Manifest debt remains bounded
to 100 IDs.
Slow deletion can time out; inspect receipts and the latest manifest with approved
operational tooling, then obtain fresh review. Full job/attempt history is separate.

## Customization And Verification

Administrators/operators follow the steps above. Business evaluators can inspect
the bounded review and explicit uncertainty without receiving maintenance rights.
Partners customize `knowledge.studio.cleanupPresentation` or wrap the typed Axis
panel. Preserve source binding, independent grants, confirmation, uncertain-result
lockout and teardown; do not copy a search client or permission registry into Axis.

Framework maintainers and AI tools run cleanup/Studio tests, Discovery generation
tests, API/phase regressions, Axis `KnowledgeCleanupPanel`/Studio tests and build.
Cover authorization and completion receipt failures, foreign enterprise, revoked
grants, changed routing, stale revision, abandoned-only debt, concurrent claims,
offline commands and late responses. Inspect desktop/mobile layouts. Deployment
and authenticated real-index acceptance remain separate from synthetic fixtures.
