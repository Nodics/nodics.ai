# Nodics documentation content

This configuration-and-content group owns the shared documentation scaffold,
cross-framework guides and explicit library composition. Projects may select
the group to expose optional documentation profiles. It adds no runtime APIs,
business services or frontend application, and selection never imports data.

Every document identifies its functional visibility boundary, such as
`nodics.foundation`, and its canonical implementing module, such as `database`.
The implementing module owns the records and unique assets. Functional grouping
governs Axis visibility and reading hierarchy, not physical record ownership.
Composition-only groups contain no importable data. `nodics.docs` is the explicit
shared-content exception; `nService` also retains guides for its own implementation.

`data/manifest.json` is the versioned release manifest. nImport imports the
content package into WCMS Staged through the governed content-pack process,
validating the contract version, content hashes, functional owners and document
IDs. Review and publication use the existing CMS, Process and Media owners.
Axis reads the access-filtered CMS projection, never repository files.

Documentation is CMS data, maintained directly alongside the implemented
functionality in `data/docs-v001/records/documentation`. Pages, components,
navigation, access policies and publication metadata have one source of truth.
There is no separate Markdown authoring tree. `docs:generate` remains a
compatibility alias for read-only record validation; it does not regenerate prose.

Images live in `data/docs-v001/assets/documentation` with declared checksums and
Media records. Article image blocks use stable `mediaCode` references. Media owns
storage, access and delivery; CMS publication transfers referenced Media through
the existing Staged-to-Online process. Validation reports belong under
`test/reports`, not a second documentation source folder.

Canonical capability detail belongs with its backend module, and accelerator
guides belong with the respective accelerator. This package owns central
discovery and 29 cross-framework guides. The full-library manifest explicitly
composes module-owned packs; it does not retain copies of their article records.
Axis product documentation belongs to `nodics.platform/modules/axis`; real
customer/deployment differences belong to their customer backend owner.

Documentation is an optional `CONTENT_PACK` under `docs-v001`, not another
Init/Core/Sample import type. nImport stages only its declared files and assets.
The data import guide includes placement decisions, ownership and media flows,
cross-module references and a troubleshooting matrix. Reference validation checks
globally unique IDs/routes and owner-qualified anchors without installing packs.

Framework product guides include the [Circa/eWaste product journey](../nodics.accelerators/modules/waste/modules/eWaste/data/docs-v001/records/documentation/eWasteDocumentationComponentData.js),
with separate data/network, submission, staff/rewards, coupon commerce,
customization and deployment topics, plus exact collection, enterprise/staff,
source release, catalogue and configuration references. Five editable architecture
diagrams illustrate owner boundaries, journeys, record relationships and layers.
Product presentation does not transfer
runtime/data ownership out of the underlying framework and customer modules.
Source capability, staged qualification and published/live acceptance remain
explicitly distinct. Agora product guides follow the same depth/audience pattern.

The `foundation` manifest section contains the shared CMS Site, templates,
navigation and cross-framework guidance. Each capability pack explicitly includes
that section and owns its articles, page links, search/publication metadata and
module-specific assets. Shared Media assets have one owner and stable references.
The `documentation` section composes the complete library. Axis exposes the full
library, foundation and module selections through ordinary initialization profiles;
each selection has its own import receipt and publication baseline.

Online navigation is filtered against the immutable published route list.
Missing optional references never install another pack implicitly. Owner-qualified
references and anchors are checked against the complete selected release graph.
The 14 newly added accelerator and capability guides have source-backed editorial
reviews in `test/evidence/draft-editorial-review-{a,b}-2026-10-07.json` and are now
Staged with active authoring routes. Review evidence is not a Process approval or
an Online receipt. Normal CMS and Media approvals still govern public delivery.

Source coverage defaults to metadata-declared module roots within this framework
checkout. It never auto-selects sibling customer/frontend repositories. To audit
another owner, pass explicit `--source-root`, `--catalogue` and `--output-dir`;
its report belongs to that owner and cannot overwrite Framework artifacts.
See the source-backed documentation coverage guide for invocation and boundaries.
`test/sourceCoverageScope.test.mjs` proves sibling independence and output isolation.

The framework library currently composes 173 guides with 63 independent optional
selections. Coverage closure uses canonical `sourceCoverage` declarations for the
17 previously open boundaries, including composition-only families and five
schema-defined Location capabilities. Such coverage documents source behavior;
it does not assert implemented orchestration, Online publication or live acceptance.
Each declaration binds at least three distinct section anchors, 800 words of
section content, a diagram, a table and two real non-data source files inside the
selected module. Other matches remain explicitly labeled mention-based triage.
`test/sourceCoverageClaims.test.mjs` rejects shallow content, missing anchors,
unknown states, missing/undeclared files and source-boundary escapes.

Shared provider and schema explanations may declare `sourceOwnership` with the
selected module, implementation maturity, canonical section anchor, two distinct
declared non-data source files, and an explicit ownership rationale. These appear
as `shared-guide-mapped` / `owner-reviewed-reference`, not validated depth. This
keeps cross-module explanations in one canonical guide without disguising
mention-only coverage. A completed writing batch does not close the semantic
review backlog or certify provider behavior, publication, or live acceptance.
Manual source-editorial reviews are aggregated in
`test/evidence/semantic-documentation-closure.json`. Closure is bound to the exact
backlog action, canonical article blocks/anchors and inspected source hashes;
changed inputs reopen the item. The report exposes semantic open/closed counts
separately from coverage triage. `test/semanticReviewContract.test.mjs` covers
stale content/source, scope drift, foreign owners, missing anchors and fabricated
status strings. This check validates evidence, not prose or deployment.
