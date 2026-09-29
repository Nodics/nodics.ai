# Customer Project Mode Contract

## Acceptance ownership and upgrade qualification

Asset preparation follows the same boundary: applications own manifests and
selection, while Media owns upload/integrity acceptance. Reuse effective owner
configuration; do not create a parallel manifest registry or promote historical
customer shortcuts into framework defaults. Moving a suite never grants broader
runtime authority: Staged preparation cannot silently import Online content or
replace publication approval, and error text cannot stand in for integrity proof.

Acceptance must never manufacture the authority or persistence state it is meant
to verify. Use secured owner APIs and explicit operation intent; report missing
provisioning as a prerequisite. An extraction must preserve assertions or record
an explicit evidence gap, not silently downgrade live coverage to a mocked PASS.

Framework invariants and their complete reusable acceptance suites belong to the
respective functional modules; reusable industry journeys belong to accelerators.
The customer owns fixtures, selected capabilities, deployment inputs, custom
business policy and tests of its own extensions. Importing a shared helper does
not justify retaining a duplicate framework acceptance implementation in a project.

Apply this classification to individual test assertions, not filenames. Split mixed
tests: generic defaults, rejection rules, lifecycle behavior and upgrade invariants
run with independent fixtures under the owning framework module. Do not make those
tests import a reference customer checkout. Project tests retain selected topology,
customer records, bindings and extension behavior only; application-only fixtures
belong under that application. Consolidate routine framework-command adoption into
one small project test instead of one wrapper per capability. Reusable test drivers
and configuration consumers stay framework-owned. A migration must preserve each
assertion through a moved test or an identified existing owner test, and update
test entrypoints so the retained checks continue to run.

Extraction is incomplete until the moved owner tests are reachable from the
framework's declared release suites and retained customer checks are reachable
from the project's verification entrypoint. Guard that reachability with an
owner-level regression; a one-off direct test invocation is not CI adoption.
Customer CI must select an explicit compatible framework commit and fail closed
when that selection is absent. Record the tested commit separately from local
uncommitted evidence; do not silently fall back to a feature or default branch.

Canonical suites use the existing tooling command registry with
`acceptanceContract: true`. Customer layers may supply supported inputs and add
checks, but may not replace these commands or their required assertions. Runtime
API authorization, tenant isolation, lifecycle and release-integrity enforcement
remain mandatory independently of acceptance. Ordinary runtime extension rules
are unchanged; qualification evaluates the resulting implementation.

Upgrade/release processes must run the target framework version's canonical gates
against the customer's effective composition and retain explicit compatibility
failures. Customer-owned journey tests supplement, not replace, those gates.
Local ownership checks cannot prevent a repository owner from skipping tests or
forking dependencies; organizational CI/release enforcement remains necessary.
No source migration alone constitutes production or upgrade certification.

This contract applies to every implementation partner, customer developer,
Nodics application team, and AI tool building on Nodics, across all domains.
It implements the ownership principle in [nodics-principles.md](nodics-principles.md).

## Token Optimisation

