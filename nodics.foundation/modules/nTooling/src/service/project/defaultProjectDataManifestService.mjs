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
  { code: 'apparel', title: 'Apparel', module: 'agora.apparel' },
  { code: 'electronics', title: 'Electronics', module: 'agora.electronics' },
  { code: 'telco', title: 'Telco', module: 'agora.telco' },
];
const domainReleaseVersions = {
  'agora.apparel': '0.0.2'
};
const releaseRoot = 'sample-v001';
const digest = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const section = (description, owningDomain, destinationRole, files, version = '0.0.0') => ({ kind: 'DATA_RELEASE', dataType: 'sample', sourceRoot: releaseRoot, version, description, owningDomain, lifecycle: 'PUBLISHABLE', destinationRole, environmentScope: ['LOCAL', 'LOCAL_PRODUCTION_SIMULATION'], sensitivity: 'PUBLIC', versioningPolicy: 'IMMUTABLE', publicationPolicy: 'REQUIRED', initialPublicationPolicy: 'ADMIN_INITIATED', removalPolicy: 'UNPUBLISH_OR_RETIRE', files });
const relativeFiles = function (root, directory, files = []) {
  const absoluteDirectory = path.join(root, directory);
  if (!fs.existsSync(absoluteDirectory)) return files;
  for (const entry of fs.readdirSync(absoluteDirectory, { withFileTypes: true })) {
    const relative = path.join(directory, entry.name);
    if (entry.isDirectory()) relativeFiles(root, relative, files);
    else files.push(relative);
  }
  return files;
};
const fileMap = function (root, paths) {
  const files = paths.flatMap(relative => {
    const absolute = path.join(root, relative);
    if (!fs.existsSync(absolute)) return [];
    if (fs.statSync(absolute).isDirectory()) return relativeFiles(root, relative);
    return [relative];
  }).sort();
  return Object.fromEntries(files.map(relative => [relative.replace(/^data\//, ''), digest(path.join(root, relative))]));
};
const refreshSection = function (manifest, sectionCode, paths) {
  const existing = manifest.sections[sectionCode];
  if (!existing) return;
  const environmentScope = Array.isArray(existing.environmentScope) && existing.environmentScope.includes('ALL')
    ? ['ALL']
    : ['LOCAL', 'LOCAL_PRODUCTION_SIMULATION'];
  manifest.sections[sectionCode] = Object.assign({}, existing, {
    dataType: 'sample',
    sourceRoot: releaseRoot,
    environmentScope,
    files: fileMap(path.join(nexusRoot, 'data'), paths.map(relative => relative.replace(/^data\//, '')))
  });
};

const nexusRoot = path.join(root, 'modules', 'nexus.web');
const nexusManifestPath = path.join(nexusRoot, 'data', 'manifest.json');
const nexusManifest = JSON.parse(fs.readFileSync(nexusManifestPath, 'utf8'));
nexusManifest.module = 'nexus.web';
refreshSection(nexusManifest, 'nexusCorporateSite', [
  `${releaseRoot}/content/headers/wcms`,
  `${releaseRoot}/content/records/wcms`
]);
refreshSection(nexusManifest, 'nexusCorporateSiteUpdate', [
  `${releaseRoot}/content/headers/wcmsUpdate/nexusCorporatePageUpdateHeader.js`,
  `${releaseRoot}/content/records/wcmsUpdate/corporate/nexusPageUpdateData.js`
]);
refreshSection(nexusManifest, 'nexusCorporateEcosystemComponentRepair', [
  `${releaseRoot}/content/headers/wcmsUpdate/nexusEcosystemComponentRepairHeader.js`,
  `${releaseRoot}/content/records/wcmsUpdate/corporate/nexusEcosystemComponentRepairData.js`
]);
refreshSection(nexusManifest, 'nexusCorporateIncrementalProof', [
  `${releaseRoot}/content/headers/wcmsUpdate/nexusIncrementalProofHeader.js`,
  `${releaseRoot}/content/records/wcmsUpdate/corporate/nexusIncrementalProofData.js`
]);
refreshSection(nexusManifest, 'nexusCorporateProfessionalCopyUpdate', [
  `${releaseRoot}/content/headers/wcmsUpdate/nexusProfessionalCopyUpdateHeader.js`,
  `${releaseRoot}/content/records/wcmsUpdate/corporate/nexusProfessionalCopyUpdateData.js`
]);
refreshSection(nexusManifest, 'nexusEditorialSource', [
  `${releaseRoot}/content/headers/editorial`,
  `${releaseRoot}/content/records/editorial`
]);
refreshSection(nexusManifest, 'nexusEngagementOperational', [
  `${releaseRoot}/content/headers/engagement`,
  `${releaseRoot}/content/records/engagement`
]);
refreshSection(nexusManifest, 'nexusCorporateMediaReferences', [
  `${releaseRoot}/content/headers/media`,
  `${releaseRoot}/content/records/media`,
  `${releaseRoot}/content/assets/nexus-cms-media`
]);
fs.writeFileSync(nexusManifestPath, `${JSON.stringify(nexusManifest, null, 2)}\n`);
console.log(`Generated nexus.web manifest with ${Object.values(nexusManifest.sections).flatMap(release => Object.keys(release.files)).length} files`);

for (const domain of domains) {
  const packRoot = path.join(root, 'modules', domain.module);
  const commerce = fileMap(path.join(packRoot, 'data'), [
    `${releaseRoot}/commerce/headers`,
    `${releaseRoot}/commerce/records`
  ]);
  const content = fileMap(path.join(packRoot, 'data'), [
    `${releaseRoot}/content/headers`,
    `${releaseRoot}/content/records`,
    `${releaseRoot}/content/assets/agora-cms-media`
  ]);
  const manifest = { contractVersion: 2, module: domain.module, sections: {
    [`agora${domain.title}CommerceCatalog`]: section(`Agora ${domain.title} commerce catalog`, `agora.${domain.code}`, 'COMMERCE_STAGED', commerce, domainReleaseVersions[domain.module]),
    [`agora${domain.title}ContentCatalog`]: section(`Agora ${domain.title} content and renderer catalog`, `agora.${domain.code}.wcms`, 'WCMS_STAGED', content, domainReleaseVersions[domain.module]),
  } };
  fs.writeFileSync(path.join(packRoot, 'data', 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(`Generated ${domain.module} manifest with ${Object.keys(commerce).length + Object.keys(content).length} files`);
}
