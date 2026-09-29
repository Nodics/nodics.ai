/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import test from 'node:test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { resolveCommercePublicationFixtures, runCommercePublicationAcceptance } from '../src/service/acceptance/defaultCommercePublicationAcceptanceService.mjs';

const domains = ['product', 'pricing', 'promotion', 'inventory', 'tax', 'media'];
const bytes = Buffer.from('partner asset');
const fixture = { catalogs: [{ catalogVersion: 'partnerStaged', storeCode: 'partnerRetail', locale: 'de', productCodes: ['partnerLamp'],
  publications: Object.fromEntries(domains.map(domain => [domain, { code: domain + '-release', rootCode: domain + '-root', sourceVersion: '1.2.3', targetVersion: domain === 'product' ? 'a'.repeat(64) : '1.2.3' }])),
  media: [{ mediaCode: 'partnerLampPhoto', checksum: createHash('sha256').update(bytes).digest('hex') }],
}] };
const configuration = { topology: { groups: { backends: ['PLATFORM', 'COMMERCE_STAGED', 'COMMERCE', 'WCMS_STAGED', 'WCMS_ONLINE'].map((role, i) => ({ role, server: 'partner' + i, host: 'localhost', port: 18000 + i })) } } };
const contract = { paths: {
  '/nodics/product/v0/products/publication/search': { post: {} },
  '/nodics/product/v0/internal/products/publication/search/restore': { post: {} },
  '/nodics/pricing/v0/internal/pricing/publication/operational/restore': { post: {} },
  '/nodics/promotion/v0/internal/promotions/publication/operational/restore': { post: {} },
  '/nodics/inventory/v0/internal/inventory/publication/operational/restore': { post: {} },
  '/nodics/tax/v0/internal/tax/publication/operational/restore': { post: {} },
  '/nodics/product/v0/products/discovery': { get: {} },
  '/nodics/product/v0/products/{productCode}': { get: {} },
} };

