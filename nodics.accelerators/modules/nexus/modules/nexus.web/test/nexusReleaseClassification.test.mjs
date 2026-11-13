/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
const require = createRequire(import.meta.url);

test('Nexus reference releases retain immutable destination classification', () => {
  const manifest = JSON.parse(fs.readFileSync(new URL('../data/manifest.json', import.meta.url), 'utf8'));
  assert.equal(manifest.contractVersion, 2);
  assert(manifest.sections.nexusCorporateSite);
  const releases = Object.values(manifest.sections).filter(section => section.kind === 'DATA_RELEASE');
  assert(releases.length);
  for (const release of releases) assert(release.version && release.lifecycle && release.destinationRole);
});

test('one corporate baseline retains final copy and graph without shipping repair or proof releases', () => {
  const manifest = require('../data/manifest.json');
  assert.deepEqual(Object.keys(manifest.sections).filter(code => manifest.sections[code].kind === 'DATA_RELEASE').sort(),
    ['nexusCorporateSite', 'nexusEditorialSource', 'nexusEngagementOperational', 'nexusCorporateMediaReferences'].sort());
  const components = Object.values(require('../data/sample-v001/content/records/wcms/corporate/nexusComponentData'));
  const pages = Object.values(require('../data/sample-v001/content/records/wcms/corporate/nexusPageData'));
  assert.equal(new Set(components.map(row => row.code)).size, components.length);
  assert.equal(new Set(pages.map(row => row.code)).size, pages.length);
  for (const code of ['nexusEcosystemRoles', 'nexusEcosystemContribution', 'nexusEcosystemJourney'])
    assert.equal(components.filter(row => row.code === code && row.active).length, 1, code);
  const banner = components.find(row => row.code === 'nexusMicroservicesBanner');
  assert.equal(banner.properties.subheading, 'Compose focused services through governed APIs, explicit ownership, observable runtime contracts, and public experiences that evolve safely.');
  assert.equal(banner.properties.referenceImageCode, 'nodicsMicroservicesHero');
  assert.equal(banner.properties.buttons.length, 2);
  const home = pages.find(row => row.code === 'nexusHomePage');
  assert.equal(home.name, 'Nodics Nexus Home');
  assert.equal(home.versionId, undefined);
  assert(home.cmsComponents.length > 1);
  assert(!JSON.stringify({ components, pages }).includes('Incremental proof 2026-08-21'));
  for (const section of Object.values(manifest.sections))
    assert(Object.keys(section.files || {}).every(file => !file.includes('/wcmsUpdate/')));
  assert.deepEqual(Object.keys(require('../config/properties').cms.publication.baselines), ['nexus']);
});

test('baseline documentation metadata and source checksums remain coherent', () => {
  const contract = require('../../../../../../nodics.foundation/modules/nTooling/src/service/defaultApplicationDocumentationContractService');
  const components = Object.values(require('../data/docs-v001/records/documentation/nexus_webDocumentationComponentData'));
  const pages = Object.values(require('../data/docs-v001/records/documentation/nexus_webDocumentationPageMetadataData'));
  const searches = Object.values(require('../data/docs-v001/records/documentation/nexus_webDocumentationSearchMetadataData'));
  for (const component of components.filter(row => row.properties?.source && row.properties?.blocks)) {
    const p = component.properties;
    const body = (p.blocks[0]?.kind === 'heading' && p.blocks[0].level === 1 ? '' : '# ' + p.title + '\n\n') + contract.documentationText(p.blocks);
    assert.equal(p.source.checksum, contract.sha256(body));
    assert.equal(p.source.wordCount, contract.countWords(body));
    assert(!p.searchText.includes('wcmsUpdate'));
    const page = pages.find(row => row.articleComponent === component.code);
    assert.equal(page.sourceChecksum, p.source.checksum);
    assert.equal(searches.find(row => row.code === page.searchMetadata).searchText, p.searchText);
  }
  contract.validateDataRelease(fileURLToPath(new URL('../', import.meta.url)), 'documentation');
});

test('English and Arabic homepage variants share governed identities and declare every translated field', () => {
 const files=Object.keys(require('../data/manifest.json').sections.nexusCorporateSite.files).sort();
 assert(files.findIndex(f=>f.endsWith('010_nexusTypeCodeData.js')) < files.findIndex(f=>f.endsWith('nexusComponentLocalizationData.js')));
 assert(files.findIndex(f=>f.endsWith('nexusComponentData.js')) < files.findIndex(f=>f.endsWith('nexusComponentLocalizationData.js')));
 const types=Object.values(require('../data/sample-v001/content/records/wcms/corporate/010_nexusTypeCodeData'));
 const components=Object.values(require('../data/sample-v001/content/records/wcms/corporate/nexusComponentData'));
 const variants=Object.values(require('../data/sample-v001/content/records/wcms/corporate/nexusComponentLocalizationData'));
 const routes=Object.values(require('../data/sample-v001/content/records/wcms/corporate/nexusRouteData'));
 const localeOwner=require('../../../../../../nodics.wcms/modules/cms/src/service/localization/defaultCmsContentLocalizationService');
 for(const v of variants) { const c=components.find(c=>c.code===v.componentCode); assert(c); assert.equal(v.status,'READY'); assert.equal(localeOwner.validateVariant(v,types.find(t=>t.code===c.typeCode),c),true); }
 const home=routes.filter(r=>r.path==='/' && ['en','ar'].includes(r.locale));
 assert.equal(home.length,2); assert.equal(new Set(home.map(r=>r.page)).size,1);
 assert.equal(new Set(variants.map(v=>v.code)).size,variants.length);
 assert(variants.some(v=>v.locale==='ar' && v.componentCode==='nexusCorporateSiteHeader'));
 assert(!JSON.stringify(components).includes('https://docs.nodics.in'));
});
