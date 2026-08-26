# Customization and extension guide

Nodics is built for customization, but customization must happen in the right
owner. The safest path is to reuse an existing capability, configure it, extend
it in a later-loaded module, and create new framework behavior only when the
existing contract truly cannot satisfy the requirement.

For a beginner, customization means “where should I put my change so I can
still upgrade the framework later?” The safest answer is usually configuration
first, then a customer project module, then a customer extension module, and
only then a framework change if the behavior is truly reusable for everyone.

## What this is

This guide explains how a customer or partner changes Nodics behavior without
turning a customer project into a fork of the framework. It applies to backend
customization, Axis presentation customization, and documentation ownership.

## The customization ladder

Start with the least invasive option:

1. Use existing behavior.
2. Change configuration in the correct project, environment, server, node, or
   tenant scope.
3. Add customer project modules under the customer project.
4. Add a customer extension module that extends a framework functional module.
5. Create a new implementation only when the existing capability contract is
   missing or incorrect.

This ladder protects upgradeability. The later a customization loads, the more
specific it is. Framework modules stay reusable; customer modules carry
customer decisions.

| Customization level | Who should use it | Beginner example | Upgrade risk |
| --- | --- | --- | --- |
| Axis/WCMS content | Business user or content admin | Change a heading, image, documentation page, or dashboard card. | Low, because backend content is governed and versioned. |
| Project configuration | Developer or operator | Change a local port, database name, or feature override for one environment. | Low when the property stays narrow. |
| Project module | Developer | Add Kickoff-specific schema fields or business services. | Medium, because tests must prove the behavior. |
| Customer extension module | Senior developer | Override Platform behavior while keeping the Platform functional identity. | Medium to high, because service precedence must be explicit. |
| Framework module change | Framework team | Improve Core import behavior for every project. | Shared release risk, so it needs broader validation. |
| New functional module | Architecture owner | Add Commerce, Workflow, or another independent capability. | High if ownership is blurry. |

```mermaid
flowchart TD
  Need["Need to change behavior or content"] --> Content{"Can Axis/WCMS governed content solve it?"}
  Content -->|Yes| Wcms["Update backend-owned CMS data"]
  Content -->|No| Config{"Can configuration solve it?"}
  Config -->|Yes| Props["Add narrow project/environment/server property"]
  Config -->|No| Project{"Is it project-specific?"}
  Project -->|Yes| Module["Add project or customer extension module"]
  Project -->|No| Framework["Change the owning framework module with tests"]
```

## The role an AI tool or developer must play

Nodics is too broad for a narrow “make the code pass” mindset. A developer or
AI assistant working on Nodics must deliberately switch through several
perspectives before changing files. This is not ceremony; it is how the
framework avoids accidental shortcuts that work for one screen and break the
ecosystem.

| Role | Question to ask before coding | Example |
| --- | --- | --- |
| Business analyst | What problem is the user, operator, partner, or business evaluator trying to solve? | If the request is “register Cron,” explain the lifecycle and what business capability becomes available, not only the button click. |
| Enterprise architect | Which module, runtime, tenant, security boundary, and release unit owns this behavior? | Module registration is Platform/BackOffice state; Axis renders it; Cron only reports its runtime availability. |
| Nodics framework expert | Is this Core, Platform, WCMS, Cron, Axis renderer, customer project, or customer overlay work? | A documentation content pack belongs in the backend owner, not in the frontend repository. |
| Domain expert | Could this pattern apply to commerce, telco, logistics, content, workflow, or another domain without becoming domain-locked? | A media picker should be reusable for product media, CMS media, and workflow attachments. |
| Principal engineer | Can configuration or extension solve this before new framework code is written? | Prefer a server property, content component property, or customer module overlay before editing a framework default. |
| QA and tester | What small failure will a user notice after the happy path succeeds? | Register/activate/deactivate buttons must refresh state immediately without forcing login or page reload. |
| TechOps/DevOps reviewer | How will this run, restart, roll back, and be diagnosed in local and production topology? | A fresh bootstrap script must drop only named local databases and refuse to run if unrelated servers occupy the expected ports. |

