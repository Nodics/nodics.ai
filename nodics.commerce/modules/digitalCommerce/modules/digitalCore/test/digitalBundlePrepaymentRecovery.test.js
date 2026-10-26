/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
'use strict';
/** @module digitalCore/test/digitalBundlePrepaymentRecovery @description Original-key Checkout recovery with real Digital owner CAS, no financial effects and late-reserve fencing. @owner digitalCore @layer test */
const test = require('node:test'), assert = require('node:assert/strict');
const fixture = require('./bundleSettlementFixture.cjs');
const settlement = require('../src/service/defaultDigitalBundleSettlementService');
const recovery = require('../../../../checkout/modules/checkoutCore/src/service/defaultCheckoutCompensationRecoveryService');
const copy = value => structuredClone(value);

async function setup(t) {
  const f = await fixture(t, true, { enterpriseBuyer: true });
  const request = { ...f.r, commandCode: f.r.idempotencyKey, payload: {} };
  const checkpoint = { tenant: f.r.tenant, enterpriseCode: f.r.enterpriseCode, ownerId: f.r.ownerId,
    code: request.commandCode, idempotencyKey: request.commandCode, cartCode: 'cart', orderCode: 'order',
    status: 'COMPENSATION_REQUIRED', revision: 0, active: true,
    evidence: { ownerRef: f.r.ownerRef, completed: ['VALIDATED', 'CALCULATED', 'SPENDING_ADMITTED', 'RESERVED'],
      inventoryReservationRecoveryRequired: false, digitalReservationRecoveryRequired: true,
      digitalReservationUncertainKey: 'checkout:digital:entry:0', compensation: [
        { type: 'DIGITAL_COUPON_RELEASE', status: 'FAILED', errorCode: 'DIGITAL_RESERVATION_UNCERTAIN' }] } };
  f.rows.CheckoutCheckpoint.push(checkpoint);
  SERVICE.DefaultCheckoutCompensationRecoveryService = recovery;
  SERVICE.DefaultCheckoutPlacementPortsService = { serviceAuthData: r => r.authData };
  const cart = { tenant: f.r.tenant, enterpriseCode: f.r.enterpriseCode, ownerId: f.r.ownerId,
    code: 'cart', status: 'ACTIVE', storeCode: 'store', locale: 'en' };
  SERVICE.DefaultCartService = { get: async () => ({ code: 'SUC_READ', count: 1, result: [copy(cart)] }) };
  SERVICE.DefaultPromotionOperationService = { recoverCouponCodeReservation: async () => { throw Error('Coupon must never run'); } };
  SERVICE.DefaultPaymentExecutionService = { execute: async () => { throw Error('Payment must never run'); },
    authorizationDecision: async () => { throw Error('Denial must never be fabricated'); } };
  const effects = copy(f.effects), holds = [...f.holds];
  return { ...f, request, checkpoint, effectsBefore: effects, holdsBefore: holds,
    purchase: () => f.rows.DigitalBundleOperation.find(row => row.purpose === 'PURCHASE'),
    currentListing: () => f.rows.DigitalBundleOperation.find(row => row.purpose === 'LISTING') };
}

for (const existing of ['none', 'claim only', 'reserved']) test(`original bundle prepayment recovery: ${existing}`, async t => {
  const f = await setup(t);
  if (existing !== 'none') await f.reserve();
  if (existing === 'claim only') f.rows.DigitalBundleOperation.splice(f.rows.DigitalBundleOperation.findIndex(row => row.purpose === 'PURCHASE'), 1);
  const evidence = copy(f.checkpoint.evidence);
  const result = await recovery.recover(f.request);
  assert.equal(result.status, 'COMPENSATED'); assert.equal(result.revision, 2);
  assert.equal(result.recoveryType, 'PREPAYMENT_UNCERTAIN_BUNDLE');
  assert.equal(f.purchase().status, 'CANCELLED'); assert.equal(f.currentListing().evidence.purchaseClaim == null, true);
  assert.deepEqual(f.effects, f.effectsBefore); assert.deepEqual([...f.holds], f.holdsBefore);
  assert.equal(f.rows.PaymentTransactionEntry.length, 0);
  const { compensationRecovery, ...retained } = f.checkpoint.evidence;
  assert.deepEqual(retained, evidence); assert.equal(compensationRecovery.outcome.type, 'DIGITAL_OWNERSHIP_RELEASE');
  const rows = JSON.stringify(f.rows);
  assert.deepEqual(await recovery.recover(f.request), result); assert.equal(JSON.stringify(f.rows), rows);
  await assert.rejects(f.reserve(), /cancelled/);
});

