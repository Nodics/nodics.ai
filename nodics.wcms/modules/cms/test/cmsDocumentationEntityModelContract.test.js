/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module cms/test/cmsDocumentationEntityModelContract
 * @description Validates the CMS-owned documentation product, hierarchy, access, publication-state, and search-metadata schema foundation.
 * @layer test
 * @owner cms
 * @override Extend when documentation management adds validation, publishing, indexing, or Axis authoring contracts.
 */
const assert = require("assert");
const schemas = require("../src/schemas/schemas").cms;

const documentationSchemas = [
  "cmsDocumentationProduct",
  "cmsDocumentationNavigation",
  "cmsDocumentationNode",
  "cmsDocumentationPage",
  "cmsDocumentationDashboard",
  "cmsDocumentationTemplate",
  "cmsDocumentationAccessPolicy",
  "cmsDocumentationPublicationState",
  "cmsDocumentationSearchMetadata",
];

documentationSchemas.forEach((schemaName) => {
  assert(schemas[schemaName], schemaName + " must be a first-class CMS schema");
  assert.strictEqual(schemas[schemaName].model, true);
  assert.strictEqual(schemas[schemaName].service.enabled, true);
  assert.strictEqual(schemas[schemaName].router.enabled, true);
  assert.strictEqual(
    schemas[schemaName].isVersionedEnabled,
    false,
    schemaName + " stays non-versioned until documentation publication opts into versioned authoring",
  );
});

assert(schemas.cmsPage, "Documentation rendering must keep using CMS pages");
assert(schemas.cmsPageRoute, "Documentation rendering must keep using CMS routes");
assert(schemas.cmsComponent, "Documentation rendering must keep using CMS components");
assert(
  !schemas.cmsDocumentationRenderer,
  "Documentation schemas must not introduce a second renderer authority",
);

assert.deepStrictEqual(
  schemas.cmsDocumentationProduct.refSchema.contentCatalog,
  {
    enabled: true,
    schemaName: "catalog",
    type: "one",
    propertyName: "code",
    searchEnabled: true,
  },
);
assert.strictEqual(
  schemas.cmsDocumentationProduct.definition.contentCatalog.description.includes(
    "CONTENT catalog",
  ),
  true,
);
assert.strictEqual(
  schemas.cmsDocumentationProduct.definition.publicRootPath.description.includes(
    "Absolute public root route",
  ),
  true,
);

assert.deepStrictEqual(schemas.cmsDocumentationNode.definition.nodeLevel.enum, [
  "SECTION",
  "GROUP",
  "SUBGROUP",
  "TOPIC",
  "PAGE_LINK",
]);
assert.deepStrictEqual(schemas.cmsDocumentationNode.definition.nodeType.enum, [
  "CONTAINER",
  "PAGE",
  "ROUTE",
  "EXTERNAL",
]);
assert.strictEqual(
  schemas.cmsDocumentationNode.definition.nodeSummary.required,
  true,
  "Every hierarchy level must have landing-summary content",
);
assert.strictEqual(
  schemas.cmsDocumentationNode.definition.nodeContentArea.type,
  "object",
);
assert.strictEqual(
  schemas.cmsDocumentationNode.definition.expandable.default,
  true,
);
assert.strictEqual(
  schemas.cmsDocumentationNavigation.definition.managedInAxis.default,
  true,
);
assert.deepStrictEqual(
  schemas.cmsDocumentationNavigation.definition.workflowTriggers.default,
  ["NAVIGATION_CHANGE"],
);
assert.strictEqual(
  schemas.cmsDocumentationNode.refSchema.targetDocumentationPage.schemaName,
  "cmsDocumentationPage",
);
assert.strictEqual(
  schemas.cmsDocumentationNode.refSchema.targetPage.schemaName,
  "cmsPage",
);
assert.strictEqual(
  schemas.cmsDocumentationNode.refSchema.targetRoute.schemaName,
  "cmsPageRoute",
);

assert.strictEqual(
  schemas.cmsDocumentationPage.search.idPropertyName,
  "documentId",
);
assert.strictEqual(
  schemas.cmsDocumentationPage.definition.documentId.description.includes(
    "must not encode a file path",
  ),
  true,
);
assert.strictEqual(
  schemas.cmsDocumentationPage.definition.summary.description.includes(
    "Detailed page summary",
  ),
  true,
);
assert.strictEqual(
  schemas.cmsDocumentationPage.definition.businessSummary.type,
  "string",
);
assert.strictEqual(
  schemas.cmsDocumentationPage.definition.technicalSummary.type,
  "string",
);
assert.strictEqual(
  schemas.cmsDocumentationPage.refSchema.articleComponent.schemaName,
  "cmsComponent",
);
assert.strictEqual(
  schemas.cmsDocumentationPage.definition.diagrams.type,
  "array",
);
assert.strictEqual(
  schemas.cmsDocumentationPage.definition.visualAssets.type,
  "array",
);
assert.strictEqual(
  schemas.cmsDocumentationPage.definition.visualRequirements.type,
  "array",
);
assert.strictEqual(
  schemas.cmsDocumentationPage.definition.visualRequirements.required,
  true,
);
assert.strictEqual(
  schemas.cmsDocumentationNode.definition.managedInAxis.default,
  true,
);
assert.deepStrictEqual(
  schemas.cmsDocumentationNode.definition.workflowTriggers.default,
  ["NAVIGATION_CHANGE", "DASHBOARD_CHANGE", "ACCESS_POLICY_CHANGE"],
);
assert.deepStrictEqual(
  schemas.cmsDocumentationPage.definition.workflowTriggers.default,
  ["CONTENT_CHANGE", "ACCESS_POLICY_CHANGE", "SOURCE_EVIDENCE_CHANGE"],
);

