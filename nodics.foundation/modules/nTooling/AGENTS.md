# nTooling Agent Contract

This file gives AI coding agents mandatory guidance for this Nodics module or package boundary.

## Inheritance

- Follow the repository AGENTS contract: `../../AGENTS.md`.
- Follow global AI/development guidance: `../nSetup/llm/ai-enablement-index.md`.
- If a deeper child module has its own `AGENTS.md`, follow that file for changes inside the child module.

## Partner governance

Preserve the `ai:principle-audit` checks for the nSetup customer project contract.
Project extensions may strengthen checks while preserving the canonical partner
write boundary and the separate Nodics contribution and release process.

## Module Work Rules

- Preserve post-start runtime failure isolation. Environment `dependsOn` is
  startup ordering, not a cascade-shutdown policy. Startup rollback and explicit
  operator stop remain separate from loss of an already-ready runtime. Validate
  with disposable processes, never by terminating a user's live topology.

- Treat this directory as a layered Nodics module boundary when it contains `package.json`.
- Keep capabilities stable and make implementations replaceable through the module hierarchy.
- Do not hardcode project, environment, server, node, tenant, or customer behavior into reusable framework code.
- Local topology runtime-specific environment values belong in the project
  manifest runtime `env` object and must be merged by topology tooling at
  process launch. Do not require customer-specific `.env` files inside
  vendor-owned frontend repositories.
- Put configurable behavior in layered configuration, schemas, routers, services, pipelines, data, and runtime governance.
- Update the concise `README.md`, canonical documentation content, `llm/contracts`, `llm/examples`, generated context, and tests whenever behavior or extension contracts change.
- Use `llm/contracts` for exact module-local AI/developer rules, `llm/examples` for approved patterns, and `llm/generated` for source-derived facts. Do not add a module-local llm README file; this `AGENTS.md` is the AI navigation and behavior entrypoint for the module.
- Generated files must be recreated from source definitions; do not hand-maintain generated artifacts as source of truth.

Apply [server build and lifecycle ownership](../nConfig/llm/contracts/configuration-inheritance-contract.md#server-build-and-lifecycle-ownership).
Keep generation, loading, cleanup and test discovery on the same selected server;
prove authored override order, independent-server preservation and failure paths.

The source-export audit discovers all runtime source/configuration boundaries
from package metadata and parses syntax. Preserve automatic coverage of new
modules and exclude generated output and documented constructor libraries.
Nested callbacks are not exported-method style violations.

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

Foundation exposes the existing project bridge as the installed `nodics` command.
Keep command normalization, registry dispatch and startup resolution framework-owned;
projects bind a compatible dependency and declare only optional aliases. See
[installed project command](llm/contracts/README.md#installed-project-command).

Application Builder reads customer choices from existing package metadata:
`nodics.applicationBuilder` declares presets, frontends and compositions; data
modules opt in with `applicationBuilder.dataPack: true`. Keep source roots
explicit, reject missing sources in every environment, and never fabricate CI
catalogues. Preserve the distinction between declared wiring, starter runtime
qualification and external deployment evidence. See
[Application Builder](llm/contracts/application-builder.md) and its independent
customer test before changing discovery, generation, templates or qualification.

Project lifecycle commands use their declared `projectSteps`: validate the project
manifest/script boundary, ownership language, selected runtime generation,
OpenAPI, LLM context and generated documentation. Framework authoring keeps the
existing complete `steps`, including framework governance documents, principles
and Nodics legal headers. Do not require customers to copy those files or label
their own source with Nodics copyright. A customer may add its own legal and
documentation gates through the existing command override. Project clean only
cleans the selected server; it does not erase project-wide LLM context.
