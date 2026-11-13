# cms AI Contracts

## Navigation Import Dependencies

Navigation PAGE/ROUTE targets require nonempty scalar codes and fresh uncached
generated-owner reads before any navigation write. Only a canonical successful
empty lookup (`SUC_FIND_00000`, count 0, empty result, no transport failure) may
declare `DEPENDENCY` / `NOT_APPLIED` through the existing import retry owner.
Later files in that same approved import may then supply the target; successful
rows are not replayed. Missing services, malformed/denied reads, invalid nodes,
unsafe URLs and unknown write outcomes remain terminal. Bounded exhaustion still
fails the run. This does not authorize automatic retries of retained failed runs
or alter immutable release content. The inert
`test/cmsNavigationImportDependencyContract.test.js` composes CMS validation,
generated get/save failure serialization and real import phases with the existing
Nexus records; it is source verification, not live import acceptance.

## Documentation product discovery

`cmsDocumentationProduct` records own product name, `publicRootPath`, Site,
content catalog, description and audience. CMS navigation/page records own the
published reader hierarchy. Do not duplicate these identities in a configuration
map or a customer copy of a generic capability service.

BackOffice capability registration is synchronous and not an employee/tenant
content-read context. Providers must not perform asynchronous content queries,
cache tenant records into runtime registration or introduce service-credential
reads to manufacture a global documentation catalogue.

Axis may discover additional public product metadata through the existing secured
CMS schema capabilities and generated safe-search API using the current employee
and the registered Staged CMS connection. The authored lifecycle field is not
proof of publication. Online manifests serve published pages, not the authoring
product collection; never enable Online generic schema APIs for this discovery.
Reviewed STAGED and APPROVED products may be discovered alongside legacy ONLINE
metadata. DRAFT, retired, inactive and non-public records remain excluded. Only
owner READY status unlocks article delivery; discovery grants no publication.
Use advertised operations and bounded
paging; deny/unavailable/invalid responses must not trigger a fallback API, Site
or connection. Join products by exact Site to the existing authenticated
`DOCUMENTATION_BUNDLE` initialization profiles. Only the content-pack code,
publication profile and display order come from that existing profile. Ambiguous
bindings or routes fail closed. No new project configuration is required.

This is a transient reader projection, not another source registry or authority.
Existing BackOffice module sources remain available; CMS product records supply
additional product links within the documentation reader/dashboard. Unimported,
unpublished and non-public products are not promoted into public delivery.
Setup and Accelerators remains the existing entry for their governed preparation
and publication. The selected initialization profile still gates reader delivery,
and CMS independently enforces content access. Discovery never installs data,
approves publication or changes records.

Keep `publicRootPath` aligned with the generated root page route in the owning
content release. Correct immutable content via a successor release, never by a
client alias or rewritten historical payload. Axis matches declared route
boundaries and never defaults an unknown product URL to Framework.

Axis's `test/documentation/api/documentationProductClient.test.ts` and
`test/documentation/DocumentationRoutePage.test.tsx` cover read transport,
pagination, profile binding, unsafe/ambiguous metadata and fail-closed routing.
Live schema-read permissions and published record/page alignment must be verified
separately after deployment.

## Canonical guided acceptance

`acceptance:guided-initialization` is a CMS-owned tooling suite. Customer inputs
choose an enabled initialization profile, application publication profiles and
an Online delivery probe. Required assertions remain in CMS: destination binding,
init/core order, persisted CURRENT state, idempotent installation, Online import
denial, Process approval lineage and delivery availability. Execute only with
`--execute --approve-publications`; the suite may install and publish through
authorized owner APIs. It neither supplies emergency override nor retries denied
approval with broader authority. A same-actor policy denial is an acceptance
failure, not permission to bypass the workflow. Imports/help are inert.

This folder contains module-specific AI/developer contracts for `nodics.wcms/modules/cms`.

Use these files for rules that are more specific than root `AGENTS.md` and the module `AGENTS.md`, especially extension boundaries, override expectations, testing rules, security constraints, and generated-artifact responsibilities.

