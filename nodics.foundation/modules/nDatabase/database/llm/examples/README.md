# database AI Examples

This folder contains examples that help AI agents and developers work correctly inside the `nodics.foundation/modules/nDatabase/database` module boundary.

Prefer small examples that show proper layered customization, configuration overrides, service extension, schema/router changes, tests, and documentation updates without modifying unrelated Nodics code.

The focused `test/localResetManagedRemoveContract.test.js` example verifies a
configured Local reset against a managed schema, then rejects a normal bulk
request and forged authority objects. Use the provider and coordinator APIs;
never construct an authority in project code or remove data through a driver.

## Customize metadata once

In a later-loaded module's existing `src/schemas/schemas.js`, extend the owning
schema's `backoffice` metadata. For example, declare an existing optional
`internalNotes` field in `excludedFields`, or add a keyed business form section.
Use the schema's existing hierarchy; do not create another schema catalogue.

Both `/<schema>/capabilities` and canonical schema detail then reflect
the same effective schema. Safe search accepts only advertised fields and excludes
protected properties from its record projection. A form section is presentation;
required fields cannot be hidden by changing the form.

For reusable logic that cannot be expressed as metadata, override the existing
`DefaultSchemaUtilityService` method within the established module service merge.
An override formerly named `DefaultSchemaWorkbenchService.buildForm` moves to
`DefaultSchemaUtilityService.buildForm`. Do not retain two implementations.
Preserve metadata filtering and the separate authoring/access authorities.

Verify `schemaUtilityContract.test.js` for missing utility ownership, denied
schemas, active API aliases, original revision tokens, Online write rejection,
protected filters and the generated templates without a Workbench service.
The current namespace is `schemaApi`; old Workbench paths and runtime adapters
are removed. Update governed grants with current configuration. Rebuild/restart each affected runtime through the existing
process; missing/stale generated artifacts must not trigger a Workbench fallback.

## Generated writes from a schema-aware client

Create with `PUT /<schema>` and a raw model object. Update with
`PATCH /<schema>` and `{ query: { code: 'record-one', revision: 4 },
model: { name: 'Changed' }, options: { recursive: false, returnModified: true } }`.
Use the schema's actual identity/counter fields. Delete uses the existing
`DELETE /<schema>` query envelope. Managed tokens are original values; the owner
computes the next value. Handle 409 by reloading and reviewing, never silent retry.

Supply a valid `Idempotency-Key` header when the owning workflow uses one. Generic
header forwarding is not durable deduplication. Never put `authData`, `tenant`,
`moduleName`, `transactionContext`, or bypass flags in an envelope to select
runtime authority. Unknown/protected/read-only model values are omitted and
trusted scope is applied; extend the effective schema for legitimate new fields.

A former Workbench `buildMutationModel`/`getEnterpriseCode`/`getIdempotencyKey`
customization moves to `DefaultSchemaUtilityService` so every current consumer agrees. Keep ownership, policy and counter enforcement in their existing
owners. The tests demonstrate key forwarding, field filtering, callback/promise
parity, aliases, no-write rejection and persisted-record response normalization.

## Selective API route projection

A prepared `DefaultItemController.save` route with method `PUT`, key `/items`,
version `v2` and `active: false` projects as:

```json
{"create":{"method":"PUT","path":"/items","apiVersion":"v2","active":false}}
```

This disables that client operation; do not retry another transport. A later
module can customize the existing route declaration. Keep it static and relative,
and retain the generated model body contract. Conflicting routes for `save` need
an explicit resolution in the owning route configuration, not client guesswork.


## Canonical discovery customization

A later module contributes fields through the existing schema definition. They
appear through `/schemas/:schema` and generated capabilities after effective schema
composition; no client field list or second schema catalogue is needed.

```javascript
// config/properties.js in the later module
module.exports = {
    schemaApi: { discoveryPermission: 'schema.discovery.read' }
};
```

Grant `schema.discovery.read` through existing identity governance to intended
principals. The canonical collection/detail routes resolve this
property. The existing exposure category and schema access still apply. To turn
discovery off for tagged routes, use the existing exposure configuration:

```javascript
module.exports = {
    apiExposure: { categories: { schemaApi: { enabled: false } } }
};
```

That category also governs other tagged APIs; inspect the selected runtime's
route metadata before changing it. To disable only one inherited route, use its
existing `active: false` override. Neither switch changes stored schemas.

For an operation override, implement exported `listSchemas` / `getSchema` on the
existing Schema Utility service through normal module inheritance. Keep the same
secured request and response contract. Do not copy a base service or install a
parallel registry. Tests should cover canonical/generated equality, retired-route
absence, the new field,
removed/hidden fields, allowed and denied principals, inactive aliases, Staged and
Online descriptors, and callback/error completion without Workbench services.


## Selective resource transport

```javascript
// In the existing owning schema declaration
router: { enabled: true, groups: { schemaOperations: true } }
```

This selects the shared canonical templates. Effective schema operations and
access determine usability; a read-only schema still rejects writes. An explicit
empty groups object selects none and a false entry disables its inherited group.
For selected-record updates/deletes supply the actual primary key and original
required revision; broad filters are not a selected identity. Bulk requires
schema opt-in and a valid header key; managed-counter multi-record CAS is rejected.
Enterprise setup uses Profile POST `/enterprises` with `{ model }` and an
`Idempotency-Key`; never route it through a generic enterprise PUT.
