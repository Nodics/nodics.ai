# Digital Core Agents

The native priced and ITEM providers must call `Merchant.validateCoupon` using the same
admitted object returned by `pricedAuthority`. Preserve that private identity
when attaching checked entitlement/merchant/marker data; a spread/clone or direct
Operation validation call loses the exact delegated issuer evidence handoff.

Explicit LOCAL ITEM simulation retains the same staff, Store, consent, private
phase and receipt checks. Preserve SIMULATED_ITEMS evidence and public
`simulated: true`, `deliveryVerified: false`, `evidenceMode: LOCAL_SIMULATION`
on confirmation, queue and original receipt inspection. A successful local
redemption is not verified goods delivery; monetary fields are not ITEM rights.
Already-redeemed benefit inverses remain unsupported. See the merchant contract.

Follow the parent contract: `../../AGENTS.md`.
Follow global guidance: `../../../../../nodics.foundation/modules/nSetup/llm/ai-enablement-index.md`.

Digital Core coordinates checkout-time digital unit allocation. Keep this layer small and contract-driven.

Protected ownership evidence/admission uses the [exact owner API](llm/contracts/ownership-evidence-api.md).
Preserve group-free Profile runtime claims, exact reviewed deployment grants and
private provenance. Only fixed owner queries may obtain canonical persistence
auth; never expose that context or enable generic CRUD. Binding admission must
freshly re-fetch the domain listing plan, verify current Product pins and use
insert-only generated persistence with exact readback. Evidence reads never
approve refunds or perform settlement.

Keep ownership transport namespace separate from reviewed business scope. The
signed runtime's enterprise owns request/header aliases; only the exact body
`enterpriseCode` selects the separately granted business. Outgoing Waste sale
and listing-plan calls must not send a business enterprise header or caller auth.
Preserve private admission and recheck original principal aliases after awaits.

Merchant staff admission must reject conflicting tenant/enterprise aliases and
failed Profile envelopes, preserve every denial and refresh original bearer
scope on each operation. Check persisted entitlement and coupon purchase identity,
not only requested selectors. Do not turn this into delegated vendor access or
rewrite issuer authentication. Read the [merchant contract](llm/contracts/merchant-redemption-contract.md)
and run its staff-authority, receipt, priced and outlet regressions.
Exact delegated purchases use Promotion's private MerchantScope handoff. Read
admission never authorizes mutations; preserve Digital's phase-bound confirmation
commands, exact arguments and cleanup on every exit. No public flag, copied
request or imported receipt can grant provider acknowledgement or budget authority.
Profile's optional Enterprise.tenant projection is a business Tenant relationship,
not the routed lookup partition. Keep lookup routing unchanged and exact issuer
identity checks without conflating those concepts.

For DIGITAL_OWNERSHIP, read the [persisted ownership contract](llm/contracts/persisted-digital-ownership.md)
before editing. Preserve exact retained binding, authoritative Cart locale at
reserve and original saved locale/key thereafter. Waste owns persisted transfer,
eWaste owns domain settlement and Payment owns original capture. No second buyer
debit, physical fallback/custody inference, unapproved asset refund or flag-based
qualification. Verify complete entitlement and terminal delivery readback.
Original-sale asset refunds use the existing Order approval/paymentAuthority
phases and eWaste's `refund-*` commands only. Require the retained explicit
before-onward-transfer policy, exact original capture/seller earning, Waste CAS
lock and verified seller reversal before Payment. Complete ownership/entitlement
only after original Payment/Loyalty refund readback. No coupon-policy inheritance,
caller-supplied ledgers, new buyer debit or general service-token refund grant.

Only OwnershipService's non-reserving `availability` may return expected unavailable
supply when `digitalCore.digitalOwnership.enabled !== true` or `qualified !== true`.
Use the bounded `DigitalOwnershipAvailabilityReason` enum, canonical classification
and no asset/binding evidence; Product keeps its safe per-item availability/status
summary and other Products. Once both flags are true, malformed owner configuration,
binding corruption, authorization, remote and owner failures still throw. Do not
catch these faults, change qualification flags or weaken `settings`, reserve or writes.
Run `test/digitalAvailabilityMetadataContract.test.js` and Product's
`test/productDigitalAvailabilityContract.test.js` for this boundary.

