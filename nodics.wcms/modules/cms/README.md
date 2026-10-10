# cms Module

Generic authoring follows effective schema publication metadata and the existing
runtime role: publishable sources are Staged-only; publication projections and
receipts are read-only to Workbench/generated HTTP CRUD. Owning publication and
approved import services retain their governed paths. Project customization and
failure cases are documented in
`nodics.foundation/modules/nDatabase/database/llm/contracts/schema-authoring-authority.md`
and the canonical Foundation schema-data-modeling guide.

CMS owns content sites, catalogs, routes, pages, templates, slots, components, renderer metadata, localized content, and resolved delivery behavior.

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

- `nodics.wcms/modules/cms/data/docs-v001/records/documentation/cmsDocumentationComponentData.js`
- `nodics.wcms/modules/cms/data/docs-v001/records/documentation/cmsDocumentationComponentData.js`
- `nodics.wcms/modules/cms/data/docs-v001/records/documentation/cmsDocumentationComponentData.js`

## Verification

Operator reconciliation with `publicationCode` processes only that publication's
outbox events; unscoped startup recovery remains tenant-bounded. See the
[manifest contract](llm/contracts/publication-manifest-contract.md) and
`test/cmsPublicationOutboxReliability.test.js` for scope and failure coverage.

`test/cmsPublicationTargetRouteContract.test.js` guards service-token-only
publication target routes and the API-only guided acceptance boundary.
`test/guidedInitializationAcceptance.test.mjs` exercises independent customer
fixtures, Online import denial and failed normal approval without live APIs.
Customer suites retain only their selected roles, release pins and fixtures.

Run CMS/WCMS contract tests when content model behavior changes, then run:

```bash
npm --prefix nodics.docs test
npm run quality:docs
```

This capability declares an inert model-service inventory for [governed Local reset](../../../nodics.foundation/modules/nSystem/llm/contracts/local-reset.md).
A server must explicitly select it; contributions never enable reset or bypass tenant, environment, confirmation or required-service checks.

Route-category defaults belong to this capability; deployments supply only intentional overrides.
Preserve nRouter enforcement and independent route authorization. See [exposure ownership](../../../nodics.foundation/modules/nRouter/llm/contracts/README.md#capability-owned-exposure-defaults).

CMS owns generic guided-publication acceptance defaults: select the WCMS_STAGED
runtime and an enabled initialization profile using the framework `foundation`
template. Application publication selections, Site identities and delivery probes
belong to their accelerator or customer pack. Defaults never install or publish data.

CMS also owns the complete `acceptance:guided-initialization` tooling suite.
Invoke it through `nodics project:run acceptance:guided-initialization --execute
--approve-publications` only when normal installation/publication is intended.
Customer projects provide their profile and delivery inputs; assertions and normal
approval boundaries remain in CMS. See [the acceptance contract](llm/contracts/README.md#canonical-guided-acceptance).

Publication collects distinct latest dependency identities through bounded reads,
excluding already resolved codes so retained version history cannot hide routes
or assets. It preserves source query and caller authority and rejects truncation
or non-advancing provider evidence. See `test/cmsPublicationHistoryCapacity.test.js`.
