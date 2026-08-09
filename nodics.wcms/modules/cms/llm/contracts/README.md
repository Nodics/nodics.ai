# cms AI Contracts

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
