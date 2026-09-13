# nController AI Examples

This folder contains examples that help AI agents and developers work correctly inside the `nodics.foundation/modules/nController` module boundary.

Prefer small examples that show proper layered customization, configuration overrides, service extension, schema/router changes, tests, and documentation updates without modifying unrelated Nodics code.

## Safe generated update envelope

Use `{ query: { code: 'record-one', revision: 4 }, model: { name: 'Updated' },
options: { recursive: false, returnModified: true } }` for the matching schema.
The token is the original revision. Authentication, tenant and module come from
secured routing, never from body siblings such as `authData` or `moduleName`.
Unknown/read-only model fields cannot become runtime authority. See
`nDatabase/database/test/generatedMutationParityContract.test.js` for both
completion styles and the generated facade/service path with owner/CAS checks.
