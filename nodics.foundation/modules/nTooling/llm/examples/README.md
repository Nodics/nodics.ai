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

The existing design-principle governance test also removes final-review
headings/discovery anchors in memory. Missing guidance fails the audit without
editing source. A separate real review must inspect the changed-file inventory,
configuration consumers and authority boundaries and record its decision.

Qualification contract runners report `environment: null` and
`executionScope: ISOLATED_CONTRACT_TESTS`; they must not claim a named deployment
was executed. The focused evidence-scope regression preserves success/failure
while preventing a fabricated environment label. Deployment evidence requires
an actual selected deployment and separately observed results.

Keep `nodics.owns` aligned with authored source responsibilities. The existing
structure audit reports missing source ownership; generated server artifacts do
not transfer framework ownership to the customer. Resolve these findings during
the mandatory final review rather than treating a root test as their acceptance.

## Additional capability selections

A generated server with selected environment `preview` and server `worker`
declares `activeModules: { groups: [], modules: ['applicationCore'] }` when the
operator selects that application module. It does not repeat `preview` or
`worker`. With no optional modules/providers, `modules` remains empty. nConfig
keeps the selected topology active; unrelated capabilities remain unselected.
See `test/topologyPlanWorkflow.test.js` for generated output and multi-environment
empty-selection coverage.


Backend startup, readiness and API acceptance must work without any frontend
repository or running frontend server. Do not declare frontend launch commands,
paths, lifecycle or UI tests in backend properties or backend acceptance runners.
Frontend applications own their servers, outage/retry presentation, and frontend
tests. Backend CORS and browser-session contracts are tested through APIs using
explicit security policy; they do not confer frontend lifecycle ownership.

Acceptance consumers read the selected environment through nTooling, then use
`projectRuntime(profile, { role: "WCMS_STAGED" })` (or the capability's own role).
Override an ambiguous role with an explicit server selection; reuse its port and
launch descriptor rather than repeating either in environment acceptance metadata.

Customer projects may declare `bootstrapIdentity.adminPassword` in their own
`config/properties.js`, with environment/server overrides through nConfig. The
value must meet nAuth strength policy. Project validation permits this direct
admin-bootstrap value only; framework defaults, service credentials and binding
fallbacks retain deployment-input requirements. No credential values belong in
examples, diagnostics or published documentation. Configuration changes apply to
future initialization; existing accounts require Profile password operations.
