/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module promotion/acceptance/defaultCouponOfferLifecycleAcceptanceService
 * @description Proves immutable coupon terms, shared supply, lifetime owner allowance and retained rights after participation withdrawal.
 * @layer tooling
 * @owner promotion
 * @remarks Project adapters invoke canonical owner APIs. This runner owns assertions only; it provisions no offer,
 * identity, coupon, entitlement, permission or inventory and never reads private persistence directly.
 */
import { realpath } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { isDeepStrictEqual } from 'node:util';
import properties from '../../../config/properties.js';
import { createAcceptanceContext } from '../../../../../../../../nodics.foundation/modules/nTooling/src/service/project/defaultProjectAcceptanceService.mjs';
import { projectEndpointUrl, projectRuntimeAcceptance } from '../../../../../../../../nodics.foundation/modules/nTooling/src/service/project/defaultProjectEnvironmentConfigurationService.mjs';

const defaultAcceptanceName = 'couponOfferLifecycle';
const identifierPattern = /^[A-Za-z0-9][A-Za-z0-9_.:@-]{0,191}$/;
const plain = value => value && typeof value === 'object' && !Array.isArray(value);
const identifier = value => typeof value === 'string' && identifierPattern.test(value);
const requireEvidence = (condition, code) => { if (!condition) throw Object.assign(new Error(code), { code }); };
const exactKeys = (value, keys) => plain(value) && Object.keys(value).length === keys.length &&
  keys.every(key => Object.hasOwn(value, key));

function owner(value) {
  requireEvidence(exactKeys(value, ['type', 'code']) && ['CUSTOMER', 'ENTERPRISE'].includes(value.type) && identifier(value.code),
    'REVIEWED_OWNER_REQUIRED');
  return value;
}

function fixedOffer(value, label, options = {}) {
  const keys = options.withdrawal ? ['promotionCode', 'expectedOffer', 'benefitMutation', 'purchasingOwner', 'blockedOwner',
    'redeemerEnterpriseCode'] : ['promotionCode', 'expectedOffer', 'benefitMutation', 'firstOwner', 'secondOwner', 'blockedOwner'];
  requireEvidence(exactKeys(value, keys) && identifier(value.promotionCode) &&
    exactKeys(value.expectedOffer, ['version', 'supply', 'ownerLimit', 'expiry', 'requirements', 'terms']) &&
    value.expectedOffer.version === 1 && exactKeys(value.expectedOffer.supply, ['mode', 'quantity']) &&
    value.expectedOffer.supply.mode === 'LIMITED' && Number.isSafeInteger(value.expectedOffer.supply.quantity) &&
    value.expectedOffer.supply.quantity > 0 && Number.isSafeInteger(value.expectedOffer.ownerLimit) &&
    value.expectedOffer.ownerLimit > 0 && plain(value.expectedOffer.requirements) &&
    ['REWARDS', 'CERTIFICATES', 'BOTH'].includes(value.expectedOffer.requirements.type) &&
    Array.isArray(value.expectedOffer.terms) && value.expectedOffer.terms.length > 0 &&
    value.expectedOffer.terms.every(term => typeof term === 'string' && term.trim()) && plain(value.benefitMutation) &&
    value.expectedOffer.expiry?.mode === 'FIXED' &&
    typeof value.expectedOffer.expiry.at === 'string' && Number.isFinite(Date.parse(value.expectedOffer.expiry.at)) &&
    new Date(value.expectedOffer.expiry.at).toISOString() === value.expectedOffer.expiry.at,
  label + '_OFFER_REQUIRED');
  owner(value.blockedOwner);
  if (options.withdrawal) {
    owner(value.purchasingOwner);
    requireEvidence(identifier(value.redeemerEnterpriseCode) &&
      value.purchasingOwner.code !== value.blockedOwner.code, 'WITHDRAWAL_REDEEMER_REQUIRED');
  } else {
    owner(value.firstOwner); owner(value.secondOwner);
    requireEvidence(value.expectedOffer.supply?.mode === 'LIMITED' && value.expectedOffer.supply.quantity === 2 &&
      value.expectedOffer.ownerLimit === 1 &&
      new Set([value.firstOwner.code, value.secondOwner.code, value.blockedOwner.code]).size === 3,
    'LIMITED_TWO_UNIT_OWNER_CAP_REQUIRED');
  }
  return value;
}

