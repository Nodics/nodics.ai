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
  for general Nexus application content. The explicit exception is
  application-owned documentation source under `docs/`; it is non-executable
  authoring input and must generate governed WCMS Staged records declared by an
  immutable manifest section before it can be installed or published.
- Business-user content changes belong in Axis, Schema Workbench, Page
  Designer, and governed data import/export flows. DevOps may use data packs
  for bootstrap, migration, environment promotion, or controlled sample data.
- Keep renderer values logical and non-executable. Browser implementation
  belongs in the independent `nodics.nexus` frontend.
- Public content must not contain secrets, credentials, private endpoints,
  unverified claims, or unlicensed media.
- Every executable file must be declared by exactly one immutable manifest
  section whose `sourceRoot`, lifecycle, and destination role match its
  physical folder. Never place expected Online projections under `data/`.
- WCMS publishable releases must contain authoring source only. Engagement
  schemas remain on the Engagement runtime and must be classified
  `OPERATIONAL_VERSIONED`, not disguised as WCMS Staged content.
- Keep reusable Nexus documentation source under this module's `docs/`.
  Never place it in customer-wide `docs/`, an untracked workspace planning
  directory, the Nexus frontend, or a framework documentation pack.


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
