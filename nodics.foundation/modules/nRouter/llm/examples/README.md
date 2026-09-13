# nRouter AI Examples

This folder contains examples that help AI agents and developers work correctly inside the `nodics.foundation/modules/nRouter` module boundary.

Prefer small examples that show proper layered customization, configuration overrides, service extension, schema/router changes, tests, and documentation updates without modifying unrelated Nodics code.

For a project-owned route contribution declaring
`apiExposure: { category: 'inventoryManagement' }`, generated OpenAPI retains
that object at `paths[path][method]['x-nodics'].apiExposure`. The request owner
resolves `apiExposure.categories.inventoryManagement.enabled`, falling back to
the configured exposure default. A disabled category rejects the request even
when the operation is present in OpenAPI. Keep route permissions, token types,
schema access and tenant checks intact. Do not add a second declaration at the
same method/path with a different exposure gate; generation must reject it.
Run `test/openapiContractGeneration.test.js` and route authorization tests when
customizing this metadata. No client-side grant can override server enforcement.
