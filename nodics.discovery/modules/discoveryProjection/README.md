# discoveryProjection

`discoveryProjection` owns the normalized Discovery document shape used before
records are handed to a search engine. It keeps projection validation generic
so Commerce, WCMS, Profile, and later domains can publish searchable documents
without copying search-specific logic.

## Ownership

- Owns generic projection structure and validation helpers.
- Does not own source records, storefront DTOs, or search-engine provider
  clients.
- Keeps projection contracts tenant-safe and reusable across domains.

## Extension

Add domain-specific source fields in the owning source/provider module, then
map them into the generic projection contract. Do not hardcode one domain's
shape into this module.

Physical provider indexes may be customized through nSearch's layered index
definitions while retaining the logical `typeName`. Projection services resolve
that logical identity rather than treating the physical index as a registry key.
See the [binding contract](llm/contracts/README.md) and
`test/customPhysicalIndexBinding.test.js` for customization and failure coverage.

## Verification

Run the focused contract test from the repository root after changes:

```bash
node nodics.discovery/modules/discoveryProjection/test/discoveryProjectionContract.test.js
```

This capability declares an inert model-service inventory for [governed Local reset](../../../nodics.foundation/modules/nSystem/llm/contracts/local-reset.md).
A server must explicitly select it; contributions never enable reset or bypass tenant, environment, confirmation or required-service checks.

Stateful operations now route through canonical DMS to the unique publication
owner. See [qualified operations](llm/contracts/README.md#qualified-stateful-operations)
for permissions, payload boundaries, deployment overrides and portable physical commands. Live provider models stay private; callbacks
are recreated on the physical owner and never serialized.


Internal routes declare their `moduleInternal` exposure default here with neutral
`inheritUnknown: true` policy. Registration preserves nRouter's existing unknown
category denial or common default; it never enables a service, grants permissions
or qualifies a provider. Later explicit category overrides remain supported.
See nRouter's capability-owned exposure contract and
`apiExposureOwnershipContract.test.js` for default, denied and override evidence.

Actorless trusted domain calls use the existing DMS authenticated HTTP transport,
even for a cohosted Projection owner. The module facade selects `local:false` before
its single dispatch; payload callers cannot choose it. DMS obtains the existing
runtime service token, and nRouter still enforces module/permission/tenant grants.
Never synthesize authData, widen grants or fall back to local execution after a
denial. Authenticated local domain calls retain their existing identity. The routing
test covers cohosted actorless reads and denied service transport; live service-token
admission remains a separate deployment check.

Projection and retirement permission vocabulary is contributed by this module’s explicit `init-v001` release through Profile `ensureReferenceAll`. Import preserves existing records and never grants service scopes, changes credentials or activates a runtime. Service callers require separately approved exact permissions. Every fixed internal route must have an owner-matching vocabulary entry.

Legacy source refresh must await the existing Discovery/nSearch visibility acknowledgement before reporting PROJECTED. A rejected, missing or failed-shard refresh remains unconfirmed; never retry writes automatically. Governed Discovery projections default to uncached reads so a cached empty or prior result cannot override refreshed source or generation evidence. Source policy and published Online digest checks still run before and after retrieval.
