/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
'use strict';
const test = require('node:test'), assert = require('node:assert/strict');
const checkout = require('../src/service/defaultDigitalCommerceCheckoutService');
const acquisition = require('../src/service/defaultDigitalCommerceCouponAcquisitionService');
const { setup } = require('./helpers/couponCheckoutFixture');

async function denied(t, delegated = false, requirements = 'REWARDS') {
  const f = setup(t, requirements, true, 'buyer-enterprise');
  if (delegated) {
    f.campaign.couponOffer.supply = { mode: 'LIMITED', quantity: 2 };
    f.campaign.issuerEnterpriseRef.code = 'buyer-enterprise';
    // Finite delegated stock must retain the original issuer/vendor batch and encrypted unit membership.
    // The real source-proof owner validates this receipt; neither a ciphertext marker nor allocation alone is proof.
    const fp = SERVICE.DefaultPromotionPublicationService.fingerprint;
    const sellerAuthorizationProof = { issuerEnterpriseCode: 'buyer-enterprise', sellerEnterpriseCode: 'issuer',
      promotionCode: f.campaign.code, grantRevision: 1 };
    const command = { tenant: 't', enterpriseCode: 'buyer-enterprise', promotionCode: f.campaign.code,
      batchCode: 'batch', quantity: f.tables.get('coupon').size, issuanceAuthority: {
        issuerEnterpriseRef: structuredClone(f.campaign.issuerEnterpriseRef),
        vendorEnterpriseRef: structuredClone(f.campaign.vendorEnterpriseRef), sellerAuthorizationProof } };
    for (const coupon of f.tables.get('coupon').values()) {
      coupon.issuerEnterpriseRef.code = 'buyer-enterprise';
      coupon.enterpriseRef = structuredClone(f.campaign.vendorEnterpriseRef);
      coupon.sellerAuthorizationProof = structuredClone(sellerAuthorizationProof);
      coupon.protectedToken = { ciphertext: 'isolated-encrypted-token-' + coupon.code };
      coupon.tokenHash = fp({ fixtureToken: coupon.code });
      coupon.secureIssuanceCode = command.batchCode;
    }
    f.tables.get('couponBatch').set(command.batchCode, { code: command.batchCode, tenant: 't', enterpriseCode: 'issuer',
      promotionCode: f.campaign.code, enterpriseRef: structuredClone(f.campaign.vendorEnterpriseRef),
      issuerEnterpriseRef: structuredClone(f.campaign.issuerEnterpriseRef),
      vendorEnterpriseRef: structuredClone(f.campaign.vendorEnterpriseRef), issuedCount: command.quantity,
      secureIssuance: { command, units: [...f.tables.get('coupon').values()].map(coupon => ({ code: coupon.code,
        tokenHash: coupon.tokenHash, protectedFingerprint: fp(coupon.protectedToken) })) } });
  }
  f.r.actorRef = (await FACADE.DefaultCartCustomerFacade.resolveContext({ ...f.r, enterpriseCode: 'buyer-enterprise' }, 'commerce.checkout.place')).actorRef;
  const units = await checkout.reserveForCheckout(f.r, { entries: [f.entry] });
  const receipt = { contract: 'LOYALTY_RESERVATION_DECISION_V1', tenant: 't', code: 'denial',
    idempotencyKey: 'checkout:payment', sourceType: 'PAYMENT', sourceCode: 'order', targetType: 'ORDER', targetCode: 'order',
    status: 'DENIED', noEffects: true };
  SERVICE.DefaultPaymentExecutionService = require('../../../../payment/modules/paymentCore/src/service/defaultPaymentExecutionService');
  SERVICE.DefaultLoyaltyRewardPaymentProviderService = { reservationDecision: async (r, operation) => {
    assert.equal(operation, 'inspect'); assert.equal(r.idempotencyKey, 'checkout:payment');
    assert.equal(r.orderCode, 'order'); assert.equal(r.tenant, 't');
    return structuredClone(receipt);
  } };
  f.db.DefaultCommerceOrderService.length = 0;
  f.db.DefaultPaymentTransactionEntryService.splice(0, 1, { code: 'payment-denial', tenant: 't', enterpriseCode: 'buyer-enterprise', ownerId: f.r.ownerId,
    orderCode: 'order', cartCode: 'cart', idempotencyKey: 'checkout:payment', status: 'DECLINED', methodCode: 'LOYALTY_REWARD',
    evidence: { operation: 'AUTHORIZE', reservationDecision: receipt, participant: { ownerRef: f.r.ownerRef, actorRef: f.r.actorRef } } });
  const reservations = units.map(({ code, offerAllocationCode, idempotencyKey }) => ({ code, offerAllocationCode, idempotencyKey }));
  f.db.DefaultCheckoutCheckpointService.push({ tenant: 't', enterpriseCode: 'issuer', ownerId: f.r.ownerId,
    code: 'checkout', idempotencyKey: 'checkout', status: 'COMPENSATION_REQUIRED', evidence: {
      ownerRef: f.r.ownerRef, actorRef: f.r.actorRef, participantEnterpriseCode: 'buyer-enterprise',
      completed: ['VALIDATED', 'CALCULATED', 'SPENDING_ADMITTED', 'RESERVED', 'DIGITAL_RESERVED'], compensation: [],
      paymentDenialDecision: receipt, couponAcquisitionRecovery: { paymentAttemptUnconfirmed: false, orderCode: 'order', cartCode: 'cart', reservations }
    } });
  f.r.payload = { orderCode: 'order', cartCode: 'cart' };
  return { ...f, reservations, expected: reservations.map(unit => ({ type: 'DIGITAL_COUPON_RELEASE', code: unit.code, status: 'COMPLETED' })) };
}

