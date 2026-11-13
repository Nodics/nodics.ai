# cms Module

Generic authoring follows effective schema publication metadata and the existing
runtime role: publishable sources are Staged-only; publication projections and
receipts are read-only to Workbench/generated HTTP CRUD. Owning publication and
approved import services retain their governed paths. Project customization and
failure cases are documented in
`nodics.foundation/modules/nDatabase/database/llm/contracts/schema-authoring-authority.md`
and the canonical Foundation schema-data-modeling guide.

CMS owns content sites, catalogs, routes, pages, templates, slots, components, renderer metadata, localized content, and resolved delivery behavior.

Restricted CMS reviewers can inspect frozen publication evidence from their
Process task. CMS validates the exact task and pending revision before returning
the target, prerequisites, and a bounded comparison with retained Online content.
See [the publication manifest contract](llm/contracts/publication-manifest-contract.md#restricted-task-review).

Designer preserves existing derived identifiers and gives overlong generated
identifiers stable, bounded values. User-supplied identifiers still follow the
CMS code format and length limit.

Website reference selectors use the Site's `backoffice.displayProperties` to show
its existing business name before its stable code. Later schema layers can change
this presentation; selection values, ownership, read-only generic access and
publication authority remain unchanged.

Documentation **Install staged** uses the configured CMS baseline's service-only
content-pack preparation command. The existing baseline controller verifies the
BackOffice runtime before applying CMS-local authority; the baseline pins the pack
and release and requires the delegated human actor. nImport remains the executor.
Installation does not create a publication, request approval or activate Online.
The baseline controller and content-pack service tests cover that boundary.

## Business Authoring

Sample Data requires both the Import responsibility and CMS Content Full control
to install sealed CMS sources in Staged. The grant applies only while nImport
executes the exact owner-approved release header. Generic CMS mutations retain
the read-only authoring contract.

Business Content View reads the scoped Designer model. Content Edit has explicit
`cms.authoring.write` for draft validation/save, section/component add/update/reorder,
Media association, route/navigation assignment, readiness and publication submission.
Full control additionally has `cms.authoring.delete` for section/component/Media
association retirement. Retirement saves an inactive version; it does not erase
published history. Publication approval and Online deployment remain independent.

Designer commands require canonical human/access authentication and the signed
tenant/enterprise. Writes are Staged-only and carry `siteCode` and `catalogCode`.
The existing `cmsSite.enterpriseCode` must explicitly match the enterprise; an
unbound Site or a Catalog shared with a foreign/unbound active Site refuses.
Authored records retain `authoringScope`. Pages, routes, navigation and page
placements bind enterprise, Site and Catalog. Shared components, their locale/Media
records and component-owned nested placements bind enterprise and Catalog, allowing
reuse across Sites in that same Catalog. Shared template/renderer definitions keep
their existing reference semantics; an explicit foreign Catalog owner is rejected.
Foreign or unowned existing codes cannot be adopted. Fresh optional source packs
may explicitly declare known Site and record owners. This does not authorize an
automatic ownership migration of installed records or any live/demo mutation.

Owner lookups require the real generated success code, exact query, complete bounded
`count` and matching selected model tenant. CMS records need no invented tenant
field; contradictory returned tenant aliases are rejected. Original human identity,
permissions and Site/Catalog selection stay pinned across awaited reads and are
rechecked before each write. Reads over 100 returned/history rows fail closed.
Malformed or cyclic group claims are rejected before shared security walkers;
employee ancestry and native Platform full-access eligibility come from nRouter.
Bearer context is required and pinned. Optional provider success/acknowledgement
flags and error collections must agree with the affirmative generated envelope.

CMS model routes select only `schemaOperations`; legacy broad CRUD routes are not
generated. Generic HTTP mutations are read-only, and human business groups receive
no generated write access or `system.schema.*` permission. Scoped commands use
generated owner persistence only after permission, identity and relationship checks.
The multi-record Designer save is not a new atomic transaction or replay protocol.
Failures must be inspected before another submission.
Invalid website paths and unsafe redirects return an actionable HTTP 400 before
route persistence. The redirect must stay on the same website.
Draft validation checks Media references with their owner before any draft write.
Saving the association still validates the persisted component and its ordering.

Saved pages can be reopened through `GET /designer/composition/pages` and
`GET /designer/composition/draft?catalogCode=…&siteCode=…&pageCode=…`. Both use
the original human's Content View admission, exact enterprise/Site/Catalog and
Staged runtime. The bounded library never adopts historical unowned pages or
truncates a large result; an exact page lookup remains available independently.
Current inactive heads never fall back to an older active version.
An authorized complete exact lookup with no page returns `ERR_CMS_00088`/404;
foreign or incomplete evidence remains denied. New page/component models initialize
their empty relationship arrays, including the schema-required `cmsComponents`,
while existing arrays remain preserved owner data.

The draft projection retains exact placement, translation and Media association
identities. Embedded/nested layouts, repeated component placements and multiple
routes are inspectable with explicit read-only reasons. Axis also requires
configured inert content controls before editing. These restrictions do not grant
generic schema write authority or change publication policy. New flat blocks can
be added and reordered locally; omission never retires a saved placement.

Existing pages require the owner-returned `sourceVersion` on composition save.
CMS rejects a changed source before the first write and merges owner-read
unexposed attributes rather than erasing SEO or extensions. The stamp is an
optimistic preflight, not an atomic transaction, lock or idempotency receipt.
Every Designer publication journey validates saved translations rather than caller
readiness flags, including the initial creation form. Any unconfirmed multi-record outcome requires fresh owner
inspection; no command is replayed automatically. Existing sealed packs are
unchanged. Later modules can extend faithful projections while retaining these
ownership, completeness and failure boundaries.

Composition validation checks unique desired placement identities/positions and
retained occupants before writing. A requested reorder first moves changed existing
placements to unused non-negative positions through the same scoped versioned save,
then applies the final positions. It never retires omitted placements, hard-removes
conflicts or enables `allowCmsAssociationReplacement`. A failure can leave intermediate
positions or other partial versions; inspect them before a new explicit action.
This is not an atomic graph transaction or automatic recovery/replay protocol.

Collision validation and saved relationship reads resolve complete global logical
heads before applying source, active and position filters. An old active version
cannot reoccupy its previous slot, page, component or route binding. Position reads
retain the original generated-service authority/tenant, exact queries, affirmative
envelopes and 100-row completeness bound; malformed, tied or incomplete history
blocks a write. Grouped component intents receive distinct positions; explicit
duplicate placement identities, overlapping positions and unsafe numeric order fail
before the first write. Later overrides must preserve these guarantees.
Save/retirement outcomes must contain exactly one scoped persisted record and no
contradictory success flag, error code or error collection. An invalid outcome may
follow persistence; CMS never turns it into draft success or retries the write.

The active business navigation entry is `/content/designer`, using
`GET /designer/composition/model` and the existing owner commands. Workbench links
add the existing `system.schema.view` requirement rather than granting it to business
groups. Axis limits separate metrics requests to available authorized Workbench
targets and consumes the returned permitted `operations` for each write control
and callback. Owner metadata loads independently of generic discovery. CMS still
rejects unauthorized commands regardless of frontend presentation.
Operations are projected after metadata completes and the admitted identity is
rechecked, so an awaited lookup cannot advertise an earlier runtime's write state.
Axis selects the declared `WCMS_STAGED` / `STAGED` connection, not deployment
server names. Error-bearing owner envelopes never confer UI authority or cause a
generic schema fallback.
Designer supplies inert retirement labels and consequences alongside permitted
operations. Axis separately reviews placement retirement, shared-component retirement
and Media-association detachment by exact record code and selected Site/Catalog.
Only advertised operations enable confirmation; the backend remains the ownership
authority. Shared components/associations can affect multiple Sites in their Catalog;
retirement never cascades references or removes Media assets. An uncertain outcome
requires owner-record inspection and a new explicit review, never automatic replay.

`test/cmsBusinessAuthoringAccess.test.js` exercises real persisted groups against
nRouter and generated save guards, scoped command success, View/Online denial,
foreign/unbound Site and identity rejection, and version-preserving retirement.
It also connects Profile's persisted Content area/level descriptor to those same
groups and checks final model admission after metadata reads. Source regression
coverage is not execution or installed-data evidence.

## Responsibility

This module provides the WCMS content model used by Axis authoring, staged publication, Online delivery, Nexus rendering, and documentation-as-content use cases.

## Developer Notes

Customer documentation discovery uses canonical CMS product records, existing
secured schema reads and the already configured initialization profiles.
[Discovery and customization](llm/contracts/README.md#documentation-product-discovery)
explain Site/profile binding, permission/publication gates and focused tests.
No additional identity map, copied capability service or import path is required.

- Model content through CMS records and content packs.
- Keep page designer metadata backend-owned and renderable by Axis.
- Use media references instead of embedding physical storage paths.

Documentation pack import includes its declared records and assets in the same
owner import operation. Publication remains governed separately: one explicit
Axis action can complete the existing CMS approval, inspect exact manifest-pinned
Media dependencies, initiate missing assets through native employee-authorized
Media APIs, and complete their existing Process approvals. CMS readiness stays
pending until every exact asset is Online. A denial stops coordination; completed
owner effects remain audited and an explicit resume skips qualified assets. This
is not a shared approval grant or a cross-runtime atomic transaction.
Retained readiness uses bounded Media pointer batches around exact metadata and
byte verification, using one read-only exact integrity batch on the default
Media owner. It rereads every active pointer and fails closed on drift;
there is no server-side READY cache or relaxed rate-limit policy.

Documentation navigation search is projected from reachable canonical articles
in the same frozen publication scope, not historical shared navigation text.
Updating this projection requires normal CMS revalidation and Process approval;
it never rewrites an existing manifest or reimports records or assets. See the
[navigation projection contract](llm/contracts/publication-manifest-contract.md#documentation-navigation-projection).
- Preserve publication, localization, route resolution, and renderer mapping contracts.

Static employee UI composition may opt into project-shared Online delivery using
exact paths on an existing publication baseline Site descriptor. Employee
authentication and permissions remain unchanged; business data and ordinary CMS
reads stay tenant-local. See [shared employee composition](llm/contracts/content-delivery-contract.md#shared-employee-composition).

## Documentation

Deep documentation lives in:

- `nodics.wcms/modules/cms/data/docs-v001/records/documentation/cmsDocumentationRelease003ComponentData.js`
- `nodics.wcms/modules/cms/data/docs-v001/records/documentation/cmsDocumentationRelease003ComponentData.js`
- `nodics.wcms/modules/cms/data/docs-v001/records/documentation/cmsDocumentationRelease003ComponentData.js`

## Verification

Operator reconciliation with `publicationCode` processes only that publication's
outbox events; unscoped startup recovery remains tenant-bounded. See the
[manifest contract](llm/contracts/publication-manifest-contract.md) and
`test/cmsPublicationOutboxReliability.test.js` for scope and failure coverage.

`test/cmsPublicationTargetRouteContract.test.js` guards service-token-only
publication target routes and the API-only guided acceptance boundary.
`test/guidedInitializationAcceptance.test.mjs` exercises independent customer
fixtures, Online import denial and failed normal approval without live APIs.
Customer suites retain only their selected roles, release pins and fixtures.

Run CMS/WCMS contract tests when content model behavior changes, then run:

```bash
npm --prefix nodics.docs test
npm run quality:docs
```

This capability declares an inert model-service inventory for [governed Local reset](../../../nodics.foundation/modules/nSystem/llm/contracts/local-reset.md).
A server must explicitly select it; contributions never enable reset or bypass tenant, environment, confirmation or required-service checks.

Route-category defaults belong to this capability; deployments supply only intentional overrides.
Preserve nRouter enforcement and independent route authorization. See [exposure ownership](../../../nodics.foundation/modules/nRouter/llm/contracts/README.md#capability-owned-exposure-defaults).

CMS owns generic guided-publication acceptance defaults: select the WCMS_STAGED
runtime and an enabled initialization profile using the framework `foundation`
template. Application publication selections, Site identities and delivery probes
belong to their accelerator or customer pack. Defaults never install or publish data.

CMS also owns the complete `acceptance:guided-initialization` tooling suite.
Invoke it through `nodics project:run acceptance:guided-initialization --execute
--approve-publications` only when normal installation/publication is intended.
Customer projects provide their profile and delivery inputs; assertions and normal
approval boundaries remain in CMS. See [the acceptance contract](llm/contracts/README.md#canonical-guided-acceptance).

Publication collects distinct latest dependency identities through bounded reads,
excluding already resolved codes so retained version history cannot hide routes
or assets. It preserves source query and caller authority and rejects truncation
or non-advancing provider evidence. See `test/cmsPublicationHistoryCapacity.test.js`.

Publishable sample releases declare `selectionPolicy: EXPLICIT`. Operators select and validate these releases through nImport or Axis before Staged preparation; they are never implicit startup or default selections. Publication approval remains separate.

CMS navigation nodes participate in the existing sealed Staged source-release `saveAll` admission, alongside the other declared CMS authoring sources. nImport still verifies the explicit publishable source manifest and exact file seals. Generic HTTP writes and Online source imports remain denied; this does not grant navigation publication or approval.

Designer HTTP entry forwards the original nRouter-authenticated Authorization header into CMS’s existing human admission and pinned identity context. Body or unbound wrapper bearer fields cannot supply that context. Tenant, enterprise, permission, Site/Catalog ownership and generated read/write checks still run in the owner.

Designer metadata queries templates, slots, types and component groups by the authenticated enterprise and its explicitly owned Catalogs before the bounded generated read. Historical unowned references remain outside editable choices; documentation volume cannot consume another application's authoring lookup. This does not raise lookup limits or admit unowned writes.

Designer bounded generated reads select the first page explicitly (`pageSize: 101`, `pageNumber: 1`) as well as the sentinel limit. The database owner normalizes `limit` from page size. Designer still rejects more than 100 matches, incomplete counts, changed tenant/query evidence and unauthorized requests; it never treats a truncated default page as complete metadata.

Designer component kinds may declare bounded inert `fields` (text, multiline and
one level of card items). CMS validates required base content, text lengths, item
counts and nested card fields before the first graph write and on standalone
component writes. Optional locale variants must respect the same value types and
bounds. Field descriptors grant no operations or renderer execution authority.
Reference projections retain an explicit owning Catalog so Axis can scope template,
slot and type choices without replacing the backend relationship guards.

Entered translations stay DRAFT until explicitly reviewed and marked READY.
Designer publication readiness reports unreviewed translations before creating a
publication request; the publication adapter independently requires READY versions.
Initial route version `0` remains part of the generated publication identity.

The authoring model projects `localization.routeLocale` from the existing CMS
legacy/shared-route locale policy, falling back to its default language when no
shared route is configured. Changing the language being edited never changes this
route identity. Locale delivery still resolves and overlays READY variants under
the existing Online route/pointer and localization rules.

Shared/default routes publish concrete immutable snapshots for the configured
languages. A Page can use the existing atomic route-bundle container for its
language versions without publishing the rest of its Site. Exact locale routes
win over shared-route projections in Site bundles; ambiguous locale or route
identities reject. Source data stays unchanged, and all target pointers use the
existing transaction, CAS, receipt and outbox. Mixed Online locale pointers fail
inspection rather than appearing as an absent prior publication.

Page locale bundles retain the existing target manifest/payload size boundary.
Site publication chunking remains unchanged; route-level Online lineage does not
infer a parent index identity from child manifest names.

CMS Schema Workbench defaults show source code and version together so retained revisions remain distinguishable. Existing operator column preferences remain respected; use Grid settings to reset to the current owner defaults. These presentation defaults do not enable CMS schema mutations.

Designer form copy is projected from `cms.designerAuthoring.presentation` through
a fixed bounded text allowlist. Later customer layers can override labels without
changing operation admission. The existing page name is separate from its code
and route; Axis can continue a confirmed creation through the exact scoped saved
read before editing or publication. No new schema, permission or mutation API is
introduced. See the Designer guidance in `llm/contracts/README.md` and the focused
composition/access tests.

Documentation provenance release 0.0.2 preserves article bodies and stable routes while correcting source integrity/navigation metadata. The [manifest](data/manifest.json) selects it; prior exact bytes remain in test fixtures. Source validation does not install, approve or publish this release.

CMS selects dependencies from the exact sealed publication bundle and delegates retained-version, byte and activation-pointer qualification to Media’s `DefaultMediaDependencyReadinessService`. The existing dependency response, Media handoff and legacy publication identities are preserved.

Governed knowledge consumers use the bounded public Online
[publication proof](llm/contracts/publication-manifest-contract.md#public-knowledge-proof);
this never grants private CMS access or publishes content.

Publishing recovery verifies the original callback journal and persisted target receipt. Missing evidence repair fences the current Online pointers inside the owner transaction. See [exact recovery](llm/contracts/publication-manifest-contract.md#exact-callback-and-receipt-recovery).

Frozen documentation approval reviews include bounded plain-text article blocks and before/after content from the immutable snapshots. Unknown blocks and truncation are explicit; arbitrary source fields and provider URLs are excluded. Existing current-task, tenant, enterprise, reviewer and publication revision checks remain mandatory. The source correction is documented in CMS documentation release 0.0.3; installation and Online approval remain separate.


A selected page can restore its exact predecessor even when that predecessor was published as part of a larger Site release. The Online owner verifies the current pointer and its previous-manifest lineage inside the transaction, restores only the selected delivery scope and preserves sibling routes. It rejects a stale pointer, missing route, different Site or unrelated predecessor. Review of older Site releases without a catalog field uses the exact frozen Site dependency to prove catalog ownership; a latest authoring read cannot supply that proof.

The Designer model derives available applications from authorized CMS Sites and Catalogs. Optional Site/Catalog selection narrows references; unavailable configured defaults are omitted.

Sealed Staged content releases may include `cmsComponentLocalization` alongside their component and type declarations. This uses the same `cmsBusinessFullControlUserGroup` source admission as other publishable CMS records; generated human writes remain unavailable. READY locale copy still requires exact-revision publication approval.

Localized authoring validates against the newest persisted component and type contract before bounding history reads. Retained earlier revisions cannot hide a newer localized-field declaration.

Saved page composition now includes bounded nested component-detail sections. CMS owns the depth and count defaults, exact source stamp, parent identities and recursive translation readiness. Reopened edits preserve unsupported attributes, reject cycles/reused identities and foreign references, and never retire omitted records. Active renderer mappings are projected with the configured typed content fields; rendering remains the consumer's responsibility. See [the authoring contract](llm/contracts/README.md#nested-saved-composition) and cmsBusinessAuthoringAccess tests.

Standard workflow copy belongs to this module in `src/service/localization/workflowMessages.json`. Its contribution exposes stable public-safe UI labels only, never records, permissions or internal errors. English definitions and Arabic reference values use the Localization contribution, draft, review, approval and release APIs; loading the module does not approve or publish translations. Later project layers may supply intentional scoped translations through the same owner workflow. Preserve exact message parameters, authorization and uncertainty guidance.