If these roles point to different answers, document the trade-off before
implementation. For example, a browser-only workaround may be fast, but if the
real authority is a backend registry, the correct fix belongs in the backend
contract or typed client flow.

## Coding principles that protect customization

Nodics code should be written so customer projects can extend it without
copying framework files. Use these rules as the practical checklist:

1. Prefer configuration first. If behavior can be changed through properties,
   feature metadata, content component properties, server/environment deltas, or
   tenant configuration, do that before changing code.
2. Put files in the owner that matches the behavior. Error/status definitions
   belong in status-definition files, API exposure belongs in owning module
   properties, runtime topology belongs in server configuration, and renderer
   code belongs in Axis.
3. Keep JavaScript export-friendly. Prefer small exported functions, services,
   and configuration objects over sealed inline behavior, so a later customer
   module can override or compose the behavior through Nodics loading.
4. Document the file and exported behavior. An AI tool may read only the
   nearest file and `AGENTS.md`, so ownership, override path, side effects, and
   test expectations must be visible.
5. Treat generated data as output. If CMS documentation, import manifests, or
   generated records are wrong, fix the source and regenerate; do not hand-edit
   generated projections.
6. Keep public and private configuration separate. Browser-visible values,
   runtime coordinates, secret references, and actual secrets have different
   owners and different storage rules.
7. Test both the owner and the integration. A service override needs focused
   tests; a runtime graph change needs startup/acceptance tests; a frontend
   state change needs UI or smoke coverage.

## Backend customization

Backend behavior belongs in the backend project or module that owns the
business rule. In Kickoff, project modules live under `modules/`, while
environment and server composition live under `envs/`.

A customer module such as `kickoff.platform` may extend `nodics.platform` to
customize Platform services. The runtime server can load the customer extension
after Platform. Service precedence then follows the normal module merge and
index order. Axis should still display the functional capability as Platform,
because the customer extension changes implementation, not the business-facing
identity.

## Axis customization

Axis is the browser application. It owns renderers, interaction behavior,
layout, accessibility, and static recovery. It must not own imported CMS data,
backend schemas, permissions, or business rules. If a customer needs a new
BackOffice page, the backend should expose the authorized navigation,
capability metadata, API contract, and CMS content where applicable. Axis then
renders that authorized contract.

Simple presentation changes, such as logo, copy, theme, or demo content, should
come from backend-owned CMS or configuration where possible. Hard-coding those
values in the frontend makes later customer projects harder to support.

## Choosing the right customization mechanism

Use the smallest mechanism that honestly solves the requirement. This keeps
customization cheap, testable, and upgrade-friendly.

| Requirement | Preferred mechanism | Why |
| --- | --- | --- |
| Change a label, image, logo, or help text | Backend-owned CMS content or configuration | Business-facing content should not require a frontend fork. |
| Change a runtime value per environment | Environment/server/node property override | Keeps the framework default reusable and the local deployment explicit. |
| Add a customer data seed | Customer project data pack | Data belongs to the project that owns it and can be imported through governance. |
| Add a new API behavior for a customer | Customer project module or customer extension module | Keeps customer code later in the runtime graph. |
| Change a framework service algorithm | Later-loaded service override with tests | Preserves the functional module identity while replacing implementation. |
| Add a reusable capability for many projects | New or existing framework functional module | Avoids hiding reusable platform behavior inside one customer project. |
| Add a browser-only interaction | `nodics.axis` renderer change | UI behavior belongs in Axis only when backend authority already exists. |

If the preferred mechanism feels too small, prove why. A service override may
be needed, but it should not be the first answer when a property or data pack
is enough.

```mermaid
flowchart TD
  Need["Customization need"] --> Config["Can config/content solve it?"]
  Config -->|Yes| UseConfig["Use property, CMS, or data pack"]
  Config -->|No| Project["Is it customer-specific?"]
  Project -->|Yes| Later["Use project or customer extension module"]
  Project -->|No| Reusable["Is it reusable framework behavior?"]
  Reusable -->|Yes| Framework["Implement in owning framework module"]
  Reusable -->|No| Reconsider["Re-check ownership and requirement"]
  Later --> Test["Add default, override, and regression tests"]
  Framework --> Test
  UseConfig --> Validate["Validate runtime result"]
```

