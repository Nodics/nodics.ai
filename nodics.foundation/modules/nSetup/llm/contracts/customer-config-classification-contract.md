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

Every configurable property's reusable default belongs to its owning framework capability (or its established reusable domain owner). Customer projects extend those values only when a partner intentionally changes behavior or supplies application identity/selection. Derive structural facts from the existing module metadata and validated file/manifest contracts instead of making each partner repeat them. Preserve explicit activation, authorization and publication choices; folder presence never grants execution authority.

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
6. Ordinary arrays retain positional merge compatibility. An omitted key is
   inherited, not deleted. Use nConfig `replace` for complete object/array
   selections and `keyed` for identity-based changes and explicit removals.
   Verify nested, empty, shortened and reordered collections through the
   actual consumer. Never silently change every array's semantics.
7. Defaults must remain customer-neutral. Do not silently opt users into a
   provider, feature, network destination, data import or destructive operation
   while simplifying configuration.

## Structural facts and repeated deployment values

- Do not add the selected environment, server or node to
  `activeModules.modules`; nConfig activates these from the selected topology.
  Additional capabilities, application modules, providers and functional groups
  remain explicit selections. Folder presence never activates an unrelated peer.
- Inherit an unchanged environment connection in server properties. Keep the
  server's isolated database name or actual connection exception. Module database
  entries may select participation; do not delete them merely because they are
  empty or inherit the default connection.
- Declare each deployment endpoint once in the owning server properties.
  Aliases reference the canonical value through nConfig bindings and retain their
  own `remoteOnly`, advertised endpoint and protocol restrictions. Never infer
  hosts, ports, credentials, authority or publication policy from a module name.
- Remove unchanged general capability defaults. Retained equal authentication,
  API exposure, provider qualification or compatibility pins must identify their
  purpose and the deployment/qualification change that requires review.
- Generation and review must follow the same rule. Correct the existing
  generator/template when it recreates redundancy; do not add a second loader,
  registry or universal string-based rejection of legitimate explicit policy.

References resolve at their contribution boundary. A later node/tenant override
changes the actual consumer key; editing an earlier binding's source after
resolution does not retroactively refresh aliases. Test both the canonical
server change before resolution and the later consumer override.

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

## Consumer defaults and collection acceptance

A capability owns its explicit route-category default, technical target/profile mechanics and inert model inventory. Environment owners supply shared endpoints/provider policy; servers select participants, authority contexts and real exceptions. Remove proven repeated values only after comparing actual consumer resolution, including selected modules, database/search configurations and reset scope. Keep module entries that act as activation selections.

Use the existing nConfig `replace`/`keyed` vocabulary for ordered or scoped collections; do not silently change all arrays. Test shorter, reordered and empty selections, nested replacement, identity removal, node/tenant overrides and failed-update atomicity. Source-shaped tests that expect copied declarations are not evidence of effective inheritance.

Reuse existing manifests, registry descriptors, profile templates and connection aliases. An unavailable metadata owner must not produce invented package facts; framework defaults must not introduce local-only profile execution or customer commercial offers. Each correction updates the nearest owner contract, example, regression and public documentation before completion.

