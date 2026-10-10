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
  "nodicsDocsComponentlocationApprovalSchemaBoundary": {
    "code": "nodicsDocsComponentlocationApprovalSchemaBoundary",
    "typeCode": "nodicsDocumentationArticleComponentType",
    "renderer": "documentation.component.article",
    "accessMode": "PUBLIC",
    "properties": {
      "code": "location.approval-schema-boundary",
      "title": "Location Approval Records and Workflow Boundary",
      "route": "/docs/framework/location-approval-schema-boundary",
      "section": "framework-architecture-and-design",
      "sectionTitle": "Framework Architecture and Design",
      "group": "framework-architecture-and-design",
      "groupTitle": "Framework Architecture and Design",
      "parentId": "framework-architecture-and-design",
      "hierarchyPath": [
        "Framework Architecture and Design",
        "Location Approval Records and Workflow Boundary"
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
        "locationApproval capability owner"
      ],
      "technicalAudience": [
        "architect",
        "developer",
        "operator",
        "qa engineer",
        "ai tool"
      ],
      "summary": "Location Approval Records and Workflow Boundary: source-backed behavior, ownership, extension, failure handling and acceptance boundaries.",
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
        "locationApproval",
        "source-backed",
        "ownership",
        "operations"
      ],
      "topicKeywords": [
        "Location Approval Records and Workflow Boundary",
        "Framework Architecture and Design"
      ],
      "headings": [
        {
          "text": "Location Approval Records and Workflow Boundary",
          "anchor": "location-approval-schema-boundary",
          "level": 1
        },
        {
          "text": "Business purpose and current implementation",
          "anchor": "locationApprovalSchemaBoundary-1-business-purpose-and-current-implementation",
          "level": 2
        },
        {
          "text": "Record contract and owner responsibilities",
          "anchor": "locationApprovalSchemaBoundary-2-record-contract-and-owner-responsibilities",
          "level": 2
        },
        {
          "text": "Customize and extend safely",
          "anchor": "locationApprovalSchemaBoundary-3-worked-adoption-and-extension-path",
          "level": 2
        },
        {
          "text": "Verification and failure handling",
          "anchor": "locationApprovalSchemaBoundary-4-failure-handling-and-verification",
          "level": 2
        },
        {
          "text": "Documentation selection assets and acceptance",
          "anchor": "locationApprovalSchemaBoundary-5-documentation-selection-assets-and-acceptance",
          "level": 2
        },
        {
          "text": "Common mistakes",
          "anchor": "location-approval-schema-boundary-common-mistakes",
          "level": 2
        }
      ],
      "blocks": [
        {
          "kind": "heading",
          "level": 1,
          "text": "Location Approval Records and Workflow Boundary",
          "anchor": "location-approval-schema-boundary"
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Business purpose and current implementation",
          "anchor": "locationApprovalSchemaBoundary-1-business-purpose-and-current-implementation"
        },
        {
          "kind": "paragraph",
          "text": "Beginner reading path: start with the business purpose, use the diagram to follow the owning boundaries, then compare the contract table with the worked example. Developers should inspect the listed source before extending behavior. An operator should use the verification section to distinguish a source check from an installed operation. The guide labels schema-only behavior explicitly; a record definition is not a completed business workflow."
        },
        {
          "kind": "paragraph",
          "text": "An approval request records the review context for a proposed location change. It links a draft, optional target location and reviewer reference with decision, reason and decision evidence. Business readers can distinguish the existence of a request from an authorized approval. The schema contains statuses and decision values, but this module currently has only generated schema operations, an empty dedicated router registry and a sample lifecycle service. It does not yet implement the orchestration that assigns reviewers, enforces separation of duties or applies an approved draft to Location Core."
        },
        {
          "kind": "paragraph",
          "text": "The schema is real framework source, not an empty placeholder. Generated service and schemaOperations router metadata may produce operations when a runtime selects the module and permits their exposure. That is different from a completed business workflow. Deployment route categories, independent authorization, runtime persistence and application composition still decide what is available. This guide deliberately documents the implemented record contract and the missing orchestration separately so that a developer or AI tool does not infer a nonexistent workflow from a package name."
        },
        {
          "kind": "diagram",
          "language": "mermaid",
          "text": "flowchart LR\n  Draft[Exact draft revision] --> Request[Approval request record]\n  Request -. Separate authorized operation required .-> Decision[Reviewer decision]\n  Decision -. Separate apply operation required .-> Core[Canonical Location]"
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Record contract and owner responsibilities",
          "anchor": "locationApprovalSchemaBoundary-2-record-contract-and-owner-responsibilities"
        },
        {
          "kind": "paragraph",
          "text": "decision and status are separate fields. The schema does not by itself reject a contradictory combination such as an APPROVE decision with a REJECTED status. draftCode and targetLocationCode are plain strings with no refSchema mapping; reviewerRef and decisionEvidence are unrestricted objects. revision is the approval request's revision, not the reviewed draft revision: there is no dedicated draftRevision or expectedDraftRevision field. decidedAt is optional. An implementing operation must authenticate the reviewer, enforce enterprise scope and separation of duties, validate decision/status consistency and preserve an explicit binding to the reviewed draft version in its governed evidence contract. None of those checks is supplied by this schema."
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
              "draftCode",
              "Required string; no refSchema mapping",
              "Resolve the governed draft and bind its reviewed revision separately"
            ],
            [
              "decision",
              "Optional APPROVE, REJECT or RETURN",
              "Not proof of a decision transition"
            ],
            [
              "status",
              "OPEN, IN_REVIEW, APPROVED, REJECTED, RETURNED, CANCELLED",
              "Schema vocabulary, not a transition engine"
            ],
            [
              "revision and correlationId",
              "Request revision defaults to zero; correlationId required",
              "Neither field binds the draft revision or enforces concurrency"
            ]
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Customize and extend safely",
          "anchor": "locationApprovalSchemaBoundary-3-worked-adoption-and-extension-path"
        },
        {
          "kind": "paragraph",
          "text": "A partner needs a second-person review before a new collection location becomes available. Prepare a locationDraft first and retain its exact revision. A future or project-owned approval operation can create and assign the request, show a complete review, and accept an authorized decision against that revision. Only the owning Location operation should apply the approved proposal. Until that orchestration is implemented and qualified, an APPROVED value in a manually imported request is not evidence that the location is active or publicly visible."
        },
        {
          "kind": "paragraph",
          "text": "Illustrative record, not a submission API or an approval: the following includes every required approval-request field. It assumes correction-site-a identifies an existing governed draft. An OPEN request may omit decision, reviewerRef, targetLocationCode and decidedAt. The correlation identifier is for tracing; it neither authenticates a person nor deduplicates a retry."
        },
        {
          "kind": "code",
          "language": "json",
          "text": "{\n  \"code\": \"review-site-a\",\n  \"draftCode\": \"correction-site-a\",\n  \"status\": \"OPEN\",\n  \"revision\": 0,\n  \"correlationId\": \"example-location-review-a\"\n}"
        },
        {
          "kind": "paragraph",
          "text": "A future decision operation must reject a changed draft, an unauthorized reviewer or inconsistent decision/status even if the stored record is structurally valid. On a stale draft, reload the proposal and obtain a fresh review. On an uncertain apply result, inspect the original operation evidence before retrying; setting status to APPROVED cannot complete Location Core persistence."
        },
        {
          "kind": "paragraph",
          "text": "For a later-loaded project module named customerLocationExtensions, use modules/customerLocationExtensions/src/schemas/schemas.js for deliberate additive schema changes and modules/customerLocationExtensions/config/properties.js for the existing schemaPolicies.locationApproval.operational.accessGroups policy. Register and select that module through the normal module graph. These are existing layering mechanisms, not switches that create a missing workflow. Any new business orchestration belongs in that project's loader-visible src/service files with its own secured route and contracts; it is new implementation requiring qualification. Keep customer records in the project business release and documentation in its docs-v001 pack. Preserve framework field meanings, Profile authority, trusted tenant context and canonical capability ownership."
        },
        {
          "kind": "paragraph",
          "text": "Before exposing a new operation, record its business outcome, complete payload, identity source, permission, expected-revision rule and recovery behavior. Use existing loader-composed services and configuration, including remote-service boundaries when Location is deployed standalone. Do not assume Profile, Process or Search lives in the same process. No request-body field may choose another tenant, provider or arbitrary service. A schema extension should preserve existing field meaning and compatibility; a breaking lifecycle or reference change requires deliberate migration evidence, not an unreviewed import overwrite."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Verification and failure handling",
          "anchor": "locationApprovalSchemaBoundary-4-failure-handling-and-verification"
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
          "anchor": "locationApprovalSchemaBoundary-5-documentation-selection-assets-and-acceptance"
        },
        {
          "kind": "paragraph",
          "text": "Partner extension guidance: select this capability through the existing module graph and use later project configuration or a loader-visible service extension for an intentional difference. Preserve its canonical identity, independent authorization, bounded inputs and original evidence. Add a focused regression for the changed policy and run the inherited owner tests. Do not fork the framework guide into another module merely to customize branding; reference it from a project guide that explains only the real difference."
        },
        {
          "kind": "paragraph",
          "text": "This guide is canonical CMS data owned by locationApproval. Its optional CONTENT_PACK lives in data/docs-v001, separate from business DATA_RELEASE sections. A partner importing business records does not need to install this guide. Axis exposes the documentation profile independently and imports its declared CMS closure plus shared scaffold into WCMS Staged. The functional group provides navigation context without owning a duplicate article body. Follow owner-qualified related references for shared behavior; a reference must not silently install another capability pack or create a second implementation."
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
          "anchor": "location-approval-schema-boundary-common-mistakes"
        },
        {
          "kind": "paragraph",
          "text": "Do not treat generated CRUD as an approval, projection or delivery workflow. Do not infer transitions from status enums, trusted identity from reference objects or automatic synchronization from search metadata. Do not expose a generated route without deployment policy and independent permission. Do not put runtime tenant fields into business records or copy Profile address facts into Location. Complete and test the owning orchestration before claiming operational acceptance."
        }
      ],
      "searchText": "Location Approval Records and Workflow Boundary Location Approval Records and Workflow Boundary: source-backed behavior, ownership, extension, failure handling and acceptance boundaries. # Location Approval Records and Workflow Boundary\n\n## Business purpose and current implementation\n\nBeginner reading path: start with the business purpose, use the diagram to follow the owning boundaries, then compare the contract table with the worked example. Developers should inspect the listed source before extending behavior. An operator should use the verification section to distinguish a source check from an installed operation. The guide labels schema-only behavior explicitly; a record definition is not a completed business workflow.\n\nAn approval request records the review context for a proposed location change. It links a draft, optional target location and reviewer reference with decision, reason and decision evidence. Business readers can distinguish the existence of a request from an authorized approval. The schema contains statuses and decision values, but this module currently has only generated schema operations, an empty dedicated router registry and a sample lifecycle service. It does not yet implement the orchestration that assigns reviewers, enforces separation of duties or applies an approved draft to Location Core.\n\nThe schema is real framework source, not an empty placeholder. Generated service and schemaOperations router metadata may produce operations when a runtime selects the module and permits their exposure. That is different from a completed business workflow. Deployment route categories, independent authorization, runtime persistence and application composition still decide what is available. This guide deliberately documents the implemented record contract and the missing orchestration separately so that a developer or AI tool does not infer a nonexistent workflow from a package name.\n\n```mermaid\nflowchart LR\n  Draft[Exact draft revision] --> Request[Approval request record]\n  Request -. Separate authorized operation required .-> Decision[Reviewer decision]\n  Decision -. Separate apply operation required .-> Core[Canonical Location]\n```\n\n## Record contract and owner responsibilities\n\ndecision and status are separate fields. The schema does not by itself reject a contradictory combination such as an APPROVE decision with a REJECTED status. draftCode and targetLocationCode are plain strings with no refSchema mapping; reviewerRef and decisionEvidence are unrestricted objects. revision is the approval request's revision, not the reviewed draft revision: there is no dedicated draftRevision or expectedDraftRevision field. decidedAt is optional. An implementing operation must authenticate the reviewer, enforce enterprise scope and separation of duties, validate decision/status consistency and preserve an explicit binding to the reviewed draft version in its governed evidence contract. None of those checks is supplied by this schema.\n\n| Field or model | Source contract | Required owner behavior |\n| --- | --- | --- |\n| draftCode | Required string; no refSchema mapping | Resolve the governed draft and bind its reviewed revision separately |\n| decision | Optional APPROVE, REJECT or RETURN | Not proof of a decision transition |\n| status | OPEN, IN_REVIEW, APPROVED, REJECTED, RETURNED, CANCELLED | Schema vocabulary, not a transition engine |\n| revision and correlationId | Request revision defaults to zero; correlationId required | Neither field binds the draft revision or enforces concurrency |\n\n## Customize and extend safely\n\nA partner needs a second-person review before a new collection location becomes available. Prepare a locationDraft first and retain its exact revision. A future or project-owned approval operation can create and assign the request, show a complete review, and accept an authorized decision against that revision. Only the owning Location operation should apply the approved proposal. Until that orchestration is implemented and qualified, an APPROVED value in a manually imported request is not evidence that the location is active or publicly visible.\n\nIllustrative record, not a submission API or an approval: the following includes every required approval-request field. It assumes correction-site-a identifies an existing governed draft. An OPEN request may omit decision, reviewerRef, targetLocationCode and decidedAt. The correlation identifier is for tracing; it neither authenticates a person nor deduplicates a retry.\n\n```json\n{\n  \"code\": \"review-site-a\",\n  \"draftCode\": \"correction-site-a\",\n  \"status\": \"OPEN\",\n  \"revision\": 0,\n  \"correlationId\": \"example-location-review-a\"\n}\n```\n\nA future decision operation must reject a changed draft, an unauthorized reviewer or inconsistent decision/status even if the stored record is structurally valid. On a stale draft, reload the proposal and obtain a fresh review. On an uncertain apply result, inspect the original operation evidence before retrying; setting status to APPROVED cannot complete Location Core persistence.\n\nFor a later-loaded project module named customerLocationExtensions, use modules/customerLocationExtensions/src/schemas/schemas.js for deliberate additive schema changes and modules/customerLocationExtensions/config/properties.js for the existing schemaPolicies.locationApproval.operational.accessGroups policy. Register and select that module through the normal module graph. These are existing layering mechanisms, not switches that create a missing workflow. Any new business orchestration belongs in that project's loader-visible src/service files with its own secured route and contracts; it is new implementation requiring qualification. Keep customer records in the project business release and documentation in its docs-v001 pack. Preserve framework field meanings, Profile authority, trusted tenant context and canonical capability ownership.\n\nBefore exposing a new operation, record its business outcome, complete payload, identity source, permission, expected-revision rule and recovery behavior. Use existing loader-composed services and configuration, including remote-service boundaries when Location is deployed standalone. Do not assume Profile, Process or Search lives in the same process. No request-body field may choose another tenant, provider or arbitrary service. A schema extension should preserve existing field meaning and compatibility; a breaking lifecycle or reference change requires deliberate migration evidence, not an unreviewed import overwrite.\n\n## Verification and failure handling\n\nBuild tests at the actual boundary. First inspect generated descriptor and schema validation for required fields, allowed status values and reference shapes. Then test any newly implemented business operation for denied permission, wrong enterprise, stale revision, missing target, malformed nested data and an interrupted acknowledgement. Finally prove installed import, correct exposure and signed-in behavior. There is no dedicated completed orchestration test suite in this module today; sample init success must never be counted as workflow acceptance. Record that implementation gap explicitly in project readiness decisions.\n\nIf a record appears in storage but the intended journey is unavailable, inspect the effective module graph, generated-service availability, route exposure and owning behavior before changing data. If a proposal or projection is stale, compare original source and current revision; do not mark it CURRENT or APPROVED merely to clear a dashboard. Never retry an uncertain business mutation without inspecting its original evidence through the owner. A source hash, timestamp or schema status is not an authorization token. Keep private review evidence out of public documentation and retain only privacy-safe identifiers in operational diagnostics.\n\n## Documentation selection assets and acceptance\n\nPartner extension guidance: select this capability through the existing module graph and use later project configuration or a loader-visible service extension for an intentional difference. Preserve its canonical identity, independent authorization, bounded inputs and original evidence. Add a focused regression for the changed policy and run the inherited owner tests. Do not fork the framework guide into another module merely to customize branding; reference it from a project guide that explains only the real difference.\n\nThis guide is canonical CMS data owned by locationApproval. Its optional CONTENT_PACK lives in data/docs-v001, separate from business DATA_RELEASE sections. A partner importing business records does not need to install this guide. Axis exposes the documentation profile independently and imports its declared CMS closure plus shared scaffold into WCMS Staged. The functional group provides navigation context without owning a duplicate article body. Follow owner-qualified related references for shared behavior; a reference must not silently install another capability pack or create a second implementation.\n\nImages belong to the same documentation release as their owning Media records and declared asset files. Preserve stable Media codes, release-relative asset paths and checksums. Shared images may stay with the explicitly included documentation foundation; capability-specific images stay with that capability. Diagrams and tables are canonical content blocks, not separate Markdown authoring copies. A new screenshot must be privacy-safe, accessible and traceable to the depicted version. An image is explanatory evidence only, not proof that a runtime operation succeeded.\n\nCanonical authoring begins in DRAFT with an inactive route. After an authorized source editorial review, the owning Component, Node, PageMetadata, SearchMetadata and PublicationState records may move to STAGED and the owning route may be active for subsequent normal publication. STAGED is not approved or published; an active authoring route is only a publication candidate. The release owner must complete release-integrity preparation and validation, governed import, staged inspection and normal owner approvals before publication. Source review does not validate existing checksums, create approval receipts or prove Online delivery or browser acceptance.\n\n## Common mistakes\n\nDo not treat generated CRUD as an approval, projection or delivery workflow. Do not infer transitions from status enums, trusted identity from reference objects or automatic synchronization from search metadata. Do not expose a generated route without deployment policy and independent permission. Do not put runtime tenant fields into business records or copy Profile address facts into Location. Complete and test the owning orchestration before claiming operational acceptance.\n",
      "source": {
        "repository": "nodics.ai",
        "owner": "locationApproval",
        "functionalModule": "nodics.location",
        "technicalModule": "locationApproval",
        "path": "data/docs-v001/records/documentation/locationApprovalDocumentationComponentData.js",
        "sourcePath": "data/docs-v001/records/documentation/locationApprovalDocumentationComponentData.js",
        "checksum": "b9225d586b95d4f3e62a5f65f08afff75a4ae62911543fd9d3e80c3f0755b02b",
        "wordCount": 1424
      },
      "slug": "location-approval-schema-boundary",
      "locale": "en",
      "navigationGroup": "Location Approval",
      "navigationGroupCode": "locationApproval",
      "navigationGroupOrder": 70,
      "navigationOrder": 2004,
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
            "locationApprovalSchemaBoundary-1-business-purpose-and-current-implementation",
            "locationApprovalSchemaBoundary-2-record-contract-and-owner-responsibilities",
            "locationApprovalSchemaBoundary-3-worked-adoption-and-extension-path",
            "locationApprovalSchemaBoundary-4-failure-handling-and-verification",
            "locationApprovalSchemaBoundary-5-documentation-selection-assets-and-acceptance"
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
