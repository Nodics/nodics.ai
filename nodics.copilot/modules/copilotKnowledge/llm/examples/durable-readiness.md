# Durable Infrastructure Readiness

## Reading The Report

1. Open Axis operational readiness as an authorized employee. Existing BackOffice
   route permissions remain required; Knowledge additionally requires a tenant,
   enterprise, employee and `copilot.knowledge.internal.read`.
2. In generation-publication mode, the BackOffice Assistant section awaits
   Knowledge. Knowledge uses the current source/group policy and reads only a
   maximum of 100 accessible enabled static sources. Database and external logs
   are live evidence sources, not static indexed-generation readiness.
3. Review `evidence: DURABLE_GENERATION` and
   `coverage: AUTHORIZED_SOURCE_WINDOW`. Each current manifest must match the
   current source-policy digest and exact physical document count. A restart does
   not erase that evidence; a missing physical document makes it stale.
4. If `hasMore` is true, review the remaining Knowledge Studio pages. The aggregate
   returns NEEDS_ATTENTION, never claims full-registry readiness or reveals the
   count/identity of sources outside the inspected authorized window.
5. Inspect unresolved writers and cleanup debt separately. An intact published
   generation may remain searchable while a newer writer needs investigation.
   This report never starts refresh, clears a claim, deletes generations or
   enables a repair button. Use the existing governed owner workflows.

## State Boundaries

```text
Authenticated BackOffice request
            |
            v
Knowledge current employee/source/group scope
            |
            v
At most 100 current manifests + physical count checks
            |
            v
Recheck scope and index/source configuration
            |
            +-- Missing/stale count -> attention
            +-- Unresolved writer -> inspection required
            +-- Obsolete generations -> cleanup pending
            +-- Remaining source window -> incomplete coverage
            +-- Exact evidence -> scoped generation readiness
```

Provider/model values establish configuration only, not network connectivity,
model quality or budget availability. Use the explicit provider check for those
supported probe results. Refresh-at means current publication time, not latest
probe time. `observedAt` is the time of this bounded observation.

Generation metadata does not establish whether a previous refresh job failed.
`failedSourceCount` is null with `failureEvidence: NOT_INSPECTED`; inspect Process
attempt history for job outcomes. Do not turn that unknown into zero failed jobs.
Raw index exceptions are normalized to `ERR_CPK_00019`, and the BackOffice section
reports unavailable evidence rather than empty/ready state. No source contents,
paths, tokens or receipts are returned in the aggregate.

## Configuration And Customization

This path follows `knowledge.generationPublication.enabled`. Existing source
definitions, enterprise group ceilings, policy and index configuration remain
authoritative. No new probe registry, scheduler, credentials or tenant selector is
introduced. The deployment must install Discovery generation persistence and
physical search services through their existing lifecycle.

Legacy mode retains the synchronous process-local readiness result and is labeled
`PROCESS_LOCAL` / `LEGACY_REGISTRY` by BackOffice. It is not durable index proof.
Optional missing Copilot ownership remains not configured; an unavailable selected
owner remains needs attention. In a modular deployment, configure and verify the
normal owner availability rather than copying Knowledge logic into BackOffice.

Override only presentation or the owning bounded evidence provider. Keep current
employee authority, no hidden-source reads, safe failure codes, explicit incomplete
coverage and no repair side effects. Run `copilotKnowledgeReadiness.test.js`, the
source-registry/publication tests and BackOffice operational-readiness tests.
Fixtures use isolated persistence and physical counts; deployed generated storage
and signed-in cross-runtime acceptance remain separate verification.
