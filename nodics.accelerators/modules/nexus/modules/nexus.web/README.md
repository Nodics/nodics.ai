# Nexus Data

`nexus.web` is the reusable Nexus accelerator content pack that contributes the corporate
Nodics Nexus Site, content catalog, page composition, navigation, renderer
keys, and public media policy. Reusable schemas and runtime behavior remain
owned by Nodics Catalog, WCMS/CMS, Media, Localization, and Publishing.

The physical layout keeps release source separate from runtime destination:

- `data/sample-v001/content/headers/wcms` and
  `data/sample-v001/content/records/wcms` contain publishable CMS Site content
  imported only by `wcmsStagedServer` and promoted to Online only through
  `nPublish`;
- `data/sample-v001/content/headers/editorial` and
  `data/sample-v001/content/records/editorial` contain publishable Editorial
  authoring records for the Staged runtime;
- `data/sample-v001/content/headers/engagement` and
  `data/sample-v001/content/records/engagement` contain immutable-versioned
  Engagement data imported only by `engagementServer`; it is not copied through
  WCMS;
- `data/sample-v001/content/assets/nexus-cms-media` contains the release-owned
  physical media files referenced by Nexus media records;
- `test/expectedOnlineProjections` contains acceptance expectations and is
  never runtime-importable.

These are governed seed/import payloads for the reusable Nexus website
accelerator. They are not a static-site authoring model and are not the
standard way partners should maintain live content. See
`LIFECYCLE.md` for the executable classification matrix.

Application-specific documentation source belongs under `docs/`. When Nexus
documentation is introduced, its generator must emit only governed WCMS Staged
records under this module's `data/` tree and declare them in an immutable,
destination-qualified manifest section. Customer-wide setup and runtime guidance
remains in the customer repository's `docs/`; executable renderer code remains in
the independent `nodics.nexus` frontend.

Verify the release contract with:

```bash
npm test
```

The manifest exposes three destination-qualified releases:
`nexusCorporateSite`, `nexusEditorialSource`, and
`nexusEngagementOperational`. It includes accelerator-owned reference CMS
contracts for Editorial listing/detail pages and all nine standard Nexus
Editorial renderer mappings. It excludes Online projection fixtures, Wiki
documentation, customer submissions, and commerce-demo data.

Partners and project teams should customize live application content through
Axis, Schema Workbench, Page Designer, and governed data import/export
operations. DevOps may use physical data packs for bootstrap, migration,
environment promotion, or controlled sample data only. Executable renderer code
never belongs in this data module.

### Product portfolio

The corporate CMS composes three levels: the homepage product section, `/products` comparison dashboard, and individual pages for Waste Management (showcased through Circa), Agora Apparel, Agora Electronics and Agora Telco. `/solutions` holds the Task Execution Engine and Data Engineering concepts separately.

`nexusProductPortfolioType` and `nexusProductStoryType` are rendered by `nodics.nexus`; product copy, routes, gallery references and adoption boundaries remain in the WCMS authoring records. The thirteen `nexusProduct-*.png` assets are signed-out captures of running local reference applications (desktop 1440×960, mobile 390×844), with sample content. They illustrate the available experience and do not establish production payment, carrier, transport or partner readiness.

The Solutions overview and `/solutions` detail page use `nexusSolutionsType`.
WCMS owns their copy, conceptual flow labels, use cases, proposed scope, outcomes,
and engagement stages. The Nexus frontend supplies the allowlisted visual
renderer. These entries describe directions for discovery and do not represent
qualified packaged applications or production deployments.


This module explicitly participates in Application Builder through
`nodics.applicationBuilder.dataPack: true` in its package metadata. The owning
customer project declares frontend, domain and preset choices. Preserve the
module's existing import-manifest and content ownership rules; Builder metadata
does not import, publish or validate this module's live data.

Derived component-media records exclude retired source components. Keep surviving
binding codes stable, retain owner validation and advance the development manifest
version/checksum when correcting a previously attempted release.
