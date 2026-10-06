# System API Contract Exposure

## API Contract And Swagger UI

`nSystem` exposes the generated API documentation for the active runtime
boundary.

`GET /nodics/system/v0/contract/openapi` returns the machine-readable OpenAPI
contract for the active runtime boundary. In a live runtime it is built from the
already-loaded effective router and schema registries so generated files cannot
make the served contract stale. When runtime contract services are unavailable,
the service may fall back to the rebuildable artifact under the active server or
node `generated/openapi` directory. It is a public documentation route only when
the `openApiContract` exposure category is enabled.

`GET /nodics/system/v0/contract/openapi/internal` returns that same authoritative
effective contract through the secured internal-service-token and
`serviceRegistry` exposure boundary. BackOffice capability discovery uses this
route so production discovery does not require public documentation exposure.
When a generated file is unavailable, the service builds the document from the
already-loaded effective router and schema registries through the existing
OpenAPI generator; it does not add another loader or persist a second contract.

`GET /nodics/system/v0/contract/swagger` returns interactive Swagger UI for that
same contract. It is browser-accessible for local/developer documentation when
`openApiContract` exposure is enabled. Swagger UI loads the local runtime
OpenAPI endpoint and serves approved UI assets through
`GET /nodics/system/v0/contract/swagger/asset/:assetName`.

Keep contract exposure disabled in shared, support, staging, and production-like
topologies unless the environment intentionally publishes API documentation.
Developer environments may expose it to trusted developers or AI tools. The
route still uses normal Nodics route exposure gates, request pipeline execution,
and response handlers; it does not create hidden Express middleware.

Projects may override `DefaultApiContractService` in a later active module to
brand the UI, filter operations, add environment labels, redact internal-only
contracts, or alter approved assets. Do not mount Swagger UI directly as hidden
Express middleware; doing so bypasses the route contract and makes the behavior
harder to override.
