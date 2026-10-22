/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module digitalCore/acceptance/defaultDigitalBundlePublicationAcceptanceService
 * @description Proves one reviewed certificate-and-realized-carbon manifest, exact Digital holds and
 * canonical Product publication. It provisions no identity, holding, listing context or permission.
 * @owner digitalCore
 * @layer tooling
 */
import { createHash } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import exact from '../../../../../../baseCommerce/modules/pricing/src/service/defaultExactAmountService.js';
import { createAcceptanceContext } from '../../../../../../../../nodics.foundation/modules/nTooling/src/service/project/defaultProjectAcceptanceService.mjs';
import { projectEndpointUrl, projectRuntimeAcceptance } from '../../../../../../../../nodics.foundation/modules/nTooling/src/service/project/defaultProjectEnvironmentConfigurationService.mjs';

const defaultAcceptanceName = 'digitalBundlePublication';
const identifierPattern = /^[A-Za-z0-9][A-Za-z0-9_.:@-]{0,191}$/;
const operationPattern = /^bundle-operation:[a-f0-9]{64}$/;
const manifestPattern = /^bundle:[a-f0-9]{64}$/;
const digestPattern = /^[a-f0-9]{64}$/;
const amountPattern = /^(?:0|[1-9]\d*)(?:\.\d+)?$/;

function requireEvidence(condition, code) {
  if (!condition) throw Object.assign(new Error(code), { code });
}

function exactKeys(value, keys) {
  return value && typeof value === 'object' && !Array.isArray(value) &&
    Object.keys(value).sort().join(',') === [...keys].sort().join(',');
}

function identifier(value) { return typeof value === 'string' && identifierPattern.test(value); }
function bearer(value) { return typeof value === 'string' && /^Bearer [^\s]{1,16384}$/i.test(value); }
function same(left, right) { return JSON.stringify(left) === JSON.stringify(right); }
function positiveAmount(value) { return typeof value === 'string' && value.length <= 128 && amountPattern.test(value) && /[1-9]/.test(value); }

function owner(value) {
  requireEvidence(exactKeys(value, ['module', 'schema', 'code']) && value.module === 'profile' &&
    ['customer', 'enterprise'].includes(value.schema) && identifier(value.code), 'REVIEWED_BUNDLE_PUBLICATION_OWNER_REQUIRED');
  return value;
}

function reference(value, moduleName, schema) {
  requireEvidence(exactKeys(value, ['module', 'schema', 'code']) && value.module === moduleName && value.schema === schema &&
    identifier(value.code), 'CANONICAL_BUNDLE_COMPONENT_REFERENCE_REQUIRED');
  return value;
}

/** Resolves one bounded project-owned acceptance profile name from CLI arguments. */
export function digitalBundlePublicationAcceptanceArgument(argv = []) {
  const values = argv.filter(argument => argument === '--acceptance' || argument.startsWith('--acceptance='));
  requireEvidence(values.length <= 1, 'ONE_BUNDLE_PUBLICATION_ACCEPTANCE_SELECTION_REQUIRED');
  if (!values.length) return defaultAcceptanceName;
  const name = values[0].startsWith('--acceptance=') ? values[0].slice('--acceptance='.length) : '';
  requireEvidence(/^[A-Za-z][A-Za-z0-9]{0,127}$/.test(name), 'BUNDLE_PUBLICATION_ACCEPTANCE_SELECTION_INVALID');
  return name;
}

/** Selects an own-property acceptance profile without embedding deployment identities in Digital. */
export function selectDigitalBundlePublicationAcceptance(profiles, name = defaultAcceptanceName) {
  requireEvidence(/^[A-Za-z][A-Za-z0-9]{0,127}$/.test(name) && profiles && Object.hasOwn(profiles, name) &&
    profiles[name] && typeof profiles[name] === 'object' && !Array.isArray(profiles[name]),
  'BUNDLE_PUBLICATION_ACCEPTANCE_PROFILE_UNAVAILABLE');
  return profiles[name];
}

