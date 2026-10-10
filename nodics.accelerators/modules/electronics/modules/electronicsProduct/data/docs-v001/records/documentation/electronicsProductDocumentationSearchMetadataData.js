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
    "code": "nodicsDocsSearchnodenodicsdocsnodepageacceleratorsagoraelectronicsproductsemantics",
    "product": "nodicsDocumentationProduct",
    "targetType": "NODE",
    "targetCode": "nodicsDocsNodePageacceleratorsAgoraElectronicsProductSemantics",
    "title": "Agora Electronics Product Semantics",
    "summary": "Source-backed Electronics specifications, compatibility, warranty, device identity, safe Product projection and partner adoption over canonical Commerce.",
    "searchText": "Agora Electronics Product Semantics Source-backed Electronics specifications, compatibility, warranty, device identity, safe Product projection and partner adoption over canonical Commerce.",
    "keywords": [
      "electronicsProduct",
      "agora",
      "accelerator",
      "source-backed"
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
    "lifecycleState": "STAGED",
    "indexState": "INDEX_READY",
    "active": true
  },
  "record1": {
    "code": "nodicsDocsSearchpagenodicsdocsmetadataacceleratorsagoraelectronicsproductsemantics",
    "product": "nodicsDocumentationProduct",
    "targetType": "PAGE",
    "targetCode": "nodicsDocsMetadataacceleratorsAgoraElectronicsProductSemantics",
    "title": "Agora Electronics Product Semantics",
    "summary": "Source-backed Electronics specifications, compatibility, warranty, device identity, safe Product projection and partner adoption over canonical Commerce.",
    "searchText": "Agora Electronics Product Semantics Source-backed Electronics specifications, compatibility, warranty, device identity, safe Product projection and partner adoption over canonical Commerce. # Agora Electronics Product Semantics\n\n## Business result and beginner model\n\nAn Electronics catalogue needs more than a product name and a price. A business buyer needs to compare specifications, check whether an accessory fits a device, understand warranty coverage and know which device identifiers the operation expects. The reusable electronicsProduct accelerator supplies these domain semantics over Commerce Product. For beginners, the important distinction is that a specification profile enriches an existing product; it is not another sellable-product identity, another inventory ledger or a replacement checkout. Agora Electronics demonstrates an application composed from that accelerator and customer-owned catalogue choices.\n\nA developer should begin with an existing Commerce product code and connect the supporting profiles to it. An operator should distinguish source validation from installed import, published projection and customer delivery. Passing a pure service test does not establish that the application has imported its catalogue, published its product or configured a live warranty provider. This guide describes inspected source behavior and an adoption checklist, not a claim that any customer environment is qualified for production.\n\n```mermaid\nflowchart LR\n  Product[Commerce Product identity] --> Spec[Electronics specification profile]\n  Spec --> Projection[Active Electronics projection]\n  Warranty[Active warranty profile] --> Projection\n  Compatibility[Compatibility requirements] --> Validation[Compatibility check]\n  Policy[Device identity policy] --> Validation\n  Projection --> Publication[Commerce publication and search enrichment]\n  Publication --> Storefront[Customer catalogue]\n```\n\n## Ownership and source map\n\n| Concern | Canonical authority | Electronics responsibility |\n| --- | --- | --- |\n| Product identity and lifecycle | Commerce Product | Refer to productCode; add specification semantics |\n| Price, promotions and tax | Owning Commerce capabilities | No duplicate monetary calculation |\n| Inventory and fulfillment | Inventory and Fulfillment | No substitute stock or shipment ledger |\n| Specification and compatibility | electronicsProduct | Validate required identity and requested capabilities |\n| Warranty and identifier vocabulary | electronicsProduct configuration | Validate configured units and supported types |\n| Images and delivery | Media with Product/CMS relationships | Reference Media codes; never create another storage provider |\n\nDefaultElectronicsProductValidationService owns validateSpecification, compatible, validateWarranty and validateIdentityPolicy. DefaultElectronicsProductProjectionService builds the customer-facing additions. DefaultElectronicsProductSearchEnrichmentService contributes domain enrichment to Product publication. Read these owning services before changing policy, and use the related canonical Product, Pricing, Inventory and Media guides for shared behavior instead of copying their detail into an application guide. The customer project owns real devices, offers, product copy, concrete values and presentation choices.\n\n## Specification and compatibility decisions\n\nvalidateSpecification checks truthy productCode and specificationFamilyCode plus a specifications value with at least one enumerable key. The schema separately requires specifications to be an object; the helper alone does not reject every wrong input type. Its error vocabulary distinguishes missing specification identity from missing specifications. That check is deliberately narrower than a complete customer catalogue policy: it does not prove the product exists, the family is appropriate, every value has a correct physical unit or the claimed specification is factually true. A project that needs those checks adds supported policy or validation through its later module layer and tests the extra boundary. Do not describe a successful basic check as certification of a device.\n\ncompatible compares every required key with the candidate value or list of values. A requirement passes when its exact required value is present in the candidate list. The returned mismatches identify requirement keys rather than silently selecting another accessory. An empty requirement set passes this comparison; missing candidate capabilities fail nonempty requirements. This is a capability-membership comparison, not a standards negotiation engine, electrical safety assessment or fuzzy unit converter. Maintain the same vocabulary and units on both sides, and give the business user a comprehensible explanation for each mismatch. Candidate scalar zero, false and an empty string are treated as missing by the current logical-or expression. Validate the caller's comparison vocabulary and shape before using those values; the helper is not a general typed equality implementation.\n\n| Input | Source behavior | Business interpretation |\n| --- | --- | --- |\n| productCode absent | Specification identity error | Profile is not ready to attach to a product |\n| specifications empty | Specifications-required error | Comparison detail is missing |\n| Required value appears in candidate list | That key matches | Declared requirement is represented |\n| Required key missing from candidate | Key appears in mismatches | Do not imply compatibility |\n| No requirements supplied | No mismatches | Not evidence that all real-world constraints were checked |\n\n## Warranty and device identity configuration\n\nThe default warranty units are DAY, MONTH and YEAR. validateWarranty requires a numerically positive duration, a configured durationUnit and at least one coverage item. A two-year warranty with PARTS and LABOUR is explicitly exercised by the independent module contract. The reusable method does not adjudicate a warranty claim, compute legal entitlement, verify the supplier contract or establish an expiry date. Business owners must confirm their offered coverage and applicable rules separately; operators retain the approved source and the configured unit vocabulary. The helper itself does not require an integer or finite duration and only checks coverage.length. Schema validation and an owning operation must reject malformed coverage, nonfinite durations and unsupported policy changes. A new warranty unit needs a corresponding later src/schemas/schemas.js extension as well as configuration because the checked-in schema enum remains DAY, MONTH, YEAR.\n\nThe default device identifier vocabulary is SERIAL, IMEI, MEID and MAC. validateIdentityPolicy checks that the supplied identifierTypes are supported and that the policy contains at least one type. Supply an explicit array rather than an omitted or malformed field. A policy allowing IMEI does not validate an actual IMEI value, uniqueness, ownership or network eligibility. Keep identifier collection and sensitive device information behind the appropriate authenticated operations; the Product projection described here does not expose actual device identifiers. An empty identifierTypes array returns valid false with an empty errors list; an object lacking identifierTypes can throw on the length access. Consumers must use valid as the decision, validate the array shape first and explain the missing-type case themselves.\n\n| Configuration | Default | Extension discipline |\n| --- | --- | --- |\n| electronicsProduct.identifierTypes | SERIAL, IMEI, MEID, MAC | Add a type only with validation and consumer tests |\n| electronicsProduct.warrantyUnits | DAY, MONTH, YEAR | Keep record units and display conversion consistent |\n| requireActiveSpecificationForProjection | true | Inspect projection behavior; the implementation checks ACTIVE directly |\n| Product search contributor | DefaultElectronicsProductSearchEnrichmentService | Retain required domain contribution when Electronics is selected |\n\n## Projection and publication flow\n\nproject returns an empty object when the specification profile is absent or not ACTIVE. For an active profile it returns an electronics object containing brandCode, modelNumber, specificationFamilyCode, specifications and compatibilityProfileCodes. Warranty data is added only when the supplied warranty profile is ACTIVE, and is limited to duration, durationUnit and coverage. Inactive warranty data is omitted. This creates a safe domain addition, but the method does not import data, authorize a caller, validate every profile or publish a product by itself. Its caller must retain the owning Product and publication contracts. Search enrichment queries tenant-scoped ACTIVE specification records by input.product.code, chooses profiles[0], and reads the referenced ACTIVE warranty by warrantyProfileCode. It does not run validateSpecification or validateWarranty. If generated reads and model fallback are unavailable, read returns an empty list and enrichment is absent. Diagnose the selected tenant, schema/service composition, status and warranty reference before rerunning normal Product publication. Specification values are passed through as supplied, so keep secrets and actual serial/IMEI data out of specifications as well as out of dedicated identifier fields.\n\n```mermaid\nsequenceDiagram\n  participant D as Developer or operator\n  participant I as nImport\n  participant E as Electronics services\n  participant P as Product publication\n  D->>E: Explicit preflight through owning validation helpers\n  D->>I: Governed customer catalogue release\n  P->>E: Read ACTIVE profiles in trusted tenant\n  E-->>P: Project configured specifications and warranty\n  P-->>D: Owning publication evidence\n```\n\n## Customize and extend safely\n\nPartners extend their own application modules; they do not edit the framework accelerator as an ordinary customization step. Keep concrete product, pricing, inventory, media and CMS content records in the corresponding customer data packs. Keep this guide and reusable framework explanation in data/docs-v001. Importing a sample catalogue must not install documentation, and importing this documentation must not create a device product or price. Select the optional documentation profile in Axis, import into WCMS Staged, review the imported graph and follow the existing approval and publication flow. Shared Commerce guides are references, not additional copied articles inside the Electronics pack. For an application that accepts only USB-C accessories, keep its compatibilityProfile requiredValues in customer-owned data/<release>/records, and invoke the existing comparison through the composed SERVICE registry. Tighten reusable validation only in a later project src/service/defaultElectronicsProductValidationService.js member, retaining the { valid, errors } and { compatible, mismatches } contracts. Configuration-only identifier vocabulary changes belong in project config/properties.js under electronicsProduct; they do not change Product identity, tenant scope or the ACTIVE projection gate. requireActiveSpecificationForProjection is declared configuration but is not read by project, so changing it cannot enable a draft projection.\n\n```javascript\nconst required = { connector: 'USB-C' };\nconst candidate = { connector: ['USB-C', 'USB-A'] };\nconst result = SERVICE.DefaultElectronicsProductValidationService\n  .compatible(required, candidate);\n// result: { compatible: true, mismatches: [] }\nconst denied = SERVICE.DefaultElectronicsProductValidationService\n  .compatible(required, { connector: ['USB-A'] });\n// denied: { compatible: false, mismatches: ['connector'] }\n// Pure comparisons; no product save or safety certification.\n```\n\n## Common mistakes\n\nDo not create a second Product schema to carry Electronics specifications. Do not equate an active profile with a published storefront product. Do not expose raw device identifiers in a public product projection. Do not interpret warranty-unit validation as legal approval, or a compatibility match as a physical safety guarantee. Do not add cloud storage paths to documentation image blocks: use a declared Media code and an asset in the selected documentation release. Do not copy shared Pricing or Inventory explanations into another guide when a stable owner-qualified reference already describes them.\n\n## Verification\n\nRun the owning Electronics contract with positive specification and warranty cases, absent identity, empty specifications, unsupported identifier types, mismatching compatibility requirements and inactive projections. Verify that a two-year PARTS and LABOUR warranty passes the configured YEAR vocabulary. Exercise independent partner configuration rather than relying only on Agora sample data. Then verify the selected runtime graph, customer catalogue import, Product publication/search enrichment and delivered projection separately. For documentation, verify the module-only import includes its shared scaffold, excludes other capability articles and all business packs, retains Media checksums, and exposes only published routes in Online navigation. Record source-test results separately from installed runtime and browser acceptance evidence.\n",
    "keywords": [
      "electronicsProduct",
      "agora",
      "accelerator",
      "source-backed"
    ],
    "facets": {
      "section": "accelerators-and-industry-solution-templates",
      "group": "accelerators-and-industry-solution-templates",
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
    "lifecycleState": "STAGED",
    "indexState": "INDEX_READY",
    "active": true
  }
};
