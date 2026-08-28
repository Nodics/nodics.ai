/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve, sep } from 'node:path';
import { createRequire } from 'node:module';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const applicationDocumentationContract = require('../../nodics.foundation/modules/nTooling/src/service/defaultApplicationDocumentationContractService.js');
const documentationRecordValidation = require('../../nodics.foundation/modules/nTooling/src/service/defaultApplicationDocumentationRecordValidationService.js');
const catalogue = JSON.parse(await readFile(resolve(root, 'docs/catalogue.json'), 'utf8'));
const minimumWordCount = 500;
const minimumSectionCount = 5;
const requiredSectionPatterns = [
  ['common mistakes', /^## Common mistakes\b/im],
  ['verification', /^## Verification\b/im],
];

function countWords(body) {
  return (body.match(/\b[\w'.-]+\b/g) ?? []).length;
}

function assertDocumentationDepth(document, body) {
  const wordCount = countWords(body);
  if (wordCount < minimumWordCount) {
    throw new Error(
      `Document is too shallow for beginner documentation: ${document.id} has ${wordCount} words, expected at least ${minimumWordCount}`,
    );
  }

  const sectionCount = (body.match(/^## /gm) ?? []).length;
  if (sectionCount < minimumSectionCount) {
    throw new Error(
      `Document needs more structure: ${document.id} has ${sectionCount} sections, expected at least ${minimumSectionCount}`,
    );
  }

  const hasVisualAid =
    body.includes('```mermaid') || /^!\[.+\]\(.+\)/m.test(body) || /^\| .+ \|$/m.test(body);
  if (!hasVisualAid) {
    throw new Error(
      `Document needs at least one visual aid, table, or diagram: ${document.id}`,
    );
  }

  const audienceChecks = [
    ['beginner', /\bbeginners?\b/i],
    ['business value', /\bbusiness\b/i],
    ['developer guidance', /\bdevelopers?\b/i],
    ['DevOps or operator guidance', /\b(devops|operator|production)\b/i],
  ];
  for (const [label, pattern] of audienceChecks) {
    if (!pattern.test(body)) {
      throw new Error(`Document is missing ${label}: ${document.id}`);
    }
  }

  for (const [label, pattern] of requiredSectionPatterns) {
    if (!pattern.test(body)) {
      throw new Error(`Document is missing required ${label} section: ${document.id}`);
    }
  }

  if (/local-archive|legacy-repositories|nodicsaxis|old nodics repository/i.test(body)) {
    throw new Error(`Document contains legacy migration-only references: ${document.id}`);
  }

  if (/nodics\.axis[^.\n]*(owns|owner|source)[^.\n]*(catalog|site|page|component|route|documentation data)/i.test(body)) {
    throw new Error(`Document suggests frontend-owned backend data: ${document.id}`);
  }
}

if (catalogue.contract !== 'nodics.documentation/v1') {
  throw new Error('Unsupported documentation contract');
}
if (!/^\d+\.\d+\.\d+$/.test(catalogue.release || '')) {
  throw new Error('Documentation release must use semantic versioning');
}
if (!Array.isArray(catalogue.documents) || catalogue.documents.length === 0) {
  throw new Error('Documentation catalogue is empty');
}
applicationDocumentationContract.validateCatalogue({
  ownerRoot: root,
  sourceDirectory: 'docs',
  cataloguePath: 'docs/catalogue.json',
  catalogue: {
    pack: 'nodics.docs',
    version: catalogue.release,
    navigationSections: catalogue.navigationSections,
    documents: catalogue.documents,
  },
  requireNavigationSections: true,
  requireEnterpriseMetadata: true,
  validateContentQuality: true,
});
if (!Array.isArray(catalogue.navigationSections) || catalogue.navigationSections.length === 0) {
  throw new Error('Documentation catalogue requires navigation sections');
}

const ids = new Set();
const sectionCodes = new Set();
const identity = /^[A-Za-z][A-Za-z0-9._-]{0,127}$/;
const allowedDocumentTypes = new Set([
  'overview',
  'concept',
  'quickstart',
  'how-to',
  'configuration',
  'customization',
  'integration',
  'operations',
  'reference',
  'contract',
]);
const allowedMaturityStates = new Set([
  'concept',
  'design-contract',
  'partial',
  'current-read-only',
  'preview-only',
  'unavailable',
  'operational',
]);
const allowedLifecycleStates = new Set([
  'DRAFT',
  'STAGED',
  'REVIEW_IN_PROGRESS',
  'CHANGES_REQUESTED',
  'APPROVED',
  'ONLINE',
  'ARCHIVED',
  'RETIRED',
  'ROLLBACK_PENDING',
  'PUBLICATION_FAILED',
]);
const allowedAccessModes = new Set([
  'PUBLIC',
  'AUTHENTICATED',
  'ROLE_BASED',
  'GROUP_BASED',
  'PERMISSION_BASED',
  'RESTRICTED',
]);

async function loadGeneratedRecords(relativePath) {
  const moduleObject = { exports: {} };
  const source = await readFile(resolve(root, relativePath), 'utf8');
  vm.runInNewContext(source, { module: moduleObject, exports: moduleObject.exports }, {
    filename: relativePath,
    timeout: 1000,
  });
  return Object.values(moduleObject.exports);
}

const siteRecords = await loadGeneratedRecords('data/core-v001/records/documentation/nodicsDocumentationSiteData.js');
const pageRecords = await loadGeneratedRecords('data/core-v001/records/documentation/nodicsDocumentationPageData.js');
const routeRecords = await loadGeneratedRecords('data/core-v001/records/documentation/nodicsDocumentationRouteData.js');
const productRecords = await loadGeneratedRecords('data/core-v001/records/documentation/nodicsDocumentationProductData.js');
const navigationRecords = await loadGeneratedRecords('data/core-v001/records/documentation/nodicsDocumentationNavigationData.js');
const nodeRecords = await loadGeneratedRecords('data/core-v001/records/documentation/nodicsDocumentationNodeData.js');
const dashboardRecords = await loadGeneratedRecords('data/core-v001/records/documentation/nodicsDocumentationDashboardData.js');
const pageMetadataRecords = await loadGeneratedRecords('data/core-v001/records/documentation/nodicsDocumentationPageMetadataData.js');
const accessPolicyRecords = await loadGeneratedRecords('data/core-v001/records/documentation/nodicsDocumentationAccessPolicyData.js');
const publicationStateRecords = await loadGeneratedRecords('data/core-v001/records/documentation/nodicsDocumentationPublicationStateData.js');
const searchMetadataRecords = await loadGeneratedRecords('data/core-v001/records/documentation/nodicsDocumentationSearchMetadataData.js');
const componentRecords = await loadGeneratedRecords('data/core-v001/records/documentation/nodicsDocumentationComponentData.js');
for (const state of publicationStateRecords) {
  for (const field of [
    'onlineVersion',
    'previousOnlineVersion',
    'submittedBy',
    'submittedAt',
    'reviewer',
    'reviewedAt',
    'approver',
    'approvedAt',
    'publisher',
    'publishedAt',
  ]) {
    if (state[field] === null) {
      throw new Error(`Publication state ${state.code} must omit optional string field ${field} instead of storing null`);
    }
  }
}
const manifestEnvelope = JSON.parse(await readFile(resolve(root, 'data/manifest.json'), 'utf8'));
const validationReport = documentationRecordValidation.validateRecords({
  records: {
    products: productRecords,
    navigation: navigationRecords,
    nodes: nodeRecords,
    dashboards: dashboardRecords,
    pages: pageMetadataRecords,
    accessPolicies: accessPolicyRecords,
    publicationStates: publicationStateRecords,
    searchMetadata: searchMetadataRecords,
    cmsPages: pageRecords,
    routes: routeRecords,
    components: componentRecords,
    manifestHashes: manifestEnvelope.sections?.documentation?.generatedHashes || {},
  },
  options: {
    release: catalogue.release,
    source: 'nodics.docs/docs/catalogue.json',
    owner: 'nodics.docs',
    generatedAt: '2026-08-26T00:00:00.000Z',
  },
});
documentationRecordValidation.assertReady(validationReport);
await mkdir(resolve(root, 'docs/reports'), { recursive: true });
await writeFile(
  resolve(root, 'docs/reports/framework-documentation-validation-report.json'),
  JSON.stringify(validationReport, null, 2) + '\n',
  'utf8',
);
await writeFile(
  resolve(root, 'docs/reports/framework-documentation-validation-report.md'),
  documentationRecordValidation.formatMarkdown(validationReport),
  'utf8',
);
const siteCodes = new Set(siteRecords.map((site) => site.code));
for (const site of siteRecords) {
  if (site.catalog !== 'documentationContentCatalog') {
    throw new Error(`Framework documentation site must use documentationContentCatalog: ${site.code}`);
  }
}
for (const page of pageRecords) {
  const pageSites = Array.isArray(page.cmsSite) ? page.cmsSite : [];
  if (pageSites.length === 0 || pageSites.some((siteCode) => !siteCodes.has(siteCode))) {
    throw new Error(`Framework documentation page has invalid CMS site ownership: ${page.code}`);
  }
}
for (const route of routeRecords) {
  if (!siteCodes.has(route.site)) {
    throw new Error(`Framework documentation route has invalid CMS site ownership: ${route.code}`);
  }
}
if (productRecords.length !== 1 || productRecords[0].contentCatalog !== 'documentationContentCatalog') {
  throw new Error('Framework documentation product metadata must exist and use documentationContentCatalog');
}
if (navigationRecords.length !== 1 || navigationRecords[0].product !== productRecords[0].code) {
  throw new Error('Framework documentation navigation metadata must belong to the generated product');
}
const nodeCodes = new Set(nodeRecords.map((node) => node.code));
if (!nodeCodes.has('nodicsDocsNodeRoot')) {
  throw new Error('Framework documentation requires a generated root navigation node');
}
for (const section of catalogue.navigationSections) {
  const matchingSectionNode = nodeRecords.find((node) =>
    node.nodeLevel === 'SECTION' &&
    node.nodeTitle === section.title &&
    node.parentNode === 'nodicsDocsNodeRoot'
  );
  if (!matchingSectionNode) {
    throw new Error(`Missing backend documentation section node: ${section.code}`);
  }
  if (!matchingSectionNode.nodeSummary || !matchingSectionNode.nodeContentArea || matchingSectionNode.expandable !== true) {
    throw new Error(`Documentation section node is missing dashboard-ready metadata: ${section.code}`);
  }
}
const metadataByDocumentId = new Map(pageMetadataRecords.map((page) => [page.documentId, page]));
const publicationByTarget = new Map(publicationStateRecords.map((item) => [`${item.targetType}:${item.targetCode}`, item]));
for (const document of catalogue.documents) {
  const metadata = metadataByDocumentId.get(document.id);
  if (!metadata || metadata.product !== productRecords[0].code) {
    throw new Error(`Missing generated documentation page metadata: ${document.id}`);
  }
  if (!metadata.businessSummary || !metadata.technicalSummary || !metadata.sourceChecksum) {
    throw new Error(`Documentation page metadata lacks source-backed summaries: ${document.id}`);
  }
  if (!metadata.accessPolicy || !allowedAccessModes.has(metadata.accessMode || '') || !metadata.lifecycleState) {
    throw new Error(`Documentation page metadata lacks access or lifecycle policy: ${document.id}`);
  }
  if (metadata.accessMode === 'PUBLIC' && metadata.lifecycleState !== 'ONLINE') {
    throw new Error(`Public documentation page metadata must be Online before Nexus visibility: ${document.id}`);
  }
  if (metadata.workflowRequired !== true || !(metadata.workflowTriggers || []).includes('CONTENT_CHANGE')) {
    throw new Error(`Documentation page metadata lacks workflow triggers: ${document.id}`);
  }
  if (
    !Array.isArray(document.visualRequirements) ||
    document.visualRequirements.length === 0 ||
    JSON.stringify(metadata.visualRequirements) !== JSON.stringify(document.visualRequirements)
  ) {
    throw new Error(`Documentation page metadata must preserve visual requirements: ${document.id}`);
  }
  const topicNodes = nodeRecords.filter((node) =>
    node.nodeLevel === 'TOPIC' &&
    node.targetDocumentationPage === metadata.code &&
    node.targetPage === metadata.targetPage &&
    node.targetRoute === metadata.targetRoute
  );
  if (topicNodes.length !== 1) {
    throw new Error(`Documentation page must belong to exactly one topic node: ${document.id}`);
  }
  const topicNode = topicNodes[0];
  if (!topicNode.accessPolicy || topicNode.workflowRequired !== true || !(topicNode.workflowTriggers || []).includes('NAVIGATION_CHANGE')) {
    throw new Error(`Documentation topic node lacks access policy or workflow triggers: ${document.id}`);
  }
  if (!publicationByTarget.has(`PAGE:${metadata.code}`)) {
    throw new Error(`Documentation page lacks publication state: ${document.id}`);
  }
  if (!searchMetadataRecords.some((item) => item.targetType === 'PAGE' && item.targetCode === metadata.code && item.accessPolicy && item.lifecycleState === metadata.lifecycleState)) {
    throw new Error(`Documentation page lacks search metadata visibility policy: ${document.id}`);
  }
}
for (const dashboard of dashboardRecords) {
  if (!dashboard.summary || !dashboard.contentArea || !Array.isArray(dashboard.cards)) {
    throw new Error(`Documentation dashboard must expose summary cards and content area: ${dashboard.code}`);
  }
  if (dashboard.workflowRequired !== true || !(dashboard.workflowTriggers || []).includes('DASHBOARD_CHANGE')) {
    throw new Error(`Documentation dashboard changes must trigger workflow: ${dashboard.code}`);
  }
  if (!publicationByTarget.has(`DASHBOARD:${dashboard.code}`)) {
    throw new Error(`Documentation dashboard lacks publication state: ${dashboard.code}`);
  }
}
for (const policy of accessPolicyRecords) {
  if (!allowedAccessModes.has(policy.accessMode || '') || !Array.isArray(policy.lifecycleVisibility)) {
    throw new Error(`Invalid documentation access policy: ${policy.code}`);
  }
  if (policy.accessMode === 'PUBLIC' && (policy.publiclyAvailable !== true || policy.requiresAuthentication !== false)) {
    throw new Error(`Public documentation access policy must be anonymous-readable: ${policy.code}`);
  }
  if (policy.accessMode !== 'PUBLIC' && policy.publiclyAvailable === true) {
    throw new Error(`Restricted documentation access policy cannot be public: ${policy.code}`);
  }
  if (policy.workflowRequired !== true || !(policy.workflowTriggers || []).includes('ACCESS_POLICY_CHANGE')) {
    throw new Error(`Documentation access policy changes must trigger workflow: ${policy.code}`);
  }
}
for (const publicationState of publicationStateRecords) {
  if (!allowedLifecycleStates.has(publicationState.lifecycleState || '') || !publicationState.checksum) {
    throw new Error(`Invalid documentation publication state: ${publicationState.code}`);
  }
  if (publicationState.workflowRequired !== true || !Array.isArray(publicationState.workflowTriggers) || publicationState.workflowTriggers.length === 0) {
    throw new Error(`Documentation publication state lacks workflow triggers: ${publicationState.code}`);
  }
  if (!publicationState.decisionPolicy || publicationState.decisionPolicy.permissionEnforced !== true || publicationState.decisionPolicy.adminOverrideAudited !== true) {
    throw new Error(`Documentation publication state lacks decision audit policy: ${publicationState.code}`);
  }
  if (!publicationState.validationResult || publicationState.validationResult.publicationPath !== 'STAGED_REVIEW_APPROVAL_ONLINE') {
    throw new Error(`Documentation publication state must preserve Staged review approval Online path: ${publicationState.code}`);
  }
  if (!Object.prototype.hasOwnProperty.call(publicationState, 'author') ||
      !Object.prototype.hasOwnProperty.call(publicationState, 'reviewer') ||
      !Object.prototype.hasOwnProperty.call(publicationState, 'approver') ||
      !Object.prototype.hasOwnProperty.call(publicationState, 'publisher')) {
    throw new Error(`Documentation publication state lacks actor evidence fields: ${publicationState.code}`);
  }
}
for (const searchMetadata of searchMetadataRecords) {
  if (!searchMetadata.searchText || searchMetadata.indexState !== 'INDEX_READY') {
    throw new Error(`Invalid documentation search metadata: ${searchMetadata.code}`);
  }
  if (!searchMetadata.accessPolicy || !allowedAccessModes.has(searchMetadata.accessMode || '') || !searchMetadata.lifecycleState) {
    throw new Error(`Documentation search metadata lacks access or lifecycle filters: ${searchMetadata.code}`);
  }
  if (!Array.isArray(searchMetadata.keywords) || !searchMetadata.facets || searchMetadata.workflowRequired !== true) {
    throw new Error(`Documentation search metadata must expose keyword, facet, and workflow fields: ${searchMetadata.code}`);
  }
}

for (const section of catalogue.navigationSections) {
  if (!section || !identity.test(section.code || '') || sectionCodes.has(section.code)) {
    throw new Error(`Invalid or duplicate navigation section: ${section && section.code}`);
  }
  sectionCodes.add(section.code);
  if (!section.title || !Number.isInteger(section.order) || !section.summary) {
    throw new Error(`Incomplete navigation section metadata: ${section.code}`);
  }
  if (!allowedAccessModes.has(section.accessMode || '')) {
    throw new Error(`Invalid navigation section access mode: ${section.code}`);
  }
  if (!allowedLifecycleStates.has(section.lifecycleState || '')) {
    throw new Error(`Invalid navigation section lifecycle state: ${section.code}`);
  }
}

for (const document of catalogue.documents) {
  if (!identity.test(document.id || '') || ids.has(document.id)) {
    throw new Error(`Invalid or duplicate document id: ${document.id}`);
  }
  ids.add(document.id);
  if (!identity.test(document.functionalModule || '')) {
    throw new Error(`Invalid functional owner: ${document.id}`);
  }
  if (document.technicalModule && !identity.test(document.technicalModule)) {
    throw new Error(`Invalid technical owner: ${document.id}`);
  }
  if (!document.title || !document.summary || document.locale !== 'en') {
    throw new Error(`Incomplete document metadata: ${document.id}`);
  }
  if (!document.slug || !document.parentId || !Array.isArray(document.hierarchyPath)) {
    throw new Error(`Incomplete hierarchy metadata: ${document.id}`);
  }
  if (!document.navigationSection || !document.navigationGroup || !Number.isInteger(document.navigationOrder)) {
    throw new Error(`Incomplete navigation metadata: ${document.id}`);
  }
  if (!sectionCodes.has(document.navigationSectionCode || '')) {
    throw new Error(`Document references unknown navigation section: ${document.id}`);
  }
  if (!allowedDocumentTypes.has(document.documentType || '')) {
    throw new Error(`Invalid document type: ${document.id}`);
  }
  if (!Array.isArray(document.audience) || document.audience.length === 0) {
    throw new Error(`Document audience is required: ${document.id}`);
  }
  if (!allowedAccessModes.has(document.accessMode || '')) {
    throw new Error(`Invalid access mode: ${document.id}`);
  }
  if (!allowedLifecycleStates.has(document.lifecycleState || '')) {
    throw new Error(`Invalid lifecycle state: ${document.id}`);
  }
  if (!allowedMaturityStates.has(document.maturityState || '')) {
    throw new Error(`Invalid maturity state: ${document.id}`);
  }
  if (!document.sourceOwner || !document.sourcePath) {
    throw new Error(`Source metadata is required: ${document.id}`);
  }
  if (
    document.route &&
    !/^\/docs\/framework(?:\/[a-z0-9-]+)*$/.test(document.route)
  ) {
    throw new Error(`Invalid framework documentation route: ${document.id}`);
  }
  const contentPath = resolve(root, document.content || '');
  if (!contentPath.startsWith(root + sep)) {
    throw new Error(`Content escapes package root: ${document.id}`);
  }
  await access(contentPath);
  const body = await readFile(contentPath, 'utf8');
  if (!body.trim().startsWith('# ')) {
    throw new Error(`Document must start with one title: ${document.id}`);
  }
  assertDocumentationDepth(document, body);
}

console.log(
  `Validated ${catalogue.documents.length} framework documentation documents for release ${catalogue.release}`,
);
