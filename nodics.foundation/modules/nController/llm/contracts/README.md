# nController AI Contracts

This folder contains module-specific AI/developer contracts for `nodics.foundation/modules/nController`.

Use these files for rules that are more specific than root `AGENTS.md` and the module `AGENTS.md`, especially extension boundaries, override expectations, testing rules, security constraints, and generated-artifact responsibilities.

## Generated schema mutation boundary

Use compiled schema identity and active owner resolution before authoring checks.
Pass explicit create/update/delete operation names so schema operation lists are
enforced. Map body data through `mapRequestBody`; never spread/merge the body into
trusted runtime context. Only declared transport fields and boolean recursive/
returnModified options may be copied. Model field normalization belongs to the
existing `DefaultSchemaUtilityService`, including original counter preservation.
Keep request/header idempotency separate from model data and from durable domain
replay logic. Test promise/callback success and rejection, missing services,
forged authority, owner/tenant isolation and actual generated template dispatch.

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

Call the shared signed enterprise guard before any generated mutation dispatch,
including query, ID and code removal paths that do not normalize a model.
