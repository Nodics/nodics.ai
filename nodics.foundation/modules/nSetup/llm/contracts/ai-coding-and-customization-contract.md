# AI Coding And Customization Contract

AI tools writing Nodics code must optimize for governed customization,
configuration, readability, and future override. Working code is not complete
when it can run only in the default module. It is complete when a later
customer, project, environment, server, node, tenant, or provider layer can
understand, configure, override, test, and operate it without modifying
out-of-the-box framework source.

This contract is the coding-specific companion to
`ai-role-and-responsibility-contract.md`. The role contract defines how an AI
tool thinks. This contract defines how it writes Nodics code.

Apply [customer-project-mode-contract.md](customer-project-mode-contract.md)
for every application or partner implementation. Partners edit customer-owned
repositories only; Nodics owns framework and accelerator changes through the
separate contribution/request and release process. Reuse potential does not
change write authority. Classify capability, domain and application ownership
before choosing an extension point.

## Core Rule

Write code as if a partner will customize one small behavior tomorrow.

That means:

- reuse an existing Nodics capability first;
- customize or extend through a later layer second;
- create a new implementation only after proving the existing owner or
  extension point is insufficient;
- keep runtime behavior loader-visible;
- export behavior in a mergeable style;
- put every artifact in its correct Nodics folder;
- keep configurable policy in layered properties;
- keep stable status/error definitions in status definitions;
- document the file, artifact, class/object, and every exported function;
- add tests that prove both default behavior and supported customization.

## Before Writing Code

Database inspection or mutation is never an implementation shortcut. AI tools
must use Nodics APIs or loader-visible services for diagnosis, migration,
repair, import/export, tests, and acceptance evidence. Raw database drivers,
shells, collection commands, and direct model persistence outside the owning
generated service/DAO/provider boundary are prohibited.

Before changing or creating code, the AI must pass the Nodics **what / where /
how** gate:

- **What:** the exact capability, behavior, data, documentation, or governance
  rule being changed, and whether this is existing-capability customization or
  genuinely new implementation.
- **Where:** the repository, functional module, child module, layer, folder,
  and file type that own the change.
- **How:** the Nodics expression mechanism: export style, property namespace,
  status definition, source definition, generated artifact, test, documentation,
  and later-layer customization path.

Then identify:

1. the business outcome;
2. the existing capability that may already satisfy it;
3. the owning functional module;
4. the smallest correct Nodics layer;
5. the exact artifact type: property, status definition, schema, router,
   controller, facade, service, provider, pipeline, interceptor, event, job,
   data, generated source definition, test, or documentation;
6. the expected later-layer customization path;
7. the tests and documentation affected.

For any schema, source definition, DTO, import/export record, event payload, or
API contract that appears to need `tenant`, first apply
`standards/tenant-model-and-runtime-isolation.md`. Tenant is runtime isolation
and data placement, not business ownership. Use enterprise association for
business owner/operator/seller/issuer/partner/venue visibility when required,
and add a direct tenant field only when a framework-owned envelope, generated
persistence key, runtime-governance record, or documented isolation index owns
that exception.

If the AI cannot explain where the code belongs, it must not place the code
arbitrarily. It must inspect the module contract, sibling modules, source
patterns, and nSetup standards until ownership is clear. If ownership remains
unclear, stop and report the design gap.

This gate applies equally to refactoring and documentation/guidance changes.
Moving guidance, adding a tool bridge, changing a validator, or creating an LLM
contract still requires the AI to decide what changes, where the authority
belongs, and how future tools will discover and apply it.

## Reuse, Customize, Then Create