test('module references reuse confined Media manifests without copying bytes into customer properties', t => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'commerce-fixture-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  fs.mkdirSync(path.join(root, 'files'));
  fs.writeFileSync(path.join(root, 'files/photo.png'), bytes);
  fs.writeFileSync(path.join(root, 'manifest.js'), 'module.exports = ' + JSON.stringify([
    { mediaCode: 'partner-photo', fileName: 'photo.png', ownerType: 'PRODUCT' },
    { mediaCode: 'partner-banner', fileName: 'photo.png', ownerType: 'CMS_COMPONENT' },
  ]));
  const options = {
    profiles: { partner: { dataPackages: [{ type: 'MEDIA_ASSET_MANIFEST', manifestModule: 'partner.shop', manifestPath: 'manifest.js', targetRuntimeRole: 'WCMS_STAGED', businessPurpose: 'PARTNER_PRODUCT_IMAGE' }] } },
    modules: [{ name: 'partner.shop', path: root }],
  };
  const config = { catalogs: [{ ...fixture.catalogs[0], media: undefined, mediaModules: ['partner.shop'] }] };
  const resolved = resolveCommercePublicationFixtures(config, {}, options);
  assert.deepEqual(resolved.catalogs[0].media, [{ mediaCode: 'partner-photo', checksum: createHash('sha256').update(bytes).digest('hex') }]);
  assert.equal(config.catalogs[0].media, undefined);
  options.profiles.partner.dataPackages[0].manifestPath = '../manifest.js';
  assert.throws(() => resolveCommercePublicationFixtures(config, {}, options), /module-relative/);
});
test('inline media and module references cannot create two fixture authorities', () => {
  assert.throws(() => resolveCommercePublicationFixtures({ catalogs: [{ ...fixture.catalogs[0], mediaModules: ['partner.shop'] }] }, {}), /not both/);
});
function harness({ denied, pending, wrongVersion, wrongTarget, wrongReceipt, leak, mediaCorrupt, missingProduct, mediaUrl } = {}) {
  const calls = [];
  const reply = (body, status = 200) => new Response(JSON.stringify(body), { status });
  const fetch = async (url, options) => {
    const path = new URL(url).pathname;
    calls.push({ path, options, url: String(url) });
    if (denied) return reply({ message: 'Denied' }, 403);
    if (path.includes('/publications/')) {
      const domain = path.split('/').at(-1).replace('-release', '');
      const expected = fixture.catalogs[0].publications[domain];
      const proof = { committed: true, operationKey: wrongReceipt ? 'other-operation' : 'activation-1', publicationCode: expected.code,
        sourceVersion: expected.sourceVersion, targetVersion: expected.targetVersion, previousOnlineVersion: null };
      return reply({ ...expected, domain, targetVersion: wrongTarget ? 'wrong' : expected.targetVersion,
        activationOperation: { key: 'activation-1' }, previousOnlineVersion: null,
        sourceVersion: wrongVersion ? 'old' : '1.2.3', state: pending ? 'PENDING_APPROVAL' : 'ONLINE',
        auditTrail: [{ toState: 'APPROVED' }, { toState: 'ONLINE', details: { version: expected.targetVersion, receipt: proof } }] });
    }
    if (path.endsWith('/contract/openapi')) return reply(contract);
    if (path.endsWith('/publication/search')) return reply({ published: 1, projectionCount: 1, projectionSnapshots: [{ productCode: 'partnerLamp' }] });
    if (path.includes('/media/v0/content/')) return new Response(mediaCorrupt ? 'bad' : bytes);
    const product = { productCode: missingProduct ? 'unrelated' : 'partnerLamp', name: 'Lampe', ...(leak ? { sku: 'internal' } : {}),
      media: { primary: { mediaCode: 'partnerLampPhoto', deliveryUrl: mediaUrl || '/nodics/media/v0/content/partnerLampPhoto' } } };
    if (path.endsWith('/products/discovery')) return reply({ products: [product], discovery: { source: 'SEARCH_INDEX' } });
    if (path.includes('/products/')) return reply({ product });
    throw new Error('Unexpected request ' + path);
  };
  return { calls, options: { execute: true, approvePublications: true, acceptance: fixture, configuration,
    environment: { AXIS_AUTH_TOKEN: 'human', NODICS_ACCEPTANCE_ORIGIN: 'http://partner.test' }, fetch } };
}
test('independent governed partner fixtures cover projections, Online cards/PDP and all media bytes without Online writes', async () => {
  const h = harness();
  const result = await runCommercePublicationAcceptance(h.options);
  assert.equal(result.state, 'PASSED');
  assert.equal(result.onlineTransfer, 'EXTERNAL_GOVERNED_PREREQUISITE');
  assert.equal(h.calls.filter(call => call.path.includes('/publications/')).length, 6);
  const writes = h.calls.filter(call => call.options.method === 'POST');
  assert.equal(writes.length, 0);
  assert(!h.calls.some(call => call.path.includes('/restore') || call.path.includes('/assets/import') || call.path.includes('/auth/token/')));
});
test('execution and approval intent required before resolving a project', async () => {
  await assert.rejects(runCommercePublicationAcceptance(), /--execute --approve-publications/);
  await assert.rejects(runCommercePublicationAcceptance({ execute: true }), /--execute --approve-publications/);
});
test('missing owner prerequisite fails before requests, not reduced coverage', async () => {
  const h = harness();
  const acceptance = structuredClone(fixture);
  delete acceptance.catalogs[0].publications.tax;
  await assert.rejects(runCommercePublicationAcceptance({ ...h.options, acceptance }), /prerequisite missing for tax/);
  assert.equal(h.calls.length, 0);
});
test('denied lifecycle read never triggers fallback', async () => {
  const h = harness({ denied: true });
  await assert.rejects(runCommercePublicationAcceptance(h.options), /HTTP 403/);
  assert.equal(h.calls.length, 1);
});
for (const flag of ['pending', 'wrongVersion', 'wrongTarget']) test(flag + ' receipt blocks every publication write', async () => {
  const h = harness({ [flag]: true });
  await assert.rejects(runCommercePublicationAcceptance(h.options), /prerequisite not satisfied/);
  assert(!h.calls.some(call => call.options.method === 'POST'));
});
test('qualified Product receipt operation mismatch fails without writes', async () => {
  const h = harness({ wrongReceipt: true });
  await assert.rejects(runCommercePublicationAcceptance(h.options), /qualified activation receipt/);
  assert(!h.calls.some(call => call.options.method === 'POST'));
});
test('legacy projection qualification is explicitly separate and Staged-only', async () => {
  const h = harness();
  const result = await runCommercePublicationAcceptance({ ...h.options, legacyProjectionQualification: true });
  const writes = h.calls.filter(call => call.options.method === 'POST');
  assert.equal(writes.length, 1);
  assert.match(writes[0].url, /:18001\/nodics\/product\/v0\/products\/publication\/search$/);
  assert.equal(result.summaries[0].legacyProjectionQualification.projectionCount, 1);
});
test('unsafe Product projection fails acceptance', async () => {
  await assert.rejects(runCommercePublicationAcceptance(harness({ leak: true }).options), /leaked sku/);
});
test('missing expected product fails acceptance', async () => {
  await assert.rejects(runCommercePublicationAcceptance(harness({ missingProduct: true }).options), /Expected Online product is missing/);
});
test('bad Online bytes fail media checksum evidence', async () => {
  await assert.rejects(runCommercePublicationAcceptance(harness({ mediaCorrupt: true }).options), /checksum mismatch/);
});
test('untrusted media URL is rejected, never fetched with employee credentials', async () => {
  const h = harness({ mediaUrl: 'https://untrusted.invalid/media' });
  await assert.rejects(runCommercePublicationAcceptance(h.options), /canonical Media reference/);
  assert(h.calls.every(call => new URL(call.url).hostname === 'localhost'));
});
test('help is inert without a configured customer project', () => {
  const result = spawnSync(process.execPath, [new URL('../src/service/acceptance/defaultCommercePublicationAcceptanceService.mjs', import.meta.url).pathname, '--help'], { cwd: '/', encoding: 'utf8', env: { PATH: process.env.PATH } });
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /--approve-publications/);
});
