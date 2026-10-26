/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module wasteCarbon/test/installedHttpAcceptance @description In-memory HTTP boundary over actual owner services; no network or live writes. @owner wasteCarbon @layer test */
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
    const actor = f.get('wasteCarbonLot', selection.lotCode).operations[0].finalizationActor;
    assert.deepEqual(actor, { principalType: 'human', principalCode: 'existing-admin' });
});

const holding = require('../src/service/defaultWasteCarbonHoldingService');
const mock = require('../src/service/defaultWasteCarbonMockProviderService');
beforeEach(async () => {
    adminAuth = undefined;
    runner = await import('../src/service/acceptance/defaultWasteCarbonHttpAcceptanceService.mjs');
    f = fixture.create(['wasteCarbonMockEvidence', 'wasteCarbonLot', 'wasteCarbonAllocationClaim', 'wasteSubmission', 'wasteAsset']);
    global.ENUMS = f.enums;
    global.CONFIG = { get: () => ({ mock: { enabled: true },
        evidence: { providerService: 'DefaultWasteCarbonMockProviderService', allowSynthetic: true, qualificationRef: qualification } }) };
    global.SERVICE = { ...f.services, DefaultWasteCarbonHoldingService: holding, DefaultWasteCarbonMockProviderService: mock };
    SERVICE.DefaultWasteCarbonReadAccessService = require('../src/service/defaultWasteCarbonReadAccessService');
    f.put('wasteSubmission', { code: 'submission', submitterRef: original });
    const evidenceRef = mock.reference('scenario');
    f.put('wasteCarbonMockEvidence', { code: 'scenario', synthetic: true, qualificationRef: qualification,
        evidence: { synthetic: true, state: 'REALIZED', eligibility: 'ELIGIBLE', programRef: ref('test', 'program', 'simulation'),
            issuedQuantity: '2.000', scale: 3, unitOfMeasure: 'tCO2e', allocations: [{
                code: 'allocation', ownerRef: original, kind: 'CONTRIBUTOR', quantity: '2.000',
                contributionRef: ref('wasteSubmission', 'wasteSubmission', 'submission') }] } });
    selection = { ...base, evidenceRef, lotCode: 'CARBON_' + holding.hash(Object.values(evidenceRef)), ownerRef: original,
        recipientRef: ref('profile', 'customer', 'recipient'), contributionRef: ref('wasteSubmission', 'wasteSubmission', 'submission'),
        allocationCode: 'allocation', allocationQuantity: '2.000', issuedQuantity: '2.000', quantity: '1.000',
        unitOfMeasure: 'tCO2e', scale: 3, manifestRef: { ...ref('test', 'manifest', 'single-component'), revision: 1 } };
    const routes = { '/carbon/lots/evidence': 'synchronize', '/carbon/reservations': 'reserve', '/carbon/transfers': 'transfer',
        '/carbon/transfers/finalize': 'finalize', '/carbon/releases': 'release', '/carbon/holdings': 'holdings', '/carbon/operations/lookup': 'getOperation' };
    calls = [];
    fetch = async (url, options) => {
        calls.push({ url: String(url), options });
        assert.equal(options.headers.Authorization, authorization); assert.equal(options.redirect, 'error');
        const method = routes[new URL(url).pathname.replace('/nodics/wasteCarbon/v0', '')];
        assert.ok(method);
        try {
            const data = await holding[method]({ tenant: 'T', authorization: options.headers.Authorization, authData: adminAuth || { tenant: 'T', serviceId: 'operator', tokenType: 'service', principalType: 'service', permissions: [
                'carbon.evidence.record', 'carbon.holdings.reserve', 'carbon.holdings.transfer', 'carbon.holdings.finalize',
                'carbon.holdings.release', 'carbon.holdings.read'] }, payload: JSON.parse(options.body) });
            return Response.json({ data });
        } catch (e) { return Response.json({ code: e.code }, { status: 409 }); }
    };
});
test('installed HTTP carbon exercises permanent mock, held transfer, finality and repeatable keys', async () => {
    const result = await runner.run({ execute: true, selection, authorization, fetch });
    assert.equal(result.state, 'PASSED');
    const repeated = await runner.run({ execute: true, selection, authorization, fetch });
    assert.equal(repeated.operationKey, result.operationKey);
    const lot = f.get('wasteCarbonLot', selection.lotCode);
    assert.equal(lot.operations.length, 1); assert.equal(lot.allocations[0].ownerRef.code, 'original');
    assert.equal(lot.operations[0].destinationHold, 'RELEASED');
    assert.equal(JSON.stringify(result).includes(authorization), false);
});
test('carbon plan and invalid/missing prerequisites cause no HTTP or fixture writes', async () => {
    assert.equal((await runner.run({ selection, fetch })).state, 'PLANNED');
    for (const delta of [{ baseUrl: 'https://example.com' }, { localDemo: false }, { isolatedPartition: false },
        { environmentCode: 'production' }, { injectedToken: 'no' }, { quantity: '-1' }])
        await assert.rejects(runner.run({ execute: true, selection: { ...selection, ...delta }, authorization, fetch }));
    await assert.rejects(runner.run({ execute: true, selection, fetch }));
    assert.equal(calls.length, 0); assert.equal(f.calls.length, 0);
});
test('carbon stops on mismatched evidence, uncertain HTTP and permission refusal', async () => {
    await assert.rejects(runner.run({ execute: true, selection, authorization,
        fetch: async () => { throw new Error(authorization); } }), /uncertain/);
    await assert.rejects(runner.run({ execute: true, selection, authorization,
        fetch: async () => Response.json({ data: { synthetic: false } }) }), /synthetic/);
    let n = 0;
    await assert.rejects(runner.run({ execute: true, selection, authorization, fetch: async (...args) => {
        if (++n === 2) return Response.json({ code: 'ERR_AUTH_FORBIDDEN' }, { status: 403 });
        return fetch(...args);
    } }), /refusal/);
    assert.equal(n, 2);
});


test('owner command metadata and help expose no activation or credential side effects', async () => {
    const props = require('../config/properties');
    const command = props.tooling.commands['acceptance:waste-carbon'];
    assert.equal(command.acceptanceContract, true);
    assert.equal(command.script, 'src/service/acceptance/defaultWasteCarbonHttpAcceptanceService.mjs');
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
        if (body.quantity === '0')
            return Response.json({ data: {} });
        return fetch(url, options);
    } }), /refusal/);
});


test('lost mutation acknowledgement stops once and next invocation reconciles the original identity', async () => {
    let lost = false;
    await assert.rejects(runner.run({ execute: true, selection, authorization, fetch: async (url, options) => {
        const response = await fetch(url, options);
        if (!lost && new URL(url).pathname.endsWith('/carbon/transfers') && response.ok) {
            lost = true; throw Error('lost acknowledgement');
        }
        return response;
    } }), /uncertain/);
    assert.equal(lost, true);
    assert.equal((await runner.run({ execute: true, selection, authorization, fetch })).state, 'PASSED');
    assert.equal(f.get('wasteCarbonLot', selection.lotCode).operations.length, 1);
});
