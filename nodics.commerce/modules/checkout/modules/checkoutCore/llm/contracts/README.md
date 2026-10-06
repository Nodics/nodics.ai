# Checkout Core Contracts

Digital sale confirmation resolves Store context from the authenticated persisted
cart before forwarding it to Digital Core. Never select purchase-time campaign
authority from caller-supplied Store context. Empty digital reservations need no
sale call; nonempty reservations require the owner and cannot silently succeed.

## Checkout Contract Acceptance

The capability-owned OpenAPI acceptance is read-only, with inert imports/help.
It requires POST operations for cart calculation, checkout placement, order
lifecycle preview, Process retry and compensation, and GET for Process incidents.
A path key without the required operation does not establish API coverage.
Direct and nested OpenAPI envelopes are supported; denied reads fail without
repair or mutation. This suite proves effective contract presence, not successful
checkout, payment, recovery execution or production readiness.

Run `node --test nodics.commerce/modules/checkout/modules/checkoutCore/test/checkoutContractAcceptance.test.mjs`
from the framework root for isolated positive and negative contract evidence.

## Commerce Journey Acceptance

Checkout Core owns `runCommerceJourneyAcceptance(options)` and the canonical
`acceptance:commerce-journey` command. Import and `--help` are inert; execution
requires `--execute`. Runtime lifecycle belongs to topology tooling.

The effective COMMERCE graph supplies `tooling.acceptance.commerceJourney`:
`productCode`, `variantCode`, `secondaryProductCode`, `secondaryVariantCode`,
`categoryCode`, `storeCode`, `locale`, `channelCode`, `jurisdiction`, `currency`,
`promotionCode`, `providerToken`, `shippingAddress`, `shippingMethod`,
`paymentMethod`. There are no sample application fallbacks. Payment inputs must
target an approved sandbox, and source configuration must never carry live secrets.
Tests may inject the same object as `options.acceptance`, with `configuration`,
`environment` and `fetch`; deployment execution resolves nConfig through nTooling.

The suite checks effective routes, customer Product discovery/PDP field safety,
shipping/returns methods, all three shopping lists, promotion preview/apply,
cart add/read/update/remove/calculation, checkout/order, cancellation, return,
refund, exchange and appeal automation, and second-customer order/cart denial.
Customers, carts, orders, promotions and lifecycle evidence remain after a run.
No direct database cleanup is performed. Missing credentials generate separate
acceptance customers through Profile signup; supplied credentials use existing
customers unless registration is explicitly requested. Signup failures propagate.

Operators must provision required grants, sandbox providers and published data
before execution. Denial, absent automation, internal field leaks and non-owner
access fail the run; failure may leave earlier authorized actions completed.
Later layers customize fixtures, never the assertions. Independent partner
fixtures and negative tests live in `test/commerceJourneyAcceptance.test.mjs`.
API evidence does not prove frontend behavior or production provider readiness.

Checkout owns placement, compensation and purchase idempotency. Bidding owns pre-checkout negotiation.
See [negotiated purchases](negotiated-purchase-contract.md), the Commerce checkout
contract and Pricing's private quote contract. Product remains the published
catalog authority; payment is reserved only during Checkout.

Provider authorization must return an explicit `AUTHORIZED` Payment transaction
before Checkout creates an order. Declined, cancelled, missing and unconfirmed
responses fail closed through Checkout-owned customer error codes and the existing
reservation compensation path. Payment remains the authority for provider outcome
evidence and attempt idempotency. Offline probes cover decline/cancel; projects
replace the provider adapter for credentialed integrations without bypassing this
Checkout condition.
