# Knowledge Maintenance Receipts

## Business Purpose

An operator who loses a cleanup or writer-retirement response must inspect
evidence before another action. **Knowledge Studio > Source > Maintenance
receipts** reads existing private `copilotKnowledgeMaintenance` records. It never
repeats a command, repairs audit records or reconstructs missing success. These
are maintenance receipts, not refresh progress or physical index readiness.

## Setup

1. Compose Copilot API/Core/Policy/Knowledge and normal generated persistence.
   Provision the private maintenance schema, unique receipt-code index and scoped
   composite receipt-history index through
   the framework schema lifecycle. No generic browser CRUD route is enabled.
2. Grant `copilot.knowledge.internal.read` and independently
   `copilot.knowledge.maintenance.read` through Profile. Inspection does not
   require or grant cleanup, source-management or writer-retirement permission.
3. Preserve source classification, channel, current group selection and
   enterprise/content ceilings. The employee must currently see the source.
   Hidden sources expose neither historical identities nor receipt counts.
4. Refresh authenticated Axis discovery/inventory. The server advertises the
   panel and inert `knowledge.studio.maintenancePresentation` copy. A typed URL
   alone never authorizes the read.

Receipt inspection remains available when write gates are disabled. Removing
source visibility still prevents inspection. Receipt indexes must be assessed
for the deployed database and volume; no production performance is implied by
bounded fixture tests.

## Operator Journey

1. Select the enterprise through Axis and open Knowledge Studio. Select the exact
   source used by the original operation.
2. Choose **Load maintenance receipts**. The initial view does not fetch history
   automatically. Each uncached page contains at most 25 newest receipts, sorted
   by UTC timestamp and identity. Arrow controls inspect older pages. A full page
   means more records may exist, not an exact total.
3. Match the operation reference. Each row shows stage, administrator, timestamp
   and manifest revision. Authorization and completion have separate receipt
   identities but share one operation reference.
4. Interpret stages conservatively:

| Stage | Proven | Not Proven |
| --- | --- | --- |
| Cleanup authorized | Reviewed intent admitted before dispatch | Deletion, physical counts or terminal audit |
| Cleanup completion recorded | Owner completion and terminal receipt acknowledged | Current readiness after later changes or full legacy cleanup |
| Writer retirement authorized | Reviewed retirement admitted before CAS | A retired writer, stopped worker or completed refresh |
| Writer retirement completion recorded | Reviewed pending publication fenced and terminal receipt persisted | Worker quiescence, byte deletion or new publication |

5. If only authorization is present, do not retry from this screen. Completion
   may be on another page, pending, or missing after uncertainty. Reload receipts
   and inspect current source/Process evidence. Absence of completion never proves
   that nothing happened. This panel intentionally offers no execution control.
6. Failed or denied reload clears old evidence. Source/context changes abort and
   discard outstanding reads. Offline inspection sends and queues nothing.

## Owner Flow

```text
Employee explicitly requests a visible source's receipts
    |
Copilot API: employee access token, independent read grant, no-store
    |
Knowledge: current source/group and tenant/enterprise/actor snapshot
    |
Generated maintenance owner: exact scoped query, 25 records, stable sort
    |
Reject failed, foreign, duplicate or malformed persistence
    |
Recheck authority; project approved metadata only
    |
Axis: individual receipts and uncertainty; no mutation or replay
```

## API And Customization

`GET /knowledge/sources/:sourceCode/maintenance?page=1` accepts only a page from
1 through 1000. Route source identity is authoritative. No tenant, enterprise,
principal, arbitrary query or index selector is accepted. The V1 response binds
the source/current policy fingerprint, enterprise and requested page.
`evidence` is `MAINTENANCE_RECEIPTS`; `mayHaveMore` means a full window. Review
digests, generation tokens, paths, index names and undeclared stored fields are
omitted. Unavailable persistence never becomes a fabricated empty page.

Customize labels through `copilot.knowledge.studio.maintenancePresentation` and
normal configuration layering. Preserve all four stage meanings and uncertainty
copy. Project renderers may adjust layout, but must retain explicit reads, typed
scope checks, source invalidation and the absence of mutating history controls.

Run backend `copilotKnowledgeMaintenanceHistory.test.js`, `copilotCleanupApi.test.js`,
Axis `KnowledgeMaintenancePanel.test.tsx` and Studio regressions. Inspect
`knowledge-writer-recovery.visual.html` on desktop/mobile. Fixtures never touch
real maintenance, workers or indexes. Signed-in persistence, grants and receipt
acceptance remain separate deployment checks.
