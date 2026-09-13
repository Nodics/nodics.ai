# Pricing

Pricing owns exact, tenant-scoped price books, quantity tiers, validity windows, deterministic row selection, conflict explanations, and immutable price-decision evidence. Customer-group and channel specificity may be added by later-loaded modules without changing the stable selection and evidence boundary. Archived gComm is reference-only.

Private checkout quotes follow [the negotiated price contract](llm/contracts/negotiated-price-contract.md).

## Selective source authoring APIs

`GET /pricerow/capabilities`, `POST /pricerow/safe-search`, `PUT /pricerow` and
`PATCH /pricerow` reuse the generated schema controllers. Broad generated CRUD,
delete and bulk routes remain disabled. Source create/update requires Staged;
Online publication/ingestion continues through the owning domain operation.
The module prefix and API version come from the selected runtime.
See [the authoring contract](llm/contracts/README.md#source-authoring-apis) and
[customization example](llm/examples/README.md#source-authoring-customization).

This capability declares an inert model-service inventory for [governed Local reset](../../../../../nodics.foundation/modules/nSystem/llm/contracts/local-reset.md).
A server must explicitly select it; contributions never enable reset or bypass tenant, environment, confirmation or required-service checks.
