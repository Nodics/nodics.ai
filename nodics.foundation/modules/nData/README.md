# nData

`nData` is the governed data-movement capability group. It helps data enter,
move through, and leave Nodics without turning one-off scripts, file paths, or
external credentials into hidden platform authorities.

`nData` groups data import, data export, and data-core capabilities.

Data import/export guidance must be driven by source code and module contracts.
Treat import/export as platform capabilities: definitions, parsers, processors,
audit, rollback, diagnostics, and tests belong to the owning data modules
instead of ad hoc scripts.

## Ownership

`nData` coordinates:

- import module ownership and shared configuration;
- export module ownership and shared configuration;
- reusable data-processing contracts;
- data movement governance across modules;
- documentation linking child module behavior.

## Extension Contract

Projects customize data movement through later-loaded import/export
definitions, processors, services, configuration, and tests. Do not hardcode
customer file formats, storage providers, or data mappings in framework code.

Generated or derived data artifacts must be recreated from source definitions.
Operational imports and exports must preserve validation, audit, diagnostics,
and rollback/retry behavior where applicable.

## Import And Export Model

Data import/export is a platform capability. Nodics keeps that responsibility
in `nData` and its child modules.

An import/export flow defines:

- source or destination format;
- header and field mapping;
- target module and schema;
- tenant/customer context;
- validation behavior;
- duplicate and idempotency behavior;
- diagnostics and run history;
- retry and rollback impact;
- tests and sample/core data expectations.

Format support such as JavaScript, JSON, CSV, and Excel belongs in provider
modules. Add new formats through provider modules or project
modules, not by changing the generic import/export engine for one customer.

## Data Ownership

Importable data belongs to the module, environment, server, or node that owns
the records.

- `data/init-v001` is for startup/bootstrap records that are required.
- `data/core-v001` is for intentional reference imports.
- `data/sample-v001` is for local/demo/test records.

Startup data must be idempotent. Sample data must never become a production
dependency.

## Release Manifest Principle

Developers author data folders, headers, records, and assets. They should not
hand-maintain large `manifest.json` file maps or checksums.

`data/manifest.json` is generated release evidence. It may provide display
metadata, destination/lifecycle policy, publication review guidance, and audit
checksums, but runtime discovery derives the effective executable files from the
current release folder. Header files are the routing authority: each enabled
header declares the target module, schema or index, operation, query, and
`dataFilePrefix`; Nodics includes the matching record files from the release
folder and computes the current release checksum.

When `data/manifest.json` is missing, Nodics can still discover conventional
`init-v001`, `core-v001`, and `sample-v001` folders for active modules. When a
manifest exists but its generated file checksums are stale, Nodics recomputes
the current checksum from disk instead of making developers repair JSON by
hand. Stable installed releases are still protected: if a non-development
version changes without a version bump, the upgrade policy blocks execution.

## Runtime Safety

Imports and exports can affect many records quickly, so they must preserve
platform governance:

- validate headers and payloads before mutation;
- carry tenant and module context;
- avoid leaking credentials or sensitive data in diagnostics;
- record enough run history to explain what happened;
- expose failure counts and reason codes;
- support rollback or recovery where the business process requires it.

## Capability Family

`nData` coordinates:

- `dataCore` for shared processors, validators, interceptors, data handlers, finalizers, and writers;
- `nImport/import` for governed import orchestration, diagnostics, run history, tenant precedence, local/remote staging, and access-policy enforcement;
- import format modules such as CSV, Excel, JSON, and trusted JavaScript definitions;
- `nExport/export` for shared export request handling, access-policy application, and fail-closed default export behavior;
- export format modules such as CSV, Excel, JSON, and trusted JavaScript export processing.

Data movement should always pass through governed pipelines. Do not create one-off scripts that write directly to models just because the source is simple.

The same rule applies to verification and repair. Developers, AI tools,
migrations, tests, and operators must not query or mutate a database directly;
use the owning Nodics API/service plus import/export history, receipts, and
audited diagnostics.

## DaaS Pattern

Data as a Service is a platform pattern, not a single module. Nodics can act as a governed data lake or information center by combining:

- import from files, APIs, scheduled drops, or governed remote adapters;
- schemas and generated services for normalized persistence;
- tenant isolation for company/application separation;
- processors, validators, interceptors, and pipelines for transformation;
- catalog structures for product/content/domain organization;
- search indexes for retrieval;
- export processors for target-system contracts;
- diagnostics, audit, retries, and rollback evidence.

For example, a product catalog information center can import supplier data, normalize it into tenant-specific catalogs, validate and enrich records, index them for business lookup, and export feeds matched to each downstream system's contract.

## Extension Path

Projects extend data movement by:

- adding import/export headers and data under the owning module;
- adding format modules or provider modules;
- contributing processors, validators, interceptors, and pipelines;
- configuring governed remote sources or destinations;
- adding schema access policy for import/export visibility;
- adding tests for tenant scope, diagnostics, failure handling, duplicate protection, retry, rollback, and target contracts.

## What To Avoid

Avoid:

- bypassing import/export services for direct database writes;
- using sample data as production dependency;
- allowing arbitrary request-supplied URLs, credentials, executable code, or filesystem paths;
- mixing import format parsing into generic data core;
- exporting data before schema/property access policies are applied;
- leaving data movement without run history and diagnostics.

## Choose A Data Capability

| Need | Owner | Current maturity |
| --- | --- | --- |
| Shared processing, validation, interception, finalization, and writing contracts | [dataCore](dataCore/README.md) | Production-ready supporting capability |
| Governed init, core, sample, local, and remote import lifecycle | [nImport](nImport/README.md) and [import](nImport/import/README.md) | Production-ready capability; remote transport remains guarded |
| Governed outbound export lifecycle | [nExport](nExport/README.md) and [export](nExport/export/README.md) | Guarded, fail-closed capability |
| CSV, Excel, JSON, and trusted JavaScript import parsing | Import format modules | Production-ready through shared import lifecycle evidence |
| CSV, Excel, JSON, and trusted JavaScript export rendering | Export format modules | Placeholder or scaffold until writers and contract tests exist |

## Operations And Data Governance

Define classification, retention, lineage, schema/version compatibility,
encryption, access policy, tenant boundaries, throughput, batching, retry,
idempotency, quarantine, rollback, reconciliation, and deletion for every data
flow. Observability should record safe source aliases, definition/header,
tenant, run id, counts, bytes, checksum, duration, target, and reason codes—not
raw credentials or unrestricted sensitive records.

## Continue

- Public data guide: [How To Work With Data](https://github.com/Nodics/nodics.docs)
- Data-as-a-Service pattern: [How To Use Nodics As Data As A Service](https://github.com/Nodics/nodics.docs)
- Import family: [nImport](nImport/README.md)
- Export family: [nExport](nExport/README.md)