for (const [name, change] of Object.entries({
  owner: f => { f.request.ownerRef = { ...f.request.ownerRef, code: 'foreign' }; },
  type: f => { f.projection.payload.localizedAttributes.digitalDeliveryType = 'COUPON_CODE'; },
  payment: f => { f.rows.PaymentTransactionEntry.push({ tenant: 'T', ownerId: 'buyer', enterpriseCode: 'market',
    code: 'unexpected', idempotencyKey: 'checkout:payment', evidence: { operation: 'AUTHORIZE' }, active: true }); },
  flags: f => { f.checkpoint.evidence.inventoryReservationRecoveryRequired = true; },
})) test(`bundle recovery rejects ${name} before owner mutation`, async t => {
  const f = await setup(t); change(f);
  const rows = JSON.stringify(f.rows);
  await assert.rejects(recovery.recover(f.request)); assert.equal(JSON.stringify(f.rows), rows);
});

test('completed replay rejects a late original claim and never releases it blindly', async t => {
  const f = await setup(t); await recovery.recover(f.request);
  f.currentListing().evidence.purchaseClaim = { code: f.purchase().code, digest: f.purchase().commandDigest,
    command: copy(f.purchase().evidence.command) };
  const rows = JSON.stringify(f.rows);
  await assert.rejects(recovery.recover(f.request)); assert.equal(JSON.stringify(f.rows), rows);
});

test('reserve suspended before claim cannot cross the original cancellation fence', async t => {
  const f = await setup(t);
  let entered, proceed;
  const reached = new Promise(resolve => { entered = resolve; });
  const resume = new Promise(resolve => { proceed = resolve; });
  SERVICE.DefaultDigitalCommerceAuctionService.price = async () => { entered(); await resume; };
  const pending = f.reserve();
  const rejected = assert.rejects(pending);
  await reached;
  await recovery.recover(f.request);
  proceed(); await rejected;
  assert.equal(f.purchase().status, 'CANCELLED'); assert.equal(f.currentListing().evidence.purchaseClaim == null, true);
  assert.deepEqual([...f.holds], f.holdsBefore);
});

test('claim arriving after recovery snapshot leaves recovery unconfirmed, not falsely completed', async t => {
  const f = await setup(t), save = SERVICE.DefaultDigitalBundleOperationService.save;
  let raced = false;
  SERVICE.DefaultDigitalBundleOperationService.save = async r => {
    if (!raced && r.model.purpose === 'PURCHASE') {
      raced = true;
      f.currentListing().evidence.purchaseClaim = { code: r.model.code, digest: r.model.commandDigest, command: copy(r.model.evidence.command) };
      f.currentListing().revision++;
    }
    return save(r);
  };
  await assert.rejects(recovery.recover(f.request));
  assert.equal(f.checkpoint.status, 'COMPENSATION_REQUIRED');
  assert.equal(f.checkpoint.evidence.compensationRecovery.status, 'UNCONFIRMED');
  assert.ok(f.currentListing().evidence.purchaseClaim);
  assert.deepEqual([...f.holds], f.holdsBefore);
});

for (const [name, change] of Object.entries({
  'foreign purchase owner': row => { row.recipientRef.code = 'foreign'; },
  'wrong operation type': row => { row.purpose = 'GIFT'; },
  'changed original command': row => { row.evidence.command.cartCode = 'foreign'; },
  'captured purchase': row => { row.evidence.capture = { code: 'capture' }; },
})) test(`${name} cannot qualify original bundle cleanup`, async t => {
  const f = await setup(t); await f.reserve();
  change(f.purchase());
  const operations = copy(f.rows.DigitalBundleOperation);
  await assert.rejects(recovery.recover(f.request));
  assert.equal(f.checkpoint.status, 'COMPENSATION_REQUIRED');
  assert.deepEqual(f.rows.DigitalBundleOperation, operations);
});