/** Selects one own-property project profile without accepting inherited values. */
export function selectCouponOfferLifecycleAcceptance(profiles, name = defaultAcceptanceName) {
  requireEvidence(plain(profiles) && Object.hasOwn(profiles, name), 'COUPON_OFFER_LIFECYCLE_ACCEPTANCE_UNAVAILABLE');
  return profiles[name];
}

/** Parses one bounded project profile selection. */
export function couponOfferLifecycleAcceptanceArgument(args = []) {
  const values = args.filter(value => value.startsWith('--acceptance='));
  requireEvidence(values.length <= 1, 'ONE_ACCEPTANCE_SELECTION_REQUIRED');
  const name = values[0]?.slice('--acceptance='.length) || defaultAcceptanceName;
  requireEvidence(/^[A-Za-z][A-Za-z0-9_]{0,127}$/.test(name), 'ACCEPTANCE_NAME_INVALID');
  return name;
}

function selectionOf(options) {
  requireEvidence(options.execute === true, 'EXPLICIT_EXECUTION_REQUIRED');
  let url;
  try { url = new URL(options.baseUrl); } catch { requireEvidence(false, 'LOCAL_HTTP_TARGET_REQUIRED'); }
  requireEvidence(['http:', 'https:'].includes(url.protocol) && ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname) &&
    !url.username && !url.password && url.pathname === '/' && !url.search && !url.hash, 'LOCAL_HTTP_TARGET_REQUIRED');
  const selection = structuredClone(options.selection);
  requireEvidence(exactKeys(selection, ['contractVersion', 'approvalReference', 'tenant', 'runCode', 'limitedOffer', 'withdrawalOffer']) &&
    selection.contractVersion === 1 && ['approvalReference', 'tenant', 'runCode'].every(key => identifier(selection[key])) &&
    selection.runCode.length <= 80, 'REVIEWED_COUPON_LIFECYCLE_SELECTION_REQUIRED');
  fixedOffer(selection.limitedOffer, 'LIMITED');
  fixedOffer(selection.withdrawalOffer, 'WITHDRAWAL', { withdrawal: true });
  requireEvidence(selection.limitedOffer.promotionCode !== selection.withdrawalOffer.promotionCode,
    'DISTINCT_LIFECYCLE_OFFERS_REQUIRED');
  const policy = { ...properties.promotion.acceptance.couponOfferLifecycle, ...(options.policy || {}) };
  requireEvidence(exactKeys(policy, ['requestTimeoutMs', 'maximumOperations']) &&
    Number.isSafeInteger(policy.requestTimeoutMs) && policy.requestTimeoutMs >= 1 && policy.requestTimeoutMs <= 300000 &&
    Number.isSafeInteger(policy.maximumOperations) && policy.maximumOperations >= 12 && policy.maximumOperations <= 100,
  'COUPON_LIFECYCLE_ACCEPTANCE_POLICY_REQUIRED');
  const requiredOperations = ['inspectOffer', 'attemptBenefitMutation', 'purchase', 'availability',
    'withdrawParticipation', 'readPurchasedCoupon'];
  requireEvidence(exactKeys(options.operations, requiredOperations) &&
    requiredOperations.every(key => typeof options.operations[key] === 'function'), 'CANONICAL_COUPON_OPERATIONS_REQUIRED');
  return { selection, policy, operations: options.operations, baseUrl: url.origin };
}

function offerSnapshot(value, expected, code) {
  requireEvidence(plain(value) && value.promotionCode === code && Number.isSafeInteger(value.revision) && value.revision >= 0 &&
    isDeepStrictEqual(value.couponOffer, expected) && plain(value.actions) && plain(value.conditions), 'IMMUTABLE_OFFER_SNAPSHOT_REQUIRED');
  return value;
}

function completedPurchase(value, promotionCode, expectedOwner, expectedOffer) {
  requireEvidence(plain(value) && value.status === 'COMPLETED' && identifier(value.couponCode) &&
    isDeepStrictEqual(value.ownerRef, expectedOwner) && value.purchasePolicy?.promotionCode === promotionCode &&
    isDeepStrictEqual(value.purchasePolicy.couponOffer, expectedOffer) && value.purchasePolicy.finality?.refundable === false &&
    value.purchasePolicy.finality?.transferable === false && value.purchasePolicy.finality?.singleUse === true &&
    new Date(value.validTo).toISOString() === expectedOffer.expiry.at,
  'COMPLETED_PURCHASE_POLICY_REQUIRED');
  return value;
}

