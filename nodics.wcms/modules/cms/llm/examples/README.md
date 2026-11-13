# cms AI Examples

This folder contains examples that help AI agents and developers work correctly inside the `nodics.wcms/modules/cms` module boundary.

Prefer small examples that show proper layered customization, configuration overrides, service extension, schema/router changes, tests, and documentation updates without modifying unrelated Nodics code.

Acceptance consumers read the selected environment through nTooling, then use
`projectRuntime(profile, { role: "WCMS_STAGED" })` (or the capability's own role).
Override an ambiguous role with an explicit server selection; reuse its port and
launch descriptor rather than repeating either in environment acceptance metadata.

To continue a saved business page, choose its exact Catalog/Site, read the scoped
Designer page library, then GET the exact draft. Retain its source stamp and all
placement, localization, SEO and Media identities while editing configured inert
fields. Validate, save once, then reopen the saved owner result before continuing.
An HTTP failure or stale-source conflict requires inspection, never automatic
replay. Do not work around a read-only nested layout, foreign ownership, oversized
history or missing controls by using generated CRUD, direct database writes or
changing frozen pack data. Customer modules extend the same owner projection.

For an add-before or swap, submit the complete intended order using stable placement
identities. CMS validates current occupants, parks changed placements at free
positions using versioned saves, then writes the final order. Historical old
positions do not occupy current slots. If any stage fails, inspect the retained
saved graph and keep local intent separately; do not infer rollback, omit competing
placements as a deletion request, enable replacement flags or repeat the command.
An unchanged complete composition and an occupied position outside the draft are
different outcomes. Tests compose the real association validator with retained
history, schema ACL and scoped Designer saves to exercise those boundaries.

A customer may override `cms.designerAuthoring.presentation.pageNameLabel` to
`Campaign name` through ordinary layered configuration. Inherit the remaining
owner strings; do not copy the form into Axis or add permission expressions.
Create `{page: {code: "summerCampaign", name: "Summer campaign landing", ...}}`
through the existing Designer aggregate. After acknowledgement, read
`GET /designer/composition/draft` with the same Catalog, Site and page code.
Preserve returned placement/locale/Media identities and its source stamp before
changing copy or order. A changed or uncertain result requires inspection and
an explicit local choice; neither a label nor a positive save permits replay.

For a lost publication callback response, inspect the same Process instance and CMS journal. Retry only the original failed callback; a matching Online receipt returns without another activation. A conflicting receipt or changed Online pointer requires owner inspection, never fabricated evidence.

## Nested saved-page authoring

Read `designer/composition/draft` for one authorized Site, Catalog and page; retain `sourceVersion`. A child is another `sections` entry inside its parent component, with a distinct component and placement identity. Validate the complete graph before one save. Read the saved composition after acknowledgement before publication. Reference choices resolve current version heads before active-state filtering; retained history is never an ambiguity or a reason to revive an inactive head. Renderer aliases must be explicitly declared by the module or its active owned type mapping. See `cmsBusinessAuthoringAccess.test.js` for foreign scope, cycles, stale source, depth, translation and renderer rejection cases.
