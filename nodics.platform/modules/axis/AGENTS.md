# axis Agent Contract

## Inheritance

- Follow the root Nodics contract: `../../../AGENTS.md`.
- Follow the `nodics.platform` group contract: `../../AGENTS.md`.
- Follow global guidance from
  `../../../nodics.core/modules/nSetup/llm/ai-enablement-index.md`.

## Capability Boundary

- `axis` is the backend-owned Axis product-data module inside
  `nodics.platform`.
- It owns Axis-specific backend-importable data, documentation content-pack
  data, CMS Site/catalog/page/component/route records, and BackOffice
  capability metadata.
- `nodics.axis` remains a separate frontend repository and owns executable
  React renderers, browser routing, interaction behavior, accessibility,
  frontend tests, and static recovery screens.
- Do not add frontend source, browser bundles, React components, CSS runtime,
  or frontend build tooling here.
- Do not turn this module into BackOffice API authority. BackOffice owns
  registry/bootstrap/discovery APIs; this module contributes Axis-specific
  metadata and data for those APIs to aggregate.
- Documentation content that describes Axis belongs here. Framework
  documentation belongs in `nodics.docs`; customer/project documentation belongs
  in the owning project documentation package.

## Data Rules

- Backend-importable Axis records must be generated or authored here, never in
  `nodics.axis`.
- The Axis documentation content pack is under `data/core/source/documentation`,
  generated into `data/core`, and described by
  documentation section in `data/manifest.json`.
- CMS data may target WCMS schemas, but WCMS remains the CMS schema,
  persistence, delivery, and runtime authority.
- Use nData/nImport governed import flow; do not add an Axis-specific loader.

## Verification

Run:

```bash
npm run docs:check
npm run validate
npm test
```
