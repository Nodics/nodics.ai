/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module product/acceptance/defaultCommercePublicationAcceptanceService @description Governed publication prerequisite and customer delivery acceptance. @owner product @layer tooling */
import { createHash } from 'node:crypto';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createAcceptanceContext } from '../../../../../../../../nodics.foundation/modules/nTooling/src/service/project/defaultProjectAcceptanceService.mjs';
import { projectRuntimeAcceptance, projectRuntime } from '../../../../../../../../nodics.foundation/modules/nTooling/src/service/project/defaultProjectEnvironmentConfigurationService.mjs';
import commands from '../../../../../../../../nodics.foundation/modules/nTooling/src/service/defaultToolingCommandService.js';
import probe from '../../../../../../../../nodics.foundation/modules/nTooling/src/service/project/defaultProjectConfigurationProbeService.js';
import { mediaSeedAssets } from '../../../../../../../../nodics.wcms/modules/media/src/service/acceptance/defaultMediaSeedAcceptanceService.mjs';

/** Resolves selected manifests, including shared CMS-owned media, through Media's confined resolver without changing asset ownership. */
export function resolveCommercePublicationFixtures(config, context, options = {}) {
  let profiles = options.profiles;
  let modules = options.modules;
  return { ...config, catalogs: config.catalogs?.map(catalog => {
    if (!catalog.mediaModules) return catalog;
    requireValue(!catalog.media, 'Select media fixtures or mediaModules, not both');
    const frameworkRoot = fileURLToPath(new URL('../../../../../../../../', import.meta.url));
    profiles ||= probe.read({ projectRoot: context.projectRoot, frameworkRoot,
      environment: context.configuration.environment, server: projectRuntime(context.configuration, { role: 'PLATFORM' }).server,
      inheritEnvironment: true }).properties.backofficeApplicationInitialization?.profiles;
    modules ||= commands.collectModules(context.projectRoot, commands.collectModules(frameworkRoot, []));
    const media = mediaSeedAssets({ profiles, modules, selectedModules: catalog.mediaModules })
      .map(entry => ({ mediaCode: entry.asset.mediaCode, checksum: entry.checksum }));
    return { ...catalog, media };
  }) };
}

const requiredDomains = ['product', 'pricing', 'promotion', 'inventory', 'tax', 'media'];
const stagedRoutes = { '/nodics/product/v0/products/publication/search': 'post' };
const onlineRoutes = {
  '/nodics/product/v0/products/discovery': 'get',
  '/nodics/product/v0/products/{productCode}': 'get',
};
function requireValue(condition, message) { if (!condition) throw new Error(message); }
function requireSafeProduct(product, label) {
  requireValue(product?.productCode && product.name, label + ' is incomplete');
  for (const field of ['sku', 'warehouseCode', 'priceRowCode', 'supplierCost', 'internalOnly']) {
    requireValue(!JSON.stringify(product).includes('"' + field + '"'), label + ' leaked ' + field);
  }
}

/** Normalizes exact Product root evidence without treating a representative receipt as catalogue coverage. */
export function commerceProductPublicationFixtures(catalog) {
  const configured = catalog.publications?.product;
  const receipts = Array.isArray(configured) ? configured : [configured];
  requireValue(receipts.length > 0 && receipts.length <= 100, 'Each catalog requires 1..100 exact Product publication receipts');
  const roots = new Set(), codes = new Set();
  for (const receipt of receipts) {
    requireValue(receipt?.code && receipt.rootCode && receipt.sourceVersion && receipt.targetVersion,
      'Governed Online prerequisite missing for product: provide exact publication code, rootCode, sourceVersion and targetVersion; use the owner approved lifecycle, not internal restore APIs');
    requireValue(!roots.has(receipt.rootCode) && !codes.has(receipt.code), 'Product publication fixtures contain duplicate roots or publication codes');
    requireValue(catalog.productCodes.includes(receipt.rootCode), 'Product publication fixture is outside the expected catalogue: ' + receipt.rootCode);
    roots.add(receipt.rootCode);
    codes.add(receipt.code);
  }
  const missing = catalog.productCodes.filter(code => !roots.has(code));
  requireValue(missing.length === 0, 'Governed Online Product receipt coverage is missing: ' + missing.join(', '));
  return receipts;
}

