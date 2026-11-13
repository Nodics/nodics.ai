# CMS Publication Manifest AI Contract

Page-route requests select the exact saved version, including revision zero.
Site-baseline requests retain their existing default source selection. When a
request declares a destination Site or a Catalog with a saved authoring scope,
the frozen root must agree with that declaration during validation and manifest
construction.

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

## Operator Rollback Scope

Staged qualifies the current Online manifest before offering or starting an
operator rollback. Online then verifies the exact current pointers inside the
restore transaction. A page release can restore a predecessor covering the same
route scopes. Restoring a site bundle requires ownership of its active site
pointers. A stale or differently scoped predecessor cannot replace newer
content. Keep historical manifests and existing receipts available for inquiry.

## Restricted Task Review

`GET /publication/reviews/:instanceCode/tasks/:taskCode` on CMS Staged requires
the original human access token and `cms.publication.approve`. CMS reads the
native Process detail with the same token and enterprise. It admits only the
exact active CMS approval task, checks claimed assignment, and binds the
tenant, enterprise, deterministic workflow reference and pending nPublish
revision before any private CMS reads. Both bindings are rechecked before
returning evidence. Authoring and generic Publishing routes retain their own
permissions.

The no-store projection includes only frozen route/page identities, allowlisted
plain component text, exact validated dependency pins, Media references and
changes. CMS compares against the exact same-scope Online pointer and retained
manifest. Absent proof yields an unavailable comparison. Media references remain
subject to Media's publication controls. CMS does not assemble an activation
package, export asset bytes, change a task or write a lifecycle record.

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

## Baseline Root Derivation

An explicitly selected content-pack baseline retains releaseVersion and
sourceVersion. CMS may derive rootType=site and rootCode only when that exact
available release is WCMS_STAGED/PUBLISHABLE/ADMIN_INITIATED and declares exactly
one site. Missing version, ambiguity, conflicting partial roots or release drift
reject; status reports INVALID_RELEASE without importing or publishing. Multi-site
packs and ordinary data-release baselines retain explicit roots. Stored approval
and coordinated Media dependencies still bind the original immutable release.

### Baseline relocation and retained release metadata

`destinationRole: WCMS_STAGED` in the governed baseline release/pack is retained
metadata, not a physical host selector. Changing a server's descriptive role code
or cohosting CMS does not require changing that metadata. Keep the exact release
version, PUBLISHABLE lifecycle, ADMIN_INITIATED policy and unambiguous root checks.
The source's effective CMS publication context remains STAGED. Renaming manifest
labels would change the governed source contract and is not configuration-only
relocation; do not rewrite installed receipts or silently adopt new release data.
`test/cmsBaselineRelocationContract.test.js` exercises renamed hosts and rejects
changed destination metadata, versions, lifecycle, policy and ambiguous roots
with isolated catalogue/pack ports; it does not install or publish anything.

## Shared-route locale snapshots

The configured `localization.legacyRouteLocale` is a routing sentinel, never a
BCP47 content language. At publication, expand that frozen route into the bounded
canonical `supportedLocales` (or configured default language), retaining its exact
Page/component/localization dependency versions. One Page publication may therefore
use the existing SITE snapshot container for its locale routes. It remains scoped
to that Page's frozen route; this never publishes other pages in the Site.

For a Site publication, an explicit frozen locale route takes precedence over the
shared-route projection at the same Site/path/locale/channel/access identity.
Duplicate identities at equal priority or ambiguous canonical locale declarations
reject before persisting a manifest. The configured bundle route ceiling applies
to the complete expanded set. Documentation navigation derives metadata only from
these projected exact locale scopes and the frozen reachable article graph.

Deploy all locale pointers through the existing target transaction, content hashes,
CAS, receipts and outbox. Site publications retain the existing prepared-route/index chunking path.
Page locale bundles retain the existing target manifest/payload boundary; they
do not introduce a second chunk-index lookup or a guessed previous manifest. Source route records and locale variants remain untouched. Current
Online inspection must confirm every projected locale agrees on the same immutable
manifest; missing or mixed pointers fail closed. No live delivery fallback, latest
content lookup, implicit publication or approval bypass is introduced.

Retained Media readiness delegates to `DefaultMediaDependencyReadinessService.inspectAssets` after CMS selects assets from this exact sealed bundle. Preserve the response contract and existing `cmsMedia_` identity. The delegate is read-only and cannot approve, activate or repair dependencies.


