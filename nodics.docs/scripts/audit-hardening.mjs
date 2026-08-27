/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const docsRoot = resolve(scriptDir, '..');
const repoRoot = resolve(docsRoot, '..');
const cataloguePath = join(docsRoot, 'docs/catalogue.json');
const catalogue = JSON.parse(readFileSync(cataloguePath, 'utf8'));

const allowedAccessModes = new Set(['PUBLIC', 'AUTHENTICATED', 'ROLE_BASED', 'GROUP_BASED', 'PERMISSION_BASED', 'RESTRICTED']);
const expectedGeneratedFiles = [
  'data/core/data/documentation/nodicsDocumentationSiteData.js',
  'data/core/data/documentation/nodicsDocumentationProductData.js',
  'data/core/data/documentation/nodicsDocumentationAccessPolicyData.js',
  'data/core/data/documentation/nodicsDocumentationNavigationData.js',
  'data/core/data/documentation/nodicsDocumentationDashboardData.js',
  'data/core/data/documentation/nodicsDocumentationNodeData.js',
  'data/core/data/documentation/nodicsDocumentationPageMetadataData.js',
  'data/core/data/documentation/nodicsDocumentationPublicationStateData.js',
  'data/core/data/documentation/nodicsDocumentationSearchMetadataData.js',
  'data/core/data/documentation/nodicsDocumentationComponentData.js',
  'data/core/data/documentation/nodicsDocumentationPageData.js',
  'data/core/data/documentation/nodicsDocumentationRouteData.js',
  'data/core/headers/nodicsDocumentationContentPackHeader.js'
];
const requiredCoverageTerms = [
  'Product Catalog and Discovery',
  'Base Commerce',
  'Cart and Checkout',
  'Pricing, Promotions, and Tax',
  'Inventory and Stock Management',
  'Order Management',
  'Payments',
  'Shipping and Fulfillment',
  'Returns, Refunds, and Cancellations',
  'Commerce Enterprise Operations',
  'Search and Discovery Providers',
  'WCMS Commerce References',
  'WCMS and Content Management',
  'CMS Entity Model',
  'Content Publication Lifecycle',
  'Media Management and Asset Delivery',
  'Localization and Internationalization',
  'Customer Identity and Profile',
  'Enterprise, Tenant, Group, Role, and Permission Management',
  'Customer Engagement',
  'Customer Feedback',
  'Customer Reviews',
  'Communication and Notification Templates',
  'Import, Export, and Migration',
  'Channel and Store Management',
  'Point of Service and Warehouse Management',
  'Coupon and Promotion Budget Governance',
  'Tax Policy and Decision Evidence',
  'Order History and Checkpoints',
  'Payment Reconciliation',
  'Consignments and Exceptions',
  'Return Receipts and Reversal Calculations',
  'Discovery Rules and Ranking',
  'Discovery Sources and Field Mappings',
  'Editorial Content',
  'Editorial Publication',
  'Contact Operations',
  'Engagement Automation',
  'Testimonials',
  'Tracking Events and Analytics Capture',
  'Process Workflows',
  'Cron and Scheduled Automation',
  'Data Installation and Seed Packs',
  'Routing and API Governance',
  'Accelerators and Industry Templates',
  'Agora Apparel',
  'Agora Electronics',
  'Agora Telco',
  'TEE Solution Use Case',
  'DEAP Solution Use Case',
  'Reference Source Map and Glossary'
];

function fail(message) {
  throw new Error(message);
}

function loadGeneratedRecords(relativePath) {
  const moduleObject = { exports: {} };
  const source = readFileSync(join(docsRoot, relativePath), 'utf8');
  vm.runInNewContext(source, { module: moduleObject, exports: moduleObject.exports }, { filename: relativePath, timeout: 1000 });
  return Object.values(moduleObject.exports);
}

