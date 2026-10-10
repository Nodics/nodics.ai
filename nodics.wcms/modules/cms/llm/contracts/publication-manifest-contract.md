# CMS Publication Manifest AI Contract

- Never implement CMS lifecycle state outside `nPublish`.
- Never treat `versionId` alone as the Online publication pointer.
- Staged and Online must be separate systems or database/schema authorities;
  Staged must never update Online persistence directly.
- Freeze exact route, page, association, component, template, and slot versions
  in an immutable CMS publication manifest.
- If a site manifest exceeds source publication chunk policy, split it into
  prepared route manifests plus a small `SITE_INDEX` manifest. Activate Online
  pointers only through the index after each route manifest is imported,
  scope-checked, and content-hash checked.
- Select Online content through the tenant/site/path/locale/channel/access-mode
  pointer using optimistic compare-and-set updates owned by the target runtime.
- Send integrity-protected immutable manifests through the configured transport,
  authenticate with the existing module-token contract, and require a target
  deployment receipt before nPublish records Online success.
- Mark target routes with `authTokenTypes: ['service']`; internal permission
  alone must not allow a human access token to impersonate a module.
- Preserve one correlation ID across Staged lifecycle, manifest, target pointer,
  and deployment receipt without logging credentials.
- Concurrent identical target writes must converge idempotently; target outage
  must retain the previous Online pointer and produce an auditable failed release.
- When `cms.publication.enabled` is true, delivery must use only the manifest
  authority and fail closed; do not add a legacy fallback path.
- Enable selected CMS schema `isVersionedEnabled` flags only in a layer that also
  activates the existing versioned database contract; default CMS must remain
  deployable without that variant.
- Keep graph limits, supported root types, and service providers layered and
  overridable.
- Keep scheduling in cronjob, generic lifecycle/audit in nPublish, physical
  versions in database variants, and CMS dependency/delivery rules in CMS.
- CMS computes published-media protection from all stored Online pointers and
  both `manifestCode` and `previousManifestCode`; inactive pointers remain
  recoverable and therefore protected.
- Missing protected manifests and configured pointer/manifest boundaries fail
  collection closed. CMS never removes media storage directly; it delegates a
  bounded protected-code set to Media, and deletion defaults to dry-run.
- Before target mutation, require `DefaultDatabaseTransactionService`
  capabilities `multiRecordAtomic: true` and `contextPropagation: true`.
  Unsupported or non-transactional providers must fail before work begins;
  never describe ordered writes or compensation as an atomic deployment.
- Manifest, pointer, receipt, and outbox writes share one opaque transaction
  context. Cache delivery occurs only after commit.
- Outbox reconciliation honors an explicit `publicationCode` in its generated
  service query before batch limiting. Empty or malformed supplied codes reject;
  a Media-only scope cannot process other CMS events. Omitted scope retains
  bounded tenant startup recovery. Custom consumers must preserve this boundary.
- Use pointer revision compare-and-set plus operation-scoped receipt/outbox
  identities. A retry after a committed response is lost must converge without
  another pointer, receipt, or event.
- Treat chunking as CMS publication runtime behavior. Data files define records
  and media references only; they must not contain procedural publishing,
  storage, approval, or routing logic.

## Documentation Navigation Projection

At snapshot construction, `documentation.component.navigation` retains its
authored item order and identity but takes title, summary, keywords and search
text from the canonical `documentation.component.article` reachable through
active frozen page/component associations. The article must declare its owner
and match the item's canonical code and route. Site, locale, channel and access
mode must match exactly. Only preloaded dependency versions and their frozen
localization variants participate; this is not a latest-content query or a
second discovery/import mechanism. Missing, redirected, inactive, foreign-scope
or ambiguous articles are omitted. Missing full-text metadata falls back only
to current article title/summary/keywords, never stale navigation text.

The projection does not alter authored releases, canonical articles, shared
navigation records or existing immutable manifests. Other renderers keep their
existing delivery projection, including removal of article-only search fields.
An already Online publication adopts corrected projection behavior only through
normal revision-pinned CMS validation, request-approval and its independent
Process `publicationReview` decision. This creates a new immutable manifest and
preserves the previous pointer/manifest for recovery. Do not force a data or
asset reimport merely to renew the snapshot. Fresh Media readiness must still
qualify every exact manifest pin. `test/cmsDocumentationNavigationProjection.test.js`
covers reachability, scope exclusion, ambiguity, localization and non-mutation.

