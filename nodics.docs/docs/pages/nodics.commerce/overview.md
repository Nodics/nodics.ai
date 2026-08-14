# Commerce overview

## What Commerce is

Nodics Commerce is the backend product family that turns product information,
commercial policy, stock, checkout, orders, payments, and fulfillment into one
governed customer journey. The product provides framework contracts,
schemas, services, secured routes, reference runtime, Axis projections,
operations evidence, migration controls, and canonical documentation. This is
framework readiness, not automatic production authorization: every deployment
must still qualify its providers, capacity, recovery, data, policy, and owners.

A beginner can picture the journey as:

1. Store decides the selling context.
2. Product identifies what can be sold.
3. Pricing, Promotion, and Tax produce exact monetary evidence.
4. Inventory determines availability and protects stock.
5. Cart collects intent and Checkout coordinates validation.
6. Order records the durable purchase.
7. Payment executes money movement through an approved provider.
8. Fulfillment moves goods and records delivery evidence.

These are collaborating owners, not interchangeable layers. Checkout may
coordinate them, but it cannot silently become the authority for prices,
inventory, payment, or shipment state.

| Journey step | Owning capability | Durable evidence |
| --- | --- | --- |
| Select selling context | Store | store and channel reference |
| Understand the offer | Product | product and sellable-unit identity |
| Calculate the commercial promise | Pricing, Promotion, Tax | exact price, discount, and tax decisions |
| Protect supply | Inventory | availability, reservation, allocation, and movement |
| Commit a purchase | Cart, Checkout, Order | calculated cart and immutable order history |
| Move money | Payment | authorization, capture, void, refund, and reconciliation |
| Move goods | Fulfillment | consignment, shipment, tracking, and return logistics |

## Module map

The public functional identity is `nodics.commerce`, displayed as Commerce in
BackOffice and Axis. Its internal groups are Base Commerce, Checkout, Payment,
and Fulfillment. Their concrete capability modules remain technical details;
customers register and discover the functional product, not 26 unrelated
products.

The product comprises 27 package identities: the functional group, six
internal composition groups, and twenty concrete capabilities. Every identity
uses the reserved `70.x` index family. Group packages compose; they do not own
business schemas, services, routes, or seed data.

## Choose your documentation journey

This documentation follows the progressive structure used by mature enterprise
products: orient first, complete a business journey next, then learn extension
and operations. New readers should not start from generated API details.

1. Read this overview for vocabulary, ownership, and safety boundaries.
2. Read **Base Commerce foundations** to configure Store, Product, price, tax,
   promotion, warehouse, availability, publication, and search evidence.
3. Read **Cart, checkout, and order placement** for the customer purchase path,
   retry behavior, exact calculation, and compensation.
4. Read **Payment and fulfillment operations** before enabling any provider or
   operating warehouse and shipment work.
5. Read **Cancellation, return, and refund lifecycle** for self-service,
   operator queues, approval, inspection, refund, and reconciliation.
6. Read **Commerce enterprise operations and migration** before sizing,
   upgrading, migrating a tenant, rehearsing recovery, or releasing.
7. Developers then follow the owning module README/AGENTS hierarchy and
   generated OpenAPI/schema contracts. Operators use Axis and the runbooks;
   customers see only the permitted self-service projections.

Each guide repeats the same learning pattern: business outcome, customer or
operator journey, owner boundary, data/evidence, security, failure/recovery,
extension points, common mistakes, and verification. This lets a beginner
build a dependable mental model while giving an experienced implementer a
direct path to contracts and release evidence.

The information architecture is informed by the official SAP Commerce Cloud
split across Discover, Implement, Integrate, Storefront, Security, Reference,
and Support, and Oracle Commerce's task-oriented Use, Administer, Configure and
Extend, Analyze and Report, Integrate, and REST API paths. Nodics keeps its own
ownership vocabulary and adds explicit failure, recovery, evidence, and release
gates rather than copying either product's module model.

- SAP Commerce Cloud: <https://help.sap.com/docs/SAP_COMMERCE_CLOUD_PUBLIC_CLOUD>
- Oracle Commerce: <https://docs.oracle.com/en/cloud/saas/cx-commerce/>

## Current implementation state

The documented framework contracts and controls are implemented, while
environment-specific load, soak, provider, backup/restore, failover, and RPO/RTO
qualification remain release gates. Archived Commerce is not an active runtime
authority; final alias removal and physical retirement wait for each production
tenant's reconciliation and rollback-window closure.

## Safe customization

A customer project may extend `nodics.commerce` while keeping the standard
functional identity. Put customer rules in a later-loading customer module;
do not copy or edit framework packages. Replace narrow services or provider
ports through supported Nodics layering and keep the original domain owner.

Examples:

- a regional tax adapter extends Tax, not Cart;
- a new payment provider extends Payment Providers, not Order;
- a store-specific availability rule composes Inventory evidence;
- a branded Axis screen renders backend contracts but does not own statuses or
  lifecycle rules.

## Security and evidence baseline

All future Commerce slices must enforce tenant isolation, authenticated
audiences, least-privilege permissions, idempotency, audit trails, protected
data handling, and exact money and quantity representations. Provider secrets
must never enter schemas, logs, browser payloads, documentation, or generated
context.

## How to verify the implementation

From the framework root, run the Commerce composition and source-free contract
tests, module metadata validation, structure audit, then generate and validate
LLM context. The proof must show all package indexes are unique, composition is
deterministic, and no Commerce package contains premature `src/` or `data/`.

Developers should start from the concrete owner README and contracts before
adding code. A schema belongs with the domain that controls its lifecycle; a
coordinating service calls that owner instead of recreating its decisions.
Tests should cover the successful path, rejection, tenant isolation,
idempotent replay, dependency failure, recovery, and a later-layer override.

Operators and DevOps teams should treat module discovery as readiness metadata,
not as proof that a customer-facing API is safe to expose. Production
activation requires the applicable release-acceptance evidence, secured
permissions, observable health, capacity budgets, rollback instructions, and
validated provider configuration. A provider package is not production-ready
merely because the module loader can see it.

## Common mistakes

- Treating every internal module as a separate BackOffice product.
- Adding Cart-owned price arithmetic or Order-owned refund execution.
- Using JavaScript floating-point values for money, rates, or quantities.
- Copying archived source before classifying its ownership and maturity.
- Enabling a provider without callback verification, replay protection,
  idempotency, redaction, reconciliation, and failure recovery.
- Putting backend statuses, permissions, navigation records, or business rules
  into Axis.
- Editing generated documentation or generated schema artifacts directly.

## Verification

Framework acceptance requires the 27-package composition contract, generated
schema tests, focused owner and workflow tests, a controlled effective runtime
graph, generated OpenAPI/security checks, Axis journey/type/build checks,
documentation generation and validation, generated LLM context, metadata and
structure audits, and an explicit release-readiness record. External provider
certification, representative production load, disaster recovery, regulatory
approval, tenant cutover, and residual-risk acceptance remain deployment
evidence and must never be inferred from framework tests.
