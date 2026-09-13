# Customer Configuration Classification Contract

## Principle: inherit defaults; declare intentional differences

A customer must not maintain a copy of Nodics configuration to use Nodics.
Every configurable value has one authoritative owner. Environment, server and
node `config/properties.js` files contain only deployment choices, composition,
and justified differences from the effective inherited configuration.

This rule covers the entire authored dependency chain. Replacing a large
`properties.js` with an import of an equally large environment helper does not
satisfy it. Do not optimize line count by hiding values, adding a parallel
loader, or weakening validation. A small file is an outcome of correct ownership.

## Strict boundary across every framework layer

Apply the [existing layers and project independence principle](nodics-principles.md#existing-layers-and-project-independence).
No framework or accelerator layer may contain project-specific configuration.
This includes executable fallbacks, helpers, templates, generators, service or
router metadata and non-runtime tooling, as well as `config/properties.js`.
An overridable project-specific default still violates the boundary.

Use existing customer and deployment configuration owners for actual store,
site, catalogue, profile, package, endpoint and environment choices. Framework
commands consume project/environment/server/node parameters and authoritative
metadata without embedding a sample project or imposing its application names.
Synthetic test fixtures and clearly labelled documentation examples must remain
isolated from shipped runtime defaults and universal tooling decisions.

Do not invent another configuration layer, wrapper authority or registry to
relocate these values. Reuse the established owner and contribution contracts.
Required operation context must be validated; a placeholder store identity is
not a valid substitute for missing context. Framework-neutral technical and
domain defaults remain with their existing owners.

## Classification

| Class | Owner and placement | Examples |
| --- | --- | --- |
| Reusable capability default | Owning framework capability `config/properties.js` | Cookie names, catalogue limits, provider-independent operational defaults |
| Domain default | Owning reusable accelerator module | Domain vocabulary and reusable domain policy |
| Customer/application policy | Owning customer module `config/properties.js`, or its established contribution contract | Chosen application profiles, customer store identity, project data-package selections |
| Shared project administration policy | Explicitly selected customer administration module | Cross-application installation descriptors consumed by the administrative runtime |
| Environment difference | `envs/<environment>/config/properties.js` | Deployment endpoints, shared CORS policy, secret references, environment logging |
| Server difference | `envs/<environment>/<server>/config/properties.js` | Active modules, listening ports, isolated database names, peer targets, runtime authority |
| Node difference | Selected node `config/properties.js` | Instance port or operational difference; inherit the server's functionality |
| Runtime state | Existing tenant/persisted configuration authority or generated runtime directories | Governed runtime changes, logs, temporary output; never copied into authored defaults |

Customer sample identifiers, credentials, local paths, hostnames and business
policy must not become framework defaults. Equality with an existing framework
value is not proof of correct ownership: correct a misplaced sample default and
preserve the customer's explicit setting during migration.

## Effective inheritance, activation and ordering

nConfig remains the sole runtime configuration-loading authority. It loads its
base configuration, then active module properties in module index order, then
configured external properties. Tenant and persisted runtime configuration use
the existing later mechanisms. The selected topology chain is project,
environment, server, then optional node; concrete indexes must preserve that
order.

For each default moved to a module, prove that the owner is active on every
intended server and that its index precedes every intended override. A
configuration module does not get special precedence because its name contains
"defaults" or because it lives under `modules/`. Do not activate unrelated
capabilities to make their defaults available. A shared administration module
must remain scoped to the administrative runtime that selects it.

Configuration presence does not grant authority, install data, activate a
functional module, or enable reset. Those decisions retain their existing
contracts and explicit gates.

## Foundation tooling and parameterization

Use Foundation's existing non-runtime nTooling boundary for reusable project
commands, templates and parameterized preparation/validation behavior. Use
nSetup for the corresponding principles and contracts. Pass project root,
environment, server and optional node through the established command context;
resolve canonical identities from their existing metadata owners.

A non-runtime package does not contribute properties to nConfig merely because
Foundation is extended. Tooling configuration is consumed by its explicit
entrypoint; runtime defaults remain with active capabilities. Do not introduce a
new Foundation module, registry or runtime loader when nTooling/nConfig already
own the capability. Customer application choices remain customer-owned even
when generic tooling resolves or validates them.

## Minimal configuration requirements

1. Inherit a framework default when it expresses the intended policy. Retain an
   equal value only for a documented compatibility or security pin, with an
   owner and review trigger.
2. Put shared environment differences at the environment boundary. Put shared
   customer policy at its customer module boundary, selected where needed.
3. Keep activation lists, deployment targets, secrets and runtime authority in
   the appropriate composition/deployment layer. Do not hoist local opt-ins,
   reset allowlists or model inventories into globally enabled defaults.
4. Keep application data descriptors with their existing application or
   contribution owner. Cross-application administrative composition may own a
   shared descriptor only when activating the content/application module would
   otherwise load unrelated runtime capabilities. It must not copy application
   service code, data records or orchestration.
5. Use the standard `config/properties.js` and established contribution
   contracts. Do not introduce a sibling default/configuration registry or
   executable builder solely to shrink an entry file.
6. Do not assume arrays replace inherited arrays. Current nConfig uses Lodash
   `merge`, which merges array positions and can retain trailing entries. An
   omitted key is inherited; omission does not delete a key. Use an existing
   capability-specific removal contract where available, or retain the full
   intended declaration and verify the effective result.
7. Defaults must remain customer-neutral. Do not silently opt users into a
   provider, feature, network destination, data import or destructive operation
   while simplifying configuration.

## Required implementation evidence

Before editing, identify the owner, consumers, activation/index order, relevant
configuration keys and security/deployment boundaries. Record the baseline
without exposing secrets. After editing:

- compare prepared effective configurations across the affected environments,
  servers and relevant optional compositions;
- account explicitly for intentional module-graph changes;
- test a later override, an unselected runtime, safety gates and relevant array
  behavior;
- run focused capability, topology and project acceptance checks;
- generate and validate affected documentation and AI context;
- document migration, rollback, exact commands and the difference between
  preparation checks and live acceptance.

Review must reject newly embedded customer/deployment choices, a new parallel
layer or authority, and a consumer-specific duplicate API. Verify at least two
unrelated application contexts where the change affects context resolution,
plus missing/invalid context and authorization rejection. Existing violations
must be recorded for correction, never copied as an implementation pattern.

A snapshot of authored files alone is insufficient evidence of runtime
inheritance. A line-count reduction alone is insufficient evidence of a lighter
customer project. Preserve existing unrelated changes, and report pre-existing
validation failures separately.

## Documentation and future generation

Explain the user outcome before the ownership table, then the smallest working
example, supported customization, operational consequences, failure/recovery
and verification. Distinguish required inputs, inherited defaults and optional
advanced overrides. New module/environment/server/node implementations and
code review must apply this contract together with
`module-structure-contract.md` and `../standards/module-generation-guide.md`.

Use Foundation's installed `nodics` command for generic start/build/clean targets.
Customers declare a compatible dependency and optional npm conveniences, not a
copied `.env`/framework-resolution/spawn dispatcher. Existing nTooling owns the
bridge, command registry and project/environment/server/node resolution. See
[the command contract](../../../nTooling/llm/contracts/README.md#installed-project-command).

Use nConfig's explicit [declarative property bindings](../../../nConfig/llm/contracts/configuration-inheritance-contract.md#declarative-property-bindings)
for environment values, selected-runtime paths and conditional composition. Keep
shared deployment values at their existing environment layer and reference them
from server deltas. Validate resolved settings through nConfig; direct `require`
returns the declaration and does not establish runtime behavior.
