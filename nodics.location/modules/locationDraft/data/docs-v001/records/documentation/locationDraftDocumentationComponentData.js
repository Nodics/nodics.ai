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
  "nodicsDocsComponentlocationDraftSchemaBoundary": {
    "code": "nodicsDocsComponentlocationDraftSchemaBoundary",
    "typeCode": "nodicsDocumentationArticleComponentType",
    "renderer": "documentation.component.article",
    "accessMode": "PUBLIC",
    "properties": {
      "code": "location.draft-schema-boundary",
      "title": "Location Draft Records and Change Boundary",
      "route": "/docs/framework/location-draft-schema-boundary",
      "section": "framework-architecture-and-design",
      "sectionTitle": "Framework Architecture and Design",
      "group": "framework-architecture-and-design",
      "groupTitle": "Framework Architecture and Design",
      "parentId": "framework-architecture-and-design",
      "hierarchyPath": [
        "Framework Architecture and Design",
        "Location Draft Records and Change Boundary"
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
        "locationDraft capability owner"
      ],
      "technicalAudience": [
        "architect",
        "developer",
        "operator",
        "qa engineer",
        "ai tool"
      ],
      "summary": "Location Draft Records and Change Boundary: source-backed behavior, ownership, extension, failure handling and acceptance boundaries.",
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
        "locationDraft",
        "source-backed",
        "ownership",
        "operations"
      ],
      "topicKeywords": [
        "Location Draft Records and Change Boundary",
        "Framework Architecture and Design"
      ],
      "headings": [
        {
          "text": "Location Draft Records and Change Boundary",
          "anchor": "location-draft-schema-boundary",
          "level": 1
        },
        {
          "text": "Business purpose and current implementation",
          "anchor": "locationDraftSchemaBoundary-1-business-purpose-and-current-implementation",
          "level": 2
        },
        {
          "text": "Record contract and owner responsibilities",
          "anchor": "locationDraftSchemaBoundary-2-record-contract-and-owner-responsibilities",
          "level": 2
        },
        {
          "text": "Customize and extend safely",
          "anchor": "locationDraftSchemaBoundary-3-worked-adoption-and-extension-path",
          "level": 2
        },
        {
          "text": "Verification and failure handling",
          "anchor": "locationDraftSchemaBoundary-4-failure-handling-and-verification",
          "level": 2
        },
        {
          "text": "Documentation selection assets and acceptance",
          "anchor": "locationDraftSchemaBoundary-5-documentation-selection-assets-and-acceptance",
          "level": 2
        },
        {
          "text": "Common mistakes",
          "anchor": "location-draft-schema-boundary-common-mistakes",
          "level": 2
        }
      ],
      "blocks": [
        {
          "kind": "heading",
          "level": 1,
          "text": "Location Draft Records and Change Boundary",
          "anchor": "location-draft-schema-boundary"
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Business purpose and current implementation",
          "anchor": "locationDraftSchemaBoundary-1-business-purpose-and-current-implementation"
        },
        {
          "kind": "paragraph",
          "text": "Beginner reading path: start with the business purpose, use the diagram to follow the owning boundaries, then compare the contract table with the worked example. Developers should inspect the listed source before extending behavior. An operator should use the verification section to distinguish a source check from an installed operation. The guide labels schema-only behavior explicitly; a record definition is not a completed business workflow."
        },
        {
          "kind": "paragraph",
          "text": "Location drafts separate proposed change from canonical physical-place identity. A business user can describe a new location, correction or deactivation without treating that proposal as an approved operational place. The schema has a required proposedLocation object, source and submitter references, optional target and enterprise references, evidence references, status, revision and lifecycle dates. The current dedicated module does not contain a submission or apply workflow: its service only supplies sample init and postInit hooks and its dedicated routers are empty."
        },
        {
          "kind": "paragraph",
          "text": "The schema is real framework source, not an empty placeholder. Generated service and schemaOperations router metadata may produce operations when a runtime selects the module and permits their exposure. That is different from a completed business workflow. Deployment route categories, independent authorization, runtime persistence and application composition still decide what is available. This guide deliberately documents the implemented record contract and the missing orchestration separately so that a developer or AI tool does not infer a nonexistent workflow from a package name."
        },
        {
          "kind": "diagram",
          "language": "mermaid",
          "text": "flowchart LR\n  Proposal[Business change intent] --> Draft[Draft record]\n  Draft -. Submit behavior not implemented here .-> Review[Governed review]\n  Review -. Owner validation required .-> Location[Canonical Location update]"
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Record contract and owner responsibilities",
          "anchor": "locationDraftSchemaBoundary-2-record-contract-and-owner-responsibilities"
        },
        {
          "kind": "paragraph",
          "text": "A proposedLocation object is not recursively validated as a complete canonical Location by the draft schema alone. submittedByRef and sourceRef are required objects without typed refSchema targets; only enterpriseRef has a Profile enterprise mapping. targetLocationCode is optional even for CORRECTION and DEACTIVATION, and there is no targetRevision field. revision belongs to the draft. Location Core validates named coordinates and rejects duplicated Profile address fields, but its reference-shape checks do not prove a Profile target exists or is visible. A future submit/apply operation must resolve those references, authenticate the submitter, bind the target version and define whether proposedLocation is a complete model or a patch. Generic schema persistence does not perform that orchestration."
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
              "draftType",
              "CREATE, CORRECTION or DEACTIVATION",
              "Choose an explicit change intent"
            ],
            [
              "proposedLocation",
              "Required object",
              "Validate against canonical Location policy"
            ],
            [
              "submittedByRef and sourceRef",
              "Required objects",
              "References are not authenticated identity proof"
            ],
            [
              "status",
              "DRAFT, SUBMITTED, PENDING_APPROVAL, APPROVED, REJECTED, WITHDRAWN",
              "No transition implementation implied"
            ]
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Customize and extend safely",
          "anchor": "locationDraftSchemaBoundary-3-worked-adoption-and-extension-path"
        },
        {
          "kind": "paragraph",
          "text": "For a correction to a pickup site, retain the canonical target code and prepare only the intended changes with their supporting evidence. Review the complete proposal and compare the target revision before submission. If the target changes during review, rebuild the review from current state rather than overwriting it. Withdrawal should be an explicit governed transition, not deletion of evidence. The current schema can represent these states, but a partner must not advertise a ready-made review or application pipeline until the corresponding secured behavior exists and passes acceptance."
        },
        {
          "kind": "paragraph",
          "text": "Illustrative correction record, not a ready-made submit request. The intended starting state is an existing site-a and an authenticated editor. The proposal below contains only the changed point; an eventual apply operation must merge it into the current canonical model before complete Location validation. DRAFT is an explicit required value rather than an automatic lifecycle transition."
        },
        {
          "kind": "code",
          "language": "json",
          "text": "{\n  \"code\": \"correction-site-a\",\n  \"draftType\": \"CORRECTION\",\n  \"targetLocationCode\": \"site-a\",\n  \"proposedLocation\": {\n    \"latitude\": 25.2048,\n    \"longitude\": 55.2708\n  },\n  \"submittedByRef\": {\n    \"code\": \"example-editor\"\n  },\n  \"sourceRef\": {\n    \"code\": \"example-site-survey\"\n  },\n  \"status\": \"DRAFT\",\n  \"revision\": 0,\n  \"correlationId\": \"example-location-draft-a\"\n}"
        },
        {
          "kind": "paragraph",
          "text": "A missing target for a correction, latitude 95, copied addressLine1, a nested tenant field or an untrusted submitter reference must be rejected by the future business operation. The draft schema alone does not establish those rejections. If the target changed, refresh and re-review the merged proposal; if submission acknowledgement is uncertain, inspect the original request before creating another draft. Preserve withdrawn evidence instead of deleting it."
        },
        {
          "kind": "paragraph",
          "text": "For a later-loaded project module named customerLocationExtensions, use modules/customerLocationExtensions/src/schemas/schemas.js for deliberate additive schema changes and modules/customerLocationExtensions/config/properties.js for the existing schemaPolicies.locationDraft.operational.accessGroups policy. Register and select that module through the normal module graph. These are existing layering mechanisms, not switches that create a missing workflow. Any new business orchestration belongs in that project's loader-visible src/service files with its own secured route and contracts; it is new implementation requiring qualification. Keep customer records in the project business release and documentation in its docs-v001 pack. Preserve framework field meanings, Profile authority, trusted tenant context and canonical capability ownership."
        },
        {
          "kind": "paragraph",
          "text": "Before exposing a new operation, record its business outcome, complete payload, identity source, permission, expected-revision rule and recovery behavior. Use existing loader-composed services and configuration, including remote-service boundaries when Location is deployed standalone. Do not assume Profile, Process or Search lives in the same process. No request-body field may choose another tenant, provider or arbitrary service. A schema extension should preserve existing field meaning and compatibility; a breaking lifecycle or reference change requires deliberate migration evidence, not an unreviewed import overwrite."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Verification and failure handling",
          "anchor": "locationDraftSchemaBoundary-4-failure-handling-and-verification"
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
          "anchor": "locationDraftSchemaBoundary-5-documentation-selection-assets-and-acceptance"
        },
        {
          "kind": "paragraph",
          "text": "Partner extension guidance: select this capability through the existing module graph and use later project configuration or a loader-visible service extension for an intentional difference. Preserve its canonical identity, independent authorization, bounded inputs and original evidence. Add a focused regression for the changed policy and run the inherited owner tests. Do not fork the framework guide into another module merely to customize branding; reference it from a project guide that explains only the real difference."
        },
        {
          "kind": "paragraph",
          "text": "This guide is canonical CMS data owned by locationDraft. Its optional CONTENT_PACK lives in data/docs-v001, separate from business DATA_RELEASE sections. A partner importing business records does not need to install this guide. Axis exposes the documentation profile independently and imports its declared CMS closure plus shared scaffold into WCMS Staged. The functional group provides navigation context without owning a duplicate article body. Follow owner-qualified related references for shared behavior; a reference must not silently install another capability pack or create a second implementation."
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
          "anchor": "location-draft-schema-boundary-common-mistakes"
        },
        {
          "kind": "paragraph",
          "text": "Do not treat generated CRUD as an approval, projection or delivery workflow. Do not infer transitions from status enums, trusted identity from reference objects or automatic synchronization from search metadata. Do not expose a generated route without deployment policy and independent permission. Do not put runtime tenant fields into business records or copy Profile address facts into Location. Complete and test the owning orchestration before claiming operational acceptance."
        }
      ],
      "searchText": "Location Draft Records and Change Boundary Location Draft Records and Change Boundary: source-backed behavior, ownership, extension, failure handling and acceptance boundaries. # Location Draft Records and Change Boundary\n\n## Business purpose and current implementation\n\nBeginner reading path: start with the business purpose, use the diagram to follow the owning boundaries, then compare the contract table with the worked example. Developers should inspect the listed source before extending behavior. An operator should use the verification section to distinguish a source check from an installed operation. The guide labels schema-only behavior explicitly; a record definition is not a completed business workflow.\n\nLocation drafts separate proposed change from canonical physical-place identity. A business user can describe a new location, correction or deactivation without treating that proposal as an approved operational place. The schema has a required proposedLocation object, source and submitter references, optional target and enterprise references, evidence references, status, revision and lifecycle dates. The current dedicated module does not contain a submission or apply workflow: its service only supplies sample init and postInit hooks and its dedicated routers are empty.\n\nThe schema is real framework source, not an empty placeholder. Generated service and schemaOperations router metadata may produce operations when a runtime selects the module and permits their exposure. That is different from a completed business workflow. Deployment route categories, independent authorization, runtime persistence and application composition still decide what is available. This guide deliberately documents the implemented record contract and the missing orchestration separately so that a developer or AI tool does not infer a nonexistent workflow from a package name.\n\n```mermaid\nflowchart LR\n  Proposal[Business change intent] --> Draft[Draft record]\n  Draft -. Submit behavior not implemented here .-> Review[Governed review]\n  Review -. Owner validation required .-> Location[Canonical Location update]\n```\n\n## Record contract and owner responsibilities\n\nA proposedLocation object is not recursively validated as a complete canonical Location by the draft schema alone. submittedByRef and sourceRef are required objects without typed refSchema targets; only enterpriseRef has a Profile enterprise mapping. targetLocationCode is optional even for CORRECTION and DEACTIVATION, and there is no targetRevision field. revision belongs to the draft. Location Core validates named coordinates and rejects duplicated Profile address fields, but its reference-shape checks do not prove a Profile target exists or is visible. A future submit/apply operation must resolve those references, authenticate the submitter, bind the target version and define whether proposedLocation is a complete model or a patch. Generic schema persistence does not perform that orchestration.\n\n| Field or model | Source contract | Required owner behavior |\n| --- | --- | --- |\n| draftType | CREATE, CORRECTION or DEACTIVATION | Choose an explicit change intent |\n| proposedLocation | Required object | Validate against canonical Location policy |\n| submittedByRef and sourceRef | Required objects | References are not authenticated identity proof |\n| status | DRAFT, SUBMITTED, PENDING_APPROVAL, APPROVED, REJECTED, WITHDRAWN | No transition implementation implied |\n\n## Customize and extend safely\n\nFor a correction to a pickup site, retain the canonical target code and prepare only the intended changes with their supporting evidence. Review the complete proposal and compare the target revision before submission. If the target changes during review, rebuild the review from current state rather than overwriting it. Withdrawal should be an explicit governed transition, not deletion of evidence. The current schema can represent these states, but a partner must not advertise a ready-made review or application pipeline until the corresponding secured behavior exists and passes acceptance.\n\nIllustrative correction record, not a ready-made submit request. The intended starting state is an existing site-a and an authenticated editor. The proposal below contains only the changed point; an eventual apply operation must merge it into the current canonical model before complete Location validation. DRAFT is an explicit required value rather than an automatic lifecycle transition.\n\n```json\n{\n  \"code\": \"correction-site-a\",\n  \"draftType\": \"CORRECTION\",\n  \"targetLocationCode\": \"site-a\",\n  \"proposedLocation\": {\n    \"latitude\": 25.2048,\n    \"longitude\": 55.2708\n  },\n  \"submittedByRef\": {\n    \"code\": \"example-editor\"\n  },\n  \"sourceRef\": {\n    \"code\": \"example-site-survey\"\n  },\n  \"status\": \"DRAFT\",\n  \"revision\": 0,\n  \"correlationId\": \"example-location-draft-a\"\n}\n```\n\nA missing target for a correction, latitude 95, copied addressLine1, a nested tenant field or an untrusted submitter reference must be rejected by the future business operation. The draft schema alone does not establish those rejections. If the target changed, refresh and re-review the merged proposal; if submission acknowledgement is uncertain, inspect the original request before creating another draft. Preserve withdrawn evidence instead of deleting it.\n\nFor a later-loaded project module named customerLocationExtensions, use modules/customerLocationExtensions/src/schemas/schemas.js for deliberate additive schema changes and modules/customerLocationExtensions/config/properties.js for the existing schemaPolicies.locationDraft.operational.accessGroups policy. Register and select that module through the normal module graph. These are existing layering mechanisms, not switches that create a missing workflow. Any new business orchestration belongs in that project's loader-visible src/service files with its own secured route and contracts; it is new implementation requiring qualification. Keep customer records in the project business release and documentation in its docs-v001 pack. Preserve framework field meanings, Profile authority, trusted tenant context and canonical capability ownership.\n\nBefore exposing a new operation, record its business outcome, complete payload, identity source, permission, expected-revision rule and recovery behavior. Use existing loader-composed services and configuration, including remote-service boundaries when Location is deployed standalone. Do not assume Profile, Process or Search lives in the same process. No request-body field may choose another tenant, provider or arbitrary service. A schema extension should preserve existing field meaning and compatibility; a breaking lifecycle or reference change requires deliberate migration evidence, not an unreviewed import overwrite.\n\n## Verification and failure handling\n\nBuild tests at the actual boundary. First inspect generated descriptor and schema validation for required fields, allowed status values and reference shapes. Then test any newly implemented business operation for denied permission, wrong enterprise, stale revision, missing target, malformed nested data and an interrupted acknowledgement. Finally prove installed import, correct exposure and signed-in behavior. There is no dedicated completed orchestration test suite in this module today; sample init success must never be counted as workflow acceptance. Record that implementation gap explicitly in project readiness decisions.\n\nIf a record appears in storage but the intended journey is unavailable, inspect the effective module graph, generated-service availability, route exposure and owning behavior before changing data. If a proposal or projection is stale, compare original source and current revision; do not mark it CURRENT or APPROVED merely to clear a dashboard. Never retry an uncertain business mutation without inspecting its original evidence through the owner. A source hash, timestamp or schema status is not an authorization token. Keep private review evidence out of public documentation and retain only privacy-safe identifiers in operational diagnostics.\n\n## Documentation selection assets and acceptance\n\nPartner extension guidance: select this capability through the existing module graph and use later project configuration or a loader-visible service extension for an intentional difference. Preserve its canonical identity, independent authorization, bounded inputs and original evidence. Add a focused regression for the changed policy and run the inherited owner tests. Do not fork the framework guide into another module merely to customize branding; reference it from a project guide that explains only the real difference.\n\nThis guide is canonical CMS data owned by locationDraft. Its optional CONTENT_PACK lives in data/docs-v001, separate from business DATA_RELEASE sections. A partner importing business records does not need to install this guide. Axis exposes the documentation profile independently and imports its declared CMS closure plus shared scaffold into WCMS Staged. The functional group provides navigation context without owning a duplicate article body. Follow owner-qualified related references for shared behavior; a reference must not silently install another capability pack or create a second implementation.\n\nImages belong to the same documentation release as their owning Media records and declared asset files. Preserve stable Media codes, release-relative asset paths and checksums. Shared images may stay with the explicitly included documentation foundation; capability-specific images stay with that capability. Diagrams and tables are canonical content blocks, not separate Markdown authoring copies. A new screenshot must be privacy-safe, accessible and traceable to the depicted version. An image is explanatory evidence only, not proof that a runtime operation succeeded.\n\nCanonical authoring begins in DRAFT with an inactive route. After an authorized source editorial review, the owning Component, Node, PageMetadata, SearchMetadata and PublicationState records may move to STAGED and the owning route may be active for subsequent normal publication. STAGED is not approved or published; an active authoring route is only a publication candidate. The release owner must complete release-integrity preparation and validation, governed import, staged inspection and normal owner approvals before publication. Source review does not validate existing checksums, create approval receipts or prove Online delivery or browser acceptance.\n\n## Common mistakes\n\nDo not treat generated CRUD as an approval, projection or delivery workflow. Do not infer transitions from status enums, trusted identity from reference objects or automatic synchronization from search metadata. Do not expose a generated route without deployment policy and independent permission. Do not put runtime tenant fields into business records or copy Profile address facts into Location. Complete and test the owning orchestration before claiming operational acceptance.\n",
      "source": {
        "repository": "nodics.ai",
        "owner": "locationDraft",
        "functionalModule": "nodics.location",
        "technicalModule": "locationDraft",
        "path": "data/docs-v001/records/documentation/locationDraftDocumentationComponentData.js",
        "sourcePath": "data/docs-v001/records/documentation/locationDraftDocumentationComponentData.js",
        "checksum": "4b18a792b8942e31200c069c15313d32e06c66b55b7caae81fc10e1cd2663ee1",
        "wordCount": 1437
      },
      "slug": "location-draft-schema-boundary",
      "locale": "en",
      "navigationGroup": "Location Draft",
      "navigationGroupCode": "locationDraft",
      "navigationGroupOrder": 70,
      "navigationOrder": 2005,
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
            "locationDraftSchemaBoundary-1-business-purpose-and-current-implementation",
            "locationDraftSchemaBoundary-2-record-contract-and-owner-responsibilities",
            "locationDraftSchemaBoundary-3-worked-adoption-and-extension-path",
            "locationDraftSchemaBoundary-4-failure-handling-and-verification",
            "locationDraftSchemaBoundary-5-documentation-selection-assets-and-acceptance"
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
