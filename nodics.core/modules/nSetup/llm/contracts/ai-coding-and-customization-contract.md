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

If the AI cannot explain where the code belongs, it must not place the code
arbitrarily. It must inspect the module contract, sibling modules, source
patterns, and nSetup standards until ownership is clear. If ownership remains
unclear, stop and report the design gap.

This gate applies equally to refactoring and documentation/guidance changes.
Moving guidance, adding a tool bridge, changing a validator, or creating an LLM
contract still requires the AI to decide what changes, where the authority
belongs, and how future tools will discover and apply it.

## Reuse, Customize, Then Create

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

Small helper functions may be private when they are purely local implementation
detail and are not a reasonable customization point. If a helper contains
business policy, provider behavior, validation decisions, routing decisions, or
security decisions, export or move it behind the correct Nodics extension
point.

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
| Event declarations and listeners | `src/events/events.js`, `src/events/listeners.js` |
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
 *  Copyright (c) 2026 Nodics All rights reserved.
 *
 *  This source code is licensed under the license found in the
 *  LICENSE file in the root directory of this source tree.
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

A new or changed extension point is incomplete until at least one focused test
or example proves how it is customized safely.

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
