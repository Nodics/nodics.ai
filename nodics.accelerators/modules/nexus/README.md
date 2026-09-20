# Nexus Accelerator

`nexus` composes the reusable Nexus website experience above WCMS. `nexusCore` supplies administrative and tooling descriptors; `nexus.web` owns reference content, renderer declarations, media assets and immutable releases. Select this group for WCMS authoring, or select a child contribution explicitly when its runtime needs only that responsibility.

See [Nexus data and content guide](../../../nodics.docs/docs/pages/applications/nexus-data-content-guide.md) for release layout, media source confinement and source-migration verification.

The independent `nodics.nexus` frontend owns rendering. Customers extend the accelerator in their own modules and override Site, catalog, publication and deployment choices through existing layers. Configuration does not install or publish content.
