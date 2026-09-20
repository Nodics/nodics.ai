# Customer Project Mode Contract

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

## Schema Ownership And Data Contributions

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
