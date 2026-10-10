#!/usr/bin/env node
/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
/** @module eWaste/service/acceptance/defaultEWasteDigitalOwnershipAcceptanceService
 * @description Opt-in signed LOCAL acceptance for one reviewed original ownership sale/refund using exact Profile, Commerce, Waste and Loyalty owner APIs. Source contracts are not deployed API qualification.
 * @layer tooling @owner eWaste
 * @override Later applications supply topology, exact reviewed selectors and existing Profile access sessions; assertions and business operations remain capability-owned.
 * @sideEffects Plan is read-only. Explicit reviewed execution purchases and refunds through normal owner APIs; unavailable evidence refuses before Cart. No runtime launch, seeds, authority grants, qualification writes or simulated financial records.
 */
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { isDeepStrictEqual } from 'node:util';
import { createAcceptanceContext } from '../../../../../../../../nodics.foundation/modules/nTooling/src/service/project/defaultProjectAcceptanceService.mjs';
import { projectEndpointUrl } from '../../../../../../../../nodics.foundation/modules/nTooling/src/service/project/defaultProjectEnvironmentConfigurationService.mjs';
const require = createRequire(import.meta.url);
const inspection = require('../../../../../../../../nodics.waste/modules/wasteCore/src/service/defaultWasteInstalledDataInspectionService');
const exact = require('../../../../../../../../nodics.foundation/modules/nCommon/src/utils/exactAmount');
const hash = value => inspection.checksum(JSON.parse(JSON.stringify(value)));
const identifier = value => typeof value === 'string' && /^[A-Za-z0-9][A-Za-z0-9_.:@|\-]{0,179}$/.test(value);
const key = value => typeof value === 'string' && /^[A-Za-z0-9._:-]{8,150}$/.test(value);
const ref = code => ({ module: 'profile', schema: 'customer', code });
function requireEvidence(condition, message) { if (!condition) throw new Error(message); }
function equalAmount(actual, expected) { return exact.compare(String(actual), String(expected)) === 0; }
const moduleRoots = Object.freeze({
  wasteCore: 'nodics.waste/modules/wasteCore', loyaltyWallet: 'nodics.loyalty/modules/loyaltyWallet',
  loyaltyLedger: 'nodics.loyalty/modules/loyaltyLedger', profile: 'nodics.platform/modules/profile',
  digitalCore: 'nodics.commerce/modules/digitalCommerce/modules/digitalCore',
  product: 'nodics.commerce/modules/baseCommerce/modules/product', store: 'nodics.commerce/modules/baseCommerce/modules/store',
  cart: 'nodics.commerce/modules/checkout/modules/cart', order: 'nodics.commerce/modules/checkout/modules/order',
  paymentCore: 'nodics.commerce/modules/payment/modules/paymentCore',
});
/** Read inert router declarations without executing another owner's schema file (some depend on booted ENUMS). */
function declaredSchemaRouter(path, schema) {
  const ast = require('acorn').parse(readFileSync(require.resolve(path), 'utf8'), { ecmaVersion: 'latest', sourceType: 'script' });
  const property = (node, name) => node?.properties?.find(value => value.type === 'Property' && (value.key.name || value.key.value) === name)?.value;
  const router = node => {
    if (node?.type === 'ObjectExpression') return property(node, 'router');
    if (node?.type === 'CallExpression' && node.callee?.object?.name === 'Object' && node.callee.property?.name === 'assign')
      return node.arguments.map(router).filter(Boolean).at(-1);
  };
  const stack = [ast], matches = [];
  while (stack.length) {
    const node = stack.pop();
    if (!node || typeof node !== 'object') continue;
    if (node.type === 'Property' && (node.key.name || node.key.value) === schema) {
      const declaration = router(node.value); if (declaration) matches.push(declaration);
    }
    for (const value of Object.values(node)) {
      if (Array.isArray(value)) stack.push(...value); else if (value && typeof value === 'object') stack.push(value);
    }
  }
  requireEvidence(matches.length === 1, 'Unambiguous owner schema router declaration required');
  const declaration = matches[0];
  return { enabled: property(declaration, 'enabled')?.value === true,
    alias: property(declaration, 'alias')?.value || schema,
    selected: property(declaration, 'groups') === undefined || property(property(declaration, 'groups'), 'schemaOperations')?.value === true };
}

/** Source contract only, not proof that effective deployment exposure or signed access succeeds. Hidden modules never get invented schema routes. */
export function schemaReadContract(module, schema) {
  requireEvidence(Object.hasOwn(moduleRoots, module), 'Unknown ownership evidence owner');
  const root = '../../../../../../../../' + moduleRoots[module];
  const metadata = require(root + '/package.json'), declaration = declaredSchemaRouter(root + '/src/schemas/schemas.js', schema);
  const exposed = metadata.nodics?.runtime?.router === true && declaration.enabled && declaration.selected;
  return { module, schema, moduleRouter: metadata.nodics?.runtime?.router === true,
    schemaRoute: exposed ? '/nodics/' + module + '/v0/' + declaration.alias.toLowerCase() : null,
    sourceContractOnly: true, requiresEffectiveExposure: true };
}