/** Validates one reviewed fixture and original participant/runtime sessions before owner I/O. */
export function digitalBundlePublicationSelection(options = {}) {
  requireEvidence(options.execute === true, 'EXPLICIT_BUNDLE_PUBLICATION_ACCEPTANCE_EXECUTION_REQUIRED');
  requireEvidence(Number.isSafeInteger(options.maximumComponents) && options.maximumComponents >= 2,
    'BUNDLE_PUBLICATION_COMPONENT_BOUND_REQUIRED');
  const digitalUrl = new URL(options.digitalBaseUrl);
  const productUrl = new URL(options.productBaseUrl);
  for (const url of [digitalUrl, productUrl]) requireEvidence(['http:', 'https:'].includes(url.protocol) &&
    ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname) && !url.username && !url.password && url.pathname === '/' &&
    !url.search && !url.hash, 'LOCAL_BUNDLE_PUBLICATION_TARGET_REQUIRED');
  const s = structuredClone(options.selection);
  requireEvidence(exactKeys(s, ['contractVersion', 'approvalReference', 'localDemo', 'isolatedPartition', 'tenant', 'runCode',
    'owner', 'manifest', 'listing']) && s.contractVersion === 1 && s.localDemo === true && s.isolatedPartition === true &&
    [s.approvalReference, s.tenant, s.runCode].every(identifier) && s.runCode.length <= 80,
  'REVIEWED_LOCAL_BUNDLE_PUBLICATION_SELECTION_REQUIRED');
  requireEvidence(exactKeys(s.owner, ['ownerRef', 'enterpriseCode']) && identifier(s.owner.enterpriseCode),
    'REVIEWED_BUNDLE_PUBLICATION_ACTOR_REQUIRED');
  owner(s.owner.ownerRef);
  requireEvidence(exactKeys(s.manifest, ['idempotencyKey', 'components']) && identifier(s.manifest.idempotencyKey) &&
    Array.isArray(s.manifest.components) && s.manifest.components.length >= 2 &&
    s.manifest.components.length <= options.maximumComponents, 'REVIEWED_BUNDLE_PUBLICATION_MANIFEST_REQUIRED');
  const seen = new Set(), kinds = new Set();
  for (const component of s.manifest.components) {
    const keys = component?.kind === 'REALIZED_CARBON'
      ? ['kind', 'reference', 'quantity', 'expectedRevision', 'unitOfMeasure']
      : ['kind', 'reference', 'quantity', 'expectedRevision'];
    requireEvidence(exactKeys(component, keys) && ['CERTIFICATE', 'REALIZED_CARBON'].includes(component.kind) &&
      Number.isSafeInteger(component.expectedRevision) && component.expectedRevision >= 0 && positiveAmount(component.quantity),
    'REVIEWED_BUNDLE_PUBLICATION_COMPONENT_REQUIRED');
    if (component.kind === 'CERTIFICATE') {
      reference(component.reference, 'wasteCore', 'wasteAsset');
      requireEvidence(component.quantity === '1', 'CERTIFICATE_BUNDLE_QUANTITY_REQUIRED');
    } else {
      reference(component.reference, 'wasteCarbon', 'wasteCarbonLot');
      requireEvidence(typeof component.unitOfMeasure === 'string' && component.unitOfMeasure.trim() &&
        component.unitOfMeasure.length <= 100, 'REALIZED_CARBON_UNIT_REQUIRED');
    }
    const key = JSON.stringify(component.reference);
    requireEvidence(!seen.has(key), 'DUPLICATE_BUNDLE_PUBLICATION_COMPONENT');
    seen.add(key); kinds.add(component.kind);
  }
  requireEvidence(kinds.has('CERTIFICATE') && kinds.has('REALIZED_CARBON'),
    'CERTIFICATE_AND_REALIZED_CARBON_REQUIRED');
  const listingKeys = ['idempotencyKey', 'listingContextRef', 'storeEnterpriseCode', 'name', 'categoryCodes',
    'storeCode', 'saleMode', 'amount', 'currency', 'priceBookCode', 'reward', 'startsAt', 'endsAt'];
  requireEvidence((exactKeys(s.listing, listingKeys) || exactKeys(s.listing, [...listingKeys, 'description'])) &&
    identifier(s.listing.idempotencyKey) && identifier(s.listing.storeEnterpriseCode) && identifier(s.listing.storeCode) &&
    identifier(s.listing.currency) && identifier(s.listing.priceBookCode) && s.listing.saleMode === 'FIXED' &&
    typeof s.listing.name === 'string' && s.listing.name.trim() && s.listing.name.length <= 180 &&
    (s.listing.description === undefined || typeof s.listing.description === 'string' && s.listing.description.length <= 2000) &&
    positiveAmount(s.listing.amount) &&
    Array.isArray(s.listing.categoryCodes) && s.listing.categoryCodes.every(identifier) &&
    new Set(s.listing.categoryCodes).size === s.listing.categoryCodes.length,
  'REVIEWED_FIXED_BUNDLE_PUBLICATION_REQUIRED');
  requireEvidence(exactKeys(s.listing.listingContextRef, ['code', 'revision']) && identifier(s.listing.listingContextRef.code) &&
    Number.isSafeInteger(s.listing.listingContextRef.revision) && s.listing.listingContextRef.revision >= 0,
  'REVIEWED_BUNDLE_LISTING_CONTEXT_REQUIRED');
  requireEvidence(exactKeys(s.listing.reward, ['programCode', 'rewardTypeCode', 'scale']) &&
    identifier(s.listing.reward.programCode) && identifier(s.listing.reward.rewardTypeCode) &&
    Number.isSafeInteger(s.listing.reward.scale) && s.listing.reward.scale >= 0 && s.listing.reward.scale <= 100,
  'REVIEWED_BUNDLE_SETTLEMENT_REWARD_REQUIRED');
  for (const date of [s.listing.startsAt, s.listing.endsAt]) requireEvidence(date === null ||
    typeof date === 'string' && Number.isFinite(Date.parse(date)) && new Date(date).toISOString() === date,
  'EXPLICIT_BUNDLE_PUBLICATION_WINDOW_REQUIRED');
  requireEvidence(s.listing.startsAt === null || s.listing.endsAt === null || s.listing.endsAt > s.listing.startsAt,
    'BUNDLE_PUBLICATION_WINDOW_INVALID');
  const sessions = {};
  for (const [actor, enterpriseCode] of [['participant', s.owner.enterpriseCode],
    ['digitalRuntime', s.listing.storeEnterpriseCode], ['productRuntime', s.listing.storeEnterpriseCode]]) {
    const session = options.sessions?.[actor];
    requireEvidence(exactKeys(session, ['authorization', 'enterpriseCode']) && bearer(session.authorization) &&
      session.enterpriseCode === enterpriseCode, 'ORIGINAL_BUNDLE_PUBLICATION_SESSION_REQUIRED');
    sessions[actor] = { ...session };
  }
  return { selection: s, sessions, digitalBaseUrl: digitalUrl.origin, productBaseUrl: productUrl.origin };
}

