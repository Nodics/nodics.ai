# Nodics Framework

Nodics is a modular enterprise application framework for building business
platforms that must survive real customers, real operations, real
customization, and real growth.

In simple terms, Nodics is an application factory. It does not decide what your
company sells, which workflow your customer needs, or which brand your portal
uses. Instead, it gives you the reusable machinery: module boundaries, runtime
composition, APIs, schemas, configuration layers, imports, content management,
media governance, scheduled jobs, security expectations, documentation
delivery, testing contracts, and a BackOffice experience through Axis.

`nodics.ai` is the backend/framework repository. It contains the standard
Nodics functional module groups used by customer projects and runtime servers.
It is not itself a runtime functional module.

## Why Nodics exists

Most enterprise software does not fail because the first screen was difficult
to build. It fails later, when the product needs a second customer, a new
tenant, a production release, a custom rule, a security review, a different
deployment topology, or an upgrade without breaking everything.

Common project pain looks like this:

- business rules are scattered across routes, services, scripts, and UI code;
- customer-specific behavior is edited directly into shared framework code;
- configuration is hardcoded or hidden in environment-specific files;
- APIs exist, but no one can confidently say which module owns them;
- import data, sample data, and production data are mixed;
- frontend screens assume modules exist instead of discovering authorized
  capabilities;
- documentation explains files, but not the business journey, beginner setup,
  customization path, or operational model.

Nodics solves that by making ownership explicit. A feature belongs to an
owning functional module. Technical modules live under that owner. Runtime
servers declare what they extend. Customer projects add behavior later in the
load order instead of rewriting framework source. Axis renders what the backend
declares as registered, active, and authorized.

## What a business gains

For a business evaluator, the important question is not “How many folders are
in the repository?” The important question is “Can this platform keep evolving
without every new customer becoming a fork?”

Nodics is designed to help with:

| Business concern | Nodics answer |
| --- | --- |
| Faster adoption | A runnable reference project shows Platform, WCMS, Cron, Axis, imports, documentation, and module lifecycle locally. |
| Lower customization cost | Customer projects extend framework behavior through later-loaded modules and configuration instead of editing reusable framework code. |
| Multi-enterprise and multi-tenant direction | Runtime, profile, content, authorization, and data contracts keep enterprise and tenant context visible from the start. |
| Safer growth | Functional modules publish explicit APIs, schemas, imports, and documentation ownership instead of spreading behavior across unrelated code. |
| Better operations | Runtime servers, module registration, data releases, checksums, public/private properties, logs, and restart behavior are treated as contracts. |
| Partner friendliness | A partner can start from Kickoff, see the product running, then replace or extend only the parts they own. |

## What to understand in the first 30 minutes

If this is your first visit to the repository, do not start by reading every
module folder. Start with the product story and then prove the system locally.
Nodics is easiest to understand when you see the runtime compose itself.

The first 30-minute learning path is:

1. Understand that `nodics.ai` is the framework backend repository.
2. Understand that `nodics.kickoff` is a reference customer project.
3. Understand that `nodics.axis` is the BackOffice frontend.
4. Start Platform and WCMS from Kickoff.
5. Start Axis and log in.
6. Open Documentation, Module Registry, and Imports and Exports.
7. Notice that Axis renders backend-owned capabilities instead of hardcoding
   what the project owns.

```mermaid
flowchart TD
  Visitor["New visitor opens GitHub"] --> Story["Read what Nodics solves"]
  Story --> Shape["Understand framework, project, frontend separation"]
  Shape --> Kickoff["Run nodics.kickoff locally"]
  Kickoff --> Axis["Login to nodics.axis"]
  Axis --> Registry["Inspect Module Registry"]
  Registry --> Docs["Read Framework, Axis, and Kickoff docs"]
  Docs --> Custom["Make first safe customization in customer project"]
```

This order is intentional. It keeps the learning curve friendly: first why,
then what runs, then where customization belongs.

## How Nodics is different from an ordinary project

An ordinary application project often starts with one codebase and grows until
every concern knows too much about every other concern. Nodics starts with
separation of responsibility.

```mermaid
flowchart LR
  Need["Business need"] --> Project["Customer project"]
  Project --> Server["Runtime server"]
  Server --> Modules["Functional modules"]
  Modules --> Contracts["APIs, schemas, services, data releases"]
  Contracts --> Axis["Axis BackOffice"]
  Contracts --> Apps["Customer apps and integrations"]
```

Read this from left to right. A customer project expresses the business need.
The runtime server loads the required module graph. Functional modules publish
governed contracts. Axis and other applications consume those contracts instead
of guessing what is installed.

The separation matters because different people care about different parts:

| Reader | Start here |
| --- | --- |
| Business evaluator | Read this README through “What a business gains”, then open Axis documentation at `http://localhost:3100/docs` after local startup. |
| Developer | Follow “Run Nodics locally in the reference workspace”, then read the customization guide before changing framework code. |
| Enterprise architect | Read repository ownership, modular architecture, functional module lifecycle, and runtime composition. |
| Business administrator | Start Axis, log in, review Dashboard, Module Registry, Imports and Exports, WCMS, Media, and Documentation. |
| DevOps or TechOps | Review prerequisites, runtime servers, public/private properties, ports, health, restart behavior, and data bootstrap. |
| QA or tester | Use the local acceptance checklist, import lifecycle, module registry lifecycle, and route/API verification. |
| AI contributor | Read `AGENTS.md`, then `nodics.core/modules/nSetup/llm/` before editing. Follow owner-first, customization-first, test-first contracts. |

## Enterprise-platform inspiration without copying another product

Nodics documentation and onboarding should feel familiar to people who have
used mature enterprise platforms: a clear product story first, a guided quick
start second, capability documentation third, and reference material after the
reader knows why the platform exists. That style is intentionally inspired by
the way large platforms teach adoption journeys, administration, extension,
integration, release, and operations before dropping a beginner into source
internals.

Nodics does not copy another vendor's architecture or make unsupported
comparison claims. The useful comparison is pattern-level:

| Enterprise-platform pattern | Why readers expect it | Nodics expression |
| --- | --- | --- |
| Product landing page | A new evaluator needs to know what problem is solved before reading code. | This README explains business value, local proof, ownership, and next steps before the module inventory. |
| Guided local demo | Developers need to see a working system before extending it. | `nodics.kickoff` composes framework servers and `nodics.axis` shows the BackOffice experience. |
| Capability map | Architects and administrators need stable business names. | Functional modules such as Core, Platform, WCMS, Cron, and Docs are the business-readable capability layer. |
| Extension model | Partners need upgrade-safe customization. | Customer projects and customer extension modules load after framework modules without renaming standard functional identity. |
| Governed content and data | Operations need repeatable setup and rollback. | Importable data releases, documentation packs, checksums, catalogs, sites, pages, routes, and media records are backend-owned. |
| Operations and lifecycle guidance | Production teams need deployable, observable runtimes. | Runtime servers, properties, health, logs, module registry, imports, and acceptance checks are documented as contracts. |

This is the standard we hold the documentation to. A first-time business user
should understand why Nodics exists. A first-time developer should understand
what to clone, which commands to run, what success looks like, and where to
customize. A DevOps engineer should understand which servers, properties,
dependencies, logs, and recovery paths matter. An AI tool should understand
which authority to read before touching code.

## Ecosystem view

Nodics is not only a set of packages. It is an ecosystem contract between
framework modules, customer projects, frontend renderers, backend data packs,
runtime servers, and operations.

```mermaid
flowchart TB
  Framework["nodics.ai<br/>framework backend repository"] --> Core["nodics.core<br/>runtime foundation"]
  Framework --> Platform["nodics.platform<br/>Profile, BackOffice, Axis backend data"]
  Framework --> WCMS["nodics.wcms<br/>CMS, WCMS, Media"]
  Framework --> Cron["nodics.cron<br/>scheduled jobs"]
  Framework --> Docs["nodics.docs<br/>framework documentation"]

  Customer["customer project<br/>example: nodics.kickoff"] --> Runtime["environment/server runtime graph"]
  Core --> Runtime
  Platform --> Runtime
  WCMS --> Runtime
  Cron --> Runtime
  Docs --> Runtime

  Runtime --> APIs["governed APIs, schemas, imports, registry"]
  APIs --> Axis["nodics.axis<br/>browser renderer"]
  APIs --> Apps["customer sites, apps, integrations"]
```

The ecosystem rule is simple: the backend owns authority, the customer project
owns project-specific composition, and Axis renders authorized browser
experiences. Documentation follows the same rule: framework docs live in
`nodics.docs`, Axis product docs live in the Platform Axis backend module, and
customer docs live in the customer project.

## What you can run today

The local reference workspace lets a new developer or evaluator see Nodics
working before writing custom code.

You can run:

- **Platform** for employee login, Profile, BackOffice bootstrap, runtime
  module registry, API discovery, and documentation-source registry;
- **WCMS** for sites, content catalogs, pages, components, routes, media, and
  documentation content-pack delivery;
- **Cron** for scheduled/background capability runtime;
- **Axis** for the browser BackOffice experience;
- **Kickoff** as the reference customer project that composes the framework
  and contributes customer-owned documentation.