## Page Designer menu entries and scoped operators

The Designer projects an active top-level page menu entry only when its
site, target, locale and channel match the saved route and no extra navigation
restriction needs evaluation. The exact route version carries the projection.
The Online manifest returns the menu link through the same route audience as
the page. A changed menu must be saved with the route before approval.

A tenant administrator with the corresponding publication action permission
can inspect or roll back a CMS page-route publication after the CMS owner
verifies the exact source version in the administrator's Site and Catalog.
Process review and its approval permission remain separate. Rollback uses the
inspected revision and the retained Online predecessor.

## Public knowledge proof

The uncached public `GET /delivery/knowledge` endpoint reads only Online publication
pointers and immutable snapshots. It ignores authenticated access overrides, validates
exact Site/path/locale/channel and PUBLIC scope, and rereads to detect changes.
`cms.delivery.maximumKnowledgePageBytes` bounds the output; its reusable default
belongs to CMS. The returned digest pins visible snapshot content without exposing
private manifest identifiers. Disabled publication, Staged delivery, withdrawal,
ambiguous or changed snapshots fail closed. This read neither publishes nor grants
Copilot source access. Run `test/cmsPublishedKnowledge.test.js`.

## Exact callback and receipt recovery

The existing CMS Process callback keeps its fixed API and payload. The admitted Workflow runtime must name the exact stored workflow, pending revision and correlation. A replay succeeds only against the uninterrupted committed decision journal, including the original decision reason and definition/version. It returns the original Online or rejection result without another lifecycle transition; an approved or activating interruption resumes that same activation. A failed, resubmitted or otherwise changed attempt requires its normal owner recovery and review.

Online deployment receipts require a fresh exact owner readback after save, including after a lost acknowledgement or competing write. An absent, ambiguous or conflicting receipt is not success. Reconciliation reports RECEIPT_MISMATCH without overwriting it. Missing evidence is repaired only after a transaction-local pointer recheck and revision CAS fence on every covered scope. The fence advances only technical revisions; it does not change delivery ownership. Pointer drift refuses repair. Recovery retains the original activation operation key and manifest revision and qualifies its matching target receipt before reporting completion.

See cmsPublicationWorkflowCallback.test.js and cmsPublicationManifestContract.test.js for exact replay, intermediate recovery, conflicting evidence, unacknowledged persistence, pointer races and lost-response recovery. Deployment connection and application release selections remain project-owned; these safeguards are Framework behavior.

Frozen documentation approval reviews include bounded plain-text article blocks and before/after content from the immutable snapshots. Unknown blocks and truncation are explicit; arbitrary source fields and provider URLs are excluded. Existing current-task, tenant, enterprise, reviewer and publication revision checks remain mandatory. The source correction is documented in CMS documentation release 0.0.3; installation and Online approval remain separate.


A selected page can restore its exact predecessor even when that predecessor was published as part of a larger Site release. The Online owner verifies the current pointer and its previous-manifest lineage inside the transaction, restores only the selected delivery scope and preserves sibling routes. It rejects a stale pointer, missing route, different Site or unrelated predecessor. Review of older Site releases without a catalog field uses the exact frozen Site dependency to prove catalog ownership; a latest authoring read cannot supply that proof.


A provider may admit retry of a failed legacy rollback only through canRetryRejectedRollback returning exactly true after fresh owner checks. CMS admits only its transaction-scoped ERR_CMS_00116 rejection, a contiguous Online to Rolling Back to Failed journal, unchanged activation/predecessor identities and the same current Online pointer. Retry appends audit evidence and uses current pointer fencing; it never rewrites the old journal or activates a new revision. Timeouts, response loss, incomplete history and other failures remain blocked unless the existing qualified command receipt contract proves recovery.


## Reviewed Online experience generations

Placements are frozen as hashed values in the existing publication dependency journal before review. CMS manifests retain these values, including chunked Site releases. The reviewer sees their exact targeting. Online Experience reads only active public pointers and frozen component graphs. Discovery guarded generations own current-alias publication, acknowledged visibility and exact-count proof. Pending generations never replace the previous complete public projection. Explicit Site-authorized inspection, exact-revision retirement and rebuild provide recovery; unknown writes are never replayed or deleted. Public generation reads enter the existing service-token transport when actorless. Defaults and bounds remain in Framework.
