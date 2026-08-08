# Nodics Framework

`nodics.ai` is the Nodics backend/framework repository. It contains the standard
Nodics functional module groups that are used by customer projects and runtime
servers.

Nodics is designed as a modular enterprise application framework. A customer
project can run only the functional modules it needs, extend framework behavior
through project modules, and keep runtime configuration separate from framework
source. Axis, the BackOffice frontend, discovers available capabilities through
Platform and renders governed business workspaces from backend-owned contracts.

## What this repository contains

```text
nodics.ai/
  AGENTS.md
  README.md
  package.json
  llm/
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

Customer projects, such as `nodics.kickoff`, live outside this repository and
consume the framework through package dependencies and explicit runtime
`extends` configuration. Frontend applications, such as `nodics.axis`, are also
separate projects.

## Repository ownership rules

- Framework source and framework documentation belong in `nodics.ai`.
- Framework documentation content belongs in `nodics.docs`.
- Axis product documentation content belongs in `nodics.platform/modules/axis`.
- Customer/project documentation content belongs in the owning customer project,
  for example `nodics.kickoff`.
- `nodics.axis` owns browser rendering and recovery behavior only. It must not
  own backend-importable CMS catalog, site, page, component, route, or
  documentation records.

## Local reference workspace

The simplest local workspace uses three sibling repositories:

```text
nodicsRoot/
  nodics.ai/       # this framework repository
  nodics.kickoff/  # reference customer project and local servers
  nodics.axis/     # BackOffice frontend
```

The sibling layout is convenient for the reference setup, but it is not a hard
requirement. `nodics.kickoff` can point to any framework checkout by setting
`NODICS_FRAMEWORK_ROOT` in its local `.env` file.

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
