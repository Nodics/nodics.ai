# Pricing

Exact decimal arithmetic comes from the pure nCommon `exactAmount` utility.
Pricing retains its mergeable `DefaultExactAmountService` interface and owns
currency, rounding and pricing policy; the shared utility grants no financial
or runtime authority.

Native merchant evidence supports exact receipt-bound vendor coupons while
retaining issuer-owned Cart/Store/activated Pricing authority. It uses the existing
private fixed route and Promotion receipt owners, not a general cross-enterprise
lookup. See [membership and refusal](llm/contracts/native-merchant-priced-evidence-v1.md).
An exact deployment allowlist can admit a body-selected business issuer while
keeping original runtime auth unchanged. `merchantEvidence.businessCallers` is
disabled by default and grants no customer membership or general CRUD authority.

Independently prepared Stores may select exact retained policy roots through
`publication.delivery.rootCodesByStore`. See
[Store-scoped delivery](llm/contracts/pricing-lifecycle-and-publication.md#publication-qualification-boundary);
selection is not publication or acceptance evidence.

PriceRow native create receipts are default-disabled and preserve Pricing's
existing authoring checks. See [original results and continuation](data/docs-v001/records/documentation/pricingDocumentationComponentData.js).

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

Route-category defaults belong to this capability; deployments supply only intentional overrides.
Preserve nRouter enforcement and independent route authorization. See [exposure ownership](../../../../../nodics.foundation/modules/nRouter/llm/contracts/README.md#capability-owned-exposure-defaults).

See [publication qualification](llm/contracts/README.md#publication-qualification-boundary):
policy capture is a projection, not immutable storage proof. Mutable restoration
is disabled; provider registration and activation require owner migration,
retained target policy, durable receipts, pointer CAS and no-source-fallback reads.
