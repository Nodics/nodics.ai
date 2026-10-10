/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @description Generated Circa documentation navigation and article content. */
module.exports = {
  "record0": {
    "code": "circaDocumentationNavigation",
    "typeCode": "circaDocumentationNavigationComponentType",
    "renderer": "documentation.component.navigation",
    "accessMode": "PUBLIC",
    "properties": {
      "title": "Circa",
      "searchLabel": "Search Circa documentation",
      "searchPlaceholder": "Search eWaste journeys, presets, catalogue and knowledge",
      "emptyMessage": "No Circa documentation matches your search.",
      "sections": [
        {
          "code": "circa-guides",
          "title": "Circa Guides",
          "order": 10,
          "summary": "Reusable eWaste reference journeys, preset adoption and customer knowledge with explicit owner and live acceptance boundaries.",
          "accessMode": "AUTHENTICATED",
          "lifecycleState": "STAGED"
        }
      ],
      "items": [
        {
          "code": "circa.catalogue",
          "title": "Circa Shop and Coupons",
          "route": "/docs/circa-ewaste",
          "section": "circa-guides",
          "sectionTitle": "Circa Guides",
          "sectionOrder": 10,
          "group": "circa-guides",
          "groupTitle": "Circa Guides",
          "groupOrder": 10,
          "subgroup": null,
          "subgroupTitle": null,
          "order": 1,
          "parentId": "circa-guides",
          "hierarchyPath": [
            "Circa Guides",
            "Circa Shop and Coupons"
          ],
          "hierarchyDepth": 2,
          "documentType": "how-to",
          "audience": [
            "business-user",
            "architect",
            "administrator",
            "developer",
            "operator",
            "qa",
            "ai-tool"
          ],
          "businessAudience": [
            "business evaluator",
            "customer",
            "administrator"
          ],
          "technicalAudience": [
            "architect",
            "developer",
            "operator",
            "qa engineer",
            "ai tool"
          ],
          "summary": "Reusable eWaste published-offer composition, native versus full-catalogue boundaries, safe projection, bounded reads and project-owned customization.",
          "visibility": "public",
          "accessMode": "AUTHENTICATED",
          "publiclyAvailable": false,
          "requiresAuthentication": true,
          "allowedRoles": [],
          "allowedGroups": [],
          "allowedPermissions": [],
          "lifecycleState": "STAGED",
          "maturityState": "partial",
          "implementationState": "source-verified",
          "relatedPages": [
            "catalog.product-discovery-management",
            "commerce.cart-order"
          ],
          "searchKeywords": [
            "eWaste",
            "reusable accelerator",
            "catalogue",
            "source-reviewed"
          ],
          "topicKeywords": [
            "Circa Shop and Coupons",
            "eligibility limits",
            "owner authority",
            "customization"
          ],
          "searchText": "Circa Shop and Coupons Reusable eWaste published-offer composition, native versus full-catalogue boundaries, safe projection, bounded reads and project-owned customization. # Circa Shop and Coupons\n\nThis retained Circa topic teaches reusable eWaste catalogue composition to business evaluators, operators and application developers. It is not a Kickoff storefront runbook: /shop, /coupons, quick-view controls, ports and application-specific adapters are customer choices, not accelerator guarantees. For beginners, start with a controlled published offer and inspect read-only details before any purchase. Compare the native marketplace boundary with the separately selected catalogue service, then follow the canonical Product and Checkout references for price, availability and confirmed purchase authority.\n\n## Ownership and composition\n\nThe implementing eWaste module owns this optional referenceDocumentation pack, including its product, navigation, dashboard and four article records. The functional visibility boundary is nodics.accelerators; no customer application or grouping-only package owns these records. Select circadocs to import them separately from business data and the Framework library. Axis may discover reviewed STAGED product metadata by its exact Site and authorized initialization profile. Discovery is not publication: the owner must report READY after normal CMS and required Media approvals before the reader contacts Online. DRAFT, retired, inactive, non-public or ambiguously bound products stay unavailable. Shared Product, Checkout, Location and Waste detail is linked rather than copied, and each linked target requires its own publication and access qualification.\n\nAn operator diagnosing an empty catalogue should check the configured store, published Product owner response and matching Waste asset descriptors before changing storefront presentation. Preserve the exact kind and selector evidence, distinguish an unconfigured empty marketplace from a bounded-scan failure, and avoid replaying purchase commands while diagnosing a read-only listing.\n\nDefaultEWasteCatalogueService composes published Product discovery/detail with current Waste asset descriptors. DefaultEWasteMarketplaceService owns shared offer projection and the existing purchase/bid handoff. Neither catalogue read writes a product, price, asset owner, order, wallet or entitlement. Commerce retains publication, pricing, checkout and coupon authority; Waste retains assets and descriptors. Customer branding, storefront routes and presentation belong outside the accelerator.\n\nRead [Product discovery and management](/docs/framework/catalog-product-discovery-management#catalogProductDiscoveryManagement-2-journey-and-ownership), document catalog.product-discovery-management owned by product, for the published Product boundary. Use [Cart and Order](/docs/framework/commerce-cart-order#commerceCartOrder-5-security-and-failure-behavior), document commerce.cart-order owned by checkoutCore, for authoritative checkout. These references do not install either optional documentation pack or grant business access.\n\n## Public endpoints\n\nThe current native route is GET /nodics/eWaste/v0/marketplace. It delegates through DefaultEWasteExperienceController and the trusted DefaultEWasteRequestService to DefaultEWasteMarketplaceService.list. This list reads one Product discovery page of up to 100 products; without a configured eWaste.marketplace.storeCode it returns empty asset/coupon arrays. It does not expose the complete filtered catalogue contract.\n\nDefaultEWasteCatalogueService.catalogue(request) and product(request) are reusable service operations, not native /catalogue HTTP routes. A later application controller must explicitly select this service through the existing trusted mapper and define its own route/security contract. Request payloads must never select the service name, store, tenant, owner transport or locale. The Product transport selects the configured store and locale en.\n\nFor catalogue(request), kind must be ASSET or COUPON. Flat string selectors are q, category, condition, issuer, minPoints, maxPoints, validUntil, sort, page and pageSize. Sort choices are FEATURED, POINTS_ASC, POINTS_DESC, NAME, and coupon-only EXPIRY; code breaks ties. FEATURED currently means code order, not a merchandising-rank field. validUntil is a UTC date floor on expiresAt, not an extension of purchased rights. Invalid scalars, dates and inverted ranges fail before owner reads.\n\nproduct(request) validates code syntax and exact kind, reads the Product directly and reruns the offer checks independently of listing state. Invalid references return 400; unavailable or cross-kind references return 404. Browsing never authorizes a later purchase: the owner must recheck the displayed revision, real price and stable command at checkout.\n\n## Reference deployment bounds\n\nThe catalogue service, when explicitly selected, traverses Product pages in batches of 100 by default, with eWaste.catalogue.maximumProducts 2000, pageSize 12 and maximumPageSize 48. It derives exact filtered totals and slices the requested page after joining offers. Facets describe the complete eligible kind before the remaining query filters, not an independently queried global store index. page is capped at 10000 and then clamped to the last result page; invalid oversized pageSize is rejected rather than silently clamped.\n\nDuplicate product codes/repeated pages or more than maximumProducts fail with status 503 instead of reporting a truncated count. Cancellation is checked between Product pages and returns 499; it is not an abort guarantee for every in-flight owner call. Asset joins run in batches of ten. Reads are repeated for each request, but multiple owner reads are not one atomic catalogue snapshot. A concurrent price or owner change still requires command-time validation.\n\nDo not infer these full traversal guarantees for the native one-page marketplace. Larger deployments need qualified Product/Search projections and owner integration, not an indefinitely increased scan limit or a frontend download of every product.\n\n## Product content\n\nShared offer projection accepts ASSET/COUPON only, matching configured currency, a finite positive unitAmount and a nonexpired expiresAt when supplied. An asset reference must resolve to a not-explicitly-inactive LISTED Waste asset with no conflicting marketProductCode. Bid availability additionally binds the Product owner/source references to that asset. These are current source checks, not a complete legal, merchant or physical-condition eligibility decision. available defaults true unless Product explicitly reports false; it is a DTO value, not proof of admitted inventory.\n\nOffer text comes only from published localized terms, eligibility, exclusions, redemptionInstructions and purchaseConditions. Strings/arrays are bounded to thirty lines of at most 4000 characters per field; missing copy becomes an empty array, not invented terms. The safe descriptor suppresses its private photo. Gallery projection deduplicates HTTP(S) or single-slash relative URLs; URL-shape filtering is not host validation or independent Media publication proof. The Product/Media owner and consumer must qualify delivery and exclude private originals.\n\n## Validation\n\nSource contracts eWasteCatalogueDiscovery.test.js and eWasteCatalogueContract.test.js cover multi-page filtering, exact totals, direct detail, bad selectors, unavailable assets, copy/media projection and overflow. Their fixtures are not merchant, stock or live payment evidence. The commands below are verification guidance, not a report of tests executed in this editorial review.\n\n## Audience and Ownership Checks\n\nBusiness evaluators can assess bounded read composition without assuming a complete marketplace installation. Business users inspect price, currency, validity and provided terms before a separate confirmed purchase. Administrators bind the store and owning APIs; operators distinguish an empty unconfigured marketplace from a 503 scan failure. Developers/AI tools preserve trusted mapping and read-only behavior. Framework maintainers qualify owner integration and concurrency rather than copying Commerce logic.\n\n```mermaid\nflowchart LR\n  Request[Trusted read context] --> Choice{Selected backend service}\n  Choice --> Native[Native marketplace: one page]\n  Choice --> Full[Explicit catalogue: bounded traversal]\n  Native --> Offer[Product and current Waste offer projection]\n  Full --> Offer\n  Offer --> Read[Read-only response]\n  Read --> Checkout[Separate Commerce checkout validation]\n```\n\n| Observation or failure | Meaning and safe response |\n| --- | --- |\n| Empty native marketplace | Check configured store and published Product source; do not manufacture offers. |\n| 503 duplicate/limit failure | Preserve the failure; correct owner pagination or qualify scale before retry. |\n| 404 detail | Refresh the current kind/listing; do not reuse stale availability. |\n| Cancelled purchase review | Send no purchase command; a read result is not an order. |\n\n## Customize and extend safely\n\nPrerequisites: a later-loaded customer module with eWaste inheritance, a trusted catalogue controller, valid store/currency configuration and published Product reads. In that project's config/properties.js, change only the browsing difference below. DefaultEWasteCatalogueService reads eWaste.catalogue; this does not change native marketplace pagination or publish anything.\n\n```javascript\nmodule.exports = {\n  eWaste: { catalogue: { pageSize: 24 } }\n};\n// Later project config/properties.js: maximumPageSize remains inherited at 48.\n```\n\nWith the catalogue service selected and no pageSize selector, a result page contains at most 24 offers and retains exact filtered totals. pageSize='49' still rejects under inherited limits. A trusted project src/controller adapter may call DefaultEWasteRequestService.invoke('catalogue', request, callback, 'DefaultEWasteCatalogueService'); choose that service literal on the server and retain route permissions/exposure. Customer routes and renderer state remain project-owned. Do not copy the scanner or bypass safe offer projection.\n\nTo recover, restore the prior project delta and requalify effective configuration and controller mapping; do not reset Product/Waste state. Test default plus overridden page size, denied/invalid input, scale failure and command-time checkout validation. Changing thresholds cannot turn an unavailable asset into an eligible sale.\n\n## Common Mistakes\n\n- Assuming native /marketplace is the full catalogue service or a snapshot-consistent inventory query.\n- Accepting caller-selected stores, service names or ownership context.\n- Treating a published title, available flag or URL as merchant qualification, real stock or Media authorization.\n- Inventing missing coupon terms or treating purchase cancellation as confirmation.\n\n## Verification\n\nRun the independent owner contracts before release and add application-controller mapping tests for the actual selected service. Cover a second Product page, duplicate codes, exactly/over 2000 products, bad filters before reads, wrong kind, changed owner/revision, missing store, private-photo suppression and unavailable-image presentation. Separately qualify authenticated checkout, publication, admitted stock and actual merchant redemption in an authorized test deployment. None was performed here.\n\n```bash\n# Source contract guidance only; not executed by editorial review.\nnode --test test/eWasteCatalogueDiscovery.test.js test/eWasteCatalogueContract.test.js\n```\n\nAn active authoring route makes a guide selectable for normal publication; it does not grant Process approval or establish live customer acceptance. Release tooling must refresh integrity metadata before import, and authorized reviewers must follow the normal CMS and Media publication workflows.\n"
        },
        {
          "code": "circa.customer-journey",
          "title": "Circa customer journey",
          "route": "/docs/circa-ewaste/circa-customer-journey",
          "section": "circa-guides",
          "sectionTitle": "Circa Guides",
          "sectionOrder": 10,
          "group": "circa-guides",
          "groupTitle": "Circa Guides",
          "groupOrder": 10,
          "subgroup": null,
          "subgroupTitle": null,
          "order": 2,
          "parentId": "circa-guides",
          "hierarchyPath": [
            "Circa Guides",
            "Circa customer journey"
          ],
          "hierarchyDepth": 2,
          "documentType": "how-to",
          "audience": [
            "business-user",
            "architect",
            "administrator",
            "developer",
            "operator",
            "qa",
            "ai-tool"
          ],
          "businessAudience": [
            "business evaluator",
            "customer",
            "administrator"
          ],
          "technicalAudience": [
            "architect",
            "developer",
            "operator",
            "qa engineer",
            "ai tool"
          ],
          "summary": "Reusable eWaste customer, evidence and review orchestration with explicit arrival wiring, limited eligibility, real reviewer policy and separate live acceptance gates.",
          "visibility": "public",
          "accessMode": "AUTHENTICATED",
          "publiclyAvailable": false,
          "requiresAuthentication": true,
          "allowedRoles": [],
          "allowedGroups": [],
          "allowedPermissions": [],
          "lifecycleState": "STAGED",
          "maturityState": "partial",
          "implementationState": "source-verified",
          "relatedPages": [
            "location.shared-map-configuration",
            "catalog.product-discovery-management",
            "commerce.cart-order",
            "order.management-lifecycle",
            "commerce.returns-refunds",
            "waste.impact-providers"
          ],
          "searchKeywords": [
            "eWaste",
            "reusable accelerator",
            "customer-journey",
            "source-reviewed"
          ],
          "topicKeywords": [
            "Circa customer journey",
            "eligibility limits",
            "owner authority",
            "customization"
          ],
          "searchText": "Circa customer journey Reusable eWaste customer, evidence and review orchestration with explicit arrival wiring, limited eligibility, real reviewer policy and separate live acceptance gates. # Circa customer journey\n\nCirca is retained as this documentation family's stable identity. This guide describes the reusable eWaste orchestration available to any customer application; customer-specific topology, passwords, cohort data, policy roots and historical live results are deliberately not framework instructions.\n\n## Connected eWaste customer journey\n\nThis is a reusable adoption and assurance journey, not evidence that a particular Circa installation passed. Source review identifies operations and their limits. The connected sequence must still be qualified with real customer and employee sessions, configured providers, current centre eligibility, actual owner receipts and approved deployment policy.\n\n## Scope and authority\n\neWaste owns reusable electronic-waste orchestration, not a parallel domain database. Waste stores submissions, reviews, assets, physical receipts and ownership events; Profile owns identity and operational scopes; Media owns original evidence; Copilot supplies advisory language/extraction; Loyalty owns balances and ledger entries; Commerce owns products, prices, stock, orders and entitlements; Location owns geographic records and distance arithmetic. An application owns its name, deployment, presentation and intentional policy deltas.\n\nEnvironmental providers are selected in effective Waste Impact configuration. The accelerator contains optional OpenAI and WARM adapters; their presence does not prove either is selected, reachable or locally applicable. Preserve source geography, factor/version and weight bounds. A prospective estimate, reference proxy or carbon label is not a certified credit, measured treatment or achieved recycling.\n\n## Compose the required owner topology\n\nCompose the customer's existing runtime graph and required owner connections; no fixed port, application checkout, model name or all-server start command is part of this accelerator. Catalogue/checkout additionally need the appropriate Commerce owner; channel entry needs Profile policy; photo preparation needs Waste, Media and analysis services. Geographic projections use Location-owned reads, while distance arithmetic is imported as a dependency-free helper rather than requiring Location services inside Waste.\n\nUse the source-backed readiness operation GET /nodics/eWaste/v0/readiness/acceptance with its configured staff/service authorization. It reports local service/configuration and masked credential-presence prerequisites; it sends no provider calls and runs no customer workflow. READY is not live acceptance, and the Telegram/OpenAI-oriented report is not a universal validator for all deployments. Resolve owner blockers without printing secrets or borrowing customer authority.\n\n## Governed sample import\n\nReusable reference presets are selected separately from customer samples and documentation. eWaste:core-reference currently selects core-v001 version 0.0.1 explicitly for Waste destinations. The optional referenceDocumentation CONTENT_PACK targets WCMS Staged and contains these four guides plus navigation. Neither selection installs customer identities, balances, issued coupon codes or customer transaction history.\n\n| Selection | Authority and scope | Not established |\n| --- | --- | --- |\n| eWaste:core-reference | eWaste presets into existing Waste schemas via nImport | Customer setup, accepted item at a centre or live reward policy |\n| referenceDocumentation | Optional canonical CMS guide pack to WCMS Staged | Business data installation, Process approval or public delivery |\n| Customer releases | Explicitly selected project-owned records and exact owner destinations | Automatic stock admission, legal consent or whole-journey acceptance |\n\nFollow llm/contracts/reference-compatibility.md for exact expectedReleases selection, dependency receipts, source-root/key/header alignment and installed adoption. An authenticated import preflight is not a completed row import. Retain destination receipts and original evidence. Never replay sample wallets, balances, ownership events or single-use codes over customer activity.\n\n### Restore the collection network after a local reset\n\nRestore only explicitly selected collection/Profile/Location releases through existing nImport owner operations after inspecting installed state. Do not create copied centre records, write the database directly or assume server startup restores data. Actual coordinates and addresses belong to Location/Profile, while collection status and acceptance belong to Waste.\n\nPublic eWaste experience queries active=true, operatingStatus=ACTIVE and publicVisibility=PUBLIC, with at most 100 centres in its current request. Missing enrichment is reported in unavailableSources; arrival removes centres without finite ACTIVE Location coordinates. This is a bounded public discovery set, not every centre or an item-specific eligible network.\n\nThe fresh-arrival service chooses nearby centres by distance, not by evaluating wasteCollectionAcceptanceRule or opening hours. Waste validateFacts separately checks active taxonomy, allowed family, current centre operating/public status and metadata.acceptedCategoryCodes when an array exists. A missing array imposes no category restriction in this path; that helper also does not independently check centre.active. Do not describe these checks as complete item-specific eligibility, full preset-policy evaluation or guaranteed opening hours. Qualify any stronger requirement through its owning collection integration before launch.\n\nFor geographic display and provider configuration, use [Shared Map Configuration](/docs/framework/location-shared-map-configuration#locationSharedMapConfiguration-2-providers-coordinates-and-safe-presentation), document location.shared-map-configuration owned by locationMap. Map selection and directions never prove arrival or physical custody.\n\n## Commerce publication\n\nImport is not publication. Published Product and policy delivery, Promotion-issued rights and Inventory-admitted stock remain separate owning-domain decisions. Use [Product management](/docs/framework/catalog-product-discovery-management#catalogProductDiscoveryManagement-5-operations-and-governance) and [Cart and Order](/docs/framework/commerce-cart-order#commerceCartOrder-4-operator-and-devops-guidance) rather than copying Commerce publication commands, roots or approval scripts into an accelerator guide.\n\neWaste.marketplace.autoPublishListings defaults false. A selected later policy may enable the existing listing orchestration, but source configuration is not a publication receipt or customer-visible discovery proof. Preserve the configured orderCodePrefix across upgrades/retries. Never restore unqualified projection snapshots or synthesize approval evidence to clear a demonstration blocker.\n\n## Walk through the experience\n\n1. Use a controlled Profile customer account and verify its owner-scoped read, not just successful login.\n2. Read the live public centre projection and item policy. In a fresh-arrival application, obtain new device coordinates and choose the supported nearby centre through the explicitly wired journey adapter.\n3. Prepare a bounded photo. The accelerator accepts canonical base64 JPEG/PNG/WebP up to the inherited 5242880-byte limit; it analyzes before Media/submission persistence. Recognition fallback is a held manual-review path, not a confident classification.\n4. Inspect the saved draft, retained original photo, known/unknown facts and assessment limits. Customer edits are restricted to name and description; classification, quantity, measurements and environmental properties are business-reviewed.\n5. Confirm explicitly with the current revision and stable command reference. Read the canonical acknowledgement/status before retrying an uncertain result. A saved draft or receipt is not physical deposit.\n6. Have appropriately authorized staff CLAIM, verify, reread the persisted QUEUE handoff and revision, then CLAIM again before approval/rejection, including a same-employee decision where policy permits. Inspect original evidence and public feedback. Approved status is not proof of completed reward settlement.\n7. Inspect the persisted confirmed reward assessment and actual Loyalty references. A missing published Rules policy must not invent value.\n8. Only then exercise optional gift/listing/purchase flows through their existing owners. Digital ownership transfer does not prove physical transport, inspection or fulfillment.\n\n## Shared journey service and channel boundaries\n\nDefaultEWasteJourneyService implements previewArrival, arrival, prepareSubmission, attachPhoto, analyzePhoto, prepare and confirm over Waste owners. Its effective policy requires positive numeric arrivalRadiusMetres, maximumPositionAgeMs and captureTimeoutMs, plus integer nearestCentreCount at least three. Framework defaults provide 60000 ms freshness, 12000 ms capture timeout and three centres, but no radius. Missing radius fails ERR_EWASTE_JOURNEY_UNAVAILABLE; a 100-metre application setting is not a universal default.\n\nThe service uses inclusive unrounded direct distance. Observations at the maximum age are accepted, and up to 5000 ms future skew is accepted; beyond either bound returns ERR_EWASTE_POSITION_STALE. Invalid coordinates/timestamp return ERR_EWASTE_POSITION_INVALID. Accuracy is optional metadata, with invalid/missing mapped to null; it is not an arrival gate. Device coordinates are client observations, not tamper-proof presence proof. captureTimeoutMs is projected policy for the host; it does not itself time out the device capture.\n\nCrucial wiring boundary: DefaultEWasteExperienceController uses DefaultEWasteRequestService's default DefaultEWasteExperienceService, whose confirm directly delegates to Waste. Native eWaste routes do not automatically select the fresh-arrival service or expose previewArrival. An application must wire a trusted controller/adapter to the supported Journey service before promising arrival enforcement. Body-provided service, distance, origin or arrival assertions confer no authority.\n\nIn that wired journey, preview writes no Waste record, early empty-draft creation rejects, and attaching/confirming rechecks stored observation against current centre coordinates. Rejected checks retain saved evidence. Changing centre clears derived estimate/confirmation revision. Completed same-command confirmation replays the existing result before a new arrival check; do not interpret a replay as a new current-presence observation.\n\n### Local Telegram launch recovery\n\nThe application host owns its HTTPS entry points and device adapters; no tunnel URL or bot endpoint is embedded in this reusable guide. eWaste channelAuthentication defaults disabled. Enabled channels require a configured Profile application and proof validation. Profile owns signatures, links and the one-use browser handoff; a signed launch is not a customer access token.\n\nOn lost/expired handoff, request fresh entry. Unlinked accounts use the shared account form; link conflicts must not transfer account ownership. Explicit logout must leave the form usable without an automatic sign-in loop. Keep credentials in private runtime configuration. Native Telegram location/camera behavior, real channel delivery and a future WhatsApp adapter need separate acceptance; emulated WebView or browser GPS proves none of them.\n\n## Evidence and current state\n\nThis source review does not verify any installed count, customer balance, private test run, provider response or browser result. Historical test-count and local-session narratives are not current reusable guarantees. Preserve original owner evidence in its actual authorized test context, not as a blanket acceptance claim in this guide.\n\nSource fixtures cover independent arrival policy, catalogue bounds, guidance history, preparation, scoped review and settlement. Tests were inspected, not executed here. Distinguish source correctness, installed import, reviewer eligibility, signed-in channel acceptance, approval, settlement, notification delivery and physical receipt. A CURRENT import status alone must be read alongside the actual run work/outcome; a zero-work import does not prove records were installed.\n\nExisting paginated /review-workspace source supports scoped counts/detail, employee assignment and explicit recovery. Its presence corrects older statements that every history/count or assignment workflow is absent, but does not certify complete Axis screens or reviewer/live acceptance. The legacy /reviews queue still takes 100 visible entries from 500 candidates; do not call that an exhaustive audit export.\n\n## Deployment gates\n\n- Qualify item-specific collection acceptance and opening-hour policy; distance and public visibility alone are insufficient.\n- Qualify actual reviewer claims, Profile scopes, verification/approval policy, role separation and private evidence access with distinct authorized sessions.\n- Qualify selected analysis/environmental providers and keep unknowns, source provenance and manual holds visible.\n- Qualify merchant consent, issued coupon rights, operational stock, payment and refunds through Commerce owners.\n- Keep camera/location on physical devices, source-channel delivery, accessibility and distributed crash/reconciliation acceptance separate.\n- Submission, approval, physical receipt, completed recycling and certified environmental claims require different evidence.\n\n## Domain accelerator consolidation\n\nThe canonical reusable domain boundary is eWaste and /nodics/eWaste/v0 with capability-owned exposure policy. Application composition and frontend routes are not new framework authorities. Later layers use CONFIG.eWaste for supported domain deltas and their own namespaces for branding. Do not introduce a second submission, wallet, coupon, location or accelerator identity.\n\nPreserve installed applicationCode, orderCodePrefix, assessment identities and original command references through upgrades. Source reorganization is not authorization to reimport business transactions, relabel historical environmental results or reset ledgers. Packaging, integration and deployment must be qualified separately.\n\n## Operational roles and independent approval\n\nProfile owns real employee identity and scopes; imported role names or fictional personas are not reviewer eligibility. Waste requires a human principal with the exact operation grant. waste.operations.requireScopes, requireVerification and requireDifferentApprover default false in shared source. Enable the intended policy explicitly in a later deployment and qualify it before claiming scoped or independent review.\n\n| Operation | Required backend grant | Additional source boundary |\n| --- | --- | --- |\n| Read queue/detail | waste.review.queue.read | Effective scope, not frontend visibility |\n| Read original evidence | waste.review.evidence.read | Separate private-evidence authorization |\n| Verify facts | waste.verification.record | Claim, explicit confirmation and revision; no asset/reward |\n| Approve/reject | waste.review.approve | Claim and configured verification/separate-actor checks |\n| Audit | waste.audit.read | Read-only evidence, not mutation authority |\n\nCurrent /review-workspace/:code/assignment supports confirmed CLAIM/RELEASE for the caller's own employee identity, current expectedRevision and stable command. The mandatory sequence is CLAIM -> verify -> QUEUE -> reread revision -> CLAIM -> approve/reject. Verification persists a QUEUE handoff and leaves the submission UNDER_REVIEW; it does not retain the employee claim or approve the item. Reread the current owner detail and revision after verification, then submit a new, explicitly confirmed CLAIM command before the decision. This applies even when the same reviewer has both verification and approval grants and requireDifferentApprover is false. Pass the current expectedRevision on every mutation and use a distinct stable idempotency key for each new command. Reread again after the second CLAIM so the decision uses its acknowledged revision. An unclaimed decision rejects with ERR_WASTE_ASSIGNMENT_REQUIRED; a different employee claim rejects with ERR_WASTE_ASSIGNMENT_CONFLICT. A stale revision requires readback and reconciliation, not a guessed increment or a new verification. A completed verification replay remains idempotent but does not restore a claim. If separation of duties is enabled, only a different currently authorized employee may make the second claim and decision. Recovery of an already saved decision follows the original owner command and is not a fresh approval. A queue label assigned during customer confirmation is not an employee claim. The detailed owner-reviewed sequence and rejection/recovery table are in [review and decision flow](/docs/framework/accelerators/circa/operations#acceleratorsCircaOperationsRewards-2-review-and-decision-screen-flow); this reference guide does not replace the Waste owner contract.\n\nWith scopes enabled, Waste resolves /identity/scopes/me using the employee bearer and preserves deny semantics; missing owner resolution blocks access. Verification cannot change the assigned centre. Final rejection needs a reason, and requireVerification prevents approval from silently rewriting verified facts. When requireDifferentApprover is true, the verifier cannot make the final decision; otherwise a human with both grants may do both with distinct evidence. Neither state is implied by this editorial staging.\n\nFor uncertain decisions, refresh the record and use the owning recovery action with original command/evidence. Do not start a new decision or settle again just to clear pending status. Notifications use recorded immutable outcome/comment and Communication-owned intent/delivery; a delayed message does not undo approval and must not cause a blind decision replay.\n\n## Negotiated purchases and merchant operations\n\neWaste consumes Commerce bidding and checkout for eligible asset provenance/store, and delegates merchant claim and order-review operations. Customer-specific bid validity, prices, partner terms and merchant adapters are not accelerator defaults. Holds, payment and accepted quotes stay Commerce-owned; ownership changes only after its completed result.\n\nA request for cancellation/refund/dispute is a case, not a finished refund. Use [Order management](/docs/framework/order-management-lifecycle#orderManagementLifecycle-5-operations-and-governance), document order.management-lifecycle owned by order. Do not duplicate its policy/reviewer/receipt instructions here or infer external POS/physical fulfillment from a local provider result.\n\n## Enterprise merchant fulfillment and refunds\n\nProfile owns issuing-enterprise employee qualification; Commerce owns merchant authorization, entitlement redemption and refund decisions. eWaste's service-only reversal port checks original completed sale/current buyer and recoverable original proceeds/carbon before restoring digital ownership. Original submission rewards are not revalued. An onward transfer or unavailable recovery requires manual resolution, not a fabricated success.\n\nSee [Returns and Refunds](/docs/framework/commerce-returns-refunds#commerceReturnsRefunds-10-return-receipt-and-reversal-calculation-coverage), document commerce.returns-refunds owned by order, for the authoritative lifecycle. This guide makes no current merchant receipt, actual delivery, refund or whole-owner financial qualification claim.\n\n## Account and channel ownership\n\nCustomer self-resolution uses the authenticated Profile bearer and canonical login, not request-body owner selectors or an employee token. Account workspace reads remain owner-scoped. Channel policy chooses a server-configured application; Profile owns proof validation, canonical links and browser handoff/session security. A matching email, name or channel ID is not proof of account ownership.\n\nEnvironmental assessment and advisory recognition are separate stages. Customers may correct only their allowed text fields; staff validates classification and measurements. A valid INPUT_ONLY assessment may satisfy the configured partial-coverage contract, but missing, failed, mock or empty environmental assessment cannot confirm a mandatory eWaste submission. Preserve the limitation and resolve the actual provider/input error instead of inventing carbon. Later assessment history/selection never revalues an existing reward settlement. Use [Waste Impact providers](/docs/framework/waste-impact-providers#wasteImpactProviders-8-environmental-properties-and-credit-status), owned by wasteImpact, for those evidence semantics.\n\n## Audience and Ownership Checks\n\nBeginners follow one controlled item from public centre information to saved acknowledgement. Business evaluators assess the separation of advisory, digital and physical outcomes. Administrators choose real policy and identity assignments; operators retain owner results before retry. Developers, QA and AI tools prove trusted service selection, current eligibility and rejected paths. Maintainers preserve source authority and separate application adoption from reusable defaults.\n\n```mermaid\nflowchart TD\n  Adapter[Qualified trusted journey adapter] --> Arrival[Fresh observation and current centre]\n  Arrival --> Photo[Bounded private photo and advisory analysis]\n  Photo --> Draft[Saved editable draft and assessment limits]\n  Draft --> Confirm[Explicit customer confirmation]\n  Confirm --> Ack[Waste acknowledgement]\n  Ack --> ClaimForVerification[Authorized employee CLAIM]\n  ClaimForVerification --> Verify[Save verified facts]\n  Verify --> QueueHandoff[Persisted QUEUE handoff]\n  QueueHandoff --> CurrentRevision[Reread current revision]\n  CurrentRevision --> ClaimForDecision[Second CLAIM even same reviewer]\n  ClaimForDecision --> Decision[Approve or reject with claim revision]\n  Decision --> Settlement[Separate confirmed reward and Loyalty evidence]\n  Decision --> Physical[Separate physical receipt evidence]\n```\n\n| Failure | Recovery boundary |\n| --- | --- |\n| Missing radius / stale observation | Correct project policy or reacquire location; retain saved photo. |\n| Item not accepted | Choose a genuinely accepting centre through current owner policy; do not change facts to bypass rejection. |\n| Reviewer claim/scope denied | Resolve actual authorized assignment; never borrow an account. |\n| Settlement or notification pending | Inspect original owner evidence and recover that operation only. |\n\n## Customize and extend safely\n\nPrerequisites: a later-loaded customer module with eWaste inheritance, working owner transports and a trusted controller explicitly wired to DefaultEWasteJourneyService for the fresh-arrival operations. In the customer's config/properties.js, set only the intentional policy differences below. These are illustrative customer decisions, not universal safe distances or a complete deployable module.\n\n```javascript\nmodule.exports = {\n  eWaste: { journey: { arrivalRadiusMetres: 150 } },\n  waste: { operations: {\n    requireScopes: true,\n    requireVerification: true,\n    requireDifferentApprover: true\n  } }\n};\n```\n\nThe Journey service then inherits 60000/12000 ms technical limits and three centres. A reported point exactly 150 metres away qualifies; 150.00001 does not. Missing/nonfinite/string radius fails before arrival. Verified facts need a different eligible human approver under this policy, with real Profile scope and assignment handoff. Configuration alone neither wires native routes nor grants staff permission.\n\nUse project-owned src/controller and a small loader-visible src/service adapter to select the supported service on the server; do not copy arrival math, scope evaluation, schemas or review persistence. Test effective defaults plus deltas, trusted mapping and rejected operations before replacing prior project policy. Roll back only the deliberate policy/adapter difference; retain drafts, photos, assessments, commands and ledgers. Stricter policy may leave existing open work needing an authorized handoff, never a database reset.\n\n## Common Mistakes\n\n- Calling raw eWaste confirm and assuming a fresh-arrival adapter was selected.\n- Treating a map marker, accepted-category template or missing restrictions as complete eligibility.\n- Claiming independent review with shared defaults or a queue label instead of a real employee claim.\n- Replaying wallets, decisions, single-use coupons or approval rewards to repair a demonstration.\n- Treating readiness, CMS staging/publication, emulated GPS or historic checks as current live acceptance.\n\n## Verification\n\nFuture qualification must cover default/missing/custom radius, exact distance and time boundaries, optional accuracy, invalid/moved/disabled centres, stale revision, completed replay, unknown taxonomy, manual hold, private photo and cross-customer denial. Exercise reviewer claim conflicts, scopes and both independent/same-actor policy modes with real separate accounts. Then qualify settlement, notification and channel/browser behavior independently. No runtime, import, test or browser command was executed by this source review.\n\n```bash\n# From the eWaste module; source-test guidance, not executed here.\nnode --test test/eWasteJourneyService.test.js test/eWastePreparation.test.js test/eWasteCollectionVisibilityContract.test.js\n```\n\nSTAGED authoring and an active route enable publication selection. They do not establish Process approval, an Online version or qualification of eligibility, reviewer or customer operations. Refresh source counts and integrity metadata before import, then follow normal publication and separately qualify the business journey.\n"
        },
        {
          "code": "circa.demo-data",
          "title": "Circa demonstration dataset",
          "route": "/docs/circa-ewaste/circa-demo-data",
          "section": "circa-guides",
          "sectionTitle": "Circa Guides",
          "sectionOrder": 10,
          "group": "circa-guides",
          "groupTitle": "Circa Guides",
          "groupOrder": 10,
          "subgroup": null,
          "subgroupTitle": null,
          "order": 3,
          "parentId": "circa-guides",
          "hierarchyPath": [
            "Circa Guides",
            "Circa demonstration dataset"
          ],
          "hierarchyDepth": 2,
          "documentType": "how-to",
          "audience": [
            "business-user",
            "architect",
            "administrator",
            "developer",
            "operator",
            "qa",
            "ai-tool"
          ],
          "businessAudience": [
            "business evaluator",
            "customer",
            "administrator"
          ],
          "technicalAudience": [
            "architect",
            "developer",
            "operator",
            "qa engineer",
            "ai tool"
          ],
          "summary": "Reusable eWaste preset inventory, explicit nImport adoption, aligned customer deltas and recovery without replaying customer history or inventing owner qualification.",
          "visibility": "public",
          "accessMode": "AUTHENTICATED",
          "publiclyAvailable": false,
          "requiresAuthentication": true,
          "allowedRoles": [],
          "allowedGroups": [],
          "allowedPermissions": [],
          "lifecycleState": "STAGED",
          "maturityState": "partial",
          "implementationState": "source-verified",
          "relatedPages": [
            "catalog.product-discovery-management",
            "commerce.cart-order"
          ],
          "searchKeywords": [
            "eWaste",
            "reusable accelerator",
            "demo-data",
            "source-reviewed"
          ],
          "topicKeywords": [
            "Circa demonstration dataset",
            "eligibility limits",
            "owner authority",
            "customization"
          ],
          "searchText": "Circa demonstration dataset Reusable eWaste preset inventory, explicit nImport adoption, aligned customer deltas and recovery without replaying customer history or inventing owner qualification. # Circa demonstration dataset\n\n## Reusable reference and customer demonstration\n\nFor beginners, separate the reusable eWaste presets from a customer's demonstration records before importing anything. Read the inventory and dependency tables, select only the intended release and destination, and validate its reference closure with fictional approved fixtures. Keep optional documentation receipts separate from business receipts. Never replay sample balances, staff identities or ownership transactions over an environment with real history.\n\nThis retained Circa topic teaches how to adopt reusable eWaste reference data without mistaking it for an installed customer demonstration. The accelerator's core reference presets and optional documentation pack are separate selections. Customer enterprises, staff, outlets, sample assets, wallets and offers stay in their owning customer backend; they are not distributed by these four guides.\n\nFresh Circa demo staffing is predefined reviewed release data, not manual runtime group wiring. Select circa.ewaste:circaCommerceStaffAssignments alongside its prerequisite Profile role definitions, original demo identities and the separate circa.ewaste:circaMerchantOutletAccess Store scopes. The pack adds reviewed responsibilities to existing employees through Profile; it does not provision credentials or authorize seller consent, financial funding or production use. CURRENT dependencies must be verified and skipped. Refresh an affected session after an authorized role change. See the canonical [source release and staff inventory](/docs/framework/accelerators/circa/source-inventory#acceleratorsCircaSourceInventory-10-issuer-setup-and-publication) for exact role selections, seven-employee responsibility mapping and recovery boundaries. Customer-specific staffing remains customer-owned.\n\nProfile owns identity/permission operations, Location coordinates, Waste collection/taxonomy/lifecycle, Loyalty balances/ledger, Commerce products/coupons/stock and WCMS/Media presentation. Reusable eWaste supplies presets that target those existing Waste schemas, not another importer or a new customer business authority. No application-specific cohort, account password, exchange rate or merchant participation is established here.\n\n## Dataset Inventory\n\n| Canonical source | Reusable contribution | Not implied |\n| --- | --- | --- |\n| core-v001/records/waste/eWasteFamilyData.js | ELECTRONICS and BATTERY families | Customer enterprise or tenant creation |\n| eWasteCategoryData.js and eWasteItemTypeData.js | Ten categories and fourteen item types with related evidence/impact references | Complete live item acceptance or a dynamic form engine |\n| eWasteCollectionPresetData.js and eWasteAcceptanceRuleData.js | Four collection presets and eight type/category rule templates | Installed collection locations or proof every journey evaluates those rules |\n| eWasteEvidencePolicyData.js and eWasteVerificationPolicyData.js | Evidence declarations and standard verification preset | Actual human eligibility, scope or completed review |\n| eWasteImpactProfileData.js | Four profiles, including neutral external estimate and battery count | Activated provider, certified carbon or measured diversion |\n| data/docs-v001/records/documentation/circaDocumentation* | Four reusable guides and pack navigation | Business release selection, issued coupons, stock or wallets |\n\nThe selected neutral profile EWASTE_ENVIRONMENTAL_ESTIMATE declares publicClaimAllowed=false and ADVISORY_SUBMISSION_GATE. Most electronics category/item references use it; battery references retain EWASTE_BATTERY_COUNT. Collection presets can retain their own distinct impact/receipt references, so do not rewrite every profile identity as if it were one universal rule.\n\nPreset declarations are reference intent, not automatic execution. For example, the accessory-bin rule EWASTE_BIN_REJECT_LOOSE_BATTERY declares REJECT, but the customer validateFacts path checks centre acceptedCategoryCodes rather than interpreting all acceptance-rule templates. An ASSUMED receipt preset cannot establish actual physical receipt. Keep eligibility and operational provenance as explicit consumer integration gates.\n\nA customer may contribute fictional demonstration records in its own explicitly selected releases. Quantities, illustrative prices and a variant purchase-unit target are not issued stock or a qualified partner offer. Issuer/seller consent, real staff scope, purchased rights and physical outlets require their actual owners; a source table cannot manufacture them.\n\n## Import Sequence\n\n```mermaid\nflowchart TD\n  Select[Explicit reusable reference selection] --> Validate[Owner schemas and exact source qualification]\n  Validate --> Baseline[nImport qualified eWaste baseline]\n  Baseline --> Delta[Optional aligned customer delta]\n  Delta --> Receipt[Inspect durable destination work and outcome]\n  Receipt --> Business[Separate governed business activation]\n  Business --> Acceptance[Independent live customer and staff qualification]\n```\n\nThis is an adoption checklist, not a claim that one preparation call performs all owner operations. The reference-compatibility contract requires schema/material prerequisites, completed taxonomy closure and a qualified baseline before a dependent customer delta. Cyclic category/item references require closure across the complete selected release rather than a fabricated strict record-by-record order.\n\n1. Select eWaste:core-reference explicitly at its current expected version 0.0.1; optional documentation is a separate CONTENT_PACK, not core/sample business data.\n2. Validate source root, declared files, header schema destinations, current baseline receipts and exact expectedReleases through nImport.\n3. If a customer delta is selected, preserve matching source-root version, logical filename/export key and explicit header target so source-key composition can inherit the baseline.\n4. Execute only authorized owner operations, retaining durable per-destination run work, row successes/failures and installation evidence.\n5. Qualify actual Product/policy/Media publication separately; Promotion issuance and Inventory admission are separate from policy import or CMS approval.\n6. Verify actual customer and operator behavior in the test deployment. Preflight, source fixtures and documentation staging do not prove that journey.\n\nRead llm/contracts/reference-compatibility.md and test/eWasteReferenceRelease.test.js for the exact reusable adoption boundary. The latter uses real nImport components with in-memory ports, not a live destination. The reference pack supplies no customer transactions and requires no customer checkout to demonstrate source composition.\n\n## Repeat Imports And Recovery\n\nInspect the current source version/checksum and durable installed work before deciding whether an import should run. A CURRENT result alone is insufficient if an earlier header was ignored and performed zero work. Do not fabricate a receipt or repair installed state directly; the parent/operator must qualify the corrected declaration through normal owner selection and import. This guide does not assert that any particular receipt was inspected.\n\nFailed imports can contain successful rows. Retain original success/failure evidence, correct the owning declaration/schema problem and use nImport's existing retry/idempotency rules. Do not drop customer data, force a previous release or rerun transaction samples. Existing installations require qualified reference-only adoption, exact baseline provenance and preservation of later customer overrides.\n\nSource compatibility does not establish that an installation may switch its historical profile. Retain original identifiers, assessment snapshots, submissions, assets, ownership events and reward evidence. Unknown/conflicting provenance blocks adoption. Runtime missing-profile failures must not silently fall back to another historical identity.\n\n## Customize and extend safely\n\nPrerequisites: a later-loaded project module, a selected and currently qualified eWaste baseline, matching core-v001 source root and existing nImport source-key composition. A minimal display-name delta belongs in the customer's data/core-v001/records/waste/eWasteCategoryData.js, not in accelerator source. Preserve the logical filename and record0 export key below; do not treat this sparse object as a complete standalone category.\n\n```javascript\n// Customer-owned data/core-v001/records/waste/eWasteCategoryData.js\nmodule.exports = {\n  record0: { name: { en: 'Mobile electronics' } }\n};\n```\n\nThe matching project import header must explicitly target wasteMaterial/wasteCategory through eWasteCategoryData and query code, aligned with the baseline eWastePresetHeader. Declare the customer release through its existing manifest and qualify dependency order/receipt and exact version selection. With supported nImport composition, record0 retains MOBILE_DEVICE, family, item/material arrays and evidence/impact references while changing only its display name. Arrays replace if authored; do not accidentally drop closure.\n\nMissing or changed baseline receipts must reject before writes. DefaultWasteDataContributionPolicyService.resolveByCode replaces whole records and is not the sparse-field merger; using the fragment there would discard required fields. Test reverse caller selection/order, baseline source changes, array replacement and historical profile pins through the owner contracts. Recover by restoring the prior project delta or a qualified forward release, never by overwriting installed transaction history.\n\nOnce adoption depends on an immutable source release, retain its previous bytes and release evidence and use the owning release process for a forward reference change. Refresh counts and hashes during packaging. Review customer policy, demonstration balances and release/configuration changes independently; documentation installation must not mutate those business decisions.\n\n## Local Demo Runtime Admission\n\nNo flag, seed marker, quantity target or JSON record in this accelerator guide authorizes Commerce operational snapshots. Promotion owns issuance and entitlements; Inventory owns stock movements; customer demo admission, if any, needs its explicit owner contract and qualification. See [Product management](/docs/framework/catalog-product-discovery-management#catalogProductDiscoveryManagement-5-operations-and-governance) and [Cart and Order](/docs/framework/commerce-cart-order#commerceCartOrder-4-operator-and-devops-guidance) for their existing boundaries rather than copying operations here.\n\nSimilarly, imported staff labels are not reviewer authorization, a policy template is not completed verification and a declared retention status is not proven deletion. Do not manufacture consent, approver identity, merchant receipts or stock provenance to produce a green readiness indicator.\n\n## Audience and Ownership Checks\n\nBusiness evaluators use a disposable test environment and distinguish reusable presets from a complete customer demonstration. Operators verify owner prerequisites and actual destination work. Administrators qualify employee scopes and publication separately. Developers and AI tools preserve exact source identities, layering and immutable evidence. Maintainers check independent source composition without a sibling customer dependency.\n\n```mermaid\nflowchart LR\n  Docs[Optional referenceDocumentation pack] --> CMS[WCMS Staged authoring]\n  Core[Explicit core reference] --> Waste[Waste preset schemas]\n  Project[Separate customer release] --> Owners[Profile Location Loyalty Commerce Media]\n  CMS --> Publication[Separate Process and publication]\n  Owners --> Live[Separate live owner acceptance]\n```\n\n| Observation | Safe interpretation/recovery |\n| --- | --- |\n| CURRENT with unknown work | Inspect run outcome/declarations; do not infer row installation. |\n| Partial failed run | Retain all row evidence and repair the real owner error. |\n| Missing baseline provenance | Block dependent delta execution. |\n| Quantity or eligibility declaration | Require actual stock and policy evaluation; no operational admission inferred. |\n\n## Common Mistakes\n\n- Selecting business samples and assuming optional documentation is installed, approved or published.\n- Using resolveByCode for a sparse source-key overlay.\n- Equating source acceptance templates, fictional staff or stock targets with qualified owner outcomes.\n- Replaying balances, ownership or single-use coupons over real activity.\n- Deleting historical profiles/receipts or treating a zero-work import as completed installation.\n\n## Verification\n\nSource verification should check the neutral profile, battery behavior, complete reference closure, exact destinations, independent import planning and dependent delta rejection. Add installed qualification for a fresh environment, existing history and later-layer preservation. Documentation import receipts must remain separate from business-release receipts. Source verification alone does not establish installed/native behavior, imported business rows or successful business operations.\n\n```bash\n# From eWaste; independent source-test guidance, not executed here.\nnode --test test/eWasteReferenceCompatibility.test.js test/eWasteReferenceRelease.test.js test/eWastePresetDataContract.test.js\n```\n\nTreat authoring status, import completion, Process approval and Online publication as separate evidence. Integrity metadata must match the selected release. None of these documentation states replaces real owner eligibility, consent or business-journey acceptance.\n"
        },
        {
          "code": "circa.customer-knowledge",
          "title": "Circa customer knowledge",
          "route": "/docs/circa-ewaste/circa-customer-knowledge",
          "section": "circa-guides",
          "sectionTitle": "Circa Guides",
          "sectionOrder": 10,
          "group": "circa-guides",
          "groupTitle": "Circa Guides",
          "groupOrder": 10,
          "subgroup": null,
          "subgroupTitle": null,
          "order": 4,
          "parentId": "circa-guides",
          "hierarchyPath": [
            "Circa Guides",
            "Circa customer knowledge"
          ],
          "hierarchyDepth": 2,
          "documentType": "how-to",
          "audience": [
            "business-user",
            "architect",
            "administrator",
            "developer",
            "operator",
            "qa",
            "ai-tool"
          ],
          "businessAudience": [
            "business evaluator",
            "customer",
            "administrator"
          ],
          "technicalAudience": [
            "architect",
            "developer",
            "operator",
            "qa engineer",
            "ai tool"
          ],
          "summary": "Reusable customer knowledge for advisory photo/guidance, known and unknown facts, confirmation, real review/settlement and explicitly unqualified retrieval/live journeys.",
          "visibility": "public",
          "accessMode": "AUTHENTICATED",
          "publiclyAvailable": false,
          "requiresAuthentication": true,
          "allowedRoles": [],
          "allowedGroups": [],
          "allowedPermissions": [],
          "lifecycleState": "STAGED",
          "maturityState": "partial",
          "implementationState": "source-verified",
          "relatedPages": [
            "location.shared-map-configuration",
            "waste.impact-providers"
          ],
          "searchKeywords": [
            "eWaste",
            "reusable accelerator",
            "customer-knowledge",
            "source-reviewed"
          ],
          "topicKeywords": [
            "Circa customer knowledge",
            "eligibility limits",
            "owner authority",
            "customization"
          ],
          "searchText": "Circa customer knowledge Reusable customer knowledge for advisory photo/guidance, known and unknown facts, confirmation, real review/settlement and explicitly unqualified retrieval/live journeys. # Circa customer knowledge\n\nThis Circa-labelled topic supplies reusable customer-facing knowledge boundaries for electronic-waste applications. Adapt its wording only to actual approved centre, identity, evidence and programme policy. It does not install a customer frontend, select a provider or prove the facts of an individual item. For beginners, work through one fictional item and distinguish supplied facts, advisory estimates and unknowns before asking for guidance. Confirm the selected centre and approved programme through their owners, then follow the customer-journey reference for submission and review. A helpful answer is not approval, a final reward or proof of physical receipt.\n\n## Location and arrival\n\nBrowse current centre information and ask staff about opening hours and the item they can accept. Public discovery requires active, operating ACTIVE and PUBLIC records, but currently reads at most 100 centres; it is not an exhaustive or item-filtered acceptance service. A marker, saved preference or directions link never proves eligibility, arrival or physical deposit.\n\nWhen an application has explicitly wired the reusable fresh-arrival service, usable new coordinates must lie within its configured inclusive direct-distance radius for preparation/confirmation. There is no framework radius default. Device permission and capture behavior belong to the host; browsing information need not require location. Invalid/stale positions need reacquisition and must not discard saved drafts/photos. Accuracy is optional metadata, not a rejection gate; reported coordinates are not tamper-proof physical proof.\n\nArrival preview selects by distance, not full collection-rule or opening-hour evaluation. Waste separately checks acceptedCategoryCodes only when provided as an array; absent restrictions do not certify acceptance. The ordinary native HTTP mapper does not automatically use the Journey service. A support answer must not promise enforcement or eligibility that the actual adapter has not qualified. For map configuration, refer to [Shared Map Configuration](/docs/framework/location-shared-map-configuration), owned by locationMap, rather than duplicating it here.\n\n## Photo, identification and correction\n\nUse the application's supported photo controls. Reusable preparation accepts canonical base64 JPEG, PNG or WebP within the configured byte bound, 5 MiB by default. It analyzes before durable Media/submission creation; supported recognition-unavailable failures can produce a held manual-review result. On a first failed preparation, there may be no saved draft/photo yet: do not promise persistence that never occurred. Replacement failures must preserve the prior evidence, and uncertain successful writes require owner status inspection before retry.\n\nRecognition is advisory and cannot establish working condition, exact mass, internal composition, safe handling or achieved recycling. Customer edits allow only name and description. Classification, quantity, brand/model, size/weight, materials and environmental fields are read-only for customers and require business review. 'It is a tablet' does not automatically reclassify a supported recognized item in the current conversation code; a retake or authorized review is needed. The original photo/proposal remains evidence.\n\nA question never confirms the item. A supported explicit text correction may update allowed fields, clear estimate/confirmation revision and return REVIEW_DRAFT. The final customer confirmation remains a separate reviewed action with current revision and stable command reference. Do not accept provider-supplied action code, changed owner or invented measurements.\n\n## Handling and unknown details\n\nDescriptor size classes include SMALL, MEDIUM, LARGE, BULKY, HEAVY and UNKNOWN. The reusable policy currently gives CHARGER a SMALL mapping; that mapping is not a measured weight or a universal handling decision for every item. Preserve unknowns and distinguish photo observations, inferences, reference assumptions and operator measurements. An unidentified item must not silently inherit a mixed-load emissions coefficient.\n\nCentre staff owns applicable handling instructions. This guide and a photo cannot certify device/battery safety or replace approved centre policy. Do not turn material hints into recovery yields, hazardous-content measurements, safe-disposal guarantees or evidence of completed treatment. Environmental interpretation is defined by [Waste Impact providers](/docs/framework/waste-impact-providers#wasteImpactProviders-8-environmental-properties-and-credit-status), owned by wasteImpact.\n\n## Confirmation and review\n\nReview the supplied photo, selected centre, known/unknown facts and stated assessment limits, then explicitly confirm. Only the canonical successful server acknowledgement/status establishes system submission. For an uncertain response, inspect saved owner status and preserve the original command before retrying. Deposit instructions are configured centre handoff copy, not a physical receipt created by a click.\n\nReal authorized humans claim and verify/decide through Waste under effective permissions/scopes and revision checks. Shared requireScopes/requireVerification/requireDifferentApprover defaults are false; a particular independent-review promise needs approved later policy and qualified staff. A queue handoff label is not an assigned employee. Claimed records cannot be mutated by another employee, and separate-actor policy needs a real handoff.\n\nFlagged evidence can require explicit human acknowledgement before approval. Rejection requires a public reason. Recorded status/comment and settlement are different outcomes. Source-channel notification is optional configured Communication delivery; a delayed or uncertain message must not erase a decision or cause an automatic replay. This guide does not qualify reviewer eligibility or live notification delivery.\n\n## Benefits and ownership\n\nDisplay environmental estimates only with stated units, source/provenance, scenario and uncertainty. WARM/AI adapters are optional configurations, not a universal selected sample or a source of certified credits. Prospective recycling input is not completed diversion, and INPUT_ONLY/partial results must remain labelled. A successful reassessment does not rewrite original approval rewards.\n\nRewards require approved, persisted CONFIRMED reward evidence and actual successful Loyalty settlement. A missing published policy leaves reward evidence/settlement unavailable or pending rather than inventing an amount. Zero-value outcomes can complete without a wallet/ledger. Digital gift/sale operations and attached-carbon movement use their owning evidence; original approval rewards stay with the contributor. Physical receipt, transport, actual treatment and real merchant redemption remain separate and no fixed reward/timeline is promised.\n\n## Accounts, privacy and recovery\n\nUse Profile-owned sign-in/registration. Enabled channel entry requires configured verified provider proof and a real account link; matching names/emails are not proof. Profile owns conflicts, persistence and one-use browser handoff. eWaste channel authentication defaults disabled. Lost/expired handoffs need fresh entry, not a manually manufactured token. Never include passwords, provider proof, tokens or other customers' details in a help conversation.\n\nOriginal photos remain owner-authorized evidence, not public catalogue images. Retention/deletion terms require actual applicable policy and operations; configured readiness status alone does not establish a timed cleanup job or deletion result. If AI guidance is unavailable, retain the supported explicit journey controls and inspect whether a draft was actually saved.\n\nDefaultEWasteConversationService grounds replies in an authorized draft and allowlisted facts. Its message/guidance methods validate at most 1500 characters and propagate revision conflicts. Questions can persist conversation history and advance record revision without changing facts; refresh from the returned draft before the next mutation. The service never submits, approves, pays, transfers ownership or issues credits.\n\nThis authored knowledge page is not automatically indexed, retrieved or enforced by Copilot. guidance can compose trusted project copy with DefaultCopilotCustomerGuidanceService, but knowledge publication/retrieval and live channel use require separately qualified owner integration. In particular, built-in advice about manual centre selection cannot override an application's fresh-arrival requirement or establish actual item acceptance.\n\n## Audience and Ownership Checks\n\nBusiness users distinguish helpful language from owner-confirmed status. Business evaluators assess honest unknowns and policy limits, not a chatbot demonstration as operational proof. Operators answer from recorded status and approved centre/retention policy. Administrators qualify channel and reviewer permissions. Developers, maintainers and AI tools preserve allowed customer fields, original evidence and trusted context instead of granting authority to a reply.\n\n```mermaid\nflowchart TD\n  Question[Customer question and authorized draft] --> Guidance[Advisory guidance and bounded history]\n  Guidance --> Controls[Explicit supported journey controls]\n  Controls --> Confirm[Reviewed customer confirmation]\n  Confirm --> Ack[Canonical submission acknowledgement]\n  Ack --> Staff[Real employee claim and configured review]\n  Staff --> Status[Recorded decision]\n  Status --> Settlement[Separate owner settlement]\n  Status --> Physical[Separate physical receipt]\n```\n\n| Observation | Meaning and safe response |\n| --- | --- |\n| Centre marker or arrival | Not complete item eligibility or physical receipt. |\n| Photo hint or size class | Not a safety, condition or mass certification. |\n| Reply says progress saved | Verify actual owner record/revision; first preparation can fail before persistence. |\n| Estimated benefit / pending reward | Preserve assumptions and actual settlement status. |\n| Knowledge page exists | Not proof of Copilot retrieval, reviewer readiness or native channel acceptance. |\n\n## Customize and extend safely\n\nPrerequisites: a later-loaded customer module, authorized saved-draft message flow and an approved programme support statement. In the customer's config/properties.js, replace only the eWaste conversation reward copy. This refines the built-in reward-question branch; it does not enable knowledge retrieval, change rewards or relax a gate.\n\n```javascript\nmodule.exports = {\n  eWaste: { conversation: {\n    rewardGuidance: 'Check your confirmed assessment and settlement status. Support cannot promise a reward amount or payment time.'\n  } }\n};\n```\n\nFor an authorized current draft, 'When do I get a reward?' matches the existing question branch and returns that copy while preserving submitted facts and saving conversation history. A message over 1500 characters rejects ERR_EWASTE_MESSAGE_INVALID; a stale expectedRevision must propagate the owner conflict before a reply. Do not make support copy instruct callers to bypass arrival or change reviewed fields.\n\nIf additional guidance policy is needed, use a small later project src/service adapter around guidance(request, policy), retaining authorized draft reads, trusted fixed-message selection and original owner error handling. A caller-controlled service or prompt is not an extension point. Test successful history, stale revision, provider failure, forbidden corrections and explicit-confirmation separation. Restore the previous project copy/adapter on rollback without deleting history, photos or canonical records.\n\n## Common Mistakes\n\n- Sending passwords, tokens or account proofs to advisory help.\n- Treating a classification suggestion or customer correction as verified measurements.\n- Claiming a first failed upload was saved or blindly replaying an uncertain confirmation.\n- Promising complete eligibility, independent review, rewards, recycling or retention terms not established by the actual owners.\n- Assuming publication of this page enables knowledge retrieval or qualifies a native channel.\n\n## Verification\n\nQualification should exercise denied location, missing/stale policy, first preparation failure versus saved-photo replacement, held analysis, allowed/forbidden corrections, cancelled confirmation and acknowledged submission separately. Check current owner status after uncertainty, wrong-customer photo denial, reviewer assignment/scope denials and knowledge/provider failures. Verify ordinary explicit controls remain usable without AI, while authoritative assessment/eligibility requirements still reject correctly.\n\n```bash\n# From eWaste; source guidance only, not executed by editorial review.\nnode --test test/eWasteGuidanceHistory.test.js test/eWasteConversationContract.test.js test/eWastePreparation.test.js\n```\n\nA source-reviewed, route-selectable guide still requires normal Process approval and publication before public delivery. Qualify knowledge retrieval and real customer, reviewer and channel behavior independently; published documentation is not evidence that those integrations passed.\n"
        }
      ]
    },
    "active": true
  },
  "record1": {
    "code": "circaDocsComponentcircaCatalogue",
    "typeCode": "circaDocumentationArticleComponentType",
    "renderer": "documentation.component.article",
    "accessMode": "PUBLIC",
    "properties": {
      "code": "circa.catalogue",
      "title": "Circa Shop and Coupons",
      "route": "/docs/circa-ewaste",
      "section": "circa-guides",
      "sectionTitle": "Circa Guides",
      "group": "circa-guides",
      "groupTitle": "Circa Guides",
      "parentId": "circa-guides",
      "hierarchyPath": [
        "Circa Guides",
        "Circa Shop and Coupons"
      ],
      "hierarchyDepth": 2,
      "documentType": "how-to",
      "audience": [
        "business-user",
        "architect",
        "administrator",
        "developer",
        "operator",
        "qa",
        "ai-tool"
      ],
      "businessAudience": [
        "business evaluator",
        "customer",
        "administrator"
      ],
      "technicalAudience": [
        "architect",
        "developer",
        "operator",
        "qa engineer",
        "ai tool"
      ],
      "summary": "Reusable eWaste published-offer composition, native versus full-catalogue boundaries, safe projection, bounded reads and project-owned customization.",
      "visibility": "public",
      "accessMode": "AUTHENTICATED",
      "publiclyAvailable": false,
      "requiresAuthentication": true,
      "allowedRoles": [],
      "allowedGroups": [],
      "allowedPermissions": [],
      "lifecycleState": "STAGED",
      "maturityState": "partial",
      "implementationState": "source-verified",
      "relatedPages": [
        "catalog.product-discovery-management",
        "commerce.cart-order"
      ],
      "visualRequirements": [
        "diagram",
        "table",
        "code-example"
      ],
      "searchKeywords": [
        "eWaste",
        "reusable accelerator",
        "catalogue",
        "source-reviewed"
      ],
      "topicKeywords": [
        "Circa Shop and Coupons",
        "eligibility limits",
        "owner authority",
        "customization"
      ],
      "headings": [
        {
          "text": "Ownership and composition",
          "anchor": "circaCatalogue-1-ownership-and-composition",
          "level": 2
        },
        {
          "text": "Public endpoints",
          "anchor": "circaCatalogue-2-public-endpoints",
          "level": 2
        },
        {
          "text": "Reference deployment bounds",
          "anchor": "circaCatalogue-3-reference-deployment-bounds",
          "level": 2
        },
        {
          "text": "Product content",
          "anchor": "circaCatalogue-4-product-content",
          "level": 2
        },
        {
          "text": "Validation",
          "anchor": "circaCatalogue-5-validation",
          "level": 2
        },
        {
          "text": "Audience and Ownership Checks",
          "anchor": "circa-catalogue-audience-owner-checks",
          "level": 2
        },
        {
          "text": "Customize and extend safely",
          "anchor": "circa-catalogue-customize-and-extend-safely",
          "level": 2
        },
        {
          "text": "Common Mistakes",
          "anchor": "circa-catalogue-common-mistakes",
          "level": 2
        },
        {
          "text": "Verification",
          "anchor": "circa-catalogue-verification",
          "level": 2
        }
      ],
      "blocks": [
        {
          "kind": "paragraph",
          "text": "This retained Circa topic teaches reusable eWaste catalogue composition to business evaluators, operators and application developers. It is not a Kickoff storefront runbook: /shop, /coupons, quick-view controls, ports and application-specific adapters are customer choices, not accelerator guarantees. For beginners, start with a controlled published offer and inspect read-only details before any purchase. Compare the native marketplace boundary with the separately selected catalogue service, then follow the canonical Product and Checkout references for price, availability and confirmed purchase authority."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Ownership and composition",
          "anchor": "circaCatalogue-1-ownership-and-composition"
        },
        {
          "kind": "paragraph",
          "text": "The implementing eWaste module owns this optional referenceDocumentation pack, including its product, navigation, dashboard and four article records. The functional visibility boundary is nodics.accelerators; no customer application or grouping-only package owns these records. Select circadocs to import them separately from business data and the Framework library. Axis may discover reviewed STAGED product metadata by its exact Site and authorized initialization profile. Discovery is not publication: the owner must report READY after normal CMS and required Media approvals before the reader contacts Online. DRAFT, retired, inactive, non-public or ambiguously bound products stay unavailable. Shared Product, Checkout, Location and Waste detail is linked rather than copied, and each linked target requires its own publication and access qualification."
        },
        {
          "kind": "paragraph",
          "text": "An operator diagnosing an empty catalogue should check the configured store, published Product owner response and matching Waste asset descriptors before changing storefront presentation. Preserve the exact kind and selector evidence, distinguish an unconfigured empty marketplace from a bounded-scan failure, and avoid replaying purchase commands while diagnosing a read-only listing."
        },
        {
          "kind": "paragraph",
          "text": "DefaultEWasteCatalogueService composes published Product discovery/detail with current Waste asset descriptors. DefaultEWasteMarketplaceService owns shared offer projection and the existing purchase/bid handoff. Neither catalogue read writes a product, price, asset owner, order, wallet or entitlement. Commerce retains publication, pricing, checkout and coupon authority; Waste retains assets and descriptors. Customer branding, storefront routes and presentation belong outside the accelerator."
        },
        {
          "kind": "paragraph",
          "text": "Read [Product discovery and management](/docs/framework/catalog-product-discovery-management#catalogProductDiscoveryManagement-2-journey-and-ownership), document catalog.product-discovery-management owned by product, for the published Product boundary. Use [Cart and Order](/docs/framework/commerce-cart-order#commerceCartOrder-5-security-and-failure-behavior), document commerce.cart-order owned by checkoutCore, for authoritative checkout. These references do not install either optional documentation pack or grant business access."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Public endpoints",
          "anchor": "circaCatalogue-2-public-endpoints"
        },
        {
          "kind": "paragraph",
          "text": "The current native route is GET /nodics/eWaste/v0/marketplace. It delegates through DefaultEWasteExperienceController and the trusted DefaultEWasteRequestService to DefaultEWasteMarketplaceService.list. This list reads one Product discovery page of up to 100 products; without a configured eWaste.marketplace.storeCode it returns empty asset/coupon arrays. It does not expose the complete filtered catalogue contract."
        },
        {
          "kind": "paragraph",
          "text": "DefaultEWasteCatalogueService.catalogue(request) and product(request) are reusable service operations, not native /catalogue HTTP routes. A later application controller must explicitly select this service through the existing trusted mapper and define its own route/security contract. Request payloads must never select the service name, store, tenant, owner transport or locale. The Product transport selects the configured store and locale en."
        },
        {
          "kind": "paragraph",
          "text": "For catalogue(request), kind must be ASSET or COUPON. Flat string selectors are q, category, condition, issuer, minPoints, maxPoints, validUntil, sort, page and pageSize. Sort choices are FEATURED, POINTS_ASC, POINTS_DESC, NAME, and coupon-only EXPIRY; code breaks ties. FEATURED currently means code order, not a merchandising-rank field. validUntil is a UTC date floor on expiresAt, not an extension of purchased rights. Invalid scalars, dates and inverted ranges fail before owner reads."
        },
        {
          "kind": "paragraph",
          "text": "product(request) validates code syntax and exact kind, reads the Product directly and reruns the offer checks independently of listing state. Invalid references return 400; unavailable or cross-kind references return 404. Browsing never authorizes a later purchase: the owner must recheck the displayed revision, real price and stable command at checkout."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Reference deployment bounds",
          "anchor": "circaCatalogue-3-reference-deployment-bounds"
        },
        {
          "kind": "paragraph",
          "text": "The catalogue service, when explicitly selected, traverses Product pages in batches of 100 by default, with eWaste.catalogue.maximumProducts 2000, pageSize 12 and maximumPageSize 48. It derives exact filtered totals and slices the requested page after joining offers. Facets describe the complete eligible kind before the remaining query filters, not an independently queried global store index. page is capped at 10000 and then clamped to the last result page; invalid oversized pageSize is rejected rather than silently clamped."
        },
        {
          "kind": "paragraph",
          "text": "Duplicate product codes/repeated pages or more than maximumProducts fail with status 503 instead of reporting a truncated count. Cancellation is checked between Product pages and returns 499; it is not an abort guarantee for every in-flight owner call. Asset joins run in batches of ten. Reads are repeated for each request, but multiple owner reads are not one atomic catalogue snapshot. A concurrent price or owner change still requires command-time validation."
        },
        {
          "kind": "paragraph",
          "text": "Do not infer these full traversal guarantees for the native one-page marketplace. Larger deployments need qualified Product/Search projections and owner integration, not an indefinitely increased scan limit or a frontend download of every product."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Product content",
          "anchor": "circaCatalogue-4-product-content"
        },
        {
          "kind": "paragraph",
          "text": "Shared offer projection accepts ASSET/COUPON only, matching configured currency, a finite positive unitAmount and a nonexpired expiresAt when supplied. An asset reference must resolve to a not-explicitly-inactive LISTED Waste asset with no conflicting marketProductCode. Bid availability additionally binds the Product owner/source references to that asset. These are current source checks, not a complete legal, merchant or physical-condition eligibility decision. available defaults true unless Product explicitly reports false; it is a DTO value, not proof of admitted inventory."
        },
        {
          "kind": "paragraph",
          "text": "Offer text comes only from published localized terms, eligibility, exclusions, redemptionInstructions and purchaseConditions. Strings/arrays are bounded to thirty lines of at most 4000 characters per field; missing copy becomes an empty array, not invented terms. The safe descriptor suppresses its private photo. Gallery projection deduplicates HTTP(S) or single-slash relative URLs; URL-shape filtering is not host validation or independent Media publication proof. The Product/Media owner and consumer must qualify delivery and exclude private originals."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Validation",
          "anchor": "circaCatalogue-5-validation"
        },
        {
          "kind": "paragraph",
          "text": "Source contracts eWasteCatalogueDiscovery.test.js and eWasteCatalogueContract.test.js cover multi-page filtering, exact totals, direct detail, bad selectors, unavailable assets, copy/media projection and overflow. Their fixtures are not merchant, stock or live payment evidence. The commands below are verification guidance, not a report of tests executed in this editorial review."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Audience and Ownership Checks",
          "anchor": "circa-catalogue-audience-owner-checks"
        },
        {
          "kind": "paragraph",
          "text": "Business evaluators can assess bounded read composition without assuming a complete marketplace installation. Business users inspect price, currency, validity and provided terms before a separate confirmed purchase. Administrators bind the store and owning APIs; operators distinguish an empty unconfigured marketplace from a 503 scan failure. Developers/AI tools preserve trusted mapping and read-only behavior. Framework maintainers qualify owner integration and concurrency rather than copying Commerce logic."
        },
        {
          "kind": "diagram",
          "language": "mermaid",
          "text": "flowchart LR\n  Request[Trusted read context] --> Choice{Selected backend service}\n  Choice --> Native[Native marketplace: one page]\n  Choice --> Full[Explicit catalogue: bounded traversal]\n  Native --> Offer[Product and current Waste offer projection]\n  Full --> Offer\n  Offer --> Read[Read-only response]\n  Read --> Checkout[Separate Commerce checkout validation]"
        },
        {
          "kind": "table",
          "headers": [
            "Observation or failure",
            "Meaning and safe response"
          ],
          "rows": [
            [
              "Empty native marketplace",
              "Check configured store and published Product source; do not manufacture offers."
            ],
            [
              "503 duplicate/limit failure",
              "Preserve the failure; correct owner pagination or qualify scale before retry."
            ],
            [
              "404 detail",
              "Refresh the current kind/listing; do not reuse stale availability."
            ],
            [
              "Cancelled purchase review",
              "Send no purchase command; a read result is not an order."
            ]
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Customize and extend safely",
          "anchor": "circa-catalogue-customize-and-extend-safely"
        },
        {
          "kind": "paragraph",
          "text": "Prerequisites: a later-loaded customer module with eWaste inheritance, a trusted catalogue controller, valid store/currency configuration and published Product reads. In that project's config/properties.js, change only the browsing difference below. DefaultEWasteCatalogueService reads eWaste.catalogue; this does not change native marketplace pagination or publish anything."
        },
        {
          "kind": "code",
          "language": "javascript",
          "text": "module.exports = {\n  eWaste: { catalogue: { pageSize: 24 } }\n};\n// Later project config/properties.js: maximumPageSize remains inherited at 48."
        },
        {
          "kind": "paragraph",
          "text": "With the catalogue service selected and no pageSize selector, a result page contains at most 24 offers and retains exact filtered totals. pageSize='49' still rejects under inherited limits. A trusted project src/controller adapter may call DefaultEWasteRequestService.invoke('catalogue', request, callback, 'DefaultEWasteCatalogueService'); choose that service literal on the server and retain route permissions/exposure. Customer routes and renderer state remain project-owned. Do not copy the scanner or bypass safe offer projection."
        },
        {
          "kind": "paragraph",
          "text": "To recover, restore the prior project delta and requalify effective configuration and controller mapping; do not reset Product/Waste state. Test default plus overridden page size, denied/invalid input, scale failure and command-time checkout validation. Changing thresholds cannot turn an unavailable asset into an eligible sale."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Common Mistakes",
          "anchor": "circa-catalogue-common-mistakes"
        },
        {
          "kind": "unordered-list",
          "items": [
            "Assuming native /marketplace is the full catalogue service or a snapshot-consistent inventory query.",
            "Accepting caller-selected stores, service names or ownership context.",
            "Treating a published title, available flag or URL as merchant qualification, real stock or Media authorization.",
            "Inventing missing coupon terms or treating purchase cancellation as confirmation."
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Verification",
          "anchor": "circa-catalogue-verification"
        },
        {
          "kind": "paragraph",
          "text": "Run the independent owner contracts before release and add application-controller mapping tests for the actual selected service. Cover a second Product page, duplicate codes, exactly/over 2000 products, bad filters before reads, wrong kind, changed owner/revision, missing store, private-photo suppression and unavailable-image presentation. Separately qualify authenticated checkout, publication, admitted stock and actual merchant redemption in an authorized test deployment. None was performed here."
        },
        {
          "kind": "code",
          "language": "bash",
          "text": "# Source contract guidance only; not executed by editorial review.\nnode --test test/eWasteCatalogueDiscovery.test.js test/eWasteCatalogueContract.test.js"
        },
        {
          "kind": "paragraph",
          "text": "An active authoring route makes a guide selectable for normal publication; it does not grant Process approval or establish live customer acceptance. Release tooling must refresh integrity metadata before import, and authorized reviewers must follow the normal CMS and Media publication workflows."
        }
      ],
      "searchText": "Circa Shop and Coupons Reusable eWaste published-offer composition, native versus full-catalogue boundaries, safe projection, bounded reads and project-owned customization. # Circa Shop and Coupons\n\nThis retained Circa topic teaches reusable eWaste catalogue composition to business evaluators, operators and application developers. It is not a Kickoff storefront runbook: /shop, /coupons, quick-view controls, ports and application-specific adapters are customer choices, not accelerator guarantees. For beginners, start with a controlled published offer and inspect read-only details before any purchase. Compare the native marketplace boundary with the separately selected catalogue service, then follow the canonical Product and Checkout references for price, availability and confirmed purchase authority.\n\n## Ownership and composition\n\nThe implementing eWaste module owns this optional referenceDocumentation pack, including its product, navigation, dashboard and four article records. The functional visibility boundary is nodics.accelerators; no customer application or grouping-only package owns these records. Select circadocs to import them separately from business data and the Framework library. Axis may discover reviewed STAGED product metadata by its exact Site and authorized initialization profile. Discovery is not publication: the owner must report READY after normal CMS and required Media approvals before the reader contacts Online. DRAFT, retired, inactive, non-public or ambiguously bound products stay unavailable. Shared Product, Checkout, Location and Waste detail is linked rather than copied, and each linked target requires its own publication and access qualification.\n\nAn operator diagnosing an empty catalogue should check the configured store, published Product owner response and matching Waste asset descriptors before changing storefront presentation. Preserve the exact kind and selector evidence, distinguish an unconfigured empty marketplace from a bounded-scan failure, and avoid replaying purchase commands while diagnosing a read-only listing.\n\nDefaultEWasteCatalogueService composes published Product discovery/detail with current Waste asset descriptors. DefaultEWasteMarketplaceService owns shared offer projection and the existing purchase/bid handoff. Neither catalogue read writes a product, price, asset owner, order, wallet or entitlement. Commerce retains publication, pricing, checkout and coupon authority; Waste retains assets and descriptors. Customer branding, storefront routes and presentation belong outside the accelerator.\n\nRead [Product discovery and management](/docs/framework/catalog-product-discovery-management#catalogProductDiscoveryManagement-2-journey-and-ownership), document catalog.product-discovery-management owned by product, for the published Product boundary. Use [Cart and Order](/docs/framework/commerce-cart-order#commerceCartOrder-5-security-and-failure-behavior), document commerce.cart-order owned by checkoutCore, for authoritative checkout. These references do not install either optional documentation pack or grant business access.\n\n## Public endpoints\n\nThe current native route is GET /nodics/eWaste/v0/marketplace. It delegates through DefaultEWasteExperienceController and the trusted DefaultEWasteRequestService to DefaultEWasteMarketplaceService.list. This list reads one Product discovery page of up to 100 products; without a configured eWaste.marketplace.storeCode it returns empty asset/coupon arrays. It does not expose the complete filtered catalogue contract.\n\nDefaultEWasteCatalogueService.catalogue(request) and product(request) are reusable service operations, not native /catalogue HTTP routes. A later application controller must explicitly select this service through the existing trusted mapper and define its own route/security contract. Request payloads must never select the service name, store, tenant, owner transport or locale. The Product transport selects the configured store and locale en.\n\nFor catalogue(request), kind must be ASSET or COUPON. Flat string selectors are q, category, condition, issuer, minPoints, maxPoints, validUntil, sort, page and pageSize. Sort choices are FEATURED, POINTS_ASC, POINTS_DESC, NAME, and coupon-only EXPIRY; code breaks ties. FEATURED currently means code order, not a merchandising-rank field. validUntil is a UTC date floor on expiresAt, not an extension of purchased rights. Invalid scalars, dates and inverted ranges fail before owner reads.\n\nproduct(request) validates code syntax and exact kind, reads the Product directly and reruns the offer checks independently of listing state. Invalid references return 400; unavailable or cross-kind references return 404. Browsing never authorizes a later purchase: the owner must recheck the displayed revision, real price and stable command at checkout.\n\n## Reference deployment bounds\n\nThe catalogue service, when explicitly selected, traverses Product pages in batches of 100 by default, with eWaste.catalogue.maximumProducts 2000, pageSize 12 and maximumPageSize 48. It derives exact filtered totals and slices the requested page after joining offers. Facets describe the complete eligible kind before the remaining query filters, not an independently queried global store index. page is capped at 10000 and then clamped to the last result page; invalid oversized pageSize is rejected rather than silently clamped.\n\nDuplicate product codes/repeated pages or more than maximumProducts fail with status 503 instead of reporting a truncated count. Cancellation is checked between Product pages and returns 499; it is not an abort guarantee for every in-flight owner call. Asset joins run in batches of ten. Reads are repeated for each request, but multiple owner reads are not one atomic catalogue snapshot. A concurrent price or owner change still requires command-time validation.\n\nDo not infer these full traversal guarantees for the native one-page marketplace. Larger deployments need qualified Product/Search projections and owner integration, not an indefinitely increased scan limit or a frontend download of every product.\n\n## Product content\n\nShared offer projection accepts ASSET/COUPON only, matching configured currency, a finite positive unitAmount and a nonexpired expiresAt when supplied. An asset reference must resolve to a not-explicitly-inactive LISTED Waste asset with no conflicting marketProductCode. Bid availability additionally binds the Product owner/source references to that asset. These are current source checks, not a complete legal, merchant or physical-condition eligibility decision. available defaults true unless Product explicitly reports false; it is a DTO value, not proof of admitted inventory.\n\nOffer text comes only from published localized terms, eligibility, exclusions, redemptionInstructions and purchaseConditions. Strings/arrays are bounded to thirty lines of at most 4000 characters per field; missing copy becomes an empty array, not invented terms. The safe descriptor suppresses its private photo. Gallery projection deduplicates HTTP(S) or single-slash relative URLs; URL-shape filtering is not host validation or independent Media publication proof. The Product/Media owner and consumer must qualify delivery and exclude private originals.\n\n## Validation\n\nSource contracts eWasteCatalogueDiscovery.test.js and eWasteCatalogueContract.test.js cover multi-page filtering, exact totals, direct detail, bad selectors, unavailable assets, copy/media projection and overflow. Their fixtures are not merchant, stock or live payment evidence. The commands below are verification guidance, not a report of tests executed in this editorial review.\n\n## Audience and Ownership Checks\n\nBusiness evaluators can assess bounded read composition without assuming a complete marketplace installation. Business users inspect price, currency, validity and provided terms before a separate confirmed purchase. Administrators bind the store and owning APIs; operators distinguish an empty unconfigured marketplace from a 503 scan failure. Developers/AI tools preserve trusted mapping and read-only behavior. Framework maintainers qualify owner integration and concurrency rather than copying Commerce logic.\n\n```mermaid\nflowchart LR\n  Request[Trusted read context] --> Choice{Selected backend service}\n  Choice --> Native[Native marketplace: one page]\n  Choice --> Full[Explicit catalogue: bounded traversal]\n  Native --> Offer[Product and current Waste offer projection]\n  Full --> Offer\n  Offer --> Read[Read-only response]\n  Read --> Checkout[Separate Commerce checkout validation]\n```\n\n| Observation or failure | Meaning and safe response |\n| --- | --- |\n| Empty native marketplace | Check configured store and published Product source; do not manufacture offers. |\n| 503 duplicate/limit failure | Preserve the failure; correct owner pagination or qualify scale before retry. |\n| 404 detail | Refresh the current kind/listing; do not reuse stale availability. |\n| Cancelled purchase review | Send no purchase command; a read result is not an order. |\n\n## Customize and extend safely\n\nPrerequisites: a later-loaded customer module with eWaste inheritance, a trusted catalogue controller, valid store/currency configuration and published Product reads. In that project's config/properties.js, change only the browsing difference below. DefaultEWasteCatalogueService reads eWaste.catalogue; this does not change native marketplace pagination or publish anything.\n\n```javascript\nmodule.exports = {\n  eWaste: { catalogue: { pageSize: 24 } }\n};\n// Later project config/properties.js: maximumPageSize remains inherited at 48.\n```\n\nWith the catalogue service selected and no pageSize selector, a result page contains at most 24 offers and retains exact filtered totals. pageSize='49' still rejects under inherited limits. A trusted project src/controller adapter may call DefaultEWasteRequestService.invoke('catalogue', request, callback, 'DefaultEWasteCatalogueService'); choose that service literal on the server and retain route permissions/exposure. Customer routes and renderer state remain project-owned. Do not copy the scanner or bypass safe offer projection.\n\nTo recover, restore the prior project delta and requalify effective configuration and controller mapping; do not reset Product/Waste state. Test default plus overridden page size, denied/invalid input, scale failure and command-time checkout validation. Changing thresholds cannot turn an unavailable asset into an eligible sale.\n\n## Common Mistakes\n\n- Assuming native /marketplace is the full catalogue service or a snapshot-consistent inventory query.\n- Accepting caller-selected stores, service names or ownership context.\n- Treating a published title, available flag or URL as merchant qualification, real stock or Media authorization.\n- Inventing missing coupon terms or treating purchase cancellation as confirmation.\n\n## Verification\n\nRun the independent owner contracts before release and add application-controller mapping tests for the actual selected service. Cover a second Product page, duplicate codes, exactly/over 2000 products, bad filters before reads, wrong kind, changed owner/revision, missing store, private-photo suppression and unavailable-image presentation. Separately qualify authenticated checkout, publication, admitted stock and actual merchant redemption in an authorized test deployment. None was performed here.\n\n```bash\n# Source contract guidance only; not executed by editorial review.\nnode --test test/eWasteCatalogueDiscovery.test.js test/eWasteCatalogueContract.test.js\n```\n\nAn active authoring route makes a guide selectable for normal publication; it does not grant Process approval or establish live customer acceptance. Release tooling must refresh integrity metadata before import, and authorized reviewers must follow the normal CMS and Media publication workflows.\n",
      "previous": null,
      "next": {
        "title": "Circa customer journey",
        "route": "/docs/circa-ewaste/circa-customer-journey"
      },
      "source": {
        "repository": "nodics.ai",
        "functionalModule": "nodics.accelerators",
        "technicalModule": "eWaste",
        "path": "data/docs-v001/records/documentation/circaDocumentationRelease002ComponentData.js",
        "wordCount": 1507,
        "checksum": "b283a57ecd29b15fdcaeb69c2e60a1c7db4cd881ef91e71c739e20988c3868fa",
        "owner": "eWaste",
        "sourcePath": "data/docs-v001/records/documentation/circaDocumentationRelease002ComponentData.js"
      },
      "slug": "catalogue",
      "locale": "en",
      "sourceEvidence": [
        "README.md",
        "AGENTS.md",
        "config/properties.js",
        "llm/contracts/e-waste-domain.md",
        "src/service/defaultEWasteCatalogueService.js",
        "src/service/defaultEWasteMarketplaceService.js",
        "src/service/defaultEWasteRequestService.js",
        "src/controller/defaultEWasteExperienceController.js",
        "src/router/routers.js",
        "test/eWasteCatalogueDiscovery.test.js",
        "test/eWasteCatalogueContract.test.js",
        "../../../../../nodics.waste/modules/wasteMaterial/src/service/defaultWasteItemDescriptorService.js"
      ],
      "references": [
        {
          "documentId": "catalog.product-discovery-management",
          "owner": "product"
        },
        {
          "documentId": "commerce.cart-order",
          "owner": "checkoutCore"
        }
      ]
    },
    "active": true
  },
  "record2": {
    "code": "circaDocsComponentcircaCustomerJourney",
    "typeCode": "circaDocumentationArticleComponentType",
    "renderer": "documentation.component.article",
    "accessMode": "PUBLIC",
    "properties": {
      "code": "circa.customer-journey",
      "title": "Circa customer journey",
      "route": "/docs/circa-ewaste/circa-customer-journey",
      "section": "circa-guides",
      "sectionTitle": "Circa Guides",
      "group": "circa-guides",
      "groupTitle": "Circa Guides",
      "parentId": "circa-guides",
      "hierarchyPath": [
        "Circa Guides",
        "Circa customer journey"
      ],
      "hierarchyDepth": 2,
      "documentType": "how-to",
      "audience": [
        "business-user",
        "architect",
        "administrator",
        "developer",
        "operator",
        "qa",
        "ai-tool"
      ],
      "businessAudience": [
        "business evaluator",
        "customer",
        "administrator"
      ],
      "technicalAudience": [
        "architect",
        "developer",
        "operator",
        "qa engineer",
        "ai tool"
      ],
      "summary": "Reusable eWaste customer, evidence and review orchestration with explicit arrival wiring, limited eligibility, real reviewer policy and separate live acceptance gates.",
      "visibility": "public",
      "accessMode": "AUTHENTICATED",
      "publiclyAvailable": false,
      "requiresAuthentication": true,
      "allowedRoles": [],
      "allowedGroups": [],
      "allowedPermissions": [],
      "lifecycleState": "STAGED",
      "maturityState": "partial",
      "implementationState": "source-verified",
      "relatedPages": [
        "location.shared-map-configuration",
        "catalog.product-discovery-management",
        "commerce.cart-order",
        "order.management-lifecycle",
        "commerce.returns-refunds",
        "waste.impact-providers"
      ],
      "visualRequirements": [
        "diagram",
        "table",
        "code-example"
      ],
      "searchKeywords": [
        "eWaste",
        "reusable accelerator",
        "customer-journey",
        "source-reviewed"
      ],
      "topicKeywords": [
        "Circa customer journey",
        "eligibility limits",
        "owner authority",
        "customization"
      ],
      "headings": [
        {
          "text": "Connected eWaste customer journey",
          "anchor": "circaCustomerJourney-1-connected-circa-local-customer-journey",
          "level": 2
        },
        {
          "text": "Scope and authority",
          "anchor": "circaCustomerJourney-2-scope-and-authority",
          "level": 2
        },
        {
          "text": "Compose the required owner topology",
          "anchor": "circaCustomerJourney-3-start-the-local-topology",
          "level": 2
        },
        {
          "text": "Governed sample import",
          "anchor": "circaCustomerJourney-4-governed-sample-import",
          "level": 2
        },
        {
          "text": "Restore the collection network after a local reset",
          "anchor": "circaCustomerJourney-5-restore-the-collection-network-after-a-local-reset",
          "level": 3
        },
        {
          "text": "Commerce publication",
          "anchor": "circaCustomerJourney-6-commerce-publication",
          "level": 2
        },
        {
          "text": "Walk through the experience",
          "anchor": "circaCustomerJourney-7-walk-through-the-experience",
          "level": 2
        },
        {
          "text": "Shared journey service and channel boundaries",
          "anchor": "circaCustomerJourney-8-shared-web-and-telegram-submission-implementation-2026-09-09",
          "level": 2
        },
        {
          "text": "Local Telegram launch recovery",
          "anchor": "circaCustomerJourney-9-local-telegram-launch-recovery",
          "level": 3
        },
        {
          "text": "Evidence and current state",
          "anchor": "circaCustomerJourney-10-evidence-and-current-state",
          "level": 2
        },
        {
          "text": "Deployment gates",
          "anchor": "circaCustomerJourney-11-deployment-gates",
          "level": 2
        },
        {
          "text": "Domain accelerator consolidation",
          "anchor": "circaCustomerJourney-12-domain-accelerator-consolidation",
          "level": 2
        },
        {
          "text": "Operational roles and independent approval",
          "anchor": "circaCustomerJourney-13-operational-roles-and-independent-approval",
          "level": 2
        },
        {
          "text": "Negotiated purchases and merchant operations",
          "anchor": "circaCustomerJourney-14-negotiated-purchases-and-merchant-operations",
          "level": 2
        },
        {
          "text": "Enterprise merchant fulfillment and refunds",
          "anchor": "circaCustomerJourney-15-enterprise-merchant-fulfillment-and-refunds",
          "level": 2
        },
        {
          "text": "Account and channel ownership",
          "anchor": "circaCustomerJourney-16-account-and-channel-ownership",
          "level": 2
        },
        {
          "text": "Audience and Ownership Checks",
          "anchor": "circa-customer-journey-audience-owner-checks",
          "level": 2
        },
        {
          "text": "Customize and extend safely",
          "anchor": "circa-customer-journey-customize-and-extend-safely",
          "level": 2
        },
        {
          "text": "Common Mistakes",
          "anchor": "circa-customer-journey-common-mistakes",
          "level": 2
        },
        {
          "text": "Verification",
          "anchor": "circa-customer-journey-verification",
          "level": 2
        }
      ],
      "blocks": [
        {
          "kind": "paragraph",
          "text": "Circa is retained as this documentation family's stable identity. This guide describes the reusable eWaste orchestration available to any customer application; customer-specific topology, passwords, cohort data, policy roots and historical live results are deliberately not framework instructions."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Connected eWaste customer journey",
          "anchor": "circaCustomerJourney-1-connected-circa-local-customer-journey"
        },
        {
          "kind": "paragraph",
          "text": "This is a reusable adoption and assurance journey, not evidence that a particular Circa installation passed. Source review identifies operations and their limits. The connected sequence must still be qualified with real customer and employee sessions, configured providers, current centre eligibility, actual owner receipts and approved deployment policy."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Scope and authority",
          "anchor": "circaCustomerJourney-2-scope-and-authority"
        },
        {
          "kind": "paragraph",
          "text": "eWaste owns reusable electronic-waste orchestration, not a parallel domain database. Waste stores submissions, reviews, assets, physical receipts and ownership events; Profile owns identity and operational scopes; Media owns original evidence; Copilot supplies advisory language/extraction; Loyalty owns balances and ledger entries; Commerce owns products, prices, stock, orders and entitlements; Location owns geographic records and distance arithmetic. An application owns its name, deployment, presentation and intentional policy deltas."
        },
        {
          "kind": "paragraph",
          "text": "Environmental providers are selected in effective Waste Impact configuration. The accelerator contains optional OpenAI and WARM adapters; their presence does not prove either is selected, reachable or locally applicable. Preserve source geography, factor/version and weight bounds. A prospective estimate, reference proxy or carbon label is not a certified credit, measured treatment or achieved recycling."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Compose the required owner topology",
          "anchor": "circaCustomerJourney-3-start-the-local-topology"
        },
        {
          "kind": "paragraph",
          "text": "Compose the customer's existing runtime graph and required owner connections; no fixed port, application checkout, model name or all-server start command is part of this accelerator. Catalogue/checkout additionally need the appropriate Commerce owner; channel entry needs Profile policy; photo preparation needs Waste, Media and analysis services. Geographic projections use Location-owned reads, while distance arithmetic is imported as a dependency-free helper rather than requiring Location services inside Waste."
        },
        {
          "kind": "paragraph",
          "text": "Use the source-backed readiness operation GET /nodics/eWaste/v0/readiness/acceptance with its configured staff/service authorization. It reports local service/configuration and masked credential-presence prerequisites; it sends no provider calls and runs no customer workflow. READY is not live acceptance, and the Telegram/OpenAI-oriented report is not a universal validator for all deployments. Resolve owner blockers without printing secrets or borrowing customer authority."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Governed sample import",
          "anchor": "circaCustomerJourney-4-governed-sample-import"
        },
        {
          "kind": "paragraph",
          "text": "Reusable reference presets are selected separately from customer samples and documentation. eWaste:core-reference currently selects core-v001 version 0.0.1 explicitly for Waste destinations. The optional referenceDocumentation CONTENT_PACK targets WCMS Staged and contains these four guides plus navigation. Neither selection installs customer identities, balances, issued coupon codes or customer transaction history."
        },
        {
          "kind": "table",
          "headers": [
            "Selection",
            "Authority and scope",
            "Not established"
          ],
          "rows": [
            [
              "eWaste:core-reference",
              "eWaste presets into existing Waste schemas via nImport",
              "Customer setup, accepted item at a centre or live reward policy"
            ],
            [
              "referenceDocumentation",
              "Optional canonical CMS guide pack to WCMS Staged",
              "Business data installation, Process approval or public delivery"
            ],
            [
              "Customer releases",
              "Explicitly selected project-owned records and exact owner destinations",
              "Automatic stock admission, legal consent or whole-journey acceptance"
            ]
          ]
        },
        {
          "kind": "paragraph",
          "text": "Follow llm/contracts/reference-compatibility.md for exact expectedReleases selection, dependency receipts, source-root/key/header alignment and installed adoption. An authenticated import preflight is not a completed row import. Retain destination receipts and original evidence. Never replay sample wallets, balances, ownership events or single-use codes over customer activity."
        },
        {
          "kind": "heading",
          "level": 3,
          "text": "Restore the collection network after a local reset",
          "anchor": "circaCustomerJourney-5-restore-the-collection-network-after-a-local-reset"
        },
        {
          "kind": "paragraph",
          "text": "Restore only explicitly selected collection/Profile/Location releases through existing nImport owner operations after inspecting installed state. Do not create copied centre records, write the database directly or assume server startup restores data. Actual coordinates and addresses belong to Location/Profile, while collection status and acceptance belong to Waste."
        },
        {
          "kind": "paragraph",
          "text": "Public eWaste experience queries active=true, operatingStatus=ACTIVE and publicVisibility=PUBLIC, with at most 100 centres in its current request. Missing enrichment is reported in unavailableSources; arrival removes centres without finite ACTIVE Location coordinates. This is a bounded public discovery set, not every centre or an item-specific eligible network."
        },
        {
          "kind": "paragraph",
          "text": "The fresh-arrival service chooses nearby centres by distance, not by evaluating wasteCollectionAcceptanceRule or opening hours. Waste validateFacts separately checks active taxonomy, allowed family, current centre operating/public status and metadata.acceptedCategoryCodes when an array exists. A missing array imposes no category restriction in this path; that helper also does not independently check centre.active. Do not describe these checks as complete item-specific eligibility, full preset-policy evaluation or guaranteed opening hours. Qualify any stronger requirement through its owning collection integration before launch."
        },
        {
          "kind": "paragraph",
          "text": "For geographic display and provider configuration, use [Shared Map Configuration](/docs/framework/location-shared-map-configuration#locationSharedMapConfiguration-2-providers-coordinates-and-safe-presentation), document location.shared-map-configuration owned by locationMap. Map selection and directions never prove arrival or physical custody."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Commerce publication",
          "anchor": "circaCustomerJourney-6-commerce-publication"
        },
        {
          "kind": "paragraph",
          "text": "Import is not publication. Published Product and policy delivery, Promotion-issued rights and Inventory-admitted stock remain separate owning-domain decisions. Use [Product management](/docs/framework/catalog-product-discovery-management#catalogProductDiscoveryManagement-5-operations-and-governance) and [Cart and Order](/docs/framework/commerce-cart-order#commerceCartOrder-4-operator-and-devops-guidance) rather than copying Commerce publication commands, roots or approval scripts into an accelerator guide."
        },
        {
          "kind": "paragraph",
          "text": "eWaste.marketplace.autoPublishListings defaults false. A selected later policy may enable the existing listing orchestration, but source configuration is not a publication receipt or customer-visible discovery proof. Preserve the configured orderCodePrefix across upgrades/retries. Never restore unqualified projection snapshots or synthesize approval evidence to clear a demonstration blocker."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Walk through the experience",
          "anchor": "circaCustomerJourney-7-walk-through-the-experience"
        },
        {
          "kind": "ordered-list",
          "items": [
            "Use a controlled Profile customer account and verify its owner-scoped read, not just successful login.",
            "Read the live public centre projection and item policy. In a fresh-arrival application, obtain new device coordinates and choose the supported nearby centre through the explicitly wired journey adapter.",
            "Prepare a bounded photo. The accelerator accepts canonical base64 JPEG/PNG/WebP up to the inherited 5242880-byte limit; it analyzes before Media/submission persistence. Recognition fallback is a held manual-review path, not a confident classification.",
            "Inspect the saved draft, retained original photo, known/unknown facts and assessment limits. Customer edits are restricted to name and description; classification, quantity, measurements and environmental properties are business-reviewed.",
            "Confirm explicitly with the current revision and stable command reference. Read the canonical acknowledgement/status before retrying an uncertain result. A saved draft or receipt is not physical deposit.",
            "Have appropriately authorized staff CLAIM, verify, reread the persisted QUEUE handoff and revision, then CLAIM again before approval/rejection, including a same-employee decision where policy permits. Inspect original evidence and public feedback. Approved status is not proof of completed reward settlement.",
            "Inspect the persisted confirmed reward assessment and actual Loyalty references. A missing published Rules policy must not invent value.",
            "Only then exercise optional gift/listing/purchase flows through their existing owners. Digital ownership transfer does not prove physical transport, inspection or fulfillment."
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Shared journey service and channel boundaries",
          "anchor": "circaCustomerJourney-8-shared-web-and-telegram-submission-implementation-2026-09-09"
        },
        {
          "kind": "paragraph",
          "text": "DefaultEWasteJourneyService implements previewArrival, arrival, prepareSubmission, attachPhoto, analyzePhoto, prepare and confirm over Waste owners. Its effective policy requires positive numeric arrivalRadiusMetres, maximumPositionAgeMs and captureTimeoutMs, plus integer nearestCentreCount at least three. Framework defaults provide 60000 ms freshness, 12000 ms capture timeout and three centres, but no radius. Missing radius fails ERR_EWASTE_JOURNEY_UNAVAILABLE; a 100-metre application setting is not a universal default."
        },
        {
          "kind": "paragraph",
          "text": "The service uses inclusive unrounded direct distance. Observations at the maximum age are accepted, and up to 5000 ms future skew is accepted; beyond either bound returns ERR_EWASTE_POSITION_STALE. Invalid coordinates/timestamp return ERR_EWASTE_POSITION_INVALID. Accuracy is optional metadata, with invalid/missing mapped to null; it is not an arrival gate. Device coordinates are client observations, not tamper-proof presence proof. captureTimeoutMs is projected policy for the host; it does not itself time out the device capture."
        },
        {
          "kind": "paragraph",
          "text": "Crucial wiring boundary: DefaultEWasteExperienceController uses DefaultEWasteRequestService's default DefaultEWasteExperienceService, whose confirm directly delegates to Waste. Native eWaste routes do not automatically select the fresh-arrival service or expose previewArrival. An application must wire a trusted controller/adapter to the supported Journey service before promising arrival enforcement. Body-provided service, distance, origin or arrival assertions confer no authority."
        },
        {
          "kind": "paragraph",
          "text": "In that wired journey, preview writes no Waste record, early empty-draft creation rejects, and attaching/confirming rechecks stored observation against current centre coordinates. Rejected checks retain saved evidence. Changing centre clears derived estimate/confirmation revision. Completed same-command confirmation replays the existing result before a new arrival check; do not interpret a replay as a new current-presence observation."
        },
        {
          "kind": "heading",
          "level": 3,
          "text": "Local Telegram launch recovery",
          "anchor": "circaCustomerJourney-9-local-telegram-launch-recovery"
        },
        {
          "kind": "paragraph",
          "text": "The application host owns its HTTPS entry points and device adapters; no tunnel URL or bot endpoint is embedded in this reusable guide. eWaste channelAuthentication defaults disabled. Enabled channels require a configured Profile application and proof validation. Profile owns signatures, links and the one-use browser handoff; a signed launch is not a customer access token."
        },
        {
          "kind": "paragraph",
          "text": "On lost/expired handoff, request fresh entry. Unlinked accounts use the shared account form; link conflicts must not transfer account ownership. Explicit logout must leave the form usable without an automatic sign-in loop. Keep credentials in private runtime configuration. Native Telegram location/camera behavior, real channel delivery and a future WhatsApp adapter need separate acceptance; emulated WebView or browser GPS proves none of them."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Evidence and current state",
          "anchor": "circaCustomerJourney-10-evidence-and-current-state"
        },
        {
          "kind": "paragraph",
          "text": "This source review does not verify any installed count, customer balance, private test run, provider response or browser result. Historical test-count and local-session narratives are not current reusable guarantees. Preserve original owner evidence in its actual authorized test context, not as a blanket acceptance claim in this guide."
        },
        {
          "kind": "paragraph",
          "text": "Source fixtures cover independent arrival policy, catalogue bounds, guidance history, preparation, scoped review and settlement. Tests were inspected, not executed here. Distinguish source correctness, installed import, reviewer eligibility, signed-in channel acceptance, approval, settlement, notification delivery and physical receipt. A CURRENT import status alone must be read alongside the actual run work/outcome; a zero-work import does not prove records were installed."
        },
        {
          "kind": "paragraph",
          "text": "Existing paginated /review-workspace source supports scoped counts/detail, employee assignment and explicit recovery. Its presence corrects older statements that every history/count or assignment workflow is absent, but does not certify complete Axis screens or reviewer/live acceptance. The legacy /reviews queue still takes 100 visible entries from 500 candidates; do not call that an exhaustive audit export."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Deployment gates",
          "anchor": "circaCustomerJourney-11-deployment-gates"
        },
        {
          "kind": "unordered-list",
          "items": [
            "Qualify item-specific collection acceptance and opening-hour policy; distance and public visibility alone are insufficient.",
            "Qualify actual reviewer claims, Profile scopes, verification/approval policy, role separation and private evidence access with distinct authorized sessions.",
            "Qualify selected analysis/environmental providers and keep unknowns, source provenance and manual holds visible.",
            "Qualify merchant consent, issued coupon rights, operational stock, payment and refunds through Commerce owners.",
            "Keep camera/location on physical devices, source-channel delivery, accessibility and distributed crash/reconciliation acceptance separate.",
            "Submission, approval, physical receipt, completed recycling and certified environmental claims require different evidence."
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Domain accelerator consolidation",
          "anchor": "circaCustomerJourney-12-domain-accelerator-consolidation"
        },
        {
          "kind": "paragraph",
          "text": "The canonical reusable domain boundary is eWaste and /nodics/eWaste/v0 with capability-owned exposure policy. Application composition and frontend routes are not new framework authorities. Later layers use CONFIG.eWaste for supported domain deltas and their own namespaces for branding. Do not introduce a second submission, wallet, coupon, location or accelerator identity."
        },
        {
          "kind": "paragraph",
          "text": "Preserve installed applicationCode, orderCodePrefix, assessment identities and original command references through upgrades. Source reorganization is not authorization to reimport business transactions, relabel historical environmental results or reset ledgers. Packaging, integration and deployment must be qualified separately."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Operational roles and independent approval",
          "anchor": "circaCustomerJourney-13-operational-roles-and-independent-approval"
        },
        {
          "kind": "paragraph",
          "text": "Profile owns real employee identity and scopes; imported role names or fictional personas are not reviewer eligibility. Waste requires a human principal with the exact operation grant. waste.operations.requireScopes, requireVerification and requireDifferentApprover default false in shared source. Enable the intended policy explicitly in a later deployment and qualify it before claiming scoped or independent review."
        },
        {
          "kind": "table",
          "headers": [
            "Operation",
            "Required backend grant",
            "Additional source boundary"
          ],
          "rows": [
            [
              "Read queue/detail",
              "waste.review.queue.read",
              "Effective scope, not frontend visibility"
            ],
            [
              "Read original evidence",
              "waste.review.evidence.read",
              "Separate private-evidence authorization"
            ],
            [
              "Verify facts",
              "waste.verification.record",
              "Claim, explicit confirmation and revision; no asset/reward"
            ],
            [
              "Approve/reject",
              "waste.review.approve",
              "Claim and configured verification/separate-actor checks"
            ],
            [
              "Audit",
              "waste.audit.read",
              "Read-only evidence, not mutation authority"
            ]
          ]
        },
        {
          "kind": "paragraph",
          "text": "Current /review-workspace/:code/assignment supports confirmed CLAIM/RELEASE for the caller's own employee identity, current expectedRevision and stable command. The mandatory sequence is CLAIM -> verify -> QUEUE -> reread revision -> CLAIM -> approve/reject. Verification persists a QUEUE handoff and leaves the submission UNDER_REVIEW; it does not retain the employee claim or approve the item. Reread the current owner detail and revision after verification, then submit a new, explicitly confirmed CLAIM command before the decision. This applies even when the same reviewer has both verification and approval grants and requireDifferentApprover is false. Pass the current expectedRevision on every mutation and use a distinct stable idempotency key for each new command. Reread again after the second CLAIM so the decision uses its acknowledged revision. An unclaimed decision rejects with ERR_WASTE_ASSIGNMENT_REQUIRED; a different employee claim rejects with ERR_WASTE_ASSIGNMENT_CONFLICT. A stale revision requires readback and reconciliation, not a guessed increment or a new verification. A completed verification replay remains idempotent but does not restore a claim. If separation of duties is enabled, only a different currently authorized employee may make the second claim and decision. Recovery of an already saved decision follows the original owner command and is not a fresh approval. A queue label assigned during customer confirmation is not an employee claim. The detailed owner-reviewed sequence and rejection/recovery table are in [review and decision flow](/docs/framework/accelerators/circa/operations#acceleratorsCircaOperationsRewards-2-review-and-decision-screen-flow); this reference guide does not replace the Waste owner contract."
        },
        {
          "kind": "paragraph",
          "text": "With scopes enabled, Waste resolves /identity/scopes/me using the employee bearer and preserves deny semantics; missing owner resolution blocks access. Verification cannot change the assigned centre. Final rejection needs a reason, and requireVerification prevents approval from silently rewriting verified facts. When requireDifferentApprover is true, the verifier cannot make the final decision; otherwise a human with both grants may do both with distinct evidence. Neither state is implied by this editorial staging."
        },
        {
          "kind": "paragraph",
          "text": "For uncertain decisions, refresh the record and use the owning recovery action with original command/evidence. Do not start a new decision or settle again just to clear pending status. Notifications use recorded immutable outcome/comment and Communication-owned intent/delivery; a delayed message does not undo approval and must not cause a blind decision replay."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Negotiated purchases and merchant operations",
          "anchor": "circaCustomerJourney-14-negotiated-purchases-and-merchant-operations"
        },
        {
          "kind": "paragraph",
          "text": "eWaste consumes Commerce bidding and checkout for eligible asset provenance/store, and delegates merchant claim and order-review operations. Customer-specific bid validity, prices, partner terms and merchant adapters are not accelerator defaults. Holds, payment and accepted quotes stay Commerce-owned; ownership changes only after its completed result."
        },
        {
          "kind": "paragraph",
          "text": "A request for cancellation/refund/dispute is a case, not a finished refund. Use [Order management](/docs/framework/order-management-lifecycle#orderManagementLifecycle-5-operations-and-governance), document order.management-lifecycle owned by order. Do not duplicate its policy/reviewer/receipt instructions here or infer external POS/physical fulfillment from a local provider result."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Enterprise merchant fulfillment and refunds",
          "anchor": "circaCustomerJourney-15-enterprise-merchant-fulfillment-and-refunds"
        },
        {
          "kind": "paragraph",
          "text": "Profile owns issuing-enterprise employee qualification; Commerce owns merchant authorization, entitlement redemption and refund decisions. eWaste's service-only reversal port checks original completed sale/current buyer and recoverable original proceeds/carbon before restoring digital ownership. Original submission rewards are not revalued. An onward transfer or unavailable recovery requires manual resolution, not a fabricated success."
        },
        {
          "kind": "paragraph",
          "text": "See [Returns and Refunds](/docs/framework/commerce-returns-refunds#commerceReturnsRefunds-10-return-receipt-and-reversal-calculation-coverage), document commerce.returns-refunds owned by order, for the authoritative lifecycle. This guide makes no current merchant receipt, actual delivery, refund or whole-owner financial qualification claim."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Account and channel ownership",
          "anchor": "circaCustomerJourney-16-account-and-channel-ownership"
        },
        {
          "kind": "paragraph",
          "text": "Customer self-resolution uses the authenticated Profile bearer and canonical login, not request-body owner selectors or an employee token. Account workspace reads remain owner-scoped. Channel policy chooses a server-configured application; Profile owns proof validation, canonical links and browser handoff/session security. A matching email, name or channel ID is not proof of account ownership."
        },
        {
          "kind": "paragraph",
          "text": "Environmental assessment and advisory recognition are separate stages. Customers may correct only their allowed text fields; staff validates classification and measurements. A valid INPUT_ONLY assessment may satisfy the configured partial-coverage contract, but missing, failed, mock or empty environmental assessment cannot confirm a mandatory eWaste submission. Preserve the limitation and resolve the actual provider/input error instead of inventing carbon. Later assessment history/selection never revalues an existing reward settlement. Use [Waste Impact providers](/docs/framework/waste-impact-providers#wasteImpactProviders-8-environmental-properties-and-credit-status), owned by wasteImpact, for those evidence semantics."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Audience and Ownership Checks",
          "anchor": "circa-customer-journey-audience-owner-checks"
        },
        {
          "kind": "paragraph",
          "text": "Beginners follow one controlled item from public centre information to saved acknowledgement. Business evaluators assess the separation of advisory, digital and physical outcomes. Administrators choose real policy and identity assignments; operators retain owner results before retry. Developers, QA and AI tools prove trusted service selection, current eligibility and rejected paths. Maintainers preserve source authority and separate application adoption from reusable defaults."
        },
        {
          "kind": "diagram",
          "language": "mermaid",
          "text": "flowchart TD\n  Adapter[Qualified trusted journey adapter] --> Arrival[Fresh observation and current centre]\n  Arrival --> Photo[Bounded private photo and advisory analysis]\n  Photo --> Draft[Saved editable draft and assessment limits]\n  Draft --> Confirm[Explicit customer confirmation]\n  Confirm --> Ack[Waste acknowledgement]\n  Ack --> ClaimForVerification[Authorized employee CLAIM]\n  ClaimForVerification --> Verify[Save verified facts]\n  Verify --> QueueHandoff[Persisted QUEUE handoff]\n  QueueHandoff --> CurrentRevision[Reread current revision]\n  CurrentRevision --> ClaimForDecision[Second CLAIM even same reviewer]\n  ClaimForDecision --> Decision[Approve or reject with claim revision]\n  Decision --> Settlement[Separate confirmed reward and Loyalty evidence]\n  Decision --> Physical[Separate physical receipt evidence]"
        },
        {
          "kind": "table",
          "headers": [
            "Failure",
            "Recovery boundary"
          ],
          "rows": [
            [
              "Missing radius / stale observation",
              "Correct project policy or reacquire location; retain saved photo."
            ],
            [
              "Item not accepted",
              "Choose a genuinely accepting centre through current owner policy; do not change facts to bypass rejection."
            ],
            [
              "Reviewer claim/scope denied",
              "Resolve actual authorized assignment; never borrow an account."
            ],
            [
              "Settlement or notification pending",
              "Inspect original owner evidence and recover that operation only."
            ]
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Customize and extend safely",
          "anchor": "circa-customer-journey-customize-and-extend-safely"
        },
        {
          "kind": "paragraph",
          "text": "Prerequisites: a later-loaded customer module with eWaste inheritance, working owner transports and a trusted controller explicitly wired to DefaultEWasteJourneyService for the fresh-arrival operations. In the customer's config/properties.js, set only the intentional policy differences below. These are illustrative customer decisions, not universal safe distances or a complete deployable module."
        },
        {
          "kind": "code",
          "language": "javascript",
          "text": "module.exports = {\n  eWaste: { journey: { arrivalRadiusMetres: 150 } },\n  waste: { operations: {\n    requireScopes: true,\n    requireVerification: true,\n    requireDifferentApprover: true\n  } }\n};"
        },
        {
          "kind": "paragraph",
          "text": "The Journey service then inherits 60000/12000 ms technical limits and three centres. A reported point exactly 150 metres away qualifies; 150.00001 does not. Missing/nonfinite/string radius fails before arrival. Verified facts need a different eligible human approver under this policy, with real Profile scope and assignment handoff. Configuration alone neither wires native routes nor grants staff permission."
        },
        {
          "kind": "paragraph",
          "text": "Use project-owned src/controller and a small loader-visible src/service adapter to select the supported service on the server; do not copy arrival math, scope evaluation, schemas or review persistence. Test effective defaults plus deltas, trusted mapping and rejected operations before replacing prior project policy. Roll back only the deliberate policy/adapter difference; retain drafts, photos, assessments, commands and ledgers. Stricter policy may leave existing open work needing an authorized handoff, never a database reset."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Common Mistakes",
          "anchor": "circa-customer-journey-common-mistakes"
        },
        {
          "kind": "unordered-list",
          "items": [
            "Calling raw eWaste confirm and assuming a fresh-arrival adapter was selected.",
            "Treating a map marker, accepted-category template or missing restrictions as complete eligibility.",
            "Claiming independent review with shared defaults or a queue label instead of a real employee claim.",
            "Replaying wallets, decisions, single-use coupons or approval rewards to repair a demonstration.",
            "Treating readiness, CMS staging/publication, emulated GPS or historic checks as current live acceptance."
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Verification",
          "anchor": "circa-customer-journey-verification"
        },
        {
          "kind": "paragraph",
          "text": "Future qualification must cover default/missing/custom radius, exact distance and time boundaries, optional accuracy, invalid/moved/disabled centres, stale revision, completed replay, unknown taxonomy, manual hold, private photo and cross-customer denial. Exercise reviewer claim conflicts, scopes and both independent/same-actor policy modes with real separate accounts. Then qualify settlement, notification and channel/browser behavior independently. No runtime, import, test or browser command was executed by this source review."
        },
        {
          "kind": "code",
          "language": "bash",
          "text": "# From the eWaste module; source-test guidance, not executed here.\nnode --test test/eWasteJourneyService.test.js test/eWastePreparation.test.js test/eWasteCollectionVisibilityContract.test.js"
        },
        {
          "kind": "paragraph",
          "text": "STAGED authoring and an active route enable publication selection. They do not establish Process approval, an Online version or qualification of eligibility, reviewer or customer operations. Refresh source counts and integrity metadata before import, then follow normal publication and separately qualify the business journey."
        }
      ],
      "searchText": "Circa customer journey Reusable eWaste customer, evidence and review orchestration with explicit arrival wiring, limited eligibility, real reviewer policy and separate live acceptance gates. # Circa customer journey\n\nCirca is retained as this documentation family's stable identity. This guide describes the reusable eWaste orchestration available to any customer application; customer-specific topology, passwords, cohort data, policy roots and historical live results are deliberately not framework instructions.\n\n## Connected eWaste customer journey\n\nThis is a reusable adoption and assurance journey, not evidence that a particular Circa installation passed. Source review identifies operations and their limits. The connected sequence must still be qualified with real customer and employee sessions, configured providers, current centre eligibility, actual owner receipts and approved deployment policy.\n\n## Scope and authority\n\neWaste owns reusable electronic-waste orchestration, not a parallel domain database. Waste stores submissions, reviews, assets, physical receipts and ownership events; Profile owns identity and operational scopes; Media owns original evidence; Copilot supplies advisory language/extraction; Loyalty owns balances and ledger entries; Commerce owns products, prices, stock, orders and entitlements; Location owns geographic records and distance arithmetic. An application owns its name, deployment, presentation and intentional policy deltas.\n\nEnvironmental providers are selected in effective Waste Impact configuration. The accelerator contains optional OpenAI and WARM adapters; their presence does not prove either is selected, reachable or locally applicable. Preserve source geography, factor/version and weight bounds. A prospective estimate, reference proxy or carbon label is not a certified credit, measured treatment or achieved recycling.\n\n## Compose the required owner topology\n\nCompose the customer's existing runtime graph and required owner connections; no fixed port, application checkout, model name or all-server start command is part of this accelerator. Catalogue/checkout additionally need the appropriate Commerce owner; channel entry needs Profile policy; photo preparation needs Waste, Media and analysis services. Geographic projections use Location-owned reads, while distance arithmetic is imported as a dependency-free helper rather than requiring Location services inside Waste.\n\nUse the source-backed readiness operation GET /nodics/eWaste/v0/readiness/acceptance with its configured staff/service authorization. It reports local service/configuration and masked credential-presence prerequisites; it sends no provider calls and runs no customer workflow. READY is not live acceptance, and the Telegram/OpenAI-oriented report is not a universal validator for all deployments. Resolve owner blockers without printing secrets or borrowing customer authority.\n\n## Governed sample import\n\nReusable reference presets are selected separately from customer samples and documentation. eWaste:core-reference currently selects core-v001 version 0.0.1 explicitly for Waste destinations. The optional referenceDocumentation CONTENT_PACK targets WCMS Staged and contains these four guides plus navigation. Neither selection installs customer identities, balances, issued coupon codes or customer transaction history.\n\n| Selection | Authority and scope | Not established |\n| --- | --- | --- |\n| eWaste:core-reference | eWaste presets into existing Waste schemas via nImport | Customer setup, accepted item at a centre or live reward policy |\n| referenceDocumentation | Optional canonical CMS guide pack to WCMS Staged | Business data installation, Process approval or public delivery |\n| Customer releases | Explicitly selected project-owned records and exact owner destinations | Automatic stock admission, legal consent or whole-journey acceptance |\n\nFollow llm/contracts/reference-compatibility.md for exact expectedReleases selection, dependency receipts, source-root/key/header alignment and installed adoption. An authenticated import preflight is not a completed row import. Retain destination receipts and original evidence. Never replay sample wallets, balances, ownership events or single-use codes over customer activity.\n\n### Restore the collection network after a local reset\n\nRestore only explicitly selected collection/Profile/Location releases through existing nImport owner operations after inspecting installed state. Do not create copied centre records, write the database directly or assume server startup restores data. Actual coordinates and addresses belong to Location/Profile, while collection status and acceptance belong to Waste.\n\nPublic eWaste experience queries active=true, operatingStatus=ACTIVE and publicVisibility=PUBLIC, with at most 100 centres in its current request. Missing enrichment is reported in unavailableSources; arrival removes centres without finite ACTIVE Location coordinates. This is a bounded public discovery set, not every centre or an item-specific eligible network.\n\nThe fresh-arrival service chooses nearby centres by distance, not by evaluating wasteCollectionAcceptanceRule or opening hours. Waste validateFacts separately checks active taxonomy, allowed family, current centre operating/public status and metadata.acceptedCategoryCodes when an array exists. A missing array imposes no category restriction in this path; that helper also does not independently check centre.active. Do not describe these checks as complete item-specific eligibility, full preset-policy evaluation or guaranteed opening hours. Qualify any stronger requirement through its owning collection integration before launch.\n\nFor geographic display and provider configuration, use [Shared Map Configuration](/docs/framework/location-shared-map-configuration#locationSharedMapConfiguration-2-providers-coordinates-and-safe-presentation), document location.shared-map-configuration owned by locationMap. Map selection and directions never prove arrival or physical custody.\n\n## Commerce publication\n\nImport is not publication. Published Product and policy delivery, Promotion-issued rights and Inventory-admitted stock remain separate owning-domain decisions. Use [Product management](/docs/framework/catalog-product-discovery-management#catalogProductDiscoveryManagement-5-operations-and-governance) and [Cart and Order](/docs/framework/commerce-cart-order#commerceCartOrder-4-operator-and-devops-guidance) rather than copying Commerce publication commands, roots or approval scripts into an accelerator guide.\n\neWaste.marketplace.autoPublishListings defaults false. A selected later policy may enable the existing listing orchestration, but source configuration is not a publication receipt or customer-visible discovery proof. Preserve the configured orderCodePrefix across upgrades/retries. Never restore unqualified projection snapshots or synthesize approval evidence to clear a demonstration blocker.\n\n## Walk through the experience\n\n1. Use a controlled Profile customer account and verify its owner-scoped read, not just successful login.\n2. Read the live public centre projection and item policy. In a fresh-arrival application, obtain new device coordinates and choose the supported nearby centre through the explicitly wired journey adapter.\n3. Prepare a bounded photo. The accelerator accepts canonical base64 JPEG/PNG/WebP up to the inherited 5242880-byte limit; it analyzes before Media/submission persistence. Recognition fallback is a held manual-review path, not a confident classification.\n4. Inspect the saved draft, retained original photo, known/unknown facts and assessment limits. Customer edits are restricted to name and description; classification, quantity, measurements and environmental properties are business-reviewed.\n5. Confirm explicitly with the current revision and stable command reference. Read the canonical acknowledgement/status before retrying an uncertain result. A saved draft or receipt is not physical deposit.\n6. Have appropriately authorized staff CLAIM, verify, reread the persisted QUEUE handoff and revision, then CLAIM again before approval/rejection, including a same-employee decision where policy permits. Inspect original evidence and public feedback. Approved status is not proof of completed reward settlement.\n7. Inspect the persisted confirmed reward assessment and actual Loyalty references. A missing published Rules policy must not invent value.\n8. Only then exercise optional gift/listing/purchase flows through their existing owners. Digital ownership transfer does not prove physical transport, inspection or fulfillment.\n\n## Shared journey service and channel boundaries\n\nDefaultEWasteJourneyService implements previewArrival, arrival, prepareSubmission, attachPhoto, analyzePhoto, prepare and confirm over Waste owners. Its effective policy requires positive numeric arrivalRadiusMetres, maximumPositionAgeMs and captureTimeoutMs, plus integer nearestCentreCount at least three. Framework defaults provide 60000 ms freshness, 12000 ms capture timeout and three centres, but no radius. Missing radius fails ERR_EWASTE_JOURNEY_UNAVAILABLE; a 100-metre application setting is not a universal default.\n\nThe service uses inclusive unrounded direct distance. Observations at the maximum age are accepted, and up to 5000 ms future skew is accepted; beyond either bound returns ERR_EWASTE_POSITION_STALE. Invalid coordinates/timestamp return ERR_EWASTE_POSITION_INVALID. Accuracy is optional metadata, with invalid/missing mapped to null; it is not an arrival gate. Device coordinates are client observations, not tamper-proof presence proof. captureTimeoutMs is projected policy for the host; it does not itself time out the device capture.\n\nCrucial wiring boundary: DefaultEWasteExperienceController uses DefaultEWasteRequestService's default DefaultEWasteExperienceService, whose confirm directly delegates to Waste. Native eWaste routes do not automatically select the fresh-arrival service or expose previewArrival. An application must wire a trusted controller/adapter to the supported Journey service before promising arrival enforcement. Body-provided service, distance, origin or arrival assertions confer no authority.\n\nIn that wired journey, preview writes no Waste record, early empty-draft creation rejects, and attaching/confirming rechecks stored observation against current centre coordinates. Rejected checks retain saved evidence. Changing centre clears derived estimate/confirmation revision. Completed same-command confirmation replays the existing result before a new arrival check; do not interpret a replay as a new current-presence observation.\n\n### Local Telegram launch recovery\n\nThe application host owns its HTTPS entry points and device adapters; no tunnel URL or bot endpoint is embedded in this reusable guide. eWaste channelAuthentication defaults disabled. Enabled channels require a configured Profile application and proof validation. Profile owns signatures, links and the one-use browser handoff; a signed launch is not a customer access token.\n\nOn lost/expired handoff, request fresh entry. Unlinked accounts use the shared account form; link conflicts must not transfer account ownership. Explicit logout must leave the form usable without an automatic sign-in loop. Keep credentials in private runtime configuration. Native Telegram location/camera behavior, real channel delivery and a future WhatsApp adapter need separate acceptance; emulated WebView or browser GPS proves none of them.\n\n## Evidence and current state\n\nThis source review does not verify any installed count, customer balance, private test run, provider response or browser result. Historical test-count and local-session narratives are not current reusable guarantees. Preserve original owner evidence in its actual authorized test context, not as a blanket acceptance claim in this guide.\n\nSource fixtures cover independent arrival policy, catalogue bounds, guidance history, preparation, scoped review and settlement. Tests were inspected, not executed here. Distinguish source correctness, installed import, reviewer eligibility, signed-in channel acceptance, approval, settlement, notification delivery and physical receipt. A CURRENT import status alone must be read alongside the actual run work/outcome; a zero-work import does not prove records were installed.\n\nExisting paginated /review-workspace source supports scoped counts/detail, employee assignment and explicit recovery. Its presence corrects older statements that every history/count or assignment workflow is absent, but does not certify complete Axis screens or reviewer/live acceptance. The legacy /reviews queue still takes 100 visible entries from 500 candidates; do not call that an exhaustive audit export.\n\n## Deployment gates\n\n- Qualify item-specific collection acceptance and opening-hour policy; distance and public visibility alone are insufficient.\n- Qualify actual reviewer claims, Profile scopes, verification/approval policy, role separation and private evidence access with distinct authorized sessions.\n- Qualify selected analysis/environmental providers and keep unknowns, source provenance and manual holds visible.\n- Qualify merchant consent, issued coupon rights, operational stock, payment and refunds through Commerce owners.\n- Keep camera/location on physical devices, source-channel delivery, accessibility and distributed crash/reconciliation acceptance separate.\n- Submission, approval, physical receipt, completed recycling and certified environmental claims require different evidence.\n\n## Domain accelerator consolidation\n\nThe canonical reusable domain boundary is eWaste and /nodics/eWaste/v0 with capability-owned exposure policy. Application composition and frontend routes are not new framework authorities. Later layers use CONFIG.eWaste for supported domain deltas and their own namespaces for branding. Do not introduce a second submission, wallet, coupon, location or accelerator identity.\n\nPreserve installed applicationCode, orderCodePrefix, assessment identities and original command references through upgrades. Source reorganization is not authorization to reimport business transactions, relabel historical environmental results or reset ledgers. Packaging, integration and deployment must be qualified separately.\n\n## Operational roles and independent approval\n\nProfile owns real employee identity and scopes; imported role names or fictional personas are not reviewer eligibility. Waste requires a human principal with the exact operation grant. waste.operations.requireScopes, requireVerification and requireDifferentApprover default false in shared source. Enable the intended policy explicitly in a later deployment and qualify it before claiming scoped or independent review.\n\n| Operation | Required backend grant | Additional source boundary |\n| --- | --- | --- |\n| Read queue/detail | waste.review.queue.read | Effective scope, not frontend visibility |\n| Read original evidence | waste.review.evidence.read | Separate private-evidence authorization |\n| Verify facts | waste.verification.record | Claim, explicit confirmation and revision; no asset/reward |\n| Approve/reject | waste.review.approve | Claim and configured verification/separate-actor checks |\n| Audit | waste.audit.read | Read-only evidence, not mutation authority |\n\nCurrent /review-workspace/:code/assignment supports confirmed CLAIM/RELEASE for the caller's own employee identity, current expectedRevision and stable command. The mandatory sequence is CLAIM -> verify -> QUEUE -> reread revision -> CLAIM -> approve/reject. Verification persists a QUEUE handoff and leaves the submission UNDER_REVIEW; it does not retain the employee claim or approve the item. Reread the current owner detail and revision after verification, then submit a new, explicitly confirmed CLAIM command before the decision. This applies even when the same reviewer has both verification and approval grants and requireDifferentApprover is false. Pass the current expectedRevision on every mutation and use a distinct stable idempotency key for each new command. Reread again after the second CLAIM so the decision uses its acknowledged revision. An unclaimed decision rejects with ERR_WASTE_ASSIGNMENT_REQUIRED; a different employee claim rejects with ERR_WASTE_ASSIGNMENT_CONFLICT. A stale revision requires readback and reconciliation, not a guessed increment or a new verification. A completed verification replay remains idempotent but does not restore a claim. If separation of duties is enabled, only a different currently authorized employee may make the second claim and decision. Recovery of an already saved decision follows the original owner command and is not a fresh approval. A queue label assigned during customer confirmation is not an employee claim. The detailed owner-reviewed sequence and rejection/recovery table are in [review and decision flow](/docs/framework/accelerators/circa/operations#acceleratorsCircaOperationsRewards-2-review-and-decision-screen-flow); this reference guide does not replace the Waste owner contract.\n\nWith scopes enabled, Waste resolves /identity/scopes/me using the employee bearer and preserves deny semantics; missing owner resolution blocks access. Verification cannot change the assigned centre. Final rejection needs a reason, and requireVerification prevents approval from silently rewriting verified facts. When requireDifferentApprover is true, the verifier cannot make the final decision; otherwise a human with both grants may do both with distinct evidence. Neither state is implied by this editorial staging.\n\nFor uncertain decisions, refresh the record and use the owning recovery action with original command/evidence. Do not start a new decision or settle again just to clear pending status. Notifications use recorded immutable outcome/comment and Communication-owned intent/delivery; a delayed message does not undo approval and must not cause a blind decision replay.\n\n## Negotiated purchases and merchant operations\n\neWaste consumes Commerce bidding and checkout for eligible asset provenance/store, and delegates merchant claim and order-review operations. Customer-specific bid validity, prices, partner terms and merchant adapters are not accelerator defaults. Holds, payment and accepted quotes stay Commerce-owned; ownership changes only after its completed result.\n\nA request for cancellation/refund/dispute is a case, not a finished refund. Use [Order management](/docs/framework/order-management-lifecycle#orderManagementLifecycle-5-operations-and-governance), document order.management-lifecycle owned by order. Do not duplicate its policy/reviewer/receipt instructions here or infer external POS/physical fulfillment from a local provider result.\n\n## Enterprise merchant fulfillment and refunds\n\nProfile owns issuing-enterprise employee qualification; Commerce owns merchant authorization, entitlement redemption and refund decisions. eWaste's service-only reversal port checks original completed sale/current buyer and recoverable original proceeds/carbon before restoring digital ownership. Original submission rewards are not revalued. An onward transfer or unavailable recovery requires manual resolution, not a fabricated success.\n\nSee [Returns and Refunds](/docs/framework/commerce-returns-refunds#commerceReturnsRefunds-10-return-receipt-and-reversal-calculation-coverage), document commerce.returns-refunds owned by order, for the authoritative lifecycle. This guide makes no current merchant receipt, actual delivery, refund or whole-owner financial qualification claim.\n\n## Account and channel ownership\n\nCustomer self-resolution uses the authenticated Profile bearer and canonical login, not request-body owner selectors or an employee token. Account workspace reads remain owner-scoped. Channel policy chooses a server-configured application; Profile owns proof validation, canonical links and browser handoff/session security. A matching email, name or channel ID is not proof of account ownership.\n\nEnvironmental assessment and advisory recognition are separate stages. Customers may correct only their allowed text fields; staff validates classification and measurements. A valid INPUT_ONLY assessment may satisfy the configured partial-coverage contract, but missing, failed, mock or empty environmental assessment cannot confirm a mandatory eWaste submission. Preserve the limitation and resolve the actual provider/input error instead of inventing carbon. Later assessment history/selection never revalues an existing reward settlement. Use [Waste Impact providers](/docs/framework/waste-impact-providers#wasteImpactProviders-8-environmental-properties-and-credit-status), owned by wasteImpact, for those evidence semantics.\n\n## Audience and Ownership Checks\n\nBeginners follow one controlled item from public centre information to saved acknowledgement. Business evaluators assess the separation of advisory, digital and physical outcomes. Administrators choose real policy and identity assignments; operators retain owner results before retry. Developers, QA and AI tools prove trusted service selection, current eligibility and rejected paths. Maintainers preserve source authority and separate application adoption from reusable defaults.\n\n```mermaid\nflowchart TD\n  Adapter[Qualified trusted journey adapter] --> Arrival[Fresh observation and current centre]\n  Arrival --> Photo[Bounded private photo and advisory analysis]\n  Photo --> Draft[Saved editable draft and assessment limits]\n  Draft --> Confirm[Explicit customer confirmation]\n  Confirm --> Ack[Waste acknowledgement]\n  Ack --> ClaimForVerification[Authorized employee CLAIM]\n  ClaimForVerification --> Verify[Save verified facts]\n  Verify --> QueueHandoff[Persisted QUEUE handoff]\n  QueueHandoff --> CurrentRevision[Reread current revision]\n  CurrentRevision --> ClaimForDecision[Second CLAIM even same reviewer]\n  ClaimForDecision --> Decision[Approve or reject with claim revision]\n  Decision --> Settlement[Separate confirmed reward and Loyalty evidence]\n  Decision --> Physical[Separate physical receipt evidence]\n```\n\n| Failure | Recovery boundary |\n| --- | --- |\n| Missing radius / stale observation | Correct project policy or reacquire location; retain saved photo. |\n| Item not accepted | Choose a genuinely accepting centre through current owner policy; do not change facts to bypass rejection. |\n| Reviewer claim/scope denied | Resolve actual authorized assignment; never borrow an account. |\n| Settlement or notification pending | Inspect original owner evidence and recover that operation only. |\n\n## Customize and extend safely\n\nPrerequisites: a later-loaded customer module with eWaste inheritance, working owner transports and a trusted controller explicitly wired to DefaultEWasteJourneyService for the fresh-arrival operations. In the customer's config/properties.js, set only the intentional policy differences below. These are illustrative customer decisions, not universal safe distances or a complete deployable module.\n\n```javascript\nmodule.exports = {\n  eWaste: { journey: { arrivalRadiusMetres: 150 } },\n  waste: { operations: {\n    requireScopes: true,\n    requireVerification: true,\n    requireDifferentApprover: true\n  } }\n};\n```\n\nThe Journey service then inherits 60000/12000 ms technical limits and three centres. A reported point exactly 150 metres away qualifies; 150.00001 does not. Missing/nonfinite/string radius fails before arrival. Verified facts need a different eligible human approver under this policy, with real Profile scope and assignment handoff. Configuration alone neither wires native routes nor grants staff permission.\n\nUse project-owned src/controller and a small loader-visible src/service adapter to select the supported service on the server; do not copy arrival math, scope evaluation, schemas or review persistence. Test effective defaults plus deltas, trusted mapping and rejected operations before replacing prior project policy. Roll back only the deliberate policy/adapter difference; retain drafts, photos, assessments, commands and ledgers. Stricter policy may leave existing open work needing an authorized handoff, never a database reset.\n\n## Common Mistakes\n\n- Calling raw eWaste confirm and assuming a fresh-arrival adapter was selected.\n- Treating a map marker, accepted-category template or missing restrictions as complete eligibility.\n- Claiming independent review with shared defaults or a queue label instead of a real employee claim.\n- Replaying wallets, decisions, single-use coupons or approval rewards to repair a demonstration.\n- Treating readiness, CMS staging/publication, emulated GPS or historic checks as current live acceptance.\n\n## Verification\n\nFuture qualification must cover default/missing/custom radius, exact distance and time boundaries, optional accuracy, invalid/moved/disabled centres, stale revision, completed replay, unknown taxonomy, manual hold, private photo and cross-customer denial. Exercise reviewer claim conflicts, scopes and both independent/same-actor policy modes with real separate accounts. Then qualify settlement, notification and channel/browser behavior independently. No runtime, import, test or browser command was executed by this source review.\n\n```bash\n# From the eWaste module; source-test guidance, not executed here.\nnode --test test/eWasteJourneyService.test.js test/eWastePreparation.test.js test/eWasteCollectionVisibilityContract.test.js\n```\n\nSTAGED authoring and an active route enable publication selection. They do not establish Process approval, an Online version or qualification of eligibility, reviewer or customer operations. Refresh source counts and integrity metadata before import, then follow normal publication and separately qualify the business journey.\n",
      "previous": {
        "title": "Circa Shop and Coupons",
        "route": "/docs/circa-ewaste"
      },
      "next": {
        "title": "Circa demonstration dataset",
        "route": "/docs/circa-ewaste/circa-demo-data"
      },
      "source": {
        "repository": "nodics.ai",
        "functionalModule": "nodics.accelerators",
        "technicalModule": "eWaste",
        "path": "data/docs-v001/records/documentation/circaDocumentationRelease002ComponentData.js",
        "wordCount": 3191,
        "checksum": "4760de0f88abc5cac3d595999bed6ea19231c7ad6857fae992f743246d3a401c",
        "owner": "eWaste",
        "sourcePath": "data/docs-v001/records/documentation/circaDocumentationRelease002ComponentData.js"
      },
      "slug": "customer-journey",
      "locale": "en",
      "sourceEvidence": [
        "README.md",
        "AGENTS.md",
        "config/properties.js",
        "llm/contracts/e-waste-domain.md",
        "llm/contracts/reference-compatibility.md",
        "src/service/defaultEWasteJourneyService.js",
        "src/service/defaultEWasteJourneyContractService.js",
        "src/service/defaultEWasteExperienceService.js",
        "src/service/defaultEWasteRequestService.js",
        "src/controller/defaultEWasteExperienceController.js",
        "src/router/routers.js",
        "src/service/defaultEWasteSubmissionPreparationService.js",
        "src/service/defaultEWasteChannelAuthenticationService.js",
        "src/service/defaultEWasteAcceptanceReadinessService.js",
        "src/service/defaultEWasteOutcomeCommunicationService.js",
        "src/service/defaultEWasteOrderReversalService.js",
        "test/eWasteJourneyService.test.js",
        "test/eWastePreparation.test.js",
        "test/eWasteCollectionVisibilityContract.test.js",
        "../../../../../nodics.waste/modules/wasteSubmission/src/service/defaultWasteSubmissionOperationService.js",
        "../../../../../nodics.waste/modules/wasteCollection/src/service/defaultWasteCollectionCentreService.js",
        "../../../../../nodics.waste/modules/wasteCore/config/properties.js",
        "../../../../../nodics.waste/modules/wasteCore/src/service/defaultWasteOperationalAccessService.js",
        "../../../../../nodics.waste/modules/wasteVerification/src/service/defaultWasteVerificationOperationService.js",
        "../../../../../nodics.waste/modules/wasteVerification/src/service/defaultWasteReviewWorkspaceService.js",
        "../../../../../nodics.waste/modules/wasteVerification/llm/contracts/review-workspace.md",
        "../../../../../nodics.waste/modules/wasteVerification/test/wasteReviewWorkspace.test.js"
      ],
      "references": [
        {
          "documentId": "location.shared-map-configuration",
          "owner": "locationMap"
        },
        {
          "documentId": "catalog.product-discovery-management",
          "owner": "product"
        },
        {
          "documentId": "commerce.cart-order",
          "owner": "checkoutCore"
        },
        {
          "documentId": "order.management-lifecycle",
          "owner": "order"
        },
        {
          "documentId": "commerce.returns-refunds",
          "owner": "order"
        },
        {
          "documentId": "waste.impact-providers",
          "owner": "wasteImpact"
        },
        {
          "documentId": "accelerators.circa-operations-rewards",
          "owner": "eWaste",
          "anchor": "acceleratorsCircaOperationsRewards-2-review-and-decision-screen-flow"
        }
      ]
    },
    "active": true
  },
  "record3": {
    "code": "circaDocsComponentcircaDemoData",
    "typeCode": "circaDocumentationArticleComponentType",
    "renderer": "documentation.component.article",
    "accessMode": "PUBLIC",
    "properties": {
      "code": "circa.demo-data",
      "title": "Circa demonstration dataset",
      "route": "/docs/circa-ewaste/circa-demo-data",
      "section": "circa-guides",
      "sectionTitle": "Circa Guides",
      "group": "circa-guides",
      "groupTitle": "Circa Guides",
      "parentId": "circa-guides",
      "hierarchyPath": [
        "Circa Guides",
        "Circa demonstration dataset"
      ],
      "hierarchyDepth": 2,
      "documentType": "how-to",
      "audience": [
        "business-user",
        "architect",
        "administrator",
        "developer",
        "operator",
        "qa",
        "ai-tool"
      ],
      "businessAudience": [
        "business evaluator",
        "customer",
        "administrator"
      ],
      "technicalAudience": [
        "architect",
        "developer",
        "operator",
        "qa engineer",
        "ai tool"
      ],
      "summary": "Reusable eWaste preset inventory, explicit nImport adoption, aligned customer deltas and recovery without replaying customer history or inventing owner qualification.",
      "visibility": "public",
      "accessMode": "AUTHENTICATED",
      "publiclyAvailable": false,
      "requiresAuthentication": true,
      "allowedRoles": [],
      "allowedGroups": [],
      "allowedPermissions": [],
      "lifecycleState": "STAGED",
      "maturityState": "partial",
      "implementationState": "source-verified",
      "relatedPages": [
        "catalog.product-discovery-management",
        "commerce.cart-order"
      ],
      "visualRequirements": [
        "diagram",
        "table",
        "code-example"
      ],
      "searchKeywords": [
        "eWaste",
        "reusable accelerator",
        "demo-data",
        "source-reviewed"
      ],
      "topicKeywords": [
        "Circa demonstration dataset",
        "eligibility limits",
        "owner authority",
        "customization"
      ],
      "headings": [
        {
          "text": "Reusable reference and customer demonstration",
          "anchor": "circaDemoData-1-one-customer-demonstration",
          "level": 2
        },
        {
          "text": "Dataset Inventory",
          "anchor": "circaDemoData-2-dataset-inventory",
          "level": 2
        },
        {
          "text": "Import Sequence",
          "anchor": "circaDemoData-3-import-sequence",
          "level": 2
        },
        {
          "text": "Repeat Imports And Recovery",
          "anchor": "circaDemoData-4-repeat-imports-and-recovery",
          "level": 2
        },
        {
          "text": "Customize and extend safely",
          "anchor": "circaDemoData-5-customization",
          "level": 2
        },
        {
          "text": "Local Demo Runtime Admission",
          "anchor": "circaDemoData-6-local-demo-runtime-admission",
          "level": 2
        },
        {
          "text": "Audience and Ownership Checks",
          "anchor": "circa-demo-data-audience-owner-checks",
          "level": 2
        },
        {
          "text": "Common Mistakes",
          "anchor": "circa-demo-data-common-mistakes",
          "level": 2
        },
        {
          "text": "Verification",
          "anchor": "circa-demo-data-verification",
          "level": 2
        }
      ],
      "blocks": [
        {
          "kind": "heading",
          "level": 2,
          "text": "Reusable reference and customer demonstration",
          "anchor": "circaDemoData-1-one-customer-demonstration"
        },
        {
          "kind": "paragraph",
          "text": "For beginners, separate the reusable eWaste presets from a customer's demonstration records before importing anything. Read the inventory and dependency tables, select only the intended release and destination, and validate its reference closure with fictional approved fixtures. Keep optional documentation receipts separate from business receipts. Never replay sample balances, staff identities or ownership transactions over an environment with real history."
        },
        {
          "kind": "paragraph",
          "text": "This retained Circa topic teaches how to adopt reusable eWaste reference data without mistaking it for an installed customer demonstration. The accelerator's core reference presets and optional documentation pack are separate selections. Customer enterprises, staff, outlets, sample assets, wallets and offers stay in their owning customer backend; they are not distributed by these four guides."
        },
        {
          "kind": "paragraph",
          "text": "Fresh Circa demo staffing is predefined reviewed release data, not manual runtime group wiring. Select circa.ewaste:circaCommerceStaffAssignments alongside its prerequisite Profile role definitions, original demo identities and the separate circa.ewaste:circaMerchantOutletAccess Store scopes. The pack adds reviewed responsibilities to existing employees through Profile; it does not provision credentials or authorize seller consent, financial funding or production use. CURRENT dependencies must be verified and skipped. Refresh an affected session after an authorized role change. See the canonical [source release and staff inventory](/docs/framework/accelerators/circa/source-inventory#acceleratorsCircaSourceInventory-10-issuer-setup-and-publication) for exact role selections, seven-employee responsibility mapping and recovery boundaries. Customer-specific staffing remains customer-owned."
        },
        {
          "kind": "paragraph",
          "text": "Profile owns identity/permission operations, Location coordinates, Waste collection/taxonomy/lifecycle, Loyalty balances/ledger, Commerce products/coupons/stock and WCMS/Media presentation. Reusable eWaste supplies presets that target those existing Waste schemas, not another importer or a new customer business authority. No application-specific cohort, account password, exchange rate or merchant participation is established here."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Dataset Inventory",
          "anchor": "circaDemoData-2-dataset-inventory"
        },
        {
          "kind": "table",
          "headers": [
            "Canonical source",
            "Reusable contribution",
            "Not implied"
          ],
          "rows": [
            [
              "core-v001/records/waste/eWasteFamilyData.js",
              "ELECTRONICS and BATTERY families",
              "Customer enterprise or tenant creation"
            ],
            [
              "eWasteCategoryData.js and eWasteItemTypeData.js",
              "Ten categories and fourteen item types with related evidence/impact references",
              "Complete live item acceptance or a dynamic form engine"
            ],
            [
              "eWasteCollectionPresetData.js and eWasteAcceptanceRuleData.js",
              "Four collection presets and eight type/category rule templates",
              "Installed collection locations or proof every journey evaluates those rules"
            ],
            [
              "eWasteEvidencePolicyData.js and eWasteVerificationPolicyData.js",
              "Evidence declarations and standard verification preset",
              "Actual human eligibility, scope or completed review"
            ],
            [
              "eWasteImpactProfileData.js",
              "Four profiles, including neutral external estimate and battery count",
              "Activated provider, certified carbon or measured diversion"
            ],
            [
              "data/docs-v001/records/documentation/circaDocumentation*",
              "Four reusable guides and pack navigation",
              "Business release selection, issued coupons, stock or wallets"
            ]
          ]
        },
        {
          "kind": "paragraph",
          "text": "The selected neutral profile EWASTE_ENVIRONMENTAL_ESTIMATE declares publicClaimAllowed=false and ADVISORY_SUBMISSION_GATE. Most electronics category/item references use it; battery references retain EWASTE_BATTERY_COUNT. Collection presets can retain their own distinct impact/receipt references, so do not rewrite every profile identity as if it were one universal rule."
        },
        {
          "kind": "paragraph",
          "text": "Preset declarations are reference intent, not automatic execution. For example, the accessory-bin rule EWASTE_BIN_REJECT_LOOSE_BATTERY declares REJECT, but the customer validateFacts path checks centre acceptedCategoryCodes rather than interpreting all acceptance-rule templates. An ASSUMED receipt preset cannot establish actual physical receipt. Keep eligibility and operational provenance as explicit consumer integration gates."
        },
        {
          "kind": "paragraph",
          "text": "A customer may contribute fictional demonstration records in its own explicitly selected releases. Quantities, illustrative prices and a variant purchase-unit target are not issued stock or a qualified partner offer. Issuer/seller consent, real staff scope, purchased rights and physical outlets require their actual owners; a source table cannot manufacture them."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Import Sequence",
          "anchor": "circaDemoData-3-import-sequence"
        },
        {
          "kind": "diagram",
          "language": "mermaid",
          "text": "flowchart TD\n  Select[Explicit reusable reference selection] --> Validate[Owner schemas and exact source qualification]\n  Validate --> Baseline[nImport qualified eWaste baseline]\n  Baseline --> Delta[Optional aligned customer delta]\n  Delta --> Receipt[Inspect durable destination work and outcome]\n  Receipt --> Business[Separate governed business activation]\n  Business --> Acceptance[Independent live customer and staff qualification]"
        },
        {
          "kind": "paragraph",
          "text": "This is an adoption checklist, not a claim that one preparation call performs all owner operations. The reference-compatibility contract requires schema/material prerequisites, completed taxonomy closure and a qualified baseline before a dependent customer delta. Cyclic category/item references require closure across the complete selected release rather than a fabricated strict record-by-record order."
        },
        {
          "kind": "ordered-list",
          "items": [
            "Select eWaste:core-reference explicitly at its current expected version 0.0.1; optional documentation is a separate CONTENT_PACK, not core/sample business data.",
            "Validate source root, declared files, header schema destinations, current baseline receipts and exact expectedReleases through nImport.",
            "If a customer delta is selected, preserve matching source-root version, logical filename/export key and explicit header target so source-key composition can inherit the baseline.",
            "Execute only authorized owner operations, retaining durable per-destination run work, row successes/failures and installation evidence.",
            "Qualify actual Product/policy/Media publication separately; Promotion issuance and Inventory admission are separate from policy import or CMS approval.",
            "Verify actual customer and operator behavior in the test deployment. Preflight, source fixtures and documentation staging do not prove that journey."
          ]
        },
        {
          "kind": "paragraph",
          "text": "Read llm/contracts/reference-compatibility.md and test/eWasteReferenceRelease.test.js for the exact reusable adoption boundary. The latter uses real nImport components with in-memory ports, not a live destination. The reference pack supplies no customer transactions and requires no customer checkout to demonstrate source composition."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Repeat Imports And Recovery",
          "anchor": "circaDemoData-4-repeat-imports-and-recovery"
        },
        {
          "kind": "paragraph",
          "text": "Inspect the current source version/checksum and durable installed work before deciding whether an import should run. A CURRENT result alone is insufficient if an earlier header was ignored and performed zero work. Do not fabricate a receipt or repair installed state directly; the parent/operator must qualify the corrected declaration through normal owner selection and import. This guide does not assert that any particular receipt was inspected."
        },
        {
          "kind": "paragraph",
          "text": "Failed imports can contain successful rows. Retain original success/failure evidence, correct the owning declaration/schema problem and use nImport's existing retry/idempotency rules. Do not drop customer data, force a previous release or rerun transaction samples. Existing installations require qualified reference-only adoption, exact baseline provenance and preservation of later customer overrides."
        },
        {
          "kind": "paragraph",
          "text": "Source compatibility does not establish that an installation may switch its historical profile. Retain original identifiers, assessment snapshots, submissions, assets, ownership events and reward evidence. Unknown/conflicting provenance blocks adoption. Runtime missing-profile failures must not silently fall back to another historical identity."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Customize and extend safely",
          "anchor": "circaDemoData-5-customization"
        },
        {
          "kind": "paragraph",
          "text": "Prerequisites: a later-loaded project module, a selected and currently qualified eWaste baseline, matching core-v001 source root and existing nImport source-key composition. A minimal display-name delta belongs in the customer's data/core-v001/records/waste/eWasteCategoryData.js, not in accelerator source. Preserve the logical filename and record0 export key below; do not treat this sparse object as a complete standalone category."
        },
        {
          "kind": "code",
          "language": "javascript",
          "text": "// Customer-owned data/core-v001/records/waste/eWasteCategoryData.js\nmodule.exports = {\n  record0: { name: { en: 'Mobile electronics' } }\n};"
        },
        {
          "kind": "paragraph",
          "text": "The matching project import header must explicitly target wasteMaterial/wasteCategory through eWasteCategoryData and query code, aligned with the baseline eWastePresetHeader. Declare the customer release through its existing manifest and qualify dependency order/receipt and exact version selection. With supported nImport composition, record0 retains MOBILE_DEVICE, family, item/material arrays and evidence/impact references while changing only its display name. Arrays replace if authored; do not accidentally drop closure."
        },
        {
          "kind": "paragraph",
          "text": "Missing or changed baseline receipts must reject before writes. DefaultWasteDataContributionPolicyService.resolveByCode replaces whole records and is not the sparse-field merger; using the fragment there would discard required fields. Test reverse caller selection/order, baseline source changes, array replacement and historical profile pins through the owner contracts. Recover by restoring the prior project delta or a qualified forward release, never by overwriting installed transaction history."
        },
        {
          "kind": "paragraph",
          "text": "Once adoption depends on an immutable source release, retain its previous bytes and release evidence and use the owning release process for a forward reference change. Refresh counts and hashes during packaging. Review customer policy, demonstration balances and release/configuration changes independently; documentation installation must not mutate those business decisions."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Local Demo Runtime Admission",
          "anchor": "circaDemoData-6-local-demo-runtime-admission"
        },
        {
          "kind": "paragraph",
          "text": "No flag, seed marker, quantity target or JSON record in this accelerator guide authorizes Commerce operational snapshots. Promotion owns issuance and entitlements; Inventory owns stock movements; customer demo admission, if any, needs its explicit owner contract and qualification. See [Product management](/docs/framework/catalog-product-discovery-management#catalogProductDiscoveryManagement-5-operations-and-governance) and [Cart and Order](/docs/framework/commerce-cart-order#commerceCartOrder-4-operator-and-devops-guidance) for their existing boundaries rather than copying operations here."
        },
        {
          "kind": "paragraph",
          "text": "Similarly, imported staff labels are not reviewer authorization, a policy template is not completed verification and a declared retention status is not proven deletion. Do not manufacture consent, approver identity, merchant receipts or stock provenance to produce a green readiness indicator."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Audience and Ownership Checks",
          "anchor": "circa-demo-data-audience-owner-checks"
        },
        {
          "kind": "paragraph",
          "text": "Business evaluators use a disposable test environment and distinguish reusable presets from a complete customer demonstration. Operators verify owner prerequisites and actual destination work. Administrators qualify employee scopes and publication separately. Developers and AI tools preserve exact source identities, layering and immutable evidence. Maintainers check independent source composition without a sibling customer dependency."
        },
        {
          "kind": "diagram",
          "language": "mermaid",
          "text": "flowchart LR\n  Docs[Optional referenceDocumentation pack] --> CMS[WCMS Staged authoring]\n  Core[Explicit core reference] --> Waste[Waste preset schemas]\n  Project[Separate customer release] --> Owners[Profile Location Loyalty Commerce Media]\n  CMS --> Publication[Separate Process and publication]\n  Owners --> Live[Separate live owner acceptance]"
        },
        {
          "kind": "table",
          "headers": [
            "Observation",
            "Safe interpretation/recovery"
          ],
          "rows": [
            [
              "CURRENT with unknown work",
              "Inspect run outcome/declarations; do not infer row installation."
            ],
            [
              "Partial failed run",
              "Retain all row evidence and repair the real owner error."
            ],
            [
              "Missing baseline provenance",
              "Block dependent delta execution."
            ],
            [
              "Quantity or eligibility declaration",
              "Require actual stock and policy evaluation; no operational admission inferred."
            ]
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Common Mistakes",
          "anchor": "circa-demo-data-common-mistakes"
        },
        {
          "kind": "unordered-list",
          "items": [
            "Selecting business samples and assuming optional documentation is installed, approved or published.",
            "Using resolveByCode for a sparse source-key overlay.",
            "Equating source acceptance templates, fictional staff or stock targets with qualified owner outcomes.",
            "Replaying balances, ownership or single-use coupons over real activity.",
            "Deleting historical profiles/receipts or treating a zero-work import as completed installation."
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Verification",
          "anchor": "circa-demo-data-verification"
        },
        {
          "kind": "paragraph",
          "text": "Source verification should check the neutral profile, battery behavior, complete reference closure, exact destinations, independent import planning and dependent delta rejection. Add installed qualification for a fresh environment, existing history and later-layer preservation. Documentation import receipts must remain separate from business-release receipts. Source verification alone does not establish installed/native behavior, imported business rows or successful business operations."
        },
        {
          "kind": "code",
          "language": "bash",
          "text": "# From eWaste; independent source-test guidance, not executed here.\nnode --test test/eWasteReferenceCompatibility.test.js test/eWasteReferenceRelease.test.js test/eWastePresetDataContract.test.js"
        },
        {
          "kind": "paragraph",
          "text": "Treat authoring status, import completion, Process approval and Online publication as separate evidence. Integrity metadata must match the selected release. None of these documentation states replaces real owner eligibility, consent or business-journey acceptance."
        }
      ],
      "searchText": "Circa demonstration dataset Reusable eWaste preset inventory, explicit nImport adoption, aligned customer deltas and recovery without replaying customer history or inventing owner qualification. # Circa demonstration dataset\n\n## Reusable reference and customer demonstration\n\nFor beginners, separate the reusable eWaste presets from a customer's demonstration records before importing anything. Read the inventory and dependency tables, select only the intended release and destination, and validate its reference closure with fictional approved fixtures. Keep optional documentation receipts separate from business receipts. Never replay sample balances, staff identities or ownership transactions over an environment with real history.\n\nThis retained Circa topic teaches how to adopt reusable eWaste reference data without mistaking it for an installed customer demonstration. The accelerator's core reference presets and optional documentation pack are separate selections. Customer enterprises, staff, outlets, sample assets, wallets and offers stay in their owning customer backend; they are not distributed by these four guides.\n\nFresh Circa demo staffing is predefined reviewed release data, not manual runtime group wiring. Select circa.ewaste:circaCommerceStaffAssignments alongside its prerequisite Profile role definitions, original demo identities and the separate circa.ewaste:circaMerchantOutletAccess Store scopes. The pack adds reviewed responsibilities to existing employees through Profile; it does not provision credentials or authorize seller consent, financial funding or production use. CURRENT dependencies must be verified and skipped. Refresh an affected session after an authorized role change. See the canonical [source release and staff inventory](/docs/framework/accelerators/circa/source-inventory#acceleratorsCircaSourceInventory-10-issuer-setup-and-publication) for exact role selections, seven-employee responsibility mapping and recovery boundaries. Customer-specific staffing remains customer-owned.\n\nProfile owns identity/permission operations, Location coordinates, Waste collection/taxonomy/lifecycle, Loyalty balances/ledger, Commerce products/coupons/stock and WCMS/Media presentation. Reusable eWaste supplies presets that target those existing Waste schemas, not another importer or a new customer business authority. No application-specific cohort, account password, exchange rate or merchant participation is established here.\n\n## Dataset Inventory\n\n| Canonical source | Reusable contribution | Not implied |\n| --- | --- | --- |\n| core-v001/records/waste/eWasteFamilyData.js | ELECTRONICS and BATTERY families | Customer enterprise or tenant creation |\n| eWasteCategoryData.js and eWasteItemTypeData.js | Ten categories and fourteen item types with related evidence/impact references | Complete live item acceptance or a dynamic form engine |\n| eWasteCollectionPresetData.js and eWasteAcceptanceRuleData.js | Four collection presets and eight type/category rule templates | Installed collection locations or proof every journey evaluates those rules |\n| eWasteEvidencePolicyData.js and eWasteVerificationPolicyData.js | Evidence declarations and standard verification preset | Actual human eligibility, scope or completed review |\n| eWasteImpactProfileData.js | Four profiles, including neutral external estimate and battery count | Activated provider, certified carbon or measured diversion |\n| data/docs-v001/records/documentation/circaDocumentation* | Four reusable guides and pack navigation | Business release selection, issued coupons, stock or wallets |\n\nThe selected neutral profile EWASTE_ENVIRONMENTAL_ESTIMATE declares publicClaimAllowed=false and ADVISORY_SUBMISSION_GATE. Most electronics category/item references use it; battery references retain EWASTE_BATTERY_COUNT. Collection presets can retain their own distinct impact/receipt references, so do not rewrite every profile identity as if it were one universal rule.\n\nPreset declarations are reference intent, not automatic execution. For example, the accessory-bin rule EWASTE_BIN_REJECT_LOOSE_BATTERY declares REJECT, but the customer validateFacts path checks centre acceptedCategoryCodes rather than interpreting all acceptance-rule templates. An ASSUMED receipt preset cannot establish actual physical receipt. Keep eligibility and operational provenance as explicit consumer integration gates.\n\nA customer may contribute fictional demonstration records in its own explicitly selected releases. Quantities, illustrative prices and a variant purchase-unit target are not issued stock or a qualified partner offer. Issuer/seller consent, real staff scope, purchased rights and physical outlets require their actual owners; a source table cannot manufacture them.\n\n## Import Sequence\n\n```mermaid\nflowchart TD\n  Select[Explicit reusable reference selection] --> Validate[Owner schemas and exact source qualification]\n  Validate --> Baseline[nImport qualified eWaste baseline]\n  Baseline --> Delta[Optional aligned customer delta]\n  Delta --> Receipt[Inspect durable destination work and outcome]\n  Receipt --> Business[Separate governed business activation]\n  Business --> Acceptance[Independent live customer and staff qualification]\n```\n\nThis is an adoption checklist, not a claim that one preparation call performs all owner operations. The reference-compatibility contract requires schema/material prerequisites, completed taxonomy closure and a qualified baseline before a dependent customer delta. Cyclic category/item references require closure across the complete selected release rather than a fabricated strict record-by-record order.\n\n1. Select eWaste:core-reference explicitly at its current expected version 0.0.1; optional documentation is a separate CONTENT_PACK, not core/sample business data.\n2. Validate source root, declared files, header schema destinations, current baseline receipts and exact expectedReleases through nImport.\n3. If a customer delta is selected, preserve matching source-root version, logical filename/export key and explicit header target so source-key composition can inherit the baseline.\n4. Execute only authorized owner operations, retaining durable per-destination run work, row successes/failures and installation evidence.\n5. Qualify actual Product/policy/Media publication separately; Promotion issuance and Inventory admission are separate from policy import or CMS approval.\n6. Verify actual customer and operator behavior in the test deployment. Preflight, source fixtures and documentation staging do not prove that journey.\n\nRead llm/contracts/reference-compatibility.md and test/eWasteReferenceRelease.test.js for the exact reusable adoption boundary. The latter uses real nImport components with in-memory ports, not a live destination. The reference pack supplies no customer transactions and requires no customer checkout to demonstrate source composition.\n\n## Repeat Imports And Recovery\n\nInspect the current source version/checksum and durable installed work before deciding whether an import should run. A CURRENT result alone is insufficient if an earlier header was ignored and performed zero work. Do not fabricate a receipt or repair installed state directly; the parent/operator must qualify the corrected declaration through normal owner selection and import. This guide does not assert that any particular receipt was inspected.\n\nFailed imports can contain successful rows. Retain original success/failure evidence, correct the owning declaration/schema problem and use nImport's existing retry/idempotency rules. Do not drop customer data, force a previous release or rerun transaction samples. Existing installations require qualified reference-only adoption, exact baseline provenance and preservation of later customer overrides.\n\nSource compatibility does not establish that an installation may switch its historical profile. Retain original identifiers, assessment snapshots, submissions, assets, ownership events and reward evidence. Unknown/conflicting provenance blocks adoption. Runtime missing-profile failures must not silently fall back to another historical identity.\n\n## Customize and extend safely\n\nPrerequisites: a later-loaded project module, a selected and currently qualified eWaste baseline, matching core-v001 source root and existing nImport source-key composition. A minimal display-name delta belongs in the customer's data/core-v001/records/waste/eWasteCategoryData.js, not in accelerator source. Preserve the logical filename and record0 export key below; do not treat this sparse object as a complete standalone category.\n\n```javascript\n// Customer-owned data/core-v001/records/waste/eWasteCategoryData.js\nmodule.exports = {\n  record0: { name: { en: 'Mobile electronics' } }\n};\n```\n\nThe matching project import header must explicitly target wasteMaterial/wasteCategory through eWasteCategoryData and query code, aligned with the baseline eWastePresetHeader. Declare the customer release through its existing manifest and qualify dependency order/receipt and exact version selection. With supported nImport composition, record0 retains MOBILE_DEVICE, family, item/material arrays and evidence/impact references while changing only its display name. Arrays replace if authored; do not accidentally drop closure.\n\nMissing or changed baseline receipts must reject before writes. DefaultWasteDataContributionPolicyService.resolveByCode replaces whole records and is not the sparse-field merger; using the fragment there would discard required fields. Test reverse caller selection/order, baseline source changes, array replacement and historical profile pins through the owner contracts. Recover by restoring the prior project delta or a qualified forward release, never by overwriting installed transaction history.\n\nOnce adoption depends on an immutable source release, retain its previous bytes and release evidence and use the owning release process for a forward reference change. Refresh counts and hashes during packaging. Review customer policy, demonstration balances and release/configuration changes independently; documentation installation must not mutate those business decisions.\n\n## Local Demo Runtime Admission\n\nNo flag, seed marker, quantity target or JSON record in this accelerator guide authorizes Commerce operational snapshots. Promotion owns issuance and entitlements; Inventory owns stock movements; customer demo admission, if any, needs its explicit owner contract and qualification. See [Product management](/docs/framework/catalog-product-discovery-management#catalogProductDiscoveryManagement-5-operations-and-governance) and [Cart and Order](/docs/framework/commerce-cart-order#commerceCartOrder-4-operator-and-devops-guidance) for their existing boundaries rather than copying operations here.\n\nSimilarly, imported staff labels are not reviewer authorization, a policy template is not completed verification and a declared retention status is not proven deletion. Do not manufacture consent, approver identity, merchant receipts or stock provenance to produce a green readiness indicator.\n\n## Audience and Ownership Checks\n\nBusiness evaluators use a disposable test environment and distinguish reusable presets from a complete customer demonstration. Operators verify owner prerequisites and actual destination work. Administrators qualify employee scopes and publication separately. Developers and AI tools preserve exact source identities, layering and immutable evidence. Maintainers check independent source composition without a sibling customer dependency.\n\n```mermaid\nflowchart LR\n  Docs[Optional referenceDocumentation pack] --> CMS[WCMS Staged authoring]\n  Core[Explicit core reference] --> Waste[Waste preset schemas]\n  Project[Separate customer release] --> Owners[Profile Location Loyalty Commerce Media]\n  CMS --> Publication[Separate Process and publication]\n  Owners --> Live[Separate live owner acceptance]\n```\n\n| Observation | Safe interpretation/recovery |\n| --- | --- |\n| CURRENT with unknown work | Inspect run outcome/declarations; do not infer row installation. |\n| Partial failed run | Retain all row evidence and repair the real owner error. |\n| Missing baseline provenance | Block dependent delta execution. |\n| Quantity or eligibility declaration | Require actual stock and policy evaluation; no operational admission inferred. |\n\n## Common Mistakes\n\n- Selecting business samples and assuming optional documentation is installed, approved or published.\n- Using resolveByCode for a sparse source-key overlay.\n- Equating source acceptance templates, fictional staff or stock targets with qualified owner outcomes.\n- Replaying balances, ownership or single-use coupons over real activity.\n- Deleting historical profiles/receipts or treating a zero-work import as completed installation.\n\n## Verification\n\nSource verification should check the neutral profile, battery behavior, complete reference closure, exact destinations, independent import planning and dependent delta rejection. Add installed qualification for a fresh environment, existing history and later-layer preservation. Documentation import receipts must remain separate from business-release receipts. Source verification alone does not establish installed/native behavior, imported business rows or successful business operations.\n\n```bash\n# From eWaste; independent source-test guidance, not executed here.\nnode --test test/eWasteReferenceCompatibility.test.js test/eWasteReferenceRelease.test.js test/eWastePresetDataContract.test.js\n```\n\nTreat authoring status, import completion, Process approval and Online publication as separate evidence. Integrity metadata must match the selected release. None of these documentation states replaces real owner eligibility, consent or business-journey acceptance.\n",
      "previous": {
        "title": "Circa customer journey",
        "route": "/docs/circa-ewaste/circa-customer-journey"
      },
      "next": {
        "title": "Circa customer knowledge",
        "route": "/docs/circa-ewaste/circa-customer-knowledge"
      },
      "source": {
        "repository": "nodics.ai",
        "functionalModule": "nodics.accelerators",
        "technicalModule": "eWaste",
        "path": "data/docs-v001/records/documentation/circaDocumentationRelease002ComponentData.js",
        "wordCount": 1653,
        "checksum": "c8cf5051521f6c3e49902614bb08562fe2438aebd4ad5b7c3ef83b12387bd675",
        "owner": "eWaste",
        "sourcePath": "data/docs-v001/records/documentation/circaDocumentationRelease002ComponentData.js"
      },
      "slug": "demo-data",
      "locale": "en",
      "sourceEvidence": [
        "README.md",
        "AGENTS.md",
        "config/properties.js",
        "llm/contracts/e-waste-domain.md",
        "llm/contracts/reference-compatibility.md",
        "data/manifest.json",
        "data/core-v001/headers/waste/eWastePresetHeader.js",
        "data/core-v001/records/waste/eWasteFamilyData.js",
        "data/core-v001/records/waste/eWasteCategoryData.js",
        "data/core-v001/records/waste/eWasteItemTypeData.js",
        "data/core-v001/records/waste/eWasteCollectionPresetData.js",
        "data/core-v001/records/waste/eWasteAcceptanceRuleData.js",
        "data/core-v001/records/waste/eWasteEvidencePolicyData.js",
        "data/core-v001/records/waste/eWasteVerificationPolicyData.js",
        "data/core-v001/records/waste/eWasteImpactProfileData.js",
        "data/docs-v001/headers/circaDocumentationContentPackHeader.js",
        "test/eWasteReferenceCompatibility.test.js",
        "test/eWasteReferenceRelease.test.js",
        "test/eWastePresetDataContract.test.js",
        "../../../../../nodics.waste/modules/wasteSubmission/src/service/defaultWasteSubmissionOperationService.js",
        "../../../../../../nodics.kickoff/modules/circa.ewaste/llm/contracts/circa-predefined-commerce-staff.md"
      ],
      "references": [
        {
          "documentId": "catalog.product-discovery-management",
          "owner": "product"
        },
        {
          "documentId": "commerce.cart-order",
          "owner": "checkoutCore"
        },
        {
          "documentId": "accelerators.circa-source-inventory",
          "owner": "eWaste",
          "anchor": "acceleratorsCircaSourceInventory-10-issuer-setup-and-publication"
        }
      ]
    },
    "active": true
  },
  "record4": {
    "code": "circaDocsComponentcircaCustomerKnowledge",
    "typeCode": "circaDocumentationArticleComponentType",
    "renderer": "documentation.component.article",
    "accessMode": "PUBLIC",
    "properties": {
      "code": "circa.customer-knowledge",
      "title": "Circa customer knowledge",
      "route": "/docs/circa-ewaste/circa-customer-knowledge",
      "section": "circa-guides",
      "sectionTitle": "Circa Guides",
      "group": "circa-guides",
      "groupTitle": "Circa Guides",
      "parentId": "circa-guides",
      "hierarchyPath": [
        "Circa Guides",
        "Circa customer knowledge"
      ],
      "hierarchyDepth": 2,
      "documentType": "how-to",
      "audience": [
        "business-user",
        "architect",
        "administrator",
        "developer",
        "operator",
        "qa",
        "ai-tool"
      ],
      "businessAudience": [
        "business evaluator",
        "customer",
        "administrator"
      ],
      "technicalAudience": [
        "architect",
        "developer",
        "operator",
        "qa engineer",
        "ai tool"
      ],
      "summary": "Reusable customer knowledge for advisory photo/guidance, known and unknown facts, confirmation, real review/settlement and explicitly unqualified retrieval/live journeys.",
      "visibility": "public",
      "accessMode": "AUTHENTICATED",
      "publiclyAvailable": false,
      "requiresAuthentication": true,
      "allowedRoles": [],
      "allowedGroups": [],
      "allowedPermissions": [],
      "lifecycleState": "STAGED",
      "maturityState": "partial",
      "implementationState": "source-verified",
      "relatedPages": [
        "location.shared-map-configuration",
        "waste.impact-providers"
      ],
      "visualRequirements": [
        "diagram",
        "table",
        "code-example"
      ],
      "searchKeywords": [
        "eWaste",
        "reusable accelerator",
        "customer-knowledge",
        "source-reviewed"
      ],
      "topicKeywords": [
        "Circa customer knowledge",
        "eligibility limits",
        "owner authority",
        "customization"
      ],
      "headings": [
        {
          "text": "Location and arrival",
          "anchor": "circaCustomerKnowledge-1-location-and-arrival",
          "level": 2
        },
        {
          "text": "Photo, identification and correction",
          "anchor": "circaCustomerKnowledge-2-photo-identification-and-correction",
          "level": 2
        },
        {
          "text": "Handling and unknown details",
          "anchor": "circaCustomerKnowledge-3-handling-and-unknown-details",
          "level": 2
        },
        {
          "text": "Confirmation and review",
          "anchor": "circaCustomerKnowledge-4-confirmation-and-review",
          "level": 2
        },
        {
          "text": "Benefits and ownership",
          "anchor": "circaCustomerKnowledge-5-benefits-and-ownership",
          "level": 2
        },
        {
          "text": "Accounts, privacy and recovery",
          "anchor": "circaCustomerKnowledge-6-accounts-privacy-and-recovery",
          "level": 2
        },
        {
          "text": "Audience and Ownership Checks",
          "anchor": "circa-customer-knowledge-audience-owner-checks",
          "level": 2
        },
        {
          "text": "Customize and extend safely",
          "anchor": "circa-customer-knowledge-customize-and-extend-safely",
          "level": 2
        },
        {
          "text": "Common Mistakes",
          "anchor": "circa-customer-knowledge-common-mistakes",
          "level": 2
        },
        {
          "text": "Verification",
          "anchor": "circa-customer-knowledge-verification",
          "level": 2
        }
      ],
      "blocks": [
        {
          "kind": "paragraph",
          "text": "This Circa-labelled topic supplies reusable customer-facing knowledge boundaries for electronic-waste applications. Adapt its wording only to actual approved centre, identity, evidence and programme policy. It does not install a customer frontend, select a provider or prove the facts of an individual item. For beginners, work through one fictional item and distinguish supplied facts, advisory estimates and unknowns before asking for guidance. Confirm the selected centre and approved programme through their owners, then follow the customer-journey reference for submission and review. A helpful answer is not approval, a final reward or proof of physical receipt."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Location and arrival",
          "anchor": "circaCustomerKnowledge-1-location-and-arrival"
        },
        {
          "kind": "paragraph",
          "text": "Browse current centre information and ask staff about opening hours and the item they can accept. Public discovery requires active, operating ACTIVE and PUBLIC records, but currently reads at most 100 centres; it is not an exhaustive or item-filtered acceptance service. A marker, saved preference or directions link never proves eligibility, arrival or physical deposit."
        },
        {
          "kind": "paragraph",
          "text": "When an application has explicitly wired the reusable fresh-arrival service, usable new coordinates must lie within its configured inclusive direct-distance radius for preparation/confirmation. There is no framework radius default. Device permission and capture behavior belong to the host; browsing information need not require location. Invalid/stale positions need reacquisition and must not discard saved drafts/photos. Accuracy is optional metadata, not a rejection gate; reported coordinates are not tamper-proof physical proof."
        },
        {
          "kind": "paragraph",
          "text": "Arrival preview selects by distance, not full collection-rule or opening-hour evaluation. Waste separately checks acceptedCategoryCodes only when provided as an array; absent restrictions do not certify acceptance. The ordinary native HTTP mapper does not automatically use the Journey service. A support answer must not promise enforcement or eligibility that the actual adapter has not qualified. For map configuration, refer to [Shared Map Configuration](/docs/framework/location-shared-map-configuration), owned by locationMap, rather than duplicating it here."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Photo, identification and correction",
          "anchor": "circaCustomerKnowledge-2-photo-identification-and-correction"
        },
        {
          "kind": "paragraph",
          "text": "Use the application's supported photo controls. Reusable preparation accepts canonical base64 JPEG, PNG or WebP within the configured byte bound, 5 MiB by default. It analyzes before durable Media/submission creation; supported recognition-unavailable failures can produce a held manual-review result. On a first failed preparation, there may be no saved draft/photo yet: do not promise persistence that never occurred. Replacement failures must preserve the prior evidence, and uncertain successful writes require owner status inspection before retry."
        },
        {
          "kind": "paragraph",
          "text": "Recognition is advisory and cannot establish working condition, exact mass, internal composition, safe handling or achieved recycling. Customer edits allow only name and description. Classification, quantity, brand/model, size/weight, materials and environmental fields are read-only for customers and require business review. 'It is a tablet' does not automatically reclassify a supported recognized item in the current conversation code; a retake or authorized review is needed. The original photo/proposal remains evidence."
        },
        {
          "kind": "paragraph",
          "text": "A question never confirms the item. A supported explicit text correction may update allowed fields, clear estimate/confirmation revision and return REVIEW_DRAFT. The final customer confirmation remains a separate reviewed action with current revision and stable command reference. Do not accept provider-supplied action code, changed owner or invented measurements."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Handling and unknown details",
          "anchor": "circaCustomerKnowledge-3-handling-and-unknown-details"
        },
        {
          "kind": "paragraph",
          "text": "Descriptor size classes include SMALL, MEDIUM, LARGE, BULKY, HEAVY and UNKNOWN. The reusable policy currently gives CHARGER a SMALL mapping; that mapping is not a measured weight or a universal handling decision for every item. Preserve unknowns and distinguish photo observations, inferences, reference assumptions and operator measurements. An unidentified item must not silently inherit a mixed-load emissions coefficient."
        },
        {
          "kind": "paragraph",
          "text": "Centre staff owns applicable handling instructions. This guide and a photo cannot certify device/battery safety or replace approved centre policy. Do not turn material hints into recovery yields, hazardous-content measurements, safe-disposal guarantees or evidence of completed treatment. Environmental interpretation is defined by [Waste Impact providers](/docs/framework/waste-impact-providers#wasteImpactProviders-8-environmental-properties-and-credit-status), owned by wasteImpact."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Confirmation and review",
          "anchor": "circaCustomerKnowledge-4-confirmation-and-review"
        },
        {
          "kind": "paragraph",
          "text": "Review the supplied photo, selected centre, known/unknown facts and stated assessment limits, then explicitly confirm. Only the canonical successful server acknowledgement/status establishes system submission. For an uncertain response, inspect saved owner status and preserve the original command before retrying. Deposit instructions are configured centre handoff copy, not a physical receipt created by a click."
        },
        {
          "kind": "paragraph",
          "text": "Real authorized humans claim and verify/decide through Waste under effective permissions/scopes and revision checks. Shared requireScopes/requireVerification/requireDifferentApprover defaults are false; a particular independent-review promise needs approved later policy and qualified staff. A queue handoff label is not an assigned employee. Claimed records cannot be mutated by another employee, and separate-actor policy needs a real handoff."
        },
        {
          "kind": "paragraph",
          "text": "Flagged evidence can require explicit human acknowledgement before approval. Rejection requires a public reason. Recorded status/comment and settlement are different outcomes. Source-channel notification is optional configured Communication delivery; a delayed or uncertain message must not erase a decision or cause an automatic replay. This guide does not qualify reviewer eligibility or live notification delivery."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Benefits and ownership",
          "anchor": "circaCustomerKnowledge-5-benefits-and-ownership"
        },
        {
          "kind": "paragraph",
          "text": "Display environmental estimates only with stated units, source/provenance, scenario and uncertainty. WARM/AI adapters are optional configurations, not a universal selected sample or a source of certified credits. Prospective recycling input is not completed diversion, and INPUT_ONLY/partial results must remain labelled. A successful reassessment does not rewrite original approval rewards."
        },
        {
          "kind": "paragraph",
          "text": "Rewards require approved, persisted CONFIRMED reward evidence and actual successful Loyalty settlement. A missing published policy leaves reward evidence/settlement unavailable or pending rather than inventing an amount. Zero-value outcomes can complete without a wallet/ledger. Digital gift/sale operations and attached-carbon movement use their owning evidence; original approval rewards stay with the contributor. Physical receipt, transport, actual treatment and real merchant redemption remain separate and no fixed reward/timeline is promised."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Accounts, privacy and recovery",
          "anchor": "circaCustomerKnowledge-6-accounts-privacy-and-recovery"
        },
        {
          "kind": "paragraph",
          "text": "Use Profile-owned sign-in/registration. Enabled channel entry requires configured verified provider proof and a real account link; matching names/emails are not proof. Profile owns conflicts, persistence and one-use browser handoff. eWaste channel authentication defaults disabled. Lost/expired handoffs need fresh entry, not a manually manufactured token. Never include passwords, provider proof, tokens or other customers' details in a help conversation."
        },
        {
          "kind": "paragraph",
          "text": "Original photos remain owner-authorized evidence, not public catalogue images. Retention/deletion terms require actual applicable policy and operations; configured readiness status alone does not establish a timed cleanup job or deletion result. If AI guidance is unavailable, retain the supported explicit journey controls and inspect whether a draft was actually saved."
        },
        {
          "kind": "paragraph",
          "text": "DefaultEWasteConversationService grounds replies in an authorized draft and allowlisted facts. Its message/guidance methods validate at most 1500 characters and propagate revision conflicts. Questions can persist conversation history and advance record revision without changing facts; refresh from the returned draft before the next mutation. The service never submits, approves, pays, transfers ownership or issues credits."
        },
        {
          "kind": "paragraph",
          "text": "This authored knowledge page is not automatically indexed, retrieved or enforced by Copilot. guidance can compose trusted project copy with DefaultCopilotCustomerGuidanceService, but knowledge publication/retrieval and live channel use require separately qualified owner integration. In particular, built-in advice about manual centre selection cannot override an application's fresh-arrival requirement or establish actual item acceptance."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Audience and Ownership Checks",
          "anchor": "circa-customer-knowledge-audience-owner-checks"
        },
        {
          "kind": "paragraph",
          "text": "Business users distinguish helpful language from owner-confirmed status. Business evaluators assess honest unknowns and policy limits, not a chatbot demonstration as operational proof. Operators answer from recorded status and approved centre/retention policy. Administrators qualify channel and reviewer permissions. Developers, maintainers and AI tools preserve allowed customer fields, original evidence and trusted context instead of granting authority to a reply."
        },
        {
          "kind": "diagram",
          "language": "mermaid",
          "text": "flowchart TD\n  Question[Customer question and authorized draft] --> Guidance[Advisory guidance and bounded history]\n  Guidance --> Controls[Explicit supported journey controls]\n  Controls --> Confirm[Reviewed customer confirmation]\n  Confirm --> Ack[Canonical submission acknowledgement]\n  Ack --> Staff[Real employee claim and configured review]\n  Staff --> Status[Recorded decision]\n  Status --> Settlement[Separate owner settlement]\n  Status --> Physical[Separate physical receipt]"
        },
        {
          "kind": "table",
          "headers": [
            "Observation",
            "Meaning and safe response"
          ],
          "rows": [
            [
              "Centre marker or arrival",
              "Not complete item eligibility or physical receipt."
            ],
            [
              "Photo hint or size class",
              "Not a safety, condition or mass certification."
            ],
            [
              "Reply says progress saved",
              "Verify actual owner record/revision; first preparation can fail before persistence."
            ],
            [
              "Estimated benefit / pending reward",
              "Preserve assumptions and actual settlement status."
            ],
            [
              "Knowledge page exists",
              "Not proof of Copilot retrieval, reviewer readiness or native channel acceptance."
            ]
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Customize and extend safely",
          "anchor": "circa-customer-knowledge-customize-and-extend-safely"
        },
        {
          "kind": "paragraph",
          "text": "Prerequisites: a later-loaded customer module, authorized saved-draft message flow and an approved programme support statement. In the customer's config/properties.js, replace only the eWaste conversation reward copy. This refines the built-in reward-question branch; it does not enable knowledge retrieval, change rewards or relax a gate."
        },
        {
          "kind": "code",
          "language": "javascript",
          "text": "module.exports = {\n  eWaste: { conversation: {\n    rewardGuidance: 'Check your confirmed assessment and settlement status. Support cannot promise a reward amount or payment time.'\n  } }\n};"
        },
        {
          "kind": "paragraph",
          "text": "For an authorized current draft, 'When do I get a reward?' matches the existing question branch and returns that copy while preserving submitted facts and saving conversation history. A message over 1500 characters rejects ERR_EWASTE_MESSAGE_INVALID; a stale expectedRevision must propagate the owner conflict before a reply. Do not make support copy instruct callers to bypass arrival or change reviewed fields."
        },
        {
          "kind": "paragraph",
          "text": "If additional guidance policy is needed, use a small later project src/service adapter around guidance(request, policy), retaining authorized draft reads, trusted fixed-message selection and original owner error handling. A caller-controlled service or prompt is not an extension point. Test successful history, stale revision, provider failure, forbidden corrections and explicit-confirmation separation. Restore the previous project copy/adapter on rollback without deleting history, photos or canonical records."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Common Mistakes",
          "anchor": "circa-customer-knowledge-common-mistakes"
        },
        {
          "kind": "unordered-list",
          "items": [
            "Sending passwords, tokens or account proofs to advisory help.",
            "Treating a classification suggestion or customer correction as verified measurements.",
            "Claiming a first failed upload was saved or blindly replaying an uncertain confirmation.",
            "Promising complete eligibility, independent review, rewards, recycling or retention terms not established by the actual owners.",
            "Assuming publication of this page enables knowledge retrieval or qualifies a native channel."
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Verification",
          "anchor": "circa-customer-knowledge-verification"
        },
        {
          "kind": "paragraph",
          "text": "Qualification should exercise denied location, missing/stale policy, first preparation failure versus saved-photo replacement, held analysis, allowed/forbidden corrections, cancelled confirmation and acknowledged submission separately. Check current owner status after uncertainty, wrong-customer photo denial, reviewer assignment/scope denials and knowledge/provider failures. Verify ordinary explicit controls remain usable without AI, while authoritative assessment/eligibility requirements still reject correctly."
        },
        {
          "kind": "code",
          "language": "bash",
          "text": "# From eWaste; source guidance only, not executed by editorial review.\nnode --test test/eWasteGuidanceHistory.test.js test/eWasteConversationContract.test.js test/eWastePreparation.test.js"
        },
        {
          "kind": "paragraph",
          "text": "A source-reviewed, route-selectable guide still requires normal Process approval and publication before public delivery. Qualify knowledge retrieval and real customer, reviewer and channel behavior independently; published documentation is not evidence that those integrations passed."
        }
      ],
      "searchText": "Circa customer knowledge Reusable customer knowledge for advisory photo/guidance, known and unknown facts, confirmation, real review/settlement and explicitly unqualified retrieval/live journeys. # Circa customer knowledge\n\nThis Circa-labelled topic supplies reusable customer-facing knowledge boundaries for electronic-waste applications. Adapt its wording only to actual approved centre, identity, evidence and programme policy. It does not install a customer frontend, select a provider or prove the facts of an individual item. For beginners, work through one fictional item and distinguish supplied facts, advisory estimates and unknowns before asking for guidance. Confirm the selected centre and approved programme through their owners, then follow the customer-journey reference for submission and review. A helpful answer is not approval, a final reward or proof of physical receipt.\n\n## Location and arrival\n\nBrowse current centre information and ask staff about opening hours and the item they can accept. Public discovery requires active, operating ACTIVE and PUBLIC records, but currently reads at most 100 centres; it is not an exhaustive or item-filtered acceptance service. A marker, saved preference or directions link never proves eligibility, arrival or physical deposit.\n\nWhen an application has explicitly wired the reusable fresh-arrival service, usable new coordinates must lie within its configured inclusive direct-distance radius for preparation/confirmation. There is no framework radius default. Device permission and capture behavior belong to the host; browsing information need not require location. Invalid/stale positions need reacquisition and must not discard saved drafts/photos. Accuracy is optional metadata, not a rejection gate; reported coordinates are not tamper-proof physical proof.\n\nArrival preview selects by distance, not full collection-rule or opening-hour evaluation. Waste separately checks acceptedCategoryCodes only when provided as an array; absent restrictions do not certify acceptance. The ordinary native HTTP mapper does not automatically use the Journey service. A support answer must not promise enforcement or eligibility that the actual adapter has not qualified. For map configuration, refer to [Shared Map Configuration](/docs/framework/location-shared-map-configuration), owned by locationMap, rather than duplicating it here.\n\n## Photo, identification and correction\n\nUse the application's supported photo controls. Reusable preparation accepts canonical base64 JPEG, PNG or WebP within the configured byte bound, 5 MiB by default. It analyzes before durable Media/submission creation; supported recognition-unavailable failures can produce a held manual-review result. On a first failed preparation, there may be no saved draft/photo yet: do not promise persistence that never occurred. Replacement failures must preserve the prior evidence, and uncertain successful writes require owner status inspection before retry.\n\nRecognition is advisory and cannot establish working condition, exact mass, internal composition, safe handling or achieved recycling. Customer edits allow only name and description. Classification, quantity, brand/model, size/weight, materials and environmental fields are read-only for customers and require business review. 'It is a tablet' does not automatically reclassify a supported recognized item in the current conversation code; a retake or authorized review is needed. The original photo/proposal remains evidence.\n\nA question never confirms the item. A supported explicit text correction may update allowed fields, clear estimate/confirmation revision and return REVIEW_DRAFT. The final customer confirmation remains a separate reviewed action with current revision and stable command reference. Do not accept provider-supplied action code, changed owner or invented measurements.\n\n## Handling and unknown details\n\nDescriptor size classes include SMALL, MEDIUM, LARGE, BULKY, HEAVY and UNKNOWN. The reusable policy currently gives CHARGER a SMALL mapping; that mapping is not a measured weight or a universal handling decision for every item. Preserve unknowns and distinguish photo observations, inferences, reference assumptions and operator measurements. An unidentified item must not silently inherit a mixed-load emissions coefficient.\n\nCentre staff owns applicable handling instructions. This guide and a photo cannot certify device/battery safety or replace approved centre policy. Do not turn material hints into recovery yields, hazardous-content measurements, safe-disposal guarantees or evidence of completed treatment. Environmental interpretation is defined by [Waste Impact providers](/docs/framework/waste-impact-providers#wasteImpactProviders-8-environmental-properties-and-credit-status), owned by wasteImpact.\n\n## Confirmation and review\n\nReview the supplied photo, selected centre, known/unknown facts and stated assessment limits, then explicitly confirm. Only the canonical successful server acknowledgement/status establishes system submission. For an uncertain response, inspect saved owner status and preserve the original command before retrying. Deposit instructions are configured centre handoff copy, not a physical receipt created by a click.\n\nReal authorized humans claim and verify/decide through Waste under effective permissions/scopes and revision checks. Shared requireScopes/requireVerification/requireDifferentApprover defaults are false; a particular independent-review promise needs approved later policy and qualified staff. A queue handoff label is not an assigned employee. Claimed records cannot be mutated by another employee, and separate-actor policy needs a real handoff.\n\nFlagged evidence can require explicit human acknowledgement before approval. Rejection requires a public reason. Recorded status/comment and settlement are different outcomes. Source-channel notification is optional configured Communication delivery; a delayed or uncertain message must not erase a decision or cause an automatic replay. This guide does not qualify reviewer eligibility or live notification delivery.\n\n## Benefits and ownership\n\nDisplay environmental estimates only with stated units, source/provenance, scenario and uncertainty. WARM/AI adapters are optional configurations, not a universal selected sample or a source of certified credits. Prospective recycling input is not completed diversion, and INPUT_ONLY/partial results must remain labelled. A successful reassessment does not rewrite original approval rewards.\n\nRewards require approved, persisted CONFIRMED reward evidence and actual successful Loyalty settlement. A missing published policy leaves reward evidence/settlement unavailable or pending rather than inventing an amount. Zero-value outcomes can complete without a wallet/ledger. Digital gift/sale operations and attached-carbon movement use their owning evidence; original approval rewards stay with the contributor. Physical receipt, transport, actual treatment and real merchant redemption remain separate and no fixed reward/timeline is promised.\n\n## Accounts, privacy and recovery\n\nUse Profile-owned sign-in/registration. Enabled channel entry requires configured verified provider proof and a real account link; matching names/emails are not proof. Profile owns conflicts, persistence and one-use browser handoff. eWaste channel authentication defaults disabled. Lost/expired handoffs need fresh entry, not a manually manufactured token. Never include passwords, provider proof, tokens or other customers' details in a help conversation.\n\nOriginal photos remain owner-authorized evidence, not public catalogue images. Retention/deletion terms require actual applicable policy and operations; configured readiness status alone does not establish a timed cleanup job or deletion result. If AI guidance is unavailable, retain the supported explicit journey controls and inspect whether a draft was actually saved.\n\nDefaultEWasteConversationService grounds replies in an authorized draft and allowlisted facts. Its message/guidance methods validate at most 1500 characters and propagate revision conflicts. Questions can persist conversation history and advance record revision without changing facts; refresh from the returned draft before the next mutation. The service never submits, approves, pays, transfers ownership or issues credits.\n\nThis authored knowledge page is not automatically indexed, retrieved or enforced by Copilot. guidance can compose trusted project copy with DefaultCopilotCustomerGuidanceService, but knowledge publication/retrieval and live channel use require separately qualified owner integration. In particular, built-in advice about manual centre selection cannot override an application's fresh-arrival requirement or establish actual item acceptance.\n\n## Audience and Ownership Checks\n\nBusiness users distinguish helpful language from owner-confirmed status. Business evaluators assess honest unknowns and policy limits, not a chatbot demonstration as operational proof. Operators answer from recorded status and approved centre/retention policy. Administrators qualify channel and reviewer permissions. Developers, maintainers and AI tools preserve allowed customer fields, original evidence and trusted context instead of granting authority to a reply.\n\n```mermaid\nflowchart TD\n  Question[Customer question and authorized draft] --> Guidance[Advisory guidance and bounded history]\n  Guidance --> Controls[Explicit supported journey controls]\n  Controls --> Confirm[Reviewed customer confirmation]\n  Confirm --> Ack[Canonical submission acknowledgement]\n  Ack --> Staff[Real employee claim and configured review]\n  Staff --> Status[Recorded decision]\n  Status --> Settlement[Separate owner settlement]\n  Status --> Physical[Separate physical receipt]\n```\n\n| Observation | Meaning and safe response |\n| --- | --- |\n| Centre marker or arrival | Not complete item eligibility or physical receipt. |\n| Photo hint or size class | Not a safety, condition or mass certification. |\n| Reply says progress saved | Verify actual owner record/revision; first preparation can fail before persistence. |\n| Estimated benefit / pending reward | Preserve assumptions and actual settlement status. |\n| Knowledge page exists | Not proof of Copilot retrieval, reviewer readiness or native channel acceptance. |\n\n## Customize and extend safely\n\nPrerequisites: a later-loaded customer module, authorized saved-draft message flow and an approved programme support statement. In the customer's config/properties.js, replace only the eWaste conversation reward copy. This refines the built-in reward-question branch; it does not enable knowledge retrieval, change rewards or relax a gate.\n\n```javascript\nmodule.exports = {\n  eWaste: { conversation: {\n    rewardGuidance: 'Check your confirmed assessment and settlement status. Support cannot promise a reward amount or payment time.'\n  } }\n};\n```\n\nFor an authorized current draft, 'When do I get a reward?' matches the existing question branch and returns that copy while preserving submitted facts and saving conversation history. A message over 1500 characters rejects ERR_EWASTE_MESSAGE_INVALID; a stale expectedRevision must propagate the owner conflict before a reply. Do not make support copy instruct callers to bypass arrival or change reviewed fields.\n\nIf additional guidance policy is needed, use a small later project src/service adapter around guidance(request, policy), retaining authorized draft reads, trusted fixed-message selection and original owner error handling. A caller-controlled service or prompt is not an extension point. Test successful history, stale revision, provider failure, forbidden corrections and explicit-confirmation separation. Restore the previous project copy/adapter on rollback without deleting history, photos or canonical records.\n\n## Common Mistakes\n\n- Sending passwords, tokens or account proofs to advisory help.\n- Treating a classification suggestion or customer correction as verified measurements.\n- Claiming a first failed upload was saved or blindly replaying an uncertain confirmation.\n- Promising complete eligibility, independent review, rewards, recycling or retention terms not established by the actual owners.\n- Assuming publication of this page enables knowledge retrieval or qualifies a native channel.\n\n## Verification\n\nQualification should exercise denied location, missing/stale policy, first preparation failure versus saved-photo replacement, held analysis, allowed/forbidden corrections, cancelled confirmation and acknowledged submission separately. Check current owner status after uncertainty, wrong-customer photo denial, reviewer assignment/scope denials and knowledge/provider failures. Verify ordinary explicit controls remain usable without AI, while authoritative assessment/eligibility requirements still reject correctly.\n\n```bash\n# From eWaste; source guidance only, not executed by editorial review.\nnode --test test/eWasteGuidanceHistory.test.js test/eWasteConversationContract.test.js test/eWastePreparation.test.js\n```\n\nA source-reviewed, route-selectable guide still requires normal Process approval and publication before public delivery. Qualify knowledge retrieval and real customer, reviewer and channel behavior independently; published documentation is not evidence that those integrations passed.\n",
      "previous": {
        "title": "Circa demonstration dataset",
        "route": "/docs/circa-ewaste/circa-demo-data"
      },
      "next": null,
      "source": {
        "repository": "nodics.ai",
        "functionalModule": "nodics.accelerators",
        "technicalModule": "eWaste",
        "path": "data/docs-v001/records/documentation/circaDocumentationRelease002ComponentData.js",
        "wordCount": 1697,
        "checksum": "43c11ef3b666f0ca979880ea0566585b7d9d3bcacba33314261f1c03351a870b",
        "owner": "eWaste",
        "sourcePath": "data/docs-v001/records/documentation/circaDocumentationRelease002ComponentData.js"
      },
      "slug": "customer-knowledge",
      "locale": "en",
      "sourceEvidence": [
        "README.md",
        "AGENTS.md",
        "config/properties.js",
        "llm/contracts/e-waste-domain.md",
        "src/service/defaultEWasteConversationService.js",
        "src/service/defaultEWasteExperienceService.js",
        "src/service/defaultEWasteJourneyService.js",
        "src/service/defaultEWasteSubmissionPreparationService.js",
        "src/service/defaultEWasteChannelAuthenticationService.js",
        "src/service/defaultEWasteAcceptanceReadinessService.js",
        "src/service/defaultEWasteOutcomeCommunicationService.js",
        "test/eWasteGuidanceHistory.test.js",
        "test/eWasteConversationContract.test.js",
        "test/eWastePreparation.test.js",
        "../../../../../nodics.waste/modules/wasteCore/config/properties.js",
        "../../../../../nodics.waste/modules/wasteSubmission/src/service/defaultWasteSubmissionOperationService.js",
        "../../../../../nodics.waste/modules/wasteVerification/src/service/defaultWasteVerificationOperationService.js",
        "../../../../../nodics.waste/modules/wasteVerification/src/service/defaultWasteReviewWorkspaceService.js"
      ],
      "references": [
        {
          "documentId": "location.shared-map-configuration",
          "owner": "locationMap"
        },
        {
          "documentId": "waste.impact-providers",
          "owner": "wasteImpact"
        }
      ]
    },
    "active": true
  }
};
