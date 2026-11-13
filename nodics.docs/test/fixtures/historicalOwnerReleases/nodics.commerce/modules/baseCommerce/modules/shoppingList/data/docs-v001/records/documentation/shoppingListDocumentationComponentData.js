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
    "code": "nodicsDocsComponentcommerceShoppingListCommerceBoundary",
    "typeCode": "nodicsDocumentationArticleComponentType",
    "renderer": "documentation.component.article",
    "accessMode": "PUBLIC",
    "properties": {
      "code": "commerce.shopping-list-commerce-boundary",
      "title": "Shopping List Commerce Boundary",
      "route": "/docs/framework/commerce-shopping-list-commerce-boundary",
      "section": "user-enterprise-and-tenant-management",
      "sectionTitle": "User, Enterprise, and Tenant Management",
      "group": "user-enterprise-and-tenant-management",
      "groupTitle": "User, Enterprise, and Tenant Management",
      "parentId": "user-enterprise-and-tenant-management",
      "hierarchyPath": [
        "User, Enterprise, and Tenant Management",
        "Shopping List Commerce Boundary"
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
      "summary": "Why wishlist, compare, and save-for-later belong to Commerce while Profile remains the identity authority.",
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
        "security.identity-access-governance",
        "commerce.cart-order",
        "commerce.payment-provider-boundaries"
      ],
      "sourceEvidence": [
        "../../../../../nodics.docs/data/manifest.json",
        "../../../../../nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js",
        "package.json",
        "src/router/routers.js",
        "src/service/defaultShoppingListOperationService.js",
        "../../package.json",
        "../../../../../nodics.platform/modules/profile/data/init-v001/records/groups/defaultBootstrapUserGroupsData.js",
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
        "shopping-list",
        "wishlist",
        "compare",
        "save-for-later",
        "profile",
        "commerce-boundary",
        "identity"
      ],
      "topicKeywords": [
        "User, Enterprise, and Tenant Management",
        "Customer Data and Identity",
        "Shopping List Commerce Boundary"
      ],
      "headings": [
        {
          "text": "Source map",
          "anchor": "commerceShoppingListCommerceBoundary-1-source-map",
          "level": 2
        },
        {
          "text": "Ownership model",
          "anchor": "commerceShoppingListCommerceBoundary-2-ownership-model",
          "level": 2
        },
        {
          "text": "Contract",
          "anchor": "commerceShoppingListCommerceBoundary-3-contract",
          "level": 2
        },
        {
          "text": "Business configuration guidance",
          "anchor": "commerceShoppingListCommerceBoundary-4-business-configuration-guidance",
          "level": 2
        },
        {
          "text": "Developer extension guidance",
          "anchor": "commerceShoppingListCommerceBoundary-5-developer-extension-guidance",
          "level": 2
        },
        {
          "text": "Extending product-keeping journeys",
          "anchor": "commerceShoppingListCommerceBoundary-6-extending-product-keeping-journeys",
          "level": 2
        },
        {
          "text": "Common mistakes",
          "anchor": "commerceShoppingListCommerceBoundary-7-common-mistakes",
          "level": 2
        },
        {
          "text": "Migration principle",
          "anchor": "commerceShoppingListCommerceBoundary-8-migration-principle",
          "level": 2
        },
        {
          "text": "Verification",
          "anchor": "commerceShoppingListCommerceBoundary-9-verification",
          "level": 2
        },
        {
          "text": "Store context and upgrade behavior",
          "anchor": "commerceShoppingListCommerceBoundary-10-store-context-and-upgrade-behavior",
          "level": 2
        }
      ],
      "blocks": [
        {
          "kind": "paragraph",
          "text": "Shopping List is a Commerce capability for customer shopping-intent lists such as wishlist, compare, and save-for-later. It belongs under Base Commerce because these lists are used across discovery, product cards, cart, checkout, and later channel journeys. Profile remains the authority for person, authentication, permissions, addresses, and organization identity."
        },
        {
          "kind": "paragraph",
          "text": "For beginners, Profile answers \"who is this actor?\" Shopping List answers \"which products has this authenticated shopper intentionally saved for a commerce journey?\""
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Source map",
          "anchor": "commerceShoppingListCommerceBoundary-1-source-map"
        },
        {
          "kind": "table",
          "headers": [
            "Area",
            "Source location"
          ],
          "rows": [
            [
              "Shopping List module",
              "`package.json`"
            ],
            [
              "Shopping List schemas",
              "`src/schemas/schemas.js`"
            ],
            [
              "Shopping List routes",
              "`src/router/routers.js`"
            ],
            [
              "Shopping List service",
              "`src/service/defaultShoppingListOperationService.js`"
            ],
            [
              "Commerce composition",
              "`../../package.json`"
            ],
            [
              "Profile security groups",
              "`../../../../../nodics.platform/modules/profile/data/init-v001/records/groups/defaultBootstrapUserGroupsData.js`"
            ],
            [
              "Agora storefront client",
              "`../../../../../../nodics.exp/nodics.agora.apparel/src/api/commerceClient.ts`"
            ]
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Ownership model",
          "anchor": "commerceShoppingListCommerceBoundary-2-ownership-model"
        },
        {
          "kind": "diagram",
          "language": "mermaid",
          "text": "flowchart LR\n  Profile[\"Profile identity and auth\"] --> Token[\"Authenticated customer token\"]\n  Token --> ShoppingList[\"Commerce Shopping List\"]\n  ShoppingList --> Wishlist[\"Wishlist\"]\n  ShoppingList --> Compare[\"Compare\"]\n  ShoppingList --> SaveForLater[\"Save for later\"]\n  ShoppingList --> Cart[\"Cart and checkout journey\"]\n  ShoppingList --> Storefront[\"Agora product cards and quick actions\"]"
        },
        {
          "kind": "paragraph",
          "text": "The business purpose is simple: a shopper can express purchase intent before checkout without turning Profile into a commerce data store. Wishlist, compare, and save-for-later are not profile preferences; they are commerce actions over products, variants, stores, prices, availability, and storefront context."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Contract",
          "anchor": "commerceShoppingListCommerceBoundary-3-contract"
        },
        {
          "kind": "paragraph",
          "text": "Shopping List records must be owned by Commerce and scoped to the authenticated customer. They may reference customer identity by stable owner code from the auth context, but they must not copy credentials, addresses, permission state, or full Profile payloads."
        },
        {
          "kind": "paragraph",
          "text": "Supported list types are:"
        },
        {
          "kind": "unordered-list",
          "items": [
            "`WISHLIST`",
            "`COMPARE`",
            "`SAVE_FOR_LATER`"
          ]
        },
        {
          "kind": "paragraph",
          "text": "The customer API route family is:"
        },
        {
          "kind": "code",
          "language": "text",
          "text": "GET    /nodics/shoppingList/v0/lists/:listType\nPOST   /nodics/shoppingList/v0/lists/:listType/entries\nDELETE /nodics/shoppingList/v0/lists/:listType/entries/:entryCode"
        },
        {
          "kind": "paragraph",
          "text": "All customer operations require `commerce.shoppingList.own` and must derive the owner from the authenticated customer token, not from browser-supplied owner fields."
        },
        {
          "kind": "code",
          "language": "js",
          "text": "module.exports = {\n  savedTopForLater: {\n    code: 'shoppingList_customer001_SAVE_FOR_LATER_agoraRibbedTankTop',\n    ownerId: 'customer001',\n    listType: 'SAVE_FOR_LATER',\n    productCode: 'agoraRibbedTankTop',\n    variantCode: 'agoraRibbedTankTopIvoryS',\n    storeCode: 'agoraMainStore',\n    locale: 'en',\n    active: true\n  }\n};"
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Business configuration guidance",
          "anchor": "commerceShoppingListCommerceBoundary-4-business-configuration-guidance"
        },
        {
          "kind": "paragraph",
          "text": "Business users should think of Shopping List as reusable commerce behavior that storefront components can expose in different ways:"
        },
        {
          "kind": "unordered-list",
          "items": [
            "Product cards can offer wishlist and compare quick actions.",
            "Quick-view or quick-add panels can add wishlist, compare, and save-for-later.",
            "Cart can offer save-for-later instead of removing an item permanently.",
            "Account pages can show saved products without owning the commerce schema."
          ]
        },
        {
          "kind": "paragraph",
          "text": "Configuration should control limits and supported list types at the commerce module level. Project modules may customize text, placement, and UI behavior, but they should not redefine the underlying owner or route contract."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Developer extension guidance",
          "anchor": "commerceShoppingListCommerceBoundary-5-developer-extension-guidance"
        },
        {
          "kind": "paragraph",
          "text": "Developers may extend Shopping List with recommendation signals, expiration rules, merchandising analytics, stock alerts, or business-specific list types only when the list remains a product-intent list. If a feature groups people for eligibility, segmentation, loyalty, or account buying, it should not be added to Shopping List without a separate commerce capability decision."
        },
        {
          "kind": "paragraph",
          "text": "Safe extension points include:"
        },
        {
          "kind": "unordered-list",
          "items": [
            "list type policy,",
            "maximum item limits,",
            "duplicate/idempotency rules,",
            "product and variant validation,",
            "customer-safe projection fields,",
            "Axis visibility for business support,",
            "storefront component integration."
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Extending product-keeping journeys",
          "anchor": "commerceShoppingListCommerceBoundary-6-extending-product-keeping-journeys"
        },
        {
          "kind": "paragraph",
          "text": "The easiest and safest way to extend Shopping List is to add a new commerce list type when the business need is \"keep these products for a later product journey.\" The module already owns the common mechanics: authenticated owner, product reference, variant reference, store context, locale, idempotent add, bounded list size, read, and remove."
        },
        {
          "kind": "paragraph",
          "text": "Good examples are:"
        },
        {
          "kind": "table",
          "headers": [
            "Use case",
            "Suggested list type",
            "Why it fits Shopping List"
          ],
          "rows": [
            [
              "Save an item from cart for later",
              "`SAVE_FOR_LATER`",
              "The shopper is keeping a product instead of buying now."
            ],
            [
              "Build a comparison set",
              "`COMPARE`",
              "The shopper is keeping a short product set for decision support."
            ],
            [
              "Wishlist future purchases",
              "`WISHLIST`",
              "The shopper is keeping products for later discovery or purchase."
            ],
            [
              "Keep outfit ideas",
              "`OUTFIT_IDEA`",
              "The shopper is grouping product references for a shopping intent."
            ],
            [
              "Keep replenishment candidates",
              "`REPLENISHMENT`",
              "The shopper is remembering products they may buy again."
            ],
            [
              "Keep gift ideas",
              "`GIFT_IDEA`",
              "The shopper is saving product references for a future occasion."
            ]
          ]
        },
        {
          "kind": "paragraph",
          "text": "To add a new product-keeping journey:"
        },
        {
          "kind": "ordered-list",
          "items": [
            "Add the list type to the Shopping List policy, for example `OUTFIT_IDEA`.",
            "Define a clear item limit for that type. Small decision lists such as compare should stay low; open-ended saved lists can be higher.",
            "Reuse the existing customer API route family by passing the new `listType`.",
            "Store only `productCode`, optional `variantCode`, `storeCode`, `locale`, and lightweight intent metadata such as note, source component, or occasion.",
            "Render the journey in the project storefront or Axis using business-managed component text, placement, labels, and icons.",
            "Add contract tests for ownership, idempotency, limit enforcement, and unsupported type rejection."
          ]
        },
        {
          "kind": "code",
          "language": "js",
          "text": "// Example project-level policy extension\nshoppingList: {\n  supportedListTypes: [\n    'WISHLIST',\n    'COMPARE',\n    'SAVE_FOR_LATER',\n    'OUTFIT_IDEA',\n    'GIFT_IDEA'\n  ],\n  maximumWishlistItems: 100,\n  maximumCompareItems: 4,\n  maximumSaveForLaterItems: 100,\n  maximumOutfitIdeaItems: 40,\n  maximumGiftIdeaItems: 60\n}"
        },
        {
          "kind": "paragraph",
          "text": "Do not create a separate module for every saved-product journey unless the journey has a different owner or materially different lifecycle. If it is still an authenticated shopper keeping product references, extend Shopping List."
        },
        {
          "kind": "paragraph",
          "text": "Unsafe extensions include:"
        },
        {
          "kind": "unordered-list",
          "items": [
            "copying Profile credentials or address payloads,",
            "accepting owner identity from browser payloads,",
            "placing Shopping List under Checkout only,",
            "keeping old `customerList` route or permission aliases,",
            "using wishlist as a generic customer segmentation feature."
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Common mistakes",
          "anchor": "commerceShoppingListCommerceBoundary-7-common-mistakes"
        },
        {
          "kind": "unordered-list",
          "items": [
            "Treating wishlist, compare, or save-for-later as Profile data.",
            "Keeping compatibility aliases for `/nodics/customerList/v0`.",
            "Checking list ownership from request payload instead of authenticated token.",
            "Placing Shopping List under Checkout even though product cards and PDP need it before cart or checkout starts.",
            "Forgetting to migrate persisted customer groups to `commerce.shoppingList.own`.",
            "Adding new list types without clear commerce ownership, limits, and idempotency behavior."
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Migration principle",
          "anchor": "commerceShoppingListCommerceBoundary-8-migration-principle"
        },
        {
          "kind": "paragraph",
          "text": "There is no compatibility alias for the old `customerList` boundary. The correct runtime name is `shoppingList`, the correct permission is `commerce.shoppingList.own`, and the correct module owner is Base Commerce."
        },
        {
          "kind": "paragraph",
          "text": "Existing runtime identity records should be reconciled by the Profile identity governance migration APIs so persisted customer groups receive `commerce.shoppingList.own` through an audited change set."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Verification",
          "anchor": "commerceShoppingListCommerceBoundary-9-verification"
        },
        {
          "kind": "paragraph",
          "text": "Production readiness requires these checks:"
        },
        {
          "kind": "unordered-list",
          "items": [
            "Base Commerce loads `shoppingList` before Checkout and order journeys.",
            "The old `checkout/modules/customerList` module is absent.",
            "Customer tokens include `commerce.shoppingList.own`.",
            "Wishlist, compare, and save-for-later add/read/remove calls are owner-scoped.",
            "Agora product cards and quick panels call `/nodics/shoppingList/v0`.",
            "Non-owned list entries cannot be read or mutated.",
            "`npm run test:commerce`, `npm run validate:root`, Agora frontend verify, and live Agora commerce acceptance pass."
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Store context and upgrade behavior",
          "anchor": "commerceShoppingListCommerceBoundary-10-store-context-and-upgrade-behavior"
        },
        {
          "kind": "paragraph",
          "text": "Every list operation supplies an explicit `storeCode`. Read/remove commonly use `?storeCode=duStore`; add-entry supplies `{ \"storeCode\": \"duStore\", \"productCode\": \"productOne\" }`. A different store uses the same module API. Request, payload and query values must agree. The existing Store context service validates identifier shape/agreement; Store master-data access and selling eligibility remain separate owner checks."
        },
        {
          "kind": "paragraph",
          "text": "`shoppingList.customerApi.defaultStoreCode` is no longer consumed. No sample or literal store is chosen when context is absent. Missing, malformed and conflicting context is rejected before list persistence. Configure application choices at the customer boundary and send them explicitly; do not introduce a new resolver layer."
        },
        {
          "kind": "paragraph",
          "text": "Existing tenant/owner/list-type/store identifiers remain unchanged for explicit requests. Reads reuse an owned list only when its stored reference agrees. Missing or contradictory persisted context needs governed repair, not silent reassignment or a guess at the first list. Test independent stores, owner/tenant rejection, missing context, migration references and later-loaded Store validation overrides."
        }
      ],
      "searchText": "Shopping List Commerce Boundary Why wishlist, compare, and save-for-later belong to Commerce while Profile remains the identity authority. # Shopping List Commerce Boundary\n\nShopping List is a Commerce capability for customer shopping-intent lists such as wishlist, compare, and save-for-later. It belongs under Base Commerce because these lists are used across discovery, product cards, cart, checkout, and later channel journeys. Profile remains the authority for person, authentication, permissions, addresses, and organization identity.\n\nFor beginners, Profile answers \"who is this actor?\" Shopping List answers \"which products has this authenticated shopper intentionally saved for a commerce journey?\"\n\n## Source map\n\n| Area | Source location |\n| --- | --- |\n| Shopping List module | `package.json` |\n| Shopping List schemas | `src/schemas/schemas.js` |\n| Shopping List routes | `src/router/routers.js` |\n| Shopping List service | `src/service/defaultShoppingListOperationService.js` |\n| Commerce composition | `../../package.json` |\n| Profile security groups | `../../../../../nodics.platform/modules/profile/data/init-v001/records/groups/defaultBootstrapUserGroupsData.js` |\n| Agora storefront client | `../../../../../../nodics.exp/nodics.agora.apparel/src/api/commerceClient.ts` |\n\n## Ownership model\n\n```mermaid\nflowchart LR\n  Profile[\"Profile identity and auth\"] --> Token[\"Authenticated customer token\"]\n  Token --> ShoppingList[\"Commerce Shopping List\"]\n  ShoppingList --> Wishlist[\"Wishlist\"]\n  ShoppingList --> Compare[\"Compare\"]\n  ShoppingList --> SaveForLater[\"Save for later\"]\n  ShoppingList --> Cart[\"Cart and checkout journey\"]\n  ShoppingList --> Storefront[\"Agora product cards and quick actions\"]\n```\n\nThe business purpose is simple: a shopper can express purchase intent before checkout without turning Profile into a commerce data store. Wishlist, compare, and save-for-later are not profile preferences; they are commerce actions over products, variants, stores, prices, availability, and storefront context.\n\n## Contract\n\nShopping List records must be owned by Commerce and scoped to the authenticated customer. They may reference customer identity by stable owner code from the auth context, but they must not copy credentials, addresses, permission state, or full Profile payloads.\n\nSupported list types are:\n\n- `WISHLIST`\n- `COMPARE`\n- `SAVE_FOR_LATER`\n\nThe customer API route family is:\n\n```text\nGET    /nodics/shoppingList/v0/lists/:listType\nPOST   /nodics/shoppingList/v0/lists/:listType/entries\nDELETE /nodics/shoppingList/v0/lists/:listType/entries/:entryCode\n```\n\nAll customer operations require `commerce.shoppingList.own` and must derive the owner from the authenticated customer token, not from browser-supplied owner fields.\n\n```js\nmodule.exports = {\n  savedTopForLater: {\n    code: 'shoppingList_customer001_SAVE_FOR_LATER_agoraRibbedTankTop',\n    ownerId: 'customer001',\n    listType: 'SAVE_FOR_LATER',\n    productCode: 'agoraRibbedTankTop',\n    variantCode: 'agoraRibbedTankTopIvoryS',\n    storeCode: 'agoraMainStore',\n    locale: 'en',\n    active: true\n  }\n};\n```\n\n## Business configuration guidance\n\nBusiness users should think of Shopping List as reusable commerce behavior that storefront components can expose in different ways:\n\n- Product cards can offer wishlist and compare quick actions.\n- Quick-view or quick-add panels can add wishlist, compare, and save-for-later.\n- Cart can offer save-for-later instead of removing an item permanently.\n- Account pages can show saved products without owning the commerce schema.\n\nConfiguration should control limits and supported list types at the commerce module level. Project modules may customize text, placement, and UI behavior, but they should not redefine the underlying owner or route contract.\n\n## Developer extension guidance\n\nDevelopers may extend Shopping List with recommendation signals, expiration rules, merchandising analytics, stock alerts, or business-specific list types only when the list remains a product-intent list. If a feature groups people for eligibility, segmentation, loyalty, or account buying, it should not be added to Shopping List without a separate commerce capability decision.\n\nSafe extension points include:\n\n- list type policy,\n- maximum item limits,\n- duplicate/idempotency rules,\n- product and variant validation,\n- customer-safe projection fields,\n- Axis visibility for business support,\n- storefront component integration.\n\n## Extending product-keeping journeys\n\nThe easiest and safest way to extend Shopping List is to add a new commerce list type when the business need is \"keep these products for a later product journey.\" The module already owns the common mechanics: authenticated owner, product reference, variant reference, store context, locale, idempotent add, bounded list size, read, and remove.\n\nGood examples are:\n\n| Use case | Suggested list type | Why it fits Shopping List |\n| --- | --- | --- |\n| Save an item from cart for later | `SAVE_FOR_LATER` | The shopper is keeping a product instead of buying now. |\n| Build a comparison set | `COMPARE` | The shopper is keeping a short product set for decision support. |\n| Wishlist future purchases | `WISHLIST` | The shopper is keeping products for later discovery or purchase. |\n| Keep outfit ideas | `OUTFIT_IDEA` | The shopper is grouping product references for a shopping intent. |\n| Keep replenishment candidates | `REPLENISHMENT` | The shopper is remembering products they may buy again. |\n| Keep gift ideas | `GIFT_IDEA` | The shopper is saving product references for a future occasion. |\n\nTo add a new product-keeping journey:\n\n1. Add the list type to the Shopping List policy, for example `OUTFIT_IDEA`.\n2. Define a clear item limit for that type. Small decision lists such as compare should stay low; open-ended saved lists can be higher.\n3. Reuse the existing customer API route family by passing the new `listType`.\n4. Store only `productCode`, optional `variantCode`, `storeCode`, `locale`, and lightweight intent metadata such as note, source component, or occasion.\n5. Render the journey in the project storefront or Axis using business-managed component text, placement, labels, and icons.\n6. Add contract tests for ownership, idempotency, limit enforcement, and unsupported type rejection.\n\n```js\n// Example project-level policy extension\nshoppingList: {\n  supportedListTypes: [\n    'WISHLIST',\n    'COMPARE',\n    'SAVE_FOR_LATER',\n    'OUTFIT_IDEA',\n    'GIFT_IDEA'\n  ],\n  maximumWishlistItems: 100,\n  maximumCompareItems: 4,\n  maximumSaveForLaterItems: 100,\n  maximumOutfitIdeaItems: 40,\n  maximumGiftIdeaItems: 60\n}\n```\n\nDo not create a separate module for every saved-product journey unless the journey has a different owner or materially different lifecycle. If it is still an authenticated shopper keeping product references, extend Shopping List.\n\nUnsafe extensions include:\n\n- copying Profile credentials or address payloads,\n- accepting owner identity from browser payloads,\n- placing Shopping List under Checkout only,\n- keeping old `customerList` route or permission aliases,\n- using wishlist as a generic customer segmentation feature.\n\n## Common mistakes\n\n- Treating wishlist, compare, or save-for-later as Profile data.\n- Keeping compatibility aliases for `/nodics/customerList/v0`.\n- Checking list ownership from request payload instead of authenticated token.\n- Placing Shopping List under Checkout even though product cards and PDP need it before cart or checkout starts.\n- Forgetting to migrate persisted customer groups to `commerce.shoppingList.own`.\n- Adding new list types without clear commerce ownership, limits, and idempotency behavior.\n\n## Migration principle\n\nThere is no compatibility alias for the old `customerList` boundary. The correct runtime name is `shoppingList`, the correct permission is `commerce.shoppingList.own`, and the correct module owner is Base Commerce.\n\nExisting runtime identity records should be reconciled by the Profile identity governance migration APIs so persisted customer groups receive `commerce.shoppingList.own` through an audited change set.\n\n## Verification\n\nProduction readiness requires these checks:\n\n- Base Commerce loads `shoppingList` before Checkout and order journeys.\n- The old `checkout/modules/customerList` module is absent.\n- Customer tokens include `commerce.shoppingList.own`.\n- Wishlist, compare, and save-for-later add/read/remove calls are owner-scoped.\n- Agora product cards and quick panels call `/nodics/shoppingList/v0`.\n- Non-owned list entries cannot be read or mutated.\n- `npm run test:commerce`, `npm run validate:root`, Agora frontend verify, and live Agora commerce acceptance pass.\n\n## Store context and upgrade behavior\n\nEvery list operation supplies an explicit `storeCode`. Read/remove commonly use `?storeCode=duStore`; add-entry supplies `{ \"storeCode\": \"duStore\", \"productCode\": \"productOne\" }`. A different store uses the same module API. Request, payload and query values must agree. The existing Store context service validates identifier shape/agreement; Store master-data access and selling eligibility remain separate owner checks.\n\n`shoppingList.customerApi.defaultStoreCode` is no longer consumed. No sample or literal store is chosen when context is absent. Missing, malformed and conflicting context is rejected before list persistence. Configure application choices at the customer boundary and send them explicitly; do not introduce a new resolver layer.\n\nExisting tenant/owner/list-type/store identifiers remain unchanged for explicit requests. Reads reuse an owned list only when its stored reference agrees. Missing or contradictory persisted context needs governed repair, not silent reassignment or a guess at the first list. Test independent stores, owner/tenant rejection, missing context, migration references and later-loaded Store validation overrides.\n",
      "previous": {
        "title": "Loyalty Wallets, Rewards, and Ledger",
        "route": "/docs/framework/loyalty-wallets-rewards-ledger"
      },
      "next": {
        "title": "NMS Runtime Monitoring",
        "route": "/docs/framework/foundation-nms-runtime-monitoring"
      },
      "source": {
        "repository": "nodics.ai",
        "functionalModule": "nodics.commerce",
        "technicalModule": "shoppingList",
        "owner": "shoppingList",
        "sourcePath": "data/docs-v001/records/documentation/shoppingListDocumentationComponentData.js",
        "path": "data/docs-v001/records/documentation/shoppingListDocumentationComponentData.js",
        "wordCount": 1210,
        "checksum": "c5fd0b2e73214eb1c7c71a7bf330114ff8fd28e5d70e551892b1a75e0dfeffb5"
      },
      "slug": "commerce-shopping-list-commerce-boundary",
      "locale": "en",
      "navigationGroup": "Customer Data and Identity",
      "navigationGroupCode": "customer-data-and-identity",
      "navigationGroupOrder": 10,
      "navigationOrder": 20,
      "references": [
        {
          "documentId": "security.identity-access-governance",
          "owner": "profile"
        },
        {
          "documentId": "commerce.cart-order",
          "owner": "checkoutCore"
        },
        {
          "documentId": "commerce.payment-provider-boundaries",
          "owner": "paymentCore"
        }
      ]
    },
    "active": true
  }
};
