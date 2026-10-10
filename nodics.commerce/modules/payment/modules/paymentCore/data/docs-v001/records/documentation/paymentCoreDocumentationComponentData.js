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
    "code": "nodicsDocsComponentcommercePaymentFulfillment",
    "typeCode": "nodicsDocumentationArticleComponentType",
    "renderer": "documentation.component.article",
    "accessMode": "PUBLIC",
    "properties": {
      "code": "commerce.payment-fulfillment",
      "title": "Payment and fulfillment operations",
      "route": "/docs/framework/commerce-payment-fulfillment",
      "section": "payment-management",
      "sectionTitle": "Payment Management",
      "group": "payment-management",
      "groupTitle": "Payment Management",
      "parentId": "payment-management",
      "hierarchyPath": [
        "Payment Management",
        "Payment and fulfillment operations"
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
      "summary": "Provider-safe payment and fulfillment guide covering methods, adapters, callbacks, reconciliation, shipment, tracking, warehouse work, and returns.",
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
        "commerce.cart-order",
        "commerce.returns-refunds"
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
        "payment-management",
        "payment-and-fulfillment-boundary",
        "payment-and-fulfillment-operations",
        "local-sandbox-demo",
        "original-capture",
        "offline-conformance",
        "refund-recovery"
      ],
      "topicKeywords": [
        "Payment Management",
        "Payment and Fulfillment Boundary",
        "Payment and fulfillment operations"
      ],
      "headings": [
        {
          "text": "Business journey",
          "anchor": "commercePaymentFulfillment-1-business-journey",
          "level": 2
        },
        {
          "text": "Payment for beginners",
          "anchor": "commercePaymentFulfillment-2-payment-for-beginners",
          "level": 2
        },
        {
          "text": "Fulfillment for beginners",
          "anchor": "commercePaymentFulfillment-3-fulfillment-for-beginners",
          "level": 2
        },
        {
          "text": "Developer guidance",
          "anchor": "commercePaymentFulfillment-4-developer-guidance",
          "level": 2
        },
        {
          "text": "Operator and DevOps guidance",
          "anchor": "commercePaymentFulfillment-5-operator-and-devops-guidance",
          "level": 2
        },
        {
          "text": "Customization and extension guidance",
          "anchor": "commercePaymentFulfillment-6-customization-and-extension-guidance",
          "level": 2
        },
        {
          "text": "Common mistakes",
          "anchor": "commercePaymentFulfillment-7-common-mistakes",
          "level": 2
        },
        {
          "text": "Verification",
          "anchor": "commercePaymentFulfillment-8-verification",
          "level": 2
        },
        {
          "text": "Payment Transaction And Reconciliation Coverage",
          "anchor": "commercePaymentFulfillment-9-payment-transaction-and-reconciliation-coverage",
          "level": 2
        },
        {
          "text": "Offline sandbox versus real financial execution",
          "anchor": "commerce-payment-fulfillment-offline-versus-real",
          "level": 2
        },
        {
          "text": "Governed offline full-refund journey",
          "anchor": "commerce-payment-fulfillment-governed-refund-journey",
          "level": 2
        },
        {
          "text": "Pending, manual and recovery evidence",
          "anchor": "commerce-payment-fulfillment-recovery-evidence",
          "level": 2
        },
        {
          "text": "Validation and proof limits",
          "anchor": "commerce-payment-fulfillment-proof-limits",
          "level": 2
        }
      ],
      "blocks": [
        {
          "kind": "heading",
          "level": 2,
          "text": "Business journey",
          "anchor": "commercePaymentFulfillment-1-business-journey"
        },
        {
          "kind": "paragraph",
          "text": "Payment moves money; Fulfillment moves goods. Order connects their evidence but does not perform either operation. Payment separates methods, provider adapters, transactions, callbacks, and reconciliation. Fulfillment separates consignments, shipments, tracking, warehouse tasks, returns, receipts, inspections, and exceptions."
        },
        {
          "kind": "table",
          "headers": [
            "Concern",
            "Authority",
            "Safe evidence"
          ],
          "rows": [
            [
              "Authorization, capture, void, refund",
              "Payment",
              "transaction entry and provider reference"
            ],
            [
              "Card or wallet eligibility",
              "Payment Method",
              "method capability without raw secret"
            ],
            [
              "External execution",
              "Payment Provider",
              "redacted request/outcome evidence"
            ],
            [
              "Shipment and tracking",
              "Fulfillment",
              "consignment, shipment, tracking event"
            ],
            [
              "Warehouse work",
              "Fulfillment",
              "assigned task and completion evidence"
            ],
            [
              "Returned stock disposition",
              "Inventory",
              "disposition and movement after inspection"
            ]
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Payment for beginners",
          "anchor": "commercePaymentFulfillment-2-payment-for-beginners"
        },
        {
          "kind": "paragraph",
          "text": "For a purchase, the browser sends an opaque provider token, never raw card data. Checkout supplies trusted owner, Order, exact amount and currency to Payment. Guarded refund execution accepts no browser refund token or capture receipt: it derives the original capture and refundable authority from protected owner evidence and persisted Order approval. Payment persists provider outcomes; a sandbox status is not money movement."
        },
        {
          "kind": "paragraph",
          "text": "The included Stripe-shaped sandbox adapter is an offline conformance simulator. It accepts test tokens and returns deterministic references so tests can exercise success and replay. It is disabled by default, is not connected to Stripe, and is not live-qualified. PayPal, CyberSource, and Visa packages are declared but disabled until adapter conformance and external certification are complete."
        },
        {
          "kind": "paragraph",
          "text": "Callbacks require a service boundary, HMAC or provider-approved signature verification, a freshness window, constant-time comparison, and replay storage. Callback data never bypasses reconciliation. A valid signature proves origin integrity; Payment still validates tenant mapping, transaction identity, amount, currency, event ordering, and allowed transition."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Fulfillment for beginners",
          "anchor": "commercePaymentFulfillment-3-fulfillment-for-beginners"
        },
        {
          "kind": "paragraph",
          "text": "Fulfillment releases an Order into consignments. One order may produce partial shipments. Tracking events append evidence and cannot silently rewrite prior carrier history. Cancellation becomes an intent because a warehouse or carrier may already have acted."
        },
        {
          "kind": "paragraph",
          "text": "A return begins with eligible Order evidence, then Fulfillment manages RMA logistics, pickup or drop-off, receipt, and inspection. Inventory decides whether inspected goods are restocked, quarantined, repaired, or written off. Payment refunds only after the approved lifecycle evidence reaches the configured checkpoint."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Developer guidance",
          "anchor": "commercePaymentFulfillment-4-developer-guidance"
        },
        {
          "kind": "paragraph",
          "text": "Provider adapters implement one narrow contract. Do not leak SDK objects into Payment schemas. Normalize provider statuses into owned statuses while retaining the original provider code and redacted reference. Derive deterministic idempotency keys and keep provider secrets in deployment secret management."
        },
        {
          "kind": "paragraph",
          "text": "Carrier adapters follow the same boundary: normalized request, bounded timeout, redacted outcome, callback verification, retry, and reconciliation. New providers remain disabled until contract tests, sandbox tests, security review, operational runbook, and qualification evidence exist."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Operator and DevOps guidance",
          "anchor": "commercePaymentFulfillment-5-operator-and-devops-guidance"
        },
        {
          "kind": "paragraph",
          "text": "Operators inspect unknown payment outcomes, callback rejection, reconciliation drift, expiring authorizations, partial capture/refund totals, shipment exceptions, missing tracking, warehouse backlog, and return inspection queues. Axis renders evidence and owner actions; it never stores credentials or invents statuses."
        },
        {
          "kind": "paragraph",
          "text": "Production teams configure timeouts, retries, circuit breakers, rate limits, concurrency, dead-letter handling, and provider-specific capacity. Monitor success, decline, unknown, latency, duplicate suppression, callback age, shipment delay, and reconciliation lag. Exercise provider outage and carrier outage independently."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Customization and extension guidance",
          "anchor": "commercePaymentFulfillment-6-customization-and-extension-guidance"
        },
        {
          "kind": "paragraph",
          "text": "Projects can customize payment and fulfillment by adding payment providers, authorization rules, capture timing, fraud checks, shipping handoff, or settlement events. Document provider configuration, event flow, failure behavior, retry policy, business approval impact, and browser or API evidence for checkout. Customer-specific logic should live in project modules or adapters, not by changing the reusable commerce contract."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Common mistakes",
          "anchor": "commercePaymentFulfillment-7-common-mistakes"
        },
        {
          "kind": "unordered-list",
          "items": [
            "Storing raw card, wallet, or bank credentials.",
            "Calling a provider from Order or Axis.",
            "Treating an HTTP timeout as a final payment state.",
            "Accepting a callback without replay protection.",
            "Marking the offline simulator as live-qualified.",
            "Letting Payment decide returned-stock disposition.",
            "Assuming every order ships in one consignment."
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Verification",
          "anchor": "commercePaymentFulfillment-8-verification"
        },
        {
          "kind": "paragraph",
          "text": "Run method/provider conformance, sandbox authorize/capture/void/refund, idempotent replay, invalid-token, callback signature, expiry, replay, transition, partial shipment, return receipt, inspection, and exception tests. Verify secrets are absent from logs, schemas, docs, OpenAPI examples, and Axis. A live provider requires separate credentialed sandbox certification, webhook delivery, reconciliation, capacity, security, and owner sign-off; local tests do not substitute for that evidence."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Payment Transaction And Reconciliation Coverage",
          "anchor": "commercePaymentFulfillment-9-payment-transaction-and-reconciliation-coverage"
        },
        {
          "kind": "paragraph",
          "text": "Payment documentation must explicitly cover PaymentTransaction, PaymentTransactionEntry, PaymentInstrumentReference, and PaymentReconciliation. These records are the difference between a customer journey that merely calls a provider and an enterprise journey that can explain what money state is known, unknown, authorized, captured, voided, refunded, or waiting for reconciliation."
        },
        {
          "kind": "diagram",
          "language": "mermaid",
          "text": "flowchart LR\n  Checkout[\"Checkout payment request\"] --> Instrument[\"Payment instrument reference\"]\n  Instrument --> Transaction[\"Payment transaction\"]\n  Transaction --> Entry[\"Transaction entry\"]\n  Entry --> Provider[\"Provider adapter\"]\n  Provider --> Callback[\"Callback or polling result\"]\n  Callback --> Reconciliation[\"Payment reconciliation\"]\n  Reconciliation --> Order[\"Order or refund decision\"]"
        },
        {
          "kind": "table",
          "headers": [
            "Record",
            "Business meaning",
            "Required operator evidence"
          ],
          "rows": [
            [
              "PaymentInstrumentReference",
              "Tokenized reference to a payment method, never raw credentials.",
              "Token source, owner, expiry, and redaction."
            ],
            [
              "PaymentTransaction",
              "Parent commercial payment intent and state.",
              "Idempotency key, provider, amount, currency, tenant, and order reference."
            ],
            [
              "PaymentTransactionEntry",
              "Each authorize, capture, void, refund, or callback result.",
              "Provider reference, request hash, response state, and retry status."
            ],
            [
              "PaymentReconciliation",
              "Comparison between Nodics and provider state.",
              "Drift, corrective action, owner, timestamp, and final evidence."
            ]
          ]
        },
        {
          "kind": "paragraph",
          "text": "Developers customize provider behavior through payment provider adapters, not through checkout or Axis. Business users should see unknown outcomes and reconciliation work as operational tasks, because a timeout is not a decline and retrying money movement with a new key is unsafe."
        },
        {
          "kind": "heading",
          "text": "Offline sandbox versus real financial execution",
          "anchor": "commerce-payment-fulfillment-offline-versus-real",
          "level": 2
        },
        {
          "kind": "paragraph",
          "text": "LOCAL_SANDBOX_DEMO is an explicit server-selected capture mode of the included stripe-sandbox adapter. It supports an original-capture-bound demonstration without contacting Stripe, charging a card or sending a refund to a bank. All capture/refund results and recovery evidence are labeled sandbox: true and OFFLINE_CONFORMANCE. REFUND_SUCCEEDED means the deterministic offline reversal receipt was retained and confirmed; it never proves external financial settlement."
        },
        {
          "kind": "table",
          "headers": [
            "Path",
            "What is established",
            "What remains blocked"
          ],
          "rows": [
            [
              "Legacy sandbox capture",
              "Token-based offline authorize/capture conformance with unbound sim_ reference.",
              "Original-capture guarded refund; do not repair or promote historical evidence."
            ],
            [
              "Explicit new offline capture",
              "Protected ORIGINAL_CAPTURE_V1 entry bound to tenant/enterprise/owner/Order/CARD/amount/currency/original key.",
              "External money, production qualification and split/partial refunds."
            ],
            [
              "Guarded offline refund",
              "Order-approved full capture reversal, stable financial identity and retained ORIGINAL_CAPTURE_REFUND_V1 readback.",
              "Caller token authority and automatic completion of ambiguous work."
            ],
            [
              "Real CARD",
              "No original-capture-qualified financial adapter is connected here.",
              "Real refund execution and settlement pending separate provider implementation and qualification."
            ]
          ]
        },
        {
          "kind": "paragraph",
          "text": "A deterministic receipt digest checks consistency; it is not a signature, credential or independent authority. A caller cannot present one to claim capture. Payment re-reads the protected generated capture owner and Order revalidates signed scope, policy and the persisted approval. Neither a provider namespace, sandbox flag nor liveQualified assertion changes these boundaries."
        },
        {
          "kind": "heading",
          "text": "Governed offline full-refund journey",
          "anchor": "commerce-payment-fulfillment-governed-refund-journey",
          "level": 2
        },
        {
          "kind": "ordered-list",
          "items": [
            "Use an independent fresh purchase for the refund case. Native Checkout's owning capture port must select LOCAL_SANDBOX_DEMO from reviewed server policy; the normal customer purchase payload need not and must not invent that mode.",
            "Verify the retained PaymentTransactionEntry has CAPTURED status, CARD/stripe-sandbox evidence and the bound offline receipt. A historical unbound capture remains ineligible. Keep all private receipt details in authorized owner evidence.",
            "Use the existing signed customer dispute/request workflow and existing authorized staff preview/approval. Order's persisted plan pins the exact original capture. Request submission or preview alone is not refund execution.",
            "Payment preflight requires current Order authority, exact capture/order totals and currency, and no prior partial, ambiguous or checkout-compensation refund. Domain prepare/settle remains with its qualified owner; Payment supplies no physical stock reversal authority.",
            "After successful owner checkpoints, Payment independently revalidates the approval, generates the tokenless original-capture refund, verifies its response and reads back the retained transaction. Preserve sandbox and maturity labels in the Order result.",
            "Repeat the existing APPROVE/RECONCILE intent. Successful offline replay returns the same financial transaction; pending or failed replay retains the original outcome and recovery task without a second adapter dispatch."
          ]
        },
        {
          "kind": "paragraph",
          "text": "No new public Payment endpoint is introduced. The existing Order-owned POST /disputes/:code/refund-preview and POST /disputes/:code/refund router keys remain the workflow boundary; the execute route requires commerce.refund.execute plus current Profile/staff, enterprise, policy and persisted approval checks. Full runtime URL prefixes depend on deployment routing. This guide grants no permission and does not enable disabled refunds."
        },
        {
          "kind": "heading",
          "text": "Pending, manual and recovery evidence",
          "anchor": "commerce-payment-fulfillment-recovery-evidence",
          "level": 2
        },
        {
          "kind": "table",
          "headers": [
            "Evidence",
            "Meaning",
            "Safe next step"
          ],
          "rows": [
            [
              "REFUND_SUCCEEDED + OFFLINE_CONFORMANCE",
              "Retained offline receipt confirmed against the original capture.",
              "Report offline simulation only; replay original identity."
            ],
            [
              "REFUND_DELAYED",
              "Capture-pinned offline pending outcome, not financial settlement.",
              "Keep PENDING_PROVIDER_CONFIRMATION; replay does not manufacture confirmation."
            ],
            [
              "REFUND_FAILED",
              "Capture-pinned offline failure.",
              "Keep ACTION_REQUIRED and original identity; owner reviews evidence."
            ],
            [
              "REFUND_RECONCILIATION_REQUIRED",
              "Ambiguous scenario or unconfirmed/thrown adapter response.",
              "Keep manual recovery. Unconfirmed responses receive no invented provider receipt."
            ],
            [
              "Persistence/readback failure",
              "Financial or recovery evidence is not confirmed durable.",
              "Stop success reporting and recover using the same identity; never reset or create a new refund key."
            ],
            [
              "Missing/changed/foreign capture or prior refund",
              "Original or remaining refundable authority cannot be established.",
              "Refuse before dispatch and escalate to the owning workflow."
            ]
          ]
        },
        {
          "kind": "paragraph",
          "text": "Operators compare protected capture, refund intent, PaymentTransaction and PaymentReconciliation evidence, not browser tokens. The offline adapter has no polling or real settlement worker. It cannot turn a pending result into external confirmation. Missing stock/disposition authority is a distinct owner gap and is not cured by a Payment receipt."
        },
        {
          "kind": "heading",
          "text": "Validation and proof limits",
          "anchor": "commerce-payment-fulfillment-proof-limits",
          "level": 2
        },
        {
          "kind": "paragraph",
          "text": "PaymentCore tests use real execution/refund/Stripe-shaped services with isolated generated-owner and approval fixtures. Coverage includes missing, altered, foreign, historical and split captures; amount/currency and provider binding; caller overrides; prior refunds; replay/concurrency; delayed/failed/ambiguous outcomes; provider error envelopes and failed protected reads/readback. No network provider, native session or real funds is involved."
        },
        {
          "kind": "paragraph",
          "text": "Native acceptance, reviewed effective server policy, route exposure, customer-channel redaction and sandbox-label propagation must be demonstrated separately by the owning deployment. Production CARD additionally needs credentialed provider capture/account lookup, capture-bound refund, receipt/status reconciliation, verified callbacks, runtime-only secrets, operational/security/finance review and named owner approval. Source tests or CMS publication never replace those gates."
        }
      ],
      "searchText": "Payment and fulfillment operations Provider-safe payment and fulfillment guide covering methods, adapters, callbacks, reconciliation, shipment, tracking, warehouse work, and returns. # Payment and fulfillment operations\n\n## Business journey\n\nPayment moves money; Fulfillment moves goods. Order connects their evidence but does not perform either operation. Payment separates methods, provider adapters, transactions, callbacks, and reconciliation. Fulfillment separates consignments, shipments, tracking, warehouse tasks, returns, receipts, inspections, and exceptions.\n\n| Concern | Authority | Safe evidence |\n| --- | --- | --- |\n| Authorization, capture, void, refund | Payment | transaction entry and provider reference |\n| Card or wallet eligibility | Payment Method | method capability without raw secret |\n| External execution | Payment Provider | redacted request/outcome evidence |\n| Shipment and tracking | Fulfillment | consignment, shipment, tracking event |\n| Warehouse work | Fulfillment | assigned task and completion evidence |\n| Returned stock disposition | Inventory | disposition and movement after inspection |\n\n## Payment for beginners\n\nFor a purchase, the browser sends an opaque provider token, never raw card data. Checkout supplies trusted owner, Order, exact amount and currency to Payment. Guarded refund execution accepts no browser refund token or capture receipt: it derives the original capture and refundable authority from protected owner evidence and persisted Order approval. Payment persists provider outcomes; a sandbox status is not money movement.\n\nThe included Stripe-shaped sandbox adapter is an offline conformance simulator. It accepts test tokens and returns deterministic references so tests can exercise success and replay. It is disabled by default, is not connected to Stripe, and is not live-qualified. PayPal, CyberSource, and Visa packages are declared but disabled until adapter conformance and external certification are complete.\n\nCallbacks require a service boundary, HMAC or provider-approved signature verification, a freshness window, constant-time comparison, and replay storage. Callback data never bypasses reconciliation. A valid signature proves origin integrity; Payment still validates tenant mapping, transaction identity, amount, currency, event ordering, and allowed transition.\n\n## Fulfillment for beginners\n\nFulfillment releases an Order into consignments. One order may produce partial shipments. Tracking events append evidence and cannot silently rewrite prior carrier history. Cancellation becomes an intent because a warehouse or carrier may already have acted.\n\nA return begins with eligible Order evidence, then Fulfillment manages RMA logistics, pickup or drop-off, receipt, and inspection. Inventory decides whether inspected goods are restocked, quarantined, repaired, or written off. Payment refunds only after the approved lifecycle evidence reaches the configured checkpoint.\n\n## Developer guidance\n\nProvider adapters implement one narrow contract. Do not leak SDK objects into Payment schemas. Normalize provider statuses into owned statuses while retaining the original provider code and redacted reference. Derive deterministic idempotency keys and keep provider secrets in deployment secret management.\n\nCarrier adapters follow the same boundary: normalized request, bounded timeout, redacted outcome, callback verification, retry, and reconciliation. New providers remain disabled until contract tests, sandbox tests, security review, operational runbook, and qualification evidence exist.\n\n## Operator and DevOps guidance\n\nOperators inspect unknown payment outcomes, callback rejection, reconciliation drift, expiring authorizations, partial capture/refund totals, shipment exceptions, missing tracking, warehouse backlog, and return inspection queues. Axis renders evidence and owner actions; it never stores credentials or invents statuses.\n\nProduction teams configure timeouts, retries, circuit breakers, rate limits, concurrency, dead-letter handling, and provider-specific capacity. Monitor success, decline, unknown, latency, duplicate suppression, callback age, shipment delay, and reconciliation lag. Exercise provider outage and carrier outage independently.\n\n## Customization and extension guidance\n\nProjects can customize payment and fulfillment by adding payment providers, authorization rules, capture timing, fraud checks, shipping handoff, or settlement events. Document provider configuration, event flow, failure behavior, retry policy, business approval impact, and browser or API evidence for checkout. Customer-specific logic should live in project modules or adapters, not by changing the reusable commerce contract.\n\n## Common mistakes\n\n- Storing raw card, wallet, or bank credentials.\n- Calling a provider from Order or Axis.\n- Treating an HTTP timeout as a final payment state.\n- Accepting a callback without replay protection.\n- Marking the offline simulator as live-qualified.\n- Letting Payment decide returned-stock disposition.\n- Assuming every order ships in one consignment.\n\n## Verification\n\nRun method/provider conformance, sandbox authorize/capture/void/refund, idempotent replay, invalid-token, callback signature, expiry, replay, transition, partial shipment, return receipt, inspection, and exception tests. Verify secrets are absent from logs, schemas, docs, OpenAPI examples, and Axis. A live provider requires separate credentialed sandbox certification, webhook delivery, reconciliation, capacity, security, and owner sign-off; local tests do not substitute for that evidence.\n\n## Payment Transaction And Reconciliation Coverage\n\nPayment documentation must explicitly cover PaymentTransaction, PaymentTransactionEntry, PaymentInstrumentReference, and PaymentReconciliation. These records are the difference between a customer journey that merely calls a provider and an enterprise journey that can explain what money state is known, unknown, authorized, captured, voided, refunded, or waiting for reconciliation.\n\n```mermaid\nflowchart LR\n  Checkout[\"Checkout payment request\"] --> Instrument[\"Payment instrument reference\"]\n  Instrument --> Transaction[\"Payment transaction\"]\n  Transaction --> Entry[\"Transaction entry\"]\n  Entry --> Provider[\"Provider adapter\"]\n  Provider --> Callback[\"Callback or polling result\"]\n  Callback --> Reconciliation[\"Payment reconciliation\"]\n  Reconciliation --> Order[\"Order or refund decision\"]\n```\n\n| Record | Business meaning | Required operator evidence |\n| --- | --- | --- |\n| PaymentInstrumentReference | Tokenized reference to a payment method, never raw credentials. | Token source, owner, expiry, and redaction. |\n| PaymentTransaction | Parent commercial payment intent and state. | Idempotency key, provider, amount, currency, tenant, and order reference. |\n| PaymentTransactionEntry | Each authorize, capture, void, refund, or callback result. | Provider reference, request hash, response state, and retry status. |\n| PaymentReconciliation | Comparison between Nodics and provider state. | Drift, corrective action, owner, timestamp, and final evidence. |\n\nDevelopers customize provider behavior through payment provider adapters, not through checkout or Axis. Business users should see unknown outcomes and reconciliation work as operational tasks, because a timeout is not a decline and retrying money movement with a new key is unsafe.\n\n## Offline sandbox versus real financial execution\n\nLOCAL_SANDBOX_DEMO is an explicit server-selected capture mode of the included stripe-sandbox adapter. It supports an original-capture-bound demonstration without contacting Stripe, charging a card or sending a refund to a bank. All capture/refund results and recovery evidence are labeled sandbox: true and OFFLINE_CONFORMANCE. REFUND_SUCCEEDED means the deterministic offline reversal receipt was retained and confirmed; it never proves external financial settlement.\n\n| Path | What is established | What remains blocked |\n| --- | --- | --- |\n| Legacy sandbox capture | Token-based offline authorize/capture conformance with unbound sim_ reference. | Original-capture guarded refund; do not repair or promote historical evidence. |\n| Explicit new offline capture | Protected ORIGINAL_CAPTURE_V1 entry bound to tenant/enterprise/owner/Order/CARD/amount/currency/original key. | External money, production qualification and split/partial refunds. |\n| Guarded offline refund | Order-approved full capture reversal, stable financial identity and retained ORIGINAL_CAPTURE_REFUND_V1 readback. | Caller token authority and automatic completion of ambiguous work. |\n| Real CARD | No original-capture-qualified financial adapter is connected here. | Real refund execution and settlement pending separate provider implementation and qualification. |\n\nA deterministic receipt digest checks consistency; it is not a signature, credential or independent authority. A caller cannot present one to claim capture. Payment re-reads the protected generated capture owner and Order revalidates signed scope, policy and the persisted approval. Neither a provider namespace, sandbox flag nor liveQualified assertion changes these boundaries.\n\n## Governed offline full-refund journey\n\n1. Use an independent fresh purchase for the refund case. Native Checkout's owning capture port must select LOCAL_SANDBOX_DEMO from reviewed server policy; the normal customer purchase payload need not and must not invent that mode.\n2. Verify the retained PaymentTransactionEntry has CAPTURED status, CARD/stripe-sandbox evidence and the bound offline receipt. A historical unbound capture remains ineligible. Keep all private receipt details in authorized owner evidence.\n3. Use the existing signed customer dispute/request workflow and existing authorized staff preview/approval. Order's persisted plan pins the exact original capture. Request submission or preview alone is not refund execution.\n4. Payment preflight requires current Order authority, exact capture/order totals and currency, and no prior partial, ambiguous or checkout-compensation refund. Domain prepare/settle remains with its qualified owner; Payment supplies no physical stock reversal authority.\n5. After successful owner checkpoints, Payment independently revalidates the approval, generates the tokenless original-capture refund, verifies its response and reads back the retained transaction. Preserve sandbox and maturity labels in the Order result.\n6. Repeat the existing APPROVE/RECONCILE intent. Successful offline replay returns the same financial transaction; pending or failed replay retains the original outcome and recovery task without a second adapter dispatch.\n\nNo new public Payment endpoint is introduced. The existing Order-owned POST /disputes/:code/refund-preview and POST /disputes/:code/refund router keys remain the workflow boundary; the execute route requires commerce.refund.execute plus current Profile/staff, enterprise, policy and persisted approval checks. Full runtime URL prefixes depend on deployment routing. This guide grants no permission and does not enable disabled refunds.\n\n## Pending, manual and recovery evidence\n\n| Evidence | Meaning | Safe next step |\n| --- | --- | --- |\n| REFUND_SUCCEEDED + OFFLINE_CONFORMANCE | Retained offline receipt confirmed against the original capture. | Report offline simulation only; replay original identity. |\n| REFUND_DELAYED | Capture-pinned offline pending outcome, not financial settlement. | Keep PENDING_PROVIDER_CONFIRMATION; replay does not manufacture confirmation. |\n| REFUND_FAILED | Capture-pinned offline failure. | Keep ACTION_REQUIRED and original identity; owner reviews evidence. |\n| REFUND_RECONCILIATION_REQUIRED | Ambiguous scenario or unconfirmed/thrown adapter response. | Keep manual recovery. Unconfirmed responses receive no invented provider receipt. |\n| Persistence/readback failure | Financial or recovery evidence is not confirmed durable. | Stop success reporting and recover using the same identity; never reset or create a new refund key. |\n| Missing/changed/foreign capture or prior refund | Original or remaining refundable authority cannot be established. | Refuse before dispatch and escalate to the owning workflow. |\n\nOperators compare protected capture, refund intent, PaymentTransaction and PaymentReconciliation evidence, not browser tokens. The offline adapter has no polling or real settlement worker. It cannot turn a pending result into external confirmation. Missing stock/disposition authority is a distinct owner gap and is not cured by a Payment receipt.\n\n## Validation and proof limits\n\nPaymentCore tests use real execution/refund/Stripe-shaped services with isolated generated-owner and approval fixtures. Coverage includes missing, altered, foreign, historical and split captures; amount/currency and provider binding; caller overrides; prior refunds; replay/concurrency; delayed/failed/ambiguous outcomes; provider error envelopes and failed protected reads/readback. No network provider, native session or real funds is involved.\n\nNative acceptance, reviewed effective server policy, route exposure, customer-channel redaction and sandbox-label propagation must be demonstrated separately by the owning deployment. Production CARD additionally needs credentialed provider capture/account lookup, capture-bound refund, receipt/status reconciliation, verified callbacks, runtime-only secrets, operational/security/finance review and named owner approval. Source tests or CMS publication never replace those gates.\n",
      "previous": {
        "title": "Cart, checkout, and order placement",
        "route": "/docs/framework/commerce-cart-order"
      },
      "next": {
        "title": "Shipping and Fulfillment Management",
        "route": "/docs/framework/fulfillment-shipping-management"
      },
      "source": {
        "repository": "nodics.ai",
        "functionalModule": "nodics.commerce",
        "technicalModule": "paymentCore",
        "owner": "paymentCore",
        "sourcePath": "data/docs-v001/records/documentation/paymentCoreDocumentationComponentData.js",
        "path": "data/docs-v001/records/documentation/paymentCoreDocumentationComponentData.js",
        "wordCount": 1641,
        "checksum": "de775a97f182b8aedb6a92554a801ab1b67cdc84e18ef73ea2cabfb3ee41d139"
      },
      "slug": "commerce-payment-fulfillment",
      "locale": "en",
      "navigationGroup": "Payment and Fulfillment Boundary",
      "navigationGroupCode": "payment-and-fulfillment-boundary",
      "navigationGroupOrder": 10,
      "navigationOrder": 10,
      "references": [
        {
          "documentId": "commerce.cart-order",
          "owner": "checkoutCore"
        },
        {
          "documentId": "commerce.returns-refunds",
          "owner": "order"
        }
      ]
    },
    "active": true
  },
  "record1": {
    "code": "nodicsDocsComponentcommercePaymentProviderBoundaries",
    "typeCode": "nodicsDocumentationArticleComponentType",
    "renderer": "documentation.component.article",
    "accessMode": "PUBLIC",
    "properties": {
      "code": "commerce.payment-provider-boundaries",
      "title": "Payment Core and Provider Boundaries",
      "route": "/docs/framework/commerce-payment-provider-boundaries",
      "section": "payment-management",
      "sectionTitle": "Payment Management",
      "group": "payment-management",
      "groupTitle": "Payment Management",
      "parentId": "payment-management",
      "hierarchyPath": [
        "Payment Management",
        "Payment Core and Provider Boundaries"
      ],
      "hierarchyDepth": 2,
      "documentType": "contract",
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
      "summary": "How Payment Core, payment methods, gateway providers, safe payloads, reconciliation, refunds, and provider extension boundaries work.",
      "visibility": "public",
      "accessMode": "PUBLIC",
      "publiclyAvailable": true,
      "requiresAuthentication": false,
      "allowedRoles": [],
      "allowedGroups": [],
      "allowedPermissions": [],
      "lifecycleState": "ONLINE",
      "version": "0.16.7",
      "maturityState": "operational",
      "implementationState": "current",
      "renderingComponent": "documentation.component.article",
      "relatedPages": [
        "commerce.payment-fulfillment",
        "commerce.cart-order",
        "commerce.returns-refunds"
      ],
      "sourceEvidence": [
        "../../../../../nodics.docs/data/manifest.json",
        "../../../../../nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js",
        "../../package.json",
        "package.json",
        "../paymentMethods/package.json",
        "../paymentProviders/package.json",
        "../paymentProviders/modules/stripeProvider/package.json",
        "src/schemas",
        "src/service"
      ],
      "visualRequirements": [
        "diagram",
        "table",
        "code-example",
        "troubleshooting-matrix"
      ],
      "searchKeywords": [
        "payment",
        "provider",
        "method",
        "reconciliation",
        "refund",
        "local-sandbox-demo",
        "original-capture",
        "offline-conformance",
        "refund-recovery"
      ],
      "topicKeywords": [
        "Payment Management",
        "Payment Operations",
        "Payment Core and Provider Boundaries"
      ],
      "headings": [
        {
          "text": "Source map",
          "anchor": "commercePaymentProviderBoundaries-1-source-map",
          "level": 2
        },
        {
          "text": "Boundary model",
          "anchor": "commercePaymentProviderBoundaries-2-boundary-model",
          "level": 2
        },
        {
          "text": "Safe payload contract",
          "anchor": "commercePaymentProviderBoundaries-3-safe-payload-contract",
          "level": 2
        },
        {
          "text": "Customization and extension guidance",
          "anchor": "commercePaymentProviderBoundaries-4-customization-and-extension-guidance",
          "level": 2
        },
        {
          "text": "Implementation handoff",
          "anchor": "commercePaymentProviderBoundaries-5-implementation-handoff",
          "level": 2
        },
        {
          "text": "Evidence checklist",
          "anchor": "commercePaymentProviderBoundaries-6-evidence-checklist",
          "level": 2
        },
        {
          "text": "Common mistakes",
          "anchor": "commercePaymentProviderBoundaries-7-common-mistakes",
          "level": 2
        },
        {
          "text": "Verification",
          "anchor": "commercePaymentProviderBoundaries-8-verification",
          "level": 2
        },
        {
          "text": "Explicit original-capture contract",
          "anchor": "commerce-payment-provider-boundaries-original-capture-contract",
          "level": 2
        },
        {
          "text": "Guarded owner sequence and authority",
          "anchor": "commerce-payment-provider-boundaries-guarded-owner-sequence",
          "level": 2
        },
        {
          "text": "Native capture integration handoff",
          "anchor": "commerce-payment-provider-boundaries-native-capture-handoff",
          "level": 2
        },
        {
          "text": "Replay, ambiguity and durable evidence",
          "anchor": "commerce-payment-provider-boundaries-replay-and-ambiguity",
          "level": 2
        },
        {
          "text": "Real provider gates and verification",
          "anchor": "commerce-payment-provider-boundaries-real-provider-gates",
          "level": 2
        }
      ],
      "blocks": [
        {
          "kind": "paragraph",
          "text": "Payment Core owns provider-neutral execution/idempotency and transaction/refund evidence. Method modules validate a chosen instrument/policy; provider adapters execute their explicitly implemented operations. Card, wallet, bank transfer and cash-on-delivery method names are not gateway integrations. A module/package name, readiness declaration or sandbox receipt does not establish external-provider support or live acceptance. For beginners, identify the payment method and its selected adapter separately, then read the implementation-status table before choosing a test. Use an approved offline fixture to understand transaction and refund evidence; do not connect real funds or retry an uncertain payment based on a simulated success. Follow the reconciliation section for the recorded outcome."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Source map",
          "anchor": "commercePaymentProviderBoundaries-1-source-map"
        },
        {
          "kind": "table",
          "headers": [
            "Owner / operation",
            "Framework source"
          ],
          "rows": [
            [
              "Core execution",
              "`nodics.commerce/modules/payment/modules/paymentCore/src/service/defaultPaymentExecutionService.js`: execute, transactionModel, normalizeOutcome."
            ],
            [
              "Refund and reconciliation evidence",
              "`nodics.commerce/modules/payment/modules/paymentCore/src/service/defaultPaymentRefundExecutionService.js`: refundOrder, executeRefund, reconciliationModel, recordReconciliation."
            ],
            [
              "Readiness / public field declaration",
              "`nodics.commerce/modules/payment/modules/paymentCore/src/service/defaultPaymentIntegrationReadinessService.js`: contract, validateAdapter."
            ],
            [
              "Card method",
              "`nodics.commerce/modules/payment/modules/paymentMethods/modules/cardPayment/src/service/defaultCardPaymentMethodService.js`: prepare."
            ],
            [
              "Offline Stripe simulator",
              "`nodics.commerce/modules/payment/modules/paymentProviders/modules/stripeProvider/src/service/defaultStripeSandboxAdapterService.js`."
            ],
            [
              "Provider namespace placeholders",
              "`nodics.commerce/modules/payment/modules/paymentProviders/modules/visaProvider/package.json`, `paypalProvider/package.json`, `cyberSourceProvider/package.json` under that same provider-modules directory; no gateway implementation is established by these packages."
            ],
            [
              "Loyalty provider",
              "`nodics.commerce/modules/payment/modules/paymentProviders/modules/loyaltyRewardProvider/src/service/defaultLoyaltyRewardPaymentProviderService.js`; internal wallet operations, not a card-network certification."
            ]
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Boundary model",
          "anchor": "commercePaymentProviderBoundaries-2-boundary-model"
        },
        {
          "kind": "diagram",
          "language": "mermaid",
          "text": "flowchart LR\n  Checkout[\"Checkout owner request\"] --> Method[\"Method eligibility / opaque token\"]\n  Method --> Core[\"Payment Core idempotent execution\"]\n  Core --> Adapter[\"Selected implemented adapter\"]\n  Adapter --> Offline[\"Offline simulation or internal wallet\"]\n  Adapter -.-> External[\"External gateway only after separate implementation/qualification\"]\n  Core --> Transaction[\"Stored transaction / refund evidence\"]\n  Transaction --> Reconcile[\"Pending/failed reconciliation work, not automatic settlement\"]"
        },
        {
          "kind": "paragraph",
          "text": "The business problem is secure payment confidence. Business users need to know which payment methods are available and whether money movement is complete. Developers need provider contracts that avoid leaking gateway details into checkout. Operators need reconciliation, retry, and failure evidence for production."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Safe payload contract",
          "anchor": "commercePaymentProviderBoundaries-3-safe-payload-contract"
        },
        {
          "kind": "paragraph",
          "text": "The current readiness contract declares customerSafety.exposeOnly as status, method, amount, currency and reconciliationRequired. The example below matches that allow-list, but is an intended safe projection, not a claim that the readiness service constructs or enforces every HTTP response. Core transaction evidence retains provider code/reference and adapter-reported status. transactionModel does not generate a request hash or constrain provider-status length; this internal evidence must not be copied wholesale to a browser."
        },
        {
          "kind": "code",
          "language": "js",
          "text": "// Customer-safe projection shape declared by the readiness contract.\nconst paymentResult = {\n  status: 'AUTHORIZED', method: 'CARD', amount: '129.00',\n  currency: 'USD', reconciliationRequired: false\n};\n// No providerReference, providerToken, raw gateway response, credentials, PAN or CVV.\n// Channel projection/redaction must be verified separately."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Customization and extension guidance",
          "anchor": "commercePaymentProviderBoundaries-4-customization-and-extension-guidance"
        },
        {
          "kind": "paragraph",
          "text": "Card prepare requires trusted tenant and an opaque providerToken starting tok_; it returns an internal method descriptor, not a public payload or gateway call. Stripe's default adapter is an offline simulator using sim_/tok_test_ inputs for AUTHORIZE, CAPTURE, VOID and REFUND, including declined/cancelled/pending/failed outcomes. It never contacts Stripe. Visa, PayPal and CyberSource package namespaces do not supply working network adapters in this inspected provider inventory. Loyalty Reward is an implemented internal wallet provider, not an external gateway. Module declarations and offline receipts do not certify any of these providers for production."
        },
        {
          "kind": "paragraph",
          "text": "A real adapter must separately implement supported operations, runtime-only secrets, signed/replay-protected callbacks, idempotency and redacted evidence. validateAdapter checks declaration fields including refund support and liveEvidenceReference/certifiedAt/certifiedBy/productionTrafficApproved; satisfying those fields is not independently verified certification. Reconciliation jobs and provider settlement workers are extension/integration work, not behavior created by this declaration."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Implementation handoff",
          "anchor": "commercePaymentProviderBoundaries-5-implementation-handoff"
        },
        {
          "kind": "paragraph",
          "text": "execute requires tenant, a supported AUTHORIZE/CAPTURE/VOID/REFUND operation and idempotencyKey. Its in-flight guard is tenant:key. Legacy operations replay existing repository evidence; explicit LOCAL_SANDBOX_DEMO captures additionally validate the complete original capture binding and reject changed scope, amount, currency, outcome or mode downgrade. Keep the same key for the same intent and distinct keys for distinct operations. The process-local guard and sequential repository find -> adapter -> record do not prove cross-worker exactly-once movement or atomic provider/database commit."
        },
        {
          "kind": "paragraph",
          "text": "normalizeOutcome maps REFUNDED to REFUND_SUCCEEDED, REFUND_PENDING to REFUND_DELAYED and RECONCILIATION_REQUIRED to REFUND_RECONCILIATION_REQUIRED; REFUND_FAILED stays failed. Legacy generic execution can pass through unknown statuses, but guarded refund persistence refuses to treat unknown or unconfirmed outcomes as success. reconciliationModel uses refund-reconciliation:<stable financial key>, ACTION_REQUIRED for failed refunds and PENDING_PROVIDER_CONFIRMATION otherwise. recordReconciliation requires the generated owner, checks its save result and reads back the exact recovery evidence; missing persistence throws, never returns a fabricated durable task."
        },
        {
          "kind": "paragraph",
          "text": "refundOrder supports one full original capture: either an internal Loyalty wallet capture with the original ledger reference, or an explicitly bound LOCAL_SANDBOX_DEMO CARD capture. It revalidates signed Order paymentAuthority, the pinned original capture and remaining authority, then derives order-full-refund:<SHA-256 of tenant, enterprise, Order and canonical refund identity>. APPROVE versus RECONCILE cannot select another financial key. Real CARD, historical unbound simulator captures, partial and split captures remain unavailable. There is no live settlement/polling worker or universal reconciliation-completion API; pending work cannot be marked settled by changing an action name or using a fresh key."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Evidence checklist",
          "anchor": "commercePaymentProviderBoundaries-6-evidence-checklist"
        },
        {
          "kind": "paragraph",
          "text": "Payment evidence should include order reference, payment intent, method, provider, amount, currency, lifecycle state, safe external reference, correlation id, and reconciliation result. Sensitive values must remain outside logs, release data, and browser payloads. Operators should be able to decide whether to retry, cancel, refund, or escalate without reading raw gateway responses in the main business UI."
        },
        {
          "kind": "paragraph",
          "text": "Production readiness also needs negative-path evidence. A declined card, provider timeout, duplicate callback, partial capture, and failed refund should all return controlled states that the business can understand and developers can trace."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Common mistakes",
          "anchor": "commercePaymentProviderBoundaries-7-common-mistakes"
        },
        {
          "kind": "unordered-list",
          "items": [
            "Letting provider-specific payloads leak into checkout responses.",
            "Treating a payment method as a gateway provider.",
            "Storing credentials in release data.",
            "Completing fulfillment before payment state allows it.",
            "Hiding failed reconciliation from operators."
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Verification",
          "anchor": "commercePaymentProviderBoundaries-8-verification"
        },
        {
          "kind": "paragraph",
          "text": "Run Payment method/provider contracts and the original-capture sandbox and refusal regressions. Native acceptance requires a fresh server-qualified capture, signed existing customer/staff workflows and original approval evidence, followed by repeated APPROVE/RECONCILE and protected transaction/recovery inspection. Missing policy or permissions must remain refused, not granted by a test. Separate production qualification requires credentialed provider-owned original capture/refund lookup, callback replay, security review and owner sign-off; offline receipts and guide publication are not that proof."
        },
        {
          "kind": "heading",
          "text": "Explicit original-capture contract",
          "anchor": "commerce-payment-provider-boundaries-original-capture-contract",
          "level": 2
        },
        {
          "kind": "paragraph",
          "text": "The StripeProvider owner exports captureBinding, captureOriginal and validateCaptureRecord for explicit new offline captures. DefaultPaymentExecutionService.execute forwards trusted enterprise/owner/Order/CARD/amount/currency/original idempotency and authorization reference, retains ORIGINAL_CAPTURE_V1 in PaymentTransactionEntry.evidence and requires matching repository readback. The capture test token is never retained. Legacy execute without the new mode remains legacy conformance; its receipts cannot qualify this refund path."
        },
        {
          "kind": "code",
          "language": "js",
          "text": "// Owning server capture port; these are trusted checkout/order values, not browser overrides.\nconst captureRequest = {\n  tenant, enterpriseCode, authData, ownerId, orderCode,\n  operation: 'CAPTURE', methodCode: 'CARD',\n  amount: originalAmount, currency: originalCurrency,\n  idempotencyKey: originalCaptureKey, providerReference: authorizationReference,\n  providerToken: purchaseTestToken, sandboxMode: 'LOCAL_SANDBOX_DEMO'\n};\n// Existing Payment execution + generated PaymentTransactionEntry repository.\n// No refund token, separate ledger, runtime grant or network provider call."
        },
        {
          "kind": "paragraph",
          "text": "sandboxRefundOutcome is optional server/test-only input pinned into the original receipt: REFUNDED is the default; REFUND_PENDING, REFUND_FAILED and RECONCILIATION_REQUIRED select deterministic recovery fixtures. It is not a refund payload field or a financial settlement toggle. Replays must preserve it along with scope/amount/currency and mode. An unset, malformed or changed retained capture does not become refundable through a caller-supplied receipt."
        },
        {
          "kind": "heading",
          "text": "Guarded owner sequence and authority",
          "anchor": "commerce-payment-provider-boundaries-guarded-owner-sequence",
          "level": 2
        },
        {
          "kind": "table",
          "headers": [
            "Owner member",
            "Required evidence",
            "Result boundary"
          ],
          "rows": [
            [
              "PaymentRefundExecution.orderCapture",
              "Fresh signed Order scope; exactly one scoped successful entry.",
              "Validated offline receipt or internal wallet capture; historical/real CARD refused."
            ],
            [
              "PaymentRefundExecution.preflightOrder",
              "Persisted Order approval/plan pin, remaining refundable authority.",
              "Eligible original capture/amount/currency plus offline labels; no provider dispatch."
            ],
            [
              "Stripe.confirmOriginalCapture",
              "Protected generated entry lookup by original code.",
              "Exact stored binding revalidated; digest alone is never authority."
            ],
            [
              "Stripe.refundOriginal",
              "Fresh guarded Order authority and identical full financial intent.",
              "Tokenless deterministic offline receipt linked to original capture/key."
            ],
            [
              "Stripe.verifyRefundResponse",
              "Full receipt, status, reference, scope and OFFLINE_CONFORMANCE.",
              "Reject error envelopes, unknown non-success codes and mismatched/missing receipt."
            ],
            [
              "Stripe.confirmRefund",
              "Generated transaction readback and fresh original capture confirmation.",
              "Retained exact receipt/status or explicit unconfirmed manual recovery."
            ],
            [
              "PaymentRefundExecution.recordReconciliation",
              "Original financial intent and confirmed generated persistence.",
              "One stable recovery record; missing owner/readback fails closed."
            ]
          ]
        },
        {
          "kind": "paragraph",
          "text": "The immutable approval pin contains captureCode, exact amount/currency, provider/method, original reference and the complete bound offline receipt. The financial key hashes tenant, enterprise, Order and canonical refund identity; action names never change it. Retained intent also binds approvalCommandKey and original capture idempotency. Caller-selected provider tokens, provider/reference, wallet/ledger/capture identities, receipts, mode or refund key are rejected at root and payload. Caller amount/currency cannot override original authority."
        },
        {
          "kind": "paragraph",
          "text": "Before dispatch, both generated PaymentTransaction and PaymentTransactionEntry refund evidence are bounded and checked. A read error, malformed response, errors array, non-SUC explicit code or negative acknowledgment is not an empty ledger. Prior partial, ambiguous, legacy or checkout-compensation refunds block a new full refund for owner reconciliation. A completed Order with no retained original refund cannot fabricate financial completion."
        },
        {
          "kind": "heading",
          "text": "Native capture integration handoff",
          "anchor": "commerce-payment-provider-boundaries-native-capture-handoff",
          "level": 2
        },
        {
          "kind": "paragraph",
          "text": "Checkout's capturePayment owns selection of LOCAL_SANDBOX_DEMO. Derive it only from reviewed effective server policy selecting the enabled stripe-sandbox offline provider for CARD with sandboxOnly true, liveQualified false, OFFLINE_CONFORMANCE and the operational COMMERCE role. Do not forward a browser sandboxMode. The existing capture request already has trusted owner, persisted Order, amount/currency, authorization reference and original idempotency. Supply enterprise explicitly or use its existing signed authData.entCode/enterpriseCode."
        },
        {
          "kind": "paragraph",
          "text": "Payment adds no configuration enablement. Purchase authorization stays the existing offline token behavior. A fresh capture opts into binding; historical entries are not rewritten. Order must propagate sandbox: true, sandboxMode: LOCAL_SANDBOX_DEMO and maturity: OFFLINE_CONFORMANCE from preflight/payment results through its checkpoint and channel-safe response. Private capture/refund receipts and full approval intent must not be exposed wholesale to customers."
        },
        {
          "kind": "paragraph",
          "text": "Legacy checkout compensation REFUND is refused for a new sim_capture_ bound reference. A qualified owning compensation bridge or explicit manual recovery is required; do not create a refund token or pretend an uncompleted checkout has Order approval. This Payment batch does not implement cross-owner stock, digital or compensation bridges. Parent integration must validate these dependencies before native acceptance."
        },
        {
          "kind": "heading",
          "text": "Replay, ambiguity and durable evidence",
          "anchor": "commerce-payment-provider-boundaries-replay-and-ambiguity",
          "level": 2
        },
        {
          "kind": "paragraph",
          "text": "Pending/failed offline outcomes retain one transaction and one reconciliation record; repeated APPROVE/RECONCILE and same-process concurrent replay share the original result. An adapter throw, unknown/error envelope or missing/mismatched receipt is conservatively stored as REFUND_RECONCILIATION_REQUIRED with originalRefundUnconfirmed and no invented provider reference. OFFLINE_RECEIPT_UNCONFIRMED_MANUAL_RECOVERY identifies that recovery reason. Replaying retained uncertain evidence does not dispatch again or claim success."
        },
        {
          "kind": "paragraph",
          "text": "A changed retained refund receipt, original capture or financial intent refuses replay. Save acknowledgment alone is insufficient: the protected owner must return the exact retained evidence on readback. Missing durability remains a recovery gap under the original identity. The receipt is deterministic offline consistency evidence, not a credential; it cannot establish cross-worker atomicity or actual financial execution. A valid pending fixture stays pending and has no automatic network confirmation."
        },
        {
          "kind": "heading",
          "text": "Real provider gates and verification",
          "anchor": "commerce-payment-provider-boundaries-real-provider-gates",
          "level": 2
        },
        {
          "kind": "paragraph",
          "text": "Real CARD remains blocked. Required missing interfaces are provider-owned original capture/account/merchant lookup, refund bound to that original capture and stable financial key, and confirmed receipt/status lookup for ambiguous outcomes. External network behavior, signed webhook/replay delivery, runtime secret management, rate/capacity evidence, security/finance review, operations runbooks and named owner approval remain separate qualification gates. No declaration, credential placeholder, offline receipt or manual status edit substitutes for them."
        },
        {
          "kind": "paragraph",
          "text": "Run paymentOriginalCaptureSandboxContract.test.js for new explicit offline binding and recovery, paymentCardOriginalCaptureContract.test.js for historical/real-provider refusal and legacy compatibility, and paymentRefundSafetyContract.test.js/paymentRefundExecutionContract.test.js for guarded authority and persistence safety. Generated schema contracts remain unchanged. Later-layer service-member overrides must preserve these invariants; the tests include configured offline outcome and error-response overrides without granting authority. Native browser/API and real financial acceptance remain separate evidence."
        }
      ],
      "searchText": "Payment Core and Provider Boundaries How Payment Core, payment methods, gateway providers, safe payloads, reconciliation, refunds, and provider extension boundaries work. # Payment Core and Provider Boundaries\n\nPayment Core owns provider-neutral execution/idempotency and transaction/refund evidence. Method modules validate a chosen instrument/policy; provider adapters execute their explicitly implemented operations. Card, wallet, bank transfer and cash-on-delivery method names are not gateway integrations. A module/package name, readiness declaration or sandbox receipt does not establish external-provider support or live acceptance. For beginners, identify the payment method and its selected adapter separately, then read the implementation-status table before choosing a test. Use an approved offline fixture to understand transaction and refund evidence; do not connect real funds or retry an uncertain payment based on a simulated success. Follow the reconciliation section for the recorded outcome.\n\n## Source map\n\n| Owner / operation | Framework source |\n| --- | --- |\n| Core execution | `nodics.commerce/modules/payment/modules/paymentCore/src/service/defaultPaymentExecutionService.js`: execute, transactionModel, normalizeOutcome. |\n| Refund and reconciliation evidence | `nodics.commerce/modules/payment/modules/paymentCore/src/service/defaultPaymentRefundExecutionService.js`: refundOrder, executeRefund, reconciliationModel, recordReconciliation. |\n| Readiness / public field declaration | `nodics.commerce/modules/payment/modules/paymentCore/src/service/defaultPaymentIntegrationReadinessService.js`: contract, validateAdapter. |\n| Card method | `nodics.commerce/modules/payment/modules/paymentMethods/modules/cardPayment/src/service/defaultCardPaymentMethodService.js`: prepare. |\n| Offline Stripe simulator | `nodics.commerce/modules/payment/modules/paymentProviders/modules/stripeProvider/src/service/defaultStripeSandboxAdapterService.js`. |\n| Provider namespace placeholders | `nodics.commerce/modules/payment/modules/paymentProviders/modules/visaProvider/package.json`, `paypalProvider/package.json`, `cyberSourceProvider/package.json` under that same provider-modules directory; no gateway implementation is established by these packages. |\n| Loyalty provider | `nodics.commerce/modules/payment/modules/paymentProviders/modules/loyaltyRewardProvider/src/service/defaultLoyaltyRewardPaymentProviderService.js`; internal wallet operations, not a card-network certification. |\n\n## Boundary model\n\n```mermaid\nflowchart LR\n  Checkout[\"Checkout owner request\"] --> Method[\"Method eligibility / opaque token\"]\n  Method --> Core[\"Payment Core idempotent execution\"]\n  Core --> Adapter[\"Selected implemented adapter\"]\n  Adapter --> Offline[\"Offline simulation or internal wallet\"]\n  Adapter -.-> External[\"External gateway only after separate implementation/qualification\"]\n  Core --> Transaction[\"Stored transaction / refund evidence\"]\n  Transaction --> Reconcile[\"Pending/failed reconciliation work, not automatic settlement\"]\n```\n\nThe business problem is secure payment confidence. Business users need to know which payment methods are available and whether money movement is complete. Developers need provider contracts that avoid leaking gateway details into checkout. Operators need reconciliation, retry, and failure evidence for production.\n\n## Safe payload contract\n\nThe current readiness contract declares customerSafety.exposeOnly as status, method, amount, currency and reconciliationRequired. The example below matches that allow-list, but is an intended safe projection, not a claim that the readiness service constructs or enforces every HTTP response. Core transaction evidence retains provider code/reference and adapter-reported status. transactionModel does not generate a request hash or constrain provider-status length; this internal evidence must not be copied wholesale to a browser.\n\n```js\n// Customer-safe projection shape declared by the readiness contract.\nconst paymentResult = {\n  status: 'AUTHORIZED', method: 'CARD', amount: '129.00',\n  currency: 'USD', reconciliationRequired: false\n};\n// No providerReference, providerToken, raw gateway response, credentials, PAN or CVV.\n// Channel projection/redaction must be verified separately.\n```\n\n## Customization and extension guidance\n\nCard prepare requires trusted tenant and an opaque providerToken starting tok_; it returns an internal method descriptor, not a public payload or gateway call. Stripe's default adapter is an offline simulator using sim_/tok_test_ inputs for AUTHORIZE, CAPTURE, VOID and REFUND, including declined/cancelled/pending/failed outcomes. It never contacts Stripe. Visa, PayPal and CyberSource package namespaces do not supply working network adapters in this inspected provider inventory. Loyalty Reward is an implemented internal wallet provider, not an external gateway. Module declarations and offline receipts do not certify any of these providers for production.\n\nA real adapter must separately implement supported operations, runtime-only secrets, signed/replay-protected callbacks, idempotency and redacted evidence. validateAdapter checks declaration fields including refund support and liveEvidenceReference/certifiedAt/certifiedBy/productionTrafficApproved; satisfying those fields is not independently verified certification. Reconciliation jobs and provider settlement workers are extension/integration work, not behavior created by this declaration.\n\n## Implementation handoff\n\nexecute requires tenant, a supported AUTHORIZE/CAPTURE/VOID/REFUND operation and idempotencyKey. Its in-flight guard is tenant:key. Legacy operations replay existing repository evidence; explicit LOCAL_SANDBOX_DEMO captures additionally validate the complete original capture binding and reject changed scope, amount, currency, outcome or mode downgrade. Keep the same key for the same intent and distinct keys for distinct operations. The process-local guard and sequential repository find -> adapter -> record do not prove cross-worker exactly-once movement or atomic provider/database commit.\n\nnormalizeOutcome maps REFUNDED to REFUND_SUCCEEDED, REFUND_PENDING to REFUND_DELAYED and RECONCILIATION_REQUIRED to REFUND_RECONCILIATION_REQUIRED; REFUND_FAILED stays failed. Legacy generic execution can pass through unknown statuses, but guarded refund persistence refuses to treat unknown or unconfirmed outcomes as success. reconciliationModel uses refund-reconciliation:<stable financial key>, ACTION_REQUIRED for failed refunds and PENDING_PROVIDER_CONFIRMATION otherwise. recordReconciliation requires the generated owner, checks its save result and reads back the exact recovery evidence; missing persistence throws, never returns a fabricated durable task.\n\nrefundOrder supports one full original capture: either an internal Loyalty wallet capture with the original ledger reference, or an explicitly bound LOCAL_SANDBOX_DEMO CARD capture. It revalidates signed Order paymentAuthority, the pinned original capture and remaining authority, then derives order-full-refund:<SHA-256 of tenant, enterprise, Order and canonical refund identity>. APPROVE versus RECONCILE cannot select another financial key. Real CARD, historical unbound simulator captures, partial and split captures remain unavailable. There is no live settlement/polling worker or universal reconciliation-completion API; pending work cannot be marked settled by changing an action name or using a fresh key.\n\n## Evidence checklist\n\nPayment evidence should include order reference, payment intent, method, provider, amount, currency, lifecycle state, safe external reference, correlation id, and reconciliation result. Sensitive values must remain outside logs, release data, and browser payloads. Operators should be able to decide whether to retry, cancel, refund, or escalate without reading raw gateway responses in the main business UI.\n\nProduction readiness also needs negative-path evidence. A declined card, provider timeout, duplicate callback, partial capture, and failed refund should all return controlled states that the business can understand and developers can trace.\n\n## Common mistakes\n\n- Letting provider-specific payloads leak into checkout responses.\n- Treating a payment method as a gateway provider.\n- Storing credentials in release data.\n- Completing fulfillment before payment state allows it.\n- Hiding failed reconciliation from operators.\n\n## Verification\n\nRun Payment method/provider contracts and the original-capture sandbox and refusal regressions. Native acceptance requires a fresh server-qualified capture, signed existing customer/staff workflows and original approval evidence, followed by repeated APPROVE/RECONCILE and protected transaction/recovery inspection. Missing policy or permissions must remain refused, not granted by a test. Separate production qualification requires credentialed provider-owned original capture/refund lookup, callback replay, security review and owner sign-off; offline receipts and guide publication are not that proof.\n\n## Explicit original-capture contract\n\nThe StripeProvider owner exports captureBinding, captureOriginal and validateCaptureRecord for explicit new offline captures. DefaultPaymentExecutionService.execute forwards trusted enterprise/owner/Order/CARD/amount/currency/original idempotency and authorization reference, retains ORIGINAL_CAPTURE_V1 in PaymentTransactionEntry.evidence and requires matching repository readback. The capture test token is never retained. Legacy execute without the new mode remains legacy conformance; its receipts cannot qualify this refund path.\n\n```js\n// Owning server capture port; these are trusted checkout/order values, not browser overrides.\nconst captureRequest = {\n  tenant, enterpriseCode, authData, ownerId, orderCode,\n  operation: 'CAPTURE', methodCode: 'CARD',\n  amount: originalAmount, currency: originalCurrency,\n  idempotencyKey: originalCaptureKey, providerReference: authorizationReference,\n  providerToken: purchaseTestToken, sandboxMode: 'LOCAL_SANDBOX_DEMO'\n};\n// Existing Payment execution + generated PaymentTransactionEntry repository.\n// No refund token, separate ledger, runtime grant or network provider call.\n```\n\nsandboxRefundOutcome is optional server/test-only input pinned into the original receipt: REFUNDED is the default; REFUND_PENDING, REFUND_FAILED and RECONCILIATION_REQUIRED select deterministic recovery fixtures. It is not a refund payload field or a financial settlement toggle. Replays must preserve it along with scope/amount/currency and mode. An unset, malformed or changed retained capture does not become refundable through a caller-supplied receipt.\n\n## Guarded owner sequence and authority\n\n| Owner member | Required evidence | Result boundary |\n| --- | --- | --- |\n| PaymentRefundExecution.orderCapture | Fresh signed Order scope; exactly one scoped successful entry. | Validated offline receipt or internal wallet capture; historical/real CARD refused. |\n| PaymentRefundExecution.preflightOrder | Persisted Order approval/plan pin, remaining refundable authority. | Eligible original capture/amount/currency plus offline labels; no provider dispatch. |\n| Stripe.confirmOriginalCapture | Protected generated entry lookup by original code. | Exact stored binding revalidated; digest alone is never authority. |\n| Stripe.refundOriginal | Fresh guarded Order authority and identical full financial intent. | Tokenless deterministic offline receipt linked to original capture/key. |\n| Stripe.verifyRefundResponse | Full receipt, status, reference, scope and OFFLINE_CONFORMANCE. | Reject error envelopes, unknown non-success codes and mismatched/missing receipt. |\n| Stripe.confirmRefund | Generated transaction readback and fresh original capture confirmation. | Retained exact receipt/status or explicit unconfirmed manual recovery. |\n| PaymentRefundExecution.recordReconciliation | Original financial intent and confirmed generated persistence. | One stable recovery record; missing owner/readback fails closed. |\n\nThe immutable approval pin contains captureCode, exact amount/currency, provider/method, original reference and the complete bound offline receipt. The financial key hashes tenant, enterprise, Order and canonical refund identity; action names never change it. Retained intent also binds approvalCommandKey and original capture idempotency. Caller-selected provider tokens, provider/reference, wallet/ledger/capture identities, receipts, mode or refund key are rejected at root and payload. Caller amount/currency cannot override original authority.\n\nBefore dispatch, both generated PaymentTransaction and PaymentTransactionEntry refund evidence are bounded and checked. A read error, malformed response, errors array, non-SUC explicit code or negative acknowledgment is not an empty ledger. Prior partial, ambiguous, legacy or checkout-compensation refunds block a new full refund for owner reconciliation. A completed Order with no retained original refund cannot fabricate financial completion.\n\n## Native capture integration handoff\n\nCheckout's capturePayment owns selection of LOCAL_SANDBOX_DEMO. Derive it only from reviewed effective server policy selecting the enabled stripe-sandbox offline provider for CARD with sandboxOnly true, liveQualified false, OFFLINE_CONFORMANCE and the operational COMMERCE role. Do not forward a browser sandboxMode. The existing capture request already has trusted owner, persisted Order, amount/currency, authorization reference and original idempotency. Supply enterprise explicitly or use its existing signed authData.entCode/enterpriseCode.\n\nPayment adds no configuration enablement. Purchase authorization stays the existing offline token behavior. A fresh capture opts into binding; historical entries are not rewritten. Order must propagate sandbox: true, sandboxMode: LOCAL_SANDBOX_DEMO and maturity: OFFLINE_CONFORMANCE from preflight/payment results through its checkpoint and channel-safe response. Private capture/refund receipts and full approval intent must not be exposed wholesale to customers.\n\nLegacy checkout compensation REFUND is refused for a new sim_capture_ bound reference. A qualified owning compensation bridge or explicit manual recovery is required; do not create a refund token or pretend an uncompleted checkout has Order approval. This Payment batch does not implement cross-owner stock, digital or compensation bridges. Parent integration must validate these dependencies before native acceptance.\n\n## Replay, ambiguity and durable evidence\n\nPending/failed offline outcomes retain one transaction and one reconciliation record; repeated APPROVE/RECONCILE and same-process concurrent replay share the original result. An adapter throw, unknown/error envelope or missing/mismatched receipt is conservatively stored as REFUND_RECONCILIATION_REQUIRED with originalRefundUnconfirmed and no invented provider reference. OFFLINE_RECEIPT_UNCONFIRMED_MANUAL_RECOVERY identifies that recovery reason. Replaying retained uncertain evidence does not dispatch again or claim success.\n\nA changed retained refund receipt, original capture or financial intent refuses replay. Save acknowledgment alone is insufficient: the protected owner must return the exact retained evidence on readback. Missing durability remains a recovery gap under the original identity. The receipt is deterministic offline consistency evidence, not a credential; it cannot establish cross-worker atomicity or actual financial execution. A valid pending fixture stays pending and has no automatic network confirmation.\n\n## Real provider gates and verification\n\nReal CARD remains blocked. Required missing interfaces are provider-owned original capture/account/merchant lookup, refund bound to that original capture and stable financial key, and confirmed receipt/status lookup for ambiguous outcomes. External network behavior, signed webhook/replay delivery, runtime secret management, rate/capacity evidence, security/finance review, operations runbooks and named owner approval remain separate qualification gates. No declaration, credential placeholder, offline receipt or manual status edit substitutes for them.\n\nRun paymentOriginalCaptureSandboxContract.test.js for new explicit offline binding and recovery, paymentCardOriginalCaptureContract.test.js for historical/real-provider refusal and legacy compatibility, and paymentRefundSafetyContract.test.js/paymentRefundExecutionContract.test.js for guarded authority and persistence safety. Generated schema contracts remain unchanged. Later-layer service-member overrides must preserve these invariants; the tests include configured offline outcome and error-response overrides without granting authority. Native browser/API and real financial acceptance remain separate evidence.\n",
      "previous": {
        "title": "Localization Runtime Authoring",
        "route": "/docs/framework/localization-runtime-authoring"
      },
      "next": {
        "title": "Loyalty Wallets, Rewards, and Ledger",
        "route": "/docs/framework/loyalty-wallets-rewards-ledger"
      },
      "source": {
        "repository": "nodics.ai",
        "functionalModule": "nodics.commerce",
        "technicalModule": "paymentCore",
        "owner": "paymentCore",
        "sourcePath": "data/docs-v001/records/documentation/paymentCoreDocumentationComponentData.js",
        "path": "data/docs-v001/records/documentation/paymentCoreDocumentationComponentData.js",
        "wordCount": 1949,
        "checksum": "891a307155c8229fbcf7c1641301f92df18742d289749b8bceaedc8a32daab94"
      },
      "slug": "commerce-payment-provider-boundaries",
      "locale": "en",
      "navigationGroup": "Payment Operations",
      "navigationGroupCode": "payment-operations",
      "navigationGroupOrder": 10,
      "navigationOrder": 20,
      "references": [
        {
          "documentId": "commerce.payment-fulfillment",
          "owner": "paymentCore"
        },
        {
          "documentId": "commerce.cart-order",
          "owner": "checkoutCore"
        },
        {
          "documentId": "commerce.returns-refunds",
          "owner": "order"
        }
      ]
    },
    "active": true
  }
};