/** Validates intent only; a descriptor never grants a runtime permission, policy or financial approval. */
export function validateSelection(s) {
  const fields = ['tenant', 'enterpriseCode', 'storeCode', 'locale', 'jurisdiction', 'productCode', 'variantCode', 'sku',
    'assetCode', 'bindingCode', 'projectionCode', 'transferPolicyCode', 'rewardPolicyCode', 'carbonPolicyCode',
    'buyerCode', 'buyerLoginId', 'sellerCode', 'sellerLoginId', 'buyerWalletCode', 'sellerWalletCode',
    'programCode', 'rewardTypeCode', 'cartCode', 'orderCode'];
  requireEvidence(s && fields.every(field => identifier(s[field])), 'Exact reviewed ownership selectors are required');
  const allowed = [...fields, 'currency', 'amount', 'checkoutKey', 'disputeKey', 'refundKey', 'refundReason', 'reviewedPlanDigest'];
  requireEvidence(Object.keys(s).every(field => allowed.includes(field)), 'Unknown ownership selection fields are prohibited');
  requireEvidence(s.buyerCode !== s.sellerCode && s.buyerLoginId !== s.sellerLoginId && s.buyerWalletCode !== s.sellerWalletCode,
    'Distinct canonical buyer and original seller are required');
  requireEvidence(s.currency === 'POINTS' && typeof s.amount === 'string' && /^\d+(?:\.\d+)?$/.test(s.amount) && exact.compare(s.amount, '0') > 0,
    'Positive exact reviewed POINTS amount required');
  requireEvidence(['checkoutKey', 'disputeKey', 'refundKey'].every(field => key(s[field])) &&
    new Set([s.checkoutKey, s.disputeKey, s.refundKey]).size === 3, 'Distinct stable original command keys required');
  requireEvidence(typeof s.refundReason === 'string' && s.refundReason.trim().length >= 10 && s.refundReason.length <= 2000,
    'Exact reviewed original refund reason required');
  return s;
}