test('cross-merchant Enterprise denial releases through actual Digital and Promotion owners; minimal retained unit replays read-only', async t => {
  const f = await denied(t);
  assert.deepEqual(await checkout.releaseReservations(f.r, f.reservations), f.expected);
  const before = structuredClone(f.tables);
  assert.deepEqual(await checkout.releaseReservations(f.r, f.reservations), f.expected);
  assert.deepEqual(f.tables, before);
});

test('lost release acknowledgement reconciles the exact durable allocation without repeating release', async t => {
  const f = await denied(t), operation = SERVICE.DefaultPromotionOperationService;
  const release = operation.releaseCouponCodeReservation.bind(operation);
  operation.releaseCouponCodeReservation = async r => { await release(r); throw Error('lost acknowledgement'); };
  assert.equal((await checkout.releaseReservations(f.r, f.reservations))[0].status, 'FAILED');
  const before = structuredClone(f.tables);
  operation.releaseCouponCodeReservation = async () => assert.fail('must not release twice');
  assert.deepEqual(await checkout.releaseReservations(f.r, f.reservations), f.expected);
  assert.deepEqual(f.tables, before);
});

test('released receipt still requires original Cart entry, exact supplied identity and current buyer admission', async t => {
  const f = await denied(t);
  assert.deepEqual(await checkout.releaseReservations(f.r, f.reservations), f.expected);
  const before = structuredClone(f.tables);
  for (const patch of [{ cartCode: 'foreign' }, { sku: 'foreign' }, { idempotencyKey: 'foreign' }])
    assert.equal((await checkout.releaseReservations(f.r, f.reservations.map(unit => ({ ...unit, ...patch }))))[0].status, 'FAILED');
  assert.equal((await checkout.releaseReservations({ ...f.r, payload: { ...f.r.payload, cartCode: 'foreign' } }, f.reservations))[0].status, 'FAILED');
  f.state.denied = true;
  assert.equal((await checkout.releaseReservations(f.r, f.reservations))[0].status, 'FAILED');
  f.state.denied = false;
  f.db.DefaultCartEntryService[0].productCode = 'foreign';
  assert.equal((await checkout.releaseReservations(f.r, f.reservations))[0].status, 'FAILED');
  assert.deepEqual(f.tables, before);
});