Successful local startup gives you:

- Axis login at `http://localhost:3100`;
- Platform APIs at `http://localhost:4300`;
- WCMS APIs at `http://localhost:4310`;
- module registry visibility for mandatory and optional functional modules;
- import/export screens for initialization, core, sample, file import, export,
  and history;
- Documentation navigation for Framework, Swaggers, Nodics Axis, and Nodics
  Kickoff.

## What this repository contains

```text
nodics.ai/
  AGENTS.md
  README.md
  package.json
  nodics.js
  config/
    properties.js
    prescripts.js
    postscripts.js
  nodics.core/
  nodics.platform/
  nodics.cron/
  nodics.wcms/
  nodics.docs/
```

The current standard module groups are:

- `nodics.core` — core runtime framework modules required by every Nodics
  server.
- `nodics.platform` — Platform, Profile, BackOffice, and Axis backend
  capability metadata.
- `nodics.wcms` — CMS, WCMS, Media, content-pack import, and governed content
  delivery.
- `nodics.cron` — Cron runtime and cron job capability modules.
- `nodics.docs` — framework documentation content packs only.

The repository root follows the standard Nodics module-group file shape so
developers, tooling, and AI agents can navigate it consistently. Its
`package.json` still declares `runtimeModule: false` and
`loadableByNodicsModuleLoader: false`; the root is not a runtime functional
module. Root `config/` files are reserved for framework-repository governance
metadata only. Runtime defaults belong in the owning functional module, such as
`nodics.core`, `nodics.platform`, `nodics.wcms`, `nodics.cron`, or
`nodics.docs`.

Repository-wide AI/developer guidance is intentionally not stored in a root
`llm/` folder. The canonical guidance home is `nodics.core/modules/nSetup/llm/`,
with module-local `llm/` folders used only by the modules that own specific
capabilities.

Customer projects, such as `nodics.kickoff`, live outside this repository and
consume the framework through package dependencies and explicit runtime
`extends` configuration. Frontend applications, such as `nodics.axis`, are also
separate projects.

## Repository ownership rules

- Framework source belongs in `nodics.ai`.
- Framework documentation content belongs in `nodics.docs`.
- Axis product documentation content belongs in `nodics.platform/modules/axis`.
- Customer/project documentation content belongs in the owning customer project,
  for example `nodics.kickoff`.
- `nodics.axis` owns browser rendering and recovery behavior only. It must not
  own backend-importable CMS catalog, site, page, component, route, or
  documentation records.

## Run Nodics locally in the reference workspace

The simplest local workspace uses three sibling repositories. This layout is
recommended for the first run because it matches the reference documentation
and removes unnecessary decisions while you are still learning the framework.

```text
nodicsRoot/
  nodics.ai/       # this framework repository
  nodics.kickoff/  # reference customer project and local servers
  nodics.axis/     # BackOffice frontend
```

The sibling layout is convenient for the reference setup, but it is not a hard
requirement. `nodics.kickoff` can point to any framework checkout by setting
`NODICS_FRAMEWORK_ROOT` in its local `.env` file.

The first-run journey is:

```mermaid
flowchart TD
  Clone["Clone nodics.ai, nodics.kickoff, nodics.axis"] --> Configure["Configure nodics.kickoff .env"]
  Configure --> Install["Install project dependencies"]
  Install --> Platform["Start Platform server"]
  Platform --> WCMS["Start WCMS server"]
  WCMS --> Cron["Start Cron server when needed"]
  Cron --> Axis["Start Axis frontend"]
  Axis --> Login["Login as admin"]
  Login --> Docs["Open Documentation and Module Registry"]
```

You do not need to understand every internal technical module before this first
run. The goal is to see the framework alive, then learn the module ownership
model from a working system.

## Prerequisites

Install the local platform dependencies used by the current reference runtime:

- Node.js compatible with the repositories' `package.json` engine constraints.
- npm.
- MongoDB for runtime data.
- Elasticsearch if search-backed capabilities are enabled.
- Redis if Redis-backed cache/session behavior is enabled.

Some integrations are optional in local development. If a provider is disabled
in configuration, Nodics may log that the provider is not enabled; that is
expected for the reference setup.

## Configure the Kickoff reference project

From the same workspace that contains this repository, open a terminal in
`nodics.kickoff`:

```bash
cd ../nodics.kickoff
cp .env.example .env
```

Edit `.env` and point `NODICS_FRAMEWORK_ROOT` to this framework checkout:

```bash
NODICS_FRAMEWORK_ROOT=../nodics.ai
```

If your framework checkout lives somewhere else, use an absolute path or a path
relative to the `nodics.kickoff` project root.

Then generate the local framework package links and install dependencies:

```bash
npm run configure:framework
npm install
```

`npm run configure:framework` creates machine-local links under
`nodics.kickoff/.nodics/framework/`. Do not commit that generated folder.

Why this step exists: customer projects should not be forced to live in one
hardcoded folder next to the framework. The `.env` value tells Kickoff where
the framework checkout is on your machine, then the setup command creates
local package links for npm. This keeps the reference project easy to run while
still allowing partners to use their own workspace layout.

## Start local backend servers

Use separate terminals from `nodics.kickoff`.

Start Platform:

```bash
npm run start:platform
```

Platform exposes employee authentication, Profile, BackOffice bootstrap,
runtime module registry APIs, documentation-source registry, and other
Platform-owned APIs. The local HTTP port is currently:

```text
http://localhost:4300
```

Start WCMS:

```bash
npm run start:wcms
```

WCMS owns CMS sites, content catalogs, pages, components, routes, media, and
documentation content-pack delivery. The local HTTP port is currently:

```text
http://localhost:4310
```

Start Cron when cron behavior is needed:

```bash
npm run start:cron
```

The current local topology is intentionally split by runtime server so the
framework can prove functional module separation. A customer can later compose
or extend runtimes differently through project modules and server configuration.

If you are evaluating only the BackOffice and documentation experience, start
Platform and WCMS first. Start Cron when you want to test scheduled capability
registration and lifecycle behavior.

## Start Axis

Open a new terminal in `nodics.axis`:

```bash
cd ../nodics.axis
npm install
npm run dev
```

Axis runs locally at:

```text
http://localhost:3100
```

Axis connects to Platform for login and BackOffice bootstrap, then uses
registered backend module contracts to render workspaces and documentation.

## Login to Axis

Open:

```text
http://localhost:3100
```

Use the local reference employee account:

```text
Username: admin
Password: adminPassword
Enterprise: default
```

If Axis reports that the BackOffice registry is unavailable, confirm that
`npm run start:platform` is still running. If CMS documentation pages are
unavailable, confirm that `npm run start:wcms` is still running and the relevant
documentation content pack has been imported.

## Open documentation

After login, open:

```text
http://localhost:3100/docs
```

The Documentation area is discovered from the BackOffice registry. The current
reference setup exposes:

- Framework — framework documentation from `nodics.docs`.
- Swaggers — API contracts discovered from registered backend runtimes.
- Nodics Axis — Axis product documentation from `nodics.platform/modules/axis`.
- Nodics Kickoff — reference project documentation from `nodics.kickoff`.

Documentation source ownership is important. Axis renders documentation, but
does not own documentation data.

If a documentation page is missing after a fresh database reset, open
**System and Integrations > Imports and Exports**, select the available
documentation and initialization releases, validate them, and install them.
Framework documentation comes from `nodics.docs`; Axis documentation comes
from `nodics.platform/modules/axis`; Kickoff documentation comes from
`nodics.kickoff`.

## What to inspect after login

After the first successful login, inspect these areas in order:

| Axis area | What it proves |
| --- | --- |
| Dashboard | Axis can authenticate and render the employee workspace shell. |
| System and Integrations → Module Registry | Mandatory functional modules are persisted, optional modules are observed, and lifecycle actions are backend-governed. |
| System and Integrations → Module Health | Runtime health evidence is projected by BackOffice instead of guessed by the browser. |
| Imports and Exports | Initialization, core, sample, and documentation releases are immutable, checksum-governed, and module-owned. |
| Content and Experience | WCMS owns sites, catalogs, pages, components, routes, and delivery metadata. |
| Media | Media records and folders are owned by WCMS/Media, not by the frontend. |
| Documentation | Framework, Swagger, Axis, and project documentation are separate products with separate owners. |

This small tour teaches the Nodics contract better than a folder walk. The UI
shows how runtime availability, project registration, content packs, and
documentation ownership meet in one employee workspace.

## Validate the framework repository

From this repository:

```bash
npm test
```

Run module-specific checks from the owning module when changing a module. For
example, documentation content-pack changes should be validated in the module
or project that owns that content.

## How customization works

Repository/package dependencies make framework code available. Runtime
inheritance decides what actually loads.

For example, the local Kickoff Platform server loads:

```text
nodics.core
nodics.platform
nodics.kickoff
kickoffLocal
platformServer
```

A customer can add project modules to customize framework behavior without
renaming the functional module identity. For example, a future
`kickoff.platform` module may extend or override Platform behavior, while Axis
and BackOffice still present the functional capability as `Platform`.

This keeps business capabilities stable while allowing project-specific
implementation and service overrides through the normal Nodics module merge and
runtime load order.
