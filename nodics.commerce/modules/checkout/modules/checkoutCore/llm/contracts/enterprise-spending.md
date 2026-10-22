# Enterprise Purchase Limits

Checkout owns the reusable per-purchase spending policy consumed by both
Checkout and Bidding. Profile owns employee permissions and Enterprise scopes.
Loyalty owns funds and accounting; it does not assign a competing spending limit.

An Enterprise administrator selects an employee login identity, settlement
currency and an exact non-negative ceiling. A null selection adds no employee
ceiling; zero permits only free purchases. The framework ceiling, if configured,
cannot be raised by an Enterprise selection. These are per-purchase limits, not
daily budgets, currency conversions or an approval workflow.

All property definitions, complete defaults and standard Profile transport are
in `checkoutCore/config/properties.js`. Customer and runtime modules contain
intentional overriding values only. Actual employee selections live in the
private `commerceParticipantSpendPolicy` schema under tenant, purchasing
Enterprise, employee and currency, with generated revision concurrency.

## Operations

Administration uses the effective `matchesAdministratorScope` owner member.
Wildcard capability scopes apply to both allow and deny; tenant and Enterprise
qualifiers remain binding, and any matching denial blocks policy reads/writes.
This predicate cannot mint private persistence authority. Regression coverage
uses the actual router permission matcher and rejects foreign-qualified grants.

`POST /checkout/enterprise-spending/read` accepts `actorCode` and `currency`.
`POST /checkout/enterprise-spending/update` additionally accepts
`perPurchaseLimit` and `expectedRevision` (null when creating). Neither accepts
an Enterprise selector. Original signed human context and fresh denied-aware
Profile scopes authorize `commerce.checkout.spend.manage`. The explicit
permission release defines the permission only; it assigns no employee access.

Checkout checks the current owner, separate employee actor and calculated total
before acquiring product or financial resources. Bidding consumes the same
policy for the exact admitted bid or retained bidder intent. Scheduler execution
uses the persisted bidder, not the seller or scheduler as the spending actor.
No balance is changed by a spending check. A removed or tightened ceiling does
not authorize reversing a completed purchase.

## Verification And Recovery

Run `node --test nodics.commerce/modules/checkout/modules/checkoutCore/test/commerceParticipantSpendContract.test.js`.
Coverage includes exact large decimal values, zero and null ceilings, personal
versus Enterprise ownership, denied Profile scopes, foreign/truncated policy
reads, missing defaults, scheduler attribution and revision conflicts. A failed
or uncertain settings write is read back before retrying with its current
revision. Database CAS and a qualified unique identity are required for writes.
Unit tests do not qualify an installed runtime, employee membership, permission
release or live persistence. Axis presents these selections alongside existing
Enterprise access management; it does not create another permission authority.
