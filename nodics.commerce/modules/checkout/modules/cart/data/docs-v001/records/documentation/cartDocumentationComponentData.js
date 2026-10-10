/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @description Canonical cart documentation CMS records; business setup remains independently selectable. */
module.exports = {
  "record0": {
    "code": "nodicsDocsComponentcartCustomerIntentCalculation",
    "typeCode": "nodicsDocumentationArticleComponentType",
    "renderer": "documentation.component.article",
    "accessMode": "PUBLIC",
    "properties": {
      "code": "cart.customer-intent-calculation",
      "title": "Cart Customer Intent and Calculation",
      "route": "/docs/framework/cart-customer-intent-calculation",
      "section": "commerce-cart-and-checkout",
      "sectionTitle": "Commerce, Cart, and Checkout",
      "group": "commerce-cart-and-checkout",
      "groupTitle": "Commerce, Cart, and Checkout",
      "parentId": "commerce-cart-and-checkout",
      "hierarchyPath": [
        "Commerce, Cart, and Checkout",
        "Cart Customer Intent and Calculation"
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
      "summary": "Persist buyer and Store intent, validate pinned Product identities, calculate exact owner decisions without reservations, and recover safely when an entry response fails after its write.",
      "visibility": "public",
      "accessMode": "PUBLIC",
      "publiclyAvailable": true,
      "requiresAuthentication": false,
      "allowedRoles": [],
      "allowedGroups": [],
      "allowedPermissions": [],
      "lifecycleState": "ONLINE",
      "version": "0.0.1",
      "maturityState": "operational",
      "implementationState": "current",
      "renderingComponent": "documentation.component.article",
      "relatedPages": [
        "inventory.stock-management",
        "commerce.cart-order",
        "commerce.payment-provider-boundaries",
        "security.identity-access-governance",
        "promotion.campaigns-coupon-issuance",
        "digital.purchase-delivery-reveal"
      ],
      "sourceEvidence": [
        "src/service/defaultCartOperationService.js",
        "src/service/defaultCartValidationService.js",
        "src/service/defaultCartCalculationEngineService.js",
        "src/service/defaultCommerceCalculationPortsService.js",
        "src/router/routers.js",
        "src/schemas/schemas.js",
        "config/properties.js",
        "llm/contracts/store-defaults.md",
        "test/cartCustomerApiContract.test.js",
        "test/cartActivatedPolicyPorts.test.js"
      ],
      "visualRequirements": [
        "diagram",
        "configuration-table",
        "code-example",
        "troubleshooting-matrix",
        "source-map-table"
      ],
      "searchKeywords": [
        "cart.customer-intent-calculation",
        "cart",
        "original-replay",
        "scope",
        "recovery"
      ],
      "topicKeywords": [
        "Cart Customer Intent and Calculation",
        "Commerce owner evidence"
      ],
      "headings": [
        {
          "text": "Business context and reader paths",
          "anchor": "cart-business-context",
          "level": 2
        },
        {
          "text": "Persisted buyer and Store context",
          "anchor": "cart-persisted-context",
          "level": 2
        },
        {
          "text": "Entry identity and pinned Product selection",
          "anchor": "cart-entry-identity",
          "level": 2
        },
        {
          "text": "Availability versus commitment",
          "anchor": "cart-availability",
          "level": 2
        },
        {
          "text": "Exact calculation evidence and owner order",
          "anchor": "cart-calculation-evidence",
          "level": 2
        },
        {
          "text": "Persisted write followed by response rejection",
          "anchor": "cart-write-response-boundary",
          "level": 2
        },
        {
          "text": "Checkout handoff and recovery",
          "anchor": "cart-checkout-handoff",
          "level": 2
        },
        {
          "text": "Customer safety, operations and observability",
          "anchor": "cart-operations",
          "level": 2
        },
        {
          "text": "Customization and extension",
          "anchor": "cart-customization",
          "level": 2
        },
        {
          "text": "Source map and verification",
          "anchor": "cart-source-map",
          "level": 2
        },
        {
          "text": "Common mistakes",
          "anchor": "cart-common-mistakes",
          "level": 2
        },
        {
          "text": "Verification",
          "anchor": "cart-verification",
          "level": 2
        }
      ],
      "blocks": [
        {
          "kind": "heading",
          "level": 2,
          "text": "Business context and reader paths",
          "anchor": "cart-business-context"
        },
        {
          "kind": "paragraph",
          "text": "A Cart records what a buyer intends to purchase in one Store. It is not an Order, a payment receipt or a guarantee of remaining supply. Buyers can inspect and change entries while Product, Pricing, Inventory, Promotion and Tax explain whether those entries can currently be purchased. Checkout later acquires actual resources and commits the transaction. This distinction prevents abandoned browsing from holding physical stock or finite coupon units, while still giving the business a traceable calculation rather than frontend arithmetic."
        },
        {
          "kind": "table",
          "headers": [
            "Audience",
            "Question answered",
            "Guide section"
          ],
          "rows": [
            [
              "Business evaluator",
              "Why calculation is useful without promising stock",
              "Availability versus commitment"
            ],
            [
              "Business user and buyer-support staff",
              "Why a saved entry can be unavailable or a total can change",
              "Mutation response and recovery"
            ],
            [
              "Beginner developer",
              "Which identity and Store context the client must retain",
              "Persisted context and entry identity"
            ],
            [
              "Administrator/operator",
              "Which owner rejection to repair without moving a Cart",
              "Failure matrix and source map"
            ],
            [
              "Framework maintainer/QA",
              "Which source contracts and customization boundaries to prove",
              "Calculation evidence and verification"
            ],
            [
              "AI tool",
              "Where to change Cart behavior without duplicating domain rules",
              "Customization and references"
            ]
          ]
        },
        {
          "kind": "paragraph",
          "text": "Cart owns Cart, CartEntry and CartCalculation persistence and the coordination of owner decisions. Product owns catalog/SKU identity; Store owns Store reference validation; Profile owns authentication and buyer/Enterprise context. Inventory owns physical stock and reservations. DigitalCore coordinates digital classification and delegates pool supply to Promotion. Pricing, Promotion and Tax own their monetary decisions. Axis and storefront applications consume these APIs; they must not reconstruct backend ownership or silently choose framework-wide application Stores."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Persisted buyer and Store context",
          "anchor": "cart-persisted-context"
        },
        {
          "kind": "paragraph",
          "text": "Supply an explicit application Store when creating a Cart. DefaultStoreContextService resolves request Store references and rejects conflicts; Cart has no universal defaultStoreCode. The stored Cart retains ownerId, tenant, enterpriseCode, storeCode, channelCode, locale, jurisdiction, currency, status and revision. Subsequent operations load the owned Cart and use its saved Store. A new request cannot move an existing Cart to another Store, nor can a body grant another customer's identity. Keep saved Cart references rather than recomputing an identity after a version change."
        },
        {
          "kind": "table",
          "headers": [
            "Identity or setting",
            "Current source behavior",
            "Integration consequence"
          ],
          "rows": [
            [
              "Default Cart code",
              "cart_ plus a SHA-1-derived prefix of tenant, ownerId and explicit Store",
              "Distinct buyer/Store scope; hashing is not authorization"
            ],
            [
              "Explicit cartCode",
              "Accepted as the Cart identity within normal owned operations",
              "Retain returned reference and owner checks; do not guess another buyer's ID"
            ],
            [
              "Saved Store",
              "Validated on create/load; conflicting references reject",
              "A wrong Store is not repaired by defaulting to the first active Store"
            ],
            [
              "Channel/locale/jurisdiction/currency",
              "Payload and effective customerApi defaults supply initial context",
              "Deployments choose actual business values intentionally"
            ],
            [
              "Legacy saved IDs",
              "Read using original saved references",
              "No automatic migration or recomputed lookup guarantee"
            ],
            [
              "Repeated create",
              "Existing create/replace semantics remain",
              "Not a new transactional idempotency contract"
            ],
            [
              "Signed customer context",
              "Router/customer boundary and Profile authority remain active",
              "A Cart hash or caller enterpriseCode does not confer access"
            ]
          ]
        },
        {
          "kind": "diagram",
          "language": "mermaid",
          "text": "flowchart TD\n  Client[Signed buyer and explicit Store] --> Create[Cart create or read owned reference]\n  Create --> Stored[Persisted Cart context]\n  Request[Later entry or calculation request] --> Load[Load owned Cart]\n  Stored --> Load\n  Load --> Conflict{Caller Store conflicts?}\n  Conflict -->|Yes| Deny[Reject before cross-Store work]\n  Conflict -->|No| Owners[Delegate exact saved scope to capability owners]\n  Owners --> Evidence[Customer-safe validation and calculation]"
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Entry identity and pinned Product selection",
          "anchor": "cart-entry-identity"
        },
        {
          "kind": "paragraph",
          "text": "An entry retains productCode, resolved SKU, optional variantCode, quantity, owner, Cart and scope. The default entry code joins the original Cart, Product and SKU with pipe delimiters. Checkout and DigitalCore later retain this same original line identity; it is not an OrderEntry record code reconstructed after purchase. Preserve delimiters and returned identity in clients, logs that permit non-secret references, tests and extension code. A custom entryCode still must respect owner/Cart scope; a friendly label never replaces Product authority."
        },
        {
          "kind": "code",
          "language": "json",
          "text": "{\n  \"storeCode\": \"selectedStore\",\n  \"locale\": \"en\",\n  \"currency\": \"USD\"\n}"
        },
        {
          "kind": "paragraph",
          "text": "An entry request to the returned owned Cart can supply the following Product intent."
        },
        {
          "kind": "code",
          "language": "json",
          "text": "{\n  \"productCode\": \"reviewedProduct\",\n  \"variantCode\": \"reviewedVariant\",\n  \"quantity\": \"2\"\n}"
        },
        {
          "kind": "paragraph",
          "text": "The two objects show payload shape, not grants or a ready-to-run commercial fixture. For a Store selected for activated Product delivery, variant/SKU lookup uses Product's pinned resolver with the same tenant, enterprise, Store and locale. A supplied SKU must equal the selected variant's retained SKU; an explicit-SKU-only request must belong to a declared variant in the activated snapshot. Empty or ambiguous activation cannot fall back to mutable variants or independently query a CURRENT projection. Unselected Stores retain their existing legacy path; selection must not be fabricated to make lookup succeed."
        },
        {
          "kind": "paragraph",
          "text": "Search is an index, not classification or ownership authority. Retained Product projections provide the actual SKU map and approved digital attributes. Missing foreign/duplicate retained evidence refuses before downstream pricing or allocation. ERR_CART_PRODUCT_UNAVAILABLE is the customer-facing conflict for a mismatched selected SKU. Correct the owning Product publication/discovery boundary; do not insert warehouse stock for a product whose approved digital classification failed."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Availability versus commitment",
          "anchor": "cart-availability"
        },
        {
          "kind": "table",
          "headers": [
            "Operation",
            "What it can do",
            "What it cannot prove"
          ],
          "rows": [
            [
              "Add/update/remove entry",
              "Persist intent and perform subsequent validation/calculation",
              "Atomic rollback of the entry if response validation rejects"
            ],
            [
              "Cart validation",
              "Read availability, quantity and identity decisions",
              "Reserve a physical balance or coupon"
            ],
            [
              "Cart calculation",
              "Save exact price/discount/tax/availability evidence",
              "Hold stock, debit money, redeem a coupon or create an entitlement"
            ],
            [
              "Physical availability",
              "Inventory sourcing over eligible balances/activated warehouses",
              "Guaranteed quantity at later checkout"
            ],
            [
              "Digital availability",
              "Pinned Product classification and Promotion pool read",
              "Caller-specified batch authority or ownership of a token"
            ],
            [
              "Checkout placement",
              "Revalidate/recalculate and acquire via real owners",
              "Use a stale Cart preview as an irrevocable promise"
            ]
          ]
        },
        {
          "kind": "paragraph",
          "text": "DefaultCommerceCalculationPortsService asks DigitalCore first when installed. A supported COUPON_CODE_POOL offer delegates exact Product/Store scope to Promotion without reserving a unit; a physical Product returns to Inventory. Malformed or unsupported digital evidence rejects and must not become physical stock by fallback. Physical sourcing reads current balances and eligible warehouse policy, returns PHYSICAL_STOCK with reservableAt CHECKOUT_BEFORE_PAYMENT and guaranteed false. A positive availability answer can change when another buyer purchases before this buyer reaches Checkout."
        },
        {
          "kind": "diagram",
          "language": "mermaid",
          "text": "flowchart LR\n  Entry[Persisted Cart entry] --> Product[Pinned retained Product and SKU]\n  Product --> Kind{Supported digital offer?}\n  Kind -->|Yes| Digital[DigitalCore non-reserving classification]\n  Digital --> Pool[Promotion approved pool availability]\n  Kind -->|Physical| Inventory[Inventory physical availability]\n  Pool --> Validate[Cart validation and calculation]\n  Inventory --> Validate\n  Validate --> Preview[Saved exact calculation preview]\n  Preview --> Checkout[Separate Checkout acquisition before payment]"
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Exact calculation evidence and owner order",
          "anchor": "cart-calculation-evidence"
        },
        {
          "kind": "paragraph",
          "text": "For each entry, the calculation engine checks availability before invoking Pricing, accumulates exact totals using DefaultExactAmountService, and retains priceDecision and availability with the original entry identity. For a nonempty Cart it then requests Promotion against subtotal/Product/customer/coupon context and Tax against the discounted taxable amount. Its total is subtotal minus normalized discount plus tax. Empty Carts return normalized zero evidence with EMPTY_CART rather than invoking discount/tax commitments. None of those decisions consume budgets or allocate stock."
        },
        {
          "kind": "table",
          "headers": [
            "Calculation field",
            "Meaning",
            "Owner boundary"
          ],
          "rows": [
            [
              "entries[].code/productCode/variantCode/sku/quantity",
              "Original intent and exact selected identity",
              "Cart and Product"
            ],
            [
              "entries[].priceDecision",
              "Selected exact price and provenance",
              "Pricing, including negotiated-price owner where selected"
            ],
            [
              "entries[].availability",
              "Physical candidates or digital supply evidence",
              "Inventory or DigitalCore/Promotion; internal details redacted for customers"
            ],
            [
              "subtotal/discountAmount/taxAmount/totalAmount",
              "Exact decimal-string money in Cart currency",
              "ExactAmount plus Pricing/Promotion/Tax decisions"
            ],
            [
              "decisions.discount and decisions.tax",
              "Why the monetary decision was made",
              "Their owners remain authoritative"
            ],
            [
              "cartRevision/sourceHash/calculatedAt",
              "Saved calculation's Cart revision, SHA-256 source snapshot and time",
              "Traceability, not a distributed lock or price guarantee"
            ]
          ]
        },
        {
          "kind": "paragraph",
          "text": "calculateDirect loads current owned Cart/entries, compares a supplied expectedRevision numerically with the current Cart revision and enforces the configured entry bound (default 500). It saves a CURRENT calculation, normally calc-<cart>-<revision>, with a sourceHash of the owner result. The read limit and revision comparison are not a full cluster-wide snapshot lock: clients must use fresh owner responses and Checkout's subsequent revalidation. Do not treat a calculation identifier or hash as financial authorization."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Persisted write followed by response rejection",
          "anchor": "cart-write-response-boundary"
        },
        {
          "kind": "paragraph",
          "text": "addEntry saves the entry before responseWithValidationAndCalculation loads a snapshot, validates it and calculates. updateEntry and removeEntry similarly mutate their owned entry before building the response. An HTTP error from this response path therefore does not imply the entry write rolled back. This is especially important for stock-unavailable or owner-read failures: the shopper may still have a saved unavailable item, and a blind repeat can change the wrong intent. Read the owned Cart and returned entry identities before deciding whether to edit, remove, recalculate or retry."
        },
        {
          "kind": "diagram",
          "language": "mermaid",
          "text": "sequenceDiagram\n  participant UI as Buyer application\n  participant C as Cart owner\n  participant O as Product Inventory Digital Pricing owners\n  UI->>C: Add entry to owned Cart\n  C->>C: Persist entry intent\n  C->>O: Validate fresh snapshot\n  alt Blocking validation\n    C-->>UI: 409 stock conflict or 422 validation failure\n    UI->>C: Read owned Cart before retry\n    C-->>UI: Entry may already be present\n  else Validation allowed\n    C->>O: Calculate exact decisions\n    C-->>UI: Cart entries validation calculation\n  end"
        },
        {
          "kind": "table",
          "headers": [
            "Response condition",
            "Current rejection",
            "Buyer/operator response"
          ],
          "rows": [
            [
              "All blocking reasons are STOCK_UNAVAILABLE",
              "ERR_CART_INVENTORY_UNAVAILABLE, HTTP 409",
              "Show unavailable item, read Cart, choose supported correction"
            ],
            [
              "Mixed quantity/Product/stock reasons",
              "ERR_CART_VALIDATION_FAILED, HTTP 422",
              "Use structured validation reasons; do not label all failures as stock"
            ],
            [
              "Selected Product SKU mismatch",
              "ERR_CART_PRODUCT_UNAVAILABLE, HTTP 409",
              "Refresh approved Product choices without mutable fallback"
            ],
            [
              "Owner read throws",
              "Owner failure propagates",
              "Keep unconfirmed state; outage is not proof of zero stock"
            ],
            [
              "Calculation expectedRevision mismatch",
              "Cart revision conflict",
              "Read current Cart, recalculate and ask buyer to confirm changed intent"
            ],
            [
              "Failed response after mutation",
              "Persisted state may differ from assumed UI state",
              "Inspect before retry; no generic rollback claim"
            ]
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Checkout handoff and recovery",
          "anchor": "cart-checkout-handoff"
        },
        {
          "kind": "paragraph",
          "text": "The frontend retains the saved Cart reference and submits the selected payment method and stable placement command to Checkout's owned API. Checkout revalidates/recalculates, reserves physical and digital resources immediately before payment authorization, creates the Order, performs configured capture, commits discounts, confirms digital sale/delivery and records completion. See commerce.cart-order for the canonical orchestration; do not reimplement its checkpoints in Cart or assume a successful Cart calculation already completed them."
        },
        {
          "kind": "paragraph",
          "text": "When a placement fails, release/refund/reconcile through the original owners under the original command. An uncertain acquisition or provider response remains recovery-required even if known holds were released. A new Cart calculation must not erase original placement evidence or start a second financial command to hide uncertainty. Notification failure after committed placement is a separate Communication recovery path and must not roll back an otherwise committed Order. Physical returns and original-capture refunds require their reviewed owner contracts, not a negative Cart quantity."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Customer safety, operations and observability",
          "anchor": "cart-operations"
        },
        {
          "kind": "paragraph",
          "text": "Customer responses use Cart's explicit calculation redaction, preserving buyer-facing totals and validation while removing internal domain evidence that is not public. Store and Enterprise context must remain derived from the owned Cart and signed request boundary; internal service authorization is a capability handoff, never a customer-provided role. Profile membership and optional onboarding eligibility are separate policies, not conditions silently invented by Cart to enable purchases. Refer to Profile for current identity placement and authorization."
        },
        {
          "kind": "paragraph",
          "text": "Operators should correlate Cart code, original entry code, calculation code/revision, selected Store and owner failure category without collecting provider tokens, coupon plaintext or private issuance proofs. Diagnose wrong scope at Profile/Store, missing catalog identity at Product, physical supply at Inventory, digital pool binding at Promotion/DigitalCore and money at Pricing/Tax/Payment. Documentation visibility does not activate a capability or permit business imports. Repairs must retain exact saved identities; do not delete Carts, reset stock or rewrite import receipts to clear a response error."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Customization and extension",
          "anchor": "cart-customization"
        },
        {
          "kind": "paragraph",
          "text": "A partner customizes the concrete Cart module through a later-loaded backend module. Configuration in config/properties.js under cart.customerApi supplies initial channel/locale/currency defaults, while every Cart still receives an explicit application Store and retains its saved scope. A later-loaded module can override those defaults; changing configuration does not rebind existing saved Carts or grant another buyer's authority. Extend the appropriate exported service member or existing pipeline rather than copying Product, Promotion, Tax or Inventory logic. Existing create/replace and validation-after-write semantics must be documented for the consuming application; changing them requires a deliberate owner contract and regression."
        },
        {
          "kind": "paragraph",
          "text": "Later validation overrides can narrow allowed intent, but keep stock-only 409 versus mixed-validation 422 behavior and never begin monetary calculation after BLOCKED validation. Preserve Product pinning, non-reserving availability, exact decimal arithmetic, customer redaction and Checkout's separate commitment. Test a later service override through this/shared member dispatch, including failure propagation and unchanged foreign-owner scope. Customer presentation belongs in the frontend, but source authority and permitted actions remain backend-owned."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Source map and verification",
          "anchor": "cart-source-map"
        },
        {
          "kind": "table",
          "headers": [
            "Cart source",
            "Responsibility",
            "Focused evidence"
          ],
          "rows": [
            [
              "defaultCartOperationService.js",
              "Explicit Store, saved identity, mutation-before-response, calculation persistence",
              "cartCustomerApiContract.test.js"
            ],
            [
              "defaultCommerceCalculationPortsService.js",
              "Pinned owner scope and non-reserving availability/decision delegation",
              "cartActivatedPolicyPorts.test.js"
            ],
            [
              "defaultCartValidationService.js",
              "Blocking intent and owner availability validation",
              "Cart validation tests"
            ],
            [
              "defaultCartCalculationEngineService.js",
              "Exact owner decision order and empty/nonempty calculations",
              "Cart/Commerce calculation contract suites"
            ],
            [
              "src/router/routers.js and src/schemas/schemas.js",
              "Customer operations, permissions and persisted records",
              "Customer API and schema/route contracts"
            ]
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Common mistakes",
          "anchor": "cart-common-mistakes"
        },
        {
          "kind": "unordered-list",
          "items": [
            "Using a framework default Store, rehashing old Cart codes, or rebinding saved entries to another application Store.",
            "Treating an error response as evidence that entry persistence was rolled back.",
            "Reserving physical/coupon units during add-to-cart or claiming Cart availability is guaranteed stock.",
            "Classifying digital products from index payloads alone or accepting batch identifiers supplied by the caller.",
            "Calculating prices in browser floating-point arithmetic or using stale totals as a Payment instruction.",
            "Trying to repair an uncertain Checkout payment by creating a new placement key or altering Cart evidence."
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Verification",
          "anchor": "cart-verification"
        },
        {
          "kind": "paragraph",
          "text": "Validate canonical CMS identities, headings, typed owner references and release hashes before publication. Source QA should cover successful explicit Store creation, conflicting Store rejection, original entry identity, selected Product SKU mismatch, physical and digital non-reserving availability, stock-only/mixed failures, empty Cart exact totals, revision conflict and the persisted-write/error-response boundary. Check that every negative path leaves allocation and financial owners untouched. Do not infer installed transactional or provider acceptance from isolated service doubles."
        },
        {
          "kind": "code",
          "language": "bash",
          "text": "node --test nodics.commerce/modules/checkout/modules/cart/test/cartCustomerApiContract.test.js nodics.commerce/modules/checkout/modules/cart/test/cartActivatedPolicyPorts.test.js"
        },
        {
          "kind": "paragraph",
          "text": "Controlled runtime acceptance must separately prove signed customer scope, Product/Store publication, actual availability, fresh exact totals and Checkout owner receipts. Read the Cart after a deliberately rejected entry response and verify the expected persisted intent without raw model mutation. Record native, browser and provider qualification distinctly. This guide neither authorizes data reset nor claims automatic physical reversal or production CARD settlement; consult the canonical owner guides for those boundaries."
        }
      ],
      "searchText": "Cart Customer Intent and Calculation Persist buyer and Store intent, validate pinned Product identities, calculate exact owner decisions without reservations, and recover safely when an entry response fails after its write. # Cart Customer Intent and Calculation\n\n## Business context and reader paths\n\nA Cart records what a buyer intends to purchase in one Store. It is not an Order, a payment receipt or a guarantee of remaining supply. Buyers can inspect and change entries while Product, Pricing, Inventory, Promotion and Tax explain whether those entries can currently be purchased. Checkout later acquires actual resources and commits the transaction. This distinction prevents abandoned browsing from holding physical stock or finite coupon units, while still giving the business a traceable calculation rather than frontend arithmetic.\n\n| Audience | Question answered | Guide section |\n| --- | --- | --- |\n| Business evaluator | Why calculation is useful without promising stock | Availability versus commitment |\n| Business user and buyer-support staff | Why a saved entry can be unavailable or a total can change | Mutation response and recovery |\n| Beginner developer | Which identity and Store context the client must retain | Persisted context and entry identity |\n| Administrator/operator | Which owner rejection to repair without moving a Cart | Failure matrix and source map |\n| Framework maintainer/QA | Which source contracts and customization boundaries to prove | Calculation evidence and verification |\n| AI tool | Where to change Cart behavior without duplicating domain rules | Customization and references |\n\nCart owns Cart, CartEntry and CartCalculation persistence and the coordination of owner decisions. Product owns catalog/SKU identity; Store owns Store reference validation; Profile owns authentication and buyer/Enterprise context. Inventory owns physical stock and reservations. DigitalCore coordinates digital classification and delegates pool supply to Promotion. Pricing, Promotion and Tax own their monetary decisions. Axis and storefront applications consume these APIs; they must not reconstruct backend ownership or silently choose framework-wide application Stores.\n\n## Persisted buyer and Store context\n\nSupply an explicit application Store when creating a Cart. DefaultStoreContextService resolves request Store references and rejects conflicts; Cart has no universal defaultStoreCode. The stored Cart retains ownerId, tenant, enterpriseCode, storeCode, channelCode, locale, jurisdiction, currency, status and revision. Subsequent operations load the owned Cart and use its saved Store. A new request cannot move an existing Cart to another Store, nor can a body grant another customer's identity. Keep saved Cart references rather than recomputing an identity after a version change.\n\n| Identity or setting | Current source behavior | Integration consequence |\n| --- | --- | --- |\n| Default Cart code | cart_ plus a SHA-1-derived prefix of tenant, ownerId and explicit Store | Distinct buyer/Store scope; hashing is not authorization |\n| Explicit cartCode | Accepted as the Cart identity within normal owned operations | Retain returned reference and owner checks; do not guess another buyer's ID |\n| Saved Store | Validated on create/load; conflicting references reject | A wrong Store is not repaired by defaulting to the first active Store |\n| Channel/locale/jurisdiction/currency | Payload and effective customerApi defaults supply initial context | Deployments choose actual business values intentionally |\n| Legacy saved IDs | Read using original saved references | No automatic migration or recomputed lookup guarantee |\n| Repeated create | Existing create/replace semantics remain | Not a new transactional idempotency contract |\n| Signed customer context | Router/customer boundary and Profile authority remain active | A Cart hash or caller enterpriseCode does not confer access |\n\n```mermaid\nflowchart TD\n  Client[Signed buyer and explicit Store] --> Create[Cart create or read owned reference]\n  Create --> Stored[Persisted Cart context]\n  Request[Later entry or calculation request] --> Load[Load owned Cart]\n  Stored --> Load\n  Load --> Conflict{Caller Store conflicts?}\n  Conflict -->|Yes| Deny[Reject before cross-Store work]\n  Conflict -->|No| Owners[Delegate exact saved scope to capability owners]\n  Owners --> Evidence[Customer-safe validation and calculation]\n```\n\n## Entry identity and pinned Product selection\n\nAn entry retains productCode, resolved SKU, optional variantCode, quantity, owner, Cart and scope. The default entry code joins the original Cart, Product and SKU with pipe delimiters. Checkout and DigitalCore later retain this same original line identity; it is not an OrderEntry record code reconstructed after purchase. Preserve delimiters and returned identity in clients, logs that permit non-secret references, tests and extension code. A custom entryCode still must respect owner/Cart scope; a friendly label never replaces Product authority.\n\n```json\n{\n  \"storeCode\": \"selectedStore\",\n  \"locale\": \"en\",\n  \"currency\": \"USD\"\n}\n```\n\nAn entry request to the returned owned Cart can supply the following Product intent.\n\n```json\n{\n  \"productCode\": \"reviewedProduct\",\n  \"variantCode\": \"reviewedVariant\",\n  \"quantity\": \"2\"\n}\n```\n\nThe two objects show payload shape, not grants or a ready-to-run commercial fixture. For a Store selected for activated Product delivery, variant/SKU lookup uses Product's pinned resolver with the same tenant, enterprise, Store and locale. A supplied SKU must equal the selected variant's retained SKU; an explicit-SKU-only request must belong to a declared variant in the activated snapshot. Empty or ambiguous activation cannot fall back to mutable variants or independently query a CURRENT projection. Unselected Stores retain their existing legacy path; selection must not be fabricated to make lookup succeed.\n\nSearch is an index, not classification or ownership authority. Retained Product projections provide the actual SKU map and approved digital attributes. Missing foreign/duplicate retained evidence refuses before downstream pricing or allocation. ERR_CART_PRODUCT_UNAVAILABLE is the customer-facing conflict for a mismatched selected SKU. Correct the owning Product publication/discovery boundary; do not insert warehouse stock for a product whose approved digital classification failed.\n\n## Availability versus commitment\n\n| Operation | What it can do | What it cannot prove |\n| --- | --- | --- |\n| Add/update/remove entry | Persist intent and perform subsequent validation/calculation | Atomic rollback of the entry if response validation rejects |\n| Cart validation | Read availability, quantity and identity decisions | Reserve a physical balance or coupon |\n| Cart calculation | Save exact price/discount/tax/availability evidence | Hold stock, debit money, redeem a coupon or create an entitlement |\n| Physical availability | Inventory sourcing over eligible balances/activated warehouses | Guaranteed quantity at later checkout |\n| Digital availability | Pinned Product classification and Promotion pool read | Caller-specified batch authority or ownership of a token |\n| Checkout placement | Revalidate/recalculate and acquire via real owners | Use a stale Cart preview as an irrevocable promise |\n\nDefaultCommerceCalculationPortsService asks DigitalCore first when installed. A supported COUPON_CODE_POOL offer delegates exact Product/Store scope to Promotion without reserving a unit; a physical Product returns to Inventory. Malformed or unsupported digital evidence rejects and must not become physical stock by fallback. Physical sourcing reads current balances and eligible warehouse policy, returns PHYSICAL_STOCK with reservableAt CHECKOUT_BEFORE_PAYMENT and guaranteed false. A positive availability answer can change when another buyer purchases before this buyer reaches Checkout.\n\n```mermaid\nflowchart LR\n  Entry[Persisted Cart entry] --> Product[Pinned retained Product and SKU]\n  Product --> Kind{Supported digital offer?}\n  Kind -->|Yes| Digital[DigitalCore non-reserving classification]\n  Digital --> Pool[Promotion approved pool availability]\n  Kind -->|Physical| Inventory[Inventory physical availability]\n  Pool --> Validate[Cart validation and calculation]\n  Inventory --> Validate\n  Validate --> Preview[Saved exact calculation preview]\n  Preview --> Checkout[Separate Checkout acquisition before payment]\n```\n\n## Exact calculation evidence and owner order\n\nFor each entry, the calculation engine checks availability before invoking Pricing, accumulates exact totals using DefaultExactAmountService, and retains priceDecision and availability with the original entry identity. For a nonempty Cart it then requests Promotion against subtotal/Product/customer/coupon context and Tax against the discounted taxable amount. Its total is subtotal minus normalized discount plus tax. Empty Carts return normalized zero evidence with EMPTY_CART rather than invoking discount/tax commitments. None of those decisions consume budgets or allocate stock.\n\n| Calculation field | Meaning | Owner boundary |\n| --- | --- | --- |\n| entries[].code/productCode/variantCode/sku/quantity | Original intent and exact selected identity | Cart and Product |\n| entries[].priceDecision | Selected exact price and provenance | Pricing, including negotiated-price owner where selected |\n| entries[].availability | Physical candidates or digital supply evidence | Inventory or DigitalCore/Promotion; internal details redacted for customers |\n| subtotal/discountAmount/taxAmount/totalAmount | Exact decimal-string money in Cart currency | ExactAmount plus Pricing/Promotion/Tax decisions |\n| decisions.discount and decisions.tax | Why the monetary decision was made | Their owners remain authoritative |\n| cartRevision/sourceHash/calculatedAt | Saved calculation's Cart revision, SHA-256 source snapshot and time | Traceability, not a distributed lock or price guarantee |\n\ncalculateDirect loads current owned Cart/entries, compares a supplied expectedRevision numerically with the current Cart revision and enforces the configured entry bound (default 500). It saves a CURRENT calculation, normally calc-<cart>-<revision>, with a sourceHash of the owner result. The read limit and revision comparison are not a full cluster-wide snapshot lock: clients must use fresh owner responses and Checkout's subsequent revalidation. Do not treat a calculation identifier or hash as financial authorization.\n\n## Persisted write followed by response rejection\n\naddEntry saves the entry before responseWithValidationAndCalculation loads a snapshot, validates it and calculates. updateEntry and removeEntry similarly mutate their owned entry before building the response. An HTTP error from this response path therefore does not imply the entry write rolled back. This is especially important for stock-unavailable or owner-read failures: the shopper may still have a saved unavailable item, and a blind repeat can change the wrong intent. Read the owned Cart and returned entry identities before deciding whether to edit, remove, recalculate or retry.\n\n```mermaid\nsequenceDiagram\n  participant UI as Buyer application\n  participant C as Cart owner\n  participant O as Product Inventory Digital Pricing owners\n  UI->>C: Add entry to owned Cart\n  C->>C: Persist entry intent\n  C->>O: Validate fresh snapshot\n  alt Blocking validation\n    C-->>UI: 409 stock conflict or 422 validation failure\n    UI->>C: Read owned Cart before retry\n    C-->>UI: Entry may already be present\n  else Validation allowed\n    C->>O: Calculate exact decisions\n    C-->>UI: Cart entries validation calculation\n  end\n```\n\n| Response condition | Current rejection | Buyer/operator response |\n| --- | --- | --- |\n| All blocking reasons are STOCK_UNAVAILABLE | ERR_CART_INVENTORY_UNAVAILABLE, HTTP 409 | Show unavailable item, read Cart, choose supported correction |\n| Mixed quantity/Product/stock reasons | ERR_CART_VALIDATION_FAILED, HTTP 422 | Use structured validation reasons; do not label all failures as stock |\n| Selected Product SKU mismatch | ERR_CART_PRODUCT_UNAVAILABLE, HTTP 409 | Refresh approved Product choices without mutable fallback |\n| Owner read throws | Owner failure propagates | Keep unconfirmed state; outage is not proof of zero stock |\n| Calculation expectedRevision mismatch | Cart revision conflict | Read current Cart, recalculate and ask buyer to confirm changed intent |\n| Failed response after mutation | Persisted state may differ from assumed UI state | Inspect before retry; no generic rollback claim |\n\n## Checkout handoff and recovery\n\nThe frontend retains the saved Cart reference and submits the selected payment method and stable placement command to Checkout's owned API. Checkout revalidates/recalculates, reserves physical and digital resources immediately before payment authorization, creates the Order, performs configured capture, commits discounts, confirms digital sale/delivery and records completion. See commerce.cart-order for the canonical orchestration; do not reimplement its checkpoints in Cart or assume a successful Cart calculation already completed them.\n\nWhen a placement fails, release/refund/reconcile through the original owners under the original command. An uncertain acquisition or provider response remains recovery-required even if known holds were released. A new Cart calculation must not erase original placement evidence or start a second financial command to hide uncertainty. Notification failure after committed placement is a separate Communication recovery path and must not roll back an otherwise committed Order. Physical returns and original-capture refunds require their reviewed owner contracts, not a negative Cart quantity.\n\n## Customer safety, operations and observability\n\nCustomer responses use Cart's explicit calculation redaction, preserving buyer-facing totals and validation while removing internal domain evidence that is not public. Store and Enterprise context must remain derived from the owned Cart and signed request boundary; internal service authorization is a capability handoff, never a customer-provided role. Profile membership and optional onboarding eligibility are separate policies, not conditions silently invented by Cart to enable purchases. Refer to Profile for current identity placement and authorization.\n\nOperators should correlate Cart code, original entry code, calculation code/revision, selected Store and owner failure category without collecting provider tokens, coupon plaintext or private issuance proofs. Diagnose wrong scope at Profile/Store, missing catalog identity at Product, physical supply at Inventory, digital pool binding at Promotion/DigitalCore and money at Pricing/Tax/Payment. Documentation visibility does not activate a capability or permit business imports. Repairs must retain exact saved identities; do not delete Carts, reset stock or rewrite import receipts to clear a response error.\n\n## Customization and extension\n\nA partner customizes the concrete Cart module through a later-loaded backend module. Configuration in config/properties.js under cart.customerApi supplies initial channel/locale/currency defaults, while every Cart still receives an explicit application Store and retains its saved scope. A later-loaded module can override those defaults; changing configuration does not rebind existing saved Carts or grant another buyer's authority. Extend the appropriate exported service member or existing pipeline rather than copying Product, Promotion, Tax or Inventory logic. Existing create/replace and validation-after-write semantics must be documented for the consuming application; changing them requires a deliberate owner contract and regression.\n\nLater validation overrides can narrow allowed intent, but keep stock-only 409 versus mixed-validation 422 behavior and never begin monetary calculation after BLOCKED validation. Preserve Product pinning, non-reserving availability, exact decimal arithmetic, customer redaction and Checkout's separate commitment. Test a later service override through this/shared member dispatch, including failure propagation and unchanged foreign-owner scope. Customer presentation belongs in the frontend, but source authority and permitted actions remain backend-owned.\n\n## Source map and verification\n\n| Cart source | Responsibility | Focused evidence |\n| --- | --- | --- |\n| defaultCartOperationService.js | Explicit Store, saved identity, mutation-before-response, calculation persistence | cartCustomerApiContract.test.js |\n| defaultCommerceCalculationPortsService.js | Pinned owner scope and non-reserving availability/decision delegation | cartActivatedPolicyPorts.test.js |\n| defaultCartValidationService.js | Blocking intent and owner availability validation | Cart validation tests |\n| defaultCartCalculationEngineService.js | Exact owner decision order and empty/nonempty calculations | Cart/Commerce calculation contract suites |\n| src/router/routers.js and src/schemas/schemas.js | Customer operations, permissions and persisted records | Customer API and schema/route contracts |\n\n## Common mistakes\n\n- Using a framework default Store, rehashing old Cart codes, or rebinding saved entries to another application Store.\n- Treating an error response as evidence that entry persistence was rolled back.\n- Reserving physical/coupon units during add-to-cart or claiming Cart availability is guaranteed stock.\n- Classifying digital products from index payloads alone or accepting batch identifiers supplied by the caller.\n- Calculating prices in browser floating-point arithmetic or using stale totals as a Payment instruction.\n- Trying to repair an uncertain Checkout payment by creating a new placement key or altering Cart evidence.\n\n## Verification\n\nValidate canonical CMS identities, headings, typed owner references and release hashes before publication. Source QA should cover successful explicit Store creation, conflicting Store rejection, original entry identity, selected Product SKU mismatch, physical and digital non-reserving availability, stock-only/mixed failures, empty Cart exact totals, revision conflict and the persisted-write/error-response boundary. Check that every negative path leaves allocation and financial owners untouched. Do not infer installed transactional or provider acceptance from isolated service doubles.\n\n```bash\nnode --test nodics.commerce/modules/checkout/modules/cart/test/cartCustomerApiContract.test.js nodics.commerce/modules/checkout/modules/cart/test/cartActivatedPolicyPorts.test.js\n```\n\nControlled runtime acceptance must separately prove signed customer scope, Product/Store publication, actual availability, fresh exact totals and Checkout owner receipts. Read the Cart after a deliberately rejected entry response and verify the expected persisted intent without raw model mutation. Record native, browser and provider qualification distinctly. This guide neither authorizes data reset nor claims automatic physical reversal or production CARD settlement; consult the canonical owner guides for those boundaries.\n",
      "previous": null,
      "next": null,
      "source": {
        "repository": "nodics.ai",
        "functionalModule": "nodics.commerce",
        "technicalModule": "cart",
        "owner": "cart",
        "sourcePath": "data/docs-v001/records/documentation/cartDocumentationComponentData.js",
        "path": "data/docs-v001/records/documentation/cartDocumentationComponentData.js",
        "wordCount": 2410,
        "checksum": "dd09d09b4180b70d07ac5b5be4f7d188a2ebc22865ce3205a173b36f8ac75be5"
      },
      "slug": "cart-customer-intent-calculation",
      "locale": "en",
      "navigationGroup": "Commerce, Cart, and Checkout",
      "navigationGroupCode": "commerce-cart-and-checkout",
      "navigationGroupOrder": 10,
      "navigationOrder": 305,
      "references": [
        {
          "documentId": "inventory.stock-management",
          "owner": "inventory",
          "anchor": "inventory-opening-stock-packs"
        },
        {
          "documentId": "commerce.cart-order",
          "owner": "checkoutCore",
          "anchor": "commerceCartOrder-2-calculation-explained-for-beginners"
        },
        {
          "documentId": "commerce.payment-provider-boundaries",
          "owner": "paymentCore",
          "anchor": "commercePaymentProviderBoundaries-3-safe-payload-contract"
        },
        {
          "documentId": "security.identity-access-governance",
          "owner": "profile",
          "anchor": "securityIdentityAccessGovernance-25-personal-memberships-and-enterprise-context"
        },
        {
          "documentId": "promotion.campaigns-coupon-issuance",
          "owner": "promotion",
          "anchor": "promotion-policy-live-budget"
        },
        {
          "documentId": "digital.purchase-delivery-reveal",
          "owner": "digitalCore",
          "anchor": "digital-pinned-availability"
        }
      ]
    },
    "active": true
  }
};