/** Unwraps successful Nodics envelopes without accepting contradictory response shapes. */
export function digitalBundlePublicationData(value) {
  for (let depth = 0; depth < 8; depth += 1) {
    requireEvidence(value && typeof value === 'object' && !value.error && value.success !== false &&
      !(typeof value.code === 'string' && value.code.startsWith('ERR_')), 'BUNDLE_PUBLICATION_OWNER_RESPONSE_REFUSED');
    const data = Object.hasOwn(value, 'data'), result = Object.hasOwn(value, 'result');
    requireEvidence(!(data && result), 'BUNDLE_PUBLICATION_OWNER_RESPONSE_AMBIGUOUS');
    if (!data && !result) return value;
    value = data ? value.data : value.result;
  }
  requireEvidence(false, 'BUNDLE_PUBLICATION_OWNER_RESPONSE_DEPTH');
}

/** Creates or replays one exact manifest, publishes it and independently proves holds and Product Online state. */
export async function runDigitalBundlePublicationAcceptance(options = {}) {
  const selected = digitalBundlePublicationSelection(options);
  const { selection: s, sessions } = selected;
  const fetchRequest = options.fetch || globalThis.fetch;
  const timeout = options.requestTimeoutMs;
  requireEvidence(Number.isSafeInteger(timeout) && timeout >= 1 && timeout <= 60000, 'BUNDLE_PUBLICATION_TIMEOUT_INVALID');
  let stage = 'START';
  async function http(baseUrl, actor, module, route, body, key) {
    stage = module + ':POST:' + route;
    let response;
    try {
      response = await fetchRequest(new URL('/nodics/' + module + '/v0' + route, baseUrl), {
        method: 'POST', redirect: 'error', cache: 'no-store', signal: AbortSignal.timeout(timeout),
        headers: { Accept: 'application/json', 'Content-Type': 'application/json', tenant: s.tenant,
          'x-enterprise-code': actor.enterpriseCode, Authorization: actor.authorization,
          'x-correlation-id': s.runCode, ...(key ? { 'Idempotency-Key': key } : {}) },
        body: JSON.stringify(body),
      });
    } catch { requireEvidence(false, 'BUNDLE_PUBLICATION_HTTP_OUTCOME_UNCONFIRMED'); }
    requireEvidence(response.ok, 'BUNDLE_PUBLICATION_HTTP_' + response.status);
    let value;
    try { value = await response.json(); } catch { requireEvidence(false, 'BUNDLE_PUBLICATION_OWNER_RESPONSE_INVALID'); }
    return digitalBundlePublicationData(value);
  }
  const listingTerms = { listingContextRef: s.listing.listingContextRef, name: s.listing.name,
    ...(s.listing.description === undefined ? {} : { description: s.listing.description }),
    categoryCodes: s.listing.categoryCodes, storeCode: s.listing.storeCode,
    saleMode: s.listing.saleMode, amount: s.listing.amount, currency: s.listing.currency,
    priceBookCode: s.listing.priceBookCode, reward: s.listing.reward, startsAt: s.listing.startsAt, endsAt: s.listing.endsAt };
  try {
    const manifest = await http(selected.digitalBaseUrl, sessions.participant, 'digitalCore', '/bundles', {
      ownerRef: s.owner.ownerRef, idempotencyKey: s.manifest.idempotencyKey,
      components: s.manifest.components,
      composition: { mode: 'FIXED', operationKey: s.listing.idempotencyKey, terms: listingTerms },
    }, s.manifest.idempotencyKey);
    requireEvidence(manifestPattern.test(manifest.code || '') && manifest.status === 'ACTIVE' &&
      Number.isSafeInteger(manifest.revision) && manifest.revision >= 0 && same(manifest.ownerRef, s.owner.ownerRef) &&
      same(manifest.components, [...s.manifest.components].sort((left, right) =>
        JSON.stringify(left.reference).localeCompare(JSON.stringify(right.reference)))) && digestPattern.test(manifest.digest || '') &&
      !Object.hasOwn(manifest, 'rewards') && !manifest.components.some(component => /REWARD/i.test(component.kind)),
    'EXACT_CERTIFICATE_CARBON_MANIFEST_REQUIRED');
    const publication = await http(selected.digitalBaseUrl, sessions.participant, 'digitalCore', '/bundle-listings', {
      manifestCode: manifest.code, manifestRevision: manifest.revision, idempotencyKey: s.listing.idempotencyKey,
      confirmed: true, ...listingTerms,
    }, s.listing.idempotencyKey);
    requireEvidence(publication.confirmed === true && operationPattern.test(publication.operationCode || '') &&
      publication.publicationCode === publication.operationCode && publication.status === 'PUBLISHED' &&
      publication.quantity === '1' && publication.biddingMode === 'FIXED' &&
      same(publication.listingContextRef, s.listing.listingContextRef) && identifier(publication.productCode) &&
      identifier(publication.variantCode) && identifier(publication.sku) && identifier(publication.bindingCode),
    'EXACT_DIGITAL_BUNDLE_PUBLICATION_REQUIRED');
    const selectors = { operationCode: publication.operationCode, storeCode: s.listing.storeCode };
    const proof = await http(selected.digitalBaseUrl, sessions.digitalRuntime, 'digitalCore', '/internal/bundle-listings/proof', selectors);
    requireEvidence(proof.confirmed === true && proof.operationCode === publication.operationCode &&
      proof.enterpriseCode === s.listing.storeEnterpriseCode && same(proof.ownerRef, s.owner.ownerRef) &&
      digestPattern.test(proof.termsDigest || '') && same(proof.terms, {
        storeCode: s.listing.storeCode, currency: s.listing.currency, priceBookCode: s.listing.priceBookCode,
        reward: s.listing.reward, saleMode: 'FIXED', name: s.listing.name.trim(),
        ...(s.listing.description === undefined ? {} : { description: s.listing.description }),
        amount: exact.normalize(s.listing.amount), startsAt: s.listing.startsAt, endsAt: s.listing.endsAt,
        categoryCodes: [...s.listing.categoryCodes].sort(),
      }) && proof.manifest?.code === manifest.code && proof.manifest.revision === manifest.revision &&
      proof.manifest.digest === manifest.digest && same(proof.product, {
        confirmed: true, publicationCode: publication.publicationCode, productCode: publication.productCode,
        variantCode: publication.variantCode, sku: publication.sku, versionId: publication.versionId,
      }) && proof.price?.confirmed === true && proof.release === null,
    'EXACT_DIGITAL_HOLDING_PROOF_REQUIRED');
    const product = await http(selected.productBaseUrl, sessions.productRuntime, 'product', '/internal/products/bundle-listings/inspect', selectors);
    requireEvidence(product.confirmed === true && product.status === 'ONLINE' &&
      product.publicationCode === publication.publicationCode && product.productCode === publication.productCode &&
      product.variantCode === publication.variantCode && product.storeCode === s.listing.storeCode &&
      product.targetVersion !== undefined && product.targetVersion !== null && product.receiptCode,
    'EXACT_PRODUCT_PUBLICATION_DELEGATION_REQUIRED');
    return { contractVersion: 1, state: 'PASSED', manifestCode: manifest.code,
      publicationCode: publication.publicationCode, productCode: publication.productCode,
      selectionDigest: createHash('sha256').update(JSON.stringify(s)).digest('hex'),
      componentKinds: ['CERTIFICATE', 'REALIZED_CARBON'], componentReservationsConfirmed: true,
      rewardsIncludedInBundle: false, productPublicationConfirmed: true };
  } catch (error) {
    return { contractVersion: 1, state: 'RECOVERY_REQUIRED', stage,
      reasonCode: /^[A-Z][A-Z0-9_]{0,95}$/.test(error?.code || '') ? error.code : 'BUNDLE_PUBLICATION_OWNER_OUTCOME_UNCONFIRMED' };
  }
}