test('completed replay refuses retained Product type drift', async t => {
  const f = await setup(t); await recovery.recover(f.request);
  Object.assign(f.projection.payload.localizedAttributes, { digitalDeliveryType: 'COUPON_CODE', inventoryStrategy: 'COUPON_CODE_POOL' });
  const rows = JSON.stringify(f.rows);
  await assert.rejects(recovery.recover(f.request)); assert.equal(JSON.stringify(f.rows), rows);
});

/** Installs the real timestamp interceptor, generated update initializer, managed concurrency and Mongo adapter over isolated collection storage. */
function realUpdates(f) {
  const root = '../../../../../../nodics.foundation/modules/';
  const concurrency = require(root + 'nDatabase/database/src/service/schema/defaultModelConcurrencyService');
  const initializer = require(root + 'nDatabase/database/src/service/procs/update/defaultModelsUpdateInitializerService');
  const interceptor = require(root + 'nDatabase/database/src/service/interceptors/defaultInterceptorService');
  const mongo = require(root + 'nDatabase/mongodb/src/schemas/model').default;
  const { BSON, ObjectId } = require('mongodb');
  const clone = value => BSON.deserialize(BSON.serialize(value));
  const schema = { backoffice: { concurrency: { managed: true, field: 'revision' } },
    definition: { revision: { type: 'int' }, created: { type: 'date' }, updated: { type: 'date' } } };
  const models = NODICS.getModels();
  for (const model of Object.values(models)) model.rawSchema = schema;
  NODICS.getModels = () => models;
  SERVICE.DefaultModelConcurrencyService = concurrency;
  let writes = 0;
  for (const row of f.rows.DigitalBundleOperation) { row._id = new ObjectId(); row.updated = new Date('2026-01-01'); }
  const match = (row, query) => Object.entries(query).every(([k, v]) => require('node:util').isDeepStrictEqual(row[k], v));
  const adapter = { ...mongo, rawSchema: schema, primaryKey: 'code', schemaName: 'digitalBundleOperation',
    transactionOptions: () => ({}),
    getItems: async input => f.rows.DigitalBundleOperation.filter(row => match(row, input.query)).map(clone),
    findOneAndUpdate: async (query, update, options) => {
      assert.equal(options.upsert, false); assert.equal(options.returnDocument, 'after');
      assert.equal(Object.hasOwn(update.$set, '_id'), false);
      assert.equal(Object.hasOwn(update.$set, 'created'), false);
      const row = f.rows.DigitalBundleOperation.find(row => match(row, query));
      if (!row) return { ok: 1, value: null };
      writes++; Object.assign(row, clone(update.$set)); return { ok: 1, value: clone(row) };
    } };
  SERVICE.DefaultDigitalBundleOperationService.update = async input => {
    const request = { ...input, schemaModel: adapter };
    await interceptor.setUpdatedTimestamp(request, {});
    return { code: 'SUC_UPDATE', result: await initializer.persistUpdates(request) };
  };
  const get = SERVICE.DefaultDigitalBundleOperationService.get;
  SERVICE.DefaultDigitalBundleOperationService.get = async r => clone(await get(r));
  return { writes: () => writes };
}

test('real managed adapter suppresses identical listing evidence: previous fence fails readback', async t => {
  const f = await setup(t), native = realUpdates(f);
  const b = SERVICE.DefaultDigitalBundleService, listing = copy(f.currentListing());
  await assert.rejects(b.update(f.r, listing, { evidence: copy(listing.evidence) }), /readback|successor|revision/i);
  assert.equal(native.writes(), 0); assert.equal(f.currentListing().revision, listing.revision);
});

test('real interceptor/adapter commits a business cancellation fence and preserves BSON identity and seller holds', async t => {
  const f = await setup(t), native = realUpdates(f), before = f.currentListing().revision;
  const result = await recovery.recover(f.request);
  assert.equal(result.status, 'COMPENSATED'); assert.equal(native.writes(), 1);
  assert.equal(f.currentListing().revision, before + 1);
  assert.equal(f.currentListing().evidence.purchaseCancellation.attemptId, f.checkpoint.evidence.compensationRecovery.attemptId);
  assert.deepEqual([...f.holds], f.holdsBefore);
  await recovery.recover(f.request); assert.equal(native.writes(), 1);
});

