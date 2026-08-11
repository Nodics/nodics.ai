import { access, readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { dirname, resolve, sep } from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const catalogue = JSON.parse(await readFile(resolve(root, 'catalogue.json'), 'utf8'));
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

const ids = new Set();
const identity = /^[A-Za-z][A-Za-z0-9._-]{0,127}$/;

async function loadGeneratedRecords(relativePath) {
  const moduleObject = { exports: {} };
  const source = await readFile(resolve(root, relativePath), 'utf8');
  vm.runInNewContext(source, { module: moduleObject, exports: moduleObject.exports }, {
    filename: relativePath,
    timeout: 1000,
  });
  return Object.values(moduleObject.exports);
}

const siteRecords = await loadGeneratedRecords('data/core/data/documentation/nodicsDocumentationSiteData.js');
const pageRecords = await loadGeneratedRecords('data/core/data/documentation/nodicsDocumentationPageData.js');
const routeRecords = await loadGeneratedRecords('data/core/data/documentation/nodicsDocumentationRouteData.js');
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
  document.sha256 = createHash('sha256').update(body).digest('hex');
}

console.log(
  `Validated ${catalogue.documents.length} framework documentation documents for release ${catalogue.release}`,
);
