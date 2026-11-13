# WCMS Experience Governance Contract

Status: Governed implementation; explicit private Staged preparation authorized on 2026-11-06.

This contract freezes the mandatory Nodics principles for `wcmsExperience` before deeper implementation.

## 1. Lifecycle boundary

The canonical lifecycle is:

```text
CMS authoring or imported Staged data
  -> publish approval
  -> WCMS Experience projection build
  -> Discovery/Elasticsearch versioned index
  -> Online resolver reads current published projection
```

Storefront/runtime delivery must not read draft or mutable Staged CMS records directly.

## 2. Source-of-truth boundary

- CMS components and containers are the renderable content source of truth.
- `cmsExperiencePlacement` is the targeting and placement source of truth.
- Discovery/Elasticsearch is the optimized delivery projection, not the authoring source.
- Agora and other storefronts render approved renderer contracts only.
- Axis is the authoring, preview, governance, and status surface.

Customer or reference seed data must live in customer/project modules such as `agora.apparel`, not in this framework module.

## 3. Publication hook

Online indexing must be triggered only from committed CMS publication flow after approval/activation has a durable publication event.

An employee may explicitly prepare a private Staged preview before publication.
This requires WCMS_EXPERIENCE_PREVIEW plus the existing CMS employee and persisted
Site/Catalog ownership checks. Source components remain CMS-owned; the browser
submits only bounded journey selectors. Preparation never approves content, invokes
Online indexing, changes public aliases or runs automatically from save/import.

Reuse Discovery's guarded immutable-generation manifest, unique claim, per-write
CAS and exact visible count. Publish the private generation pointer only after all
writes, visibility and source revalidation succeed. Pending or uncertain writers
remain hidden and require explicit inspection. Retirement requires the inspected
revision/token and fences further writes; it is not deletion or Online rollback.
Preview reads only the complete generation for the same employee Enterprise and
journey. No generation store, provider or identity authority belongs in Axis.

Each stage remains an explicit authorized user action. A user holding review,
approval and publication permissions may perform those stages; this feature adds
no requester/reviewer separation requirement. Online publication retains its own
existing Process/nPublish authorization and approval contract.

Automatic indexing must not run from:

- draft component save;
- ad hoc staged import alone;
- storefront request-time rendering;
- frontend code.

## 4. Idempotency and rollback

Publication/indexing must be safe to retry.

Required behavior:

- indexing the same release twice produces the same effective projection;
- failed indexing does not switch the Online alias;
- previous Online projection remains active until the new projection is complete;
- rollback restores a previous approved projection;
- partial projection failure must not expose broken Online delivery.

## 5. Axis permission model

Axis/BackOffice must expose separate permissions for:

- `WCMS_EXPERIENCE_VIEW`
- `WCMS_EXPERIENCE_EDIT`
- `WCMS_EXPERIENCE_PREVIEW`
- `WCMS_EXPERIENCE_PUBLISH_STATUS`
- `WCMS_EXPERIENCE_OVERRIDE`

Experience Studio may later be integrated with Page Designer, but both surfaces must use the same backend model and permissions.

The capability provider places Experience Studio and its children in the existing
CMS `content` navigation group (order `200`, label `Content and Experience`).
Axis composes by group identity, not display label. A separate group with the same
label is not an integration mechanism. This presentation contract does not change
routes, parent relationships, PREVIEW state, permissions or deployment activation.

## 6. Storefront-safe resolver response

Public resolver responses may include only storefront-safe component projections:

- slot;
- placement code;
- component code;
- renderer key;
- contract version;
- properties;
- media;
- release/index metadata safe for diagnostics.

Public resolver responses must not expose:

- draft content;
- raw rules or scoring internals;
- Mongo/internal storage identifiers;
- privileged authoring metadata;
- executable frontend code.

## 7. Performance guardrails

Request-time resolution must query indexed placement projections and must not scan all CMS components.

Mandatory limits:

- bounded query by site, page type, target dimensions, locale, channel, device, and date;
- maximum slot and component limits from configuration;
- cache support for repeated delivery lookups;
- deterministic fallback behavior.

## 8. Renderer compatibility

Every projected component must carry:

- `rendererKey`;
- `contractVersion`;
- safe `properties`;
- optional media references.