/** Reads every bounded public discovery page and rejects repeats, changing totals and incomplete pagination. */
export async function readCommercePublicationCatalogue(catalog, request, headers) {
  const policy = catalog.discoveryPagination || {};
  const pageSize = policy.pageSize ?? 24, maximum = policy.maximumProducts ?? 1000;
  requireValue(Number.isSafeInteger(pageSize) && pageSize >= 1 && pageSize <= 100 &&
    Number.isSafeInteger(maximum) && maximum >= catalog.productCodes.length && maximum <= 10000,
  'Commerce discovery pagination limits are invalid');
  const products = [], seen = new Set();
  let effectivePageSize = pageSize, total;
  for (let page = 1; page <= Math.ceil(maximum / effectivePageSize) + 1; page += 1) {
    const query = new URLSearchParams({ storeCode: catalog.storeCode, locale: catalog.locale,
      pageSize: String(pageSize), page: String(page), sortCode: 'name-asc' });
    const listing = await request('COMMERCE', '/nodics/product/v0/products/discovery?' + query, { headers });
    requireValue(Array.isArray(listing?.products), 'Online discovery returned invalid Product cards');
    requireValue(listing.discovery?.source === 'SEARCH_INDEX', 'Online discovery must be search-index backed');
    if (listing.page !== undefined) requireValue(listing.page === page, 'Online discovery returned an unexpected page');
    if (listing.pagination?.page !== undefined) requireValue(listing.pagination.page === page, 'Online discovery returned an unexpected pagination page');
    const reportedPageSize = listing.pageSize ?? listing.pagination?.pageSize ?? effectivePageSize;
    requireValue(Number.isSafeInteger(reportedPageSize) && reportedPageSize >= 1 && reportedPageSize <= pageSize &&
      (page === 1 || reportedPageSize === effectivePageSize), 'Online discovery page size is invalid or changed');
    if (listing.pageSize !== undefined && listing.pagination?.pageSize !== undefined)
      requireValue(listing.pageSize === listing.pagination.pageSize, 'Online discovery page sizes disagree');
    effectivePageSize = reportedPageSize;
    requireValue(listing.products.length <= effectivePageSize, 'Online discovery exceeded its page size');
    const reportedTotal = listing.total ?? listing.pagination?.total;
    if (reportedTotal !== undefined) {
      requireValue(Number.isSafeInteger(reportedTotal) && reportedTotal >= 0 && reportedTotal <= maximum &&
        (total === undefined || reportedTotal === total), 'Online discovery total is invalid, changed or exceeds its bound');
      if (listing.total !== undefined && listing.pagination?.total !== undefined)
        requireValue(listing.total === listing.pagination.total, 'Online discovery totals disagree');
      total = reportedTotal;
    } else requireValue(total === undefined, 'Online discovery lost its total during pagination');
    const hasNext = listing.pagination?.hasNextPage;
    requireValue(hasNext === undefined || typeof hasNext === 'boolean', 'Online discovery next-page evidence is invalid');
    for (const product of listing.products) {
      requireValue(typeof product?.productCode === 'string' && product.productCode && !seen.has(product.productCode),
        'Online discovery repeated or omitted a Product identity');
      requireSafeProduct(product, 'Product card');
      seen.add(product.productCode);
      products.push(product);
      requireValue(products.length <= maximum, 'Online discovery exceeded its configured Product bound');
    }
    if (total !== undefined) {
      requireValue(products.length <= total, 'Online discovery exceeded its reported total');
      if (products.length === total) {
        requireValue(hasNext !== true, 'Online discovery next-page evidence contradicts its total');
        return products;
      }
      requireValue(hasNext !== false && listing.products.length === effectivePageSize, 'Online discovery ended before its reported total');
    } else if (hasNext === false || hasNext === undefined && listing.products.length < effectivePageSize) return products;
    else requireValue(listing.products.length > 0, 'Online discovery promised another page without progress');
  }
  throw new Error('Online discovery did not terminate within its configured Product bound');
}