function refusedPurchase(value, reason) {
  requireEvidence(exactKeys(value, ['status', 'reason']) && value.status === 'REFUSED' && value.reason === reason,
    'EXPECTED_PURCHASE_REFUSAL_REQUIRED');
}

/** Executes the reviewed lifecycle through canonical operations supplied by the project-owned adapter. */
export async function runCouponOfferLifecycleAcceptance(options = {}) {
  const { selection: s, policy, operations, baseUrl } = selectionOf(options);
  let calls = 0;
  const invoke = async (operation, input) => {
    calls += 1;
    requireEvidence(calls <= policy.maximumOperations, 'COUPON_LIFECYCLE_OPERATION_BOUND_EXCEEDED');
    let value, timeout;
    try {
      value = await Promise.race([
        operations[operation](Object.freeze(structuredClone({ ...input, baseUrl, tenant: s.tenant,
          approvalReference: s.approvalReference }))),
        new Promise((_, reject) => { timeout = setTimeout(() => reject(new Error('OWNER_OPERATION_TIMEOUT')), policy.requestTimeoutMs); }),
      ]);
    } catch (error) {
      if (error?.code === 'OWNER_OPERATION_TIMEOUT' || error?.message === 'OWNER_OPERATION_TIMEOUT') throw error;
      requireEvidence(false, 'OWNER_OPERATION_UNCONFIRMED');
    } finally { clearTimeout(timeout); }
    return structuredClone(value);
  };
  const command = (caseCode, action) => `${s.runCode}:${caseCode}:${action}`;
  const limited = s.limitedOffer;
  const before = offerSnapshot(await invoke('inspectOffer', { promotionCode: limited.promotionCode }),
    limited.expectedOffer, limited.promotionCode);
  const mutation = await invoke('attemptBenefitMutation', { promotionCode: limited.promotionCode,
    expectedRevision: before.revision, mutation: limited.benefitMutation, commandReference: command('limited', 'mutate') });
  requireEvidence(exactKeys(mutation, ['status', 'reason']) && mutation.status === 'REFUSED' &&
    mutation.reason === 'IMMUTABLE_BENEFIT_TERMS', 'IMMUTABLE_BENEFIT_MUTATION_MUST_REFUSE');
  const unchanged = offerSnapshot(await invoke('inspectOffer', { promotionCode: limited.promotionCode }),
    limited.expectedOffer, limited.promotionCode);
  requireEvidence(unchanged.revision === before.revision && isDeepStrictEqual(unchanged.actions, before.actions) &&
    isDeepStrictEqual(unchanged.conditions, before.conditions), 'IMMUTABLE_BENEFIT_TERMS_CHANGED');

  const first = completedPurchase(await invoke('purchase', { promotionCode: limited.promotionCode,
    ownerRef: limited.firstOwner, commandReference: command('limited', 'first') }), limited.promotionCode,
  limited.firstOwner, limited.expectedOffer);
  let availability = await invoke('availability', { promotionCode: limited.promotionCode });
  requireEvidence(exactKeys(availability, ['available', 'remaining', 'reserved', 'completed']) && availability.available === true &&
    availability.remaining === 1 && availability.reserved === 0 && availability.completed === 1,
  'SHARED_SUPPLY_FIRST_PURCHASE_UNCONFIRMED');
  refusedPurchase(await invoke('purchase', { promotionCode: limited.promotionCode, ownerRef: limited.firstOwner,
    commandReference: command('limited', 'owner-limit') }), 'OWNER_LIMIT_REACHED');
  const second = completedPurchase(await invoke('purchase', { promotionCode: limited.promotionCode,
    ownerRef: limited.secondOwner, commandReference: command('limited', 'second') }), limited.promotionCode,
  limited.secondOwner, limited.expectedOffer);
  availability = await invoke('availability', { promotionCode: limited.promotionCode });
  requireEvidence(exactKeys(availability, ['available', 'remaining', 'reserved', 'completed']) && availability.available === false &&
    availability.remaining === 0 && availability.reserved === 0 && availability.completed === 2,
  'SHARED_SUPPLY_EXHAUSTION_UNCONFIRMED');
  refusedPurchase(await invoke('purchase', { promotionCode: limited.promotionCode, ownerRef: limited.blockedOwner,
    commandReference: command('limited', 'supply') }), 'SUPPLY_EXHAUSTED');

  const withdrawal = s.withdrawalOffer;
  const purchased = completedPurchase(await invoke('purchase', { promotionCode: withdrawal.promotionCode,
    ownerRef: withdrawal.purchasingOwner, commandReference: command('withdrawal', 'purchase') }),
  withdrawal.promotionCode, withdrawal.purchasingOwner, withdrawal.expectedOffer);
  const decision = await invoke('withdrawParticipation', { promotionCode: withdrawal.promotionCode,
    redeemerEnterpriseCode: withdrawal.redeemerEnterpriseCode, commandReference: command('withdrawal', 'withdraw') });
  requireEvidence(plain(decision) && decision.status === 'WITHDRAWN' && Number.isSafeInteger(decision.revision) && decision.revision > 0,
    'PARTICIPATION_WITHDRAWAL_UNCONFIRMED');
  refusedPurchase(await invoke('purchase', { promotionCode: withdrawal.promotionCode, ownerRef: withdrawal.blockedOwner,
    commandReference: command('withdrawal', 'blocked') }), 'PARTICIPATION_WITHDRAWN');
  const retained = await invoke('readPurchasedCoupon', { couponCode: purchased.couponCode,
    ownerRef: withdrawal.purchasingOwner });
  requireEvidence(plain(retained) && retained.couponCode === purchased.couponCode && retained.retainedRights === true &&
    retained.usable === true && isDeepStrictEqual(retained.purchasePolicy, purchased.purchasePolicy),
  'PURCHASED_RIGHTS_NOT_RETAINED');
  return { contractVersion: 1, state: 'PASSED', approvalReference: s.approvalReference, runCode: s.runCode,
    evidence: { immutableOffer: { promotionCode: limited.promotionCode, revision: unchanged.revision,
      expiresAt: limited.expectedOffer.expiry.at }, sharedSupply: { couponCodes: [first.couponCode, second.couponCode],
      completed: availability.completed, remaining: availability.remaining }, lifetimeOwnerAllowance: 'ENFORCED',
    withdrawal: { promotionCode: withdrawal.promotionCode, status: decision.status,
      retainedCouponCode: retained.couponCode, retainedRights: retained.retainedRights } } };
}

