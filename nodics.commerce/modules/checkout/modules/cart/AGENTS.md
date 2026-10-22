# Cart Agent Contract

Profile wildcard capability scopes must match both allow and deny; preserve
tenant/Enterprise qualifiers and deny precedence in the effective facade member.
`test/cartParticipantScope.test.js` covers every shared purchaser permission
without exporting private authority or changing original employee credentials.

Persist calculation entries with their original Pricing priceDecision, including
priceRowCode. Schema projection must not discard this purchased-consideration
evidence; Digital validates it before governed coupon inputs become consumed.

Resolve customer/Enterprise purchasers with original Profile access authority.
Never change signed employee claims to a customer or accept a body owner tuple.
Private generated storage follows typed owner admission. Fixed-price scope comes
from canonical Store placement and then retained Cart evidence, never the signed
buyer Enterprise. Auction partition comes only from Checkout's retained commitment.
Reject selected-cart entry mutations. Follow [merchant scope](llm/contracts/merchant-scope.md)
for runtime-authenticated Store reads and participant-preserving persistence.
Read [participant context](../checkoutCore/llm/contracts/auction-checkout.md).

- Follow `../../../../../AGENTS.md` and `../../../../../nodics.foundation/modules/nSetup/llm/ai-enablement-index.md`.
- Follow ancestor contracts and read local guidance.

Preserve Cart ownership, tenant security, exact evidence, idempotency, audit and generation discipline. Cart depends on the existing Store context service for explicit identifier validation.

When Pricing individual-row delivery is selected, use Pricing's bounded exact
Store/book/Product candidate gate first. Only relevant row candidates require
consumed Product references through its activated/retained owner reader using persisted
Cart locale/Store and entry Product/SKU. Never accept body pins, infer a version
from Pricing, or fall back to CURRENT/latest Product. Keep private quotes and
disabled delivery unchanged. Exercise the actual calculation engine, not only
a Pricing port stub, with Pricing's row-publication integration regression.
Book-only/unrelated baskets must not request Product authority. Keep the final
independent Pricing delivery read: a newly relevant row without a pin fails
closed, and caller pins cannot satisfy an initially empty candidate gate.

Digital availability delegates to `DefaultDigitalCommerceCheckoutService.availability`
before physical Inventory reads. Never reconstruct coupon pools from warehouse
balances: Product owns pinned identity/classification and Promotion owns live
units. Unavailable/failed digital evidence cannot fall back to physical stock.

Entry-response validation uses the existing Inventory conflict (409) for stock-only
rejections and Cart validation status (422) for other blocked reasons. Never map
owner read faults to stock unavailability or calculate a blocked cart. A response
rejection does not undo the preceding entry write; inspect before retrying.

Apply [explicit store context](llm/contracts/store-defaults.md). Never infer a store from policy defaults; preserve identical context for identity and operations, existing IDs and record ownership. Do not introduce a resolver layer or duplicate API.

This capability declares an inert model-service inventory for [governed Local reset](../../../../../nodics.foundation/modules/nSystem/llm/contracts/local-reset.md).
A server must explicitly select it; contributions never enable reset or bypass tenant, environment, confirmation or required-service checks.

Route-category defaults belong to this capability; deployments supply only intentional overrides.
Preserve nRouter enforcement and independent route authorization. See [exposure ownership](../../../../../nodics.foundation/modules/nRouter/llm/contracts/README.md#capability-owned-exposure-defaults).

Cart owns cart.limits.maximumCartEntries. Do not restore the unused Commerce
group operating-policy catalogue or read this limit from commerce.operations.
