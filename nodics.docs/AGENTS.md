# Documentation-content contract

## Inheritance

- Follow the repository AGENTS contract: `../AGENTS.md`.
- Follow global AI/development guidance:
  `../nodics.foundation/modules/nSetup/llm/ai-enablement-index.md`.

## Module Work Rules

- This group contains configuration, content and release validation only. Explicit
  selection exposes optional profiles without adding business services or APIs.
- Every document declares its functional visibility boundary and canonical
  implementing module. Functional visibility does not transfer physical ownership
  into a composition-only group. The technical owner stores the article, import
  headers, page metadata and unique assets together.
- `nodics.docs` is the explicit shared-content exception. Do not create importable
  records under grouping-only Foundation, Commerce or accelerator family roots.
  A package such as `nService` with its own actual implementation can own its
  capability guides even when its metadata also groups child modules.
- Document IDs are stable, globally unique, and must not encode filesystem paths.
- Platform consumes immutable releases; Axis never imports files from this repository directly.
- Backend-importable documentation CMS data belongs in its owning backend
  module, never in frontend repositories. This module owns central discovery and
  genuinely cross-framework guides. Capability and accelerator article bodies
  belong with their respective modules; preserve identities and references when
  changing module placement. Full-library composition references canonical module
  manifest sections; never put capability article copies back in this group.
- Maintain framework documentation directly as CMS page/component records under
  `data/docs-v001/records/documentation`. `data/manifest.json` declares the pack;
  do not create a separate `docs/` authoring source or Markdown-to-CMS generator.
- Keep documentation lifecycle separate from CMS route delivery. Unpublished
  route records use CMS `DRAFT`, not documentation `STAGED`; validate them against
  the CMS schema before import and refresh their manifest seals. This correction
  grants no approval, publication or runtime adoption.
- Ship only files selected by current manifest sections, including within v001.
  Preserve latest record intent and stable identities; keep superseded source
  snapshots under test fixtures, never as unselected data or retainedRoots.
- Store documentation images under `data/docs-v001/assets/documentation` and
  declare Media records in the same release. Image blocks reference `mediaCode`,
  never filesystem paths, provider URLs or embedded base64. Preserve normal
  Staged review/approval, Media access and Online publication.
- Axis product documentation belongs to `nodics.platform/modules/axis`.
- `nodics.axis` owns executable documentation renderers only; it must not own
  CMS catalog, Site, page, component, route, or documentation content-pack data.
- Do not refer to legacy source paths, repositories, or runtime assumptions.
- Each independently navigable capability topic needs a dedicated
  **Customize and extend safely** section with project-owned files, a worked
  example, preserved guarantees, rejection/recovery behavior, and tests.
  Explicitly explain non-customizable guarantees rather than inventing an
  extension point. Follow the canonical documentation impact contract.
- Use source-backed diagrams or screen flows for multi-step topics. Screenshots
  must show real, sanitized UI with capture context; they are not mandatory when
  a durable screen flow serves the reader better.
- Report source-record changes, validated, visually reviewed, and published states
  separately. Pack validation is not proof of complete detail across all pages.
- Semantic backlog closure requires a manual source-editorial disposition bound
  to the exact action, canonical article blocks, real section anchors and inspected
  non-data source bytes. Preserve historical reviews; aggregate current reviewed
  corrections in `test/evidence/semantic-documentation-closure.json`. Changed or
  incomplete evidence reopens the item. Coverage keywords and Online state do not
  close editorial gaps or prove provider/live acceptance.
  Source references must match the exact casing of every directory and filename,
  including on case-insensitive developer filesystems; source hashes alone cannot
  qualify a path that fails on a clean case-sensitive checkout.
- Bind historical release regressions to recoverable, hash-qualified snapshots,
  including their original metadata and citations. Validate current source
  independently; a later approved source change must not be compared to an old
  receipt as if the receipt described today's content. Preserve discrepancies
  explicitly rather than rewriting historical seals. Re-review changed claims
  before refreshing editorial evidence, and keep article headings, source
  digests/counts, search text and publication target seals aligned.
- The central catalogue references canonical accelerator guides; it does not
  duplicate their detail. Keep real customer-specific deployment runbooks/data
  with their backend owner and never invent application-named domain accelerators.
  Use the existing Circa topic family as a depth pattern for Agora documentation.
  Separate ownership migration from editorial expansion and preserve both gates.
- For standalone packs with cross-pack references, declare bounded
  `referenceCatalogues` source selections in the documentation manifest section.
  Tooling validates target pack, owner and anchor without adding those records or
  assets to import. `includes` remains the only composition selector; references
  never grant publication, access or visibility outside the immutable delivery scope.

Immutable identity includes the recursive composition checksum. When an included
release changes, advance every installed parent composition affected by that
change; unchanged local article hashes do not permit reuse of an installed
version. Preserve payload bytes for composition-only successors and prove them
against predecessor fixtures. Keep module baseline defaults here and explicit
deployment release selections in the consuming project. Adopt through nImport
and normal CMS/Process approval; never overwrite installed receipts.

Source coverage defaults to metadata-declared module roots within this framework
checkout. It never auto-selects sibling customer/frontend repositories. To audit
another owner, pass explicit `--source-root`, `--catalogue` and `--output-dir`;
its report belongs to that owner and cannot overwrite Framework artifacts.
See the source-backed documentation coverage guide for invocation and boundaries.
`test/sourceCoverageScope.test.mjs` proves sibling independence and output isolation.

Framework documentation owns its inert acceptance pack descriptor under
`tooling.acceptance.localBootstrap.documentationPacks`. Axis and customer packs
own their respective descriptors. Projects select pack codes explicitly; static
discovery does not import, activate or publish documentation.

Standalone Framework qualification must not read arbitrary sibling checkouts.
Current Framework source citations remain live path/anchor checks. External
reference examples use the existing documentation owner's exact Git snapshots
under `test/fixtures/externalSourceEvidence`, bound to article blocks, owner,
reference path, commit and source bytes. Missing or changed evidence fails closed.
These snapshots prove existence at the recorded commit, not current project
compatibility, semantic approval or installed acceptance. Requalify explicit
reference changes; never make sibling presence a fallback or copy customer runtime
behavior into Framework. Run the source-reference isolation and negative tests.

Source coverage excludes runtime-generated `src/controller/gen`, `src/facade/gen`
and `src/service/gen` adapters, like other generated output. Their presence on a
running developer checkout must not change the source report or package priority.
Keep the generated-adapter independence assertion in `sourceCoverageScope.test.mjs`.
