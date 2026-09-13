# nTooling

`nTooling` owns Nodics development-time commands, quality gates, generators, and
repository inspection utilities. It is deliberately excluded from the runtime
module loader so application startup never depends on development tooling.

Tooling must resolve the target Nodics project explicitly and must not assume
that the framework source directory is the consuming application's root.

Project-specific tooling belongs in project modules and will be composed through
the tooling command contract in module-index order. Runtime pre-scripts and
post-scripts remain separate startup extension points owned by `nConfig`.

Command declarations live under `tooling.commands` in module-owned
`config/properties.js` files. The loader composes framework contributions
first, then later-index customer project contributions, requiring an explicit
`$override.mode: 'replace'` when a command handler changes.

`mcp:governance` is the first MCP-facing tooling surface. It prints read-only
JSON that future MCP adapters can expose for workspace summary, module
discovery, nearest `AGENTS.md`, generated module context, and change-impact
guidance. The command is navigation over existing Nodics contracts only; it
must not persist decisions, mutate source, write runtime configuration,
regenerate artifacts, change data, or call external providers.

The MCP command family is intentionally staged:

- `mcp:governance` reports read-only workspace and change-impact context.
- `mcp:validate` runs only approved Nodics validation commands and returns
  structured results.
- `mcp:runtime-context` explains hierarchy, active-module declarations,
  artifact ownership, and override paths from source files without bootstrapping
  the runtime.
- `mcp:mutation-plan` creates guarded mutation/generation plans for module
  skeletons, documentation updates, generated artifacts, build, and clean
  actions without executing writes by default.

Customer projects should customize MCP behavior by contributing the same command
name from a later tooling module and/or contributing the same service filename
under `src/service/mcp`. For example, a customer module can override only
`createPlan` by adding
`src/service/mcp/defaultMcpMutationGuardService.js` with a `createPlan`
function. The nTooling service merge keeps other default methods, such as
`getActionCatalog`, from the framework service. Replacing the whole command
handler is still possible, but it requires the normal explicit
`$override.mode: 'replace'` governance.

The `ai:principle-audit` command checks the canonical partner write boundary,
framework/accelerator/project ownership clauses and their human/AI entry points.
It detects guidance drift; repository ACLs and filesystem write controls remain
separate operational responsibilities.

## Capability

`nTooling` provides:

- the `nodics-tool.js` command entrypoint;
- command discovery from layered `tooling.commands` properties;
- explicit command override governance;
- clean/build/lifecycle command wrappers;
- an ephemeral framework repository build composition that covers every
  standard runtime product group without depending on a customer project, and
  activates `nTest` so builds regenerate module-owned schema and API tests;
- test-suite command orchestration;
- documentation coverage and documentation gate checks;
- application-owned `docs/` catalogue validation and immutable WCMS Staged
  content-pack manifest construction;
- source structure compliance audits;
- copyright header governance;
- AI governance validation;
- design principle audits;
- module metadata normalization;
- module LLM context generation and validation;
- topology planning and structure generation support;
- local topology runtime `env` injection from environment-owned profiles;
- MCP read-only, validation, runtime-context, and guarded mutation-plan command surfaces.
- Application Builder schemas plus beginner-facing `builder:guide`,
  `builder:answers-template`, interactive `builder:questionnaire`,
  read-only `builder:dry-run`,
  explicit-root `builder:discover`, `builder:validate`, approval-required
  `builder:plan`, explicit `builder:approve`, guarded minimal
  `builder:generate`, evidence-backed `builder:qualify`,
  digest-bound `builder:release-manifest`, and non-mutating
  `builder:upgrade-plan` commands.

Tooling is non-runtime. It can inspect, generate, validate, and report, but application startup must not depend on the tooling module being loaded as a runtime capability.

Application Builder asks business questions through the customer-selected presets.
`builder:answers-template` and `builder:questionnaire` feed the same guide/dry-run
path. Review the resolved capabilities, frontends, renderers, data packs and
customer-owned outputs before approving generation. Guide output is review data;
only approved generation writes the standalone backend/storefront starter.
Qualification produces JSON and Markdown evidence, with a beginner README and
`builder-handoff.json` explaining customization roots and next commands.
Release manifests bind content digests; upgrade planning does not mutate the
application. Detailed command and approval semantics live in the existing
[Builder contract](llm/contracts/application-builder.md).
Builder takes `--frontend=/path/to/frontend` and
`--customer=/path/to/customer`. Customer package metadata declares presets,
frontend choices, compositions and data-pack participation. Optional
`--experience` uses the workspace's existing `apps.json`; multiple storefronts
require `--frontend-code`. Missing repositories are errors, including in CI.
See [Builder contracts](llm/contracts/application-builder.md) and the
[declaration example](llm/examples/application-builder.md).

