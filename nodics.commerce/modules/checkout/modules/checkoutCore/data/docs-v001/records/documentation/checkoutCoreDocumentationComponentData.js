/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @description Canonical module-owned documentation CMS component records. */
module.exports = {
  "record0": {
    "code": "nodicsDocsComponentcommerceCartOrder",
    "typeCode": "nodicsDocumentationArticleComponentType",
    "renderer": "documentation.component.article",
    "accessMode": "PUBLIC",
    "properties": {
      "code": "commerce.cart-order",
      "title": "Cart, checkout, and order placement",
      "route": "/docs/framework/commerce-cart-order",
      "section": "commerce-cart-and-checkout",
      "sectionTitle": "Commerce, Cart, and Checkout",
      "group": "commerce-cart-and-checkout",
      "groupTitle": "Commerce, Cart, and Checkout",
      "parentId": "commerce-cart-and-checkout",
      "hierarchyPath": [
        "Commerce, Cart, and Checkout",
        "Cart, checkout, and order placement"
      ],
      "hierarchyDepth": 2,
      "documentType": "how-to",
      "audience": [
        "business",
        "architect",
        "administrator",
        "developer",
        "operator",
        "qa",
        "ai-tool"
      ],
      "businessAudience": [
        "business user",
        "administrator",
        "implementation partner"
      ],
      "technicalAudience": [
        "architect",
        "developer",
        "operator",
        "qa engineer",
        "ai tool"
      ],
      "summary": "Customer, developer, and operator journey for exact calculation, placement, idempotency, compensation, immutable Orders, and recovery.",
      "visibility": "public",
      "accessMode": "PUBLIC",
      "publiclyAvailable": true,
      "requiresAuthentication": false,
      "allowedRoles": [],
      "allowedGroups": [],
      "allowedPermissions": [],
      "lifecycleState": "ONLINE",
      "version": "0.16.5",
      "maturityState": "operational",
      "implementationState": "current",
      "renderingComponent": "documentation.component.article",
      "relatedPages": [
        "commerce.overview",
        "commerce.payment-fulfillment",
        "commerce.returns-refunds",
        "promotion.campaigns-coupon-issuance",
        "cart.customer-intent-calculation",
        "digital.purchase-delivery-reveal",
        "inventory.stock-management"
      ],
      "sourceEvidence": [
        "../../../../../nodics.docs/data/manifest.json",
        "../../../../../nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js",
        "package.json",
        "src/schemas",
        "src/service",
        "src/service/defaultOrderPlacementService.js",
        "src/service/defaultCheckoutPlacementPortsService.js",
        "test/orderPlacementContract.test.js",
        "llm/contracts/README.md",
        "../../../baseCommerce/modules/inventory/src/service/defaultInventoryPhysicalReversalService.js",
        "../../../fulfillment/modules/fulfillmentCore/src/service/defaultPhysicalOrderReversalService.js",
        "../order/src/service/defaultOrderRefundRecoveryService.js",
        "../../../fulfillment/modules/fulfillmentCore/test/physicalOrderReversalContract.test.js"
      ],
      "visualRequirements": [
        "table",
        "diagram"
      ],
      "searchKeywords": [
        "commerce-cart-and-checkout",
        "cart-and-order-placement",
        "cart-checkout-and-order-placement",
        "physical-digital-branches",
        "placement-checkpoints",
        "uncertain-compensation"
      ],
      "topicKeywords": [
        "Commerce, Cart, and Checkout",
        "Cart and Order Placement",
        "Cart, checkout, and order placement",
        "physical-digital-branches",
        "placement-checkpoints",
        "uncertain-compensation"
      ],
      "headings": [
        {
          "text": "Customer journey",
          "anchor": "commerceCartOrder-1-customer-journey",
          "level": 2
        },
        {
          "text": "Calculation explained for beginners",
          "anchor": "commerceCartOrder-2-calculation-explained-for-beginners",
          "level": 2
        },
        {
          "text": "Developer guidance",
          "anchor": "commerceCartOrder-3-developer-guidance",
          "level": 2
        },
        {
          "text": "Operator and DevOps guidance",
          "anchor": "commerceCartOrder-4-operator-and-devops-guidance",
          "level": 2
        },
        {
          "text": "Security and failure behavior",
          "anchor": "commerceCartOrder-5-security-and-failure-behavior",
          "level": 2
        },
        {
          "text": "Common mistakes",
          "anchor": "commerceCartOrder-6-common-mistakes",
          "level": 2
        },
        {
          "text": "Verification",
          "anchor": "commerceCartOrder-7-verification",
          "level": 2
        },
        {
          "text": "Explicit store context across applications",
          "anchor": "commerceCartOrder-8-explicit-store-context-across-applications",
          "level": 2
        },
        {
          "text": "Customize and extend safely",
          "anchor": "commerceCartOrder-9-customize-and-extend-safely",
          "level": 3
        },
        {
          "text": "Upgrade, failure and recovery",
          "anchor": "commerceCartOrder-10-upgrade-failure-and-recovery",
          "level": 3
        },
        {
          "text": "Verification of context changes",
          "anchor": "commerceCartOrder-11-verification-of-context-changes",
          "level": 3
        },
        {
          "text": "Physical and digital placement branches",
          "anchor": "checkout-physical-digital-branches",
          "level": 2
        },
        {
          "text": "Placement failure and uncertain-owner recovery",
          "anchor": "checkout-placement-recovery-matrix",
          "level": 2
        },
        {
          "text": "Customize and test branch-aware Checkout",
          "anchor": "checkout-branch-customization",
          "level": 2
        },
        {
          "text": "Retained consignments and reviewed physical reversal",
          "anchor": "checkout-retained-consignment-reversal",
          "level": 2
        }
      ],
      "blocks": [
        {
          "kind": "heading",
          "level": 2,
          "text": "Customer journey",
          "anchor": "commerceCartOrder-1-customer-journey"
        },
        {
          "kind": "paragraph",
          "text": "Cart stores customer purchase intent. Calculation asks Pricing, Promotion, Tax, and Inventory for authoritative decisions. Checkout validates the final intent and coordinates placement. Order records the durable result and append-only history. These responsibilities are deliberately separate. The business value is a reliable purchase promise: customers see defensible totals, stock is protected, and retries do not create duplicate orders or charges."
        },
        {
          "kind": "table",
          "headers": [
            "Stage",
            "Owner",
            "Result"
          ],
          "rows": [
            [
              "Add or change entries",
              "Cart",
              "versioned customer intent"
            ],
            [
              "Calculate",
              "Cart coordinating domain owners",
              "exact calculation evidence"
            ],
            [
              "Reserve",
              "Inventory",
              "idempotent stock reservation"
            ],
            [
              "Authorize",
              "Payment",
              "authorization evidence"
            ],
            [
              "Create durable purchase",
              "Order",
              "immutable order and entries"
            ],
            [
              "Release goods",
              "Fulfillment",
              "release or consignment evidence"
            ],
            [
              "Recover failure",
              "Checkout and each owner",
              "checkpoint and compensation evidence"
            ]
          ]
        },
        {
          "kind": "paragraph",
          "text": "A customer can retry placement with the same idempotency key. Checkout first looks for an existing result. It does not create a second order, reservation, or authorization. Each completed step is checkpointed. If a later step fails, compensation asks the original owner to release or void its evidence."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Calculation explained for beginners",
          "anchor": "commerceCartOrder-2-calculation-explained-for-beginners"
        },
        {
          "kind": "paragraph",
          "text": "Suppose one entry costs `20.00`, a promotion grants `2.00`, and Tax returns `0.90`. Cart records subtotal `20`, discount `2`, tax `0.9`, and total `18.9`. The formatting can be localized in Axis, but the backend values remain exact decimal strings with a currency."
        },
        {
          "kind": "paragraph",
          "text": "Calculation is a snapshot, not permanent truth. Before placement, Checkout verifies the Cart revision, owner decision versions, inventory availability, customer ownership, store context, and expiry. A changed Cart cannot reuse evidence from an older revision."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Developer guidance",
          "anchor": "commerceCartOrder-3-developer-guidance"
        },
        {
          "kind": "paragraph",
          "text": "Developers add Cart rules through validation and calculation pipelines, not by calling provider SDKs. Owner ports make dependency contracts explicit and testable. A customer extension can add an entry validator or replace a Pricing resolver without forking Cart."
        },
        {
          "kind": "paragraph",
          "text": "Order data is immutable commercial evidence. Corrections append history or create a governed lifecycle request; they do not rewrite the original placed facts. Store display labels separately from stable codes. Keep protected addresses and payment references in bounded schemas and projections."
        },
        {
          "kind": "paragraph",
          "text": "Placement bridges must have deterministic idempotency keys. Derive child keys from the placement key and operation name so retry calls reach the same Inventory and Payment operations. Persist checkpoints before advancing. Do not infer success from a timeout; reconcile with the owner."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Operator and DevOps guidance",
          "anchor": "commerceCartOrder-4-operator-and-devops-guidance"
        },
        {
          "kind": "paragraph",
          "text": "Operators need calculation diagnostics, placement checkpoints, dependency latency, compensation status, stale reservations, and duplicate-attempt indicators. Axis displays backend evidence and refreshes after actions. It does not mark a placement successful because a button was clicked."
        },
        {
          "kind": "paragraph",
          "text": "Set bounded Cart sizes, pagination, timeouts, retry budgets, and queue backpressure. Load tests must include concurrent updates to one Cart, hot products, promotion bursts, inventory contention, provider timeout, and replay. Backup and restore tests prove that Orders and history survive while transient Carts follow the approved retention policy."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Security and failure behavior",
          "anchor": "commerceCartOrder-5-security-and-failure-behavior"
        },
        {
          "kind": "paragraph",
          "text": "Customer routes require customer access tokens and ownership checks. Employee routes require explicit Commerce permissions. Service bridges use service tokens. Tenant comes from trusted authentication context and cannot be overridden by payload data."
        },
        {
          "kind": "paragraph",
          "text": "A failed dependency leaves a diagnostic and returns an honest incomplete result. Compensation is idempotent and retryable. A Payment timeout becomes unknown until reconciliation, never automatically declined or authorized. Inventory reservation failure prevents this placement from reaching Order creation; this flow does not grant a caller-selected backorder bypass."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Common mistakes",
          "anchor": "commerceCartOrder-6-common-mistakes"
        },
        {
          "kind": "unordered-list",
          "items": [
            "Recalculating money with browser or floating-point logic.",
            "Creating Order before durable reservation and authorization evidence.",
            "Reusing a calculation after Cart revision changes.",
            "Retrying with a new idempotency key.",
            "Deleting Order history to correct a mistake.",
            "Treating timeout as a known provider outcome.",
            "Putting compensation logic inside an unrelated domain."
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Verification",
          "anchor": "commerceCartOrder-7-verification"
        },
        {
          "kind": "paragraph",
          "text": "Run Cart calculation and placement tests for success, unauthorized ownership, cross-tenant access, stale revision, concurrency, idempotent replay, dependency failure, each compensation boundary, and recovery after restart. Generate schema and route contracts from the effective Commerce graph. Validate Axis loading, empty, error, keyboard, responsive, and stale-evidence states. Production release additionally requires load and soak evidence at approved Cart size, order rate, and dependency latency budgets."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Explicit store context across applications",
          "anchor": "commerceCartOrder-8-explicit-store-context-across-applications"
        },
        {
          "kind": "paragraph",
          "text": "Cart APIs belong to Cart. A customer selects its store in the request rather than creating a store-specific controller, route or framework configuration. For example, `POST /carts` accepts `{ \"storeCode\": \"duStore\" }`; another customer uses the same endpoint with `{ \"storeCode\": \"independentStore\" }`. Paths are relative to the selected Cart module endpoint. The usual access token, permissions and ownership apply."
        },
        {
          "kind": "paragraph",
          "text": "Cart and Shopping List reuse the existing Store context service. Identifier input may come from payload, query or established request context; supplied sources must agree. Missing, blank, surrounding-whitespace and non-string values fail before persistence. These checks validate identifier agreement; they do not look up Store master data or grant selling eligibility. The existing Store/channel and downstream domain owners retain those checks, without elevated credentials or raw database access."
        },
        {
          "kind": "paragraph",
          "text": "The same resolved code feeds Cart identity and its model. An existing owned Cart uses its persisted store when read, updated or calculated by saved ID. Conflicting input, a missing persisted store, or an attempt to recreate that ID in another store is rejected. Activation must include Store when these operations run; a missing context service is unavailable, not a reason to infer a store."
        },
        {
          "kind": "heading",
          "level": 3,
          "text": "Customize and extend safely",
          "anchor": "commerceCartOrder-9-customize-and-extend-safely"
        },
        {
          "kind": "paragraph",
          "text": "Keep actual store selection in the calling application's established configuration and send it as operation data. No `cart.customerApi.defaultStoreCode` or `shoppingList.customerApi.defaultStoreCode` fallback is consumed. A later-loaded customer module may tighten the existing Store context service's exported validation method while preserving required context, agreement and authentication boundaries. Use the service override mechanism; do not add a resolver registry or copied API."
        },
        {
          "kind": "heading",
          "level": 3,
          "text": "Upgrade, failure and recovery",
          "anchor": "commerceCartOrder-10-upgrade-failure-and-recovery"
        },
        {
          "kind": "paragraph",
          "text": "Update legacy callers that omitted `storeCode` before upgrading and remove unused server fallback declarations. Explicit-store Cart hashes and Shopping List ID formats remain unchanged. Existing records/entries are not automatically rekeyed or reassigned. Retain saved Cart IDs: an ID created by the old request-context-only hashing bug is still readable by ID, but recomputing the corrected hash cannot locate that old ID. Resolve orphaned or inconsistent references through a governed owner migration; never guess a store or fall back to a different list. Explicit Cart create/replace retains its prior lifecycle behavior and adds no new transactional retry guarantee."
        },
        {
          "kind": "heading",
          "level": 3,
          "text": "Verification of context changes",
          "anchor": "commerceCartOrder-11-verification-of-context-changes"
        },
        {
          "kind": "paragraph",
          "text": "The customer API contracts exercise independent stores through identical routes, legacy explicit IDs, context-only identity, missing/malformed/conflicting input, existing-record reuse, wrong owner/tenant, and effective-service overrides. Run Cart and Shopping List customer tests with the Commerce foundation and route security checks, then verify selected runtime activation and actual client requests. Prepared composition and mocked contract tests do not constitute live database or browser acceptance. Production migration must separately verify real owned records."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Physical and digital placement branches",
          "anchor": "checkout-physical-digital-branches"
        },
        {
          "kind": "paragraph",
          "text": "Cart is the customer shopping list; Checkout is the coordinator that commits a purchase through the owning domains. A calculation describes the current basket but does not put stock aside or prove payment. The persisted Cart supplies customer and Store context. Product and Pricing supply retained publication evidence, Inventory supplies physical stock holds, Promotion supplies coupon units and campaign consumption, Payment supplies provider outcomes, Order supplies durable purchase identity, and Fulfillment/DigitalCore supply their own release or delivery evidence. A mixed basket uses both branches without making Checkout a second stock, token or payment authority."
        },
        {
          "kind": "diagram",
          "language": "mermaid",
          "text": "flowchart TD\n  Cart[\"Owned persisted Cart and exact calculation\"] --> Classify{\"Owner-validated entry classification\"}\n  Classify -->|physical| Stock[\"Inventory atomic reserveAll\"]\n  Classify -->|digital coupon| Units[\"DigitalCore delegates unit allocation to Promotion\"]\n  Stock --> Auth[\"Payment must confirm AUTHORIZED\"]\n  Units --> Auth\n  Auth --> Order[\"Create durable Order and entry evidence\"]\n  Order --> Capture[\"Payment capture when owner port requires it\"]\n  Capture --> Campaign[\"Checkout commits Promotions once\"]\n  Campaign --> Sale[\"Confirm digital sale when units exist\"]\n  Sale --> Release[\"Fulfillment release; not proof of physical shipment\"]\n  Release --> Delivery[\"Digital delivery and owned entitlement evidence\"]\n  Delivery --> Complete[\"Complete placement checkpoint\"]\n  Complete --> Message[\"Optional committed notifications; outside financial compensation\"]"
        },
        {
          "kind": "table",
          "headers": [
            "Checkpoint or owner effect",
            "What operators can inspect",
            "Limit"
          ],
          "rows": [
            [
              "VALIDATED / CALCULATED",
              "Owned Cart, current revision, exact decimals/currency and owner decision evidence.",
              "Calculation is non-reserving and can become stale."
            ],
            [
              "RESERVED / DIGITAL_RESERVED",
              "Physical holds and digital allocation results for the original command.",
              "A checkpoint name can exist for an empty branch; inspect actual results."
            ],
            [
              "AUTHORIZED / ORDERED",
              "Explicit Payment AUTHORIZED transaction and original durable Order.",
              "Missing/declined/cancelled/unknown authorization cannot create a qualified purchase."
            ],
            [
              "PAYMENT_CAPTURED / PROMOTION_COMMITTED",
              "Actual optional capture and campaign/redemption results when present.",
              "Do not infer capture from authorization or apply campaigns separately before placement."
            ],
            [
              "DIGITAL_SOLD / RELEASED / DIGITAL_DELIVERED",
              "Actual sale, release and delivery results for relevant entries.",
              "A release is not carrier shipment; a digital label alone is not purchased reveal authority."
            ],
            [
              "Completed placement",
              "The owner complete result, original Order and all required retained results.",
              "HTTP success, a browser click or notification delivery is not financial completion."
            ]
          ]
        },
        {
          "kind": "paragraph",
          "text": "DefaultOrderPlacementService finds an existing placement first and otherwise runs validate, calculate, physical reservation, digital reservation, Payment authorization, Order creation, optional capture, Promotion commit, digital sale, fulfillment release, digital delivery and completion in that order. The ports carry authenticated persisted-Cart Store context; caller-selected Store cannot choose a different campaign authority. DigitalCore does not reserve on Cart add/calculation. A repeat original placement key returns existing owner evidence, not a second Order, charge or allocation."
        },
        {
          "kind": "paragraph",
          "text": "For developers and operators, distinguish the in-memory placement checkpoint from durable owner records. place builds completed and results while it awaits the ports; it does not persist a journal entry after each array append. The default complete port first closes the owned Cart, then saves a COMPLETED checkoutCheckpoint containing the original Order reference and relevant campaign, coupon, digital sale and delivery bindings. A process interruption before that save therefore requires inspection of original owner effects; an absent completed checkpoint is not proof that authorization, reservation or Order creation never happened. Do not turn this coordinator into a cross-owner database transaction or rebuild effects from the browser. The capture port derives LOCAL_SANDBOX_DEMO only on COMMERCE for CARD with provider stripe-sandbox, the exact DefaultStripeSandboxAdapterService, and the existing reviewed Stripe policy with enabled and sandboxOnly true, liveQualified false and maturity OFFLINE_CONFORMANCE. Browser-supplied mode, outcome or receipt fields cannot select that qualification. This is offline conformance, not real Card settlement or production certification; retain that distinction when interpreting downstream Order refund checkpoints and recovery results."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Placement failure and uncertain-owner recovery",
          "anchor": "checkout-placement-recovery-matrix"
        },
        {
          "kind": "diagram",
          "language": "mermaid",
          "text": "flowchart TD\n  Failure[\"Placement owner throws or provider acknowledgement is uncertain\"] --> Retain[\"Retain original checkpoint and confirmed physical/digital acquisitions\"]\n  Retain --> Owners[\"Ask each original owner to compensate its actual effects\"]\n  Owners --> Check{\"Every required effect independently confirmed?\"}\n  Check -->|yes| Known[\"Known owner compensation evidence\"]\n  Check -->|no| Review[\"COMPENSATION_REQUIRED and explicit owner recovery\"]\n  Complete[\"Committed placement\"] --> Notify[\"Notification attempt or original frozen-intent retry\"]\n  Notify -->|message failed| Separate[\"Messaging remains unconfirmed; do not undo financial commit\"]"
        },
        {
          "kind": "table",
          "headers": [
            "Failure boundary",
            "Required response",
            "Unsafe shortcut"
          ],
          "rows": [
            [
              "Physical acquisition fails",
              "Inventory rolls back or returns independently readable original holds; preserve confirmed acquisitions and recoveryRequired.",
              "Saving a reservation row or inventing stock restoration."
            ],
            [
              "Digital acquisition is partial/uncertain",
              "Carry confirmed units and uncertain original command key into Checkout compensation.",
              "Treating failed read as no allocation or acquiring replacement units."
            ],
            [
              "Payment declined/cancelled/unconfirmed",
              "Stop placement and ask original owners to release/void as appropriate. Reconcile unknown provider outcome.",
              "Calling timeout a decline, authorization or capture."
            ],
            [
              "Later Order/capture/promotion/delivery step fails",
              "Inspect original checkpoint and each owner outcome before same-intent recovery.",
              "New idempotency key, deleting Order history or resetting campaign/stock."
            ],
            [
              "Hold release cannot be proven",
              "Keep COMPENSATION_REQUIRED even when some known owners released successfully.",
              "Reporting overall compensation success from a partial result."
            ],
            [
              "Committed notification fails",
              "Inspect the source-scoped durable message intent and use its governed retry.",
              "Re-entering placement compensation or creating new financial intent."
            ]
          ]
        },
        {
          "kind": "paragraph",
          "text": "The failure path copies confirmed inventoryReservations and digitalReservations from owner exceptions, including their recoveryRequired flags and the uncertain digital command key, before calling compensate. The default ports attempt committed Promotion reversal, digital reservation release, each physical hold release, and Payment reversal when applicable. A capture selects REFUND; otherwise an authorization selects VOID. The persisted compensation checkpoint records completed stages, per-owner outcomes, original correlation and uncertainty flags. An unresolved acquisition adds a failed outcome even if every known hold was released. Failure to persist this checkpoint still leaves owner effects requiring inspection; changing the placement key cannot repair that missing evidence."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Customize and test branch-aware Checkout",
          "anchor": "checkout-branch-customization"
        },
        {
          "kind": "paragraph",
          "text": "Customize fixtures or a documented owner port through the existing active project layer, not a new dependency executor. For example, select an approved sandbox Payment adapter or narrow supported shipping methods while preserving authenticated Cart/Store context, exact calculations, explicit authorization outcomes, original idempotency and owner evidence. Do not replace inherited placement with direct model writes. Promotion preview/calculation remains non-mutating; Checkout commits each selected campaign once after the payment phase. A coupon fixture must belong to the authenticated buyer and retain its original purchase/delivery evidence."
        },
        {
          "kind": "ordered-list",
          "items": [
            "Test physical-only, supported digital-only and mixed baskets, empty branches, stale Cart revision and foreign customer/Store/tenant rejection.",
            "Exercise every placement step failure, partial acquisition, lost acknowledgement, duplicate original placement and interrupted compensation; inspect complete owner evidence rather than completed labels alone.",
            "Verify explicit AUTHORIZED admission, capture outcomes and campaign/order binding. Purchased reveal additionally needs current capture, complete Order units, ACTIVE entitlement and DELIVERED evidence.",
            "Keep reverse requests, actual owner reversal, physical receipt/restock and financial settlement separate. Card/provider configuration and source fixtures do not certify a real provider.",
            "Run installed native owner and browser journeys only through separately authorized acceptance. These source-backed flows do not claim physical shipping, Card integration or production qualification."
          ]
        },
        {
          "kind": "paragraph",
          "text": "Payment compensation now requires terminal VOIDED for a void, or REFUNDED/REFUND_SUCCEEDED for a refund, together with a nonempty owner receipt reference and matching tenant, owner, Order and original financial idempotency. Returned amount/currency and provider status must agree when exposed. A nonthrowing call, error envelope, negative acknowledgment, missing result, pending/failed state or reconciliation flag cannot become COMPLETED. Failed or ambiguous reversal retains COMPENSATION_REQUIRED, the original token-free paymentCompensationIntent, the correct PAYMENT_VOID/PAYMENT_REFUND outcome and recovery identity. Payment-bearing compensation checks existing protected recovery before any owner effect and reads back persistence; matching retained recovery returns unchanged without redispatch, while changed or unbound recovery fails closed for manual review. New bound LOCAL_SANDBOX_DEMO captures remain refused by legacy compensation refund: a qualified owning recovery bridge is still missing, and Checkout cannot manufacture Order approval, a refund token or financial settlement. This bounded correction does not implement distributed atomicity, whole-placement resumption or automatic recovery after missing durability. Preserve the original identity and investigate owner evidence; do not create a fresh refund key. Offline evidence remains OFFLINE_CONFORMANCE, never external money. The checkoutCompensationSafetyContract regression exercises terminal, pending, failed, envelope-error, changed-intent, retained-replay, actual bound-capture refusal and persistence-failure paths. Native and cross-worker acceptance remain separate evidence."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Retained consignments and reviewed physical reversal",
          "anchor": "checkout-retained-consignment-reversal"
        },
        {
          "kind": "paragraph",
          "text": "The existing releaseFulfillment port saves a READY consignment with code order.code + ':1', original tenant/enterprise/owner/order binding, revision 0, currency/total and original fulfillment idempotency key. Placement invokes that port after optional capture, Promotion commit and digital sale, before digital delivery. The retained consignment is real owner evidence, but READY is not dispatched, delivered or refunded. Inspect the actual physical branch and holds; a consignment alone cannot authorize a stock delta."
        },
        {
          "kind": "table",
          "headers": [
            "Boundary",
            "Current owner behavior",
            "Recovery limit"
          ],
          "rows": [
            [
              "Physical dispatch",
              "Fulfillment's explicitly enabled MANUAL_ATTESTATION bridge locks the retained consignment and asks Inventory to consume original ACTIVE holds once, then records the original shipment.",
              "Not a live carrier claim. Do not reconstruct missing holds or caller-supply shipment status."
            ],
            [
              "Reviewed full physical cancellation",
              "Order reloads current Profile scope, original case/Store policy and approved refund plan. Fulfillment locks READY before dispatch; Inventory atomically releases exact original holds.",
              "Mixed digital/partial retained entries, stale preview, dispatch lock or missing installed qualification reject."
            ],
            [
              "Reviewed physical return",
              "Requires owner-issued shipment, actual bounded package receipts and full quantity coverage with RESTOCK/SCRAP inspection for every receipt before Inventory settlement and Payment.",
              "REJECT_RETURN or incomplete receipt/inspection remains blocked. Legacy balanceAction RETURN remains refused."
            ],
            [
              "Refund after stock settlement",
              "Order's PREPARE and SETTLE checkpoints precede Payment; completion requires confirmed original refund and exact owner evidence.",
              "A pending or unknown refund preserves reconciliation; replay the same approved intent without replacing Order or replenishing stock twice."
            ]
          ]
        },
        {
          "kind": "paragraph",
          "text": "Keep cancellation, dispatch, inspected return and Payment reconciliation as separate business actions. Test the physicalOrderReversalContract owner chain as well as placement contracts; separately qualify native persistence, actual warehouse evidence and browser controls. Checkout source coverage is not acceptance of a real Card/carrier integration."
        }
      ],
      "searchText": "Cart, checkout, and order placement Customer, developer, and operator journey for exact calculation, placement, idempotency, compensation, immutable Orders, and recovery. # Cart, checkout, and order placement\n\n## Customer journey\n\nCart stores customer purchase intent. Calculation asks Pricing, Promotion, Tax, and Inventory for authoritative decisions. Checkout validates the final intent and coordinates placement. Order records the durable result and append-only history. These responsibilities are deliberately separate. The business value is a reliable purchase promise: customers see defensible totals, stock is protected, and retries do not create duplicate orders or charges.\n\n| Stage | Owner | Result |\n| --- | --- | --- |\n| Add or change entries | Cart | versioned customer intent |\n| Calculate | Cart coordinating domain owners | exact calculation evidence |\n| Reserve | Inventory | idempotent stock reservation |\n| Authorize | Payment | authorization evidence |\n| Create durable purchase | Order | immutable order and entries |\n| Release goods | Fulfillment | release or consignment evidence |\n| Recover failure | Checkout and each owner | checkpoint and compensation evidence |\n\nA customer can retry placement with the same idempotency key. Checkout first looks for an existing result. It does not create a second order, reservation, or authorization. Each completed step is checkpointed. If a later step fails, compensation asks the original owner to release or void its evidence.\n\n## Calculation explained for beginners\n\nSuppose one entry costs `20.00`, a promotion grants `2.00`, and Tax returns `0.90`. Cart records subtotal `20`, discount `2`, tax `0.9`, and total `18.9`. The formatting can be localized in Axis, but the backend values remain exact decimal strings with a currency.\n\nCalculation is a snapshot, not permanent truth. Before placement, Checkout verifies the Cart revision, owner decision versions, inventory availability, customer ownership, store context, and expiry. A changed Cart cannot reuse evidence from an older revision.\n\n## Developer guidance\n\nDevelopers add Cart rules through validation and calculation pipelines, not by calling provider SDKs. Owner ports make dependency contracts explicit and testable. A customer extension can add an entry validator or replace a Pricing resolver without forking Cart.\n\nOrder data is immutable commercial evidence. Corrections append history or create a governed lifecycle request; they do not rewrite the original placed facts. Store display labels separately from stable codes. Keep protected addresses and payment references in bounded schemas and projections.\n\nPlacement bridges must have deterministic idempotency keys. Derive child keys from the placement key and operation name so retry calls reach the same Inventory and Payment operations. Persist checkpoints before advancing. Do not infer success from a timeout; reconcile with the owner.\n\n## Operator and DevOps guidance\n\nOperators need calculation diagnostics, placement checkpoints, dependency latency, compensation status, stale reservations, and duplicate-attempt indicators. Axis displays backend evidence and refreshes after actions. It does not mark a placement successful because a button was clicked.\n\nSet bounded Cart sizes, pagination, timeouts, retry budgets, and queue backpressure. Load tests must include concurrent updates to one Cart, hot products, promotion bursts, inventory contention, provider timeout, and replay. Backup and restore tests prove that Orders and history survive while transient Carts follow the approved retention policy.\n\n## Security and failure behavior\n\nCustomer routes require customer access tokens and ownership checks. Employee routes require explicit Commerce permissions. Service bridges use service tokens. Tenant comes from trusted authentication context and cannot be overridden by payload data.\n\nA failed dependency leaves a diagnostic and returns an honest incomplete result. Compensation is idempotent and retryable. A Payment timeout becomes unknown until reconciliation, never automatically declined or authorized. Inventory reservation failure prevents this placement from reaching Order creation; this flow does not grant a caller-selected backorder bypass.\n\n## Common mistakes\n\n- Recalculating money with browser or floating-point logic.\n- Creating Order before durable reservation and authorization evidence.\n- Reusing a calculation after Cart revision changes.\n- Retrying with a new idempotency key.\n- Deleting Order history to correct a mistake.\n- Treating timeout as a known provider outcome.\n- Putting compensation logic inside an unrelated domain.\n\n## Verification\n\nRun Cart calculation and placement tests for success, unauthorized ownership, cross-tenant access, stale revision, concurrency, idempotent replay, dependency failure, each compensation boundary, and recovery after restart. Generate schema and route contracts from the effective Commerce graph. Validate Axis loading, empty, error, keyboard, responsive, and stale-evidence states. Production release additionally requires load and soak evidence at approved Cart size, order rate, and dependency latency budgets.\n\n## Explicit store context across applications\n\nCart APIs belong to Cart. A customer selects its store in the request rather than creating a store-specific controller, route or framework configuration. For example, `POST /carts` accepts `{ \"storeCode\": \"duStore\" }`; another customer uses the same endpoint with `{ \"storeCode\": \"independentStore\" }`. Paths are relative to the selected Cart module endpoint. The usual access token, permissions and ownership apply.\n\nCart and Shopping List reuse the existing Store context service. Identifier input may come from payload, query or established request context; supplied sources must agree. Missing, blank, surrounding-whitespace and non-string values fail before persistence. These checks validate identifier agreement; they do not look up Store master data or grant selling eligibility. The existing Store/channel and downstream domain owners retain those checks, without elevated credentials or raw database access.\n\nThe same resolved code feeds Cart identity and its model. An existing owned Cart uses its persisted store when read, updated or calculated by saved ID. Conflicting input, a missing persisted store, or an attempt to recreate that ID in another store is rejected. Activation must include Store when these operations run; a missing context service is unavailable, not a reason to infer a store.\n\n### Customize and extend safely\n\nKeep actual store selection in the calling application's established configuration and send it as operation data. No `cart.customerApi.defaultStoreCode` or `shoppingList.customerApi.defaultStoreCode` fallback is consumed. A later-loaded customer module may tighten the existing Store context service's exported validation method while preserving required context, agreement and authentication boundaries. Use the service override mechanism; do not add a resolver registry or copied API.\n\n### Upgrade, failure and recovery\n\nUpdate legacy callers that omitted `storeCode` before upgrading and remove unused server fallback declarations. Explicit-store Cart hashes and Shopping List ID formats remain unchanged. Existing records/entries are not automatically rekeyed or reassigned. Retain saved Cart IDs: an ID created by the old request-context-only hashing bug is still readable by ID, but recomputing the corrected hash cannot locate that old ID. Resolve orphaned or inconsistent references through a governed owner migration; never guess a store or fall back to a different list. Explicit Cart create/replace retains its prior lifecycle behavior and adds no new transactional retry guarantee.\n\n### Verification of context changes\n\nThe customer API contracts exercise independent stores through identical routes, legacy explicit IDs, context-only identity, missing/malformed/conflicting input, existing-record reuse, wrong owner/tenant, and effective-service overrides. Run Cart and Shopping List customer tests with the Commerce foundation and route security checks, then verify selected runtime activation and actual client requests. Prepared composition and mocked contract tests do not constitute live database or browser acceptance. Production migration must separately verify real owned records.\n\n## Physical and digital placement branches\n\nCart is the customer shopping list; Checkout is the coordinator that commits a purchase through the owning domains. A calculation describes the current basket but does not put stock aside or prove payment. The persisted Cart supplies customer and Store context. Product and Pricing supply retained publication evidence, Inventory supplies physical stock holds, Promotion supplies coupon units and campaign consumption, Payment supplies provider outcomes, Order supplies durable purchase identity, and Fulfillment/DigitalCore supply their own release or delivery evidence. A mixed basket uses both branches without making Checkout a second stock, token or payment authority.\n\n```mermaid\nflowchart TD\n  Cart[\"Owned persisted Cart and exact calculation\"] --> Classify{\"Owner-validated entry classification\"}\n  Classify -->|physical| Stock[\"Inventory atomic reserveAll\"]\n  Classify -->|digital coupon| Units[\"DigitalCore delegates unit allocation to Promotion\"]\n  Stock --> Auth[\"Payment must confirm AUTHORIZED\"]\n  Units --> Auth\n  Auth --> Order[\"Create durable Order and entry evidence\"]\n  Order --> Capture[\"Payment capture when owner port requires it\"]\n  Capture --> Campaign[\"Checkout commits Promotions once\"]\n  Campaign --> Sale[\"Confirm digital sale when units exist\"]\n  Sale --> Release[\"Fulfillment release; not proof of physical shipment\"]\n  Release --> Delivery[\"Digital delivery and owned entitlement evidence\"]\n  Delivery --> Complete[\"Complete placement checkpoint\"]\n  Complete --> Message[\"Optional committed notifications; outside financial compensation\"]\n```\n\n| Checkpoint or owner effect | What operators can inspect | Limit |\n| --- | --- | --- |\n| VALIDATED / CALCULATED | Owned Cart, current revision, exact decimals/currency and owner decision evidence. | Calculation is non-reserving and can become stale. |\n| RESERVED / DIGITAL_RESERVED | Physical holds and digital allocation results for the original command. | A checkpoint name can exist for an empty branch; inspect actual results. |\n| AUTHORIZED / ORDERED | Explicit Payment AUTHORIZED transaction and original durable Order. | Missing/declined/cancelled/unknown authorization cannot create a qualified purchase. |\n| PAYMENT_CAPTURED / PROMOTION_COMMITTED | Actual optional capture and campaign/redemption results when present. | Do not infer capture from authorization or apply campaigns separately before placement. |\n| DIGITAL_SOLD / RELEASED / DIGITAL_DELIVERED | Actual sale, release and delivery results for relevant entries. | A release is not carrier shipment; a digital label alone is not purchased reveal authority. |\n| Completed placement | The owner complete result, original Order and all required retained results. | HTTP success, a browser click or notification delivery is not financial completion. |\n\nDefaultOrderPlacementService finds an existing placement first and otherwise runs validate, calculate, physical reservation, digital reservation, Payment authorization, Order creation, optional capture, Promotion commit, digital sale, fulfillment release, digital delivery and completion in that order. The ports carry authenticated persisted-Cart Store context; caller-selected Store cannot choose a different campaign authority. DigitalCore does not reserve on Cart add/calculation. A repeat original placement key returns existing owner evidence, not a second Order, charge or allocation.\n\nFor developers and operators, distinguish the in-memory placement checkpoint from durable owner records. place builds completed and results while it awaits the ports; it does not persist a journal entry after each array append. The default complete port first closes the owned Cart, then saves a COMPLETED checkoutCheckpoint containing the original Order reference and relevant campaign, coupon, digital sale and delivery bindings. A process interruption before that save therefore requires inspection of original owner effects; an absent completed checkpoint is not proof that authorization, reservation or Order creation never happened. Do not turn this coordinator into a cross-owner database transaction or rebuild effects from the browser. The capture port derives LOCAL_SANDBOX_DEMO only on COMMERCE for CARD with provider stripe-sandbox, the exact DefaultStripeSandboxAdapterService, and the existing reviewed Stripe policy with enabled and sandboxOnly true, liveQualified false and maturity OFFLINE_CONFORMANCE. Browser-supplied mode, outcome or receipt fields cannot select that qualification. This is offline conformance, not real Card settlement or production certification; retain that distinction when interpreting downstream Order refund checkpoints and recovery results.\n\n## Placement failure and uncertain-owner recovery\n\n```mermaid\nflowchart TD\n  Failure[\"Placement owner throws or provider acknowledgement is uncertain\"] --> Retain[\"Retain original checkpoint and confirmed physical/digital acquisitions\"]\n  Retain --> Owners[\"Ask each original owner to compensate its actual effects\"]\n  Owners --> Check{\"Every required effect independently confirmed?\"}\n  Check -->|yes| Known[\"Known owner compensation evidence\"]\n  Check -->|no| Review[\"COMPENSATION_REQUIRED and explicit owner recovery\"]\n  Complete[\"Committed placement\"] --> Notify[\"Notification attempt or original frozen-intent retry\"]\n  Notify -->|message failed| Separate[\"Messaging remains unconfirmed; do not undo financial commit\"]\n```\n\n| Failure boundary | Required response | Unsafe shortcut |\n| --- | --- | --- |\n| Physical acquisition fails | Inventory rolls back or returns independently readable original holds; preserve confirmed acquisitions and recoveryRequired. | Saving a reservation row or inventing stock restoration. |\n| Digital acquisition is partial/uncertain | Carry confirmed units and uncertain original command key into Checkout compensation. | Treating failed read as no allocation or acquiring replacement units. |\n| Payment declined/cancelled/unconfirmed | Stop placement and ask original owners to release/void as appropriate. Reconcile unknown provider outcome. | Calling timeout a decline, authorization or capture. |\n| Later Order/capture/promotion/delivery step fails | Inspect original checkpoint and each owner outcome before same-intent recovery. | New idempotency key, deleting Order history or resetting campaign/stock. |\n| Hold release cannot be proven | Keep COMPENSATION_REQUIRED even when some known owners released successfully. | Reporting overall compensation success from a partial result. |\n| Committed notification fails | Inspect the source-scoped durable message intent and use its governed retry. | Re-entering placement compensation or creating new financial intent. |\n\nThe failure path copies confirmed inventoryReservations and digitalReservations from owner exceptions, including their recoveryRequired flags and the uncertain digital command key, before calling compensate. The default ports attempt committed Promotion reversal, digital reservation release, each physical hold release, and Payment reversal when applicable. A capture selects REFUND; otherwise an authorization selects VOID. The persisted compensation checkpoint records completed stages, per-owner outcomes, original correlation and uncertainty flags. An unresolved acquisition adds a failed outcome even if every known hold was released. Failure to persist this checkpoint still leaves owner effects requiring inspection; changing the placement key cannot repair that missing evidence.\n\n## Customize and test branch-aware Checkout\n\nCustomize fixtures or a documented owner port through the existing active project layer, not a new dependency executor. For example, select an approved sandbox Payment adapter or narrow supported shipping methods while preserving authenticated Cart/Store context, exact calculations, explicit authorization outcomes, original idempotency and owner evidence. Do not replace inherited placement with direct model writes. Promotion preview/calculation remains non-mutating; Checkout commits each selected campaign once after the payment phase. A coupon fixture must belong to the authenticated buyer and retain its original purchase/delivery evidence.\n\n1. Test physical-only, supported digital-only and mixed baskets, empty branches, stale Cart revision and foreign customer/Store/tenant rejection.\n2. Exercise every placement step failure, partial acquisition, lost acknowledgement, duplicate original placement and interrupted compensation; inspect complete owner evidence rather than completed labels alone.\n3. Verify explicit AUTHORIZED admission, capture outcomes and campaign/order binding. Purchased reveal additionally needs current capture, complete Order units, ACTIVE entitlement and DELIVERED evidence.\n4. Keep reverse requests, actual owner reversal, physical receipt/restock and financial settlement separate. Card/provider configuration and source fixtures do not certify a real provider.\n5. Run installed native owner and browser journeys only through separately authorized acceptance. These source-backed flows do not claim physical shipping, Card integration or production qualification.\n\nPayment compensation now requires terminal VOIDED for a void, or REFUNDED/REFUND_SUCCEEDED for a refund, together with a nonempty owner receipt reference and matching tenant, owner, Order and original financial idempotency. Returned amount/currency and provider status must agree when exposed. A nonthrowing call, error envelope, negative acknowledgment, missing result, pending/failed state or reconciliation flag cannot become COMPLETED. Failed or ambiguous reversal retains COMPENSATION_REQUIRED, the original token-free paymentCompensationIntent, the correct PAYMENT_VOID/PAYMENT_REFUND outcome and recovery identity. Payment-bearing compensation checks existing protected recovery before any owner effect and reads back persistence; matching retained recovery returns unchanged without redispatch, while changed or unbound recovery fails closed for manual review. New bound LOCAL_SANDBOX_DEMO captures remain refused by legacy compensation refund: a qualified owning recovery bridge is still missing, and Checkout cannot manufacture Order approval, a refund token or financial settlement. This bounded correction does not implement distributed atomicity, whole-placement resumption or automatic recovery after missing durability. Preserve the original identity and investigate owner evidence; do not create a fresh refund key. Offline evidence remains OFFLINE_CONFORMANCE, never external money. The checkoutCompensationSafetyContract regression exercises terminal, pending, failed, envelope-error, changed-intent, retained-replay, actual bound-capture refusal and persistence-failure paths. Native and cross-worker acceptance remain separate evidence.\n\n## Retained consignments and reviewed physical reversal\n\nThe existing releaseFulfillment port saves a READY consignment with code order.code + ':1', original tenant/enterprise/owner/order binding, revision 0, currency/total and original fulfillment idempotency key. Placement invokes that port after optional capture, Promotion commit and digital sale, before digital delivery. The retained consignment is real owner evidence, but READY is not dispatched, delivered or refunded. Inspect the actual physical branch and holds; a consignment alone cannot authorize a stock delta.\n\n| Boundary | Current owner behavior | Recovery limit |\n| --- | --- | --- |\n| Physical dispatch | Fulfillment's explicitly enabled MANUAL_ATTESTATION bridge locks the retained consignment and asks Inventory to consume original ACTIVE holds once, then records the original shipment. | Not a live carrier claim. Do not reconstruct missing holds or caller-supply shipment status. |\n| Reviewed full physical cancellation | Order reloads current Profile scope, original case/Store policy and approved refund plan. Fulfillment locks READY before dispatch; Inventory atomically releases exact original holds. | Mixed digital/partial retained entries, stale preview, dispatch lock or missing installed qualification reject. |\n| Reviewed physical return | Requires owner-issued shipment, actual bounded package receipts and full quantity coverage with RESTOCK/SCRAP inspection for every receipt before Inventory settlement and Payment. | REJECT_RETURN or incomplete receipt/inspection remains blocked. Legacy balanceAction RETURN remains refused. |\n| Refund after stock settlement | Order's PREPARE and SETTLE checkpoints precede Payment; completion requires confirmed original refund and exact owner evidence. | A pending or unknown refund preserves reconciliation; replay the same approved intent without replacing Order or replenishing stock twice. |\n\nKeep cancellation, dispatch, inspected return and Payment reconciliation as separate business actions. Test the physicalOrderReversalContract owner chain as well as placement contracts; separately qualify native persistence, actual warehouse evidence and browser controls. Checkout source coverage is not acceptance of a real Card/carrier integration.\n",
      "previous": {
        "title": "Commerce overview",
        "route": "/docs/framework/commerce-overview"
      },
      "next": {
        "title": "Payment and fulfillment operations",
        "route": "/docs/framework/commerce-payment-fulfillment"
      },
      "source": {
        "repository": "nodics.ai",
        "functionalModule": "nodics.commerce",
        "technicalModule": "checkoutCore",
        "owner": "checkoutCore",
        "sourcePath": "data/docs-v001/records/documentation/checkoutCoreDocumentationComponentData.js",
        "path": "data/docs-v001/records/documentation/checkoutCoreDocumentationComponentData.js",
        "wordCount": 2721,
        "checksum": "ccbd50f06f62e5ab6ad9b75cb9261e018bdf78f20f6bf1c54c2f5a07ededeef5"
      },
      "slug": "commerce-cart-order",
      "locale": "en",
      "navigationGroup": "Cart and Order Placement",
      "navigationGroupCode": "cart-and-order-placement",
      "navigationGroupOrder": 20,
      "navigationOrder": 20,
      "references": [
        {
          "documentId": "commerce.overview",
          "owner": "nodics.docs"
        },
        {
          "documentId": "commerce.payment-fulfillment",
          "owner": "paymentCore"
        },
        {
          "documentId": "commerce.returns-refunds",
          "owner": "order"
        },
        {
          "documentId": "promotion.campaigns-coupon-issuance",
          "owner": "promotion"
        },
        {
          "documentId": "cart.customer-intent-calculation",
          "owner": "cart"
        },
        {
          "documentId": "digital.purchase-delivery-reveal",
          "owner": "digitalCore"
        },
        {
          "documentId": "inventory.stock-management",
          "owner": "inventory",
          "anchor": "inventory-checkout-atomic-reservations"
        }
      ],
      "sourceCoverage": [
        {
          "modulePath": ".",
          "implementationState": "IMPLEMENTED",
          "anchors": [
            "checkout-physical-digital-branches",
            "checkout-placement-recovery-matrix",
            "checkout-branch-customization"
          ],
          "evidence": [
            "src/service/defaultOrderPlacementService.js",
            "src/service/defaultCheckoutPlacementPortsService.js",
            "test/orderPlacementContract.test.js"
          ]
        }
      ]
    },
    "active": true
  },
  "record1": {
    "code": "nodicsDocsComponentcommerceEnterpriseOperations",
    "typeCode": "nodicsDocumentationArticleComponentType",
    "renderer": "documentation.component.article",
    "accessMode": "PUBLIC",
    "properties": {
      "code": "commerce.enterprise-operations",
      "title": "Commerce enterprise operations and migration",
      "route": "/docs/framework/commerce-enterprise-operations",
      "section": "operations-monitoring-and-recovery",
      "sectionTitle": "Operations, Monitoring, and Recovery",
      "group": "operations-monitoring-and-recovery",
      "groupTitle": "Operations, Monitoring, and Recovery",
      "parentId": "operations-monitoring-and-recovery",
      "hierarchyPath": [
        "Operations, Monitoring, and Recovery",
        "Commerce enterprise operations and migration"
      ],
      "hierarchyDepth": 2,
      "documentType": "operations",
      "audience": [
        "business",
        "architect",
        "administrator",
        "developer",
        "operator",
        "qa",
        "ai-tool"
      ],
      "businessAudience": [
        "business user",
        "administrator",
        "implementation partner"
      ],
      "technicalAudience": [
        "architect",
        "developer",
        "operator",
        "qa engineer",
        "ai tool"
      ],
      "summary": "Capacity, backpressure, providers, recovery, compatibility, tenant migration, rollback, legacy retirement, and production qualification guidance.",
      "visibility": "public",
      "accessMode": "PUBLIC",
      "publiclyAvailable": true,
      "requiresAuthentication": false,
      "allowedRoles": [],
      "allowedGroups": [],
      "allowedPermissions": [],
      "lifecycleState": "ONLINE",
      "version": "0.16.5",
      "maturityState": "operational",
      "implementationState": "current",
      "renderingComponent": "documentation.component.article",
      "relatedPages": [
        "commerce.overview",
        "framework.devops-runtime"
      ],
      "sourceEvidence": [
        "../../../../../nodics.docs/data/manifest.json",
        "../../../../../nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js",
        "package.json",
        "src/schemas",
        "src/service"
      ],
      "visualRequirements": [
        "troubleshooting-matrix"
      ],
      "searchKeywords": [
        "operations-monitoring-and-recovery",
        "commerce-enterprise-operations",
        "commerce-enterprise-operations-and-migration"
      ],
      "topicKeywords": [
        "Operations, Monitoring, and Recovery",
        "Commerce Enterprise Operations",
        "Commerce enterprise operations and migration"
      ],
      "headings": [
        {
          "text": "Operational outcome",
          "anchor": "commerceEnterpriseOperations-1-operational-outcome",
          "level": 2
        },
        {
          "text": "Beginner mental model",
          "anchor": "commerceEnterpriseOperations-2-beginner-mental-model",
          "level": 2
        },
        {
          "text": "Capacity and backpressure",
          "anchor": "commerceEnterpriseOperations-3-capacity-and-backpressure",
          "level": 2
        },
        {
          "text": "Backup, restore, and disaster recovery",
          "anchor": "commerceEnterpriseOperations-4-backup-restore-and-disaster-recovery",
          "level": 2
        },
        {
          "text": "Compatibility and upgrades",
          "anchor": "commerceEnterpriseOperations-5-compatibility-and-upgrades",
          "level": 2
        },
        {
          "text": "Tenant migration journey",
          "anchor": "commerceEnterpriseOperations-6-tenant-migration-journey",
          "level": 2
        },
        {
          "text": "Developer guidance",
          "anchor": "commerceEnterpriseOperations-7-developer-guidance",
          "level": 2
        },
        {
          "text": "Operator and release-owner guidance",
          "anchor": "commerceEnterpriseOperations-8-operator-and-release-owner-guidance",
          "level": 2
        },
        {
          "text": "Common mistakes",
          "anchor": "commerceEnterpriseOperations-9-common-mistakes",
          "level": 2
        },
        {
          "text": "Verification",
          "anchor": "commerceEnterpriseOperations-10-verification",
          "level": 2
        },
        {
          "text": "Customization and extension",
          "anchor": "commerceEnterpriseOperations-11-customization-and-extension",
          "level": 2
        }
      ],
      "blocks": [
        {
          "kind": "heading",
          "level": 2,
          "text": "Operational outcome",
          "anchor": "commerceEnterpriseOperations-1-operational-outcome"
        },
        {
          "kind": "paragraph",
          "text": "Commerce is safe to release only when correctness, capacity, recovery, compatibility, and migration evidence tell the same story. Unit tests prove deterministic rules; they do not prove that a production database, payment provider, carrier, region, or traffic profile is qualified."
        },
        {
          "kind": "paragraph",
          "text": "The business value is controlled growth without sacrificing financial correctness, customer trust, recoverability, or upgrade safety."
        },
        {
          "kind": "table",
          "headers": [
            "Evidence layer",
            "Framework proof",
            "Deployment proof"
          ],
          "rows": [
            [
              "Capacity",
              "bounded pages, carts, batches, retries, and a reference arithmetic harness",
              "representative load and soak against production-like topology"
            ],
            [
              "Providers",
              "adapter, timeout, callback, replay, idempotency, and offline conformance tests",
              "credentialed sandbox certification and contracted limits"
            ],
            [
              "Recovery",
              "checkpoints, restore-manifest comparison, retry and reconciliation contracts",
              "backup, restore, failover, RPO and RTO rehearsal"
            ],
            [
              "Compatibility",
              "version comparison, alias window, successor and sunset evidence",
              "consumer matrix and upgrade/rollback rehearsal"
            ],
            [
              "Migration",
              "dry-run mapping, count, hash, quarantine, cutover and rollback contracts",
              "tenant-by-tenant approved execution and reconciliation"
            ],
            [
              "Retirement",
              "active runtime scan and standard module identity",
              "completed rollback window and operational owner acceptance"
            ]
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Beginner mental model",
          "anchor": "commerceEnterpriseOperations-2-beginner-mental-model"
        },
        {
          "kind": "paragraph",
          "text": "Think of a Commerce release as moving a warehouse while customers continue ordering. First count and label everything. Then rehearse the move, quarantine anything that does not map, move one controlled section, compare the old and new ledgers, and keep a rollback route until the agreed window ends."
        },
        {
          "kind": "paragraph",
          "text": "The framework provides the checklist and evidence shapes. A customer deployment supplies real volumes, infrastructure, provider accounts, recovery regions, legal policy, and named approvers. This separation prevents local tests from being presented as production certification."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Capacity and backpressure",
          "anchor": "commerceEnterpriseOperations-3-capacity-and-backpressure"
        },
        {
          "kind": "paragraph",
          "text": "The reference configuration bounds page size at 100, Cart entries at 500, batch size at 100, and concurrent provider requests at 25. Retry uses exponential delay, a maximum attempt count, and a maximum delay. These are reference defaults, not universal service-level objectives."
        },
        {
          "kind": "paragraph",
          "text": "Developers preserve limits at every API, repository, queue, export, and provider boundary. Operators monitor p50, p95, p99, throughput, error rate, saturation, queue depth, retry age, stale reservations, placement checkpoint age, unknown payments, shipment exceptions, and reconciliation lag. DevOps teams test hot products, concurrent Cart revisions, promotion bursts, inventory contention, dependency latency, callback storms, provider throttling, and regional failure."
        },
        {
          "kind": "paragraph",
          "text": "The included capacity test executes 50,000 exact decimal additions and records elapsed time as a regression harness. It is deliberately not called a production load test."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Backup, restore, and disaster recovery",
          "anchor": "commerceEnterpriseOperations-4-backup-restore-and-disaster-recovery"
        },
        {
          "kind": "paragraph",
          "text": "A backup manifest records tenant, counts for Orders, Payments, Shipments, lifecycle requests and history, checksum, and checkpoint. Restore verification compares counts and checksum before traffic resumes. A mismatch becomes DRIFTED and blocks automatic continuation."
        },
        {
          "kind": "paragraph",
          "text": "Recovery resumes from durable checkpoints and reuses original idempotency keys. Unknown Payment and carrier outcomes are reconciled externally before replay. Disaster recovery must never reissue an authorization, capture, shipment, void, or refund merely because local state was restored."
        },
        {
          "kind": "paragraph",
          "text": "Each deployment rehearses backup, restore, regional failover, dependency unavailability, and return to the primary region. It records measured recovery point and recovery time rather than copying the reference targets."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Compatibility and upgrades",
          "anchor": "commerceEnterpriseOperations-5-compatibility-and-upgrades"
        },
        {
          "kind": "paragraph",
          "text": "Contracts use semantic versions and classify compatible, deprecated, or breaking change. The default compatibility alias window is two minor releases or 180 days. A deprecated alias has a successor and sunset date. It translates identity at the boundary and never keeps a duplicate service or schema authority active."
        },
        {
          "kind": "paragraph",
          "text": "Upgrade rehearsal runs old consumers against the new compatible surface, then new consumers against the supported server matrix. Rollback rehearsal proves that application rollback does not corrupt newer durable evidence. A breaking database change requires forward and rollback migration plans."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Tenant migration journey",
          "anchor": "commerceEnterpriseOperations-6-tenant-migration-journey"
        },
        {
          "kind": "paragraph",
          "text": "Migration defaults to DRY_RUN. For every tenant and schema, record source count, target count, source hash, mapping version, errors, quarantined records, and rollback reference. The approved order is Store, Product, Pricing, Tax, Promotion, Inventory, Cart, Order, Payment, Fulfillment, then reverse lifecycle evidence."
        },
        {
          "kind": "paragraph",
          "text": "Cutover is allowed only after dry-run counts and hashes reconcile. Failed records are quarantined; they are not silently skipped. Rollback removes or deactivates only records created by that migration release and preserves immutable audit evidence."
        },
        {
          "kind": "paragraph",
          "text": "The archived Commerce repository remains historical reference. Active package metadata, runtime source, configuration, server graphs, routes, and imports use `nodics.commerce`. A retirement contract scans active runtime paths for executable archived references."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Developer guidance",
          "anchor": "commerceEnterpriseOperations-7-developer-guidance"
        },
        {
          "kind": "paragraph",
          "text": "Add operational evidence to the owning module. Checkout Core may coordinate cross-domain checkpoints, but Pricing still owns price decisions and Payment still owns reconciliation. Generated schema, service, controller, route-test, OpenAPI, and LLM artifacts come from effective source and are regenerated after changes."
        },
        {
          "kind": "paragraph",
          "text": "Never hardcode machine paths, credentials, provider secrets, or customer data into evidence. Hashes prove integrity, not confidentiality. Redact protected payloads and retain only references needed for audit."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Operator and release-owner guidance",
          "anchor": "commerceEnterpriseOperations-8-operator-and-release-owner-guidance"
        },
        {
          "kind": "paragraph",
          "text": "The release owner reviews framework tests, effective graph, generated artifacts, Axis journey, documentation, migration rehearsal, provider qualification, load/soak, restore/failover, compatibility matrix, rollback, known limitations, and residual risks. Finance approves payment/reconciliation policy; Operations approves fulfillment and recovery; Security approves callback, secret, access and audit controls; Product approves customer policy; the deployment owner accepts environment-specific targets."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Common mistakes",
          "anchor": "commerceEnterpriseOperations-9-common-mistakes"
        },
        {
          "kind": "unordered-list",
          "items": [
            "Calling a microbenchmark a production load test.",
            "Claiming provider qualification from an offline simulator.",
            "Retrying unknown money movement with a new key.",
            "Migrating all tenants before a reconciled dry run.",
            "Keeping two active schemas behind a compatibility alias.",
            "Restoring counts without comparing a checksum.",
            "Retiring the archive before the rollback window ends.",
            "Editing generated artifacts instead of source."
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Verification",
          "anchor": "commerceEnterpriseOperations-10-verification"
        },
        {
          "kind": "paragraph",
          "text": "Run focused Commerce contracts, all generated schema and route contracts, controlled Commerce plus Process graph build, module metadata, syntax, ownership, documentation, LLM generation and validation, Axis verify, and the active-runtime retirement scan. Record the generated counts and observed capacity-harness duration."
        },
        {
          "kind": "paragraph",
          "text": "Deployment release remains conditional until named owners attach representative load and soak results, credentialed provider and carrier qualification, backup/restore and failover measurements, tenant migration reconciliation, upgrade/rollback rehearsal, and residual-risk acceptance. That conditional gate is a feature of honest enterprise readiness, not an implementation omission."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Customization and extension",
          "anchor": "commerceEnterpriseOperations-11-customization-and-extension"
        },
        {
          "kind": "paragraph",
          "text": "Commerce projects may extend operations with tenant migration policies, provider qualification matrices, regional rollout gates, capacity dashboards, and release-owner approvals. The extension must keep pricing, payment, fulfillment, inventory, order, and publication evidence with the owning capability, while the enterprise operations page summarizes release readiness and residual risk."
        }
      ],
      "searchText": "Commerce enterprise operations and migration Capacity, backpressure, providers, recovery, compatibility, tenant migration, rollback, legacy retirement, and production qualification guidance. # Commerce enterprise operations and migration\n\n## Operational outcome\n\nCommerce is safe to release only when correctness, capacity, recovery, compatibility, and migration evidence tell the same story. Unit tests prove deterministic rules; they do not prove that a production database, payment provider, carrier, region, or traffic profile is qualified.\n\nThe business value is controlled growth without sacrificing financial correctness, customer trust, recoverability, or upgrade safety.\n\n| Evidence layer | Framework proof | Deployment proof |\n| --- | --- | --- |\n| Capacity | bounded pages, carts, batches, retries, and a reference arithmetic harness | representative load and soak against production-like topology |\n| Providers | adapter, timeout, callback, replay, idempotency, and offline conformance tests | credentialed sandbox certification and contracted limits |\n| Recovery | checkpoints, restore-manifest comparison, retry and reconciliation contracts | backup, restore, failover, RPO and RTO rehearsal |\n| Compatibility | version comparison, alias window, successor and sunset evidence | consumer matrix and upgrade/rollback rehearsal |\n| Migration | dry-run mapping, count, hash, quarantine, cutover and rollback contracts | tenant-by-tenant approved execution and reconciliation |\n| Retirement | active runtime scan and standard module identity | completed rollback window and operational owner acceptance |\n\n## Beginner mental model\n\nThink of a Commerce release as moving a warehouse while customers continue ordering. First count and label everything. Then rehearse the move, quarantine anything that does not map, move one controlled section, compare the old and new ledgers, and keep a rollback route until the agreed window ends.\n\nThe framework provides the checklist and evidence shapes. A customer deployment supplies real volumes, infrastructure, provider accounts, recovery regions, legal policy, and named approvers. This separation prevents local tests from being presented as production certification.\n\n## Capacity and backpressure\n\nThe reference configuration bounds page size at 100, Cart entries at 500, batch size at 100, and concurrent provider requests at 25. Retry uses exponential delay, a maximum attempt count, and a maximum delay. These are reference defaults, not universal service-level objectives.\n\nDevelopers preserve limits at every API, repository, queue, export, and provider boundary. Operators monitor p50, p95, p99, throughput, error rate, saturation, queue depth, retry age, stale reservations, placement checkpoint age, unknown payments, shipment exceptions, and reconciliation lag. DevOps teams test hot products, concurrent Cart revisions, promotion bursts, inventory contention, dependency latency, callback storms, provider throttling, and regional failure.\n\nThe included capacity test executes 50,000 exact decimal additions and records elapsed time as a regression harness. It is deliberately not called a production load test.\n\n## Backup, restore, and disaster recovery\n\nA backup manifest records tenant, counts for Orders, Payments, Shipments, lifecycle requests and history, checksum, and checkpoint. Restore verification compares counts and checksum before traffic resumes. A mismatch becomes DRIFTED and blocks automatic continuation.\n\nRecovery resumes from durable checkpoints and reuses original idempotency keys. Unknown Payment and carrier outcomes are reconciled externally before replay. Disaster recovery must never reissue an authorization, capture, shipment, void, or refund merely because local state was restored.\n\nEach deployment rehearses backup, restore, regional failover, dependency unavailability, and return to the primary region. It records measured recovery point and recovery time rather than copying the reference targets.\n\n## Compatibility and upgrades\n\nContracts use semantic versions and classify compatible, deprecated, or breaking change. The default compatibility alias window is two minor releases or 180 days. A deprecated alias has a successor and sunset date. It translates identity at the boundary and never keeps a duplicate service or schema authority active.\n\nUpgrade rehearsal runs old consumers against the new compatible surface, then new consumers against the supported server matrix. Rollback rehearsal proves that application rollback does not corrupt newer durable evidence. A breaking database change requires forward and rollback migration plans.\n\n## Tenant migration journey\n\nMigration defaults to DRY_RUN. For every tenant and schema, record source count, target count, source hash, mapping version, errors, quarantined records, and rollback reference. The approved order is Store, Product, Pricing, Tax, Promotion, Inventory, Cart, Order, Payment, Fulfillment, then reverse lifecycle evidence.\n\nCutover is allowed only after dry-run counts and hashes reconcile. Failed records are quarantined; they are not silently skipped. Rollback removes or deactivates only records created by that migration release and preserves immutable audit evidence.\n\nThe archived Commerce repository remains historical reference. Active package metadata, runtime source, configuration, server graphs, routes, and imports use `nodics.commerce`. A retirement contract scans active runtime paths for executable archived references.\n\n## Developer guidance\n\nAdd operational evidence to the owning module. Checkout Core may coordinate cross-domain checkpoints, but Pricing still owns price decisions and Payment still owns reconciliation. Generated schema, service, controller, route-test, OpenAPI, and LLM artifacts come from effective source and are regenerated after changes.\n\nNever hardcode machine paths, credentials, provider secrets, or customer data into evidence. Hashes prove integrity, not confidentiality. Redact protected payloads and retain only references needed for audit.\n\n## Operator and release-owner guidance\n\nThe release owner reviews framework tests, effective graph, generated artifacts, Axis journey, documentation, migration rehearsal, provider qualification, load/soak, restore/failover, compatibility matrix, rollback, known limitations, and residual risks. Finance approves payment/reconciliation policy; Operations approves fulfillment and recovery; Security approves callback, secret, access and audit controls; Product approves customer policy; the deployment owner accepts environment-specific targets.\n\n## Common mistakes\n\n- Calling a microbenchmark a production load test.\n- Claiming provider qualification from an offline simulator.\n- Retrying unknown money movement with a new key.\n- Migrating all tenants before a reconciled dry run.\n- Keeping two active schemas behind a compatibility alias.\n- Restoring counts without comparing a checksum.\n- Retiring the archive before the rollback window ends.\n- Editing generated artifacts instead of source.\n\n## Verification\n\nRun focused Commerce contracts, all generated schema and route contracts, controlled Commerce plus Process graph build, module metadata, syntax, ownership, documentation, LLM generation and validation, Axis verify, and the active-runtime retirement scan. Record the generated counts and observed capacity-harness duration.\n\nDeployment release remains conditional until named owners attach representative load and soak results, credentialed provider and carrier qualification, backup/restore and failover measurements, tenant migration reconciliation, upgrade/rollback rehearsal, and residual-risk acceptance. That conditional gate is a feature of honest enterprise readiness, not an implementation omission.\n\n## Customization and extension\n\nCommerce projects may extend operations with tenant migration policies, provider qualification matrices, regional rollout gates, capacity dashboards, and release-owner approvals. The extension must keep pricing, payment, fulfillment, inventory, order, and publication evidence with the owning capability, while the enterprise operations page summarizes release readiness and residual risk.\n",
      "previous": {
        "title": "Local verification and acceptance checklist",
        "route": "/docs/framework/framework-local-verification-checklist"
      },
      "next": {
        "title": "Incident, Retry, and Compensation Operations",
        "route": "/docs/framework/process/incident-recovery"
      },
      "source": {
        "repository": "nodics.ai",
        "functionalModule": "nodics.commerce",
        "technicalModule": "checkoutCore",
        "owner": "checkoutCore",
        "sourcePath": "data/docs-v001/records/documentation/checkoutCoreDocumentationComponentData.js",
        "path": "data/docs-v001/records/documentation/checkoutCoreDocumentationComponentData.js",
        "wordCount": 1016,
        "checksum": "35d3b0415c79ba8cb2507b1b0003fb6e61216fa6d3eeff327025613e65d29fe8"
      },
      "slug": "commerce-enterprise-operations",
      "locale": "en",
      "navigationGroup": "Commerce Enterprise Operations",
      "navigationGroupCode": "commerce-enterprise-operations",
      "navigationGroupOrder": 30,
      "navigationOrder": 30,
      "references": [
        {
          "documentId": "commerce.overview",
          "owner": "nodics.docs"
        },
        {
          "documentId": "framework.devops-runtime",
          "owner": "nTooling"
        }
      ]
    },
    "active": true
  }
};