Storefronts must ignore or safely degrade unsupported renderer keys or contract versions.

## 9. Staged preview and Online delivery split

- `previewMode=true` may resolve Staged projections for Axis preview.
- public storefront delivery must resolve only Online/current projections.
- Online delivery must never return Staged-only draft content.

## 10. Documentation requirement

The implementation is not complete without end-to-end documentation for:

- developer contract;
- business user guide;
- Axis Experience Studio guide;
- collection journey example;
- brand journey example;
- default fallback example;
- publication/index status and troubleshooting.

## Discovery owner routing

Committed CMS Online indexing explicitly targets the ONLINE Discovery projection
owner, including withdrawal updates. Authorized preview reads target STAGED;
ordinary delivery reads target ONLINE. These are publication identities, not
runtime names or endpoints. The Discovery facade uses canonical DMS; keep route
preview authorization intact and never select publication from untrusted remote
operation payloads. Source tests qualify target selection, not live publication,
alias switching or installed service-token grants.

## Scoped observation and failure safety

Operational resolution requires Discovery. Empty reads stay empty; missing providers,
invalid records and failed reads never resolve authored fixtures. HTTP context accepts
only Site/page/target/locale/channel/device/region, never a caller clock, tenant,
authentication or asserted customer segments. Active delivery requires explicit
publication/delivery status and valid date/region/segment predicates.

GET authoring/index-status requires the same journey context (at least site/pageType).
It performs one bounded Staged projection lookup, preserving trusted tenant and actor.
EMPTY, OBSERVED and UNAVAILABLE are observations, never a CURRENT alias or publication
certificate. documentCount is the bounded matching projection count; resolvedPlacementCount
counts matching active placements. UNAVAILABLE has no invented zero count/version.
A client must retire old evidence on actor, owner or journey changes and show the
observation context. Do not import or publish merely to turn diagnostics green.

The committed Online publication hook remains separate from explicit private Staged
preparation. A deployment must qualify the guarded Staged path before claiming a
successful indexed preview; fixture tests and raw authored rows are insufficient.
Later modules may override exported provider/status members while retaining these
admission, isolation and evidence limits. Run wcmsExperienceEvidence and projection
adapter tests for default, unavailable and customized provider behavior.


## Reviewed Online experience generations

Placements are frozen as hashed values in the existing publication dependency journal before review. CMS manifests retain these values, including chunked Site releases. The reviewer sees their exact targeting. Online Experience reads only active public pointers and frozen component graphs. Discovery guarded generations own current-alias publication, acknowledged visibility and exact-count proof. Pending generations never replace the previous complete public projection. Explicit Site-authorized inspection, exact-revision retirement and rebuild provide recovery; unknown writes are never replayed or deleted. Public generation reads enter the existing service-token transport when actorless. Defaults and bounds remain in Framework.

## Guided authoring

The existing placements workspace may compose the CMS saved-page editor, current Experience targeting and private preview. GET authoring/placements binds catalogCode/siteCode/pageCode before the first CMS admission, retains the original employee and returns only existing page-root placements plus scoped competing rules. Choice labels do not grant authority. Existing configured targets are shown without redefining Commerce identities. CMS supplies nested content fields and limits; Experience supplies stable slot vocabulary and maximumAbsolutePriority.

PUT requires WCMS_EXPERIENCE_EDIT and cms.authoring.write, the exact source hash, code and expected revision. Recheck the whole saved page and Site placement set; reject tied priorities for the same target, page type, slot, locale and channel. Execute one revision-conditional generated owner update, demand exactly one confirmed modification and read back its values. On failure or uncertainty, retain the draft and inspect; do not replay automatically. This command neither prepares a projection nor approves/publishes. Preview authorization, Process review and nPublish activation remain independently required.

Axis may display safe textual content and nested structure for review; it must not execute arbitrary customer renderer code or promise pixel-exact storefront layout. Show the original placement and renderer identity beside the content. Qualify scope denial, stale revision, concurrent change, overlap correction, one-attempt failure, nested preview and approved Online parity.

Frozen approval projection presents named target, slot, priority, locale, delivery state and content override values from the pinned placement. Axis does not parse backend JSON to reconstruct this evidence. Preview command progress is distinct from an uncertain acknowledgement; conflicting priorities remain held for an explicit edit and inspection.
