# Core overview

`nodics.core` is the foundation every Nodics runtime loads before any higher
functional module such as Platform, WCMS, Cron, Workflow, or Commerce. It is
not a business screen and it is not a customer project. It is the reusable
runtime framework that gives every server the same language for modules,
configuration, routing, services, schemas, data releases, imports, tests,
security hooks, and operational contracts.

For a beginner, Core is the engine room. Most business users will not open a
Core page in Axis every day, but every business capability depends on it being
predictable. If Core is messy, every module above it becomes harder to secure,
customize, test, and operate.

## Business purpose

Core reduces the cost of building enterprise applications by solving repeated
technical problems once. A project should not reinvent module loading, layered
configuration, API exposure, database model registration, import validation,
service discovery, logging, or test scaffolding for every new capability.

The business value is indirect but powerful:

| Business concern | Core contribution |
| --- | --- |
| Faster delivery | New modules start from a known runtime shape instead of a blank server. |
| Safer customization | Customer behavior can load later without editing framework source. |
| Upgradeability | Shared contracts stay in one foundation and are tested consistently. |
| Operations | Startup, logs, imports, schemas, routers, and validation follow repeatable rules. |
| Governance | APIs, data releases, generated artifacts, and module ownership are explicit. |

Core is what lets a partner trust that Platform, WCMS, Cron, and future modules
are not unrelated applications glued together by convention.

## Beginner mental model

Imagine building several business products: a content platform, a scheduled
job engine, a commerce application, and a documentation portal. Without a
framework, each product might invent its own config files, service structure,
database connection, routing style, error shape, and tests. That makes the
whole ecosystem difficult to learn.

Core gives them a shared base:

```mermaid
flowchart TB
  Core["nodics.core<br/>runtime foundation"] --> Config["Configuration layers"]
  Core --> Loader["Module loader and lifecycle"]
  Core --> Routing["Routers and API exposure"]
  Core --> Services["Services, facades, controllers"]
  Core --> Data["Schemas, imports, exports, generated data"]
  Core --> Security["Auth, validation, tokens, guards"]
  Core --> Quality["Testing and tooling"]

  Config --> Platform["nodics.platform"]
  Loader --> WCMS["nodics.wcms"]
  Routing --> Cron["nodics.cron"]
  Services --> Future["future functional modules"]
```

Every higher module builds on this foundation. A module can extend another
module, but it should not bypass Core contracts.

## What Core owns

Core owns framework-level technical capabilities, including:

- module discovery and runtime loading;
- configuration precedence and property merging;
- common utilities and status/error definition patterns;
- database connection and model registration contracts;
- routing and API category exposure;
- controller, facade, service, and pipeline conventions;
- authentication, token, validation, and security infrastructure hooks;
- import/export and data release mechanics;
- event, cache, search, test, and tooling foundations;
- generated LLM context and quality governance through nSetup/nTooling.

Core does not own customer business rules. If a customer needs special
behavior, the first question is whether the behavior belongs in a customer
project module, a later-loaded extension of an existing functional module, or a
new functional module. Do not put customer behavior into Core just because
Core is loaded everywhere.

## Runtime loading model

Core always loads before higher functional modules. The exact server graph is
defined by the customer project and server configuration.

![Request process design](../assets/images/request-process-design.jpg "Request processing reference from the archived documentation set")

```mermaid
flowchart LR
  Package["Package dependency<br/>code is available"] --> Extends["Server/module extends<br/>code is selected"]
  Extends --> Index["Module index/load order<br/>merge precedence"]
  Index --> Runtime["Running server<br/>effective services, routes, data"]
```

These are different concepts:

- package dependency makes code available to npm;
- module `extends` describes functional inheritance;
- server `extends` describes the effective boot graph;
- index/load order decides which services and configuration win during merge;
- BackOffice registration decides which functional capability is accepted and
  active for business use.

Confusing these concepts is one of the fastest ways to create hidden bugs.

## Request processing model

Every API should feel boringly consistent to a developer, tester, and operator.
The request enters through Express, passes through Nodics routing and request
processing, reaches the owning controller/facade/service layer, and only then
touches persistence, cache, search, events, or provider integrations through
approved contracts.

