/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';
/**
 * @module wasteReward/test/wasteMaterialValueNativePersistenceAcceptance
 * @description Opt-in native material-value assessment, payment intent, Loyalty handoff idempotency and restart recovery.
 * Valuation, payment and Loyalty ports are explicitly synthetic and qualify only Waste owner persistence and recovery.
 * @layer test
 * @owner wasteReward
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const Enum = require('../../../../nodics.foundation/modules/nConfig/bin/enum');
const fixture = require('../../../test/helpers/nativeOwnerPersistenceFixture');
const assessment = require('../src/service/defaultWasteMaterialValueAssessmentService');
const settlement = require('../src/service/defaultWasteMaterialValueSettlementService');
const ledger = require('../../../../nodics.loyalty/modules/loyaltyLedger/src/service/defaultLoyaltyLedgerPostingService');

const ref = (code, schema = 'source', module = 'finance') => ({ module, schema, code });
const owner = (code, schema = 'customer') => ref(code, schema, 'profile');
const permissions = ['waste.materialValue.assess', 'waste.materialValue.release', 'waste.materialValue.read'];

function descriptors() {
    const reward = require('../src/schemas/schemas').wasteReward;
    const submission = require('../../wasteSubmission/src/schemas/schemas').wasteSubmission;
    const receipt = require('../../wasteReceipt/src/schemas/schemas').wasteReceipt;
    const core = require('../../wasteCore/src/schemas/schemas').wasteCore;
    return [
        ...['wasteMaterialValueBatch', 'wasteMaterialValuePolicy', 'wasteMaterialValueContributionClaim',
            'wasteMaterialValuePaymentClaim'].map(schemaName =>
            ({ moduleName: 'wasteReward', schemaName, schema: reward[schemaName] })),
        { moduleName: 'wasteSubmission', schemaName: 'wasteSubmission', schema: submission.wasteSubmission },
        { moduleName: 'wasteReceipt', schemaName: 'wasteReceipt', schema: receipt.wasteReceipt },
        { moduleName: 'wasteCore', schemaName: 'wasteAsset', schema: core.wasteAsset },
    ];
}

function enums() {
    const definitions = { ...require('../../wasteCore/src/utils/enums'), ...require('../src/utils/enums') };
    return Object.fromEntries(Object.entries(definitions)
        .map(([name, contribution]) => [name, new Enum(contribution.definition)]));
}

test('native Material value: payment-gated reward recovers one frozen earning after unknown outcome and reconnect', {
    skip: !process.env.NODICS_WASTE_NATIVE_MONGO_URI,
}, async t => {
    const settings = { wasteMaterialValue: { evidence: {
        valuationProviderService: 'NativeSyntheticValuationService', paymentProviderService: null,
        qualificationRef: ref('native-test-qualification'), allowSynthetic: true,
    } } };
    const f = await fixture.create(t, { schemas: descriptors(), settings, enums: enums() });
    const request = payload => ({ tenant: f.tenant, authData: { tenant: f.tenant, principalType: 'service',
        loginId: 'native-material-owner', permissions }, payload });
    const policy = { code: 'native-material-policy', version: '1', status: 'ACTIVE', programCode: 'NATIVE_PROGRAM',
        rewardTypeCode: 'points', currency: 'AED', currencyScale: 2, rewardScale: 2, basisScale: 3,
        commercialModel: 'CUSTOMER_SHARING', contributorShare: { numerator: '1', denominator: '2' },
        conversionRate: { numerator: '2', denominator: '1' }, roundingMode: 'DOWN',
        categories: { ELECTRONICS: { basis: 'QUANTITY', unitOfMeasure: 'item', weight: '1' } }, revision: 0 };
    const valuation = { status: 'CONFIRMED', synthetic: true, valuationRef: ref('synthetic-valuation'),
        batchRef: ref('synthetic-batch'), payerRef: owner('synthetic-recycler', 'enterprise'),
        payeeRef: owner('synthetic-collector', 'enterprise'), confirmationRef: ref('synthetic-valuation-confirmation'),
        currency: 'AED', confirmedValue: '20.00', policyRef: ref(policy.code, 'wasteMaterialValuePolicy', 'wasteReward'),
        contributions: [{ contributionRef: ref('native-contribution', 'wasteSubmission', 'wasteSubmission'),
            receiptRef: ref('native-receipt', 'wasteReceipt', 'wasteReceipt'), individualValue: '20.00' }] };
    let payment, loseEarningAcknowledgement = true;
    const earnings = new Map(), earningCalls = [];
    Object.assign(SERVICE, {
        DefaultWasteMaterialValueAssessmentService: assessment,
        DefaultWasteMaterialValueSettlementService: settlement,
        DefaultSecuredRequestPipelineService: {
            getGrantedPermissions: input => input.authData.permissions || [],
            isPermissionGranted: (permission, granted) => granted.includes(permission),
        },
        NativeSyntheticValuationService: { readValuation: async () => structuredClone(valuation) },
        NativeSyntheticPaymentService: { readPayment: async () => structuredClone(payment) },
        DefaultModuleService: { invokeModule: async input => {
            if (input.apiName === '/wallets') return { data: { code: input.requestBody.ownerType + ':' + input.requestBody.ownerCode } };
            assert.equal(input.apiName, '/reward-earnings');
            earningCalls.push(structuredClone(input.requestBody));
            const body = input.requestBody;
            let entry = earnings.get(body.idempotencyKey);
            if (!entry) {
                entry = ledger.buildEntry({ ...body, entryType: 'EARN', code: 'NATIVE-LEDGER:' + earnings.size });
                earnings.set(body.idempotencyKey, structuredClone(entry));
            }
            if (loseEarningAcknowledgement) {
                loseEarningAcknowledgement = false;
                throw new Error('synthetic Loyalty acknowledgement lost after idempotent earning');
            }
            return { data: { ledgerEntry: structuredClone(entry) } };
        } },
    });
    await SERVICE.DefaultWasteSubmissionService.save({ ...request({}), model: {
        code: 'native-contribution', submitterRef: owner('original-contributor'), submissionChannel: 'WEB',
        submissionStatus: 'APPROVED', revision: 0,
    } });
    await SERVICE.DefaultWasteReceiptService.save({ ...request({}), model: {
        code: 'native-receipt', submissionCode: 'native-contribution', collectionPointCode: 'native-centre',
        receivedBy: owner('receiving-enterprise', 'enterprise'), receivedAt: new Date('2026-10-20T12:00:00.000Z'),
        receiptStatus: 'RECEIVED', receivedQuantity: 1,
        receivedFacts: { materialCategoryCode: 'ELECTRONICS', quantityUnitOfMeasure: 'item' }, revision: 0,
    } });
    await SERVICE.DefaultWasteMaterialValuePolicyService.save({ ...request({}), model: policy });

    const batch = await assessment.assess(request({ evidenceRef: ref('synthetic-valuation-source') }));
    assert.equal(batch.synthetic, true);
    assert.equal(batch.allocations[0].attributedValue, '20.00');
    assert.equal(batch.allocations[0].rewardAmount, '20.00');
    const releaseRequest = request({ batchCode: batch.code, allocationCode: batch.allocations[0].code,
        paymentEvidenceRef: ref('synthetic-payment-source') });
    await assert.rejects(settlement.release(releaseRequest), { code: 'ERR_MATERIAL_VALUE_UNAVAILABLE' });
    assert.equal(earnings.size, 0);

    payment = { status: 'CONFIRMED', synthetic: true, paymentRef: ref('synthetic-payment'),
        confirmationRef: ref('synthetic-payment-confirmation'), batchRef: batch.batchRef,
        valuationRef: batch.valuationRef, payerRef: batch.payerRef, payeeRef: batch.payeeRef,
        currency: batch.currency, amount: batch.allocations[0].attributedValue,
        coverage: [{ allocationCode: batch.allocations[0].code, amount: batch.allocations[0].attributedValue }] };
    settings.wasteMaterialValue.evidence.paymentProviderService = 'NativeSyntheticPaymentService';
    await assert.rejects(settlement.release(releaseRequest), /acknowledgement lost/);
    let persisted = (await SERVICE.DefaultWasteMaterialValueBatchService.get({ tenant: f.tenant,
        query: { code: batch.code } })).result[0];
    assert.equal(persisted.releases[0].status, 'CREDIT_PENDING');
    assert.equal(earnings.size, 1);

    await f.reconnect();
    const retries = await Promise.allSettled([settlement.release(releaseRequest), settlement.release(releaseRequest)]);
    assert.ok(retries.some(result => result.status === 'fulfilled'));
    const completed = await settlement.release(releaseRequest);
    assert.equal(completed.status, 'COMPLETED');
    assert.equal(completed.walletCode, 'CUSTOMER:original-contributor');
    assert.equal(earnings.size, 1);
    assert.equal(new Set(earningCalls.map(call => call.idempotencyKey)).size, 1);
    assert.ok(earningCalls.every(call => call.sourceType === 'WASTE_MATERIAL_VALUE' &&
        call.reasonCode === 'RECYCLER_PAID_MATERIAL_VALUE' && call.metadata.sourceLabel === 'Material value'));
    await f.reconnect();
    assert.deepEqual(await settlement.release(releaseRequest), completed);
    persisted = (await SERVICE.DefaultWasteMaterialValueBatchService.get({ tenant: f.tenant,
        query: { code: batch.code } })).result[0];
    assert.equal(persisted.releases.length, 1);
    assert.equal(persisted.releases[0].status, 'COMPLETED');
    assert.equal((await SERVICE.DefaultWasteMaterialValueContributionClaimService.get({ tenant: f.tenant, query: {} })).result.length, 1);
    assert.equal((await SERVICE.DefaultWasteMaterialValuePaymentClaimService.get({ tenant: f.tenant, query: {} })).result.length, 1);
    assert.ok(f.commands.some(command => command.name === 'findAndModify'));
    t.diagnostic('PASS: native Waste Reward policy/batch/claim persistence, payment gate, stable Loyalty idempotency, one-winner reconciliation and reconnect recovery. Payment, valuation and Loyalty ports are synthetic; recycler payment and live Loyalty remain unqualified.');
});
