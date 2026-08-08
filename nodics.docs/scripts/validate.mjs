import { access, readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { dirname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const catalogue = JSON.parse(await readFile(resolve(root, 'catalogue.json'), 'utf8'));

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
  const contentPath = resolve(root, document.content || '');
  if (!contentPath.startsWith(root + sep)) {
    throw new Error(`Content escapes package root: ${document.id}`);
  }
  await access(contentPath);
  const body = await readFile(contentPath, 'utf8');
  if (!body.trim().startsWith('# ')) {
    throw new Error(`Document must start with one title: ${document.id}`);
  }
  document.sha256 = createHash('sha256').update(body).digest('hex');
}

console.log(
  `Validated ${catalogue.documents.length} framework documentation documents for release ${catalogue.release}`,
);