Coupon reveal requires exact private request admission, signed customer scope and
`commerce.digital.own.reveal` on COMMERCE. Reuse the committed evidence owner for
Checkout, captured Payment, complete Order units, entitlement and delivery;
never treat a reservation or stored token field as reveal authority. Promotion
owns encrypted retention and final scope/hash/revision checks. Keep the route
private/non-cacheable and the response no-store. See
[secure coupon setup and reveal](../../../baseCommerce/modules/promotion/llm/contracts/accelerator-setup-contributions.md#protected-reads-and-purchased-reveal).

Read the staged persistence/retained-rights contract before coupon work. Missing
owners, failed envelopes and lost CAS never produce fabricated success. Preserve
original purchase time, bounded acquisition and uncertain compensation evidence.
Retained refund terms are not a universal automatic-refund policy. Notification
resources are inert; committed owner evidence and qualified trusted intents are
required before adding lifecycle triggers or enabling delivery.
Read [committed coupon notifications](llm/contracts/committed-coupon-notifications.md)
for the new source triggers and gated recipient/transport selection. Financial
commit is independent of messaging; original frozen-intent retry cannot supply
new content. Inspect only original source-scoped durable Communication intents;
absent/denied reads stay unconfirmed, never inferred from financial completion.

Order's separately audited Local missing-policy exception never changes retained
terms. Require its exact private phase-bound request plus fresh adjudication,
original capture and complete single unused unit evidence before bypassing only
the absent refund-policy gate. A role, body flag, cloned request, explicit policy
denial, claimed/redeemed unit or stale issuer/vendor reference grants nothing.
Keep issuer/vendor scope distinct from marketplace/buyer scope and reuse
Promotion's purchased-rights validation. See Order's manual purchase-review
contract and `order/test/orderRefundExceptionContract.test.js` for integration.

Every refund phase must validate complete bounded order-unit evidence with unique
entitlement/provider codes and exact tenant/enterprise/buyer/order/provider binding.
An empty or partial read is never completion; repeated-product order entries need
aggregate quantity comparison. Preserve review/recovery rather than accepting an
unrelated or unqualified provider. See the owner refund contract/fixtures.

- Do not duplicate Product or Promotion models.
- Do not reserve digital units during add-to-cart or calculate-cart.
- Non-reserving availability uses pinned Product/SKU identity and delegates
  approved source-Product policy/batch selection and live unit reads to Promotion.
  Ignore caller batch/promotion selectors; do not synthesize warehouse balances.
- Product customer enrichment passes its already pinned, retained projection to
  `availabilityFromProjection`; never re-enter enriched discovery from that method.
  Preserve exact scope and supported digital classification, with at least one
  retained variant/SKU. Cart's `availability` still requires exact entry SKU and
  pinned lookup. Both delegate the same Product/Store binding to Promotion.
  Customer Product responses expose only available/status, not allocation evidence.
  Unsupported retained classification throws ERR_DIGITAL_AVAILABILITY_METADATA;
  Product may contain only that error in a per-item unavailable customer summary.
  Cart and Checkout stay strict. Missing owners and owner faults retain their errors.
- Reserve at checkout only, immediately before payment authorization.
- Release reserved units during checkout compensation before returning a failure.
- Pre-payment uncertain-unit recovery derives the original single active Cart entry
  from the retained command key, requires complete acknowledged generated reads,
  and delegates only exact reservation release to Promotion. Foreign, sold, claimed,
  multiple-unit and unconfirmed evidence remains recovery, never retry authority.

This capability declares an inert model-service inventory for [governed Local reset](../../../../../nodics.foundation/modules/nSystem/llm/contracts/local-reset.md).
A server must explicitly select it; contributions never enable reset or bypass tenant, environment, confirmation or required-service checks.

Route-category defaults belong to this capability; deployments supply only intentional overrides.
Preserve nRouter enforcement and independent route authorization. See [exposure ownership](../../../../../nodics.foundation/modules/nRouter/llm/contracts/README.md#capability-owned-exposure-defaults).