## WCMS authoring model

Publication `loadLatest` bounds each descending-version owner read and excludes
already resolved stable codes before continuing. Limits count distinct identities,
not history rows. The original query, tenant and employee authority remain bound;
ignored exclusion or excessive distinct identities rejects before a truncated
graph can be approved. Exact immutable version loads and schema-owned generic
HISTORY/CURRENT semantics are unchanged. Run
`test/cmsPublicationHistoryCapacity.test.js` for repeated-import regression coverage.

- `cms` owns the reusable WCMS authoring schemas. `wcms` owns
  workflow-enabled CMS behavior and should not duplicate plain authoring
  entity schemas.
- `cmsTypeCode` remains the canonical page/component type authority.
  Do not add parallel `cmsPageType` or `cmsComponentType` schemas.
- `cmsComponentDetail` remains the generic component-placement relation for
  page-to-component and component-to-component placement. Do not introduce
  `cmsComponentPlacement` unless a migration deliberately renames the existing
  contract.
- `cmsSlotDefinition` remains the template slot authority for slot
  cardinality, allowed component types, and allowed component type groups.
  Do not add a duplicate template-slot relation without a planned migration.
- Renderer mappings must stay logical and declarative. CMS can return renderer
  keys and contract versions, never executable frontend code, URLs, or local
  paths.
- Axis and BackOffice pages must consume backend navigation, help,
  documentation, schema/list/detail/query, and renderer metadata instead of
  hardcoding page-specific CRUD experiences.
- Axis Page Designer is allowed as a guided business-user composition
  workspace, but it must remain a client over CMS/Catalog/Media/Publishing
  contracts. It must not introduce a parallel page model, template model,
  component-placement model, media-storage authority, renderer-code authority,
  or publication authority.
- The designer sequence is Content Catalog, Site, Page Template, dynamic Slot
  Definitions, Page, Sections, Components, Media References, Page Routes,
  Navigation Nodes, and Publishing. Each step must persist through the owning
  backend schema or operation.
- Designer implementations must support any number of template slots. Do not
  hardcode header/main/footer or any other fixed slot model in CMS, Axis, or
  tests unless that exact template declares those slots.
- The secured CMS Designer Composition API may guide draft creation,
  validation, section/component ordering, media association, route assignment,
  navigation assignment, and publication readiness, but it must reuse
  `catalog`, `cmsSite`, `cmsPageTemplate`, `cmsSlotDefinition`, `cmsPage`,
  `cmsComponentDetail`, `cmsComponent`, `cmsComponentMedia`, `cmsPageRoute`,
  `cmsNavigationNode`, and nPublish contracts rather than creating replacement
  schemas.
- Validate authoring model changes with
  `node nodics.wcms/modules/cms/test/cmsDesignerCompositionContract.test.js`
  and
  `node nodics.wcms/modules/cms/test/cmsWcmsAuthoringSchemaContract.test.js`.

CMS owns generic guided-publication acceptance defaults: select the WCMS_STAGED
runtime and an enabled initialization profile using the framework `foundation`
template. Application publication selections, Site identities and delivery probes
belong to their accelerator or customer pack. Defaults never install or publish data.

## Nested Association Identity

`DefaultCmsComponentDetailInterceptorService.generateCmsComponentDetailCode`
is the selected exported identity helper. Its default convention remains
`source + '2' + uppercaseFirst(target)`; supplied codes stay unchanged.
The `cmsComponent.subComponents` and `cmsPage.cmsComponents` parent preSave
hooks prepare missing source and await this helper through `SERVICE` BEFORE
nested `cmsComponentDetail.saveAll` constructs its query. Child preSave remains
idempotent. Parent hooks must not bypass the database primary-identity guard,
remove replacement flags, infer catalog versions or grant replacement authority.

Later-layer helper overrides must preserve explicit codes and deterministic
identity. Obsolete-page placement comparison uses the same selected preparation;
it must not rederive default identities and retire customized incoming records.
Association position, source/target and index validation remain unchanged.
`test/cmsContentDeliveryContract.test.js` covers the actual nested model service
and generated query builder with component/page defaults, explicit identity,
async project override, collision/invariant rejection and retirement consistency.

