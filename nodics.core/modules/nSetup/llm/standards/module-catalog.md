# Module Catalog

This file gives AI agents and developers a first-pass map of important Nodics module responsibilities. Verify implementation details in the module source before changing behavior.

## Core Runtime Modules

| Module | Responsibility |
| --- | --- |
| `nDefault` | Base/default schema and foundational generated behavior. |
| `nConfig` | Startup, module hierarchy, configuration loading, clean/build, generated artifact governance. |
| `nCommon` | Shared errors, utilities, processors, promise helpers, and file helpers. Module generation uses contract-driven scaffolding instead of copied templates. |
| `nDatabase` | Schema processing, model generation, database connection, DAO/generic CRUD behavior. |
| `nService` | Tenant, enterprise, status catalog, service calls, module communication, topology helpers. |
| `nPipeline` | Pipeline definition, execution, and runtime pipeline behavior. |
| `nEvent` | Event/listener infrastructure. |
| `nRouter` | API route contract, request pipeline, auth/header normalization, route execution. |
| `nController` | Common controller support. |
| `nFacade` | Common facade support. |
| `nValidator` | Validation capability and generated validator APIs. |
| `nAuth` | Authentication/authorization foundations. |
| `nSearch` | Search/indexing abstractions and generated search APIs. |
| `nCatalog` | Framework-level catalog capability foundation. |
| `nToken` | Token schema/capability support. |
| `nData` | Data import/export family root. |
| `nImport` | Governed import engine for init/core/sample/local/remote data, validation-only runs, diagnostics, run history, checksums, duplicate protection, retry metadata, rollback hooks, and import access policy checks. |
| `nExport` | Export engine and export access policy checks. |
| `nEms` | Event/message service clients including ActiveMQ/Kafka modules. |
| `nTest` | Layered test discovery, generated schema/API tests, guarded live tests, suite reporting, topology-aware evidence, and selected-server report ownership. |
| `nSystem` | System APIs, configuration APIs, OpenAPI contract exposure, file/log/test endpoints. |
| `nDynamo` | Runtime control-plane governance for schema, router, class, pipeline, tenant properties, schema access policies, activation requests, previews, audit, cleanup, and rollback. |

## Product Runtime Modules

| Module | Responsibility |
| --- | --- |
| `nodics.platform/profile` | Enterprise, tenant, user, customer, employee, user group, permission, authentication, API-key, and mandatory identity bootstrap contracts. |
| `nodics.platform/backoffice` | Module registry, discovery, catalogue, compatibility, availability summary, and registration lifecycle. |
| `nodics.cron/cronjob` | Cron definitions, lifecycle operations, logs, node ownership, failover ownership, and event-driven execution. |
| `nodics.wcms/cms` | CMS site, content catalog, page, route, template, component, renderer, restriction, and navigation contracts. |
| `nodics.wcms/wcms` | Web content management module group defaults and WCMS composition contracts. |
| `nodics.wcms/media` | Governed media folders, formats, assets, references, sets, uploads, delivery, and media lifecycle policies. |
| `nodics.docs` | Framework-owned documentation data and documentation import ownership. |
| `nodics.process/workflow` | Business process and workflow capability group. |
| `nodics.process/workflow/flowSchema` | Process definition, version, instance, task, trigger, and audit schemas. |
| `nodics.process/workflow/flowCore` | Process runtime services, lifecycle rules, execution, task handling, trigger behavior, and governance. |
| `nodics.process/workflow/flowApi` | Process and workflow API/control-plane exposure for Axis and runtime integrations. |

## Planned Or Project-Owned Domain Modules

Commerce, marketplace, logistics, telco, marketing, data-processing, and other
domain modules must be added as explicit module groups or customer/project
modules before they appear in enforceable framework gates. Do not list a
capability as current framework functionality until its module package,
README, schemas/routes/services/tests, and generated LLM context exist in this
repository.

## Customer Project Shape

Customer projects are not framework module names. The names below describe the
standard shape a customer project may use; the concrete project name can be
different for every customer.

| Project artifact | Responsibility |
| --- | --- |
| `<customer-project>` | Customer backend project. It demonstrates or owns application, environment, server, node, config, data, documentation, custom modules, and tests. Do not hardcode a concrete customer project name in framework logic. |
| `<customer-project>/modules` | Project capability group containing project-owned modules such as `<customer-project>.core`, `<customer-project>.api`, or `<customer-project>.integration` when needed. |
| `<customer-project>/envs` | Environment grouping folder under the customer project, not a normal startup module. |
| `<customer-project>/envs/<environment>` | Concrete environment/server-root group module. |
| `<customer-project>/envs/<environment>/<server>` | Runnable customer server that extends a framework functional module or a customer extension module. |

## Module Documentation Rule

When adding or significantly changing a module:

1. Update this catalog.
2. Add or update module-level documentation.
3. Explain owned schemas, routes, services, data, tests, and runtime contracts.
4. State what can be overridden by project modules.