test('inspection reads exact reserved and released evidence without fences or effects', async t => {
  const f = await denied(t), unit = f.reservations[0];
  let before = structuredClone(f.tables);
  assert.deepEqual(await acquisition.inspectRecovery(f.r, unit), {
    allocationStatus: 'RESERVED', inputDisposition: 'UNSET', couponStatus: 'RESERVED', stage: 'EVIDENCE_CONFIRMED', condition: 'NONE'
  });
  assert.deepEqual(f.tables, before);
  assert.deepEqual(await checkout.releaseReservations(f.r, f.reservations), f.expected);
  before = structuredClone(f.tables);
  for (const [service, names] of [['DefaultCouponOfferAllocationService', ['release', 'fenceInputs', 'fenceInputSet']],
    ['DefaultDatabaseTransactionService', ['execute']], ['DefaultPaymentExecutionService', ['execute']]]) {
    SERVICE[service] = { ...SERVICE[service] };
    for (const name of names) SERVICE[service][name] = async () => assert.fail('inspection cannot mutate');
  }
  assert.deepEqual(await acquisition.inspectRecovery(f.r, unit), {
    allocationStatus: 'RELEASED', inputDisposition: 'RELEASE', couponStatus: 'AVAILABLE', stage: 'EVIDENCE_CONFIRMED', condition: 'NONE'
  });
  assert.deepEqual(f.tables, before);
});

test('inspection preserves historical hold and bounds private proof failures without leaking errors', async t => {
  const f = await denied(t), before = structuredClone(f.tables);
  f.db.DefaultCheckoutCheckpointService[0].evidence.couponAcquisitionRecovery.paymentAttemptUnconfirmed = true;
  const result = await acquisition.inspectRecovery(f.r, f.reservations[0]);
  assert.deepEqual(result, { allocationStatus: 'RESERVED', inputDisposition: 'UNSET', couponStatus: 'RESERVED',
    stage: 'FAILURE_PROOF', condition: 'PAYMENT_PENDING', failureCode: 'ERR_DIGITAL_COUPON_RECOVERY_INSPECTION' });
  assert.deepEqual(f.tables, before);
  f.state.denied = true;
  await assert.rejects(acquisition.inspectRecovery(f.r, f.reservations[0]));
  f.state.denied = false;
  const persistence = SERVICE.DefaultCouponAcquisitionPersistenceService, read = persistence.read.bind(persistence);
  persistence.read = async () => { throw Error('PRIVATE_TOKEN_AND_PAYLOAD'); };
  const failed = await acquisition.inspectRecovery(f.r, f.reservations[0]);
  assert.equal(failed.stage, 'ALLOCATION'); assert.equal(failed.allocationStatus, 'UNKNOWN');
  assert.equal(JSON.stringify(failed).includes('PRIVATE'), false);
  persistence.read = read;
});

test('inspection rejects foreign allocation binding and discards a changed readback', async t => {
  const f = await denied(t), unit = f.reservations[0];
  assert.equal((await acquisition.inspectRecovery(f.r, { ...unit, idempotencyKey: 'foreign' })).allocationStatus, 'UNKNOWN');
  const persistence = SERVICE.DefaultCouponAcquisitionPersistenceService, read = persistence.read.bind(persistence);
  let reads = 0;
  persistence.read = async (...args) => { const row = await read(...args); if (++reads === 3) row.revision++; return row; };
  try {
    const result = await acquisition.inspectRecovery(f.r, unit);
    assert.equal(result.stage, 'READBACK'); assert.equal(result.allocationStatus, 'UNKNOWN');
  } finally { persistence.read = read; }
});

