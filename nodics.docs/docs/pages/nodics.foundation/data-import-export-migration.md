# Data Import, Export, and Migration

Import definitions, data installation, exports, migration registers, release evidence, rollback boundaries, and customer onboarding. This page is intentionally written for beginners, business users, developers, operators, architects, QA owners, and AI tools. It explains the business problem first, then the technical ownership model, then the exact customization and verification responsibilities so nobody has to guess where a change belongs.

A customer cannot trust a platform if data arrives through ad hoc scripts, undocumented dumps, or direct database writes with no validation or recovery evidence. Nodics treats data movement as governed operations: import definitions, staged validation, execution receipts, migration registers, redaction, and rollback boundaries are documented and tested.

## Business context

For a business user, this topic answers what decision can be made, which operational journey is supported, and what risk is reduced. The practical value is faster delivery without losing governance: teams can understand the current capability, decide whether it applies to their project, and know when Axis, Nexus, content catalog, workflow, or runtime services are involved.

For beginners, the mental model is simple: the page title is the business capability, the table identifies who owns each part, and the diagram shows how a request or change flows. A reader should not need source-code knowledge to understand the journey, but the developer path is still available when customization is needed.

| Business question | Answer for this topic |
| --- | --- |
| What problem does it solve? | A customer cannot trust a platform if data arrives through ad hoc scripts, undocumented dumps, or direct database writes with no validation or recovery evidence. |
| Who uses it? | Business users, administrators, developers, operators, QA owners, implementation partners, and AI-assisted delivery tools. |
| What changes can it support? | Nodics treats data movement as governed operations: import definitions, staged validation, execution receipts, migration registers, redaction, and rollback boundaries are documented and tested. |
| What must be governed? | Permissions, validation, source ownership, publication state, runtime impact, audit evidence, and rollback boundaries. |

## Journey and ownership

Foundation data tooling owns generic import/export behavior. Functional modules own their seed data, schema validation, lifecycle, and migration meaning. This keeps the reader-facing name friendly while preserving exact source ownership for developers and AI tools. Axis may render management screens or authenticated documentation, Nexus may render public Online content, and the backend content catalog remains authoritative for navigation, pages, access policies, and publication state.

```mermaid
flowchart LR
  Reader["Business or developer request"] --> Axis["Axis or Nexus view"]
  Axis --> Backend["Owning backend capability"]
  Backend --> Catalog["Content/catalog/schema/config records"]
  Catalog --> Runtime["Runtime behavior or published page"]
  Runtime --> Evidence["Audit, validation, and support evidence"]
```

| Responsibility | Owner | Notes |
| --- | --- | --- |
| Business capability name | Data Import, Export, and Migration | Used in navigation and dashboards so readers are not exposed to raw module names first. |
| Source owner | nodics.foundation | Carries exact implementation, documentation, and validation evidence. |
| Technical module | nImport | Holds the relevant schema, service, router, data, or contract detail where applicable. |
| Axis experience | Backend-declared workspace | Axis renders metadata and actions but does not become the authority. |
| Public experience | Online content delivery | Nexus renders only records approved for public access. |

## Data and configuration detail

Every topic must explain the data that changes behavior. Some topics are schema-driven, some are configuration-driven, some are publishable content, and some are operational records. The documentation must say which category applies before showing code. That keeps production operators and developers aligned on whether a change needs publication, restart, event propagation, approval, or only a project-layer override.

| Detail area | What to document | Verification signal |
| --- | --- | --- |
| Model or record | Type code, catalog, tenant, enterprise, state, owner, and lifecycle. | Schema contract or generated model test. |
| Configuration key | Default value, override location, environment scope, and runtime impact. | Config validation and runtime refresh evidence. |
| API or event | Route/event name, payload boundary, permission, idempotency, and failure mode. | Route, service, event, and authorization tests. |
| Publication and access | Staged/Online state, access mode, roles, groups, and permissions. | Content-pack validation and access-policy test. |

```js
importRun: { definition: "cms.site.seed", source: "content-pack", lifecycle: "staged", checksum: "sha256" }
```

## Customization and extension

Developers should customize from the project layer first. A customer project may add properties, services, validators, pipelines, renderers, data packs, or provider configuration when the extension respects the owning capability. Business users may update governed records in Axis when the record is designed for administration. Framework source changes are reserved for improving the reusable product capability itself.

