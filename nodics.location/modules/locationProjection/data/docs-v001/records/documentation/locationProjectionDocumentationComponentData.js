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
  "nodicsDocsComponentlocationMarkerProjectionBoundary": {
    "code": "nodicsDocsComponentlocationMarkerProjectionBoundary",
    "typeCode": "nodicsDocumentationArticleComponentType",
    "renderer": "documentation.component.article",
    "accessMode": "PUBLIC",
    "properties": {
      "code": "location.marker-projection-boundary",
      "title": "Location Marker Projection Boundary",
      "route": "/docs/framework/location-marker-projection-boundary",
      "section": "framework-architecture-and-design",
      "sectionTitle": "Framework Architecture and Design",
      "group": "framework-architecture-and-design",
      "groupTitle": "Framework Architecture and Design",
      "parentId": "framework-architecture-and-design",
      "hierarchyPath": [
        "Framework Architecture and Design",
        "Location Marker Projection Boundary"
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
        "locationProjection capability owner"
      ],
      "technicalAudience": [
        "architect",
        "developer",
        "operator",
        "qa engineer",
        "ai tool"
      ],
      "summary": "Location Marker Projection Boundary: source-backed behavior, ownership, extension, failure handling and acceptance boundaries.",
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
        "locationProjection",
        "source-backed",
        "ownership",
        "operations"
      ],
      "topicKeywords": [
        "Location Marker Projection Boundary",
        "Framework Architecture and Design"
      ],
      "headings": [
        {
          "text": "Location Marker Projection Boundary",
          "anchor": "location-marker-projection-boundary",
          "level": 1
        },
        {
          "text": "Business purpose and current implementation",
          "anchor": "locationMarkerProjectionBoundary-1-business-purpose-and-current-implementation",
          "level": 2
        },
        {
          "text": "Record contract and owner responsibilities",
          "anchor": "locationMarkerProjectionBoundary-2-record-contract-and-owner-responsibilities",
          "level": 2
        },
        {
          "text": "Customize and extend safely",
          "anchor": "locationMarkerProjectionBoundary-3-worked-adoption-and-extension-path",
          "level": 2
        },
        {
          "text": "Verification and failure handling",
          "anchor": "locationMarkerProjectionBoundary-4-failure-handling-and-verification",
          "level": 2
        },
        {
          "text": "Documentation selection assets and acceptance",
          "anchor": "locationMarkerProjectionBoundary-5-documentation-selection-assets-and-acceptance",
          "level": 2
        },
        {
          "text": "Common mistakes",
          "anchor": "location-marker-projection-boundary-common-mistakes",
          "level": 2
        }
      ],
      "blocks": [
        {
          "kind": "heading",
          "level": 1,
          "text": "Location Marker Projection Boundary",
          "anchor": "location-marker-projection-boundary"
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Business purpose and current implementation",
          "anchor": "locationMarkerProjectionBoundary-1-business-purpose-and-current-implementation"
        },
        {
          "kind": "paragraph",
          "text": "Beginner reading path: start with the business purpose, use the diagram to follow the owning boundaries, then compare the contract table with the worked example. Developers should inspect the listed source before extending behavior. An operator should use the verification section to distinguish a source check from an installed operation. The guide labels schema-only behavior explicitly; a record definition is not a completed business workflow."
        },
        {
          "kind": "paragraph",
          "text": "A marker projection is a derived map-facing representation, not another location identity or source-of-truth record. locationProjection declares a generated operational model with search enabled and code as its search identity. It captures a canonical location reference, map layer, named coordinates, display and visibility objects, source provenance and projection status. The dedicated module currently has no projector, publication subscriber, withdrawal handler or marker delivery service beyond generated model operations and sample lifecycle hooks."
        },
        {
          "kind": "paragraph",
          "text": "The schema is real framework source, not an empty placeholder. Generated service and schemaOperations router metadata may produce operations when a runtime selects the module and permits their exposure. That is different from a completed business workflow. Deployment route categories, independent authorization, runtime persistence and application composition still decide what is available. This guide deliberately documents the implemented record contract and the missing orchestration separately so that a developer or AI tool does not infer a nonexistent workflow from a package name."
        },
        {
          "kind": "diagram",
          "language": "mermaid",
          "text": "flowchart LR\n  Location[Canonical location and visibility] -. Projector required .-> Marker[Marker projection]\n  Marker -. Delivery contract required .-> Map[Authorized map consumer]\n  Location -. Withdrawal propagation required .-> Withdraw[Remove stale visibility]"
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Record contract and owner responsibilities",
          "anchor": "locationMarkerProjectionBoundary-2-record-contract-and-owner-responsibilities"
        },
        {
          "kind": "paragraph",
          "text": "The schema requires numeric coordinates but does not itself establish geographic ranges, address accuracy or visibility authorization. locationCode and layerCode are plain required strings with no refSchema mapping. label, marker, visibility and sourceRef are required objects without nested contracts. sourceHash is a required string, not an automatically calculated digest; projectedAt is a required date, not proof of a particular canonical revision. This projection has no explicit revision field. Location Core owns physical-place validation and Profile owns reusable address/contact facts. A future projector must resolve the place and layer, derive safe presentation and bind trusted provenance. Provider coordinate arrays belong inside a Location-owned adapter."
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
              "locationCode and layerCode",
              "Required strings",
              "Bind canonical place and presentation layer"
            ],
            [
              "latitude and longitude",
              "Required numbers",
              "Validate ranges through Location owner"
            ],
            [
              "label, marker and visibility",
              "Required objects",
              "Project only authorized safe presentation"
            ],
            [
              "sourceHash, sourceRef, projectedAt",
              "Required provenance",
              "Caller must calculate and bind actual source"
            ],
            [
              "status",
              "CURRENT, STALE or WITHDRAWN",
              "State vocabulary does not refresh an index"
            ]
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Customize and extend safely",
          "anchor": "locationMarkerProjectionBoundary-3-worked-adoption-and-extension-path"
        },
        {
          "kind": "paragraph",
          "text": "A public collection map needs markers only for currently visible operational sites. The intended owner flow validates the place, selects privacy-safe labels and marker attributes, calculates provenance and updates the projection through the configured search seam. On withdrawal, the delivery path must stop exposing the old marker. This module schema does not yet perform those actions. Loading a CURRENT marker record as a fixture can test a renderer, but cannot qualify automatic synchronization, cache invalidation, withdrawal handling or tenant/enterprise isolation."
        },
        {
          "kind": "paragraph",
          "text": "Illustrative shape fixture, not a trusted public marker or an indexing command. This record includes all fields required by locationMarkerProjection. The sourceHash value deliberately identifies example provenance rather than pretending a digest was calculated. No nested marker or visibility authorization contract is defined here."
        },
        {
          "kind": "code",
          "language": "json",
          "text": "{\n  \"code\": \"marker-site-a\",\n  \"locationCode\": \"site-a\",\n  \"layerCode\": \"collection-sites\",\n  \"latitude\": 25.2048,\n  \"longitude\": 55.2708,\n  \"label\": {\n    \"en\": \"Example collection site\"\n  },\n  \"marker\": {\n    \"categoryCode\": \"recycling\"\n  },\n  \"visibility\": {\n    \"audiences\": [\n      \"PUBLIC\"\n    ]\n  },\n  \"sourceRef\": {\n    \"code\": \"site-a\"\n  },\n  \"sourceHash\": \"example-only-not-a-calculated-digest\",\n  \"projectedAt\": \"2026-10-07T00:00:00.000Z\",\n  \"status\": \"CURRENT\"\n}"
        },
        {
          "kind": "paragraph",
          "text": "A future projector must reject out-of-range coordinates, unresolved place/layer references and visibility broader than the source allows. A source withdrawal must remove or suppress delivery, not merely change this stored enum. On stale or interrupted projection, reconcile the trusted source and prior indexing evidence through the Search owner before rebuilding. The schema's search-enabled flag and empty local search/event registries do not implement that recovery."
        },
        {
          "kind": "paragraph",
          "text": "For a later-loaded project module named customerLocationExtensions, use modules/customerLocationExtensions/src/schemas/schemas.js for deliberate additive schema changes and modules/customerLocationExtensions/config/properties.js for the existing schemaPolicies.locationProjection.operational.accessGroups policy. Register and select that module through the normal module graph. These are existing layering mechanisms, not switches that create a missing workflow. Any new business orchestration belongs in that project's loader-visible src/service files with its own secured route and contracts; it is new implementation requiring qualification. Keep customer records in the project business release and documentation in its docs-v001 pack. Preserve framework field meanings, Profile authority, trusted tenant context and canonical capability ownership."
        },
        {
          "kind": "paragraph",
          "text": "Before exposing a new operation, record its business outcome, complete payload, identity source, permission, expected-revision rule and recovery behavior. Use existing loader-composed services and configuration, including remote-service boundaries when Location is deployed standalone. Do not assume Profile, Process or Search lives in the same process. No request-body field may choose another tenant, provider or arbitrary service. A schema extension should preserve existing field meaning and compatibility; a breaking lifecycle or reference change requires deliberate migration evidence, not an unreviewed import overwrite."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Verification and failure handling",
          "anchor": "locationMarkerProjectionBoundary-4-failure-handling-and-verification"
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
          "anchor": "locationMarkerProjectionBoundary-5-documentation-selection-assets-and-acceptance"
        },
        {
          "kind": "paragraph",
          "text": "Partner extension guidance: select this capability through the existing module graph and use later project configuration or a loader-visible service extension for an intentional difference. Preserve its canonical identity, independent authorization, bounded inputs and original evidence. Add a focused regression for the changed policy and run the inherited owner tests. Do not fork the framework guide into another module merely to customize branding; reference it from a project guide that explains only the real difference."
        },
        {
          "kind": "paragraph",
          "text": "This guide is canonical CMS data owned by locationProjection. Its optional CONTENT_PACK lives in data/docs-v001, separate from business DATA_RELEASE sections. A partner importing business records does not need to install this guide. Axis exposes the documentation profile independently and imports its declared CMS closure plus shared scaffold into WCMS Staged. The functional group provides navigation context without owning a duplicate article body. Follow owner-qualified related references for shared behavior; a reference must not silently install another capability pack or create a second implementation."
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
          "anchor": "location-marker-projection-boundary-common-mistakes"
        },
        {
          "kind": "paragraph",
          "text": "Do not treat generated CRUD as an approval, projection or delivery workflow. Do not infer transitions from status enums, trusted identity from reference objects or automatic synchronization from search metadata. Do not expose a generated route without deployment policy and independent permission. Do not put runtime tenant fields into business records or copy Profile address facts into Location. Complete and test the owning orchestration before claiming operational acceptance."
        }
      ],
      "searchText": "Location Marker Projection Boundary Location Marker Projection Boundary: source-backed behavior, ownership, extension, failure handling and acceptance boundaries. # Location Marker Projection Boundary\n\n## Business purpose and current implementation\n\nBeginner reading path: start with the business purpose, use the diagram to follow the owning boundaries, then compare the contract table with the worked example. Developers should inspect the listed source before extending behavior. An operator should use the verification section to distinguish a source check from an installed operation. The guide labels schema-only behavior explicitly; a record definition is not a completed business workflow.\n\nA marker projection is a derived map-facing representation, not another location identity or source-of-truth record. locationProjection declares a generated operational model with search enabled and code as its search identity. It captures a canonical location reference, map layer, named coordinates, display and visibility objects, source provenance and projection status. The dedicated module currently has no projector, publication subscriber, withdrawal handler or marker delivery service beyond generated model operations and sample lifecycle hooks.\n\nThe schema is real framework source, not an empty placeholder. Generated service and schemaOperations router metadata may produce operations when a runtime selects the module and permits their exposure. That is different from a completed business workflow. Deployment route categories, independent authorization, runtime persistence and application composition still decide what is available. This guide deliberately documents the implemented record contract and the missing orchestration separately so that a developer or AI tool does not infer a nonexistent workflow from a package name.\n\n```mermaid\nflowchart LR\n  Location[Canonical location and visibility] -. Projector required .-> Marker[Marker projection]\n  Marker -. Delivery contract required .-> Map[Authorized map consumer]\n  Location -. Withdrawal propagation required .-> Withdraw[Remove stale visibility]\n```\n\n## Record contract and owner responsibilities\n\nThe schema requires numeric coordinates but does not itself establish geographic ranges, address accuracy or visibility authorization. locationCode and layerCode are plain required strings with no refSchema mapping. label, marker, visibility and sourceRef are required objects without nested contracts. sourceHash is a required string, not an automatically calculated digest; projectedAt is a required date, not proof of a particular canonical revision. This projection has no explicit revision field. Location Core owns physical-place validation and Profile owns reusable address/contact facts. A future projector must resolve the place and layer, derive safe presentation and bind trusted provenance. Provider coordinate arrays belong inside a Location-owned adapter.\n\n| Field or model | Source contract | Required owner behavior |\n| --- | --- | --- |\n| locationCode and layerCode | Required strings | Bind canonical place and presentation layer |\n| latitude and longitude | Required numbers | Validate ranges through Location owner |\n| label, marker and visibility | Required objects | Project only authorized safe presentation |\n| sourceHash, sourceRef, projectedAt | Required provenance | Caller must calculate and bind actual source |\n| status | CURRENT, STALE or WITHDRAWN | State vocabulary does not refresh an index |\n\n## Customize and extend safely\n\nA public collection map needs markers only for currently visible operational sites. The intended owner flow validates the place, selects privacy-safe labels and marker attributes, calculates provenance and updates the projection through the configured search seam. On withdrawal, the delivery path must stop exposing the old marker. This module schema does not yet perform those actions. Loading a CURRENT marker record as a fixture can test a renderer, but cannot qualify automatic synchronization, cache invalidation, withdrawal handling or tenant/enterprise isolation.\n\nIllustrative shape fixture, not a trusted public marker or an indexing command. This record includes all fields required by locationMarkerProjection. The sourceHash value deliberately identifies example provenance rather than pretending a digest was calculated. No nested marker or visibility authorization contract is defined here.\n\n```json\n{\n  \"code\": \"marker-site-a\",\n  \"locationCode\": \"site-a\",\n  \"layerCode\": \"collection-sites\",\n  \"latitude\": 25.2048,\n  \"longitude\": 55.2708,\n  \"label\": {\n    \"en\": \"Example collection site\"\n  },\n  \"marker\": {\n    \"categoryCode\": \"recycling\"\n  },\n  \"visibility\": {\n    \"audiences\": [\n      \"PUBLIC\"\n    ]\n  },\n  \"sourceRef\": {\n    \"code\": \"site-a\"\n  },\n  \"sourceHash\": \"example-only-not-a-calculated-digest\",\n  \"projectedAt\": \"2026-10-07T00:00:00.000Z\",\n  \"status\": \"CURRENT\"\n}\n```\n\nA future projector must reject out-of-range coordinates, unresolved place/layer references and visibility broader than the source allows. A source withdrawal must remove or suppress delivery, not merely change this stored enum. On stale or interrupted projection, reconcile the trusted source and prior indexing evidence through the Search owner before rebuilding. The schema's search-enabled flag and empty local search/event registries do not implement that recovery.\n\nFor a later-loaded project module named customerLocationExtensions, use modules/customerLocationExtensions/src/schemas/schemas.js for deliberate additive schema changes and modules/customerLocationExtensions/config/properties.js for the existing schemaPolicies.locationProjection.operational.accessGroups policy. Register and select that module through the normal module graph. These are existing layering mechanisms, not switches that create a missing workflow. Any new business orchestration belongs in that project's loader-visible src/service files with its own secured route and contracts; it is new implementation requiring qualification. Keep customer records in the project business release and documentation in its docs-v001 pack. Preserve framework field meanings, Profile authority, trusted tenant context and canonical capability ownership.\n\nBefore exposing a new operation, record its business outcome, complete payload, identity source, permission, expected-revision rule and recovery behavior. Use existing loader-composed services and configuration, including remote-service boundaries when Location is deployed standalone. Do not assume Profile, Process or Search lives in the same process. No request-body field may choose another tenant, provider or arbitrary service. A schema extension should preserve existing field meaning and compatibility; a breaking lifecycle or reference change requires deliberate migration evidence, not an unreviewed import overwrite.\n\n## Verification and failure handling\n\nBuild tests at the actual boundary. First inspect generated descriptor and schema validation for required fields, allowed status values and reference shapes. Then test any newly implemented business operation for denied permission, wrong enterprise, stale revision, missing target, malformed nested data and an interrupted acknowledgement. Finally prove installed import, correct exposure and signed-in behavior. There is no dedicated completed orchestration test suite in this module today; sample init success must never be counted as workflow acceptance. Record that implementation gap explicitly in project readiness decisions.\n\nIf a record appears in storage but the intended journey is unavailable, inspect the effective module graph, generated-service availability, route exposure and owning behavior before changing data. If a proposal or projection is stale, compare original source and current revision; do not mark it CURRENT or APPROVED merely to clear a dashboard. Never retry an uncertain business mutation without inspecting its original evidence through the owner. A source hash, timestamp or schema status is not an authorization token. Keep private review evidence out of public documentation and retain only privacy-safe identifiers in operational diagnostics.\n\n## Documentation selection assets and acceptance\n\nPartner extension guidance: select this capability through the existing module graph and use later project configuration or a loader-visible service extension for an intentional difference. Preserve its canonical identity, independent authorization, bounded inputs and original evidence. Add a focused regression for the changed policy and run the inherited owner tests. Do not fork the framework guide into another module merely to customize branding; reference it from a project guide that explains only the real difference.\n\nThis guide is canonical CMS data owned by locationProjection. Its optional CONTENT_PACK lives in data/docs-v001, separate from business DATA_RELEASE sections. A partner importing business records does not need to install this guide. Axis exposes the documentation profile independently and imports its declared CMS closure plus shared scaffold into WCMS Staged. The functional group provides navigation context without owning a duplicate article body. Follow owner-qualified related references for shared behavior; a reference must not silently install another capability pack or create a second implementation.\n\nImages belong to the same documentation release as their owning Media records and declared asset files. Preserve stable Media codes, release-relative asset paths and checksums. Shared images may stay with the explicitly included documentation foundation; capability-specific images stay with that capability. Diagrams and tables are canonical content blocks, not separate Markdown authoring copies. A new screenshot must be privacy-safe, accessible and traceable to the depicted version. An image is explanatory evidence only, not proof that a runtime operation succeeded.\n\nCanonical authoring begins in DRAFT with an inactive route. After an authorized source editorial review, the owning Component, Node, PageMetadata, SearchMetadata and PublicationState records may move to STAGED and the owning route may be active for subsequent normal publication. STAGED is not approved or published; an active authoring route is only a publication candidate. The release owner must complete release-integrity preparation and validation, governed import, staged inspection and normal owner approvals before publication. Source review does not validate existing checksums, create approval receipts or prove Online delivery or browser acceptance.\n\n## Common mistakes\n\nDo not treat generated CRUD as an approval, projection or delivery workflow. Do not infer transitions from status enums, trusted identity from reference objects or automatic synchronization from search metadata. Do not expose a generated route without deployment policy and independent permission. Do not put runtime tenant fields into business records or copy Profile address facts into Location. Complete and test the owning orchestration before claiming operational acceptance.\n",
      "source": {
        "repository": "nodics.ai",
        "owner": "locationProjection",
        "functionalModule": "nodics.location",
        "technicalModule": "locationProjection",
        "path": "data/docs-v001/records/documentation/locationProjectionDocumentationComponentData.js",
        "sourcePath": "data/docs-v001/records/documentation/locationProjectionDocumentationComponentData.js",
        "checksum": "96dc04a372c32916dd20b56b31a9d87a3f73e5e40607fc00a3d5e793b2fb06ff",
        "wordCount": 1427
      },
      "slug": "location-marker-projection-boundary",
      "locale": "en",
      "navigationGroup": "Location Marker",
      "navigationGroupCode": "locationProjection",
      "navigationGroupOrder": 70,
      "navigationOrder": 2006,
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
            "locationMarkerProjectionBoundary-1-business-purpose-and-current-implementation",
            "locationMarkerProjectionBoundary-2-record-contract-and-owner-responsibilities",
            "locationMarkerProjectionBoundary-3-worked-adoption-and-extension-path",
            "locationMarkerProjectionBoundary-4-failure-handling-and-verification",
            "locationMarkerProjectionBoundary-5-documentation-selection-assets-and-acceptance"
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