test('Checkout command status composes the real Digital read inspection without financial dispatch', async t => {
  const f = await denied(t);
  const recovery = require('../../../../checkout/modules/checkoutCore/src/service/defaultCheckoutCompensationRecoveryService');
  SERVICE.DefaultCheckoutPlacementPortsService = { serviceAuthData: () => ({ isSystem: true }) };
  const row = f.db.DefaultCheckoutCheckpointService[0];
  row.revision = 3; row.cartCode = 'cart'; row.evidence.orderCode = 'order';
  row.evidence.couponAcquisitionRecovery.status = 'UNCONFIRMED';
  const before = structuredClone(f.tables), checkpoint = structuredClone(row);
  const result = await recovery.commandStatus({ ...f.r, commandCode: 'checkout' });
  assert.deepEqual(result.couponRecoveryDiagnostics, { contract: 'COUPON_RECOVERY_INSPECTION_V1', readOnly: true,
    units: [{ unitIndex: 0, allocationStatus: 'RESERVED', inputDisposition: 'UNSET', couponStatus: 'RESERVED', stage: 'EVIDENCE_CONFIRMED', condition: 'NONE' }] });
  assert.equal(result.originalPaymentRecordCount, 1);
  assert.equal(result.status, 'COMPENSATION_REQUIRED'); assert.equal(result.revision, 3);
  assert.deepEqual(f.tables, before); assert.deepEqual(row, checkpoint);
  assert.equal(result.recoveryAction, undefined);
  let lookups = 0;
  const inspect = SERVICE.DefaultDigitalCommerceCouponAcquisitionService.inspectRecovery;
  SERVICE.DefaultDigitalCommerceCouponAcquisitionService = { ...SERVICE.DefaultDigitalCommerceCouponAcquisitionService,
    inspectRecovery: async (...args) => { lookups++; return inspect.apply(acquisition, args); } };
  for (const patch of [{ tenant: 'foreign' }, { ownerId: 'foreign' }]) {
    const foreign = await recovery.commandStatus({ ...f.r, ...patch, commandCode: 'checkout' });
    assert.equal(foreign.couponRecoveryDiagnostics, undefined);
  }
  for (const patch of [{ enterpriseCode: 'foreign' }, { ownerRef: { ...f.r.ownerRef, code: 'foreign' } },
    { actorRef: { ...f.r.actorRef, code: 'foreign' } }])
    await assert.rejects(recovery.commandStatus({ ...f.r, ...patch, commandCode: 'checkout' }));
  assert.equal(lookups, 0);
});

test('delegated finite offer uses issuer allocation and merchant coupon through denial release and replay', async t => {
  const f = await denied(t, true), unit = f.reservations[0];
  const allocation = f.tables.get('couponAcquisitionReservation').get(unit.offerAllocationCode);
  assert.equal(allocation.enterpriseCode, 'buyer-enterprise');
  assert.equal(f.tables.get('coupon').get(unit.code).enterpriseCode, 'issuer');
  assert.deepEqual(await checkout.releaseReservations(f.r, f.reservations), f.expected);
  assert.deepEqual(await checkout.releaseReservations(f.r, f.reservations), f.expected);
});

test('delegated finite offer inspection binds issuer allocation separately from merchant coupon', async t => {
  const f = await denied(t, true);
  assert.deepEqual(await acquisition.inspectRecovery(f.r, f.reservations[0]), {
    allocationStatus: 'RESERVED', inputDisposition: 'UNSET', couponStatus: 'RESERVED', stage: 'EVIDENCE_CONFIRMED', condition: 'NONE'
  });
});

test('delegated BOTH callback uses frozen merchant scope with issuer-owned allocation through denial release', async t => {
  const f = await denied(t, true, 'BOTH');
  assert.equal(f.state.reserved, true);
  assert.deepEqual(await checkout.releaseReservations(f.r, f.reservations), f.expected);
  assert.equal(f.state.reserved, false);
  assert.deepEqual(await checkout.releaseReservations(f.r, f.reservations), f.expected);
});

