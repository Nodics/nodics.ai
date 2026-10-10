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
  "nodicsDocsComponentlocationSearchProjectionBoundary": {
    "code": "nodicsDocsComponentlocationSearchProjectionBoundary",
    "typeCode": "nodicsDocumentationArticleComponentType",
    "renderer": "documentation.component.article",
    "accessMode": "PUBLIC",
    "properties": {
      "code": "location.search-projection-boundary",
      "title": "Location Search Projection Boundary",
      "route": "/docs/framework/location-search-projection-boundary",
      "section": "framework-architecture-and-design",
      "sectionTitle": "Framework Architecture and Design",
      "group": "framework-architecture-and-design",
      "groupTitle": "Framework Architecture and Design",
      "parentId": "framework-architecture-and-design",
      "hierarchyPath": [
        "Framework Architecture and Design",
        "Location Search Projection Boundary"
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
        "locationSearch capability owner"
      ],
      "technicalAudience": [
        "architect",
        "developer",
        "operator",
        "qa engineer",
        "ai tool"
      ],
      "summary": "Location Search Projection Boundary: source-backed behavior, ownership, extension, failure handling and acceptance boundaries.",
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
        "config/properties.js",
        "src/search/indexes.js",
        "src/event/listeners.js",
        "src/pipelines/pipelines.js"
      ],
      "visualRequirements": [
        "diagram",
        "table"
      ],
      "searchKeywords": [
        "locationSearch",
        "source-backed",
        "ownership",
        "operations"
      ],
      "topicKeywords": [
        "Location Search Projection Boundary",
        "Framework Architecture and Design"
      ],
      "headings": [
        {
          "text": "Location Search Projection Boundary",
          "anchor": "location-search-projection-boundary",
          "level": 1
        },
        {
          "text": "Business purpose and current implementation",
          "anchor": "locationSearchProjectionBoundary-1-business-purpose-and-current-implementation",
          "level": 2
        },
        {
          "text": "Record contract and owner responsibilities",
          "anchor": "locationSearchProjectionBoundary-2-record-contract-and-owner-responsibilities",
          "level": 2
        },
        {
          "text": "Customize and extend safely",
          "anchor": "locationSearchProjectionBoundary-3-worked-adoption-and-extension-path",
          "level": 2
        },
        {
          "text": "Verification and failure handling",
          "anchor": "locationSearchProjectionBoundary-4-failure-handling-and-verification",
          "level": 2
        },
        {
          "text": "Documentation selection assets and acceptance",
          "anchor": "locationSearchProjectionBoundary-5-documentation-selection-assets-and-acceptance",
          "level": 2
        },
        {
          "text": "Common mistakes",
          "anchor": "location-search-projection-boundary-common-mistakes",
          "level": 2
        }
      ],
      "blocks": [
        {
          "kind": "heading",
          "level": 1,
          "text": "Location Search Projection Boundary",
          "anchor": "location-search-projection-boundary"
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Business purpose and current implementation",
          "anchor": "locationSearchProjectionBoundary-1-business-purpose-and-current-implementation"
        },
        {
          "kind": "paragraph",
          "text": "Beginner reading path: start with the business purpose, use the diagram to follow the owning boundaries, then compare the contract table with the worked example. Developers should inspect the listed source before extending behavior. An operator should use the verification section to distinguish a source check from an installed operation. The guide labels schema-only behavior explicitly; a record definition is not a completed business workflow."
        },
        {
          "kind": "paragraph",
          "text": "locationSearch declares the derived search representation for a physical place. It keeps localized name, category/type, named coordinates, an address reference, capabilities, visibility and source provenance together for a search consumer. Its operational schema enables generated model services and search with code identity. The source currently has no dedicated query adapter or index synchronization workflow: the sample service contains lifecycle hooks and the dedicated router registry is empty. Search schema metadata must not be advertised as a complete public location-search API."
        },
        {
          "kind": "paragraph",
          "text": "The schema is real framework source, not an empty placeholder. Generated service and schemaOperations router metadata may produce operations when a runtime selects the module and permits their exposure. That is different from a completed business workflow. Deployment route categories, independent authorization, runtime persistence and application composition still decide what is available. This guide deliberately documents the implemented record contract and the missing orchestration separately so that a developer or AI tool does not infer a nonexistent workflow from a package name."
        },
        {
          "kind": "diagram",
          "language": "mermaid",
          "text": "flowchart LR\n  Location[Canonical place and taxonomy] -. Synchronization owner required .-> Projection[Search projection]\n  Projection -. Bounded authorized query required .-> Results[Safe consumer results]\n  Profile[Address and enterprise authority] --> Projection"
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Record contract and owner responsibilities",
          "anchor": "locationSearchProjectionBoundary-2-record-contract-and-owner-responsibilities"
        },
        {
          "kind": "paragraph",
          "text": "addressRef, enterpriseRef and operatorEnterpriseRef are mapped to Profile targets through refSchema; locationCode, categoryCode and typeCode remain plain strings. That structural mapping is not proof of target existence, verified address facts or caller visibility. latitude and longitude are required numbers without geographic range constraints in this schema. visibility and sourceRef are required unstructured objects. sourceHash and projectedAt are required caller-supplied provenance, and this schema declares no explicit revision field. Runtime isolation must come from trusted context and storage placement; enterprise association expresses business ownership or operation and cannot replace it."
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
              "locationCode, categoryCode and typeCode",
              "Required strings",
              "Resolve canonical place and taxonomy"
            ],
            [
              "name and addressRef",
              "Required objects",
              "Profile owns reusable address facts"
            ],
            [
              "capabilityCodes",
              "Optional array",
              "Validate supported capability vocabulary"
            ],
            [
              "enterpriseRef and operatorEnterpriseRef",
              "Optional Profile references",
              "Business association, not runtime isolation"
            ],
            [
              "status and sourceHash",
              "Projection lifecycle and provenance",
              "No automatic query or refresh authority"
            ]
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Customize and extend safely",
          "anchor": "locationSearchProjectionBoundary-3-worked-adoption-and-extension-path"
        },
        {
          "kind": "paragraph",
          "text": "A partner wants customers to find nearby collection sites by supported material capability. A qualified implementation must query the correct runtime isolation context, filter current visible records, validate coordinates and supported filters, bound result sizes and project only allowed fields. It must also handle a withdrawn source before customers see obsolete results. A fixture with matching category and coordinates proves none of those behaviors. Use Location Core and the configured Search/Discovery seam rather than adding an unrelated direct Elasticsearch client or copying postal facts into search records."
        },
        {
          "kind": "paragraph",
          "text": "Illustrative search-projection fixture, not a nearby-search request. It includes every required field. Profile must own the referenced address; the example supplies a reference rather than postal text. Neither the example sourceHash nor a CURRENT status establishes a published or synchronized search result."
        },
        {
          "kind": "code",
          "language": "json",
          "text": "{\n  \"code\": \"search-site-a\",\n  \"locationCode\": \"site-a\",\n  \"name\": {\n    \"en\": \"Example collection site\"\n  },\n  \"categoryCode\": \"collection\",\n  \"typeCode\": \"collection-point\",\n  \"latitude\": 25.2048,\n  \"longitude\": 55.2708,\n  \"addressRef\": {\n    \"moduleName\": \"profile\",\n    \"schemaName\": \"address\",\n    \"code\": \"site-a-address\"\n  },\n  \"visibility\": {\n    \"audiences\": [\n      \"PUBLIC\"\n    ]\n  },\n  \"sourceRef\": {\n    \"code\": \"site-a\"\n  },\n  \"sourceHash\": \"example-only-not-a-calculated-digest\",\n  \"projectedAt\": \"2026-10-07T00:00:00.000Z\",\n  \"status\": \"CURRENT\"\n}"
        },
        {
          "kind": "paragraph",
          "text": "A future nearby-query operation must reject invalid coordinates, unsupported filters, excessive radius/result limits and unauthorized isolation or visibility changes. There is no radius, distance sort, geospatial mapping or query endpoint implemented in this dedicated module. If results are stale, inspect source withdrawal and indexing evidence before rebuilding through the configured Search owner. Do not relabel a stale row CURRENT or add a direct search client to make it appear fresh."
        },
        {
          "kind": "paragraph",
          "text": "For a later-loaded project module named customerLocationExtensions, use modules/customerLocationExtensions/src/schemas/schemas.js for deliberate additive schema changes and modules/customerLocationExtensions/config/properties.js for the existing schemaPolicies.locationSearch.operational.accessGroups policy. Register and select that module through the normal module graph. These are existing layering mechanisms, not switches that create a missing workflow. Any new business orchestration belongs in that project's loader-visible src/service files with its own secured route and contracts; it is new implementation requiring qualification. Keep customer records in the project business release and documentation in its docs-v001 pack. Preserve framework field meanings, Profile authority, trusted tenant context and canonical capability ownership."
        },
        {
          "kind": "paragraph",
          "text": "Before exposing a new operation, record its business outcome, complete payload, identity source, permission, expected-revision rule and recovery behavior. Use existing loader-composed services and configuration, including remote-service boundaries when Location is deployed standalone. Do not assume Profile, Process or Search lives in the same process. No request-body field may choose another tenant, provider or arbitrary service. A schema extension should preserve existing field meaning and compatibility; a breaking lifecycle or reference change requires deliberate migration evidence, not an unreviewed import overwrite."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Verification and failure handling",
          "anchor": "locationSearchProjectionBoundary-4-failure-handling-and-verification"
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
          "anchor": "locationSearchProjectionBoundary-5-documentation-selection-assets-and-acceptance"
        },
        {
          "kind": "paragraph",
          "text": "Partner extension guidance: select this capability through the existing module graph and use later project configuration or a loader-visible service extension for an intentional difference. Preserve its canonical identity, independent authorization, bounded inputs and original evidence. Add a focused regression for the changed policy and run the inherited owner tests. Do not fork the framework guide into another module merely to customize branding; reference it from a project guide that explains only the real difference."
        },
        {
          "kind": "paragraph",
          "text": "This guide is canonical CMS data owned by locationSearch. Its optional CONTENT_PACK lives in data/docs-v001, separate from business DATA_RELEASE sections. A partner importing business records does not need to install this guide. Axis exposes the documentation profile independently and imports its declared CMS closure plus shared scaffold into WCMS Staged. The functional group provides navigation context without owning a duplicate article body. Follow owner-qualified related references for shared behavior; a reference must not silently install another capability pack or create a second implementation."
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
          "anchor": "location-search-projection-boundary-common-mistakes"
        },
        {
          "kind": "paragraph",
          "text": "Do not treat generated CRUD as an approval, projection or delivery workflow. Do not infer transitions from status enums, trusted identity from reference objects or automatic synchronization from search metadata. Do not expose a generated route without deployment policy and independent permission. Do not put runtime tenant fields into business records or copy Profile address facts into Location. Complete and test the owning orchestration before claiming operational acceptance."
        }
      ],
      "searchText": "Location Search Projection Boundary Location Search Projection Boundary: source-backed behavior, ownership, extension, failure handling and acceptance boundaries. # Location Search Projection Boundary\n\n## Business purpose and current implementation\n\nBeginner reading path: start with the business purpose, use the diagram to follow the owning boundaries, then compare the contract table with the worked example. Developers should inspect the listed source before extending behavior. An operator should use the verification section to distinguish a source check from an installed operation. The guide labels schema-only behavior explicitly; a record definition is not a completed business workflow.\n\nlocationSearch declares the derived search representation for a physical place. It keeps localized name, category/type, named coordinates, an address reference, capabilities, visibility and source provenance together for a search consumer. Its operational schema enables generated model services and search with code identity. The source currently has no dedicated query adapter or index synchronization workflow: the sample service contains lifecycle hooks and the dedicated router registry is empty. Search schema metadata must not be advertised as a complete public location-search API.\n\nThe schema is real framework source, not an empty placeholder. Generated service and schemaOperations router metadata may produce operations when a runtime selects the module and permits their exposure. That is different from a completed business workflow. Deployment route categories, independent authorization, runtime persistence and application composition still decide what is available. This guide deliberately documents the implemented record contract and the missing orchestration separately so that a developer or AI tool does not infer a nonexistent workflow from a package name.\n\n```mermaid\nflowchart LR\n  Location[Canonical place and taxonomy] -. Synchronization owner required .-> Projection[Search projection]\n  Projection -. Bounded authorized query required .-> Results[Safe consumer results]\n  Profile[Address and enterprise authority] --> Projection\n```\n\n## Record contract and owner responsibilities\n\naddressRef, enterpriseRef and operatorEnterpriseRef are mapped to Profile targets through refSchema; locationCode, categoryCode and typeCode remain plain strings. That structural mapping is not proof of target existence, verified address facts or caller visibility. latitude and longitude are required numbers without geographic range constraints in this schema. visibility and sourceRef are required unstructured objects. sourceHash and projectedAt are required caller-supplied provenance, and this schema declares no explicit revision field. Runtime isolation must come from trusted context and storage placement; enterprise association expresses business ownership or operation and cannot replace it.\n\n| Field or model | Source contract | Required owner behavior |\n| --- | --- | --- |\n| locationCode, categoryCode and typeCode | Required strings | Resolve canonical place and taxonomy |\n| name and addressRef | Required objects | Profile owns reusable address facts |\n| capabilityCodes | Optional array | Validate supported capability vocabulary |\n| enterpriseRef and operatorEnterpriseRef | Optional Profile references | Business association, not runtime isolation |\n| status and sourceHash | Projection lifecycle and provenance | No automatic query or refresh authority |\n\n## Customize and extend safely\n\nA partner wants customers to find nearby collection sites by supported material capability. A qualified implementation must query the correct runtime isolation context, filter current visible records, validate coordinates and supported filters, bound result sizes and project only allowed fields. It must also handle a withdrawn source before customers see obsolete results. A fixture with matching category and coordinates proves none of those behaviors. Use Location Core and the configured Search/Discovery seam rather than adding an unrelated direct Elasticsearch client or copying postal facts into search records.\n\nIllustrative search-projection fixture, not a nearby-search request. It includes every required field. Profile must own the referenced address; the example supplies a reference rather than postal text. Neither the example sourceHash nor a CURRENT status establishes a published or synchronized search result.\n\n```json\n{\n  \"code\": \"search-site-a\",\n  \"locationCode\": \"site-a\",\n  \"name\": {\n    \"en\": \"Example collection site\"\n  },\n  \"categoryCode\": \"collection\",\n  \"typeCode\": \"collection-point\",\n  \"latitude\": 25.2048,\n  \"longitude\": 55.2708,\n  \"addressRef\": {\n    \"moduleName\": \"profile\",\n    \"schemaName\": \"address\",\n    \"code\": \"site-a-address\"\n  },\n  \"visibility\": {\n    \"audiences\": [\n      \"PUBLIC\"\n    ]\n  },\n  \"sourceRef\": {\n    \"code\": \"site-a\"\n  },\n  \"sourceHash\": \"example-only-not-a-calculated-digest\",\n  \"projectedAt\": \"2026-10-07T00:00:00.000Z\",\n  \"status\": \"CURRENT\"\n}\n```\n\nA future nearby-query operation must reject invalid coordinates, unsupported filters, excessive radius/result limits and unauthorized isolation or visibility changes. There is no radius, distance sort, geospatial mapping or query endpoint implemented in this dedicated module. If results are stale, inspect source withdrawal and indexing evidence before rebuilding through the configured Search owner. Do not relabel a stale row CURRENT or add a direct search client to make it appear fresh.\n\nFor a later-loaded project module named customerLocationExtensions, use modules/customerLocationExtensions/src/schemas/schemas.js for deliberate additive schema changes and modules/customerLocationExtensions/config/properties.js for the existing schemaPolicies.locationSearch.operational.accessGroups policy. Register and select that module through the normal module graph. These are existing layering mechanisms, not switches that create a missing workflow. Any new business orchestration belongs in that project's loader-visible src/service files with its own secured route and contracts; it is new implementation requiring qualification. Keep customer records in the project business release and documentation in its docs-v001 pack. Preserve framework field meanings, Profile authority, trusted tenant context and canonical capability ownership.\n\nBefore exposing a new operation, record its business outcome, complete payload, identity source, permission, expected-revision rule and recovery behavior. Use existing loader-composed services and configuration, including remote-service boundaries when Location is deployed standalone. Do not assume Profile, Process or Search lives in the same process. No request-body field may choose another tenant, provider or arbitrary service. A schema extension should preserve existing field meaning and compatibility; a breaking lifecycle or reference change requires deliberate migration evidence, not an unreviewed import overwrite.\n\n## Verification and failure handling\n\nBuild tests at the actual boundary. First inspect generated descriptor and schema validation for required fields, allowed status values and reference shapes. Then test any newly implemented business operation for denied permission, wrong enterprise, stale revision, missing target, malformed nested data and an interrupted acknowledgement. Finally prove installed import, correct exposure and signed-in behavior. There is no dedicated completed orchestration test suite in this module today; sample init success must never be counted as workflow acceptance. Record that implementation gap explicitly in project readiness decisions.\n\nIf a record appears in storage but the intended journey is unavailable, inspect the effective module graph, generated-service availability, route exposure and owning behavior before changing data. If a proposal or projection is stale, compare original source and current revision; do not mark it CURRENT or APPROVED merely to clear a dashboard. Never retry an uncertain business mutation without inspecting its original evidence through the owner. A source hash, timestamp or schema status is not an authorization token. Keep private review evidence out of public documentation and retain only privacy-safe identifiers in operational diagnostics.\n\n## Documentation selection assets and acceptance\n\nPartner extension guidance: select this capability through the existing module graph and use later project configuration or a loader-visible service extension for an intentional difference. Preserve its canonical identity, independent authorization, bounded inputs and original evidence. Add a focused regression for the changed policy and run the inherited owner tests. Do not fork the framework guide into another module merely to customize branding; reference it from a project guide that explains only the real difference.\n\nThis guide is canonical CMS data owned by locationSearch. Its optional CONTENT_PACK lives in data/docs-v001, separate from business DATA_RELEASE sections. A partner importing business records does not need to install this guide. Axis exposes the documentation profile independently and imports its declared CMS closure plus shared scaffold into WCMS Staged. The functional group provides navigation context without owning a duplicate article body. Follow owner-qualified related references for shared behavior; a reference must not silently install another capability pack or create a second implementation.\n\nImages belong to the same documentation release as their owning Media records and declared asset files. Preserve stable Media codes, release-relative asset paths and checksums. Shared images may stay with the explicitly included documentation foundation; capability-specific images stay with that capability. Diagrams and tables are canonical content blocks, not separate Markdown authoring copies. A new screenshot must be privacy-safe, accessible and traceable to the depicted version. An image is explanatory evidence only, not proof that a runtime operation succeeded.\n\nCanonical authoring begins in DRAFT with an inactive route. After an authorized source editorial review, the owning Component, Node, PageMetadata, SearchMetadata and PublicationState records may move to STAGED and the owning route may be active for subsequent normal publication. STAGED is not approved or published; an active authoring route is only a publication candidate. The release owner must complete release-integrity preparation and validation, governed import, staged inspection and normal owner approvals before publication. Source review does not validate existing checksums, create approval receipts or prove Online delivery or browser acceptance.\n\n## Common mistakes\n\nDo not treat generated CRUD as an approval, projection or delivery workflow. Do not infer transitions from status enums, trusted identity from reference objects or automatic synchronization from search metadata. Do not expose a generated route without deployment policy and independent permission. Do not put runtime tenant fields into business records or copy Profile address facts into Location. Complete and test the owning orchestration before claiming operational acceptance.\n",
      "source": {
        "repository": "nodics.ai",
        "owner": "locationSearch",
        "functionalModule": "nodics.location",
        "technicalModule": "locationSearch",
        "path": "data/docs-v001/records/documentation/locationSearchDocumentationComponentData.js",
        "sourcePath": "data/docs-v001/records/documentation/locationSearchDocumentationComponentData.js",
        "checksum": "a8ea76a3b13a80c20bcb8ca354c986dc4f30de0472c769f532d66a01cdd54517",
        "wordCount": 1433
      },
      "slug": "location-search-projection-boundary",
      "locale": "en",
      "navigationGroup": "Location Search",
      "navigationGroupCode": "locationSearch",
      "navigationGroupOrder": 70,
      "navigationOrder": 2007,
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
            "locationSearchProjectionBoundary-1-business-purpose-and-current-implementation",
            "locationSearchProjectionBoundary-2-record-contract-and-owner-responsibilities",
            "locationSearchProjectionBoundary-3-worked-adoption-and-extension-path",
            "locationSearchProjectionBoundary-4-failure-handling-and-verification",
            "locationSearchProjectionBoundary-5-documentation-selection-assets-and-acceptance"
          ],
          "evidence": [
            "src/schemas/schemas.js",
            "src/service/defaultSampleService.js",
            "src/router/routers.js",
            "config/properties.js",
            "src/search/indexes.js",
            "src/event/listeners.js",
            "src/pipelines/pipelines.js"
          ]
        }
      ]
    },
    "active": true
  }
};
