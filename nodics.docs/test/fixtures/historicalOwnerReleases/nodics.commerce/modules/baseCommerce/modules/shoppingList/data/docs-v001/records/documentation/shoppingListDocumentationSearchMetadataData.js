/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @description Generated Nodics framework documentation search metadata. */
module.exports = {
  "record0": {
    "code": "nodicsDocsSearchnodenodicsdocsnodepagecommerceshoppinglistcommerceboundary",
    "product": "nodicsDocumentationProduct",
    "targetType": "NODE",
    "targetCode": "nodicsDocsNodePagecommerceShoppingListCommerceBoundary",
    "title": "Shopping List Commerce Boundary",
    "summary": "Why wishlist, compare, and save-for-later belong to Commerce while Profile remains the identity authority.",
    "searchText": "Shopping List Commerce Boundary Why wishlist, compare, and save-for-later belong to Commerce while Profile remains the identity authority. shopping-list wishlist compare save-for-later profile commerce-boundary identity",
    "keywords": [
      "shopping-list",
      "wishlist",
      "compare",
      "save-for-later",
      "profile",
      "commerce-boundary",
      "identity"
    ],
    "facets": {
      "nodeLevel": "PAGE_LINK",
      "nodeType": "PAGE",
      "audience": [
        "business",
        "architect",
        "administrator",
        "developer",
        "operator",
        "qa",
        "ai-tool"
      ]
    },
    "managedInAxis": true,
    "axisAuthoringPermissions": [
      "documentation.search.preview"
    ],
    "workflowRequired": true,
    "workflowTriggers": [
      "SEARCH_METADATA_CHANGE"
    ],
    "locale": "en",
    "channel": "web",
    "accessPolicy": "nodicsDocsAccessPublic",
    "accessMode": "PUBLIC",
    "lifecycleState": "ONLINE",
    "indexState": "INDEX_READY",
    "active": true
  },
  "record1": {
    "code": "nodicsDocsSearchpagenodicsdocsmetadatacommerceshoppinglistcommerceboundary",
    "product": "nodicsDocumentationProduct",
    "targetType": "PAGE",
    "targetCode": "nodicsDocsMetadatacommerceShoppingListCommerceBoundary",
    "title": "Shopping List Commerce Boundary",
    "summary": "Why wishlist, compare, and save-for-later belong to Commerce while Profile remains the identity authority.",
    "searchText": "Shopping List Commerce Boundary Why wishlist, compare, and save-for-later belong to Commerce while Profile remains the identity authority. # Shopping List Commerce Boundary\n\nShopping List is a Commerce capability for customer shopping-intent lists such as wishlist, compare, and save-for-later. It belongs under Base Commerce because these lists are used across discovery, product cards, cart, checkout, and later channel journeys. Profile remains the authority for person, authentication, permissions, addresses, and organization identity.\n\nFor beginners, Profile answers \"who is this actor?\" Shopping List answers \"which products has this authenticated shopper intentionally saved for a commerce journey?\"\n\n## Source map\n\n| Area | Source location |\n| --- | --- |\n| Shopping List module | `package.json` |\n| Shopping List schemas | `src/schemas/schemas.js` |\n| Shopping List routes | `src/router/routers.js` |\n| Shopping List service | `src/service/defaultShoppingListOperationService.js` |\n| Commerce composition | `../../package.json` |\n| Profile security groups | `../../../../../nodics.platform/modules/profile/data/init-v001/records/groups/defaultBootstrapUserGroupsData.js` |\n| Agora storefront client | `../../../../../../nodics.exp/nodics.agora.apparel/src/api/commerceClient.ts` |\n\n## Ownership model\n\n```mermaid\nflowchart LR\n  Profile[\"Profile identity and auth\"] --> Token[\"Authenticated customer token\"]\n  Token --> ShoppingList[\"Commerce Shopping List\"]\n  ShoppingList --> Wishlist[\"Wishlist\"]\n  ShoppingList --> Compare[\"Compare\"]\n  ShoppingList --> SaveForLater[\"Save for later\"]\n  ShoppingList --> Cart[\"Cart and checkout journey\"]\n  ShoppingList --> Storefront[\"Agora product cards and quick actions\"]\n```\n\nThe business purpose is simple: a shopper can express purchase intent before checkout without turning Profile into a commerce data store. Wishlist, compare, and save-for-later are not profile preferences; they are commerce actions over products, variants, stores, prices, availability, and storefront context.\n\n## Contract\n\nShopping List records must be owned by Commerce and scoped to the authenticated customer. They may reference customer identity by stable owner code from the auth context, but they must not copy credentials, addresses, permission state, or full Profile payloads.\n\nSupported list types are:\n\n- `WISHLIST`\n- `COMPARE`\n- `SAVE_FOR_LATER`\n\nThe customer API route family is:\n\n```text\nGET    /nodics/shoppingList/v0/lists/:listType\nPOST   /nodics/shoppingList/v0/lists/:listType/entries\nDELETE /nodics/shoppingList/v0/lists/:listType/entries/:entryCode\n```\n\nAll customer operations require `commerce.shoppingList.own` and must derive the owner from the authenticated customer token, not from browser-supplied owner fields.\n\n```js\nmodule.exports = {\n  savedTopForLater: {\n    code: 'shoppingList_customer001_SAVE_FOR_LATER_agoraRibbedTankTop',\n    ownerId: 'customer001',\n    listType: 'SAVE_FOR_LATER',\n    productCode: 'agoraRibbedTankTop',\n    variantCode: 'agoraRibbedTankTopIvoryS',\n    storeCode: 'agoraMainStore',\n    locale: 'en',\n    active: true\n  }\n};\n```\n\n## Business configuration guidance\n\nBusiness users should think of Shopping List as reusable commerce behavior that storefront components can expose in different ways:\n\n- Product cards can offer wishlist and compare quick actions.\n- Quick-view or quick-add panels can add wishlist, compare, and save-for-later.\n- Cart can offer save-for-later instead of removing an item permanently.\n- Account pages can show saved products without owning the commerce schema.\n\nConfiguration should control limits and supported list types at the commerce module level. Project modules may customize text, placement, and UI behavior, but they should not redefine the underlying owner or route contract.\n\n## Developer extension guidance\n\nDevelopers may extend Shopping List with recommendation signals, expiration rules, merchandising analytics, stock alerts, or business-specific list types only when the list remains a product-intent list. If a feature groups people for eligibility, segmentation, loyalty, or account buying, it should not be added to Shopping List without a separate commerce capability decision.\n\nSafe extension points include:\n\n- list type policy,\n- maximum item limits,\n- duplicate/idempotency rules,\n- product and variant validation,\n- customer-safe projection fields,\n- Axis visibility for business support,\n- storefront component integration.\n\n## Extending product-keeping journeys\n\nThe easiest and safest way to extend Shopping List is to add a new commerce list type when the business need is \"keep these products for a later product journey.\" The module already owns the common mechanics: authenticated owner, product reference, variant reference, store context, locale, idempotent add, bounded list size, read, and remove.\n\nGood examples are:\n\n| Use case | Suggested list type | Why it fits Shopping List |\n| --- | --- | --- |\n| Save an item from cart for later | `SAVE_FOR_LATER` | The shopper is keeping a product instead of buying now. |\n| Build a comparison set | `COMPARE` | The shopper is keeping a short product set for decision support. |\n| Wishlist future purchases | `WISHLIST` | The shopper is keeping products for later discovery or purchase. |\n| Keep outfit ideas | `OUTFIT_IDEA` | The shopper is grouping product references for a shopping intent. |\n| Keep replenishment candidates | `REPLENISHMENT` | The shopper is remembering products they may buy again. |\n| Keep gift ideas | `GIFT_IDEA` | The shopper is saving product references for a future occasion. |\n\nTo add a new product-keeping journey:\n\n1. Add the list type to the Shopping List policy, for example `OUTFIT_IDEA`.\n2. Define a clear item limit for that type. Small decision lists such as compare should stay low; open-ended saved lists can be higher.\n3. Reuse the existing customer API route family by passing the new `listType`.\n4. Store only `productCode`, optional `variantCode`, `storeCode`, `locale`, and lightweight intent metadata such as note, source component, or occasion.\n5. Render the journey in the project storefront or Axis using business-managed component text, placement, labels, and icons.\n6. Add contract tests for ownership, idempotency, limit enforcement, and unsupported type rejection.\n\n```js\n// Example project-level policy extension\nshoppingList: {\n  supportedListTypes: [\n    'WISHLIST',\n    'COMPARE',\n    'SAVE_FOR_LATER',\n    'OUTFIT_IDEA',\n    'GIFT_IDEA'\n  ],\n  maximumWishlistItems: 100,\n  maximumCompareItems: 4,\n  maximumSaveForLaterItems: 100,\n  maximumOutfitIdeaItems: 40,\n  maximumGiftIdeaItems: 60\n}\n```\n\nDo not create a separate module for every saved-product journey unless the journey has a different owner or materially different lifecycle. If it is still an authenticated shopper keeping product references, extend Shopping List.\n\nUnsafe extensions include:\n\n- copying Profile credentials or address payloads,\n- accepting owner identity from browser payloads,\n- placing Shopping List under Checkout only,\n- keeping old `customerList` route or permission aliases,\n- using wishlist as a generic customer segmentation feature.\n\n## Common mistakes\n\n- Treating wishlist, compare, or save-for-later as Profile data.\n- Keeping compatibility aliases for `/nodics/customerList/v0`.\n- Checking list ownership from request payload instead of authenticated token.\n- Placing Shopping List under Checkout even though product cards and PDP need it before cart or checkout starts.\n- Forgetting to migrate persisted customer groups to `commerce.shoppingList.own`.\n- Adding new list types without clear commerce ownership, limits, and idempotency behavior.\n\n## Migration principle\n\nThere is no compatibility alias for the old `customerList` boundary. The correct runtime name is `shoppingList`, the correct permission is `commerce.shoppingList.own`, and the correct module owner is Base Commerce.\n\nExisting runtime identity records should be reconciled by the Profile identity governance migration APIs so persisted customer groups receive `commerce.shoppingList.own` through an audited change set.\n\n## Verification\n\nProduction readiness requires these checks:\n\n- Base Commerce loads `shoppingList` before Checkout and order journeys.\n- The old `checkout/modules/customerList` module is absent.\n- Customer tokens include `commerce.shoppingList.own`.\n- Wishlist, compare, and save-for-later add/read/remove calls are owner-scoped.\n- Agora product cards and quick panels call `/nodics/shoppingList/v0`.\n- Non-owned list entries cannot be read or mutated.\n- `npm run test:commerce`, `npm run validate:root`, Agora frontend verify, and live Agora commerce acceptance pass.\n\n## Store context and upgrade behavior\n\nEvery list operation supplies an explicit `storeCode`. Read/remove commonly use `?storeCode=duStore`; add-entry supplies `{ \"storeCode\": \"duStore\", \"productCode\": \"productOne\" }`. A different store uses the same module API. Request, payload and query values must agree. The existing Store context service validates identifier shape/agreement; Store master-data access and selling eligibility remain separate owner checks.\n\n`shoppingList.customerApi.defaultStoreCode` is no longer consumed. No sample or literal store is chosen when context is absent. Missing, malformed and conflicting context is rejected before list persistence. Configure application choices at the customer boundary and send them explicitly; do not introduce a new resolver layer.\n\nExisting tenant/owner/list-type/store identifiers remain unchanged for explicit requests. Reads reuse an owned list only when its stored reference agrees. Missing or contradictory persisted context needs governed repair, not silent reassignment or a guess at the first list. Test independent stores, owner/tenant rejection, missing context, migration references and later-loaded Store validation overrides.\n",
    "keywords": [
      "shopping-list",
      "wishlist",
      "compare",
      "save-for-later",
      "profile",
      "commerce-boundary",
      "identity",
      "User, Enterprise, and Tenant Management",
      "Customer Data and Identity",
      "Shopping List Commerce Boundary"
    ],
    "facets": {
      "section": "user-enterprise-and-tenant-management",
      "group": "user-enterprise-and-tenant-management",
      "navigationDepth": 2,
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
      "maturityState": "operational"
    },
    "managedInAxis": true,
    "axisAuthoringPermissions": [
      "documentation.search.preview"
    ],
    "workflowRequired": true,
    "workflowTriggers": [
      "SEARCH_METADATA_CHANGE"
    ],
    "locale": "en",
    "channel": "web",
    "accessPolicy": "nodicsDocsAccessPublic",
    "accessMode": "PUBLIC",
    "lifecycleState": "ONLINE",
    "indexState": "INDEX_READY",
    "active": true
  }
};
