# import Agent Contract

This file gives AI coding agents mandatory guidance for this Nodics module or package boundary.

## Inheritance

- Follow the repository AGENTS contract: `../../../../AGENTS.md`.
- Follow global AI/development guidance: `../../../nSetup/llm/ai-enablement-index.md`.
- If a deeper child module has its own `AGENTS.md`, follow that file for changes inside the child module.

## Module Work Rules

- For explicitly managed counters, `saveAll` imports capture original revisions
  through the owning generated read service and retain them for retries of the
  same model-import request. Source rows do not own these counters. Reject other
  import operations for managed schemas; never turn a retry into an unconditional
  overwrite or change business/publication/release versions.

- Treat this directory as a layered Nodics module boundary when it contains `package.json`.
- Keep capabilities stable and make implementations replaceable through the module hierarchy.
- Do not hardcode project, environment, server, node, tenant, or customer behavior into reusable framework code.
- Put configurable behavior in layered configuration, schemas, routers, services, pipelines, data, and runtime governance.
- Update the concise `README.md`, canonical documentation content, `llm/contracts`, `llm/examples`, generated context, and tests whenever behavior or extension contracts change.
- Use `llm/contracts` for exact module-local AI/developer rules, `llm/examples` for approved patterns, and `llm/generated` for source-derived facts. Do not add a module-local llm README file; this `AGENTS.md` is the AI navigation and behavior entrypoint for the module.
- Generated files must be recreated from source definitions; do not hand-maintain generated artifacts as source of truth.
- For module release data, treat `headers`, `records`, and `assets` as the developer-authored source. Treat `data/manifest.json` as generated audit evidence and grouping metadata. Do not ask developers or AI tools to hand-update checksum maps when header or record files change.

## Content-pack rules

- `nImport` is the only content-pack execution authority. System may expose
  secured control-plane routes and BackOffice clients may invoke them, but no
  client or experience module may create another importer.
- Treat a content pack as an immutable, versioned, checksummed release. Reject
  installed stable-release checksum changes without a version change and reject
  downgrades unless a later configuration layer explicitly permits them. For
  module release data, compute the current checksum from the release folder at
  discovery time; generated manifest checksum drift is not a hand-repair task.
- Never give the local importer a source-controlled content-pack directory.
  Validate the release and copy it into server-owned staging because local
  import processing moves files.
- A published local content-pack repository must commit its directly importable
  data and manifest. Consumers must not build it, create client-owned staging,
  or submit arbitrary filesystem paths; only nImport creates temporary
  server-owned staging after validation.
- Do not resolve an import run or remove its staging while processed-file
  archival is still in flight. Success requires every processed file to reach
  its governed success location; archival failure must fail the run.
- Preserve the same `importRun` object across header finalization, finalized
  file processing, and model dispatch. Nested pipeline boundaries must not
  discard record counters, failures, tenant exclusions, or traceability.
- Configuration is disabled by default. Project and environment layers enable
  sources, permissions, cleanup, and update policy without changing framework
  source.
- Browser-facing file import must be media-reference based. Axis or another
  frontend uploads files through `nodics.wcms/media`; `nImport` resolves a
  trusted media descriptor and owns import-run staging. Do not let a frontend
  submit raw local paths, cloud object keys, NAS paths, bucket names, or
  provider URLs as import authority.
- `nImport` must not own multipart upload parsing or media storage. `media`
  must not parse import records or dispatch schema/search writes. Preserve the
  boundary even when both capabilities are used in one employee workflow.
- The secured browser-facing import entry point is
  `POST /nodics/import/v0/media`. It accepts `mediaCode` plus either a
  generic `moduleName`/`schemaName` target or an optional future
  `definitionCode` template, and optional `options.validateOnly`; it must
  generate a run-local header, stage the media through
  `DefaultMediaImportSourceStagingService`, and then use the existing local
  import/finalized-data pipelines. Do not add another path-based browser route.
- Validation-only media imports may stage the media and run the existing local
  import initializer so file format, headers, row parsing, and finalized-record
  preparation are proven. They must stop before `processDataImportPipeline`;
  they must not dispatch schema/search writes or report installation as
  complete.

Release composition uses target-qualified headers and current lower JS sources;
only executing-delta keys reach persistence. Evaluate Init deltas on every boot,
skip current receipts, and reject running or same-version edited Init releases.
See [layered composition](llm/contracts/README.md#layered-immutable-source-composition).

This capability declares an inert model-service inventory for [governed Local reset](../../../nSystem/llm/contracts/local-reset.md).
A server must explicitly select it; contributions never enable reset or bypass tenant, environment, confirmation or required-service checks.

Release execution claims durable installation receipts through the existing
managed-counter database contract. Require matching attempt identity for
completion; never fail unstarted releases or take over a running attempt on a
timeout. See [concurrent release execution](llm/contracts/README.md#concurrent-release-execution).

Route-category defaults belong to this capability; deployments supply only intentional overrides.
Preserve nRouter enforcement and independent route authorization. See [exposure ownership](../../../nRouter/llm/contracts/README.md#capability-owned-exposure-defaults).

Own release safeguards and inert initialization profile templates. Deployment selection and exact-release permissions remain mandatory; see the local contract.

Content-pack defaults belong to `data.contentPacks.defaults` in this capability. Selected packs inherit source conventions, update policy and complete presentation fields; partner contributions override only intentional differences. Resolve omitted content paths from the selected manifest section, preserving explicit path overrides and all import authorization/checksum/staging guards. See `llm/contracts/README.md#content-pack-defaults-and-manifest-paths`.

Sample releases are available to authorized manual operators by default, with optional deployment restriction. Only Init can auto-run at startup. Environment scope reads the canonical `environment.class`; never derive it from the selected environment name or another capability policy. Permissions, roles, tenant isolation, release checksums and durable receipts remain mandatory.