for (const [condition, mutate] of [
  ['ALLOCATION_ISSUER', f => { f.allocation.enterpriseCode = 'foreign'; }],
  ['ALLOCATION_MERCHANT', f => { f.allocation.evidence.campaign.vendorEnterpriseRef.code = 'foreign'; }],
  ['ALLOCATION_MERCHANT', f => { f.allocation.evidence.identity.promotionCode = 'foreign'; }],
  ['ALLOCATION_OWNER', f => { f.allocation.evidence.identity.ownerId = 'foreign'; }],
  ['ALLOCATION_COMMAND', f => { f.allocation.evidence.identity.idempotencyKey = 'foreign'; }],
  ['ALLOCATION_STATE', f => { f.allocation.evidence.status = 'INVALID'; }],
  ['PAYMENT_PENDING', f => { f.checkpoint.evidence.couponAcquisitionRecovery.paymentAttemptUnconfirmed = true; }],
  ['DENIAL_PHASES', f => { f.checkpoint.evidence.completed.pop(); }],
  ['DENIAL_COMMAND', f => { f.checkpoint.evidence.couponAcquisitionRecovery.cartCode = 'foreign'; }],
  ['DECISION_MISMATCH', f => { f.checkpoint.evidence.paymentDenialDecision = { ...f.checkpoint.evidence.paymentDenialDecision, code: 'foreign' }; }],
  ['PAYMENT_RECEIPT', f => { f.db.DefaultPaymentTransactionEntryService[0].status = 'CAPTURED'; }],
  ['ORDER_PRESENT', f => { f.db.DefaultCommerceOrderService.push({ tenant: 't', code: 'order' }); }],
]) test('inspection discriminates ' + condition + ' without weakening release proof', async t => {
  const f = await denied(t, true), unit = f.reservations[0];
  f.allocation = f.tables.get('couponAcquisitionReservation').get(unit.offerAllocationCode);
  f.checkpoint = f.db.DefaultCheckoutCheckpointService[0];
  mutate(f);
  const before = structuredClone(f.tables), result = await acquisition.inspectRecovery(f.r, unit);
  assert.equal(result.condition, condition);
  assert.equal(result.failureCode, 'ERR_DIGITAL_COUPON_RECOVERY_INSPECTION');
  assert.deepEqual(f.tables, before);
  assert.equal((await checkout.releaseReservations(f.r, f.reservations))[0].status, 'FAILED');
});

test('delegated source callback refuses issuer-only grant and foreign merchant without source effects', async t => {
  const f = await denied(t, true, 'BOTH'), unit = f.reservations[0];
  const row = f.tables.get('couponAcquisitionReservation').get(unit.offerAllocationCode), i = row.evidence.identity;
  const input = { contractVersion: 1, enterpriseCode: 'issuer', phase: 'release', ownerRef: i.ownerRef,
    ownerId: i.ownerId, orderCode: i.orderCode, entryCode: i.entryCode, productCode: i.productCode,
    promotionCode: i.promotionCode, operationKey: i.idempotencyKey, idempotencyKey: i.idempotencyKey,
    certificateCodes: i.certificateCodes, requirements: row.evidence.campaign.couponOffer.requirements };
  const before = structuredClone(f.tables), phases = f.state.phases.slice();
  f.config.couponAcquisition.sourceProof.callers[0].enterpriseCode = 'buyer-enterprise';
  await assert.rejects(acquisition.sourceProof(f.sourceRequest, input), { code: 'ERR_DIGITAL_COUPON_SOURCE_GRANT' });
  f.config.couponAcquisition.sourceProof.callers[0].enterpriseCode = 'issuer';
  await assert.rejects(acquisition.sourceProof(f.sourceRequest, { ...input, enterpriseCode: 'buyer-enterprise' }),
    { code: 'ERR_DIGITAL_COUPON_SOURCE_GRANT' });
  assert.deepEqual(f.tables, before); assert.deepEqual(f.state.phases, phases);
  assert.equal(f.state.reserved, true);
});

test('delegated source callback rejects altered original issuance membership before certificate release', async t => {
  const f = await denied(t, true, 'BOTH'), unit = f.reservations[0];
  const row = f.tables.get('couponAcquisitionReservation').get(unit.offerAllocationCode), i = row.evidence.identity;
  const input = { contractVersion: 1, enterpriseCode: 'issuer', phase: 'release', ownerRef: i.ownerRef,
    ownerId: i.ownerId, orderCode: i.orderCode, entryCode: i.entryCode, productCode: i.productCode,
    promotionCode: i.promotionCode, operationKey: i.idempotencyKey, idempotencyKey: i.idempotencyKey,
    certificateCodes: i.certificateCodes, requirements: row.evidence.campaign.couponOffer.requirements };
  f.tables.get('couponBatch').get('batch').secureIssuance.units[0].protectedFingerprint = '0'.repeat(64);
  const before = structuredClone(f.tables), phases = f.state.phases.slice();
  await assert.rejects(acquisition.sourceProof(f.sourceRequest, input), { code: 'ERR_DIGITAL_COUPON_SOURCE_ALLOCATION_BINDING' });
  assert.deepEqual(f.tables, before);
  assert.deepEqual(f.state.phases, phases);
  assert.equal(f.state.reserved, true);
});
