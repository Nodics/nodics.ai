# Nexus Data Agent Contract

- Follow the Nodics framework root, accelerator group and Nexus parent contracts.
- This module owns only reusable Nexus reference content values, import releases,
  media policy deltas, deterministic generation, and acceptance evidence.
- Reuse Catalog, CMS, WCMS, Media, Localization, Profile, and Publishing
  schemas and services. Never redefine them here.
- Corporate content belongs to `nexusCorporateSite` and
  `nexusContentCatalog`. Do not add demo-commerce data until the corporate
  local qualification gate is complete and the demo phase is authorized.
- Do not introduce structured-source folders or generator-only authoring files
  for Nexus application content or documentation. Canonical documentation is CMS
  page/component data in this module's `data/docs-v001`, declared by an optional
  `CONTENT_PACK` manifest section and installed independently of business data.
- Business-user content changes belong in Axis, Schema Workbench, Page
  Designer, and governed data import/export flows. DevOps may use data packs
  for bootstrap, migration, environment promotion, or controlled sample data.
- Keep renderer values logical and non-executable. Browser implementation
  belongs in the independent `nodics.nexus` frontend.
- Public content must not contain secrets, credentials, private endpoints,
  unverified claims, or unlicensed media.
- Every executable business data file must be declared by exactly one immutable
  business release section whose `sourceRoot`, lifecycle, and destination role
  match its physical folder. Documentation uses checksummed `CONTENT_PACK`
  declarations instead. Never place expected Online projections under `data/`.
- WCMS publishable releases must contain authoring source only. Engagement
  schemas remain on the Engagement runtime and must be classified
  `OPERATIONAL_VERSIONED`, not disguised as WCMS Staged content.
- Keep reusable Nexus documentation records and Media assets under this module's
  `data/docs-v001`. Reference shared framework guides by stable document identity;
  never copy their detail into Nexus, a customer project or the Nexus frontend.


This module explicitly participates in Application Builder through
`nodics.applicationBuilder.dataPack: true` in its package metadata. The owning
customer project declares frontend, domain and preset choices. Preserve the
module's existing import-manifest and content ownership rules; Builder metadata
does not import, publish or validate this module's live data.

Read the repository contract at `../../../../../AGENTS.md` and global guidance at
`../../../../../nodics.foundation/modules/nSetup/llm/ai-enablement-index.md`.

Derived component-media records exclude retired source components. Keep surviving
binding codes stable, retain owner validation and advance the development manifest
version/checksum when correcting a previously attempted release.
