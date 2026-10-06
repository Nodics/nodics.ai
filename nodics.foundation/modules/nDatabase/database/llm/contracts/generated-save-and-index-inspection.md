# Generated Save and Index Inspection

## Nested Save Replacement Isolation

`DefaultModelService.saveNestedModels` copies ordinary options but strips
`allowCmsAssociationReplacement`, `replaceAllMatchesByQuery` and
`replaceArraysOnVersionMerge` unless both parent and child belong to the actual
effective `cms` schema registry. Module/schema metadata and exact parent schema
identity are required; names, caller flags and copied schema objects are not
proof. Only these admitted CMS children receive association access-group defaults
and a code query template. `versionedImport` always remains local to the selected
root operation, never inherited by children. Other options and reference-only
descriptor behavior remain unchanged.

Implicit generated save queries use fields declared `definition.primary: true`,
not the provider's `schemaOptions.primaryKeys`, which also includes ordinary
index fields. An incomplete declared identity leaves ordinary creates in insert
intent with no implicit selector, allowing existing defaults/preSave owners to
generate required keys later. Never form a partial or ordinary-index selector.
Replacement requests still reject incomplete identities before owner/provider
effects, and the Mongo replacement guard independently requires a bounded
canonical selector. Schemas without a declared primary and without explicit
`_id`/query retain insert behavior.
Ordinary indexes never become canonical write identity. Explicit queries remain
subject to their existing owner authorization/credential/managed-revision guards.

`test/nestedImportReplacementContract.test.js` connects actual import, bulk-save,
single-save, nested, query and Mongo adapter nodes with an in-memory driver. It
checks an unchanged synthetic administrator, seven distinct staff credential
references, replacement isolation and valid CMS version replacement. It also
composes the actual raw-schema loader and versioned vService/vMongodb save
path: scalar code/active/version filters, append-only successor and intact history.
Effective later-layer CMS customization uses the same registered raw schema, not
an alias. Versioned updates continue their independent owner/version fences and
insert successors; they do not dispatch multi-match save replacement. This test does
not boot a runtime, qualify installed data or authorize recovery/reinstallation.
Later-layer replacements must preserve all of these boundaries.

## Installed Index Inspection

The existing schema index controller/facade/service owns read-only inspection of
one selected module/schema. The schema-maintenance GET route accepts only human
access-token principals, requires `adminGroup` and `system.schema.view`, and
retains its route guards independently of service authorization. The service
requires a human principal and `system.schema.view`, delegating administrative
group decisions to `DefaultIdentityGovernanceService.hasAdministrativeAccess`
with effective user groups. Its existing `identityGovernance.administrativeGroups`
policy is the authority for internal callers; no copied group list or literal
belongs in inspection code. Missing/empty policy grants no administrative access.
Changing service policy does not grant access through the independently guarded
HTTP route. Tenant comes from verified
authentication, never route/body overrides. Only the selected master-channel model
is read; unlike rebuild operations, inspection cannot fan out over tenants.

Providers implement `inspectIndexes(model)`. MongoDB returns effective desired
indexes, installed index metadata, total records and records missing `versionId`.
No record bodies, connection names or credentials are returned. Unsupported
providers and unavailable models reject. Counts are separate observations, not
an atomic snapshot or a full validation of all existing version values.
`migrationAuthorized` remains false. Neither a zero missing-version count nor
matching indexes qualifies a source capture, migration, approval or activation.

Later-layer providers may customize storage inspection while preserving scope,
read-only behavior and fail-closed errors. Operators inspect the exact runtime
and retain provenance before a separately reviewed migration. Developers and AI
tools use `schemaIndexServiceContract.test.js` and the MongoDB index contract;
these cover alternate tenants, permission denial, unavailable owners, controller
callbacks and no maintenance writes. Business users receive no additional
authoring/publication capability from this administrative API.

This folder contains module-specific AI/developer contracts for `nodics.foundation/modules/nDatabase/database`.

Use these files for rules that are more specific than root `AGENTS.md` and the module `AGENTS.md`, especially extension boundaries, override expectations, testing rules, security constraints, and generated-artifact responsibilities.
