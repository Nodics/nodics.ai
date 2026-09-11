# Schema Workbench Business Forms

## Authority

`DefaultSchemaWorkbenchService.buildForm` projects the effective schema's
`backoffice.form` into a version 1 client-safe descriptor. The existing schema
merge is the only composition authority. Axis never discovers source files or
implements domain-specific save rules.

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
