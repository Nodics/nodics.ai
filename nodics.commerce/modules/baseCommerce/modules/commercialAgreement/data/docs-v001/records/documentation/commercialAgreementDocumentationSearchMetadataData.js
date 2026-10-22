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
    "code": "nodicsDocsSearchnodenodicsdocsnodepagecommercialagreements",
    "product": "nodicsDocumentationProduct",
    "targetType": "NODE",
    "targetCode": "nodicsDocsNodePagecommercialAgreements",
    "title": "Commercial Agreements",
    "summary": "Enterprise package assignments, descriptive terms, retained amendments and independently timed search benefits without automatic billing or status enforcement.",
    "searchText": "Commercial Agreements Enterprise package assignments, descriptive terms, retained amendments and independently timed search benefits without automatic billing or status enforcement.",
    "keywords": [
      "commercial-agreement",
      "Enterprise",
      "package",
      "amendment",
      "benefit",
      "Axis"
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
    "lifecycleState": "DRAFT",
    "indexState": "INDEX_READY",
    "active": true
  },
  "record1": {
    "code": "nodicsDocsSearchpagenodicsdocsmetadatacommercialagreements",
    "product": "nodicsDocumentationProduct",
    "targetType": "PAGE",
    "targetCode": "nodicsDocsMetadatacommercialAgreements",
    "title": "Commercial Agreements",
    "summary": "Enterprise package assignments, descriptive terms, retained amendments and independently timed search benefits without automatic billing or status enforcement.",
    "searchText": "Commercial Agreements Enterprise package assignments, descriptive terms, retained amendments and independently timed search benefits without automatic billing or status enforcement. # Commercial Agreements\n\nCommercial Agreement retains an Enterprise package assignment, the complete descriptive terms agreed by the parties, exact package and price versions, immutable amendments and search-benefit evidence. Beginners should first identify the Profile Enterprise and existing Product package/Pricing price records, then read the agreement history before preparing a change. Business administrators can distinguish what was agreed from what is currently effective without treating a catalogue edit as a rewritten contract. This guide describes implemented source behavior and isolated unit coverage, not an installed runtime or legal advice.\n\n## Ownership and supported models\n\nReuse assessment placed this narrow capability in Base Commerce. Product defines the shared saleable package and Pricing defines prices; neither owns a party-specific amendment history. Profile owns Enterprise identity, employee scope and status. Order and Payment provide immutable transaction evidence rather than an editable agreement. The existing telco subscription capability requires customer, SIM/ESIM and number-intent fields and is not a generic Enterprise commercial owner. Search consumes benefit coverage but does not grant it. Generated database concurrency provides atomic persistence without a second registry, transaction engine or ledger.\n\n| Selection or evidence | Owner and boundary |\n| --- | --- |\n| FIXED_PRICE or SUBSCRIPTION; PREPAID or INVOICE | Independent explicit agreement selections over the same versioned package model. INVOICE describes terms; it does not create an invoice. |\n| Services, allowances, renewal and termination | Complete descriptive agreement fields. No automatic usage blocking, legal interpretation, proration, renewal debit or suspension. |\n| Package and agreed price | Exact Product/product and Pricing/priceRow references with versionId. The retained price snapshot is resolved from the owner, not accepted from editable browser money. |\n| Enterprise status and authority | Profile owns status and current signed human scopes. An agreement cannot enable an Enterprise or grant employee permissions. |\n| Financial references | Existing order/commerceOrder or paymentCore/paymentTransaction evidence only. Existence does not prove payment; unsupported invoice references reject. |\n\n## Record and amendment workflow\n\nThe secured module-relative POST /agreements/workspace accepts enterpriseCode and returns currently authorized commands, semantic choices and configured bounds. POST /agreements/search requires enterpriseCode, pageNumber and pageSize and returns bounded summaries with hasMore. POST /agreements/read accepts code and enterpriseCode and returns retained history. POST /agreements/record accepts a complete reviewed command. The original employee needs commerce.agreement.read or commerce.agreement.manage as appropriate and signed Enterprise scope. Only already-authorized admin scope can select another Enterprise; body identity never supplies authority.\n\nThe following complete illustrative creation assumes the named package, price version and Enterprise already exist and are readable by the original actor. These names and dates are examples, not framework defaults. Recording it is a business mutation and must not be used as a smoke test or setup seed. SUBSCRIPTION additionally requires an explicit billingPeriod; automatic renewal requires its period, notice terms and express evidence. No field executes the described financial terms.\n\n```json\n{\n  \"code\": \"merchantAgreement\",\n  \"enterpriseCode\": \"merchant\",\n  \"commandId\": \"recordReviewedTerms\",\n  \"expectedRevision\": 0,\n  \"terms\": {\n    \"model\": \"FIXED_PRICE\",\n    \"paymentTerms\": \"PREPAID\",\n    \"packageRef\": {\n      \"module\": \"product\",\n      \"schema\": \"product\",\n      \"code\": \"package\",\n      \"versionId\": 1\n    },\n    \"priceRef\": {\n      \"module\": \"pricing\",\n      \"schema\": \"priceRow\",\n      \"code\": \"price\",\n      \"versionId\": 1\n    },\n    \"services\": \"Coupon visibility in the agreed Store\",\n    \"allowances\": \"Descriptive allowance for eligible coupons during the agreed period\",\n    \"effectiveFrom\": \"2026-10-01T00:00:00Z\",\n    \"effectiveTo\": \"2027-01-01T00:00:00Z\",\n    \"serviceStart\": \"2026-10-01T00:00:00Z\",\n    \"paymentSchedule\": \"As agreed in document-1\",\n    \"renewal\": {\n      \"mode\": \"NONE\"\n    },\n    \"terminationTerms\": \"By mutual written agreement\",\n    \"financialTreatment\": \"No automatic proration; agreed treatment in document-1\",\n    \"evidenceRef\": \"document-1\",\n    \"financialReferences\": [],\n    \"benefits\": [\n      {\n        \"code\": \"visibility\",\n        \"source\": \"PACKAGE_INCLUDED\",\n        \"targetType\": \"ALL_ENTERPRISE_COUPONS\",\n        \"productCodes\": [],\n        \"storeCode\": \"shop\",\n        \"validFrom\": \"2026-10-01T00:00:00Z\",\n        \"validTo\": \"2026-12-01T00:00:00Z\",\n        \"evidenceRef\": \"document-1\"\n      }\n    ]\n  }\n}\n```\n\nCreation uses expectedRevision zero. An amendment supplies the returned current revision, a new commandId and complete new terms, not a partial patch. Effective dates must increase strictly. Every version retains normalized intent, actor, timestamp, agreed evidence and resolved price snapshot. A single generated compare-and-swap appends the version and increments the aggregate revision; separate head and history writes cannot diverge. A unique code index protects concurrent creation. Generated tenant persistence remains the isolation envelope, while enterpriseRef records business ownership. Generic replacement, import and deletion cannot bypass owner-admitted persistence guards.\n\n## Benefits and independent duration\n\nEach benefit has a stable code, source PACKAGE_INCLUDED or ADD_ON, Store, evidenceRef and a half-open validFrom/validTo interval contained within the agreement term. ADD_ON additionally requires descriptive additionalBenefitTerms. SELECTED_COUPONS requires explicit Product codes; ALL_ENTERPRISE_COUPONS uses an empty productCodes list and still requires canonical issuer membership. Business review must select scope and dates intentionally. Neither a source selection nor an add-on creates a charge or paid flag.\n\n```mermaid\nflowchart LR\n  Product[Product package version] --> Agreement[Retained agreement versions]\n  Pricing[Pricing price-row version] --> Agreement\n  Profile[Profile scoped actor] --> Agreement\n  Agreement --> Coverage[Current effective benefit coverage]\n  Coverage --> Search[Commerce Search]\n  Promotion[Canonical coupon issuer membership] --> Search\n  Eligible[Complete Product eligible set] --> Search\n  Search --> Order[Ordering before pagination]\n```\n\nInternal resolveBenefit(request, {agreementCode, enterpriseCode, benefitCode}) returns only currently effective coverage, without prices, history or financial evidence. It has no public HTTP route. Future amendments retain the current benefit until the effective boundary; an exclusive end removes coverage. authorizeBenefitPublication also checks agreement read authority and signed scope before Search publication. Search re-resolves coverage at query time, intersects it with Promotion issuer membership and the eligible Product set, and deduplicates repeated rules for the same agreement benefit. A benefit ending in December can stop boosting while its coupon and agreement remain otherwise valid.\n\n## Authority, conflicts and recovery\n\n| Case | Required operator action |\n| --- | --- |\n| Lost acknowledgement after a write | Retain the exact commandId, payload and actor; inspect history and explicitly replay identical intent. A committed replay returns the retained version without another append. |\n| Stale expectedRevision or concurrent amendment | Reload current history, compare terms and obtain a new explicit review. Never silently rebase or overwrite another amendment. |\n| Same commandId with changed terms | Reject; command identity cannot be reused for a different agreement. |\n| Missing owner, package/price version or signed scope | Repair the canonical dependency or authorized access. Do not substitute frontend facts or service identity. |\n| Version, benefit or record bound exceeded | Reject before persistence; do not discard old history or silently truncate benefits. |\n| Future effective amendment | Inspect recorded and effective time separately; recording does not make future coverage current. |\n\nAxis implements the exact commerce.agreements / commercialAgreement.history native binding: bounded search, retained history, reviewed creation and complete amendments. The optional agreementWorkspace CMS release supplies labels; the owner workspace response supplies policy choices and bounds. Missing copy or authority blocks the feature. The form clones the latest terms for amendment, freezes intent for confirmation, reconciles exact retained intent after uncertainty and does not retry automatically. Session, scope and connection replacement retire private drafts and late replies. Recovery in the mounted client is not a durable browser journal. Profile Super Admin status controls remain separate.\n\n## Configure and extend safely\n\nAll reusable mechanics and complete defaults belong in commercialAgreement/config/properties.js. Every policy read validates positive bounds, configured maximums, permissions and workspace page size; missing or malformed policy rejects without an inline replacement. Text limits cannot exceed maximumConfiguredBound, and workspace page size cannot exceed maximumPageSize. Customer/runtime layers supply intentional overriding values only; package, rate, model, payment, renewal, target and duration selections are governed records. The framework selects no commercial model, price or automatic renewal consent. Developers may extend owner service behavior through the normal later-layer contract while preserving signed admission, exact references, append-only persistence, generated concurrency and command recovery. Wire field names, fixed lifecycle vocabulary, version/revision types, canonical module identities, exact financial-reference formats and authorization invariants are structural contracts, not configurable business defaults.\n\n| Framework property | Current source default and meaning |\n| --- | --- |\n| maximumVersions / maximumBenefits | 500 retained versions / 100 benefits per complete terms record; overflow rejects. |\n| maximumSelectedProducts / maximumRecordBytes | 1000 explicit selected products / 1048576 serialized record bytes; no silent truncation. |\n| maximumPageSize / workspace.pageSize | 100 maximum / 25 workspace page size. Consumers read the owner projection rather than copy these defaults. |\n| readPermission / writePermission | commerce.agreement.read / commerce.agreement.manage; definitions do not assign grants. |\n| validation | Identifier pattern, text bound and maximum configured bound are defined and checked by the framework owner. |\n\nCommerce Search Core requiredModules includes commercialAgreement because Search resolves agreement benefits. Base Commerce does not require this optional capability; independent Commerce modules remain separately composable. Commercial Agreement has module index 76.15, before Commerce Search Core at 76.16. Composition is not runtime activation. Product, Pricing, Profile and qualified generated persistence must be present in the chosen deployment. The permissionCatalogue defines permission records without grants. Static header inspection omits tenants when CONFIG is absent; real import uses nConfig defaultTenant exactly, without redefining a default. Documentation is a separate optional CMS-record content pack and never records an agreement, publishes a Search rule or imports workspace presentation implicitly.\n\n## Common mistakes\n\n- Treating SUBSCRIPTION or INVOICE as an implemented recurring-charge or invoice workflow.\n- Changing current catalogue prices and expecting retained agreement prices to change.\n- Using generic CRUD, import or deletion to rewrite the history.\n- Counting duplicate Search rules as additional benefit purchases.\n- Assuming a linked financial record proves payment or an agreement changes Profile status.\n- Calling ACTIVE source metadata, permission definitions or passing unit tests a deployment or access grant.\n\n## Verification and source evidence\n\nRun the owner tests from the framework root with the command below. They use synthetic persistence and generated concurrency to exercise model/payment combinations, exact references, amendments, future timing, conflicts, replay, authority, malformed configuration and record bounds. The documentation test verifies canonical IDs, record references, hashes, preserved guide detail and content depth without importing CMS data. These are unit/source checks only; do not infer installed indexes, HTTP authorization or browser acceptance.\n\n```bash\nnode --test nodics.commerce/modules/baseCommerce/modules/commercialAgreement/test/*.test.js\n```\n\nOperators must separately qualify installed schema guards and unique indexes, real owner read permissions, original-token routes, optional CMS publication, authorized Axis discovery, index acknowledgement and cross-node recovery. Browser desktop/mobile review, focus, errors and session-loss behavior belong to final end-to-end acceptance. No live import, funding, provider, server or release action is part of these unit checks. Rollback of presentation uses the existing CMS lifecycle and does not delete agreements; operational correction is a new reviewed amendment, not history replacement.\n\nImplementation evidence is in src/service/defaultCommercialAgreementOperationService.js, src/service/defaultCommercialAgreementBackofficeCapabilityService.js, config/properties.js, test/commercialAgreementContract.test.js and llm/contracts/README.md. Frontend contributor detail belongs in nodics.exp/nodics.axis/src/operations/commercialAgreement/README.md. Search timing and issuer intersections belong to commerceSearchCore; the guide here remains the authority for agreement assignment, terms, history and benefit evidence.\n",
    "keywords": [
      "commercial-agreement",
      "Enterprise",
      "package",
      "amendment",
      "benefit",
      "Axis"
    ],
    "facets": {
      "section": "commerce-cart-and-checkout",
      "group": "commerce-cart-and-checkout",
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
      "maturityState": "partial"
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
    "lifecycleState": "DRAFT",
    "indexState": "INDEX_READY",
    "active": true
  }
};
