/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const domains = [
  { code: 'apparel', title: 'Apparel', module: 'agoraApparel' },
  { code: 'electronics', title: 'Electronics', module: 'agoraElectronics' },
  { code: 'telco', title: 'Telco', module: 'agoraTelco' },
];
const contentMarkers = ['ContentCatalog', 'PageData', 'RendererData', 'RouteData', 'SiteData', 'TypeCodeData',
  'SharedComponent', 'SharedMediaReference', 'SharedSlot', 'SharedTemplate', 'ContentHeader'];
const digest = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const section = (description, owningDomain, destinationRole, files) => ({ kind: 'DATA_RELEASE', dataType: 'sample', sourceRoot: 'staged', version: '0.0.0', description, owningDomain, lifecycle: 'PUBLISHABLE', destinationRole, environmentScope: ['LOCAL', 'LOCAL_PRODUCTION_SIMULATION'], sensitivity: 'PUBLIC', versioningPolicy: 'IMMUTABLE', publicationPolicy: 'REQUIRED', initialPublicationPolicy: 'ADMIN_INITIATED', removalPolicy: 'UNPUBLISH_OR_RETIRE', files });
const relativeJsFiles = function (root, directory, files = []) {
  for (const entry of fs.readdirSync(path.join(root, directory), { withFileTypes: true })) {
    const relative = path.join(directory, entry.name);
    if (entry.isDirectory()) relativeJsFiles(root, relative, files);
    else if (entry.name.endsWith('.js')) files.push(relative);
  }
  return files;
};

const nexusRoot = path.join(root, 'modules', 'nexus.web', 'modules', 'nexusWebData');
const nexusManifestPath = path.join(nexusRoot, 'data', 'manifest.json');
const nexusManifest = JSON.parse(fs.readFileSync(nexusManifestPath, 'utf8'));
nexusManifest.module = 'nexusWebData';
for (const release of Object.values(nexusManifest.sections)) release.files = Object.fromEntries(Object.keys(release.files).map(relative => [relative, digest(path.join(nexusRoot, 'data', relative))]));
fs.writeFileSync(nexusManifestPath, `${JSON.stringify(nexusManifest, null, 2)}\n`);
console.log(`Generated nexusWebData manifest with ${Object.values(nexusManifest.sections).flatMap(release => Object.keys(release.files)).length} files`);

for (const domain of domains) {
  const packRoot = path.join(root, 'modules', `agora.${domain.code}`, 'modules', domain.module);
  const stagedRoot = path.join(packRoot, 'data', 'staged', domain.code);
  const relativeFiles = relativeJsFiles(packRoot, path.join('data', 'staged', domain.code)).map(relative => relative.replace(/^data\//, '')).sort();
  const commerce = {}; const content = {};
  for (const relative of relativeFiles) {
    const target = contentMarkers.some(marker => relative.includes(marker)) ? content : commerce;
    target[relative] = digest(path.join(packRoot, 'data', relative));
  }
  const manifest = { contractVersion: 0, module: domain.module, sections: {
    [`agora${domain.title}CommerceCatalog`]: section(`Agora ${domain.title} commerce catalog`, `agora.${domain.code}`, 'COMMERCE_STAGED', commerce),
    [`agora${domain.title}ContentCatalog`]: section(`Agora ${domain.title} content and renderer catalog`, `agora.${domain.code}.wcms`, 'WCMS_STAGED', content),
  } };
  fs.writeFileSync(path.join(packRoot, 'data', 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(`Generated ${domain.module} manifest with ${relativeFiles.length} files`);
}