Before closing a configuration correction, pass the
[mandatory ownership, placement and scope review](ai-coding-and-customization-contract.md#mandatory-ownership-placement-and-scope-review).
Record the complete scoped configuration inventory, retained-equality reasons,
effective consumer checks and exclusions. Resolving an enumerated issue list
must not be reported as proof that every repository file is correctly placed.


## Completion requires property ownership, not only equality

A configuration refactor must classify every declaration in its agreed inventory:
reusable capability default, intentional customer/application choice, environment
value, server selection/exception, or explicit safety pin. Include consumer-level
inheritance: default database/search connection merging and capability-specific
collection extensions can eliminate copied values that a raw property comparison
misses. Use the owning capability's extension contract for collection differences;
for example nRouter's CORS header override maps preserve its baseline.

A value being different from today's framework default does not make it a new
framework default: local security relaxations, sample execution, provider choices,
authority, databases and endpoints remain deployment policy. Conversely, equality
is not a blanket reason to keep a pin. Record the specific negative role/provider
selection and review trigger when an equal value must remain explicit. Check
inactive-owner declarations and remove inert leftovers instead of activating a
capability solely to justify its configuration.

Before completion, report both the complete declared scope and the consumer
results; identical snapshots or touching every file alone do not establish correct
ownership. Distinguish raw representation changes from effective behavior and
record any remaining finding in the existing checklist.


Browser-origin construction and standard Nodics application origins belong to
nRouter. Inherit enabled CORS and standard ports; deployments declare differences
through `httpHardening.cors`. Frontend
commands, repository paths, process readiness and UI tests are prohibited in
backend properties. A security origin is an API trust decision, never a frontend
lifecycle dependency. Preserve denials when a permitted address changes.

## Framework coding restrictions for configuration ownership

These are mandatory implementation and review rules across framework, accelerator,
customer, environment, server and node configuration, including generators.

- Local infrastructure baselines belong to their framework providers. Elasticsearch
  owns `http://localhost:9200`; a Local customer inherits it. Another environment
  supplies an address only when it differs. Apply the same ownership test to
  database, cache, HTTP, logging and search defaults. MongoDB owns `masterLocal`
  and `testLocal`; retain server/tenant isolation overrides. Redis provider options
  own `localRuntimeAuth`; enabling Redis alone does not require copying that prefix.
  Retain intentional deployment namespace overrides. A Local environment name
  never justifies copying framework defaults into a customer file.
- Do not create, require or regenerate `nodics.environment.json`. Existing module
  `package.json` metadata and layered `config/properties.js` remain authoritative.
  Tooling may project launch/acceptance/container inputs from those contributions;
  it must not persist another topology or configuration descriptor.
- Declare ports in their owning server endpoint. Use nConfig `runtime` bindings
  for selected peers and `ref` for ordinary property reuse. Do not maintain
  `configurationValues.remoteEndpoints` or a duplicate authentication-policy map.
  Module/server identity and package versions come from existing metadata.
- Optional application composition belongs in `activeModules.compositions` and
  is read only by an explicit composition selection. A cron-only or website-only
  project does not need an Agora declaration. Provider activation remains an
  explicit runtime selection; a connection URL does not activate an adapter.
- Use `environment.class` for deployment classification. Do not infer it from a
  name, hostname or request, or repeat it under each capability's policy.
- Trusted browser origins belong in explicit `httpHardening.cors` security policy;
  nRouter constructs origins and owns standard headers and credential behavior. Retain server-specific denials,
  explicit disablement and genuine deployment overrides. CORS never grants API
  permission, changes tenant authority or permits wildcard credentialed origins.
- Customer projects may explicitly configure `bootstrapIdentity.adminPassword`
  in project properties; later environment/server/node layers may override it.
  This direct customer-owned value is the sole literal-credential audit exception.
  nAuth still enforces password strength and distinct admin/service credentials.
  Framework defaults, JWT secrets, API-key peppers, service passwords/keys and
  predictable binding fallbacks must use nConfig secret inputs. Do not publish
  credential-bearing customer files. Bootstrap provisioning and current runtime
  proof have distinct lifecycles; runtime proof never falls back to the admin.
- A cleanup must preserve credential rotation/revocation, strict distributed auth
  state, runtime grants, import authorization, destination checks and immutable
  release receipts. It must not weaken a security policy to remove configuration.
- `project:validate` and `ai:principle-audit` reject retired descriptors/bindings,
  duplicate endpoint/authentication catalogues and literal authentication secrets,
  except the direct customer administrator bootstrap override described above.
  Static gates do not replace effective-configuration and ownership review.

Framework baselines now include info logging, remote event publishing disabled,
search database fallback disabled, secured service-registry exposure, and
operator-available Sample releases. Only Init can execute automatically at
startup. Deployments may intentionally disable Sample operations; authorization,
release scope and receipt checks remain mandatory for every manual invocation.

## Acceptance and accelerator source ownership

Reusable acceptance defaults belong in each owning capability's `tooling.acceptance`
and are read by the existing non-runtime nTooling entrypoint. Do not place a shared
acceptance catalogue in every environment. Select runtime descriptors from declared
roles/metadata; keep customer journey choices and real deployment deltas local.
Accelerator reference content and its product-specific defaults are Nodics-owned;
customer-specific content remains in customer overlays. Moving an immutable pack
preserves its module/release identities, versions, payloads and checksums, and
updates explicit source consumers without keeping a second copy or adding another
importer. A framework group must never acquire a dependency on an accelerator.
