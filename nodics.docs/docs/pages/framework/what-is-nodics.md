# What is Nodics?

Nodics is a modular enterprise application framework for building governed
business platforms without forcing every project to reinvent authentication,
content management, APIs, configuration, data import, publishing, workflow,
scheduled jobs, media, documentation, and operational contracts. It is not a
single finished storefront or one fixed business product. It is the framework
foundation that customer projects, internal tools, public sites, accelerators,
and solution use cases can build on.

For a beginner, the easiest mental model is this: Nodics gives the reusable
enterprise machinery, while the customer project supplies the business-specific
rules, content, branding, integrations, and runtime decisions. Axis is the
authenticated business workspace. Nexus and Agora are public-facing
applications that consume approved Online content and APIs. Backend modules
remain the authority for data, permissions, workflows, routes, and publication.

## Business definition

Nodics helps teams move faster without giving up enterprise governance. A
business can start with a reference project, initialize the required data,
publish public content, then customize behavior through Axis, configuration,
provider adapters, services, pipelines, and project modules. The value is not
only speed. The value is speed with a path to operate, secure, explain,
extend, test, and upgrade the platform.

| Business question | Nodics answer |
| --- | --- |
| What is being adopted? | A modular framework for enterprise application delivery. |
| Who uses it? | Business users, administrators, developers, operators, QA owners, partners, and AI-assisted delivery tools. |
| What does it reduce? | Repeated architecture work, customer forks, hidden configuration, unclear ownership, and fragile runtime changes. |
| What does it enable? | Faster setup, governed customization, publishable content, reusable capability modules, and clearer production support. |

## AI-assisted development with human ownership

Nodics is designed to let a team use AI without surrendering its ability to
understand, change and operate the software. Faster code generation is useful
only when the people responsible for the application can review the result,
maintain it and recover when something goes wrong.

Engineers moving from established enterprise systems bring valuable experience
with services, validation, transactions, deployment and support. Adopting AI
should build on that experience. Teams need a clear answer to what code should
be written, where it belongs and how it becomes part of the running application.
Nodics addresses this through module ownership, source definitions, supported
extension points, layered configuration and shared implementation contracts.

Manual development remains a first-class way of working. A developer can write
a feature, ask AI to help extend it, review the changes and maintain it later
through the same source files and contracts. Human-written and AI-generated
changes have the same obligations: explicit ownership, understandable code,
security, validation, documentation and appropriate tests. The maintained
application must not depend on access to the original coding conversation.

For example, when a customer needs a different validation rule, first identify
the capability that owns validation and inspect its supported extension point.
Put the customer-specific change in the customer project, document the inherited
behavior and test both the new rule and the guarantees it must preserve. This
path applies whether a developer or an AI tool writes the implementation.

| Developer question | Nodics implementation discipline |
| --- | --- |
| What should change? | Define the business outcome and reuse the capability that already owns it. |
| Where should it be written? | Identify the owning repository, module, layer and authoritative source file. |
| How should it be customized? | Use supported properties, source definitions or loader-visible extension points; change the authoritative definitions and regenerate their outputs. |
| What will run? | Inspect active modules, load order, effective configuration and the selected implementation for the intended runtime. |
| How can another engineer maintain it? | Preserve purpose, extension guidance, focused tests and sanitized diagnostic and recovery information with the implementation. |

AI-assisted coding and AI used inside an application are separate decisions.
Using an AI coding tool does not require every business operation to call a
model. When a feature does use AI at runtime, the provider boundary and failure
handling must be explicit; Nodics security and owning domain services retain
authorization, validation and execution authority.

These are engineering responsibilities, not a guarantee that generated code is
correct or that every deployment is production-ready. A practical review is to
ask an engineer who did not build the feature to explain it, make a supported
change and diagnose a failure using the repository, documentation and governed
tools. Missing explanations or tests are gaps to address before acceptance.

## Technical definition

Technically, Nodics is a layered runtime. Framework modules live in
`nodics.ai`. Customer projects such as Kickoff declare which framework modules
and project modules load into Platform, WCMS, Process, and other runtime
servers. Axis renders authorized capabilities from backend contracts. CMS
content, documentation, storefront pages, media, routes, and publication state
come from backend-owned content packs and catalogs.

```mermaid
flowchart LR
  Framework["Nodics framework modules"] --> Project["Customer project"]
  Project --> Runtime["Platform, WCMS, Process runtime"]
  Runtime --> Axis["Axis business workspace"]
  Runtime --> PublicApps["Nexus, Agora, partner apps"]
  Project --> Extensions["Configuration, providers, services, pipelines"]
```

## What teams can build

Teams can build employee BackOffice applications, public corporate sites,
CMS-driven storefronts, commerce accelerators, process automation, scheduled
jobs, integrations, documentation portals, data engineering solutions, and
customer-specific project layers. The framework gives common contracts; the
project decides which business journey is needed.

Nodics is also meant to work well with AI-assisted development. AI can help
move quickly, but the framework keeps ownership explicit so generated changes
do not scatter behavior across the wrong modules.

## Where to continue

Use the sibling pages in this group as the first reader path. Read **Why Nodics
Exists** for the business problem and industry context. Read **How Nodics
Works** for runtime, module, Axis, Nexus, Agora, and backend ownership. Read
**Adoption and First Journey** for the first setup and verification path.

## Common mistakes

- Treating Nodics as one application instead of a framework used by many
  applications and solution use cases.
- Assuming Axis owns backend records because administrators use Axis screens.
- Expecting Nexus or Agora to show Staged content before Online publication.
- Customizing framework source before checking project-layer extension paths.
- Reading only technical modules before understanding the business journey.

## Verification

This introduction is correct when a new business user can explain what Nodics
is, a developer can identify framework versus project ownership, and an
operator can explain why public apps only render approved Online content. The
local proof is to start the reference workspace, initialize Axis, register
required capabilities, import content packs, approve publication where needed,
and verify Axis, Nexus, and Agora from the browser.
