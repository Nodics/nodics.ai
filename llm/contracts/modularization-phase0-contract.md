# Nodics Modularization Phase 0 Contract

Phase 0 stabilizes rules before more source movement. This document is a
working contract for the new modularization workspace and must be checked
before changing repository layout, module skeletons, runtime startup,
clean/build behavior, or documentation ownership.

## Non-negotiable boundaries

- `nodics.ai` is the Nodics backend/framework repository root.
- `nodics.ai` owns repository-wide framework documentation, LLM contracts,
  setup guidance, and release governance.
- `nodics.ai/AGENTS.md` is the first LLM/developer navigation contract when
  working inside the framework repository. Module-local `AGENTS.md` files
  remain authoritative inside their own functional module groups.
- README files are concise human-facing overviews. They must not become LLM
  behavior contracts; use AGENTS and `llm/contracts` for that.
- Standard Nodics backend functional modules are module-group units under
  `nodics.ai`, such as `nodics.core`, `nodics.platform`, `nodics.wcms`,
  `nodics.cron`, and `nodics.docs`.
- Frontend applications such as `nodics.axis` are separate projects/repositories
  and must not be treated as backend framework modules.
- Customer projects may place the framework checkout and customer project
  anywhere. Runtime code must not assume a fixed sibling relationship between a
  customer project and the framework repository.
- Customer projects such as `nodics.kickoff` are not framework functional modules.
  They may use `nodics.kind: application` and be active topology modules when
  required for environment/server resolution, but they must not be registered
  as BackOffice functional modules.
- Customer `modules/` and `envs/` folders are organizational module groups for
  tooling/governance consistency. They are not activated as runtime functional
  modules by themselves.

## Runtime and module semantics

- Functional module hierarchy defines capability availability.
- Service inheritance/override order is a runtime loading concern controlled by
  module index/load order and merge behavior.
- Do not confuse capability registration with service override precedence.
- A runtime server under a customer environment loads its configured extension
  chain and effective module graph.
- Topology/application modules required for resolving project, environment, and
  server ancestry are not the same thing as BackOffice functional modules.
- Example: `platformServer` can extend `nodics.platform`, which extends
  `nodics.core`; customer project modules load after framework modules when
  configured for that server.
- Example: `platformServer` can extend `nodics.kickoff.platform`, which extends
  `nodics.platform`, which extends `nodics.core`; BackOffice and Axis still
  expose this capability as `nodics.platform` / `Platform`.
- Customer extension modules customize or expand a framework functional module.
  They do not create a new functional module identity unless they intentionally
  introduce a new capability.
- Core, platform/profile, and WCMS are mandatory foundation capabilities for the
  current Axis/backoffice experience and must not be treated like optional
  business modules without an explicit architecture decision.
- Init/import pipelines may retry finalized files across phases while dependency
  records become available. Transient phase errors may appear in runtime logs,
  but persisted `ImportRunModel` diagnostics must only count final-phase or
  fail-fast record failures. A successful later phase must leave
  `failureCount=0`, `recordsFailed=0`, and no stale row-level failures.
- Finalized import dispatch must preserve dependency-safe behavior through the
  retry model: unresolved references are retried until the phase limit, and only
  unrecovered references are exposed as operational failures.

## Customer project dependency resolution

Customer projects must be portable:

- No runtime path may require the customer project to be parallel to the
  `nodics.ai` checkout.
- Customer projects may depend on the framework repository root when tooling
  supports that model, or on selected functional module packages such as
  `nodics.platform`, `nodics.wcms`, and `nodics.cron`.
- Framework module locations remain standard `package.json` dependencies.
  Customer projects should point those dependencies at stable project-local
  generated links such as `.nodics/framework/nodics.platform`.
- For local development, the customer project owns `.env` and may set
  `NODICS_FRAMEWORK_ROOT` to the framework checkout that contains
  `nodics.core`, `nodics.platform`, `nodics.wcms`, `nodics.cron`, and other
  framework module groups.
- Customer projects may provide a local sync script that creates generated
  `.nodics/framework/*` links from `NODICS_FRAMEWORK_ROOT` before `npm install`.
- Generated `.nodics/` links are machine-local and must not be committed.
- The Nodics Kickoff reference project may default to the documented sample layout
  where `nodics.kickoff` sits parallel to `nodics.ai`, but customer projects must be
  able to override that with explicit framework-root configuration.
- `npm install`, startup, clean, and build must resolve framework modules
  through that declared model.
- Runtime startup should continue resolving installed package names, not raw
  workspace folder assumptions.

## Clean/build scope

- Clean/build operations must use the effective runtime module graph for the
  server where the command is executed.
- A command run from `platformServer`, `wcmsServer`, or `cronServer` must not
  clean/build unrelated modules in the workspace.
- Commands should expose a dry-run or clear log of affected modules before
  destructive cleanup behavior is added.

## Customer configuration classification

- Customer projects should keep only customer-owned configuration.
- Repeated values shared by all servers in one customer environment belong in
  that environment's config.
- Server-specific active modules, ports, database names, and peer endpoint
  topology stay in server config.
- Framework and functional-module defaults belong in the owning `nodics.*`
  module only when they are reusable product behavior, not local sample
  behavior.
- See `llm/contracts/customer-config-classification-contract.md`.

## Module skeleton contract

Every Nodics framework module and customer module should follow one skeleton
contract. Required pieces include:

- `package.json`
- `README.md`
- `AGENTS.md`
- `config/` for module configuration
- `llm/` for module contracts, examples, and generated context when applicable
- `test/` for module contract/unit/integration tests
- `data/init` or equivalent data folders when the module contributes importable
  data
- runtime folders only when the module owns runtime services/controllers/routes

Exceptions must be explicit in the module README or AGENTS file. Missing
folders must not be accidental.

## Formatting and code documentation

- JS, JSON, and configuration files must be consistently formatted.
- Formatting rules should be enforceable through local scripts and later CI.
- Framework files should carry standard file-level documentation/copyright
  headers once the header template is finalized.
- Public functions/services/controllers should document intent, inputs, outputs,
  side effects, and override expectations where the behavior is not obvious.

## Documentation ownership

- `nodics.docs` is a data/content-only functional module that follows the
  standard module structure.
- `nodics.docs` owns governed documentation content for framework, Axis, and
  Nodics Kickoff/sample-project documentation.
- `nodics.axis` is a separate frontend/renderer application and must not own
  backend documentation business data.
- Customer projects may own project-specific docs/data describing their
  customizations and runtime topology.
- Avoid root-level one-off files such as `catalogue.json` when they violate the
  module skeleton. Governed data belongs under standard data folders.
- Documentation navigation in Axis is a rendering concern and must not force the
  physical data-folder segregation used inside `nodics.docs`.

## Phase 0 action register

| ID | Action | Outcome |
| --- | --- | --- |
| A1 | Fix Nodics Kickoff package metadata and description | Nodics Kickoff is clearly a reference/customer project, not a framework module |
| A2 | Define portable framework dependency resolution | Customer projects do not require sibling `nodics.ai` layout |
| A6 | Decide node_modules/link/configured-root model | Install/update/generated-artifact behavior is clear |
| B1 | Lock formatting principle | JS/JSON/config formatting is enforceable |
| B3 | Lock module skeleton contract | Modules can be audited consistently |
| C1 | Stabilize fresh-start import diagnostics | Clean MongoDB startup reports completed imports only when recovered retries have no final failures |
| E1 | Create validation checklist | Every contract has a verification path |

Do not begin broad code movement until these actions are documented and at
least the validation checklist exists.
