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
  "nodicsDocsComponentlocationTaxonomySchemaBoundary": {
    "code": "nodicsDocsComponentlocationTaxonomySchemaBoundary",
    "typeCode": "nodicsDocumentationArticleComponentType",
    "renderer": "documentation.component.article",
    "accessMode": "PUBLIC",
    "properties": {
      "code": "location.taxonomy-schema-boundary",
      "title": "Location Categories Types and Capabilities",
      "route": "/docs/framework/location-taxonomy-schema-boundary",
      "section": "framework-architecture-and-design",
      "sectionTitle": "Framework Architecture and Design",
      "group": "framework-architecture-and-design",
      "groupTitle": "Framework Architecture and Design",
      "parentId": "framework-architecture-and-design",
      "hierarchyPath": [
        "Framework Architecture and Design",
        "Location Categories Types and Capabilities"
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
        "implementation partner",
        "locationType capability owner"
      ],
      "technicalAudience": [
        "architect",
        "developer",
        "operator",
        "qa engineer",
        "ai tool"
      ],
      "summary": "Location Categories Types and Capabilities: source-backed behavior, ownership, extension, failure handling and acceptance boundaries.",
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
      "implementationState": "schema-defined",
      "renderingComponent": "documentation.component.article",
      "relatedPages": [
        "location.shared-map-configuration",
        "framework.modular-architecture"
      ],
      "sourceEvidence": [
        "src/schemas/schemas.js",
        "src/service/defaultSampleService.js",
        "src/router/routers.js",
        "config/properties.js"
      ],
      "visualRequirements": [
        "diagram",
        "table"
      ],
      "searchKeywords": [
        "locationType",
        "source-backed",
        "ownership",
        "operations"
      ],
      "topicKeywords": [
        "Location Categories Types and Capabilities",
        "Framework Architecture and Design"
      ],
      "headings": [
        {
          "text": "Location Categories Types and Capabilities",
          "anchor": "location-taxonomy-schema-boundary",
          "level": 1
        },
        {
          "text": "Business purpose and current implementation",
          "anchor": "locationTaxonomySchemaBoundary-1-business-purpose-and-current-implementation",
          "level": 2
        },
        {
          "text": "Record contract and owner responsibilities",
          "anchor": "locationTaxonomySchemaBoundary-2-record-contract-and-owner-responsibilities",
          "level": 2
        },
        {
          "text": "Customize and extend safely",
          "anchor": "locationTaxonomySchemaBoundary-3-worked-adoption-and-extension-path",
          "level": 2
        },
        {
          "text": "Verification and failure handling",
          "anchor": "locationTaxonomySchemaBoundary-4-failure-handling-and-verification",
          "level": 2
        },
        {
          "text": "Documentation selection assets and acceptance",
          "anchor": "locationTaxonomySchemaBoundary-5-documentation-selection-assets-and-acceptance",
          "level": 2
        },
        {
          "text": "Common mistakes",
          "anchor": "location-taxonomy-schema-boundary-common-mistakes",
          "level": 2
        }
      ],
      "blocks": [
        {
          "kind": "heading",
          "level": 1,
          "text": "Location Categories Types and Capabilities",
          "anchor": "location-taxonomy-schema-boundary"
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Business purpose and current implementation",
          "anchor": "locationTaxonomySchemaBoundary-1-business-purpose-and-current-implementation"
        },
        {
          "kind": "paragraph",
          "text": "Beginner reading path: start with the business purpose, use the diagram to follow the owning boundaries, then compare the contract table with the worked example. Developers should inspect the listed source before extending behavior. An operator should use the verification section to distinguish a source check from an installed operation. The guide labels schema-only behavior explicitly; a record definition is not a completed business workflow."
        },
        {
          "kind": "paragraph",
          "text": "locationType owns reusable vocabulary for classifying places and the capabilities they offer. It declares locationCategory, locationType and locationCapability schemas with required name objects, statuses and revisions, plus optional descriptions and metadata. The name object can carry localized labels, but the schema defines no locale-key or translation validation. A type requires categoryCode and may supply defaultCapabilityCodes and defaultPresentation; a category may also supply defaultCapabilityCodes. This supports consistent vocabulary across Commerce and Waste without duplicating location identity. The dedicated module has no taxonomy validator, automatic default propagation or lifecycle orchestration beyond generated model operations."
        },
        {
          "kind": "paragraph",
          "text": "The schema is real framework source, not an empty placeholder. Generated service and schemaOperations router metadata may produce operations when a runtime selects the module and permits their exposure. That is different from a completed business workflow. Deployment route categories, independent authorization, runtime persistence and application composition still decide what is available. This guide deliberately documents the implemented record contract and the missing orchestration separately so that a developer or AI tool does not infer a nonexistent workflow from a package name."
        },
        {
          "kind": "diagram",
          "language": "mermaid",
          "text": "flowchart LR\n  Category[Location category] --> Type[Location type]\n  Capability[Capability vocabulary] --> Type\n  Type --> Place[Canonical Location references]\n  Place --> Consumers[Commerce Waste and other consumers]"
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Record contract and owner responsibilities",
          "anchor": "locationTaxonomySchemaBoundary-2-record-contract-and-owner-responsibilities"
        },
        {
          "kind": "paragraph",
          "text": "A categoryCode string does not by itself ensure the referenced category exists or is ACTIVE. A capability code such as an accepted operational service describes vocabulary; it does not grant an employee permission or guarantee that an adapter is installed. The defaultPresentation object is configuration, not executable rendering code. Consumers need explicit allowlists and safe display projection rather than accepting service names, expressions or arbitrary markup from metadata. Status enums constrain values but do not enforce which actors may deprecate a type or how existing locations migrate."
        },
        {
          "kind": "table",
          "headers": [
            "Field or model",
            "Source contract",
            "Required owner behavior"
          ],
          "rows": [
            [
              "category and capability",
              "Stable code and localized name",
              "Vocabulary, not a permission grant"
            ],
            [
              "type.categoryCode",
              "Required category code",
              "Validate referenced category explicitly"
            ],
            [
              "defaultCapabilityCodes",
              "Optional defaults",
              "Defaults do not prove installed services"
            ],
            [
              "defaultPresentation",
              "Optional object",
              "Safe declarative presentation only"
            ],
            [
              "status and revision",
              "DRAFT, ACTIVE, INACTIVE, DEPRECATED, ARCHIVED; revision zero",
              "No automatic lifecycle state machine"
            ]
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Customize and extend safely",
          "anchor": "locationTaxonomySchemaBoundary-3-worked-adoption-and-extension-path"
        },
        {
          "kind": "paragraph",
          "text": "When adding a new kind of service point, first reuse an existing category if its meaning fits. Define the type code and localized name, review default capabilities with their owning operations and prepare governed business data. Validate that all referenced categories and capabilities exist before applying the type to locations. Deprecating a type should preserve the meaning of historical records and prevent inappropriate new assignments through an owning operation. The current module does not implement this migration policy, so a partner must test it explicitly rather than relying on a status update."
        },
        {
          "kind": "paragraph",
          "text": "Illustrative taxonomy records keyed by schema name, not an import file or an automatic registration operation. A project could keep its governed vocabulary in modules/customerLocationExtensions/data/<business-release>/records/location/customerLocationTypeData.js with headers declared in that release. The locale key en is illustrative; all three models require code, name, status and revision. Resolve their relationships explicitly before applying the type."
        },
        {
          "kind": "code",
          "language": "json",
          "text": "{\n  \"locationCategory\": {\n    \"code\": \"service-point\",\n    \"name\": {\n      \"en\": \"Service point\"\n    },\n    \"status\": \"ACTIVE\",\n    \"revision\": 0\n  },\n  \"locationCapability\": {\n    \"code\": \"device-repair\",\n    \"name\": {\n      \"en\": \"Device repair\"\n    },\n    \"status\": \"ACTIVE\",\n    \"revision\": 0\n  },\n  \"locationType\": {\n    \"code\": \"repair-point\",\n    \"categoryCode\": \"service-point\",\n    \"name\": {\n      \"en\": \"Repair point\"\n    },\n    \"defaultCapabilityCodes\": [\n      \"device-repair\"\n    ],\n    \"status\": \"ACTIVE\",\n    \"revision\": 0\n  }\n}"
        },
        {
          "kind": "paragraph",
          "text": "categoryCode and defaultCapabilityCodes have no typed relationship or existence validator here. A future assignment operation must reject a missing/deprecated category, unknown capability or stale vocabulary revision. Changing a default does not rewrite existing Location records. If a new type is wrong, stop new assignments, review existing references and make an explicit governed correction; do not rename historical codes or assume a DEPRECATED enum performs migration."
        },
        {
          "kind": "paragraph",
          "text": "For a later-loaded project module named customerLocationExtensions, use modules/customerLocationExtensions/src/schemas/schemas.js for deliberate additive schema changes and modules/customerLocationExtensions/config/properties.js for the existing schemaPolicies.locationType.operational.accessGroups policy. Register and select that module through the normal module graph. These are existing layering mechanisms, not switches that create a missing workflow. Any new business orchestration belongs in that project's loader-visible src/service files with its own secured route and contracts; it is new implementation requiring qualification. Keep customer records in the project business release and documentation in its docs-v001 pack. Preserve framework field meanings, Profile authority, trusted tenant context and canonical capability ownership."
        },
        {
          "kind": "paragraph",
          "text": "Before exposing a new operation, record its business outcome, complete payload, identity source, permission, expected-revision rule and recovery behavior. Use existing loader-composed services and configuration, including remote-service boundaries when Location is deployed standalone. Do not assume Profile, Process or Search lives in the same process. No request-body field may choose another tenant, provider or arbitrary service. A schema extension should preserve existing field meaning and compatibility; a breaking lifecycle or reference change requires deliberate migration evidence, not an unreviewed import overwrite."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Verification and failure handling",
          "anchor": "locationTaxonomySchemaBoundary-4-failure-handling-and-verification"
        },
        {
          "kind": "paragraph",
          "text": "Build tests at the actual boundary. First inspect generated descriptor and schema validation for required fields, allowed status values and reference shapes. Then test any newly implemented business operation for denied permission, wrong enterprise, stale revision, missing target, malformed nested data and an interrupted acknowledgement. Finally prove installed import, correct exposure and signed-in behavior. There is no dedicated completed orchestration test suite in this module today; sample init success must never be counted as workflow acceptance. Record that implementation gap explicitly in project readiness decisions."
        },
        {
          "kind": "paragraph",
          "text": "If a record appears in storage but the intended journey is unavailable, inspect the effective module graph, generated-service availability, route exposure and owning behavior before changing data. If a proposal or projection is stale, compare original source and current revision; do not mark it CURRENT or APPROVED merely to clear a dashboard. Never retry an uncertain business mutation without inspecting its original evidence through the owner. A source hash, timestamp or schema status is not an authorization token. Keep private review evidence out of public documentation and retain only privacy-safe identifiers in operational diagnostics."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Documentation selection assets and acceptance",
          "anchor": "locationTaxonomySchemaBoundary-5-documentation-selection-assets-and-acceptance"
        },
        {
          "kind": "paragraph",
          "text": "Partner extension guidance: select this capability through the existing module graph and use later project configuration or a loader-visible service extension for an intentional difference. Preserve its canonical identity, independent authorization, bounded inputs and original evidence. Add a focused regression for the changed policy and run the inherited owner tests. Do not fork the framework guide into another module merely to customize branding; reference it from a project guide that explains only the real difference."
        },
        {
          "kind": "paragraph",
          "text": "This guide is canonical CMS data owned by locationType. Its optional CONTENT_PACK lives in data/docs-v001, separate from business DATA_RELEASE sections. A partner importing business records does not need to install this guide. Axis exposes the documentation profile independently and imports its declared CMS closure plus shared scaffold into WCMS Staged. The functional group provides navigation context without owning a duplicate article body. Follow owner-qualified related references for shared behavior; a reference must not silently install another capability pack or create a second implementation."
        },
        {
          "kind": "paragraph",
          "text": "Images belong to the same documentation release as their owning Media records and declared asset files. Preserve stable Media codes, release-relative asset paths and checksums. Shared images may stay with the explicitly included documentation foundation; capability-specific images stay with that capability. Diagrams and tables are canonical content blocks, not separate Markdown authoring copies. A new screenshot must be privacy-safe, accessible and traceable to the depicted version. An image is explanatory evidence only, not proof that a runtime operation succeeded."
        },
        {
          "kind": "paragraph",
          "text": "Canonical authoring begins in DRAFT with an inactive route. After an authorized source editorial review, the owning Component, Node, PageMetadata, SearchMetadata and PublicationState records may move to STAGED and the owning route may be active for subsequent normal publication. STAGED is not approved or published; an active authoring route is only a publication candidate. The release owner must complete release-integrity preparation and validation, governed import, staged inspection and normal owner approvals before publication. Source review does not validate existing checksums, create approval receipts or prove Online delivery or browser acceptance."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Common mistakes",
          "anchor": "location-taxonomy-schema-boundary-common-mistakes"
        },
        {
          "kind": "paragraph",
          "text": "Do not treat generated CRUD as an approval, projection or delivery workflow. Do not infer transitions from status enums, trusted identity from reference objects or automatic synchronization from search metadata. Do not expose a generated route without deployment policy and independent permission. Do not put runtime tenant fields into business records or copy Profile address facts into Location. Complete and test the owning orchestration before claiming operational acceptance."
        }
      ],
      "searchText": "Location Categories Types and Capabilities Location Categories Types and Capabilities: source-backed behavior, ownership, extension, failure handling and acceptance boundaries. # Location Categories Types and Capabilities\n\n## Business purpose and current implementation\n\nBeginner reading path: start with the business purpose, use the diagram to follow the owning boundaries, then compare the contract table with the worked example. Developers should inspect the listed source before extending behavior. An operator should use the verification section to distinguish a source check from an installed operation. The guide labels schema-only behavior explicitly; a record definition is not a completed business workflow.\n\nlocationType owns reusable vocabulary for classifying places and the capabilities they offer. It declares locationCategory, locationType and locationCapability schemas with required name objects, statuses and revisions, plus optional descriptions and metadata. The name object can carry localized labels, but the schema defines no locale-key or translation validation. A type requires categoryCode and may supply defaultCapabilityCodes and defaultPresentation; a category may also supply defaultCapabilityCodes. This supports consistent vocabulary across Commerce and Waste without duplicating location identity. The dedicated module has no taxonomy validator, automatic default propagation or lifecycle orchestration beyond generated model operations.\n\nThe schema is real framework source, not an empty placeholder. Generated service and schemaOperations router metadata may produce operations when a runtime selects the module and permits their exposure. That is different from a completed business workflow. Deployment route categories, independent authorization, runtime persistence and application composition still decide what is available. This guide deliberately documents the implemented record contract and the missing orchestration separately so that a developer or AI tool does not infer a nonexistent workflow from a package name.\n\n```mermaid\nflowchart LR\n  Category[Location category] --> Type[Location type]\n  Capability[Capability vocabulary] --> Type\n  Type --> Place[Canonical Location references]\n  Place --> Consumers[Commerce Waste and other consumers]\n```\n\n## Record contract and owner responsibilities\n\nA categoryCode string does not by itself ensure the referenced category exists or is ACTIVE. A capability code such as an accepted operational service describes vocabulary; it does not grant an employee permission or guarantee that an adapter is installed. The defaultPresentation object is configuration, not executable rendering code. Consumers need explicit allowlists and safe display projection rather than accepting service names, expressions or arbitrary markup from metadata. Status enums constrain values but do not enforce which actors may deprecate a type or how existing locations migrate.\n\n| Field or model | Source contract | Required owner behavior |\n| --- | --- | --- |\n| category and capability | Stable code and localized name | Vocabulary, not a permission grant |\n| type.categoryCode | Required category code | Validate referenced category explicitly |\n| defaultCapabilityCodes | Optional defaults | Defaults do not prove installed services |\n| defaultPresentation | Optional object | Safe declarative presentation only |\n| status and revision | DRAFT, ACTIVE, INACTIVE, DEPRECATED, ARCHIVED; revision zero | No automatic lifecycle state machine |\n\n## Customize and extend safely\n\nWhen adding a new kind of service point, first reuse an existing category if its meaning fits. Define the type code and localized name, review default capabilities with their owning operations and prepare governed business data. Validate that all referenced categories and capabilities exist before applying the type to locations. Deprecating a type should preserve the meaning of historical records and prevent inappropriate new assignments through an owning operation. The current module does not implement this migration policy, so a partner must test it explicitly rather than relying on a status update.\n\nIllustrative taxonomy records keyed by schema name, not an import file or an automatic registration operation. A project could keep its governed vocabulary in modules/customerLocationExtensions/data/<business-release>/records/location/customerLocationTypeData.js with headers declared in that release. The locale key en is illustrative; all three models require code, name, status and revision. Resolve their relationships explicitly before applying the type.\n\n```json\n{\n  \"locationCategory\": {\n    \"code\": \"service-point\",\n    \"name\": {\n      \"en\": \"Service point\"\n    },\n    \"status\": \"ACTIVE\",\n    \"revision\": 0\n  },\n  \"locationCapability\": {\n    \"code\": \"device-repair\",\n    \"name\": {\n      \"en\": \"Device repair\"\n    },\n    \"status\": \"ACTIVE\",\n    \"revision\": 0\n  },\n  \"locationType\": {\n    \"code\": \"repair-point\",\n    \"categoryCode\": \"service-point\",\n    \"name\": {\n      \"en\": \"Repair point\"\n    },\n    \"defaultCapabilityCodes\": [\n      \"device-repair\"\n    ],\n    \"status\": \"ACTIVE\",\n    \"revision\": 0\n  }\n}\n```\n\ncategoryCode and defaultCapabilityCodes have no typed relationship or existence validator here. A future assignment operation must reject a missing/deprecated category, unknown capability or stale vocabulary revision. Changing a default does not rewrite existing Location records. If a new type is wrong, stop new assignments, review existing references and make an explicit governed correction; do not rename historical codes or assume a DEPRECATED enum performs migration.\n\nFor a later-loaded project module named customerLocationExtensions, use modules/customerLocationExtensions/src/schemas/schemas.js for deliberate additive schema changes and modules/customerLocationExtensions/config/properties.js for the existing schemaPolicies.locationType.operational.accessGroups policy. Register and select that module through the normal module graph. These are existing layering mechanisms, not switches that create a missing workflow. Any new business orchestration belongs in that project's loader-visible src/service files with its own secured route and contracts; it is new implementation requiring qualification. Keep customer records in the project business release and documentation in its docs-v001 pack. Preserve framework field meanings, Profile authority, trusted tenant context and canonical capability ownership.\n\nBefore exposing a new operation, record its business outcome, complete payload, identity source, permission, expected-revision rule and recovery behavior. Use existing loader-composed services and configuration, including remote-service boundaries when Location is deployed standalone. Do not assume Profile, Process or Search lives in the same process. No request-body field may choose another tenant, provider or arbitrary service. A schema extension should preserve existing field meaning and compatibility; a breaking lifecycle or reference change requires deliberate migration evidence, not an unreviewed import overwrite.\n\n## Verification and failure handling\n\nBuild tests at the actual boundary. First inspect generated descriptor and schema validation for required fields, allowed status values and reference shapes. Then test any newly implemented business operation for denied permission, wrong enterprise, stale revision, missing target, malformed nested data and an interrupted acknowledgement. Finally prove installed import, correct exposure and signed-in behavior. There is no dedicated completed orchestration test suite in this module today; sample init success must never be counted as workflow acceptance. Record that implementation gap explicitly in project readiness decisions.\n\nIf a record appears in storage but the intended journey is unavailable, inspect the effective module graph, generated-service availability, route exposure and owning behavior before changing data. If a proposal or projection is stale, compare original source and current revision; do not mark it CURRENT or APPROVED merely to clear a dashboard. Never retry an uncertain business mutation without inspecting its original evidence through the owner. A source hash, timestamp or schema status is not an authorization token. Keep private review evidence out of public documentation and retain only privacy-safe identifiers in operational diagnostics.\n\n## Documentation selection assets and acceptance\n\nPartner extension guidance: select this capability through the existing module graph and use later project configuration or a loader-visible service extension for an intentional difference. Preserve its canonical identity, independent authorization, bounded inputs and original evidence. Add a focused regression for the changed policy and run the inherited owner tests. Do not fork the framework guide into another module merely to customize branding; reference it from a project guide that explains only the real difference.\n\nThis guide is canonical CMS data owned by locationType. Its optional CONTENT_PACK lives in data/docs-v001, separate from business DATA_RELEASE sections. A partner importing business records does not need to install this guide. Axis exposes the documentation profile independently and imports its declared CMS closure plus shared scaffold into WCMS Staged. The functional group provides navigation context without owning a duplicate article body. Follow owner-qualified related references for shared behavior; a reference must not silently install another capability pack or create a second implementation.\n\nImages belong to the same documentation release as their owning Media records and declared asset files. Preserve stable Media codes, release-relative asset paths and checksums. Shared images may stay with the explicitly included documentation foundation; capability-specific images stay with that capability. Diagrams and tables are canonical content blocks, not separate Markdown authoring copies. A new screenshot must be privacy-safe, accessible and traceable to the depicted version. An image is explanatory evidence only, not proof that a runtime operation succeeded.\n\nCanonical authoring begins in DRAFT with an inactive route. After an authorized source editorial review, the owning Component, Node, PageMetadata, SearchMetadata and PublicationState records may move to STAGED and the owning route may be active for subsequent normal publication. STAGED is not approved or published; an active authoring route is only a publication candidate. The release owner must complete release-integrity preparation and validation, governed import, staged inspection and normal owner approvals before publication. Source review does not validate existing checksums, create approval receipts or prove Online delivery or browser acceptance.\n\n## Common mistakes\n\nDo not treat generated CRUD as an approval, projection or delivery workflow. Do not infer transitions from status enums, trusted identity from reference objects or automatic synchronization from search metadata. Do not expose a generated route without deployment policy and independent permission. Do not put runtime tenant fields into business records or copy Profile address facts into Location. Complete and test the owning orchestration before claiming operational acceptance.\n",
      "source": {
        "repository": "nodics.ai",
        "owner": "locationType",
        "functionalModule": "nodics.location",
        "technicalModule": "locationType",
        "path": "data/docs-v001/records/documentation/locationTypeDocumentationComponentData.js",
        "sourcePath": "data/docs-v001/records/documentation/locationTypeDocumentationComponentData.js",
        "checksum": "9b755df66d992d2ce0db8cdd2eb141e5eeff172bc6a6d26c94469e410279e395",
        "wordCount": 1455
      },
      "slug": "location-taxonomy-schema-boundary",
      "locale": "en",
      "navigationGroup": "Location Categories",
      "navigationGroupCode": "locationType",
      "navigationGroupOrder": 70,
      "navigationOrder": 2008,
      "references": [
        {
          "documentId": "location.shared-map-configuration",
          "owner": "locationMap"
        },
        {
          "documentId": "framework.modular-architecture",
          "owner": "nodics.docs"
        }
      ],
      "sourceCoverage": [
        {
          "modulePath": ".",
          "implementationState": "SCHEMA_DEFINED",
          "anchors": [
            "locationTaxonomySchemaBoundary-1-business-purpose-and-current-implementation",
            "locationTaxonomySchemaBoundary-2-record-contract-and-owner-responsibilities",
            "locationTaxonomySchemaBoundary-3-worked-adoption-and-extension-path",
            "locationTaxonomySchemaBoundary-4-failure-handling-and-verification",
            "locationTaxonomySchemaBoundary-5-documentation-selection-assets-and-acceptance"
          ],
          "evidence": [
            "src/schemas/schemas.js",
            "src/service/defaultSampleService.js",
            "src/router/routers.js",
            "config/properties.js"
          ]
        }
      ]
    },
    "active": true
  }
};