Apply [Existing Layers And Project Independence](nodics-principles.md#existing-layers-and-project-independence).
The creation step below permits a missing capability within established Nodics
ownership; it does not permit inventing another architectural layer or parallel
authority. Reuse the current owner before extracting shared behavior, and move
one implementation rather than copying it. If the architecture cannot express
the requirement, record the precise design gap instead of silently adding a layer.

Never place project-specific configuration or business identities in any
framework/accelerator layer, including service fallbacks, route metadata,
tooling and generators. Keep consumer choices in their existing customer or
deployment owner. Workbench and other clients consume canonical owner APIs;
do not introduce another CRUD facade or route family for a particular screen,
application, store or customer. Preserve distinct domain lifecycle commands
with their owners and their security, validation and recovery contracts.

The implementation order is mandatory:

1. **Reuse:** use an existing Nodics schema, service, facade, router, pipeline,
   provider, data importer, generator, or runtime contract when it already owns
   the capability.
2. **Customize:** when behavior exists but must change, add a later-layer
   configuration, schema fragment, service override, router contribution,
   provider module, pipeline step, interceptor, data contribution, or test.
3. **Create:** add a new capability only when repository-backed evidence shows
   no existing owner can safely express the requirement.

Creating a new file, module, registry, loader, state machine, scheduler,
provider selector, import path, configuration file, or runtime authority is not
allowed merely because it is faster. Parallel authorities become long-term
platform bugs.

## Export Style

Runtime JavaScript must be written in a customization-friendly export style.

Prefer mergeable CommonJS object exports:

```js
module.exports = {
    methodName: function (request, callback) {
        return SERVICE.SomeService.doWork(request, callback);
    }
};
```

This style lets a later-loaded module override `methodName` without copying the
whole file. Use the same principle for service, controller, facade, validator,
interceptor, utility, event, job, and provider behavior.

Avoid:

- hidden private closures that contain overridable business behavior;
- anonymous default exports for runtime artifacts;
- one large method that forces a customer module to copy unrelated behavior;
- custom source folders that the Nodics loader cannot discover;
- file-local constants for values a project, tenant, provider, environment, or
  server may need to tune;
- direct generated-file edits instead of source-definition changes.

Do not declare behavioral helpers as top-level named functions, function
expressions, or arrow-function variables in runtime source. A helper that is
meaningful enough to name is a customization surface and must be a documented
member of the mergeable `module.exports` object. Internal calls must resolve
through the effective object (`this`) so a later-layer member override is
honored; a documented exported fallback is permitted only where a callback or
tool entrypoint can legitimately invoke the member without a receiver.

Constructor, prototype, and class implementations under an established
`src/lib` boundary are a distinct legacy artifact category. They require an
explicit constructor/class compatibility review and must not be mechanically
converted under this object-export rule.

The standing source-export audit discovers runtime owners from package metadata
and parses actual export syntax. A short file allowlist is not whole-framework
coverage. Keep constructor/library exceptions explicit and preserve automatic
coverage when a new runtime module is introduced.

## Artifact Placement

Code must live in the folder that matches its responsibility.

Use these defaults:

| Responsibility | Standard location |
| --- | --- |
| Configurable values, policy defaults, provider defaults, feature flags, limits, exposure categories, tooling command declarations, governance gates | `config/properties.js` |
| Pre-start module setup declarations | `config/prescripts.js` |
| Post-start module setup declarations | `config/postscripts.js` |
| Data shape, persistence, access metadata, generated CRUD source | `src/schemas/schemas.js` |
| API routes, route metadata, route permissions, exposure categories | `src/router/routers.js` |
| Request mapping into Nodics context | `src/controller/**/*Controller.js` |
| Orchestration and policy boundary | `src/facade/**/*Facade.js` |
| Business behavior and provider-neutral services | `src/service/**/*Service.js` |
| Provider-specific behavior | provider module or provider service under `src/service` |
| Ordered runtime behavior | `src/pipelines/pipelines.js`, `src/interceptors/interceptors.js` |
| Event declarations and listeners | `src/event/events.js`, `src/event/listeners.js` |
| Scheduled jobs | `src/jobs/jobs.js` or module-standard job registry |
| Utility functions | `src/utils/utils.js` or focused utility files under `src/utils` |
| Enums | `src/utils/enums.js` |
| Stable statuses, reason codes, error codes, lifecycle states | `src/utils/statusDefinitions.js` |
| Initial, core, sample, or documentation data | backend-owned `data/...` folders and content-pack manifests |
| Tests | owning module `test/` using focused default and override/customization evidence |

Do not put status/error codes in `config/properties.js`. Properties define
customizable configuration and policy. Status definitions define stable
contract vocabulary that code, APIs, logs, tests, documentation, and operators
can rely on.

Do not put executable business logic in `config/properties.js`. If a property
needs computation, expose the value as configuration and perform behavior in a
loader-visible service, facade, provider, pipeline, validator, or interceptor.

Do not put backend-importable data in a frontend repository. Axis owns browser
renderers and recovery UI. Backend modules own CMS records, documentation
records, initialization records, schema records, permission records, and import
manifests.

## Axis Capability Data

Axis-visible navigation, content areas, workspaces, lifecycle actions,
permissions, presentation hints, route ownership, and component descriptors are
backend capability data. They must be owned by the functional module that owns
the business behavior, not by the Axis frontend or a customer-specific shortcut.

An Axis route or renderer may exist before a module is active, but it must not
make the capability visible. Visibility begins only when the owning module is
registered and activated, its BackOffice capability provider contributes the
module-owned data, BackOffice permission-filters that data for the employee, and
Axis receives it through authenticated bootstrap. If the module is absent,
inactive, disabled, or not authorized, Axis must render no left-navigation item
and no functional content area for that capability.

Put reusable Axis capability data under the owning module's `data/...` tree or a
module-owned generated source definition. Use a service only as the activation
hook and normalizer that publishes this data through
`DefaultModuleRegistrationAgentService`; do not hardcode menu trees, workspace
schemas, or business actions directly in Axis. Later customer, project,
environment, or partner layers may extend or replace the module-owned data
through the standard module hierarchy without editing out-of-the-box Axis.

Strict implementation rules:

- do not add local `AxisNavigationItem` constants, preview-only navigation
  items, keyword/category navigation grouping, or hardcoded module menus in Axis
  for business capabilities;
- do not infer business group, order, permission, workbench target, lifecycle
  action, badge, route ownership, or content-area membership from route text,
  module name, category, or UI-side keywords;
- direct browser routes may exist as renderers, but they must show functional
  capability content only when authenticated bootstrap includes the matching
  backend navigation item and the owning module connection is available when the
  item declares a workbench or backend target;
- `CONFIG.backofficeCapabilities` may disable a module-owned provider for a
  runtime, but it must not create, replace, or repair capability metadata;
- initial/default capability data must be published from the owning module's
  `data/manifest.json` as `init` or `core` `DATA_RELEASE` sections and imported
  through nImport when the functional module is activated;
- `sample` data remains user-triggered unless an owning contract explicitly
  promotes it to required activation data.

## Configuration-First Does Not Mean Everything Is Configuration

AI tools must use a configuration-first approach for legitimate variation
points:

- permissions and access-group names;
- API exposure category enablement;
- feature enablement;
- provider selection;
- provider endpoints and secret references;
- limits, timeouts, retries, page sizes, batch sizes, cache TTLs, and
  thresholds;
- environment, server, node, and tenant differences;
- local demo behavior versus production behavior;
- operational and tooling policies.

Keep these in module-owned `config/properties.js` by default, then override
only intentional deltas in project, environment, server, or node layers.

Do not convert these into configuration merely because they are literals:

- stable protocol constants;
- schema field names;
- generated artifact contracts;
- stable lifecycle statuses and reason codes;
- security invariants that must not be weakened by configuration;
- algorithmic behavior that belongs in services or providers.

When in doubt, ask whether a partner should be able to change the value safely
without creating a new version of the capability. If yes, it probably belongs
in properties or governed runtime configuration. If no, it may belong in code,
schema, route metadata, status definitions, or a generator contract.

## Layered Properties Discipline

The owning module defines reusable defaults once. Later layers do not copy
those defaults.

Project, environment, server, and node `properties.js` files should be light.
They may define:

- project policy differences;
- environment-specific values;
- server process composition;
- node identity;
- local coordinates such as host/port;
- remote endpoint coordinates;
- secret-source references;
- explicit enable/disable decisions.

They must not become a second catalogue of framework defaults. If a value would
still be correct after renaming the server or changing the port, inspect
whether it belongs in the owning module instead.

## File Header And Documentation

Every Nodics-owned JavaScript source file, generated JavaScript file, template
JavaScript file, and generated customer project skeleton file must use the
canonical Nodics source header:

```js
/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
```

Every module-owned JavaScript source file must also have file-level JSDoc that
explains:

- module and artifact name;
- platform purpose;
- owning module;
- layer;
- extension/customization path;
- inputs and outputs;
- side effects;
- failure behavior;
- exported methods.

Every exported function must have function-level JSDoc that explains:

- what the function does in Nodics/platform terms;
- parameters and request shape;
- return type;
- callback behavior when applicable;
- mutations and side effects;
- error behavior;
- override notes when the function is an extension point.

Code without this documentation is not finished, even when tests pass.

## Formatting And Style

AI-written code must be formatted, indented, and reviewable.

Use the repository's existing style in nearby files. Do not mix unrelated
formatting cleanup with behavior changes unless the cleanup is explicitly in
scope. Prefer small, cohesive functions with meaningful names. Avoid clever
shortcuts that make override, logging, testing, or diagnostics harder.

When adding examples or snippets, use realistic Nodics names and exact folders.
Do not show generic pseudocode when a developer needs to know the real module
layer, export shape, property namespace, route metadata, or test location.

## Generated Artifacts

Generated files are outputs, not the source of truth.

When behavior is wrong in a generated model, service, controller, facade,
router, OpenAPI contract, test, governance report, or generated LLM context,
fix the owning schema, router, template, generator, metadata, or source
definition and regenerate.

Do not patch generated output to make a test pass. That hides the real contract
error and breaks future regeneration.

## Tests Required By Coding Changes

For a coding change, choose proportionate tests from:

- default behavior tests;
- override/customization tests proving a later module can change the behavior;
- property override tests;
- status/error definition tests;
- schema/router generated-contract tests;
- permission and API exposure tests;
- tenant isolation tests;
- provider replacement tests;
- import/export checksum and manifest tests;
- startup/restart/runtime topology tests;
- regression tests for affected screens or APIs.

Schema and API changes that touch business ownership or visibility must include
evidence that enterprise association carries business scope and tenant isolation
is enforced through runtime/schema policy context, not copied as domain meaning.

A new or changed extension point is incomplete until at least one focused test
or example proves how it is customized safely.

## Corrective Changes And Recurrence Prevention

When an agreed programme spans related owners, implement it continuously against
its canonical checklist. Use internal dependency and regression checkpoints;
do not turn every helper or route into another approval request. Pause only for
an unresolved material decision or action whose authorization is actually absent.


For unreleased framework changes, migrate current in-repository consumers and
remove superseded routes/adapters in the same batch. Do not create compatibility
aliases based on assumed external users. A real released contract or an explicit
user requirement is necessary to justify backward-compatibility work. Preserve
needed capabilities while replacing their implementation through existing owners.


For each coherent correction or refactor batch:

1. Identify the violated invariant and its existing canonical owner. When an
   existing rule already covers the issue, improve its discoverability or
   enforcement instead of creating a duplicate contract.
2. Update the applicable principle/contract in the same batch. Keep universal
   rules in nSetup and exact capability behavior in the owning module contract;
   link them from the nearest README/AGENTS and examples. Do not leave the lesson
   solely in a conversation, temporary audit or private memory.
3. Correct the source definition and relevant generator/template so newly
   generated code cannot reintroduce the issue. Regenerate derived artifacts;
   never patch generated output as the permanent fix.
4. Add or strengthen a proportionate regression check for the actual failure,
   including rejection, boundary and later-layer customization cases where
   relevant. Prefer demonstrating the failure before the fix. Do not add a
   separate validator or brittle wording test merely because guidance changed.
5. Record the owning rule, changed behavior, evidence and remaining gaps in the
   existing actionable checklist. Distinguish source inspection, focused tests,
   runtime preparation and authenticated live acceptance. Updating a rule or
   passing a limited test does not close unresolved implementation findings.

Apply [Capability APIs And Safe Consolidation](nodics-principles.md#capability-apis-and-safe-consolidation)
when changing API ownership, shared metadata or consumer adapters. Preserve the
existing policy and outcome contracts through the migration, with an explicit
removal condition for temporary compatibility code.

## AI Memory And Decision Pattern

AI tools must build practical working memory from repository authority, not
from private guesses.

For each non-trivial change, remember and reuse:

- which module owns the capability;
- which folder owns each artifact type;
- which existing implementation can be reused or extended;
- which property namespace owns configurable behavior;
- which status definition file owns stable states and errors;
- which generated artifacts come from which source definition;
- which tests prove the default and customization paths.

If the AI finds the same decision repeatedly, promote the durable rule into the
nearest `AGENTS.md`, `llm/contracts`, `llm/examples`, generated context, or
standard. Do not leave important coding knowledge only in chat history.

## Anti-Patterns

Reject these patterns during design and review:

- writing business logic in an arbitrary folder;
- hardcoding tenant, enterprise, environment, server, node, provider, URL,
  database, cache, index, queue, secret, permission, or status values;
- adding direct `tenant` business fields where an enterprise association should
  model owner, operator, issuer, seller, partner, venue, or business visibility;
- placing status/error codes in properties;
- placing configurable policy only in source constants;
- adding a new config file when `config/properties.js` can own a namespaced
  subtree;
- creating a second registry, loader, state machine, scheduler, provider
  selector, or data importer;
- editing generated files directly;
- adding frontend-owned backend import data;
- copying an entire service to customize one function;
- omitting file-level or function-level documentation;
- accepting behavior without default and customization proof.

## Completion Evidence

When coding work is complete, the AI must report:

1. what changed;
2. why the code belongs in that module and folder;
3. how the behavior is configured;
4. how a later module can customize it;
5. what generated artifacts were or were not affected;
6. what tests were run;
7. what documentation or AI guidance changed;
8. any residual risk or missing validation.

## Module-owned UI composition

Apply [module-owned-ui-contribution-contract.md](module-owned-ui-contribution-contract.md) before placing navigation, component properties or workspace definitions. Generic owners publish shared anchors; accelerators contribute their own subtrees through existing registration. Visual placement never transfers data ownership.

## Compatibility and invariant-preserving extensions

An exported implementation is replaceable; the capability's authorization,
tenant and enterprise isolation, domain validation, API shape, confirmation,
idempotency and audit requirements remain mandatory. Arbitrary project JavaScript
is trusted deployment code, so these are extension/review/qualification guarantees,
not a claim that the language prevents bypassing security. Test the effective
later-layer implementation with positive and negative contract cases.

Changing an exported method's parameters, result, async completion, error or
side-effect contract requires consumer impact analysis and a documented migration.
The same rule applies to configuration keys/defaults/merge rules, schema fields
and identities, route permissions and envelopes, event payloads, provider atomicity,
and partner source extension points. Additive changes are compatible only when
existing behavior, validation and old consumers remain valid. A release number
alone does not prove compatibility; use the repository's release governance and
published compatibility matrix rather than inventing a new runtime version store.

Preserve released dataset keys and immutable releases. Changed source identity
or business code does not rename persisted records. Breaking persisted schema,
audience, grant or channel-policy changes require an explicit owner migration,
replay evidence and rollback limits. A code rollback does not undo data effects.
This unreleased programme changes MongoDB `schemaProperties` to keyed booleans;
legacy arrays reject and must be migrated explicitly. Other ordinary property
arrays retain merge-by-index semantics; data-record array merging retains its
separately tested replacement rule. Do not silently generalize either behavior.

See the existing release/upgrade compatibility guide, owning provider contracts,
and nConfig's effective behavior diagnostics. Record the affected consumers,
old/new examples, tests, runtime adoption and remaining deployment gates in the
single actionable record for the change.
