# Nodics AI Framework Agent Contract

`nodics.ai` is the Nodics backend/framework repository root.

Use this file as the first LLM/developer navigation contract when working
inside the Nodics framework repository. Module-specific `AGENTS.md` files still
own local behavior inside each functional module group.

## Required expert posture

AI tools and human technical leaders working on Nodics must not act as generic
Node.js editors. Before working through deeper module guidance, use the
canonical role stack in
`nodics.core/modules/nSetup/llm/contracts/ai-role-and-responsibility-contract.md`.

In short, every significant Nodics task must be reasoned through the combined
posture of an expert business analyst, enterprise architect, Nodics framework
and domain specialist, self-motivated senior software engineer, quality
assurance leader, tester, and TechOps/DevOps engineer. Visible ceremony should
be proportional to risk, but these responsibilities remain active in the
reasoning.

## Required Reading Order

Read from the repository root toward the owning module before implementation:

1. root `README.md` for human orientation;
2. root `AGENTS.md` for repository-wide behavior;
3. `nodics.core/modules/nSetup/llm/contracts/ai-role-and-responsibility-contract.md`
   for the required AI role stack and responsibility lens;
4. `CONTRIBUTING.md` when source, tests, generated artifacts, or documentation
   may change;
5. every applicable ancestor module `README.md` and `AGENTS.md`;
6. the nearest owning module `README.md` and `AGENTS.md`;
7. nearest module `llm/contracts`, `llm/examples`, and generated context when
   relevant;
8. `nodics.core/modules/nSetup/llm/ai-enablement-index.md`;
9. the relevant nSetup `contracts`, `standards`, `playbooks`, `templates`,
   `examples`, or historical `records` for the active change.

README files explain purpose, ownership, usage, and extension paths. AGENTS
files direct agent behavior. Contracts and standards define permanent rules.
Playbooks define how work is performed. Records preserve history and do not
become permanent coding law unless their durable rule is promoted.

## Operating Modes And Authority

Before acting, classify the requested mode:

1. explain/adopt: understand and explain implemented capability without
   changing files;
2. discover/assess: inspect behavior, gaps, and options without implementation
   unless authorized;
3. plan/design: establish outcomes, ownership, requirements, risks, acceptance,
   and sequencing;
4. implement: change only the authorized scope after readiness is sufficient;
5. review/assure: evaluate implementation, tests, security, compatibility,
   operations, and documentation;
6. operate/monitor: perform only approved operational actions and preserve
   auditability.

Role language never authorizes file edits, runtime mutation, data mutation,
publishing, deployment, commits, external communication, or residual-risk
acceptance by itself.

## Pre-Implementation Study Gate

No non-trivial change should start from a narrow file-local view. Before
implementation, build a depth-proportional context from Nodics itself:

- root-to-leaf README/AGENTS chain;
- relevant module `llm/contracts`, `llm/examples`, and generated context;
- relevant `nodics.core/modules/nSetup/llm` contracts, standards, playbooks,
  and examples;
- source, tests, schemas, routers, services, providers, interceptors,
  pipelines, data files, package metadata, topology, and configuration;
- class-level and function-level comments/JSDoc in the affected capability and
  direct dependencies;
- sibling and related module patterns;
- nTooling generators, validators, and scripts that define accepted shape.

For non-trivial implementation, record compact readiness evidence: working
mode, business outcome, owning module/layer, studied sources, current behavior,
reuse/extension path, affected contracts, security/tenant/data/UX/API/release
impact, assumptions, contradictions, intended files, and validation route.

## Repository boundary

- Treat `nodics.ai` as the authoritative backend/framework repository root.
- Keep standard Nodics backend functional module groups under this repository,
  such as `nodics.core`, `nodics.platform`, `nodics.cron`, `nodics.wcms`, and
  `nodics.docs`.
- Keep customer projects outside this repository. `nodics.kickoff` is a reference
  customer project and must not be treated as a framework module.