## Slot Template Import Dependency

`cmsSlotDefinition.preSave` validates layout before reading its owning template.
Only a fresh (`skipItemCache: true`), successful generated template lookup carrying
the native `SUC_FIND_00000` code, `count: 0` and an empty `result` array declares `metadata.importRetry` as
`{ kind: 'DEPENDENCY', writeOutcome: 'NOT_APPLIED' }` on `ERR_CMS_00095`.
The slot has not been persisted at this boundary. The declaration does not
authorize writes or skip validation; the selected nImport retry owner may defer
the pending record within its existing phase limit and fail-fast policy.

Malformed template identity/layout, denied or failed provider reads, malformed
responses, missing/unknown success codes or counts and mismatched returned records
remain terminal and unmarked. Native generated reads have no separate HTTP status;
any added transport status must be explicitly successful (2xx). Other
CMS reference callers do not inherit this declaration. Existing optional-service
compatibility is unchanged. No header/body flag supplies retry authority.
`test/cmsWcmsAuthoringSchemaContract.test.js` composes actual outer/file import
phase owners, generated get/cache gates, bulk `addFailure`/serialization/result
completion and `insertLocalSchemaModel` with existing Axis slot/template records
and offline persistence:
dependency recovery, bounded exhaustion, no repeated successful template writes,
and terminal identity/layout/access/provider failures. Live installation remains
a separate acceptance gate; do not rewrite immutable Axis releases to reorder
this dependency or weaken generated persistence guards.

## Publication Readiness Diagnostics

