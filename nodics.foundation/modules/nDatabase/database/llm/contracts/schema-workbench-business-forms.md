# Schema Workbench Business Forms

## Authority

`DefaultSchemaUtilityService.buildForm` projects the effective schema's
`backoffice.form` into a version 1 client-safe descriptor. The existing schema
merge is the only composition authority. Axis never discovers source files or
implements domain-specific save rules. Generated APIs and the existing Workbench
adapter use the same effective utility owner. Move former Workbench metadata
helper overrides to this service so all consumers see the customization.

## Metadata and Customization

- `sections` is a keyed map of `{label, fields, enabled}`. Fields are assigned
  once, deleted properties are removed, and remaining editable properties are
  appended. `enabled: false` removes a grouping, not the underlying property.
- `hiddenFields` can hide only optional inputs. It is presentation, not access
  control. Use effective schema access and `excludedFields` for protected data.
- `managedCreateFields` applies only with an advertised CREATE aggregate named
  by `createOperation`. The owning service derives and validates those values.
- `copy` accepts only the generic schemaWorkbench.form copy keys; labels contain
  text, not executable code. `defaultColumns` references known effective fields.
- `completionAction` contains a label and internal single-slash path. Template
  values are URI-encoded by Axis. A continuation does not grant authorization.
- Relationship label/description precedence is explicit `backoffice.relationships`
  copy, then the same field's `backoffice.fields` copy, then the schema property.
  Both schema-level relationships and field references use the same utility
  projection. This presentation inheritance never changes reference values,
  targets, cardinality, allowed actions, required inputs or delete protection.

## Save Rules

A declared create operation uses the existing aggregate endpoint and an owning
service. Generic Workbench and generated HTTP create/createAll paths reject
bypassing it. Existing trusted service/import paths retain their authority.
Updates retain concurrency and publication contracts. No automatic publication,
latest-token retry, permission escalation or target deletion is introduced.

Nested creates remain drafts until confirmation of the root form. The client
saves children before parents, keeps successful child references while mounted,
and sends only the declared reference representation. This is not a distributed
transaction or durable draft store. The owner must implement idempotency and
recovery for domain commands; partial success must remain visible.

## Required Tests

Cover layered additions/deletions, required-field visibility, undeclared create
operations, copy bounds, protected values, runtime ambiguity, typed values,
nested cancellation, retry checkpoints, authorization and save-path enforcement.

## Preserve placement during generated updates

`DefaultSchemaUtilityService.buildGeneratedMutationModel` receives a trusted
create/update operation from the controller. Creation may inject authenticated
`tenant` and `enterpriseCode` defaults. Update normalization excludes these
placement fields and does not inject current-actor placement or fixed scope values.
The existing record retains its placement; authenticated request scope still
controls access, provider routing and attribution. This is not a migration API.
Body fields cannot select the normalization operation. Preserve original domain
counters and verify `schemaMutationScopePreservation.test.js` plus generated
mutation parity and Workbench contracts.

## Operation-specific update fields

An effective schema may declare `backoffice.updateFields` as a bounded list of
ordinary root field names, or `{ configurationPath: 'owner.policy.fields' }`
referencing its existing Framework configuration list. This is authored source
metadata; HTTP input never selects a configuration path. A missing/malformed
selected policy refuses metadata instead of exposing every field. Deleted schema
fields disappear. An admitted structured root includes its inline child fields;
partial nested authorization remains with native field/access validators.

The shared field projection marks other fields `readOnlyOnUpdate: true` without
making required creation inputs globally read-only. Axis omits these fields from
update forms and update payloads while preserving original identity/CAS in the
query. Generated HTTP update normalization excludes them and cannot inject their
fixed values. Original managed counters retain their existing owner contract.
Creation, aggregate setup, private service/import and domain authorization remain
independent. This optional metadata does not create authorization or replay rights.

Profile references its existing `enterpriseManagement.lifecycle.employeeFields`
and `enterpriseFields` lists; no duplicate list belongs in Kickoff. Custom projects
may extend the owning list for actual custom schema fields through supported
layering, within native immutable identity/credential/placement/grant guards.

Configuration references read the already resolved nConfig root key and then its own nested properties. CONFIG.get itself is root-key based; do not assume dotted lookup, reconstruct layering or accept prototype path segments. The integration regression uses the actual nConfig registry.

Schema discovery also preserves the model constructor's declared `tenants`: models restricted to another tenant are omitted before operation/field projection. The verified request tenant is authoritative; body scope cannot make an unprepared global model available. Domain management APIs retain their separate authority and storage contracts. This prevents advertising default-only models as callable business-tenant record workspaces.

