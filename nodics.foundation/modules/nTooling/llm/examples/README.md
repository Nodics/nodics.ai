# nTooling AI Examples

This folder contains examples that help AI agents and developers work correctly inside the `nodics.foundation/modules/nTooling` module boundary.

Prefer small examples that show proper layered customization, configuration overrides, service extension, schema/router changes, tests, and documentation updates without modifying unrelated Nodics code.

An application data module keeps authored pages under `docs/pages`, validates
`docs/catalogue.json` through the shared application-documentation contract,
generates records below its `data/sample-v001/content` release, and exposes optional
installation only through Axis. Import targets Staged; nPublish controls Online
visibility. A repeated immutable release produces the same checksum, while a
changed payload under the same version is rejected.

Use [application-builder.md](application-builder.md) for read-only discovery,
solution validation, and approval-required planning command examples.

The focused `test/designPrincipleAiGovernanceContract.test.js` reads canonical
guidance and simulates removed partner clauses through the audit's overridable
read method. It proves missing write-boundary, ownership, contribution and
navigation clauses fail without editing source files or starting a runtime.

For a reference domain whose price book uses AED, configure its publication
store and import that Store's AED default through the governed Staged release.
The publication command loads current manifest-listed records, publishes Product
projections for that store, restores operational records through their owners,
and verifies discovery/PDP delivery. A checksum mismatch rejects the handoff;
it must be repaired in a new source release, never bypassed or restored manually.

Project command defaults contain reusable operations only. Application server and
environment aliases, named customer acceptance journeys and media seeds are
project-owned `nodics.project.json` tooling commands. Declare scripts under
`tooling.scriptOwnership.projectOwned`; the existing executor supplies project and
framework roots. Do not copy topology, release or configuration resolvers into the
project. Project documentation generators read stable publication identifiers,
routes, labels and channels from `docs/catalogue.json.publication`, validated
before writing. The generic data-manifest command refreshes only explicitly
declared development-baseline checksums; changed immutable releases fail before
any manifest write. Environment composition selects an explicit code or the sole
declared composition and reads only its declared environment variable.