Every customer project and partner AI tool must follow
[Token Optimisation And Proportionate Execution](nodics-principles.md#token-optimisation-and-proportionate-execution).
Reference the framework principle from project guidance instead of copying it.
Validate the affected project boundary and consumed dependency version; do not
repeat framework-wide checks merely to commit customer-owned changes. Required
project release, security and exact-commit CI gates still apply.

## Partner Write Boundary

Partners write only to their customer-owned backend and frontend repositories.
Nodics framework and accelerator source are immutable dependencies during
partner implementation. Access to a local checkout, a writable dependency, or
an AI tool does not grant framework-maintainer authority.

Do not edit, patch, fork for application customization, vendor-copy, or generate
changes into `nodics.ai`, its accelerator modules, or installed Nodics source.
Do not use install hooks or runtime monkey patches to circumvent this boundary.
Read published contracts and supported extension documentation; targeted
read-only source inspection, when available and needed, does not authorize edits.
Project generators must target project-owned output locations. Framework-wide
generation, audits, and requalification are outside application work by default.

An application requirement or partner approval cannot convert this scope into
framework-maintainer work. The Nodics team owns framework and accelerator
changes through a separate contribution/request channel and reviewed release.
An explicitly authorized Nodics-maintainer task can change those sources under
the framework contribution and validation contracts; this is a separate work
scope, not an escalation granted by a partner application task.

## Ownership And Dependency Direction

Classify behavior by its business meaning and stable assumptions, not by its
first caller, current customer, or possible future reuse.

| Layer | Owns | Change authority |
| --- | --- | --- |
| Framework functional module | Generic capability, schemas, lifecycle, invariants and standard reference data | Nodics team |
| Domain accelerator | Reusable domain-specific orchestration, presets and reference data over existing framework capabilities | Nodics team |
| Customer project/application module | Customer identity, experience, policies, integrations, data contributions and specific functionality | Customer or implementation partner |
| Customer frontend | Presentation and interaction consuming authorized backend contracts | Customer or implementation partner |

The dependency direction is customer project -> domain accelerator -> framework
capabilities. A project may also consume framework capabilities directly. A
framework module must not depend on an accelerator or customer project; an
accelerator must not depend on a customer project. No customer name is required
by a reusable module contract.

Keep related capabilities with their existing owners: Profile owns identity,
Location owns location capabilities, Media owns files, Loyalty owns wallet and
reward operations, and Commerce owns checkout and orders. Domain orchestration
composes their contracts without taking over their persistence or lifecycle.

### Mechanism and policy extraction

Keep customer modules and runtimes lightweight. Classify each algorithm,
configuration block, descriptor and script separately. An application-owned file
may contain reusable behavior that should be contributed to its functional or
accelerator owner; this does not transfer ownership of the application itself.
Apply the lightweight customer modules and runtimes principle in
`nodics-principles.md`.

Nodics-maintainer extraction must leave one implementation and preserve customer
policy as explicit inputs: identifiers, valuation rates, provider selection,
release subsets, trust origins and enablement are not reusable defaults simply
because the underlying mechanism is reusable. Use existing owner metadata where
it already describes structural facts; do not duplicate it in project scripts.
Retain deployment routing, permission gates and deliberate compatibility pins.

A retained compatibility snapshot must name its dependency, reason, affected
persisted identities and review trigger. It is not a permanent exemption from
ownership review. Moving source must not reassign installed contribution owners,
rewrite immutable checksums, rename historical business keys or discard pending
workflow instances. Separate source extraction from migration execution and
record both states. A passing isolated test does not establish installed release
history. Consult owning APIs for that evidence; do not query database collections
or infer an empty installation from unavailable authentication.

Acceptance must cover the original application, an unrelated policy or customer
context, invalid/missing input, authorization rejection, later-layer overrides
and affected runtime loading. Record live acceptance separately from isolated
contracts. A wrapper, line-count reduction or renamed namespace alone does not
prove correct ownership. Partners request these reusable changes through the
contribution channel; this rule grants no new framework write authority.

## Schema Ownership And Data Contributions

### Classify applications before moving source

The following are customer applications in nodics.kickoff, each consuming a
separate reusable accelerator:

| Customer application | Reusable accelerator |
| --- | --- |
| agora.apparel | apparel |
| agora.electronics | electronics |
| agora.telco | telco |
| circa.ewaste | eWaste |

Application configuration, BackOffice initialization profiles, branding, catalogues,
media and importable data stay with the application in the customer repository.
Data-only packaging, sample/reference status, Nodics authorship and module `extends`
do not promote the application into an accelerator. Sample data describes lifecycle,
not source ownership. A profile displayed under an Accelerators heading still
belongs to its actual application owner.

Before extraction, record the established owner and identify the exact reusable
domain behavior that works without application identity or policy. Extract only
that behavior through the maintainer contribution process. Preserve application
modules and their later-layer configuration. Relocating an entire application
requires an explicit ownership decision; do not infer one from a request to clean
up configuration. Test framework-only discovery, customer discovery and effective
runtime selection to prevent customer packs leaking into framework ownership.

The module owning a business concept owns its canonical schema and operations.
A later layer contributes records, supported schema fragments or configured
policy without creating a parallel schema, ledger, registry, loader or authority.
Source data ownership and runtime persistence ownership are distinct: customer
sample or business data can live in a project data pack while being imported
and persisted through the owning framework schema and governed APIs/services.

Keep generic reference data in its framework owner, domain-common presets in
the accelerator, and customer-specific data in the customer project. Use the
existing manifest, import, validation and publication lifecycle for each data
contribution; frontend repositories must not become backend-import data owners.

## Supported Customization

Reuse existing capabilities first. Apply the smallest supported project,
environment, server, node, tenant or provider contribution second: layered
properties, module extension, schema fragments, mergeable services, routers,
pipelines, interceptors, providers, data packs and project-owned tests.
Add new project functionality only when existing contracts cannot express the
customer requirement. Declare dependencies and supported load/override order.

Define a default once at its correct owner and override only intentional
differences. Every override must preserve authorization, isolation, validation,
explicit approval where required, lifecycle integrity, idempotency, auditability
and recovery contracts. A configurable policy is not permission to bypass an
invariant. Do not copy an entire framework implementation to change one method.

## Separate Contribution And Release Channel

When a missing capability or extension point may benefit other applications:

1. Record the requirement, current Nodics version, affected owner and supported
   extension points examined. Include a minimal reproduction or acceptance
   example, proposed scope, compatibility/security impact and project workaround
   if one can preserve existing contracts. Exclude secrets and customer data.
2. Submit that proposal through the separate Nodics contribution/request channel
   agreed for the engagement. This contract does not invent an endpoint or grant
   repository access. AI tools prepare the proposal; sending it requires the
   user's authorization.
3. The Nodics team decides whether the capability belongs in a framework module,
   domain accelerator, existing extension point, or only the customer project.
   Nodics owns generalization, implementation, tests, documentation, compatibility
   review, versioning and release.
4. The partner adopts the released version through declared dependencies and
   validates its effective project behavior and upgrade path. Remove any
   superseded project extension after proving equivalent behavior, preserving
   data migrations and existing references.

Promotion is never an automatic partner action. Move implementation, tests,
documentation and data ownership together under Nodics review; retain one
canonical authority. If no supported extension can meet a requirement safely,
mark that requirement blocked pending a Nodics decision or release and continue
independent project work. Do not silently patch the dependency.

## Reference Adoption Example

A partner can use `nodics.kickoff` as a starter and its `circa.ewaste` application
as a reference, then create its own application identity such as `i2e.ewaste`.
The resulting project consumes the Nodics-owned `eWaste` accelerator and
`nodics.waste` framework capability. These names illustrate the general rule;
they are not mandatory identities for other projects or domains.

- Generic waste submission and verification belong in `nodics.waste`.
- Electronic-device taxonomy and reusable e-waste journeys belong in `eWaste`.
- I2E branding, collection policy, integrations and customer-specific data belong
  in its own project module. Circa-specific equivalents stay in `circa.ewaste`.
- A project waste-category record uses the existing owning schema. A reward
  formula can be project policy while Loyalty remains the wallet authority.
- A reusable missing e-waste extension is proposed to Nodics; the partner does
  not edit the accelerator even when the checkout is locally writable.

## Acceptance Evidence

Before delivery, identify the owning repositories and layers, dependencies,
extension points and intentionally overridden defaults. Show that the change
set and generated output remain within the authorized ownership boundary.
Prove successful customization and relevant rejection, isolation, retry and
failure/recovery behavior through project tests against supported contracts.
Record the consumed Nodics version, pending contribution requests, upgrade
constraints and any blocked functionality without claiming it is implemented.

Framework maintainers separately prove default and later-layer customization
behavior and update the owning contracts and generated guidance on release.
The nTooling principle audit checks that these governance clauses remain
discoverable; it does not enforce filesystem permissions or repository ACLs.

### Whole-project Ownership Review

Apply ownership review to every domain, runtime, script, test helper and
configuration namespace, not only the currently selected application.
Cross-project domain behavior belongs to its functional module; reusable
industry composition belongs to the respective accelerator. Cross-domain
mechanics belong to the existing Foundation owner. Customer identities, policy,
release selections, fixtures and integration bindings stay in the application.

Keep `kickoffApi` and `kickoffInt` as intentional customer extension templates,
even when minimal. Agora and Circa are customer applications consuming
accelerators, not framework accelerators themselves.

Before relocation, prove effective configuration and override behavior, preserve
activation and authorization boundaries, and check installed release provenance.
Do not rewrite immutable releases, weaken ownership checks or promote direct
database access merely to reduce the customer project's file count. Record
migration prerequisites in the project's canonical acceptance checklist.