## Retained Media Dependency Readiness

`DefaultCmsMediaDependencyReadinessService` reads the exact persisted CMS target
manifest, including bounded SITE_INDEX child manifests. It does not rebuild a
snapshot from latest records. For retained Media deployments, it qualifies each
pinned asset through Media's version-provider APIs: active target version,
retained exact metadata/bytes, read-only target reconciliation, and a second
target status read confirming the same version/revision. No activation, receipt
repair, import, publication request, or approval mutation occurs during status.
Use the existing `maxBundleRoutes` and Media `maximumAssets` ceilings.

When the selected Media provider supports bounded pointer batches, CMS takes
one initial batch and one final batch around all exact metadata and physical
integrity checks. Every qualified asset must retain its original version and
revision. The default Media owner also accepts a bounded exact integrity batch
on its existing reconcile route. This reduces N active assets from 3N to three
remote calls without caching readiness or skipping any byte checks. The whole
integrity selection is validated before owner reads, and results must match
every exact identity in order with protected, non-repaired, non-deleted evidence.
False intact/active evidence remains BYTES_UNAVAILABLE. Overlays supporting only
pointer batching use N+2 calls; overlays without batch support retain the
single-asset checks. Batch evidence must cover the complete ordered selection;
missing, foreign or malformed entries fail closed. On unavailable inspection,
diagnostics expose only a fixed `inspectionStage` and a format-validated
`ownerErrorCode`, never an original exception message, cause or provider locator.

The baseline status and initiate responses expose `mediaDependencies` with
`contractVersion: 1`, owner, status, qualified, bounded dependencies and safe
message. Each dependency carries mediaCode, pinned versionId/checksum, status,
qualification and optional active version, verified-byte evidence, inert Media
handoff, deterministic `publicationCode`, and exact-version publication-request description. No paths, locators,
provider details, secrets or file payloads are returned. Missing/denied reads,
malformed target evidence or inconsistent child manifests are `UNAVAILABLE`.
Unactivated assets are `NOT_ACTIVATED`; changed metadata is `VERSION_MISMATCH`;
missing target bytes are `BYTES_UNAVAILABLE`; an activation changed during
inspection is `ACTIVATION_CHANGED`. None may be treated as READY or silently
retried. Legacy manifests missing versionId are `VERSION_UNPINNED`, never latest
version guesses. Explicit Initialize against an unpinned Online baseline
requests a fresh normal CMS approval through the existing revisioned lifecycle;
it does not return the old Online publication, overwrite its immutable manifest,
or reinstall current data solely for the pin refresh. Newly reviewed manifests
must receive the pin from Media's own export projection.

CMS `ONLINE` is preserved as its lifecycle fact. Overall readiness is
`MEDIA_DEPENDENCIES_PENDING` until retained dependencies qualify. Explicitly
non-retained deployments preserve their existing behavior through
`NOT_REQUIRED`; the consumer never enables retained publication or invents a
target runtime. The Media owner supplies navigation and actual command
authorization. An inert request describes the existing `/publication/requests`
contract and still requires an explicit request and separate normal Process
approval. The deterministic reference hashes CMS publication code, target
manifest version, asset code, pinned asset version and checksum. A changed pin
therefore cannot reuse the old approval identity. Axis may coordinate these
normal approvals in one explicit action, using the employee's native Media
request with `expectedChecksum` and actual returned Process workflow reference.
It must validate the whole missing dependency set before requests, stop on
denial, never substitute delegated CMS credentials or returned URLs, and report
partial owner effects. Explicit resume skips assets already qualified Online.
This action is not atomic across CMS, Media and Process. CMS approval is not
Media approval; only fresh backend readiness proves the whole pack available.

Later layers may decorate the CMS consumer and owner presentation, but must
preserve exact-release selection, bounded inspection, signed scope, fail-closed
qualification and independent approval. Mock tests prove these source contracts,
not live storage/transport qualification or public image delivery.
