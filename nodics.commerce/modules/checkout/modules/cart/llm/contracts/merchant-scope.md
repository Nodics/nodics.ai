# Merchant And Participant Scope

## Ownership

Fixed-price purchases separate merchant selling scope from the signed buyer's
participant namespace. Profile owns Customer/Enterprise identity and employee
authorization. Store owns the merchant association. Cart retains selling context;
Checkout retains command and Order bindings. Reward Payment uses the participant
namespace. A wallet never selects its merchant by changing authentication headers.

After fresh Profile admission, Cart calls the existing operational Store owner
`POST /internal/stores/placement` with `{contractVersion:1,storeCode}` and the
runtime's own service credential. The shopper bearer is not elevated or forwarded
as a service credential. Store's exact deployment admission, active revisioned
record and canonical enterprise association remain mandatory. Failed evidence
refuses creation before persistence; there is no search-projection fallback.

Defaults live in `cart.merchantScope.storeTarget` in `config/properties.js`:
connection `commerce`, runtime role `COMMERCE`, timeout 15000 milliseconds.
Module `store` and the placement endpoint are fixed. Operators must qualify
Store's existing `placementRead` exposure and exact `callers` deployment binding.
These defaults do not grant runtime permissions or enable the Store owner.
Later deployment layers may intentionally override connection, target authority
or timeout; missing definitions and changes during reads fail closed.

## Retained Evidence

Cart retains `ownerRef`, `actorRef`, `participantEnterpriseCode` and
`merchantScope: {contractVersion:1,storeCode,enterpriseCode,revision}`.
`enterpriseCode` is the merchant partition; signed authentication, bearer and
actor enterprise remain the purchasing participant. Owner is a typed Profile
reference even when different owner kinds share the same textual code. Body
identity and merchant evidence cannot populate the binding. Existing Cart identity
cannot be rebound to another Store, merchant or Store placement revision.

Shared purchaser admission matches Profile wildcard capability scopes for both
allow and deny and respects tenant/Enterprise qualifiers. Any applicable denial
wins before merchant lookup. Later facade overrides use the documented
`matchesParticipantScope` member without gaining private persistence authority.
The owner-local `test/cartParticipantScope.test.js` exercises Cart, Checkout and
own-order permissions with the real router permission matcher.

Subsequent commands use exact tenant/Cart-code/owner generated reads under canonical
local persistence authority. Reads are uncached, bounded to two records and require
complete successful count/rows acknowledgements. Ambiguity, foreign tenant/owner,
typed-owner or participant mismatch, invalid binding and authority mutation refuse.
No arbitrary query or privileged credential escapes the operation. Normal Cart
operations reread and check the retained scope before acting. Older records without
validated scope are not silently upgraded; an explicit owner migration is required.

Internal Product identity reads use the existing merchant-scoped Cart read context.
Reward AUTHORIZE/CAPTURE/reversal and their repository/recovery reads use the signed
participant namespace. Completion and failure checkpoints retain merchantScope,
typed owner, actor, participant namespace, Cart code and Order code. Recovery does
not reinterpret missing records as financial permission or consult mutable Store
placement to relocate an existing purchase.

## HTTP Contract

- `POST /carts`: explicit `storeCode`; multiple supplied Store selectors must agree.
- Cart read, entry mutations and calculations: saved Cart code, no repeated Store
  selector. A conflicting supplied Store rejects.
- `POST /checkouts/place`: Cart code, Order code and original idempotency key.
  Merchant comes from the owned Cart. A retained command key cannot be rebound to
  another Cart, Order or merchant.
- Command and completed status: original path selector only, with merchant scope
  recovered from an owner-validated checkpoint. Command status rejects query/body
  selectors. Missing commands remain unconfirmed.
- Compensation: original command path and empty body. Scope recovery does not
  authorize another purchase or broaden cleanup admission.

Command status projects validated `cartCode` and `orderCode` for bound records.
Completed records join their own Order code; retained payment/coupon recovery
bindings must agree. Consumers compare both codes with the reviewed purchase before
reading `/checkouts/:orderCode`. `scopeQualified` alone is not an Order join.
Selected auctions retain their original commitment, hold and cancellation rules.
No endpoint aliases, frontend merchant headers or duplicate checkout engine exist.

## Validation And Operations

Run `node --test nodics.commerce/modules/checkout/modules/checkoutCore/test/merchantScopeContract.test.js`
from the framework root. Offline tests exercise real controllers, facades, Cart
schema projection, placement orchestration, completion/failure writers and Payment
execution with controlled generated repositories and owner responses. Customer and
Enterprise buyers purchase from another merchant, replay, and read original
command/Order bindings without a Store selector. Negative cases include ambiguous
records, mismatched owners, malformed Store evidence, spoofing, changing authority,
customized transport, missing defaults and Store outage.

These tests do not qualify installed Store permissions, real Profile, native
persistence, providers or end-to-end deployment. Administrators review deployment
bindings; business users retain pending purchase identities; developers and AI
maintainers preserve owner boundaries in later-layer extensions. Never replace
missing proof with buyer Enterprise, a default merchant or synthetic empty reads.
