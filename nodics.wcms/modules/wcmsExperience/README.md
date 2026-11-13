# WCMS Experience

`wcmsExperience` resolves published CMS components and containers for targeted storefront journeys.

The module exists so business users can configure page experiences in Axis, publish them through the WCMS lifecycle, index the safe delivery projection through Discovery/Search, and let storefronts render the right content for the route being viewed.

## Ownership

- WCMS owns authored content, components, containers, placements, preview, publication, and delivery safety.
- Discovery owns reusable indexing, query, projection, publication, ranking, and runtime seams.
- Storefronts such as Agora render only approved logical renderer contracts.
- Commerce/Search owns product result sets, variants, prices, availability, filters, sorting, and pagination.

`wcmsExperience` is intentionally under `nodics.wcms/modules` because experience targeting is content-management behavior. It is not a foundation runtime primitive and it is not customer-specific storefront code.

## First supported journey

The first vertical slice resolves product-listing hero content:

```text
/shop
  -> default product-listing hero

/shop?collection=summer-edit
  -> collection-specific hero
  -> fallback to default hero when the collection placement is missing or inactive
```

## Runtime rule

Before publication, an authorized employee can explicitly prepare and inspect a
private Staged preview. The owner checks current CMS Site/Catalog scope, pins
source content, and uses Discovery's existing immutable-generation writer and CAS.
Incomplete or uncertain generations remain hidden. Inspect before retrying; retire
only the exact pending revision/token if a replacement preparation is needed.
Saving/importing does not prepare a preview automatically. This changes no Online
alias or approval: review, approve and publish remain separately authorized user
actions, and one user may perform them when holding the required permissions.

Do not make every WCMS runtime depend on Discovery because this optional capability exists. A server should activate `wcmsExperience` only when it needs targeted, indexed CMS delivery.

Experience Studio appears in CMS's existing Content and Experience navigation
group (`content`, order `200`). Its owner provider supplies that identity; Axis
does not merge unrelated groups by label. Routes, child navigation, PREVIEW state
and separate action permissions remain unchanged.

## Extension path

Projects customize by adding later-layer placements, renderer contracts, seed data, service overrides, and configuration. They should not edit framework module data.

## Safety rules

- Do not return draft content from Online delivery.
- Do not execute frontend code from CMS payloads.
- Do not put customer seed data in this framework module.
- Do not duplicate Commerce product search.
- Do not duplicate Discovery provider logic.
- Do not let Agora or another storefront execute targeting rules.

## Frozen implementation contracts

Before deeper implementation, this module freezes the mandatory governance contract in:

```text
llm/contracts/experience-governance-contract.md
```

The frozen rules are:

- CMS is the authoring source of truth.
- `cmsExperiencePlacement` is the targeting and placement source of truth.
- Discovery/Elasticsearch is the delivery projection only.
- Online storefront delivery must read only current published projections.
- Axis preview may read Staged projections.
- request-time resolution must not scan all CMS components.
- publication/indexing must be idempotent and rollback-safe.
- Axis permissions must separate view, edit, preview, publish-status, and override/rollback actions.
- every projected component must carry renderer key and contract version.
- end-to-end business/developer documentation is required before the capability is marked complete.

Route-category defaults belong to this capability; deployments supply only intentional overrides.
Preserve nRouter enforcement and independent route authorization. See [exposure ownership](../../../nodics.foundation/modules/nRouter/llm/contracts/README.md#capability-owned-exposure-defaults).

Index Status observes one selected Staged journey through Discovery. It reports EMPTY, OBSERVED or UNAVAILABLE, not certified Online health. Operational resolution has no fixture fallback. Missing qualified Staged indexing remains a deployment prerequisite; see the scoped observation section of the governance contract and `wcmsExperienceEvidence.test.js`.


## Reviewed Online experience generations

Placements are frozen as hashed values in the existing publication dependency journal before review. CMS manifests retain these values, including chunked Site releases. The reviewer sees their exact targeting. Online Experience reads only active public pointers and frozen component graphs. Discovery guarded generations own current-alias publication, acknowledged visibility and exact-count proof. Pending generations never replace the previous complete public projection. Explicit Site-authorized inspection, exact-revision retirement and rebuild provide recovery; unknown writes are never replayed or deleted. Public generation reads enter the existing service-token transport when actorless. Defaults and bounds remain in Framework.

Guided Experience Studio inspection uses GET authoring/placements for an exact saved CMS page. The owner returns existing scoped placements, declared slots and configured website targets. PUT on the same endpoint accepts one inspected revision and source stamp, rejects equal-priority overlap, and verifies a single persisted acknowledgement. Content remains CMS-owned; preview and publication remain separate explicit actions. New target identities are established in their business owners, not inferred by Axis. See the guided-authoring governance section.

Standard workflow copy belongs to this module in `src/service/localization/workflowMessages.json`. Its contribution exposes stable public-safe UI labels only, never records, permissions or internal errors. English definitions and Arabic reference values use the Localization contribution, draft, review, approval and release APIs; loading the module does not approve or publish translations. Later project layers may supply intentional scoped translations through the same owner workflow. Preserve exact message parameters, authorization and uncertainty guidance.
