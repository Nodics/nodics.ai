/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';
require("./runtimeEnums.js")();
/** @module wasteReward/test/materialValue @description Focused immutable attribution, qualified payment and idempotent Loyalty release unit tests. No live funds or repositories. @owner wasteReward @layer test */
const { test, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const assessment = require('../src/service/defaultWasteMaterialValueAssessmentService');
const settlement = require('../src/service/defaultWasteMaterialValueSettlementService');
const fixture = require('./repositoryFixture');
const realLoyalty = require('./loyaltyHandoffFixture');

test('real Loyalty API handoff preserves material source metadata and original Enterprise wallet', async () => {
    const batch = await assess(); cover(batch, [1]);
    const loyalty = realLoyalty.install(), command = releaseRequest(batch, batch.allocations[1]);
    const completed = await settlement.release(command);
    assert.equal(completed.status, 'COMPLETED');
    assert.equal(loyalty.rows.LoyaltyWallet.length, 1);
    assert.equal(loyalty.rows.LoyaltyWallet[0].ownerType, 'ENTERPRISE');
    assert.equal(loyalty.rows.LoyaltyWallet[0].ownerCode, 'O2');
    assert.equal(loyalty.rows.LoyaltyWalletRewardBalance[0].available, '30.00');
    const entry = loyalty.rows.RewardLedgerEntry[0];
    assert.equal(entry.sourceType, 'WASTE_MATERIAL_VALUE');
    assert.equal(entry.metadata.sourceLabel, 'Material value');
    assert.deepEqual(entry.metadata.originalOwnerRef, owner('O2', 'enterprise'));
    assert.equal(entry.reasonCode, 'RECYCLER_PAID_MATERIAL_VALUE');
    assert.equal(entry.metadata.policyCode, batch.policy.code);
    assert.equal(entry.metadata.policyVersion, batch.policy.version);
    assert.deepEqual((await settlement.release(command)).ledgerRef, completed.ledgerRef);
    assert.equal(loyalty.rows.RewardLedgerEntry.length, 1);
});

test('real Loyalty lost response retains frozen credit and replays without a second balance movement', async () => {
    const batch = await assess(); cover(batch);
    const loyalty = realLoyalty.install(), command = releaseRequest(batch);
    loyalty.state.loseResponse = true;
    await assert.rejects(settlement.release(command), /lost Loyalty response/);
    assert.equal(f.get('wasteMaterialValueBatch', batch.code).releases[0].status, 'CREDIT_PENDING');
    assert.equal(loyalty.rows.LoyaltyWalletRewardBalance[0].available, '60.00');
    const completed = await settlement.release(command);
    assert.equal(completed.status, 'COMPLETED');
    assert.equal(loyalty.rows.RewardLedgerEntry.length, 1);
    assert.equal(loyalty.rows.LoyaltyWalletRewardBalance[0].available, '60.00');
    const earnings = loyalty.state.calls.filter(call => call.apiName === '/reward-earnings');
    assert.equal(earnings.length, 2);
    assert.deepEqual(earnings[0].requestBody, earnings[1].requestBody);
});

test('real Loyalty transaction rolls back failed ledger write and original release remains retryable', async () => {
    const batch = await assess(); cover(batch);
    const loyalty = realLoyalty.install(), command = releaseRequest(batch);
    loyalty.state.failLedger = true;
    await assert.rejects(settlement.release(command), /injected ledger failure/);
    assert.equal(loyalty.rows.LoyaltyWalletRewardBalance.length, 0);
    assert.equal(loyalty.rows.RewardLedgerEntry.length, 0);
    assert.equal(f.get('wasteMaterialValueBatch', batch.code).releases[0].status, 'CREDIT_PENDING');
    assert.equal((await settlement.release(command)).status, 'COMPLETED');
    assert.equal(loyalty.rows.LoyaltyWalletRewardBalance[0].available, '60.00');
    assert.equal(loyalty.rows.RewardLedgerEntry.length, 1);
});

test('real Loyalty closed wallet admission cannot complete or redirect a pending material release', async () => {
    const batch = await assess(); cover(batch);
    const loyalty = realLoyalty.install(), command = releaseRequest(batch);
    loyalty.state.failLedger = true;
    await assert.rejects(settlement.release(command));
    const frozenWallet = f.get('wasteMaterialValueBatch', batch.code).releases[0].walletCode;
    loyalty.rows.LoyaltyWallet[0].status = 'CLOSED';
    await assert.rejects(settlement.release(command), { code: 'ERR_LOYALTY_WALLET_UNAVAILABLE' });
    assert.equal(loyalty.rows.RewardLedgerEntry.length, 0);
    assert.equal(f.get('wasteMaterialValueBatch', batch.code).releases[0].walletCode, frozenWallet);
});

test('failed Loyalty envelope and missing provenance cannot mark a credit complete', async () => {
    const batch = await assess(); cover(batch);
    const transport = SERVICE.DefaultModuleService.invokeModule;
    SERVICE.DefaultModuleService.invokeModule = async input => {
        const response = await transport(input);
        return input.apiName === '/reward-earnings' ? { success: false, data: response.data } : response;
    };
    await assert.rejects(settlement.release(releaseRequest(batch)), { code: 'ERR_MATERIAL_VALUE_LOYALTY' });
    assert.equal(f.get('wasteMaterialValueBatch', batch.code).releases[0].status, 'CREDIT_PENDING');
    SERVICE.DefaultModuleService.invokeModule = async input => {
        const response = await transport(input);
        if (input.apiName === '/reward-earnings') response.data.ledgerEntry = { ...response.data.ledgerEntry, metadata: {} };
        return response;
    };
    await assert.rejects(settlement.release(releaseRequest(batch)), { code: 'ERR_MATERIAL_VALUE_LOYALTY' });
    assert.equal(credits.size, 1);
});

const ledger = require('../../../../nodics.loyalty/modules/loyaltyLedger/src/service/defaultLoyaltyLedgerPostingService');
const schemas = require('../src/schemas/schemas').wasteReward;
const ref = (code, schema = 'source', module = 'finance') => ({ module, schema, code });
const owner = (code, schema = 'customer') => ref(code, schema, 'profile');
const permissions = ['waste.materialValue.assess', 'waste.materialValue.release', 'waste.materialValue.read'];
const request = payload => ({ tenant: 'T', authData: { tenant: 'T', principalType: 'service', loginId: 'waste-workbench', permissions }, payload });
let f, settings, valuation, payment, creditCalls, credits, loseCreditResponse;
const assess = () => assessment.assess(request({ evidenceRef: ref('valuation-source') }));
test('category attribution weights inherit owner digit bounds and honor explicit narrowing', async () => {
    const item = { contributionRef: ref('S1', 'wasteSubmission', 'wasteSubmission'), receiptRef: ref('R1', 'wasteReceipt', 'wasteReceipt') };
    const policy = structuredClone(f.get('wasteMaterialValuePolicy', valuation.policyRef.code));
    policy.categories.METAL.weight = '1'.repeat(30);
    const defaults = assessment.settings(request({}));
    assert.equal(defaults.validation.categoryWeightDigits.maximum, 30);
    await assessment.contribution(request({}), item, policy, defaults);
    policy.categories.METAL.weight = '1'.repeat(31);
    await assert.rejects(assessment.contribution(request({}), item, policy, defaults), /attribution basis/);
    settings.validation = { categoryWeightDigits: { maximum: 1 } };
    policy.categories.METAL.weight = '10';
    await assert.rejects(assessment.contribution(request({}), item, policy, assessment.settings(request({}))), /attribution basis/);
    policy.categories.METAL.weight = '1';
    await assessment.contribution(request({}), item, policy, assessment.settings(request({})));
});
const releaseRequest = (batch, allocation = batch.allocations[0]) => request({ batchCode: batch.code, allocationCode: allocation.code, paymentEvidenceRef: ref('bank-proof') });
const cover = (batch, indices = [0], amount) => {
    payment = { status: 'CONFIRMED', synthetic: true, paymentRef: ref('actual-receipt'), confirmationRef: ref('finance-confirmation'),
        batchRef: batch.batchRef, valuationRef: batch.valuationRef, payerRef: batch.payerRef, payeeRef: batch.payeeRef, currency: batch.currency,
        amount: amount || indices.map(i => Number(batch.allocations[i].attributedValue)).reduce((a,b) => a+b, 0).toFixed(2),
        coverage: indices.map(i => ({ allocationCode: batch.allocations[i].code, amount: batch.allocations[i].attributedValue })) };
};
beforeEach(() => {
    f = fixture.create(['wasteMaterialValueBatch', 'wasteMaterialValuePolicy', 'wasteMaterialValueContributionClaim', 'wasteMaterialValuePaymentClaim', 'wasteSubmission', 'wasteReceipt', 'wasteAsset']);
    for (let n = 1; n <= 3; n++) {
        f.put('wasteSubmission', { code: 'S' + n, submitterRef: owner('O' + n, n === 2 ? 'enterprise' : 'customer') });
        f.put('wasteReceipt', { code: 'R' + n, submissionCode: 'S' + n, receiptStatus: 'RECEIVED',
            receivedQuantity: n === 3 ? 2 : 1, receivedFacts: { materialCategoryCode: 'METAL', quantityUnitOfMeasure: 'item' } });
    }
    settings = { evidence: { valuationProviderService: 'ValuationFixtureService', paymentProviderService: 'PaymentFixtureService',
        qualificationRef: ref('financial-source-qualified'), allowSynthetic: true } };
    valuation = { status: 'CONFIRMED', synthetic: true, valuationRef: ref('valuation'), batchRef: ref('batch'), payerRef: ref('recycler', 'enterprise', 'profile'),
        payeeRef: ref('collector', 'enterprise', 'profile'), confirmationRef: ref('partner-confirmation'), currency: 'AED', confirmedValue: '100.00',
        policy: { code: 'agreed-policy', version: '3', programCode: 'SELECTED_PROGRAM', rewardTypeCode: 'points', currency: 'AED', currencyScale: 2, rewardScale: 2,
            basisScale: 3, commercialModel: 'CUSTOMER_SHARING', contributorShare: { numerator: '1', denominator: '2' },
            conversionRate: { numerator: '3', denominator: '1' }, roundingMode: 'DOWN',
            categories: { METAL: { basis: 'QUANTITY', unitOfMeasure: 'item', weight: '1' } } },
        contributions: [1,2,3].map(n => ({ contributionRef: ref('S' + n, 'wasteSubmission', 'wasteSubmission'),
            receiptRef: ref('R' + n, 'wasteReceipt', 'wasteReceipt'), ...(n === 1 ? { individualValue: '40.00' } : {}) })) };
    f.put('wasteMaterialValuePolicy', { ...valuation.policy, status: 'ACTIVE', revision: 1 });
    valuation.policyRef = ref(valuation.policy.code, 'wasteMaterialValuePolicy', 'wasteReward');
    delete valuation.policy;
    payment = null; creditCalls = []; credits = new Map(); loseCreditResponse = false;
    global.CONFIG = { get: () => settings };
    global.SERVICE = { ...f.services, DefaultWasteMaterialValueAssessmentService: assessment, DefaultWasteMaterialValueSettlementService: settlement,
        DefaultWasteMaterialValueReadAccessService: require('../src/service/defaultWasteMaterialValueReadAccessService'),
        ValuationFixtureService: { readValuation: async () => structuredClone(valuation) },
        PaymentFixtureService: { readPayment: async () => structuredClone(payment) },
        DefaultModuleService: { invokeModule: async input => {
            assert.equal(input.tenant, 'T'); assert.equal(input.moduleName, 'loyaltyApi');
            assert.deepEqual(input.targetAuthority, { runtimeRole: 'LOYALTY' });
            const body = input.requestBody;
            if (input.apiName === '/wallets') return { data: { code: body.ownerType + ':' + body.ownerCode } };
            assert.equal(input.apiName, '/reward-earnings'); creditCalls.push(structuredClone(body));
            let entry = credits.get(body.idempotencyKey);
            if (!entry) { entry = ledger.buildEntry({ ...body, entryType: 'EARN', code: 'LEDGER:' + credits.size }); credits.set(body.idempotencyKey, structuredClone(entry)); }
            if (loseCreditResponse) { loseCreditResponse = false; throw new Error('lost credit response'); }
            return { data: { ledgerEntry: entry } };
        } }
    };
});
test('material schemas use managed revision storage and leave participation evidence unchanged', () => {
    for (const key of ['wasteMaterialValueBatch', 'wasteMaterialValuePolicy', 'wasteMaterialValueContributionClaim', 'wasteMaterialValuePaymentClaim']) {
        assert.deepEqual(schemas[key].backoffice.concurrency, { managed: true, field: 'revision' });
        assert.equal(schemas[key].router.enabled, false);
    }
    assert.deepEqual(schemas.wasteRewardAssessment.definition.assessmentType.enum, ['ESTIMATED','CONFIRMED','RECALCULATED']);
});
test('individual value precedes weighted pool, original Enterprise and exact rate evidence persist', async () => {
    const batch = await assess();
    assert.deepEqual(batch.allocations.map(row => row.attributedValue), ['40.00','20.00','40.00']);
    assert.deepEqual(batch.allocations.map(row => row.rewardAmount), ['60.00','30.00','60.00']);
    assert.equal(batch.allocations[1].ownerRef.schema, 'enterprise');
    assert.deepEqual(batch.policy, f.get('wasteMaterialValuePolicy', valuation.policyRef.code));
    assert.equal((await assess()).code, batch.code);
    const policy = f.get('wasteMaterialValuePolicy', valuation.policyRef.code); policy.version = '4';
    f.put('wasteMaterialValuePolicy', policy);
    await assert.rejects(assess(), { code: 'ERR_MATERIAL_VALUE_CONFLICT' });
});

test('only an active governed policy with matching currency can supply sharing and conversion terms', async () => {
    valuation.policy = f.get('wasteMaterialValuePolicy', valuation.policyRef.code);
    await assert.rejects(assess(), { code: 'ERR_MATERIAL_VALUE_POLICY' });
    delete valuation.policy;
    const policy = f.get('wasteMaterialValuePolicy', valuation.policyRef.code);
    policy.status = 'INACTIVE'; f.put('wasteMaterialValuePolicy', policy);
    await assert.rejects(assess(), { code: 'ERR_MATERIAL_VALUE_POLICY' });
    policy.status = 'ACTIVE'; policy.currency = 'USD'; f.put('wasteMaterialValuePolicy', policy);
    await assert.rejects(assess(), { code: 'ERR_MATERIAL_VALUE_POLICY' });
    policy.currency = 'AED'; f.put('wasteMaterialValuePolicy', policy);
    assert.equal((await assess()).policy.currency, 'AED');
});
test('largest remainder attribution reconciles minor units and retains explicit zero individual values', async () => {
    valuation.confirmedValue = '0.03'; valuation.contributions[0].individualValue = '0.00';
    const row = f.get('wasteReceipt', 'R3'); row.receivedQuantity = 1; f.put('wasteReceipt', row);
    const batch = await assess();
    assert.deepEqual(batch.allocations.map(row => row.attributedValue), ['0.00','0.02','0.01']);
});
test('missing units, duplicate contributions, overvaluation, overprecision and invented program reject', async () => {
    const receipt = f.get('wasteReceipt', 'R1'); delete receipt.receivedFacts.quantityUnitOfMeasure; f.put('wasteReceipt', receipt);
    await assert.rejects(assess(), { code: 'ERR_MATERIAL_VALUE_EVIDENCE' });
    receipt.receivedFacts.quantityUnitOfMeasure = 'item'; f.put('wasteReceipt', receipt);
    valuation.contributions.push(valuation.contributions[0]);
    await assert.rejects(assess(), { code: 'ERR_MATERIAL_VALUE_EVIDENCE' });
    valuation.contributions.pop(); valuation.contributions[0].individualValue = '101.00';
    await assert.rejects(assess(), { code: 'ERR_MATERIAL_VALUE_EVIDENCE' });
    valuation.contributions[0].individualValue = '40.001';
    await assert.rejects(assess(), { code: 'ERR_LOYALTY_AMOUNT_PRECISION' });
    valuation.contributions[0].individualValue = '40.00';
    const policy = f.get('wasteMaterialValuePolicy', valuation.policyRef.code); delete policy.programCode;
    f.put('wasteMaterialValuePolicy', policy);
    await assert.rejects(assess(), { code: 'ERR_MATERIAL_VALUE_POLICY' });
});
test('contribution cannot be assessed into a second batch and interrupted claim creation resumes', async () => {
    f.failures.push({ schema: 'wasteMaterialValueBatch', phase: 'before-save' });
    await assert.rejects(assess(), /injected/);
    const batch = await assess(); assert.equal(batch.allocations.length, 3);
    valuation.batchRef = ref('other-batch');
    await assert.rejects(assess(), { code: 'ERR_MATERIAL_VALUE_CONFLICT' });
});
test('value without qualified payment cannot credit, defaults and override validation fail closed', async () => {
    const batch = await assess();
    settings.evidence.paymentProviderService = null;
    await assert.rejects(settlement.release(releaseRequest(batch)), { code: 'ERR_MATERIAL_VALUE_UNAVAILABLE' });
    assert.equal(credits.size, 0);
    settings = {};
    await assert.rejects(assess(), { code: 'ERR_MATERIAL_VALUE_UNAVAILABLE' });
    settings = { limits: { contributionsPerBatch: 0 } };
    assert.throws(() => assessment.settings(request({})), { code: 'ERR_MATERIAL_VALUE_CONFIGURATION' });
});
test('payment-only, wrong scope/currency/payer/payee and uncovered allocation reject without credits', async () => {
    await assert.rejects(settlement.release(request({ batchCode: 'missing', allocationCode: 'missing' })), { code: 'ERR_MATERIAL_VALUE_NOT_FOUND' });
    const batch = await assess();
    for (const mutation of [
        p => { p.status = 'PENDING'; }, p => { p.currency = 'USD'; }, p => { p.batchRef = ref('wrong'); },
        p => { p.payerRef = ref('wrong'); }, p => { p.payeeRef = ref('wrong'); }, p => { p.amount = '39.99'; },
        p => { p.coverage[0].amount = '20.00'; }
    ]) {
        cover(batch); mutation(payment);
        await assert.rejects(settlement.release(releaseRequest(batch)), { code: 'ERR_MATERIAL_VALUE_PAYMENT' });
    }
    cover(batch, [1]);
    await assert.rejects(settlement.release(releaseRequest(batch)), { code: 'ERR_MATERIAL_VALUE_PAYMENT' });
    assert.equal(credits.size, 0);
});
test('partial paid batch releases only its fully covered original allocation, including Enterprise', async () => {
    f.put('wasteAsset', { code: 'certificate', sourceSubmissionCode: 'S2', originalOwnerRef: owner('O2', 'enterprise'),
        ownerRef: owner('buyer'), assetStatus: 'CONSUMED' });
    const batch = await assess(); cover(batch, [1]);
    const result = await settlement.release(releaseRequest(batch, batch.allocations[1]));
    assert.equal(result.status, 'COMPLETED'); assert.equal(result.walletCode, 'ENTERPRISE:O2');
    assert.equal(creditCalls[0].amount, '30.00'); assert.equal(creditCalls[0].sourceType, 'WASTE_MATERIAL_VALUE');
    assert.equal(creditCalls[0].metadata.sourceLabel, 'Material value');
    assert.equal(creditCalls[0].metadata.originalOwnerRef.code, 'O2');
    await assert.rejects(settlement.release(releaseRequest(batch)), { code: 'ERR_MATERIAL_VALUE_PAYMENT' });
    assert.equal((await settlement.release(releaseRequest(batch, batch.allocations[1]))).ledgerRef.code, result.ledgerRef.code);
    assert.equal(credits.size, 1); assert.equal(creditCalls.length, 1);
});
test('payment evidence cannot reuse paid coverage across separately confirmed allocation commands', async () => {
    const batch = await assess(); cover(batch);
    await settlement.release(releaseRequest(batch));
    cover(batch, [1], '40.00');
    await assert.rejects(settlement.release(releaseRequest(batch, batch.allocations[1])), { code: 'ERR_MATERIAL_VALUE_PAYMENT' });
    assert.equal(credits.size, 1);
});
test('lost credit response and post-credit persistence failure recover the same single ledger entry', async () => {
    const batch = await assess(); cover(batch);
    loseCreditResponse = true;
    await assert.rejects(settlement.release(releaseRequest(batch)), /lost credit response/);
    assert.equal(f.get('wasteMaterialValueBatch', batch.code).releases[0].status, 'CREDIT_PENDING');
    f.failures.push({ schema: 'wasteMaterialValueBatch', phase: 'before-update' });
    await assert.rejects(({ ...settlement }).release(releaseRequest(batch)), /injected/);
    assert.equal(credits.size, 1);
    const result = await ({ ...settlement }).release(releaseRequest(batch));
    assert.equal(result.status, 'COMPLETED'); assert.equal(credits.size, 1);
    assert.equal(new Set(creditCalls.map(row => row.idempotencyKey)).size, 1);
    await assert.rejects(settlement.release({ ...releaseRequest(batch), payload: { ...releaseRequest(batch).payload, paymentEvidenceRef: ref('changed-proof') } }), { code: 'ERR_MATERIAL_VALUE_CONFLICT' });
});
test('concurrent release serializes payment intent and credits once', async () => {
    const batch = await assess(); cover(batch);
    const results = await Promise.allSettled([settlement.release(releaseRequest(batch)), settlement.release(releaseRequest(batch))]);
    assert.equal(credits.size, 1); assert.ok(results.some(row => row.status === 'fulfilled'));
    assert.equal((await settlement.release(releaseRequest(batch))).status, 'COMPLETED');
});
test('no employee or parent payout, no caller permission bypass and no program-funded contributor credit', async () => {
    const batch = await assess(); cover(batch);
    const req = releaseRequest(batch);
    await assert.rejects(settlement.release({ ...req, authData: { ...req.authData, principalType: 'human' } }), { code: 'ERR_MATERIAL_VALUE_FORBIDDEN' });
    await assert.rejects(settlement.release({ ...req, tenant: 'OTHER' }), { code: 'ERR_MATERIAL_VALUE_FORBIDDEN' });
    await settlement.release(req);
    assert.equal(creditCalls[0].walletCode, 'CUSTOMER:O1');
    assert.equal(creditCalls[0].metadata.originalOwnerRef.code, 'O1');
    valuation.batchRef = ref('funded-batch'); valuation.contributions = [];
    for (let i = 4; i < 5; i++) {
        f.put('wasteSubmission', { code: 'S4', submitterRef: owner('O4') });
        f.put('wasteReceipt', { code: 'R4', submissionCode: 'S4', receiptStatus: 'RECEIVED', receivedQuantity: 1,
            receivedFacts: { materialCategoryCode: 'METAL', quantityUnitOfMeasure: 'item' } });
        valuation.contributions.push({ contributionRef: ref('S4','wasteSubmission','wasteSubmission'), receiptRef: ref('R4','wasteReceipt','wasteReceipt'), individualValue:'100.00' });
    }
    const policy = f.get('wasteMaterialValuePolicy', valuation.policyRef.code);
    policy.commercialModel = 'PROGRAM_FUNDED'; policy.contributorShare.numerator = '0';
    f.put('wasteMaterialValuePolicy', policy);
    const funded = await assess(); cover(funded);
    await assert.rejects(settlement.release(releaseRequest(funded)), { code: 'ERR_MATERIAL_VALUE_POLICY' });
});

test('an interrupted credit retains its original wallet even when wallet opening later changes', async () => {
    const batch = await assess(); cover(batch); loseCreditResponse = true;
    await assert.rejects(settlement.release(releaseRequest(batch)), /lost credit response/);
    const original = SERVICE.DefaultModuleService.invokeModule;
    SERVICE.DefaultModuleService.invokeModule = async input => {
        if (input.apiName === '/wallets') throw new Error('must reuse frozen wallet');
        return original(input);
    };
    const result = await settlement.release(releaseRequest(batch));
    assert.equal(result.walletCode, 'CUSTOMER:O1'); assert.equal(credits.size, 1);
});
test('mismatched earning readback stays pending and recovers only the original bound credit', async () => {
    const batch = await assess(); cover(batch);
    const original = SERVICE.DefaultModuleService.invokeModule;
    SERVICE.DefaultModuleService.invokeModule = async input => {
        const response = await original(input);
        if (input.apiName === '/reward-earnings') return { data: { ledgerEntry: { ...response.data.ledgerEntry, entryType: 'CAPTURE' } } };
        return response;
    };
    await assert.rejects(settlement.release(releaseRequest(batch)), { code: 'ERR_MATERIAL_VALUE_LOYALTY' });
    assert.equal(f.get('wasteMaterialValueBatch', batch.code).releases[0].status, 'CREDIT_PENDING');
    SERVICE.DefaultModuleService.invokeModule = original;
    assert.equal((await settlement.release(releaseRequest(batch))).status, 'COMPLETED');
    assert.equal(credits.size, 1);
});
test('provider timeout, synthetic rejection and missing qualification do not fabricate payment', async () => {
    const batch = await assess(); cover(batch);
    let aborted = false;
    SERVICE.AlternatePaymentService = { readPayment: async (input, context) => {
        context.signal.addEventListener('abort', () => { aborted = true; });
        return new Promise(() => {});
    } };
    settings.evidence.paymentProviderService = 'AlternatePaymentService'; settings.limits = { providerTimeoutMs: 5 };
    await assert.rejects(settlement.release(releaseRequest(batch)), { code: 'ERR_MATERIAL_VALUE_UNAVAILABLE' });
    assert.equal(aborted, true); assert.equal(credits.size, 0);
    settings.evidence.paymentProviderService = 'PaymentFixtureService'; settings.evidence.allowSynthetic = false;
    await assert.rejects(settlement.release(releaseRequest(batch)), { code: 'ERR_MATERIAL_VALUE_EVIDENCE' });
});

test('owner projection exposes only own pending/credited allocations and no batch counterparties', async () => {
    const batch = await assess();
    let result = await assessment.allocations(request({ ownerRef: owner('O2', 'enterprise') }));
    assert.equal(result.items[0].allocations.length, 1);
    assert.equal(result.items[0].allocations[0].status, 'AWAITING_PAYMENT');
    assert.equal(result.items[0].payerRef, undefined);
    cover(batch, [1]); await settlement.release(releaseRequest(batch, batch.allocations[1]));
    result = await assessment.allocations(request({ ownerRef: owner('O2', 'enterprise') }));
    assert.equal(result.items[0].allocations[0].status, 'COMPLETED');
    assert.equal((await assessment.allocations(request({ ownerRef: owner('foreign') }))).items.length, 0);
});

test('material facade/controller preserve trusted tenant and owner dispatch', async () => {
    const controller = require('../src/controller/defaultWasteMaterialValueController');
    global.FACADE = { DefaultWasteMaterialValueFacade: require('../src/facade/defaultWasteMaterialValueFacade') };
    const captured = [];
    SERVICE.DefaultWasteMaterialValueAssessmentService = { allocations: async req => { captured.push(req); return { items: [] }; } };
    const response = await controller.allocations({ authData: request({}).authData, httpRequest: { body: { tenant: 'SPOOF' } } });
    assert.deepEqual(response, { data: { items: [] } }); assert.equal(captured[0].tenant, 'T');
});
test('permission definitions are explicitly selected and manifest checksums match', () => {
    const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto');
    const section = require('../data/manifest.json').sections.permissionCatalogue;
    assert.equal(section.selectionPolicy, 'EXPLICIT');
    for (const [file, expected] of Object.entries(section.files))
        assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.resolve(__dirname, '../data', file))).digest('hex'), expected);
});