/** Creates the exact old no-op failure through the real concurrency owner, then restores the corrected owner. */
async function failedAttempt(t) {
  const f = await setup(t), native = realUpdates(f), update = SERVICE.DefaultDigitalBundleOperationService.update;
  SERVICE.DefaultDigitalBundleOperationService.update = async input => {
    if (input.model.evidence?.purchaseCancellation) {
      input = { ...input, model: { ...input.model, evidence: { ...input.model.evidence } } };
      delete input.model.evidence.purchaseCancellation;
    }
    return update(input);
  };
  await assert.rejects(recovery.recover(f.request));
  assert.equal(f.purchase().status, 'CANCELLED'); assert.equal(f.checkpoint.revision, 2);
  assert.equal(f.checkpoint.evidence.compensationRecovery.failure.stage, 'LISTING_FENCE');
  // Legacy runtime receipt did not retain diagnostics; preserve that exact historical shape.
  delete f.checkpoint.evidence.compensationRecovery.failure;
  SERVICE.DefaultDigitalBundleOperationService.update = update;
  return { ...f, native };
}

test('same failed attempt reconciles revisions 2 -> 3 -> 4, preserving original history and replaying read-only', async t => {
  const f = await failedAttempt(t), prior = copy(f.checkpoint.evidence.compensationRecovery), evidence = copy(f.checkpoint.evidence);
  const result = await recovery.recover(f.request);
  assert.equal(result.status, 'COMPENSATED'); assert.equal(result.revision, 4);
  const current = f.checkpoint.evidence.compensationRecovery;
  assert.equal(current.attemptId, prior.attemptId); assert.deepEqual(current.reconciliation.previous, prior);
  const { compensationRecovery, ...retained } = f.checkpoint.evidence;
  delete evidence.compensationRecovery; assert.deepEqual(retained, evidence);
  const writes = f.native.writes(), rows = JSON.stringify(f.rows);
  assert.deepEqual(await recovery.recover(f.request), result); assert.equal(f.native.writes(), writes);
  assert.equal(JSON.stringify(f.rows), rows); assert.deepEqual([...f.holds], f.holdsBefore);
});

for (const [name, mutate] of Object.entries({
  'wrong owner': f => { f.request.ownerRef = { ...f.request.ownerRef, code: 'foreign' }; },
  'funded original Payment': f => { f.rows.PaymentTransactionEntry.push({ tenant: 'T', enterpriseCode: 'market', ownerId: 'buyer', active: true,
    code: 'payment', idempotencyKey: 'checkout:payment', evidence: { operation: 'AUTHORIZE' } }); },
  'changed original digest': f => { f.purchase().commandDigest = '0'.repeat(64); },
  'changed retained type': f => { f.projection.payload.localizedAttributes.digitalDeliveryType = 'COUPON_CODE'; },
  'foreign purchase': f => { f.purchase().recipientRef.code = 'foreign'; },
  'late original claim': f => { f.currentListing().evidence.purchaseClaim = { code: f.purchase().code }; },
  'other purchase claim': f => { f.currentListing().evidence.purchaseClaim = { code: 'other' }; },
  'changed listing terms': f => { f.currentListing().evidence.listing.terms.amount = '100'; },
  'not cancelled': f => { f.purchase().status = 'RESERVED'; },
  'changed Cart': f => { f.rows.CartEntry[0].quantity = '2'; },
})) test(`same-attempt preflight rejects ${name} without altering the original fence`, async t => {
  const f = await failedAttempt(t); mutate(f); const rows = JSON.stringify(f.rows);
  await assert.rejects(recovery.recover(f.request)); assert.equal(JSON.stringify(f.rows), rows); assert.equal(f.checkpoint.revision, 2);
});

test('listing changes after reconciliation preflight fail closed at revision four with preserved prior history', async t => {
  const f = await failedAttempt(t), prior = copy(f.checkpoint.evidence.compensationRecovery);
  const update = SERVICE.DefaultCheckoutCheckpointService.update;
  SERVICE.DefaultCheckoutCheckpointService.update = async r => {
    const result = await update(r);
    if (r.model.evidence.compensationRecovery.status === 'RUNNING') f.currentListing().revision++;
    return result;
  };
  await assert.rejects(recovery.recover(f.request));
  assert.equal(f.checkpoint.revision, 4); assert.equal(f.checkpoint.evidence.compensationRecovery.status, 'UNCONFIRMED');
  assert.equal(f.checkpoint.evidence.compensationRecovery.failure.stage, 'PURCHASE_PROOF');
  assert.deepEqual(f.checkpoint.evidence.compensationRecovery.reconciliation.previous, prior);
  const rows = JSON.stringify(f.rows); await assert.rejects(recovery.recover(f.request)); assert.equal(JSON.stringify(f.rows), rows);
});

