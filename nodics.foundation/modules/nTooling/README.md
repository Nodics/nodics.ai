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

## Capability

`nTooling` provides:

- the `nodics-tool.js` command entrypoint;
- command discovery from layered `tooling.commands` properties;
- explicit command override governance;
- clean/build/lifecycle command wrappers;
- an ephemeral framework repository build composition that covers every
  standard runtime product group without depending on a customer project;
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

The Application Builder must be approachable for a new developer who does not
know Nodics module names, repository boundaries, or runtime topology. Its
guided mode should ask business-facing questions first, explain what will be
created before writing, choose sensible Commerce/domain presets, produce
copy-pasteable next commands, and keep advanced graph, lock, and repository
details available as evidence rather than as required beginner knowledge.
`builder:guide` may optionally write a review-only workspace with the answers,
solution, approval-required plan, beginner summary, and guide report; it must
not generate backend/frontend application files or bypass approval.
`builder:answers-template` creates the guided answers JSON from simple flags so
a beginner does not need to hand-author schema-shaped input before dry-run or
guide review.
`builder:questionnaire` asks the same beginner questions one at a time and then
delegates to the same answer-template and dry-run path.
`builder:dry-run` uses the same beginner answers and source-backed catalogue to
show backend capabilities, selected frontends, active domains, renderer keys,
data packs, customer-owned outputs, ownership boundaries, validation gates, and
approval state without writing review or generated application files.
Approved generation produces a self-contained backend and Agora storefront
runtime that can be verified through `npm test` and `npm run verify:runtime`.
Generated outputs include a beginner `README.md` and machine-readable
`builder-handoff.json` so the user can see selected capabilities, ownership
boundaries, safe customization roots, and next commands after generation.
Qualification writes both the schema-validated JSON evidence report and a
human-readable Markdown summary covering passed and failed gates, handoff
state, and next commands.
Registry/upgrade mode creates local digest-bound release manifests and compares
existing solution locks to approved target releases without mutating the
generated application.
When a `nodics.exp` workspace is available, Builder commands may use
`--exp=/path/to/nodics.exp` and resolve Agora from `apps.json`; direct
`--agora=/path/to/nodics.agora.apparel` remains available for explicit automation.
The `nodics.exp` catalogue is a Nodics-owned template governance rule for
framework/reference experience apps published under the Nodics organization.
It must not be treated as a mandatory repository layout for real
customer-owned projects; customers may keep generated applications in their own
Git organization, monorepo/polyrepo structure, CI, and release model while
preserving Nodics runtime contracts and extension boundaries.

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
node nodics.foundation/modules/nTooling/test/applicationBuilderSchemaContract.test.js
node nodics.foundation/modules/nTooling/test/applicationBuilderGuidedContract.test.js
node nodics.foundation/modules/nTooling/test/applicationBuilderAnswersTemplateContract.test.js
node nodics.foundation/modules/nTooling/test/applicationBuilderQuestionnaireContract.test.js
node nodics.foundation/modules/nTooling/test/applicationBuilderDryRunContract.test.js
node nodics.foundation/modules/nTooling/test/applicationBuilderPlanningContract.test.js
node nodics.foundation/modules/nTooling/test/applicationBuilderGenerationContract.test.js
node nodics.foundation/modules/nTooling/test/applicationBuilderMultiDomainGenerationContract.test.js
node nodics.foundation/modules/nTooling/test/applicationBuilderQualificationContract.test.js
node nodics.foundation/modules/nTooling/test/applicationBuilderEndToEndJourneyContract.test.js
node nodics.foundation/modules/nTooling/test/applicationBuilderUpgradeContract.test.js
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
