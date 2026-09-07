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

## Route contract

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