## Nullable native field types

The shared utility projects a native union containing one concrete type plus `null` to that concrete presentation type and chooses its ordinary renderer. Preserve the effective native schema and validation, required/read-only flags and field exclusions. A nullable object remains structured data, never a text-only field or an inferred relationship. Ambiguous concrete unions refuse metadata until an owner-supported presentation contract exists. Keep this normalization in nDatabase for collection/detail/capability consumers, never in Axis or a customer schema copy. The schemaUtilityContract regression covers collection survival, renderers, preserved native validation and ambiguous refusal.

Safe-search applies the existing safe projection predicate to declared record fields as well as display fields. Schema-authored configuration directives such as `$override` must not enter native field-path projections. This is a read projection rule, not a schema rewrite, permission grant or new query operator. Preserve the bounded typed query contract; the schemaWorkbenchContract projection regression covers directive/secret fields and safe ordinary fields.

## Model-purpose presentation

Each implementing model owner supplies its purpose through existing `backoffice.description`, alongside its labels and display properties. Explain commands/receipts/projections without implying that metadata grants writes, activates a definition or establishes readiness. Keep definitions beside their schema, not in Axis, Kickoff or a central business-model registry. Later schema layers may intentionally override presentation. Native scope and operation admission remain unchanged.

Generated HTTP create/update normalization rejects explicitly supplied writable values outside the effective native enum with ERR_DBS_00003 before persistence. Resolve the field from the same effective utility descriptor; do not validate stripped protected fields or replace native validators, defaults, access checks, reference guards or CAS. This prevents a predictable client validation error from reaching a provider as a server failure. Nested/type/business validation remains with its native owner. Nullable type projection also applies consistently to scalar query/filter capabilities; structured fields are not scalar sort/filter targets.

An explicit modern `x-enterprise-code` or legacy `entCode` header on schema HTTP requests must match the authenticated enterprise. A conflicting selector is refused before descriptor or mutation processing; omitting the header does not change signed scope. Generated create normalization takes the authenticated enterprise before any request selector, and does not accept body-supplied placement.

## Operation-specific update fields reference

An effective schema may declare `backoffice.updateFields` as a bounded list of
ordinary root field names, or `{ configurationPath: 'owner.policy.fields' }`
referencing its existing Framework configuration list. This is authored source
metadata; HTTP input never selects a configuration path. A missing/malformed
selected policy refuses metadata instead of exposing every field. Deleted schema
fields disappear. An admitted structured root includes its inline child fields;
partial nested authorization remains with native field/access validators.

The shared field projection marks other fields `readOnlyOnUpdate: true` without
making required creation inputs globally read-only. Axis omits these fields from
update forms and update payloads while preserving original identity/CAS in the
query. Generated HTTP update normalization excludes them and cannot inject their
fixed values. Original managed counters retain their existing owner contract.
Creation, aggregate setup, private service/import and domain authorization remain
independent. This optional metadata does not create authorization or replay rights.

Profile references its existing `enterpriseManagement.lifecycle.employeeFields`
and `enterpriseFields` lists; no duplicate list belongs in Kickoff. Custom projects
may extend the owning list for actual custom schema fields through supported
layering, within native immutable identity/credential/placement/grant guards.

Schema discovery also preserves the model constructor's declared `tenants`: models restricted to another tenant are omitted before operation/field projection. The verified request tenant is authoritative; body scope cannot make an unprepared global model available. Domain management APIs retain their separate authority and storage contracts. This prevents advertising default-only models as callable business-tenant record workspaces.

Schema discovery distinguishes inspectable metadata from explicitly disabled generic record routers. See [the owner contract](README.md#independently-inspectable-schemas-with-disabled-record-apis); no schema discovery response enables an internal or business API.

Nullable native field unions with one concrete type retain that presentation type in shared schema metadata; native validation remains unchanged. See [business form metadata](schema-workbench-business-forms.md#nullable-native-field-types) and `test/schemaUtilityContract.test.js`.

Schema directives containing a `$`-prefixed path segment are excluded from client field/form metadata. They are not business inputs; HTTP mutation normalization independently refuses operator-like keys, and safe-search projection applies its own field-path guard.


Synchronous namespace admission reuses resolved destinations only within its current
call, including nested peer and durable-pin checks. No approval survives a return,
exception, await or later request. Preserve selected provider/service overrides,
fresh configuration and pin refusal; never replace this with a process cache.
The tenant physical namespace regression covers fresh-call drift and failure recovery.
