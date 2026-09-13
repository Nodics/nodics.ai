# copilotCore examples

Generated documentation entry for copilotCore.

## Canonical schema invocation

A confirmed price-row model goes to the configured Pricing module, PUT
`/pricerow`, with the raw model as `request`, the existing tenant/connection/target
scope, and its principal-bound operation key in `Idempotency-Key`. A failed remote
request propagates; never catch a 404/405 and replay it against Workbench.
If a later module changes the resource path, override the existing
`createOwnedSchemaRecord` helper and retain these constraints. Run
`nodics.copilot/test/copilotPhasesAcceptance.test.js` before deployment.
