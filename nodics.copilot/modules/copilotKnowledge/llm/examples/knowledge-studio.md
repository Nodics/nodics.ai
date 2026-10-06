# Knowledge Studio: Sources, Preview And Refresh

## Scope

Knowledge Studio supplies a paged authorized source inventory, a read-only
ingestion preview and explicitly confirmed refresh. It uses the existing source registry, source providers,
Policy, secret inspection, chunking and Discovery projection boundaries.
It never calls an LLM. Group creation, enterprise assignment, active selection
and exclusions are governed in [Copilot Settings](../../../copilotPolicy/llm/examples/governed-administration.md)
through nDynamo; published-document lifecycle stays with nPublish.
[Live database access](live-database-sources.md) uses owning schema APIs, not
static collection ingestion. [External incident evidence](external-incident-evidence.md)
is a provider/API foundation, not a deployed log lake or Studio investigation UI.

## Employee Journey

1. Sign in to Axis in the intended enterprise. The runtime must expose the
   Copilot API and publish its current BackOffice capability contribution.
2. Open **AI & Copilot > Knowledge Studio**. The navigation and inventory API
   require `copilot.knowledge.internal.read`. Each source is independently
   checked against its classification, permissions, role/group restrictions,
   tenant, enterprise, project, customer and channel scopes.
3. Use **Find a source** to filter the loaded window by source, project or module.
   This does not search hidden sources or the complete repository contents.
   Previous/next controls reach all authorized definitions. Every page rechecks
   permissions and clears old source/preview state. Configuration changes can
   shift page membership; hidden source counts are never exposed.
4. Select a source. Inspect its configured revision, repository identity,
   project, module, owner, classification, included paths, excluded paths and
   file types. These are definition metadata, not a promise that every selected
   file was ingested. Absolute repository roots are never returned.
5. A disabled source remains identifiable when independently authorized, but
   cannot be previewed. Enablement remains a reviewed configuration change.
6. With `copilot.knowledge.source.manage` in addition to source visibility,
   select **Preview ingestion**. The backend rechecks access before reading.
   A management grant alone does not permit reading a restricted source.
7. Review inspected, accepted and rejected file counts and prepared chunk count.
   Rejected content and paths are not returned by this summary. Secret scanning
   remains mandatory. Prepared chunks are not written to Discovery.
8. Refresh the inventory when needed. This fetches metadata only; it is not a
   source refresh, activation, model call or business mutation.
9. After a successful preview, select **Refresh index** and confirm once. The
   command binds the current source-policy fingerprint. Stale policy requires
   a fresh inventory and preview.
10. An unconfirmed response blocks another attempt in that view. Investigate the
    indexing owner before reloading metadata. Partial projections are possible;
    a timeout is not evidence of rollback. There is no automatic POST retry.

## Meaning of Status

The following table describes legacy `PROCESS_LOCAL` evidence. With the explicit
[generation publication migration](generation-publication.md), Studio and the
personal dashboard inspect `DURABLE_GENERATION` evidence instead: current policy
fingerprint plus an exact, successful physical index-count probe. A restart does
not erase that manifest. Interrupted writers and pending cleanup display separate
warnings and contribute to dashboard attention, even if the previous generation
is still usable. This is index evidence, not a complete job/attempt history.

| State | Meaning | Important limit |
| --- | --- | --- |
| UNKNOWN | No matching process-local ingestion evidence exists | Not proof that the durable index is empty; expected after a restart |
| PROJECTED | A successful report matches the revision and source-policy fingerprint | Not a live file-change detector or a complete index reconciliation |
| STALE | Successful evidence refers to a different revision or source policy | Requires refresh; must not be presented as current |
| FAILED | The last recorded refresh attempt failed | Already projected chunks may remain; no automatic rollback is implied |
| PREPARED | The preview completed without projection writes | Not activation and not new readiness evidence |

Reports are keyed by index tenant and source. An employee cannot see another
tenant's diagnostic timestamps through this inventory or the Workspace. Reports
are process-local in legacy mode and are deliberately not described as a durable audit history.
The existing operator readiness view remains an operational aggregate; it is not
a permission-scoped employee inventory.

For reviewed recurring execution, use the separate
[Process-backed refresh setup](process-backed-refresh.md). Its authoritative
execution history stays with Workflow/Cronjob; this Studio page does not yet
render durable job progress. nSearch partial-failure envelopes and ambiguous save
acknowledgements are failures, not PROJECTED evidence.

## API Reference