/** Loads only project-selected fixture identities and externally supplied original sessions. */
export async function runConfiguredDigitalBundlePublicationAcceptance(options = {}) {
  const context = await createAcceptanceContext(options);
  const profiles = projectRuntimeAcceptance(context.projectRoot, context.configuration, { role: 'COMMERCE' });
  const selection = options.selection || selectDigitalBundlePublicationAcceptance(profiles,
    options.acceptanceName || defaultAcceptanceName);
  const token = value => value ? (value.startsWith('Bearer ') ? value : 'Bearer ' + value) : '';
  const sessions = options.sessions || {
    participant: { authorization: token(context.environment.NODICS_DIGITAL_BUNDLE_PUBLICATION_PARTICIPANT_TOKEN),
      enterpriseCode: selection.owner?.enterpriseCode },
    digitalRuntime: { authorization: token(context.environment.NODICS_DIGITAL_BUNDLE_PUBLICATION_DIGITAL_RUNTIME_TOKEN),
      enterpriseCode: selection.listing?.storeEnterpriseCode },
    productRuntime: { authorization: token(context.environment.NODICS_DIGITAL_BUNDLE_PUBLICATION_PRODUCT_RUNTIME_TOKEN),
      enterpriseCode: selection.listing?.storeEnterpriseCode },
  };
  const defaults = context.configuration?.digitalCore?.bundleListings?.acceptance || {};
  return runDigitalBundlePublicationAcceptance({ ...options, execute: options.execute, selection, sessions,
    maximumComponents: options.maximumComponents ?? context.configuration?.digitalCore?.bundles?.maximumComponents,
    requestTimeoutMs: options.requestTimeoutMs ?? defaults.requestTimeoutMs,
    digitalBaseUrl: options.digitalBaseUrl || projectEndpointUrl(context.configuration, { role: 'COMMERCE' }),
    productBaseUrl: options.productBaseUrl || projectEndpointUrl(context.configuration, { role: 'COMMERCE_STAGED' }) });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  if (process.argv.includes('--help')) console.log('acceptance:digital-bundle-publication --execute [--acceptance=<name>]; requires one reviewed local certificate-and-realized-carbon listing profile plus NODICS_DIGITAL_BUNDLE_PUBLICATION_PARTICIPANT_TOKEN, NODICS_DIGITAL_BUNDLE_PUBLICATION_DIGITAL_RUNTIME_TOKEN and NODICS_DIGITAL_BUNDLE_PUBLICATION_PRODUCT_RUNTIME_TOKEN. It creates no identity, holdings, context or permission.');
  else runConfiguredDigitalBundlePublicationAcceptance({ execute: process.argv.includes('--execute'),
    acceptanceName: digitalBundlePublicationAcceptanceArgument(process.argv.slice(2)) })
    .then(result => { console.log(JSON.stringify(result, null, 2)); process.exitCode = result.state === 'PASSED' ? 0 : 1; })
    .catch(error => { console.error(JSON.stringify({ state: 'FAILED', reasonCode: error.code || error.message })); process.exitCode = 1; });
}