![Request processor flow](../assets/images/request-processor-flow.jpg "Request processor flow reference from the archived documentation set")

This flow is why Nodics discourages shortcuts. A validation rule, permission
check, tenant resolution, error response, cache lookup, or persistence call
should live in the layer that owns that responsibility. If a feature works only
because one route manually skipped the shared request path, it will become a
security and regression risk later.

## Cache, search, events, and logging

Core also supplies reusable infrastructure seams. These seams are intentionally
module-owned so a customer project can change the provider or policy without
rewriting business APIs.

![API cache flow](../assets/images/api-cache-flow.jpg "API cache flow reference from the archived documentation set")

![Item cache flow](../assets/images/item-cache-flow.jpg "Item cache flow reference from the archived documentation set")

![Search cache flow](../assets/images/search-cache-flow.jpg "Search cache flow reference from the archived documentation set")

![Event handler process](../assets/images/event-handler-process.jpg "Event handler process reference from the archived documentation set")

![EMS producer system](../assets/images/ems-producer-system.jpg "EMS producer reference from the archived documentation set")

![EMS consumer system](../assets/images/ems-consumer-system.jpg "EMS consumer reference from the archived documentation set")

For example, a module may cache API responses, individual models, or search
results, but the route should not hardcode a specific cache backend. A module
may publish or consume events, but it should do that through nEvent/nEms
contracts rather than calling a message broker directly from random business
code. Logs should carry enough context to explain which module, tenant,
request, job, import, or event caused the action.

## Configuration-first rule

Core supports layered configuration so projects can change behavior without
editing framework source. Defaults should live in the module that owns the
behavior. Project, environment, server, node, tenant, provider, and persisted
configuration layers may override or narrow those defaults.

The rule is not "everything goes in properties." The rule is "put each setting
where its authority belongs."

| Need | Correct direction |
| --- | --- |
| Framework-wide default | Owning framework module configuration. |
| Project-specific default | Customer project configuration. |
| Local server port/database | Environment/server configuration. |
| Secret or machine-specific path | Private local/environment configuration, never committed casually. |
| Status, lifecycle, error code | Owning status-definition contract, not random properties. |
| Generated import checksum | Generated manifest from source data, not manual editing. |

## Developer workflow

When changing Core or a module that depends on Core, use this sequence:

1. Identify the owning functional module and technical module.
2. Read the nearest `AGENTS.md`, README, and relevant contracts.
3. Check whether existing configuration or extension seams solve the need.
4. Write export-friendly, documented JavaScript in the correct folder.
5. Keep generated artifacts generated from source.
6. Add focused tests for default behavior and customization behavior.
7. Run quality, docs, AI, LLM, module, and acceptance checks appropriate to the
   changed surface.

This sequence protects future custom modules. A partner should be able to
override a service, replace a provider, or adjust configuration without
patching framework source.

## Axis visibility

Core is a mandatory functional module in the current Axis-backed reference
stack, but Axis should not expose every Core technical module as a separate
business registry card. Core appears as a high-level foundation. Internal
technical modules remain developer details unless an owning functional module
exposes a browser-safe capability.

Axis uses Core indirectly through Platform, BackOffice, WCMS, Cron, and other
module APIs. The browser must not import Core source, execute Core services,
or become a second runtime loader.

## DevOps and QA checks

Core changes deserve broad verification because every runtime depends on them.
At minimum, prove:

- Platform starts with Core loaded first;
- WCMS starts and can import content packs;
- Cron starts when selected by the runtime graph;
- generated data manifests validate;
- module LLM context generation and validation still pass;
- API category exposure remains intentional;
- configuration precedence logs remain explainable;
- fresh local acceptance can rebuild from empty local databases;
- no generated files drift from their source definitions.

## Common mistakes

- Putting customer-specific behavior into Core because every server loads it.
- Treating package dependency order as service override order.
- Hiding lifecycle states or error codes in unrelated properties.
- Editing generated data instead of fixing source definitions or generators.
- Exposing every technical module as a business capability in Axis.
- Bypassing backend module authority by adding frontend-only logic.

Core is powerful because it is boringly consistent. Keep it that way.