test('diagnostics allow only fixed stages and code, never dependency messages or payloads', async t => {
  const f = await setup(t);
  SERVICE.DefaultDigitalCommerceCheckoutService = { ...SERVICE.DefaultDigitalCommerceCheckoutService,
    recoverUncertainReservation: async () => { throw Object.assign(new Error('secret bearer and financial data'),
      { recoveryStage: 'secret stage', code: 'PRIVATE_ERROR', payload: { secret: 'data' } }); } };
  await assert.rejects(recovery.recover(f.request));
  assert.deepEqual(f.checkpoint.evidence.compensationRecovery.failure,
    { stage: 'DIGITAL_OWNER', code: 'ERR_CHECKOUT_COMPENSATION_UNCONFIRMED' });
  assert.equal(JSON.stringify(f.checkpoint.evidence).includes('secret'), false);
});

test('concurrent same-attempt reconciliation admits one checkpoint CAS winner', async t => {
  const f = await failedAttempt(t), prior = copy(f.checkpoint.evidence.compensationRecovery);
  const results = await Promise.allSettled([recovery.recover(f.request), recovery.recover(f.request)]);
  assert.equal(results.filter(r => r.status === 'fulfilled').length, 1);
  assert.equal(f.checkpoint.status, 'COMPENSATED'); assert.equal(f.checkpoint.revision, 4);
  assert.deepEqual(f.checkpoint.evidence.compensationRecovery.reconciliation.previous, prior);
  assert.equal(f.native.writes(), 1);
});

for (const stage of ['after claim', 'after owner']) test(`new Payment ${stage} blocks reconciliation completion`, async t => {
  const f = await failedAttempt(t);
  const fund = () => f.rows.PaymentTransactionEntry.push({ tenant: 'T', enterpriseCode: 'market', ownerId: 'buyer', active: true,
    code: 'payment', idempotencyKey: 'checkout:payment', evidence: { operation: 'AUTHORIZE' } });
  if (stage === 'after claim') {
    const update = SERVICE.DefaultCheckoutCheckpointService.update;
    SERVICE.DefaultCheckoutCheckpointService.update = async r => { const result = await update(r);
      if (r.model.evidence.compensationRecovery.status === 'RUNNING') fund(); return result; };
  } else {
    const digital = SERVICE.DefaultDigitalCommerceCheckoutService;
    SERVICE.DefaultDigitalCommerceCheckoutService = { ...digital, recoverUncertainReservation: async function (...args) {
      const result = await digital.recoverUncertainReservation.apply(this, args); fund(); return result; } };
  }
  await assert.rejects(recovery.recover(f.request));
  assert.equal(f.checkpoint.status, 'COMPENSATION_REQUIRED'); assert.equal(f.checkpoint.revision, 4);
  assert.equal(f.checkpoint.evidence.compensationRecovery.failure.stage,
    stage === 'after claim' ? 'PAYMENT_BEFORE_OWNER' : 'PAYMENT_AFTER_OWNER');
});

test('fresh Profile owner denial prevents reconciliation before checkpoint CAS', async t => {
  const f = await failedAttempt(t), rows = JSON.stringify(f.rows);
  f.request.actor = 'foreign';
  await assert.rejects(recovery.recover(f.request)); assert.equal(JSON.stringify(f.rows), rows);
});

test('reconciled replay rejects original-history tampering and a late original claim without writes', async t => {
  const f = await failedAttempt(t); await recovery.recover(f.request);
  const prior = f.checkpoint.evidence.compensationRecovery.reconciliation.previous;
  const attemptId = prior.attemptId; prior.attemptId = '00000000-0000-4000-8000-000000000000';
  await assert.rejects(recovery.recover(f.request)); prior.attemptId = attemptId;
  f.currentListing().evidence.purchaseClaim = { code: f.purchase().code };
  const rows = JSON.stringify(f.rows); await assert.rejects(recovery.recover(f.request)); assert.equal(JSON.stringify(f.rows), rows);
});
