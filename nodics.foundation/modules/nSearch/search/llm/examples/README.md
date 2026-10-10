# search AI Examples

This folder contains examples that help AI agents and developers work correctly inside the `nodics.foundation/modules/nSearch/search` module boundary.

Prefer small examples that show proper layered customization, configuration overrides, service extension, schema/router changes, tests, and documentation updates without modifying unrelated Nodics code.

Database fallback defaults to false. A caller/deployment may intentionally select fallback through the existing search options. Search activation and provider selection remain explicit.

A later deployment `src/search/indexes.js` may map logical `productLocalized`
to physical `acmelocal_productlocalized` while keeping its logical type. Offline
maintenance uses the same layered file/schema loaders and configured engine owner,
not another index catalogue. It never creates the index or loads database index
overrides to enlarge a destructive scope. A shared `productlocalized` binding
without the selected environment prefix refuses, as does historical retirement.
Configuration inspection is not proof that a provider was reset.