/** Uses only canonical owner routes, original human sessions and tenant/enterprise selectors. Responses and tokens are never logged. */
function client(context, actors, s) {
  requireEvidence(context?.request && context.configuration && actors && ['buyer', 'seller', 'reviewer', 'inspector'].every(actor =>
    /^Bearer [^\s]+$/.test(actors[actor]?.Authorization || actors[actor]?.authorization || '')), 'Existing signed Profile access sessions required');
  for (const actor of ['loyalty', 'commerce', 'waste']) if (actors[actor]) requireEvidence(
    /^Bearer [^\s]+$/.test(actors[actor].Authorization || actors[actor].authorization || ''), 'Existing signed owner evidence runtime sessions required');
  for (const role of ['PLATFORM', 'COMMERCE', 'WASTE', 'LOYALTY']) {
    const url = new URL(projectEndpointUrl(context.configuration, { role }));
    requireEvidence(['localhost', '127.0.0.1', '[::1]'].includes(url.hostname) && url.protocol === 'http:', 'Explicit native loopback topology required');
  }
  const call = async (actor, role, route, method = 'GET', body, commandKey) => {
    try {
      const result = await context.request(role, route, { method,
        headers: { ...actors[actor], ...(['loyalty', 'commerce', 'waste'].includes(actor) ? {} : { 'x-enterprise-code': s.enterpriseCode }),
          ...(commandKey ? { 'Idempotency-Key': commandKey } : {}) }, ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
      requireEvidence(result && !result.error && result.success !== false && !/^ERR_/.test(result.code || ''), 'Owner refused request');
      return result;
    } catch (error) {
      const safe = new Error('Ownership acceptance owner request failed: ' + role + ' ' + method + ' ' + route.split('?')[0]);
      safe.code = typeof error?.code === 'string' && /^[A-Z0-9_]{1,100}$/.test(error.code) ? error.code : 'OWNER_REQUEST_UNCONFIRMED';
      throw safe;
    }
  };
  const rows = async (role, module, schema, query) => {
    // This existing capability reads identity only. Do not use wallet-projections here: it can create a missing wallet.
    if (module === 'loyaltyWallet' && schema === 'loyaltyWallet' && Object.keys(query).length === 1 && identifier(query.code)) {
      const value = await call('inspector', 'LOYALTY', '/nodics/loyaltyApi/v0/wallets/' + encodeURIComponent(query.code));
      requireEvidence(value?.code === query.code && value.tenant === s.tenant, 'Exact native wallet identity required');
      return [value];
    }
    throw new Error('Generic schema HTTP is not an ownership evidence contract: ' + module + '/' + schema);
  };
  const one = async (role, module, schema, query) => {
    const value = await rows(role, module, schema, query);
    requireEvidence(value.length === 1, 'One exact native ' + schema + ' record required');
    return value[0];
  };
  return { call, rows, one };
}

/** Reads already-existing wallets only; unlike ownerWalletProjection this cannot open a missing wallet. */
async function wallet(c, s, actor) {
  const code = s[actor + 'WalletCode'];
  const evidence = await c.call('loyalty', 'LOYALTY', '/nodics/loyaltyApi/v0/wallet-evidence', 'POST', {
    enterpriseCode: s.enterpriseCode, customerCode: s[actor + 'Code'], programCode: s.programCode, rewardTypeCode: s.rewardTypeCode });
  requireEvidence(evidence.contractVersion === 1 && evidence.tenant === s.tenant && evidence.enterpriseCode === s.enterpriseCode &&
    evidence.customerCode === s[actor + 'Code'], 'Exact signed Loyalty wallet scope required');
  const value = evidence.wallet;
  requireEvidence(value.ownerType === 'CUSTOMER' && value.ownerCode === s[actor + 'Code'] && value.status === 'OPEN', 'Exact existing customer wallet required');
  const balance = evidence.balance;
  requireEvidence(value.code === code && value.tenant === s.tenant && balance?.tenant === s.tenant && balance.walletCode === code &&
    balance.programCode === s.programCode && balance.rewardTypeCode === s.rewardTypeCode &&
    [balance.available, balance.reserved].every(v => typeof v === 'string' && /^\d+(?:\.\d+)?$/.test(v)), 'Exact existing reward balance required');
  return { code, available: String(balance.available), reserved: String(balance.reserved), revision: balance.revision };
}

/** Fixed Commerce owner aggregate; signed runtime authority remains with the receiving capability. */
async function commerce(c, s, kind, selectors = {}) {
  const value = await c.call('commerce', 'COMMERCE', '/nodics/digitalCore/v0/internal/ownership/evidence/query', 'POST', {
    contractVersion: 1, kind, enterpriseCode: s.enterpriseCode, bindingCode: s.bindingCode, productCode: s.productCode,
    sku: s.sku, storeCode: s.storeCode, locale: s.locale, ...selectors });
  requireEvidence(value?.contractVersion === 1 && value.kind === kind, 'Exact Commerce evidence contract required');
  return value;
}

/** Exact Waste evidence is a business owner capability, not maintenance-inspector disclosure expansion. */
async function wasteEvidence(c, s, kind, selectors = {}) {
  const value = await c.call('waste', 'WASTE', '/nodics/eWaste/v0/internal/digital-sales/evidence', 'POST', {
    contractVersion: 1, kind, enterpriseCode: s.enterpriseCode, bindingCode: s.bindingCode, productCode: s.productCode, sku: s.sku,
    storeCode: s.storeCode, locale: s.locale, assetCode: s.assetCode, ...selectors });
  requireEvidence(value?.contractVersion === 1 && value.kind === kind && value.tenant === s.tenant && value.enterpriseCode === s.enterpriseCode &&
    value.asset?.code === s.assetCode && value.asset.tenant === s.tenant && value.projection?.code === s.projectionCode &&
    value.pins && Object.values(value.pins).every(v => /^[a-f0-9]{64}$/.test(v)), 'Exact private Waste evidence scope required');
  return value;
}

/** Full assertions remain separate from capability preflight; they must never run through invented hidden-module HTTP routes. */
async function buildOwnershipPlan({ context, actors, selection }) {
  const s = validateSelection(selection), c = client(context, actors, s);
  const binding = (await commerce(c, s, 'BINDING')).binding;
  const native = await wasteEvidence(c, s, 'LISTING');
  const { asset, projection, policies: { transfer, reward, carbon } } = native;
  requireEvidence(binding && transfer?.code === s.transferPolicyCode && reward?.code === s.rewardPolicyCode && carbon?.code === s.carbonPolicyCode,
    'Exact original binding and reviewed policy identities required');
  const provider = binding.providerReference;
  requireEvidence(binding.active === true && binding.status === 'ACTIVE' && binding.productCode === s.productCode && binding.variantCode === s.variantCode &&
    binding.sku === s.sku && binding.providerOwner === 'wasteCore' && binding.digitalDeliveryType === 'DIGITAL_OWNERSHIP' && binding.inventoryStrategy === 'DIGITAL_COMMERCE' &&
    provider?.assetCode === s.assetCode && provider.projectionCode === s.projectionCode && provider.storeCode === s.storeCode &&
    isDeepStrictEqual(provider.sellerRef, ref(s.sellerCode)) && provider.transferPolicyCode === s.transferPolicyCode &&
    provider.rewardSettlementPolicyCode === s.rewardPolicyCode && provider.carbonSettlementPolicyCode === s.carbonPolicyCode, 'Reviewed exact ownership binding changed');
  requireEvidence(asset.active === true && asset.assetStatus === 'LISTED' && !asset.metadata?.pendingTransferCode && !asset.metadata?.pendingRefundCode &&
    isDeepStrictEqual(asset.ownerRef, ref(s.sellerCode)) && isDeepStrictEqual(asset.digitalOwnerRef, ref(s.sellerCode)) &&
    asset.marketplaceProjectionRef?.code === s.projectionCode && projection.active === true && projection.projectionStatus === 'LISTED' &&
    projection.assetCode === s.assetCode && projection.commerceProductRef?.code === s.productCode, 'Original listed seller asset required');
  const terms = reward.metadata?.digitalOwnership;
  requireEvidence([transfer, reward, carbon].every(row => row.active === true && row.status === 'ACTIVE') &&
    transfer.metadata?.digitalOwnership?.refund === 'ORIGINAL_TRANSFER_REVERSAL_ONLY_BEFORE_ONWARD_TRANSFER' &&
    reward.walletCurrencyCode === s.currency && terms?.proceeds === 'CAPTURED_TOTAL' && terms.payee === 'CURRENT_SELLER' &&
    terms.programCode === s.programCode && terms.rewardTypeCode === s.rewardTypeCode && carbon.settlementMode === 'NONE', 'Exact reviewed original no-fee/no-carbon refund policy required');
  for (const actor of ['buyer', 'seller']) {
    const value = await c.call('loyalty', 'PLATFORM', '/nodics/profile/v0/internal/customer-evidence', 'POST', {
      contractVersion: 1, enterpriseCode: s.enterpriseCode, identifier: s[actor + 'Code'] });
    requireEvidence(value?.contractVersion === 1 && value.tenant === s.tenant && value.enterpriseCode === s.enterpriseCode &&
      value.customer?.code === s[actor + 'Code'] && value.customer.active === true &&
      value.customer.loginId === s[actor + 'LoginId'], 'Canonical customer code/login pair changed');
  }
  const buyer = await wallet(c, s, 'buyer'), seller = await wallet(c, s, 'seller');
  requireEvidence(exact.compare(buyer.available, s.amount) >= 0, 'Existing buyer funds required; acceptance never seeds rewards');
  const intent = { ...s }; delete intent.reviewedPlanDigest;
  const plan = { contractVersion: 1, intent, pins: { binding: hash(binding), ...native.pins },
    assetRevision: asset.revision, custody: { physicalOwnerRef: asset.physicalOwnerRef ?? null, custodyStatus: asset.custodyStatus ?? null }, buyer, seller };
  return { ...plan, planDigest: hash(plan), state: 'READ_ONLY_PLAN', productionQualified: false };
}

/** Enumerates an existing maintenance inspection without expanding its transaction fingerprint disclosure ceiling. */
async function inspectWaste(c, resource, code, tenant) {
  let found, total, expectedLimit, disclosure;
  const seen = new Set();
  for (let page = 1; page <= 20; page++) {
    const result = await c.call('inspector', 'WASTE', '/nodics/wasteApi/v0/waste/installed-data/inspect', 'POST', { resource, page });
    requireEvidence(result?.resource === resource && result.page === page && Number.isSafeInteger(result.total) && result.total >= 0 &&
      Number.isSafeInteger(result.limit) && result.limit >= 1 && result.limit <= 500 && Array.isArray(result.items) &&
      /^[a-f0-9]{64}$/.test(result.pageChecksum || '') && ['REFERENCE', 'FINGERPRINT'].includes(result.mode) &&
      result.migrationAuthorized === false, 'Bounded canonical Waste inspection required');
    requireEvidence(resource !== 'wasteAsset' || result.mode === 'FINGERPRINT', 'Waste transaction fingerprint ceiling required');
    total ??= result.total; expectedLimit ??= result.limit; disclosure ??= result.mode;
    requireEvidence(total === result.total && expectedLimit === result.limit && disclosure === result.mode &&
      result.items.length === Math.min(result.limit, Math.max(0, total - (page - 1) * result.limit)), 'Waste inspection changed or truncated');
    for (const item of result.items) {
      requireEvidence(identifier(item?.code) && !seen.has(item.code) && /^[a-f0-9]{64}$/.test(item.checksum || ''), 'Unique Waste inspection identities required');
      requireEvidence(result.mode !== 'FINGERPRINT' || Object.keys(item).every(key => ['code', 'checksum'].includes(key)),
        'Waste transaction inspection must not disclose record fields');
      seen.add(item.code);
      if (item.code === code) found = item;
    }
    requireEvidence(result.pageChecksum === hash({ tenant, resource, page, limit: result.limit, total,
      items: result.items.map(({ code, checksum }) => ({ code, checksum })) }), 'Canonical Waste inspection checksum changed');
    const next = page * result.limit < total ? page + 1 : null;
    requireEvidence(result.nextPage === next, 'Canonical Waste pagination required');
    if (next === null) return found ? { present: true, checksum: found.checksum, disclosure: result.mode } : { present: false, disclosure: result.mode };
  }
  throw new Error('Waste inspection exceeds bounded acceptance enumeration; use owner maintenance inspection');
}

/** Actual existing capability routes only. A fingerprint or wallet identity cannot substitute for private ownership or financial readback. */
export async function planOwnershipAcceptance({ context, actors, selection }) {
  const s = validateSelection(selection), c = client(context, actors, s);
  if (actors.loyalty && actors.commerce && actors.waste) {
    const plan = await buildOwnershipPlan({ context, actors, selection: s });
    return { contractVersion: 1, state: 'READ_ONLY_PLAN', planDigest: plan.planDigest, assetCode: s.assetCode, orderCode: s.orderCode,
      executable: true, nativeSaleRefundProven: false, productionQualified: false };
  }
  const wallets = {};
  for (const actor of ['buyer', 'seller']) {
    const evidence = actors.loyalty ? await c.call('loyalty', 'LOYALTY', '/nodics/loyaltyApi/v0/wallet-evidence', 'POST', {
      enterpriseCode: s.enterpriseCode, customerCode: s[actor + 'Code'], programCode: s.programCode, rewardTypeCode: s.rewardTypeCode }) : null;
    if (evidence) requireEvidence(evidence.contractVersion === 1 && evidence.tenant === s.tenant &&
      evidence.enterpriseCode === s.enterpriseCode && evidence.customerCode === s[actor + 'Code'], 'Exact signed Loyalty scope required');
    const value = evidence ? evidence.wallet : await c.one('LOYALTY', 'loyaltyWallet', 'loyaltyWallet', { code: s[actor + 'WalletCode'] });
    requireEvidence(value?.code === s[actor + 'WalletCode'] && value.tenant === s.tenant && value.active !== false &&
      value.status === 'OPEN' && value.ownerType === 'CUSTOMER' && value.ownerCode === s[actor + 'Code'],
      'Exact existing canonical customer wallet required');
    const balance = evidence?.balance;
    if (balance) requireEvidence(balance.tenant === s.tenant && balance.walletCode === value.code && balance.programCode === s.programCode &&
      balance.rewardTypeCode === s.rewardTypeCode && typeof balance.available === 'string' && /^\d+(?:\.\d+)?$/.test(balance.available) &&
      typeof balance.reserved === 'string' && /^\d+(?:\.\d+)?$/.test(balance.reserved), 'Exact signed Loyalty balance required');
    wallets[actor] = { identityVerified: true, balanceVerified: Boolean(balance), ledgerVerified: false,
      ...(actor === 'buyer' && balance ? { sufficientExistingFunds: exact.compare(balance.available, s.amount) >= 0 } : {}) };
  }
  const asset = await inspectWaste(c, 'wasteAsset', s.assetCode, s.tenant);
  const policies = {};
  for (const [name, resource, code] of [['transfer', 'wasteAssetTransferPolicy', s.transferPolicyCode],
    ['reward', 'wasteRewardSettlementPolicy', s.rewardPolicyCode], ['carbon', 'wasteCarbonSettlementPolicy', s.carbonPolicyCode]])
    policies[name] = await inspectWaste(c, resource, code, s.tenant);
  const digital = actors.commerce ? await c.call('commerce', 'COMMERCE', '/nodics/digitalCore/v0/internal/ownership/evidence/query', 'POST', {
    contractVersion: 1, kind: 'BINDING', enterpriseCode: s.enterpriseCode, bindingCode: s.bindingCode, productCode: s.productCode,
    sku: s.sku, storeCode: s.storeCode, locale: s.locale }) : null;
  if (digital) requireEvidence(digital.contractVersion === 1 && digital.kind === 'BINDING' && digital.binding?.tenant === s.tenant &&
    digital.binding.enterpriseCode === s.enterpriseCode && digital.binding.code === s.bindingCode && digital.binding.productCode === s.productCode &&
    digital.binding.sku === s.sku, 'Exact signed Digital binding evidence required');
  const blockers = ['WASTE_RUNTIME_EVIDENCE_SESSION_REQUIRED'];
  if (!actors.loyalty) blockers.push('LOYALTY_RUNTIME_EVIDENCE_SESSION_REQUIRED');
  else if (Object.values(wallets).some(value => !value.balanceVerified)) blockers.push('LOYALTY_BALANCE_MISSING');
  if (!actors.commerce) blockers.push('COMMERCE_RUNTIME_EVIDENCE_SESSION_REQUIRED');
  if (wallets.buyer.sufficientExistingFunds === false) blockers.push('INSUFFICIENT_EXISTING_BUYER_FUNDS');
  if (!asset.present) blockers.push('WASTE_ASSET_MISSING');
  if (Object.values(policies).some(value => !value.present)) blockers.push('INSTALLED_POLICY_MISSING');
  return { contractVersion: 1, state: 'BLOCKED_OWNER_EVIDENCE', assetCode: s.assetCode, orderCode: s.orderCode,
    wallets, asset, policies, bindingPresent: digital ? true : null, blockers,
    executable: false, nativeSaleRefundProven: false, productionQualified: false };
}

/** Verifies unique real original ledger entries, never accepting a successful checkpoint alone. */
async function ledger(c, s, code, expected) {
  const customerCode = expected.walletCode === s.buyerWalletCode ? s.buyerCode : expected.walletCode === s.sellerWalletCode ? s.sellerCode : null;
  requireEvidence(customerCode && expected.sourceType && expected.sourceCode, 'Exact original ledger customer/source selectors required');
  const evidence = await c.call('loyalty', 'LOYALTY', '/nodics/loyaltyApi/v0/reward-ledger-evidence', 'POST', {
    enterpriseCode: s.enterpriseCode, customerCode, programCode: s.programCode, rewardTypeCode: s.rewardTypeCode,
    sourceType: expected.sourceType, sourceCode: expected.sourceCode,
    ...(code ? { entryCode: code } : { reversalOfEntryCode: expected.reversalOfEntryCode }) });
  requireEvidence(evidence?.contractVersion === 1 && evidence.tenant === s.tenant && evidence.enterpriseCode === s.enterpriseCode &&
    evidence.customerCode === customerCode && evidence.wallet?.code === expected.walletCode && evidence.entries?.length === 1, 'One exact native ledger entry required');
  const row = evidence.entries[0];
  requireEvidence(Object.entries(expected).every(([field, value]) => row[field] === value) &&
    row.programCode === s.programCode && row.rewardTypeCode === s.rewardTypeCode && equalAmount(row.amount, s.amount), 'Original native ledger evidence changed');
  return row;
}

/** Drives only normal public purchase/review APIs. The original capture, seller settlement and refund are verified through independently protected native owner reads. */
export async function runOwnershipAcceptance({ context, actors, selection, confirmed = false }) {
  const s = validateSelection(selection);
  requireEvidence(confirmed === true && /^[a-f0-9]{64}$/.test(s.reviewedPlanDigest || ''), 'Explicit execution confirmation and reviewed plan digest required');
  const readiness = await planOwnershipAcceptance({ context, actors, selection: s });
  if (!readiness.executable) {
    const error = new Error('Native ownership execution unavailable: ' + readiness.blockers.join(', '));
    error.code = 'OWNER_EVIDENCE_API_UNAVAILABLE';
    throw error;
  }
  const plan = await buildOwnershipPlan({ context, actors, selection: s });
  requireEvidence(plan.planDigest === s.reviewedPlanDigest, 'Native ownership plan changed; review again before mutation');
  const c = client(context, actors, s), path = '/nodics/cart/v0/carts/' + encodeURIComponent(s.cartCode);
  const custody = asset => ({ physicalOwnerRef: asset.physicalOwnerRef ?? null, custodyStatus: asset.custodyStatus ?? null });
  const created = await c.call('buyer', 'COMMERCE', '/nodics/cart/v0/carts', 'POST', { cartCode: s.cartCode, storeCode: s.storeCode,
    locale: s.locale, jurisdiction: s.jurisdiction, currency: s.currency }, s.checkoutKey + ':cart');
  requireEvidence(created.cart?.code === s.cartCode && Array.isArray(created.entries) && created.entries.length === 0,
    'A fresh exact empty owned Cart is required; existing commands need owner recovery');
  const cart = await c.call('buyer', 'COMMERCE', path + '/entries', 'POST', {
    productCode: s.productCode, variantCode: s.variantCode, sku: s.sku, quantity: 1 }, s.checkoutKey + ':entry');
  requireEvidence(cart.cart?.code === s.cartCode && cart.entries?.length === 1 && cart.entries[0].productCode === s.productCode &&
    cart.entries[0].sku === s.sku && String(cart.entries[0].quantity) === '1' && equalAmount(cart.calculation?.totalAmount, s.amount) &&
    cart.calculation?.currency === s.currency && cart.validation?.status !== 'BLOCKED', 'Exact reviewed one-asset Cart total required before checkout');
  const checkoutBody = { cartCode: s.cartCode, orderCode: s.orderCode, expectedCartRevision: cart.cart.revision,
    paymentMethod: 'LOYALTY_REWARD', walletCode: s.buyerWalletCode, programCode: s.programCode, rewardTypeCode: s.rewardTypeCode,
    rewardAmount: s.amount, rewardCurrency: s.currency };
  const checkout = () => c.call('buyer', 'COMMERCE', '/nodics/checkoutCore/v0/checkouts/place', 'POST', checkoutBody, s.checkoutKey);
  await checkout();
  const orderDetail = () => c.call('buyer', 'COMMERCE', '/nodics/order/v0/orders/' + encodeURIComponent(s.orderCode));
  const entitlements = async () => {
    const value = await c.call('buyer', 'COMMERCE', '/nodics/digitalCore/v0/entitlements');
    const entries = value.entitlements?.filter(row => row.orderCode === s.orderCode);
    requireEvidence(entries?.length === 1, 'Exactly one original ownership entitlement required');
    return entries[0];
  };
  const entitlement = await entitlements();
  const selectors = { ownerId: s.buyerLoginId, orderCode: s.orderCode, entryCode: cart.entries[0].code,
    checkoutIdempotencyKey: s.checkoutKey };
  requireEvidence(entitlement.orderEntryCode === selectors.entryCode && identifier(entitlement.providerCode), 'Original retained Cart entry/transfer required');
  const purchaseRead = () => commerce(c, s, 'PURCHASE', { ...selectors, providerCode: entitlement.providerCode });
  const wasteRead = (kind = 'PURCHASE', extra = {}) => wasteEvidence(c, s, kind, { ...selectors, code: entitlement.providerCode, ...extra });
  const soldEvidence = await wasteRead(), sold = soldEvidence.asset, sale = soldEvidence.sale;
  const purchase = await purchaseRead();
  const order = await orderDetail();
  requireEvidence(order.order?.ownerId === s.buyerLoginId && order.order.code === s.orderCode && order.order.evidence?.storeCode === s.storeCode &&
    order.entries?.length === 1 && order.entries[0].productCode === s.productCode && order.entries[0].sku === s.sku &&
    String(order.entries[0].quantity) === '1' && equalAmount(order.order.totalAmount, s.amount), 'Original complete buyer Order changed');
  requireEvidence(entitlement.status === 'ACTIVE' && entitlement.digitalDeliveryType === 'DIGITAL_OWNERSHIP' && entitlement.providerOwner === 'wasteCore' &&
    entitlement.evidence?.assetCode === s.assetCode && entitlement.evidence.bindingCode === s.bindingCode && entitlement.evidence.physicalCustodyTransferred === false &&
    sold.assetStatus === 'SOLD' && sold.metadata?.lastTransferCode === sale.code && isDeepStrictEqual(sold.ownerRef, ref(s.buyerCode)) &&
    isDeepStrictEqual(sold.digitalOwnerRef, ref(s.buyerCode)) && isDeepStrictEqual(custody(sold), plan.custody), 'Native delivered digital ownership/custody changed');
  const captureRows = purchase.payments?.filter(row => row.code === s.orderCode + ':capture'), authorizationRows = purchase.payments?.filter(row => row.code === s.orderCode + ':authorization');
  requireEvidence(captureRows?.length === 1 && authorizationRows?.length === 1 && purchase.orders?.length === 1 && purchase.entries?.length === 1 &&
    purchase.orders[0].ownerId === s.buyerLoginId && purchase.orders[0].code === s.orderCode &&
    purchase.entries[0].code === s.orderCode + ':' + selectors.entryCode, 'Unique original Order and Payment owner evidence required');
  const capture = captureRows[0], authorization = authorizationRows[0];
  requireEvidence(capture.status === 'CAPTURED' && capture.methodCode === 'LOYALTY_REWARD' && capture.providerCode === 'loyalty-reward-points' &&
    capture.enterpriseCode === s.enterpriseCode && capture.idempotencyKey === s.checkoutKey + ':payment:capture' && capture.currency === s.currency &&
    equalAmount(capture.totalAmount, s.amount) && sale.metadata?.digitalSale?.capture?.ledgerCode === capture.providerReference && sale.transferStatus === 'COMPLETED', 'Original native Payment capture required');
  requireEvidence(authorization.status === 'AUTHORIZED' && authorization.enterpriseCode === s.enterpriseCode && authorization.idempotencyKey === s.checkoutKey + ':payment' &&
    authorization.methodCode === capture.methodCode && authorization.providerCode === capture.providerCode && authorization.currency === s.currency &&
    equalAmount(authorization.totalAmount, s.amount) && authorization.providerReference === order.order.evidence.paymentReference, 'Original native Payment authorization required');
  const buyerDebit = await ledger(c, s, capture.providerReference, { walletCode: s.buyerWalletCode, entryType: 'CAPTURE',
    sourceType: 'PAYMENT', sourceCode: s.orderCode, targetType: 'ORDER', targetCode: s.orderCode,
    reservationCode: authorization.providerReference, idempotencyKey: s.checkoutKey + ':payment:capture' });
  requireEvidence(sale.rewardSettlementRefs?.length === 1 && sale.carbonSettlementRefs?.length === 0, 'One original seller earning and no carbon required');
  const sellerEarning = await ledger(c, s, sale.rewardSettlementRefs[0].code, { walletCode: s.sellerWalletCode, entryType: 'EARN',
    sourceType: 'WASTE_ASSET_SALE', sourceCode: sale.code, idempotencyKey: sale.code + ':sale-proceeds' });
  const purchaseBuyer = await wallet(c, s, 'buyer'), purchaseSeller = await wallet(c, s, 'seller');
  requireEvidence(equalAmount(purchaseBuyer.available, exact.add(plan.buyer.available, '-' + s.amount)) &&
    equalAmount(purchaseSeller.available, exact.add(plan.seller.available, s.amount)), 'Exactly one original buyer debit and original seller earning required');
  const soldDigest = hash({ waste: soldEvidence, commerce: purchase, entitlement, buyerDebit, sellerEarning });
  await checkout();
  requireEvidence(hash({ waste: await wasteRead(), commerce: await purchaseRead(), entitlement: await entitlements(),
    buyerDebit: await ledger(c, s, buyerDebit.code, { entryType: 'CAPTURE', walletCode: s.buyerWalletCode, sourceType: 'PAYMENT', sourceCode: s.orderCode }),
    sellerEarning: await ledger(c, s, sellerEarning.code, { entryType: 'EARN', walletCode: s.sellerWalletCode, sourceType: 'WASTE_ASSET_SALE', sourceCode: sale.code }) }) === soldDigest, 'Original checkout replay changed ownership or financial evidence');
  requireEvidence(hash({ buyer: await wallet(c, s, 'buyer'), seller: await wallet(c, s, 'seller') }) ===
    hash({ buyer: purchaseBuyer, seller: purchaseSeller }), 'Original checkout replay changed reward balances');
  const caseRow = await c.call('buyer', 'COMMERCE', '/nodics/order/v0/orders/' + encodeURIComponent(s.orderCode) + '/disputes', 'POST',
    { confirmed: true, requestedResolution: 'REFUND', comment: s.refundReason }, s.disputeKey);
  requireEvidence(identifier(caseRow.code) && caseRow.orderCode === s.orderCode && caseRow.status === 'SUBMITTED', 'Original customer review case required');
  const refundPath = '/nodics/order/v0/disputes/' + encodeURIComponent(caseRow.code);
  const preview = await c.call('reviewer', 'COMMERCE', refundPath + '/refund-preview', 'POST', {});
  requireEvidence(preview.eligible === true && preview.provider === 'digitalCore' && preview.domain?.assetCode === s.assetCode &&
    preview.captureCode === capture.code && equalAmount(preview.amount, s.amount) && preview.currency === s.currency && preview.previewToken, 'Reviewed original ownership refund preview required');
  const refundBody = { confirmed: true, reason: s.refundReason, expectedRevision: caseRow.revision, previewToken: preview.previewToken };
  const refund = () => c.call('reviewer', 'COMMERCE', refundPath + '/refund', 'POST', refundBody, s.refundKey);
  const result = await refund();
  requireEvidence(result.status === 'COMPLETED' && equalAmount(result.amount, s.amount) &&
    ['PREPARE', 'SETTLE', 'PAYMENT', 'COMPLETE'].every(phase => result.steps?.includes(phase)), 'Original refund requires all four completed owner phases');
  const restoredEvidence = await wasteRead('REFUND', { refundCode: result.refundCode });
  const restored = restoredEvidence.asset, reversed = restoredEvidence.reversal;
  const revoked = await entitlements();
  requireEvidence(restored.assetStatus === 'OWNED' && isDeepStrictEqual(restored.ownerRef, ref(s.sellerCode)) &&
    isDeepStrictEqual(restored.digitalOwnerRef, ref(s.sellerCode)) && isDeepStrictEqual(custody(restored), plan.custody) &&
    !restored.metadata.pendingRefundCode && reversed.transferType === 'REVERSAL' && reversed.transferStatus === 'COMPLETED' &&
    reversed.triggerRef?.code === sale.code && reversed.metadata?.digitalRefund?.command?.refundCode === result.refundCode && revoked.status === 'REVOKED', 'Original ownership refund/restoration changed');
  const sellerReversal = await ledger(c, s, reversed.metadata.digitalRefund.sellerReversalRef?.code, { walletCode: s.sellerWalletCode,
    entryType: 'REVERSE', reversalOfEntryCode: sellerEarning.code, sourceType: 'ORDER_REFUND', sourceCode: s.orderCode,
    idempotencyKey: result.refundCode + ':' + sellerEarning.code });
  const refundRead = () => commerce(c, s, 'REFUND', { ...selectors, providerCode: entitlement.providerCode,
    entitlementCode: entitlement.code, refundCode: result.refundCode });
  const refundEvidence = await refundRead();
  requireEvidence(refundEvidence.transactions?.length === 1 && refundEvidence.entitlement?.code === entitlement.code &&
    refundEvidence.entitlement.status === 'REVOKED' && refundEvidence.refunds?.length === 1 && refundEvidence.cases?.length === 1 &&
    refundEvidence.refunds[0].evidence?.caseCode === caseRow.code, 'Original approved refund owner evidence required');
  const payment = refundEvidence.transactions[0];
  requireEvidence(payment.code === reversed.metadata.digitalRefund.paymentRef?.code, 'Exact original Waste/Payment refund join required');
  requireEvidence(payment.status === 'REFUND_SUCCEEDED' && payment.orderCode === s.orderCode && payment.currency === s.currency &&
    payment.ownerId === s.buyerLoginId && payment.enterpriseCode === s.enterpriseCode && equalAmount(payment.totalAmount, s.amount) &&
    payment.evidence?.operation === 'REFUND' && payment.evidence.refundIntent?.captureCode === capture.code &&
    payment.evidence.refundIntent.refundCode === result.refundCode && payment.evidence.refundIntent.approvalCommandKey === s.refundKey,
  'Original native Payment refund required');
  const buyerReversals = [await ledger(c, s, null, { walletCode: s.buyerWalletCode, entryType: 'REVERSE',
    reversalOfEntryCode: buyerDebit.code, sourceType: 'PAYMENT', sourceCode: s.orderCode })];
  requireEvidence(buyerReversals.length === 1 && buyerReversals[0].walletCode === s.buyerWalletCode && equalAmount(buyerReversals[0].amount, s.amount) &&
    buyerReversals[0].code === payment.evidence.providerReference && buyerReversals[0].idempotencyKey === payment.idempotencyKey &&
    buyerReversals[0].sourceType === 'PAYMENT' && buyerReversals[0].sourceCode === s.orderCode &&
    buyerReversals[0].programCode === s.programCode && buyerReversals[0].rewardTypeCode === s.rewardTypeCode, 'Unique original buyer capture reversal required');
  const finalBuyer = await wallet(c, s, 'buyer'), finalSeller = await wallet(c, s, 'seller');
  requireEvidence(equalAmount(finalBuyer.available, plan.buyer.available) && equalAmount(finalSeller.available, plan.seller.available) &&
    equalAmount(finalBuyer.reserved, plan.buyer.reserved) && equalAmount(finalSeller.reserved, plan.seller.reserved), 'Original available/reserved balances must be restored');
  const refundDigest = hash({ waste: restoredEvidence, commerce: refundEvidence, revoked, sellerReversal, payment, buyerReversals });
  await refund();
  requireEvidence(hash({ waste: await wasteRead('REFUND', { refundCode: result.refundCode }), commerce: await refundRead(), revoked: await entitlements(),
    sellerReversal: await ledger(c, s, sellerReversal.code, { entryType: 'REVERSE', walletCode: s.sellerWalletCode, sourceType: 'ORDER_REFUND', sourceCode: s.orderCode }),
    payment: (await refundRead()).transactions[0],
    buyerReversals: [await ledger(c, s, null, { reversalOfEntryCode: buyerDebit.code, entryType: 'REVERSE', walletCode: s.buyerWalletCode,
      sourceType: 'PAYMENT', sourceCode: s.orderCode })] }) === refundDigest,
  'Original refund replay changed native evidence');
  requireEvidence(hash({ buyer: await wallet(c, s, 'buyer'), seller: await wallet(c, s, 'seller') }) ===
    hash({ buyer: finalBuyer, seller: finalSeller }), 'Original refund replay changed reward balances');
  return { contractVersion: 1, state: 'PASSED', evidence: 'SIGNED_NATIVE_ORIGINAL_OWNERSHIP_PURCHASE_REFUND', orderCode: s.orderCode,
    assetCode: s.assetCode, entitlementCode: entitlement.code, refundCode: result.refundCode, originalCheckoutReplayVerified: true,
    originalRefundReplayVerified: true, originalBalancesRestored: true, physicalCustodyTransferred: false, productionQualified: false };
}

/** Inert help; CLI consumes only supplied sessions and public reviewed selectors, never credentials or data fixtures. */
export async function main(args = process.argv.slice(2), options = {}) {
  if (args.includes('--help')) return { usage: 'node defaultEWasteDigitalOwnershipAcceptanceService.mjs --plan|--execute; NODICS_EWASTE_NATIVE_API_SELECTION=reviewed.json; existing BUYER/SELLER/REVIEWER/INSPECTOR Profile sessions; native loopback only',
    execution: '--plan is read-only. With all original owner runtime sessions and admitted exact APIs it returns a reviewable digest; --execute requires that digest and drives normal purchase/refund APIs. Missing owner evidence refuses before Cart. No source test is native qualification.' };
  requireEvidence(args.length === 1 && ['--plan', '--execute'].includes(args[0]), 'Select --plan or --execute explicitly');
  const environment = options.environment || process.env;
  requireEvidence(environment.NODICS_LOCAL_PRIVATE_CAPTURE_QUALIFIED === 'true', 'Qualified private native capture paths required');
  const selection = options.selection || JSON.parse(readFileSync(environment.NODICS_EWASTE_NATIVE_API_SELECTION, 'utf8'));
  const actors = options.actors || Object.fromEntries(['buyer', 'seller', 'reviewer', 'inspector'].map(actor => [actor,
    { Authorization: 'Bearer ' + (environment['NODICS_EWASTE_' + actor.toUpperCase() + '_TOKEN'] || '') }]));
  if (!options.actors) for (const actor of ['loyalty', 'commerce', 'waste']) if (environment['NODICS_EWASTE_' + actor.toUpperCase() + '_EVIDENCE_TOKEN'])
    actors[actor] = { Authorization: 'Bearer ' + environment['NODICS_EWASTE_' + actor.toUpperCase() + '_EVIDENCE_TOKEN'] };
  const context = options.context || await createAcceptanceContext(options);
  if (args[0] === '--plan') {
    const plan = await planOwnershipAcceptance({ context, actors, selection });
    return plan;
  }
  return runOwnershipAcceptance({ context, actors, selection, confirmed: true });
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href)
  main().then(result => console.log(JSON.stringify(result, null, 2))).catch(error => { console.error(error.message); process.exitCode = 1; });