/** Verifies governed delivery; optional legacy projection qualification never substitutes for approval or target activation. */
export async function runCommercePublicationAcceptance(options = {}) {
  requireValue(options.execute === true && options.approvePublications === true,
    'Explicit --execute --approve-publications is required for Staged publication acceptance');
  const context = await createAcceptanceContext(options);
  const config = resolveCommercePublicationFixtures(options.acceptance || projectRuntimeAcceptance(context.projectRoot, context.configuration, { role: 'COMMERCE_STAGED' }).commercePublication || {}, context, options);
  requireValue(Array.isArray(config.catalogs) && config.catalogs.length > 0 && config.catalogs.length <= 100,
    'Commerce publication requires 1..100 catalog fixtures');
  for (const catalog of config.catalogs) {
    requireValue(catalog.catalogVersion && catalog.storeCode && catalog.locale, 'Each catalog needs catalogVersion, storeCode and locale');
    requireValue(Array.isArray(catalog.productCodes) && catalog.productCodes.length > 0 && catalog.productCodes.length <= 100,
      'Each catalog requires 1..100 expected productCodes');
    requireValue(catalog.productCodes.every(code => typeof code === 'string' && code.trim() && code.length <= 192) &&
      new Set(catalog.productCodes).size === catalog.productCodes.length, 'Expected productCodes must be bounded unique identities');
    commerceProductPublicationFixtures(catalog);
    for (const domain of requiredDomains) {
      if (domain === 'product') continue;
      const receipt = catalog.publications?.[domain];
      requireValue(receipt?.code && receipt.rootCode && receipt.sourceVersion && receipt.targetVersion,
        'Governed Online prerequisite missing for ' + domain + ': provide exact publication code, rootCode, sourceVersion and targetVersion; use the owner approved lifecycle, not internal restore APIs');
    }
    requireValue(Array.isArray(catalog.media) && catalog.media.length > 0 && catalog.media.length <= 1000,
      'Each catalog requires governed media fixtures');
    for (const asset of catalog.media) requireValue(asset.mediaCode && /^[a-f0-9]{64}$/.test(asset.checksum || ''), 'Media requires mediaCode and SHA-256 checksum');
  }
  const { request, raw } = context;
  const headers = await context.authenticate();

  // Existing lifecycle evidence is mandatory: no service credentials, approval bypass or direct ingestion fallback.
  for (const catalog of config.catalogs) {
    for (const domain of requiredDomains) {
      const receipts = domain === 'product' ? commerceProductPublicationFixtures(catalog) : [catalog.publications[domain]];
      for (const expected of receipts) {
      const role = domain === 'media' ? 'WCMS_STAGED' : 'COMMERCE_STAGED';
      const receipt = await request(role, '/nodics/publish/v0/publications/' + encodeURIComponent(expected.code), { headers });
      requireValue(receipt?.code === expected.code && receipt.domain === domain && receipt.rootCode === expected.rootCode &&
        receipt.sourceVersion === expected.sourceVersion && receipt.targetVersion === expected.targetVersion && receipt.state === 'ONLINE' &&
        receipt.auditTrail?.some(entry => entry.toState === 'APPROVED'),
      'Governed Online prerequisite not satisfied for ' + domain + ': exact approved ONLINE publication required; do not restore or import directly');
      if (domain === 'product') {
        const activation = receipt.auditTrail?.filter(entry => entry.toState === 'ONLINE').at(-1)?.details;
        const proof = activation?.receipt;
        requireValue(proof?.committed === true && proof.operationKey === receipt.activationOperation?.key &&
          typeof proof.operationKey === 'string' && proof.operationKey.length > 0 &&
          proof.publicationCode === receipt.code && proof.sourceVersion === receipt.sourceVersion &&
          proof.targetVersion === expected.targetVersion && activation.version === expected.targetVersion &&
          proof.previousOnlineVersion === receipt.activationOperation?.previousOnlineVersion &&
          proof.previousOnlineVersion === activation.previousOnlineVersion &&
          (proof.previousOnlineVersion === receipt.previousOnlineVersion ||
            (proof.previousOnlineVersion === null && !Object.hasOwn(receipt, 'previousOnlineVersion'))) &&
          (proof.previousOnlineVersion === null || typeof proof.previousOnlineVersion === 'string' && proof.previousOnlineVersion.length > 0),
        'Product qualified activation receipt is missing or mismatched');
      }
      }
    }
  }
  const contracts = options.legacyProjectionQualification === true ? [['COMMERCE_STAGED', stagedRoutes], ['COMMERCE', onlineRoutes]] : [['COMMERCE', onlineRoutes]];
  for (const [role, required] of contracts) {
    const contract = await request(role, '/nodics/system/v0/contract/openapi', { headers });
    const paths = contract?.paths || contract?.openapi?.paths || {};
    for (const [route, method] of Object.entries(required)) requireValue(paths[route]?.[method], role + ' contract is missing ' + route);
  }
  const summaries = [];
  for (const catalog of config.catalogs) {
    let summary;
    if (options.legacyProjectionQualification === true) {
      summary = await request('COMMERCE_STAGED', '/nodics/product/v0/products/publication/search', {
      method: 'POST', headers, body: JSON.stringify({ catalogVersion: catalog.catalogVersion, storeCode: catalog.storeCode, includeProjectionSnapshots: true }),
    });
    requireValue(Number(summary?.published) > 0 && Number(summary?.projectionCount) > 0 &&
      Array.isArray(summary.projectionSnapshots) && summary.projectionSnapshots.length > 0,
    'Staged publication produced no Product projections or handoff snapshots');
    }
    const query = new URLSearchParams({ storeCode: catalog.storeCode, locale: catalog.locale });
    const products = await readCommercePublicationCatalogue(catalog, request, headers);
    const missing = catalog.productCodes.filter(code => !products.some(product => product.productCode === code));
    requireValue(missing.length === 0, 'Expected Online product is missing: ' + missing.join(', '));
    for (const card of products) {
      requireValue(card.media?.primary?.mediaCode && card.media.primary.deliveryUrl, 'Product card is missing renderable media');
      const media = catalog.media.find(asset => asset.mediaCode === card.media.primary.mediaCode);
      requireValue(media, 'Product media is outside the governed fixture manifest');
      const canonical = '/nodics/media/v0/content/' + encodeURIComponent(media.mediaCode);
      requireValue(card.media.primary.deliveryUrl === canonical, 'Product media delivery must use the canonical Media reference');
    }
    for (const productCode of catalog.productCodes) {
      const detail = await request('COMMERCE', '/nodics/product/v0/products/' + encodeURIComponent(productCode) + '?' + query, { headers });
      requireSafeProduct(detail?.product, 'Product PDP');
      requireValue(detail.product.productCode === productCode, 'Product PDP resolved an unexpected identity');
    }
    for (const asset of catalog.media) {
      const response = await raw('WCMS_ONLINE', '/nodics/media/v0/content/' + encodeURIComponent(asset.mediaCode), { headers, redirect: 'error' });
      requireValue(response.ok, 'Governed Online Media delivery is unavailable: ' + asset.mediaCode);
      const checksum = createHash('sha256').update(Buffer.from(await response.arrayBuffer())).digest('hex');
      requireValue(checksum === asset.checksum, 'Online Media checksum mismatch: ' + asset.mediaCode);
    }
    summaries.push({ catalogVersion: catalog.catalogVersion, storeCode: catalog.storeCode,
      expectedProductCount: catalog.productCodes.length, discoveredProductCount: products.length,
      qualifiedProductReceiptCount: commerceProductPublicationFixtures(catalog).length,
      legacyProjectionQualification: summary ? { published: summary.published, projectionCount: summary.projectionCount } : null });
  }
  return { state: 'PASSED', onlineTransfer: 'EXTERNAL_GOVERNED_PREREQUISITE', summaries };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  if (process.argv.includes('--help')) console.log('acceptance:commerce-publication --execute --approve-publications [--legacy-projection-qualification]; requires tooling.acceptance.commercePublication catalogs, exact sourceVersion/targetVersion and approved Online receipts for six domains. Default checks governed delivery without publication writes. Optional legacy qualification writes Staged projections only. Never approves, restores or imports Online.');
  else runCommercePublicationAcceptance({ execute: process.argv.includes('--execute'), approvePublications: process.argv.includes('--approve-publications'), legacyProjectionQualification: process.argv.includes('--legacy-projection-qualification') }).then(result => console.log(JSON.stringify(result))).catch(error => { console.error(error.message); process.exitCode = 1; });
}
