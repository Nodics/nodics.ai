# nodics.location contracts

`nodics.location` owns reusable physical-place identity, operational map
coordinates, map layers, nearby search, drafts, approval, and marker projection
contracts.

## Address boundary

- Profile `address` and `contact` remain canonical for reusable address/contact
  facts.
- Location references Profile address through `addressRef` and Profile contacts
  through contact references.
- Do not add postal fields, country, administrative divisions, landmark/access
  notes, reusable address geocoding metadata, address verification metadata, or
  reusable privacy-safe display rules to Location schemas.
- Location keeps the operational map point as separate `latitude` and
  `longitude` fields because marker/search placement can differ from the
  address geocode.

## Location schema

- `locationCore.location` carries place identity, category/type, status,
  `latitude`, `longitude`, `addressRef`, contact refs, opening hours,
  capabilities, visibility, source reference, optional parent location,
  enterprise/operator enterprise references, media, presentation, quality, and
  revision.
- Location business schemas must not use direct `tenant` or `tenantCode` fields
  for business ownership. Runtime tenant remains an envelope, policy, storage,
  and audit concern.
- Use enterprise association fields only when ownership, operator, venue, or
  visibility scope is real business meaning.

## Map provider boundary

- Business records store `latitude` and `longitude` as separate numeric fields
  in that sequence.
- Provider-specific coordinate shapes, including GeoJSON and Mapbox
  `[longitude, latitude]` arrays, belong only inside Location-owned map,
  search, geocoding, or directions adapters.
- Adapters must translate provider payloads at the boundary and return domain
  objects with named `latitude` and `longitude` properties before any data
  reaches schemas, Waste, Store, POS, Axis, or customer-facing modules.
- Do not persist provider names, provider coordinate arrays, route paths, or
  transport payloads inside `sourceRef`; use governed provider metadata fields
  or module-owned evidence records when integration traceability is required.

## Consumer modules

- Store uses `primaryLocationRef` for its primary physical place and
  `enterpriseRef` for business ownership when needed.
- Sales Channel uses optional `locationRef` only when the channel has a physical
  or venue-specific place.
- POS uses required `locationRef` for its operating place and optional
  `operatorEnterpriseRef` when it differs from the parent store.
- Waste Collection Point uses required `locationRef` and required
  `operatorEnterpriseRef`; accepted material policy remains Waste-owned. Legacy
  collection-centre imports should reference the Waste Core contributed
  `NODICS_WASTE_MANAGEMENT_CO` demo operator until the true operator enterprise
  is confirmed. Use the Profile `default` platform owner only as a bootstrap
  fallback.

## Validation

Run:

```bash
npm --prefix nodics.location test
node nodics.platform/modules/profile/test/profileAddressContract.test.js
node test/runtime-prepare.test.js locationServer
```