assert.deepStrictEqual(
  schemas.cmsDocumentationDashboard.definition.ownerType.enum,
  ["PRODUCT", "NAVIGATION", "SECTION", "GROUP", "SUBGROUP", "TOPIC"],
);
assert.strictEqual(
  schemas.cmsDocumentationDashboard.definition.summary.description.includes(
    "child navigation",
  ),
  true,
);
assert.deepStrictEqual(
  schemas.cmsDocumentationDashboard.definition.workflowTriggers.default,
  ["DASHBOARD_CHANGE"],
);

["PUBLIC", "AUTHENTICATED", "ROLE_BASED", "GROUP_BASED", "PERMISSION_BASED", "RESTRICTED"].forEach((mode) => {
  assert(schemas.cmsDocumentationProduct.definition.accessMode.enum.includes(mode));
  assert(schemas.cmsDocumentationNode.definition.accessMode.enum.includes(mode));
  assert(schemas.cmsDocumentationPage.definition.accessMode.enum.includes(mode));
  assert(schemas.cmsDocumentationDashboard.definition.accessMode.enum.includes(mode));
  assert(schemas.cmsDocumentationAccessPolicy.definition.accessMode.enum.includes(mode));
  assert(schemas.cmsDocumentationSearchMetadata.definition.accessMode.enum.includes(mode));
});

[
  "DRAFT",
  "STAGED",
  "REVIEW_IN_PROGRESS",
  "CHANGES_REQUESTED",
  "APPROVED",
  "REJECTED",
  "ONLINE",
  "ARCHIVED",
  "RETIRED",
  "ROLLBACK_PENDING",
  "PUBLICATION_FAILED",
].forEach((state) => {
  assert(schemas.cmsDocumentationProduct.definition.lifecycleState.enum.includes(state));
  assert(schemas.cmsDocumentationNode.definition.lifecycleState.enum.includes(state));
  assert(schemas.cmsDocumentationPage.definition.lifecycleState.enum.includes(state));
  assert(schemas.cmsDocumentationPublicationState.definition.lifecycleState.enum.includes(state));
  assert(schemas.cmsDocumentationSearchMetadata.definition.lifecycleState.enum.includes(state));
});

["IMPLEMENTED", "REFERENCE", "PLANNED", "ROADMAP"].forEach((state) => {
  assert(schemas.cmsDocumentationProduct.definition.maturityState.enum.includes(state));
  assert(schemas.cmsDocumentationNode.definition.maturityState.enum.includes(state));
  assert(schemas.cmsDocumentationPage.definition.maturityState.enum.includes(state));
});

assert.strictEqual(
  schemas.cmsDocumentationAccessPolicy.definition.publiclyAvailable.type,
  "bool",
);
assert.strictEqual(
  schemas.cmsDocumentationAccessPolicy.definition.allowedGroups.type,
  "array",
);
assert.strictEqual(
  schemas.cmsDocumentationAccessPolicy.definition.allowedPermissions.type,
  "array",
);
assert.deepStrictEqual(
  schemas.cmsDocumentationAccessPolicy.definition.lifecycleVisibility.default,
  ["ONLINE"],
);
assert.deepStrictEqual(
  schemas.cmsDocumentationAccessPolicy.definition.workflowTriggers.default,
  ["ACCESS_POLICY_CHANGE"],
);

assert.deepStrictEqual(
  schemas.cmsDocumentationPublicationState.definition.targetType.enum,
  [
    "PRODUCT",
    "NAVIGATION",
    "NODE",
    "PAGE",
    "DASHBOARD",
    "ROUTE",
    "TEMPLATE",
    "ACCESS_POLICY",
    "SEARCH_METADATA",
  ],
);
assert.strictEqual(
  schemas.cmsDocumentationPublicationState.definition.publicationCode.description.includes(
    "nPublish",
  ),
  true,
);
assert.deepStrictEqual(
  schemas.cmsDocumentationPublicationState.definition.workflowTriggers.default,
  ["CONTENT_CHANGE", "NAVIGATION_CHANGE", "DASHBOARD_CHANGE", "ACCESS_POLICY_CHANGE"],
);
assert.strictEqual(
  schemas.cmsDocumentationPublicationState.definition.decisionPolicy.type,
  "object",
);
["author", "submittedBy", "reviewer", "approver", "publisher", "auditTrail"].forEach((field) => {
  assert(
    schemas.cmsDocumentationPublicationState.definition[field],
    "Publication state must retain workflow evidence field: " + field,
  );
});

assert.strictEqual(
  schemas.cmsDocumentationSearchMetadata.definition.searchText.description.includes(
    "external index projection",
  ),
  true,
);
assert.deepStrictEqual(
  schemas.cmsDocumentationSearchMetadata.definition.indexState.enum,
  ["NOT_INDEXED", "INDEX_READY", "INDEXED", "INDEX_FAILED"],
);
assert.strictEqual(
  schemas.cmsDocumentationSearchMetadata.definition.indexState.description.includes(
    "without making Elasticsearch the source of truth",
  ),
  true,
);
assert.deepStrictEqual(
  schemas.cmsDocumentationSearchMetadata.definition.workflowTriggers.default,
  ["SEARCH_METADATA_CHANGE"],
);

console.log("CMS documentation entity model contract validated");
