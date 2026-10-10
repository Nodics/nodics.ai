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
    "code": "nodicsDocsSearchnodenodicsdocsnodepageacceleratorsdomaincommercesourcemap",
    "product": "nodicsDocumentationProduct",
    "targetType": "NODE",
    "targetCode": "nodicsDocsNodePageacceleratorsDomainCommerceSourceMap",
    "title": "Domain Commerce Accelerator Source Map",
    "summary": "How domain commerce, electronics product, telco catalog, and telco subscription accelerators extend Commerce without becoming duplicate authorities.",
    "searchText": "Domain Commerce Accelerator Source Map How domain commerce, electronics product, telco catalog, and telco subscription accelerators extend Commerce without becoming duplicate authorities. accelerator domain-commerce electronics telco subscription",
    "keywords": [
      "accelerator",
      "domain-commerce",
      "electronics",
      "telco",
      "subscription"
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
    "code": "nodicsDocsSearchpagenodicsdocsmetadataacceleratorsdomaincommercesourcemap",
    "product": "nodicsDocumentationProduct",
    "targetType": "PAGE",
    "targetCode": "nodicsDocsMetadataacceleratorsDomainCommerceSourceMap",
    "title": "Domain Commerce Accelerator Source Map",
    "summary": "How domain commerce, electronics product, telco catalog, and telco subscription accelerators extend Commerce without becoming duplicate authorities.",
    "searchText": "Domain Commerce Accelerator Source Map How domain commerce, electronics product, telco catalog, and telco subscription accelerators extend Commerce without becoming duplicate authorities. # Domain Commerce Accelerator Source Map\n\nDomain commerce accelerator modules add industry-specific commerce behavior on top of the shared Commerce foundation. They do not replace product, pricing, inventory, search, checkout, or fulfillment authority. Instead, they add domain rules, projections, validation, enrichment, and setup contracts for Apparel, Electronics, Telco, and customer accelerators. For beginners, the accelerator layer answers \"what is special about this industry?\" while Commerce answers \"how does commerce work?\"\n\n## Business problem\n\nThe business problem is faster industry adoption without copying frameworks. An electronics catalogue needs technical attributes and search enrichment. A telco catalogue needs plans, subscriptions, and product constraints. A domain core needs shared industry policies. Business users get an accelerator that feels ready for their market; developers get a clean extension layer; operators still get one production evidence model.\n\n## Source map\n\n| Area | Source location |\n| --- | --- |\n| Accelerator group | `../../package.json` |\n| Domain commerce core | `.` |\n| Electronics product | `../electronics/modules/electronicsProduct` |\n| Telco catalog | `../telco/modules/telcoCatalog` |\n| Telco subscription | `../telco/modules/telcoSubscription` |\n| Agora Apparel authoring | Canonical guide `accelerators.agora-apparel-product-data-authoring` |\n| Commerce data authoring | Canonical guide `commerce.data-authoring-fulfillment` |\n\n## Layering model\n\n```mermaid\nflowchart TD\n  Commerce[\"Commerce foundation\"] --> DomainCore[\"Domain Commerce Core\"]\n  DomainCore --> Electronics[\"Electronics Product\"]\n  DomainCore --> TelcoCatalog[\"Telco Catalog\"]\n  TelcoCatalog --> TelcoSubscription[\"Telco Subscription\"]\n  Commerce --> Agora[\"Agora project data\"]\n```\n\n## Contract\n\nDomain modules can add schemas, validation services, search enrichment, indexes, and industry policies. They should reference shared Commerce objects using stable codes and documented relation fields. They should not copy shared Commerce services or redefine generic product lifecycle rules unless they declare a versioned extension contract.\n\n```js\nconst enrichment = {\n  productCode: 'smartphone001',\n  domainType: 'electronics',\n  searchableAttributes: ['storage', 'screenSize', 'warranty']\n};\n```\n\n## Customization and extension guidance\n\nDevelopers can add an industry module by starting with domain policy, specialized schemas, import records, search enrichment, validation tests, and browser evidence. Business users should see industry-specific workbenches in Axis only after the backend module exposes capability metadata. Operators should see whether a domain accelerator is installed, active, indexed, and compatible with the selected Commerce release.\n\n## Operating rules\n\nEach accelerator release should identify which shared Commerce release it extends, which sample data it contributes, and which search projections or storefront journeys prove the industry behavior. Import data can seed Apparel, Electronics, or Telco examples, but runtime services must still resolve authority from Commerce schemas and domain extension schemas. Axis should show accelerator readiness only after module activation, data import, and indexing evidence agree.\n\nDecision makers should treat accelerators as governed shortcuts, not forks of the platform. The value is reduced project setup time with retained upgrade discipline, source traceability, and consistent production operations.\n\n## Common mistakes\n\n- Copying Commerce product or checkout logic into an accelerator.\n- Treating a search enrichment module as catalogue authority.\n- Adding industry data without import and projection tests.\n- Hiding accelerator readiness behind generic setup messages.\n- Forgetting browser proof for Agora or the relevant storefront.\n\n## Verification\n\nRun domain commerce, electronics product, telco catalogue, and telco subscription tests. Import sample data into a fresh schema, rebuild search projections, open the relevant storefront journey, and confirm industry fields render without breaking shared commerce behavior. Production readiness requires business fit, developer extension clarity, operator readiness evidence, and QA proof across install and upgrade paths.\n\n## Reusable domain composition and actual scope\n\ndomainCommerceCore owns reusable composition policy shared by accelerator domains. Apparel, Electronics and Telco enrich canonical Commerce rather than replacing its Product, monetary, order or customer identity models. The source policy provides money validation, recurring-charge validation and physical versus Telco entry partitioning. It does not save an order, authorize a checkout, reserve stock, charge a payment method or activate a carrier service. A business-facing description must distinguish a compatible proposed bundle from a completed commercial transaction.\n\nvalidateMoney requires a three-uppercase-letter currency and a safe nonnegative integer minorUnits. This is an exact-value shape check rather than currency conversion, price calculation, tax determination or proof that the value matches an approved offer. Consumers retain their canonical pricing authority and currency-scale policy. A zero amount is structurally permitted by this helper, so an application that requires a positive purchase amount must use its owning commercial validation rather than claiming the generic helper rejects zero.\n\n```mermaid\nflowchart LR\n  Entries[Selected domain entries] --> Context[Trusted tenant correlation and idempotency context]\n  Context --> Policy[Domain composition policy]\n  Policy --> Physical[Physical order partition]\n  Policy --> Telco[Telco service-order partition]\n  Physical -. Owning operations required .-> Commerce[Commerce persistence payment and fulfillment]\n  Telco -. Owning operations required .-> Provision[Telco subscription and provider evidence]\n```\n\n## Recurring charges compatibility and partitioning\n\nvalidateRecurringCharge applies the money shape and requires a positive safe-integer intervalCount with cycle DAY, WEEK, MONTH or YEAR. It does not compute bill dates, prorate periods, schedule collection or establish a subscription billing ledger. Business users should approve those policies through the owning subscription and billing behavior. A one-month charge object is not proof that a provider will collect it monthly or that the customer consented to recurring payments.\n\ncompose requires tenant, correlationId and idempotencyKey context. It treats explicit Telco entries separately from other entries, which enter the physical partition. A Telco plan that names deviceProductCode must find a matching physical productCode or the result rejects with TELCO_COMPATIBLE_DEVICE_REQUIRED. An invalid recurring-charge shape rejects with TELCO_RECURRING_CHARGE_INVALID. These checks answer declared compatibility; they do not verify that the device Product exists, that stock is available, that the plan is eligible or that the device can actually attach to a carrier network.\n\nWhen both kinds are present, accepted composition uses SPLIT_COMPATIBLE_BUNDLE. A single kind uses SINGLE_DOMAIN. Physical entries become a PHYSICAL_ORDER partition; Telco entries become TELCO_SERVICE_ORDER with activationRequired true. That flag expresses downstream work, not evidence that activation happened. Empty entries are currently accepted with no partitions, an edge behavior that a checkout caller should validate if an empty purchase is not meaningful. Do not hide this boundary by describing every accepted composition as a sale.\n\n| Input or result | Policy meaning | Not established |\n| --- | --- | --- |\n| Safe integer minorUnits | Exact money shape accepted | Approved price or currency conversion |\n| Valid recurring interval | Supported schedule vocabulary | Billing execution or customer consent |\n| Matching deviceProductCode | Declared bundle compatibility | Inventory or network eligibility |\n| activationRequired true | Telco downstream work needed | Carrier activation complete |\n| Empty entries accepted | No partitions produced | Valid customer checkout |\n\n## Worked accelerator journey and extension\n\nFor a device-plus-plan offer, use one canonical Commerce device product and the Telco plan data that references it. Resolve trusted runtime context and obtain price and eligibility from their owners before calling composition. Inspect the two proposed partitions and present the complete commercial review to the customer. Only the existing Commerce and Telco operations may persist and execute the corresponding journey. Retain a link between their original order evidence without inventing another cross-domain ledger in the accelerator.\n\nThe required idempotency key is context validation here. The pure policy does not persist the key, enforce uniqueness, compare retry payloads or lock concurrent requests. Actual replay safety belongs to the command and persistence owners. Likewise, a correlation identifier links diagnostic evidence but grants no authorization. Partners should extend their project module for local bundle choices and provider integrations, while reusable semantics remain in the implementing framework capability. Do not put offer data in the functional accelerator group or copy shared pricing and stock rules into domain policy.\n\nSearch enrichment is another controlled contribution rather than a second catalogue. Each selected domain contributes supported projection detail through the canonical publication seam, with required-contributor validation exercised by domainSearchEnrichmentContract. Missing a required contribution should remain visible; do not silently publish a generic product card that omits essential plan or specification semantics. Customer frontend applications render the approved projection and do not become a source of compatibility, subscription, payment or inventory truth.\n\n## Verification and acceptance boundary\n\nRun domainCommerceCoreContract and domainSearchEnrichmentContract. Exercise lowercase or malformed currency, fractional and overflowing minor units, unsupported cycles, zero interval count, absent trusted context, incompatible device, invalid recurring charges, single-domain inputs, mixed bundles and empty entries. Then qualify the real caller for authentication, price and stock revalidation, durable idempotency, order persistence and actual Telco provider results. A pure accepted result is source-level evidence only. Documentation imports remain optional and must not create an offer, device product or service order. Cross-reference the Electronics, Telco and shared Commerce guides instead of duplicating their detailed implementation bodies.\n\nAn acceptance record should name the selected domain modules, effective configuration revision, exact input codes and original command receipts. Show a safe customer summary of both partitions, then inspect the independent persisted order and service-order outcomes. If one succeeds and the other is uncertain, do not mark the whole bundle complete or retry both operations together. The command owners must define reconciliation and compensation, with customer communication reflecting the known state. Keep payment uncertainty separate from carrier uncertainty. A screenshot of a combined checkout page is useful UI evidence, but it cannot substitute for either original backend outcome or demonstrate atomic cross-domain completion.\n",
    "keywords": [
      "accelerator",
      "domain-commerce",
      "electronics",
      "telco",
      "subscription",
      "Accelerators and Industry Solution Templates",
      "Agora Accelerator Family",
      "Domain Commerce Accelerator Source Map"
    ],
    "facets": {
      "section": "accelerators-and-industry-solution-templates",
      "group": "accelerators-and-industry-solution-templates",
      "navigationDepth": 2,
      "documentType": "reference",
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
