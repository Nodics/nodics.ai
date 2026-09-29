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

/** Resolves application-owned media references with Media's existing confined resolver; no network, uploads or alternative loader. */
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
      .filter(entry => entry.asset.ownerType === 'PRODUCT')
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
    for (const domain of requiredDomains) {
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
      const expected = catalog.publications[domain];
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
          proof.previousOnlineVersion === receipt.previousOnlineVersion &&
          (proof.previousOnlineVersion === null || typeof proof.previousOnlineVersion === 'string' && proof.previousOnlineVersion.length > 0),
        'Product qualified activation receipt is missing or mismatched');
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
    const query = new URLSearchParams({ storeCode: catalog.storeCode, locale: catalog.locale, pageSize: '100' });
    const listing = await request('COMMERCE', '/nodics/product/v0/products/discovery?' + query, { headers });
    requireValue(Array.isArray(listing?.products) && listing.products.length > 0, 'Online discovery returned no Product cards');
    requireValue(listing.discovery?.source === 'SEARCH_INDEX', 'Online discovery must be search-index backed');
    for (const card of listing.products) {
      requireSafeProduct(card, 'Product card');
      requireValue(card.media?.primary?.mediaCode && card.media.primary.deliveryUrl, 'Product card is missing renderable media');
      const media = catalog.media.find(asset => asset.mediaCode === card.media.primary.mediaCode);
      requireValue(media, 'Product media is outside the governed fixture manifest');
      const canonical = '/nodics/media/v0/content/' + encodeURIComponent(media.mediaCode);
      requireValue(card.media.primary.deliveryUrl === canonical, 'Product media delivery must use the canonical Media reference');
    }
    for (const productCode of catalog.productCodes) {
      requireValue(listing.products.some(product => product.productCode === productCode), 'Expected Online product is missing: ' + productCode);
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
      legacyProjectionQualification: summary ? { published: summary.published, projectionCount: summary.projectionCount } : null });
  }
  return { state: 'PASSED', onlineTransfer: 'EXTERNAL_GOVERNED_PREREQUISITE', summaries };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  if (process.argv.includes('--help')) console.log('acceptance:commerce-publication --execute --approve-publications [--legacy-projection-qualification]; requires tooling.acceptance.commercePublication catalogs, exact sourceVersion/targetVersion and approved Online receipts for six domains. Default checks governed delivery without publication writes. Optional legacy qualification writes Staged projections only. Never approves, restores or imports Online.');
  else runCommercePublicationAcceptance({ execute: process.argv.includes('--execute'), approvePublications: process.argv.includes('--approve-publications'), legacyProjectionQualification: process.argv.includes('--legacy-projection-qualification') }).then(result => console.log(JSON.stringify(result))).catch(error => { console.error(error.message); process.exitCode = 1; });
}