function walk(folder, predicate, results = []) {
  if (!existsSync(folder)) return results;
  for (const name of readdirSync(folder)) {
    const next = join(folder, name);
    if (next.includes('/node_modules/')) continue;
    const stat = statSync(next);
    if (stat.isDirectory()) walk(next, predicate, results);
    else if (predicate(next)) results.push(next);
  }
  return results;
}

function wordCount(value) {
  return String(value || '').trim().split(/\s+/).filter(Boolean).length;
}

function hasVisualEvidence(body) {
  return body.includes('```mermaid') || /^\| .+ \|$/m.test(body) || /^!\[.+\]\(.+\)/m.test(body);
}

function assertCatalogueShape() {
  const ids = new Set();
  const slugs = new Set();
  const contentPaths = new Set();
  const docsBySection = new Map();
  for (const document of catalogue.documents || []) {
    if (ids.has(document.id)) fail(`Duplicate document id: ${document.id}`);
    if (slugs.has(document.slug)) fail(`Duplicate document slug: ${document.slug}`);
    if (contentPaths.has(document.content)) fail(`Duplicate content path: ${document.content}`);
    ids.add(document.id);
    slugs.add(document.slug);
    contentPaths.add(document.content);
    docsBySection.set(document.navigationSectionCode, (docsBySection.get(document.navigationSectionCode) || 0) + 1);
    if (!Array.isArray(document.hierarchyPath) || document.hierarchyDepth !== document.hierarchyPath.length) fail(`Invalid hierarchy path: ${document.id}`);
    if (!allowedAccessModes.has(document.accessMode)) fail(`Invalid access mode: ${document.id}`);
    if (!Array.isArray(document.relatedPages) || !Array.isArray(document.sourceEvidence)) fail(`Missing related/source metadata: ${document.id}`);
    for (const relatedPage of document.relatedPages) if (!ids.has(relatedPage) && !(catalogue.documents || []).some(item => item.id === relatedPage)) fail(`Unknown related page ${relatedPage} in ${document.id}`);
    const bodyPath = join(docsRoot, document.content);
    if (!existsSync(bodyPath)) fail(`Missing page content: ${document.content}`);
    const body = readFileSync(bodyPath, 'utf8');
    if (!body.startsWith('# ')) fail(`Page does not start with one H1: ${document.id}`);
    if (wordCount(body) < 500) fail(`Page is too shallow: ${document.id}`);
    if ((body.match(/^## /gm) || []).length < 5) fail(`Page lacks section depth: ${document.id}`);
    if (!hasVisualEvidence(body)) fail(`Page lacks visual evidence: ${document.id}`);
    if (!/\bbusiness\b/i.test(body) || !/\bdevelopers?\b/i.test(body) || !/\b(beginner|beginners)\b/i.test(body) || !/\b(operator|production|devops)\b/i.test(body)) fail(`Page lacks audience balance: ${document.id}`);
    if (!(/\bbusiness\b/i.test(body) && /\b(problem|context|solves|value|journey|decision)\b/i.test(body))) fail(`Page lacks business problem/context: ${document.id}`);
    if (!/(customization and extension|customization model|developer journey|extension guidance|customize|extension)/i.test(body)) fail(`Page lacks customization or extension guidance: ${document.id}`);
    if ((document.visualRequirements || []).includes('configuration-table') && !/\bconfiguration\b/i.test(body)) fail(`Configuration-topic page lacks configuration behavior detail: ${document.id}`);
    if (!/^## Common mistakes\b/im.test(body) || !/^## Verification\b/im.test(body)) fail(`Page lacks common mistakes or verification: ${document.id}`);
  }
  for (const section of catalogue.navigationSections || []) {
    if (!docsBySection.has(section.code)) fail(`Navigation section has no pages: ${section.code}`);
  }
}

function assertGeneratedData() {
  const manifest = JSON.parse(readFileSync(join(docsRoot, 'data/manifest.json'), 'utf8'));
  const hashes = (((manifest.sections || {}).documentation || {}).generatedHashes) || {};
  for (const file of expectedGeneratedFiles) {
    if (!existsSync(join(docsRoot, file))) fail(`Missing generated data file: ${file}`);
    const manifestKey = file.startsWith('data/') ? file.slice('data/'.length) : file;
    if (!hashes[manifestKey]) fail(`Generated data file missing manifest checksum: ${file}`);
  }
  const nodes = loadGeneratedRecords('data/core/data/documentation/nodicsDocumentationNodeData.js');
  const dashboards = loadGeneratedRecords('data/core/data/documentation/nodicsDocumentationDashboardData.js');
  const publications = loadGeneratedRecords('data/core/data/documentation/nodicsDocumentationPublicationStateData.js');
  const search = loadGeneratedRecords('data/core/data/documentation/nodicsDocumentationSearchMetadataData.js');
  const pages = loadGeneratedRecords('data/core/data/documentation/nodicsDocumentationPageMetadataData.js');
  const policies = loadGeneratedRecords('data/core/data/documentation/nodicsDocumentationAccessPolicyData.js');
  if (!nodes.every(node => node.expandable === true || node.nodeLevel === 'TOPIC')) fail('Container navigation nodes must be expandable');
  if (!nodes.every(node => node.nodeSummary && node.nodeContentArea)) fail('Every navigation node requires summary and content-area metadata');
  if (!nodes.every(node => node.accessPolicy && node.workflowRequired === true && Array.isArray(node.workflowTriggers) && node.workflowTriggers.length)) fail('Every navigation node requires access policy and workflow triggers');
  if (!dashboards.every(dashboard => dashboard.summary && dashboard.contentArea && Array.isArray(dashboard.cards))) fail('Dashboard records require summary, content area, and cards');
  if (!dashboards.every(dashboard => dashboard.accessPolicy && dashboard.workflowRequired === true && (dashboard.workflowTriggers || []).includes('DASHBOARD_CHANGE'))) fail('Dashboard records require access policy and dashboard workflow trigger');
  if (!pages.every(page => page.accessPolicy && page.workflowRequired === true && (page.workflowTriggers || []).includes('CONTENT_CHANGE') && page.searchMetadata)) fail('Page metadata records require access, workflow, and search linkage');
  if (!policies.every(policy => policy.workflowRequired === true && (policy.workflowTriggers || []).includes('ACCESS_POLICY_CHANGE'))) fail('Access policies must trigger documentation workflow');
  if (!policies.every(policy => policy.accessMode !== 'PUBLIC' || (policy.publiclyAvailable === true && policy.requiresAuthentication === false && policy.lifecycleVisibility.includes('ONLINE')))) fail('Public policies must be anonymous-readable and Online-only');
  if (!publications.every(item => item.lifecycleState && item.checksum && item.workflowRequired === true && item.decisionPolicy && item.decisionPolicy.permissionEnforced === true && item.decisionPolicy.adminOverrideAudited === true)) fail('Publication state records require lifecycle, checksum, workflow, and decision audit policy');
  if (!publications.every(item => item.validationResult && item.validationResult.publicationPath === 'STAGED_REVIEW_APPROVAL_ONLINE' && Object.prototype.hasOwnProperty.call(item, 'author') && Object.prototype.hasOwnProperty.call(item, 'reviewer') && Object.prototype.hasOwnProperty.call(item, 'approver') && Object.prototype.hasOwnProperty.call(item, 'publisher'))) fail('Publication state records require actor evidence and Staged review approval Online path');
  if (!search.every(item => item.searchText && item.indexState === 'INDEX_READY' && item.accessPolicy && item.lifecycleState && Array.isArray(item.keywords) && item.facets && item.workflowRequired === true)) fail('Search metadata must be index-ready with access, lifecycle, keywords, facets, and workflow metadata');
  for (const page of pages) {
    const topicNodes = nodes.filter(node => node.nodeLevel === 'TOPIC' && node.targetDocumentationPage === page.code);
    if (topicNodes.length !== 1) fail(`Page must belong to exactly one topic node: ${page.documentId}`);
  }
}

function assertValidationReports() {
  const jsonPath = join(docsRoot, 'docs/reports/framework-documentation-validation-report.json');
  const markdownPath = join(docsRoot, 'docs/reports/framework-documentation-validation-report.md');
  if (!existsSync(jsonPath) || !existsSync(markdownPath)) fail('Documentation validation reports must be exported as JSON and Markdown');
  const report = JSON.parse(readFileSync(jsonPath, 'utf8'));
  if (report.contract !== 'nodics.documentation.validation/v1') fail('Validation report contract drifted');
  if (report.summary.readinessStatus !== 'READY' || report.summary.errors !== 0) fail('Validation report must be ready with zero blocking errors');
  for (const category of ['hierarchy', 'access', 'lifecycle', 'rendering', 'search', 'sourceEvidence']) {
    if (!report.categories[category]) fail(`Validation report missing category: ${category}`);
  }
  if (!/^[a-f0-9]{64}$/.test(report.integrity && report.integrity.checksum || '')) fail('Validation report integrity checksum is invalid');
  const markdown = readFileSync(markdownPath, 'utf8');
  if (!markdown.includes('Readiness Status: READY') || !markdown.includes('| Category | Errors | Warnings | Infos |')) {
    fail('Markdown validation report must expose readiness and category summary');
  }
}

function assertSourceEvidence() {
  for (const document of catalogue.documents || []) {
    for (const evidence of document.sourceEvidence || []) {
      if (/^https?:\/\//.test(evidence)) continue;
      const resolved = resolve(docsRoot, evidence);
      if (!existsSync(resolved)) fail(`Missing source evidence for ${document.id}: ${evidence}`);
    }
  }
}

function assertCoverageMap() {
  const glossary = readFileSync(join(docsRoot, 'docs/pages/reference/source-map-glossary.md'), 'utf8');
  if (!glossary.includes('## Business Capability Coverage Map')) fail('Missing business capability coverage map');
  for (const term of requiredCoverageTerms) {
    if (!glossary.includes(term)) fail(`Coverage map is missing ${term}`);
  }
  const rows = glossary.split('\n').filter(line => /^\| \d+ \|/.test(line));
  if (rows.length !== requiredCoverageTerms.length) fail(`Coverage map is incomplete: ${rows.length} rows`);
  const teeDeap = readFileSync(join(docsRoot, 'docs/pages/applications/tee-deap-solution-use-cases.md'), 'utf8');
  const normalizedTeeDeap = teeDeap.replace(/\s+/g, ' ');
  if (!normalizedTeeDeap.includes('TEE means Task Execution Engine') || !normalizedTeeDeap.includes('DEAP means Data Engineering and Analytics Platform')) fail('TEE/DEAP definitions are missing');
  if (/not separate framework products/i.test(normalizedTeeDeap) === false) fail('TEE/DEAP must be described as solution use cases');
  const cron = readFileSync(join(docsRoot, 'docs/pages/nodics.process/cronjob-operations.md'), 'utf8');
  const data = readFileSync(join(docsRoot, 'docs/pages/nodics.foundation/data-import-export-migration.md'), 'utf8');
  const discovery = readFileSync(join(docsRoot, 'docs/pages/nodics.discovery/search-indexing-discovery.md'), 'utf8');
  if (!cron.includes('Task Execution Engine')) fail('Cron docs must reference TEE');
  if (!data.includes('Data Engineering and Analytics Platform') || !discovery.includes('Data Engineering and Analytics Platform')) fail('Data and discovery docs must reference DEAP');
}

function assertUnsafeContent() {
  const pageFiles = walk(join(docsRoot, 'docs/pages'), file => file.endsWith('.md'));
  for (const file of pageFiles) {
    const body = readFileSync(file, 'utf8');
    if (/\bPhase\s+\d+\b|future plan|future-plan|roadmap operation/i.test(body)) fail(`Roadmap/phase wording found in ${file}`);
    if (/local-archive|legacy-repositories|nodicsaxis|old nodics repository/i.test(body)) fail(`Legacy-only wording found in ${file}`);
    if (/password\s*[:=]\s*['"][^'"]+['"]|secret\s*[:=]\s*['"][^'"]+['"]|api[_-]?key\s*[:=]\s*['"][^'"]+['"]/i.test(body)) fail(`Unsafe secret-like example found in ${file}`);
    if (/nodics\.axis[^.\n]*(owns|owner|source)[^.\n]*(catalog|site|page|component|route|documentation data)/i.test(body)) fail(`Frontend authority wording found in ${file}`);
  }
}

function assertAgoraReferences() {
  const docsText = walk(join(docsRoot, 'docs/pages'), file => file.endsWith('.md')).map(file => readFileSync(file, 'utf8')).join('\n');
  for (const name of ['nodics.agora.apparel', 'nodics.agora.electronics', 'nodics.agora.telco']) {
    if (!docsText.includes(name)) fail(`Missing accelerator reference: ${name}`);
  }
}

function assertReadmeThinness() {
  const readmes = walk(repoRoot, file => file.endsWith('/README.md'));
  const requiredDeepDocLinks = new Map([
    ['nodics.foundation/modules/nCache/cache/README.md', 'nodics.docs/docs/pages/nodics.foundation/cache-runtime-state.md'],
    ['nodics.foundation/modules/nConfig/README.md', 'nodics.docs/docs/pages/nodics.foundation/runtime-configuration.md'],
    ['nodics.foundation/modules/nData/nImport/import/README.md', 'nodics.docs/docs/pages/nodics.foundation/data-import-export-migration.md'],
    ['nodics.foundation/modules/nDatabase/database/README.md', 'nodics.docs/docs/pages/nodics.foundation/provider-data-access-layer.md'],
    ['nodics.foundation/modules/nRouter/README.md', 'nodics.docs/docs/pages/nodics.foundation/routing-api-governance.md'],
    ['nodics.platform/modules/profile/README.md', 'nodics.docs/docs/pages/nodics.platform/security-identity-access.md'],
    ['nodics.wcms/modules/cms/README.md', 'nodics.docs/docs/pages/nodics.wcms/overview.md'],
    ['nodics.wcms/modules/media/README.md', 'nodics.docs/docs/pages/nodics.wcms/media-management.md'],
    ['nodics.wcms/modules/media/llm/contracts/README.md', 'nodics.docs/docs/pages/nodics.wcms/media-management.md']
  ]);
  const oversized = readmes
    .filter(file => !file.endsWith('/README.md') || true)
    .filter(file => {
      const relative = file.slice(repoRoot.length + 1);
      if (relative === 'README.md' || relative === 'nodics.platform/modules/installer/README.md') return false;
      return wordCount(readFileSync(file, 'utf8')) > 1500;
    });
  if (oversized.length) fail(`README thinness contract failed: ${oversized.map(file => file.slice(repoRoot.length + 1)).join(', ')}`);
  for (const [relative, deepDoc] of requiredDeepDocLinks.entries()) {
    const body = readFileSync(join(repoRoot, relative), 'utf8');
    if (!body.includes('## Documentation')) fail(`README missing Documentation section: ${relative}`);
    if (!body.includes(deepDoc)) fail(`README missing deep documentation link ${deepDoc}: ${relative}`);
  }
  return [];
}

assertCatalogueShape();
assertGeneratedData();
assertValidationReports();
assertSourceEvidence();
assertCoverageMap();
assertUnsafeContent();
assertAgoraReferences();
const oversizedReadmes = assertReadmeThinness();

console.log('Documentation hardening audit passed');
console.log(`Documents: ${catalogue.documents.length}`);
console.log(`Navigation sections: ${catalogue.navigationSections.length}`);
console.log(`Coverage rows: ${requiredCoverageTerms.length}`);
console.log(`Oversized non-exempt READMEs observed: ${oversizedReadmes.length}`);
