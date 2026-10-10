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
import { commerceProductPublicationFixtures, readCommercePublicationCatalogue, resolveCommercePublicationFixtures, runCommercePublicationAcceptance } from '../src/service/acceptance/defaultCommercePublicationAcceptanceService.mjs';

const domains = ['product', 'pricing', 'promotion', 'inventory', 'tax', 'media'];
const bytes = Buffer.from('partner asset');
const fixture = { catalogs: [{ catalogVersion: 'partnerStaged', storeCode: 'partnerRetail', locale: 'de', productCodes: ['partnerLamp'],
  publications: Object.fromEntries(domains.map(domain => [domain, { code: domain + '-release', rootCode: domain === 'product' ? 'partnerLamp' : domain + '-root', sourceVersion: '1.2.3', targetVersion: domain === 'product' ? 'a'.repeat(64) : '1.2.3' }])),
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

test('module references qualify shared CMS-owned media without changing ownership or copying bytes into customer properties', async t => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'commerce-fixture-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  fs.mkdirSync(path.join(root, 'files'));
  fs.writeFileSync(path.join(root, 'files/photo.png'), bytes);
  const assets = [
    { mediaCode: 'partner-photo', fileName: 'photo.png', ownerType: 'PRODUCT' },
    { mediaCode: 'partner-banner', fileName: 'photo.png', ownerType: 'CMS_COMPONENT' },
  ];
  fs.writeFileSync(path.join(root, 'manifest.js'), 'module.exports = ' + JSON.stringify(assets));
  fs.writeFileSync(path.join(root, 'unselected.js'), 'module.exports = ' + JSON.stringify([
    { mediaCode: 'unselected-banner', fileName: 'photo.png', ownerType: 'CMS_COMPONENT' },
  ]));
  const options = {
    profiles: { partner: { dataPackages: [
      { type: 'MEDIA_ASSET_MANIFEST', manifestModule: 'partner.shop', manifestPath: 'manifest.js', targetRuntimeRole: 'WCMS_STAGED', businessPurpose: 'PARTNER_PRODUCT_IMAGE' },
      { type: 'MEDIA_ASSET_MANIFEST', manifestModule: 'partner.other', manifestPath: 'unselected.js', targetRuntimeRole: 'WCMS_STAGED', businessPurpose: 'PARTNER_OTHER_IMAGE' },
    ] } },
    modules: [{ name: 'partner.shop', path: root }, { name: 'partner.other', path: root }],
  };
  const config = { catalogs: [{ ...fixture.catalogs[0], media: undefined, mediaModules: ['partner.shop'] }] };
  const resolved = resolveCommercePublicationFixtures(config, {}, options);
  assert.deepEqual(resolved.catalogs[0].media, assets.map(asset => ({ mediaCode: asset.mediaCode, checksum: createHash('sha256').update(bytes).digest('hex') })));
  assert.equal(config.catalogs[0].media, undefined);
  assert.deepEqual(JSON.parse(fs.readFileSync(path.join(root, 'manifest.js'), 'utf8').slice('module.exports = '.length)), assets);
  const listingPage = (query, card) => ({ products: [{ ...card,
    media: { primary: { mediaCode: 'partner-banner', deliveryUrl: '/nodics/media/v0/content/partner-banner' } },
  }], discovery: { source: 'SEARCH_INDEX' } });
  const h = harness({ acceptance: config, listingPage });
  assert.equal((await runCommercePublicationAcceptance({ ...h.options, ...options })).state, 'PASSED');
  assert.deepEqual(h.calls.filter(call => call.path.includes('/media/v0/content/')).map(call => call.path), [
    '/nodics/media/v0/content/partner-photo', '/nodics/media/v0/content/partner-banner',
  ]);
  assert(!h.calls.some(call => (call.options.method || 'GET') !== 'GET'));
  const corrupt = harness({ acceptance: config, listingPage, corruptMediaCode: 'partner-banner' });
  await assert.rejects(runCommercePublicationAcceptance({ ...corrupt.options, ...options }), /checksum mismatch: partner-banner/);
  const foreign = harness({ acceptance: config, listingPage: (query, card) => ({ products: [{ ...card,
    media: { primary: { mediaCode: 'unselected-banner', deliveryUrl: '/nodics/media/v0/content/unselected-banner' } },
  }], discovery: { source: 'SEARCH_INDEX' } }) });
  await assert.rejects(runCommercePublicationAcceptance({ ...foreign.options, ...options }), /outside the governed fixture manifest/);
  assert(!foreign.calls.some(call => call.path.includes('/media/v0/content/')));
  options.profiles.partner.dataPackages[0].manifestPath = '../manifest.js';
  assert.throws(() => resolveCommercePublicationFixtures(config, {}, options), /module-relative/);
});
test('inline media and module references cannot create two fixture authorities', () => {
  assert.throws(() => resolveCommercePublicationFixtures({ catalogs: [{ ...fixture.catalogs[0], mediaModules: ['partner.shop'] }] }, {}), /not both/);
});
function harness({ denied, pending, wrongVersion, wrongTarget, wrongReceipt, mutateProductReceipt, leak, mediaCorrupt, corruptMediaCode, missingProduct, mediaUrl, acceptance = fixture, listingPage } = {}) {
  const calls = [];
  const reply = (body, status = 200) => new Response(JSON.stringify(body), { status });
  const fetch = async (url, options) => {
    const path = new URL(url).pathname;
    calls.push({ path, options, url: String(url) });
    if (denied) return reply({ message: 'Denied' }, 403);
    if (path.includes('/publications/')) {
      const [domain, expected] = Object.entries(acceptance.catalogs[0].publications)
        .flatMap(([domain, value]) => (Array.isArray(value) ? value : [value]).map(receipt => [domain, receipt]))
        .find(([, receipt]) => receipt.code === decodeURIComponent(path.split('/').at(-1)));
      const proof = { committed: true, operationKey: wrongReceipt ? 'other-operation' : 'activation-1', publicationCode: expected.code,
        sourceVersion: expected.sourceVersion, targetVersion: expected.targetVersion, previousOnlineVersion: null };
      const publication = { ...expected, domain, targetVersion: wrongTarget ? 'wrong' : expected.targetVersion,
        activationOperation: { key: 'activation-1', previousOnlineVersion: null }, previousOnlineVersion: null,
        sourceVersion: wrongVersion ? 'old' : expected.sourceVersion, state: pending ? 'PENDING_APPROVAL' : 'ONLINE',
        auditTrail: [{ toState: 'APPROVED' }, { toState: 'ONLINE', details: { version: expected.targetVersion, previousOnlineVersion: null, receipt: proof } }] };
      if (domain === 'product' && mutateProductReceipt) mutateProductReceipt(publication);
      return reply(publication);
    }
    if (path.endsWith('/contract/openapi')) return reply(contract);
    if (path.endsWith('/publication/search')) return reply({ published: 1, projectionCount: 1, projectionSnapshots: [{ productCode: 'partnerLamp' }] });
    if (path.includes('/media/v0/content/')) return new Response(mediaCorrupt || path === '/nodics/media/v0/content/' + corruptMediaCode ? 'bad' : bytes);
    const product = { productCode: missingProduct ? 'unrelated' : path.endsWith('/products/discovery') ? 'partnerLamp' : decodeURIComponent(path.split('/').at(-1)), name: 'Lampe', ...(leak ? { sku: 'internal' } : {}),
      media: { primary: { mediaCode: 'partnerLampPhoto', deliveryUrl: mediaUrl || '/nodics/media/v0/content/partnerLampPhoto' } } };
    if (path.endsWith('/products/discovery')) return reply(listingPage ? listingPage(new URL(url).searchParams, product) : { products: [product], discovery: { source: 'SEARCH_INDEX' } });
    if (path.includes('/products/')) return reply({ product });
    throw new Error('Unexpected request ' + path);
  };
  return { calls, options: { execute: true, approvePublications: true, acceptance, configuration,
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
test('first Product activation permits omitted optional storage predecessor with explicit null owner evidence', async () => {
  const h = harness({ mutateProductReceipt: publication => { delete publication.previousOnlineVersion; } });
  assert.equal((await runCommercePublicationAcceptance(h.options)).state, 'PASSED');
  assert(!h.calls.some(call => call.options.method === 'POST'));
});
test('successor Product activation requires the same explicit predecessor throughout owner evidence', async () => {
  const h = harness({ mutateProductReceipt: publication => {
    publication.previousOnlineVersion = 'prior-digest';
    publication.activationOperation.previousOnlineVersion = 'prior-digest';
    publication.auditTrail[1].details.previousOnlineVersion = 'prior-digest';
    publication.auditTrail[1].details.receipt.previousOnlineVersion = 'prior-digest';
  } });
  assert.equal((await runCommercePublicationAcceptance(h.options)).state, 'PASSED');
});
for (const [label, mutateProductReceipt] of [
  ['missing target predecessor', publication => { delete publication.auditTrail[1].details.receipt.previousOnlineVersion; }],
  ['missing operation predecessor', publication => { delete publication.activationOperation.previousOnlineVersion; }],
  ['missing audit predecessor', publication => { delete publication.auditTrail[1].details.previousOnlineVersion; }],
  ['conflicting operation predecessor', publication => { publication.activationOperation.previousOnlineVersion = 'other'; }],
  ['conflicting audit predecessor', publication => { publication.auditTrail[1].details.previousOnlineVersion = 'other'; }],
  ['conflicting storage predecessor', publication => { publication.previousOnlineVersion = 'other'; }],
  ['omitted successor storage predecessor', publication => {
    delete publication.previousOnlineVersion;
    publication.activationOperation.previousOnlineVersion = 'prior-digest';
    publication.auditTrail[1].details.previousOnlineVersion = 'prior-digest';
    publication.auditTrail[1].details.receipt.previousOnlineVersion = 'prior-digest';
  }],
]) test(label + ' fails before delivery and without writes', async () => {
  const h = harness({ mutateProductReceipt });
  await assert.rejects(runCommercePublicationAcceptance(h.options), /qualified activation receipt/);
  assert(!h.calls.some(call => call.options.method === 'POST' || call.path.includes('/products/discovery')));
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
function completeCatalogueFixture(count = 61) {
  const acceptance = structuredClone(fixture), catalog = acceptance.catalogs[0];
  catalog.productCodes = Array.from({ length: count }, (_, index) => 'partnerItem' + index);
  catalog.publications.product = catalog.productCodes.map((rootCode, index) => ({
    code: 'partner-publication-' + index, rootCode, sourceVersion: String(index), targetVersion: createHash('sha256').update(rootCode).digest('hex'),
  }));
  return acceptance;
}
function cataloguePage(codes, query, card) {
  const page = Number(query.get('page')), pageSize = Number(query.get('pageSize'));
  return { page, pageSize, total: codes.length, discovery: { source: 'SEARCH_INDEX' },
    pagination: { page, pageSize, total: codes.length, hasNextPage: page * pageSize < codes.length },
    products: codes.slice((page - 1) * pageSize, page * pageSize).map(productCode => ({ ...card, productCode })),
  };
}
test('complete independent catalogue checks all 61 receipts and PDPs across three bounded search pages without writes', async () => {
  const acceptance = completeCatalogueFixture();
  const h = harness({ acceptance, listingPage: (query, card) => cataloguePage(acceptance.catalogs[0].productCodes, query, card) });
  const result = await runCommercePublicationAcceptance(h.options);
  assert.equal(result.state, 'PASSED');
  assert.equal(result.summaries[0].expectedProductCount, 61);
  assert.equal(result.summaries[0].discoveredProductCount, 61);
  assert.equal(result.summaries[0].qualifiedProductReceiptCount, 61);
  assert.equal(h.calls.filter(call => call.path.includes('/publications/')).length, 66);
  assert.equal(h.calls.filter(call => call.path.endsWith('/products/discovery')).length, 3);
  assert.equal(h.calls.filter(call => /\/products\/partnerItem\d+$/.test(call.path)).length, 61);
  assert(!h.calls.some(call => (call.options.method || 'GET') !== 'GET'));
});
test('representative Product receipt cannot qualify a multi-root catalogue before any network call', async () => {
  const acceptance = completeCatalogueFixture(2);
  acceptance.catalogs[0].publications.product = acceptance.catalogs[0].publications.product[0];
  const h = harness({ acceptance });
  await assert.rejects(runCommercePublicationAcceptance(h.options), /receipt coverage is missing: partnerItem1/);
  assert.equal(h.calls.length, 0);
});
for (const [label, mutate] of [
  ['duplicate root', catalog => { catalog.publications.product[1].rootCode = catalog.publications.product[0].rootCode; }],
  ['duplicate publication code', catalog => { catalog.publications.product[1].code = catalog.publications.product[0].code; }],
  ['foreign root', catalog => { catalog.publications.product[1].rootCode = 'foreignItem'; }],
  ['incomplete receipt', catalog => { delete catalog.publications.product[1].targetVersion; }],
]) test(label + ' Product evidence rejects before requests', async () => {
  const acceptance = completeCatalogueFixture(2);
  mutate(acceptance.catalogs[0]);
  const h = harness({ acceptance });
  await assert.rejects(runCommercePublicationAcceptance(h.options), /duplicate|outside|prerequisite missing/);
  assert.equal(h.calls.length, 0);
});
test('last Product root with pending approval blocks discovery despite all earlier Online receipts', async () => {
  const acceptance = completeCatalogueFixture(3);
  const h = harness({ acceptance, mutateProductReceipt: receipt => {
    if (receipt.rootCode === 'partnerItem2') receipt.state = 'PENDING_APPROVAL';
  } });
  await assert.rejects(runCommercePublicationAcceptance(h.options), /prerequisite not satisfied for product/);
  assert.equal(h.calls.filter(call => call.path.includes('/publications/')).length, 3);
  assert(!h.calls.some(call => call.path.includes('/products/discovery')));
});
test('every missing expected root is detected independently of a valid receipt and a successful sibling PDP', async () => {
  const acceptance = completeCatalogueFixture(61);
  const present = acceptance.catalogs[0].productCodes.filter(code => !['partnerItem25', 'partnerItem60'].includes(code));
  const h = harness({ acceptance, listingPage: (query, card) => cataloguePage(present, query, card) });
  await assert.rejects(runCommercePublicationAcceptance(h.options), /Expected Online product is missing: partnerItem25, partnerItem60/);
  assert.equal(h.calls.filter(call => call.path.endsWith('/products/discovery')).length, 3);
  assert(!h.calls.some(call => /\/products\/partnerItem\d+$/.test(call.path)));
});
test('provider-paged discovery without totals reads a terminal page instead of truncating at the first full page', async () => {
  const acceptance = completeCatalogueFixture(48);
  const h = harness({ acceptance, listingPage: (query, card) => {
    const page = cataloguePage(acceptance.catalogs[0].productCodes, query, card);
    delete page.total;
    delete page.pagination;
    return page;
  } });
  assert.equal((await runCommercePublicationAcceptance(h.options)).state, 'PASSED');
  assert.equal(h.calls.filter(call => call.path.endsWith('/products/discovery')).length, 3);
});
for (const [label, mutate, match] of [
  ['repeated page', (body, page) => { if (page === 2) body.products[0].productCode = 'partnerItem0'; }, /repeated/],
  ['changed total', (body, page) => { if (page === 2) { body.total--; body.pagination.total--; } }, /total is invalid, changed/],
  ['contradictory total', body => { body.pagination.total--; }, /totals disagree/],
  ['early terminal page', body => { body.pagination.hasNextPage = false; }, /ended before/],
  ['short nonterminal page', body => { body.products.pop(); }, /ended before/],
  ['wrong page', body => { body.page = 9; }, /unexpected page/],
  ['oversized page', body => { body.products.push({ ...body.products[0], productCode: 'extra' }); }, /exceeded its page size/],
  ['lost search evidence', (body, page) => { if (page === 2) body.discovery.source = 'DATABASE'; }, /search-index backed/],
]) test(label + ' discovery fails closed', async () => {
  const acceptance = completeCatalogueFixture(61);
  const h = harness({ acceptance, listingPage: (query, card) => {
    const body = cataloguePage(acceptance.catalogs[0].productCodes, query, card);
    mutate(body, Number(query.get('page')));
    return body;
  } });
  await assert.rejects(runCommercePublicationAcceptance(h.options), match);
  assert(!h.calls.some(call => (call.options.method || 'GET') !== 'GET'));
});
test('bounded pagination rejects a nonterminating provider, invalid limits and oversized totals', async () => {
  const catalog = { productCodes: ['item'], storeCode: 'partner', locale: 'de', discoveryPagination: { pageSize: 1, maximumProducts: 2 } };
  let calls = 0;
  await assert.rejects(readCommercePublicationCatalogue(catalog, async () => ({
    products: [{ productCode: 'item-' + calls++, name: 'Item' }], discovery: { source: 'SEARCH_INDEX' },
  }), {}), /exceeded its configured Product bound/);
  assert.equal(calls, 3);
  await assert.rejects(readCommercePublicationCatalogue({ ...catalog, discoveryPagination: { pageSize: 0 } }, async () => { throw new Error('No request'); }, {}), /pagination limits are invalid/);
  await assert.rejects(readCommercePublicationCatalogue(catalog, async () => ({ products: [], total: 3, discovery: { source: 'SEARCH_INDEX' } }), {}), /exceeds its bound/);
});
test('single expected root retains exact object fixture compatibility', () => {
  assert.deepEqual(commerceProductPublicationFixtures(fixture.catalogs[0]), [fixture.catalogs[0].publications.product]);
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
