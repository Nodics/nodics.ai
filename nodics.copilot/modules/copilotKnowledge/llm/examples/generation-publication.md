# Complete Knowledge Generations

## Purpose And Owners

A source refresh can remove files, shorten documents or reject newly detected
secrets. Overwriting only matching chunk IDs leaves old chunks behind. Generation
mode makes all accepted chunks visible together and excludes every older
generation before retrieval. Copilot decides eligible content; Discovery
Publication owns the durable generation manifest and compare-and-set pointer;
Discovery Projection and nSearch own physical writes, visibility and deletion.
Process and Cronjob still own jobs, schedules and execution history.

## Deployment Migration

Dedicated legacy-index retirement now has a separate reviewed provider-backed
journey. See [Knowledge Progress and Recovery](../../data/docs-v001/records/documentation/copilotKnowledgeDocumentationComponentData.js#retire-a-dedicated-legacy-index).
It verifies policy-current replacement generations, claims once, write-blocks the
old dedicated index through nSearch, and supports original receipt inspection.
Retirement retains old data and never implies physical erasure or completion for
historical writers. A separate reviewed erasure command supports the qualified
API-key-only profile described in that guide. Ordinary generation cleanup
eligibility is unchanged. nAuth declares migration read/execute/erase in
the canonical permission catalogue consumed by Profile; deployments assign them explicitly
to scoped operators. Declaration grants no access and both mutation gates remain
disabled by default.

1. Deploy the private `discoveryGeneration` schema with its unique `code` index
   and generated get/save/update services on the owning runtime. Verify
   tenant-scoped journaled majority persistence and the logical Discovery index.
   Deploy the guarded writer protocol on every ingestion runtime before enabling
   generation mode. Mixed old/new writers are not qualified; unguarded access to
   guarded manifests fails closed. The schema must remain private and cache-free.
2. Verify nSearch's save, refresh, exact-count search and query-removal pipelines
   for the selected provider. Custom physical index names remain behind the
   logical `indexName`; do not put physical names into the registry.
3. Enable `copilot.knowledge.generationPublication.enabled` through nConfig in
   the intended environment. It defaults to false for explicit migration.
4. Refresh each authorized static source. Missing manifests expose no legacy
   chunks in generation mode. Expect insufficient evidence until first refresh
   completes. Do not switch back to legacy mode as an incident workaround:
   legacy documents have not been physically migrated or erased.
5. Open Knowledge Studio, reload the inventory and inspect the source. The
   durable evidence message appears only when the published policy fingerprint
   and actual index count match. A missing index, count failure or malformed
   persistence response is not fabricated into readiness.
6. Open Copilot Workspace. Its bounded personal knowledge status uses the same
   durable inspection; pending writer/cleanup flags create knowledge attention.
   The status API probes at most 100 authorized sources, and the dashboard uses
   its smaller activity-window bound. `hasMore` is not a global readiness total.
   The infrastructure aggregate readiness method remains process-local.

## Refresh Sequence

```text
registered source -> current policy -> bounded read -> secret scan -> chunks
                                                                   |
                                                    Discovery writer CAS
                                                                   |
                                                    unique generation IDs
                                                                   |
                                                     acknowledged writes
                                                                   |
                                             nSearch visibility + exact count
                                                                   |
                                                    current policy recheck
                                                                   |
                                                  atomic generation publish
                                                                   |
                                              exact obsolete-generation cleanup
```

Old published content remains selected while a replacement is incomplete, but
only if it still matches current source policy. New generation IDs prevent a
partial writer from overwriting active chunks. A successful empty generation
publishes zero chunks and removes the previous generation, so deleting the last
file does not leave old evidence searchable. Secret-rejected files are omitted
from the replacement and are reported using codes/paths, never secret values.

Retrieval resolves only already-authorized sources, filters by active generation
before calling Discovery, then checks each returned source/generation pair and
re-reads the pointer after search. Publication or revocation during retrieval
can yield no evidence; it does not authorize a stale fallback.
Index-routing changes during the scan, probe or retrieval invalidate the result.
Manual refresh also rechecks the original employee's current management/source
authority before writes/publication. Workflow refresh rechecks the verified
service and the exact published assignment at that same boundary.

## Operator Interpretation And Recovery

Previously published obsolete generations can use the permissioned
[reviewed cleanup journey](reviewed-cleanup.md) in Studio. It requires private
receipt persistence. It also admits retired guarded writers only when Discovery
has durable quiescence proof; uncertain or unclassified legacy debt stays blocked.

- `PROJECTED` with `DURABLE_GENERATION` means the source's current fingerprint
  matches the durable descriptor and its exact indexed count at inspection.
  It is not a provider answer-quality guarantee or a cryptographic index audit.
- `STALE` means policy mismatch or count mismatch. `UNKNOWN` means no published
  descriptor. Transport/persistence failures surface as unavailable inspection.
- `inspectionRequired` means a writer is still claimed. A timeout never permits
  another writer to steal its claim. Knowledge Studio disables another refresh
  after preview; operator investigation is required.
- `cleanupPending` means a recorded obsolete generation remains, including retired
  unpublished work. Removal or its journal acknowledgement may be uncertain. Retrieval
  already excludes the old generation. Do not repeat the entire ingestion to
  repair a cleanup acknowledgement.

For an uncertain writer, inspect its Process execution and owning runtime first.
Use the separately authorized [writer retirement](pending-writer-recovery.md)
review. Retirement prevents another per-write claim and publication, but does not
cancel a dispatched write. An IDLE/SEALED retired writer is quiescent; a WRITING
writer stays blocked until that exact original write confirms completion. The
worker records completion before noticing retirement and cannot adopt a new
pending generation. Lost claims, lost physical responses or lost completion
acknowledgements never authorize automatic dispatch or deletion. Legacy writers
have no retroactively inferred proof. Inspect the owning runtime; do not edit
manifest state to manufacture quiescence.

Studio shows acknowledged chunks out of expected chunks and the current write
phase. Reload the inventory for fresh evidence. SEALED means writes completed,
not that refresh/count/publication succeeded. These counters are not an overall
job percentage, live activity heartbeat or proof that a stalled worker stopped.

## Bounds, Formats And Remaining Limits

Existing file/byte/chunk limits and source include/exclude rules still apply.
Generation descriptors cap document counts at 100,000; obsolete generations cap
at 100 before further claims require cleanup. Refresh still reads and rechunks
the whole bounded source; opt-in content fingerprints can reuse physically
verified unchanged content after scanning. This is not file-level delta indexing
or schedule provisioning. History still uses existing Process scope.
Legacy unqualified chunks are excluded in generation mode but not automatically
deleted; any migration erasure requires a separately reviewed bounded operation.

Repository text ingestion supports Markdown/MDX, plain text, reStructuredText,
AsciiDoc, JS/MJS/CJS/JSX, TS/TSX, JSON/YAML, CSS/SCSS, HTML/XML, SQL, GraphQL and
shell text. Only extensions allowed by both global and source policy are read.
Invalid UTF-8 and NUL-containing files fail closed instead of silently decoding
binary data. PDF, DOCX, OCR, remote publication and log/data-lake connectors are
not made available by renaming files; they need owning registered providers.

## Customization And Verification

Partners customize source definitions, bounded extensions, roots, logical index
selection and runtime activation through existing layers. Override focused
providers, never copy search-engine clients into Copilot. Preserve current
eligibility, secret inspection and before/after retrieval checks. Administrators
use Studio for preview/refresh; infrastructure maintainers own manifest/index
provisioning and uncertain-writer inspection.

Run Knowledge publication, ingestion/retrieval, Studio and Process callback
tests plus Discovery generation/publication and projection binding tests.
Isolated generated-service/index fixtures prove contracts, not deployment of
unique indexes, cross-node database behavior or real nSearch acceptance.