async function projectAdapter(projectRoot, selected) {
  requireEvidence(typeof selected === 'string' && selected.length > 0 && selected.length <= 1024,
    'COUPON_LIFECYCLE_OPERATIONS_ADAPTER_REQUIRED');
  const root = await realpath(projectRoot), file = await realpath(path.resolve(root, selected));
  requireEvidence(file.startsWith(root + path.sep), 'COUPON_LIFECYCLE_ADAPTER_MUST_BE_PROJECT_OWNED');
  const adapter = await import(pathToFileURL(file).href);
  requireEvidence(typeof adapter.createCouponOfferLifecycleOperations === 'function',
    'COUPON_LIFECYCLE_OPERATIONS_FACTORY_REQUIRED');
  return adapter.createCouponOfferLifecycleOperations;
}

/** Resolves project fixture and adapter while retaining all reusable policy in Promotion. */
export async function runConfiguredCouponOfferLifecycleAcceptance(options = {}) {
  const context = await createAcceptanceContext(options);
  const selection = options.selection || selectCouponOfferLifecycleAcceptance(
    projectRuntimeAcceptance(context.projectRoot, context.configuration, { role: 'COMMERCE' }),
    options.acceptanceName || defaultAcceptanceName);
  const createOperations = options.createOperations || await projectAdapter(context.projectRoot,
    options.operationsAdapter || context.environment.NODICS_COUPON_OFFER_LIFECYCLE_ADAPTER);
  const baseUrl = options.baseUrl || projectEndpointUrl(context.configuration, { role: 'COMMERCE' });
  const operations = options.operations || await createOperations(Object.freeze({ baseUrl, selection: structuredClone(selection),
    environment: context.environment, policy: structuredClone(properties.promotion.acceptance.couponOfferLifecycle) }));
  return runCouponOfferLifecycleAcceptance({ ...options, selection, operations, baseUrl });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  if (process.argv.includes('--help')) console.log('acceptance:coupon-offer-lifecycle --execute [--acceptance=<name>]; requires a project-owned canonical operations adapter selected by NODICS_COUPON_OFFER_LIFECYCLE_ADAPTER.');
  else runConfiguredCouponOfferLifecycleAcceptance({ execute: process.argv.includes('--execute'),
    acceptanceName: couponOfferLifecycleAcceptanceArgument(process.argv.slice(2)) })
    .then(result => console.log(JSON.stringify(result)))
    .catch(error => { console.error(error.message); process.exitCode = 1; });
}
