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

Create/update/read/search permissions are recognized by the shared nAuth
catalogue used by Profile group validation. Listing a permission does not grant
it to an employee or runtime, or activate `locationInternal` exposure. Assign
write permissions only through authorized Profile governance. The catalogue
regression verifies all four declared route permissions and that create/update
are absent from default migration group grants.

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