These APIs use the normal Nodics `{ code: 'SUC_SYS_00000', data }` envelope and
the owning runtime endpoint with `/v0`:

| Method and path | Required permission | Effect |
| --- | --- | --- |
| GET `/knowledge/sources?page=1` | `copilot.knowledge.internal.read` plus individual source visibility | Bounded authorized metadata page |
| POST `/knowledge/sources/:sourceCode/preview` | `copilot.knowledge.source.manage` plus individual source visibility | Source read/scan/chunk preparation, no index write |
| POST `/knowledge/sources/:sourceCode/refresh` | `copilot.knowledge.source.manage` plus source visibility | Explicit projection with `expectedPolicyDigest` |
| GET `/knowledge/sources/:sourceCode/collections` | `copilot.data.query` plus source and owner authorization | Active schema/selection metadata |
| POST `/knowledge/sources/:sourceCode/query` | `copilot.data.query` plus source and owner authorization | Bounded live record read |

The request cannot choose repository roots, broaden source paths, disable scans,
replace tenant identity or supply a service identity. The controller maps only
the route source code; Core constructs policy context from trusted authentication.
An absent or inaccessible source returns the same safe authorization failure.
Provider failures are normalized to `ERR_CPK_00012`, without raw host/path/secret
messages. The client performs no automatic POST retry.

The inventory has contract version 1, trusted context, presentation, limit,
page, hasMore and sources. The default window is 40, configurable from 1 through 100.
`hasMore` means additional authorized definitions exist; no global source count
is exposed. Source preview results identify the exact source and configured
version. Axis rejects a preview response that differs from the inspected version.

## Configuration and Customization

Reusable controls live in `copilot.knowledge.studio`, not customer kickoff code.
A later approved configuration layer can supply only its intended differences:

```js
module.exports = {
    copilot: { knowledge: { studio: {
        maximumSources: 20,
        presentation: { title: 'Project knowledge' }
    } } }
};
```

Source definitions still follow [secure source definitions](secure-source-definitions.md).
Changing the title or window grants no extra permissions. Replacing source
providers must preserve containment, secret inspection, byte/file bounds,
classification and the Discovery projection authority. Override focused loader
methods, not a copied runtime service. Preview must always retain `dryRun: true`.

## Failure and Recovery

- Missing navigation: inspect current authenticated BackOffice discovery and the
  owning runtime connection. Do not add a local frontend menu to bypass it.
- Empty inventory: verify source definitions and actual employee permissions;
  do not broaden source classification merely to populate the list.
- Unknown after restart: inspect/reconcile using the indexing owner. Do not
  reconstruct successful evidence from configuration alone.
- Failed preview: check the registered provider, source enablement, approved
  root, ingestion gate and bounds through safe operator diagnostics. Retry is
  manual and remains read-only.
- Failed refresh: authorization is checked before system delegation. A failed
  refresh may follow partial index writes; preview success is not rollback proof.
- Enterprise switch: the route unmounts previous inventory and preview state.
  Pending selected-source previews are cancelled when their component unmounts.

## Verification and Deployment

Backend tests in `test/copilotKnowledgeStudio.test.js` cover denied non-invocation,
tenant/version state, disabled sources, customized limits, secret-free failure
metadata and preview non-mutation. Existing ingestion tests prove dry-run does
not call Discovery writes. Run `npm test --workspace=nodics.copilot` at repository
root. These isolated contracts do not prove a deployed registry or database.

Axis owns typed transport, renderer, context admission, interaction and responsive
tests. Its `test/assistant/knowledge-studio.visual.html` is synthetic test data,
not an authenticated operational page. Desktop/mobile fixture screenshots cannot
serve as evidence of live source ingestion or permission provisioning.

Deploy backend source through normal generation/runtime lifecycle, refresh
BackOffice discovery, and deploy the compatible Axis client. Verify allowed and
denied identities against the live routes before accepting the deployed journey.
No data migration or source activation is performed by opening the screen.

Existing direct employee callers of `refresh(request)` must now supply trusted
`securityContext`; Core performs this mapping for the HTTP API. Do not copy body
fields into it. The internal startup ingestion entry is unchanged. Process-local
report keys now include index tenant; no durable index records are migrated.
The status projection omits raw provider errors and unbounded rejected-path lists.
Consumers must accept UNKNOWN/STALE states instead of inferring readiness from
the existence of a configured source. The Workspace renderer is updated with
this implementation; deployment must coordinate source and client contracts.
