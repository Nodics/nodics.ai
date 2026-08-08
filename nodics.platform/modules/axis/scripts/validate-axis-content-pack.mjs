import { readdir, readFile } from 'node:fs/promises';
import { existsSync, readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const repositoryRoot = resolve(root, '../..');

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

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const manifest = JSON.parse(
  await readFile(resolve(root, 'manifest/docs-content-pack.json'), 'utf8'),
);
assert(manifest.pack === 'nodics.platform.axis', 'Axis documentation pack identity drifted');
assert(
  manifest.sourceAuthority === 'modules/axis/data/core/source/documentation',
  'Axis documentation source must be owned by nodics.platform/modules/axis',
);
assert(
  manifest.migrationRegister ===
    'modules/axis/data/core/source/documentation/migration-register.json',
  'Axis migration register path drifted',
);
assert(
  Array.isArray(manifest.sites) &&
    manifest.sites.length === 1 &&
    manifest.sites[0] === 'axisDocumentationSite',
  'Axis documentation pack must expose one documentation CMS Site',
);

for (const [relativePath, expectedHash] of Object.entries(manifest.generatedHashes)) {
  const actualHash = sha256(readFileSync(resolve(repositoryRoot, relativePath)));
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
  await readFile(resolve(root, 'data/core/source/documentation/navigation.json'), 'utf8'),
);
const migrationRegister = JSON.parse(
  await readFile(
    resolve(root, 'data/core/source/documentation/migration-register.json'),
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
    resolve(root, 'data/core/source/documentation', page.source),
    'utf8',
  );
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
    generatedComponents.includes(
      `modules/axis/data/core/source/documentation/${page.source}`,
    ),
    `Generated components do not contain platform axis source path: ${page.source}`,
  );
  assert(
    canonical.includes('## Customize and extend safely'),
    `Missing customization section: ${page.source}`,
  );
}

const rootDocs = existsSync(resolve(root, 'docs'))
  ? (await readdir(resolve(root, 'docs'))).filter((name) => name.endsWith('.md'))
  : [];
assert(rootDocs.length === 0, 'axis module must not recreate parallel root docs');

console.log(`Validated ${navigation.pages.length} Axis CMS documentation pages`);
