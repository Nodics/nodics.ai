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

Do not make every WCMS runtime depend on Discovery because this optional capability exists. A server should activate `wcmsExperience` only when it needs targeted, indexed CMS delivery.

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