| Customization type | Recommended path | Avoid |
| --- | --- | --- |
| Business label, navigation, or content area | Axis-managed content catalog item with publication workflow. | Hardcoding labels or page trees in the frontend. |
| Runtime setting | Module configuration with validation and governed runtime propagation. | Editing node-local files on each server by hand. |
| Domain behavior | Extension service, validator, pipeline step, or provider adapter. | Forking the standard module for customer-only logic. |
| Public visibility | Access policy with public/authenticated/role-based state. | Exposing internal or draft pages through Nexus. |

## Operations and governance

Operators need production-safe evidence, not only implementation notes. Each page must call out logging, tracing, permission checks, event propagation, data import/export, publication status, rollback behavior, and troubleshooting. If a capability affects multiple nodes, the documentation must explain how changes reach every node and how a partial failure is detected.

| Operational concern | Required documentation detail |
| --- | --- |
| Security | Authentication mode, permission code, role/group, tenant and enterprise isolation. |
| Audit | Actor, timestamp, source record, checksum, approval, route/event, and result. |
| Resilience | Retry, idempotency, compensation, fallback, cache invalidation, and rollback. |
| Observability | Logs, metrics, dashboard cards, health checks, and support evidence. |

## Common mistakes

- Treating a friendly navigation label as the technical source owner.
- Writing only developer details and skipping the business decision that the page supports.
- Updating Axis or Nexus code when the content catalog, schema, or backend capability should own the change.
- Forgetting access rules for public, authenticated, role-based, group-based, or permission-based pages.
- Skipping diagrams, comparison tables, source maps, or troubleshooting matrices because the topic feels obvious.
- Changing runtime behavior without explaining production impact, cluster propagation, and rollback.
- Leaving generated documentation without source evidence, validation commands, and maturity state.

## Verification

Verification starts with the document itself: it must include business context, technical ownership, a visual flow, data or configuration tables, customization guidance, common mistakes, and validation evidence. Developers then run the documentation generator and content-pack validator so the page becomes backend-owned data with checksum, lifecycle, navigation, access policy, publication state, and search metadata.

For implementation verification, run the owning module tests and any Axis or Nexus renderer tests that consume the page. Operators should confirm that production-like runtime behavior matches the documentation: permissions reject unauthorized access, Online pages do not expose Staged data, runtime changes propagate through governed events, and troubleshooting evidence is available without exposing secrets.

## Current implementation coverage

Data import, export, migration, and seed packs cover how framework, content,
commerce, profile, media, localization, and customer-project data enter or
leave the runtime with evidence. The implementation includes import
definitions, import runs, data installation services, data pack manifests,
headers, processors, media import source staging, migration registers, release
evidence, and generated checksums. This topic is also where data installation
and seed packs from the 50-item batch are covered.

```mermaid
flowchart LR
  Source["Data pack, CSV, XLSX, media source, or migration input"] --> Header["Header and manifest"]
  Header --> Definition["Import definition"]
  Definition --> Processor["Import processor"]
  Processor --> Run["Import run evidence"]
  Run --> Model["Target model records"]
  Run --> Release["Release or migration evidence"]
```

| Data movement area | Business purpose | Required documentation |
| --- | --- | --- |
| Data pack and manifest | Prove exactly what seed data is included. | File list, checksum, owner, layer, and lifecycle. |
| Header | Describe target model and import behavior. | Schema, columns, tenant, references, and validation. |
| Import definition | Govern repeatable import behavior. | Source, parser, processor, permissions, idempotency, and failure policy. |
| Import run | Capture execution evidence. | Actor, tenant, counts, errors, correlation, and rollback notes. |
| Migration register | Explain source-to-target movement. | Source classification, mapping, reconciliation, and retirement evidence. |
| Export | Move data out safely. | Purpose, field allow-list, masking, retention, and audit. |

Developers should add new processors, validators, headers, and data-pack
entries in the owning module or project layer. Business users should see
whether a run is draft, approved, failed, partially imported, published, or
ready for retry. Operators should verify that an import can be replayed
idempotently and that failed rows do not silently become successful records.

Implementation evidence comes from import definition tests, model import
process services, file import process services, tenant import interceptors,
media import staging and finalization tests, data manifest services, release
services, migration registers, and generated schema contracts for
ImportDefinition, ImportRun, and DataInstallation.

DEAP, the Data Engineering and Analytics Platform solution use case, should
link back to this page whenever a data flow imports source records, validates
them, stages media, exports governed data, publishes searchable projections,
or records migration evidence. This page explains the data movement contract;
DEAP explains how several framework capabilities compose into a customer
solution.
