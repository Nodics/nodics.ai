# locationCore contracts

`locationCore` owns the canonical Location record and its first runtime
operations.

## Service contract

- `DefaultLocationOperationService` validates Location payloads and delegates
  persistence to generated `DefaultLocationService`.
- Runtime tenant is required as request context, but `tenant` and `tenantCode`
  are rejected from Location business payloads.
- `latitude` and `longitude` are required, numeric, separately stored, and
  validated in that business sequence.
- `coordinates` arrays and comma-separated coordinate values are invalid in
  Location records.
- `addressRef` and `sourceRef` are required object references. `sourceRef` must
  not encode tenant, environment, server, provider, or route path.
- Profile-owned address fields such as postal fields, landmark/access notes,
  geocoding metadata, verification metadata, and display policy are rejected
  from Location records.

## Direct distance contract

`DefaultLocationDistanceService.distance(a, b)` is a dependency-free, synchronous
calculation over already validated numeric `latitude`/`longitude` objects.
It returns unrounded spherical direct distance in metres using a 6,371,000-metre
Earth radius, including date-line and antipodal cases. It has no CONFIG, SERVICE,
persistence, provider or runtime-locality dependency.

Consumers in another process may require this pure export without activating
Location schemas or accessing Location persistence. This allowance applies only
to arithmetic; live place reads remain behind Location APIs. Consumers own their
freshness, eligibility and arrival policy and may override their distance hook
through normal layered services. Test with
`node --test test/locationDistanceService.test.js`.

## Route contract

Location owns `location.location.create`, `location.location.update`,
`location.location.read` and `location.location.search` in
`data/init-v001/records/identity/locationCorePermissionData.js`. The explicit
`permissionCatalogue` manifest section selects those records and
`data/init-v001/headers/identity/locationCorePermissionHeader.js`; that header
targets Profile's `permission` schema through `ensureReferenceAll`. Profile Init
pins the owner catalogue as an authority-partition prerequisite. Insert-only
imports preserve existing governed records, including narrowed or inactive ones.

Profile's `DefaultIdentityCatalogueService.requirePermissions` validates fresh
persisted vocabulary asynchronously for group governance. Missing, inactive,
duplicate or incomplete evidence rejects; neither nAuth properties nor module
activation supplies a fallback. Vocabulary validation is not an employee/runtime
grant and does not activate `locationInternal` exposure. Persisted `userGroup`
records own permission mappings; enterprise-role records reference groups, while
Profile's assignment owners separately govern actual access. Do not infer grants
from route verbs, catalogue membership or imports.

`test/locationPermissionCatalog.test.js` preserves the exact four permissions,
Profile header/prerequisite contract, awaited catalogue validation and refusal of
missing/inactive vocabulary. It reads standard `accessGroups` records selected
by the canonical Profile prerequisite manifests and verifies that create/update
are not implicitly added to those group definitions. Intentional new write grants
require separately authorized Profile governance, not migration-property targets.

Location Core exposes secured internal routes:

- `POST /locations` -> `createLocation`
- `PATCH /locations/:locationCode` -> `updateLocation`
- `GET /locations/:locationCode` -> `getLocation`
- `POST /locations/search` -> `searchLocations`

Routes use `apiExposure: locationInternal`, accept access or service tokens,
and preserve auth data, runtime tenant, idempotency key, and correlation id into
the facade request.

## Validation

Run:

```bash
npm --prefix nodics.location test
node test/runtime-prepare.test.js locationServer
```
