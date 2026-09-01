# WCMS Experience Contracts

These contracts document the first stable payloads for WCMS Experience resolution.

## Resolver request

See `experience-resolve-request.json`.

Required fields:

- `site`
- `pageType`
- `targetType`
- `targetCode`

Defaulted fields:

- `locale`
- `channel`
- `device`

## Resolver response

See `experience-resolve-response.json`.

The response is grouped by slot. Each slot contains storefront-safe component projections with logical renderer keys and contract versions.

## Index document

See `experience-index-document.json`.

The document represents a published delivery projection. CMS remains the source of truth; the index is optimized delivery state.

## Developer implementation contract

See `developer-implementation-contract.md`.

This file provides the low-level implementation contract for ownership, module dependencies, lifecycle, resolver request and response shape, indexing, preview safety, performance limits, and extension rules.

## Governance contract

See `experience-governance-contract.md`.

This file freezes lifecycle, authority, security, performance, renderer compatibility, preview/Online split, idempotency, rollback, and documentation requirements before deeper implementation.
