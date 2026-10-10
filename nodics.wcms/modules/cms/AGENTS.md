# cms Agent Contract

Documentation discovery reads canonical CMS product records through existing
authorized APIs. See [the discovery contract](llm/contracts/README.md#documentation-product-discovery).
Never duplicate product identities in properties or read tenant content during
synchronous capability registration. Existing initialization profiles supply
publication bindings; CMS records and delivery retain content/access authority.

This file gives AI coding agents mandatory guidance for this Nodics module or package boundary.

## Inheritance

- Follow the repository AGENTS contract: `../../AGENTS.md`.
- Follow the parent WCMS contract and the `nodics.foundation` runtime contracts.
- If a deeper child module has its own `AGENTS.md`, follow that file for changes inside the child module.

## Module Work Rules

- Treat this directory as a layered Nodics module boundary when it contains `package.json`.
- Keep capabilities stable and make implementations replaceable through the module hierarchy.
- Do not hardcode project, environment, server, node, tenant, or customer behavior into reusable framework code.
- Put configurable behavior in layered configuration, schemas, routers, services, pipelines, data, and runtime governance.
- Update the concise `README.md`, canonical documentation content, `llm/contracts`, `llm/examples`, generated context, and tests whenever behavior or extension contracts change.
- Use `llm/contracts` for exact module-local AI/developer rules, `llm/examples` for approved patterns, and `llm/generated` for source-derived facts. Do not add a module-local llm README file; this `AGENTS.md` is the AI navigation and behavior entrypoint for the module.
- Generated files must be recreated from source definitions; do not hand-maintain generated artifacts as source of truth.
- Storefront-bound public delivery accepts only the page path and an opaque
  Storefront handle. Validate the handle through service-authenticated
  Storefront introspection for the `cms` audience; never trust caller Site,
  tenant, enterprise, locale, or channel overrides and never copy Storefront
  context authority into CMS.
- Shared employee UI composition is opt-in on the existing publication baseline
  Site descriptor, with bounded exact paths. Authorize the original employee,
  using canonical nAuth human/access claims after normal context validation,
  never the issuance-only `type` field,
  then privately read only the project-authority Online pointer and pinned
  manifest. Never retarget generic delivery reads, employee context, business
  data, Media or writes. Follow [the delivery contract](llm/contracts/content-delivery-contract.md#shared-employee-composition).

This capability declares an inert model-service inventory for [governed Local reset](../../../nodics.foundation/modules/nSystem/llm/contracts/local-reset.md).
A server must explicitly select it; contributions never enable reset or bypass tenant, environment, confirmation or required-service checks.

Route-category defaults belong to this capability; deployments supply only intentional overrides.
Preserve nRouter enforcement and independent route authorization. See [exposure ownership](../../../nodics.foundation/modules/nRouter/llm/contracts/README.md#capability-owned-exposure-defaults).

CMS owns generic guided-publication acceptance defaults: select the WCMS_STAGED
runtime and an enabled initialization profile using the framework `foundation`
template. Application publication selections, Site identities and delivery probes
belong to their accelerator or customer pack. Defaults never install or publish data.

CMS owns neutral publication target and Process transport mechanics in its
properties. Connection names, enablement, provider selection and application
release policy remain explicit deployment/customer choices. A null connection
must not be replaced with an inferred runtime or implicit approval. Keep these
defaults out of cmsStaged and server overlays when unchanged.

CMS owns the complete canonical `acceptance:guided-initialization` suite.
Documentation navigation derives current reader metadata only from reachable,
active canonical articles in the exact frozen Site/locale/channel/access scope.
Never read latest content, mutate shared release scaffolding, or reuse stale
search text when an article is absent or ambiguous. See [the manifest contract](llm/contracts/publication-manifest-contract.md#documentation-navigation-projection).
Publication dependency collection must not truncate stable identities behind
retained version history. Keep bounded descending-version reads, exclude already
resolved codes, preserve the source query and original authority, and reject
non-advancing evidence or too many distinct dependencies.
Retained Media readiness uses bounded owner pointer batches around exact
metadata and physical-byte checks. Reject incomplete batches and changed
pointers; never cache READY on the server or relax target authorization to
reduce request volume. Legacy provider overlays retain exact single-asset reads.
Projects supply initialization/publication profiles and delivery fixtures, not
assertions. Imports are inert; execution requires `--execute --approve-publications`.
Verify idempotency, Online import denial, workflow lineage and delivery through
owner APIs. Never promote emergency approval into acceptance defaults or retry a
denied decision with broader authority. A missing/denied normal approval is a
failed acceptance result. `test/guidedInitializationAcceptance.test.mjs` covers
independent customer inputs and rejection boundaries.
