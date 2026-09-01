# WCMS Experience Governance Contract

Status: Frozen for first implementation.

This contract freezes the mandatory Nodics principles for `wcmsExperience` before deeper implementation.

## 1. Lifecycle boundary

The canonical lifecycle is:

```text
CMS authoring or imported Staged data
  -> publish approval
  -> WCMS Experience projection build
  -> Discovery/Elasticsearch versioned index
  -> Online resolver reads current published projection
```

Storefront/runtime delivery must not read draft or mutable Staged CMS records directly.

## 2. Source-of-truth boundary

- CMS components and containers are the renderable content source of truth.
- `cmsExperiencePlacement` is the targeting and placement source of truth.
- Discovery/Elasticsearch is the optimized delivery projection, not the authoring source.
- Agora and other storefronts render approved renderer contracts only.
- Axis is the authoring, preview, governance, and status surface.

Customer or reference seed data must live in customer/project modules such as `agora.apparel`, not in this framework module.

## 3. Publication hook

Indexing must be triggered only from committed CMS publication flow after approval/activation has a durable publication event.

Indexing must not run from:

- draft component save;
- ad hoc staged import alone;
- storefront request-time rendering;
- frontend code.

## 4. Idempotency and rollback

Publication/indexing must be safe to retry.

Required behavior:

- indexing the same release twice produces the same effective projection;
- failed indexing does not switch the Online alias;
- previous Online projection remains active until the new projection is complete;
- rollback restores a previous approved projection;
- partial projection failure must not expose broken Online delivery.

## 5. Axis permission model

Axis/BackOffice must expose separate permissions for:

- `WCMS_EXPERIENCE_VIEW`
- `WCMS_EXPERIENCE_EDIT`
- `WCMS_EXPERIENCE_PREVIEW`
- `WCMS_EXPERIENCE_PUBLISH_STATUS`
- `WCMS_EXPERIENCE_OVERRIDE`

Experience Studio may later be integrated with Page Designer, but both surfaces must use the same backend model and permissions.

## 6. Storefront-safe resolver response

Public resolver responses may include only storefront-safe component projections:

- slot;
- placement code;
- component code;
- renderer key;
- contract version;
- properties;
- media;
- release/index metadata safe for diagnostics.

Public resolver responses must not expose:

- draft content;
- raw rules or scoring internals;
- Mongo/internal storage identifiers;
- privileged authoring metadata;
- executable frontend code.

## 7. Performance guardrails

Request-time resolution must query indexed placement projections and must not scan all CMS components.

Mandatory limits:

- bounded query by site, page type, target dimensions, locale, channel, device, and date;
- maximum slot and component limits from configuration;
- cache support for repeated delivery lookups;
- deterministic fallback behavior.

## 8. Renderer compatibility

Every projected component must carry:

- `rendererKey`;
- `contractVersion`;
- safe `properties`;
- optional media references.

Storefronts must ignore or safely degrade unsupported renderer keys or contract versions.

## 9. Staged preview and Online delivery split

- `previewMode=true` may resolve Staged projections for Axis preview.
- public storefront delivery must resolve only Online/current projections.
- Online delivery must never return Staged-only draft content.

## 10. Documentation requirement

The implementation is not complete without end-to-end documentation for:

- developer contract;
- business user guide;
- Axis Experience Studio guide;
- collection journey example;
- brand journey example;
- default fallback example;
- publication/index status and troubleshooting.