Retained Media readiness is separate from CMS `ONLINE`. Follow
[Retained Media Dependency Readiness](publication-manifest-contract.md#retained-media-dependency-readiness).

- CMS/nPublish owns publication readiness facts for source release/content-pack
  state, publication lifecycle receipts, validation state, approval request
  state, target manifest lineage and Online pointer evidence.
- Process owns approval workflow/task facts. CMS may attach the Process
  `approvalDiagnostic` to publication readiness, but CMS must not mutate
  approval tasks or infer assignee/queue state itself.
- BackOffice consumes CMS `publicationDiagnostic`,
  `publicationDependencyGraph`, `approvalDiagnostic` and `approvalTask` as owner
  evidence. Axis renders these fields and must not synthesize publication
  readiness from local UI state.
- Publication diagnostics must include stable machine fields and business
  guidance: `status`, `severity`, `message`, `suggestedAction`,
  `disabledReason`, sanitized source/publication/target identifiers, and
  governed `repair` metadata when an action exists.
- Expected publication statuses include staged source not installed/importing,
  publication not created, validation pending, approval not requested, approval
  pending/rejected, failed, rolled back, withdrawn, Online receipt missing,
  Online pointer stale and Online.

The CMS schema declarations select the source records that a sealed Staged
content release may seed with `saveAll`. The default CMS Init release seeds
the default site and type codes as publishable source. Publication requires a
separate administrator action. Catalog records in those releases
require the local Foundation Catalog owner. Designer commands retain their
scoped authoring checks. Generic HTTP mutations remain read-only, and publication
manifests, pointers and deployment receipts have no source-import admission.

# Business Designer Authority

Documentation Designer resolves its article and navigation slots from the
selected enterprise-owned documentation product through the CMS composition
documentation model. A registered read-only documentation Site can share the
Catalog; it cannot become a write target. An explicitly foreign Site still
blocks the shared Catalog, and existing unowned records cannot be adopted.
Axis uses the regular composition save and submits the owner-read source stamp
through the existing publication request. Source-pack records still change
through their governed release path.

Saved composition reads use the same original human Content View authority,
explicit enterprise/Site/Catalog and Staged-only admission. Read current exact
heads, reject tied/malformed/incomplete history and never resurrect retired
versions. Preserve placement, localization and Media association identities.
Unsupported nested/embedded graphs, reused placements or multiple routes must
remain read-only until a faithful projection exists; never flatten them.
Existing composition saves require the owner source stamp and reject stale
source before writing. Preserve unexposed owner attributes and translation SEO.
Initialize required relationship arrays for new records without clearing existing
relationships. Distinguish an authorized complete missing-page lookup (typed 404)
from denied, incomplete or foreign evidence; HTTP 404 alone is not absence proof.
The stamp is preflight evidence, not a transaction or replay protocol. Every
Designer publication validates actual saved translation readiness, not caller flags.
Keep the 100-row completeness bound; use exact identity lookup when the scoped
library cannot be returned completely. Reads never adopt unowned historical data.

Plan a full composition's positions before writing. Reject duplicate identities,
overlapping desired positions and occupants omitted from the submitted draft.
Reorder existing placements through scoped versioned saves at unused non-negative
positions before final placement; never use destructive replacement flags or
implicitly retire an omitted record. Partial failures require inspection, with no
rollback or replay claim. Association collision reads and related graph reads must
resolve complete global code heads before source/active/position filters, preserving
the original generated authority, tenant and complete affirmative bounded evidence.
History from a moved/retired record never becomes a current occupant or binding.

CMS business commands require an explicitly enterprise-bound `cmsSite`, not an
inferred Catalog owner or a broad operator group. Unbound or foreign-owned shared
Catalog Sites fail closed; completed demo content is not migrated. Fresh optional
source packs may declare known owners explicitly without adopting installed records.
Source ownership does not authorize rewriting sealed content or reusing an installed
release version with different bytes. Preserve historical documentation payloads,
headers, assets, checksums and receipts; an editable documentation release requires
an explicitly selected forward source file/section through the existing release
owner. Historical-header importer checks prove retention, not current authoring
admission. Whole-model JavaScript headers preserve declared ownership fields, but
mapping checks do not qualify installation or reconcile existing versions. Resolve
whether a changed baseline is genuinely unreleased before resealing it; otherwise
use governed forward release/adoption without replaying completed demo data.
`authoringScope` is owner-stamped: pages/routes/page placements retain Site binding;
components, locale/Media records and component-owned nested placements retain
Catalog/enterprise ownership and may be reused across same-owner Sites. Every command retains
signed tenant and enterprise context; focused commands also include `siteCode`
and `catalogCode`. Read metadata is restricted to bound Sites and their Catalogs.

`cms.authoring.write` admits ordinary Designer authoring only in Staged.
`cms.authoring.delete` additionally admits retirement of owned sections, components
and Media associations through generated saves, preserving history. Neither grants
publication approval, Online authoring, generic schema management, or foreign scope.
Legacy generated CRUD routes are excluded and generic HTTP mutations are read-only.
Owner paths must check original human authority before using internal persistence
credentials. Do not replace these checks with synthetic human schema ACL grants.

Generated reads require `SUC_FIND_00000`, an exact query, complete integer `count`
of at most 100 rows, and the selected generated model's original tenant partition.
Do not invent required tenant fields on CMS records. Reject contradictory tenant
aliases, malformed/error envelopes, partial counts and identity/authority/scope
changes across awaits. Recheck the admitted principal immediately before writes.
Generated write outcomes require exactly one scoped persisted record; reject
conflicting acknowledgement flags, error codes/collections and multi-record or
count-only results. Rejection does not prove rollback and must never trigger replay.
Project Designer operations after awaited metadata and final identity admission.
Business navigation selects the existing active Designer; Workbench links retain
their independent schema-read permission. No generic permission is added to groups.
Axis selects the declared WCMS authoring role, not server-name aliases, and consumes
only owner result envelopes. HTTP success alone never confers operation authority.
The existing Designer screen exposes the owner retirement commands with inert owner
copy, exact record-code/Site/Catalog review and explicit confirmation. Presenting an
action never authorizes it: intersect with fresh `operations` and recheck on submit.
Retire placements separately from their shared components and Media associations
separately from Media assets. Review must disclose Catalog sharing, retained history,
non-cascading references and independent publication. Success requires matching
inactive version evidence and invalidates prior draft readiness. Unknown outcomes
retain the reviewed target; inspection acknowledgement and a fresh review precede
any separate submission. Do not add generic CRUD fallback, impact claims, lifecycle,
revision locking or transactions that these existing owner commands do not provide.
# Retained Approval Recovery

The same verified baseline controller owns install-only content-pack preparation
at `POST /publication/baselines/:baselineCode/content-pack/imports`. Require the
BackOffice runtime principal before CMS-local authority, Staged placement and a
delegated human requester. The configured baseline alone selects pack and release;
body pack/path selectors are forbidden. Validate the selected release before
nImport dispatch and return its content-pack status. A current pack is read-only.
This operation never creates or reviews a publication or activates Online. Public
System/nImport routes keep their original caller authority; no general service
account schema grant or generic importer elevation is introduced.

BackOffice may explicitly invoke the service-only CMS baseline
`POST /publication/baselines/:baselineCode/reconcile-approval`. The existing
baseline controller verifies the BackOffice runtime principal before applying
CMS-local authority and requires the delegated human requester. The request
binds the observed publication code, revision and optional workflow reference
in `approvalRepairBinding`; changed, absent or non-pending publication evidence
rejects. Fresh Process diagnostics must report `TASK_REFERENCE_MISSING` or
`WAITING_REVIEWER`. The latter is a read-only idempotent result.

Recovery delegates the retained pending publication to its existing nPublish
workflow provider. Process owns deterministic instance start/replay and missing
human-task repair. CMS never imports baseline data, creates another publication,
validates/resubmits a release, approves a task or activates Online during this
operation. A provider outage, non-actionable task or missing assignee requires
inspection, not automatic replay. Refresh after an uncertain response; only
fresh `WAITING_REVIEWER` diagnostics establish an actionable review path.
This is not a cross-owner transaction or an approval grant.

Later-layer baseline/provider customization retains these identity, principal,
readiness and no-import boundaries. Baseline service/controller, target-route,
BackOffice initialization and Process publication-approval tests protect them.

## Publication context configuration

Ordinary module properties select publication defaults using the existing nConfig
context binding (`name: publication`). Runtime display labels never select source
providers or versioned schema policy. Staged selects source transport; Online and
Operational do not. Missing/unknown context rejects configuration. This selection
does not supply a target connection, installed qualification, actor grant or
publication approval. Later deployment overrides retain normal inheritance.


## Publication transport placement

Publication transport uses the logical owning module and explicit destination
`publication` (Online for deployment/status/rollback; Staged for Media source
proof). The calling module must be locally active in the matching source
publication context. Physical runtime role names do not select or authorize
these calls. Preserve explicit connection selection, scoped internal tokens,
original actor/tenant evidence, operation keys and exact receipt readback;
configuration alone grants no publication or mutation authority.


## Operational action destinations

Owner-configured action targets identify the canonical implementing module and
explicit `OPERATIONAL` publication, never a physical Commerce or Process role.
Copilot coupon/notification actions target `digitalCore`; CMS approval and
Editorial action claims target `workflow`. Preserve existing owner grants,
original employee or scoped runtime credentials, execution handles, actor/receipt
bindings and uncertain-operation recovery. CMS/Editorial callbacks additionally
require local domain ownership in Staged context. Deployment overrides select
connections; framework-owned publication defaults are inherited.


### Published documentation reader menu

An authorized employee reads `GET /delivery/documentation/guides` on WCMS Online.
The tenant-scoped response contains the published menu and exact topic delivery
coordinates for the default locale and web channel. An empty response is valid.
Each documentation pack owns `readerGuide` on its existing CMS navigation
component. Its guide label, list route and menu entry travel with that component
through normal Staged installation and approved Site publication. Project channel
references bind the target Site and document ID. A reference becomes visible when
the target article and its Framework or Axis guide are both Online. Withdrawing
the last eligible article removes its menu entry on the next read.

CMS navigation nodes participate in the existing sealed Staged source-release `saveAll` admission, alongside the other declared CMS authoring sources. nImport still verifies the explicit publishable source manifest and exact file seals. Generic HTTP writes and Online source imports remain denied; this does not grant navigation publication or approval.

Designer HTTP entry forwards the original nRouter-authenticated Authorization header into CMS’s existing human admission and pinned identity context. Body or unbound wrapper bearer fields cannot supply that context. Tenant, enterprise, permission, Site/Catalog ownership and generated read/write checks still run in the owner.

Designer metadata queries templates, slots, types and component groups by the authenticated enterprise and its explicitly owned Catalogs before the bounded generated read. Historical unowned references remain outside editable choices; documentation volume cannot consume another application's authoring lookup. This does not raise lookup limits or admit unowned writes.

Designer bounded generated reads select the first page explicitly (`pageSize: 101`, `pageNumber: 1`) as well as the sentinel limit. The database owner normalizes `limit` from page size. Designer still rejects more than 100 matches, incomplete counts, changed tenant/query evidence and unauthorized requests; it never treats a truncated default page as complete metadata.

CMS base BackOffice form metadata orders code and version before descriptive columns. Shared schema projection removes absent fields, and later-layer schema form metadata may customize the view. Preserve authorization, read-only policies and immutable source identity; presentation cannot permit generic writes to governed content.

## Designer names and creation continuation

The optional authoring-model `presentation` contains only the configured strings
`newPageTitle`, `pageNameLabel`, `pageNameHelp`, `createdMessage`, `continueLabel`,
`knownSavedMessage`, `changedAfterCreationMessage` and
`publicationUnconfirmedMessage`. Each is nonempty, at most 1024 characters and
free of control characters. Extra configuration is not projected. Missing
presentation remains compatible with older owners; a malformed supplied
projection fails the owner model rather than becoming executable controls or
authority. Defaults belong to CMS and project overrides use ordinary nConfig
layering. This projection does not select a customer application or grant access.

A readable `page.name` uses the existing page field. A code remains the stable
identity, independently of the display name or browser path. First creation uses
the normal aggregate save. A later edit reopens the exact saved graph and uses
its opaque `sourceVersion`; successful creation is not permission to resend an
unstamped modified copy. A client continuation performs the existing authorized
GET only, preserves later local intent separately and never assumes an owner
receipt is a current graph. Publication still reads actual saved readiness and
uses normal nPublish/Process governance. These are optimistic preflight reads,
not locks, transactional saves or distributed exactly-once guarantees.

### Application-scoped authoring model

The existing Designer model accepts an optional exact Site and Catalog query. When either is supplied, both must pass the same persisted enterprise-bound CMS scope checks as authoring commands. Its references then belong to that selection. Configured draft defaults are hints only and are returned only when the current authorized metadata proves every selected Site, Catalog, template, page type and slot. Component kind hints require an available component type. Missing or foreign applications never inherit another accelerator's references. Generic empty defaults remain in CMS; application-specific hints remain in their accelerator.

Localization validation orders component/type versions before applying its bounded read. Keep tenant and actor authority intact; retained earlier contracts must not displace the latest declared fields.

## Nested saved composition

A component may contain sections using the existing cmsComponentDetail source/target relation. Reopen the complete bounded tree under the original employee and Site/Catalog scope. Every nested placement, component, localization and Media association contributes to the opaque sourceVersion. Reject cycles, repeated component identities, foreign/unowned references, ambiguous history and unsupported embedded arrays. Parent components are saved before their child placements through the same versioned owner services. A graph save is not a transaction: an uncertain write requires inspection; never replay or claim rollback. Omission never retires a record. Recursive translation readiness remains a publication prerequisite.

The Framework CMS designerAuthoring defaults own maximumCompositionDepth, maximumCompositionComponents and nestedSlot. The owner supplies these limits and active compatible renderer mappings to Axis. A customer may override values or supply genuinely project-specific component fields; never copy defaults to Kickoff. The browser must preserve the tree and unknown inert properties, gate writes by the current operation list, and render nested content through configured typed controls. Run cmsBusinessAuthoringAccess and cmsDesignerCompositionContract, then qualify save/reopen, stale-source refusal, denied scope and normal Process publication live.
