# cms Module

Generic authoring follows effective schema publication metadata and the existing
runtime role: publishable sources are Staged-only; publication projections and
receipts are read-only to Workbench/generated HTTP CRUD. Owning publication and
approved import services retain their governed paths. Project customization and
failure cases are documented in
`nodics.foundation/modules/nDatabase/database/llm/contracts/schema-authoring-authority.md`
and the canonical Foundation schema-data-modeling guide.

CMS owns content sites, catalogs, routes, pages, templates, slots, components, renderer metadata, localized content, and resolved delivery behavior.

Restricted CMS reviewers can inspect frozen publication evidence from their
Process task. CMS validates the exact task and pending revision before returning
the target, prerequisites, and a bounded comparison with retained Online content.
For site baselines without an explicit catalogue, CMS resolves the catalogue from
the exact frozen Site dependency. Missing or conflicting proof refuses review;
the approval context and lifecycle record stay unchanged.
Conflicting Process callback evidence is reported as HTTP 409 with guidance to
inspect the current publication and task; it cannot replay activation.
See [the publication manifest contract](llm/contracts/publication-manifest-contract.md#restricted-task-review).

Designer preserves existing derived identifiers and gives overlong generated
identifiers stable, bounded values. User-supplied identifiers still follow the
CMS code format and length limit.

Website reference selectors use the Site's `backoffice.displayProperties` to show
its existing business name before its stable code. Later schema layers can change
this presentation; selection values, ownership, read-only generic access and
publication authority remain unchanged.

Documentation **Install staged** uses the configured CMS baseline's service-only
content-pack preparation command. The existing baseline controller verifies the
BackOffice runtime before applying CMS-local authority; the baseline pins the pack
and release and requires the delegated human actor. nImport remains the executor.
Installation does not create a publication, request approval or activate Online.
The baseline controller and content-pack service tests cover that boundary.

## Business Authoring

See the [business authoring](llm/contracts/README.md#business-authoring) for exact admission, failure and recovery boundaries.

## Responsibility

This module provides the WCMS content model used by Axis authoring, staged publication, Online delivery, Nexus rendering, and documentation-as-content use cases.

## Developer Notes

Customer documentation discovery uses canonical CMS product records, existing
secured schema reads and the already configured initialization profiles.
[Discovery and customization](llm/contracts/README.md#documentation-product-discovery)
explain Site/profile binding, permission/publication gates and focused tests.
No additional identity map, copied capability service or import path is required.

- Model content through CMS records and content packs.
- Keep page designer metadata backend-owned and renderable by Axis.
- Use media references instead of embedding physical storage paths.

Documentation pack import includes its declared records and assets in the same
owner import operation. Publication remains governed separately: one explicit
Axis action can complete the existing CMS approval, inspect exact manifest-pinned
Media dependencies, initiate missing assets through native employee-authorized
Media APIs, and complete their existing Process approvals. CMS readiness stays
pending until every exact asset is Online. A denial stops coordination; completed
owner effects remain audited and an explicit resume skips qualified assets. This
is not a shared approval grant or a cross-runtime atomic transaction.
Retained readiness uses bounded Media pointer batches around exact metadata and
byte verification, using one read-only exact integrity batch on the default
Media owner. It rereads every active pointer and fails closed on drift;
there is no server-side READY cache or relaxed rate-limit policy.

Documentation navigation search is projected from reachable canonical articles
in the same frozen publication scope, not historical shared navigation text.
Updating this projection requires normal CMS revalidation and Process approval;
it never rewrites an existing manifest or reimports records or assets. See the
[navigation projection contract](llm/contracts/publication-manifest-contract.md#documentation-navigation-projection).
- Preserve publication, localization, route resolution, and renderer mapping contracts.

Static employee UI composition may opt into project-shared Online delivery using
exact paths on an existing publication baseline Site descriptor. Employee
authentication and permissions remain unchanged; business data and ordinary CMS
reads stay tenant-local. See [shared employee composition](llm/contracts/content-delivery-contract.md#shared-employee-composition).

## Documentation

Deep documentation lives in:

- `nodics.wcms/modules/cms/data/docs-v001/records/documentation/cmsDocumentationRelease005ComponentData.js`

## Verification

See the [validation and operational safeguards](llm/contracts/README.md#validation-and-operational-safeguards) for exact admission, failure and recovery boundaries.

Run the affected owner tests, `npm --prefix nodics.docs test` and `npm run quality:docs`.
