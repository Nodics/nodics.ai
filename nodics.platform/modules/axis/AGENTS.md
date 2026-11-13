# axis Agent Contract

## Inheritance

- Follow the root Nodics contract: `../../../AGENTS.md`.
- Follow the `nodics.platform` group contract: `../../AGENTS.md`.
- Follow global guidance from
  `../../../nodics.foundation/modules/nSetup/llm/ai-enablement-index.md`.

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
- Documentation content that describes Axis belongs here. Framework capability
  detail belongs with its owning backend module; `nodics.docs` owns central
  discovery and cross-framework guidance. Accelerator guides belong with their
  accelerators, and actual customer differences belong with the customer project.

## Data Rules

- Backend-importable Axis records must be generated or authored here, never in
  `nodics.axis`.
- The Axis documentation content pack is maintained directly as CMS records at
  `sections.documentation.sourceAuthority` in `data/manifest.json`, under that
  section's selected `data/<contentPath>/records/documentation` directory.
  Source readers and validators must follow the manifest, not a fixed release
  directory. Consolidate unreleased snapshots into docs-v001, preserving latest
  content and stable identities with current hashes and no duplicate imports.
  Keep `test/documentationForwardPackaging.test.js` aligned with that baseline.
  Selecting source documentation does not install or publish it.
- Image blocks reference Media identities in the same governed release. Do not
  create a parallel `docs/` source or Markdown-to-CMS generator.
- CMS data may target WCMS schemas, but WCMS remains the CMS schema,
  persistence, delivery, and runtime authority.
- Use nData/nImport governed import flow; do not add an Axis-specific loader.
- Keep the CMS-driven Axis baseline in the named `axis:axisBaseline` aggregate
  manifest section. It must target the CMS owner in `STAGED` publication context, retain immutable checksums,
  and require explicit administrator-initiated publication; startup import must
  never publish it or write WCMS Online.
- The bundled frontend fallback is executable/static client code owned by
  `nodics.axis`; do not copy it into this backend data module.

## Verification

Axis owns the inert BackOffice documentation setup descriptors, including the
Framework Documentation entry. Capability documentation remains with its
implementing module; nodics.docs owns shared scaffolding and cross-framework
guides. Both documentation entries default disabled; projects explicitly
select them through their Platform profiles.

Axis owns only its own documentation acceptance pack descriptor under
`tooling.acceptance.localBootstrap.documentationPacks`. Framework documentation
content acceptance metadata belongs to nodics.docs; customer metadata and the
explicit pack selection belong to the customer. These inert descriptors do not
import or publish documentation and are distinct from setup presentation above.

Run:

```bash
npm run docs:check
node scripts/validate-axis-content-pack.mjs --check
npm run validate
npm test
```

Axis CMS baseline metadata lives directly in ordinary `cms.publication.baselines`
properties. Do not copy it into a runtime-role profile for Online delivery.
Publication and data installation remain CMS-owned and explicitly governed.


Axis release discovery uses ordinary `data.dataReleases.contributions` with the
single source module `axis` and sections `axisBaseline` / `core-v001`. Keep the
Init/Core split and existing inert initialization template. Admission requires
actual CMS/Catalog schema owners and explicit STAGED publication context; never
infer it from a runtime name, activate Axis on CMS, or import/publish from config.
The separate `cms.publication` baseline descriptor remains CMS delivery composition.
