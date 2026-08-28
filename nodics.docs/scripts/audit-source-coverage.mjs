/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { dirname, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const docsRoot = resolve(scriptDir, '..');
const frameworkRoot = resolve(docsRoot, '..');
const workspaceRoot = resolve(frameworkRoot, '..');
const checkOnly = process.argv.includes('--check');
const catalogue = JSON.parse(readFileSync(resolve(docsRoot, 'docs/catalogue.json'), 'utf8'));
const reportJsonPath = resolve(docsRoot, 'docs/reports/source-backed-documentation-coverage-report.json');
const reportMarkdownPath = resolve(docsRoot, 'docs/reports/source-backed-documentation-coverage-report.md');
const ignoredSegments = new Set(['.git', 'node_modules', 'coverage', 'dist', 'build', 'local-archive', 'legacy-repositories']);
const scanRoots = [
  resolve(frameworkRoot, 'nodics.foundation'),
  resolve(frameworkRoot, 'nodics.platform'),
  resolve(frameworkRoot, 'nodics.wcms'),
  resolve(frameworkRoot, 'nodics.process'),
  resolve(frameworkRoot, 'nodics.commerce'),
  resolve(frameworkRoot, 'nodics.discovery'),
  resolve(frameworkRoot, 'nodics.engagement'),
  resolve(frameworkRoot, 'nodics.communication'),
  resolve(frameworkRoot, 'nodics.localization'),
  resolve(frameworkRoot, 'nodics.accelerators'),
  resolve(workspaceRoot, 'nodics.kickoff/modules'),
  resolve(workspaceRoot, 'nodics.kickoff/envs'),
  resolve(workspaceRoot, 'nodics.exp'),
].filter(existsSync);

function isIgnored(pathValue) {
  return pathValue.split(sep).some((segment) => ignoredSegments.has(segment));
}

function walk(folder, visitor) {
  if (!existsSync(folder) || isIgnored(folder)) return;
  for (const name of readdirSync(folder)) {
    const next = resolve(folder, name);
    if (isIgnored(next)) continue;
    const stat = statSync(next);
    if (stat.isDirectory()) walk(next, visitor);
    else visitor(next);
  }
}

function slug(value) {
  return String(value || '')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function unique(values) {
  return Array.from(new Set(values.filter(Boolean)));
}

function workspaceRelative(pathValue) {
  return relative(workspaceRoot, pathValue).replace(/\\/g, '/');
}

function readJson(pathValue) {
  try {
    return JSON.parse(readFileSync(pathValue, 'utf8'));
  } catch (_error) {
    return {};
  }
}

function collectPackageBoundaries() {
  const packages = [];
  for (const root of scanRoots) {
    walk(root, (file) => {
      if (!file.endsWith('/package.json')) return;
      const packageJson = readJson(file);
      const packageRoot = dirname(file);
      const relativePath = workspaceRelative(packageRoot);
      if (/\/llm\/|\/test\/fixtures\//.test(relativePath)) return;
      packages.push({
        name: packageJson.name || relativePath.split('/').pop(),
        displayName: packageJson.nodics?.displayName || packageJson.description || '',
        kind: packageJson.nodics?.kind || 'package',
        runtimeModule: Boolean(packageJson.nodics?.runtimeModule),
        path: packageRoot,
        relativePath,
        packageJsonPath: workspaceRelative(file),
        counts: {
          schemas: 0,
          services: 0,
          controllers: 0,
          routers: 0,
          dataHeaders: 0,
          dataRecords: 0,
          assets: 0,
          tests: 0,
          frontends: 0,
        },
        examples: {
          schemas: [],
          services: [],
          controllers: [],
          routers: [],
          dataHeaders: [],
          dataRecords: [],
          assets: [],
          tests: [],
          frontends: [],
        },
      });
    });
  }
  packages.sort((left, right) => left.relativePath.localeCompare(right.relativePath));
  return packages;
}

function addExample(entry, type, file) {
  entry.counts[type] += 1;
  if (entry.examples[type].length < 4) entry.examples[type].push(workspaceRelative(file));
}

function collectSignals(entry) {
  walk(entry.path, (file) => {
    const relativeFile = workspaceRelative(file);
    if (relativeFile.endsWith('/src/schemas/schemas.js')) addExample(entry, 'schemas', file);
    if (relativeFile.includes('/src/service/') && relativeFile.endsWith('.js')) addExample(entry, 'services', file);
    if (relativeFile.includes('/src/controller/') && relativeFile.endsWith('.js')) addExample(entry, 'controllers', file);
    if (relativeFile.includes('/src/router/') && relativeFile.endsWith('.js')) addExample(entry, 'routers', file);
    if (/\/data\/[^/]+\/(?:[^/]+\/)?headers\/.+\.js$/.test(relativeFile)) addExample(entry, 'dataHeaders', file);
    if (/\/data\/[^/]+\/(?:[^/]+\/)?records\/.+\.js$/.test(relativeFile)) addExample(entry, 'dataRecords', file);
    if (relativeFile.includes('/data/') && (relativeFile.includes('/assets/') || relativeFile.endsWith('/assetManifest.js'))) addExample(entry, 'assets', file);
    if (relativeFile.includes('/test/') && file.endsWith('.js')) addExample(entry, 'tests', file);
    if (/\/src\/App\.(jsx|tsx|js|ts)$/.test(relativeFile) || /\/src\/main\.(jsx|tsx|js|ts)$/.test(relativeFile)) addExample(entry, 'frontends', file);
  });
}

function resolveEvidencePath(evidence) {
  if (!evidence || /^https?:\/\//.test(evidence)) return undefined;
  return resolve(docsRoot, evidence);
}

const documents = catalogue.documents.map((document) => {
  const contentPath = resolve(docsRoot, document.content);
  const body = existsSync(contentPath) ? readFileSync(contentPath, 'utf8') : '';
  const evidencePaths = (document.sourceEvidence || []).map(resolveEvidencePath).filter(Boolean);
  return {
    id: document.id,
    title: document.title,
    content: document.content,
    text: slug([
      document.id,
      document.title,
      document.summary,
      document.functionalModule,
      document.technicalModule,
      document.searchKeywords?.join(' '),
      document.topicKeywords?.join(' '),
      body,
    ].join(' ')),
    evidencePaths,
  };
});

function documentMatches(entry, document) {
  const entryPath = entry.path + sep;
  if (document.evidencePaths.some((evidence) => evidence === entry.path || evidence.startsWith(entryPath))) {
    return true;
  }
  const candidates = unique([
    entry.name,
    entry.name.replace(/^nodics\./, ''),
    entry.relativePath.split('/').pop(),
    entry.displayName,
  ].map(slug)).filter((value) => value.length >= 3);
  return candidates.some((candidate) => document.text.includes(candidate));
}

function score(entry) {
  return (
    entry.counts.schemas * 7 +
    entry.counts.services * 3 +
    entry.counts.controllers * 4 +
    entry.counts.routers * 4 +
    entry.counts.dataHeaders * 3 +
    entry.counts.dataRecords * 3 +
    entry.counts.assets * 2 +
    entry.counts.tests * 2 +
    entry.counts.frontends * 5
  );
}

function classify(entry, matches, priorityScore) {
  if (matches.length > 2) return 'covered';
  if (matches.length > 0 && priorityScore >= 40) return 'needs-deeper-section';
  if (matches.length > 0) return 'covered';
  if (priorityScore >= 15) return 'needs-page-or-owner-mapping';
  return 'internal-only-candidate';
}

const modules = collectPackageBoundaries();
modules.forEach(collectSignals);
const rows = modules.map((entry) => {
  const matches = documents.filter((document) => documentMatches(entry, document));
  const priorityScore = score(entry);
  return {
    name: entry.name,
    kind: entry.kind,
    runtimeModule: entry.runtimeModule,
    path: entry.relativePath,
    packageJsonPath: entry.packageJsonPath,
    priorityScore,
    classification: classify(entry, matches, priorityScore),
    matchedDocuments: matches.slice(0, 6).map((document) => document.id),
    counts: entry.counts,
    examples: entry.examples,
  };
}).sort((left, right) => {
  const severity = {
    'needs-page-or-owner-mapping': 0,
    'needs-deeper-section': 1,
    'internal-only-candidate': 2,
    covered: 3,
  };
  return severity[left.classification] - severity[right.classification] ||
    right.priorityScore - left.priorityScore ||
    left.path.localeCompare(right.path);
});

const summary = rows.reduce((result, row) => {
  result[row.classification] = (result[row.classification] || 0) + 1;
  return result;
}, { totalModules: rows.length, documents: catalogue.documents.length });

const report = {
  contract: 'nodics.documentation.sourceCoverage/v1',
  release: catalogue.release,
  scope: scanRoots.map(workspaceRelative),
  summary,
  policy: {
    blocking: false,
    reason: 'Open documentation gaps are tracked as release work; this report fails only when stale or malformed.',
    classifications: ['needs-page-or-owner-mapping', 'needs-deeper-section', 'covered', 'internal-only-candidate'],
  },
  rows,
};

function markdown(reportValue) {
  const topGaps = reportValue.rows
    .filter((row) => row.classification !== 'covered')
    .slice(0, 40);
  const lines = [
    '# Source-Backed Documentation Coverage Report',
    '',
    'This generated report maps current source boundaries to published documentation catalogue coverage. Open gaps are triage signals, not proof that a page is absent; a technical module can be intentionally covered by a broader business capability page.',
    '',
    '## Summary',
    '',
    '| Metric | Count |',
    '| --- | --- |',
    `| Catalogue documents | ${reportValue.summary.documents} |`,
    `| Source boundaries scanned | ${reportValue.summary.totalModules} |`,
    `| Needs page or owner mapping | ${reportValue.summary['needs-page-or-owner-mapping'] || 0} |`,
    `| Needs deeper section | ${reportValue.summary['needs-deeper-section'] || 0} |`,
    `| Covered | ${reportValue.summary.covered || 0} |`,
    `| Internal-only candidate | ${reportValue.summary['internal-only-candidate'] || 0} |`,
    '',
    '## Top Open Items',
    '',
    '| Classification | Score | Source boundary | Current matches | Key signals |',
    '| --- | ---: | --- | --- | --- |',
  ];
  topGaps.forEach((row) => {
    const signals = Object.entries(row.counts)
      .filter(([, count]) => count > 0)
      .map(([key, count]) => `${key}:${count}`)
      .join(', ');
    lines.push(`| ${row.classification} | ${row.priorityScore} | \`${row.path}\` | ${row.matchedDocuments.join(', ') || 'None'} | ${signals || 'package only'} |`);
  });
  lines.push(
    '',
    '## Verification',
    '',
    'Regenerate this report with:',
    '',
    '```bash',
    'npm --prefix nodics.docs run audit:source-coverage',
    'npm --prefix nodics.docs run audit:source-coverage:check',
    '```',
    '',
    'Use this report with `docs/pages/reference/source-backed-documentation-coverage-audit.md` to decide whether each item needs a new page, a deeper section, or an explicit internal-only classification.',
    '',
  );
  return lines.join('\n');
}

const json = JSON.stringify(report, null, 2) + '\n';
const md = markdown(report);

if (checkOnly) {
  const currentJson = existsSync(reportJsonPath) ? readFileSync(reportJsonPath, 'utf8') : '';
  const currentMarkdown = existsSync(reportMarkdownPath) ? readFileSync(reportMarkdownPath, 'utf8') : '';
  if (currentJson !== json || currentMarkdown !== md) {
    throw new Error('Source-backed documentation coverage report is not generated');
  }
} else {
  mkdirSync(dirname(reportJsonPath), { recursive: true });
  writeFileSync(reportJsonPath, json, 'utf8');
  writeFileSync(reportMarkdownPath, md, 'utf8');
}

console.log('Source-backed documentation coverage audit passed');
console.log(`Source boundaries: ${summary.totalModules}`);
console.log(`Catalogue documents: ${summary.documents}`);
console.log(`Needs page or owner mapping: ${summary['needs-page-or-owner-mapping'] || 0}`);
console.log(`Needs deeper section: ${summary['needs-deeper-section'] || 0}`);
