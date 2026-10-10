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
    "code": "nodicsDocsComponentacceleratorsAgoraTelcoServiceJourney",
    "typeCode": "nodicsDocumentationArticleComponentType",
    "renderer": "documentation.component.article",
    "accessMode": "PUBLIC",
    "properties": {
      "code": "accelerators.agora-telco-service-journey",
      "title": "Agora Telco Service Journey",
      "route": "/docs/framework/accelerators-agora-telco-service-journey",
      "section": "accelerators-and-industry-solution-templates",
      "sectionTitle": "Accelerators and Industry Solution Templates",
      "group": "accelerators-and-industry-solution-templates",
      "groupTitle": "Accelerators and Industry Solution Templates",
      "parentId": "accelerators-and-industry-solution-templates",
      "hierarchyPath": [
        "Accelerators and Industry Solution Templates",
        "Agora Telco Service Journey"
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
        "commerce owner",
        "implementation partner"
      ],
      "technicalAudience": [
        "architect",
        "developer",
        "operator",
        "qa engineer",
        "ai tool"
      ],
      "summary": "Source-backed Telco plan, number intent, subscription transitions and provider-neutral service-order orchestration over shared Commerce.",
      "visibility": "public",
      "accessMode": "PUBLIC",
      "publiclyAvailable": true,
      "requiresAuthentication": false,
      "allowedRoles": [],
      "allowedGroups": [],
      "allowedPermissions": [],
      "lifecycleState": "STAGED",
      "version": "0.16.29",
      "maturityState": "partial",
      "implementationState": "source-verified",
      "renderingComponent": "documentation.component.article",
      "relatedPages": [
        "accelerators.agora-industry-templates",
        "accelerators.domain-commerce-source-map",
        "catalog.product-discovery-management",
        "order.management-lifecycle",
        "commerce.payment-provider-boundaries",
        "data.import-export-migration"
      ],
      "sourceEvidence": [
        "../telcoCatalog/src/service/defaultTelcoCatalogValidationService.js",
        "src/service/defaultTelcoSubscriptionService.js",
        "../telcoProvisioning/src/service/defaultTelcoProvisioningService.js",
        "../telcoCatalog/src/service/defaultTelcoProductSearchEnrichmentService.js",
        "../../config/properties.js",
        "package.json",
        "src/schemas",
        "src/service",
        "src/schemas/schemas.js",
        "config/properties.js",
        "llm/contracts/README.md"
      ],
      "visualRequirements": [
        "diagram",
        "configuration-table",
        "code-example",
        "troubleshooting-matrix"
      ],
      "searchKeywords": [
        "telco",
        "agora",
        "accelerator",
        "source-backed"
      ],
      "topicKeywords": [
        "Agora Telco Service Journey",
        "Accelerators"
      ],
      "headings": [
        {
          "text": "Agora Telco Service Journey",
          "anchor": "accelerators-agora-telco-service-journey",
          "level": 1
        },
        {
          "text": "Business result and beginner model",
          "anchor": "acceleratorsAgoraTelcoServiceJourney-1-business-result-and-beginner-model",
          "level": 2
        },
        {
          "text": "Module hierarchy and canonical references",
          "anchor": "acceleratorsAgoraTelcoServiceJourney-2-module-hierarchy-and-canonical-references",
          "level": 2
        },
        {
          "text": "Plan and allowance validation",
          "anchor": "acceleratorsAgoraTelcoServiceJourney-3-plan-and-allowance-validation",
          "level": 2
        },
        {
          "text": "Number intent and subscription state flow",
          "anchor": "acceleratorsAgoraTelcoServiceJourney-4-number-intent-and-subscription-state-flow",
          "level": 2
        },
        {
          "text": "Service-order construction and retry boundaries",
          "anchor": "acceleratorsAgoraTelcoServiceJourney-5-service-order-construction-and-retry-boundaries",
          "level": 2
        },
        {
          "text": "Configuration, adoption and operations",
          "anchor": "acceleratorsAgoraTelcoServiceJourney-6-configuration-adoption-and-operations",
          "level": 2
        },
        {
          "text": "Customize and extend safely",
          "anchor": "telco-subscription-customize-and-extend-safely",
          "level": 2
        },
        {
          "text": "Common mistakes",
          "anchor": "acceleratorsAgoraTelcoServiceJourney-7-common-mistakes",
          "level": 2
        },
        {
          "text": "Verification",
          "anchor": "acceleratorsAgoraTelcoServiceJourney-8-verification",
          "level": 2
        }
      ],
      "blocks": [
        {
          "kind": "heading",
          "level": 1,
          "text": "Agora Telco Service Journey",
          "anchor": "accelerators-agora-telco-service-journey"
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Business result and beginner model",
          "anchor": "acceleratorsAgoraTelcoServiceJourney-1-business-result-and-beginner-model"
        },
        {
          "kind": "paragraph",
          "text": "A Telco offer combines a commercial product with plan semantics, allowances, a number request and a subscription/service-order journey. The reusable Telco accelerator packages those domain concepts while Commerce continues to own the sellable Product, price, checkout, order and payment. For beginners, buying a plan and activating a network service are related decisions, not the same state transition. A paid order does not by itself establish that a SIM was provisioned, a number was ported or an external operator activated service. Agora Telco is a reference application using these reusable capabilities plus customer-owned offers and composition choices."
        },
        {
          "kind": "paragraph",
          "text": "This guide follows the inspected Telco services and identifies their limits explicitly. The catalog validator checks selected plan fields; the subscription service exposes allowed transitions and number-intent validation; the provisioning service constructs a provider-neutral service order and replays a supplied existing order with the same tenant and idempotency key. Those methods are not evidence of a live carrier integration, a transactional persistence boundary or a complete billing system. Developers and operators must qualify the owning APIs, persistence, authorization and actual provider separately before presenting production activation as available."
        },
        {
          "kind": "diagram",
          "language": "mermaid",
          "text": "flowchart LR\n  Product[Commerce Product] --> Plan[Telco plan offering]\n  Allowance[Allowance records] --> Plan\n  Plan --> Checkout[Commerce checkout and order]\n  Number[Validated number intent] --> Subscription[Subscription journey]\n  Checkout --> Subscription\n  Subscription --> ServiceOrder[Provider-neutral service order]\n  ServiceOrder -. Separate qualified integration .-> Carrier[Carrier activation evidence]"
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Module hierarchy and canonical references",
          "anchor": "acceleratorsAgoraTelcoServiceJourney-2-module-hierarchy-and-canonical-references"
        },
        {
          "kind": "table",
          "headers": [
            "Owner",
            "Responsibility",
            "Not a replacement for"
          ],
          "rows": [
            [
              "telco composition",
              "Reusable accelerator journey and module selection",
              "Customer branding or a new persistence engine"
            ],
            [
              "telcoCatalog",
              "Plan and allowance semantics; Product search enrichment",
              "Commerce Product or Pricing"
            ],
            [
              "telcoSubscription",
              "Allowed subscription transitions and number-intent checks",
              "Profile identity or external number ownership proof"
            ],
            [
              "telcoProvisioning",
              "Provider-neutral service-order construction and supplied-history replay",
              "A carrier adapter, durable lock or network activation"
            ],
            [
              "Commerce owners",
              "Product, checkout, order, payments and fulfillment contracts",
              "Telco-specific allowance policy"
            ]
          ]
        },
        {
          "kind": "paragraph",
          "text": "Use the shared Product and Order guides through their stable document references. Monetary precision, payment decisions and publication authority remain in their canonical owners rather than being restated as Telco-specific algorithms. Customer records for actual plans, prices, allowances and CMS copy stay in customer data packs. The optional data/docs-v001 records describe framework capabilities and do not create commercial plans when imported. Partners customize their own project modules using existing configuration layering and supported overrides; reusable framework changes follow the separate contribution and release path."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Plan and allowance validation",
          "anchor": "acceleratorsAgoraTelcoServiceJourney-3-plan-and-allowance-validation"
        },
        {
          "kind": "paragraph",
          "text": "DefaultTelcoCatalogValidationService.validate requires a productCode and a planType of PREPAID or POSTPAID. The simTypes list must contain at least one supported value, SIM or ESIM. It builds a set from the supplied allowance records and reports TELCO_ALLOWANCE_UNKNOWN if any referenced allowanceCodes are absent from that set. A POSTPAID plan also requires billingCycle. These checks produce a valid flag and an error list, allowing an application to explain all detected preparation issues instead of guessing another plan."
        },
        {
          "kind": "paragraph",
          "text": "The validator does not establish that productCode exists in Commerce, that a requested allowance is commercially permitted, that every SIM list item is supported, or that billingCycle has a particular numeric or scheduling meaning. In particular, the SIM condition checks for at least one recognized entry, not an exhaustive allowlist of every supplied entry. A beginner preparing catalogue data should therefore distinguish this reusable check from the complete business policy and schema validation of the application. Keep units, allowance values and customer eligibility policy explicit, and verify the real owning operations before import or publication."
        },
        {
          "kind": "table",
          "headers": [
            "Preparation problem",
            "Returned error",
            "Correction to investigate"
          ],
          "rows": [
            [
              "Missing Product identity or unsupported plan type",
              "TELCO_PLAN_INVALID",
              "Attach the intended canonical Product and a supported plan type"
            ],
            [
              "No recognized SIM or ESIM entry",
              "TELCO_SIM_TYPE_REQUIRED",
              "Supply an intentional supported SIM selection"
            ],
            [
              "Referenced allowance absent from supplied records",
              "TELCO_ALLOWANCE_UNKNOWN",
              "Correct the reference or provide the governed allowance"
            ],
            [
              "Postpaid plan has no billing cycle",
              "TELCO_BILLING_CYCLE_REQUIRED",
              "Supply the customer-approved billing-cycle policy"
            ]
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Number intent and subscription state flow",
          "anchor": "acceleratorsAgoraTelcoServiceJourney-4-number-intent-and-subscription-state-flow"
        },
        {
          "kind": "paragraph",
          "text": "validateNumberIntent recognizes NEW_NUMBER, PORT_IN and RETAIN_NUMBER. PORT_IN requires a truthy portabilityEvidence value. That requirement is an evidence-presence check, not a verification of consent, ownership, portability eligibility or carrier completion. Record the evidence through the appropriate authenticated application operation and keep sensitive proof out of public CMS documentation or storefront projections. A developer should test unknown intent types and absent porting evidence; a business operator should know which separate qualification actually confirms the number request. A rejected or absent intent returns { valid: false, errors: ['TELCO_NUMBER_INTENT_INVALID'] }. An empty object is truthy portabilityEvidence and passes this helper; the schema describes an object, but neither the helper nor this presence check certifies its contents."
        },
        {
          "kind": "diagram",
          "language": "mermaid",
          "text": "stateDiagram-v2\n  DRAFT --> PENDING_ACTIVATION\n  DRAFT --> CANCELLED\n  PENDING_ACTIVATION --> ACTIVE\n  PENDING_ACTIVATION --> CANCELLED\n  ACTIVE --> SUSPENDED\n  ACTIVE --> CANCELLED\n  SUSPENDED --> ACTIVE\n  SUSPENDED --> CANCELLED"
        },
        {
          "kind": "paragraph",
          "text": "canTransition reads a fixed transition map. DRAFT may become PENDING_ACTIVATION or CANCELLED. PENDING_ACTIVATION may become ACTIVE or CANCELLED. ACTIVE may become SUSPENDED or CANCELLED. SUSPENDED may become ACTIVE or CANCELLED. CANCELLED has no outgoing transition. An ordinary unrecognized source state returns false. The helper indexes a plain object without an own-key guard, so inherited names such as constructor or toString can throw; accept only the schema's five lifecycle states at the calling operation. The method answers whether a transition is listed; it does not save a subscription, authorize the caller, compare revisions or prove activation. Preserve those checks in the owning workflow or application operation rather than treating a pure boolean result as a completed mutation."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Service-order construction and retry boundaries",
          "anchor": "acceleratorsAgoraTelcoServiceJourney-5-service-order-construction-and-retry-boundaries"
        },
        {
          "kind": "paragraph",
          "text": "DefaultTelcoProvisioningService.create requires tenant, subscriptionCode, orderCode and idempotencyKey. Missing context throws TELCO_PROVISIONING_CONTEXT_REQUIRED. It searches the supplied existing records for a match on tenant and idempotencyKey; a match is returned with replayed true. Otherwise it creates a serviceOrder with code from request.code or the idempotency key, the supplied tenant/subscription/order references, action defaulting to ACTIVATE, status PENDING and revision 1. The returned replayed flag is false for a new object. action is copied without enum validation by this helper; qualify the schema and caller before accepting arbitrary actions."
        },
        {
          "kind": "paragraph",
          "text": "This source-level replay is useful orchestration behavior, but its evidence boundary matters. It relies on the caller supplying authoritative existing records. It does not itself persist the result, enforce a database uniqueness constraint, resolve concurrent writers or compare the matched order against different request payload fields. Applications must use trusted tenant context and retain the owning persistence and command contract; do not claim exactly-once carrier provisioning from this method alone. An operator investigating retries should compare the stored service order, source Commerce order and idempotency context before requesting another external activation."
        },
        {
          "kind": "code",
          "language": "javascript",
          "text": "const request = { tenant: 'trustedTenant', subscriptionCode: 'subscriptionA',\n  orderCode: 'commerceOrderA', idempotencyKey: 'activationA' };\n// The owning service returns status PENDING for a new service-order object.\n// replayed=true requires matching authoritative history supplied by its caller.\n// Neither result is proof of external carrier activation."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Configuration, adoption and operations",
          "anchor": "acceleratorsAgoraTelcoServiceJourney-6-configuration-adoption-and-operations"
        },
        {
          "kind": "table",
          "headers": [
            "Decision",
            "Where it belongs",
            "Evidence to retain"
          ],
          "rows": [
            [
              "Select the Telco accelerator",
              "Project/runtime composition",
              "Effective module graph and selected domain contributions"
            ],
            [
              "Concrete offers and allowance values",
              "Customer-owned business data releases",
              "Validated references and import history"
            ],
            [
              "Provider credentials and actual carrier adapter",
              "Backend provider/configuration boundary",
              "Least-privilege configuration and live integration qualification"
            ],
            [
              "Documentation selection",
              "Optional Axis documentation profile",
              "Selected pack receipt, review and publication evidence"
            ],
            [
              "Activation status",
              "Owning subscription/service-order operations",
              "Durable state and actual provider evidence, not a CMS claim"
            ]
          ]
        },
        {
          "kind": "paragraph",
          "text": "Use the existing nConfig hierarchy for deployment choices rather than copying framework defaults into every server. Documentation selection is independent of business data selection: the Telco guide pack includes its shared documentation scaffold, but not an Agora offer catalogue or unrelated capability articles. Import into WCMS Staged through Axis and publish only through the normal reviewed flow. The Online navigation must be based on routes in the immutable published bundle. A missing optional shared guide is not permission to install its data implicitly or copy its content into this article. For customer catalogue diagnosis, DefaultTelcoProductSearchEnrichmentService reads the first ACTIVE plan for the Commerce product and only ACTIVE allowances whose codes it references. Missing readers produce an empty enrichment; missing or inactive allowance records can produce a partial allowance list. It does not call the plan validator. Compare imported plan and allowance status in the trusted tenant, correct the customer release and use normal Product publication; changing a subscription to ACTIVE will not repair a missing product projection."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Customize and extend safely",
          "anchor": "telco-subscription-customize-and-extend-safely"
        },
        {
          "kind": "paragraph",
          "text": "A partner developer keeps actual plans, allowances and number-intent data in project-owned data/<release>/records and changes deployment composition through the existing module graph. telcoSubscription/config/properties.js defines access policy and inert reset contributions, not a configurable transitions map. The transition vocabulary lives in DefaultTelcoSubscriptionService; a deliberate behavior change uses a later project src/service/defaultTelcoSubscriptionService.js override, with matching schema work if states change. Preserve trusted tenant and customer references, authorization, revision checks and carrier evidence in the owning operation. This override is not a permission to skip activation evidence or resurrect CANCELLED records."
        },
        {
          "kind": "code",
          "language": "javascript",
          "text": "const service = SERVICE.DefaultTelcoSubscriptionService;\nconst intent = service.validateNumberIntent({ intentType: 'PORT_IN' });\n// { valid: false, errors: ['TELCO_NUMBER_INTENT_INVALID'] }\nconst allowed = service.canTransition('ACTIVE', 'SUSPENDED'); // true\nconst rejected = service.canTransition('CANCELLED', 'ACTIVE'); // false\n// These helpers do not persist a transition or call a carrier."
        },
        {
          "kind": "table",
          "headers": [
            "Operator observation",
            "Investigate",
            "Recovery boundary"
          ],
          "rows": [
            [
              "PORT_IN intent rejected",
              "Missing intent type or portabilityEvidence",
              "Collect authorized evidence and revalidate; never invent port completion"
            ],
            [
              "Transition returns false",
              "Current persisted state and requested target",
              "Refresh the authorized record and use a permitted operation with its revision"
            ],
            [
              "Same idempotency key returns a different-looking order",
              "Original tenant/key history and original request",
              "Resolve the conflict with its owner before any new carrier action"
            ],
            [
              "PENDING after a paid order",
              "Durable service order and external provider evidence",
              "Keep the customer informed of pending activation; helper construction is not success"
            ]
          ]
        },
        {
          "kind": "paragraph",
          "text": "Test positive and rejected intents, every supported transition, unknown and inherited state names, same-tenant replay, foreign tenants and conflicting request payloads in the customer operation. Existing generated schema tests cover field contracts; they do not prove that direct generated CRUD enforces canTransition. Qualify that integration explicitly before rollout."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Common mistakes",
          "anchor": "acceleratorsAgoraTelcoServiceJourney-7-common-mistakes"
        },
        {
          "kind": "paragraph",
          "text": "Do not create another Product, Order or customer identity to represent a Telco journey. Do not equate PORT_IN evidence presence with verified ownership or a successful number port. Do not treat canTransition as persistence or authorization. Do not call a newly constructed PENDING service order an activated service. Do not advertise a carrier adapter merely because a provider-neutral order object exists. Do not use documentation import to provision plans or customer subscriptions. Do not hide a failed normal review or publication decision by retrying with broader credentials."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Verification",
          "anchor": "acceleratorsAgoraTelcoServiceJourney-8-verification"
        },
        {
          "kind": "paragraph",
          "text": "Run the owning Telco contracts for prepaid/postpaid validation, missing billing cycle, unknown allowances, unsupported number intents and absent PORT_IN evidence. Exercise every listed subscription transition, disallowed transitions and terminal CANCELLED behavior. Verify service-order rejection for missing trusted context, first construction, same-tenant replay and isolation between tenants. Then separately test the actual caller persistence/revision/concurrency behavior and any qualified carrier adapter. For documentation, validate hierarchy, stable cross-module references, local hashes and module-only staging. Record runtime import, Process approval, Online publication and browser delivery as distinct acceptance steps. Source inspection and passing unit tests alone must never be reported as a completed production Telco activation."
        }
      ],
      "searchText": "Agora Telco Service Journey Source-backed Telco plan, number intent, subscription transitions and provider-neutral service-order orchestration over shared Commerce. # Agora Telco Service Journey\n\n## Business result and beginner model\n\nA Telco offer combines a commercial product with plan semantics, allowances, a number request and a subscription/service-order journey. The reusable Telco accelerator packages those domain concepts while Commerce continues to own the sellable Product, price, checkout, order and payment. For beginners, buying a plan and activating a network service are related decisions, not the same state transition. A paid order does not by itself establish that a SIM was provisioned, a number was ported or an external operator activated service. Agora Telco is a reference application using these reusable capabilities plus customer-owned offers and composition choices.\n\nThis guide follows the inspected Telco services and identifies their limits explicitly. The catalog validator checks selected plan fields; the subscription service exposes allowed transitions and number-intent validation; the provisioning service constructs a provider-neutral service order and replays a supplied existing order with the same tenant and idempotency key. Those methods are not evidence of a live carrier integration, a transactional persistence boundary or a complete billing system. Developers and operators must qualify the owning APIs, persistence, authorization and actual provider separately before presenting production activation as available.\n\n```mermaid\nflowchart LR\n  Product[Commerce Product] --> Plan[Telco plan offering]\n  Allowance[Allowance records] --> Plan\n  Plan --> Checkout[Commerce checkout and order]\n  Number[Validated number intent] --> Subscription[Subscription journey]\n  Checkout --> Subscription\n  Subscription --> ServiceOrder[Provider-neutral service order]\n  ServiceOrder -. Separate qualified integration .-> Carrier[Carrier activation evidence]\n```\n\n## Module hierarchy and canonical references\n\n| Owner | Responsibility | Not a replacement for |\n| --- | --- | --- |\n| telco composition | Reusable accelerator journey and module selection | Customer branding or a new persistence engine |\n| telcoCatalog | Plan and allowance semantics; Product search enrichment | Commerce Product or Pricing |\n| telcoSubscription | Allowed subscription transitions and number-intent checks | Profile identity or external number ownership proof |\n| telcoProvisioning | Provider-neutral service-order construction and supplied-history replay | A carrier adapter, durable lock or network activation |\n| Commerce owners | Product, checkout, order, payments and fulfillment contracts | Telco-specific allowance policy |\n\nUse the shared Product and Order guides through their stable document references. Monetary precision, payment decisions and publication authority remain in their canonical owners rather than being restated as Telco-specific algorithms. Customer records for actual plans, prices, allowances and CMS copy stay in customer data packs. The optional data/docs-v001 records describe framework capabilities and do not create commercial plans when imported. Partners customize their own project modules using existing configuration layering and supported overrides; reusable framework changes follow the separate contribution and release path.\n\n## Plan and allowance validation\n\nDefaultTelcoCatalogValidationService.validate requires a productCode and a planType of PREPAID or POSTPAID. The simTypes list must contain at least one supported value, SIM or ESIM. It builds a set from the supplied allowance records and reports TELCO_ALLOWANCE_UNKNOWN if any referenced allowanceCodes are absent from that set. A POSTPAID plan also requires billingCycle. These checks produce a valid flag and an error list, allowing an application to explain all detected preparation issues instead of guessing another plan.\n\nThe validator does not establish that productCode exists in Commerce, that a requested allowance is commercially permitted, that every SIM list item is supported, or that billingCycle has a particular numeric or scheduling meaning. In particular, the SIM condition checks for at least one recognized entry, not an exhaustive allowlist of every supplied entry. A beginner preparing catalogue data should therefore distinguish this reusable check from the complete business policy and schema validation of the application. Keep units, allowance values and customer eligibility policy explicit, and verify the real owning operations before import or publication.\n\n| Preparation problem | Returned error | Correction to investigate |\n| --- | --- | --- |\n| Missing Product identity or unsupported plan type | TELCO_PLAN_INVALID | Attach the intended canonical Product and a supported plan type |\n| No recognized SIM or ESIM entry | TELCO_SIM_TYPE_REQUIRED | Supply an intentional supported SIM selection |\n| Referenced allowance absent from supplied records | TELCO_ALLOWANCE_UNKNOWN | Correct the reference or provide the governed allowance |\n| Postpaid plan has no billing cycle | TELCO_BILLING_CYCLE_REQUIRED | Supply the customer-approved billing-cycle policy |\n\n## Number intent and subscription state flow\n\nvalidateNumberIntent recognizes NEW_NUMBER, PORT_IN and RETAIN_NUMBER. PORT_IN requires a truthy portabilityEvidence value. That requirement is an evidence-presence check, not a verification of consent, ownership, portability eligibility or carrier completion. Record the evidence through the appropriate authenticated application operation and keep sensitive proof out of public CMS documentation or storefront projections. A developer should test unknown intent types and absent porting evidence; a business operator should know which separate qualification actually confirms the number request. A rejected or absent intent returns { valid: false, errors: ['TELCO_NUMBER_INTENT_INVALID'] }. An empty object is truthy portabilityEvidence and passes this helper; the schema describes an object, but neither the helper nor this presence check certifies its contents.\n\n```mermaid\nstateDiagram-v2\n  DRAFT --> PENDING_ACTIVATION\n  DRAFT --> CANCELLED\n  PENDING_ACTIVATION --> ACTIVE\n  PENDING_ACTIVATION --> CANCELLED\n  ACTIVE --> SUSPENDED\n  ACTIVE --> CANCELLED\n  SUSPENDED --> ACTIVE\n  SUSPENDED --> CANCELLED\n```\n\ncanTransition reads a fixed transition map. DRAFT may become PENDING_ACTIVATION or CANCELLED. PENDING_ACTIVATION may become ACTIVE or CANCELLED. ACTIVE may become SUSPENDED or CANCELLED. SUSPENDED may become ACTIVE or CANCELLED. CANCELLED has no outgoing transition. An ordinary unrecognized source state returns false. The helper indexes a plain object without an own-key guard, so inherited names such as constructor or toString can throw; accept only the schema's five lifecycle states at the calling operation. The method answers whether a transition is listed; it does not save a subscription, authorize the caller, compare revisions or prove activation. Preserve those checks in the owning workflow or application operation rather than treating a pure boolean result as a completed mutation.\n\n## Service-order construction and retry boundaries\n\nDefaultTelcoProvisioningService.create requires tenant, subscriptionCode, orderCode and idempotencyKey. Missing context throws TELCO_PROVISIONING_CONTEXT_REQUIRED. It searches the supplied existing records for a match on tenant and idempotencyKey; a match is returned with replayed true. Otherwise it creates a serviceOrder with code from request.code or the idempotency key, the supplied tenant/subscription/order references, action defaulting to ACTIVATE, status PENDING and revision 1. The returned replayed flag is false for a new object. action is copied without enum validation by this helper; qualify the schema and caller before accepting arbitrary actions.\n\nThis source-level replay is useful orchestration behavior, but its evidence boundary matters. It relies on the caller supplying authoritative existing records. It does not itself persist the result, enforce a database uniqueness constraint, resolve concurrent writers or compare the matched order against different request payload fields. Applications must use trusted tenant context and retain the owning persistence and command contract; do not claim exactly-once carrier provisioning from this method alone. An operator investigating retries should compare the stored service order, source Commerce order and idempotency context before requesting another external activation.\n\n```javascript\nconst request = { tenant: 'trustedTenant', subscriptionCode: 'subscriptionA',\n  orderCode: 'commerceOrderA', idempotencyKey: 'activationA' };\n// The owning service returns status PENDING for a new service-order object.\n// replayed=true requires matching authoritative history supplied by its caller.\n// Neither result is proof of external carrier activation.\n```\n\n## Configuration, adoption and operations\n\n| Decision | Where it belongs | Evidence to retain |\n| --- | --- | --- |\n| Select the Telco accelerator | Project/runtime composition | Effective module graph and selected domain contributions |\n| Concrete offers and allowance values | Customer-owned business data releases | Validated references and import history |\n| Provider credentials and actual carrier adapter | Backend provider/configuration boundary | Least-privilege configuration and live integration qualification |\n| Documentation selection | Optional Axis documentation profile | Selected pack receipt, review and publication evidence |\n| Activation status | Owning subscription/service-order operations | Durable state and actual provider evidence, not a CMS claim |\n\nUse the existing nConfig hierarchy for deployment choices rather than copying framework defaults into every server. Documentation selection is independent of business data selection: the Telco guide pack includes its shared documentation scaffold, but not an Agora offer catalogue or unrelated capability articles. Import into WCMS Staged through Axis and publish only through the normal reviewed flow. The Online navigation must be based on routes in the immutable published bundle. A missing optional shared guide is not permission to install its data implicitly or copy its content into this article. For customer catalogue diagnosis, DefaultTelcoProductSearchEnrichmentService reads the first ACTIVE plan for the Commerce product and only ACTIVE allowances whose codes it references. Missing readers produce an empty enrichment; missing or inactive allowance records can produce a partial allowance list. It does not call the plan validator. Compare imported plan and allowance status in the trusted tenant, correct the customer release and use normal Product publication; changing a subscription to ACTIVE will not repair a missing product projection.\n\n## Customize and extend safely\n\nA partner developer keeps actual plans, allowances and number-intent data in project-owned data/<release>/records and changes deployment composition through the existing module graph. telcoSubscription/config/properties.js defines access policy and inert reset contributions, not a configurable transitions map. The transition vocabulary lives in DefaultTelcoSubscriptionService; a deliberate behavior change uses a later project src/service/defaultTelcoSubscriptionService.js override, with matching schema work if states change. Preserve trusted tenant and customer references, authorization, revision checks and carrier evidence in the owning operation. This override is not a permission to skip activation evidence or resurrect CANCELLED records.\n\n```javascript\nconst service = SERVICE.DefaultTelcoSubscriptionService;\nconst intent = service.validateNumberIntent({ intentType: 'PORT_IN' });\n// { valid: false, errors: ['TELCO_NUMBER_INTENT_INVALID'] }\nconst allowed = service.canTransition('ACTIVE', 'SUSPENDED'); // true\nconst rejected = service.canTransition('CANCELLED', 'ACTIVE'); // false\n// These helpers do not persist a transition or call a carrier.\n```\n\n| Operator observation | Investigate | Recovery boundary |\n| --- | --- | --- |\n| PORT_IN intent rejected | Missing intent type or portabilityEvidence | Collect authorized evidence and revalidate; never invent port completion |\n| Transition returns false | Current persisted state and requested target | Refresh the authorized record and use a permitted operation with its revision |\n| Same idempotency key returns a different-looking order | Original tenant/key history and original request | Resolve the conflict with its owner before any new carrier action |\n| PENDING after a paid order | Durable service order and external provider evidence | Keep the customer informed of pending activation; helper construction is not success |\n\nTest positive and rejected intents, every supported transition, unknown and inherited state names, same-tenant replay, foreign tenants and conflicting request payloads in the customer operation. Existing generated schema tests cover field contracts; they do not prove that direct generated CRUD enforces canTransition. Qualify that integration explicitly before rollout.\n\n## Common mistakes\n\nDo not create another Product, Order or customer identity to represent a Telco journey. Do not equate PORT_IN evidence presence with verified ownership or a successful number port. Do not treat canTransition as persistence or authorization. Do not call a newly constructed PENDING service order an activated service. Do not advertise a carrier adapter merely because a provider-neutral order object exists. Do not use documentation import to provision plans or customer subscriptions. Do not hide a failed normal review or publication decision by retrying with broader credentials.\n\n## Verification\n\nRun the owning Telco contracts for prepaid/postpaid validation, missing billing cycle, unknown allowances, unsupported number intents and absent PORT_IN evidence. Exercise every listed subscription transition, disallowed transitions and terminal CANCELLED behavior. Verify service-order rejection for missing trusted context, first construction, same-tenant replay and isolation between tenants. Then separately test the actual caller persistence/revision/concurrency behavior and any qualified carrier adapter. For documentation, validate hierarchy, stable cross-module references, local hashes and module-only staging. Record runtime import, Process approval, Online publication and browser delivery as distinct acceptance steps. Source inspection and passing unit tests alone must never be reported as a completed production Telco activation.\n",
      "source": {
        "repository": "nodics.ai",
        "owner": "telcoSubscription",
        "functionalModule": "nodics.accelerators",
        "technicalModule": "telcoSubscription",
        "sourcePath": "data/docs-v001/records/documentation/telcoSubscriptionDocumentationComponentData.js",
        "path": "data/docs-v001/records/documentation/telcoSubscriptionDocumentationComponentData.js",
        "checksum": "476aa65a4d88d1a5a33e665f2bf13102c8fa8e31ae91aa25b53447991ccc891b",
        "wordCount": 1832
      },
      "slug": "accelerators-agora-telco-service-journey",
      "locale": "en",
      "navigationGroup": "Agora Accelerator Family",
      "navigationGroupCode": "agora-accelerator-family",
      "navigationGroupOrder": 10,
      "navigationOrder": 910,
      "references": [
        {
          "documentId": "accelerators.agora-industry-templates",
          "owner": "nodics.docs"
        },
        {
          "documentId": "accelerators.domain-commerce-source-map",
          "owner": "domainCommerceCore"
        },
        {
          "documentId": "catalog.product-discovery-management",
          "owner": "product"
        },
        {
          "documentId": "order.management-lifecycle",
          "owner": "order"
        },
        {
          "documentId": "commerce.payment-provider-boundaries",
          "owner": "paymentCore"
        },
        {
          "documentId": "data.import-export-migration",
          "owner": "import"
        }
      ]
    },
    "active": true
  }
};
