/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module wasteReward/test/installedHttpAcceptance @description In-memory HTTP boundary over actual owner services; no network or live writes. @owner wasteReward @layer test */
'use strict';
const { test, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const fixture = require('./repositoryFixture');
const ref = (module, schema, code) => ({ module, schema, code });
const original = ref('profile', 'customer', 'original');
const qualification = ref('test', 'scope', 'local-mock');
const base = { contractVersion: 1, approvalReference: 'reviewed', environmentCode: 'exampleLocal',
    localDemo: true, isolatedPartition: true, baseUrl: 'http://127.0.0.1:4370',
    tenant: 'T', enterpriseCode: 'example', runCode: 'stable-case' };
const authorization = 'Bearer operator-supplied-test-proof';
let f, selection, calls, fetch, runner, adminAuth;
test('runner preserves existing native Admin bearer and human audit', async () => {
    const previous = CONFIG.get;
    CONFIG.get = key => ({ defaultTenant: 'T', defaultEnterprise: 'example',
        identityGovernance: { principalPolicy: { serviceGroup: 'serviceAccountUserGroup' } } }[key] ?? previous(key));
    SERVICE.DefaultSecuredRequestPipelineService = require('../../../../nodics.foundation/modules/nRouter/src/service/request/defaultSecuredRequestPipelineService');
    adminAuth = { tenant: 'T', entCode: 'example', principalType: 'human', tokenType: 'access',
        authenticationMethod: 'PASSWORD', loginId: 'existing-admin', authVersion: 1,
        userGroups: ['platformAdministratorUserGroup'], permissions: ['*'] };
    const before = structuredClone(adminAuth);
    assert.equal((await runner.run({ execute: true, selection, authorization, fetch })).state, 'PASSED');
    assert.deepEqual(adminAuth, before);
    const actor = f.get('wasteMaterialValueBatch', selection.batchCode).releases[0].sourceActor;
    assert.deepEqual(actor, { principalType: 'human', principalCode: 'existing-admin' });
});

require('./runtimeEnums')();
const assessment = require('../src/service/defaultWasteMaterialValueAssessmentService');
const settlement = require('../src/service/defaultWasteMaterialValueSettlementService');
const mock = require('../src/service/defaultWasteMaterialValueMockProviderService');
const realLoyalty = require('./loyaltyHandoffFixture');
beforeEach(async () => {
    adminAuth = undefined;
    runner = await import('../src/service/acceptance/defaultWasteMaterialValueHttpAcceptanceService.mjs');
    f = fixture.create(['wasteMaterialValueMockEvidence', 'wasteMaterialValueBatch', 'wasteMaterialValuePolicy',
        'wasteMaterialValueContributionClaim', 'wasteMaterialValuePaymentClaim', 'wasteSubmission', 'wasteReceipt', 'wasteAsset']);
    global.CONFIG = { get: () => ({ mock: { enabled: true }, evidence: {
        valuationProviderService: 'DefaultWasteMaterialValueMockProviderService', paymentProviderService: 'DefaultWasteMaterialValueMockProviderService',
        allowSynthetic: true, qualificationRef: qualification } }) };
    global.SERVICE = { ...f.services, DefaultWasteMaterialValueAssessmentService: assessment,
        DefaultWasteMaterialValueMockProviderService: mock };
    f.put('wasteSubmission', { code: 'submission', submitterRef: original });
    f.put('wasteReceipt', { code: 'receipt', submissionCode: 'submission', receiptStatus: 'RECEIVED', receivedQuantity: '1',
        receivedFacts: { materialCategoryCode: 'TEST', quantityUnitOfMeasure: 'item' } });
    f.put('wasteMaterialValuePolicy', { code: 'policy', version: '1', status: 'ACTIVE', programCode: 'SELECTED_PROGRAM',
        rewardTypeCode: 'points', currency: 'AED', currencyScale: 2, rewardScale: 2, basisScale: 0,
        commercialModel: 'CUSTOMER_SHARING', contributorShare: { numerator: '1', denominator: '1' },
        conversionRate: { numerator: '1', denominator: '1' }, roundingMode: 'DOWN',
        categories: { TEST: { basis: 'QUANTITY', unitOfMeasure: 'item', weight: '1' } } });
    const batchRef = ref('test', 'batch', 'batch'), contributionRef = ref('wasteSubmission', 'wasteSubmission', 'submission');
    const batchCode = 'MATERIAL_' + assessment.hash(Object.values(batchRef));
    const allocationCode = 'ALLOCATION_' + assessment.hash([batchCode, contributionRef]);
    selection = { ...base, valuationRef: mock.reference('valuation'), paymentEvidenceRef: mock.reference('payment'), batchCode,
        allocationCode, ownerRef: original, contributionRef, receiptRef: ref('wasteReceipt', 'wasteReceipt', 'receipt'),
        payerRef: ref('profile', 'enterprise', 'recycler'), payeeRef: ref('profile', 'enterprise', 'collector'),
        currency: 'AED', confirmedValue: '1.00', attributedValue: '1.00', paymentAmount: '1.00',
        programCode: 'SELECTED_PROGRAM', rewardTypeCode: 'points', rewardAmount: '1.00' };
    const put = (code, evidence) => f.put('wasteMaterialValueMockEvidence', { code, synthetic: true, qualificationRef: qualification,
        evidence: { ...evidence, synthetic: true, status: 'CONFIRMED', batchRef,
            payerRef: selection.payerRef, payeeRef: selection.payeeRef, currency: 'AED' } });
    put('valuation', { kind: 'valuation', confirmedValue: '1.00',
        policyRef: ref('wasteReward', 'wasteMaterialValuePolicy', 'policy'),
        contributions: [{ contributionRef, receiptRef: selection.receiptRef }] });
    put('payment', { kind: 'payment', valuationRef: selection.valuationRef, amount: '1.00',
        coverage: [{ allocationCode, amount: '1.00' }] });
    realLoyalty.install();
    calls = [];
    fetch = async (url, options) => {
        calls.push({ url: String(url), options }); assert.equal(options.headers.Authorization, authorization);
        const path = new URL(url).pathname;
        const request = { tenant: 'T', authorization: options.headers.Authorization, authData: adminAuth || { tenant: 'T', loginId: 'operator', principalType: 'service',
            permissions: ['waste.materialValue.assess', 'waste.materialValue.release', 'waste.materialValue.read'] }, payload: JSON.parse(options.body) };
        try {
            const data = path.endsWith('/assessments') ? await assessment.assess(request) :
                path.endsWith('/releases') ? await settlement.release(request) : await assessment.read(request);
            return Response.json({ data });
        } catch (e) { return Response.json({ code: e.code }, { status: 409 }); }
    };
});
test('installed HTTP material proves permanent payment mock, actual canonical earning and immutable replay', async () => {
    const result = await runner.run({ execute: true, selection, authorization, fetch });
    assert.equal(result.state, 'PASSED');
    assert.deepEqual((await runner.run({ execute: true, selection, authorization, fetch })).ledgerRef, result.ledgerRef);
    const batch = f.get('wasteMaterialValueBatch', selection.batchCode);
    assert.equal(batch.releases.length, 1); assert.equal(batch.releases[0].originalOwnerRef.code, 'original');
    assert.equal(batch.releases[0].synthetic, true);
});
test('material plan, real evidence selection and missing authorization fail before HTTP', async () => {
    assert.equal((await runner.run({ selection, fetch })).state, 'PLANNED');
    await assert.rejects(runner.run({ execute: true, selection, fetch }));
    await assert.rejects(runner.run({ execute: true, selection: { ...selection,
        valuationRef: ref('finance', 'actual', 'payment') }, authorization, fetch }));
    await assert.rejects(runner.run({ execute: true, selection: { ...selection, baseUrl: 'http://localhost@remote.test' }, authorization, fetch }));
    assert.equal(calls.length, 0); assert.equal(f.calls.length, 0);
});
test('material stops on absent payment prerequisites and never retries a lost response', async () => {
    const row = f.get('wasteMaterialValueMockEvidence', 'payment'); row.evidence.synthetic = false;
    f.put('wasteMaterialValueMockEvidence', row);
    await assert.rejects(runner.run({ execute: true, selection, authorization, fetch }), /refused/);
    assert.equal(f.get('wasteMaterialValueBatch', selection.batchCode).releases.length, 0);
    let count = 0;
    await assert.rejects(runner.run({ execute: true, selection, authorization, fetch: async () => {
        count++; throw Error('lost response');
    } }), /uncertain/);
    assert.equal(count, 1);
});


test('owner command metadata and help expose no activation or credential side effects', async () => {
    const props = require('../config/properties');
    const command = props.tooling.commands['acceptance:waste-material-value'];
    assert.equal(command.acceptanceContract, true);
    assert.equal(command.script, 'src/service/acceptance/defaultWasteMaterialValueHttpAcceptanceService.mjs');
    assert.match((await runner.main(['--help'])).usage, /--execute/);
    assert.equal(calls.length, 0);
});
test('malformed, contradictory and oversized HTTP envelopes stop without disclosing response data', async () => {
    for (const value of [{ success: false, data: { authorization } }, { data: {}, result: {} },
        { data: { error: authorization } }, { data: 'x'.repeat(262145) }]) {
        let count = 0;
        await assert.rejects(runner.run({ execute: true, selection, authorization, fetch: async () => {
            count++; return Response.json(value);
        } }), error => !error.message.includes(authorization));
        assert.equal(count, 1);
    }
});
test('a successful negative probe can never produce a passing acceptance result', async () => {
    await assert.rejects(runner.run({ execute: true, selection, authorization, fetch: async (url, options) => {
        const body = JSON.parse(options.body);
        if (body.paymentEvidenceRef?.schema === 'notMockEvidence')
            return Response.json({ data: {} });
        return fetch(url, options);
    } }), /refusal/);
});


test('lost mutation acknowledgement stops once and next invocation reconciles the original identity', async () => {
    let lost = false;
    await assert.rejects(runner.run({ execute: true, selection, authorization, fetch: async (url, options) => {
        const response = await fetch(url, options);
        if (!lost && new URL(url).pathname.endsWith('/waste/material-value/releases') && response.ok) {
            lost = true; throw Error('lost acknowledgement');
        }
        return response;
    } }), /uncertain/);
    assert.equal(lost, true);
    assert.equal((await runner.run({ execute: true, selection, authorization, fetch })).state, 'PASSED');
    assert.equal(f.get('wasteMaterialValueBatch', selection.batchCode).releases.length, 1);
});
