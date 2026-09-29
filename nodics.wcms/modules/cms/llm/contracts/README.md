# cms AI Contracts

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

## Publication Readiness Diagnostics

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
