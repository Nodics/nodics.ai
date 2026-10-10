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
    "code": "nodicsDocsComponentacceleratorsAgoraElectronicsProductSemantics",
    "typeCode": "nodicsDocumentationArticleComponentType",
    "renderer": "documentation.component.article",
    "accessMode": "PUBLIC",
    "properties": {
      "code": "accelerators.agora-electronics-product-semantics",
      "title": "Agora Electronics Product Semantics",
      "route": "/docs/framework/accelerators-agora-electronics-product-semantics",
      "section": "accelerators-and-industry-solution-templates",
      "sectionTitle": "Accelerators and Industry Solution Templates",
      "group": "accelerators-and-industry-solution-templates",
      "groupTitle": "Accelerators and Industry Solution Templates",
      "parentId": "accelerators-and-industry-solution-templates",
      "hierarchyPath": [
        "Accelerators and Industry Solution Templates",
        "Agora Electronics Product Semantics"
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
      "summary": "Source-backed Electronics specifications, compatibility, warranty, device identity, safe Product projection and partner adoption over canonical Commerce.",
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
        "catalog.product-discovery-management",
        "pricing.promotions-tax-management",
        "inventory.stock-management",
        "wcms.media-import-publication",
        "data.import-export-migration"
      ],
      "sourceEvidence": [
        "src/service/defaultElectronicsProductValidationService.js",
        "src/service/defaultElectronicsProductProjectionService.js",
        "src/service/defaultElectronicsProductSearchEnrichmentService.js",
        "config/properties.js",
        "test/electronicsProductContract.test.js",
        "package.json",
        "src/schemas",
        "src/service",
        "src/schemas/schemas.js",
        "llm/contracts/README.md"
      ],
      "visualRequirements": [
        "diagram",
        "configuration-table",
        "code-example",
        "troubleshooting-matrix"
      ],
      "searchKeywords": [
        "electronicsProduct",
        "agora",
        "accelerator",
        "source-backed"
      ],
      "topicKeywords": [
        "Agora Electronics Product Semantics",
        "Accelerators"
      ],
      "headings": [
        {
          "text": "Agora Electronics Product Semantics",
          "anchor": "accelerators-agora-electronics-product-semantics",
          "level": 1
        },
        {
          "text": "Business result and beginner model",
          "anchor": "acceleratorsAgoraElectronicsProductSemantics-1-business-result-and-beginner-model",
          "level": 2
        },
        {
          "text": "Ownership and source map",
          "anchor": "acceleratorsAgoraElectronicsProductSemantics-2-ownership-and-source-map",
          "level": 2
        },
        {
          "text": "Specification and compatibility decisions",
          "anchor": "acceleratorsAgoraElectronicsProductSemantics-3-specification-and-compatibility-decisions",
          "level": 2
        },
        {
          "text": "Warranty and device identity configuration",
          "anchor": "acceleratorsAgoraElectronicsProductSemantics-4-warranty-and-device-identity-configuration",
          "level": 2
        },
        {
          "text": "Projection and publication flow",
          "anchor": "acceleratorsAgoraElectronicsProductSemantics-5-projection-and-publication-flow",
          "level": 2
        },
        {
          "text": "Customize and extend safely",
          "anchor": "acceleratorsAgoraElectronicsProductSemantics-6-partner-customization-and-operational-verification",
          "level": 2
        },
        {
          "text": "Common mistakes",
          "anchor": "acceleratorsAgoraElectronicsProductSemantics-7-common-mistakes",
          "level": 2
        },
        {
          "text": "Verification",
          "anchor": "acceleratorsAgoraElectronicsProductSemantics-8-verification",
          "level": 2
        }
      ],
      "blocks": [
        {
          "kind": "heading",
          "level": 1,
          "text": "Agora Electronics Product Semantics",
          "anchor": "accelerators-agora-electronics-product-semantics"
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Business result and beginner model",
          "anchor": "acceleratorsAgoraElectronicsProductSemantics-1-business-result-and-beginner-model"
        },
        {
          "kind": "paragraph",
          "text": "An Electronics catalogue needs more than a product name and a price. A business buyer needs to compare specifications, check whether an accessory fits a device, understand warranty coverage and know which device identifiers the operation expects. The reusable electronicsProduct accelerator supplies these domain semantics over Commerce Product. For beginners, the important distinction is that a specification profile enriches an existing product; it is not another sellable-product identity, another inventory ledger or a replacement checkout. Agora Electronics demonstrates an application composed from that accelerator and customer-owned catalogue choices."
        },
        {
          "kind": "paragraph",
          "text": "A developer should begin with an existing Commerce product code and connect the supporting profiles to it. An operator should distinguish source validation from installed import, published projection and customer delivery. Passing a pure service test does not establish that the application has imported its catalogue, published its product or configured a live warranty provider. This guide describes inspected source behavior and an adoption checklist, not a claim that any customer environment is qualified for production."
        },
        {
          "kind": "diagram",
          "language": "mermaid",
          "text": "flowchart LR\n  Product[Commerce Product identity] --> Spec[Electronics specification profile]\n  Spec --> Projection[Active Electronics projection]\n  Warranty[Active warranty profile] --> Projection\n  Compatibility[Compatibility requirements] --> Validation[Compatibility check]\n  Policy[Device identity policy] --> Validation\n  Projection --> Publication[Commerce publication and search enrichment]\n  Publication --> Storefront[Customer catalogue]"
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Ownership and source map",
          "anchor": "acceleratorsAgoraElectronicsProductSemantics-2-ownership-and-source-map"
        },
        {
          "kind": "table",
          "headers": [
            "Concern",
            "Canonical authority",
            "Electronics responsibility"
          ],
          "rows": [
            [
              "Product identity and lifecycle",
              "Commerce Product",
              "Refer to productCode; add specification semantics"
            ],
            [
              "Price, promotions and tax",
              "Owning Commerce capabilities",
              "No duplicate monetary calculation"
            ],
            [
              "Inventory and fulfillment",
              "Inventory and Fulfillment",
              "No substitute stock or shipment ledger"
            ],
            [
              "Specification and compatibility",
              "electronicsProduct",
              "Validate required identity and requested capabilities"
            ],
            [
              "Warranty and identifier vocabulary",
              "electronicsProduct configuration",
              "Validate configured units and supported types"
            ],
            [
              "Images and delivery",
              "Media with Product/CMS relationships",
              "Reference Media codes; never create another storage provider"
            ]
          ]
        },
        {
          "kind": "paragraph",
          "text": "DefaultElectronicsProductValidationService owns validateSpecification, compatible, validateWarranty and validateIdentityPolicy. DefaultElectronicsProductProjectionService builds the customer-facing additions. DefaultElectronicsProductSearchEnrichmentService contributes domain enrichment to Product publication. Read these owning services before changing policy, and use the related canonical Product, Pricing, Inventory and Media guides for shared behavior instead of copying their detail into an application guide. The customer project owns real devices, offers, product copy, concrete values and presentation choices."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Specification and compatibility decisions",
          "anchor": "acceleratorsAgoraElectronicsProductSemantics-3-specification-and-compatibility-decisions"
        },
        {
          "kind": "paragraph",
          "text": "validateSpecification checks truthy productCode and specificationFamilyCode plus a specifications value with at least one enumerable key. The schema separately requires specifications to be an object; the helper alone does not reject every wrong input type. Its error vocabulary distinguishes missing specification identity from missing specifications. That check is deliberately narrower than a complete customer catalogue policy: it does not prove the product exists, the family is appropriate, every value has a correct physical unit or the claimed specification is factually true. A project that needs those checks adds supported policy or validation through its later module layer and tests the extra boundary. Do not describe a successful basic check as certification of a device."
        },
        {
          "kind": "paragraph",
          "text": "compatible compares every required key with the candidate value or list of values. A requirement passes when its exact required value is present in the candidate list. The returned mismatches identify requirement keys rather than silently selecting another accessory. An empty requirement set passes this comparison; missing candidate capabilities fail nonempty requirements. This is a capability-membership comparison, not a standards negotiation engine, electrical safety assessment or fuzzy unit converter. Maintain the same vocabulary and units on both sides, and give the business user a comprehensible explanation for each mismatch. Candidate scalar zero, false and an empty string are treated as missing by the current logical-or expression. Validate the caller's comparison vocabulary and shape before using those values; the helper is not a general typed equality implementation."
        },
        {
          "kind": "table",
          "headers": [
            "Input",
            "Source behavior",
            "Business interpretation"
          ],
          "rows": [
            [
              "productCode absent",
              "Specification identity error",
              "Profile is not ready to attach to a product"
            ],
            [
              "specifications empty",
              "Specifications-required error",
              "Comparison detail is missing"
            ],
            [
              "Required value appears in candidate list",
              "That key matches",
              "Declared requirement is represented"
            ],
            [
              "Required key missing from candidate",
              "Key appears in mismatches",
              "Do not imply compatibility"
            ],
            [
              "No requirements supplied",
              "No mismatches",
              "Not evidence that all real-world constraints were checked"
            ]
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Warranty and device identity configuration",
          "anchor": "acceleratorsAgoraElectronicsProductSemantics-4-warranty-and-device-identity-configuration"
        },
        {
          "kind": "paragraph",
          "text": "The default warranty units are DAY, MONTH and YEAR. validateWarranty requires a numerically positive duration, a configured durationUnit and at least one coverage item. A two-year warranty with PARTS and LABOUR is explicitly exercised by the independent module contract. The reusable method does not adjudicate a warranty claim, compute legal entitlement, verify the supplier contract or establish an expiry date. Business owners must confirm their offered coverage and applicable rules separately; operators retain the approved source and the configured unit vocabulary. The helper itself does not require an integer or finite duration and only checks coverage.length. Schema validation and an owning operation must reject malformed coverage, nonfinite durations and unsupported policy changes. A new warranty unit needs a corresponding later src/schemas/schemas.js extension as well as configuration because the checked-in schema enum remains DAY, MONTH, YEAR."
        },
        {
          "kind": "paragraph",
          "text": "The default device identifier vocabulary is SERIAL, IMEI, MEID and MAC. validateIdentityPolicy checks that the supplied identifierTypes are supported and that the policy contains at least one type. Supply an explicit array rather than an omitted or malformed field. A policy allowing IMEI does not validate an actual IMEI value, uniqueness, ownership or network eligibility. Keep identifier collection and sensitive device information behind the appropriate authenticated operations; the Product projection described here does not expose actual device identifiers. An empty identifierTypes array returns valid false with an empty errors list; an object lacking identifierTypes can throw on the length access. Consumers must use valid as the decision, validate the array shape first and explain the missing-type case themselves."
        },
        {
          "kind": "table",
          "headers": [
            "Configuration",
            "Default",
            "Extension discipline"
          ],
          "rows": [
            [
              "electronicsProduct.identifierTypes",
              "SERIAL, IMEI, MEID, MAC",
              "Add a type only with validation and consumer tests"
            ],
            [
              "electronicsProduct.warrantyUnits",
              "DAY, MONTH, YEAR",
              "Keep record units and display conversion consistent"
            ],
            [
              "requireActiveSpecificationForProjection",
              "true",
              "Inspect projection behavior; the implementation checks ACTIVE directly"
            ],
            [
              "Product search contributor",
              "DefaultElectronicsProductSearchEnrichmentService",
              "Retain required domain contribution when Electronics is selected"
            ]
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Projection and publication flow",
          "anchor": "acceleratorsAgoraElectronicsProductSemantics-5-projection-and-publication-flow"
        },
        {
          "kind": "paragraph",
          "text": "project returns an empty object when the specification profile is absent or not ACTIVE. For an active profile it returns an electronics object containing brandCode, modelNumber, specificationFamilyCode, specifications and compatibilityProfileCodes. Warranty data is added only when the supplied warranty profile is ACTIVE, and is limited to duration, durationUnit and coverage. Inactive warranty data is omitted. This creates a safe domain addition, but the method does not import data, authorize a caller, validate every profile or publish a product by itself. Its caller must retain the owning Product and publication contracts. Search enrichment queries tenant-scoped ACTIVE specification records by input.product.code, chooses profiles[0], and reads the referenced ACTIVE warranty by warrantyProfileCode. It does not run validateSpecification or validateWarranty. If generated reads and model fallback are unavailable, read returns an empty list and enrichment is absent. Diagnose the selected tenant, schema/service composition, status and warranty reference before rerunning normal Product publication. Specification values are passed through as supplied, so keep secrets and actual serial/IMEI data out of specifications as well as out of dedicated identifier fields."
        },
        {
          "kind": "diagram",
          "language": "mermaid",
          "text": "sequenceDiagram\n  participant D as Developer or operator\n  participant I as nImport\n  participant E as Electronics services\n  participant P as Product publication\n  D->>E: Explicit preflight through owning validation helpers\n  D->>I: Governed customer catalogue release\n  P->>E: Read ACTIVE profiles in trusted tenant\n  E-->>P: Project configured specifications and warranty\n  P-->>D: Owning publication evidence"
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Customize and extend safely",
          "anchor": "acceleratorsAgoraElectronicsProductSemantics-6-partner-customization-and-operational-verification"
        },
        {
          "kind": "paragraph",
          "text": "Partners extend their own application modules; they do not edit the framework accelerator as an ordinary customization step. Keep concrete product, pricing, inventory, media and CMS content records in the corresponding customer data packs. Keep this guide and reusable framework explanation in data/docs-v001. Importing a sample catalogue must not install documentation, and importing this documentation must not create a device product or price. Select the optional documentation profile in Axis, import into WCMS Staged, review the imported graph and follow the existing approval and publication flow. Shared Commerce guides are references, not additional copied articles inside the Electronics pack. For an application that accepts only USB-C accessories, keep its compatibilityProfile requiredValues in customer-owned data/<release>/records, and invoke the existing comparison through the composed SERVICE registry. Tighten reusable validation only in a later project src/service/defaultElectronicsProductValidationService.js member, retaining the { valid, errors } and { compatible, mismatches } contracts. Configuration-only identifier vocabulary changes belong in project config/properties.js under electronicsProduct; they do not change Product identity, tenant scope or the ACTIVE projection gate. requireActiveSpecificationForProjection is declared configuration but is not read by project, so changing it cannot enable a draft projection."
        },
        {
          "kind": "code",
          "language": "javascript",
          "text": "const required = { connector: 'USB-C' };\nconst candidate = { connector: ['USB-C', 'USB-A'] };\nconst result = SERVICE.DefaultElectronicsProductValidationService\n  .compatible(required, candidate);\n// result: { compatible: true, mismatches: [] }\nconst denied = SERVICE.DefaultElectronicsProductValidationService\n  .compatible(required, { connector: ['USB-A'] });\n// denied: { compatible: false, mismatches: ['connector'] }\n// Pure comparisons; no product save or safety certification."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Common mistakes",
          "anchor": "acceleratorsAgoraElectronicsProductSemantics-7-common-mistakes"
        },
        {
          "kind": "paragraph",
          "text": "Do not create a second Product schema to carry Electronics specifications. Do not equate an active profile with a published storefront product. Do not expose raw device identifiers in a public product projection. Do not interpret warranty-unit validation as legal approval, or a compatibility match as a physical safety guarantee. Do not add cloud storage paths to documentation image blocks: use a declared Media code and an asset in the selected documentation release. Do not copy shared Pricing or Inventory explanations into another guide when a stable owner-qualified reference already describes them."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Verification",
          "anchor": "acceleratorsAgoraElectronicsProductSemantics-8-verification"
        },
        {
          "kind": "paragraph",
          "text": "Run the owning Electronics contract with positive specification and warranty cases, absent identity, empty specifications, unsupported identifier types, mismatching compatibility requirements and inactive projections. Verify that a two-year PARTS and LABOUR warranty passes the configured YEAR vocabulary. Exercise independent partner configuration rather than relying only on Agora sample data. Then verify the selected runtime graph, customer catalogue import, Product publication/search enrichment and delivered projection separately. For documentation, verify the module-only import includes its shared scaffold, excludes other capability articles and all business packs, retains Media checksums, and exposes only published routes in Online navigation. Record source-test results separately from installed runtime and browser acceptance evidence."
        }
      ],
      "searchText": "Agora Electronics Product Semantics Source-backed Electronics specifications, compatibility, warranty, device identity, safe Product projection and partner adoption over canonical Commerce. # Agora Electronics Product Semantics\n\n## Business result and beginner model\n\nAn Electronics catalogue needs more than a product name and a price. A business buyer needs to compare specifications, check whether an accessory fits a device, understand warranty coverage and know which device identifiers the operation expects. The reusable electronicsProduct accelerator supplies these domain semantics over Commerce Product. For beginners, the important distinction is that a specification profile enriches an existing product; it is not another sellable-product identity, another inventory ledger or a replacement checkout. Agora Electronics demonstrates an application composed from that accelerator and customer-owned catalogue choices.\n\nA developer should begin with an existing Commerce product code and connect the supporting profiles to it. An operator should distinguish source validation from installed import, published projection and customer delivery. Passing a pure service test does not establish that the application has imported its catalogue, published its product or configured a live warranty provider. This guide describes inspected source behavior and an adoption checklist, not a claim that any customer environment is qualified for production.\n\n```mermaid\nflowchart LR\n  Product[Commerce Product identity] --> Spec[Electronics specification profile]\n  Spec --> Projection[Active Electronics projection]\n  Warranty[Active warranty profile] --> Projection\n  Compatibility[Compatibility requirements] --> Validation[Compatibility check]\n  Policy[Device identity policy] --> Validation\n  Projection --> Publication[Commerce publication and search enrichment]\n  Publication --> Storefront[Customer catalogue]\n```\n\n## Ownership and source map\n\n| Concern | Canonical authority | Electronics responsibility |\n| --- | --- | --- |\n| Product identity and lifecycle | Commerce Product | Refer to productCode; add specification semantics |\n| Price, promotions and tax | Owning Commerce capabilities | No duplicate monetary calculation |\n| Inventory and fulfillment | Inventory and Fulfillment | No substitute stock or shipment ledger |\n| Specification and compatibility | electronicsProduct | Validate required identity and requested capabilities |\n| Warranty and identifier vocabulary | electronicsProduct configuration | Validate configured units and supported types |\n| Images and delivery | Media with Product/CMS relationships | Reference Media codes; never create another storage provider |\n\nDefaultElectronicsProductValidationService owns validateSpecification, compatible, validateWarranty and validateIdentityPolicy. DefaultElectronicsProductProjectionService builds the customer-facing additions. DefaultElectronicsProductSearchEnrichmentService contributes domain enrichment to Product publication. Read these owning services before changing policy, and use the related canonical Product, Pricing, Inventory and Media guides for shared behavior instead of copying their detail into an application guide. The customer project owns real devices, offers, product copy, concrete values and presentation choices.\n\n## Specification and compatibility decisions\n\nvalidateSpecification checks truthy productCode and specificationFamilyCode plus a specifications value with at least one enumerable key. The schema separately requires specifications to be an object; the helper alone does not reject every wrong input type. Its error vocabulary distinguishes missing specification identity from missing specifications. That check is deliberately narrower than a complete customer catalogue policy: it does not prove the product exists, the family is appropriate, every value has a correct physical unit or the claimed specification is factually true. A project that needs those checks adds supported policy or validation through its later module layer and tests the extra boundary. Do not describe a successful basic check as certification of a device.\n\ncompatible compares every required key with the candidate value or list of values. A requirement passes when its exact required value is present in the candidate list. The returned mismatches identify requirement keys rather than silently selecting another accessory. An empty requirement set passes this comparison; missing candidate capabilities fail nonempty requirements. This is a capability-membership comparison, not a standards negotiation engine, electrical safety assessment or fuzzy unit converter. Maintain the same vocabulary and units on both sides, and give the business user a comprehensible explanation for each mismatch. Candidate scalar zero, false and an empty string are treated as missing by the current logical-or expression. Validate the caller's comparison vocabulary and shape before using those values; the helper is not a general typed equality implementation.\n\n| Input | Source behavior | Business interpretation |\n| --- | --- | --- |\n| productCode absent | Specification identity error | Profile is not ready to attach to a product |\n| specifications empty | Specifications-required error | Comparison detail is missing |\n| Required value appears in candidate list | That key matches | Declared requirement is represented |\n| Required key missing from candidate | Key appears in mismatches | Do not imply compatibility |\n| No requirements supplied | No mismatches | Not evidence that all real-world constraints were checked |\n\n## Warranty and device identity configuration\n\nThe default warranty units are DAY, MONTH and YEAR. validateWarranty requires a numerically positive duration, a configured durationUnit and at least one coverage item. A two-year warranty with PARTS and LABOUR is explicitly exercised by the independent module contract. The reusable method does not adjudicate a warranty claim, compute legal entitlement, verify the supplier contract or establish an expiry date. Business owners must confirm their offered coverage and applicable rules separately; operators retain the approved source and the configured unit vocabulary. The helper itself does not require an integer or finite duration and only checks coverage.length. Schema validation and an owning operation must reject malformed coverage, nonfinite durations and unsupported policy changes. A new warranty unit needs a corresponding later src/schemas/schemas.js extension as well as configuration because the checked-in schema enum remains DAY, MONTH, YEAR.\n\nThe default device identifier vocabulary is SERIAL, IMEI, MEID and MAC. validateIdentityPolicy checks that the supplied identifierTypes are supported and that the policy contains at least one type. Supply an explicit array rather than an omitted or malformed field. A policy allowing IMEI does not validate an actual IMEI value, uniqueness, ownership or network eligibility. Keep identifier collection and sensitive device information behind the appropriate authenticated operations; the Product projection described here does not expose actual device identifiers. An empty identifierTypes array returns valid false with an empty errors list; an object lacking identifierTypes can throw on the length access. Consumers must use valid as the decision, validate the array shape first and explain the missing-type case themselves.\n\n| Configuration | Default | Extension discipline |\n| --- | --- | --- |\n| electronicsProduct.identifierTypes | SERIAL, IMEI, MEID, MAC | Add a type only with validation and consumer tests |\n| electronicsProduct.warrantyUnits | DAY, MONTH, YEAR | Keep record units and display conversion consistent |\n| requireActiveSpecificationForProjection | true | Inspect projection behavior; the implementation checks ACTIVE directly |\n| Product search contributor | DefaultElectronicsProductSearchEnrichmentService | Retain required domain contribution when Electronics is selected |\n\n## Projection and publication flow\n\nproject returns an empty object when the specification profile is absent or not ACTIVE. For an active profile it returns an electronics object containing brandCode, modelNumber, specificationFamilyCode, specifications and compatibilityProfileCodes. Warranty data is added only when the supplied warranty profile is ACTIVE, and is limited to duration, durationUnit and coverage. Inactive warranty data is omitted. This creates a safe domain addition, but the method does not import data, authorize a caller, validate every profile or publish a product by itself. Its caller must retain the owning Product and publication contracts. Search enrichment queries tenant-scoped ACTIVE specification records by input.product.code, chooses profiles[0], and reads the referenced ACTIVE warranty by warrantyProfileCode. It does not run validateSpecification or validateWarranty. If generated reads and model fallback are unavailable, read returns an empty list and enrichment is absent. Diagnose the selected tenant, schema/service composition, status and warranty reference before rerunning normal Product publication. Specification values are passed through as supplied, so keep secrets and actual serial/IMEI data out of specifications as well as out of dedicated identifier fields.\n\n```mermaid\nsequenceDiagram\n  participant D as Developer or operator\n  participant I as nImport\n  participant E as Electronics services\n  participant P as Product publication\n  D->>E: Explicit preflight through owning validation helpers\n  D->>I: Governed customer catalogue release\n  P->>E: Read ACTIVE profiles in trusted tenant\n  E-->>P: Project configured specifications and warranty\n  P-->>D: Owning publication evidence\n```\n\n## Customize and extend safely\n\nPartners extend their own application modules; they do not edit the framework accelerator as an ordinary customization step. Keep concrete product, pricing, inventory, media and CMS content records in the corresponding customer data packs. Keep this guide and reusable framework explanation in data/docs-v001. Importing a sample catalogue must not install documentation, and importing this documentation must not create a device product or price. Select the optional documentation profile in Axis, import into WCMS Staged, review the imported graph and follow the existing approval and publication flow. Shared Commerce guides are references, not additional copied articles inside the Electronics pack. For an application that accepts only USB-C accessories, keep its compatibilityProfile requiredValues in customer-owned data/<release>/records, and invoke the existing comparison through the composed SERVICE registry. Tighten reusable validation only in a later project src/service/defaultElectronicsProductValidationService.js member, retaining the { valid, errors } and { compatible, mismatches } contracts. Configuration-only identifier vocabulary changes belong in project config/properties.js under electronicsProduct; they do not change Product identity, tenant scope or the ACTIVE projection gate. requireActiveSpecificationForProjection is declared configuration but is not read by project, so changing it cannot enable a draft projection.\n\n```javascript\nconst required = { connector: 'USB-C' };\nconst candidate = { connector: ['USB-C', 'USB-A'] };\nconst result = SERVICE.DefaultElectronicsProductValidationService\n  .compatible(required, candidate);\n// result: { compatible: true, mismatches: [] }\nconst denied = SERVICE.DefaultElectronicsProductValidationService\n  .compatible(required, { connector: ['USB-A'] });\n// denied: { compatible: false, mismatches: ['connector'] }\n// Pure comparisons; no product save or safety certification.\n```\n\n## Common mistakes\n\nDo not create a second Product schema to carry Electronics specifications. Do not equate an active profile with a published storefront product. Do not expose raw device identifiers in a public product projection. Do not interpret warranty-unit validation as legal approval, or a compatibility match as a physical safety guarantee. Do not add cloud storage paths to documentation image blocks: use a declared Media code and an asset in the selected documentation release. Do not copy shared Pricing or Inventory explanations into another guide when a stable owner-qualified reference already describes them.\n\n## Verification\n\nRun the owning Electronics contract with positive specification and warranty cases, absent identity, empty specifications, unsupported identifier types, mismatching compatibility requirements and inactive projections. Verify that a two-year PARTS and LABOUR warranty passes the configured YEAR vocabulary. Exercise independent partner configuration rather than relying only on Agora sample data. Then verify the selected runtime graph, customer catalogue import, Product publication/search enrichment and delivered projection separately. For documentation, verify the module-only import includes its shared scaffold, excludes other capability articles and all business packs, retains Media checksums, and exposes only published routes in Online navigation. Record source-test results separately from installed runtime and browser acceptance evidence.\n",
      "source": {
        "repository": "nodics.ai",
        "owner": "electronicsProduct",
        "functionalModule": "nodics.accelerators",
        "technicalModule": "electronicsProduct",
        "sourcePath": "data/docs-v001/records/documentation/electronicsProductDocumentationComponentData.js",
        "path": "data/docs-v001/records/documentation/electronicsProductDocumentationComponentData.js",
        "checksum": "a75f03a608cc4d36fc01dfb97c645d49e196c07eae2bb84a4243b64ced5755d2",
        "wordCount": 1652
      },
      "slug": "accelerators-agora-electronics-product-semantics",
      "locale": "en",
      "navigationGroup": "Agora Accelerator Family",
      "navigationGroupCode": "agora-accelerator-family",
      "navigationGroupOrder": 10,
      "navigationOrder": 900,
      "references": [
        {
          "documentId": "accelerators.agora-industry-templates",
          "owner": "nodics.docs"
        },
        {
          "documentId": "catalog.product-discovery-management",
          "owner": "product"
        },
        {
          "documentId": "pricing.promotions-tax-management",
          "owner": "pricing"
        },
        {
          "documentId": "inventory.stock-management",
          "owner": "inventory"
        },
        {
          "documentId": "wcms.media-import-publication",
          "owner": "media"
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