## Worked example: changing a demo company identity

Suppose a partner wants the local demo to show its own company name, logo, and
welcome message. The wrong path is editing Axis React code or framework
Profile services. The correct path depends on what is being changed:

1. If it is presentation content, put it in the owning WCMS or project content
   pack.
2. If it is an environment default, place the override in the customer
   environment/server configuration.
3. If it is project documentation, update the customer project documentation
   source and regenerate the customer docs pack.
4. Import the generated pack through Axis Imports and Exports.
5. Verify Axis renders the new values from backend delivery contracts.

The business sees a custom experience. The developer avoids a fork. The
operator can rebuild the environment from source-controlled project data.

## Worked example: overriding a service safely

Suppose a customer needs a different employee onboarding rule than the
standard Platform behavior. That is not a reason to rename Platform or copy
the entire module. The safer model is:

1. Identify the Platform service that owns the rule.
2. Confirm the extension point is intended to be overridden.
3. Create a later-loaded customer module that extends Platform behavior.
4. Export the replacement or composed service in the expected loader-visible
   style.
5. Keep status/error definitions in the correct status-definition file, not in
   a random properties file.
6. Add tests for the default rule, custom rule, rejected request, tenant
   boundary, authorization boundary, and regression risk.
7. Document the custom behavior in the customer project, not in reusable
   framework documentation unless the extension point itself changed.

The module registry should still show Platform. The customization changes
implementation, not the business-facing functional identity.

## Business and DevOps impact

The business value of this discipline is lower long-term cost. A customer can
receive framework upgrades without reapplying hidden edits. DevOps teams also
gain a clean release story: framework packages, customer modules, environment
properties, and imported content packs can be rolled forward or backward as
separate operational units.

For production support, every customization should answer three questions:
which module owns it, which runtime loads it, and which test or document proves
the intended behavior? If those answers are missing, the customization is not
ready for a production release.

## Documentation customization

Documentation follows the owner of the thing being explained:

- framework guidance goes to `nodics.docs`;
- Axis product guidance goes to `nodics.platform/modules/axis`;
- project guidance goes to the owning customer project, such as
  `nodics.kickoff`;
- generated content records stay under `data/core/data/documentation`;
- each data owner keeps typed release sections in `data/manifest.json`.

Do not put customer project documentation into `nodics.docs`, and do not put
importable documentation records into `nodics.axis`.

## Common mistakes

- Editing framework source for one customer.
- Adding business authorization in the browser.
- Creating a second module registry or endpoint list in Axis.
- Moving generated CMS data into a frontend repository.
- Changing a functional module display name because an implementation was
  customized.
- Skipping tests after service override changes.

## Verification

Every customization should prove success and failure behavior. For backend
changes, run the owning module tests and any affected runtime smoke test. For
Axis changes, run typecheck and focused UI tests. For documentation changes,
regenerate the owning content pack, validate checksums, import through WCMS,
and verify the route in Axis.

## Customization acceptance checklist

Before accepting a customization, answer each question:

| Question | Acceptable answer |
| --- | --- |
| Who owns the behavior? | A named framework module, customer module, project, or frontend renderer. |
| Is framework source edited? | Only if the behavior is reusable framework behavior and the owner module was confirmed. |
| Is there a configuration-first option? | Yes, it was used or explicitly rejected with evidence. |
| Is functional identity preserved? | Yes; customer extensions do not rename standard capabilities. |
| Are private values protected? | Secrets are not placed in frontend code, generated docs, or public properties. |
| Are generated files regenerated from source? | Yes; generated CMS data and manifests match source content. |
| Are tests proportional to risk? | Happy path, negative, boundary, authorization, tenant, runtime, and regression checks exist where applicable. |
| Is documentation updated in the owner? | Yes; no second authority was created. |

If the checklist cannot be completed, the customization may still be a useful
prototype, but it is not production-ready Nodics behavior.
