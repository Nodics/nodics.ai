# nSystem AI Contracts

Property governance also exposes secured `POST /config/runtime/request/activate-due`
and `POST /config/runtime/request/reconcile-property`, both with existing
`runtime.config.request.activate` permission and runtime-configuration exposure.
nSystem only delegates; nDynamo owns bounded due selection and evidence-only
reconciliation, while CronJob owns scheduling. Preserve trusted tenant context,
empty dispatch payload and no uncertain replay. See
[durable property operations](../../../nDynamo/llm/examples/durable-property-activation.md).

When durable property persistence is enabled, delegate commits and refresh to
nDynamo's [durable property owner](../../../nDynamo/llm/examples/durable-property-activation.md).
Startup restoration must propagate failure. Never apply event-supplied values or
perform in-memory-only rollback of a durable record. The following legacy audit
limitation applies when that deployment opt-in is disabled.

Property activation must match both the approved previous snapshot and next
snapshot against a fresh owner preview. Audit promise failures propagate to the
caller. A failure after in-memory application is uncertain, not proof of rollback
or durable cross-node persistence. Preserve the nDynamo
[revision-safe claim and recovery contract](../../../nDynamo/llm/examples/revision-safe-activation.md).

This folder contains module-specific AI/developer contracts for `nodics.foundation/modules/nSystem`.

Use these files for rules that are more specific than root `AGENTS.md` and the module `AGENTS.md`, especially extension boundaries, override expectations, testing rules, security constraints, and generated-artifact responsibilities.

Secured service-registry API exposure defaults to enabled for runtime registration/contract retrieval. Exposure never bypasses service-token, grant or route permissions. Standalone deployments can explicitly disable the category.

## Runtime configuration schemas and refresh propagation

Module startup restores tenant-default schema records after durable property
restoration. The generated runtime-value owner is optional when Dynamo is absent;
when present, exact deterministic record reads are limited to active tenants and
their declared schemas. Require matching owner, schema, tenant and default tenant
scope; reject duplicate or malformed reads and propagate storage/decryption errors
before readiness. Inactive and missing records do not override source defaults.
This restore is read-only and emits no refresh events. Non-default scopes are not
flattened into tenant defaults or given an invented precedence order.

Runtime configuration schemas are declared by the owning module through layered
`runtimeConfigurationSchemas` properties and served by nSystem. A schema defines
the editable paths, labels, validation, sensitivity, masking, and whether a
change is runtime-refreshable or restart-required. Custom projects should add
only genuine project-specific schema extensions or value overrides; reusable
Telegram, OpenAI, publishing, media, search, approval, assistant, and channel
configuration contracts belong to their owning framework, accelerator, or
application module.

Persisted runtime configuration records override source defaults through the
existing effective configuration layer. Updates must be validated through the
schema service, audited, masked in responses, and published as a
`runtimeConfigurationChanged` event. Runtimes that consume the changed paths
must refresh from the event when the schema marks the field refreshable. When a
field is restart-required, the event and readiness projection must say so rather
than silently relying on a page refresh or operator memory.

Cluster propagation uses the existing Nodics event/config refresh pattern:
node 1 saves the persisted value and publishes the change; every affected node
reloads the effective runtime configuration for the declared tenant/scope and
invalidates related readiness/search/assistant/publishing projections. Do not
add a second configuration bus, frontend polling authority, `.env` path, or
customer-project-specific sync table.

## Secret persistence prerequisites

Schema list/detail and effective-value DTOs expose `data.secretPersistence`
(each list item has its own property): `{ required, ready, reason }`.
Reasons are `NOT_REQUIRED`, `READY`, or `ENCRYPTION_KEY_REQUIRED`. nSystem derives
this content-free projection from declared sensitive fields and the existing
`runtimeConfigurationSecurity.encryptionKey` owner in the serving runtime's
loaded CONFIG. No key, hash, length, environment variable or credential is returned.
Do not accept a body readiness flag as authority or create another secret store.

`CONFIGURED` describes effective field values, not permission or ability to
encrypt a replacement. A configured credential can coexist with missing encryption
readiness. The validate DTO repeats `secretPersistence`, scoped to submitted known
sensitive fields. Public validation still rejects plaintext sensitive submissions;
only the existing dedicated secret-save operation admits them. Save rechecks the
prerequisite before constructing records, encrypting, persisting, applying patches
or publishing events. Encryption independently retains its missing-key refusal.
Ordinary non-sensitive updates do not acquire a new encryption-key prerequisite.