A declared composition records intended customer wiring. Generated runtime
qualification exercises the standalone starter. External frontend rendering,
backend deployments, authentication and database imports need separate live
acceptance evidence.

Application documentation generators should reuse
`defaultApplicationDocumentationContractService` for source containment,
stable identities, generated-file hashes, optional Axis installation and
Staged-to-Online lifecycle policy. Projects retain their own renderer schemas,
records and application content; nTooling does not become a documentation
content owner or runtime importer.

Strict documentation generators must also use the same service for enterprise
documentation metadata and quality enforcement. The shared contract validates
backend-owned navigation sections, hierarchy placement, source ownership,
audience, access mode, lifecycle state, maturity state, related pages, source
evidence, minimum page depth, required business/developer/operator guidance,
visual or tabular explanation, common mistakes, verification, and unsafe
delivery-phase wording. This is a framework completion rule: generated
documentation is not accepted only because Markdown exists; it must be
navigable, source-backed, publishable, access-controlled, and useful enough for
business users, architects, administrators, developers, operators, QA owners,
and AI tools.

## Local Runtime Isolation

The existing environment `nodics.environment.json` remains topology authority.
`dependsOn` validates startup order, not a cascade-shutdown policy. Once all
selected runtimes are ready, an unexpected child exit is recorded and logged
without stopping its peers. Startup failure still fails and rolls back the
requested launch; explicit `topology:stop` stops owned live processes.

Inspect `topology:status` and the affected log before recovery. To restore a
failed runtime independently, use its existing start command in a separate
terminal; it is then operator-owned and must be stopped explicitly before a
future supervised full launch. No automatic restart policy or second process
registry is introduced. Test this with
`test/projectTopologyIsolationContract.test.js`; its processes and ports are
isolated from customer runtimes. Standard functional exceptions are tested by
`test/functionalModuleOptionalityContract.test.js`.

## Command Contract

Commands belong in `config/properties.js` under `tooling.commands`. A command definition should identify:

- command name;
- service handler;
- description;
- arguments/options;
- whether it can write files;
- validation behavior;
- expected output shape;
- override policy.

Later modules may add commands. Replacing an existing command handler requires explicit `$override.mode: 'replace'` so accidental shadowing does not silently change developer workflows.

## Extension Path

Projects extend tooling by:

- adding project tooling modules;
- contributing commands through layered properties;
- adding services under `src/service`;
- overriding specific service functions through the Nodics service merge model;
- adding command contract tests;
- documenting the workflow in README and LLM guidance.

Keep project-specific automation out of framework source unless it is a reusable Nodics platform capability.

## Tests

Run:

```bash
npm run llm:validate
npm run quality:docs
npm run structure:audit -- --fail
node nodics.foundation/modules/nTooling/test/toolingCommandOverride.test.js
node nodics.foundation/modules/nTooling/test/moduleStructure.test.js
node nodics.foundation/modules/nTooling/test/documentationNavigationQuality.test.js
node nodics.foundation/modules/nTooling/test/applicationDocumentationContract.test.js
node nodics.foundation/modules/nTooling/test/mcpReadOnlyGovernanceContract.test.js
```

The documentation quality gate validates source documentation coverage and
public information architecture. It checks local link targets and path case,
root-to-`nodics.docs` reachability, page continuation links, required business and
beginner entry points, and complete package-module README coverage through the
public module catalog. Projects may change entry paths through
`tooling.documentationGovernance.navigation` without creating a second
documentation authority.

## What To Avoid

Avoid:

- making runtime startup depend on development tooling;
- placing command configuration outside layered `properties.js`;
- hardcoding repository-specific paths when project home should be resolved;
- creating mutation tools that write by default without explicit approval;
- letting MCP become a hidden source of architecture or runtime configuration;
- bypassing governance tests after changing command behavior.

Commerce publication qualification reads the current manifest-listed operational
records and supports environment-owned per-domain Store/catalog context. See the
[module contract](llm/contracts/README.md) for publication configuration and
checksum failure behavior.

Project clean/build use explicit server selection and startup metadata. Framework
validation derives runtime groups from workspaces and retains its own generated
server between gates. See [build targeting](llm/contracts/README.md#project-and-repository-build-targeting).

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