- Keep customer/project documentation in the owning customer backend project.
  For the reference project, Kickoff-specific setup, demo flows, sample data,
  project modules, custom API behavior, onboarding, and extension guidance
  belong in `nodics.kickoff` using `data/core/source/documentation`,
  `data/core/data/documentation`, `data/core/headers`, and
  `manifest/docs-content-pack.json`; they do not belong in `nodics.docs`,
  `nodics.platform/modules/axis`, or `nodics.axis`.
- Keep frontend applications outside this repository. `nodics.axis` is the
  Axis/BackOffice frontend application and must be managed as a separate
  project/repository parallel to the framework repository.
- Keep backend-importable data in backend-owned modules or content packages.
  CMS catalog, Site, page, component, route, renderer-mapping, and documentation
  records that are imported into a database must not live in `nodics.axis`.
  Axis owns executable browser renderers and static recovery behavior only.
- Do not import behavior from archived legacy repositories except as explicitly
  approved reference material during migration.

## Functional module identity

- BackOffice and Axis must reason about standard functional module identities:
  `nodics.platform`, `nodics.cron`, `nodics.wcms`, `nodics.docs`, and so on.
- Customer extension modules customize implementation but do not rename the
  standard functional capability.
- Example: `nodics.kickoff.platform` may extend `nodics.platform`, but the registry
  identity and display capability remain `nodics.platform` / `Platform`.
- Register optional business capabilities at the functional module level, not
  at every internal technical module level.

## Runtime inheritance

- Repository/package dependency only makes code available.
- Module `extends` defines functional inheritance and customization.
- Runtime server `extends` defines the effective boot chain for a server.
- Service override order remains explicit through runtime load/index order and
  merge behavior. Do not confuse module availability with service precedence.
- Treat import retry phases as operational probes. Transient phase errors may be
  visible in logs, but recovered retries must not remain in persisted import-run
  diagnostics.

## Documentation and LLM ownership

- Repository-wide and tool-neutral framework principles live under
  `nodics.core/modules/nSetup/llm/`.
- Do not create or restore a repository-root `llm/` directory. `nodics.ai` is
  the framework repository/module-group boundary, not a direct functionality
  owner or parallel LLM authority.
- Module-local contracts live under each functional module group, for example
  `nodics.core/llm/contracts/`.
- README files are concise human overviews. AGENTS files direct agent behavior.
- Use permanent contracts and standards under `nodics.core/modules/nSetup/llm/`
  before broad source movement, runtime loader changes,
  dependency-resolution changes, or module skeleton changes.
- Treat `nodics.core/modules/nSetup/llm/records/phase0/` as historical
  modularization traceability. Do not add new permanent coding rules there.

## Mandatory implementation rules

- Before changing code, identify the active module boundary and nearest
  `AGENTS.md`.
- Apply reuse first: reuse an existing Nodics capability, then customize or
  extend through the layered module hierarchy, and create a new capability only
  after proving existing authorities are insufficient.
- Design every module for partial discovery. A future developer or AI tool may
  read only root guidance and the nearest module files, so critical ownership,
  dependency, security, persistence, extension, and testing rules must exist in
  the nearest `AGENTS.md`, README, `llm/contracts`, `llm/examples`, generated
  context, and focused tests as applicable. Do not hide a mandatory rule only
  in a distant guide, prompt, temporary plan, or prior conversation.
- Significant capability documentation must include successful, rejected,
  boundary/scale, failure/recovery, and later-layer customization use cases.
  It must address business evaluators, business users, administrators/operators,
  partner developers, framework maintainers, and AI tools, or explicitly state
  why an audience is not applicable.
- Treat generated artifacts as outputs recreated from source definitions. If
  generated output is wrong, fix the source definition and regenerate.
- Keep backend-importable data in backend-owned modules or content packages.
  Frontend repositories own rendering and interaction, not persisted CMS,
  documentation, schema, permission, or initialization records.
- Keep instructions portable and tool-neutral. Vendor adapters may reference
  root `AGENTS.md` and `nodics.core/modules/nSetup/llm`, but must not become
  the source of truth.
