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
    "code": "nodicsDocsComponentloyaltyWalletsRewardsLedger",
    "typeCode": "nodicsDocumentationArticleComponentType",
    "renderer": "documentation.component.article",
    "accessMode": "PUBLIC",
    "properties": {
      "code": "loyalty.wallets-rewards-ledger",
      "title": "Loyalty Wallets, Rewards, and Ledger",
      "route": "/docs/framework/loyalty-wallets-rewards-ledger",
      "section": "loyalty-and-rewards",
      "sectionTitle": "Loyalty and Rewards",
      "group": "loyalty-and-rewards",
      "groupTitle": "Loyalty and Rewards",
      "parentId": "loyalty-and-rewards",
      "hierarchyPath": [
        "Loyalty and Rewards",
        "Loyalty Wallets, Rewards, and Ledger"
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
      "summary": "Business, developer, operator, and customization guidance for reward wallets, balances, reservations, redemptions, ledger evidence, and Commerce reward payment provider integration.",
      "visibility": "public",
      "accessMode": "PUBLIC",
      "publiclyAvailable": true,
      "requiresAuthentication": false,
      "allowedRoles": [],
      "allowedGroups": [],
      "allowedPermissions": [],
      "lifecycleState": "ONLINE",
      "version": "0.16.8",
      "maturityState": "operational",
      "implementationState": "current",
      "renderingComponent": "documentation.component.article",
      "relatedPages": [
        "commerce.payment-provider-boundaries",
        "commerce.payment-fulfillment",
        "framework.customization-guide",
        "framework.local-browser-acceptance-journey"
      ],
      "sourceEvidence": [
        "../../../nodics.docs/data/manifest.json",
        "../../../nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js",
        "../../package.json",
        "../../README.md",
        "src/schemas/schemas.js",
        "src/service/defaultLoyaltyRewardOperationService.js",
        "../loyaltyLedger/src/schemas/schemas.js",
        "../loyaltyReservation/src/schemas/schemas.js",
        "../loyaltyRedemption/src/schemas/schemas.js",
        "../loyaltyApi/src/router/routers.js",
        "../../../nodics.commerce/modules/payment/modules/paymentProviders/modules/loyaltyRewardProvider/README.md",
        "../../../nodics.commerce/modules/payment/modules/paymentProviders/modules/loyaltyRewardProvider/test/loyaltyRewardPaymentProviderContract.test.js",
        "package.json",
        "src/schemas",
        "src/service",
        "src/service/defaultLoyaltyWalletOperationService.js",
        "test/loyaltyReversalRecoveryContract.test.js",
        "test/loyaltyWalletProjectionPaging.test.js"
      ],
      "visualRequirements": [
        "diagram",
        "table",
        "code-example",
        "command-example"
      ],
      "searchKeywords": [
        "loyalty",
        "reward",
        "wallet",
        "points",
        "ledger",
        "reservation",
        "redemption",
        "checkout",
        "payment-provider"
      ],
      "topicKeywords": [
        "Loyalty and Rewards",
        "Loyalty Foundations",
        "Loyalty Wallets, Rewards, and Ledger"
      ],
      "headings": [
        {
          "text": "Beginner mental model",
          "anchor": "loyaltyWalletsRewardsLedger-1-beginner-mental-model",
          "level": 2
        },
        {
          "text": "Business problem",
          "anchor": "loyaltyWalletsRewardsLedger-2-business-problem",
          "level": 2
        },
        {
          "text": "Source map",
          "anchor": "loyaltyWalletsRewardsLedger-3-source-map",
          "level": 2
        },
        {
          "text": "Owner model",
          "anchor": "loyaltyWalletsRewardsLedger-4-owner-model",
          "level": 2
        },
        {
          "text": "Runtime topology",
          "anchor": "loyaltyWalletsRewardsLedger-5-runtime-topology",
          "level": 2
        },
        {
          "text": "Business journeys",
          "anchor": "loyaltyWalletsRewardsLedger-6-business-journeys",
          "level": 2
        },
        {
          "text": "Earn",
          "anchor": "loyaltyWalletsRewardsLedger-7-earn",
          "level": 3
        },
        {
          "text": "Reserve",
          "anchor": "loyaltyWalletsRewardsLedger-8-reserve",
          "level": 3
        },
        {
          "text": "Capture",
          "anchor": "loyaltyWalletsRewardsLedger-9-capture",
          "level": 3
        },
        {
          "text": "Release",
          "anchor": "loyaltyWalletsRewardsLedger-10-release",
          "level": 3
        },
        {
          "text": "Reverse",
          "anchor": "loyaltyWalletsRewardsLedger-11-reverse",
          "level": 3
        },
        {
          "text": "Reward payment provider checkout pattern",
          "anchor": "loyaltyWalletsRewardsLedger-12-reward-payment-provider-checkout-pattern",
          "level": 2
        },
        {
          "text": "Developer guidance",
          "anchor": "loyaltyWalletsRewardsLedger-13-developer-guidance",
          "level": 2
        },
        {
          "text": "Customization guidance",
          "anchor": "loyaltyWalletsRewardsLedger-14-customization-guidance",
          "level": 2
        },
        {
          "text": "Security and governance",
          "anchor": "loyaltyWalletsRewardsLedger-15-security-and-governance",
          "level": 2
        },
        {
          "text": "Operational evidence",
          "anchor": "loyaltyWalletsRewardsLedger-16-operational-evidence",
          "level": 2
        },
        {
          "text": "Verification",
          "anchor": "loyaltyWalletsRewardsLedger-17-verification",
          "level": 2
        },
        {
          "text": "Common mistakes",
          "anchor": "loyaltyWalletsRewardsLedger-18-common-mistakes",
          "level": 2
        },
        {
          "text": "Reader checklist",
          "anchor": "loyaltyWalletsRewardsLedger-19-reader-checklist",
          "level": 2
        },
        {
          "text": "Wallet identity and bounded operational projection",
          "anchor": "loyalty-wallets-rewards-ledger-source-depth-1",
          "level": 2
        },
        {
          "text": "Amounts posting and original-entry recovery",
          "anchor": "loyalty-wallets-rewards-ledger-source-depth-2",
          "level": 2
        },
        {
          "text": "Worked recovery and qualification",
          "anchor": "loyalty-wallets-rewards-ledger-source-depth-3",
          "level": 2
        }
      ],
      "blocks": [
        {
          "kind": "paragraph",
          "text": "Maturity: operational first slice."
        },
        {
          "kind": "paragraph",
          "text": "Nodics Loyalty gives a project a reusable way to reward people or business actors for approved behavior, hold that value in a wallet, reserve it for a business transaction, capture it when the transaction succeeds, release it when the transaction fails, and explain every movement through an append-only ledger."
        },
        {
          "kind": "paragraph",
          "text": "The business idea is simple: a customer may earn points for an order, an employee may earn credits for a task, a partner may receive reward value for a campaign, or an enterprise may hold a wallet for a shared program. Each wallet has an owner type and owner code. The reward itself can be points, credits, stamps, tokens, or a project-defined unit."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Beginner mental model",
          "anchor": "loyaltyWalletsRewardsLedger-1-beginner-mental-model"
        },
        {
          "kind": "paragraph",
          "text": "For beginners, think of Loyalty as a bank passbook for non-cash reward value. The wallet says who owns the value. The balance says how much of each reward type is available, reserved, or spent. The ledger explains every movement so a team can answer what happened later. Commerce, Engagement, Process, or a project module may decide why a reward should move, but Loyalty records the movement consistently."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Business problem",
          "anchor": "loyaltyWalletsRewardsLedger-2-business-problem"
        },
        {
          "kind": "paragraph",
          "text": "Many implementations start with one points column on the customer profile. That becomes painful as soon as the business needs multiple reward types, expiry, coupon purchase, reversals, reservation during checkout, employee rewards, or audit evidence. A single balance field cannot answer who changed the balance, which program produced it, whether it is reserved, whether it was spent correctly, or how to reverse a mistake."
        },
        {
          "kind": "paragraph",
          "text": "Loyalty solves this by making the wallet a reusable value container and the ledger the permanent explanation of change. Commerce, Engagement, Process, or a customer project may decide why rewards are earned or spent, but Loyalty owns the balance, reservation, redemption, and ledger evidence."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Source map",
          "anchor": "loyaltyWalletsRewardsLedger-3-source-map"
        },
        {
          "kind": "table",
          "headers": [
            "Area",
            "Source location"
          ],
          "rows": [
            [
              "Functional module group",
              "`../../package.json`"
            ],
            [
              "Module ownership guide",
              "`../../README.md`"
            ],
            [
              "Shared policy and enums",
              "`../loyaltyCore/src/schemas/schemas.js`"
            ],
            [
              "Programs",
              "`../loyaltyProgram/src/schemas/schemas.js`"
            ],
            [
              "Reward types",
              "`../loyaltyRewardType/src/schemas/schemas.js`"
            ],
            [
              "Wallets and balances",
              "`src/schemas/schemas.js`"
            ],
            [
              "Reward operation service",
              "`src/service/defaultLoyaltyRewardOperationService.js`"
            ],
            [
              "Ledger schema and posting",
              "`../loyaltyLedger/src/schemas/schemas.js`"
            ],
            [
              "Reservation schema",
              "`../loyaltyReservation/src/schemas/schemas.js`"
            ],
            [
              "Redemption schema",
              "`../loyaltyRedemption/src/schemas/schemas.js`"
            ],
            [
              "Internal API routes",
              "`../loyaltyApi/src/router/routers.js`"
            ],
            [
              "Commerce reward payment provider",
              "`../../../nodics.commerce/modules/payment/modules/paymentProviders/modules/loyaltyRewardProvider/README.md`"
            ],
            [
              "Payment-provider acceptance",
              "`../../../nodics.commerce/modules/payment/modules/paymentProviders/modules/loyaltyRewardProvider/test/loyaltyRewardPaymentProviderContract.test.js`"
            ]
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Owner model",
          "anchor": "loyaltyWalletsRewardsLedger-4-owner-model"
        },
        {
          "kind": "diagram",
          "language": "mermaid",
          "text": "flowchart LR\n  Actor[\"Customer, employee, partner, enterprise, or system\"] --> Wallet[\"Loyalty wallet\"]\n  Wallet --> Balance[\"Program + reward type balance\"]\n  Balance --> Reservation[\"Reservation\"]\n  Reservation --> Capture[\"Capture / redemption\"]\n  Balance --> Ledger[\"Append-only reward ledger\"]\n  Capture --> Ledger\n  Reservation --> Ledger"
        },
        {
          "kind": "paragraph",
          "text": "The wallet owner is stored as `ownerType` and `ownerCode`. This allows a wallet to belong to a customer, employee, enterprise, partner, or system actor without turning Loyalty into a customer-profile table."
        },
        {
          "kind": "paragraph",
          "text": "Tenant and enterprise schema selection comes from the authenticated runtime context. Do not add `tenant`, `enterpriseCode`, raw token, request payload, or HTTP context fields to Loyalty wallet, balance, ledger, reservation, or redemption rows."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Runtime topology",
          "anchor": "loyaltyWalletsRewardsLedger-5-runtime-topology"
        },
        {
          "kind": "paragraph",
          "text": "Loyalty can run in the same local topology as the rest of Nodics or as a separate microservice. In the Kickoff local topology, `loyaltyServer` runs the framework-owned `nodics.loyalty` module group. Commerce can run on its own server and call the Loyalty internal API through the configured server graph."
        },
        {
          "kind": "paragraph",
          "text": "This is the important dependency direction:"
        },
        {
          "kind": "table",
          "headers": [
            "Journey part",
            "Owner"
          ],
          "rows": [
            [
              "Reward balance and ledger",
              "`nodics.loyalty`"
            ],
            [
              "Coupon product, cart, checkout, order, payment transaction, entitlement, delivery",
              "`nodics.commerce`"
            ],
            [
              "Buying a coupon with reward points",
              "Commerce payment method and payment provider"
            ],
            [
              "Project earning rule or customer-specific reward policy",
              "Project module or configuration"
            ],
            [
              "Runtime schema selection",
              "Authenticated request context"
            ]
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Business journeys",
          "anchor": "loyaltyWalletsRewardsLedger-6-business-journeys"
        },
        {
          "kind": "heading",
          "level": 3,
          "text": "Earn",
          "anchor": "loyaltyWalletsRewardsLedger-7-earn"
        },
        {
          "kind": "paragraph",
          "text": "An approved business event grants reward value. The earning reason can come from Commerce, Engagement, Process, or a project-specific module, but the balance movement belongs to Loyalty. The ledger entry type is `EARN`."
        },
        {
          "kind": "heading",
          "level": 3,
          "text": "Reserve",
          "anchor": "loyaltyWalletsRewardsLedger-8-reserve"
        },
        {
          "kind": "paragraph",
          "text": "Before a reward value is spent, Loyalty can reserve it. Reservation moves value from available to reserved so a checkout or external process can continue without double-spending the same points. The ledger entry type is `RESERVE`."
        },
        {
          "kind": "heading",
          "level": 3,
          "text": "Capture",
          "anchor": "loyaltyWalletsRewardsLedger-9-capture"
        },
        {
          "kind": "paragraph",
          "text": "When the downstream business journey succeeds, the reservation is captured. Reserved value becomes spent value, a redemption record is created, and the ledger receives a `CAPTURE` entry."
        },
        {
          "kind": "heading",
          "level": 3,
          "text": "Release",
          "anchor": "loyaltyWalletsRewardsLedger-10-release"
        },
        {
          "kind": "paragraph",
          "text": "If the downstream journey fails or is cancelled before capture, the reservation is released. Reserved value returns to available value, and the ledger receives release evidence."
        },
        {
          "kind": "heading",
          "level": 3,
          "text": "Reverse",
          "anchor": "loyaltyWalletsRewardsLedger-11-reverse"
        },
        {
          "kind": "paragraph",
          "text": "Corrections and refunds are compensating movements. Historical ledger rows remain append-only; a new `REVERSE` entry explains the correction."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Reward payment provider checkout pattern",
          "anchor": "loyaltyWalletsRewardsLedger-12-reward-payment-provider-checkout-pattern"
        },
        {
          "kind": "paragraph",
          "text": "Buying a coupon with points is not Loyalty module behavior. It is a Commerce checkout journey using Loyalty as the reward-balance authority."
        },
        {
          "kind": "diagram",
          "language": "mermaid",
          "text": "sequenceDiagram\n  participant Customer\n  participant Commerce\n  participant Payment as Loyalty reward payment provider\n  participant Loyalty\n  Customer->>Commerce: Place order with LOYALTY_REWARD\n  Commerce->>Payment: Authorize reward payment\n  Payment->>Loyalty: Reserve reward amount\n  Commerce->>Payment: Capture after order placement\n  Payment->>Loyalty: Capture reservation\n  Commerce->>Commerce: Persist order, payment, entitlement, delivery"
        },
        {
          "kind": "paragraph",
          "text": "Use `paymentMethod: \"LOYALTY_REWARD\"` when checkout should pay for a product with reward value. Commerce decides that the product can be bought, calculates the cart, owns payment transaction evidence, creates the order, and delivers the coupon or digital entitlement. Loyalty only owns the wallet balance, reservation, redemption, and ledger."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Developer guidance",
          "anchor": "loyaltyWalletsRewardsLedger-13-developer-guidance"
        },
        {
          "kind": "paragraph",
          "text": "Developers should start from the owner before adding code:"
        },
        {
          "kind": "table",
          "headers": [
            "Change",
            "Put it here"
          ],
          "rows": [
            [
              "New reward unit such as points, credits, or stamps",
              "`loyaltyRewardType` data or project data"
            ],
            [
              "New program such as VIP rewards",
              "`loyaltyProgram` data or project data"
            ],
            [
              "Balance mutation behavior used by every project",
              "`loyaltyWallet` service contract"
            ],
            [
              "Ledger posting behavior",
              "`loyaltyLedger`"
            ],
            [
              "Reserve, capture, release, reverse API",
              "`loyaltyApi`"
            ],
            [
              "Coupon purchase with points",
              "Commerce payment method/provider"
            ],
            [
              "Project-specific earn policy",
              "Customer project extension module"
            ],
            [
              "Storefront labels and customer messaging",
              "Project frontend or content data"
            ]
          ]
        },
        {
          "kind": "paragraph",
          "text": "Use string decimal amounts for reward balances. Do not use floating point arithmetic for points or credits. Use idempotency keys and correlation IDs for mutating operations so retries do not double-spend rewards."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Customization guidance",
          "anchor": "loyaltyWalletsRewardsLedger-14-customization-guidance"
        },
        {
          "kind": "paragraph",
          "text": "Customize Loyalty from the outside first:"
        },
        {
          "kind": "ordered-list",
          "items": [
            "Configure reward programs, reward types, expiry windows, and spend policies.",
            "Add project-owned data packs for customer-specific reward catalogs.",
            "Add a project extension module when a customer has unique earning, validation, expiry, or eligibility rules.",
            "Add Commerce payment providers or payment-method configuration when reward value can buy products, subscriptions, coupons, or services.",
            "Change the reusable framework module only when all projects need a new Loyalty contract."
          ]
        },
        {
          "kind": "paragraph",
          "text": "Project customization must keep standard owner names stable. A customer project may extend Loyalty behavior, but it should not rename the framework capability or create a parallel wallet authority."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Security and governance",
          "anchor": "loyaltyWalletsRewardsLedger-15-security-and-governance"
        },
        {
          "kind": "paragraph",
          "text": "Loyalty internal mutation APIs are service-to-service contracts. Customer or admin tokens may read authorized wallet views when such routes are exposed, but reserve, capture, release, and reverse operations should be called by trusted services such as Commerce payment providers."
        },
        {
          "kind": "paragraph",
          "text": "Permissions must be explicit. Service accounts need the Loyalty internal permissions used by payment-provider handoff. Browser responses and logs must not expose raw tokens, API keys, customer secrets, or provider payloads."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Operational evidence",
          "anchor": "loyaltyWalletsRewardsLedger-16-operational-evidence"
        },
        {
          "kind": "paragraph",
          "text": "An operator needs enough evidence to decide whether a reward spend succeeded, failed, or needs compensation:"
        },
        {
          "kind": "table",
          "headers": [
            "Evidence",
            "Why it matters"
          ],
          "rows": [
            [
              "Wallet balance",
              "Shows available, reserved, and spent reward value"
            ],
            [
              "Reservation",
              "Shows value was held for a target order or process"
            ],
            [
              "Ledger entries",
              "Shows append-only movement history"
            ],
            [
              "Redemption",
              "Shows captured reward usage"
            ],
            [
              "Payment transaction",
              "Shows Commerce payment lifecycle"
            ],
            [
              "Order evidence",
              "Shows checkout selected the Loyalty reward provider"
            ],
            [
              "Entitlement or delivery",
              "Shows the product or coupon was actually fulfilled"
            ]
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Verification",
          "anchor": "loyaltyWalletsRewardsLedger-17-verification"
        },
        {
          "kind": "paragraph",
          "text": "For framework changes, run the focused Loyalty tests:"
        },
        {
          "kind": "code",
          "language": "sh",
          "text": "node nodics.loyalty/modules/loyaltyApi/test/loyaltyApiRouteContract.test.js\nnode nodics.loyalty/modules/loyaltyWallet/test/loyaltyRewardOperationContract.test.js\nnode nodics.loyalty/modules/loyaltyLedger/test/loyaltyLedgerContract.test.js"
        },
        {
          "kind": "paragraph",
          "text": "For Commerce checkout integration, run the provider contract:"
        },
        {
          "kind": "code",
          "language": "sh",
          "text": "node nodics.commerce/modules/payment/modules/paymentProviders/modules/loyaltyRewardProvider/test/loyaltyRewardPaymentProviderContract.test.js"
        },
        {
          "kind": "paragraph",
          "text": "Customer-owned live acceptance must start the selected Platform, Loyalty and Commerce runtimes, place an authenticated checkout using `LOYALTY_REWARD`, and verify persisted evidence across Loyalty and Commerce models. Bind the checks to that project's explicitly provisioned identities, stores and deployment; the framework does not supply a fixed customer topology or live credentials."
        },
        {
          "kind": "paragraph",
          "text": "When a journey is customer-visible, complete a browser pass as well. The page or journey should show business-safe status, readable balance/payment evidence, and no broken layout at desktop and mobile widths."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Common mistakes",
          "anchor": "loyaltyWalletsRewardsLedger-18-common-mistakes"
        },
        {
          "kind": "unordered-list",
          "items": [
            "Treating coupon purchase as Loyalty instead of Commerce payment behavior.",
            "Storing tenant or enterprise fields in Loyalty business rows.",
            "Moving balances without ledger evidence.",
            "Editing old ledger entries instead of posting reversals.",
            "Letting a project-specific reward policy become the framework default.",
            "Using floating point math for reward amounts.",
            "Calling internal mutation APIs directly from a public browser journey."
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Reader checklist",
          "anchor": "loyaltyWalletsRewardsLedger-19-reader-checklist"
        },
        {
          "kind": "paragraph",
          "text": "Business readers should leave this page knowing what reward wallets do and why ledger evidence matters. Developers should know which module owns each change. Operators should know which runtime and evidence to inspect. Project teams should know how to customize reward programs and checkout spend behavior without forking the standard Loyalty framework."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Wallet identity and bounded operational projection",
          "anchor": "loyalty-wallets-rewards-ledger-source-depth-1"
        },
        {
          "kind": "paragraph",
          "text": "The implemented wallet operation distinguishes business owner identity from runtime isolation. ownerType is CUSTOMER, EMPLOYEE, ENTERPRISE, PARTNER or SYSTEM and ownerCode is a nonempty bounded string. The generated wallet identity is a deterministic hash of the owner tuple; it is not a cross-tenant uniqueness guarantee. Authenticated runtime context selects storage. Do not add tenant or enterpriseCode as ordinary wallet business fields to compensate for an incorrectly scoped call. The wallet operation requires an internal service principal; employee-facing access must pass through its separately authorized owning API."
        },
        {
          "kind": "paragraph",
          "text": "open looks for an existing owner wallet, otherwise saves a deterministic OPEN wallet and reads it back. A deterministic code helps stable identity, but concurrent creation safety also depends on the generated persistence contract and installed indexes. projection resolves that wallet and reads balances and ledger entries through generated services. The recent-entry read is explicitly bounded to 100, ordered by postedAt and code descending. It is not a complete transaction export or lifetime analytics total. The paging regression uses 120 owner entries and an unrelated wallet to prove the recent window and owner filter."
        },
        {
          "kind": "diagram",
          "language": "mermaid",
          "text": "flowchart LR\n  Owner[Owner type and code] --> Wallet[Runtime-scoped wallet]\n  Wallet --> Balance[Per program and reward balance]\n  Balance --> Movement[Earn reserve capture release]\n  Movement --> Ledger[Append-only ledger evidence]\n  Ledger --> Reverse[Original-entry reversal]\n  Reverse --> Pending[Balance plus pending posting]\n  Pending --> Resume[Resume ledger posting without another delta]"
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Amounts posting and original-entry recovery",
          "anchor": "loyalty-wallets-rewards-ledger-source-depth-2"
        },
        {
          "kind": "paragraph",
          "text": "Reward operations require wallet, program, reward type, exact positive amount, idempotency key and correlation identity. Amount handling delegates to Loyalty Core rather than floating-point arithmetic in a consumer. Balance identity is tied to wallet, program and reward type. The generated persistence model removes transport fields including tenant, enterpriseCode, authData, payload and httpRequest. Runtime context remains in the service envelope. Balance updates use the expected prior revision; source callers must preserve and qualify that optimistic-concurrency behavior instead of assuming every save is a transaction."
        },
        {
          "kind": "paragraph",
          "text": "Reversal reads the original immutable ledger entry and derives the wallet, program, reward type and amount from that evidence rather than trusting a new amount supplied by a client. It first searches for an existing REVERSE entry bound to the original ledger code. A completed full reversal is returned even if a later caller uses another retry key. Reusing one retry key for a different original entry is a conflict. This distinction prevents a changed retry identity from creating another compensation for the same original economic movement."
        },
        {
          "kind": "paragraph",
          "text": "When no completed reversal exists, the operation computes compensating deltas and stores the pending immutable reversal posting inside the same optimistic balance write as the delta. The pending key is derived from the original entry. If ledger persistence subsequently fails, the next attempt finds that pending posting and resumes the ledger write without applying the balance delta again. The service reads back the pending posting after the balance update to detect an unsuccessful or conflicting write. If ledger save throws but the exact posting exists, it returns the existing evidence. Negative available or reserved balances remain forbidden."
        },
        {
          "kind": "table",
          "headers": [
            "Situation",
            "Owner behavior",
            "Operator decision"
          ],
          "rows": [
            [
              "Same original entry with a new retry key",
              "Return existing full reversal",
              "Do not apply another delta"
            ],
            [
              "Same retry key for a different entry",
              "Conflict",
              "Inspect the original command"
            ],
            [
              "Balance committed, ledger write interrupted",
              "Retain pending posting",
              "Resume original reversal"
            ],
            [
              "Stale balance revision",
              "Optimistic conflict",
              "Refresh trusted state"
            ],
            [
              "Recent projection has 100 entries",
              "Bounded read window",
              "Use a separate authorized export for full history"
            ]
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Worked recovery and qualification",
          "anchor": "loyalty-wallets-rewards-ledger-source-depth-3"
        },
        {
          "kind": "paragraph",
          "text": "Consider a reward already earned by a verified Waste operation. A legitimate reversal must refer to that original earning ledger entry; editing the displayed wallet balance is not a reversal. If the balance compensation succeeds but the ledger database acknowledgement fails, do not create a new manual adjustment. Inspect the original operation and the owner-held pending posting. Resume through the same Loyalty reversal operation so its original-entry guard and pending-write contract decide the outcome. A customer-visible receipt should distinguish completed compensation from a pending posting until the owner confirms durable evidence."
        },
        {
          "kind": "paragraph",
          "text": "This stronger recovery contract is specific to reversal. It does not claim multi-record atomicity for unrelated earn, reserve, capture, release or transfer paths. Read each owning operation and its transaction seam before making a wider exactly-once guarantee. Similarly, wallet projection authorization is not established by a service identity fabricated in a browser. Trusted ingress, employee permission and owner scope belong to the canonical API. Keep raw customer identity, tokens and private reward details out of public documentation and troubleshooting screenshots."
        },
        {
          "kind": "paragraph",
          "text": "Run loyaltyRewardOperationContract, loyaltyReversalRecoveryContract, loyaltyRewardTransferRecovery, loyaltyWalletOwnerContract and loyaltyWalletProjectionPaging. Include two concurrent reversals of one entry, a changed retry key, interrupted ledger posting, negative-balance prevention and stale revisions. Then qualify actual generated services and indexes, the consumer source event, signed-in wallet inspection and the final ledger evidence separately. A simulated crash test demonstrates source recovery logic but does not establish live storage isolation or a completed Circa reward journey. Preserve the canonical Ledger guide and consumer references rather than copying these rules into every accelerator."
        },
        {
          "kind": "paragraph",
          "text": "Acceptance evidence should retain the original source ledger code, reversal command identity, before and after revision, pending-posting identity and final ledger result, using privacy-safe identifiers. Test a reader during the interrupted-posting interval so that a dashboard does not label pending evidence as final settlement. Verify another owner cannot inspect the same wallet through a changed request parameter. Run the recovery again with the original entry and confirm no second balance movement occurs. Keep any approved operational export under its own permission and paging contract. Never calculate a lifetime balance from the recent hundred rows or use a frontend total to repair the stored ledger."
        }
      ],
      "searchText": "Loyalty Wallets, Rewards, and Ledger Business, developer, operator, and customization guidance for reward wallets, balances, reservations, redemptions, ledger evidence, and Commerce reward payment provider integration. # Loyalty Wallets, Rewards, and Ledger\n\nMaturity: operational first slice.\n\nNodics Loyalty gives a project a reusable way to reward people or business actors for approved behavior, hold that value in a wallet, reserve it for a business transaction, capture it when the transaction succeeds, release it when the transaction fails, and explain every movement through an append-only ledger.\n\nThe business idea is simple: a customer may earn points for an order, an employee may earn credits for a task, a partner may receive reward value for a campaign, or an enterprise may hold a wallet for a shared program. Each wallet has an owner type and owner code. The reward itself can be points, credits, stamps, tokens, or a project-defined unit.\n\n## Beginner mental model\n\nFor beginners, think of Loyalty as a bank passbook for non-cash reward value. The wallet says who owns the value. The balance says how much of each reward type is available, reserved, or spent. The ledger explains every movement so a team can answer what happened later. Commerce, Engagement, Process, or a project module may decide why a reward should move, but Loyalty records the movement consistently.\n\n## Business problem\n\nMany implementations start with one points column on the customer profile. That becomes painful as soon as the business needs multiple reward types, expiry, coupon purchase, reversals, reservation during checkout, employee rewards, or audit evidence. A single balance field cannot answer who changed the balance, which program produced it, whether it is reserved, whether it was spent correctly, or how to reverse a mistake.\n\nLoyalty solves this by making the wallet a reusable value container and the ledger the permanent explanation of change. Commerce, Engagement, Process, or a customer project may decide why rewards are earned or spent, but Loyalty owns the balance, reservation, redemption, and ledger evidence.\n\n## Source map\n\n| Area | Source location |\n| --- | --- |\n| Functional module group | `../../package.json` |\n| Module ownership guide | `../../README.md` |\n| Shared policy and enums | `../loyaltyCore/src/schemas/schemas.js` |\n| Programs | `../loyaltyProgram/src/schemas/schemas.js` |\n| Reward types | `../loyaltyRewardType/src/schemas/schemas.js` |\n| Wallets and balances | `src/schemas/schemas.js` |\n| Reward operation service | `src/service/defaultLoyaltyRewardOperationService.js` |\n| Ledger schema and posting | `../loyaltyLedger/src/schemas/schemas.js` |\n| Reservation schema | `../loyaltyReservation/src/schemas/schemas.js` |\n| Redemption schema | `../loyaltyRedemption/src/schemas/schemas.js` |\n| Internal API routes | `../loyaltyApi/src/router/routers.js` |\n| Commerce reward payment provider | `../../../nodics.commerce/modules/payment/modules/paymentProviders/modules/loyaltyRewardProvider/README.md` |\n| Payment-provider acceptance | `../../../nodics.commerce/modules/payment/modules/paymentProviders/modules/loyaltyRewardProvider/test/loyaltyRewardPaymentProviderContract.test.js` |\n\n## Owner model\n\n```mermaid\nflowchart LR\n  Actor[\"Customer, employee, partner, enterprise, or system\"] --> Wallet[\"Loyalty wallet\"]\n  Wallet --> Balance[\"Program + reward type balance\"]\n  Balance --> Reservation[\"Reservation\"]\n  Reservation --> Capture[\"Capture / redemption\"]\n  Balance --> Ledger[\"Append-only reward ledger\"]\n  Capture --> Ledger\n  Reservation --> Ledger\n```\n\nThe wallet owner is stored as `ownerType` and `ownerCode`. This allows a wallet to belong to a customer, employee, enterprise, partner, or system actor without turning Loyalty into a customer-profile table.\n\nTenant and enterprise schema selection comes from the authenticated runtime context. Do not add `tenant`, `enterpriseCode`, raw token, request payload, or HTTP context fields to Loyalty wallet, balance, ledger, reservation, or redemption rows.\n\n## Runtime topology\n\nLoyalty can run in the same local topology as the rest of Nodics or as a separate microservice. In the Kickoff local topology, `loyaltyServer` runs the framework-owned `nodics.loyalty` module group. Commerce can run on its own server and call the Loyalty internal API through the configured server graph.\n\nThis is the important dependency direction:\n\n| Journey part | Owner |\n| --- | --- |\n| Reward balance and ledger | `nodics.loyalty` |\n| Coupon product, cart, checkout, order, payment transaction, entitlement, delivery | `nodics.commerce` |\n| Buying a coupon with reward points | Commerce payment method and payment provider |\n| Project earning rule or customer-specific reward policy | Project module or configuration |\n| Runtime schema selection | Authenticated request context |\n\n## Business journeys\n\n### Earn\n\nAn approved business event grants reward value. The earning reason can come from Commerce, Engagement, Process, or a project-specific module, but the balance movement belongs to Loyalty. The ledger entry type is `EARN`.\n\n### Reserve\n\nBefore a reward value is spent, Loyalty can reserve it. Reservation moves value from available to reserved so a checkout or external process can continue without double-spending the same points. The ledger entry type is `RESERVE`.\n\n### Capture\n\nWhen the downstream business journey succeeds, the reservation is captured. Reserved value becomes spent value, a redemption record is created, and the ledger receives a `CAPTURE` entry.\n\n### Release\n\nIf the downstream journey fails or is cancelled before capture, the reservation is released. Reserved value returns to available value, and the ledger receives release evidence.\n\n### Reverse\n\nCorrections and refunds are compensating movements. Historical ledger rows remain append-only; a new `REVERSE` entry explains the correction.\n\n## Reward payment provider checkout pattern\n\nBuying a coupon with points is not Loyalty module behavior. It is a Commerce checkout journey using Loyalty as the reward-balance authority.\n\n```mermaid\nsequenceDiagram\n  participant Customer\n  participant Commerce\n  participant Payment as Loyalty reward payment provider\n  participant Loyalty\n  Customer->>Commerce: Place order with LOYALTY_REWARD\n  Commerce->>Payment: Authorize reward payment\n  Payment->>Loyalty: Reserve reward amount\n  Commerce->>Payment: Capture after order placement\n  Payment->>Loyalty: Capture reservation\n  Commerce->>Commerce: Persist order, payment, entitlement, delivery\n```\n\nUse `paymentMethod: \"LOYALTY_REWARD\"` when checkout should pay for a product with reward value. Commerce decides that the product can be bought, calculates the cart, owns payment transaction evidence, creates the order, and delivers the coupon or digital entitlement. Loyalty only owns the wallet balance, reservation, redemption, and ledger.\n\n## Developer guidance\n\nDevelopers should start from the owner before adding code:\n\n| Change | Put it here |\n| --- | --- |\n| New reward unit such as points, credits, or stamps | `loyaltyRewardType` data or project data |\n| New program such as VIP rewards | `loyaltyProgram` data or project data |\n| Balance mutation behavior used by every project | `loyaltyWallet` service contract |\n| Ledger posting behavior | `loyaltyLedger` |\n| Reserve, capture, release, reverse API | `loyaltyApi` |\n| Coupon purchase with points | Commerce payment method/provider |\n| Project-specific earn policy | Customer project extension module |\n| Storefront labels and customer messaging | Project frontend or content data |\n\nUse string decimal amounts for reward balances. Do not use floating point arithmetic for points or credits. Use idempotency keys and correlation IDs for mutating operations so retries do not double-spend rewards.\n\n## Customization guidance\n\nCustomize Loyalty from the outside first:\n\n1. Configure reward programs, reward types, expiry windows, and spend policies.\n2. Add project-owned data packs for customer-specific reward catalogs.\n3. Add a project extension module when a customer has unique earning, validation, expiry, or eligibility rules.\n4. Add Commerce payment providers or payment-method configuration when reward value can buy products, subscriptions, coupons, or services.\n5. Change the reusable framework module only when all projects need a new Loyalty contract.\n\nProject customization must keep standard owner names stable. A customer project may extend Loyalty behavior, but it should not rename the framework capability or create a parallel wallet authority.\n\n## Security and governance\n\nLoyalty internal mutation APIs are service-to-service contracts. Customer or admin tokens may read authorized wallet views when such routes are exposed, but reserve, capture, release, and reverse operations should be called by trusted services such as Commerce payment providers.\n\nPermissions must be explicit. Service accounts need the Loyalty internal permissions used by payment-provider handoff. Browser responses and logs must not expose raw tokens, API keys, customer secrets, or provider payloads.\n\n## Operational evidence\n\nAn operator needs enough evidence to decide whether a reward spend succeeded, failed, or needs compensation:\n\n| Evidence | Why it matters |\n| --- | --- |\n| Wallet balance | Shows available, reserved, and spent reward value |\n| Reservation | Shows value was held for a target order or process |\n| Ledger entries | Shows append-only movement history |\n| Redemption | Shows captured reward usage |\n| Payment transaction | Shows Commerce payment lifecycle |\n| Order evidence | Shows checkout selected the Loyalty reward provider |\n| Entitlement or delivery | Shows the product or coupon was actually fulfilled |\n\n## Verification\n\nFor framework changes, run the focused Loyalty tests:\n\n```sh\nnode nodics.loyalty/modules/loyaltyApi/test/loyaltyApiRouteContract.test.js\nnode nodics.loyalty/modules/loyaltyWallet/test/loyaltyRewardOperationContract.test.js\nnode nodics.loyalty/modules/loyaltyLedger/test/loyaltyLedgerContract.test.js\n```\n\nFor Commerce checkout integration, run the provider contract:\n\n```sh\nnode nodics.commerce/modules/payment/modules/paymentProviders/modules/loyaltyRewardProvider/test/loyaltyRewardPaymentProviderContract.test.js\n```\n\nCustomer-owned live acceptance must start the selected Platform, Loyalty and Commerce runtimes, place an authenticated checkout using `LOYALTY_REWARD`, and verify persisted evidence across Loyalty and Commerce models. Bind the checks to that project's explicitly provisioned identities, stores and deployment; the framework does not supply a fixed customer topology or live credentials.\n\nWhen a journey is customer-visible, complete a browser pass as well. The page or journey should show business-safe status, readable balance/payment evidence, and no broken layout at desktop and mobile widths.\n\n## Common mistakes\n\n- Treating coupon purchase as Loyalty instead of Commerce payment behavior.\n- Storing tenant or enterprise fields in Loyalty business rows.\n- Moving balances without ledger evidence.\n- Editing old ledger entries instead of posting reversals.\n- Letting a project-specific reward policy become the framework default.\n- Using floating point math for reward amounts.\n- Calling internal mutation APIs directly from a public browser journey.\n\n## Reader checklist\n\nBusiness readers should leave this page knowing what reward wallets do and why ledger evidence matters. Developers should know which module owns each change. Operators should know which runtime and evidence to inspect. Project teams should know how to customize reward programs and checkout spend behavior without forking the standard Loyalty framework.\n\n## Wallet identity and bounded operational projection\n\nThe implemented wallet operation distinguishes business owner identity from runtime isolation. ownerType is CUSTOMER, EMPLOYEE, ENTERPRISE, PARTNER or SYSTEM and ownerCode is a nonempty bounded string. The generated wallet identity is a deterministic hash of the owner tuple; it is not a cross-tenant uniqueness guarantee. Authenticated runtime context selects storage. Do not add tenant or enterpriseCode as ordinary wallet business fields to compensate for an incorrectly scoped call. The wallet operation requires an internal service principal; employee-facing access must pass through its separately authorized owning API.\n\nopen looks for an existing owner wallet, otherwise saves a deterministic OPEN wallet and reads it back. A deterministic code helps stable identity, but concurrent creation safety also depends on the generated persistence contract and installed indexes. projection resolves that wallet and reads balances and ledger entries through generated services. The recent-entry read is explicitly bounded to 100, ordered by postedAt and code descending. It is not a complete transaction export or lifetime analytics total. The paging regression uses 120 owner entries and an unrelated wallet to prove the recent window and owner filter.\n\n```mermaid\nflowchart LR\n  Owner[Owner type and code] --> Wallet[Runtime-scoped wallet]\n  Wallet --> Balance[Per program and reward balance]\n  Balance --> Movement[Earn reserve capture release]\n  Movement --> Ledger[Append-only ledger evidence]\n  Ledger --> Reverse[Original-entry reversal]\n  Reverse --> Pending[Balance plus pending posting]\n  Pending --> Resume[Resume ledger posting without another delta]\n```\n\n## Amounts posting and original-entry recovery\n\nReward operations require wallet, program, reward type, exact positive amount, idempotency key and correlation identity. Amount handling delegates to Loyalty Core rather than floating-point arithmetic in a consumer. Balance identity is tied to wallet, program and reward type. The generated persistence model removes transport fields including tenant, enterpriseCode, authData, payload and httpRequest. Runtime context remains in the service envelope. Balance updates use the expected prior revision; source callers must preserve and qualify that optimistic-concurrency behavior instead of assuming every save is a transaction.\n\nReversal reads the original immutable ledger entry and derives the wallet, program, reward type and amount from that evidence rather than trusting a new amount supplied by a client. It first searches for an existing REVERSE entry bound to the original ledger code. A completed full reversal is returned even if a later caller uses another retry key. Reusing one retry key for a different original entry is a conflict. This distinction prevents a changed retry identity from creating another compensation for the same original economic movement.\n\nWhen no completed reversal exists, the operation computes compensating deltas and stores the pending immutable reversal posting inside the same optimistic balance write as the delta. The pending key is derived from the original entry. If ledger persistence subsequently fails, the next attempt finds that pending posting and resumes the ledger write without applying the balance delta again. The service reads back the pending posting after the balance update to detect an unsuccessful or conflicting write. If ledger save throws but the exact posting exists, it returns the existing evidence. Negative available or reserved balances remain forbidden.\n\n| Situation | Owner behavior | Operator decision |\n| --- | --- | --- |\n| Same original entry with a new retry key | Return existing full reversal | Do not apply another delta |\n| Same retry key for a different entry | Conflict | Inspect the original command |\n| Balance committed, ledger write interrupted | Retain pending posting | Resume original reversal |\n| Stale balance revision | Optimistic conflict | Refresh trusted state |\n| Recent projection has 100 entries | Bounded read window | Use a separate authorized export for full history |\n\n## Worked recovery and qualification\n\nConsider a reward already earned by a verified Waste operation. A legitimate reversal must refer to that original earning ledger entry; editing the displayed wallet balance is not a reversal. If the balance compensation succeeds but the ledger database acknowledgement fails, do not create a new manual adjustment. Inspect the original operation and the owner-held pending posting. Resume through the same Loyalty reversal operation so its original-entry guard and pending-write contract decide the outcome. A customer-visible receipt should distinguish completed compensation from a pending posting until the owner confirms durable evidence.\n\nThis stronger recovery contract is specific to reversal. It does not claim multi-record atomicity for unrelated earn, reserve, capture, release or transfer paths. Read each owning operation and its transaction seam before making a wider exactly-once guarantee. Similarly, wallet projection authorization is not established by a service identity fabricated in a browser. Trusted ingress, employee permission and owner scope belong to the canonical API. Keep raw customer identity, tokens and private reward details out of public documentation and troubleshooting screenshots.\n\nRun loyaltyRewardOperationContract, loyaltyReversalRecoveryContract, loyaltyRewardTransferRecovery, loyaltyWalletOwnerContract and loyaltyWalletProjectionPaging. Include two concurrent reversals of one entry, a changed retry key, interrupted ledger posting, negative-balance prevention and stale revisions. Then qualify actual generated services and indexes, the consumer source event, signed-in wallet inspection and the final ledger evidence separately. A simulated crash test demonstrates source recovery logic but does not establish live storage isolation or a completed Circa reward journey. Preserve the canonical Ledger guide and consumer references rather than copying these rules into every accelerator.\n\nAcceptance evidence should retain the original source ledger code, reversal command identity, before and after revision, pending-posting identity and final ledger result, using privacy-safe identifiers. Test a reader during the interrupted-posting interval so that a dashboard does not label pending evidence as final settlement. Verify another owner cannot inspect the same wallet through a changed request parameter. Run the recovery again with the original entry and confirm no second balance movement occurs. Keep any approved operational export under its own permission and paging contract. Never calculate a lifetime balance from the recent hundred rows or use a frontend total to repair the stored ledger.\n",
      "previous": {
        "title": "Payment Core and Provider Boundaries",
        "route": "/docs/framework/commerce-payment-provider-boundaries"
      },
      "next": {
        "title": "Shopping List Commerce Boundary",
        "route": "/docs/framework/commerce-shopping-list-commerce-boundary"
      },
      "source": {
        "repository": "nodics.ai",
        "functionalModule": "nodics.loyalty",
        "technicalModule": "loyaltyWallet",
        "owner": "loyaltyWallet",
        "sourcePath": "data/docs-v001/records/documentation/loyaltyWalletDocumentationComponentData.js",
        "path": "data/docs-v001/records/documentation/loyaltyWalletDocumentationComponentData.js",
        "wordCount": 2425,
        "checksum": "f62dfae3427ad17344da2ef3e3216264af9d79c0217bb4d0f613c1e290822faf"
      },
      "slug": "loyalty-wallets-rewards-and-ledger",
      "locale": "en",
      "navigationGroup": "Loyalty Foundations",
      "navigationGroupCode": "loyalty-foundations",
      "navigationGroupOrder": 10,
      "navigationOrder": 10,
      "references": [
        {
          "documentId": "commerce.payment-provider-boundaries",
          "owner": "paymentCore"
        },
        {
          "documentId": "commerce.payment-fulfillment",
          "owner": "paymentCore"
        },
        {
          "documentId": "framework.customization-guide",
          "owner": "nodics.docs"
        },
        {
          "documentId": "framework.local-browser-acceptance-journey",
          "owner": "nTooling"
        }
      ],
      "sourceCoverage": [
        {
          "modulePath": ".",
          "implementationState": "IMPLEMENTED",
          "anchors": [
            "loyalty-wallets-rewards-ledger-source-depth-1",
            "loyalty-wallets-rewards-ledger-source-depth-2",
            "loyalty-wallets-rewards-ledger-source-depth-3"
          ],
          "evidence": [
            "src/service/defaultLoyaltyWalletOperationService.js",
            "src/service/defaultLoyaltyRewardOperationService.js",
            "test/loyaltyReversalRecoveryContract.test.js",
            "test/loyaltyWalletProjectionPaging.test.js"
          ]
        }
      ]
    },
    "active": true
  }
};
