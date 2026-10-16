# cms Module

Generic authoring follows effective schema publication metadata and the existing
runtime role: publishable sources are Staged-only; publication projections and
receipts are read-only to Workbench/generated HTTP CRUD. Owning publication and
approved import services retain their governed paths. Project customization and
failure cases are documented in
`nodics.foundation/modules/nDatabase/database/llm/contracts/schema-authoring-authority.md`
and the canonical Foundation schema-data-modeling guide.

CMS owns content sites, catalogs, routes, pages, templates, slots, components, renderer metadata, localized content, and resolved delivery behavior.

## Business Authoring

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

- `nodics.wcms/modules/cms/data/docs-v001/records/documentation/cmsDocumentationComponentData.js`
- `nodics.wcms/modules/cms/data/docs-v001/records/documentation/cmsDocumentationComponentData.js`
- `nodics.wcms/modules/cms/data/docs-v001/records/documentation/cmsDocumentationComponentData.js`

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