Axis/control-plane consumers should inspect schema/effective readiness before
accepting a secret replacement, explain `ENCRYPTION_KEY_REQUIRED`, and prevent
secret submission while it is unresolved. Keep ordinary updates available and
handle fresh server rejection if readiness changes after form load. Preserve route
permissions and existing approval/activation requirements; readiness grants none.
Do not submit plaintext secrets to the public validate endpoint. These DTOs do not
prove logger/APM privacy, successful decryption of historical records, key-rotation
compatibility, provider connectivity or delivery.

Operators must provision the existing encryption prerequisite through approved
deployment-owned configuration, outside the credential form. This contract does
not generate keys, bind arbitrary environment variables, rotate existing keys or
authorize credential entry. Every reader of encrypted records must retain a
compatible key; changing it without an approved migration can strand records.

nSystem owns an optional default environment descriptor for this prerequisite:

```js
runtimeConfigurationSecurity: {
  encryptionKey: {
    $config: "env",
    name: "NODICS_RUNTIME_CONFIGURATION_ENCRYPTION_KEY",
    type: "string",
    fallback: null
  }
}
```

The existing nConfig contribution loader resolves this at bootstrap; unset or
empty input resolves to `null` and keeps secret persistence unavailable. It does
not enable other gates or manufacture a key. Supply the real input privately to
each intended server process through the approved deployment environment, not
source, chat, browser fields or a duplicated customer default. Later approved
layers may deliberately override the binding or explicitly disable it with
`null`; ordinary configuration precedence remains intact. nConfig's finite env
descriptor vocabulary does **not** support `secret: true`; adding that field
fails declaration validation. A binding is not logger/APM redaction metadata.

Rebuild the backend using the owning build workflow if the running distribution
predates this contribution, then restart each affected runtime with its approved
environment input. An already-running process or an earlier build does not gain
this binding from a browser refresh or a `runtimeConfigurationChanged` event.
Inspect the content-free readiness on that runtime after restart before private
credential entry. Do not rotate an existing encryption key merely to make the
readiness indicator pass.

nConfig's canonical mandatory logger policy now protects `encryptionKey` and this
exact environment-variable name, including the registry's safe diagnostic
projection and nCommon outward error serialization. This optional binding adds
no configuration logging; loader diagnostics print paths and nSystem readiness
remains content-free. Do not dump internal CONFIG or process environment, log a
bare key or infer external transport/APM qualification from the binding. Use
`CONFIG.getPublicProperties(tenant)` for authorized outward diagnostic consumers.
No positional sensitive-key array overwrite is introduced here. See nConfig's
[privacy contract](../../../nConfig/llm/contracts/README.md#runtime-encryption-input-privacy)
for canonical ownership and remaining deployment capture gates.

Select the actual consuming runtime and tenant before inspection or update.
For Telegram, Profile's identity verifier resolves the application's logical
credential in the Platform runtime, while Communication's delivery provider resolves
the channel credential in the runtime hosting delivery (typically Engagement).
Identical logical references do not mean identical effective configuration or
shared database records. `scopeLevel`/`scopeCode` identify persisted record scope;
they do not select a remote runtime or synchronize separate databases. Verify
schema availability, permissions, encryption prerequisite and masked effective
values separately in each consumer. Existing event refresh only reaches configured
participants with access to the corresponding persisted record; never claim that
one successful save proves another runtime is configured.

Later layers extend the same exported schema service and owner-contributed fields,
not an Axis encryption implementation. Preserve content-free readiness, fresh save
validation and encryption enforcement when overriding. Focused synthetic fixtures
cover ready/missing-key DTOs, configured-but-not-writable secrets, stale/forged
readiness, refusal before persistence, ordinary-field compatibility and customization.
Live deployment/key provisioning and frontend acceptance remain separate gates.

## Effective Credential Status

Effective configuration must satisfy its declared scalar type as well as presence,
placeholder and pattern checks. Runtime/secure fields use the schema path; generic
credentials may select the logical reference and unwrap its supported scalar
`value`, `token` or `secretReference` member. Empty/null-valued wrappers,
unresolved descriptor objects and encrypted envelopes are not usable credentials.
Never stringify such an object into a masked value and call it configured. Typed
non-sensitive false/zero values remain supported. First-present source precedence
is unchanged; an invalid selected source does not silently adopt another layer.

`CONFIGURED` still does not attest provider authentication, successful delivery,
business activation, encryption-key availability or a remote runtime's readiness.
The effective DTO currently exposes the authored `sourcePath`, not the winning
source root, record revision or database provenance. Do not infer whether a
live value came from a fixture, persisted record or source override from a mask.
Use an authorized content-free owner diagnostic when that provenance is required;
do not inspect raw credentials or access a database to fill that evidence gap.
