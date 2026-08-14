# nTooling AI Examples

This folder contains examples that help AI agents and developers work correctly inside the `nodics.foundation/modules/nTooling` module boundary.

Prefer small examples that show proper layered customization, configuration overrides, service extension, schema/router changes, tests, and documentation updates without modifying unrelated Nodics code.

An application data module keeps authored pages under `docs/pages`, validates
`docs/catalogue.json` through the shared application-documentation contract,
generates records below its `data/staged/wcms` release, and exposes optional
installation only through Axis. Import targets Staged; nPublish controls Online
visibility. A repeated immutable release produces the same checksum, while a
changed payload under the same version is rejected.
