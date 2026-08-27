/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync, readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const repositoryRoot = resolve(root, '../..');
const require = createRequire(import.meta.url);
const documentationRecordValidation = require('../../../../nodics.foundation/modules/nTooling/src/service/defaultApplicationDocumentationRecordValidationService.js');

function sha256(value) {
  return createHash('sha256').update(value).digest('hex');
}

function markdownWordCount(value) {
  return (value.match(/\b[\p{L}\p{N}][\p{L}\p{N}'’-]*\b/gu) ?? []).length;
}

function markdownHeadings(value) {
  return value.split(/\r?\n/).flatMap((line) => {
    const match = /^#{2,4}\s+(.+)$/.exec(line.trim());
    return match?.[1] ? [match[1]] : [];
  });
}

function assertDocumentationDepth(source, canonical) {
  const wordCount = markdownWordCount(canonical);
  assert(
    wordCount >= 500,
    `Axis documentation page is too shallow for product documentation: ${source} has ${wordCount} words`,
  );
  const sectionCount = canonical.split(/\r?\n/).filter((line) => /^##\s+/.test(line)).length;
  assert(
    sectionCount >= 5,
    `Axis documentation page needs clearer structure: ${source} has ${sectionCount} top-level sections`,
  );
  assert(
    canonical.includes('## Customize and extend safely'),
    `Missing customization section: ${source}`,
  );
  assert(
    canonical.includes('## Common mistakes'),
    `Missing common-mistakes section: ${source}`,
  );
  assert(
    canonical.includes('## Verification'),
    `Missing verification section: ${source}`,
  );
  assert(
    /\bexample\b/i.test(canonical),
    `Missing practical example language: ${source}`,
  );
  const forbiddenPatterns = [
    /local-archive/i,
    /legacy-repositories/i,
    /nodicsaxis/i,
    /old nodics repository/i,
    /Axis frontend repository as (?:the )?(?:source|owner) of backend data/i,
  ];
  for (const pattern of forbiddenPatterns) {
    assert(!pattern.test(canonical), `Forbidden legacy or ownership wording: ${source}`);
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function dataRecords(relativePath) {
  const moduleValue = await import(resolve(root, relativePath));
  const records = moduleValue.default || moduleValue['module.exports'] || moduleValue;
  return records && typeof records === 'object' ? Object.values(records) : [];
}

const manifestEnvelope = JSON.parse(
  await readFile(resolve(root, 'data/manifest.json'), 'utf8'),
);
const manifest = manifestEnvelope.sections.documentation;
const baseline = manifestEnvelope.sections.axisBaseline;
assert(manifestEnvelope.contractVersion === 2, 'Axis aggregate data manifest contract drifted');
assert(manifestEnvelope.module === 'axis', 'Axis aggregate data manifest owner drifted');
assert(baseline?.kind === 'DATA_RELEASE', 'Axis baseline must remain a named data release');
assert(baseline.dataType === 'init', 'Axis baseline must use governed init execution');
assert(baseline.owningDomain === 'axis', 'Axis baseline ownership drifted');
assert(baseline.lifecycle === 'PUBLISHABLE', 'Axis baseline must remain publishable');
assert(baseline.destinationRole === 'WCMS_STAGED', 'Axis baseline must target WCMS Staged only');
assert(baseline.versioningPolicy === 'IMMUTABLE', 'Axis baseline must retain immutable release identity');
assert(baseline.publicationPolicy === 'REQUIRED', 'Axis baseline must require publication');
assert(baseline.initialPublicationPolicy === 'ADMIN_INITIATED', 'Axis first baseline must remain administrator initiated');
assert(baseline.removalPolicy === 'UNPUBLISH_OR_RETIRE', 'Axis baseline removal must remain explicit');
for (const [relativePath, expectedHash] of Object.entries(baseline.files ?? {})) {
  assert(relativePath.startsWith('init/'), `Axis baseline file must remain under governed init data: ${relativePath}`);
  const absolutePath = resolve(root, 'data', relativePath);
  assert(existsSync(absolutePath), `Axis baseline file is missing: ${relativePath}`);
  assert(sha256(readFileSync(absolutePath)) === expectedHash, `Axis baseline hash mismatch: ${relativePath}`);
  const source = readFileSync(absolutePath, 'utf8');
  assert(!source.includes('nodics.wcms'), `Axis baseline retained obsolete WCMS functional ownership: ${relativePath}`);
  assert(!source.includes('@owner wcms'), `Axis baseline retained obsolete WCMS owner annotation: ${relativePath}`);
}
assert(manifest.pack === 'nodics.platform.axis', 'Axis documentation pack identity drifted');
assert(
  manifest.sourceAuthority === 'docs/catalogue.json',
  'Axis documentation source must be owned by nodics.platform/modules/axis',
);
assert(
  manifest.migrationRegister ===
    'docs/migration-register.json',
  'Axis migration register path drifted',
);
assert(
  Array.isArray(manifest.sites) &&
    manifest.sites.length === 1 &&
    manifest.sites[0] === 'axisDocumentationSite',
  'Axis documentation pack must expose one documentation CMS Site',
);

for (const [relativePath, expectedHash] of Object.entries(manifest.generatedHashes)) {
  const actualHash = sha256(readFileSync(resolve(root, 'data', relativePath)));
  assert(actualHash === expectedHash, `Generated hash mismatch: ${relativePath}`);
}

const releaseChecksum = sha256(
  Object.keys(manifest.generatedHashes)
    .sort()
    .map((fileName) => `${fileName}:${String(manifest.generatedHashes[fileName])}`)
    .join('|'),
);
assert(
  releaseChecksum === manifest.releaseChecksum,
  'Axis documentation release checksum mismatch',
);

const navigation = JSON.parse(
  await readFile(resolve(root, 'docs/catalogue.json'), 'utf8'),
);
const migrationRegister = JSON.parse(
  await readFile(
    resolve(root, 'docs/migration-register.json'),
    'utf8',
  ),
);

const expectedEvidence = navigation.pages.map((page) => page.evidence).sort();
const actualEvidence = migrationRegister.sources.map((source) => source.evidence).sort();
assert(
  JSON.stringify(actualEvidence) === JSON.stringify(expectedEvidence),
  'Axis migration register does not match navigation evidence',
);
assert(navigation.pages.length === expectedEvidence.length, 'Axis page count drifted');

const generatedComponents = await readFile(
  resolve(root, 'data/core/data/documentation/axisDocumentationComponentData.js'),
  'utf8',
);
const siteRecords = await dataRecords(
  'data/core/data/documentation/axisDocumentationSiteData.js',
);
const pageRecords = await dataRecords(
  'data/core/data/documentation/axisDocumentationPageData.js',
);
const productRecords = await dataRecords(
  'data/core/data/documentation/axisDocumentationProductData.js',
);
const accessPolicyRecords = await dataRecords(
  'data/core/data/documentation/axisDocumentationAccessPolicyData.js',
);
const navigationMetadataRecords = await dataRecords(
  'data/core/data/documentation/axisDocumentationNavigationData.js',
);
const dashboardRecords = await dataRecords(
  'data/core/data/documentation/axisDocumentationDashboardData.js',
);
const nodeRecords = await dataRecords(
  'data/core/data/documentation/axisDocumentationNodeData.js',
);
const pageMetadataRecords = await dataRecords(
  'data/core/data/documentation/axisDocumentationPageMetadataData.js',
);
const publicationStateRecords = await dataRecords(
  'data/core/data/documentation/axisDocumentationPublicationStateData.js',
);
const searchMetadataRecords = await dataRecords(
  'data/core/data/documentation/axisDocumentationSearchMetadataData.js',
);
const routeRecords = await dataRecords(
  'data/core/data/documentation/axisDocumentationRouteData.js',
);
const validationReport = documentationRecordValidation.validateRecords({
  records: {
    products: productRecords,
    navigation: navigationMetadataRecords,
    nodes: nodeRecords,
    dashboards: dashboardRecords,
    pages: pageMetadataRecords,
    accessPolicies: accessPolicyRecords,
    publicationStates: publicationStateRecords,
    searchMetadata: searchMetadataRecords,
    cmsPages: pageRecords,
    routes: routeRecords,
    components: await dataRecords('data/core/data/documentation/axisDocumentationComponentData.js'),
    manifestHashes: manifest.generatedHashes || {},
  },
  options: {
    release: manifest.version,
    source: 'nodics.platform/modules/axis/docs/catalogue.json',
    owner: 'nodics.platform.axis',
    generatedAt: '2026-08-26T00:00:00.000Z',
  },
});
documentationRecordValidation.assertReady(validationReport);
await mkdir(resolve(root, 'docs/reports'), { recursive: true });
await writeFile(
  resolve(root, 'docs/reports/axis-documentation-validation-report.json'),
  JSON.stringify(validationReport, null, 2) + '\n',
  'utf8',
);
await writeFile(
  resolve(root, 'docs/reports/axis-documentation-validation-report.md'),
  documentationRecordValidation.formatMarkdown(validationReport),
  'utf8',
);
const siteCodes = new Set(siteRecords.map((site) => site.code));
for (const site of siteRecords) {
  assert(
    site.catalog === 'documentationContentCatalog',
    `Axis documentation site must use documentationContentCatalog: ${site.code}`,
  );
}
assert(productRecords.length === 1, 'Axis documentation must generate one documentation product record');
assert(
  productRecords[0].contentCatalog === 'documentationContentCatalog',
  'Axis documentation product must be content-catalog driven',
);
assert(
  productRecords[0].site === 'axisDocumentationSite',
  'Axis documentation product must point to the Axis documentation site',
);
assert(
  productRecords[0].publicRootPath === '/docs/nodics-axis',
  'Axis documentation product public root path drifted',
);
assert(
  accessPolicyRecords.some(
    (policy) =>
      policy.accessMode === 'PUBLIC' &&
      policy.publiclyAvailable === true &&
      policy.requiresAuthentication === false,
  ),
  'Axis documentation must generate a public access policy',
);
assert(
  accessPolicyRecords.some(
    (policy) =>
      policy.accessMode === 'AUTHENTICATED' &&
      policy.requiresAuthentication === true &&
      Array.isArray(policy.allowedPermissions) &&
      policy.allowedPermissions.includes('axis.documentation.read'),
  ),
  'Axis documentation must generate an authenticated reader access policy',
);
assert(
  navigationMetadataRecords.length === 1 &&
    navigationMetadataRecords[0].renderer === 'documentation.component.navigation' &&
    navigationMetadataRecords[0].expandable === true,
  'Axis documentation navigation metadata must be expandable and renderer-bound',
);
assert(
  dashboardRecords.some((dashboard) => dashboard.ownerType === 'PRODUCT') &&
    dashboardRecords.some((dashboard) => dashboard.ownerType === 'NAVIGATION') &&
    dashboardRecords.every(
      (dashboard) =>
        dashboard.summary &&
        dashboard.contentArea &&
        Array.isArray(dashboard.cards),
    ),
  'Axis documentation must generate hierarchy dashboards with content areas and cards',
);
assert(
  nodeRecords.some((node) => node.code === 'axisDocsNodeRoot') &&
    nodeRecords.some((node) => node.nodeLevel === 'SECTION') &&
    nodeRecords.some((node) => node.nodeLevel === 'GROUP') &&
    nodeRecords.some((node) => node.nodeLevel === 'TOPIC') &&
    nodeRecords.every(
      (node) =>
        node.product === productRecords[0].code &&
        node.navigation === navigationMetadataRecords[0].code &&
        node.nodeSummary &&
        node.nodeContentArea,
    ),
  'Axis documentation must generate editable navigation hierarchy nodes',
);
assert(
  pageMetadataRecords.length === navigation.pages.length &&
    pageMetadataRecords.every(
      (page) =>
        page.product === productRecords[0].code &&
        page.targetPage &&
        page.targetRoute &&
        page.articleComponent &&
        Array.isArray(page.visualRequirements) &&
        page.visualRequirements.length > 0,
    ),
  'Axis documentation must generate page metadata for every authored page',
);
assert(
  publicationStateRecords.length >=
    productRecords.length +
      navigationMetadataRecords.length +
      dashboardRecords.length +
      nodeRecords.length +
      pageMetadataRecords.length,
  'Axis documentation publication state must cover product, navigation, dashboards, nodes, and pages',
);
assert(
  searchMetadataRecords.some((record) => record.targetType === 'PRODUCT') &&
    searchMetadataRecords.some((record) => record.targetType === 'NODE') &&
    searchMetadataRecords.some((record) => record.targetType === 'PAGE') &&
    searchMetadataRecords.every(
      (record) => record.indexState === 'INDEX_READY' && record.searchText,
    ),
  'Axis documentation search metadata must prepare content-catalog projection without owning search rendering',
);
for (const page of pageRecords) {
  const pageSites = Array.isArray(page.cmsSite) ? page.cmsSite : [];
  assert(
    pageSites.length > 0 && pageSites.every((siteCode) => siteCodes.has(siteCode)),
    `Axis documentation page has invalid CMS site ownership: ${page.code}`,
  );
}
for (const route of routeRecords) {
  assert(
    siteCodes.has(route.site),
    `Axis documentation route has invalid CMS site ownership: ${route.code}`,
  );
}
assert(
  generatedComponents.includes("repository: 'nodics.platform'") ||
    generatedComponents.includes('"repository": "nodics.platform"'),
  'Generated Axis documentation records must identify nodics.platform as source repository',
);
assert(
  generatedComponents.includes("module: 'axis'") ||
    generatedComponents.includes('"module": "axis"'),
  'Generated Axis documentation records must identify platform axis module ownership',
);
assert(
  !generatedComponents.includes("repository: 'nodics.axis'") &&
    !generatedComponents.includes('"repository": "nodics.axis"') &&
    !generatedComponents.includes("repository: 'nodics.docs'") &&
    !generatedComponents.includes('"repository": "nodics.docs"'),
  'Generated Axis documentation records must not identify frontend or framework docs packages as data owner',
);

for (const page of navigation.pages) {
  const migration = migrationRegister.sources.find(
    (source) => source.evidence === page.evidence,
  );
  assert(migration, `Missing migration entry for ${page.evidence}`);
  assert(migration.disposition === 'migrated', `Unmigrated Axis page: ${page.source}`);
  assert(
    migration.destinationRoute === page.route,
    `Route mismatch in migration register: ${page.source}`,
  );

  const canonical = await readFile(
    resolve(root, 'docs', page.source),
    'utf8',
  );
  assertDocumentationDepth(page.source, canonical);
  assert(
    markdownWordCount(canonical) >= migration.evidenceWordCount,
    `Axis canonical documentation lost detail: ${page.source}`,
  );
  assert(/^[a-f0-9]{64}$/.test(migration.evidenceHash), `Invalid evidence hash: ${page.source}`);
  assert(
    Array.isArray(migration.evidenceHeadings) && migration.evidenceHeadings.length > 0,
    `Missing evidence headings: ${page.source}`,
  );
  assert(
    migration.wordCount === markdownWordCount(canonical),
    `Word-count drift: ${page.source}`,
  );
  assert(
    JSON.stringify(migration.headings) === JSON.stringify(markdownHeadings(canonical)),
    `Heading drift: ${page.source}`,
  );
  assert(
    generatedComponents.includes(page.title),
    `Generated components do not contain page title: ${page.title}`,
  );
  assert(
    Array.isArray(page.visualRequirements) &&
      page.visualRequirements.length > 0 &&
      page.visualRequirements.every((requirement) => generatedComponents.includes(requirement)),
    `Generated components do not preserve visual requirements: ${page.title}`,
  );
  assert(
    generatedComponents.includes(
      `modules/axis/docs/${page.source}`,
    ),
    `Generated components do not contain platform axis source path: ${page.source}`,
  );
}

const rootDocs = existsSync(resolve(root, 'docs'))
  ? (await readdir(resolve(root, 'docs'))).filter((name) => name.endsWith('.md'))
  : [];
assert(rootDocs.length === 0, 'axis module must not recreate parallel root docs');

console.log(`Validated ${navigation.pages.length} Axis CMS documentation pages`);
