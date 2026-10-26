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
    "code": "nodicsDocsSearchnodenodicsdocsnodepageacceleratorsagoraindustrytemplates",
    "product": "nodicsDocumentationProduct",
    "targetType": "NODE",
    "targetCode": "nodicsDocsNodePageacceleratorsAgoraIndustryTemplates",
    "title": "Accelerators and Industry Solution Templates",
    "summary": "Agora accelerator family overview for Apparel, Electronics, and Telco customer commerce storefronts.",
    "searchText": "Accelerators and Industry Solution Templates Agora accelerator family overview for Apparel, Electronics, and Telco customer commerce storefronts. accelerators industry-solution-templates agora-apparel agora-electronics agora-telco",
    "keywords": [
      "accelerators",
      "industry-solution-templates",
      "agora-apparel",
      "agora-electronics",
      "agora-telco"
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
    "code": "nodicsDocsSearchpagenodicsdocsmetadataacceleratorsagoraindustrytemplates",
    "product": "nodicsDocumentationProduct",
    "targetType": "PAGE",
    "targetCode": "nodicsDocsMetadataacceleratorsAgoraIndustryTemplates",
    "title": "Accelerators and Industry Solution Templates",
    "summary": "Agora accelerator family overview for Apparel, Electronics, and Telco customer commerce storefronts.",
    "searchText": "Accelerators and Industry Solution Templates Agora accelerator family overview for Apparel, Electronics, and Telco customer commerce storefronts. # Accelerators and Industry Solution Templates\n\nAccelerators and Industry Solution Templates are customer-facing starting points built with Nodics capabilities. They help a team move faster without hiding the framework contracts underneath. Beginners should read this page before treating an accelerator as a product, because the accelerator is a packaged reference application pattern, not the owner of catalog, checkout, payment, fulfillment, content, identity, or publication logic.\n\n## Business perspective\n\nThe framework product catalogue also includes Waste Management showcased through [Circa](/docs/framework/accelerators/circa). Its detailed guide separates data/network configuration, submission, operations/rewards, coupon commerce, customization and deployment. That is the documentation depth pattern for further Agora product topics; it does not make Circa a Commerce domain accelerator or move customer-owned data into the framework. Product positioning and implementation ownership remain distinct.\n\nAgora is the accelerator application family for commerce experiences. The current split is intentionally domain-specific: Agora Apparel, Agora Electronics, and Agora Telco. Each application gives an implementation partner a focused storefront pattern, test contract, visual journey, and integration shape that can be adapted for a customer. The value is faster time to market: business teams can begin with a working journey, inspect how products and content flow from backend data, and then customize only the areas that differentiate their brand or industry.\n\n| Accelerator | Business fit | Starting journey | Expected customization |\n| --- | --- | --- | --- |\n| Agora Apparel | Fashion, apparel, accessories, collections, campaign-led commerce | Home, collection, product detail, cart, checkout, order history | Size and fit rules, seasonal campaigns, editorial content, return reasons |\n| Agora Electronics | Devices, accessories, specifications, warranty-led commerce | Home, category discovery, product detail, cart, checkout, order status | Specification comparison, warranty content, compatibility rules, pickup or delivery options |\n| Agora Telco | Plans, bundles, devices, service activation, account-led commerce | Home, plan/device selection, bundle review, checkout, order lifecycle | Plan eligibility, contract terms, activation flows, customer verification |\n\nThe accelerator group gives business users a place to understand what can be reused and what must still be owned by the customer project. It also gives developers a clean source map: frontend presentation belongs to each Agora app, business data belongs to backend content and commerce data packs, and rules stay in the owning framework modules or project-layer extensions.\n\n## Accelerator flow\n\n```mermaid\nflowchart TD\n  Backend[Kickoff or customer backend] --> Online[Published Online catalog and content]\n  Online --> Apparel[Agora Apparel storefront]\n  Online --> Electronics[Agora Electronics storefront]\n  Online --> Telco[Agora Telco storefront]\n  Apparel --> Checkout[Commerce checkout APIs]\n  Electronics --> Checkout\n  Telco --> Checkout\n  Checkout --> Orders[Order lifecycle and customer service]\n  Orders --> Axis[Axis operations and evidence]\n```\n\nThe same business journey can be inspected from several directions. A merchandiser sees content, products, media, price, and availability. A developer sees API clients, renderer contracts, cart state, checkout validation, payment-result handling, and test coverage. An operator sees backend health, publication state, data-import status, and order lifecycle evidence.\n\n## Technical perspective\n\nThe concrete frontend applications are `nodics.agora.apparel`, `nodics.agora.electronics`, and `nodics.agora.telco`. Those identifiers belong in technical source maps and repository references, not in the primary business navigation label. The business-facing documentation should call them Agora Apparel, Agora Electronics, and Agora Telco.\n\nEach accelerator consumes content, catalog, pricing, inventory, media, checkout, payment, fulfillment, engagement, and order lifecycle contracts from the backend. The storefront should not copy backend rules into React components. When a customer needs a different pricing rule, inventory availability rule, content slot, checkout step, payment provider, carrier, or return policy, the implementation should update the owning backend module or project-layer extension and then verify the storefront rendering against that published behavior.\n\n## Customization and extension\n\nAccelerators should be customized through three layers:\n\n| Layer | What changes here | What should not change here |\n| --- | --- | --- |\n| Backend project data | Products, categories, content, media, prices, inventory, markets, sites, publication state | Frontend-only business truth |\n| Project backend extension | Schemas, services, providers, events, pipelines, validations, policies | Vendor framework source |\n| Agora frontend app | Presentation, responsive behavior, renderer mapping, browser state, accessibility, tests | Commerce ownership, payment authority, tenant policy |\n\nThis separation allows a customer to replace local data with staged/online data, change providers, or add a new domain app without corrupting framework upgrade paths. It also makes the documentation useful for AI tools: each page must state what the accelerator owns, what it consumes, and where a generated or manual change should be made.\n\n## Publication and visibility\n\nAccelerator documentation belongs under this group in the published documentation hierarchy. Public overview pages can be visible in Nexus after Online approval. Implementation details that expose internal environment, operator, or partner-only behavior should use authenticated or permission-based access and appear through Axis. When new accelerator domains are added, they should be added as new child topics in this group with source-backed catalogue metadata, diagrams, customization tables, validation steps, and links to the owning Commerce, WCMS, Search, Payment, Shipping, Order Management, and Engagement topics.\n\n## Common mistakes\n\n- Calling Agora a single generic application after the domain split. The correct documentation shape is an accelerator family with Apparel, Electronics, Telco, and later domain templates.\n- Letting the storefront own commerce rules. The frontend presents the journey; backend modules and project extensions own business decisions.\n- Copying sample data into a component because it is faster. Data should come from backend APIs or safe development fixtures, with clear test-only boundaries.\n- Forgetting business readers. A useful accelerator page explains the revenue path, operating model, and customization impact before it lists files.\n\n## Verification\n\nVerify this topic by checking that the three active storefront repositories exist under `nodics.exp` and that their package names are `nodics.agora.apparel`, `nodics.agora.electronics`, and `nodics.agora.telco`. In each app, run the local verification command when changing presentation contracts. In `nodics.docs`, run `npm run docs:check` and `npm run validate` to prove the accelerator page is in the backend documentation catalogue and validates the declared module-owned CMS records, hierarchy nodes, dashboard data, access policy, publication state, and search metadata without generating a second prose source.\n\n## Active Accelerator Coverage\n\nThe accelerator family now has three active application templates. They share the Nodics Commerce, WCMS, Search, Media, Localization, Payment, Fulfillment, Order, and Engagement documentation, but each accelerator should add its own domain page when its data, UI, or operating model becomes distinct enough for business users.\n\n```mermaid\nflowchart LR\n  Framework[\"Nodics Framework\"] --> Apparel[\"Agora Apparel\"]\n  Framework --> Electronics[\"Agora Electronics\"]\n  Framework --> Telco[\"Agora Telco\"]\n  Apparel --> Commerce[\"Commerce capability docs\"]\n  Electronics --> Discovery[\"Discovery and media docs\"]\n  Telco --> Customer[\"Customer onboarding and engagement docs\"]\n```\n\n| Accelerator | Business focus | Documentation references |\n| --- | --- | --- |\n| Agora Apparel | Apparel storefront, category browsing, product detail, media-rich merchandising, cart, checkout, returns. | Product Catalog, WCMS, Media, Pricing, Inventory, Cart/Checkout, Orders, Returns. |\n| Agora Electronics | Electronics catalog, specifications, search facets, recommendations, warranty-style data, checkout and fulfillment. | Product Catalog, Discovery, Media, Pricing, Shipping/Fulfillment, Reviews. |\n| Agora Telco | Plans, devices, offers, customer onboarding, service-style fulfillment, support, and engagement. | Catalog, Pricing/Promotion, Identity, Checkout, Process, Communication, Engagement. |\n\nThe accelerator documentation must stay honest about ownership: the accelerator presents and composes journeys; backend modules and project extensions own business data and decisions. A storefront screenshot or UI component is useful evidence, but it cannot replace schema, API, data-pack, publication, and validation evidence.\n",
    "keywords": [
      "accelerators",
      "industry-solution-templates",
      "agora-apparel",
      "agora-electronics",
      "agora-telco",
      "Accelerators and Industry Solution Templates",
      "Agora Apparel",
      "Agora Electronics",
      "Agora Telco"
    ],
    "facets": {
      "section": "accelerators-and-industry-solution-templates",
      "group": "accelerators-and-industry-solution-templates",
      "navigationDepth": 2,
      "documentType": "overview",
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
  },
  "record2": {
    "code": "nodicsDocsSearchnodenodicsdocsnodepagecommerceoverview",
    "product": "nodicsDocumentationProduct",
    "targetType": "NODE",
    "targetCode": "nodicsDocsNodePagecommerceOverview",
    "title": "Commerce overview",
    "summary": "Beginner orientation to the Commerce journey, ownership map, capability state, security baseline, verification, and safe customization.",
    "searchText": "Commerce overview Beginner orientation to the Commerce journey, ownership map, capability state, security baseline, verification, and safe customization. commerce-cart-and-checkout commerce-journey-overview commerce-overview",
    "keywords": [
      "commerce-cart-and-checkout",
      "commerce-journey-overview",
      "commerce-overview"
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
  "record3": {
    "code": "nodicsDocsSearchpagenodicsdocsmetadatacommerceoverview",
    "product": "nodicsDocumentationProduct",
    "targetType": "PAGE",
    "targetCode": "nodicsDocsMetadatacommerceOverview",
    "title": "Commerce overview",
    "summary": "Beginner orientation to the Commerce journey, ownership map, capability state, security baseline, verification, and safe customization.",
    "searchText": "Commerce overview Beginner orientation to the Commerce journey, ownership map, capability state, security baseline, verification, and safe customization. # Commerce overview\n\n## What Commerce is\n\nNodics Commerce is the backend product family that turns product information, commercial policy, stock, checkout, orders, payments, and fulfillment into one governed customer journey. The product provides framework contracts, schemas, services, secured routes, reference runtime, Axis projections, operations evidence, migration controls, and canonical documentation. This is framework readiness, not automatic production authorization: every deployment must still qualify its providers, capacity, recovery, data, policy, and owners.\n\nA beginner can picture the journey as:\n\n1. Store decides the selling context.\n2. Product identifies what can be sold.\n3. Pricing, Promotion, and Tax produce exact monetary evidence.\n4. Inventory determines availability and protects stock.\n5. Cart collects intent and Checkout coordinates validation.\n6. Order records the durable purchase.\n7. Payment executes money movement through an approved provider.\n8. Fulfillment moves goods and records delivery evidence.\n\nThese are collaborating owners, not interchangeable layers. Checkout may coordinate them, but it cannot silently become the authority for prices, inventory, payment, or shipment state.\n\n| Journey step | Owning capability | Durable evidence |\n| --- | --- | --- |\n| Select selling context | Store | store and channel reference |\n| Understand the offer | Product | product and sellable-unit identity |\n| Calculate the commercial promise | Pricing, Promotion, Tax | exact price, discount, and tax decisions |\n| Protect supply | Inventory | availability, reservation, allocation, and movement |\n| Commit a purchase | Cart, Checkout, Order | calculated cart and immutable order history |\n| Move money | Payment | authorization, capture, void, refund, and reconciliation |\n| Move goods | Fulfillment | consignment, shipment, tracking, and return logistics |\n\n## Module map\n\nThe public functional identity is `nodics.commerce`, displayed as Commerce in BackOffice and Axis. Its internal groups are Base Commerce, Checkout, Payment, and Fulfillment. Their concrete capability modules remain technical details; customers register and discover the functional product, not 26 unrelated products.\n\nThe product comprises 27 package identities: the functional group, six internal composition groups, and twenty concrete capabilities. Every identity uses the reserved `70.x` index family. Group packages compose; they do not own business schemas, services, routes, or seed data.\n\n## Choose your documentation journey\n\nThis documentation follows the progressive structure used by mature enterprise products: orient first, complete a business journey next, then learn extension and operations. New readers should not start from generated API details.\n\n1. Read this overview for vocabulary, ownership, and safety boundaries.\n2. Read **Base Commerce foundations** to configure Store, Product, price, tax, promotion, warehouse, availability, publication, and search evidence.\n3. Read **Cart, checkout, and order placement** for the customer purchase path, retry behavior, exact calculation, and compensation.\n4. Read **Payment and fulfillment operations** before enabling any provider or operating warehouse and shipment work.\n5. Read **Cancellation, return, and refund lifecycle** for self-service, operator queues, approval, inspection, refund, and reconciliation.\n6. Read **Commerce enterprise operations and migration** before sizing, upgrading, migrating a tenant, rehearsing recovery, or releasing.\n7. Developers then follow the owning module README/AGENTS hierarchy and generated OpenAPI/schema contracts. Operators use Axis and the runbooks; customers see only the permitted self-service projections.\n\nEach guide repeats the same learning pattern: business outcome, customer or operator journey, owner boundary, data/evidence, security, failure/recovery, extension points, common mistakes, and verification. This lets a beginner build a dependable mental model while giving an experienced implementer a direct path to contracts and release evidence.\n\nOfficial SAP Commerce Cloud and Oracle Commerce documentation links are kept as industry-standard reference points for enterprise reader expectations around commerce adoption, administration, integration, security, storefronts, and support. They are not source designs for Nodics. Nodics keeps its own ownership vocabulary, module boundaries, release gates, failure handling, recovery model, and evidence contracts.\n\n- SAP Commerce Cloud: <https://help.sap.com/docs/SAP_COMMERCE_CLOUD_PUBLIC_CLOUD>\n- Oracle Commerce: <https://docs.oracle.com/en/cloud/saas/cx-commerce/>\n\n## Current implementation state\n\nThe documented framework contracts and controls are implemented, while environment-specific load, soak, provider, backup/restore, failover, and RPO/RTO qualification remain release gates. Archived Commerce is not an active runtime authority; final alias removal and physical retirement wait for each production tenant's reconciliation and rollback-window closure.\n\n## Safe customization\n\nA customer project may extend `nodics.commerce` while keeping the standard functional identity. Put customer rules in a later-loading customer module; do not copy or edit framework packages. Replace narrow services or provider ports through supported Nodics layering and keep the original domain owner.\n\nExamples:\n\n- a regional tax adapter extends Tax, not Cart;\n- a new payment provider extends Payment Providers, not Order;\n- a store-specific availability rule composes Inventory evidence;\n- a branded Axis screen renders backend contracts but does not own statuses or lifecycle rules.\n\n## Security and evidence baseline\n\nAll Commerce slices added to the framework must enforce tenant isolation, authenticated audiences, least-privilege permissions, idempotency, audit trails, protected data handling, and exact money and quantity representations. Provider secrets must never enter schemas, logs, browser payloads, documentation, or generated context.\n\n## How to verify the implementation\n\nFrom the framework root, run the Commerce composition and source-free contract tests, module metadata validation, structure audit, then generate and validate LLM context. The proof must show all package indexes are unique, composition is deterministic, and no Commerce package contains premature `src/` or `data/`.\n\nDevelopers should start from the concrete owner README and contracts before adding code. A schema belongs with the domain that controls its lifecycle; a coordinating service calls that owner instead of recreating its decisions. Tests should cover the successful path, rejection, tenant isolation, idempotent replay, dependency failure, recovery, and a later-layer override.\n\nOperators and DevOps teams should treat module discovery as readiness metadata, not as proof that a customer-facing API is safe to expose. Production activation requires the applicable release-acceptance evidence, secured permissions, observable health, capacity budgets, rollback instructions, and validated provider configuration. A provider package is not production-ready merely because the module loader can see it.\n\n## Common mistakes\n\n- Treating every internal module as a separate BackOffice product.\n- Adding Cart-owned price arithmetic or Order-owned refund execution.\n- Using JavaScript floating-point values for money, rates, or quantities.\n- Copying archived source before classifying its ownership and maturity.\n- Enabling a provider without callback verification, replay protection, idempotency, redaction, reconciliation, and failure recovery.\n- Putting backend statuses, permissions, navigation records, or business rules into Axis.\n- Bypassing CMS release integrity or editing generated schema artifacts instead of their owning source.\n\n## Verification\n\nFramework acceptance requires the 27-package composition contract, generated schema tests, focused owner and workflow tests, a controlled effective runtime graph, generated OpenAPI/security checks, Axis journey/type/build checks, documentation generation and validation, generated LLM context, metadata and structure audits, and an explicit release-readiness record. External provider certification, representative production load, disaster recovery, regulatory approval, tenant cutover, and residual-risk acceptance remain deployment evidence and must never be inferred from framework tests.\n",
    "keywords": [
      "commerce-cart-and-checkout",
      "commerce-journey-overview",
      "commerce-overview",
      "Commerce, Cart, and Checkout",
      "Commerce Journey Overview",
      "Commerce overview"
    ],
    "facets": {
      "section": "commerce-cart-and-checkout",
      "group": "commerce-cart-and-checkout",
      "navigationDepth": 2,
      "documentType": "overview",
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
  },
  "record4": {
    "code": "nodicsDocsSearchnodenodicsdocsnodepagecommercebasefoundations",
    "product": "nodicsDocumentationProduct",
    "targetType": "NODE",
    "targetCode": "nodicsDocsNodePagecommerceBaseFoundations",
    "title": "Base Commerce foundations",
    "summary": "Beginner-to-operator guide for Store, Product, Pricing, Tax, Promotion, Inventory, exact decisions, publication, recovery, and customization.",
    "searchText": "Base Commerce foundations Beginner-to-operator guide for Store, Product, Pricing, Tax, Promotion, Inventory, exact decisions, publication, recovery, and customization. store-market-site-and-channel-management commerce-foundations base-commerce-foundations",
    "keywords": [
      "store-market-site-and-channel-management",
      "commerce-foundations",
      "base-commerce-foundations"
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
  "record5": {
    "code": "nodicsDocsSearchnodenodicsdocsnodepagecommercedataauthoringfulfillment",
    "product": "nodicsDocumentationProduct",
    "targetType": "NODE",
    "targetCode": "nodicsDocsNodePagecommerceDataAuthoringFulfillment",
    "title": "Commerce Data Authoring and Fulfillment",
    "summary": "How product, category, price, inventory, search, order, fulfillment, return, and refund data are authored, imported, published, and verified.",
    "searchText": "Commerce Data Authoring and Fulfillment How product, category, price, inventory, search, order, fulfillment, return, and refund data are authored, imported, published, and verified. Opening intake, Checkout holds and physical returns are distinct Catalog publication, first intake, Checkout reservation and physical return are different operations. Publishing Product/price/warehouse policy establishes retained rules, not live stock. An explicit Inventory opening contribution atomically creates first balance, RECEIPT movement and private receipt per instruction. Replay verifies original intake without replenishing consumed units. Checkout uses the separate atomic reservation owner; Cart availability does not reserve. Product/price/policy publication Normal Staged capture, review, approval and activated Store delivery. No live balances, budget consumption or coupon issuance. Opening intake Atomic first balance/movement/original receipt per instruction. Not a whole-pack transaction; never replace existing stock. Checkout physical acquire/release Atomic available/reserved, hold and movement through qualified generated transactions. Uncertain acknowledgement stays COMPENSATION_REQUIRED; reservation-only legacy rows are insufficient. Ordinary RECEIVE/ADJUST Existing balanceAction writes balance then movement. Sequential writes are not the atomic reservation guarantee. Legacy RETURN ERR_INVENTORY_RETURN_UNQUALIFIED before reads/writes. Caller RMA/inspection/disposition or a renamed action grants no restock authority. Physical reversal/refund Separate shipment/receipt/disposition and original-capture/reconciliation authority. Requests, source tests and sandbox receipts are not physical completion or settlement. flowchart LR\n  Policy[\"Approved Product / Price / warehouse policy\"] --> Intake[\"Exact Inventory opening receipt\"]\n  Intake --> Live[\"Operational stock\"]\n  Live --> Hold[\"Checkout request to Inventory atomic hold\"]\n  Hold --> Order[\"Original Order and Payment evidence\"]\n  Hold --> Release[\"Owner compensation of original hold\"]\n  Order --> Reverse[\"Independent physical reverse and Payment review\"] Developers and operators follow Inventory, Promotion, Cart and DigitalCore for exact admission, persistence, reveal and recovery rather than copying their algorithms into a pack. Customize application instructions and existing owner layers only. Test replay after consumption, atomic hold rollback, legacy RETURN refusal and partial/unknown outcomes. Shipment, actual returned-goods receipt/restock, Card/provider qualification and settlement remain independent acceptance gates.",
    "keywords": [
      "commerce",
      "product",
      "price",
      "inventory",
      "fulfillment",
      "agora",
      "opening-receipts",
      "atomic-checkout-holds",
      "return-refusal"
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
  "record6": {
    "code": "nodicsDocsSearchpagenodicsdocsmetadatacommercebasefoundations",
    "product": "nodicsDocumentationProduct",
    "targetType": "PAGE",
    "targetCode": "nodicsDocsMetadatacommerceBaseFoundations",
    "title": "Base Commerce foundations",
    "summary": "Beginner-to-operator guide for Store, Product, Pricing, Tax, Promotion, Inventory, exact decisions, publication, recovery, and customization.",
    "searchText": "Base Commerce foundations Beginner-to-operator guide for Store, Product, Pricing, Tax, Promotion, Inventory, exact decisions, publication, recovery, and customization. # Base Commerce foundations\n\n## Business journey\n\nBase Commerce answers the questions that come before checkout: where is the customer buying, what is the sellable item, what does it cost, which tax applies, which promotion is earned, and can inventory satisfy the request? Each answer belongs to a separate capability so a business can change tax or stock policy without rewriting Cart.\n\n| Question | Owner | Evidence |\n| --- | --- | --- |\n| Which selling context applies? | Store | tenant, store, channel, currency, locale, timezone |\n| What is sold? | Product | product, variant, category, catalog version |\n| What is the price? | Pricing | exact price decision and source hash |\n| What tax applies? | Tax | jurisdiction, rate, exact amount, policy version |\n| What benefit applies? | Promotion | rule, target, exact discount, reason |\n| Can it be supplied? | Inventory | balance, source, reservation, allocation, movement |\n\nStore rejects inactive or cross-tenant store/channel combinations. Product publication starts with an active product and creates staged evidence; publication does not mutate the authored product. Pricing, Tax, and Promotion use canonical decimal strings. Inventory owns stock and uses optimistic balance revisions plus idempotency keys.\n\n## Beginner example\n\nA customer opens the web channel for an active Dubai store. Store resolves AED, English, and the store timezone. Product resolves a sellable variant. Pricing returns unit amount `19.99`; ordering three produces `59.97` exactly. Promotion returns an applied discount record, Tax returns its own decision, and Inventory returns candidate warehouses. Cart consumes these results later; it does not reproduce their rules.\n\nEvery persisted or transmitted decision includes tenant and correlation evidence. A source hash lets an operator prove what inputs produced a projection. The hash is integrity evidence, not a secret or authorization mechanism.\n\n## Developer guidance\n\nDevelopers extend the owner that controls the decision. Regional tax logic belongs behind Tax. A customer price resolver belongs behind Pricing. Warehouse selection belongs behind Inventory. Later-loading customer modules may replace a narrow service while retaining the same schema and evidence contract.\n\nNever use JavaScript numbers for commercial calculations. The exact amount service accepts canonical decimal strings and uses integer arithmetic internally. Validate currency separately because adding amounts from different currencies is invalid even when their digits look compatible.\n\nProduct search records are projections. Change Product or Pricing source, publish a new version, and rebuild the projection. Do not edit search records as business truth. Media associations remain governed by Media/Product boundaries and raw storage paths never become Product fields.\n\n## Operator and DevOps guidance\n\nOperators monitor stale publications, decision drift, reservation expiry, negative or inconsistent balances, and failed projection work. Reconciliation compares source revision and source hash to the current projection. A repair creates evidence and reruns the owner; it does not silently patch generated output.\n\nProduction teams must set retention, index, cache, throughput, and recovery objectives per deployment. Cache keys include tenant, store, channel, locale, currency, catalog version, and policy versions where relevant. Invalidation follows publication events. A cache hit may improve speed but cannot weaken tenant or effective-date checks.\n\n## Security and failure behavior\n\nAll administrative operations require employee permissions. Customer reads are scoped to an authenticated or explicitly public selling context. Cross-tenant input is rejected. Coupon tokens are stored as hashes. Provider secrets and customer protected data stay out of decision evidence, logs, generated context, and Axis payloads.\n\nIf Pricing, Tax, Promotion, or Inventory is unavailable, callers receive a failure or a clearly governed fallback policy. They must never invent a zero tax, unlimited stock, or successful discount. Partial evidence is retained for diagnosis but not presented as a final calculated promise.\n\n## Common mistakes\n\n- Combining Product and the technical framework Catalog module.\n- Letting Cart own price, tax, promotion, or inventory truth.\n- Using floating point for money, rates, or quantities.\n- Editing a search projection instead of publishing source.\n- Treating a source hash as authorization.\n- Returning records without tenant scope.\n- Enabling a regional adapter before qualification.\n\n## Verification\n\nRun the foundation contract, generated schema contracts, module metadata validation, controlled Commerce graph preparation, and generated LLM validation. Test exact arithmetic, cross-tenant rejection, inactive contexts, unavailable inventory, deterministic hashes, idempotent reservations, stale revisions, publication withdrawal, and a later-layer service override. Production acceptance additionally requires realistic data-volume, index, cache, recovery, and regional-policy evidence.\n\n## Store, Channel, And Point Of Service Coverage\n\nBase Commerce also owns the business context that decides where commerce happens: Store, SalesChannel, and PointOfService. Product catalog data, pricing, inventory, checkout, and fulfillment should all be interpreted through the active selling context rather than through a hardcoded frontend assumption.\n\n```mermaid\nflowchart LR\n  Enterprise[\"Enterprise and tenant\"] --> Store[\"Store\"]\n  Store --> Channel[\"Sales channel\"]\n  Store --> POS[\"Point of service\"]\n  Channel --> Catalog[\"Catalog and pricing context\"]\n  POS --> Inventory[\"Inventory and fulfillment context\"]\n  Catalog --> Checkout[\"Checkout journey\"]\n```\n\n| Record | Business purpose | Documentation detail |\n| --- | --- | --- |\n| Store | Defines selling context, locale, currency, timezone, and activation. | Explain tenant scope, active state, default values, and project attributes. |\n| SalesChannel | Identifies web, marketplace, mobile, or assisted selling mode. | Explain pricing, content, payment, and fulfillment impact. |\n| PointOfService | Represents store, branch, pickup point, or operational service location. | Explain address, opening, stock, and customer visibility. |\n| StoreContextService | Resolves effective store context for runtime calls. | Explain request inputs, fallback, and rejection behavior. |\n\nAxis should expose Stores & Channels as a business workbench with backend declared columns and permissions. Developers should add project-specific store attributes, channel policies, and point-of-service rules in the owning store module or a later project module. Implementation evidence comes from store schemas, store data packs, store backoffice capability service, and generated schema contracts for Store, SalesChannel, and PointOfService.\n\n### Online and physical service points\n\nA PointOfService is a selling or service context, not necessarily a physical place. Its `locationRef` is an optional typed reference to `locationCore.location`. The Commerce core-reference release includes an online service point without a location; it must import while Location is absent. Store, tenant, lifecycle, and revision requirements still apply.\n\nFor example, an online-only shop can register Commerce and activate its required core data without registering Location. A physical pickup operation must instead resolve a valid, authorized location before making a physical-place promise. Leaving the association optional does not qualify every physical operation for location-free execution. Do not insert an empty object or invented location code merely to satisfy validation.\n\nIf activation reports record-level errors on a point of service, inspect the effective Store schema and import-run diagnostics. A legacy required `locationRef` can reject the online core record. After deploying the corrected schema, restart the owning Commerce runtimes through the normal topology workflow; database model initialization refreshes the collection validator. Retry activation through Module Registry. Keep existing records and import receipts; do not drop collections or manually mark the module enabled.\n\n## Customization and extension\n\nProjects may extend Base Commerce by adding store attributes, channel rules, point-of-service behavior, catalog context policies, and store-aware calculation hooks in a later-loaded module. The extension must preserve the standard Store, SalesChannel, and PointOfService ownership model, keep tenant/store scope explicit, and prove that checkout, pricing, inventory, content, and fulfillment resolve the same selling context.\n\nFor a physical-only project, a later-loaded module extending Store may strengthen the existing property:\n\n```js\nmodule.exports = {\n    store: {\n        pointOfService: {\n            definition: { locationRef: { required: true } }\n        }\n    }\n};\n```\n\nKeep the inherited object type and reference metadata. Supply a real location in the project's effective activation data through the existing data layers, and prove that missing references are rejected while valid authorized references work. Changing the property to required without adapting the online core record will intentionally prevent activation. No new module-dependency setting is needed. Mixed online/physical projects should keep the general property optional and enforce physical-place requirements in the operation that needs them.\n\nThe focused Store core-reference contract checks required field coverage, retained reference metadata, and a stronger project overlay:\n\n```bash\nnode --test nodics.commerce/modules/baseCommerce/modules/store/test/coreReferenceLocationContract.test.js\nnode nodics.location/test/locationBusinessAssociationContract.test.js\n```\n",
    "keywords": [
      "store-market-site-and-channel-management",
      "commerce-foundations",
      "base-commerce-foundations",
      "Store, Market, Site, and Channel Management",
      "Commerce Foundations",
      "Base Commerce foundations"
    ],
    "facets": {
      "section": "store-market-site-and-channel-management",
      "group": "store-market-site-and-channel-management",
      "navigationDepth": 2,
      "documentType": "concept",
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
  },
  "record7": {
    "code": "nodicsDocsSearchpagenodicsdocsmetadatacommercedataauthoringfulfillment",
    "product": "nodicsDocumentationProduct",
    "targetType": "PAGE",
    "targetCode": "nodicsDocsMetadatacommerceDataAuthoringFulfillment",
    "title": "Commerce Data Authoring and Fulfillment",
    "summary": "How product, category, price, inventory, search, order, fulfillment, return, and refund data are authored, imported, published, and verified.",
    "searchText": "Commerce Data Authoring and Fulfillment How product, category, price, inventory, search, order, fulfillment, return, and refund data are authored, imported, published, and verified. # Commerce Data Authoring and Fulfillment\n\nCommerce authoring combines publishable product, price and policy records with separately operated stock, orders and fulfillment. Authorized Axis workbenches and developer release imports must use the same owning services where those lanes are supported; they are not interchangeable blanket CRUD paths. A reusable storefront baseline prepares stable product/category/variant, localization, price, content and Media identities, then separately verifies operational availability and fulfillment.\n\n## Source map\n\n| Capability | Framework owner source |\n| --- | --- |\n| Product and specialized listing | `nodics.commerce/modules/baseCommerce/modules/product/src/router/routers.js`; `src/service/defaultProductListingAuthoringService.js` under that owner. |\n| Pricing | `nodics.commerce/modules/baseCommerce/modules/pricing/src/schemas/schemas.js`; pricing publication/lookup remain with Pricing. |\n| Inventory operation | `nodics.commerce/modules/baseCommerce/modules/inventory/src/service/defaultInventoryOperationService.js`, `src/router/routers.js` under that owner. |\n| Cart / Checkout / Order | `nodics.commerce/modules/checkout`; Order is `nodics.commerce/modules/checkout/modules/order`, not baseCommerce. |\n| Fulfillment | `nodics.commerce/modules/fulfillment`; canonical guide `commerce.payment-fulfillment`. |\n| Search | `nodics.commerce/modules/baseCommerce/modules/commerceSearch`; canonical guide `commerce.search-guide`. |\n| Publication and localization | Canonical guides `commerce.enterprise-operations`, `localization.runtime-authoring`; inspect each owner's current schemas and role before selecting a release header. |\n\n## Data bundle\n\n```mermaid\nflowchart LR\n  Product[\"Staged Product, variants and localization\"] --> Publish[\"Approved Product / Price / policy publication\"]\n  Publish --> Search[\"Search projection and freshness evidence\"]\n  Publish --> Cart[\"Cart and Checkout\"]\n  Stock[\"Operational stock RECEIVE / ADJUST; legacy RETURN refused\"] --> Cart\n  Cart --> Order[\"Order placement\"]\n  Order --> Fulfillment[\"Consignment and carrier execution evidence\"]\n  Fulfillment --> Return[\"Receipt, return and Payment-owned refund\"]\n```\n\nBeginners should not think of a product as one row. A useful commerce product usually needs category membership, localization, variants, price, tax context, inventory availability, media, and search projection. Business value appears only when those records work together. Developers should author stable codes and relation keys. Operators should verify import counts, publication state, search freshness, checkout availability, fulfillment execution, and exception handling before production use.\n\n## Authoring sequence\n\n1. Resolve tenant, store, supported runtime roles and the selected owner release. Create categories, product and stable variant/SKU relations in the authoring lane supported by Product.\n2. Add Product-owned localizations with DRAFT/READY and required completeness; add reviewed price rows and currency/tax context through Pricing.\n3. Add warehouse/reference and publication-policy data only where the owner's schema/lifecycle supports release import. Do not seed live balances, movements or reservations as a Staged product release.\n4. Declare release-owned Media assets and CMS content relations; retain exact Media identity/version for later qualification.\n5. Validate/import the selected developer release into Staged, inspect import errors and relations, then obtain each owner's publication approval. An Axis workbench is an alternative only if installed, authorized and owner-backed.\n6. Use supported Inventory RECEIVE/ADJUST, opening receipt or Checkout reservation owners as appropriate. Legacy RETURN refuses before reads/writes; never bypass return authority with a renamed action. Inspect original owner evidence.\n7. Publish/rebuild Product and Search projections through their governed operations. Verify freshness independently of stock availability and of content publication.\n8. Exercise an authorized controlled cart/checkout/order, consignment and return/refund path as a separate browser/live acceptance gate; source authoring alone does not close it.\n\n## Header and record contract\n\n```js\n// A Product release header, not an operational Inventory snapshot header.\nmodule.exports = {\n  product: { products: {\n    options: { enabled: true, schemaName: 'product', operation: 'saveAll',\n      dataFilePrefix: 'catalogProductData' },\n    query: { code: '$code', tenant: '$tenant' }\n  } }\n};\n```\n\nHeaders define target module, schema, operation, and idempotent query. Records define business data. They should not calculate availability, call pricing services, assign fulfillment status from code, or write publication results. The runtime services own validation and lifecycle transitions.\n\nInventory requireOperationalRuntime rejects COMMERCE_STAGED / inventory publication role STAGED for stock operations; validateImportTarget rejects direct snapshot import of inventoryBalance, inventoryMovement and inventoryReservation in OPERATIONAL_VERSIONED mode. The protected POST /inventory/balances/:balanceCode/actions/:actionCode route invokes balanceAction; RECEIVE/ADJUST require stable replay identity; RETURN rejects ERR_INVENTORY_RETURN_UNQUALIFIED before reads/writes. Balance mutation followed by movement persistence is sequential in this owner, so do not claim a transaction or cross-worker exactly-once effect from the idempotency key alone. Inspect both records after ambiguous failure.\n\nProduct's service-token-only POST /internal/products/listings is a specialized marketplaceAuthoring.enabled DIGITAL / DIGITAL_COMMERCE lane: sourceRef, ownerRef, title and idempotency are required; variant/localization saves are sequential. It is not general apparel/product CRUD and does not establish a universal Axis authoring screen. Product publication routes and workflow decisions remain Product-owned; owner schema validation and Staged restrictions still apply to developer headers.\n\n## Fulfillment flow\n\nOrder lives under Checkout and owns placed-order lifecycle. Fulfillment must consume the order's payment/quantity/warehouse decisions and produce consignment and carrier evidence; do not import fictional shipment status. A sandbox carrier adapter can exercise QUOTE, CREATE_SHIPMENT, CANCEL_SHIPMENT, TRACK and CREATE_RETURN only under its enabled sandboxOnly policy with injected credentials/transport; it does not establish a live-qualified carrier integration. Provider-specific live qualification remains open until recorded acceptance.\n\nFor recovery, correlate order and entry quantity, inventory reservation/movement, consignment revision, operation idempotency key, carrier request/response reference and exception. A successful product publish or search hit proves neither stock availability nor shipment. Returns need original owner-issued SHIPPED quantities plus retained receipt and accepted inspection/disposition evidence; a completed return is not evidence a refund settled. Payment owns original-capture validation, refund transaction and any reconciliation record. Inspect partial owner outcomes before retrying the same operation; there is no single atomic transaction spanning catalog publication, stock, carrier and payment.\n\n| Step | Required owner evidence | Limit |\n| --- | --- | --- |\n| Product / price publication | Selected immutable version, approval, pointer and current pricing lookup. | Import success alone is not sellability. |\n| Search freshness | Product projection, rule projection and index result for the same tenant/store. | A discoverable product may still have no available stock. |\n| Stock operation | Operational balance, reservation/movement, idempotency identity. | Do not publish Staged balances or infer atomicity across sequential writes. |\n| Order / consignment | Order totals/payment evidence, quantity and warehouse assignment, consignment revision, carrier reference. | Sandbox receipt is not live-provider acceptance. |\n| Return / refund | Original owner-issued SHIPPED quantities, accepted receipt/inspection/disposition, original capture, refund transaction and reconciliation status. | Refund pending/failed must not be described as settled. |\n\nThe guarded physical owner now supports full pre-dispatch cancellation of original Checkout holds and a distinct manually attested dispatch -> receipt -> inspection -> disposition return path. Read [Fulfillment physical cancellation and return authority](/docs/framework/fulfillment-shipping-management#physical-cancellation-return-owner-bridge) for the retained consignment lock and original-quantity gates. Generic Inventory RETURN remains refused; ADJUST is not an alternate return workflow. Owner-issued SHIPPED does not assert customer delivery or live-carrier acceptance. Payment completion still requires the approved original capture and retained refund receipt; LOCAL_SANDBOX_DEMO proves offline conformance only, never external settlement.\n\n## Customization and extension guidance\n\nDevelopers can add product attributes, price strategies, inventory providers, search ranking rules, fulfillment adapters, return policies, and refund integration points. Keep the extension in the owning module and add tests around schema validation, service behavior, and storefront result. Business users should see these extensions as controlled fields, actions, dashboards, and recovery messages in Axis, not as data-file business logic.\n\n## Common mistakes\n\n- Creating products without price or inventory and expecting checkout to work.\n- Treating storefront display content as Commerce authority.\n- Adding fulfillment records before the order lifecycle creates execution evidence.\n- Forgetting search projection after product import.\n- Using generated database ids instead of stable business codes in release data.\n\n## Verification\n\nSource review can verify schemas, role guards and owner handoffs without claiming execution. Separately run owner contract tests and a controlled fresh-schema Staged import/publication, operational stock receipt, discovery, cart/checkout/order, consignment and return/refund journey in a browser. Capture tenant isolation, exact release/pointer, physical Media, stock, carrier and refund evidence. No browser, carrier, payment-provider or production acceptance is established by this guide.\n\n## Opening intake, Checkout holds and physical returns are distinct\n\nCatalog publication, first intake, Checkout reservation and physical return are different operations. Publishing Product/price/warehouse policy establishes retained rules, not live stock. An explicit Inventory opening contribution atomically creates first balance, RECEIPT movement and private receipt per instruction. Replay verifies original intake without replenishing consumed units. Checkout uses the separate atomic reservation owner; Cart availability does not reserve.\n\n| Lane | Actual owner guarantee | Limit |\n| --- | --- | --- |\n| Product/price/policy publication | Normal Staged capture, review, approval and activated Store delivery. | No live balances, budget consumption or coupon issuance. |\n| Opening intake | Atomic first balance/movement/original receipt per instruction. | Not a whole-pack transaction; never replace existing stock. |\n| Checkout physical acquire/release | Atomic available/reserved, hold and movement through qualified generated transactions. | Uncertain acknowledgement stays COMPENSATION_REQUIRED; reservation-only legacy rows are insufficient. |\n| Ordinary RECEIVE/ADJUST | Existing balanceAction writes balance then movement. | Sequential writes are not the atomic reservation guarantee. |\n| Legacy RETURN | ERR_INVENTORY_RETURN_UNQUALIFIED before reads/writes. | Caller RMA/inspection/disposition or a renamed action grants no restock authority. |\n| Physical reversal/refund | Separate shipment/receipt/disposition and original-capture/reconciliation authority. | Requests, source tests and sandbox receipts are not physical completion or settlement. |\n\n```mermaid\nflowchart LR\n  Policy[\"Approved Product / Price / warehouse policy\"] --> Intake[\"Exact Inventory opening receipt\"]\n  Intake --> Live[\"Operational stock\"]\n  Live --> Hold[\"Checkout request to Inventory atomic hold\"]\n  Hold --> Order[\"Original Order and Payment evidence\"]\n  Hold --> Release[\"Owner compensation of original hold\"]\n  Order --> Reverse[\"Independent physical reverse and Payment review\"]\n```\n\nDevelopers and operators follow Inventory, Promotion, Cart and DigitalCore for exact admission, persistence, reveal and recovery rather than copying their algorithms into a pack. Customize application instructions and existing owner layers only. Test replay after consumption, atomic hold rollback, legacy RETURN refusal and partial/unknown outcomes. Shipment, actual returned-goods receipt/restock, Card/provider qualification and settlement remain independent acceptance gates.\n",
    "keywords": [
      "commerce",
      "product",
      "price",
      "inventory",
      "fulfillment",
      "agora",
      "Product Catalog and Discovery",
      "Catalog Model and Publication",
      "Commerce Data Authoring and Fulfillment",
      "opening-receipts",
      "atomic-checkout-holds",
      "return-refusal"
    ],
    "facets": {
      "section": "product-catalog-and-discovery",
      "group": "product-catalog-and-discovery",
      "navigationDepth": 2,
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
  },
  "record8": {
    "code": "nodicsDocsSearchproductnodicsdocumentationproduct",
    "product": "nodicsDocumentationProduct",
    "targetType": "PRODUCT",
    "targetCode": "nodicsDocumentationProduct",
    "title": "Nodics Documentation",
    "summary": "Business-friendly and developer-ready framework documentation rendered from a governed documentation content catalog.",
    "searchText": "Nodics Documentation Business-friendly and developer-ready framework documentation rendered from a governed documentation content catalog.",
    "keywords": [
      "nodics",
      "documentation",
      "framework"
    ],
    "facets": {
      "audience": [
        "business",
        "architect",
        "administrator",
        "developer",
        "operator",
        "qa",
        "ai-tool"
      ],
      "lifecycleState": "ONLINE"
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
  "record9": {
    "code": "nodicsDocsSearchnavigationnodicsdocumentationnavigation",
    "product": "nodicsDocumentationProduct",
    "targetType": "NAVIGATION",
    "targetCode": "nodicsDocumentationNavigation",
    "title": "Nodics Documentation Navigation",
    "summary": "Search documentation",
    "searchText": "Nodics Documentation Navigation Search framework documentation Search documentation",
    "keywords": [
      "navigation",
      "hierarchy",
      "expandable",
      "search"
    ],
    "facets": {
      "documentType": "navigation",
      "lifecycleState": "ONLINE"
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
  "record10": {
    "code": "nodicsDocsSearchnodenodicsdocsnoderoot",
    "product": "nodicsDocumentationProduct",
    "targetType": "NODE",
    "targetCode": "nodicsDocsNodeRoot",
    "title": "Nodics Documentation",
    "summary": "Root documentation node that owns every business-friendly framework, application, capability, operations, publication, tooling, and reference section.",
    "searchText": "Nodics Documentation Root documentation node that owns every business-friendly framework, application, capability, operations, publication, tooling, and reference section. nodics documentation framework",
    "keywords": [
      "nodics",
      "documentation",
      "framework"
    ],
    "facets": {
      "nodeLevel": "SECTION",
      "nodeType": "CONTAINER",
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
  "record11": {
    "code": "nodicsDocsSearchnodenodicsdocsnodesecstarthere",
    "product": "nodicsDocumentationProduct",
    "targetType": "NODE",
    "targetCode": "nodicsDocsNodeSecstartHere",
    "title": "Start Here",
    "summary": "Choose the right documentation entry point before opening detailed framework, Axis, Kickoff, or API contract pages.",
    "searchText": "Start Here Choose the right documentation entry point before opening detailed framework, Axis, Kickoff, or API contract pages. start-here Start Here",
    "keywords": [
      "start-here",
      "Start Here"
    ],
    "facets": {
      "nodeLevel": "SECTION",
      "nodeType": "CONTAINER",
      "audience": [
        "business",
        "architect",
        "administrator",
        "developer",
        "operator",
        "qa"
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
  "record12": {
    "code": "nodicsDocsSearchnodenodicsdocsnodesecnodicsframework",
    "product": "nodicsDocumentationProduct",
    "targetType": "NODE",
    "targetCode": "nodicsDocsNodeSecnodicsFramework",
    "title": "Nodics Framework",
    "summary": "Framework purpose, adoption value, enterprise problems solved, and how Nodics supports fast but governed delivery.",
    "searchText": "Nodics Framework Framework purpose, adoption value, enterprise problems solved, and how Nodics supports fast but governed delivery. nodics-framework Nodics Framework",
    "keywords": [
      "nodics-framework",
      "Nodics Framework"
    ],
    "facets": {
      "nodeLevel": "SECTION",
      "nodeType": "CONTAINER",
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
  "record13": {
    "code": "nodicsDocsSearchnodenodicsdocsnodesecdocumentationroadmap",
    "product": "nodicsDocumentationProduct",
    "targetType": "NODE",
    "targetCode": "nodicsDocsNodeSecdocumentationRoadmap",
    "title": "Documentation Roadmap",
    "summary": "Reader journeys for business users, architects, administrators, developers, operators, partners, QA owners, and AI tools.",
    "searchText": "Documentation Roadmap Reader journeys for business users, architects, administrators, developers, operators, partners, QA owners, and AI tools. documentation-roadmap Documentation Roadmap",
    "keywords": [
      "documentation-roadmap",
      "Documentation Roadmap"
    ],
    "facets": {
      "nodeLevel": "SECTION",
      "nodeType": "CONTAINER",
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
  "record14": {
    "code": "nodicsDocsSearchnodenodicsdocsnodesecframeworkarchitectureanddesign",
    "product": "nodicsDocumentationProduct",
    "targetType": "NODE",
    "targetCode": "nodicsDocsNodeSecframeworkArchitectureAndDesign",
    "title": "Framework Architecture and Design",
    "summary": "Architecture, modularity, ownership, runtime composition, extension direction, and design boundaries.",
    "searchText": "Framework Architecture and Design Architecture, modularity, ownership, runtime composition, extension direction, and design boundaries. framework-architecture-and-design Framework Architecture and Design",
    "keywords": [
      "framework-architecture-and-design",
      "Framework Architecture and Design"
    ],
    "facets": {
      "nodeLevel": "SECTION",
      "nodeType": "CONTAINER",
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
  "record15": {
    "code": "nodicsDocsSearchnodenodicsdocsnodeseccapabilityregistryandlifecyclemanagement",
    "product": "nodicsDocumentationProduct",
    "targetType": "NODE",
    "targetCode": "nodicsDocsNodeSeccapabilityRegistryAndLifecycleManagement",
    "title": "Capability Registry and Lifecycle Management",
    "summary": "Capability registration, activation, runtime observation, lifecycle state, and backend-owned capability identity.",
    "searchText": "Capability Registry and Lifecycle Management Capability registration, activation, runtime observation, lifecycle state, and backend-owned capability identity. capability-registry-and-lifecycle-management Capability Registry and Lifecycle Management",
    "keywords": [
      "capability-registry-and-lifecycle-management",
      "Capability Registry and Lifecycle Management"
    ],
    "facets": {
      "nodeLevel": "SECTION",
      "nodeType": "CONTAINER",
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
  "record16": {
    "code": "nodicsDocsSearchnodenodicsdocsnodesecfoundationruntimeservices",
    "product": "nodicsDocumentationProduct",
    "targetType": "NODE",
    "targetCode": "nodicsDocsNodeSecfoundationRuntimeServices",
    "title": "Foundation Runtime Services",
    "summary": "Shared runtime services that support modules, routes, schemas, configuration, events, validation, and tooling.",
    "searchText": "Foundation Runtime Services Shared runtime services that support modules, routes, schemas, configuration, events, validation, and tooling. foundation-runtime-services Foundation Runtime Services",
    "keywords": [
      "foundation-runtime-services",
      "Foundation Runtime Services"
    ],
    "facets": {
      "nodeLevel": "SECTION",
      "nodeType": "CONTAINER",
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
  "record17": {
    "code": "nodicsDocsSearchnodenodicsdocsnodesecnodicsapplicationsuite",
    "product": "nodicsDocumentationProduct",
    "targetType": "NODE",
    "targetCode": "nodicsDocsNodeSecnodicsApplicationSuite",
    "title": "Nodics Application Suite",
    "summary": "Application experiences built on the framework, including Axis, Nexus, and Kickoff.",
    "searchText": "Nodics Application Suite Application experiences built on the framework, including Axis, Nexus, and Kickoff. nodics-application-suite Nodics Application Suite",
    "keywords": [
      "nodics-application-suite",
      "Nodics Application Suite"
    ],
    "facets": {
      "nodeLevel": "SECTION",
      "nodeType": "CONTAINER",
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
  "record18": {
    "code": "nodicsDocsSearchnodenodicsdocsnodesecsolutionusecases",
    "product": "nodicsDocumentationProduct",
    "targetType": "NODE",
    "targetCode": "nodicsDocsNodeSecsolutionUseCases",
    "title": "Solution Use Cases",
    "summary": "Solution patterns such as Task Execution Engine and Data Engineering and Analytics Platform that customers can build with Nodics.",
    "searchText": "Solution Use Cases Solution patterns such as Task Execution Engine and Data Engineering and Analytics Platform that customers can build with Nodics. solution-use-cases Solution Use Cases",
    "keywords": [
      "solution-use-cases",
      "Solution Use Cases"
    ],
    "facets": {
      "nodeLevel": "SECTION",
      "nodeType": "CONTAINER",
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
  "record19": {
    "code": "nodicsDocsSearchnodenodicsdocsnodesecacceleratorsandindustrysolutiontemplates",
    "product": "nodicsDocumentationProduct",
    "targetType": "NODE",
    "targetCode": "nodicsDocsNodeSecacceleratorsAndIndustrySolutionTemplates",
    "title": "Accelerators and Industry Solution Templates",
    "summary": "Agora accelerator application families and industry templates that help customers build faster.",
    "searchText": "Accelerators and Industry Solution Templates Agora accelerator application families and industry templates that help customers build faster. accelerators-and-industry-solution-templates Accelerators and Industry Solution Templates",
    "keywords": [
      "accelerators-and-industry-solution-templates",
      "Accelerators and Industry Solution Templates"
    ],
    "facets": {
      "nodeLevel": "SECTION",
      "nodeType": "CONTAINER",
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
  "record20": {
    "code": "nodicsDocsSearchnodenodicsdocsnodesecnodicsinstallerandworkspacesetup",
    "product": "nodicsDocumentationProduct",
    "targetType": "NODE",
    "targetCode": "nodicsDocsNodeSecnodicsInstallerAndWorkspaceSetup",
    "title": "Nodics Installer and Workspace Setup",
    "summary": "First-machine bootstrap, local workspace setup, runtime visibility, and installer handoff guidance.",
    "searchText": "Nodics Installer and Workspace Setup First-machine bootstrap, local workspace setup, runtime visibility, and installer handoff guidance. nodics-installer-and-workspace-setup Nodics Installer and Workspace Setup",
    "keywords": [
      "nodics-installer-and-workspace-setup",
      "Nodics Installer and Workspace Setup"
    ],
    "facets": {
      "nodeLevel": "SECTION",
      "nodeType": "CONTAINER",
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
  "record21": {
    "code": "nodicsDocsSearchnodenodicsdocsnodesecapplicationbuilderandworkspacegeneration",
    "product": "nodicsDocumentationProduct",
    "targetType": "NODE",
    "targetCode": "nodicsDocsNodeSecapplicationBuilderAndWorkspaceGeneration",
    "title": "Application Builder and Workspace Generation",
    "summary": "Guided workspace generation, questionnaires, capability selection, setup-plan preview, and governed handoff.",
    "searchText": "Application Builder and Workspace Generation Guided workspace generation, questionnaires, capability selection, setup-plan preview, and governed handoff. application-builder-and-workspace-generation Application Builder and Workspace Generation",
    "keywords": [
      "application-builder-and-workspace-generation",
      "Application Builder and Workspace Generation"
    ],
    "facets": {
      "nodeLevel": "SECTION",
      "nodeType": "CONTAINER",
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
  "record22": {
    "code": "nodicsDocsSearchnodenodicsdocsnodesecaxisandbackofficeoperations",
    "product": "nodicsDocumentationProduct",
    "targetType": "NODE",
    "targetCode": "nodicsDocsNodeSecaxisAndBackofficeOperations",
    "title": "Axis and BackOffice Operations",
    "summary": "Axis workspaces, BackOffice journeys, dashboards, actions, approvals, operational screens, and backend contracts.",
    "searchText": "Axis and BackOffice Operations Axis workspaces, BackOffice journeys, dashboards, actions, approvals, operational screens, and backend contracts. axis-and-backoffice-operations Axis and BackOffice Operations",
    "keywords": [
      "axis-and-backoffice-operations",
      "Axis and BackOffice Operations"
    ],
    "facets": {
      "nodeLevel": "SECTION",
      "nodeType": "CONTAINER",
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
  "record23": {
    "code": "nodicsDocsSearchnodenodicsdocsnodesecbusinesscustomizationinaxis",
    "product": "nodicsDocumentationProduct",
    "targetType": "NODE",
    "targetCode": "nodicsDocsNodeSecbusinessCustomizationInAxis",
    "title": "Business Customization in Axis",
    "summary": "How business users and projects customize navigation, content areas, screens, renderers, and business functionality through Axis.",
    "searchText": "Business Customization in Axis How business users and projects customize navigation, content areas, screens, renderers, and business functionality through Axis. business-customization-in-axis Business Customization in Axis",
    "keywords": [
      "business-customization-in-axis",
      "Business Customization in Axis"
    ],
    "facets": {
      "nodeLevel": "SECTION",
      "nodeType": "CONTAINER",
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
  "record24": {
    "code": "nodicsDocsSearchnodenodicsdocsnodesecuserenterpriseandtenantmanagement",
    "product": "nodicsDocumentationProduct",
    "targetType": "NODE",
    "targetCode": "nodicsDocsNodeSecuserEnterpriseAndTenantManagement",
    "title": "User, Enterprise, and Tenant Management",
    "summary": "Profile, users, enterprises, tenants, groups, permissions, identity context, and account operations.",
    "searchText": "User, Enterprise, and Tenant Management Profile, users, enterprises, tenants, groups, permissions, identity context, and account operations. user-enterprise-and-tenant-management User, Enterprise, and Tenant Management",
    "keywords": [
      "user-enterprise-and-tenant-management",
      "User, Enterprise, and Tenant Management"
    ],
    "facets": {
      "nodeLevel": "SECTION",
      "nodeType": "CONTAINER",
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
  "record25": {
    "code": "nodicsDocsSearchnodenodicsdocsnodesecsecuritygovernanceandcompliance",
    "product": "nodicsDocumentationProduct",
    "targetType": "NODE",
    "targetCode": "nodicsDocsNodeSecsecurityGovernanceAndCompliance",
    "title": "Security, Governance, and Compliance",
    "summary": "Authentication, authorization, tenant isolation, access policy, audit, approval gates, secrets, and compliance controls.",
    "searchText": "Security, Governance, and Compliance Authentication, authorization, tenant isolation, access policy, audit, approval gates, secrets, and compliance controls. security-governance-and-compliance Security, Governance, and Compliance",
    "keywords": [
      "security-governance-and-compliance",
      "Security, Governance, and Compliance"
    ],
    "facets": {
      "nodeLevel": "SECTION",
      "nodeType": "CONTAINER",
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
  "record26": {
    "code": "nodicsDocsSearchnodenodicsdocsnodesecapplicationconfigurationandruntimebehaviormanagement",
    "product": "nodicsDocumentationProduct",
    "targetType": "NODE",
    "targetCode": "nodicsDocsNodeSecapplicationConfigurationAndRuntimeBehaviorManagement",
    "title": "Application Configuration and Runtime Behavior Management",
    "summary": "Configuration layers, runtime behavior controls, provider selection, overrides, and behavior-changing settings.",
    "searchText": "Application Configuration and Runtime Behavior Management Configuration layers, runtime behavior controls, provider selection, overrides, and behavior-changing settings. application-configuration-and-runtime-behavior-management Application Configuration and Runtime Behavior Management",
    "keywords": [
      "application-configuration-and-runtime-behavior-management",
      "Application Configuration and Runtime Behavior Management"
    ],
    "facets": {
      "nodeLevel": "SECTION",
      "nodeType": "CONTAINER",
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
  "record27": {
    "code": "nodicsDocsSearchnodenodicsdocsnodesecruntimegovernanceanddynamicchangemanagement",
    "product": "nodicsDocumentationProduct",
    "targetType": "NODE",
    "targetCode": "nodicsDocsNodeSecruntimeGovernanceAndDynamicChangeManagement",
    "title": "Runtime Governance and Dynamic Change Management",
    "summary": "Governed runtime changes, activation, event-driven refresh, audit, rollback, and controlled mutation boundaries.",
    "searchText": "Runtime Governance and Dynamic Change Management Governed runtime changes, activation, event-driven refresh, audit, rollback, and controlled mutation boundaries. runtime-governance-and-dynamic-change-management Runtime Governance and Dynamic Change Management",
    "keywords": [
      "runtime-governance-and-dynamic-change-management",
      "Runtime Governance and Dynamic Change Management"
    ],
    "facets": {
      "nodeLevel": "SECTION",
      "nodeType": "CONTAINER",
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
  "record28": {
    "code": "nodicsDocsSearchnodenodicsdocsnodeseclocalizationandinternationalization",
    "product": "nodicsDocumentationProduct",
    "targetType": "NODE",
    "targetCode": "nodicsDocsNodeSeclocalizationAndInternationalization",
    "title": "Localization and Internationalization",
    "summary": "Locales, translations, localized data, fallback behavior, content localization, and project-level customization.",
    "searchText": "Localization and Internationalization Locales, translations, localized data, fallback behavior, content localization, and project-level customization. localization-and-internationalization Localization and Internationalization",
    "keywords": [
      "localization-and-internationalization",
      "Localization and Internationalization"
    ],
    "facets": {
      "nodeLevel": "SECTION",
      "nodeType": "CONTAINER",
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
  "record29": {
    "code": "nodicsDocsSearchnodenodicsdocsnodesecdatamodelingandschemamanagement",
    "product": "nodicsDocumentationProduct",
    "targetType": "NODE",
    "targetCode": "nodicsDocsNodeSecdataModelingAndSchemaManagement",
    "title": "Data Modeling and Schema Management",
    "summary": "Schemas, model generation, property extension, validation, persistence contracts, and project-layer schema changes.",
    "searchText": "Data Modeling and Schema Management Schemas, model generation, property extension, validation, persistence contracts, and project-layer schema changes. data-modeling-and-schema-management Data Modeling and Schema Management",
    "keywords": [
      "data-modeling-and-schema-management",
      "Data Modeling and Schema Management"
    ],
    "facets": {
      "nodeLevel": "SECTION",
      "nodeType": "CONTAINER",
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
  "record30": {
    "code": "nodicsDocsSearchnodenodicsdocsnodesecdatabaseandpersistencemanagement",
    "product": "nodicsDocumentationProduct",
    "targetType": "NODE",
    "targetCode": "nodicsDocsNodeSecdatabaseAndPersistenceManagement",
    "title": "Database and Persistence Management",
    "summary": "Database providers, virtual data access, model registration, MongoDB behavior, provider replacement, and persistence operations.",
    "searchText": "Database and Persistence Management Database providers, virtual data access, model registration, MongoDB behavior, provider replacement, and persistence operations. database-and-persistence-management Database and Persistence Management",
    "keywords": [
      "database-and-persistence-management",
      "Database and Persistence Management"
    ],
    "facets": {
      "nodeLevel": "SECTION",
      "nodeType": "CONTAINER",
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
  "record31": {
    "code": "nodicsDocsSearchnodenodicsdocsnodeseccachingandruntimestatemanagement",
    "product": "nodicsDocumentationProduct",
    "targetType": "NODE",
    "targetCode": "nodicsDocsNodeSeccachingAndRuntimeStateManagement",
    "title": "Caching and Runtime State Management",
    "summary": "Cache providers, cache keys, node-local state, Redis replacement, runtime state behavior, invalidation, and diagnostics.",
    "searchText": "Caching and Runtime State Management Cache providers, cache keys, node-local state, Redis replacement, runtime state behavior, invalidation, and diagnostics. caching-and-runtime-state-management Caching and Runtime State Management",
    "keywords": [
      "caching-and-runtime-state-management",
      "Caching and Runtime State Management"
    ],
    "facets": {
      "nodeLevel": "SECTION",
      "nodeType": "CONTAINER",
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
  "record32": {
    "code": "nodicsDocsSearchnodenodicsdocsnodesecdeveloperextensionandprojectcustomization",
    "product": "nodicsDocumentationProduct",
    "targetType": "NODE",
    "targetCode": "nodicsDocsNodeSecdeveloperExtensionAndProjectCustomization",
    "title": "Developer Extension and Project Customization",
    "summary": "Project-layer overrides, module extension, services, routers, validators, events, data packs, and upgrade-safe customization.",
    "searchText": "Developer Extension and Project Customization Project-layer overrides, module extension, services, routers, validators, events, data packs, and upgrade-safe customization. developer-extension-and-project-customization Developer Extension and Project Customization",
    "keywords": [
      "developer-extension-and-project-customization",
      "Developer Extension and Project Customization"
    ],
    "facets": {
      "nodeLevel": "SECTION",
      "nodeType": "CONTAINER",
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
  "record33": {
    "code": "nodicsDocsSearchnodenodicsdocsnodesecstoremarketsiteandchannelmanagement",
    "product": "nodicsDocumentationProduct",
    "targetType": "NODE",
    "targetCode": "nodicsDocsNodeSecstoreMarketSiteAndChannelManagement",
    "title": "Store, Market, Site, and Channel Management",
    "summary": "Stores, markets, sites, channels, context selection, catalog relationships, and commerce/content operating boundaries.",
    "searchText": "Store, Market, Site, and Channel Management Stores, markets, sites, channels, context selection, catalog relationships, and commerce/content operating boundaries. store-market-site-and-channel-management Store, Market, Site, and Channel Management",
    "keywords": [
      "store-market-site-and-channel-management",
      "Store, Market, Site, and Channel Management"
    ],
    "facets": {
      "nodeLevel": "SECTION",
      "nodeType": "CONTAINER",
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
  "record34": {
    "code": "nodicsDocsSearchnodenodicsdocsnodesecwcmsandcontentmanagement",
    "product": "nodicsDocumentationProduct",
    "targetType": "NODE",
    "targetCode": "nodicsDocsNodeSecwcmsAndContentManagement",
    "title": "WCMS and Content Management",
    "summary": "CMS sites, catalogs, pages, components, routes, templates, slots, content authoring, and delivery behavior.",
    "searchText": "WCMS and Content Management CMS sites, catalogs, pages, components, routes, templates, slots, content authoring, and delivery behavior. wcms-and-content-management WCMS and Content Management",
    "keywords": [
      "wcms-and-content-management",
      "WCMS and Content Management"
    ],
    "facets": {
      "nodeLevel": "SECTION",
      "nodeType": "CONTAINER",
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
  "record35": {
    "code": "nodicsDocsSearchnodenodicsdocsnodesecproductcataloganddiscovery",
    "product": "nodicsDocumentationProduct",
    "targetType": "NODE",
    "targetCode": "nodicsDocsNodeSecproductCatalogAndDiscovery",
    "title": "Product Catalog and Discovery",
    "summary": "Products, categories, attributes, catalog data, publication, discovery relationships, and customization.",
    "searchText": "Product Catalog and Discovery Products, categories, attributes, catalog data, publication, discovery relationships, and customization. product-catalog-and-discovery Product Catalog and Discovery",
    "keywords": [
      "product-catalog-and-discovery",
      "Product Catalog and Discovery"
    ],
    "facets": {
      "nodeLevel": "SECTION",
      "nodeType": "CONTAINER",
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
  "record36": {
    "code": "nodicsDocsSearchnodenodicsdocsnodesecsearchanddiscovery",
    "product": "nodicsDocumentationProduct",
    "targetType": "NODE",
    "targetCode": "nodicsDocsNodeSecsearchAndDiscovery",
    "title": "Search and Discovery",
    "summary": "Search providers, discovery adapters, Elasticsearch, Solr, product indexing, content indexing, and query behavior.",
    "searchText": "Search and Discovery Search providers, discovery adapters, Elasticsearch, Solr, product indexing, content indexing, and query behavior. search-and-discovery Search and Discovery",
    "keywords": [
      "search-and-discovery",
      "Search and Discovery"
    ],
    "facets": {
      "nodeLevel": "SECTION",
      "nodeType": "CONTAINER",
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
  "record37": {
    "code": "nodicsDocsSearchnodenodicsdocsnodesecmediamanagement",
    "product": "nodicsDocumentationProduct",
    "targetType": "NODE",
    "targetCode": "nodicsDocsNodeSecmediaManagement",
    "title": "Media Management",
    "summary": "Media records, upload, storage, metadata, provider choice, publication, delivery, cleanup, and reusable media lifecycle.",
    "searchText": "Media Management Media records, upload, storage, metadata, provider choice, publication, delivery, cleanup, and reusable media lifecycle. media-management Media Management",
    "keywords": [
      "media-management",
      "Media Management"
    ],
    "facets": {
      "nodeLevel": "SECTION",
      "nodeType": "CONTAINER",
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
  "record38": {
    "code": "nodicsDocsSearchnodenodicsdocsnodesecinventoryandstockmanagement",
    "product": "nodicsDocumentationProduct",
    "targetType": "NODE",
    "targetCode": "nodicsDocsNodeSecinventoryAndStockManagement",
    "title": "Inventory and Stock Management",
    "summary": "Inventory records, stock levels, reservations, availability, warehouse relationships, and operational stock behavior.",
    "searchText": "Inventory and Stock Management Inventory records, stock levels, reservations, availability, warehouse relationships, and operational stock behavior. inventory-and-stock-management Inventory and Stock Management",
    "keywords": [
      "inventory-and-stock-management",
      "Inventory and Stock Management"
    ],
    "facets": {
      "nodeLevel": "SECTION",
      "nodeType": "CONTAINER",
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
  "record39": {
    "code": "nodicsDocsSearchnodenodicsdocsnodesecpricingpromotionsandtax",
    "product": "nodicsDocumentationProduct",
    "targetType": "NODE",
    "targetCode": "nodicsDocsNodeSecpricingPromotionsAndTax",
    "title": "Pricing, Promotions, and Tax",
    "summary": "Price calculation, tax behavior, promotions, discount rules, exact decisions, and configuration.",
    "searchText": "Pricing, Promotions, and Tax Price calculation, tax behavior, promotions, discount rules, exact decisions, and configuration. pricing-promotions-and-tax Pricing, Promotions, and Tax",
    "keywords": [
      "pricing-promotions-and-tax",
      "Pricing, Promotions, and Tax"
    ],
    "facets": {
      "nodeLevel": "SECTION",
      "nodeType": "CONTAINER",
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
  "record40": {
    "code": "nodicsDocsSearchnodenodicsdocsnodeseccommercecartandcheckout",
    "product": "nodicsDocumentationProduct",
    "targetType": "NODE",
    "targetCode": "nodicsDocsNodeSeccommerceCartAndCheckout",
    "title": "Commerce, Cart, and Checkout",
    "summary": "Cart creation, checkout calculation, order placement, idempotency, compensation, and checkout ownership.",
    "searchText": "Commerce, Cart, and Checkout Cart creation, checkout calculation, order placement, idempotency, compensation, and checkout ownership. commerce-cart-and-checkout Commerce, Cart, and Checkout",
    "keywords": [
      "commerce-cart-and-checkout",
      "Commerce, Cart, and Checkout"
    ],
    "facets": {
      "nodeLevel": "SECTION",
      "nodeType": "CONTAINER",
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
  "record41": {
    "code": "nodicsDocsSearchnodenodicsdocsnodesecpaymentmanagement",
    "product": "nodicsDocumentationProduct",
    "targetType": "NODE",
    "targetCode": "nodicsDocsNodeSecpaymentManagement",
    "title": "Payment Management",
    "summary": "Payment methods, providers, authorization, callbacks, capture, reconciliation, risk, and payment operations.",
    "searchText": "Payment Management Payment methods, providers, authorization, callbacks, capture, reconciliation, risk, and payment operations. payment-management Payment Management",
    "keywords": [
      "payment-management",
      "Payment Management"
    ],
    "facets": {
      "nodeLevel": "SECTION",
      "nodeType": "CONTAINER",
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
  "record42": {
    "code": "nodicsDocsSearchnodenodicsdocsnodesecloyaltyandrewards",
    "product": "nodicsDocumentationProduct",
    "targetType": "NODE",
    "targetCode": "nodicsDocsNodeSecloyaltyAndRewards",
    "title": "Loyalty and Rewards",
    "summary": "Reward programs, reward types, owner wallets, balances, reservations, redemptions, ledger evidence, and reward-based checkout integration.",
    "searchText": "Loyalty and Rewards Reward programs, reward types, owner wallets, balances, reservations, redemptions, ledger evidence, and reward-based checkout integration. loyalty-and-rewards Loyalty and Rewards",
    "keywords": [
      "loyalty-and-rewards",
      "Loyalty and Rewards"
    ],
    "facets": {
      "nodeLevel": "SECTION",
      "nodeType": "CONTAINER",
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
  "record43": {
    "code": "nodicsDocsSearchnodenodicsdocsnodesecshippingandfulfillment",
    "product": "nodicsDocumentationProduct",
    "targetType": "NODE",
    "targetCode": "nodicsDocsNodeSecshippingAndFulfillment",
    "title": "Shipping and Fulfillment",
    "summary": "Shipping methods, fulfillment flow, warehouse handoff, shipment, tracking, and provider integration.",
    "searchText": "Shipping and Fulfillment Shipping methods, fulfillment flow, warehouse handoff, shipment, tracking, and provider integration. shipping-and-fulfillment Shipping and Fulfillment",
    "keywords": [
      "shipping-and-fulfillment",
      "Shipping and Fulfillment"
    ],
    "facets": {
      "nodeLevel": "SECTION",
      "nodeType": "CONTAINER",
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
  "record44": {
    "code": "nodicsDocsSearchnodenodicsdocsnodesecordermanagement",
    "product": "nodicsDocumentationProduct",
    "targetType": "NODE",
    "targetCode": "nodicsDocsNodeSecorderManagement",
    "title": "Order Management",
    "summary": "Order state, ownership, operational actions, fulfillment coordination, and post-placement lifecycle.",
    "searchText": "Order Management Order state, ownership, operational actions, fulfillment coordination, and post-placement lifecycle. order-management Order Management",
    "keywords": [
      "order-management",
      "Order Management"
    ],
    "facets": {
      "nodeLevel": "SECTION",
      "nodeType": "CONTAINER",
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
  "record45": {
    "code": "nodicsDocsSearchnodenodicsdocsnodeseccancellationsreturnsandrefunds",
    "product": "nodicsDocumentationProduct",
    "targetType": "NODE",
    "targetCode": "nodicsDocsNodeSeccancellationsReturnsAndRefunds",
    "title": "Cancellations, Returns, and Refunds",
    "summary": "Cancellation, return, refund, approvals, policies, reverse logistics, compensation, and customer/operator recovery.",
    "searchText": "Cancellations, Returns, and Refunds Cancellation, return, refund, approvals, policies, reverse logistics, compensation, and customer/operator recovery. cancellations-returns-and-refunds Cancellations, Returns, and Refunds",
    "keywords": [
      "cancellations-returns-and-refunds",
      "Cancellations, Returns, and Refunds"
    ],
    "facets": {
      "nodeLevel": "SECTION",
      "nodeType": "CONTAINER",
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
  "record46": {
    "code": "nodicsDocsSearchnodenodicsdocsnodeseccustomerengagementandfeedback",
    "product": "nodicsDocumentationProduct",
    "targetType": "NODE",
    "targetCode": "nodicsDocsNodeSeccustomerEngagementAndFeedback",
    "title": "Customer Engagement and Feedback",
    "summary": "Reviews, ratings, feedback, complaints, triage, follow-up, insights, moderation, and engagement operations.",
    "searchText": "Customer Engagement and Feedback Reviews, ratings, feedback, complaints, triage, follow-up, insights, moderation, and engagement operations. customer-engagement-and-feedback Customer Engagement and Feedback",
    "keywords": [
      "customer-engagement-and-feedback",
      "Customer Engagement and Feedback"
    ],
    "facets": {
      "nodeLevel": "SECTION",
      "nodeType": "CONTAINER",
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
  "record47": {
    "code": "nodicsDocsSearchnodenodicsdocsnodeseccommunicationandnotifications",
    "product": "nodicsDocumentationProduct",
    "targetType": "NODE",
    "targetCode": "nodicsDocsNodeSeccommunicationAndNotifications",
    "title": "Communication and Notifications",
    "summary": "Templates, delivery intent, consent, suppression, providers, verification, callbacks, retry, and inbox behavior.",
    "searchText": "Communication and Notifications Templates, delivery intent, consent, suppression, providers, verification, callbacks, retry, and inbox behavior. communication-and-notifications Communication and Notifications",
    "keywords": [
      "communication-and-notifications",
      "Communication and Notifications"
    ],
    "facets": {
      "nodeLevel": "SECTION",
      "nodeType": "CONTAINER",
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
  "record48": {
    "code": "nodicsDocsSearchnodenodicsdocsnodeseceventandmessagingmanagement",
    "product": "nodicsDocumentationProduct",
    "targetType": "NODE",
    "targetCode": "nodicsDocsNodeSeceventAndMessagingManagement",
    "title": "Event and Messaging Management",
    "summary": "Events, EMS, message providers, retry, failover, node responsibility transfer, and event-driven runtime refresh.",
    "searchText": "Event and Messaging Management Events, EMS, message providers, retry, failover, node responsibility transfer, and event-driven runtime refresh. event-and-messaging-management Event and Messaging Management",
    "keywords": [
      "event-and-messaging-management",
      "Event and Messaging Management"
    ],
    "facets": {
      "nodeLevel": "SECTION",
      "nodeType": "CONTAINER",
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
  "record49": {
    "code": "nodicsDocsSearchnodenodicsdocsnodesecprocessandworkflowautomation",
    "product": "nodicsDocumentationProduct",
    "targetType": "NODE",
    "targetCode": "nodicsDocsNodeSecprocessAndWorkflowAutomation",
    "title": "Process and Workflow Automation",
    "summary": "Workflow definitions, runtime instances, tasks, approvals, incidents, transitions, and business process automation.",
    "searchText": "Process and Workflow Automation Workflow definitions, runtime instances, tasks, approvals, incidents, transitions, and business process automation. process-and-workflow-automation Process and Workflow Automation",
    "keywords": [
      "process-and-workflow-automation",
      "Process and Workflow Automation"
    ],
    "facets": {
      "nodeLevel": "SECTION",
      "nodeType": "CONTAINER",
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
  "record50": {
    "code": "nodicsDocsSearchnodenodicsdocsnodesecpipelineandbusinesslogicorchestration",
    "product": "nodicsDocumentationProduct",
    "targetType": "NODE",
    "targetCode": "nodicsDocsNodeSecpipelineAndBusinessLogicOrchestration",
    "title": "Pipeline and Business Logic Orchestration",
    "summary": "Pipeline-backed business logic, handlers, orchestration order, extension points, validation, and runtime behavior.",
    "searchText": "Pipeline and Business Logic Orchestration Pipeline-backed business logic, handlers, orchestration order, extension points, validation, and runtime behavior. pipeline-and-business-logic-orchestration Pipeline and Business Logic Orchestration",
    "keywords": [
      "pipeline-and-business-logic-orchestration",
      "Pipeline and Business Logic Orchestration"
    ],
    "facets": {
      "nodeLevel": "SECTION",
      "nodeType": "CONTAINER",
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
  "record51": {
    "code": "nodicsDocsSearchnodenodicsdocsnodeseccronandscheduledautomation",
    "product": "nodicsDocumentationProduct",
    "targetType": "NODE",
    "targetCode": "nodicsDocsNodeSeccronAndScheduledAutomation",
    "title": "Cron and Scheduled Automation",
    "summary": "CronJobs, schedules, node execution, failover, responsibility transfer, recovery, and Task Execution Engine references.",
    "searchText": "Cron and Scheduled Automation CronJobs, schedules, node execution, failover, responsibility transfer, recovery, and Task Execution Engine references. cron-and-scheduled-automation Cron and Scheduled Automation",
    "keywords": [
      "cron-and-scheduled-automation",
      "Cron and Scheduled Automation"
    ],
    "facets": {
      "nodeLevel": "SECTION",
      "nodeType": "CONTAINER",
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
  "record52": {
    "code": "nodicsDocsSearchnodenodicsdocsnodesecdataimportexportandmigration",
    "product": "nodicsDocumentationProduct",
    "targetType": "NODE",
    "targetCode": "nodicsDocsNodeSecdataImportExportAndMigration",
    "title": "Data Import, Export, and Migration",
    "summary": "Data packs, import/export operations, migrations, manifests, checksums, release evidence, and DEAP references.",
    "searchText": "Data Import, Export, and Migration Data packs, import/export operations, migrations, manifests, checksums, release evidence, and DEAP references. data-import-export-and-migration Data Import, Export, and Migration",
    "keywords": [
      "data-import-export-and-migration",
      "Data Import, Export, and Migration"
    ],
    "facets": {
      "nodeLevel": "SECTION",
      "nodeType": "CONTAINER",
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
  "record53": {
    "code": "nodicsDocsSearchnodenodicsdocsnodesecsystemintegrationandexternalconnectivity",
    "product": "nodicsDocumentationProduct",
    "targetType": "NODE",
    "targetCode": "nodicsDocsNodeSecsystemIntegrationAndExternalConnectivity",
    "title": "System Integration and External Connectivity",
    "summary": "Adapters, providers, external systems, credentials, webhooks, callbacks, connectivity evidence, and integration operations.",
    "searchText": "System Integration and External Connectivity Adapters, providers, external systems, credentials, webhooks, callbacks, connectivity evidence, and integration operations. system-integration-and-external-connectivity System Integration and External Connectivity",
    "keywords": [
      "system-integration-and-external-connectivity",
      "System Integration and External Connectivity"
    ],
    "facets": {
      "nodeLevel": "SECTION",
      "nodeType": "CONTAINER",
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
  "record54": {
    "code": "nodicsDocsSearchnodenodicsdocsnodesecoperationsmonitoringandrecovery",
    "product": "nodicsDocumentationProduct",
    "targetType": "NODE",
    "targetCode": "nodicsDocsNodeSecoperationsMonitoringAndRecovery",
    "title": "Operations, Monitoring, and Recovery",
    "summary": "Runtime topology, health, logs, monitoring, incidents, recovery, rollback, acceptance evidence, and support operations.",
    "searchText": "Operations, Monitoring, and Recovery Runtime topology, health, logs, monitoring, incidents, recovery, rollback, acceptance evidence, and support operations. operations-monitoring-and-recovery Operations, Monitoring, and Recovery",
    "keywords": [
      "operations-monitoring-and-recovery",
      "Operations, Monitoring, and Recovery"
    ],
    "facets": {
      "nodeLevel": "SECTION",
      "nodeType": "CONTAINER",
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
  "record55": {
    "code": "nodicsDocsSearchnodenodicsdocsnodesecqualitytestingandcertification",
    "product": "nodicsDocumentationProduct",
    "targetType": "NODE",
    "targetCode": "nodicsDocsNodeSecqualityTestingAndCertification",
    "title": "Quality, Testing, and Certification",
    "summary": "Test strategy, regression gates, certification evidence, acceptance checks, generated contracts, and release qualification.",
    "searchText": "Quality, Testing, and Certification Test strategy, regression gates, certification evidence, acceptance checks, generated contracts, and release qualification. quality-testing-and-certification Quality, Testing, and Certification",
    "keywords": [
      "quality-testing-and-certification",
      "Quality, Testing, and Certification"
    ],
    "facets": {
      "nodeLevel": "SECTION",
      "nodeType": "CONTAINER",
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
  "record56": {
    "code": "nodicsDocsSearchnodenodicsdocsnodesecdocumentationmanagement",
    "product": "nodicsDocumentationProduct",
    "targetType": "NODE",
    "targetCode": "nodicsDocsNodeSecdocumentationManagement",
    "title": "Documentation Management",
    "summary": "Documentation authoring, content catalog, navigation components, publication lifecycle, access rules, and validation.",
    "searchText": "Documentation Management Documentation authoring, content catalog, navigation components, publication lifecycle, access rules, and validation. documentation-management Documentation Management",
    "keywords": [
      "documentation-management",
      "Documentation Management"
    ],
    "facets": {
      "nodeLevel": "SECTION",
      "nodeType": "CONTAINER",
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
  "record57": {
    "code": "nodicsDocsSearchnodenodicsdocsnodesecreleasestagingandpublication",
    "product": "nodicsDocumentationProduct",
    "targetType": "NODE",
    "targetCode": "nodicsDocsNodeSecreleaseStagingAndPublication",
    "title": "Release, Staging, and Publication",
    "summary": "Staged and Online publication, approval, immutable releases, rollback, visibility, publication evidence, and consumer delivery.",
    "searchText": "Release, Staging, and Publication Staged and Online publication, approval, immutable releases, rollback, visibility, publication evidence, and consumer delivery. release-staging-and-publication Release, Staging, and Publication",
    "keywords": [
      "release-staging-and-publication",
      "Release, Staging, and Publication"
    ],
    "facets": {
      "nodeLevel": "SECTION",
      "nodeType": "CONTAINER",
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
  "record58": {
    "code": "nodicsDocsSearchnodenodicsdocsnodesecaianddevelopertooling",
    "product": "nodicsDocumentationProduct",
    "targetType": "NODE",
    "targetCode": "nodicsDocsNodeSecaiAndDeveloperTooling",
    "title": "AI and Developer Tooling",
    "summary": "AI tool guidance, generated context, safe automation, documentation generation, source-backed behavior, and developer tooling.",
    "searchText": "AI and Developer Tooling AI tool guidance, generated context, safe automation, documentation generation, source-backed behavior, and developer tooling. ai-and-developer-tooling AI and Developer Tooling",
    "keywords": [
      "ai-and-developer-tooling",
      "AI and Developer Tooling"
    ],
    "facets": {
      "nodeLevel": "SECTION",
      "nodeType": "CONTAINER",
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
  "record59": {
    "code": "nodicsDocsSearchnodenodicsdocsnodesecreference",
    "product": "nodicsDocumentationProduct",
    "targetType": "NODE",
    "targetCode": "nodicsDocsNodeSecreference",
    "title": "Reference",
    "summary": "Glossary, API references, source maps, configuration references, schema references, status codes, and appendices.",
    "searchText": "Reference Glossary, API references, source maps, configuration references, schema references, status codes, and appendices. reference Reference",
    "keywords": [
      "reference",
      "Reference"
    ],
    "facets": {
      "nodeLevel": "SECTION",
      "nodeType": "CONTAINER",
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
  "record60": {
    "code": "nodicsDocsSearchnodenodicsdocsnodepagedocsgateway",
    "product": "nodicsDocumentationProduct",
    "targetType": "NODE",
    "targetCode": "nodicsDocsNodePagedocsGateway",
    "title": "Nodics Documentation",
    "summary": "Public documentation gateway for framework, Axis, Kickoff, and generated API contract entry points.",
    "searchText": "Nodics Documentation Public documentation gateway for framework, Axis, Kickoff, and generated API contract entry points. documentation gateway setup publishing nexus axis",
    "keywords": [
      "documentation",
      "gateway",
      "setup",
      "publishing",
      "nexus",
      "axis"
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
        "qa"
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
  "record61": {
    "code": "nodicsDocsSearchnodenodicsdocsnodepageframeworkwhatisnodics",
    "product": "nodicsDocumentationProduct",
    "targetType": "NODE",
    "targetCode": "nodicsDocsNodePageframeworkWhatIsNodics",
    "title": "What is Nodics?",
    "summary": "What Nodics is, how it supports AI-assisted development with human ownership, and how teams understand, customize and operate enterprise applications.",
    "searchText": "What is Nodics? What Nodics is, how it supports AI-assisted development with human ownership, and how teams understand, customize and operate enterprise applications. nodics-framework framework-value-and-adoption what-is-nodics enterprise-framework",
    "keywords": [
      "nodics-framework",
      "framework-value-and-adoption",
      "what-is-nodics",
      "enterprise-framework"
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
  "record62": {
    "code": "nodicsDocsSearchnodenodicsdocsnodepageframeworkwhynodicsexists",
    "product": "nodicsDocumentationProduct",
    "targetType": "NODE",
    "targetCode": "nodicsDocsNodePageframeworkWhyNodicsExists",
    "title": "Why Nodics Exists",
    "summary": "Industry problems, business value, and why Nodics turns fast delivery into governed enterprise software.",
    "searchText": "Why Nodics Exists Industry problems, business value, and why Nodics turns fast delivery into governed enterprise software. nodics-framework framework-value-and-adoption why-nodics-exists business-value enterprise-problems",
    "keywords": [
      "nodics-framework",
      "framework-value-and-adoption",
      "why-nodics-exists",
      "business-value",
      "enterprise-problems"
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
  "record63": {
    "code": "nodicsDocsSearchnodenodicsdocsnodepageframeworkhownodicsworks",
    "product": "nodicsDocumentationProduct",
    "targetType": "NODE",
    "targetCode": "nodicsDocsNodePageframeworkHowNodicsWorks",
    "title": "How Nodics Works",
    "summary": "Mental model for framework modules, customer projects, Axis, public applications, runtime ownership, and customization.",
    "searchText": "How Nodics Works Mental model for framework modules, customer projects, Axis, public applications, runtime ownership, and customization. nodics-framework framework-value-and-adoption how-nodics-works runtime-model backend-driven-experience",
    "keywords": [
      "nodics-framework",
      "framework-value-and-adoption",
      "how-nodics-works",
      "runtime-model",
      "backend-driven-experience"
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
  "record64": {
    "code": "nodicsDocsSearchnodenodicsdocsnodepageframeworkadoptionandfirstjourney",
    "product": "nodicsDocumentationProduct",
    "targetType": "NODE",
    "targetCode": "nodicsDocsNodePageframeworkAdoptionAndFirstJourney",
    "title": "Adoption and First Journey",
    "summary": "The first business, developer, and operator path through setup, capability registration, imports, publishing, and browser verification.",
    "searchText": "Adoption and First Journey The first business, developer, and operator path through setup, capability registration, imports, publishing, and browser verification. nodics-framework framework-value-and-adoption adoption first-journey fresh-schema-setup",
    "keywords": [
      "nodics-framework",
      "framework-value-and-adoption",
      "adoption",
      "first-journey",
      "fresh-schema-setup"
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
  "record65": {
    "code": "nodicsDocsSearchnodenodicsdocsnodepagedocsdocumentationroadmap",
    "product": "nodicsDocumentationProduct",
    "targetType": "NODE",
    "targetCode": "nodicsDocsNodePagedocsDocumentationRoadmap",
    "title": "Documentation Roadmap",
    "summary": "How the Nodics documentation product is organized and how readers choose the right path through the enterprise hierarchy.",
    "searchText": "Documentation Roadmap How the Nodics documentation product is organized and how readers choose the right path through the enterprise hierarchy. documentation-roadmap documentation-organization reader-navigation",
    "keywords": [
      "documentation-roadmap",
      "documentation-organization",
      "reader-navigation"
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
  "record66": {
    "code": "nodicsDocsSearchnodenodicsdocsnodepagedocsdocumentationprinciples",
    "product": "nodicsDocumentationProduct",
    "targetType": "NODE",
    "targetCode": "nodicsDocsNodePagedocsDocumentationPrinciples",
    "title": "Documentation Principles",
    "summary": "Framework-level documentation rules for README thinness, detailed docs depth, visual evidence, customization, publishing, and access.",
    "searchText": "Documentation Principles Framework-level documentation rules for README thinness, detailed docs depth, visual evidence, customization, publishing, and access. documentation-roadmap reader-journey-and-coverage-map documentation-principles readme-contract visual-contract",
    "keywords": [
      "documentation-roadmap",
      "reader-journey-and-coverage-map",
      "documentation-principles",
      "readme-contract",
      "visual-contract"
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
  "record67": {
    "code": "nodicsDocsSearchnodenodicsdocsnodepagedocsreaderjourneyandcoverage",
    "product": "nodicsDocumentationProduct",
    "targetType": "NODE",
    "targetCode": "nodicsDocsNodePagedocsReaderJourneyAndCoverage",
    "title": "Reader Journey and Coverage",
    "summary": "How business users, developers, operators, QA owners, administrators, and AI tools navigate capability documentation.",
    "searchText": "Reader Journey and Coverage How business users, developers, operators, QA owners, administrators, and AI tools navigate capability documentation. documentation-roadmap reader-journey-and-coverage-map reader-journey coverage-map audience-paths",
    "keywords": [
      "documentation-roadmap",
      "reader-journey-and-coverage-map",
      "reader-journey",
      "coverage-map",
      "audience-paths"
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
  "record68": {
    "code": "nodicsDocsSearchnodenodicsdocsnodepagedocsdocumentationpublishingmodel",
    "product": "nodicsDocumentationProduct",
    "targetType": "NODE",
    "targetCode": "nodicsDocsNodePagedocsDocumentationPublishingModel",
    "title": "Documentation Publishing Model",
    "summary": "How documentation source becomes content catalog data, Staged records, approval tasks, Online pages, and public or authenticated delivery.",
    "searchText": "Documentation Publishing Model How documentation source becomes content catalog data, Staged records, approval tasks, Online pages, and public or authenticated delivery. documentation-roadmap reader-journey-and-coverage-map documentation-publishing content-catalog staged-online",
    "keywords": [
      "documentation-roadmap",
      "reader-journey-and-coverage-map",
      "documentation-publishing",
      "content-catalog",
      "staged-online"
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
  "record69": {
    "code": "nodicsDocsSearchnodenodicsdocsnodepageapplicationssuite",
    "product": "nodicsDocumentationProduct",
    "targetType": "NODE",
    "targetCode": "nodicsDocsNodePageapplicationsSuite",
    "title": "Nodics Application Suite",
    "summary": "Business and technical overview of Axis, Nexus, and Kickoff as application experiences built on the Nodics Framework.",
    "searchText": "Nodics Application Suite Business and technical overview of Axis, Nexus, and Kickoff as application experiences built on the Nodics Framework. nodics-application-suite axis nexus kickoff",
    "keywords": [
      "nodics-application-suite",
      "axis",
      "nexus",
      "kickoff"
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
  "record70": {
    "code": "nodicsDocsSearchnodenodicsdocsnodepagesolutionstaskexecutionengine",
    "product": "nodicsDocumentationProduct",
    "targetType": "NODE",
    "targetCode": "nodicsDocsNodePagesolutionsTaskExecutionEngine",
    "title": "Task Execution Engine",
    "summary": "How customers use Nodics Process, Cron, Pipelines, Events, and governed runtime change to build a Task Execution Engine.",
    "searchText": "Task Execution Engine How customers use Nodics Process, Cron, Pipelines, Events, and governed runtime change to build a Task Execution Engine. solution-use-cases task-execution-engine tee cron process pipeline runtime-change",
    "keywords": [
      "solution-use-cases",
      "task-execution-engine",
      "tee",
      "cron",
      "process",
      "pipeline",
      "runtime-change"
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
  "record71": {
    "code": "nodicsDocsSearchnodenodicsdocsnodepagesolutionsdataengineeringanalyticsplatform",
    "product": "nodicsDocumentationProduct",
    "targetType": "NODE",
    "targetCode": "nodicsDocsNodePagesolutionsDataEngineeringAnalyticsPlatform",
    "title": "Data Engineering and Analytics Platform",
    "summary": "How customers use Nodics import, export, discovery, provider, event, pipeline, and publishing capabilities to build governed data platforms.",
    "searchText": "Data Engineering and Analytics Platform How customers use Nodics import, export, discovery, provider, event, pipeline, and publishing capabilities to build governed data platforms. solution-use-cases data-engineering-and-analytics-platform deap import export discovery analytics data-pipeline",
    "keywords": [
      "solution-use-cases",
      "data-engineering-and-analytics-platform",
      "deap",
      "import",
      "export",
      "discovery",
      "analytics",
      "data-pipeline"
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
  "record72": {
    "code": "nodicsDocsSearchnodenodicsdocsnodepageframeworkcapabilitydocumentationmaturitypattern",
    "product": "nodicsDocumentationProduct",
    "targetType": "NODE",
    "targetCode": "nodicsDocsNodePageframeworkCapabilityDocumentationMaturityPattern",
    "title": "Capability documentation maturity pattern",
    "summary": "How to document concept, design-contract, partial, and operational capabilities without creating false runtime authority.",
    "searchText": "Capability documentation maturity pattern How to document concept, design-contract, partial, and operational capabilities without creating false runtime authority. documentation-management documentation-contract-and-quality capability-documentation-maturity-pattern",
    "keywords": [
      "documentation-management",
      "documentation-contract-and-quality",
      "capability-documentation-maturity-pattern"
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
  "record73": {
    "code": "nodicsDocsSearchnodenodicsdocsnodepagedocsoverview",
    "product": "nodicsDocumentationProduct",
    "targetType": "NODE",
    "targetCode": "nodicsDocsNodePagedocsOverview",
    "title": "Docs overview",
    "summary": "How Nodics framework documentation is authored, generated, validated, imported, rendered, and kept separate from Axis and customer project documentation.",
    "searchText": "Docs overview How Nodics framework documentation is authored, generated, validated, imported, rendered, and kept separate from Axis and customer project documentation. documentation-management documentation-runtime-and-publishing docs-overview",
    "keywords": [
      "documentation-management",
      "documentation-runtime-and-publishing",
      "docs-overview"
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
  "record74": {
    "code": "nodicsDocsSearchnodenodicsdocsnodepagedocsdocumentationpublishingrunbook",
    "product": "nodicsDocumentationProduct",
    "targetType": "NODE",
    "targetCode": "nodicsDocsNodePagedocsDocumentationPublishingRunbook",
    "title": "Documentation Publishing Runbook",
    "summary": "Runbook for authored Markdown, catalogue metadata, generated WCMS records, Staged review, Online activation, rollback evidence, and consumer rendering.",
    "searchText": "Documentation Publishing Runbook Runbook for authored Markdown, catalogue metadata, generated WCMS records, Staged review, Online activation, rollback evidence, and consumer rendering. documentation publishing staged online content-pack",
    "keywords": [
      "documentation",
      "publishing",
      "staged",
      "online",
      "content-pack"
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
  "record75": {
    "code": "nodicsDocsSearchnodenodicsdocsnodepagereferenceinternalsourceboundaryregister",
    "product": "nodicsDocumentationProduct",
    "targetType": "NODE",
    "targetCode": "nodicsDocsNodePagereferenceInternalSourceBoundaryRegister",
    "title": "Internal Source Boundary Register",
    "summary": "Owner mapping for internal provider and utility modules that are covered by broader business capability pages instead of standalone product pages.",
    "searchText": "Internal Source Boundary Register Owner mapping for internal provider and utility modules that are covered by broader business capability pages instead of standalone product pages. internal-source owner-mapping provider source-coverage reference",
    "keywords": [
      "internal-source",
      "owner-mapping",
      "provider",
      "source-coverage",
      "reference"
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
  "record76": {
    "code": "nodicsDocsSearchnodenodicsdocsnodepagereferencesourcemapglossary",
    "product": "nodicsDocumentationProduct",
    "targetType": "NODE",
    "targetCode": "nodicsDocsNodePagereferenceSourceMapGlossary",
    "title": "Reference Source Map and Glossary",
    "summary": "Business-friendly names, technical source owners, module identifiers, common terms, and navigation-to-code references for documentation readers.",
    "searchText": "Reference Source Map and Glossary Business-friendly names, technical source owners, module identifiers, common terms, and navigation-to-code references for documentation readers. reference source-map-and-glossary reference-source-map-and-glossary",
    "keywords": [
      "reference",
      "source-map-and-glossary",
      "reference-source-map-and-glossary"
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
  "record77": {
    "code": "nodicsDocsSearchnodenodicsdocsnodepagereferencesourcebackeddocumentationcoverageaudit",
    "product": "nodicsDocumentationProduct",
    "targetType": "NODE",
    "targetCode": "nodicsDocsNodePagereferenceSourceBackedDocumentationCoverageAudit",
    "title": "Source-Backed Documentation Coverage Audit",
    "summary": "Code-to-documentation coverage audit contract for finding missing or shallow Nodics functionality documentation across framework, projects, data, assets, and applications.",
    "searchText": "Source-Backed Documentation Coverage Audit Code-to-documentation coverage audit contract for finding missing or shallow Nodics functionality documentation across framework, projects, data, assets, and applications. documentation-coverage source-backed code-audit missing-docs coverage-matrix",
    "keywords": [
      "documentation-coverage",
      "source-backed",
      "code-audit",
      "missing-docs",
      "coverage-matrix"
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
  "record78": {
    "code": "nodicsDocsSearchnodenodicsdocsnodepagereferencedocumentationgapbacklog",
    "product": "nodicsDocumentationProduct",
    "targetType": "NODE",
    "targetCode": "nodicsDocsNodePagereferenceDocumentationGapBacklog",
    "title": "Documentation Gap Backlog",
    "summary": "Classified backlog for closing source-backed documentation gaps across runtime capabilities, data releases, media, applications, operations, and validation.",
    "searchText": "Documentation Gap Backlog Classified backlog for closing source-backed documentation gaps across runtime capabilities, data releases, media, applications, operations, and validation. documentation-gap-backlog source-backed coverage-closure documentation-workflow missing-docs",
    "keywords": [
      "documentation-gap-backlog",
      "source-backed",
      "coverage-closure",
      "documentation-workflow",
      "missing-docs"
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
  "record79": {
    "code": "nodicsDocsSearchdashboardnodicsdocsdashboardproduct",
    "product": "nodicsDocumentationProduct",
    "targetType": "DASHBOARD",
    "targetCode": "nodicsDocsDashboardProduct",
    "title": "Nodics Documentation",
    "summary": "Detailed landing content for the full Nodics documentation catalogue, including framework, application-suite, business capability, operations, publication, AI tooling, and reference journeys.",
    "searchText": "Nodics Documentation Detailed landing content for the full Nodics documentation catalogue, including framework, application-suite, business capability, operations, publication, AI tooling, and reference journeys.",
    "keywords": [
      "PRODUCT",
      "nodicsDocumentationProduct",
      "Nodics Documentation"
    ],
    "facets": {
      "ownerType": "PRODUCT",
      "ownerCode": "nodicsDocumentationProduct"
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
  "record80": {
    "code": "nodicsDocsSearchdashboardnodicsdocsdashboardnavigation",
    "product": "nodicsDocumentationProduct",
    "targetType": "DASHBOARD",
    "targetCode": "nodicsDocsDashboardNavigation",
    "title": "Nodics Documentation Navigation",
    "summary": "Expandable and searchable documentation navigation generated from backend content-catalog metadata, with section dashboards and page-level access controls.",
    "searchText": "Nodics Documentation Navigation Expandable and searchable documentation navigation generated from backend content-catalog metadata, with section dashboards and page-level access controls.",
    "keywords": [
      "NAVIGATION",
      "nodicsDocumentationNavigation",
      "Nodics Documentation Navigation"
    ],
    "facets": {
      "ownerType": "NAVIGATION",
      "ownerCode": "nodicsDocumentationNavigation"
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
  "record81": {
    "code": "nodicsDocsSearchdashboardnodicsdocsdashboardsecstarthere",
    "product": "nodicsDocumentationProduct",
    "targetType": "DASHBOARD",
    "targetCode": "nodicsDocsDashboardSecstartHere",
    "title": "Start Here",
    "summary": "Choose the right documentation entry point before opening detailed framework, Axis, Kickoff, or API contract pages.",
    "searchText": "Start Here Choose the right documentation entry point before opening detailed framework, Axis, Kickoff, or API contract pages.",
    "keywords": [
      "SECTION",
      "nodicsDocsNodeSecstartHere",
      "Start Here"
    ],
    "facets": {
      "ownerType": "SECTION",
      "ownerCode": "nodicsDocsNodeSecstartHere"
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
  "record82": {
    "code": "nodicsDocsSearchdashboardnodicsdocsdashboardsecnodicsframework",
    "product": "nodicsDocumentationProduct",
    "targetType": "DASHBOARD",
    "targetCode": "nodicsDocsDashboardSecnodicsFramework",
    "title": "Nodics Framework",
    "summary": "Framework purpose, adoption value, enterprise problems solved, and how Nodics supports fast but governed delivery.",
    "searchText": "Nodics Framework Framework purpose, adoption value, enterprise problems solved, and how Nodics supports fast but governed delivery.",
    "keywords": [
      "SECTION",
      "nodicsDocsNodeSecnodicsFramework",
      "Nodics Framework"
    ],
    "facets": {
      "ownerType": "SECTION",
      "ownerCode": "nodicsDocsNodeSecnodicsFramework"
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
  "record83": {
    "code": "nodicsDocsSearchdashboardnodicsdocsdashboardsecdocumentationroadmap",
    "product": "nodicsDocumentationProduct",
    "targetType": "DASHBOARD",
    "targetCode": "nodicsDocsDashboardSecdocumentationRoadmap",
    "title": "Documentation Roadmap",
    "summary": "Reader journeys for business users, architects, administrators, developers, operators, partners, QA owners, and AI tools.",
    "searchText": "Documentation Roadmap Reader journeys for business users, architects, administrators, developers, operators, partners, QA owners, and AI tools.",
    "keywords": [
      "SECTION",
      "nodicsDocsNodeSecdocumentationRoadmap",
      "Documentation Roadmap"
    ],
    "facets": {
      "ownerType": "SECTION",
      "ownerCode": "nodicsDocsNodeSecdocumentationRoadmap"
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
  "record84": {
    "code": "nodicsDocsSearchdashboardnodicsdocsdashboardsecframeworkarchitectureanddesign",
    "product": "nodicsDocumentationProduct",
    "targetType": "DASHBOARD",
    "targetCode": "nodicsDocsDashboardSecframeworkArchitectureAndDesign",
    "title": "Framework Architecture and Design",
    "summary": "Architecture, modularity, ownership, runtime composition, extension direction, and design boundaries.",
    "searchText": "Framework Architecture and Design Architecture, modularity, ownership, runtime composition, extension direction, and design boundaries.",
    "keywords": [
      "SECTION",
      "nodicsDocsNodeSecframeworkArchitectureAndDesign",
      "Framework Architecture and Design"
    ],
    "facets": {
      "ownerType": "SECTION",
      "ownerCode": "nodicsDocsNodeSecframeworkArchitectureAndDesign"
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
  "record85": {
    "code": "nodicsDocsSearchdashboardnodicsdocsdashboardseccapabilityregistryandlifecyclemanagement",
    "product": "nodicsDocumentationProduct",
    "targetType": "DASHBOARD",
    "targetCode": "nodicsDocsDashboardSeccapabilityRegistryAndLifecycleManagement",
    "title": "Capability Registry and Lifecycle Management",
    "summary": "Capability registration, activation, runtime observation, lifecycle state, and backend-owned capability identity.",
    "searchText": "Capability Registry and Lifecycle Management Capability registration, activation, runtime observation, lifecycle state, and backend-owned capability identity.",
    "keywords": [
      "SECTION",
      "nodicsDocsNodeSeccapabilityRegistryAndLifecycleManagement",
      "Capability Registry and Lifecycle Management"
    ],
    "facets": {
      "ownerType": "SECTION",
      "ownerCode": "nodicsDocsNodeSeccapabilityRegistryAndLifecycleManagement"
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
  "record86": {
    "code": "nodicsDocsSearchdashboardnodicsdocsdashboardsecfoundationruntimeservices",
    "product": "nodicsDocumentationProduct",
    "targetType": "DASHBOARD",
    "targetCode": "nodicsDocsDashboardSecfoundationRuntimeServices",
    "title": "Foundation Runtime Services",
    "summary": "Shared runtime services that support modules, routes, schemas, configuration, events, validation, and tooling.",
    "searchText": "Foundation Runtime Services Shared runtime services that support modules, routes, schemas, configuration, events, validation, and tooling.",
    "keywords": [
      "SECTION",
      "nodicsDocsNodeSecfoundationRuntimeServices",
      "Foundation Runtime Services"
    ],
    "facets": {
      "ownerType": "SECTION",
      "ownerCode": "nodicsDocsNodeSecfoundationRuntimeServices"
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
  "record87": {
    "code": "nodicsDocsSearchdashboardnodicsdocsdashboardsecnodicsapplicationsuite",
    "product": "nodicsDocumentationProduct",
    "targetType": "DASHBOARD",
    "targetCode": "nodicsDocsDashboardSecnodicsApplicationSuite",
    "title": "Nodics Application Suite",
    "summary": "Application experiences built on the framework, including Axis, Nexus, and Kickoff.",
    "searchText": "Nodics Application Suite Application experiences built on the framework, including Axis, Nexus, and Kickoff.",
    "keywords": [
      "SECTION",
      "nodicsDocsNodeSecnodicsApplicationSuite",
      "Nodics Application Suite"
    ],
    "facets": {
      "ownerType": "SECTION",
      "ownerCode": "nodicsDocsNodeSecnodicsApplicationSuite"
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
  "record88": {
    "code": "nodicsDocsSearchdashboardnodicsdocsdashboardsecsolutionusecases",
    "product": "nodicsDocumentationProduct",
    "targetType": "DASHBOARD",
    "targetCode": "nodicsDocsDashboardSecsolutionUseCases",
    "title": "Solution Use Cases",
    "summary": "Solution patterns such as Task Execution Engine and Data Engineering and Analytics Platform that customers can build with Nodics.",
    "searchText": "Solution Use Cases Solution patterns such as Task Execution Engine and Data Engineering and Analytics Platform that customers can build with Nodics.",
    "keywords": [
      "SECTION",
      "nodicsDocsNodeSecsolutionUseCases",
      "Solution Use Cases"
    ],
    "facets": {
      "ownerType": "SECTION",
      "ownerCode": "nodicsDocsNodeSecsolutionUseCases"
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
  "record89": {
    "code": "nodicsDocsSearchdashboardnodicsdocsdashboardsecacceleratorsandindustrysolutiontemplates",
    "product": "nodicsDocumentationProduct",
    "targetType": "DASHBOARD",
    "targetCode": "nodicsDocsDashboardSecacceleratorsAndIndustrySolutionTemplates",
    "title": "Accelerators and Industry Solution Templates",
    "summary": "Agora accelerator application families and industry templates that help customers build faster.",
    "searchText": "Accelerators and Industry Solution Templates Agora accelerator application families and industry templates that help customers build faster.",
    "keywords": [
      "SECTION",
      "nodicsDocsNodeSecacceleratorsAndIndustrySolutionTemplates",
      "Accelerators and Industry Solution Templates"
    ],
    "facets": {
      "ownerType": "SECTION",
      "ownerCode": "nodicsDocsNodeSecacceleratorsAndIndustrySolutionTemplates"
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
  "record90": {
    "code": "nodicsDocsSearchdashboardnodicsdocsdashboardsecnodicsinstallerandworkspacesetup",
    "product": "nodicsDocumentationProduct",
    "targetType": "DASHBOARD",
    "targetCode": "nodicsDocsDashboardSecnodicsInstallerAndWorkspaceSetup",
    "title": "Nodics Installer and Workspace Setup",
    "summary": "First-machine bootstrap, local workspace setup, runtime visibility, and installer handoff guidance.",
    "searchText": "Nodics Installer and Workspace Setup First-machine bootstrap, local workspace setup, runtime visibility, and installer handoff guidance.",
    "keywords": [
      "SECTION",
      "nodicsDocsNodeSecnodicsInstallerAndWorkspaceSetup",
      "Nodics Installer and Workspace Setup"
    ],
    "facets": {
      "ownerType": "SECTION",
      "ownerCode": "nodicsDocsNodeSecnodicsInstallerAndWorkspaceSetup"
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
  "record91": {
    "code": "nodicsDocsSearchdashboardnodicsdocsdashboardsecapplicationbuilderandworkspacegeneration",
    "product": "nodicsDocumentationProduct",
    "targetType": "DASHBOARD",
    "targetCode": "nodicsDocsDashboardSecapplicationBuilderAndWorkspaceGeneration",
    "title": "Application Builder and Workspace Generation",
    "summary": "Guided workspace generation, questionnaires, capability selection, setup-plan preview, and governed handoff.",
    "searchText": "Application Builder and Workspace Generation Guided workspace generation, questionnaires, capability selection, setup-plan preview, and governed handoff.",
    "keywords": [
      "SECTION",
      "nodicsDocsNodeSecapplicationBuilderAndWorkspaceGeneration",
      "Application Builder and Workspace Generation"
    ],
    "facets": {
      "ownerType": "SECTION",
      "ownerCode": "nodicsDocsNodeSecapplicationBuilderAndWorkspaceGeneration"
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
  "record92": {
    "code": "nodicsDocsSearchdashboardnodicsdocsdashboardsecaxisandbackofficeoperations",
    "product": "nodicsDocumentationProduct",
    "targetType": "DASHBOARD",
    "targetCode": "nodicsDocsDashboardSecaxisAndBackofficeOperations",
    "title": "Axis and BackOffice Operations",
    "summary": "Axis workspaces, BackOffice journeys, dashboards, actions, approvals, operational screens, and backend contracts.",
    "searchText": "Axis and BackOffice Operations Axis workspaces, BackOffice journeys, dashboards, actions, approvals, operational screens, and backend contracts.",
    "keywords": [
      "SECTION",
      "nodicsDocsNodeSecaxisAndBackofficeOperations",
      "Axis and BackOffice Operations"
    ],
    "facets": {
      "ownerType": "SECTION",
      "ownerCode": "nodicsDocsNodeSecaxisAndBackofficeOperations"
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
  "record93": {
    "code": "nodicsDocsSearchdashboardnodicsdocsdashboardsecbusinesscustomizationinaxis",
    "product": "nodicsDocumentationProduct",
    "targetType": "DASHBOARD",
    "targetCode": "nodicsDocsDashboardSecbusinessCustomizationInAxis",
    "title": "Business Customization in Axis",
    "summary": "How business users and projects customize navigation, content areas, screens, renderers, and business functionality through Axis.",
    "searchText": "Business Customization in Axis How business users and projects customize navigation, content areas, screens, renderers, and business functionality through Axis.",
    "keywords": [
      "SECTION",
      "nodicsDocsNodeSecbusinessCustomizationInAxis",
      "Business Customization in Axis"
    ],
    "facets": {
      "ownerType": "SECTION",
      "ownerCode": "nodicsDocsNodeSecbusinessCustomizationInAxis"
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
  "record94": {
    "code": "nodicsDocsSearchdashboardnodicsdocsdashboardsecuserenterpriseandtenantmanagement",
    "product": "nodicsDocumentationProduct",
    "targetType": "DASHBOARD",
    "targetCode": "nodicsDocsDashboardSecuserEnterpriseAndTenantManagement",
    "title": "User, Enterprise, and Tenant Management",
    "summary": "Profile, users, enterprises, tenants, groups, permissions, identity context, and account operations.",
    "searchText": "User, Enterprise, and Tenant Management Profile, users, enterprises, tenants, groups, permissions, identity context, and account operations.",
    "keywords": [
      "SECTION",
      "nodicsDocsNodeSecuserEnterpriseAndTenantManagement",
      "User, Enterprise, and Tenant Management"
    ],
    "facets": {
      "ownerType": "SECTION",
      "ownerCode": "nodicsDocsNodeSecuserEnterpriseAndTenantManagement"
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
  "record95": {
    "code": "nodicsDocsSearchdashboardnodicsdocsdashboardsecsecuritygovernanceandcompliance",
    "product": "nodicsDocumentationProduct",
    "targetType": "DASHBOARD",
    "targetCode": "nodicsDocsDashboardSecsecurityGovernanceAndCompliance",
    "title": "Security, Governance, and Compliance",
    "summary": "Authentication, authorization, tenant isolation, access policy, audit, approval gates, secrets, and compliance controls.",
    "searchText": "Security, Governance, and Compliance Authentication, authorization, tenant isolation, access policy, audit, approval gates, secrets, and compliance controls.",
    "keywords": [
      "SECTION",
      "nodicsDocsNodeSecsecurityGovernanceAndCompliance",
      "Security, Governance, and Compliance"
    ],
    "facets": {
      "ownerType": "SECTION",
      "ownerCode": "nodicsDocsNodeSecsecurityGovernanceAndCompliance"
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
  "record96": {
    "code": "nodicsDocsSearchdashboardnodicsdocsdashboardsecapplicationconfigurationandruntimebehaviormanagement",
    "product": "nodicsDocumentationProduct",
    "targetType": "DASHBOARD",
    "targetCode": "nodicsDocsDashboardSecapplicationConfigurationAndRuntimeBehaviorManagement",
    "title": "Application Configuration and Runtime Behavior Management",
    "summary": "Configuration layers, runtime behavior controls, provider selection, overrides, and behavior-changing settings.",
    "searchText": "Application Configuration and Runtime Behavior Management Configuration layers, runtime behavior controls, provider selection, overrides, and behavior-changing settings.",
    "keywords": [
      "SECTION",
      "nodicsDocsNodeSecapplicationConfigurationAndRuntimeBehaviorManagement",
      "Application Configuration and Runtime Behavior Management"
    ],
    "facets": {
      "ownerType": "SECTION",
      "ownerCode": "nodicsDocsNodeSecapplicationConfigurationAndRuntimeBehaviorManagement"
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
  "record97": {
    "code": "nodicsDocsSearchdashboardnodicsdocsdashboardsecruntimegovernanceanddynamicchangemanagement",
    "product": "nodicsDocumentationProduct",
    "targetType": "DASHBOARD",
    "targetCode": "nodicsDocsDashboardSecruntimeGovernanceAndDynamicChangeManagement",
    "title": "Runtime Governance and Dynamic Change Management",
    "summary": "Governed runtime changes, activation, event-driven refresh, audit, rollback, and controlled mutation boundaries.",
    "searchText": "Runtime Governance and Dynamic Change Management Governed runtime changes, activation, event-driven refresh, audit, rollback, and controlled mutation boundaries.",
    "keywords": [
      "SECTION",
      "nodicsDocsNodeSecruntimeGovernanceAndDynamicChangeManagement",
      "Runtime Governance and Dynamic Change Management"
    ],
    "facets": {
      "ownerType": "SECTION",
      "ownerCode": "nodicsDocsNodeSecruntimeGovernanceAndDynamicChangeManagement"
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
  "record98": {
    "code": "nodicsDocsSearchdashboardnodicsdocsdashboardseclocalizationandinternationalization",
    "product": "nodicsDocumentationProduct",
    "targetType": "DASHBOARD",
    "targetCode": "nodicsDocsDashboardSeclocalizationAndInternationalization",
    "title": "Localization and Internationalization",
    "summary": "Locales, translations, localized data, fallback behavior, content localization, and project-level customization.",
    "searchText": "Localization and Internationalization Locales, translations, localized data, fallback behavior, content localization, and project-level customization.",
    "keywords": [
      "SECTION",
      "nodicsDocsNodeSeclocalizationAndInternationalization",
      "Localization and Internationalization"
    ],
    "facets": {
      "ownerType": "SECTION",
      "ownerCode": "nodicsDocsNodeSeclocalizationAndInternationalization"
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
  "record99": {
    "code": "nodicsDocsSearchdashboardnodicsdocsdashboardsecdatamodelingandschemamanagement",
    "product": "nodicsDocumentationProduct",
    "targetType": "DASHBOARD",
    "targetCode": "nodicsDocsDashboardSecdataModelingAndSchemaManagement",
    "title": "Data Modeling and Schema Management",
    "summary": "Schemas, model generation, property extension, validation, persistence contracts, and project-layer schema changes.",
    "searchText": "Data Modeling and Schema Management Schemas, model generation, property extension, validation, persistence contracts, and project-layer schema changes.",
    "keywords": [
      "SECTION",
      "nodicsDocsNodeSecdataModelingAndSchemaManagement",
      "Data Modeling and Schema Management"
    ],
    "facets": {
      "ownerType": "SECTION",
      "ownerCode": "nodicsDocsNodeSecdataModelingAndSchemaManagement"
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
  "record100": {
    "code": "nodicsDocsSearchdashboardnodicsdocsdashboardsecdatabaseandpersistencemanagement",
    "product": "nodicsDocumentationProduct",
    "targetType": "DASHBOARD",
    "targetCode": "nodicsDocsDashboardSecdatabaseAndPersistenceManagement",
    "title": "Database and Persistence Management",
    "summary": "Database providers, virtual data access, model registration, MongoDB behavior, provider replacement, and persistence operations.",
    "searchText": "Database and Persistence Management Database providers, virtual data access, model registration, MongoDB behavior, provider replacement, and persistence operations.",
    "keywords": [
      "SECTION",
      "nodicsDocsNodeSecdatabaseAndPersistenceManagement",
      "Database and Persistence Management"
    ],
    "facets": {
      "ownerType": "SECTION",
      "ownerCode": "nodicsDocsNodeSecdatabaseAndPersistenceManagement"
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
  "record101": {
    "code": "nodicsDocsSearchdashboardnodicsdocsdashboardseccachingandruntimestatemanagement",
    "product": "nodicsDocumentationProduct",
    "targetType": "DASHBOARD",
    "targetCode": "nodicsDocsDashboardSeccachingAndRuntimeStateManagement",
    "title": "Caching and Runtime State Management",
    "summary": "Cache providers, cache keys, node-local state, Redis replacement, runtime state behavior, invalidation, and diagnostics.",
    "searchText": "Caching and Runtime State Management Cache providers, cache keys, node-local state, Redis replacement, runtime state behavior, invalidation, and diagnostics.",
    "keywords": [
      "SECTION",
      "nodicsDocsNodeSeccachingAndRuntimeStateManagement",
      "Caching and Runtime State Management"
    ],
    "facets": {
      "ownerType": "SECTION",
      "ownerCode": "nodicsDocsNodeSeccachingAndRuntimeStateManagement"
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
  "record102": {
    "code": "nodicsDocsSearchdashboardnodicsdocsdashboardsecdeveloperextensionandprojectcustomization",
    "product": "nodicsDocumentationProduct",
    "targetType": "DASHBOARD",
    "targetCode": "nodicsDocsDashboardSecdeveloperExtensionAndProjectCustomization",
    "title": "Developer Extension and Project Customization",
    "summary": "Project-layer overrides, module extension, services, routers, validators, events, data packs, and upgrade-safe customization.",
    "searchText": "Developer Extension and Project Customization Project-layer overrides, module extension, services, routers, validators, events, data packs, and upgrade-safe customization.",
    "keywords": [
      "SECTION",
      "nodicsDocsNodeSecdeveloperExtensionAndProjectCustomization",
      "Developer Extension and Project Customization"
    ],
    "facets": {
      "ownerType": "SECTION",
      "ownerCode": "nodicsDocsNodeSecdeveloperExtensionAndProjectCustomization"
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
  "record103": {
    "code": "nodicsDocsSearchdashboardnodicsdocsdashboardsecstoremarketsiteandchannelmanagement",
    "product": "nodicsDocumentationProduct",
    "targetType": "DASHBOARD",
    "targetCode": "nodicsDocsDashboardSecstoreMarketSiteAndChannelManagement",
    "title": "Store, Market, Site, and Channel Management",
    "summary": "Stores, markets, sites, channels, context selection, catalog relationships, and commerce/content operating boundaries.",
    "searchText": "Store, Market, Site, and Channel Management Stores, markets, sites, channels, context selection, catalog relationships, and commerce/content operating boundaries.",
    "keywords": [
      "SECTION",
      "nodicsDocsNodeSecstoreMarketSiteAndChannelManagement",
      "Store, Market, Site, and Channel Management"
    ],
    "facets": {
      "ownerType": "SECTION",
      "ownerCode": "nodicsDocsNodeSecstoreMarketSiteAndChannelManagement"
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
  "record104": {
    "code": "nodicsDocsSearchdashboardnodicsdocsdashboardsecwcmsandcontentmanagement",
    "product": "nodicsDocumentationProduct",
    "targetType": "DASHBOARD",
    "targetCode": "nodicsDocsDashboardSecwcmsAndContentManagement",
    "title": "WCMS and Content Management",
    "summary": "CMS sites, catalogs, pages, components, routes, templates, slots, content authoring, and delivery behavior.",
    "searchText": "WCMS and Content Management CMS sites, catalogs, pages, components, routes, templates, slots, content authoring, and delivery behavior.",
    "keywords": [
      "SECTION",
      "nodicsDocsNodeSecwcmsAndContentManagement",
      "WCMS and Content Management"
    ],
    "facets": {
      "ownerType": "SECTION",
      "ownerCode": "nodicsDocsNodeSecwcmsAndContentManagement"
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
  "record105": {
    "code": "nodicsDocsSearchdashboardnodicsdocsdashboardsecproductcataloganddiscovery",
    "product": "nodicsDocumentationProduct",
    "targetType": "DASHBOARD",
    "targetCode": "nodicsDocsDashboardSecproductCatalogAndDiscovery",
    "title": "Product Catalog and Discovery",
    "summary": "Products, categories, attributes, catalog data, publication, discovery relationships, and customization.",
    "searchText": "Product Catalog and Discovery Products, categories, attributes, catalog data, publication, discovery relationships, and customization.",
    "keywords": [
      "SECTION",
      "nodicsDocsNodeSecproductCatalogAndDiscovery",
      "Product Catalog and Discovery"
    ],
    "facets": {
      "ownerType": "SECTION",
      "ownerCode": "nodicsDocsNodeSecproductCatalogAndDiscovery"
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
  "record106": {
    "code": "nodicsDocsSearchdashboardnodicsdocsdashboardsecsearchanddiscovery",
    "product": "nodicsDocumentationProduct",
    "targetType": "DASHBOARD",
    "targetCode": "nodicsDocsDashboardSecsearchAndDiscovery",
    "title": "Search and Discovery",
    "summary": "Search providers, discovery adapters, Elasticsearch, Solr, product indexing, content indexing, and query behavior.",
    "searchText": "Search and Discovery Search providers, discovery adapters, Elasticsearch, Solr, product indexing, content indexing, and query behavior.",
    "keywords": [
      "SECTION",
      "nodicsDocsNodeSecsearchAndDiscovery",
      "Search and Discovery"
    ],
    "facets": {
      "ownerType": "SECTION",
      "ownerCode": "nodicsDocsNodeSecsearchAndDiscovery"
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
  "record107": {
    "code": "nodicsDocsSearchdashboardnodicsdocsdashboardsecmediamanagement",
    "product": "nodicsDocumentationProduct",
    "targetType": "DASHBOARD",
    "targetCode": "nodicsDocsDashboardSecmediaManagement",
    "title": "Media Management",
    "summary": "Media records, upload, storage, metadata, provider choice, publication, delivery, cleanup, and reusable media lifecycle.",
    "searchText": "Media Management Media records, upload, storage, metadata, provider choice, publication, delivery, cleanup, and reusable media lifecycle.",
    "keywords": [
      "SECTION",
      "nodicsDocsNodeSecmediaManagement",
      "Media Management"
    ],
    "facets": {
      "ownerType": "SECTION",
      "ownerCode": "nodicsDocsNodeSecmediaManagement"
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
  "record108": {
    "code": "nodicsDocsSearchdashboardnodicsdocsdashboardsecinventoryandstockmanagement",
    "product": "nodicsDocumentationProduct",
    "targetType": "DASHBOARD",
    "targetCode": "nodicsDocsDashboardSecinventoryAndStockManagement",
    "title": "Inventory and Stock Management",
    "summary": "Inventory records, stock levels, reservations, availability, warehouse relationships, and operational stock behavior.",
    "searchText": "Inventory and Stock Management Inventory records, stock levels, reservations, availability, warehouse relationships, and operational stock behavior.",
    "keywords": [
      "SECTION",
      "nodicsDocsNodeSecinventoryAndStockManagement",
      "Inventory and Stock Management"
    ],
    "facets": {
      "ownerType": "SECTION",
      "ownerCode": "nodicsDocsNodeSecinventoryAndStockManagement"
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
  "record109": {
    "code": "nodicsDocsSearchdashboardnodicsdocsdashboardsecpricingpromotionsandtax",
    "product": "nodicsDocumentationProduct",
    "targetType": "DASHBOARD",
    "targetCode": "nodicsDocsDashboardSecpricingPromotionsAndTax",
    "title": "Pricing, Promotions, and Tax",
    "summary": "Price calculation, tax behavior, promotions, discount rules, exact decisions, and configuration.",
    "searchText": "Pricing, Promotions, and Tax Price calculation, tax behavior, promotions, discount rules, exact decisions, and configuration.",
    "keywords": [
      "SECTION",
      "nodicsDocsNodeSecpricingPromotionsAndTax",
      "Pricing, Promotions, and Tax"
    ],
    "facets": {
      "ownerType": "SECTION",
      "ownerCode": "nodicsDocsNodeSecpricingPromotionsAndTax"
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
  "record110": {
    "code": "nodicsDocsSearchdashboardnodicsdocsdashboardseccommercecartandcheckout",
    "product": "nodicsDocumentationProduct",
    "targetType": "DASHBOARD",
    "targetCode": "nodicsDocsDashboardSeccommerceCartAndCheckout",
    "title": "Commerce, Cart, and Checkout",
    "summary": "Cart creation, checkout calculation, order placement, idempotency, compensation, and checkout ownership.",
    "searchText": "Commerce, Cart, and Checkout Cart creation, checkout calculation, order placement, idempotency, compensation, and checkout ownership.",
    "keywords": [
      "SECTION",
      "nodicsDocsNodeSeccommerceCartAndCheckout",
      "Commerce, Cart, and Checkout"
    ],
    "facets": {
      "ownerType": "SECTION",
      "ownerCode": "nodicsDocsNodeSeccommerceCartAndCheckout"
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
  "record111": {
    "code": "nodicsDocsSearchdashboardnodicsdocsdashboardsecpaymentmanagement",
    "product": "nodicsDocumentationProduct",
    "targetType": "DASHBOARD",
    "targetCode": "nodicsDocsDashboardSecpaymentManagement",
    "title": "Payment Management",
    "summary": "Payment methods, providers, authorization, callbacks, capture, reconciliation, risk, and payment operations.",
    "searchText": "Payment Management Payment methods, providers, authorization, callbacks, capture, reconciliation, risk, and payment operations.",
    "keywords": [
      "SECTION",
      "nodicsDocsNodeSecpaymentManagement",
      "Payment Management"
    ],
    "facets": {
      "ownerType": "SECTION",
      "ownerCode": "nodicsDocsNodeSecpaymentManagement"
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
  "record112": {
    "code": "nodicsDocsSearchdashboardnodicsdocsdashboardsecloyaltyandrewards",
    "product": "nodicsDocumentationProduct",
    "targetType": "DASHBOARD",
    "targetCode": "nodicsDocsDashboardSecloyaltyAndRewards",
    "title": "Loyalty and Rewards",
    "summary": "Reward programs, reward types, owner wallets, balances, reservations, redemptions, ledger evidence, and reward-based checkout integration.",
    "searchText": "Loyalty and Rewards Reward programs, reward types, owner wallets, balances, reservations, redemptions, ledger evidence, and reward-based checkout integration.",
    "keywords": [
      "SECTION",
      "nodicsDocsNodeSecloyaltyAndRewards",
      "Loyalty and Rewards"
    ],
    "facets": {
      "ownerType": "SECTION",
      "ownerCode": "nodicsDocsNodeSecloyaltyAndRewards"
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
  "record113": {
    "code": "nodicsDocsSearchdashboardnodicsdocsdashboardsecshippingandfulfillment",
    "product": "nodicsDocumentationProduct",
    "targetType": "DASHBOARD",
    "targetCode": "nodicsDocsDashboardSecshippingAndFulfillment",
    "title": "Shipping and Fulfillment",
    "summary": "Shipping methods, fulfillment flow, warehouse handoff, shipment, tracking, and provider integration.",
    "searchText": "Shipping and Fulfillment Shipping methods, fulfillment flow, warehouse handoff, shipment, tracking, and provider integration.",
    "keywords": [
      "SECTION",
      "nodicsDocsNodeSecshippingAndFulfillment",
      "Shipping and Fulfillment"
    ],
    "facets": {
      "ownerType": "SECTION",
      "ownerCode": "nodicsDocsNodeSecshippingAndFulfillment"
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
  "record114": {
    "code": "nodicsDocsSearchdashboardnodicsdocsdashboardsecordermanagement",
    "product": "nodicsDocumentationProduct",
    "targetType": "DASHBOARD",
    "targetCode": "nodicsDocsDashboardSecorderManagement",
    "title": "Order Management",
    "summary": "Order state, ownership, operational actions, fulfillment coordination, and post-placement lifecycle.",
    "searchText": "Order Management Order state, ownership, operational actions, fulfillment coordination, and post-placement lifecycle.",
    "keywords": [
      "SECTION",
      "nodicsDocsNodeSecorderManagement",
      "Order Management"
    ],
    "facets": {
      "ownerType": "SECTION",
      "ownerCode": "nodicsDocsNodeSecorderManagement"
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
  "record115": {
    "code": "nodicsDocsSearchdashboardnodicsdocsdashboardseccancellationsreturnsandrefunds",
    "product": "nodicsDocumentationProduct",
    "targetType": "DASHBOARD",
    "targetCode": "nodicsDocsDashboardSeccancellationsReturnsAndRefunds",
    "title": "Cancellations, Returns, and Refunds",
    "summary": "Cancellation, return, refund, approvals, policies, reverse logistics, compensation, and customer/operator recovery.",
    "searchText": "Cancellations, Returns, and Refunds Cancellation, return, refund, approvals, policies, reverse logistics, compensation, and customer/operator recovery.",
    "keywords": [
      "SECTION",
      "nodicsDocsNodeSeccancellationsReturnsAndRefunds",
      "Cancellations, Returns, and Refunds"
    ],
    "facets": {
      "ownerType": "SECTION",
      "ownerCode": "nodicsDocsNodeSeccancellationsReturnsAndRefunds"
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
  "record116": {
    "code": "nodicsDocsSearchdashboardnodicsdocsdashboardseccustomerengagementandfeedback",
    "product": "nodicsDocumentationProduct",
    "targetType": "DASHBOARD",
    "targetCode": "nodicsDocsDashboardSeccustomerEngagementAndFeedback",
    "title": "Customer Engagement and Feedback",
    "summary": "Reviews, ratings, feedback, complaints, triage, follow-up, insights, moderation, and engagement operations.",
    "searchText": "Customer Engagement and Feedback Reviews, ratings, feedback, complaints, triage, follow-up, insights, moderation, and engagement operations.",
    "keywords": [
      "SECTION",
      "nodicsDocsNodeSeccustomerEngagementAndFeedback",
      "Customer Engagement and Feedback"
    ],
    "facets": {
      "ownerType": "SECTION",
      "ownerCode": "nodicsDocsNodeSeccustomerEngagementAndFeedback"
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
  "record117": {
    "code": "nodicsDocsSearchdashboardnodicsdocsdashboardseccommunicationandnotifications",
    "product": "nodicsDocumentationProduct",
    "targetType": "DASHBOARD",
    "targetCode": "nodicsDocsDashboardSeccommunicationAndNotifications",
    "title": "Communication and Notifications",
    "summary": "Templates, delivery intent, consent, suppression, providers, verification, callbacks, retry, and inbox behavior.",
    "searchText": "Communication and Notifications Templates, delivery intent, consent, suppression, providers, verification, callbacks, retry, and inbox behavior.",
    "keywords": [
      "SECTION",
      "nodicsDocsNodeSeccommunicationAndNotifications",
      "Communication and Notifications"
    ],
    "facets": {
      "ownerType": "SECTION",
      "ownerCode": "nodicsDocsNodeSeccommunicationAndNotifications"
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
  "record118": {
    "code": "nodicsDocsSearchdashboardnodicsdocsdashboardseceventandmessagingmanagement",
    "product": "nodicsDocumentationProduct",
    "targetType": "DASHBOARD",
    "targetCode": "nodicsDocsDashboardSeceventAndMessagingManagement",
    "title": "Event and Messaging Management",
    "summary": "Events, EMS, message providers, retry, failover, node responsibility transfer, and event-driven runtime refresh.",
    "searchText": "Event and Messaging Management Events, EMS, message providers, retry, failover, node responsibility transfer, and event-driven runtime refresh.",
    "keywords": [
      "SECTION",
      "nodicsDocsNodeSeceventAndMessagingManagement",
      "Event and Messaging Management"
    ],
    "facets": {
      "ownerType": "SECTION",
      "ownerCode": "nodicsDocsNodeSeceventAndMessagingManagement"
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
  "record119": {
    "code": "nodicsDocsSearchdashboardnodicsdocsdashboardsecprocessandworkflowautomation",
    "product": "nodicsDocumentationProduct",
    "targetType": "DASHBOARD",
    "targetCode": "nodicsDocsDashboardSecprocessAndWorkflowAutomation",
    "title": "Process and Workflow Automation",
    "summary": "Workflow definitions, runtime instances, tasks, approvals, incidents, transitions, and business process automation.",
    "searchText": "Process and Workflow Automation Workflow definitions, runtime instances, tasks, approvals, incidents, transitions, and business process automation.",
    "keywords": [
      "SECTION",
      "nodicsDocsNodeSecprocessAndWorkflowAutomation",
      "Process and Workflow Automation"
    ],
    "facets": {
      "ownerType": "SECTION",
      "ownerCode": "nodicsDocsNodeSecprocessAndWorkflowAutomation"
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
  "record120": {
    "code": "nodicsDocsSearchdashboardnodicsdocsdashboardsecpipelineandbusinesslogicorchestration",
    "product": "nodicsDocumentationProduct",
    "targetType": "DASHBOARD",
    "targetCode": "nodicsDocsDashboardSecpipelineAndBusinessLogicOrchestration",
    "title": "Pipeline and Business Logic Orchestration",
    "summary": "Pipeline-backed business logic, handlers, orchestration order, extension points, validation, and runtime behavior.",
    "searchText": "Pipeline and Business Logic Orchestration Pipeline-backed business logic, handlers, orchestration order, extension points, validation, and runtime behavior.",
    "keywords": [
      "SECTION",
      "nodicsDocsNodeSecpipelineAndBusinessLogicOrchestration",
      "Pipeline and Business Logic Orchestration"
    ],
    "facets": {
      "ownerType": "SECTION",
      "ownerCode": "nodicsDocsNodeSecpipelineAndBusinessLogicOrchestration"
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
  "record121": {
    "code": "nodicsDocsSearchdashboardnodicsdocsdashboardseccronandscheduledautomation",
    "product": "nodicsDocumentationProduct",
    "targetType": "DASHBOARD",
    "targetCode": "nodicsDocsDashboardSeccronAndScheduledAutomation",
    "title": "Cron and Scheduled Automation",
    "summary": "CronJobs, schedules, node execution, failover, responsibility transfer, recovery, and Task Execution Engine references.",
    "searchText": "Cron and Scheduled Automation CronJobs, schedules, node execution, failover, responsibility transfer, recovery, and Task Execution Engine references.",
    "keywords": [
      "SECTION",
      "nodicsDocsNodeSeccronAndScheduledAutomation",
      "Cron and Scheduled Automation"
    ],
    "facets": {
      "ownerType": "SECTION",
      "ownerCode": "nodicsDocsNodeSeccronAndScheduledAutomation"
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
  "record122": {
    "code": "nodicsDocsSearchdashboardnodicsdocsdashboardsecdataimportexportandmigration",
    "product": "nodicsDocumentationProduct",
    "targetType": "DASHBOARD",
    "targetCode": "nodicsDocsDashboardSecdataImportExportAndMigration",
    "title": "Data Import, Export, and Migration",
    "summary": "Data packs, import/export operations, migrations, manifests, checksums, release evidence, and DEAP references.",
    "searchText": "Data Import, Export, and Migration Data packs, import/export operations, migrations, manifests, checksums, release evidence, and DEAP references.",
    "keywords": [
      "SECTION",
      "nodicsDocsNodeSecdataImportExportAndMigration",
      "Data Import, Export, and Migration"
    ],
    "facets": {
      "ownerType": "SECTION",
      "ownerCode": "nodicsDocsNodeSecdataImportExportAndMigration"
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
  "record123": {
    "code": "nodicsDocsSearchdashboardnodicsdocsdashboardsecsystemintegrationandexternalconnectivity",
    "product": "nodicsDocumentationProduct",
    "targetType": "DASHBOARD",
    "targetCode": "nodicsDocsDashboardSecsystemIntegrationAndExternalConnectivity",
    "title": "System Integration and External Connectivity",
    "summary": "Adapters, providers, external systems, credentials, webhooks, callbacks, connectivity evidence, and integration operations.",
    "searchText": "System Integration and External Connectivity Adapters, providers, external systems, credentials, webhooks, callbacks, connectivity evidence, and integration operations.",
    "keywords": [
      "SECTION",
      "nodicsDocsNodeSecsystemIntegrationAndExternalConnectivity",
      "System Integration and External Connectivity"
    ],
    "facets": {
      "ownerType": "SECTION",
      "ownerCode": "nodicsDocsNodeSecsystemIntegrationAndExternalConnectivity"
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
  "record124": {
    "code": "nodicsDocsSearchdashboardnodicsdocsdashboardsecoperationsmonitoringandrecovery",
    "product": "nodicsDocumentationProduct",
    "targetType": "DASHBOARD",
    "targetCode": "nodicsDocsDashboardSecoperationsMonitoringAndRecovery",
    "title": "Operations, Monitoring, and Recovery",
    "summary": "Runtime topology, health, logs, monitoring, incidents, recovery, rollback, acceptance evidence, and support operations.",
    "searchText": "Operations, Monitoring, and Recovery Runtime topology, health, logs, monitoring, incidents, recovery, rollback, acceptance evidence, and support operations.",
    "keywords": [
      "SECTION",
      "nodicsDocsNodeSecoperationsMonitoringAndRecovery",
      "Operations, Monitoring, and Recovery"
    ],
    "facets": {
      "ownerType": "SECTION",
      "ownerCode": "nodicsDocsNodeSecoperationsMonitoringAndRecovery"
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
  "record125": {
    "code": "nodicsDocsSearchdashboardnodicsdocsdashboardsecqualitytestingandcertification",
    "product": "nodicsDocumentationProduct",
    "targetType": "DASHBOARD",
    "targetCode": "nodicsDocsDashboardSecqualityTestingAndCertification",
    "title": "Quality, Testing, and Certification",
    "summary": "Test strategy, regression gates, certification evidence, acceptance checks, generated contracts, and release qualification.",
    "searchText": "Quality, Testing, and Certification Test strategy, regression gates, certification evidence, acceptance checks, generated contracts, and release qualification.",
    "keywords": [
      "SECTION",
      "nodicsDocsNodeSecqualityTestingAndCertification",
      "Quality, Testing, and Certification"
    ],
    "facets": {
      "ownerType": "SECTION",
      "ownerCode": "nodicsDocsNodeSecqualityTestingAndCertification"
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
  "record126": {
    "code": "nodicsDocsSearchdashboardnodicsdocsdashboardsecdocumentationmanagement",
    "product": "nodicsDocumentationProduct",
    "targetType": "DASHBOARD",
    "targetCode": "nodicsDocsDashboardSecdocumentationManagement",
    "title": "Documentation Management",
    "summary": "Documentation authoring, content catalog, navigation components, publication lifecycle, access rules, and validation.",
    "searchText": "Documentation Management Documentation authoring, content catalog, navigation components, publication lifecycle, access rules, and validation.",
    "keywords": [
      "SECTION",
      "nodicsDocsNodeSecdocumentationManagement",
      "Documentation Management"
    ],
    "facets": {
      "ownerType": "SECTION",
      "ownerCode": "nodicsDocsNodeSecdocumentationManagement"
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
  "record127": {
    "code": "nodicsDocsSearchdashboardnodicsdocsdashboardsecreleasestagingandpublication",
    "product": "nodicsDocumentationProduct",
    "targetType": "DASHBOARD",
    "targetCode": "nodicsDocsDashboardSecreleaseStagingAndPublication",
    "title": "Release, Staging, and Publication",
    "summary": "Staged and Online publication, approval, immutable releases, rollback, visibility, publication evidence, and consumer delivery.",
    "searchText": "Release, Staging, and Publication Staged and Online publication, approval, immutable releases, rollback, visibility, publication evidence, and consumer delivery.",
    "keywords": [
      "SECTION",
      "nodicsDocsNodeSecreleaseStagingAndPublication",
      "Release, Staging, and Publication"
    ],
    "facets": {
      "ownerType": "SECTION",
      "ownerCode": "nodicsDocsNodeSecreleaseStagingAndPublication"
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
  "record128": {
    "code": "nodicsDocsSearchdashboardnodicsdocsdashboardsecaianddevelopertooling",
    "product": "nodicsDocumentationProduct",
    "targetType": "DASHBOARD",
    "targetCode": "nodicsDocsDashboardSecaiAndDeveloperTooling",
    "title": "AI and Developer Tooling",
    "summary": "AI tool guidance, generated context, safe automation, documentation generation, source-backed behavior, and developer tooling.",
    "searchText": "AI and Developer Tooling AI tool guidance, generated context, safe automation, documentation generation, source-backed behavior, and developer tooling.",
    "keywords": [
      "SECTION",
      "nodicsDocsNodeSecaiAndDeveloperTooling",
      "AI and Developer Tooling"
    ],
    "facets": {
      "ownerType": "SECTION",
      "ownerCode": "nodicsDocsNodeSecaiAndDeveloperTooling"
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
  "record129": {
    "code": "nodicsDocsSearchdashboardnodicsdocsdashboardsecreference",
    "product": "nodicsDocumentationProduct",
    "targetType": "DASHBOARD",
    "targetCode": "nodicsDocsDashboardSecreference",
    "title": "Reference",
    "summary": "Glossary, API references, source maps, configuration references, schema references, status codes, and appendices.",
    "searchText": "Reference Glossary, API references, source maps, configuration references, schema references, status codes, and appendices.",
    "keywords": [
      "SECTION",
      "nodicsDocsNodeSecreference",
      "Reference"
    ],
    "facets": {
      "ownerType": "SECTION",
      "ownerCode": "nodicsDocsNodeSecreference"
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
  "record130": {
    "code": "nodicsDocsSearchpagenodicsdocsmetadatadocsgateway",
    "product": "nodicsDocumentationProduct",
    "targetType": "PAGE",
    "targetCode": "nodicsDocsMetadatadocsGateway",
    "title": "Nodics Documentation",
    "summary": "Public documentation gateway for framework, Axis, Kickoff, and generated API contract entry points.",
    "searchText": "Nodics Documentation Public documentation gateway for framework, Axis, Kickoff, and generated API contract entry points. # Nodics Documentation\n\nNodics documentation is the governed reader entry point for understanding, setting up, operating, and extending a Nodics project. It should help a beginner decide where to go first, help a business user see the journey in plain language, help a developer find the owning module, and help an operator verify that the published experience matches the approved release.\n\nThis page is intentionally delivered as CMS documentation content. Nexus can render it publicly after publication, while Axis can render the same content for authenticated administrators. The browser application owns the renderer; the backend documentation pack owns the page, navigation, publication state, and search metadata.\n\n## Choose the right entry point\n\n| Entry point | Best reader | Use it when |\n| --- | --- | --- |\n| [Framework](/docs/framework) | Business, architect, developer, operator | You need the core architecture, module ownership, extension model, runtime behavior, publishing rules, or governance contract. |\n| [Nodics Axis](/docs/nodics-axis) | Administrator, author, operator | You need the authenticated BackOffice journey for setup, content operations, documentation management, process tasks, and publication. |\n| [Nodics Kickoff](/docs/nodics-kickoff) | Beginner, implementation partner, QA | You need the reference customer-project path from fresh schema to working Nexus and Agora applications. |\n| [Swagger and OpenAPI](/docs/nodics-axis/openapi-reference) | Developer, tester, integrator | You need generated runtime API contracts. Swagger is generated from active backend routes and does not require documentation publication approval. |\n\nThe first useful decision is not which page looks interesting. The first useful decision is what job the reader is trying to complete. A business reader should start with the framework value and adoption pages. A developer should start with architecture and module ownership. An operator or QA owner should start with local runtime, publication, and verification pages.\n\n## First setup sequence\n\nFresh setup should feel like one guided operational journey instead of a hunt through unrelated tools. The recommended sequence is:\n\n1. Start the local topology and open Axis.\n2. Initialize the Axis baseline so the managed BackOffice control plane exists.\n3. Register required capabilities for the application you want to run.\n4. Import the Nexus or Agora accelerator data pack.\n5. Review, approve, publish, and verify Online content in the browser.\n\nDocumentation packs can be imported and approved in parallel with application setup because they do not block module registration or application data preparation. Public Nexus readers see only documentation pages that are Online and public. Axis readers may use authenticated delivery where the route is intended for administrators.\n\n```mermaid\nflowchart LR\n  Runtime[\"Start runtime\"] --> Axis[\"Initialize Axis\"]\n  Axis --> Modules[\"Register capabilities\"]\n  Modules --> Apps[\"Import Nexus or Agora data\"]\n  Apps --> Publish[\"Approve and publish Online\"]\n  Publish --> Browser[\"Verify public pages\"]\n  Axis -. parallel .-> Docs[\"Import documentation packs\"]\n  Modules -. generated .-> Swagger[\"Open Swagger/OpenAPI\"]\n```\n\n## What appears before publication\n\nWhen no Online CMS content is available, public applications should show a customer-friendly maintenance state, not half-rendered placeholder content. That protects the customer experience and makes the setup status honest. Nexus and Agora should not show real headers, footers, promotional cards, catalog tiles, blogs, news, or documentation links until their Online content is approved and available.\n\nAxis is different because it is the authenticated control plane. It can show setup, import, approval, and publishing tasks before public content is ready. The Axis screen should make the next action clear: initialize data, register a missing module, approve a pending request, publish Online, or verify the public route.\n\n## How documentation publication works\n\nDocumentation content is prepared in a content pack, imported into Staged, reviewed in Axis, approved through the governed process task, and activated for Online delivery. Approval is permission-based. A user who has review, approve, and publish rights can complete the decision even if that same user requested the publication. A user without those permissions cannot approve simply because they can see the task.\n\nThe documentation navigation has only two levels: section and page link. Sections organize the reader journey, and page links open real pages directly. Avoid adding a third level just to preserve an internal hierarchy from source files. If a page covers several independent use cases, split those use cases into separate pages and place each one directly under the correct section.\n\n## Common mistakes\n\n- Do not put public documentation landing cards in Nexus React code when the CMS documentation pack can own them.\n- Do not hide Swagger behind CMS documentation approval. Swagger is generated from the active runtime contract and should remain independently available.\n- Do not import Agora data before the required Commerce and related capabilities are registered and active.\n- Do not treat an import success as a full site success unless media binaries, media objects, pages, routes, navigation, catalog data, blogs, news, and references are all present where the application expects them.\n- Do not make users jump between unrelated pages to review and approve one publication decision.\n\n## Verification\n\nVerify documentation as a customer journey, not only as canonical CMS records. From a fresh schema, start the topology, initialize Axis, import the documentation pack, submit approval, approve or reject through the queue, publish Online, and open the public Nexus documentation route in the browser. Confirm the left navigation refreshes, the page content resolves from CMS, the navigation is only section plus page link, and the public route shows an unpublished message instead of hardcoded content when Online data is absent.\n\nFor developers, run the CMS data validation and focused renderer tests after changing content, navigation records, or frontend documentation renderers. For operators, keep the publication status, audit trail, import run, and browser evidence together so a later reviewer can understand what changed and why it is safe for readers.\n\n## Continue\n\n- [Start with the framework](/docs/framework)\n- [Understand the documentation roadmap](/docs/framework/docs-documentation-roadmap)\n- [Review the publishing model](/docs/framework/docs-documentation-publishing-model)\n",
    "keywords": [
      "documentation",
      "gateway",
      "setup",
      "publishing",
      "nexus",
      "axis",
      "Nodics Documentation",
      "Start Here",
      "Publishing",
      "Setup"
    ],
    "facets": {
      "section": "start-here",
      "group": "start-here",
      "navigationDepth": 2,
      "documentType": "overview",
      "audience": [
        "business",
        "architect",
        "administrator",
        "developer",
        "operator",
        "qa"
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
  },
  "record131": {
    "code": "nodicsDocsSearchpagenodicsdocsmetadataframeworkoverview",
    "product": "nodicsDocumentationProduct",
    "targetType": "PAGE",
    "targetCode": "nodicsDocsMetadataframeworkOverview",
    "title": "What is Nodics?",
    "summary": "What Nodics is, how it supports AI-assisted development with human ownership, and how teams understand, customize and operate enterprise applications.",
    "searchText": "What is Nodics? What Nodics is, how it supports AI-assisted development with human ownership, and how teams understand, customize and operate enterprise applications. # What is Nodics?\n\nNodics is a modular enterprise application framework for building governed business platforms without forcing every project to reinvent authentication, content management, APIs, configuration, data import, publishing, workflow, scheduled jobs, media, documentation, and operational contracts. It is not a single finished storefront or one fixed business product. It is the framework foundation that customer projects, internal tools, public sites, accelerators, and solution use cases can build on.\n\nFor a beginner, the easiest mental model is this: Nodics gives the reusable enterprise machinery, while the customer project supplies the business-specific rules, content, branding, integrations, and runtime decisions. Axis is the authenticated business workspace. Nexus and Agora are public-facing applications that consume approved Online content and APIs. Backend modules remain the authority for data, permissions, workflows, routes, and publication.\n\n## Business definition\n\nNodics helps teams move faster without giving up enterprise governance. A business can start with a reference project, initialize the required data, publish public content, then customize behavior through Axis, configuration, provider adapters, services, pipelines, and project modules. The value is not only speed. The value is speed with a path to operate, secure, explain, extend, test, and upgrade the platform.\n\n| Business question | Nodics answer |\n| --- | --- |\n| What is being adopted? | A modular framework for enterprise application delivery. |\n| Who uses it? | Business users, administrators, developers, operators, QA owners, partners, and AI-assisted delivery tools. |\n| What does it reduce? | Repeated architecture work, customer forks, hidden configuration, unclear ownership, and fragile runtime changes. |\n| What does it enable? | Faster setup, governed customization, publishable content, reusable capability modules, and clearer production support. |\n\n## AI-assisted development with human ownership\n\nNodics is designed to let a team use AI without surrendering its ability to understand, change and operate the software. Faster code generation is useful only when the people responsible for the application can review the result, maintain it and recover when something goes wrong.\n\nEngineers moving from established enterprise systems bring valuable experience with services, validation, transactions, deployment and support. Adopting AI should build on that experience. Teams need a clear answer to what code should be written, where it belongs and how it becomes part of the running application. Nodics addresses this through module ownership, source definitions, supported extension points, layered configuration and shared implementation contracts.\n\nManual development remains a first-class way of working. A developer can write a feature, ask AI to help extend it, review the changes and maintain it later through the same source files and contracts. Human-written and AI-generated changes have the same obligations: explicit ownership, understandable code, security, validation, documentation and appropriate tests. The maintained application must not depend on access to the original coding conversation.\n\nFor example, when a customer needs a different validation rule, first identify the capability that owns validation and inspect its supported extension point. Put the customer-specific change in the customer project, document the inherited behavior and test both the new rule and the guarantees it must preserve. This path applies whether a developer or an AI tool writes the implementation.\n\n| Developer question | Nodics implementation discipline |\n| --- | --- |\n| What should change? | Define the business outcome and reuse the capability that already owns it. |\n| Where should it be written? | Identify the owning repository, module, layer and authoritative source file. |\n| How should it be customized? | Use supported properties, source definitions or loader-visible extension points; change the authoritative definitions and regenerate their outputs. |\n| What will run? | Inspect active modules, load order, effective configuration and the selected implementation for the intended runtime. |\n| How can another engineer maintain it? | Preserve purpose, extension guidance, focused tests and sanitized diagnostic and recovery information with the implementation. |\n\nAI-assisted coding and AI used inside an application are separate decisions. Using an AI coding tool does not require every business operation to call a model. When a feature does use AI at runtime, the provider boundary and failure handling must be explicit; Nodics security and owning domain services retain authorization, validation and execution authority.\n\nThese are engineering responsibilities, not a guarantee that generated code is correct or that every deployment is production-ready. A practical review is to ask an engineer who did not build the feature to explain it, make a supported change and diagnose a failure using the repository, documentation and governed tools. Missing explanations or tests are gaps to address before acceptance.\n\n## Technical definition\n\nTechnically, Nodics is a layered runtime. Framework modules live in `nodics.ai`. Customer projects such as Kickoff declare which framework modules and project modules load into Platform, WCMS, Process, and other runtime servers. Axis renders authorized capabilities from backend contracts. CMS content, documentation, storefront pages, media, routes, and publication state come from backend-owned content packs and catalogs.\n\n```mermaid\nflowchart LR\n  Framework[\"Nodics framework modules\"] --> Project[\"Customer project\"]\n  Project --> Runtime[\"Platform, WCMS, Process runtime\"]\n  Runtime --> Axis[\"Axis business workspace\"]\n  Runtime --> PublicApps[\"Nexus, Agora, partner apps\"]\n  Project --> Extensions[\"Configuration, providers, services, pipelines\"]\n```\n\n## What teams can build\n\nTeams can build employee BackOffice applications, public corporate sites, CMS-driven storefronts, commerce accelerators, process automation, scheduled jobs, integrations, documentation portals, data engineering solutions, and customer-specific project layers. The framework gives common contracts; the project decides which business journey is needed.\n\nNodics is also meant to work well with AI-assisted development. AI can help move quickly, but the framework keeps ownership explicit so generated changes do not scatter behavior across the wrong modules.\n\n## Where to continue\n\nUse the sibling pages in this group as the first reader path. Read **Why Nodics Exists** for the business problem and industry context. Read **How Nodics Works** for runtime, module, Axis, Nexus, Agora, and backend ownership. Read **Adoption and First Journey** for the first setup and verification path.\n\n## Common mistakes\n\n- Treating Nodics as one application instead of a framework used by many applications and solution use cases.\n- Assuming Axis owns backend records because administrators use Axis screens.\n- Expecting Nexus or Agora to show Staged content before Online publication.\n- Customizing framework source before checking project-layer extension paths.\n- Reading only technical modules before understanding the business journey.\n\n## Verification\n\nThis introduction is correct when a new business user can explain what Nodics is, a developer can identify framework versus project ownership, and an operator can explain why public apps only render approved Online content. The local proof is to start the reference workspace, initialize Axis, register required capabilities, import content packs, approve publication where needed, and verify Axis, Nexus, and Agora from the browser.\n",
    "keywords": [
      "nodics-framework",
      "framework-value-and-adoption",
      "what-is-nodics",
      "enterprise-framework",
      "Nodics Framework",
      "Framework Value and Adoption",
      "What is Nodics?",
      "Enterprise framework"
    ],
    "facets": {
      "section": "nodics-framework",
      "group": "nodics-framework",
      "navigationDepth": 2,
      "documentType": "overview",
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
  },
  "record132": {
    "code": "nodicsDocsSearchpagenodicsdocsmetadataframeworkwhynodicsexists",
    "product": "nodicsDocumentationProduct",
    "targetType": "PAGE",
    "targetCode": "nodicsDocsMetadataframeworkWhyNodicsExists",
    "title": "Why Nodics Exists",
    "summary": "Industry problems, business value, and why Nodics turns fast delivery into governed enterprise software.",
    "searchText": "Why Nodics Exists Industry problems, business value, and why Nodics turns fast delivery into governed enterprise software. # Why Nodics Exists\n\nNodics exists because most enterprise software teams are asked to move fast and stay governed at the same time. That sounds simple in planning meetings, but it becomes difficult when a product starts serving more than one customer, tenant, brand, region, channel, or operational team. A beginner usually sees the first working screen. A business sponsor sees the market opportunity. A developer sees the code that must survive the second and third wave of requirements. An operator sees the production system that must be explainable when something changes at runtime.\n\nThe framework was created to keep those viewpoints connected. It gives a project named capability owners, runtime composition, configuration layering, content publication, import/export discipline, extension points, and documentation contracts so teams can build quickly without losing the path to scale.\n\n## Business problem\n\nMany teams can now create a first product experience very quickly, especially with AI-assisted development. The difficult part is what happens after the first demo. Customers ask for custom rules. Security asks for permission boundaries. Operations asks how to rebuild an environment. QA asks what must be tested. Business users ask where they can update content, configuration, or workflow without waiting for a full engineering release.\n\nNodics treats those questions as product requirements, not afterthoughts. A business can use the framework to reduce the gap between first delivery and enterprise readiness.\n\n| Enterprise pressure | Common failure | Nodics response |\n| --- | --- | --- |\n| Faster go to market | One application grows without clear ownership. | Functional capabilities own APIs, schemas, data, documentation, and runtime behavior. |\n| Customer customization | Teams fork framework code for every customer. | Project modules extend or override behavior after framework modules load. |\n| Runtime change | Operators edit node-local settings manually. | Governed configuration and events propagate changes across running nodes. |\n| Public content | Draft and Online content become mixed. | Staged, approval, Online, access policy, and audit remain explicit. |\n| Supportability | New developers cannot tell where behavior lives. | Documentation and source maps explain business names and technical owners. |\n\n## From fast MVP to durable platform\n\nA fast MVP is useful because it proves demand. It becomes expensive when the implementation has no stable model for ownership, extension, permissions, data, media, imports, workflow, and runtime operation. The team then pays again to restructure the product while customers are already using it.\n\nNodics tries to avoid that rewrite. The same business idea can start quickly, but it is placed inside a framework that already expects multiple servers, publishable content, reusable modules, generated contracts, and project-layer customization. This lets developers and AI tools build inside guardrails instead of creating hidden behavior wherever the first screen happened to work.\n\n```mermaid\nflowchart LR\n  Idea[\"Business idea\"] --> MVP[\"Fast MVP\"]\n  MVP --> Pressure[\"Customer, tenant, security, operations pressure\"]\n  Pressure --> Contract[\"Nodics ownership and runtime contracts\"]\n  Contract --> Scale[\"Reusable product with project customization\"]\n```\n\n## Why a business should care\n\nFor a business reader, the value is not only that Nodics can produce APIs or screens. The value is that the product can continue changing after the first release. Teams can add a new site, publish new content, register another capability, switch a provider, add a project-layer service, or prepare a new accelerator without making the original framework unrecognizable.\n\nThat matters for revenue because delivery speed is only useful when the platform can keep accepting change. A company can start a customer project, show the working journey, publish content, and then add business-specific rules without turning every customer into a private fork. It also matters for cost because support, upgrade, security, and onboarding become easier when the system can explain its own owners and lifecycle.\n\n## What this means for developers\n\nA developer should treat every change as an ownership question. If the change is a reusable framework capability, it belongs in the owning framework module. If it is customer-specific, it belongs in the customer project or a later extension module. If it changes content, navigation, or public visibility, it belongs in the content catalog and publication workflow. If it changes runtime behavior, it needs configuration, validation, event propagation, tests, and operator guidance.\n\nThis is why Nodics documentation must stay detailed. The page should tell a developer which capability owns the behavior, how the project can extend it, which configuration keys or data records are involved, and how to verify the change from a fresh schema.\n\n## Operator and governance impact\n\nOperators need to know whether a change requires restart, publication, approval, cache invalidation, event propagation, or rollback. Nodics exists to make those decisions visible. Runtime servers load declared modules, generated contracts expose API boundaries, data packs carry versioned checksums, and publication state separates Staged work from Online delivery.\n\nFor production and support teams, this is the difference between \"the screen changed somehow\" and \"this approved content pack version became Online for this site, catalog, route, and access policy.\"\n\n## Common mistakes\n\n- Treating Nodics as only a folder structure instead of an ownership and runtime model.\n- Building a customer-specific behavior directly inside reusable framework source before checking project-layer extension points.\n- Letting Axis or a storefront become the authority for backend state because users see the screen there.\n- Shipping a fast MVP without documenting the business problem, extension path, configuration behavior, and production verification.\n- Assuming beginners only need technical files; business and operator context must be visible from the first documentation pages.\n\n## Verification\n\nThis page is useful when a new business reader can explain why Nodics exists without knowing the source tree, and when a developer can connect that story to module ownership, project-layer customization, content publication, and runtime operation. The minimum verification is to run the reference workspace, open Axis, inspect Module Registry, import or publish governed data, and confirm that Nexus or Agora only render Online content after approval.\n",
    "keywords": [
      "nodics-framework",
      "framework-value-and-adoption",
      "why-nodics-exists",
      "business-value",
      "enterprise-problems",
      "Nodics Framework",
      "Framework Value and Adoption",
      "Why Nodics Exists"
    ],
    "facets": {
      "section": "nodics-framework",
      "group": "nodics-framework",
      "navigationDepth": 2,
      "documentType": "overview",
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
  },
  "record133": {
    "code": "nodicsDocsSearchpagenodicsdocsmetadataframeworkhownodicsworks",
    "product": "nodicsDocumentationProduct",
    "targetType": "PAGE",
    "targetCode": "nodicsDocsMetadataframeworkHowNodicsWorks",
    "title": "How Nodics Works",
    "summary": "Mental model for framework modules, customer projects, Axis, public applications, runtime ownership, and customization.",
    "searchText": "How Nodics Works Mental model for framework modules, customer projects, Axis, public applications, runtime ownership, and customization. # How Nodics Works\n\nNodics works by separating business capability ownership from the physical files, servers, and screens that implement it. A beginner can think of Nodics as a framework that lets a project assemble enterprise capabilities without copying them into one large application. A business user can think of it as a governed way to change content, configuration, workflows, and operational data from Axis. A developer can think of it as a layered runtime where framework modules load first and customer project modules extend behavior safely.\n\nThe important rule is simple: the screen is not always the owner. Axis may render an operation, Nexus may render a public page, Agora may render a storefront, but backend modules own the data contracts, APIs, publication rules, permissions, and runtime services.\n\n## Mental model\n\nNodics has four major parts in the current reference experience:\n\n| Layer | What it does | Reader impact |\n| --- | --- | --- |\n| Framework modules | Provide reusable capabilities such as Platform, WCMS, Process, Foundation, Commerce, Discovery, Engagement, and Localization. | Developers learn where behavior is owned before changing code. |\n| Customer project | Declares runtime topology, project modules, data packs, configuration, and customization. | Business teams can launch a tailored solution without editing reusable framework source. |\n| Axis | Renders authenticated business and administrator workspaces from backend-owned metadata. | Business users manage capabilities through a guided interface. |\n| Public apps | Nexus, Agora, and other applications consume Online content and APIs. | Public users see only approved, published, and permitted experiences. |\n\n## Runtime flow\n\nThe runtime flow begins with a project environment. The project points to the framework checkout, declares which servers exist, and loads the modules needed by each server. Platform handles employee identity, profile, BackOffice metadata, module registration, and API discovery. WCMS handles sites, catalogs, pages, components, routes, documentation, and media. Process handles workflow and scheduled automation. Commerce and other domain modules add business capabilities when registered and active.\n\n```mermaid\nflowchart TD\n  Project[\"Customer project\"] --> Topology[\"Runtime topology\"]\n  Topology --> Platform[\"Platform server\"]\n  Topology --> WCMS[\"WCMS server\"]\n  Topology --> Process[\"Process server\"]\n  Platform --> Axis[\"Axis authenticated workspace\"]\n  WCMS --> Nexus[\"Nexus public site\"]\n  WCMS --> Agora[\"Agora storefront\"]\n  Process --> Approval[\"Workflow and scheduled operations\"]\n  Project --> Extensions[\"Project modules and configuration\"]\n  Extensions --> Platform\n  Extensions --> WCMS\n  Extensions --> Process\n```\n\n## Backend-driven experience\n\nAxis should not hardcode which business applications, imports, documentation pages, modules, or approvals exist. Those should come from backend component metadata, content catalog records, module registry records, process tasks, and publication state. This keeps the user journey customizable from Axis while the backend remains the authority.\n\nFor example, when documentation is published, the left navigation must refresh from the Online documentation content model. Swagger/OpenAPI can be available independently because it is generated API reference, not a CMS documentation pack. When an Agora or Nexus content pack is imported, the import must prepare the full site: media files, media records, pages, components, routes, catalog data, and publication workflow evidence.\n\n## Customization model\n\nDevelopers customize Nodics in the layer that owns the reason for change. Business labels, page hierarchy, visibility, and content areas belong in the content catalog. Provider changes, such as moving from local cache to Redis or from one search engine to another, belong in provider configuration and adapter contracts. Business logic belongs in services, validators, pipelines, or extension modules owned by the capability.\n\n```js\n// Example mental model, not a hardcoded navigation contract.\nconst customizationDecision = {\n  content: 'Axis-managed content catalog and publication workflow',\n  provider: 'configuration plus provider adapter',\n  businessLogic: 'service, validator, pipeline, or project extension',\n  publicPage: 'Online CMS route with access policy'\n};\n```\n\n## Operator view\n\nOperators care about whether the runtime can be explained. Nodics keeps configuration, module loading, imports, events, publication, and approvals as visible records. If a configuration change is pushed at runtime, the cluster must receive it through governed events. If a node is responsible for cron work and goes down, another node may take responsibility and transfer it back when the original node returns, depending on the capability design. Those are business continuity concerns, not only technical details.\n\n## Common mistakes\n\n- Assuming the application that displays data owns the data.\n- Importing a storefront content pack before the required domain capabilities are registered and active.\n- Hardcoding navigation, headers, footers, or public pages in Nexus or Agora instead of using backend content.\n- Treating Swagger as blocked by CMS publication when it is generated API reference.\n- Adding project behavior into the framework layer because that is the nearest file.\n\n## Verification\n\nA correct implementation can be verified from a fresh schema. Initialize Axis baseline data, register the required modules, import application content packs, submit and approve publication where required, then refresh the browser. Axis should show available backend-driven actions, Nexus and Agora should render only Online content, Swagger should remain independently accessible, and logs should show which server and module handled each step.\n",
    "keywords": [
      "nodics-framework",
      "framework-value-and-adoption",
      "how-nodics-works",
      "runtime-model",
      "backend-driven-experience",
      "Nodics Framework",
      "Framework Value and Adoption",
      "How Nodics Works"
    ],
    "facets": {
      "section": "nodics-framework",
      "group": "nodics-framework",
      "navigationDepth": 2,
      "documentType": "overview",
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
  },
  "record134": {
    "code": "nodicsDocsSearchpagenodicsdocsmetadataframeworkadoptionandfirstjourney",
    "product": "nodicsDocumentationProduct",
    "targetType": "PAGE",
    "targetCode": "nodicsDocsMetadataframeworkAdoptionAndFirstJourney",
    "title": "Adoption and First Journey",
    "summary": "The first business, developer, and operator path through setup, capability registration, imports, publishing, and browser verification.",
    "searchText": "Adoption and First Journey The first business, developer, and operator path through setup, capability registration, imports, publishing, and browser verification. # Adoption and First Journey\n\nThe first Nodics journey should help a reader move from concept to a running workspace without getting lost in module internals. A beginner should understand what Nodics is, start the local reference project, sign in to Axis, see which capabilities are available, initialize the required data, and open the public applications only after Online content exists. A business reader should see how fast the product can be prepared. A developer should see where customization belongs. An operator should see which services, data packs, and publication states prove the environment.\n\nThis page describes the adoption path, not every implementation detail. The deep module pages explain specific schemas, APIs, providers, pipelines, workflows, and project-layer override paths.\n\n## First visible framework success\n\nPrerequisites: use the repository's supported Node/npm toolchain, install its locked dependencies, and make `mongod` and `redis-server` available on `PATH`. From the framework repository, run:\n\n```bash\nnode nodics.foundation/modules/nTooling/test/projectRuntimeBootstrapLive.test.js --require-live --composition=foundation\n```\n\nThis is a disposable learning and acceptance environment. It creates its own loopback databases, project, generated schema service, Profile principals and explicit deployment grants. It starts an authority and a separate Foundation runtime, creates/updates/reads/removes a project record, renews credentials, rejects revoked credentials, restarts, and checks failure cleanup. It removes its own temporary project and providers when finished.\n\nSuccess ends with `PROFILE_START_PASS foundation`, `PROFILE_RESTART_PASS foundation` and `PROFILE_FAILURE_PASS foundation`. The failure marker means an injected failure was correctly rejected and cleaned up. A missing provider binary or missing success marker is a failed exercise; inspect its bounded evidence log and correct the prerequisite before continuing. Use `NODICS_MONGOD_BINARY` or `NODICS_REDIS_BINARY` for explicit binary paths.\n\nThe trusted initializer belongs only to this test fixture. Real projects must provision distinct runtime principals, retained proof and approved Profile scope through their operator/secret/data process before startup. Do not copy fixture credentials or bypass that step with a default account. See [Service Runtime Overrides](/docs/framework/foundation-service-runtime-overrides) for the implemented configuration and grant contract.\n\n## Understand and customize the example\n\nThe generated service belongs to the temporary project schema, while Foundation owns generation, request pipelines, persistence and authentication mechanics. The service sends its operation through the existing database pipelines; the project does not create another model loader or identity store.\n\nFor the complete layering exercise, run:\n\n```bash\nnode --test nodics.foundation/modules/nConfig/test/serverGeneratedArtifactContract.test.js\n```\n\nThe fixture creates framework, partner, project, environment and server modules. Its generated `DefaultItemService.value()` returns `generated`; the partner contributes `partner`; the project's matching method returns `authored`. Environment/server methods add separate behavior. Build and reload preserve the project value and all unrelated inherited methods. Changing one method does not require copying the generated service. The fixture verifies the same behavior for facades/controllers, records actual member origins, and removes its own files.\n\nUse this pattern in an existing project only after reading the real capability's contract. Add the matching exported method in the owning project layer, build the selected server with the installed shared command, restart it with its approved runtime identity, and run the capability's positive and rejection tests. Rollback removes or reverts that project contribution and repeats build/restart; it does not reverse any business data already changed by the customized method.\n\n## Add one new composition at a time\n\nUse the same live command with `--composition=inventory`, `commerce`, `cms`, `process` or `cluster`. Inventory runs separately; Commerce omits local Inventory; CMS is Online. Process exercises registration, required import, activation, deactivation and admitted-work completion. Cluster starts two node configurations and identities with one server-generated directory. These are framework acceptance examples; they do not demonstrate a production payment, storefront publication or provider failover.\n\n```mermaid\nflowchart TD\n  Framework[\"One shared framework checkout\"] --> Project[\"Customer project: authored definitions\"]\n  Project --> Environment[\"Environment: deployment differences\"]\n  Environment --> Server[\"Server: capability composition and generated code\"]\n  Server --> NodeA[\"Node A: port and instance credentials\"]\n  Server --> NodeB[\"Node B: port and instance credentials\"]\n  NodeA --> Generated[\"The same server-generated files\"]\n  NodeB --> Generated\n```\n\nThe server decides functionality. Nodes can supply configuration differences and separate identities; they do not own duplicate generated implementations. Continue with the reference application journey below when a team needs visible administration/content/storefront workflows and their publication prerequisites.\n\n## Learning path and prerequisites\n\nUse this path for the framework exercises above. Each row names the concept to learn first, the result to check and the next source of detail. A reader entering through search can start at the prerequisite column instead of guessing missing setup. Business readers can follow stages 1, 2 and 7; developers follow 1–6; operators continue through 8; experienced maintainers can enter stage 9 directly.\n\n| Stage and topic | Prerequisite | Result to check | Continue with |\n| --- | --- | --- | --- |\n| 1. Purpose and value | A business capability the team needs to deliver | Explain framework versus customer responsibility and the value of reusable capabilities | [Modular architecture](/docs/framework/framework-modular-architecture) |\n| 2. Runtime mental model | Framework/project ownership | Identify module, environment, server and node in the diagram above | [Runtime configuration](/docs/framework/configuration-runtime-behavior-management) |\n| 3. First visible success | Supported Node/npm, installed dependencies, MongoDB and Redis binaries | Run the Foundation exercise and recognize all three success markers | The working-example explanation above |\n| 4. Understand the request | Successful generated-record exercise | Trace the project schema through generated service and existing database pipelines | [Schema and data modeling](/docs/framework/schema-data-modeling-management) |\n| 5. One customization | Indexed module contributions | Run the five-layer example, identify the winning method and preserve unrelated inherited methods | [Service runtime overrides](/docs/framework/foundation-service-runtime-overrides) |\n| 6. Predict effective behavior | The customization example | Explain target-owned build/clean, inherited differences and required rebuild/restart | [Runtime configuration](/docs/framework/configuration-runtime-behavior-management) |\n| 7. Add business capabilities | A working baseline and approved runtime grants | Start separate Inventory, Commerce, CMS, Process and cluster examples with their stated limits | [Module communication](/docs/framework/foundation-module-to-module-communication) and [data import](/docs/framework/data-import-export-migration) |\n| 8. Operate and recover | Registration, activation, identity and provider ownership | Refuse unauthorized new work, distinguish admitted work, and verify startup-failure cleanup | [Startup lifecycle](/docs/framework/configuration-framework-startup-lifecycle) |\n| 9. Compatibility and reference | The effective contract being changed | Locate member origins, plan persisted migration and test the effective override's guarantees | [Release and upgrade compatibility](/docs/framework/framework-release-upgrade-compatibility) |\n\nThe examples establish executable technical outcomes. Reader comprehension and the published browser experience require separate observation; passing an exercise does not prove that a first-time reader understood the explanation.\n\n## First reader sequence\n\nThe documentation should not force a new reader to open every framework module before seeing the product. The sequence should be practical:\n\n| Step | Reader action | Why it matters |\n| --- | --- | --- |\n| 1 | Read What is Nodics and Why Nodics Exists. | Understand the business reason before touching code. |\n| 2 | Open the Kickoff setup and local runtime pages. | Learn the reference project and server topology. |\n| 3 | Start Platform, WCMS, Process, Axis, Nexus, and Agora as required. | See the runtime boundary instead of guessing from folders. |\n| 4 | Initialize Axis baseline data. | Axis needs governed content and administration data before full workspace use. |\n| 5 | Register required modules and capabilities. | Storefront packs should not pretend to work without their domain owners. |\n| 6 | Import Nexus, Agora, documentation, and sample data packs. | Content, media, pages, and routes become Staged records. |\n| 7 | Publish approved Online content and verify browsers. | Public apps render Online data only. |\n\n## Business adoption journey\n\nFor business users, adoption starts with confidence that the platform can support fast revenue without becoming fragile. The reference workspace should show how an administrator can prepare Axis, initialize a corporate site, prepare storefront accelerators, approve publication, and confirm the public experience. The journey should make the next action obvious from the screen.\n\nIf a pack needs approval, the user should see the pending item and approve or reject it in the same operational place when their role permits it. If a site is not Online yet, the public app should show a professional maintenance page, not hidden framework data. If data is missing, the UI should explain what must be initialized first.\n\n## Developer adoption journey\n\nDevelopers should start by running the product and then tracing ownership. After the fresh environment is visible, they can study how the project points to `nodics.ai`, how Kickoff declares local topology, how modules register capabilities, how data packs import Staged records, and how Axis reads backend-owned metadata.\n\n```mermaid\nflowchart LR\n  Clone[\"Open framework and project\"] --> Start[\"Start local servers\"]\n  Start --> Axis[\"Sign in to Axis\"]\n  Axis --> Registry[\"Register capabilities\"]\n  Registry --> Import[\"Import content and sample data\"]\n  Import --> Publish[\"Approve and publish Online\"]\n  Publish --> Customize[\"Customize from project layer\"]\n```\n\nThe first customization should happen in the project layer or through Axis managed content, not by editing framework source. That habit keeps the framework upgradeable.\n\n## Operator adoption journey\n\nOperators adopt Nodics by learning the runtime evidence. They should know how to check server status, port ownership, logs, data import state, publication state, task queues, content routes, and public delivery. When a local schema is fresh, operators should be able to explain why Axis may start in a recovery workspace, why Nexus or Agora may show a maintenance page, and which import or publication action unlocks the normal experience.\n\nOperational adoption also includes knowing what can run in parallel. Documentation imports can happen alongside other setup work because they publish documentation content. Commerce-dependent Agora data must wait until commerce capabilities are registered because the storefront data relies on domain models.\n\n## Documentation entry points\n\nThe first navigation level must stay friendly. Business users should see capabilities and journeys, not raw module package names. Developers and AI tools still need exact source ownership, so each detailed page should include source maps, module names, configuration keys, APIs, events, and validation commands in the page body.\n\n| Entry point | Best for | Continue to |\n| --- | --- | --- |\n| What is Nodics? | First-time business, developer, and operator readers. | Why Nodics Exists and How Nodics Works. |\n| Documentation Roadmap | Readers choosing their route through the docs. | Reader Journey and Coverage. |\n| Kickoff setup | Teams starting a local reference environment. | Local runtime, acceptance checklist, and publishing operations. |\n| Axis guide | Administrators using the BackOffice workspace. | Module registry, imports, documentation publication, and workflows. |\n\n## Common mistakes\n\n- Trying to understand every package before running the reference environment.\n- Importing Agora data before the commerce capability is registered.\n- Expecting Nexus or Agora to show full public content before Online publication exists.\n- Treating documentation import as a one-time exercise instead of a recurring content-pack release process.\n- Putting customer-specific setup rules only in environment files instead of project-owned configuration and installer-generated workspace data.\n\n## Verification\n\nThe adoption journey is correct when a new user can start from a clean schema, follow the setup sequence, and understand each next action from Axis without asking which page owns it. Verification should include browser checks for Axis, Nexus, and Agora, plus data evidence that required modules are registered, content packs are imported, publication tasks can be approved or rejected by authorized users, and public apps show Online content or a customer-friendly maintenance page.\n",
    "keywords": [
      "nodics-framework",
      "framework-value-and-adoption",
      "adoption",
      "first-journey",
      "fresh-schema-setup",
      "Nodics Framework",
      "Framework Value and Adoption",
      "Adoption and First Journey"
    ],
    "facets": {
      "section": "nodics-framework",
      "group": "nodics-framework",
      "navigationDepth": 2,
      "documentType": "overview",
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
  },
  "record135": {
    "code": "nodicsDocsSearchpagenodicsdocsmetadatadocsdocumentationroadmap",
    "product": "nodicsDocumentationProduct",
    "targetType": "PAGE",
    "targetCode": "nodicsDocsMetadatadocsDocumentationRoadmap",
    "title": "Documentation Roadmap",
    "summary": "How the Nodics documentation product is organized and how readers choose the right path through the enterprise hierarchy.",
    "searchText": "Documentation Roadmap How the Nodics documentation product is organized and how readers choose the right path through the enterprise hierarchy. # Documentation Roadmap\n\nHow business users, developers, operators, QA owners, and AI tools navigate the governed Nodics documentation set. This page is intentionally written for beginners, business users, developers, operators, architects, QA owners, and AI tools. It explains the business problem first, then the technical ownership model, then the exact customization and verification responsibilities so nobody has to guess where a change belongs.\n\nLarge enterprise platforms fail when readers cannot tell where to start, which page is authoritative, or whether a topic is business guidance, project customization, runtime operation, or source reference. The roadmap separates high-level understanding, module capability pages, extension guidance, operational runbooks, and reference material while keeping all pages backend-owned, publishable, searchable, and governed by content catalog metadata.\n\n## Business context\n\nFor a business user, this topic answers what decision can be made, which operational journey is supported, and what risk is reduced. The practical value is faster delivery without losing governance: teams can understand the current capability, decide whether it applies to their project, and know when Axis, Nexus, content catalog, workflow, or runtime services are involved.\n\nFor beginners, the mental model is simple: the page title is the business capability, the table identifies who owns each part, and the diagram shows how a request or change flows. A reader should not need source-code knowledge to understand the journey, but the developer path is still available when customization is needed.\n\n| Business question | Answer for this topic |\n| --- | --- |\n| What problem does it solve? | Large enterprise platforms fail when readers cannot tell where to start, which page is authoritative, or whether a topic is business guidance, project customization, runtime operation, or source reference. |\n| Who uses it? | Business users, administrators, developers, operators, QA owners, implementation partners, and AI-assisted delivery tools. |\n| What changes can it support? | The roadmap separates high-level understanding, module capability pages, extension guidance, operational runbooks, and reference material while keeping all pages backend-owned, publishable, searchable, and governed by content catalog metadata. |\n| What must be governed? | Permissions, validation, source ownership, publication state, runtime impact, audit evidence, and rollback boundaries. |\n\n## Journey and ownership\n\nNodics Docs owns the public documentation product, publication metadata, navigation hierarchy, and canonical content pack records; Axis edits and previews through backend APIs, and Nexus consumes Online public pages. This keeps the reader-facing name friendly while preserving exact source ownership for developers and AI tools. Axis may render management screens or authenticated documentation, Nexus may render public Online content, and the backend content catalog remains authoritative for navigation, pages, access policies, and publication state.\n\n```mermaid\nflowchart LR\n  Reader[\"Business or developer request\"] --> Axis[\"Axis or Nexus view\"]\n  Axis --> Backend[\"Owning backend capability\"]\n  Backend --> Catalog[\"Content/catalog/schema/config records\"]\n  Catalog --> Runtime[\"Runtime behavior or published page\"]\n  Runtime --> Evidence[\"Audit, validation, and support evidence\"]\n```\n\n| Responsibility | Owner | Notes |\n| --- | --- | --- |\n| Business capability name | Documentation Roadmap | Used in navigation and dashboards so readers are not exposed to raw module names first. |\n| Source owner | nodics.docs | Carries exact implementation, documentation, and validation evidence. |\n| Technical module | documentation | Holds the relevant schema, service, router, data, or contract detail where applicable. |\n| Axis experience | Backend-declared workspace | Axis renders metadata and actions but does not become the authority. |\n| Public experience | Online content delivery | Nexus renders only records approved for public access. |\n\n## Data and configuration detail\n\nEvery topic must explain the data that changes behavior. Some topics are schema-driven, some are configuration-driven, some are publishable content, and some are operational records. The documentation must say which category applies before showing code. That keeps production operators and developers aligned on whether a change needs publication, restart, event propagation, approval, or only a project-layer override.\n\n| Detail area | What to document | Verification signal |\n| --- | --- | --- |\n| Model or record | Type code, catalog, tenant, enterprise, state, owner, and lifecycle. | Schema contract or generated model test. |\n| Configuration key | Default value, override location, environment scope, and runtime impact. | Config validation and runtime refresh evidence. |\n| API or event | Route/event name, payload boundary, permission, idempotency, and failure mode. | Route, service, event, and authorization tests. |\n| Publication and access | Staged/Online state, access mode, roles, groups, and permissions. | Content-pack validation and access-policy test. |\n\n```js\ndocumentationNavigation: { product: \"nodicsDocumentationProduct\", expandable: true, source: \"contentCatalog\" }\n```\n\n## Customization and extension\n\nDevelopers should customize from the project layer first. A customer project may add properties, services, validators, pipelines, renderers, data packs, or provider configuration when the extension respects the owning capability. Business users may update governed records in Axis when the record is designed for administration. Framework source changes are reserved for improving the reusable product capability itself.\n\n| Customization type | Recommended path | Avoid |\n| --- | --- | --- |\n| Business label, navigation, or content area | Axis-managed content catalog item with publication workflow. | Hardcoding labels or page trees in the frontend. |\n| Runtime setting | Module configuration with validation and governed runtime propagation. | Editing node-local files on each server by hand. |\n| Domain behavior | Extension service, validator, pipeline step, or provider adapter. | Forking the standard module for customer-only logic. |\n| Public visibility | Access policy with public/authenticated/role-based state. | Exposing internal or draft pages through Nexus. |\n\n## Operations and governance\n\nOperators need production-safe evidence, not only implementation notes. Each page must call out logging, tracing, permission checks, event propagation, data import/export, publication status, rollback behavior, and troubleshooting. If a capability affects multiple nodes, the documentation must explain how changes reach every node and how a partial failure is detected.\n\n| Operational concern | Required documentation detail |\n| --- | --- |\n| Security | Authentication mode, permission code, role/group, tenant and enterprise isolation. |\n| Audit | Actor, timestamp, source record, checksum, approval, route/event, and result. |\n| Resilience | Retry, idempotency, compensation, fallback, cache invalidation, and rollback. |\n| Observability | Logs, metrics, dashboard cards, health checks, and support evidence. |\n\n## README segregation contract\n\nREADME files are source-adjacent entry points. They help a developer, AI tool, or GitHub visitor identify what a module owns and where to continue reading. They are not the place for full business journeys, screenshots, long provider matrices, configuration tutorials, migration guides, or operator runbooks. Those details belong in the backend-owned documentation content catalog in the implementing module's `data/docs-v001` CMS records, with shared cross-framework guidance and explicit composition in `nodics.docs` so they can be published, permissioned, searched, approved, localized, and rendered through Axis and Nexus.\n\n| README section | Required purpose | What must move to real docs |\n| --- | --- | --- |\n| Title and one paragraph | Name the module and its capability boundary. | Long product positioning and full business journeys. |\n| Responsibility | State what the module owns and what it does not own. | Full schema tables, API matrices, and lifecycle runbooks. |\n| Developer Notes | Give crisp source-adjacent implementation cautions. | Provider tutorials, customization walkthroughs, and production operations. |\n| Documentation | Link to the authoritative deep docs pages. | Duplicated public documentation content. |\n| Verification | List the focused validation path. | Complete troubleshooting guides and release evidence matrices. |\n\nInstaller and the `nodics.ai` root README are exceptions because they are direct GitHub entry points. All other module README files should stay below the thinness threshold and continue readers into real documentation. When a future implementation adds functionality, the developer or AI tool must update the canonical CMS page and article blocks, source map, access policy, visual evidence, and validation commands. The README should only add or adjust the short pointer if the module responsibility or deep documentation location changed.\n\n## Common mistakes\n\n- Treating a friendly navigation label as the technical source owner.\n- Writing only developer details and skipping the business decision that the page supports.\n- Updating Axis or Nexus code when the content catalog, schema, or backend capability should own the change.\n- Forgetting access rules for public, authenticated, role-based, group-based, or permission-based pages.\n- Skipping diagrams, comparison tables, source maps, or troubleshooting matrices because the topic feels obvious.\n- Changing runtime behavior without explaining production impact, cluster propagation, and rollback.\n- Leaving CMS documentation without source evidence, validation commands, and maturity state.\n\n## Verification\n\nVerification starts with the document itself: it must include business context, technical ownership, a visual flow, data or configuration tables, customization guidance, common mistakes, and validation evidence. Developers and AI tools maintain the page directly as backend-owned CMS data and validate its declared checksums, lifecycle, navigation, access policy, publication state, and search metadata. No separate Markdown authoring source or prose generator is required.\n\nFor implementation verification, run the owning module tests and any Axis or Nexus renderer tests that consume the page. Operators should confirm that production-like runtime behavior matches the documentation: permissions reject unauthorized access, Online pages do not expose Staged data, runtime changes propagate through governed events, and troubleshooting evidence is available without exposing secrets.\n",
    "keywords": [
      "documentation-roadmap",
      "documentation-organization",
      "reader-navigation",
      "Documentation Roadmap",
      "Reader Journey and Coverage Map",
      "Documentation organization"
    ],
    "facets": {
      "section": "documentation-roadmap",
      "group": "documentation-roadmap",
      "navigationDepth": 2,
      "documentType": "overview",
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
  },
  "record136": {
    "code": "nodicsDocsSearchpagenodicsdocsmetadatadocsdocumentationprinciples",
    "product": "nodicsDocumentationProduct",
    "targetType": "PAGE",
    "targetCode": "nodicsDocsMetadatadocsDocumentationPrinciples",
    "title": "Documentation Principles",
    "summary": "Framework-level documentation rules for README thinness, detailed docs depth, visual evidence, customization, publishing, and access.",
    "searchText": "Documentation Principles Framework-level documentation rules for README thinness, detailed docs depth, visual evidence, customization, publishing, and access. # Documentation Principles\n\nNodics documentation is part of the framework contract. It is not a one-time project clean-up activity. Every new capability, configuration option, provider, workflow, API, data pack, Axis journey, Nexus page, Agora storefront, or project-layer extension must carry documentation that helps business users, developers, operators, QA owners, and AI tools understand what changed and how to use it safely.\n\nThe principle is direct: README files stay thin and source-adjacent, while real documentation under the backend-owned documentation content model stays deep, visual, publishable, permissioned, searchable, and governed.\n\n## README and real documentation split\n\nModule README files help a GitHub visitor, developer, or AI tool identify what the module owns. They should be crisp. They should not become full training manuals, production runbooks, provider migration guides, or long business journeys. Installer README and the `nodics.ai` root README are exceptions because they are public entry points into the whole workspace.\n\n| Location | Purpose | Detail level |\n| --- | --- | --- |\n| Module `README.md` | State module responsibility, boundaries, warnings, and links to deep docs. | Thin and module-specific. |\n| Module CMS records under `data` | Explain implemented capability details owned by that module. | Deep, visual, testable, and customization-focused. |\n| `nodics.docs` | Framework-wide product documentation and navigation source. | Enterprise hierarchy with business and technical journeys. |\n| Canonical CMS content pack | Publishable documentation data imported into Staged and Online. | Backend-owned records with access, workflow, search, and checksums. |\n\n## CMS data preservation contract\n\nDocumentation is CMS data maintained directly in the owning module release. Update CMS pages, article component blocks, navigation and documentation metadata under `data/docs-v001/records/documentation`, and declare their checksums in `data/manifest.json`. No separate Markdown source or prose generator is required. Keep detailed examples and source evidence when changing records. Images are Media records and release assets referenced by stable `mediaCode`; storage, access and Online delivery remain Media-owned. Import through nImport into Staged, review and approve, then publish through the existing CMS and Media publication contracts. Source validation is not proof of live publication.\n\nWhen a topic is missing, create the CMS page, article component blocks, navigation and metadata in the owning data release, declare their hashes and source evidence, then validate. When a topic exists, update those same records and preserve their detailed guidance. Git review protects the canonical CMS data; validation does not rewrite prose.\n\n| Area | Authority | Maintenance and validation |\n| --- | --- | --- |\n| `data/docs-v001/records/documentation/*ComponentData.js` | Owning implementation team and AI-assisted review | Canonical article content. Preserve detailed guidance in every update. |\n| `data/manifest.json` | Owning release maintainer | Declare publication metadata and integrity hashes alongside the CMS records. |\n| `data/docs-v001/records/documentation/*.js` | Canonical CMS content pack | Create or update directly with page, navigation, access and Media metadata. |\n| `data/core-v001/headers/*.js` | Canonical nImport routing metadata for this pack | Maintain target schemas and Staged routing through the existing nImport contract. |\n| `data/manifest.json` | Declared release integrity evidence | Review and update the documentation section and declared checksums. |\n\n## Required topic depth\n\nEach detailed topic must explain the business problem first, then technical ownership. It should not be only a list of files. A business user should know what decision the page supports. A developer should know where to extend. An operator should know runtime impact. QA should know what to validate. AI tools should know which source owner to inspect before suggesting changes.\n\nRequired detail includes data models, configuration keys, APIs, events, extension points, project-layer override paths, validation, troubleshooting, security, access policy, publication state, and operational impact wherever those are applicable.\n\n## Visual contract\n\nDocumentation must not become boring blocks of text. The page should use visual explanation where it helps the reader understand flow, ownership, sequence, comparison, schema, or state. Diagrams, data-flow visuals, state-flow diagrams, module hierarchy diagrams, tabular comparisons, schema tables, screenshots, and code snippets are expected for serious capability pages.\n\n```mermaid\nflowchart TD\n  Business[\"Business perspective\"] --> Page[\"Documentation topic\"]\n  Technical[\"Technical perspective\"] --> Page\n  Page --> Visuals[\"Diagrams, tables, screenshots, examples\"]\n  Page --> Validation[\"Tests, browser evidence, audit checks\"]\n  Page --> Publishing[\"Staged review and Online delivery\"]\n```\n\n## Configuration and customization principle\n\nLow-level configuration details are important because they change application behavior. If a project can switch from local cache to Redis, change a provider, extend a schema, add a service, override business logic, add a navigation item, or configure a content area, the documentation must explain the exact path. The same rule applies across cache, search, commerce, WCMS, workflow, events, media, localization, profile, and every other capability.\n\nBusiness users may configure governed records in Axis when the capability is designed for administration. Developers extend from project modules when code is required. Framework source changes are reserved for reusable framework capabilities.\n\n## Publishing and access principle\n\nReal documentation is content. It must be modeled through content catalog records, not hardcoded frontend JSON. Axis is the management and preview experience. Staged holds the working copy. Approval governs Online publication. Nexus and public links consume Online content only when the access policy allows it. Some pages are public; some require authentication, roles, groups, or permissions.\n\n| Governance area | Documentation requirement |\n| --- | --- |\n| Access | Public, authenticated, role-based, group-based, or permission-based behavior. |\n| Workflow | What edit triggers review, approval, publishing, and audit. |\n| Search | Keywords, topic metadata, and future index readiness. |\n| Evidence | Source path, generated record, checksum, browser proof, and validation command. |\n\n## Common mistakes\n\n- Writing only technical implementation notes and skipping the business decision or operational journey.\n- Keeping detailed provider or configuration guidance only in README files.\n- Adding screenshots without explaining the data or permission model behind the screen.\n- Publishing documentation navigation from frontend constants instead of the backend content catalog.\n- Forgetting to update CMS documentation data when implementation behavior changes.\n\n## Verification\n\nDocumentation is acceptable when it passes the canonical CMS data validation contract, imports as governed content, supports Staged and Online lifecycle, and helps a beginner complete the journey without hidden tribal knowledge. A developer should be able to identify the owning module, configuration path, extension point, test command, and browser verification from the page itself.\n",
    "keywords": [
      "documentation-roadmap",
      "reader-journey-and-coverage-map",
      "documentation-principles",
      "readme-contract",
      "visual-contract",
      "Documentation Roadmap",
      "Reader Journey and Coverage Map",
      "Documentation Principles"
    ],
    "facets": {
      "section": "documentation-roadmap",
      "group": "documentation-roadmap",
      "navigationDepth": 2,
      "documentType": "overview",
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
  },
  "record137": {
    "code": "nodicsDocsSearchpagenodicsdocsmetadatadocsreaderjourneyandcoverage",
    "product": "nodicsDocumentationProduct",
    "targetType": "PAGE",
    "targetCode": "nodicsDocsMetadatadocsReaderJourneyAndCoverage",
    "title": "Reader Journey and Coverage",
    "summary": "How business users, developers, operators, QA owners, administrators, and AI tools navigate capability documentation.",
    "searchText": "Reader Journey and Coverage How business users, developers, operators, QA owners, administrators, and AI tools navigate capability documentation. # Reader Journey and Coverage\n\nNodics documentation must serve multiple readers at the same time without making any of them feel lost. A business user wants to know what the capability does and which decision it supports. A developer wants exact ownership, configuration, extension, API, and testing detail. An operator wants runtime, publishing, logs, rollback, and support evidence. A QA owner wants acceptance criteria. An AI tool needs source boundaries so it does not edit the nearest file and create the wrong authority.\n\nThe reader journey is therefore not a decorative navigation choice. It is a framework contract for how capability knowledge is organized.\n\n## Audience paths\n\nEach page should make the entry path clear. A beginner can start from the business story, then move into the running product, then into ownership and customization. A specialist can jump directly to the capability page and still find the tables, diagrams, and validation evidence they need.\n\n| Reader | First question | Page must provide |\n| --- | --- | --- |\n| Business user | What problem does this solve? | Outcome, supported operation, risk, approval, and impact. |\n| Administrator | What can I do in Axis? | UI journey, permissions, workflow state, and next action. |\n| Developer | Where do I extend safely? | Owning module, schema, service, configuration, API, event, and project path. |\n| Operator | What changes at runtime? | Server graph, logs, health, event propagation, rollback, and support evidence. |\n| QA owner | How is this accepted? | Data setup, browser path, API checks, tests, and failure cases. |\n| AI tool | What is authoritative? | Source owner, generated artifacts, source map, and forbidden shortcuts. |\n\n## Coverage map\n\nThe documentation hierarchy should be broad enough that users recognize the business capability before they see raw implementation names. WCMS and Content Management, Product Catalog and Discovery, Cart and Checkout, Payments, Shipping, Order Management, Returns and Refunds, Users and Enterprise Management, Stock, Pricing, Process Workflows, Cron and Scheduled Automation, Search and Discovery Providers, Accelerators and Industry Templates, and Solution Use Cases are examples of business-friendly groups.\n\n```mermaid\nflowchart LR\n  Start[\"Framework story\"] --> Setup[\"Setup and runtime\"]\n  Setup --> Admin[\"Axis administration\"]\n  Admin --> Capabilities[\"Business capability groups\"]\n  Capabilities --> Extend[\"Customization and extension\"]\n  Extend --> Operate[\"Operations, QA, and support\"]\n```\n\n## Topic composition\n\nEvery capability page should be predictable. Readers should not have to guess whether a page contains only technical notes or the full business journey. When a capability is backend-owned but rendered in Axis, the page must explain both. When public content is visible in Nexus or Agora, the page must explain Staged, approval, Online delivery, and access policy.\n\nRecommended sections include business context, journey and ownership, data and configuration detail, customization and extension, operations and governance, common mistakes, and verification. Topic dashboards at section, group, subgroup, and page level should summarize child navigation so users can scan before opening every page.\n\n## Navigation behavior\n\nNavigation should be hierarchical, expandable, searchable, and backend-driven. However, hierarchy should not punish the reader. A group with one page should be avoided or flattened by splitting the content into meaningful sibling pages. Groups should exist when they help compare or choose between multiple topics. The left navigation should use business-friendly labels; exact technical module names should appear in the body, source map, or technical reference.\n\nSearch should work across keywords, topics, module names, business phrases, configuration names, and API terms. The current implementation can use content catalog data directly. Future indexing can push the same content catalog into Elasticsearch without changing the authoring principle.\n\n## Business and technical balance\n\nThe same topic should answer two levels of questions:\n\n| Perspective | Required content |\n| --- | --- |\n| Business | Problem solved, who uses it, decisions supported, Axis/runtime behavior, risks, approvals, and impact. |\n| Technical | Owning module, data model, configuration keys, APIs/events, extension points, project-layer override path, validation, and troubleshooting. |\n\nThis balance is what makes documentation useful for an enterprise customer and still detailed enough for developers and AI-assisted implementation.\n\n## Common mistakes\n\n- Creating a deep hierarchy where a user opens two containers to reach one page.\n- Naming top-level groups from package names instead of business capabilities.\n- Hiding business impact in developer-only implementation notes.\n- Forgetting operator, QA, and AI-tool needs when writing only happy-path tutorials.\n- Making search depend on frontend-only metadata instead of backend-owned content records.\n\n## Verification\n\nReader journey coverage is proven when a new user can use navigation, search, topic dashboards, and page content to move from a business question to the correct technical owner. Validation should include CMS documentation checks, content-pack import, Axis navigation rendering, public/authenticated access checks, and browser verification for the workflows described by the page.\n",
    "keywords": [
      "documentation-roadmap",
      "reader-journey-and-coverage-map",
      "reader-journey",
      "coverage-map",
      "audience-paths",
      "Documentation Roadmap",
      "Reader Journey and Coverage Map",
      "Reader Journey and Coverage"
    ],
    "facets": {
      "section": "documentation-roadmap",
      "group": "documentation-roadmap",
      "navigationDepth": 2,
      "documentType": "overview",
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
  },
  "record138": {
    "code": "nodicsDocsSearchpagenodicsdocsmetadatadocsdocumentationpublishingmodel",
    "product": "nodicsDocumentationProduct",
    "targetType": "PAGE",
    "targetCode": "nodicsDocsMetadatadocsDocumentationPublishingModel",
    "title": "Documentation Publishing Model",
    "summary": "How documentation source becomes content catalog data, Staged records, approval tasks, Online pages, and public or authenticated delivery.",
    "searchText": "Documentation Publishing Model How documentation source becomes content catalog data, Staged records, approval tasks, Online pages, and public or authenticated delivery. # Documentation Publishing Model\n\nNodics documentation is managed as publishable content, not static text that a frontend hardcodes. CMS pages, article components and catalogue metadata are maintained directly in the owning data release. nImport installs that pack into Staged through governed setup actions; reviewers and administrators review it, Process manages approval tasks, and Online delivery becomes visible only after governed approval and publishing. Nexus can expose public documentation links, while Axis can show authenticated or role-based pages when access policy requires login.\n\nThis model matters because documentation is part of the product. It carries business guidance, implementation contracts, configuration behavior, customization rules, visual evidence, and support instructions. If that content changes, it deserves the same lifecycle discipline as other enterprise content.\n\nFor a beginner, the safe mental model is: source documentation is prepared by the owning module, Axis imports and reviews the Staged copy, approval promotes the release to Online, and public readers only see what Online access policy allows.\n\n## Source to Online flow\n\nThe publishing model has a clear sequence. Developers and AI tools update CMS pages, article blocks, navigation, routes, access policies, search metadata and publication metadata directly in the owning data release. Release validation checks the declared records and checksums. nImport installs the selected pack into Staged through governed setup actions. Approval decides whether the Staged release becomes Online. Public apps read Online only.\n\nValidation is read-only. `docs:check` validates the declared CMS data and release integrity; `docs:generate` remains a compatibility alias for that check, not a prose generator. Detailed guidance lives in CMS article blocks reviewed in Git, with no parallel Markdown source. Maintain navigation, access, Media references, workflow and search metadata alongside the article records. Import, review and publication remain separate governed operations.\n\n```mermaid\nsequenceDiagram\n  participant Source as CMS data release\n  participant Pack as Validated content pack\n  participant Axis as Axis authoring\n  participant Process as Approval task\n  participant Online as Online catalog\n  participant Nexus as Nexus public docs\n  Source->>Pack: validate declared records and checksums\n  Pack->>Axis: import to Staged\n  Axis->>Process: request approval\n  Process->>Online: approve and publish\n  Online->>Nexus: render public pages by access policy\n```\n\n## Content catalog authority\n\nNavigation, page content, summary areas, dashboards, access policy, and search metadata belong in the content catalog. Axis should let business users manage these records through components such as navigation, groups, subgroups, and pages. A user should be able to reorder navigation, update labels, change visibility, and submit for publication from Axis where permissions allow.\n\nThe current implementation may render directly from content catalog records. Future Elasticsearch indexing can improve search and retrieval, but indexing does not replace content catalog ownership. The content catalog remains the source of truth.\n\nFor customization and extension, a project should add or override documentation structures through backend-owned content catalog records, project-owned documentation packs, access policies, and renderer metadata. Developers should avoid frontend-only documentation trees because those cannot participate in Staged review, Online publishing, permission checks, search metadata, or audit history.\n\n## Access and workflow\n\nEach page must declare whether it is public, authenticated, role-based, group-based, permission-based, or restricted. Public pages may appear on Nexus after Online publication. Authenticated pages should remain available inside Axis or an authenticated documentation surface. Workflow triggers must exist for page edits, navigation edits, dashboard changes, access policy changes, source evidence changes, and search metadata changes.\n\n| Record changed | Workflow impact | Verification |\n| --- | --- | --- |\n| Page body | Content review and Online publication. | Compare Staged and Online page revision. |\n| Navigation item | Navigation review and browser refresh. | Axis left navigation updates after mutation. |\n| Access policy | Security review before Online exposure. | Public and authenticated routes enforce expected access. |\n| Search metadata | Search preview and indexing readiness. | Keywords and facets return the expected page. |\n\n## Axis and public experience\n\nAxis is both a documentation management surface and a documentation reading surface for authenticated users. It should show available updates, trigger approval, display approval tasks, and allow authorized users to approve or reject from the same business journey. The user should not need to jump across multiple confusing pages to complete a documentation release.\n\nNexus and other public surfaces should not show Staged content. If Online content is missing, they should show a professional customer-friendly maintenance or waiting-for-publication message. Swagger/OpenAPI is separate: it is generated API reference and does not require CMS documentation approval.\n\n## Developer and operator responsibilities\n\nDevelopers must update documentation source whenever implementation behavior changes. After a release is frozen or published, they must create a reviewed forward data release, validate it and provide source evidence rather than overwrite immutable bytes. Operators must verify imports, approval tasks, Online state, browser routes, logs, audit evidence, and rollback candidates.\n\nThis responsibility is ongoing. CMS documentation data changes alongside current implementation and future implementation updates.\n\nBefore merging a documentation pack, reviewers check that the CMS record diff explains the implemented change and preserves detailed examples, navigation, access policies, Media references and source evidence. A page disappearing, shrinking to a template or losing implementation-specific guidance is a release blocker. There is no second Markdown source to reconcile; validate the declared release bytes and review the rendered page before governed publication.\n\n## Common mistakes\n\n- Treating CMS documentation as a one-time seed rather than a recurring release.\n- Hardcoding documentation cards or left navigation in Axis or Nexus.\n- Blocking Swagger/API reference behind CMS documentation approval.\n- Updating Staged content without incrementing the content pack release after Online publication.\n- Forgetting access policies for pages that should be authenticated or role-based.\n\n## Verification\n\nThe publishing model is correct when a fresh schema can import documentation to Staged, submit approval, approve or reject through authorized actions, publish Online, refresh Axis navigation without manual confusion, and open public Nexus documentation only for pages whose access policy permits public viewing. Canonical CMS data checks, validation reports, browser evidence, and audit records must all agree on the same release.\n",
    "keywords": [
      "documentation-roadmap",
      "reader-journey-and-coverage-map",
      "documentation-publishing",
      "content-catalog",
      "staged-online",
      "Documentation Roadmap",
      "Reader Journey and Coverage Map",
      "Documentation Publishing Model"
    ],
    "facets": {
      "section": "documentation-roadmap",
      "group": "documentation-roadmap",
      "navigationDepth": 2,
      "documentType": "overview",
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
  },
  "record139": {
    "code": "nodicsDocsSearchpagenodicsdocsmetadataapplicationssuite",
    "product": "nodicsDocumentationProduct",
    "targetType": "PAGE",
    "targetCode": "nodicsDocsMetadataapplicationsSuite",
    "title": "Nodics Application Suite",
    "summary": "Business and technical overview of Axis, Nexus, and Kickoff as application experiences built on the Nodics Framework.",
    "searchText": "Nodics Application Suite Business and technical overview of Axis, Nexus, and Kickoff as application experiences built on the Nodics Framework. # Nodics Application Suite\n\nNodics Application Suite describes the application experiences that sit on top of the Nodics Framework. The framework remains the foundation, while Axis, Nexus, and Kickoff are usable application surfaces that help a business team run, publish, inspect, or demonstrate a Nodics installation. Beginners should treat this page as the orientation map before opening individual application documentation, because it explains which application owns which user journey and where implementation detail should live.\n\n## Business perspective\n\nThe suite exists to reduce the gap between a powerful backend framework and the day-to-day operations that business users, implementation partners, developers, QA owners, and operators need to perform. Axis is the authenticated operations and BackOffice surface. Nexus is the public corporate and documentation consumption surface. Kickoff is the reference customer workspace that shows how a customer project composes modules, data, content, topology, and acceptance checks without changing vendor-owned framework code.\n\n| Application | Primary business purpose | Typical user | Publication visibility |\n| --- | --- | --- | --- |\n| Nodics Axis | Configure, inspect, approve, publish, and operate business capabilities | Administrator, business user, operator, developer | Authenticated by default, role or permission filtered where needed |\n| Nodics Nexus | Render corporate pages and selected documentation to non-logged-in readers | Visitor, buyer, partner, evaluator | Public for approved Online content |\n| Nodics Kickoff | Demonstrate a customer project, local setup, customization, and acceptance | Implementation partner, developer, QA owner | Public documentation, local project runtime, and customer-owned customization |\n\nThe most important business rule is ownership clarity. Axis may let a user change a page, navigation item, content area, schema extension, or operation setting, but the owning backend capability remains responsible for validating and publishing that change. Nexus may render public documentation, but it must read approved Online content instead of loading source Markdown or repository files. Kickoff may demonstrate how a customer works, but it must not become the owner of Commerce, WCMS, Profile, Process, or other framework capabilities.\n\n## Application journey\n\n```mermaid\nflowchart LR\n  Framework[Nodics Framework] --> Axis[Nodics Axis]\n  Framework --> Nexus[Nodics Nexus]\n  Framework --> Kickoff[Nodics Kickoff]\n  Axis --> Staged[Staged content and workflow]\n  Staged --> Online[Online publication]\n  Online --> Nexus\n  Online --> AxisDocs[Axis documentation view]\n  Kickoff --> ProjectDocs[Customer project documentation]\n  ProjectDocs --> Staged\n```\n\nAn enterprise team normally starts with the framework value pages, then opens Kickoff to understand a runnable customer composition, then uses Axis to inspect active modules and content, and finally confirms how Nexus renders public Online content. The same documentation content catalog can expose pages differently based on access mode: public pages can appear in Nexus, authenticated pages can appear only after login, and role or permission guarded pages can be limited to selected Axis users.\n\n## Technical perspective\n\nAxis is a frontend and BackOffice application experience, but its documentation content pack is backend-owned under the Platform Axis module. Nexus is a frontend consumer for corporate and public documentation routes; its content data belongs to the backend content catalog and customer/project modules. Kickoff is a customer project and reference application; its documentation source lives under `nodics.kickoff/data/docs-v001/records/documentation`, and its generated data is importable through `data/core`.\n\nThe suite depends on WCMS for sites, pages, routes, templates, slots, components, documentation product metadata, navigation nodes, dashboards, access policies, publication states, and search metadata. BackOffice contributes the discoverable application and documentation sources. Profile owns user identity, groups, and permissions. nPublish owns the staged-to-online lifecycle, review, approval, activation, rollback, and publication evidence.\n\n## Customization model\n\nCustomers customize the suite at the project layer. They can add a new Axis navigation item, extend a BackOffice capability provider, add a Nexus content route, add a Kickoff module, or introduce a new documentation product. The customization must be source-backed and publication-governed. For example, a business user may reorder documentation groups in Axis after those groups are represented as content-catalog records. A developer may add a new renderer, but the renderer key must be registered and validated rather than injected through content.\n\nUse this division when writing or reviewing implementation work:\n\n| Change | Correct owner | Validation expectation |\n| --- | --- | --- |\n| New application suite page | Owning application or project documentation source | Catalogue metadata, generated CMS records, access policy, search metadata |\n| New Axis workspace | Backend BackOffice capability plus Axis renderer | Permission, route contract, renderer registry, visual verification |\n| New public Nexus page | WCMS content/catalog source | Staged review, Online publication, public access policy |\n| New Kickoff example | Customer project module | Project-layer source, data manifest, local acceptance check |\n\n## Access and publication\n\nEvery suite topic must declare whether it is public, authenticated, or role/permission based. Public pages can be consumed by Nexus only after they are approved and Online. Authenticated and restricted pages should remain visible in Axis based on Profile-owned groups and permissions. Generated documentation records must include stable route, page, component, navigation, dashboard, access, publication, and search metadata so Axis can render and manage them without hardcoded menus.\n\n## Common mistakes\n\n- Treating Nodics Framework as a product inside the application suite. The framework is the base capability platform; the suite contains application experiences built on it.\n- Putting Nexus documentation source in the frontend app. Nexus renders public Online content, but backend content catalog and publication records remain the authority.\n- Allowing Axis to become a parallel data owner. Axis should render, validate, and submit operations through backend contracts.\n- Writing suite documentation only for developers. Business users need to understand what each application lets them decide, approve, publish, or inspect.\n\n## Verification\n\nVerify this topic by checking that `nodics.docs/data/manifest.json` declares the `documentation` composition containing the stable `applications.suite` guide and that CMS documentation records include product, navigation, node, dashboard, page metadata, access policy, publication state, and search metadata files. Run `npm run docs:check` and `npm run validate` in `nodics.docs`, then install the content pack through the normal import and publication workflow before relying on Axis or Nexus rendering evidence.\n",
    "keywords": [
      "nodics-application-suite",
      "axis",
      "nexus",
      "kickoff",
      "Nodics Application Suite",
      "Axis",
      "Nexus",
      "Kickoff"
    ],
    "facets": {
      "section": "nodics-application-suite",
      "group": "nodics-application-suite",
      "navigationDepth": 2,
      "documentType": "overview",
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
  },
  "record140": {
    "code": "nodicsDocsSearchpagenodicsdocsmetadatasolutionstaskexecutionengine",
    "product": "nodicsDocumentationProduct",
    "targetType": "PAGE",
    "targetCode": "nodicsDocsMetadatasolutionsTaskExecutionEngine",
    "title": "Task Execution Engine",
    "summary": "How customers use Nodics Process, Cron, Pipelines, Events, and governed runtime change to build a Task Execution Engine.",
    "searchText": "Task Execution Engine How customers use Nodics Process, Cron, Pipelines, Events, and governed runtime change to build a Task Execution Engine. # Task Execution Engine\n\nTask Execution Engine, or TEE, is a Nodics solution use case for running governed business tasks across manual actions, scheduled jobs, process workflows, event messages, and runtime-safe configuration changes. It is not a separate application-suite product. It is a customer solution pattern built from Nodics Framework capabilities when a business needs repeatable execution, operational evidence, and recovery behavior without creating a custom platform fork.\n\nFor a beginner, the mental model is simple: TEE is the operating layer that turns business work into controlled tasks. A business user sees a job, approval, retry, or operational queue in Axis. A developer connects that work to process definitions, cron schedules, pipeline stages, services, events, and data records. An operator verifies that work is traceable, restart-safe, and recoverable across running nodes.\n\n## Business context\n\nBusinesses usually start asking for TEE when manual operations become too risky or too slow: product data needs nightly validation, publication needs approval, pricing needs scheduled activation, fulfillment needs retry, or a partner integration needs controlled execution. TEE provides a pattern for making these operations visible, permissioned, monitored, and auditable.\n\n| Business question | TEE answer |\n| --- | --- |\n| What problem does it solve? | It converts repetitive or sensitive business operations into governed tasks with ownership, execution evidence, and recovery. |\n| Who uses it? | Business users request or monitor tasks, administrators manage approvals, developers implement task behavior, and operators support runtime execution. |\n| What decisions are supported? | Whether a task should run, pause, retry, fail over, require approval, or trigger another business process. |\n| What business value does it create? | Faster operations, fewer hidden scripts, clearer accountability, and safer go-live for automated business changes. |\n\n## Execution journey\n\nTEE begins with a business trigger and ends with observable evidence. The trigger may be a cron schedule, an Axis action, a process task, an event, or an API request. The execution should move through validated inputs, a pipeline or service boundary, state updates, audit events, and a visible result. When the task changes Online content or runtime behavior, approval and publication controls must remain in the owning capability.\n\n```mermaid\nflowchart LR\n  Request[\"Business request or schedule\"] --> Permission[\"Permission and context check\"]\n  Permission --> Process[\"Process workflow or cron trigger\"]\n  Process --> Pipeline[\"Pipeline and domain service execution\"]\n  Pipeline --> Event[\"Event or runtime notification\"]\n  Event --> Evidence[\"Audit, history, retry, and support evidence\"]\n  Evidence --> Axis[\"Axis task or operations view\"]\n```\n\n| Journey step | Business view | Technical owner |\n| --- | --- | --- |\n| Request | User asks for work or reviews a scheduled operation. | Axis action, API route, cron job, or process trigger. |\n| Validate | System confirms tenant, enterprise, permission, payload, and state. | Profile, routing, validator, schema, and process services. |\n| Execute | Task runs once with clear status and failure handling. | Pipeline, domain service, event, and runtime service contracts. |\n| Recover | Failed or interrupted work can be retried or transferred safely. | Cron, process incidents, idempotency, node membership, and audit. |\n\n## Capability composition\n\nTEE should be documented as a composition of existing Nodics capabilities, not as a shortcut around them. Cron owns scheduled execution. Process owns workflow definitions, tasks, approvals, and runtime lifecycle. Pipeline owns ordered business logic execution. Event and messaging capabilities notify other nodes or services. Runtime governance controls safe changes while the application is running.\n\n| Capability | Role in TEE | Documentation link to maintain |\n| --- | --- | --- |\n| Cron and Scheduled Automation | Runs scheduled and background work with node responsibility and recovery. | Cron and Scheduled Automation |\n| Process and Workflow Automation | Models approval, task state, incidents, retries, and human decisions. | Process Workflows |\n| Pipeline and Business Logic Orchestration | Provides ordered, testable execution steps. | Pipeline and Business Logic Orchestration |\n| Event and Messaging Management | Propagates changes and operational messages across nodes. | Event and Messaging Management |\n| Governed Runtime Change | Applies controlled runtime changes without unmanaged node-by-node edits. | Governed Runtime Change Capability |\n\n## Configuration and extension\n\nDevelopers customize TEE from the project layer by adding task definitions, cron schedules, workflow definitions, pipeline stages, validators, and domain services. Business users should configure only the records that are designed for Axis administration. If a task affects runtime behavior or Online content, it must use the relevant publication, approval, permission, and audit flow.\n\n| Extension need | Recommended approach | Avoid |\n| --- | --- | --- |\n| Add a scheduled business task | Define a cron job, link it to a process or service, and document retry/idempotency. | Running unmanaged scripts outside Nodics lifecycle. |\n| Add human approval | Use Process task and approval contracts. | Embedding approval state only in a custom UI. |\n| Add execution logic | Add a pipeline step or project-layer service override with tests. | Forking framework services for customer-only behavior. |\n| Notify other nodes | Use events or messaging with bounded payloads and audit. | Asking operators to update each node manually. |\n\n```js\nteeTask: {\n  trigger: \"cron-or-process\",\n  execution: [\"validate-context\", \"run-pipeline\", \"record-audit\"],\n  recovery: [\"idempotency-key\", \"retry-policy\", \"node-responsibility\"]\n}\n```\n\n## Operations and troubleshooting\n\nOperators need evidence that a TEE task is safe to support in production. Every task should expose status, owner, trigger, last run, next run, correlation id, error summary, retry policy, and audit trail. Cluster-sensitive tasks must explain which node currently owns execution and how responsibility transfers when a node goes down and later returns.\n\n| Symptom | Likely cause | Check |\n| --- | --- | --- |\n| Task did not run | Schedule disabled, permission missing, or owning node unavailable. | Cron status, process trigger, node registry, and logs. |\n| Task ran twice | Missing idempotency, duplicate trigger, or unsafe retry. | Execution id, correlation id, and retry policy. |\n| Runtime change not visible | Event propagation failed or stale cache remained active. | Event logs, cache invalidation, and runtime configuration audit. |\n| Approval task is stuck | Process task state or permission mapping is incomplete. | Process task queue, role permission, and incident records. |\n\n## Common mistakes\n\n- Presenting TEE as a separate product instead of a solution use case built from framework capabilities.\n- Creating a cron job without explaining business owner, retry policy, idempotency, and audit.\n- Putting approval behavior into frontend code instead of Process and permission contracts.\n- Running scheduled work without documenting node responsibility and failover behavior.\n- Skipping beginner and business guidance because the execution looks technical.\n- Changing runtime behavior without events, audit, cache invalidation, and rollback evidence.\n\n## Verification\n\nVerification must prove both the business journey and the technical contract. Review the page in Axis to confirm the user can understand when to use TEE, who owns each step, and where operational evidence appears. Then run the owning Process, Cron, Pipeline, Event, and runtime-governance tests for the implementation being documented.\n\nDocumentation verification requires `npm run docs:check`, `npm run validate`, and `npm run audit:hardening` from `nodics.docs`. Runtime verification should include a scheduled execution, a manual trigger if exposed, a permission denial, an idempotent retry, a node responsibility transfer where applicable, and browser evidence from the relevant Axis operation screen.\n",
    "keywords": [
      "solution-use-cases",
      "task-execution-engine",
      "tee",
      "cron",
      "process",
      "pipeline",
      "runtime-change",
      "Solution Use Cases",
      "Solution Patterns",
      "Task Execution Engine",
      "TEE"
    ],
    "facets": {
      "section": "solution-use-cases",
      "group": "solution-use-cases",
      "navigationDepth": 2,
      "documentType": "concept",
      "audience": [
        "business",
        "architect",
        "administrator",
        "developer",
        "operator",
        "qa",
        "ai-tool"
      ],
      "maturityState": "design-contract"
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
  "record141": {
    "code": "nodicsDocsSearchpagenodicsdocsmetadatasolutionsdataengineeringanalyticsplatform",
    "product": "nodicsDocumentationProduct",
    "targetType": "PAGE",
    "targetCode": "nodicsDocsMetadatasolutionsDataEngineeringAnalyticsPlatform",
    "title": "Data Engineering and Analytics Platform",
    "summary": "How customers use Nodics import, export, discovery, provider, event, pipeline, and publishing capabilities to build governed data platforms.",
    "searchText": "Data Engineering and Analytics Platform How customers use Nodics import, export, discovery, provider, event, pipeline, and publishing capabilities to build governed data platforms. # Data Engineering and Analytics Platform\n\nData Engineering and Analytics Platform, or DEAP, is a Nodics solution use case for building governed data flows: consume data from approved sources, validate and transform it, publish it to approved destinations, and expose operational or analytical evidence. It is not a standalone product label in the application suite. It is a solution pattern that uses Nodics data import, export, discovery, publishing, provider, event, cron, pipeline, and Axis capabilities.\n\nFor a beginner, DEAP can be understood as a trusted data factory. A business user wants reliable data movement, reporting, enrichment, or search readiness. A developer defines schemas, mappings, processors, adapters, and pipeline steps. An operator watches batches, failures, quarantine, retries, lineage, and publication evidence so data quality issues do not silently reach Online experiences.\n\n## Business context\n\nCustomers need DEAP when data quality and data movement become business risks. Product feeds, content indexes, customer engagement data, partner files, search documents, analytics exports, and migration packs all need source ownership, validation, transformation, retention, and support evidence. DEAP gives teams one governed pattern for these flows instead of one-off scripts and disconnected dashboards.\n\n| Business question | DEAP answer |\n| --- | --- |\n| What problem does it solve? | It makes data ingestion, transformation, publishing, search readiness, and analytics evidence governed and repeatable. |\n| Who uses it? | Business data owners, administrators, developers, operators, QA owners, and implementation partners. |\n| What decisions are supported? | Whether a source is trusted, a batch is valid, a transform is accepted, a destination can be published, or a data issue needs quarantine. |\n| What business value does it create? | Faster onboarding of data sources, safer migrations, better search/content quality, and clearer operational accountability. |\n\n## Data journey\n\nDEAP starts from an approved source and ends with a governed destination or analytical output. The journey should preserve source identity, tenant and enterprise context, schema version, checksum, mapping, transformation decision, lineage, validation result, and publication receipt. If data feeds search, WCMS, commerce, or analytics, the owning domain remains responsible for business meaning while DEAP carries the movement and processing pattern.\n\n```mermaid\nflowchart LR\n  Source[\"Approved data source\"] --> Import[\"Import or connector intake\"]\n  Import --> Validate[\"Schema, mapping, and quality validation\"]\n  Validate --> Process[\"Pipeline transformation and enrichment\"]\n  Process --> Publish[\"Publication, index, export, or analytics target\"]\n  Publish --> Evidence[\"Lineage, audit, receipt, and support evidence\"]\n  Evidence --> Axis[\"Axis monitoring and business review\"]\n```\n\n| Journey step | Business view | Technical owner |\n| --- | --- | --- |\n| Source approval | Business owner confirms source, purpose, and data classification. | Provider configuration, import definition, access policy. |\n| Intake | File, API, event, or content pack is received with checksum and context. | Import/export services, provider adapters, event handlers. |\n| Process | Data is validated, transformed, enriched, or quarantined. | Schema, mapping, validator, pipeline, processor service. |\n| Deliver | Data reaches search, publication, export, dashboard, or analytical target. | Discovery, publishing, export, reporting, or domain projection. |\n\n## Capability composition\n\nDEAP documentation should link to the framework capabilities that implement the flow. Data import/export owns file and record movement. Discovery owns index configuration and query-ready documents. Provider and data access layers control storage and external connections. Cron and Process can schedule or govern recurring flows. Event and messaging capabilities distribute changes and processing results. Axis renders the management journey declared by the backend.\n\n| Capability | Role in DEAP | Documentation link to maintain |\n| --- | --- | --- |\n| Data Import, Export, and Migration | Defines packs, manifests, import runs, mappings, checksums, and migration evidence. | Data Import, Export, and Migration |\n| Schema and Data Modeling | Defines source records, target records, validation, and extension fields. | Data Modeling and Schema Management |\n| Provider and Data Access Layer | Keeps MongoDB, search, file, and other providers replaceable through governed adapters. | Provider and Data Access Layer |\n| Search and Discovery | Builds searchable documents and index operations from approved sources. | Search and Discovery |\n| Pipeline and Events | Executes transformations and propagates changes with traceable payloads. | Pipeline and Event documentation |\n\n## Configuration and extension\n\nDevelopers customize DEAP by adding data-pack headers, import definitions, mapping records, validators, processors, provider adapters, discovery source providers, and export destinations. Business users manage only records exposed through Axis workspaces and governed by role, workflow, and publication rules. A project must document whether a change is a business configuration, a schema extension, a provider replacement, or a domain-service customization.\n\n| Extension need | Recommended approach | Avoid |\n| --- | --- | --- |\n| Add a feed or file format | Add an import definition, header, parser, mapping, and validation evidence. | Accepting arbitrary files without schema and checksum. |\n| Add a transformation | Add a pipeline processor with deterministic input and output contracts. | Hiding transformation rules in ad hoc scripts. |\n| Replace storage or search provider | Implement a provider adapter and document migration and rollback. | Binding DEAP logic directly to one database client. |\n| Publish to search or analytics | Use discovery or export publication with receipts and lineage. | Writing target data without acknowledgement or audit. |\n\n```js\ndeapFlow: {\n  source: \"approved-feed\",\n  controls: [\"schema-version\", \"checksum\", \"mapping\", \"quarantine\"],\n  delivery: [\"discovery-index\", \"export-target\", \"analytics-dashboard\"]\n}\n```\n\n## Operations and troubleshooting\n\nOperators need DEAP pages to explain how data issues are found and contained. A data flow should show source, batch id, record counts, accepted count, rejected count, quarantine reason, retry state, destination acknowledgement, and rollback or compensation path. Production support must be able to distinguish a provider outage from malformed source data, a mapping error, a processor failure, or an unpublished destination.\n\n| Symptom | Likely cause | Check |\n| --- | --- | --- |\n| Batch imports but records are missing | Mapping, validation, or quarantine rejected records. | Import run, rejection report, schema version, and mapping revision. |\n| Search results are stale | Index publication did not run or alias was not switched. | Discovery publication policy, index batch, and Online pointer. |\n| Analytics numbers changed unexpectedly | Source scope, transform rule, or deduplication changed. | Lineage, checksum, processor version, and audit. |\n| Provider replacement breaks delivery | Adapter contract or migration path is incomplete. | Provider configuration, data-access test, and rollback evidence. |\n\n## Common mistakes\n\n- Presenting DEAP as a finished product instead of a solution use case built from source-backed framework capabilities.\n- Importing data without source ownership, classification, checksum, and quarantine behavior.\n- Combining business data meaning with low-level provider code.\n- Skipping mapping and transformation documentation because a processor test passed.\n- Allowing search, analytics, and publication targets to drift without lineage and receipts.\n- Forgetting beginner and business guidance when describing schemas, providers, and pipelines.\n\n## Verification\n\nVerification must prove that DEAP is understandable and operable. The page should let a business user identify the data problem, the source, the destination, and the risk controls. Developers should verify schema, parser, mapping, processor, provider, discovery, publication, and export contracts for the specific flow being documented. Operators should verify batch status, quarantine, retry, audit, and support evidence in Axis.\n\nDocumentation verification requires `npm run docs:check`, `npm run validate`, and `npm run audit:hardening` from `nodics.docs`. Runtime verification should include a valid import, an invalid record, a mapping failure, an idempotent retry, a provider failure or fallback path where applicable, a publication or export receipt, and browser evidence from the Axis view used by the business user.\n",
    "keywords": [
      "solution-use-cases",
      "data-engineering-and-analytics-platform",
      "deap",
      "import",
      "export",
      "discovery",
      "analytics",
      "data-pipeline",
      "Solution Use Cases",
      "Solution Patterns",
      "Data Engineering and Analytics Platform",
      "DEAP"
    ],
    "facets": {
      "section": "solution-use-cases",
      "group": "solution-use-cases",
      "navigationDepth": 2,
      "documentType": "concept",
      "audience": [
        "business",
        "architect",
        "administrator",
        "developer",
        "operator",
        "qa",
        "ai-tool"
      ],
      "maturityState": "design-contract"
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
  "record142": {
    "code": "nodicsDocsSearchpagenodicsdocsmetadataframeworkcapabilitydocumentationmaturitypattern",
    "product": "nodicsDocumentationProduct",
    "targetType": "PAGE",
    "targetCode": "nodicsDocsMetadataframeworkCapabilityDocumentationMaturityPattern",
    "title": "Capability documentation maturity pattern",
    "summary": "How to document concept, design-contract, partial, and operational capabilities without creating false runtime authority.",
    "searchText": "Capability documentation maturity pattern How to document concept, design-contract, partial, and operational capabilities without creating false runtime authority. # Capability documentation maturity pattern\n\nNodics includes stable runtime capabilities, capabilities under active design, partially implemented slices, and separately governed capabilities that are not currently available for runtime use. Documentation must explain each of these states clearly without creating false authority.\n\nThe rule is direct: documentation may describe a conceptual capability, a design contract, or a partially implemented slice, but it must say which state it is in. A reader should never confuse a concept page with production-ready runtime behavior.\n\n## Why this matters\n\nFor business users, capability-maturity documentation explains business value and readiness. It should answer: what problem does this capability solve, why would an enterprise adopt it, how does it reduce operating cost or delivery risk, and how does it fit with multi-enterprise, multi-tenant, modular Nodics?\n\nFor developers, capability-maturity documentation prevents rushed placement. It should answer: which functional module owns the capability, which technical modules may be needed, which APIs and schemas are authoritative, what can be customized through configuration, and what must remain backend-owned.\n\nFor operators, capability-maturity documentation explains runtime impact. It should answer: which server will run it, what dependencies are mandatory or optional, what properties are public or private, what health evidence exists, how data is initialized, and how rollback works.\n\n## Documentation maturity levels\n\nUse a clear maturity label whenever a module area is not fully complete:\n\n| Level | Meaning | Allowed content |\n| --- | --- | --- |\n| Concept | Business problem and direction are known, but implementation has not started. | Business value, personas, examples, target boundaries, open questions. |\n| Design contract | Ownership, APIs, schemas, or runtime behavior are being defined. | Architecture diagrams, data ownership, security model, proposed endpoints, acceptance criteria. |\n| Partial implementation | Some slices exist, but the module is not production-complete. | Implemented scope, missing scope, feature flags, known gaps, safe rollback. |\n| Operational | Runtime behavior, data release, tests, docs, and acceptance are current. | Full user guide, developer guide, DevOps guide, customization guide, verification evidence. |\n\nThe maturity label belongs near the top of the page. If a page mixes conceptual direction and implemented behavior, split the sections clearly.\n\n## Required page structure\n\nEvery capability page should include:\n\n1. **Business problem** — who needs the module and what pain it removes.\n2. **Business value** — faster delivery, lower customization cost, reduced risk, better governance, scalability, or customer experience.\n3. **Beginner mental model** — a simple analogy or walkthrough.\n4. **Functional module ownership** — standard module identity and whether a customer extension may customize it.\n5. **Technical module ownership** — where services, routes, schemas, migrations, data, docs, and tests belong.\n6. **Runtime topology** — which server starts it and how it extends Core or another standard module.\n7. **Security and governance** — authentication, authorization, tenant, audit, data exposure, and secret boundaries.\n8. **Customization model** — configuration first, extension modules second, framework-source change only when the capability itself changes.\n9. **Examples** — at least one business example and one developer or operator example.\n10. **Common mistakes** — things developers and AI tools must avoid.\n11. **Verification** — tests, generated data checks, local acceptance, and runtime proof.\n12. **Audience levels** — explicit guidance for business users, developers, operators, QA owners, and AI tools where the topic affects them.\n13. **Error behavior** — user-safe messages for Axis, Nexus, or Agora and technical evidence for developers and support.\n14. **Fresh-schema and browser proof** — when the capability is visible at runtime, prove it from an empty database and through the real user journey.\n\n## Source-backed coverage rule\n\nEvery operational or partial-implementation topic must be source-backed. A page is not complete only because it explains the idea. It must connect the idea to the current repository files that implement, configure, import, publish, render, or test the capability.\n\nUse this checklist for every topic, whether the topic is products, content, media, pricing, inventory, workflows, APIs, imports, search, security, localization, documentation, or accelerators:\n\n| Coverage area | Required detail |\n| --- | --- |\n| Business journey | What a business user, administrator, operator, or customer is trying to accomplish. |\n| Runtime owner | Functional module, technical module, server role, and whether the capability is local, remote, Staged, Online, or operational. |\n| Source map | Exact package, module, schema, service, controller, router, config, data, asset, frontend, and test locations. |\n| How to do it | Step-by-step instructions for creating, updating, importing, publishing, operating, or troubleshooting the capability. |\n| How it works | Ordered flow from authored input through backend validation, persistence, events, publication, projection, frontend rendering, and evidence. |\n| Customization | Safe project-layer extension points, override rules, provider adapters, validators, renderer mappings, properties, and areas that must remain framework-owned. |\n| Examples | Real code or data snippets from current files, with enough context for a developer or AI tool to repeat the pattern safely. |\n| Visual explanation | Mermaid diagram, screenshot, source map, flow image, or table that clarifies ownership and sequence. |\n| Validation | Focused tests, generator checks, import checks, fresh-schema checks, publication checks, and browser evidence when the capability is visible in Axis, Nexus, or Agora. |\n| External references | Official or vendor documentation used to define industry-standard expectations, clearly marked as reference material and not as Nodics authority or source design. |\n\nSource-backed does not mean every technical module needs a public business page. Some modules are framework utilities and should be covered inside a broader capability topic. It does mean that a reader should be able to trace the topic from documentation to source and from source back to documentation.\n\nWhen the source inventory shows an implemented schema, service, controller, router, data pack, asset pack, frontend journey, or test with no matching documentation, create a documentation gap. When a page exists but does not show files, services, data, customization, and verification, mark it shallow and improve it before calling the topic operational.\n\n## Example: documenting a Workflow capability\n\nA Workflow page should not begin with API endpoints. It should begin with the business problem: enterprises need governed approval, task routing, escalation, return-to-sender, audit, and cross-module process visibility. Then it should explain why a Workflow module is better than every module inventing its own approval table.\n\nThe developer section would say that `nodics.process` owns workflow definitions, states, transitions, assignments, SLA metadata, process history, and Workflow APIs. A Commerce return flow may start a workflow, but Commerce does not own the generic workflow engine. Axis may render assigned work, approvals, returned work, and process detail only when BackOffice reports the Workflow capability as active and authorized.\n\nThe operator section would explain whether Workflow runs inside a Platform server, a dedicated workflow server, or both. It would define scheduler dependency if escalations use Cron, event dependency if transitions publish events, and data-import dependency if starter definitions are loaded from a release.\n\n## Example: documenting a Commerce capability\n\nA Commerce page should explain business outcomes: product catalog, pricing, cart, checkout, order lifecycle, returns, refunds, promotions, inventory, and customer experience. It should also explain boundaries. Product media belongs to Media/nMedia for storage and lifecycle, while Commerce owns the business relationship between a product and selected media. Refund decisions belong to Commerce or order lifecycle ownership, not Catalog alone.\n\nFor developers, this prevents a classic mistake: adding refund actions to a Catalog page because the word “product” appears there. The page must show the actual domain owner and the runtime module that provides the operation.\n\n## Diagrams and visual guidance\n\nUse diagrams whenever a concept has multiple owners or ordered steps. Prefer small diagrams that show real authority:\n\n```mermaid\nflowchart LR\n  Idea[\"New capability idea\"] --> Business[\"Business problem and value\"]\n  Business --> Owner[\"Choose functional module owner\"]\n  Owner --> Technical[\"Choose technical module and folder\"]\n  Technical --> Runtime[\"Define runtime/server graph\"]\n  Runtime --> Data[\"Define APIs, schemas, data, docs\"]\n  Data --> Verify[\"Define tests and acceptance\"]\n```\n\nImages may be reused from the approved framework documentation assets when they explain the exact concept. Do not add decorative images that make the page look richer without teaching the reader something.\n\n## Customize and extend safely\n\nCapability documentation must describe customization before implementation details. Partners should understand how to change behavior without forking the standard framework source:\n\n- use module properties for defaults and policies;\n- use customer project environment/server configuration for deployment topology and local overrides;\n- use customer extension modules to override or add services, routes, renderers, and data when the customer needs a project-specific behavior;\n- keep standard functional module identity stable when a customer extension customizes the standard capability;\n- avoid exposing every technical module as a business registry item.\n\nFor example, a customer may later create a project-specific Platform extension that changes user onboarding behavior. Axis should still show Platform unless the customer intentionally creates a new business capability. This keeps the business model understandable while preserving runtime customization.\n\n## Common mistakes\n\n- Writing a concept page as if all APIs already exist.\n- Hiding missing implementation behind marketing language.\n- Putting customer-specific behavior into a standard framework module.\n- Creating a frontend page before the backend capability contract exists.\n- Documenting code placement with a project-specific name where the contract should work for any customer project.\n- Forgetting operator concerns such as deployment topology, properties, secrets, data import, health, rollback, and observability.\n- Skipping examples because the module is still conceptual. Concept pages need examples even more, because they guide implementation.\n\n## Verification\n\nA capability documentation page is accepted when it clearly states maturity, business problem, owner, runtime graph, security boundary, customization model, examples, common mistakes, and verification expectations. If implementation does not exist yet, the page must say so. If a partial implementation exists, the page must list the implemented slice, missing slice, tests that currently pass, and acceptance evidence still required before calling it operational.\n\nBefore importing documentation, run the docs generator and validator. Before claiming runtime readiness, run the module tests and the local fresh-bootstrap acceptance checklist for the executing server graph.\n",
    "keywords": [
      "documentation-management",
      "documentation-contract-and-quality",
      "capability-documentation-maturity-pattern",
      "Documentation Management",
      "Documentation Contract and Quality",
      "Capability documentation maturity pattern"
    ],
    "facets": {
      "section": "documentation-management",
      "group": "documentation-management",
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
  },
  "record143": {
    "code": "nodicsDocsSearchpagenodicsdocsmetadatadocsoverview",
    "product": "nodicsDocumentationProduct",
    "targetType": "PAGE",
    "targetCode": "nodicsDocsMetadatadocsOverview",
    "title": "Docs overview",
    "summary": "How Nodics framework documentation is authored, generated, validated, imported, rendered, and kept separate from Axis and customer project documentation.",
    "searchText": "Docs overview How Nodics framework documentation is authored, generated, validated, imported, rendered, and kept separate from Axis and customer project documentation. # Docs overview\n\nDocs Overview explains how Nodics documentation is maintained as CMS data, validated, published, searched and rendered. It is the entry point for documentation management, not the only page that describes the entire system.\n\n## Documentation model\n\n```mermaid\nflowchart LR\n  Source[\"Module docs source\"] --> Pack[\"Documentation content pack\"]\n  Pack --> Staged[\"Staged documentation\"]\n  Staged --> Approval[\"Approval workflow\"]\n  Approval --> Online[\"Online documentation\"]\n  Online --> Axis[\"Axis\"]\n  Online --> Nexus[\"Nexus public/wiki links\"]\n```\n\n| Area | Ownership |\n| --- | --- |\n| Thin README | Module-specific developer and AI context. |\n| Detailed docs | Content-pack documentation with diagrams, tables, examples, and journeys. |\n| Navigation | Backend content catalog, editable through Axis. |\n| Publication | Governed Staged-to-Online flow with approval and audit. |\n\n## Business perspective\n\nDocumentation should help business users understand the capability, the problem it solves, who uses it, what decisions it supports, what can be changed in Axis, and what risks or approvals apply. Public pages may appear in Nexus; role-scoped pages may remain inside Axis.\n\n## Developer perspective\n\nDevelopers and AI tools should treat the documentation contract as framework law for every current and future implementation. A CMS page must include business perspective, technical perspective, extension points, configuration, schemas or data model, APIs/events where relevant, project-layer override path, visual explanation, troubleshooting, and verification.\n\n## Continue with\n\n- **Documentation Principles** for the reusable CMS data maintenance contract.\n- **Reader Journey and Coverage** for business, developer, operator, QA, and AI-tool reader requirements.\n- **Documentation Publishing Model** for Staged, approval, Online, and visibility.\n- **Capability Documentation Maturity Pattern** for quality expectations.\n\n## Operational evidence\n\nDocumentation evidence should prove both content quality and publication behavior. Include validated page count, release version, validation report, hardening audit, source evidence, visual requirements, role visibility, Staged state, approval task, Online state, Axis route, Nexus route where public, and search/navigation result. This is especially important because documentation is not a one-time artifact. Every new capability must bring its own updated documentation evidence before it is treated as complete.\n\n## Reader and implementation contract\n\nA beginner should understand where documentation lives and why README files are intentionally thin. A business user should know how published pages explain business value, risks, approval, and operations. A developer should know how CMS documentation is tied to module contracts, source evidence, configuration, APIs, events, schemas, and extension points. An operator should know how publication state, visibility, roles, and search affect what users can see.\n\nEvery future CMS documentation update must follow this contract. It should not create flat, text-only pages. It must include visual explanation, tabular comparison where useful, business and technical perspectives, project-layer customization guidance, validation, troubleshooting, and links to adjacent journeys.\n\n## Documentation maintenance rule\n\nKeep this topic current whenever implementation, configuration, Axis workflow, publication behavior, or customer-facing rendering changes. The page should remain small enough to scan, but it must still carry enough business context, technical ownership, customization guidance, visual structure, operational evidence, and verification detail for a reader to act without guessing. When the detail becomes too large, create a sibling topic and link it from this page instead of turning the overview back into a long mixed article.\n\n## Common mistakes\n\n- Treating CMS documentation maintenance as a one-time cleanup.\n- Putting detailed enterprise documentation only in module README files.\n- Hardcoding documentation navigation in Axis.\n- Publishing text-heavy pages without diagrams, tables, examples, and verification evidence.\n\n## Verification\n\nVerify docs by running read-only CMS data checks, validating the content pack, publishing Online, opening Axis and Nexus views, checking role visibility, and using search/navigation to find topics without guessing package names.\n",
    "keywords": [
      "documentation-management",
      "documentation-runtime-and-publishing",
      "docs-overview",
      "Documentation Management",
      "Documentation Runtime and Publishing",
      "Docs overview"
    ],
    "facets": {
      "section": "documentation-management",
      "group": "documentation-management",
      "navigationDepth": 2,
      "documentType": "overview",
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
  },
  "record144": {
    "code": "nodicsDocsSearchpagenodicsdocsmetadatadocsdocumentationpublishingrunbook",
    "product": "nodicsDocumentationProduct",
    "targetType": "PAGE",
    "targetCode": "nodicsDocsMetadatadocsDocumentationPublishingRunbook",
    "title": "Documentation Publishing Runbook",
    "summary": "Runbook for authored Markdown, catalogue metadata, generated WCMS records, Staged review, Online activation, rollback evidence, and consumer rendering.",
    "searchText": "Documentation Publishing Runbook Runbook for authored Markdown, catalogue metadata, generated WCMS records, Staged review, Online activation, rollback evidence, and consumer rendering. # Documentation Publishing Runbook\n\nNodics documentation has two lanes. Repository guidance lives in module `README.md` and `AGENTS.md` files for developers and AI tools. Publishable documentation lives directly as CMS pages, article components, navigation, metadata and Media declarations in the owning module data release. Framework-wide guidance belongs in `nodics.docs`; application and project guidance stays with its owner. nImport installs these records into Staged for review and governed Online publication. Axis manages the business and operator journey. Nexus or other public consumers read Online content after approval.\n\n## Source map\n\n| Capability | Framework source / owner |\n| --- | --- |\n| Canonical article blocks | `nodics.docs/data/docs-v001/records/documentation` for framework-wide content; module guides remain in the owning module release. |\n| Local integrity checks | `nodics.docs/scripts/validate.mjs`, `audit-hardening.mjs`, `audit-source-coverage.mjs`; catalogue declarations in `nodics.docs/data/manifest.json`. |\n| CMS baseline status / recovery | `nodics.wcms/modules/cms/src/service/publication/defaultCmsPublicationBaselineService.js`: status, actorRequest, rollback. |\n| Shared lifecycle authority | `nodics.foundation/modules/nPublish/src/service/defaultPublicationLifecycleService.js`: rollback with expectedRevision and version-provider hooks. |\n| Authenticated operator handoff | `nodics.platform/modules/backoffice/src/router/routers.js`, `src/service/defaultBackofficeApplicationInitializationService.js` under that owner. |\n| Documentation validation / projection | `nodics.wcms/modules/cms/src/service/documentation/defaultCmsDocumentationGovernanceService.js`; no publication authority moves into nodics.docs. |\n\n## Publishing model\n\n```mermaid\nflowchart TD\n  Records[\"CMS pages, article blocks and Media data\"] --> Catalogue[\"Navigation, access and publication metadata\"]\n  Catalogue --> Validate[\"Declared hashes, docs validation and hardening\"]\n  Validate --> Import[\"Import to Staged\"]\n  Import --> Review[\"Approval workflow\"]\n  Review --> Online[\"Online activation\"]\n  Online --> Consumers[\"Axis, Nexus, web readers\"]\n```\n\nFor beginners, the CMS article blocks contain the detailed page text, and the page, navigation and access records define its reading journey. Developers and AI tools update this canonical data directly and run the validation gates. Business users use authorized backend CMS editing and review actions where available, rather than repository files or frontend constants. Operators verify import receipts, review decisions and Online publication before production readers see a page.\n\n## Authoring steps\n\n1. Create or edit the CMS page and article component blocks under the owning release records/documentation directory.\n2. Add catalogue metadata with id, title, section, group, navigation order, access mode, source owner, related pages, source evidence, keywords, and visual requirements.\n3. Include enough detail for business users, developers, operators, QA, and AI tools.\n4. Include source maps, how-to guidance, customization and extension rules, common mistakes, and verification.\n5. Run the read-only documentation and content-pack validation commands.\n6. Review canonical CMS records, declared Media assets and manifest checksums.\n7. Explicitly select and import the `docs-v001` documentation content pack into Staged.\n8. Request approval and publish Online.\n9. Open Axis and public consumers to verify the page and navigation.\n\n## Canonical data contract\n\nKeep import composition separate from canonical references. A standalone accelerator can reference an existing Framework guide without installing its whole documentation library. Declare explicit referenceCatalogues in the selected documentation manifest section, and retain exact documentId, owner and real heading anchor in the article's references. Tooling validates the target with the same local source/checksum/containment authority; missing packs, ambiguous identities, unknown owners and anchors fail instead of becoming implicit imports.\n\n| Declaration | Effect | Not implied |\n| --- | --- | --- |\n| CONTENT_PACK.includes | Composes declared canonical records and assets into the selected import. | Approval or Online activation. |\n| CONTENT_PACK.referenceCatalogues | Validates up to 16 explicit canonical target catalogues without importing their records or assets. | Installation, publication, access or cross-site visibility. |\n| Article references | Names exact documentId, owner and optional heading anchor. | A copy of the target article or a grant to read it. |\n\n```json\n{\n  \"referenceCatalogues\": [{\n    \"manifestPack\": \"nodics.docs\",\n    \"source\": {\n      \"type\": \"LOCAL_SIBLING\",\n      \"repositoryName\": \"nodics.ai\",\n      \"manifestPath\": \"nodics.docs/data/manifest.json\",\n      \"manifestSection\": \"documentation\"\n    }\n  }]\n}\n```\n\nFor example, the four-guide eWaste reference pack validates links into the Framework catalogue while staging only its own declared release files. CMS emits relatedLinks only for available routes in the exact immutable publication scope. A reference declaration does not make an absent or separately scoped target visible; install and publish the target explicitly when the intended reading journey requires it.\n\n```text\nowning-module/data/\n  docs-v001/\n    headers/\n    records/documentation/\n    assets/documentation/\n  manifest.json\n```\n\nThe data release contains documentation site, product, navigation, nodes, dashboards, pages, routes, components, page metadata, access policies, publication state and search metadata. These are canonical CMS records, not projections of Markdown files. Update the records together, preserve their hierarchy and identities, and declare their checksums in the owning manifest. Same-release images are declared Media records and assets, referenced from article blocks by stable mediaCode.\n\n## Review and Online activation\n\nDocumentation should flow through Staged before Online. Staged lets administrators and reviewers inspect hierarchy, access, rendering, source evidence, and search metadata. Online activation should validate the publication manifest, preserve approved checksums, activate delivery pointers, and keep rollback evidence. A production page should never be served from a developer working file or from generated data that bypassed approval.\n\nFor documentation recovery, follow `wcms.publishing-lifecycle#wcmsPublishingLifecycle-3-running-example`, which owns the exact baseline rollback procedure. Select the current publication and inspect previousOnlineVersion and the immutable prior snapshot, including navigation/access/search and exact retained Media dependencies. Capture current revision, actor, reason and correlation before the authorized human confirms the BackOffice rollback. BackOffice delegates the profile-bound CMS Staged baseline operation; CMS supplies the current expectedRevision to nPublish rather than letting the browser choose a target pointer.\n\nCMS_BASELINE_ROLLBACK_UNAVAILABLE means no eligible ONLINE publication with a previous version; a revision conflict means the decision is stale. Stop, reread and obtain a fresh decision; do not invent lineage or bypass approval. After rollback, inspect receipt, ROLLED_BACK state/revision, active prior Online pointer/manifest, served article, navigation/access/search and physical Media bytes. This restores the publication version, not repository prose, imported records or deleted assets, and does not promise atomic recovery across services or external cache freshness. Browser/live target verification remains a separate operator gate.\n\n## Customization and extension guidance\n\nDevelopers can extend documentation by adding new pages, navigation sections, metadata fields, validation checks, CMS record types, or renderer components. Keep custom validation in scripts or tooling services and keep business content in CMS article component blocks under the owning data release. A customer project can add documentation packs using the same release structure as other data packs, while Axis remains the review and publication journey.\n\nIf a capability page documents a module, add `sourceEvidence` paths to the module package, schema, service, router, data, and test files where possible. When source changes introduce a user-visible or extension-visible behavior, update the authored page in the same release batch.\n\n## Common mistakes\n\n- Creating a second prose source instead of updating the canonical CMS article blocks.\n- Adding a page without catalogue metadata or source evidence.\n- Publishing directly to Online without Staged review.\n- Treating README files as the complete business documentation.\n- Showing references as copied designs instead of standards for comparison.\n\n## Verification\n\nRun the documentation record validator, source coverage audit, and hardening audit. Then import CMS documentation data into a fresh Staged schema, request approval, publish Online, and open Axis plus the public consumer route. The work is complete when business users see the page in the right journey, developers can trace source evidence, operators can verify publication state, QA can repeat the commands, and production readers receive Online content only.\n\n## Module Ownership and Optional Composition\n\nDocumentation follows capability ownership, not the folder where a demonstration happens to run. A configuration guide belongs to nConfig; shared location behavior belongs to Location; reusable eWaste and Agora journeys belong to their respective accelerator modules. Kickoff keeps its actual deployment setup guidance. A partner adds local documentation only for real custom behavior. A guide may reference several owners without becoming a copy of all their guides.\n\n| Record or asset | Canonical owner | Selection |\n| --- | --- | --- |\n| Employee, product, price or operational policy | Owning business module and its normal business release | Init, Core or Sample according to the existing lifecycle contract |\n| Capability article, CMS page, metadata and page-link node | Owning capability data/docs-v001 | Explicit documentation CONTENT_PACK |\n| Accelerator journey and its reference guide | Corresponding framework accelerator | Its documentation or separately declared referenceDocumentation section |\n| Shared Site, template, navigation scaffold and cross-framework guidance | nodics.docs foundation section | Explicit dependency of a selected module documentation pack |\n| Documentation picture and Media declaration | Article owner for unique pictures; shared foundation for genuinely shared pictures | Declared with the selected documentation release, never an adjacent business folder |\n\n```mermaid\nflowchart TD\n  Choice[Explicit Axis documentation selection] --> Pack[Owner documentation manifest section]\n  Pack --> Foundation[Shared foundation include]\n  Pack --> Article[Owner CMS article and page graph]\n  Foundation --> Stage[Hash-checked nImport staging]\n  Article --> Stage\n  Stage --> Review[Staged inspection and governed approval]\n  Review --> Published[Immutable Online site composition]\n  Published --> References[Resolve available canonical guide references]\n```\n\nThe existing nImport content-pack service composes only explicit includes. It does not scan arbitrary module folders, infer documentation from business releases or activate optional business modules. A module pack includes the nodics.docs foundation section, not the complete library section; including the library would create a cycle. The full library explicitly includes its module packs. Shared foundation bytes are staged once even when several selected packs reference them.\n\n```js\nincludes: [{\n  manifestPack: \"nodics.docs\",\n  source: {\n    type: \"LOCAL_SIBLING\",\n    repositoryName: \"nodics.ai\",\n    manifestPath: \"nodics.docs/data/manifest.json\",\n    manifestSection: \"foundation\"\n  }\n}]\n```\n\nNormal configuration layering makes the explicitly selected content-pack descriptors visible to Axis. The documentation group supplies independent documentation setup profiles and publication baselines. Selecting an employee or product business release does not import these guides. Conversely, selecting a guide does not create employees, import transactional samples, approve a provider or grant permissions. The import receipt binds the local file checksums and all included pack versions and effective checksums. Missing sources, cycles, wrong pack identities, changed bytes, path escapes and conflicting staged files fail before normal importer dispatch.\n\n## References, Pictures and Publication Checks\n\nUse stable documentId plus owner for cross-module references; add an existing heading anchor for a precise section. Keep the original document identity, CMS code, route and heading anchors during an ownership move. Do not encode a filesystem location as document identity. Full-library validation resolves every related guide and checks typed owners and anchors. A module-only pack may reference a guide not selected by that deployment, but it must not silently import that other capability or duplicate its detail.\n\n```js\nreferences: [{\n  documentId: \"configuration.runtime-behavior-management\",\n  owner: \"config\"\n}]\n// Article images use { kind: \"image\", mediaCode: \"stableMediaCode\", alt: \"Meaningful description\" }.\n```\n\nOnline delivery derives related-guide links from the exact immutable published site, locale, channel and access scope. A target must have a matching canonical owner and any requested anchor. Missing, private, foreign-language, foreign-site and ambiguous targets do not become links. Previous and next links also require available published routes. This availability projection does not change canonical records or fetch Staged content. Axis displays only the resolved related links delivered by the backend.\n\nKeep binary images under assets/documentation in the owner release. Declare each file checksum in the selected manifest and retain its Media asset sourceFile, checksum, format and stable mediaCode. Moving a unique image changes its repository placement, not its bytes or public identity. A shared image stays in the foundation and is referenced by the same Media code. nImport stages only declared files, rechecks the bytes, and delegates Media hydration to the existing import owner. A local image path is never a public delivery URL; the renderer resolves Media through the authorized Media operation.\n\nBefore import, run documentation validation, full reference-graph validation, source coverage and hardening checks, and prove the selected pack stages no adjacent business data. Inspect the resulting Staged hierarchy, article blocks, diagrams, tables and images, then request normal publication review. Draft validation is an AUTHORING check, not public delivery approval. New draft guides retain inactive public routes until reviewed. Do not manufacture Online receipts, approvers or qualification flags to make an acceptance test pass. Finally verify the approved route and Media delivery through Axis in the actual target deployment; isolated tests alone do not establish live acceptance.\n\n## Functional visibility and physical record ownership\n\nA functional group organizes discovery, configuration inheritance and the reader hierarchy. It does not become the physical owner of every capability it contains. Choose the implementing module before creating CMS records or business seed data. The same guide can be discoverable from Foundation, an accelerator journey and a business topic through stable document references without storing another copy of its body. A cross-module overview belongs in the dedicated nodics.docs content package and references the detailed capability guides.\n\n| Record or guide | Canonical physical owner | Visibility and references |\n| --- | --- | --- |\n| Database and schema modeling guides | database under nDatabase | Visible within Foundation; reference the original schema guide and its anchors. |\n| Cache provider runbook | cache under nCache | The common cache capability references adapter-specific contracts without copying provider implementation. |\n| Module loading and runtime composition | config under nConfig | Foundation is the functional visibility boundary; nConfig implements loading and effective configuration. |\n| Store, Sales Channel and Point of Service seed records | store under baseCommerce | The store:core-reference DATA_RELEASE targets COMMERCE and never selects documentation. |\n| Payment provider boundaries | paymentCore under payment | Commerce organizes discovery; Payment Core owns the reusable payment orchestration guide. |\n| Telco subscription journey | telcoSubscription under telco | Reference Catalog, Provisioning and shared Commerce capability guides by stable identity. |\n| Foundation or Commerce overview | nodics.docs | One cross-module overview references the implementing modules; grouping roots contain no duplicate CMS pack. |\n| Service composition and module-to-module communication | nService | This package has its own implemented services and pipelines despite also grouping children. |\n| Governance contracts | nSetup contracts, not importable CMS data | A documentation guide can reference the contract; nSetup remains governance-only. |\n\n```mermaid\nflowchart TD\n  Need[\"New record or guide\"] --> Type{\"Business data or documentation?\"}\n  Type -->|Business| Capability[\"Implementing capability: DATA_RELEASE\"]\n  Type -->|Documentation| Scope{\"One capability or cross-module overview?\"}\n  Scope -->|Capability| Pack[\"Implementing capability: optional CONTENT_PACK\"]\n  Scope -->|Overview| Shared[\"nodics.docs: shared overview and scaffold\"]\n  Pack --> Ref[\"Stable document ID + canonical owner + optional anchor\"]\n  Shared --> Ref\n  Ref --> Group[\"Functional visibility and reading hierarchy\"]\n  Pack --> Media[\"Unique images + Media records in same docs-v001\"]\n  Shared --> SharedMedia[\"Shared assets declared once\"]\n```\n\nKeep a capability article, its page metadata, page-link node, route, search/publication records, import headers and unique images in one documentation pack. A unique image follows the article owner; genuinely reused images remain declared once in the shared foundation. Existing Media codes and asset checksums stay stable when paths move. The importer stages only explicitly declared files and foundation includes, so requesting business data cannot accidentally hydrate documentation assets. A move changes canonical source-owner references, not the public route or heading anchors. Online navigation resolves only guides in the exact published scope; an absent optional guide never installs another pack or falls back to Staged.\n\n| Verification | Expected result | Failure response |\n| --- | --- | --- |\n| Grouping-only package scan | No data directory or declared data ownership except the dedicated nodics.docs package | Move the records to their implementing owner; do not rename a group to evade the rule. |\n| Independent capability selection | Own records plus explicitly shared foundation; no unrelated capability or business seed files | Correct manifest includes and rerun isolated staging. |\n| Reference graph validation | One canonical identity per guide, matching owner and existing anchors | Repair references rather than copying a missing article. |\n| Business release selection | Store reference data is independently discovered at its canonical Store owner | Inspect configured contributions and COMMERCE destination before importing. |\n| Migration preservation | Existing routes, anchors, Media identities, image bytes and exported business payloads are preserved | Stop publication and resolve the discrepancy against the preservation evidence. |\n\nFor one coordinated CMS and Media approval action, follow the canonical [Coordinated pack and asset approvals](/docs/framework/wcms-publishing-lifecycle#wcms-coordinated-pack-asset-approvals) contract. The CMS owner explains exact asset pins, native Media permission checks, normal Process decisions, partial failure and explicit resume. This shared runbook references that detail rather than creating another publication policy.\n",
    "keywords": [
      "documentation",
      "publishing",
      "staged",
      "online",
      "content-pack",
      "Documentation Management",
      "Documentation Runtime and Publishing",
      "Documentation Publishing Runbook"
    ],
    "facets": {
      "section": "documentation-management",
      "group": "documentation-management",
      "navigationDepth": 2,
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
  },
  "record145": {
    "code": "nodicsDocsSearchpagenodicsdocsmetadatareferenceinternalsourceboundaryregister",
    "product": "nodicsDocumentationProduct",
    "targetType": "PAGE",
    "targetCode": "nodicsDocsMetadatareferenceInternalSourceBoundaryRegister",
    "title": "Internal Source Boundary Register",
    "summary": "Owner mapping for internal provider and utility modules that are covered by broader business capability pages instead of standalone product pages.",
    "searchText": "Internal Source Boundary Register Owner mapping for internal provider and utility modules that are covered by broader business capability pages instead of standalone product pages. # Internal Source Boundary Register\n\nThis is a framework-scoped maintainer decision register, not a list of disposable modules. It classifies every one of the 40 module rows with priorityScore < 15 in the 203-module source-coverage report reviewed on 2026-10-07. The user-authorized owner decision is whether explanation stays under a broader capability guide, or the module remains an internal helper, configuration contribution, governance boundary or reserved scaffold. Source inspection, not the score, determines that decision. No new public page is required merely because a package exists.\n\nFor beginners, start with the business capability you need and find its module in the register. Read the decision and remaining-gap columns before following the canonical guide link. An owner is the module responsible for the implementation or explanation; an internal helper supports that owner rather than offering a separate business workflow. For example, discoveryRanking orders existing results, while the Discovery guide explains how a domain supplies an authorized search projection. If a row says SCHEMA_DEFINED or RESERVED_SCAFFOLD, ask the named owner for implementation and acceptance evidence before planning a live integration.\n\n## Business problem\n\nBusiness users need coherent capabilities rather than one page per adapter. Developers and operators still need exact module boundaries, configuration limits and recovery ownership. Hiding a security API or value-bearing schema as internal-only would be as misleading as advertising an empty gateway package as supported. This register supplies traceability and an explicit residual gap; the linked canonical guide remains the authority for its business explanation and extension instructions.\n\n## Classification flow\n\n```mermaid\nflowchart TD\n  Inventory[\"Framework inventory: 203 modules\"] --> Candidates[\"Select 40 rows below 15 for review\"]\n  Candidates --> Inspect[\"Read owned source and contracts\"]\n  Inspect --> Meaning{\"What boundary actually exists?\"}\n  Meaning --> Helper[\"Internal helper, config or governance\"]\n  Meaning --> Capability[\"API, schema, security or integration contract\"]\n  Meaning --> Scaffold[\"Reserved scaffold without adapter\"]\n  Helper --> Owner[\"Name broader guide, exact anchor and reason\"]\n  Capability --> Owner\n  Scaffold --> Owner\n  Owner --> Limits[\"Record source maturity and remaining gap\"]\n  Limits --> Decision[\"Maintainer classification only; no depth or live promotion\"]\n```\n\n- INTERNAL_HELPER: implementation or test infrastructure stays internal; a capability guide explains its contract and limits. Internal does not mean untested, unauthenticated or unsupported by an owner.\n- BROADER_GUIDE: a real API, schema, configuration, security or partner boundary deserves explanation in the named capability guide. This is not internal-only retirement and not a requirement for a separate package page.\n- INTERNAL_CONFIGURATION: inert descriptors stay within their capability owner; activation and execution belong to the installing project and owner services.\n- INTERNAL_GOVERNANCE: non-runtime contributor/AI contracts remain discoverable governance, not a deployable service.\n- INTERNAL_SCAFFOLD: a reserved package without a source adapter is not an enabled or supported provider. A broader guide owns the handoff and unsupported-state explanation.\n\n## Register\n\nThe table is the complete bounded review set: 27 broader-guide boundaries, 8 internal helpers, 1 internal configuration contribution, 1 internal governance boundary and 3 reserved scaffolds. Paths are relative to the nodics.ai framework root and point to real non-data files. The guide owner is a documentation owner, not a transfer of source/API authority. A named exact section can supply broader context while its row explicitly retains missing module-specific depth; this mapping does not certify an exhaustive guide.\n\n| Framework boundary / triage score | Decision and source-based reason | Canonical guide owner, ID and exact section | Inspected non-data source (framework-relative) | Source maturity, not release approval | Remaining gap / separate owner evidence |\n| --- | --- | --- | --- | --- | --- |\n| `discoveryMapping` / 14 | `INTERNAL_HELPER`. Flat display-field allowlisting and sensitive-field exclusion support a domain projection; this is not a standalone search journey. | `discoveryRuntime` owns [discovery.search-indexing#discoverySearchIndexing-8-current-implementation-coverage](/docs/framework/discovery-search-indexing#discoverySearchIndexing-8-current-implementation-coverage). | `nodics.discovery/modules/discoveryMapping/src/service/defaultDiscoveryFieldPolicyService.js` | `IMPLEMENTED_HELPER` | No nested-field or domain authorization proof; the source owner must qualify each domain projection. |\n| `discoveryRanking` / 14 | `INTERNAL_HELPER`. Generic PIN, BOOST and BURY actions order existing results with stable original-order ties; consumers select the ranking policy. | `discoveryRuntime` owns [discovery.search-indexing#discoverySearchIndexing-8-current-implementation-coverage](/docs/framework/discovery-search-indexing#discoverySearchIndexing-8-current-implementation-coverage). | `nodics.discovery/modules/discoveryRanking/src/service/defaultDiscoveryRankingEngineService.js` | `IMPLEMENTED_HELPER` | No business rule selection, index relevance qualification or tenant-safe consumer wiring is established by this helper. |\n| `discoverySource` / 14 | `INTERNAL_HELPER`. A process-local ownerType/sourceCode registry registers and resolves source providers; it is a reusable extension point, not a source business owner. | `discoveryRuntime` owns [discovery.search-indexing#discoverySearchIndexing-8-current-implementation-coverage](/docs/framework/discovery-search-indexing#discoverySearchIndexing-8-current-implementation-coverage). | `nodics.discovery/modules/discoverySource/src/service/defaultDiscoverySourceRegistryService.js` | `IMPLEMENTED_REGISTRY` | Consumer registration, provider admission, authorization, rebuild and installed source coverage remain owner responsibilities. |\n| `wasteApi` / 14 | `BROADER_GUIDE`. Secured routes and controller/facade delegation expose generic Waste operations; internal exposure is not a reason to hide an integration/security contract. | `eWaste` owns [accelerators.circa-operations-rewards#acceleratorsCircaOperationsRewards-1-staff-roles-and-resource-boundaries](/docs/framework/accelerators/circa/operations#acceleratorsCircaOperationsRewards-1-staff-roles-and-resource-boundaries). | `nodics.waste/modules/wasteApi/src/router/routers.js`; `nodics.waste/modules/wasteApi/src/controller/defaultWasteInternalController.js`; `nodics.waste/modules/wasteApi/src/facade/defaultWasteInternalFacade.js` | `IMPLEMENTED_API_CONTRACT` | The Circa guide supplies role context, not a complete generic API runbook. submitWaste returns a payload rather than proof of persistence; installed routing, authorization and full business acceptance remain separate. |\n| `loyaltyProgram` / 13 | `BROADER_GUIDE`. Program identity, status, default reward type, earning/spending settings and validity are business configuration, not disposable internal plumbing. | `loyaltyWallet` owns [loyalty.wallets-rewards-ledger#loyaltyWalletsRewardsLedger-3-source-map](/docs/framework/loyalty-wallets-rewards-ledger#loyaltyWalletsRewardsLedger-3-source-map). | `nodics.loyalty/modules/loyaltyProgram/src/schemas/schemas.js` | `SCHEMA_DEFINED` | Schema/generated operations do not execute earning, spending, expiry or approval policy; the Loyalty owner must qualify effective program configuration. |\n| `loyaltyRedemption` / 13 | `BROADER_GUIDE`. rewardRedemption records a wallet/program/reward amount and target/reservation/ledger lineage across CREATED, CAPTURED, RELEASED, REVERSED and FAILED states. | `loyaltyWallet` owns [loyalty.wallets-rewards-ledger#loyaltyWalletsRewardsLedger-9-capture](/docs/framework/loyalty-wallets-rewards-ledger#loyaltyWalletsRewardsLedger-9-capture). | `nodics.loyalty/modules/loyaltyRedemption/src/schemas/schemas.js` | `SCHEMA_DEFINED` | Enums and idempotency fields are not transition enforcement or Commerce completion; owner commands and reconciliation require separate validation. |\n| `loyaltyReservation` / 13 | `BROADER_GUIDE`. rewardReservation models held value, source/target context, expiry, ledger references and revision; reservation is a customer-visible money/value boundary. | `loyaltyWallet` owns [loyalty.wallets-rewards-ledger#loyaltyWalletsRewardsLedger-8-reserve](/docs/framework/loyalty-wallets-rewards-ledger#loyaltyWalletsRewardsLedger-8-reserve). | `nodics.loyalty/modules/loyaltyReservation/src/schemas/schemas.js` | `SCHEMA_DEFINED` | The schema alone does not reserve balances, prevent duplicate commands, expire holds or enforce optimistic concurrency. |\n| `loyaltyRewardType` / 13 | `BROADER_GUIDE`. POINT, CREDIT, STAMP, TOKEN and CUSTOM units, precision, negative-value policy and expiry are shared business data contracts. | `loyaltyWallet` owns [loyalty.wallets-rewards-ledger#loyaltyWalletsRewardsLedger-4-owner-model](/docs/framework/loyalty-wallets-rewards-ledger#loyaltyWalletsRewardsLedger-4-owner-model). | `nodics.loyalty/modules/loyaltyRewardType/src/schemas/schemas.js` | `SCHEMA_DEFINED` | A unit definition is not a currency valuation, financial qualification or executable issuance/expiry policy. |\n| `rulesCore` / 11 | `BROADER_GUIDE`. Generic operators and property/outcome registries are public extension contracts; outcome validation does not execute consumer side effects. | `rulesEvaluation` owns [rules.deterministic-evaluation#rules-evaluation-customize-and-extend-safely](/docs/framework/rules-deterministic-evaluation#rules-evaluation-customize-and-extend-safely). | `nodics.rulesEngine/modules/rulesCore/src/service/defaultRuleOperatorService.js`; `nodics.rulesEngine/modules/rulesCore/src/service/defaultRuleOutcomeRegistryService.js`; `nodics.rulesEngine/modules/rulesCore/src/service/defaultRulePropertyCatalogueRegistryService.js` | `IMPLEMENTED_EXTENSION_CONTRACT` | Consumer-owned property semantics, provider registration, outcome execution and domain governance must be supplied and tested by the consumer. |\n| `loyaltyRewardProvider` / 9 | `BROADER_GUIDE`. The Payment adapter invokes Loyalty reserve/capture/release/reverse through owner APIs and checks customer/wallet context; it does not own a second ledger. | `loyaltyWallet` owns [loyalty.wallets-rewards-ledger#loyaltyWalletsRewardsLedger-12-reward-payment-provider-checkout-pattern](/docs/framework/loyalty-wallets-rewards-ledger#loyaltyWalletsRewardsLedger-12-reward-payment-provider-checkout-pattern). | `nodics.commerce/modules/payment/modules/paymentProviders/modules/loyaltyRewardProvider/src/service/defaultLoyaltyRewardPaymentProviderService.js` | `IMPLEMENTED_OWNER_API_ADAPTER` | Authorized funded fixtures, installed service-account/customer scopes, persisted outcomes and interrupted reconciliation were not accepted by this editorial review. |\n| `wasteReward` / 9 | `BROADER_GUIDE`. Append-only reward assessments retain policy/band/catalogue versions, input snapshots and explainable ESTIMATED/CONFIRMED/RECALCULATED evidence; they do not post Loyalty balances. | `eWaste` owns [accelerators.circa-operations-rewards#acceleratorsCircaOperationsRewards-5-rewards-and-settlement](/docs/framework/accelerators/circa/operations#acceleratorsCircaOperationsRewards-5-rewards-and-settlement). | `nodics.waste/modules/wasteReward/src/schemas/schemas.js` | `SCHEMA_DEFINED` | Read-only BackOffice and disabled direct router declarations do not prove append-only enforcement in every writer or settlement. Consumer calculation and Loyalty posting remain separately owned. |\n| `cmsStaged` / 9 | `INTERNAL_HELPER`. A schema overlay opts ten CMS publishable schemas into versioning; it neither publishes content nor owns a second CMS lifecycle. | `cms` owns [wcms.publishing-lifecycle#wcmsPublishingLifecycle-1-why-separate-staged-and-online](/docs/framework/wcms-publishing-lifecycle#wcmsPublishingLifecycle-1-why-separate-staged-and-online). | `nodics.wcms/modules/cmsStaged/src/schemas/schemas.js` | `IMPLEMENTED_SCHEMA_OVERLAY` | Effective Staged/Online isolation, freeze, approval, publish and delivery require the owning CMS/nPublish runtime and separate acceptance. |\n| `loyaltyRewardPayment` / 7 | `BROADER_GUIDE`. Method preparation binds a calculated positive total, wallet, currency and authenticated context to the reward provider; it rejects conflicting amount/currency input. | `loyaltyWallet` owns [loyalty.wallets-rewards-ledger#loyaltyWalletsRewardsLedger-12-reward-payment-provider-checkout-pattern](/docs/framework/loyalty-wallets-rewards-ledger#loyaltyWalletsRewardsLedger-12-reward-payment-provider-checkout-pattern). | `nodics.commerce/modules/payment/modules/paymentMethods/modules/loyaltyRewardPayment/src/service/defaultLoyaltyRewardPaymentMethodService.js` | `IMPLEMENTED_METHOD_VALIDATION` | Preparation does not hold or debit value. Installed method selection, wallet eligibility and provider settlement/reconciliation remain separate. |\n| `commsVerification` / 7 | `BROADER_GUIDE`. Transient secret comparison and persisted challenge/proof issue, verify, consume, receipt, replace and cancel are security integration contracts, not an identity grant. | `commsCore` owns [communication.overview#communicationOverview-6-verification-journey](/docs/framework/communication-overview#communicationOverview-6-verification-journey). | `nodics.communication/modules/commsVerification/src/service/defaultCommunicationVerificationService.js` | `IMPLEMENTED_CHALLENGE_CONTRACT` | The broader section explains possession versus authority; stored continuation/readback, expiry and conflict detail still needs owner runbook depth and installed-store acceptance. Profile/purpose owners decide business execution. |\n| `smsCommsProvider` / 7 | `BROADER_GUIDE`. Disabled sandbox-only delivery uses an injected credential/transport boundary, bounded SMS, tenant/channel/lease checks and suppression/uncertainty outcomes. | `commsCore` owns [communication.provider-runbooks#communicationProviderRunbooks-10-sms-injected-sandbox-configuration](/docs/framework/communication-provider-runbooks#communicationProviderRunbooks-10-sms-injected-sandbox-configuration). | `nodics.communication/modules/smsCommsProvider/src/service/defaultSmsCommunicationProviderService.js` | `IMPLEMENTED_INJECTED_SANDBOX` | No live SMS client, production qualification or handset delivery proof. Operators must supply authorized transport and qualify recovery without blind replay. |\n| `smtpCommsProvider` / 7 | `BROADER_GUIDE`. Email has injected-sandbox and controlled nodemailer SMTP modes with testOnly/recipient allowlisting and explicit definitive-versus-uncertain recovery. | `commsCore` owns [communication.provider-runbooks#communicationProviderRunbooks-5-email-controlled-smtp-configuration](/docs/framework/communication-provider-runbooks#communicationProviderRunbooks-5-email-controlled-smtp-configuration). | `nodics.communication/modules/smtpCommsProvider/src/service/defaultSmtpCommunicationProviderService.js` | `IMPLEMENTED_CONTROLLED_TEST_TRANSPORT` | SMTP acceptance is not inbox receipt; production deliverability, credential provisioning and uncertain-send reconciliation remain unqualified. |\n| `ollamaProvider` / 7 | `BROADER_GUIDE`. Real chat mapping and bounded NDJSON transport require explicit remote-host policy; shared provider-neutral explanation avoids vendor-guide duplication. | `copilotProvider` owns [copilot.provider-usage-budgets#copilot-provider-adapter-contracts](/docs/framework/copilot-provider-usage-budgets#copilot-provider-adapter-contracts). | `nodics.copilot/modules/copilotProviders/modules/ollamaProvider/src/service/defaultOllamaCopilotProviderAdapterService.js`; `nodics.copilot/modules/copilotProviders/modules/ollamaProvider/AGENTS.md` | `IMPLEMENTED_ADAPTER; EXISTING_OWNER_REVIEWED_REFERENCE` | Retain the existing mapping, not a new depth claim. Local/remote deployment, model capability, privacy, measured usage and live endpoint qualification remain separate. |\n| `wasteCompliance` / 7 | `BROADER_GUIDE`. Jurisdiction/family/hazard profiles and evidence/chain-of-custody decisions are business evidence; the existing shared guide owns their explanation. | `eWaste` owns [accelerators.circa-operations-rewards#circa-downstream-waste-owner-boundaries](/docs/framework/accelerators/circa/operations#circa-downstream-waste-owner-boundaries). | `nodics.waste/modules/wasteCompliance/src/schemas/schemas.js`; `nodics.waste/modules/wasteCompliance/AGENTS.md` | `SCHEMA_DEFINED; EXISTING_OWNER_REVIEWED_REFERENCE` | Retain the existing mapping. An APPROVED value is not legal certification; jurisdiction policy, evidence verification and custody orchestration are not proved. |\n| `wasteMovement` / 7 | `BROADER_GUIDE`. Batch and movement schemas represent source/target locations, operator, status, dates and evidence; this is a downstream custody contract. | `eWaste` owns [accelerators.circa-operations-rewards#circa-downstream-waste-owner-boundaries](/docs/framework/accelerators/circa/operations#circa-downstream-waste-owner-boundaries). | `nodics.waste/modules/wasteMovement/src/schemas/schemas.js`; `nodics.waste/modules/wasteMovement/AGENTS.md` | `SCHEMA_DEFINED; EXISTING_OWNER_REVIEWED_REFERENCE` | Retain the existing mapping. Planned pickup is not arrival/recycling; transitions, external logistics confirmation and replay enforcement remain separate. |\n| `wasteReceipt` / 7 | `BROADER_GUIDE`. Physical receipt records observed facts, receiver/time, quantities, evidence and discrepancy status independently from submission approval. | `eWaste` owns [accelerators.circa-operations-rewards#circa-downstream-waste-owner-boundaries](/docs/framework/accelerators/circa/operations#circa-downstream-waste-owner-boundaries). | `nodics.waste/modules/wasteReceipt/src/schemas/schemas.js`; `nodics.waste/modules/wasteReceipt/AGENTS.md` | `SCHEMA_DEFINED; EXISTING_OWNER_REVIEWED_REFERENCE` | Retain the existing mapping. Generated declarations and status enums do not prove custody, quantities, authorized transitions or installed permission enforcement. |\n| `wasteRecycling` / 5 | `BROADER_GUIDE`. Provider-neutral donation handoff/completion contracts validate pending asset/transfer/receiver context and return movement intents and audit/domain-event evidence. | `eWaste` owns [accelerators.circa-operations-rewards#circa-downstream-waste-owner-boundaries](/docs/framework/accelerators/circa/operations#circa-downstream-waste-owner-boundaries). | `nodics.accelerators/modules/waste/modules/wasteRecycling/src/service/defaultWasteRecyclingHandoffContractService.js` | `IMPLEMENTED_HANDOFF_CONTRACT` | The shared section supplies downstream ownership context, not a recycling runbook. No recycler transport, persistence, outbox delivery, certification or physical completion is implemented here. |\n| `openAiProvider` / 5 | `BROADER_GUIDE`. Responses mapping supports profile-controlled retrieval, checked image formats and strict response schemas; normalization rejects explicit incomplete/refused responses. | `copilotProvider` owns [copilot.provider-usage-budgets#copilot-provider-adapter-contracts](/docs/framework/copilot-provider-usage-budgets#copilot-provider-adapter-contracts). | `nodics.copilot/modules/copilotProviders/modules/openAiProvider/src/service/defaultOpenAiCopilotProviderAdapterService.js`; `nodics.copilot/modules/copilotProviders/modules/openAiProvider/AGENTS.md` | `IMPLEMENTED_ADAPTER; EXISTING_OWNER_REVIEWED_REFERENCE` | Retain the existing mapping. invokeStream emits one completion, not incremental transport; live provider/model, privacy, limits and billing require separate qualification. |\n| `discoveryQuery` / 5 | `INTERNAL_HELPER`. Query construction trims text, bounds pagination and selects whitelisted sorts over a shallow base query; domain APIs own request DTOs and result projection. | `discoveryRuntime` owns [discovery.search-indexing#discoverySearchIndexing-8-current-implementation-coverage](/docs/framework/discovery-search-indexing#discoverySearchIndexing-8-current-implementation-coverage). | `nodics.discovery/modules/discoveryQuery/src/service/defaultDiscoveryQueryBuilderService.js` | `IMPLEMENTED_HELPER` | No domain filter authorization, arbitrary query safety or provider-specific query semantics is established by this builder. |\n| `engagementComms` / 5 | `BROADER_GUIDE`. The implemented one-way CONTACT/FEEDBACK/REVIEW/TESTIMONIAL bridge builds Communication commands and returns DEFERRED without changing domain state on failure. | `commsCore` owns [communication.overview#communicationOverview-8-engagement-integration](/docs/framework/communication-overview#communicationOverview-8-engagement-integration). | `nodics.engagement/modules/engagementComms/src/service/defaultEngagementCommunicationService.js`; `nodics.engagement/modules/engagementComms/AGENTS.md` | `IMPLEMENTED_BRIDGE` | Local AGENTS still describes a scaffold, while source implements the bridge. Owner guidance reconciliation, durable retry scheduling and installed delivery remain separate; this change does not edit them. |\n| `bankTransferPayment` / 3 | `BROADER_GUIDE`. Method preparation requires tenant context and a bank_ reference, then freezes a BANK_TRANSFER provider-neutral request; it is a payment-method contract. | `paymentCore` owns [commerce.payment-provider-boundaries#commercePaymentProviderBoundaries-2-boundary-model](/docs/framework/commerce-payment-provider-boundaries#commercePaymentProviderBoundaries-2-boundary-model). | `nodics.commerce/modules/payment/modules/paymentMethods/modules/bankTransferPayment/src/service/defaultBankTransferPaymentMethodService.js` | `IMPLEMENTED_METHOD_VALIDATION` | No bank connection, transfer confirmation or reconciliation is implemented by prepare; owner guidance must retain that distinction. |\n| `cardPayment` / 3 | `BROADER_GUIDE`. Method preparation accepts a tenant-scoped tok_ reference and emits a frozen CARD contract; it does not collect or authorize raw card data. | `paymentCore` owns [commerce.payment-provider-boundaries#commercePaymentProviderBoundaries-3-safe-payload-contract](/docs/framework/commerce-payment-provider-boundaries#commercePaymentProviderBoundaries-3-safe-payload-contract). | `nodics.commerce/modules/payment/modules/paymentMethods/modules/cardPayment/src/service/defaultCardPaymentMethodService.js` | `IMPLEMENTED_METHOD_VALIDATION` | Token-prefix validation is not token authenticity, gateway authorization, PCI qualification or settlement evidence. |\n| `cashOnDeliveryPayment` / 3 | `BROADER_GUIDE`. Tenant context and explicit acceptTerms are required before a frozen CASH_ON_DELIVERY method contract is returned without a provider token. | `paymentCore` owns [commerce.payment-provider-boundaries#commercePaymentProviderBoundaries-2-boundary-model](/docs/framework/commerce-payment-provider-boundaries#commercePaymentProviderBoundaries-2-boundary-model). | `nodics.commerce/modules/payment/modules/paymentMethods/modules/cashOnDeliveryPayment/src/service/defaultCashOnDeliveryPaymentMethodService.js` | `IMPLEMENTED_METHOD_VALIDATION` | No cash collection, fulfilment confirmation or debt/reconciliation workflow is implemented by this method. |\n| `walletPayment` / 3 | `BROADER_GUIDE`. Tenant context and a wallet_ token produce a frozen WALLET method contract; generic token preparation does not own a wallet ledger. | `paymentCore` owns [commerce.payment-provider-boundaries#commercePaymentProviderBoundaries-3-safe-payload-contract](/docs/framework/commerce-payment-provider-boundaries#commercePaymentProviderBoundaries-3-safe-payload-contract). | `nodics.commerce/modules/payment/modules/paymentMethods/modules/walletPayment/src/service/defaultWalletPaymentMethodService.js` | `IMPLEMENTED_METHOD_VALIDATION` | Wallet ownership, available funds, provider qualification and settlement need the actual wallet/provider owner; this is not the Loyalty reward adapter. |\n| `paymentProviderCore` / 3 | `INTERNAL_HELPER`. HMAC verification, freshness and replay-store checks are a reusable callback security helper beneath Payment, not an independent payment product. | `paymentCore` owns [commerce.payment-provider-boundaries#commercePaymentProviderBoundaries-3-safe-payload-contract](/docs/framework/commerce-payment-provider-boundaries#commercePaymentProviderBoundaries-3-safe-payload-contract). | `nodics.commerce/modules/payment/modules/paymentProviders/modules/paymentProviderCore/src/service/defaultPaymentCallbackSecurityService.js` | `IMPLEMENTED_SECURITY_HELPER` | Durable atomic replay admission and provider-specific signature/body mapping must be qualified; a caller-supplied exists/record store is not proof of race-safe production replay prevention. |\n| `stripeProvider` / 3 | `BROADER_GUIDE`. Legacy token-based offline operations remain conformance only. Fresh explicit LOCAL_SANDBOX_DEMO CARD captures retain tenant, enterprise, buyer, Order, amount, currency and original-key-bound receipts. Guarded tokenless full refunds revalidate Order approval, remaining authority and retained capture/refund evidence. Historical unbound captures remain refused; all results are OFFLINE_CONFORMANCE, never real financial execution. | `paymentCore` owns [commerce.payment-provider-boundaries#commerce-payment-provider-boundaries-original-capture-contract](/docs/framework/commerce-payment-provider-boundaries#commerce-payment-provider-boundaries-original-capture-contract). | `nodics.commerce/modules/payment/modules/paymentProviders/modules/stripeProvider/src/service/defaultStripeSandboxAdapterService.js` | `IMPLEMENTED_OFFLINE_SANDBOX` | Not a live Stripe gateway. Real provider capture/account lookup, original-reference refund, outcome reconciliation, callbacks and operational/security/finance qualification remain external gates. Native Checkout selection and Order labels require separate installed acceptance. |\n| `localCommsProvider` / 3 | `INTERNAL_HELPER`. A deterministic content-free local adapter returns a hash-based DELIVERED result for development contracts without an external send. | `commsCore` owns [communication.provider-runbooks#communicationProviderRunbooks-1-implemented-modes-and-limits](/docs/framework/communication-provider-runbooks#communicationProviderRunbooks-1-implemented-modes-and-limits). | `nodics.communication/modules/localCommsProvider/src/service/defaultLocalCommunicationProviderService.js` | `IMPLEMENTED_LOCAL_SIMULATION` | Local DELIVERED is not provider acceptance or recipient receipt; real transport and operational delivery evidence remain separate. |\n| `claudeProvider` / 3 | `BROADER_GUIDE`. Messages transport separates system content, resolves backend secret references and normalizes text/tool descriptors and usage into the shared contract. | `copilotProvider` owns [copilot.provider-usage-budgets#copilot-provider-adapter-contracts](/docs/framework/copilot-provider-usage-budgets#copilot-provider-adapter-contracts). | `nodics.copilot/modules/copilotProviders/modules/claudeProvider/src/service/defaultClaudeCopilotProviderAdapterService.js`; `nodics.copilot/modules/copilotProviders/modules/claudeProvider/AGENTS.md` | `IMPLEMENTED_ADAPTER; EXISTING_OWNER_REVIEWED_REFERENCE` | Retain the existing mapping. request.tools is not mapped; stream emits one completion, size check follows buffering and cancellation relies on supplied signal. Live/model/memory/timeout qualification remains separate. |\n| `geminiProvider` / 3 | `BROADER_GUIDE`. generateContent transport maps system instructions, user/model roles and generation settings, normalizing first-candidate text/function descriptors and usage. | `copilotProvider` owns [copilot.provider-usage-budgets#copilot-provider-adapter-contracts](/docs/framework/copilot-provider-usage-budgets#copilot-provider-adapter-contracts). | `nodics.copilot/modules/copilotProviders/modules/geminiProvider/src/service/defaultGeminiCopilotProviderAdapterService.js`; `nodics.copilot/modules/copilotProviders/modules/geminiProvider/AGENTS.md` | `IMPLEMENTED_ADAPTER; EXISTING_OWNER_REVIEWED_REFERENCE` | Retain the existing mapping. request.tools is not mapped; stream emits one completion and response bounds follow buffering. Missing counts are null, not zero; live/model/timeout qualification remains separate. |\n| `mockProvider` / 3 | `INTERNAL_HELPER`. An in-process deterministic response returns mock content with zero test usage; it supplies a provider test double, not a supported external model. | `copilotProvider` owns [copilot.provider-usage-budgets#copilotProviderUsageBudgets-4-verification-and-failure-recovery](/docs/framework/copilot-provider-usage-budgets#copilotProviderUsageBudgets-4-verification-and-failure-recovery). | `nodics.copilot/modules/copilotProviders/modules/mockProvider/src/service/defaultCopilotMockProviderAdapterService.js` | `IMPLEMENTED_TEST_DOUBLE` | Cannot establish model behavior, authorization, provider cost, privacy or transport reliability; shared verification owns the distinction. |\n| `nexusCore` / 2 | `INTERNAL_CONFIGURATION`. Inert configuration contributes Nexus initialization profiles, governed content/media/engagement package descriptors and acceptance tooling descriptors; it does not execute imports. | `nexus.web` owns [applications.nexus-data-content-guide#applicationsNexusDataContentGuide-2-release-layout](/docs/framework/applications-nexus-data-content-guide#applicationsNexusDataContentGuide-2-release-layout). | `nodics.accelerators/modules/nexus/modules/nexusCore/package.json`; `nodics.accelerators/modules/nexus/modules/nexusCore/config/properties.js`; `nodics.accelerators/modules/nexus/modules/nexusCore/AGENTS.md` | `IMPLEMENTED_CONFIGURATION_CONTRIBUTION` | Project activation, effective profile ordering, import/publication and installed content acceptance remain separate. Release-layout context is not complete initializer/operator guidance. |\n| `cyberSourceProvider` / 0 | `INTERNAL_SCAFFOLD`. Package/config/LLM boundary reserves a provider name; no source adapter implements gateway operations. | `paymentCore` owns [commerce.payment-provider-boundaries#commercePaymentProviderBoundaries-5-implementation-handoff](/docs/framework/commerce-payment-provider-boundaries#commercePaymentProviderBoundaries-5-implementation-handoff). | `nodics.commerce/modules/payment/modules/paymentProviders/modules/cyberSourceProvider/package.json`; `nodics.commerce/modules/payment/modules/paymentProviders/modules/cyberSourceProvider/README.md`; `nodics.commerce/modules/payment/modules/paymentProviders/modules/cyberSourceProvider/AGENTS.md` | `RESERVED_SCAFFOLD` | Not a supported gateway. Requires an owner-approved adapter, secure configuration/callback/reconciliation contracts and separate qualification before advertising support. |\n| `paypalProvider` / 0 | `INTERNAL_SCAFFOLD`. Package/config/LLM boundary reserves a provider name; no source adapter implements gateway operations. | `paymentCore` owns [commerce.payment-provider-boundaries#commercePaymentProviderBoundaries-5-implementation-handoff](/docs/framework/commerce-payment-provider-boundaries#commercePaymentProviderBoundaries-5-implementation-handoff). | `nodics.commerce/modules/payment/modules/paymentProviders/modules/paypalProvider/package.json`; `nodics.commerce/modules/payment/modules/paymentProviders/modules/paypalProvider/README.md`; `nodics.commerce/modules/payment/modules/paymentProviders/modules/paypalProvider/AGENTS.md` | `RESERVED_SCAFFOLD` | Not a supported gateway. Requires an owner-approved adapter, secure configuration/callback/reconciliation contracts and separate qualification before advertising support. |\n| `visaProvider` / 0 | `INTERNAL_SCAFFOLD`. Package/config/LLM boundary reserves a provider name; no source adapter implements gateway operations. | `paymentCore` owns [commerce.payment-provider-boundaries#commercePaymentProviderBoundaries-5-implementation-handoff](/docs/framework/commerce-payment-provider-boundaries#commercePaymentProviderBoundaries-5-implementation-handoff). | `nodics.commerce/modules/payment/modules/paymentProviders/modules/visaProvider/package.json`; `nodics.commerce/modules/payment/modules/paymentProviders/modules/visaProvider/README.md`; `nodics.commerce/modules/payment/modules/paymentProviders/modules/visaProvider/AGENTS.md` | `RESERVED_SCAFFOLD` | Not a supported gateway. Requires an owner-approved adapter, secure configuration/callback/reconciliation contracts and separate qualification before advertising support. |\n| `nFacade` / 0 | `BROADER_GUIDE`. Real schema-facade generation delegates operations to owning services; concrete cache and validator facades delegate runtime maintenance. A score of zero misses facade signals. | `nodics.docs` owns [foundation.overview#foundationOverview-5-request-processing-model](/docs/framework/foundation-overview#foundationOverview-5-request-processing-model). | `nodics.foundation/modules/nFacade/src/facade/common.js`; `nodics.foundation/modules/nFacade/src/facade/cache/defaultCacheFacade.js`; `nodics.foundation/modules/nFacade/src/facade/validator/defaultValidatorFacade.js` | `IMPLEMENTED_FACADE_CAPABILITY` | Do not call this a scaffold. The broad request-flow guide is the canonical home; facade-specific generation/override examples and installed delegation tests remain owner work, not implied deep coverage. |\n| `nSetup` / 0 | `INTERNAL_GOVERNANCE`. Package metadata sets runtimeModule/loadable false; source contains governance and AI/developer contracts, not runtime schemas, routes or services. | `nodics.docs` owns [foundation.overview#foundationOverview-8-developer-workflow](/docs/framework/foundation-overview#foundationOverview-8-developer-workflow). | `nodics.foundation/modules/nSetup/package.json`; `nodics.foundation/modules/nSetup/AGENTS.md` | `MAINTAINED_NON_RUNTIME_CONTRACTS` | Keep governance instructions discoverable and inherited; absence of runtime code is intentional, not a missing deployed service or permission to invent one. |\n\n## Classification contract\n\nEach decision binds a module, inspected source, reason, canonical document ID and existing heading anchor, source maturity and a remaining gap. IMPLEMENTED means the stated checked-in contract exists; SCHEMA_DEFINED means data and generated-operation declarations exist; neither asserts installed authorization, enforced transitions, production readiness or end-to-end acceptance. The source audit weights counted schemas/services/routes and other signals; it does not measure business maturity and does not count facade capability in that score. nFacade therefore remains a real implemented capability despite its zero score.\n\nPreserve the seven existing sourceOwnership mappings without change: ollamaProvider, openAiProvider, claudeProvider and geminiProvider stay under copilot.provider-usage-budgets#copilot-provider-adapter-contracts; wasteReceipt, wasteMovement and wasteCompliance stay under accelerators.circa-operations-rewards#circa-downstream-waste-owner-boundaries. Their status is owner-reviewed-reference, not validated-source-sections. This register introduces no replacement sourceOwnership or sourceCoverage claim and does not promote any of the report's 179 mention-based-triage rows to deep semantic passes.\n\n```mermaid\nflowchart LR\n  Source[\"Source module retains implementation authority\"] --> Register[\"Register records classification and residual gap\"]\n  Register --> Guide[\"Existing capability guide owns explanation\"]\n  Guide --> Extension[\"Owner extension and operator guidance\"]\n  Source --> Runtime[\"Effective installed configuration and permissions\"]\n  Runtime --> Acceptance[\"Separate authorized business and provider acceptance\"]\n  Register -. \"does not grant approval or certify depth\" .-> Acceptance\n```\n\nProject deployment references are a different evidence boundary. Sibling nodics.kickoff envs/kickoffLocal and envs/kickoffDockerLocal, their Commerce/WCMS server packages, and kickoffApi/kickoffCore/kickoffInt are customer-project topology or composition, not rows in this framework inventory. The nTooling-owned [Local Quick Start, Quick path](/docs/framework/framework-local-quick-start#frameworkLocalQuickStart-1-quick-path) is framework orientation; the actual project's own environment/runbook and current deployment decisions govern topology, activation and credentials. No sibling source was counted or certified by this register, and no deployment or live acceptance follows from its presence.\n\n## Customization and extension guidance\n\nExtend the established owner rather than copying a body guide into each package. Domain modules supply Discovery projection/source policy; consumers supply Rules properties/outcomes; Loyalty owns balances and ledger operations; Payment methods prepare contracts while providers execute their own scoped operations. Communication proves bounded channel evidence, not identity or business authorization. Copilot adapters map transport, not permissions, tool execution or budgets. Waste receipt, movement, compliance, assessment and recycling contracts remain distinct from accelerator orchestration and physical-world claims.\n\nFollow inherited module contracts and the named guide's extension section. Later-layer facade/service or configuration changes must preserve tenant/auth context and owner APIs. Do not use an internal classification to bypass eligibility, private capture, callback verification, provider uncertainty, authorization, approval or immutable history. The row's residual gap belongs to its source owner and broader guide owner; this editorial change does not implement missing transport, persistence, retries or enforcement.\n\n## Promotion rules\n\nRe-review a classification when owned source gains a business workflow, tenant setting, public/secured API, customer-visible state, operator recovery path or external integration contract. Prefer an anchored section in the current owner guide; create a new page only when an independently navigable journey genuinely warrants it. A scaffold becomes an implementation only after source exists and has been reviewed. A schema becomes an orchestrated workflow only with enforcing owner commands and evidence. Provider enablement and release/production approval remain separate gates.\n\nReconcile the register when framework inventory or actual source changes; do not freeze the 203/40 counts as a permanent topology promise. Semantic closure for this backlog item requires all candidates to have reasoned decisions, not all residual capability/runbook gaps to disappear. Any changed canonical blocks or inspected source bytes invalidate the evidence binding until final owner review is refreshed.\n\n## Common mistakes\n\n- Treating priorityScore, package names, generated context or README claims as implementation maturity.\n- Calling nFacade an empty scaffold because the audit has no facade counter, or calling reserved gateway packages supported because configuration folders exist.\n- Confusing generated CRUD declarations, idempotency fields, enums or provider acknowledgements with enforced lifecycle transitions, physical custody, delivery or settled value.\n- Converting the seven reviewed references or 179 mention-based rows into detailed-source coverage without their separate source-depth review.\n- Counting sibling project environments in framework inventory or duplicating capability guides instead of linking real owners and anchors.\n- Interpreting classification closure as browser, persisted-runtime, full Circa/Commerce business journey or live-provider acceptance.\n\n## Verification\n\nEditorial verification checks the exact 40-module set, one decision per module, owned non-data source paths, real guide owners/heading anchors, preserved seven mappings and current source-byte/document-block evidence. The corrections evidence closes only Internal-only classification register with the unchanged requested action. Remaining guide depth is explicit rather than silently certified. The original semantic review remains historical and immutable.\n\nAfter changing a canonical article, regenerate its source projections, validate documentation integrity and rerun the aggregate coverage audit. A classification decision does not itself change module configuration, runtime data, permissions or approval state. Source editorial review is not a substitute for installed permission checks, authorized fixtures, persistence/recovery verification, full business acceptance or live provider/deployment qualification.\n",
    "keywords": [
      "internal-source",
      "owner-mapping",
      "provider",
      "source-coverage",
      "reference",
      "Reference",
      "Source Map and Glossary",
      "Internal Source Boundary Register"
    ],
    "facets": {
      "section": "reference",
      "group": "reference",
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
  },
  "record146": {
    "code": "nodicsDocsSearchpagenodicsdocsmetadatareferencesourcemapglossary",
    "product": "nodicsDocumentationProduct",
    "targetType": "PAGE",
    "targetCode": "nodicsDocsMetadatareferenceSourceMapGlossary",
    "title": "Reference Source Map and Glossary",
    "summary": "Business-friendly names, technical source owners, module identifiers, common terms, and navigation-to-code references for documentation readers.",
    "searchText": "Reference Source Map and Glossary Business-friendly names, technical source owners, module identifiers, common terms, and navigation-to-code references for documentation readers. # Reference Source Map and Glossary\n\nBusiness-friendly names, technical source owners, module identifiers, common terms, and navigation-to-code references for documentation readers. This page is intentionally written for beginners, business users, developers, operators, architects, QA owners, and AI tools. It explains the business problem first, then the technical ownership model, then the exact customization and verification responsibilities so nobody has to guess where a change belongs.\n\nBusiness names should be easy to read, but developers and AI tools also need exact source ownership to avoid changing the wrong module or creating parallel authorities. The reference source map keeps friendly navigation labels connected to module groups, capability modules, docs folders, data records, generated files, and validation commands.\n\n## Business context\n\nFor a business user, this topic answers what decision can be made, which operational journey is supported, and what risk is reduced. The practical value is faster delivery without losing governance: teams can understand the current capability, decide whether it applies to their project, and know when Axis, Nexus, content catalog, workflow, or runtime services are involved.\n\nFor beginners, the mental model is simple: the page title is the business capability, the table identifies who owns each part, and the diagram shows how a request or change flows. A reader should not need source-code knowledge to understand the journey, but the developer path is still available when customization is needed.\n\n| Business question | Answer for this topic |\n| --- | --- |\n| What problem does it solve? | Business names should be easy to read, but developers and AI tools also need exact source ownership to avoid changing the wrong module or creating parallel authorities. |\n| Who uses it? | Business users, administrators, developers, operators, QA owners, implementation partners, and AI-assisted delivery tools. |\n| What changes can it support? | The reference source map keeps friendly navigation labels connected to module groups, capability modules, docs folders, data records, generated files, and validation commands. |\n| What must be governed? | Permissions, validation, source ownership, publication state, runtime impact, audit evidence, and rollback boundaries. |\n\n## Journey and ownership\n\nNodics Docs owns the reader-facing reference map. Exact module facts are sourced from package metadata, catalogue entries, generated manifests, and module contracts. This keeps the reader-facing name friendly while preserving exact source ownership for developers and AI tools. Axis may render management screens or authenticated documentation, Nexus may render public Online content, and the backend content catalog remains authoritative for navigation, pages, access policies, and publication state.\n\n```mermaid\nflowchart LR\n  Reader[\"Business or developer request\"] --> Axis[\"Axis or Nexus view\"]\n  Axis --> Backend[\"Owning backend capability\"]\n  Backend --> Catalog[\"Content/catalog/schema/config records\"]\n  Catalog --> Runtime[\"Runtime behavior or published page\"]\n  Runtime --> Evidence[\"Audit, validation, and support evidence\"]\n```\n\n| Responsibility | Owner | Notes |\n| --- | --- | --- |\n| Business capability name | Reference | Used in navigation and dashboards so readers are not exposed to raw module names first. |\n| Source owner | nodics.docs | Carries exact implementation, documentation, and validation evidence. |\n| Technical module | documentation | Holds the relevant schema, service, router, data, or contract detail where applicable. |\n| Axis experience | Backend-declared workspace | Axis renders metadata and actions but does not become the authority. |\n| Public experience | Online content delivery | Nexus renders only records approved for public access. |\n\n## Data and configuration detail\n\nEvery topic must explain the data that changes behavior. Some topics are schema-driven, some are configuration-driven, some are publishable content, and some are operational records. The documentation must say which category applies before showing code. That keeps production operators and developers aligned on whether a change needs publication, restart, event propagation, approval, or only a project-layer override.\n\n| Detail area | What to document | Verification signal |\n| --- | --- | --- |\n| Model or record | Type code, catalog, tenant, enterprise, state, owner, and lifecycle. | Schema contract or generated model test. |\n| Configuration key | Default value, override location, environment scope, and runtime impact. | Config validation and runtime refresh evidence. |\n| API or event | Route/event name, payload boundary, permission, idempotency, and failure mode. | Route, service, event, and authorization tests. |\n| Publication and access | Staged/Online state, access mode, roles, groups, and permissions. | Content-pack validation and access-policy test. |\n\n```js\nsourceMap: { label: \"Payment Management\", owner: \"nodics.commerce/payment\", docs: \"nodics.commerce/modules/payment/modules/paymentCore/data/docs-v001/records/documentation/paymentCoreDocumentationComponentData.js\" }\n```\n\n## Customization and extension\n\nDevelopers should customize from the project layer first. A customer project may add properties, services, validators, pipelines, renderers, data packs, or provider configuration when the extension respects the owning capability. Business users may update governed records in Axis when the record is designed for administration. Framework source changes are reserved for improving the reusable product capability itself.\n\n| Customization type | Recommended path | Avoid |\n| --- | --- | --- |\n| Business label, navigation, or content area | Axis-managed content catalog item with publication workflow. | Hardcoding labels or page trees in the frontend. |\n| Runtime setting | Module configuration with validation and governed runtime propagation. | Editing node-local files on each server by hand. |\n| Domain behavior | Extension service, validator, pipeline step, or provider adapter. | Forking the standard module for customer-only logic. |\n| Public visibility | Access policy with public/authenticated/role-based state. | Exposing internal or draft pages through Nexus. |\n\n## Operations and governance\n\nOperators need production-safe evidence, not only implementation notes. Each page must call out logging, tracing, permission checks, event propagation, data import/export, publication status, rollback behavior, and troubleshooting. If a capability affects multiple nodes, the documentation must explain how changes reach every node and how a partial failure is detected.\n\n| Operational concern | Required documentation detail |\n| --- | --- |\n| Security | Authentication mode, permission code, role/group, tenant and enterprise isolation. |\n| Audit | Actor, timestamp, source record, checksum, approval, route/event, and result. |\n| Resilience | Retry, idempotency, compensation, fallback, cache invalidation, and rollback. |\n| Observability | Logs, metrics, dashboard cards, health checks, and support evidence. |\n\n## Common mistakes\n\n- Treating a friendly navigation label as the technical source owner.\n- Writing only developer details and skipping the business decision that the page supports.\n- Updating Axis or Nexus code when the content catalog, schema, or backend capability should own the change.\n- Forgetting access rules for public, authenticated, role-based, group-based, or permission-based pages.\n- Skipping diagrams, comparison tables, source maps, or troubleshooting matrices because the topic feels obvious.\n- Changing runtime behavior without explaining production impact, cluster propagation, and rollback.\n- Leaving CMS documentation without source evidence, validation commands, and maturity state.\n\n## Verification\n\nVerification starts with the document itself: it must include business context, technical ownership, a visual flow, data or configuration tables, customization guidance, common mistakes, and validation evidence. Developers and AI tools maintain the page directly as backend-owned CMS data and validate its declared checksums, lifecycle, navigation, access policy, publication state, and search metadata. No separate Markdown authoring source or prose generator is required.\n\nFor implementation verification, run the owning module tests and any Axis or Nexus renderer tests that consume the page. Operators should confirm that production-like runtime behavior matches the documentation: permissions reject unauthorized access, Online pages do not expose Staged data, runtime changes propagate through governed events, and troubleshooting evidence is available without exposing secrets.\n\n## Business Capability Coverage Map\n\nThis section records the approved 50-item batch as a source map. It keeps the reader-facing hierarchy business-friendly while giving developers and AI tools the exact page where each topic is covered. When a new topic is added, update the owning page, source evidence, validation commands, and generated content pack rather than creating a disconnected page tree.\n\n| No. | Business capability | Primary documentation page | Main implementation evidence |\n| --- | --- | --- | --- |\n| 1 | Product Catalog and Discovery | Product Catalog and Discovery Management | Product, Category, Variant, localization, publication, and projection schemas. |\n| 2 | Base Commerce | Base Commerce foundations | Store, sales channel, point of service, and commerce composition contracts. |\n| 3 | Cart and Checkout | Cart, checkout, and order placement | Cart, CartEntry, CartCalculation, CheckoutSession, placement ports, and customer APIs. |\n| 4 | Pricing, Promotions, and Tax | Pricing, Promotions, and Tax Management | PriceBook, PriceRow, PriceDecision, Promotion, Coupon, DiscountDecision, TaxPolicy, and TaxDecision. |\n| 5 | Inventory and Stock Management | Inventory and Stock Management | InventoryBalance, InventoryMovement, InventoryReservation, Warehouse, and availability services. |\n| 6 | Order Management | Order Management Lifecycle | CommerceOrder, OrderEntry, lifecycle request/version/checkpoint, history, and readiness services. |\n| 7 | Payments | Payment and fulfillment operations | PaymentTransaction, entries, instruments, reconciliation, refund execution, and provider readiness. |\n| 8 | Shipping and Fulfillment | Shipping and Fulfillment Management | Consignment, Shipment, carrier adapters, warehouse task, exception, and return services. |\n| 9 | Returns, Refunds, and Cancellations | Cancellation, return, and refund lifecycle | Order reversal, return inspection, receipt, payment refund, and fulfillment return execution. |\n| 10 | Commerce Enterprise Operations | Commerce enterprise operations and migration | Commerce operations, migration, compatibility, capacity, recovery, and retirement contracts. |\n| 11 | Search and Discovery Providers | Search, Indexing, and Discovery | Discovery config, mapping, projection, source, runtime, publication, and ranking modules. |\n| 12 | WCMS Commerce References | WCMS content management | CMS site, route, page, template, slot, component, renderer, restriction, media, and publication data. |\n| 13 | WCMS and Content Management | WCMS content management | CMS authoring schemas, delivery contracts, designer composition, publication workflow, and site references. |\n| 14 | CMS Entity Model | WCMS content management | CmsSite, CmsPage, CmsPageRoute, CmsPageTemplate, CmsSlotDefinition, CmsComponent, and renderer mapping. |\n| 15 | Content Publication Lifecycle | Staged-to-Online publishing lifecycle | Publication manifest, outbox, deployment receipt, workflow callback, and online pointer tests. |\n| 16 | Media Management and Asset Delivery | Media management | Media, folders, formats, artifacts, references, sets, providers, delivery, upload, cleanup, and replication. |\n| 17 | Localization and Internationalization | Localization and Internationalization | LocalizationKey, LocalizationValue, release, online pointer, import/export, publication, and translation memory port. |\n| 18 | Customer Identity and Profile | Security, Identity, and Access Governance | Customer, employee, user, password, auth provider, session, registration, and profile routes. |\n| 19 | Enterprise, Tenant, Group, Role, and Permission Management | Security, Identity, and Access Governance | Enterprise, tenant, user group, principal scope assignment, authorization, and permission resolution. |\n| 20 | Customer Engagement | Unified engagement operations | Activity, assignment, consent, relation, dashboard, privacy, publication reference, and queue items. |\n| 21 | Customer Feedback | Customer feedback, complaints, and closed-loop action | Feedback, classification, resolution, follow-up, handoff, insight, metrics, and privacy operations. |\n| 22 | Customer Reviews | Customer reviews and ratings | Review, version, moderation, projection, aggregate, abuse, helpfulness, request, syndication, and response. |\n| 23 | Communication and Notification Templates | Communication, delivery, and verification | Intent, template, version, attempt, inbox, suppression, verification, provider, and callback contracts. |\n| 24 | Import, Export, and Migration | Data Import, Export, and Migration | Import definitions, import runs, data packs, migration register, media import staging, and release evidence. |\n| 25 | Channel and Store Management | Base Commerce foundations | Store, SalesChannel, StoreContext, and Stores & Channels Axis capability. |\n| 26 | Point of Service and Warehouse Management | Inventory and Stock Management | PointOfService, Warehouse, WarehouseTask, stock movements, and fulfillment handoff. |\n| 27 | Coupon and Promotion Budget Governance | Pricing, Promotions, and Tax Management | Coupon, CouponBatch, PromotionBudgetLedger, PromotionRedemption, and simulation services. |\n| 28 | Tax Policy and Decision Evidence | Pricing, Promotions, and Tax Management | TaxPolicy, TaxDecision, publication checks, and calculation evidence. |\n| 29 | Order History and Checkpoints | Order Management Lifecycle | OrderHistory, OrderLifecycleCheckpoint, OrderLifecycleVersion, and recovery checkpoint data. |\n| 30 | Payment Reconciliation | Payment and fulfillment operations | PaymentTransaction, PaymentTransactionEntry, instrument reference, reconciliation, and refund execution. |\n| 31 | Consignments and Exceptions | Shipping and Fulfillment Management | Consignment, Shipment, FulfillmentException, tracking event, and carrier sandbox adapter. |\n| 32 | Return Receipts and Reversal Calculations | Cancellation, return, and refund lifecycle | ReturnReceipt, ReturnInspection, FulfillmentReturn, and OrderReversalCalculation. |\n| 33 | Discovery Rules and Ranking | Search, Indexing, and Discovery | CommerceSearchRule, DiscoveryRankingProfile, DiscoveryRankingAction, QueryProfile, and FacetProfile. |\n| 34 | Discovery Sources and Field Mappings | Search, Indexing, and Discovery | DiscoverySourceProvider, DiscoveryFieldMapping, SourceMixConfiguration, and field policy. |\n| 35 | Editorial Content | WCMS content management | EditorialArticle, Author, Series, TaxonomyTerm, ContentType, Correction, and localization. |\n| 36 | Editorial Publication | Staged-to-Online publishing lifecycle | Editorial publication service, target, online projection, publication receipt, and workflow adapter. |\n| 37 | Contact Operations | Unified engagement operations | ContactRequest, ContactAttempt, Correspondence, Handoff, Resolution, Verification, and provider recovery. |\n| 38 | Engagement Automation | Unified engagement operations | EngagementAutomationDecision, evaluation, batch run, operational execution, privacy, and retention. |\n| 39 | Testimonials | Unified engagement operations | TestimonialCandidate, Consent, Version, Projection, public intake, lifecycle, and publication adapter. |\n| 40 | Tracking Events and Analytics Capture | Shipping and Fulfillment Management | TrackingEvent, shipment visibility, carrier event evidence, and fulfillment customer policy. |\n| 41 | Process Workflows | Business Process and Automation Overview | ProcessDefinition, Instance, Task, Trigger, AuditEvent, Incident, graph validation, and publication approval. |\n| 42 | Cron and Scheduled Automation | Cron operations | CronJob, CronJobLog, scheduler container, node handoff, process trigger, and runtime service. |\n| 43 | Data Installation and Seed Packs | Data Import, Export, and Migration | Data installation records, content packs, headers, manifests, checksum, and init/sample/core layers. |\n| 44 | Accelerators and Industry Templates | Accelerators and Industry Solution Templates | Agora Apparel, Electronics, Telco package metadata and shared commerce/content contracts. |\n| 45 | Agora Apparel | Accelerators and Industry Solution Templates | Apparel storefront package, domain sample data, responsive journey, and backend API consumption. |\n| 46 | Agora Electronics | Accelerators and Industry Solution Templates | Electronics storefront package, catalog/search journey, media, pricing, and checkout APIs. |\n| 47 | Agora Telco | Accelerators and Industry Solution Templates | Telco storefront package, offer/catalog journey, customer onboarding, and commerce API boundaries. |\n| 48 | TEE Solution Use Case | Task Execution Engine | Task Execution Engine composition through Process, Cron, Pipeline, EMS, and governed runtime change. |\n| 49 | DEAP Solution Use Case | Data Engineering and Analytics Platform | Data Engineering and Analytics Platform composition through import/export, discovery, events, jobs, and publication. |\n| 50 | Reference Source Map and Glossary | Reference Source Map and Glossary | Catalogue metadata, source evidence, business-friendly names, and exact implementation references. |\n| 51 | Routing and API Governance | Routing and API Governance | Route metadata, generated CRUD routes, request context, HTTP hardening, OpenAPI generation, authorization, and runtime router configuration. |\n",
    "keywords": [
      "reference",
      "source-map-and-glossary",
      "reference-source-map-and-glossary",
      "Reference",
      "Source Map and Glossary",
      "Reference Source Map and Glossary"
    ],
    "facets": {
      "section": "reference",
      "group": "reference",
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
  },
  "record147": {
    "code": "nodicsDocsSearchpagenodicsdocsmetadatareferencesourcebackeddocumentationcoverageaudit",
    "product": "nodicsDocumentationProduct",
    "targetType": "PAGE",
    "targetCode": "nodicsDocsMetadatareferenceSourceBackedDocumentationCoverageAudit",
    "title": "Source-Backed Documentation Coverage Audit",
    "summary": "Code-to-documentation coverage audit contract for finding missing or shallow Nodics functionality documentation across framework, projects, data, assets, and applications.",
    "searchText": "Source-Backed Documentation Coverage Audit Code-to-documentation coverage audit contract for finding missing or shallow Nodics functionality documentation across framework, projects, data, assets, and applications. # Source-Backed Documentation Coverage Audit\n\nThis audit is the working contract for revisiting the whole Nodics codebase and finding functionality that is missing from documentation. It is intentionally source-backed: code, schemas, services, controllers, routes, data releases, assets, tests, and frontend journeys are treated as evidence that documentation may need to exist or be deepened.\n\nThe current documentation set already explains many architecture principles. The next maturity step is coverage depth. A developer should be able to create or customize data, services, providers, APIs, pages, media, product catalog, pricing, inventory, workflow, search, localization, import/export, or publication behavior by following the docs and tracing the referenced source. A business user or decision maker should be able to understand what the capability does, who owns it, whether it is ready, and what risk is governed.\n\nFor beginners, the mental model is simple: source files are evidence, docs are the map, and CMS documentation data is the published route into Axis, Nexus, and the web. Developers use the map to customize safely. Operators use it to verify runtime behavior. Business users use it to decide whether a capability is ready for adoption.\n\n## Audit method\n\n```mermaid\nflowchart LR\n  Source[\"Repository inventory\"] --> Signals[\"Schemas, services, routes, data, assets, tests\"]\n  Signals --> Docs[\"Published documentation catalogue\"]\n  Docs --> Coverage[\"Coverage matrix\"]\n  Coverage --> Backlog[\"Missing or shallow topics\"]\n  Backlog --> Improve[\"Source-backed page updates\"]\n  Improve --> Generate[\"Validated CMS documentation data\"]\n  Generate --> Publish[\"Staged to Online publication\"]\n```\n\nThe audit compares implementation signals against documented topics:\n\n| Signal | Why it matters |\n| --- | --- |\n| `src/schemas/schemas.js` | A persisted or generated model usually needs business meaning, field behavior, ownership, security, import/export, and validation docs. |\n| `src/service/*.js` | Service behavior often defines customization, provider boundaries, publication, policy, error handling, and runtime evidence. |\n| `src/controller` and `src/router` | Routes need user journey, authorization, request/response, error, and observability documentation. |\n| `data/<release>/headers` and `records` | Release data needs authoring, import, lifecycle, idempotency, and rollback documentation. |\n| `assets/` and media manifests | Physical media requires file, metadata, staging, publication, replication, and browser validation docs. |\n| `test` | Tests reveal implemented behavior that should be documented before the topic is called operational. |\n| Frontend apps | Axis, Nexus, and Agora journeys need backend source ownership, permission, state, and browser behavior docs. |\n\nThe inventory is repeatable through the generated source coverage report:\n\n```bash\nnpm --prefix nodics.docs run audit:source-coverage\nnpm --prefix nodics.docs run audit:source-coverage:check\n```\n\nThe report is generated at `nodics.docs/test/reports/source-backed-documentation-coverage-report.md` with a JSON companion file for automated review. Developers may still use `rg` and `find` during investigation, but the report is the durable evidence committed with documentation work.\n\nThis is a triage method, not a blind rule. A utility module may be covered by a broader capability page. A business topic may be implemented by several technical modules. The audit still requires each implementation signal to trace to a clear documentation owner.\n\n## Coverage standard\n\nEvery mature topic should include:\n\n| Required section | Reader it helps |\n| --- | --- |\n| Business problem and outcome | Business user, decision maker, product owner |\n| Beginner mental model | New developer, business evaluator, AI tool |\n| Source map | Developer, architect, support engineer |\n| How to do it | Developer, administrator, implementation partner |\n| How it works | Architect, operator, QA owner |\n| Data and configuration contracts | Developer, operator, AI tool |\n| API, service, event, and publication flow | Developer, integrator, operator |\n| Customization and extension points | Developer, partner, customer project owner |\n| Visual flow or screenshot guidance | Everyone |\n| Common mistakes and failure modes | Developer, operator, support |\n| Validation commands and acceptance proof | QA owner, release owner, operator |\n| Official external references when useful | Architect, decision maker, implementation partner |\n\n## Audience levels\n\nEach page must deliberately serve more than one reader. It is acceptable for a page to go deeper for developers, but it should never become source-code notes only.\n\n| Audience level | Required answer |\n| --- | --- |\n| Business overview | What decision, journey, value, cost reduction, risk reduction, or operating improvement the capability supports. |\n| Developer how-to | Which files to edit, which contracts to respect, and how to test the change locally. |\n| Operator runbook | Which server role, runtime state, logs, health checks, retries, rollbacks, and production evidence matter. |\n| QA validation | Which unit, contract, generated-data, fresh-schema, publication, and browser checks prove the behavior. |\n| AI-tool guidance | What can be safely generated or refactored, what must remain backend-owned, and what evidence must be preserved. |\n\n## Ownership checklist\n\nEvery page must identify source ownership before it explains customization. That keeps Axis, Nexus, Agora, customer projects, and backend modules from becoming parallel authorities.\n\n| Ownership layer | Documentation must state |\n| --- | --- |\n| Business capability | The human-facing capability name and business journey. |\n| Functional module | The owning Nodics capability or project module. |\n| Technical module | The package or nested module where implementation lives. |\n| Schema and service | The data model and service behavior that own validation and persistence. |\n| Route and controller | The API surface and permission boundary, if user or system calls exist. |\n| Data and assets | Release folders, headers, records, manifests, physical assets, and generated files. |\n| Frontend consumer | Axis, Nexus, Agora, or another application that renders approved backend data. |\n| Tests and reports | Contract tests, generated reports, and runtime acceptance commands. |\n\n## Creation and publication lanes\n\nEvery data-bearing topic must show both creation lanes. Module release data is authored by developers or AI tools under the owning module or project `data/` folder. Business-created data is authored through Axis or another governed BackOffice journey. Both lanes must converge on the same backend schemas, validators, permission policies, workflows, publication lifecycle, and audit evidence.\n\nPublishable data must always explain Staged, approval, and Online activation. Documentation data, CMS pages, media, product content, and storefront-visible records should not be described as direct Online writes. Operational data such as cron schedules, runtime configuration, and internal evidence may have a different lifecycle, but the page must say that clearly.\n\n## Media and asset rule\n\nMedia-bearing topics must separate four things:\n\n| Media layer | Meaning |\n| --- | --- |\n| Physical asset | Source file under a release-owned `assets/` folder. |\n| Media object | Backend schema record that represents stored media metadata and provider-owned storage fields. |\n| Media reference | Relationship from a business object, page, component, product, or article to the media code. |\n| Publication transfer | Staged-to-Online copy, checksum validation, placement evidence, and replication obligation. |\n\nRelease data may reference physical files, but it must not author provider paths, Online URLs, storage keys, or replication behavior. Those remain importer and media-runtime responsibilities.\n\n## Error message standard\n\nBackend logs may carry technical error codes and internal detail. Axis, Nexus, and Agora should show business-safe messages that explain the user state and the next action without leaking internals. A documentation page that covers a runtime-visible journey must document:\n\n| Error concern | Required detail |\n| --- | --- |\n| User-safe message | What the user should see in Axis, Nexus, or Agora. |\n| Technical evidence | Error code, correlation id, logs, import run, workflow task, or publication receipt for support. |\n| Recoverability | Retry, repair data, register capability, approve publication, restart service, or escalate. |\n| Ownership | Which backend module or project data release must be fixed. |\n\n## Fresh schema and browser proof\n\nFor major user-visible capabilities, documentation is not complete until the page explains fresh-schema verification and browser verification. Fresh-schema checks prove installation, import order, generated manifests, required capabilities, and publication readiness. Browser checks prove the actual Axis, Nexus, or Agora journey that users experience.\n\n| Proof type | Examples |\n| --- | --- |\n| Fresh schema | Initialize the runtime, import `init-v001`, `core-v001`, and selected `sample-v001` sections, confirm idempotency, and check data counts. |\n| Publication | Approve and publish Staged records to Online through `nPublish`; verify Online records and media coordinates. |\n| Browser | Open Axis setup, Module Registry, Documentation, Nexus public pages, and Agora product journeys with real backend data. |\n| Regression | Run package tests, CMS documentation checks, source coverage report checks, and runtime acceptance scripts. |\n\n## First inventory snapshot\n\nEarlier scope included framework and reference project roots found 172 module or package boundaries and 94 published documentation pages. The committed report currently identifies 22 source boundaries that need a page or explicit owner mapping, 6 high-surface boundaries that need deeper documentation sections, 28 internal-only candidates, and 116 covered boundaries. This does not mean exactly 22 new pages are required; it means those areas need owner confirmation and documentation mapping.\n\n| Priority | Area | Why it is important | Documentation action |\n| --- | --- | --- | --- |\n| P0 | Agora Apparel, Electronics, and Telco data packs | Large `sample-v001` data and media assets exist, but the accelerator page is broad. | Add domain authoring guides for product, content, media, search, publication, and browser validation. |\n| P0 | CMS module | Many schemas, services, controllers, routes, data files, and tests implement authoring, delivery, publication, and documentation governance. | Split exact CMS authoring, delivery, publication manifest, and migration coverage where broader WCMS pages are shallow. |\n| P0 | Import/export providers | `jsImport`, `jsonImport`, `csvImport`, `excelImport`, and export variants are implementation surfaces under the import/export capability. | Add provider-specific how-to and customization sections under Data Import, Export, and Migration. |\n| P0 | Commerce product, price, inventory, fulfillment | The business journey depends on several modules and data files. | Add source-backed create/update/publish guides and relation maps. |\n| P0 | Axis setup and registry error states | Manual testing exposed customer-visible setup failures and message quality concerns. | Document status states, required capabilities, retry paths, and user-safe error contracts. |\n| P1 | `nController` | Large controller infrastructure surface with little direct documentation signal. | Map it into Routing and API Governance or create a controller runtime page. |\n| P1 | `nbpm` and workflow foundations | Process behavior is broad and business-critical. | Connect workflow docs to BPM schemas, services, and tests. |\n| P1 | `nTest` | Test scaffolding is important for developers and AI tools. | Add a developer testing harness guide. |\n| P1 | Localization Core and API | Localization has schemas, services, data, and public behavior. | Deepen localization docs with source map, data imports, fallback, and customization. |\n| P1 | Discovery configuration and Commerce Search | Search ranking and discovery rules affect customer journeys. | Add exact rule authoring, publication, and projection docs. |\n| P1 | Communication and Engagement details | Provider and operational modules exist beyond high-level overview. | Add provider, event, retry, template, and moderation detail. |\n\n## Documentation backlog workflow\n\n1. Inventory the implementation surface with `rg --files`, module package metadata, schema files, service files, controllers, routers, data folders, assets, and tests.\n2. Map each signal to an existing documentation page.\n3. Mark the page as covered, shallow, missing, or intentionally internal.\n4. For shallow pages, add source map, how-to, how-it-works, customization, and validation sections.\n5. For missing business topics, add a new page and catalogue metadata.\n6. Update the canonical CMS documentation records and declared release checksums.\n7. Validate the canonical CMS records and run the docs tests.\n8. Import the generated content through Staged and publish Online when runtime evidence is required.\n\n## External reference policy\n\nOfficial external references help readers understand industry-standard expectations for terms, data movement, administration, auditability, and operator evidence. They do not define Nodics behavior, architecture, code, data shape, or product direction. Nodics must never be presented as a copy, derivative, or reimplementation of another framework.\n\nUse vendor docs only to calibrate standards and reader expectations: what an enterprise buyer expects from import/export, how administrators usually reason about product data, what operators expect from repeatable migrations, and what quality bar public documentation should meet. Every page must still identify the Nodics owner, source files, runtime contract, and validation evidence.\n\nGood reference examples:\n\n- [SAP Commerce importing data](https://help.sap.com/docs/SAP_COMMERCE/d0224eca81e249cb821f2cdf45a82ace/c4f121fb358e46069fc01acf8c5c254b.html)\n- [Shopify product CSV import/export](https://help.shopify.com/en/manual/products/import-export/using-csv)\n- [Salesforce B2C Commerce import and export](https://help.salesforce.com/s/articleView?id=cc.b2c_import_and_export.htm&type=5)\n- [Contentful import and export with CLI](https://www.contentful.com/developers/docs/tutorials/cli/import-and-export/)\n- [Contentful migration scripts](https://www.contentful.com/developers/docs/tutorials/cli/scripting-migrations/)\n\n## Common mistakes\n\n- Counting a page as complete because the business idea is described but no source files, tests, data, or services are mapped.\n- Creating one page per technical module when a broader capability topic would be clearer for business users.\n- Hiding an implemented route, schema, or service because it is \"internal\" but still developer-extensible or operator-visible.\n- Linking to vendor references as if they define Nodics behavior or design.\n- Changing article blocks without keeping page, navigation, access, Media and search metadata consistent.\n- Forgetting Axis, Nexus, or Agora browser evidence for a capability that is visible to users.\n\n## Troubleshooting\n\n| Symptom | Likely cause | Action |\n| --- | --- | --- |\n| A source file has no matching page | The capability is missing documentation or is covered under an unclear title. | Map it to an owner page or add a new catalogue entry. |\n| A page exists but developers still ask where to customize | The page is shallow. | Add source map, services, data files, extension points, and validation commands. |\n| Docs say a feature is operational but tests show partial behavior | Maturity state is inaccurate. | Downgrade maturity or add the missing implementation and evidence. |\n| Axis renders a confusing error | Error contract is not documented or the backend emits technical text. | Document the user-safe status and fix the backend or Axis mapping. |\n| Canonical CMS records are stale | CMS records changed without matching metadata and declared checksums. | Run the read-only CMS data validator before import. |\n\n## Acceptance rule\n\nThe documentation program is complete only when every implemented user-visible or developer-extensible capability has either a source-backed page or a clear entry in this audit explaining why it is internal. Each accepted page must be maintained as canonical CMS documentation data, imported through the governed data process, and published through Staged-to-Online when it is intended for Axis, Nexus, or public web consumption.\n\n## Verification\n\nRun documentation verification after each audit improvement:\n\n```bash\nnpm --prefix nodics.docs run docs:check\nnpm --prefix nodics.docs test\ngit -C nodics.ai diff --check\n```\n\nFor runtime-visible topics, also run the owning module tests, fresh-schema import checks, publication checks, and browser qualification for Axis, Nexus, or Agora. A topic is accepted only when the canonical CMS article, release metadata, source evidence and runtime behavior agree.\n\n## Explicit repository scope\n\nThe default command discovers metadata-declared module roots inside the current Framework checkout. Installing or removing a sibling customer/frontend checkout does not change that report. Frontend and customer documentation still need review, but their scope must be explicitly selected and recorded separately.\n\nTo generate a customer's report with the same owner tool:\n\n```bash\nnode /path/to/framework/nodics.docs/scripts/audit-source-coverage.mjs \\\n  --source-root=/path/to/customer \\\n  --catalogue=/path/to/customer/data/manifest.json \\\n  --output-dir=/path/to/customer/test/reports\n```\n\nRepeat `--source-root` to include additional explicitly selected roots; use `--path-base` to choose their relative display base. Content/evidence paths resolve from the selected catalogue's project root. An optional `documentationBacklog` in that catalogue remains owner-supplied. Add `--check` to verify the selected report is current. Missing scope/output arguments fail, and custom output cannot resolve inside Framework, including through symlinks. This is a read-only source inventory plus an explicitly located report write; it does not import, publish or certify live behavior.\n",
    "keywords": [
      "documentation-coverage",
      "source-backed",
      "code-audit",
      "missing-docs",
      "coverage-matrix",
      "Reference",
      "Source Map and Glossary",
      "Documentation Coverage Audit",
      "Source-Backed Documentation"
    ],
    "facets": {
      "section": "reference",
      "group": "reference",
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
  },
  "record148": {
    "code": "nodicsDocsSearchpagenodicsdocsmetadatareferencedocumentationgapbacklog",
    "product": "nodicsDocumentationProduct",
    "targetType": "PAGE",
    "targetCode": "nodicsDocsMetadatareferenceDocumentationGapBacklog",
    "title": "Documentation Gap Backlog",
    "summary": "Classified backlog for closing source-backed documentation gaps across runtime capabilities, data releases, media, applications, operations, and validation.",
    "searchText": "Documentation Gap Backlog Classified backlog for closing source-backed documentation gaps across runtime capabilities, data releases, media, applications, operations, and validation. # Documentation Gap Backlog\n\nThis backlog turns the source-backed coverage audit into executable documentation work. It captures the remaining categories that must be closed so Nodics documentation explains not only what the product is, but how developers, business users, operators, QA owners, and AI tools can safely work with the framework.\n\nFor beginners, the mental model is simple: the coverage report tells us where the source is richer than the documentation, and this backlog tells us what to do next. A source boundary may need a new page, a deeper section in an existing page, an explicit owner mapping, or an internal-only decision. The backlog is not a marketing roadmap. It is a release-quality checklist for source-backed documentation.\n\n## Backlog flow\n\n```mermaid\nflowchart LR\n  Report[\"Generated coverage report\"] --> Classify[\"Classify each gap\"]\n  Classify --> Page[\"New page\"]\n  Classify --> Deepen[\"Deeper section\"]\n  Classify --> Map[\"Owner mapping\"]\n  Classify --> Internal[\"Internal-only decision\"]\n  Page --> Generate[\"Validate canonical CMS data\"]\n  Deepen --> Generate\n  Map --> Generate\n  Internal --> Generate\n  Generate --> Test[\"Docs tests and source evidence\"]\n  Test --> Publish[\"Staged approval and Online publication\"]\n```\n\n## Classification policy\n\n| Classification | Meaning | Required action |\n| --- | --- | --- |\n| `needs-page` | A user-visible or developer-extensible capability has no clear page. | Create canonical CMS pages, article blocks, navigation, catalogue metadata, source evidence and validation in the owning data release. |\n| `needs-deeper-section` | A page exists, but it lacks exact source map, data, service, operation, or validation detail. | Extend the existing page with how-to, how-it-works, customization, errors, and tests. |\n| `needs-page-or-owner-mapping` | The source is significant, but ownership may belong under a broader page. | Decide owner, then either create a page or add explicit mapping to the owning page. |\n| `internal-only-candidate` | The module is likely a utility or provider implementation. | Document the owner page that covers it, or mark it internal with justification. |\n| `covered` | Existing docs and source evidence are sufficient for the current maturity state. | Keep validation and browser evidence current when behavior changes. |\n\n## P0 closure items\n\n| Status | Item | Source areas | Documentation outcome |\n| --- | --- | --- | --- |\n| Closed by P0 docs batch | Nexus data and content guide | `nodics.accelerators/modules/nexus/modules/nexus.web` | Covered by `applications.nexus-data-content-guide` with Nexus project content, media assets, headers, records, publication, Online delivery, and browser validation. |\n| Closed by P0 docs batch | Axis setup and user-safe error contracts | `nodics.platform/modules/backoffice`, `nodics.platform/modules/axis`, `nodics.exp/nodics.axis` | Covered by `applications.axis-setup-error-contracts` with setup states, blockers, retry behavior, required capability checks, technical evidence, and customer-safe messages. |\n| Closed by P0 docs batch | CMS exact source map | `nodics.wcms/modules/cms` | Covered by `wcms.cms-source-map-authoring-contract` with page, route, component, slot, template, renderer, publication manifest, migration, delivery cache, and documentation governance details. |\n| Closed by P0 docs batch | Media operations runbook | `nodics.wcms/modules/media`, `nodics.foundation/modules/nData/nImport/import/src/service/media` | Covered by `wcms.media-operations-runbook` with upload, import hydration, storage providers, cleanup, replication queue, delivery failures, and DR evidence. |\n| Closed by P0 docs batch | Import/export provider guides | `nodics.foundation/modules/nData/nImport`, `nodics.foundation/modules/nData/nExport` | Covered by `data.import-export-provider-guides` with JavaScript, JSON, CSV, Excel, generated exports, parsers, field allow-lists, masking, and rollback boundaries. |\n| Closed by P0 docs batch | Commerce authoring and fulfillment | `nodics.commerce/modules/baseCommerce`, `nodics.commerce/modules/fulfillment` | Covered by `commerce.data-authoring-fulfillment` with product, price, inventory, search projection, fulfillment execution, consignments, exceptions, return receipts, and browser proof. |\n| Closed by P0 docs batch | Documentation publishing runbook | `nodics.docs`, `nodics.wcms/modules/cms`, `nodics.process/modules/nPublish` | Covered by `docs.documentation-publishing-runbook` with canonical CMS data, declared Media assets, Staged import, review, Online activation, rollback and Axis/Nexus rendering. |\n\n## P1 closure items\n\n| Status | Item | Source areas | Documentation outcome |\n| --- | --- | --- | --- |\n| Closed by P1 docs batch | Module Registry journey | `nodics.platform/modules/backoffice`, registry-related Platform services | Covered by `platform.module-registry-journey` with registration, activation, dependency state, required capability checks, and Axis visibility. |\n| Closed by P1 docs batch | Commerce Search guide | `nodics.commerce/modules/baseCommerce/modules/commerceSearch` | Covered by `commerce.search-guide` with ranking rules, projections, publish flow, index ownership, storefront effect, and recovery. |\n| Closed by P1 docs batch | Localization depth | `nodics.localization/modules/localizationCore`, `nodics.localization/modules/localizationApi` | Covered by `localization.runtime-authoring` with locale records, fallback, content/product localization, import data, API boundaries, and browser proof. |\n| Closed by P1 docs batch | Payment Core and provider split | `nodics.commerce/modules/payment` | Covered by `commerce.payment-provider-boundaries` with payment decisions, method/provider separation, reconciliation, safe customer payload, and provider extension. |\n| Closed by P1 docs batch | Shopping List Commerce boundary | `nodics.commerce/modules/baseCommerce/modules/shoppingList`, `nodics.platform/modules/profile` | Covered by `commerce.shopping-list-commerce-boundary` with why shopping-intent lists belong to Base Commerce and what Profile continues to own. |\n| Closed by P1 docs batch | NMS runtime monitoring | `nodics.foundation/modules/nNms` | Covered by `foundation.nms-runtime-monitoring` with node monitoring, topology, health, operational evidence, and recovery actions. |\n| Closed by P1 docs batch | Service runtime and overrides | `nodics.foundation/modules/nService`, `nodics.foundation/modules/nService/vService` | Covered by `foundation.service-runtime-overrides` with service discovery, virtual services, generated services, override precedence, and extension safety. |\n| Closed by P1 docs batch | Cache provider runbooks | `nodics.foundation/modules/nCache`, Redis, Hazelcast, Node cache | Covered by `foundation.cache-provider-runbooks` with provider boundaries, cache key strategy, invalidation, failure behavior, and production configuration. |\n| Closed by P1 docs batch | Database provider boundaries | `nodics.foundation/modules/nDatabase` | Covered by `foundation.database-provider-boundaries` with MongoDB, virtual DB, Cassandra, Elasticsearch, provider contracts, configuration, and validation. |\n| Closed by P1 docs batch | OTP and security flow | `nodics.foundation/modules/nOtp` | Covered by `security.otp-security-flow` with OTP generation, verification, expiry, retry, throttling, audit, and security controls. |\n| Closed by P1 docs batch | Communication providers | `nodics.communication/modules/smtpCommsProvider`, `nodics.communication/modules/smsCommsProvider` | Covered by `communication.provider-runbooks` with SMTP/SMS provider behavior, templates, retries, failed delivery evidence, and extension rules. |\n| Closed by P1 docs batch | Engagement and contact submission | `nodics.engagement/modules/contactSubmission` | Covered by `engagement.contact-submission-operations` with contact forms, moderation, workflow, notification, audit, and recovery. |\n| Closed by P1 docs batch | Workflow and BPM source map | `nodics.foundation/modules/nbpm`, `nodics.process` | Covered by `process.workflow-bpm-source-map` with workflow definitions, transitions, tasks, callbacks, history, and operator visibility. |\n| Closed by P1 docs batch | Cron job data authoring | `nodics.process/modules/cronjob` | Covered by `process.cronjob-data-authoring` with job records, schedules, execution policy, retry, idempotency, and Process server ownership. |\n| Closed by P1 docs batch | Release and upgrade compatibility | `nodics.foundation/modules/nSetup`, all module data folders | Covered by `framework.release-upgrade-compatibility` with version freeze, upgrade path, rollback, checksum drift, generated manifests, and extension compatibility. |\n\n## P2 closure items\n\n| Status | Item | Source areas | Documentation outcome |\n| --- | --- | --- | --- |\n| Closed by P2 docs batch | Fulfillment Core owner mapping | `nodics.commerce/modules/fulfillment/modules/fulfillmentCore` | Covered by `commerce.fulfillment-core-source-map`, plus explicit source evidence on fulfillment and data-authoring pages. |\n| Closed by P2 docs batch | Domain Commerce accelerator owner mapping | `domainCommerceCore`, electronics product, telco catalog, telco subscription | Covered by `accelerators.domain-commerce-source-map` with accelerator ownership, Commerce boundary, sample data, and validation. |\n| Closed by P2 docs batch | Tooling runtime depth | `nodics.foundation/modules/nTooling` | Covered by `foundation.tooling-runtime-contracts` with command, manifest, application-builder, AI-context, and quality-gate contracts. |\n| Closed by P2 docs batch | EMS runtime and client depth | `nodics.foundation/modules/nEms`, `emsClient`, broker providers | Covered by `foundation.ems-runtime-client-runbook` with broker runtime, client, tenant, retry, and operator evidence. |\n| Closed by P2 docs batch | Internal-only register | Discovery internals, payment methods/providers, NMS runtime, Kickoff environment/runtime packages | Covered by `reference.internal-source-boundary-register` with owner mappings and promotion rules. |\n\n## Closure workflow\n\n1. Start from the generated source coverage report.\n2. Pick the highest-priority open item.\n3. Inspect source files, schemas, services, routers, data, assets, tests, and frontend consumers.\n4. Decide whether the work is a new page, deeper section, owner mapping, or internal-only classification.\n5. Update CMS article blocks, pages, navigation and catalogue metadata in the owning data release.\n6. Refresh declared release checksums and metadata, validate CMS data, and regenerate source coverage reports.\n7. Run docs tests and any owning module tests needed for the behavior.\n8. For runtime-visible changes, import into Staged, publish Online, and verify Axis, Nexus, or Agora from the browser.\n9. Commit the smallest coherent documentation batch.\n\n## Common mistakes\n\n- Treating this backlog as optional once a high-level overview exists.\n- Closing a source gap without reading the current source files and tests.\n- Creating public documentation for a module that should be an internal utility without explaining the broader owner.\n- Forgetting business users when writing deep developer detail.\n- Forgetting developers when writing a business-friendly page.\n- Forgetting operators and QA owners when documenting publishable or production-visible behavior.\n- Showing external references as source design instead of industry-standard expectation checks.\n\n## Verification\n\nRun the documentation gates after each closure batch:\n\n```bash\nnpm --prefix nodics.docs run audit:source-coverage\nnpm --prefix nodics.docs run docs:check\nnpm --prefix nodics.docs test\ngit -C nodics.ai diff --check\n```\n\nThe backlog is healthy when the generated report, this page, catalogue metadata, canonical WCMS records, and runtime evidence agree. Business users should see clear journeys, developers should see exact source paths and extension points, operators should see evidence and recovery steps, QA owners should see validation commands, and AI tools should see boundaries that prevent unsafe source or data changes.\n",
    "keywords": [
      "documentation-gap-backlog",
      "source-backed",
      "coverage-closure",
      "documentation-workflow",
      "missing-docs",
      "Reference",
      "Source Map and Glossary",
      "Documentation Gap Backlog",
      "Coverage Closure"
    ],
    "facets": {
      "section": "reference",
      "group": "reference",
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
  },
  "record149": {
    "code": "nodicsDocsSearchnodenodicsdocsnodepageframeworkmodulararchitecture",
    "product": "nodicsDocumentationProduct",
    "targetType": "NODE",
    "targetCode": "nodicsDocsNodePageframeworkModularArchitecture",
    "title": "Modular architecture and ownership",
    "summary": "How functional modules, technical modules, runtime servers, and customer projects fit together.",
    "searchText": "Modular architecture and ownership How functional modules, technical modules, runtime servers, and customer projects fit together. framework-architecture-and-design modularity-and-ownership modular-architecture-and-ownership",
    "keywords": [
      "framework-architecture-and-design",
      "modularity-and-ownership",
      "modular-architecture-and-ownership"
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
  "record150": {
    "code": "nodicsDocsSearchnodenodicsdocsnodepageframeworkarchitecturedecisionguide",
    "product": "nodicsDocumentationProduct",
    "targetType": "NODE",
    "targetCode": "nodicsDocsNodePageframeworkArchitectureDecisionGuide",
    "title": "Architecture Decision Guide",
    "summary": "Decision path for choosing framework, project, content, provider, service, pipeline, schema, route, or renderer ownership.",
    "searchText": "Architecture Decision Guide Decision path for choosing framework, project, content, provider, service, pipeline, schema, route, or renderer ownership. architecture-decision-guide ownership-decision where-change-belongs",
    "keywords": [
      "architecture-decision-guide",
      "ownership-decision",
      "where-change-belongs"
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
  "record151": {
    "code": "nodicsDocsSearchnodenodicsdocsnodepagefoundationoverview",
    "product": "nodicsDocumentationProduct",
    "targetType": "NODE",
    "targetCode": "nodicsDocsNodePagefoundationOverview",
    "title": "Foundation overview",
    "summary": "Beginner, developer, and operations guide to the Foundation runtime, request path, cache, events, configuration, and quality rules.",
    "searchText": "Foundation overview Beginner, developer, and operations guide to the Foundation runtime, request path, cache, events, configuration, and quality rules. foundation-runtime-services runtime-foundation foundation-overview",
    "keywords": [
      "foundation-runtime-services",
      "runtime-foundation",
      "foundation-overview"
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
  "record152": {
    "code": "nodicsDocsSearchnodenodicsdocsnodepageframeworkcustomizationguide",
    "product": "nodicsDocumentationProduct",
    "targetType": "NODE",
    "targetCode": "nodicsDocsNodePageframeworkCustomizationGuide",
    "title": "Customization and extension guide",
    "summary": "How customer projects customize Nodics safely without forking framework authority.",
    "searchText": "Customization and extension guide How customer projects customize Nodics safely without forking framework authority. developer-extension-and-project-customization project-layer-customization customization-and-extension-guide",
    "keywords": [
      "developer-extension-and-project-customization",
      "project-layer-customization",
      "customization-and-extension-guide"
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
  "record153": {
    "code": "nodicsDocsSearchnodenodicsdocsnodepageframeworkbackendextensionpatterns",
    "product": "nodicsDocumentationProduct",
    "targetType": "NODE",
    "targetCode": "nodicsDocsNodePageframeworkBackendExtensionPatterns",
    "title": "Backend Extension Patterns",
    "summary": "How projects extend behavior through configuration, provider adapters, services, validators, pipelines, schemas, and events.",
    "searchText": "Backend Extension Patterns How projects extend behavior through configuration, provider adapters, services, validators, pipelines, schemas, and events. backend-extension-patterns service-override provider-adapter pipeline-extension",
    "keywords": [
      "backend-extension-patterns",
      "service-override",
      "provider-adapter",
      "pipeline-extension"
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
  "record154": {
    "code": "nodicsDocsSearchnodenodicsdocsnodepageframeworkaxiscontentcustomization",
    "product": "nodicsDocumentationProduct",
    "targetType": "NODE",
    "targetCode": "nodicsDocsNodePageframeworkAxisContentCustomization",
    "title": "Axis Content Customization",
    "summary": "How business users customize backend-owned content, navigation, visibility, setup records, and publishing decisions from Axis.",
    "searchText": "Axis Content Customization How business users customize backend-owned content, navigation, visibility, setup records, and publishing decisions from Axis. axis-content-customization business-user-customization backend-owned-navigation",
    "keywords": [
      "axis-content-customization",
      "business-user-customization",
      "backend-owned-navigation"
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
  "record155": {
    "code": "nodicsDocsSearchpagenodicsdocsmetadataframeworkmodulararchitecture",
    "product": "nodicsDocumentationProduct",
    "targetType": "PAGE",
    "targetCode": "nodicsDocsMetadataframeworkModularArchitecture",
    "title": "Modular architecture and ownership",
    "summary": "How functional modules, technical modules, runtime servers, and customer projects fit together.",
    "searchText": "Modular architecture and ownership How functional modules, technical modules, runtime servers, and customer projects fit together. # Modular architecture and ownership\n\nModular Architecture and Ownership is the entry page for how Nodics separates business capabilities, runtime servers, project extensions, and technical implementation details. It helps a business reader understand why Nodics can grow without becoming one large application, and helps a developer decide where a change belongs before writing code.\n\nThe detailed pages in this group explain runtime composition, service precedence, and architecture decisions. This page is the dashboard for that journey.\n\n## Ownership model\n\n```mermaid\nflowchart TD\n  Capability[\"Business capability\"] --> Module[\"Functional module\"]\n  Module --> Technical[\"Technical modules\"]\n  Technical --> Server[\"Runtime server\"]\n  Project[\"Customer project\"] --> Override[\"Project extension\"]\n  Override --> Module\n```\n\n| Layer | What it owns | Reader impact |\n| --- | --- | --- |\n| Functional module | Business capability boundary and public contract. | Business users see a stable capability name. |\n| Technical module | Schemas, services, controllers, pipelines, events, and tests. | Developers know where implementation lives. |\n| Runtime server | Which modules are active together in a process. | Operators know what must run in each topology. |\n| Customer project | Extensions, overrides, configuration, and seed data. | Customers customize without editing reusable framework source. |\n\n## Plug-and-play availability\n\nOptional modules can be selected independently. If an optional module is absent or unavailable, only the operations that need it become unavailable. A running module is not automatically permissioned or activated for Axis: registration, activation, runtime readiness and employee permissions remain separate gates.\n\n| Module family | Standard boundary |\n| --- | --- |\n| Foundation, Platform, WCMS | Protected functional roots; Foundation supplies the runtime substrate. |\n| Process, Localization | Optional capabilities; required approvals and authoritative bundles still fail closed when unavailable. |\n| Commerce, Communication, Engagement, Loyalty, Location, Waste, Discovery, Copilot | Optional functional groups; actual local implementation prerequisites remain explicit. |\n| Accelerators | Optional umbrella; selected industry groups own their genuine Commerce or Waste inheritance. The umbrella does not force Commerce or Discovery. |\n| Documentation | Backend-owned content, not proof that a documented runtime capability is installed or usable. |\n\nUse `requiredModules` and `nodics.extends` only for actual local composition. For example, selected WCMS Experience and Copilot Knowledge currently embed Discovery implementation dependencies. Do not remove those dependencies while their services still require them. Ordinary WCMS does not select Experience. Remote reachability remains in existing module-service discovery and endpoint configuration; it must not load a second schema owner into the calling server.\n\nBackOffice uses existing workbench targets and lifecycle-action owners to disable affected features. A healthy navigation publisher does not make an absent target available. The backend returns the reason, and Axis renders it. No new dependency registry, configuration layer or frontend list is required.\n\n### Successful, rejected and recovery journeys\n\nAn administrator may register and activate Waste without activating Location. Waste operations that do not use Location remain independent. Collection-centre reads may return the partial data allowed by their enrichment contract; an operation requiring a valid Location reference must not fabricate one. The same rule applies to any optional integration, including reward issuance, search, communication, approval and translation.\n\nA missing permission still rejects access even when every module is healthy. A required approval failure must not publish content. A failed mutation must not be reported as successful enrichment. Recovery refreshes the existing lease/capability projection and does not delete records or auto-enable an administratively disabled module.\n\nFor local operations, a runtime exit after successful topology startup leaves other processes running. Inspect `topology:status` and the affected runtime log. Startup failures still fail the requested launch; explicit topology shutdown still stops its owned processes. Consolidated processes naturally share a process-failure boundary; use separate runtimes when failure isolation matters.\n\n### Customization and verification overview\n\nPartners contribute `workbenchTarget.moduleName`, action `ownerModule`, and provider behavior through existing module-owned capability data and same-name service overrides. Do not add a parallel dependency file or weaken target API authorization. Existing protected-to-optional registrations retain their registered/enabled state; deactivation is an explicit administrator action.\n\nMaintainers should run the functional optionality, navigation availability, lifecycle pagination, module invocation, and topology isolation contract tests. The shared matrix covers missing/restored targets, independent actions, multi-instance membership and more than 256 catalogue records. Production qualification must additionally exercise the deployment's selected end-to-end business operations; shared contract tests are not a claim that every provider and deployment combination has been tested.\n\n## Decide what kind of dependency you have\n\nA package being present on disk is like equipment being delivered to a site: it does not prove the equipment is connected, commissioned, or available to a particular employee. Nodics separates those decisions so that an outage or a permission change does not rewrite your application architecture.\n\n| Question | Existing authority | What it does not mean |\n| --- | --- | --- |\n| Can the project resolve this package? | Project package resolution | Its schemas are loaded in every server. |\n| Does this implementation run in this process? | Module/server `nodics.extends`, local `requiredModules`, effective `activeModules` | A remote integration must become a local schema owner. |\n| Where can a remote owner be reached? | Existing `servers` configuration and module-service discovery | The module is registered and enabled for business users. |\n| Has an administrator selected this business capability? | Functional registration and activation | Every target and provider is healthy. |\n| Is an observed instance usable now? | Runtime leases and readiness | A caller has permission to perform a mutation. |\n| Can this user perform this operation? | Owning API authorization, scope and validation | A visible menu is sufficient authorization. |\n\n```mermaid\nflowchart TD\n  request[\"Required capability\"] --> local[\"Local code needed?\"]\n  local -->|\"Yes\"| composition[\"Local dependency\"]\n  local -->|\"No\"| remote[\"Remote contract\"]\n  remote --> available[\"Usable and permitted?\"]\n  available -->|\"Yes\"| execute[\"Execute\"]\n  available -->|\"No\"| required[\"Result mandatory?\"]\n  required -->|\"Yes\"| reject[\"Reject with reason\"]\n  required -->|\"No\"| partial[\"Permitted partial read\"]\n```\n\nRead the diagram from the operation, not from the package list. A required reference, approval or financial effect takes the rejection branch. A genuinely optional display enrichment may take the partial-read branch. The service owns that distinction; the registry does not infer it from arbitrary method calls.\n\n## Worked module-selection examples\n\n### Waste without Location\n\nStarting state: the protected roots are available, Waste is installed and running, and Location has not been activated. An authorized administrator registers Waste and completes its own required activation data. Location is not a whole-Waste prerequisite.\n\n1. Check Module Registry for Waste registration and activation, then Module Health for the relevant technical owners. These answer different questions.\n2. Use a Waste operation whose contract has no Location dependency, such as reading its material taxonomy. Do not use a collection-centre map as the proof of Location-independent behavior.\n3. For a collection-centre journey, inspect the owning service's reference and enrichment requirements. Absence of Location does not convert `locationRef` into arbitrary text or remove a required reference from the schema.\n4. A read may expose permitted partial centre data; a required Location-based operation must report the missing capability or invalid reference.\n5. When Location becomes available and authorized, refresh the existing capability projection and retry an appropriate read. Do not recreate Waste records merely to refresh the UI.\n\nThis is a qualification procedure for a selected deployment, not a claim that every Waste API can operate without Location. Profile references, permissions, and the particular business operation remain part of that API's contract.\n\n### Commerce with selected industry behavior\n\nStarting state: a project wants Apparel behavior, but not every accelerator. Select the actual Apparel group through the existing project/server composition. Apparel keeps its real Commerce inheritance. The Accelerators umbrella itself does not impose Discovery on unrelated selections. Choosing the umbrella is not a substitute for reviewing which child groups the effective server loads.\n\nExpected result: the selected industry's implementations are resolved with their local prerequisites. Rejected customization: deleting Apparel's genuine Commerce inheritance while its services still depend on Commerce. Recovery: restore the project composition and rerun the selected industry's contracts.\n\n### Optional Process does not mean optional approval\n\nStarting state: Process is not used by a project's ordinary data reads. Those reads should not acquire an artificial dependency on Process. An approval- required publication is different: it must not succeed without the workflow authority required by its publishing policy. Keep the operation pending or rejected according to its existing lifecycle; do not manufacture an approval.\n\nWhen Process recovers, inspect the existing request before retrying a mutation. Recovery of a runtime does not establish whether a previous request committed. Use the owning lifecycle's status and idempotency rules.\n\n## Customize and extend safely\n\n### Project files and responsibilities\n\nUse an already scaffolded, loader-visible project module. The paths below are project-relative patterns, not instructions to create another configuration system or to copy a framework folder.\n\n| Project-owned path | Supported change | Invariant |\n| --- | --- | --- |\n| `modules/<projectModule>/package.json` | Declare genuine inheritance and the module's actual ownership metadata. | Standard functional identity does not change. |\n| `modules/<projectModule>/config/properties.js` | Override documented properties through normal configuration layering. | No second registry or hidden frontend module list. |\n| `modules/<projectModule>/src/service/<existingService>.js` | Override a supported method after its framework provider is loaded. | Preserve authorization, scope, errors and public method contracts. |\n| `envs/<environment>/<server>/package.json` | Select the server's actual local composition. | Remote endpoints do not become local persistence owners. |\n| `envs/<environment>/nodics.environment.json` | Select process layout and startup order. | `dependsOn` is not an activation or permission policy. |\n| `modules/<projectModule>/test/` | Prove the effective customized behavior and its failure paths. | Passing default tests alone does not qualify an overlay. |\n\n### Smallest configuration customization\n\nFor an existing Platform-hosted project overlay, place this property in its `config/properties.js`. This is a complete property fragment to merge with the file's other exports, not a complete project scaffold:\n\n```js\nmodule.exports = {\n  backofficeFunctionalModuleCatalogue: {\n    eligibilityPageSize: 128\n  }\n};\n```\n\nThe framework default is 256. The override changes records fetched per backend page, not which modules are eligible, their permissions, or the final result count. It must be a positive safe integer. Ensure the overlay is actually loaded by the server hosting BackOffice; editing an unrelated Waste-only process will not change Platform's effective properties. No browser restart can load an unselected backend overlay.\n\nTo verify, use a disposable catalogue fixture with 257 records: expect all 257, not only the first 128. Fail a later page and verify that no partial list is treated as a complete reconciliation. Test an unauthorized caller separately. For rollback, remove this property override and rebuild/restart the affected runtime under the project's normal deployment procedure. Do not edit catalogue records to simulate configuration rollback.\n\n### Guarantees projects cannot override\n\nProjects may narrow presentation and choose optional capabilities. They must not make a missing required approval successful, disable API authorization, replace tenant/enterprise scope with browser-supplied identity, or synthesize references to unavailable records. Hiding a menu item does not revoke its API permission. Such guarantees are deliberately not customization switches.\n\nAfter an upgrade, verify the effective owner and method load order again. An override can be syntactically valid but no longer participate in the selected runtime. Keep a small overlay contract test in the customer repository and link it to the framework contract tests listed below.\n\n## Qualification matrix\n\n| Scenario | Expected evidence | Unsafe conclusion to avoid |\n| --- | --- | --- |\n| Optional module absent | Unrelated permitted operation still works. | Every operation in the caller is independent. |\n| Target loses readiness | Only dependent presentation/actions change; API remains authoritative. | Disabled UI alone prevents API calls. |\n| Target returns | Current authorized projection recovers without altering stored enablement. | Recovery should auto-activate disabled modules. |\n| Two replicas publish different technical members | Live membership represents both; expired members reconcile. | The last heartbeat is the whole module. |\n| More than one catalogue page | Complete scoped listing and reconciliation. | A full first page proves all records were read. |\n| Project override selected | Default and customized tests both pass. | Editing a file proves it is loaded. |\n\nRun from the framework repository root:\n\n```bash\nnode --test nodics.foundation/modules/nTooling/test/functionalModuleOptionalityContract.test.js\nnode --test nodics.platform/modules/backoffice/test/navigationModuleAvailability.test.js\nnode --test nodics.platform/modules/backoffice/test/functionalModuleLifecyclePagination.test.js\n```\n\nThese are source and service contracts. Complete the chosen business journey in an isolated deployment with authorized users before production acceptance. No test command above registers modules, publishes content or resets business data. See Module Registry Journey for the administrator flow and Tooling Runtime Contracts for process recovery.\n\n## What to read next\n\n- Read **Runtime Server Composition** when deciding which backend server should host a capability.\n- Read **Module Loading and Service Precedence** when a project overrides a schema, service, controller, pipeline, event, or configuration value.\n- Read **Architecture Decision Guide** when choosing between module ownership, project customization, runtime configuration, import data, or Axis content.\n- Read **Functional Module Registry** when you need the active capability map visible to Axis, tools, and operators.\n\n## Business perspective\n\nFor business teams, modularity means controlled growth. A retailer can start with content, catalog, cart, checkout, payment, shipping, and order operations, then add search, engagement, integrations, automation, analytics, and industry accelerators without redesigning the whole platform. Each capability has a business-friendly name, a clear owner, and a publication or runtime contract.\n\nThe important decision is not the package name. The important decision is who owns the business behavior, who can change it, how it is approved, and where an operator can verify it.\n\n## Technical perspective\n\nFor a developer, modular architecture protects extension boundaries. A project can extend Platform, WCMS, Commerce, Process, or another capability through project modules, configuration, data, and service precedence. The project does not rename the core capability or copy framework implementation just to make a customer-specific change.\n\nEvery topic in this area should identify the owning module, the project-layer override path, configuration keys, APIs, events, pipelines, validation tests, and operational evidence. If the change affects runtime behavior, the documentation must also explain whether it is static, import-driven, or governed runtime change.\n\n## Common mistakes\n\n- Naming documentation after exact package folders instead of business capability names.\n- Putting project customization inside reusable framework modules.\n- Treating Axis as the owner of backend data instead of the administrative client.\n- Describing service overrides without explaining load order or verification.\n\n## Verification\n\nVerify modular decisions by checking the module metadata, generated service contracts, active runtime composition, Axis capability registry, and tests for the changed behavior. A beginner should be able to follow the capability name; a developer should be able to find the implementation; an operator should be able to see where the capability runs.\n",
    "keywords": [
      "framework-architecture-and-design",
      "modularity-and-ownership",
      "modular-architecture-and-ownership",
      "Framework Architecture and Design",
      "Modularity and Ownership",
      "Modular architecture and ownership"
    ],
    "facets": {
      "section": "framework-architecture-and-design",
      "group": "framework-architecture-and-design",
      "navigationDepth": 2,
      "documentType": "concept",
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
  },
  "record156": {
    "code": "nodicsDocsSearchpagenodicsdocsmetadataframeworkarchitecturedecisionguide",
    "product": "nodicsDocumentationProduct",
    "targetType": "PAGE",
    "targetCode": "nodicsDocsMetadataframeworkArchitectureDecisionGuide",
    "title": "Architecture Decision Guide",
    "summary": "Decision path for choosing framework, project, content, provider, service, pipeline, schema, route, or renderer ownership.",
    "searchText": "Architecture Decision Guide Decision path for choosing framework, project, content, provider, service, pipeline, schema, route, or renderer ownership. # Architecture Decision Guide\n\nThe architecture decision guide helps teams decide where a new behavior, configuration, API, schema, data pack, renderer, or workflow belongs. It exists because enterprise projects fail when every team solves the same ownership question differently. A business user sees the resulting confusion as slow delivery. A developer sees it as duplicated code. An operator sees it as a runtime that cannot explain itself.\n\nUse this page before implementation. It does not replace module-specific documentation; it gives the first decision path so the right module-specific page is opened.\n\n## Decision path\n\n```mermaid\nflowchart TD\n  Need[\"New requirement\"] --> Business[\"Is this customer-specific?\"]\n  Business -->|Yes| Project[\"Project module, content, or configuration\"]\n  Business -->|No| Capability[\"Find reusable capability owner\"]\n  Capability --> Data[\"Does it change data or schema?\"]\n  Capability --> UI[\"Is it only browser rendering?\"]\n  Capability --> Runtime[\"Does it change runtime behavior?\"]\n  Data --> Owner[\"Owning backend module\"]\n  UI --> Axis[\"Axis or public app renderer\"]\n  Runtime --> Config[\"Configuration, provider, pipeline, event, or service\"]\n```\n\n## Ownership table\n\n| Change type | Preferred owner | Avoid |\n| --- | --- | --- |\n| Employee identity or permission | Platform/Profile capability. | Public app or Axis-only logic. |\n| CMS page, component, route, media, or documentation | WCMS or backend content pack owner. | Frontend hardcoded pages. |\n| Storefront accelerator data | Accelerator project/module pack plus required domain capabilities. | Importing data before modules are registered. |\n| Scheduled work | Process/Cron or project cron extension. | Node-local timers hidden from governance. |\n| Business rule | Service, validator, pipeline, or project extension. | Editing unrelated framework files. |\n| Provider switch | Provider adapter and configuration. | One-off conditionals in business code. |\n\n## Business perspective\n\nThe business benefit is predictable change. If a customer asks for a new approval rule, product field, page layout, search provider, or payment adapter, the team can identify the owner and impact before changing code. That shortens delivery because the discussion moves from \"where can we hack this?\" to \"which capability owns the business decision?\"\n\n## Customization and extension\n\nStart with configuration and content when the behavior is designed for business administration. Move to project modules when code is needed. Change framework source only when the reusable capability itself needs to improve for all projects. Every extension must document its owner, runtime impact, tests, and rollback path.\n\n## Reader and implementation contract\n\nA beginner should use this page as the first checkpoint before opening source files. A business sponsor should be able to see whether a request changes customer experience, administration, runtime behavior, public content, security, or operations. A developer should convert that business request into one owner and one extension path before editing. An operator should receive enough detail to know which server, import, publication, or configuration change will be affected.\n\nWhen a decision is made, record the rejected options as well as the selected owner. For example, if a new storefront header is implemented through WCMS content, state why it is not a hardcoded Agora component. If a workflow is implemented in Process, state why it is not an unmanaged cron timer. These small decision notes prevent future teams and AI tools from reversing the architecture during urgent delivery work.\n\n## Common mistakes\n\n- Starting from the nearest matching filename instead of the owning capability.\n- Putting backend authority inside Axis because the action starts from a screen.\n- Confusing generated OpenAPI with canonical CMS documentation data, or bypassing declared release integrity when changing content.\n- Forgetting that data import, publication, and runtime activation may require separate steps.\n- Skipping business impact when the change appears technical.\n\n## Verification\n\nA decision is ready when the owning capability is named, the project versus framework boundary is clear, configuration and content options were checked, the runtime server is known, and the validation path covers API, browser, data, permissions, publication, and operations where applicable.\n",
    "keywords": [
      "architecture-decision-guide",
      "ownership-decision",
      "where-change-belongs",
      "Framework Architecture and Design",
      "Modularity and Ownership",
      "Architecture Decision Guide"
    ],
    "facets": {
      "section": "framework-architecture-and-design",
      "group": "framework-architecture-and-design",
      "navigationDepth": 2,
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
  },
  "record157": {
    "code": "nodicsDocsSearchpagenodicsdocsmetadatafoundationoverview",
    "product": "nodicsDocumentationProduct",
    "targetType": "PAGE",
    "targetCode": "nodicsDocsMetadatafoundationOverview",
    "title": "Foundation overview",
    "summary": "Beginner, developer, and operations guide to the Foundation runtime, request path, cache, events, configuration, and quality rules.",
    "searchText": "Foundation overview Beginner, developer, and operations guide to the Foundation runtime, request path, cache, events, configuration, and quality rules. # Foundation overview\n\n`nodics.foundation` is the foundation every Nodics runtime loads before any higher functional module such as Platform, WCMS, Cron, Workflow, or Commerce. It is not a business screen and it is not a customer project. It is the reusable runtime framework that gives every server the same language for modules, configuration, routing, services, schemas, data releases, imports, tests, security hooks, and operational contracts.\n\nFor a beginner, Core is the engine room. Most business users will not open a Core page in Axis every day, but every business capability depends on it being predictable. If Core is messy, every module above it becomes harder to secure, customize, test, and operate.\n\n## Business purpose\n\nCore reduces the cost of building enterprise applications by solving repeated technical problems once. A project should not reinvent module loading, layered configuration, API exposure, database model registration, import validation, service discovery, logging, or test scaffolding for every new capability.\n\nThe business value is indirect but powerful:\n\n| Business concern | Core contribution |\n| --- | --- |\n| Faster delivery | New modules start from a known runtime shape instead of a blank server. |\n| Safer customization | Customer behavior can load later without editing framework source. |\n| Upgradeability | Shared contracts stay in one foundation and are tested consistently. |\n| Operations | Startup, logs, imports, schemas, routers, and validation follow repeatable rules. |\n| Governance | APIs, data releases, generated artifacts, and module ownership are explicit. |\n\nCore is what lets a partner trust that Platform, WCMS, Cron, and additional modules are not unrelated applications glued together by convention.\n\n## Beginner mental model\n\nImagine building several business products: a content platform, a scheduled job engine, a commerce application, and a documentation portal. Without a framework, each product might invent its own config files, service structure, database connection, routing style, error shape, and tests. That makes the whole ecosystem difficult to learn.\n\nCore gives them a shared base:\n\n```mermaid\nflowchart TB\n  Core[\"nodics.foundation<br/>runtime foundation\"] --> Config[\"Configuration layers\"]\n  Core --> Loader[\"Module loader and lifecycle\"]\n  Core --> Routing[\"Routers and API exposure\"]\n  Core --> Services[\"Services, facades, controllers\"]\n  Core --> Data[\"Schemas, imports, exports, generated data\"]\n  Core --> Security[\"Auth, validation, tokens, guards\"]\n  Core --> Quality[\"Testing and tooling\"]\n\n  Config --> Platform[\"nodics.platform\"]\n  Loader --> WCMS[\"nodics.wcms\"]\n  Routing --> Process[\"nodics.process\"]\n  Services --> OtherCapabilities[\"additional functional modules\"]\n```\n\nEvery higher module builds on this foundation. A module can extend another module, but it should not bypass Core contracts.\n\n## What Core owns\n\nCore owns framework-level technical capabilities, including:\n\n- module discovery and runtime loading;\n- configuration precedence and property merging;\n- common utilities and status/error definition patterns;\n- database connection and model registration contracts;\n- routing and API category exposure;\n- controller, facade, service, and pipeline conventions;\n- authentication, token, validation, and security infrastructure hooks;\n- import/export and data release mechanics;\n- event, cache, search, test, and tooling foundations;\n- generated LLM context and quality governance through nSetup/nTooling.\n\nCore does not own customer business rules. If a customer needs special behavior, the first question is whether the behavior belongs in a customer project module, a later-loaded extension of an existing functional module, or a new functional module. Do not put customer behavior into Core just because Core is loaded everywhere.\n\n## Runtime loading model\n\nCore always loads before higher functional modules. The exact server graph is defined by the customer project and server configuration.\n\n![Request process design](media:nodicsDocsImage_3a3376a50bb770d9ed24d036)\n\n```mermaid\nflowchart LR\n  Package[\"Package dependency<br/>code is available\"] --> Extends[\"Server/module extends<br/>code is selected\"]\n  Extends --> Index[\"Module index/load order<br/>merge precedence\"]\n  Index --> Runtime[\"Running server<br/>effective services, routes, data\"]\n```\n\nThese are different concepts:\n\n- package dependency makes code available to npm;\n- module `extends` describes functional inheritance;\n- server `extends` describes the effective boot graph;\n- index/load order decides which services and configuration win during merge;\n- BackOffice registration decides which functional capability is accepted and active for business use.\n\nConfusing these concepts is one of the fastest ways to create hidden bugs.\n\n## Request processing model\n\nEvery API should feel boringly consistent to a developer, tester, and operator. The request enters through Express, passes through Nodics routing and request processing, reaches the owning controller/facade/service layer, and only then touches persistence, cache, search, events, or provider integrations through approved contracts.\n\n![Request processor flow](media:nodicsDocsImage_7a70f1b6afe4cae0026bd995)\n\nThis flow is why Nodics discourages shortcuts. A validation rule, permission check, tenant resolution, error response, cache lookup, or persistence call should live in the layer that owns that responsibility. If a feature works only because one route manually skipped the shared request path, it will become a security and regression risk later.\n\n## Cache, search, events, and logging\n\nCore also supplies reusable infrastructure seams. These seams are intentionally module-owned so a customer project can change the provider or policy without rewriting business APIs.\n\n![API cache flow](media:nodicsDocsImage_5f9dec9155c243c85506cdd1)\n\n![Item cache flow](media:nodicsDocsImage_b144786ede6898a81a68ebc1)\n\n![Search cache flow](media:nodicsDocsImage_bed208e5639cabdb443694d9)\n\n![Event handler process](media:nodicsDocsImage_b52761cc826b3c37dfdb26d1)\n\n![EMS producer system](media:nodicsDocsImage_460ae3584baee14cd036c782)\n\n![EMS consumer system](media:nodicsDocsImage_61379238c526ed668981ae50)\n\nFor example, a module may cache API responses, individual models, or search results, but the route should not hardcode a specific cache backend. A module may publish or consume events, but it should do that through nEvent/nEms contracts rather than calling a message broker directly from random business code. Logs should carry enough context to explain which module, tenant, request, job, import, or event caused the action.\n\n## Configuration-first rule\n\nCore supports layered configuration so projects can change behavior without editing framework source. Defaults should live in the module that owns the behavior. Project, environment, server, node, tenant, provider, and persisted configuration layers may override or narrow those defaults.\n\nThe rule is not \"everything goes in properties.\" The rule is \"put each setting where its authority belongs.\"\n\n| Need | Correct direction |\n| --- | --- |\n| Framework-wide default | Owning framework module configuration. |\n| Project-specific default | Customer project configuration. |\n| Local server port/database | Environment/server configuration. |\n| Secret or machine-specific path | Private local/environment configuration, never committed casually. |\n| Status, lifecycle, error code | Owning status-definition contract, not random properties. |\n| Generated import checksum | Generated manifest from source data, not manual editing. |\n\n## Developer workflow\n\nWhen changing Core or a module that depends on Core, use this sequence:\n\n1. Identify the owning functional module and technical module.\n2. Read the nearest `AGENTS.md`, README, and relevant contracts.\n3. Check whether existing configuration or extension seams solve the need.\n4. Write export-friendly, documented JavaScript in the correct folder.\n5. Keep generated artifacts generated from source.\n6. Add focused tests for default behavior and customization behavior.\n7. Run quality, docs, AI, LLM, module, and acceptance checks appropriate to the changed surface.\n\nThis sequence protects customer extension modules. A partner should be able to override a service, replace a provider, or adjust configuration without patching framework source.\n\n## Axis visibility\n\nCore is a mandatory functional module in the current Axis-backed reference stack, but Axis should not expose every Core technical module as a separate business registry card. Core appears as a high-level foundation. Internal technical modules remain developer details unless an owning functional module exposes a browser-safe capability.\n\nAxis uses Core indirectly through Platform, BackOffice, WCMS, Cron, and other module APIs. The browser must not import Core source, execute Core services, or become a second runtime loader.\n\n## DevOps and QA checks\n\nCore changes deserve broad verification because every runtime depends on them. At minimum, prove:\n\n- Platform starts with Core loaded first;\n- WCMS starts and can import content packs;\n- Cron starts when selected by the runtime graph;\n- generated data manifests validate;\n- module LLM context generation and validation still pass;\n- API category exposure remains intentional;\n- configuration precedence logs remain explainable;\n- fresh local acceptance can rebuild from empty local databases;\n- no generated files drift from their source definitions.\n\n## Common mistakes\n\n- Putting customer-specific behavior into Core because every server loads it.\n- Treating package dependency order as service override order.\n- Hiding lifecycle states or error codes in unrelated properties.\n- Editing generated data instead of fixing source definitions or generators.\n- Exposing every technical module as a business capability in Axis.\n- Bypassing backend module authority by adding frontend-only logic.\n\nCore is powerful because it is boringly consistent. Keep it that way.\n\n## Verification\n\nCore verification should always be broader than the edited file because every runtime server depends on Core. For documentation-only changes, maintain the canonical CMS documentation records and declared hashes, then run the docs validator. For source or configuration changes, run root validation, generated LLM context generation and validation, documentation quality checks, focused module tests, and at least one runtime prepare or acceptance path through the reference customer project.\n\nThe practical local proof is: Platform starts, WCMS starts, Cron starts when selected, imports validate, documentation renders, module registry state persists, and Axis never needs direct Core source access. If a Core change can only be proven by one isolated unit test, it is probably under-tested for a framework foundation.\n",
    "keywords": [
      "foundation-runtime-services",
      "runtime-foundation",
      "foundation-overview",
      "Foundation Runtime Services",
      "Runtime Foundation",
      "Foundation overview"
    ],
    "facets": {
      "section": "foundation-runtime-services",
      "group": "foundation-runtime-services",
      "navigationDepth": 2,
      "documentType": "overview",
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
  },
  "record158": {
    "code": "nodicsDocsSearchpagenodicsdocsmetadataframeworkcustomizationguide",
    "product": "nodicsDocumentationProduct",
    "targetType": "PAGE",
    "targetCode": "nodicsDocsMetadataframeworkCustomizationGuide",
    "title": "Customization and extension guide",
    "summary": "How customer projects customize Nodics safely without forking framework authority.",
    "searchText": "Customization and extension guide How customer projects customize Nodics safely without forking framework authority. # Customization and extension guide\n\nCustomization and Extension Guide is the decision page for changing Nodics without breaking reusable framework ownership. It explains which customization mechanism to choose first, then links to deeper backend and Axis customization topics.\n\n## Customization ladder\n\n```mermaid\nflowchart TD\n  Need[\"Business change\"] --> Data[\"Content or import data\"]\n  Need --> Config[\"Configuration\"]\n  Need --> Axis[\"Axis-managed content/component metadata\"]\n  Need --> Backend[\"Project backend extension\"]\n  Backend --> Verify[\"Tests, audit, and runtime evidence\"]\n```\n\n| Change type | First place to check | Why |\n| --- | --- | --- |\n| Business content | Axis content catalog or import data. | Keeps business updates governed and publishable. |\n| Runtime behavior | Configuration or Dynamo-style governed runtime change. | Avoids redeploy when runtime policy is intentionally dynamic. |\n| UI arrangement | Axis-managed component and navigation metadata. | Lets business users adjust labels, sequence, visibility, and page structure. |\n| Backend logic | Project-layer module extension. | Keeps framework source reusable and customer-specific behavior isolated. |\n\n## Business perspective\n\nBusiness users should not need to know package names to request a change. They need to know whether a change affects content, catalog data, pricing, checkout, approval, publication, security, or runtime operations. Documentation must explain the decision, expected impact, risk, approval path, and rollback model.\n\n## Developer perspective\n\nDevelopers should start from the owning capability and pick the least invasive extension point. If configuration is enough, use configuration. If a model, service, pipeline, event, controller, or schema must change, use a project module and document the override path. If Axis needs new editing controls, publish the backend metadata and render it through Axis rather than hardcoding business structure in the frontend.\n\n## Continue with\n\n- **Backend Extension Patterns** for services, schemas, APIs, events, pipelines, interceptors, and project module ownership.\n- **Axis Content Customization** for navigation, components, page content, publication visibility, role access, and user-facing labels.\n- **Governed Runtime Change Capability** when administrators need approved runtime changes distributed across running nodes.\n\n## Reader and implementation contract\n\nA beginner should leave this page knowing that customization is a managed choice, not a random code edit. A business user should understand whether the requested change belongs to content, configuration, Axis-managed structure, runtime governance, or backend extension. A developer should know that the implementation must start from the owning capability and must document the selected extension mechanism. An operator should know which evidence proves the customization is active and how it can be reversed.\n\nEvery future customization topic should include the same minimum information: business problem, decision supported, owner, configuration keys, data model or schema impact, APIs or events, project-layer override path, permissions, audit behavior, visual flow, and test evidence. If a customization changes customer-visible behavior, the documentation must include browser verification and rollback notes.\n\n## Common mistakes\n\n- Editing framework source for a customer-only behavior.\n- Hardcoding content, navigation, or visibility in Axis.\n- Adding a backend override without tests and operational evidence.\n- Describing the technical change but not the business decision it supports.\n\n## Verification\n\nVerify customization by checking the affected module contract, project-layer override, configuration source, Axis visibility, audit trail, and tests. A beginner should understand what changed, a business user should understand the impact, a developer should know where to implement, and an operator should know how to observe and rollback the change.\n",
    "keywords": [
      "developer-extension-and-project-customization",
      "project-layer-customization",
      "customization-and-extension-guide",
      "Developer Extension and Project Customization",
      "Project-Layer Customization",
      "Customization and extension guide"
    ],
    "facets": {
      "section": "developer-extension-and-project-customization",
      "group": "developer-extension-and-project-customization",
      "navigationDepth": 2,
      "documentType": "customization",
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
  },
  "record159": {
    "code": "nodicsDocsSearchpagenodicsdocsmetadataframeworkbackendextensionpatterns",
    "product": "nodicsDocumentationProduct",
    "targetType": "PAGE",
    "targetCode": "nodicsDocsMetadataframeworkBackendExtensionPatterns",
    "title": "Backend Extension Patterns",
    "summary": "How projects extend behavior through configuration, provider adapters, services, validators, pipelines, schemas, and events.",
    "searchText": "Backend Extension Patterns How projects extend behavior through configuration, provider adapters, services, validators, pipelines, schemas, and events. # Backend Extension Patterns\n\nBackend Extension Patterns explain how developers add or change behavior without damaging the reusable framework. This page splits the deeper developer guidance out of the general customization overview so a reader can choose the right path: configuration, provider, service, validator, pipeline, schema, route, event, or project module.\n\nThe business reason is straightforward. Customer-specific behavior should be fast to deliver, but it should not make framework upgrades expensive. Nodics keeps that balance by making extension points explicit.\n\n## Extension options\n\n| Pattern | Use when | Verification |\n| --- | --- | --- |\n| Configuration | Behavior already has a supported switch. | Config validation and runtime evidence. |\n| Provider adapter | Storage, cache, search, messaging, or integration backend changes. | Provider tests and fallback behavior. |\n| Service override | Business decision changes for a project. | Default and override tests. |\n| Module communication | One module must call another local or remote module. | Local, remote, target-authority, internal-auth, timeout, and failure tests. |\n| Validator | Data rules or approval rules change. | Valid and invalid payload tests. |\n| Pipeline step | Business logic is staged or composable. | Step order and failure tests. |\n| Schema extension | Project needs additional data fields. | Generated schema and API tests. |\n\n## Decision flow\n\n```mermaid\nflowchart TD\n  Need[\"Customization need\"] --> Config[\"Can configuration solve it?\"]\n  Config -->|Yes| Setting[\"Use validated property\"]\n  Config -->|No| Existing[\"Is there an extension point?\"]\n  Existing -->|Yes| Extend[\"Project service, provider, validator, or pipeline\"]\n  Existing -->|No| Framework[\"Improve reusable framework capability\"]\n```\n\n## Business and developer impact\n\nBusiness users get faster customization because the project does not need to fork the framework for every customer request. Developers get clearer code ownership because the extension lives beside the customer project. Operators get better support because logs and generated context can identify the active implementation.\n\n## Customization and extension\n\nThe extension itself must be documented. The page should say which module owns the base behavior, where the project override lives, which server loads it, which configuration enables it, which API or event changes, and how rollback works. If the customization is business-configurable from Axis, the Axis journey and approval rules must be documented as well.\n\nFor HTTP request customization, start from `API Request Lifecycle and Handler Pipeline` before changing controllers or route middleware. For cross-module calls, start from `Module-to-Module Communication` before adding direct service access, endpoint URLs, or provider-specific transport code.\n\n## Reader and implementation contract\n\nA beginner should learn that customization has a ladder and the lowest safe step should be tried first. A business user should understand whether the request can be handled by Axis configuration or requires developer delivery. A developer should identify the extension mechanism before writing code. An operator should receive enough detail to support the customized runtime during restart, scaling, failure, and rollback.\n\nEvery extension page should include a small evidence map: owning capability, project module, configuration key, affected server, API or event boundary, data impact, tests, and browser proof where a user-facing journey changes. That evidence keeps customization fast without making the system mysterious.\n\n## Common mistakes\n\n- Editing framework source for a customer-only rule.\n- Adding a provider without documenting configuration and failure behavior.\n- Creating a service override but testing only the default service.\n- Extending schemas without explaining API, import, and migration impact.\n- Using Axis to hide backend complexity instead of exposing governed actions.\n\n## Verification\n\nVerify backend extension by proving default framework behavior still works, the project override activates only in the intended runtime, generated schemas or APIs are updated, tests cover failure paths, and browser or API evidence shows the customized behavior. The documentation must include the owner, extension path, and rollback signal.\n",
    "keywords": [
      "backend-extension-patterns",
      "service-override",
      "provider-adapter",
      "pipeline-extension",
      "Developer Extension and Project Customization",
      "Project-Layer Customization",
      "Backend Extension Patterns"
    ],
    "facets": {
      "section": "developer-extension-and-project-customization",
      "group": "developer-extension-and-project-customization",
      "navigationDepth": 2,
      "documentType": "customization",
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
  },
  "record160": {
    "code": "nodicsDocsSearchpagenodicsdocsmetadataframeworkaxiscontentcustomization",
    "product": "nodicsDocumentationProduct",
    "targetType": "PAGE",
    "targetCode": "nodicsDocsMetadataframeworkAxisContentCustomization",
    "title": "Axis Content Customization",
    "summary": "How business users customize backend-owned content, navigation, visibility, setup records, and publishing decisions from Axis.",
    "searchText": "Axis Content Customization How business users customize backend-owned content, navigation, visibility, setup records, and publishing decisions from Axis. # Axis Content Customization\n\nAxis Content Customization explains how business users and administrators can change labels, navigation, page content, content areas, visibility, setup records, and publishing decisions without turning Axis into the backend owner. This page belongs with project customization because many customer changes are business-managed rather than code-managed.\n\nThe key rule is that Axis is the workspace. Backend modules and content catalog records remain the authority.\n\n## Customization journey\n\n```mermaid\nflowchart LR\n  User[\"Axis user\"] --> Record[\"Open backend-owned record\"]\n  Record --> Edit[\"Edit label, order, content, access, or property\"]\n  Edit --> Validate[\"Backend validation\"]\n  Validate --> Staged[\"Save to Staged\"]\n  Staged --> Approval[\"Approval and audit\"]\n  Approval --> Online[\"Online delivery\"]\n```\n\n## What business users can change\n\n| Change | Owner | Notes |\n| --- | --- | --- |\n| Documentation navigation | Documentation content catalog. | Section, group, subgroup, sequence, and summaries should be editable with workflow. |\n| CMS pages and content areas | WCMS content catalog. | Headers, footers, pages, and components should be backend-driven. |\n| Public visibility | Access policy records. | Public and authenticated views must be explicit. |\n| Setup and application packs | Backend initialization metadata. | Axis should show dependencies and next actions. |\n| Workflow decisions | Process tasks and permissions. | Authorized users can approve or reject according to permissions. |\n\n## Business value\n\nThis model gives business teams more control without bypassing governance. They can prepare content, request publication, approve tasks when authorized, and verify public delivery in a guided journey. Developers still own renderer contracts and backend validation, so the UI does not become a private data model.\n\n## Customization and extension\n\nProjects can add Axis screens, renderers, and workspaces when new business capabilities require them. The extension must consume backend contracts, not invent frontend-only authority. If a new left-nav item or content section is needed, the backend should expose navigation metadata and permissions so Axis can render it consistently.\n\n## Reader and implementation contract\n\nA beginner should know that Axis is where work happens, not where backend truth is invented. A business user should have a clear path to update content, submit approval, review pending work, approve or reject when permitted, and verify public delivery. A developer should know which backend API and renderer contract power the screen. An operator should know which state refreshes after each mutation.\n\nEvery Axis customization should be designed as a single business journey where possible. If a user starts from documentation publishing, they should not be sent to unrelated task lists without context. The screen should show available updates, dependency blockers, approval actions, Online state, and links that become visible after successful publication.\n\n## Common mistakes\n\n- Hardcoding Axis navigation for data that should be backend-managed.\n- Requiring users to jump between multiple pages to approve one publication.\n- Hiding setup dependencies until an import fails.\n- Letting the requester identity block approval instead of checking actual permissions, unless separation of duties is explicitly required.\n- Forgetting to refresh navigation after a successful mutation.\n\n## Verification\n\nVerify Axis customization by changing a backend-owned record from Axis, confirming validation and permissions, completing approval where required, and checking that Axis and public apps refresh from the updated backend state. The browser journey should be easy enough for a business administrator to complete without reading source code.\n",
    "keywords": [
      "axis-content-customization",
      "business-user-customization",
      "backend-owned-navigation",
      "Developer Extension and Project Customization",
      "Project-Layer Customization",
      "Axis Content Customization"
    ],
    "facets": {
      "section": "developer-extension-and-project-customization",
      "group": "developer-extension-and-project-customization",
      "navigationDepth": 2,
      "documentType": "customization",
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
