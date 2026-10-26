/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';
/** @module wasteCarbon/test/holding @description Unit coverage for persisted exact lot operations, evidence, isolation, conflicts and recovery. No live services. @owner wasteCarbon @layer test */
const { test, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const subject = require('../src/service/defaultWasteCarbonHoldingService');
const fixture = require('./repositoryFixture');

test('destination hold blocks onward reserve until exact authorized original finalization', async () => {
    const lot = await synchronize(), body = { ...component(lot), recipientRef: customer('buyer') };
    await assert.rejects(subject.finalize(request(body)), { code: 'ERR_CARBON_CONFLICT' });
    await subject.reserve(request(body));
    await assert.rejects(subject.finalize(request(body)), { code: 'ERR_CARBON_CONFLICT' });
    await subject.transfer(request(body));
    const onward = { ...body, ownerRef: customer('buyer'), recipientRef: customer('later'), operationKey: 'onward' };
    await assert.rejects(subject.reserve(request(onward)), { code: 'ERR_CARBON_INSUFFICIENT' });
    await assert.rejects(subject.release(request(body)), { code: 'ERR_CARBON_FINAL' });
    await assert.rejects(subject.finalize({ ...request(body), authData: { ...request(body).authData, permissions: ['carbon.holdings.transfer'] } }), { code: 'ERR_CARBON_FORBIDDEN' });
    await assert.rejects(subject.finalize(request({ ...body, recipientRef: customer('foreign') })), { code: 'ERR_CARBON_FINAL' });
    await assert.rejects(subject.finalize(request({ ...body, quantity: '1.000' })), { code: 'ERR_CARBON_CONFLICT' });
    await assert.rejects(subject.finalize(request({ ...body, manifestRef: { ...body.manifestRef, revision: 99 } })), { code: 'ERR_CARBON_CONFLICT' });
    const done = await subject.finalize(request(body));
    assert.equal(done.status, 'COMPLETED'); assert.equal(done.destinationHold, 'RELEASED'); assert.ok(done.finalizedAt);
    assert.deepEqual((await subject.finalize(request(body))), done);
    assert.equal((await subject.transfer(request(body))).status, 'COMPLETED');
    await subject.reserve(request(onward));
    assert.equal((await subject.holdings(request({ ownerRef: customer('buyer') }))).items[0].available, '0.000');
    assert.equal(f.get('wasteCarbonLot', lot.code).allocations[0].ownerRef.code, 'original');
});

test('finalization unlocks only its original quantity and survives interrupted acknowledgements', async () => {
    const lot = await synchronize(), first = { ...component(lot), recipientRef: customer('buyer') };
    const second = { ...first, operationKey: 'second-component', quantity: '0.500' };
    for (const body of [first, second]) { await subject.reserve(request(body)); await subject.transfer(request(body)); }
    f.failures.push({ schema: 'wasteCarbonLot', phase: 'before-update' });
    await assert.rejects(subject.finalize(request(first)), /injected/);
    assert.equal((await subject.holdings(request({ ownerRef: customer('buyer') }))).items[0].available, '0.000');
    f.failures.push({ schema: 'wasteCarbonLot', phase: 'after-update' });
    await assert.rejects(subject.finalize(request(first)), /injected/);
    const restarted = { ...subject }, done = await restarted.finalize(request(first));
    assert.equal(done.status, 'COMPLETED');
    const holding = (await subject.holdings(request({ ownerRef: customer('buyer') }))).items[0];
    assert.equal(holding.realized, '1.750'); assert.equal(holding.reserved, '0.500'); assert.equal(holding.available, '1.250');
    assert.equal((await subject.getOperation(request(second))).destinationHold, 'HELD');
    assert.equal(f.get('wasteCarbonLot', lot.code).operations.length, 2);
    await subject.finalize(request(second));
    assert.equal((await subject.holdings(request({ ownerRef: customer('buyer') }))).items[0].available, '1.750');
});

test('concurrent finalizations use CAS and never duplicate credit or release a completed transfer', async () => {
    const lot = await synchronize(), body = { ...component(lot), recipientRef: enterprise('buyer') };
    await subject.reserve(request(body)); await subject.transfer(request(body));
    const attempts = await Promise.allSettled([subject.finalize(request(body)), subject.finalize(request(body)), subject.release(request(body))]);
    assert.equal(attempts.filter(result => result.status === 'fulfilled').length, 1);
    assert.equal((await subject.finalize(request(body))).status, 'COMPLETED');
    const holding = (await subject.holdings(request({ ownerRef: enterprise('buyer') }))).items[0];
    assert.equal(holding.available, '1.250'); assert.equal(holding.reserved, '0.000');
    assert.equal(f.get('wasteCarbonLot', lot.code).operations.length, 1);
});

const schemas = require('../src/schemas/schemas').wasteCarbon;
const ref = (code, schema = 'source', module = 'registry') => ({ module, schema, code });
const customer = code => ref(code, 'customer', 'profile');
const enterprise = code => ref(code, 'enterprise', 'profile');
const permissions = ['carbon.holdings.read', 'carbon.holdings.reserve', 'carbon.holdings.transfer', 'carbon.holdings.release', 'carbon.holdings.finalize', 'carbon.evidence.record'];
let f, settings, evidence, eligibility;
const request = payload => ({ tenant: 'T', authData: { tenant: 'T', principalType: 'service', tokenType: 'service', serviceId: 'digital', permissions }, payload });
const synchronize = () => subject.synchronize(request({ evidenceRef: ref('proof') }));
const component = lot => ({ lotCode: lot.code, ownerRef: customer('original'), quantity: '1.250', unitOfMeasure: 'tCO2e',
    operationKey: 'bundle:component:1', manifestRef: { ...ref('bundle', 'digitalBundle', 'digitalCore'), revision: 1 } });
beforeEach(() => {
    f = fixture.create(['wasteCarbonMockEvidence', 'wasteCarbonLot', 'wasteCarbonAllocationClaim', 'wasteSubmission', 'wasteAsset']);
    global.ENUMS = f.enums;
    f.put('wasteSubmission', { code: 'submission', submitterRef: customer('original') });
    settings = { evidence: { providerService: 'QualifiedFixtureService', qualificationRef: ref('qualification'), allowSynthetic: true } };
    evidence = { evidenceRef: ref('proof'), issuanceRef: ref('lot-issued'), providerRef: ref('provider'), programRef: ref('carbon-program'),
        unitOfMeasure: 'tCO2e', scale: 3, issuedQuantity: '10.000', state: 'REALIZED', synthetic: true,
        allocations: [{ code: 'original-allocation', ownerRef: customer('original'), quantity: '4.000', kind: 'CONTRIBUTOR',
            contributionRef: ref('submission', 'wasteSubmission', 'wasteSubmission'), allocationRef: ref('allocation-proof') },
        { code: 'partner-allocation', ownerRef: enterprise('partner'), quantity: '6.000', kind: 'PARTNER', agreementRef: ref('agreement'), allocationRef: ref('partner-proof') }] };
    eligibility = 'ELIGIBLE';
    global.CONFIG = { get: () => settings };
    global.SERVICE = { ...f.services, DefaultWasteCarbonHoldingService: subject, QualifiedFixtureService: {
        readLot: async () => structuredClone(evidence),
        eligibility: async input => ({ ...input, status: eligibility, evidenceRef: ref('eligibility') })
    } };
    SERVICE.DefaultWasteCarbonReadAccessService = require('../src/service/defaultWasteCarbonReadAccessService');
});
test('loaded Carbon vocabulary preserves wire keys and an added operation cannot grant a transition', async () => {
    assert.deepEqual(Object.values(require('../src/utils/enums').WasteCarbonOperation.definition),
        ['RESERVE', 'TRANSFER', 'FINALIZE', 'RELEASE']);
    const reads = [];
    const original = ENUMS.WasteCarbonHoldingState.RESERVED;
    Object.defineProperty(ENUMS.WasteCarbonHoldingState, 'RESERVED', {
        configurable: true, get() { reads.push('RESERVED'); return original; }
    });
    const lot = await synchronize(), body = component(lot);
    assert.equal((await subject.reserve(request(body))).status, 'RESERVED');
    assert.ok(reads.length > 0, 'runtime consumes the effective enum registry');
    ENUMS.WasteCarbonOperation.RETIRE = { value: 'RETIRE' };
    await assert.rejects(subject.change(request(body), ENUMS.WasteCarbonOperation.RETIRE.value),
        { code: 'ERR_CARBON_FORBIDDEN' });
    const grantedUnknown = request(body);
    grantedUnknown.authData = { ...grantedUnknown.authData, permissions: [...permissions, 'carbon.holdings.retire'] };
    await assert.rejects(subject.change(grantedUnknown, ENUMS.WasteCarbonOperation.RETIRE.value),
        { code: 'ERR_CARBON_INPUT' });
    assert.equal(f.get('wasteCarbonLot', lot.code).operations[0].status, 'RESERVED');
});
test('new schemas enable provider-atomic revisions and disable generic mutations', () => {
    for (const schema of Object.values(schemas)) {
        assert.deepEqual(schema.backoffice.concurrency, { managed: true, field: 'revision' });
        assert.equal(schema.router.enabled, false); assert.equal(schema.definition.tenant, undefined);
    }
});
test('persists partial lot transfer, exposes only allocated/acquired holdings and retains partner share', async () => {
    const lot = await synchronize(), body = component(lot);
    assert.equal((await subject.reserve(request(body))).status, 'RESERVED');
    assert.equal((await subject.holdings(request({ ownerRef: body.ownerRef }))).items[0].available, '2.750');
    const transferred = await subject.transfer(request({ ...body, recipientRef: enterprise('buyer') }));
    assert.equal(transferred.status, 'TRANSFERRED');
    const recipient = (await subject.holdings(request({ ownerRef: enterprise('buyer') }))).items[0];
    assert.equal(recipient.available, '0.000'); assert.equal(recipient.realized, '1.250'); assert.equal(recipient.reserved, '1.250');
    assert.equal(recipient.acquisitionRefs[0].destinationHold, 'HELD');
    assert.equal((await subject.holdings(request({ ownerRef: enterprise('partner') }))).items[0].available, '6.000');
    assert.equal(f.get('wasteCarbonLot', lot.code).allocations[0].ownerRef.code, 'original');
    const restarted = { ...subject };
    assert.equal((await restarted.getOperation(request(body))).status, 'TRANSFERRED');
    const completed = await subject.finalize(request({ ...body, recipientRef: enterprise('buyer') }));
    assert.equal(completed.status, 'COMPLETED'); assert.equal(completed.destinationHold, 'RELEASED');
    assert.equal((await subject.holdings(request({ ownerRef: enterprise('buyer') }))).items[0].available, '1.250');
    await assert.rejects(subject.release(request(body)), { code: 'ERR_CARBON_FINAL' });
    await assert.rejects(subject.transfer(request({ ...body, recipientRef: customer('other') })), { code: 'ERR_CARBON_FINAL' });
});
test('prospective holdings are separate and cannot reserve; later allocation stays with original contributor', async () => {
    f.put('wasteAsset', { code: 'certificate', sourceSubmissionCode: 'submission', originalOwnerRef: customer('original'),
        ownerRef: customer('new-holder'), assetStatus: 'CONSUMED' });
    evidence.state = 'PROSPECTIVE'; evidence.issuedQuantity = '0.000';
    const lot = await synchronize();
    const summary = (await subject.holdings(request({ ownerRef: customer('original') }))).items[0];
    assert.equal(summary.prospective, '4.000'); assert.equal(summary.available, '0.000');
    await assert.rejects(subject.reserve(request(component(lot))), { code: 'ERR_CARBON_INELIGIBLE' });
    evidence.state = 'REALIZED'; evidence.issuedQuantity = '10.000';
    await synchronize(); const body = component(lot);
    await subject.reserve(request(body)); await subject.transfer(request({ ...body, recipientRef: customer('buyer') }));
    evidence.issuedQuantity = '12.000';
    evidence.allocations.push({ ...evidence.allocations[0], code: 'later', quantity: '2.000', allocationRef: ref('later-proof') });
    await synchronize();
    assert.equal((await subject.holdings(request({ ownerRef: customer('original') }))).items[0].available, '4.750');
});
test('rejects fabricated issuance, changed allocations, double allocation and unqualified defaults', async () => {
    settings = {};
    await assert.rejects(synchronize(), { code: 'ERR_CARBON_UNAVAILABLE' });
    settings = { evidence: { providerService: 'QualifiedFixtureService', qualificationRef: ref('qualified'), allowSynthetic: true } };
    const lot = await synchronize();
    evidence.allocations[0].ownerRef = customer('buyer');
    await assert.rejects(synchronize(), { code: 'ERR_CARBON_EVIDENCE' });
    evidence.allocations[0].ownerRef = customer('original'); evidence.allocations[0].quantity = '5.000';
    await assert.rejects(synchronize(), { code: 'ERR_CARBON_EVIDENCE' });
    evidence.allocations[0].quantity = '4.000'; evidence.issuanceRef = ref('second-lot');
    await assert.rejects(synchronize(), { code: 'ERR_CARBON_CONFLICT' });
    assert.equal(f.get('wasteCarbonLot', lot.code).operations.length, 0);
});
test('rejects foreign owner, prospective precision loss, same owner and replay changes', async () => {
    const lot = await synchronize(), body = component(lot);
    await assert.rejects(subject.reserve(request({ ...body, ownerRef: customer('foreign') })), { code: 'ERR_CARBON_INSUFFICIENT' });
    await assert.rejects(subject.reserve(request({ ...body, quantity: '0.0001' })), { code: 'ERR_CARBON_QUANTITY' });
    await subject.reserve(request(body));
    await assert.rejects(subject.reserve(request({ ...body, quantity: '1.251' })), { code: 'ERR_CARBON_CONFLICT' });
    await assert.rejects(subject.transfer(request({ ...body, recipientRef: body.ownerRef })), { code: 'ERR_CARBON_INPUT' });
    eligibility = 'INELIGIBLE';
    await assert.rejects(subject.transfer(request({ ...body, recipientRef: customer('buyer') })), { code: 'ERR_CARBON_INELIGIBLE' });
    assert.equal((await subject.getOperation(request(body))).status, 'RESERVED');
    assert.equal((await subject.release(request(body))).status, 'RELEASED');
    await assert.rejects(subject.reserve(request(body)), { code: 'ERR_CARBON_FINAL' });
});
test('concurrent reservations cannot overspend and transfer/release race has one winner', async () => {
    const lot = await synchronize(), body = { ...component(lot), quantity: '3.000' };
    const results = await Promise.allSettled([subject.reserve(request(body)), subject.reserve(request({ ...body, operationKey: 'another' }))]);
    assert.equal(results.filter(item => item.status === 'fulfilled').length, 1);
    const winner = results.find(item => item.status === 'fulfilled').value.operationKey;
    const bound = { ...body, operationKey: winner };
    const outcomes = await Promise.allSettled([subject.transfer(request({ ...bound, recipientRef: customer('buyer') })), subject.release(request(bound))]);
    assert.equal(outcomes.filter(item => item.status === 'fulfilled').length, 1);
});
test('lost write acknowledgement recovers from persisted transfer without repeated balance movement', async () => {
    const lot = await synchronize(), body = component(lot);
    await subject.reserve(request(body));
    f.failures.push({ schema: 'wasteCarbonLot', phase: 'after-update' });
    await assert.rejects(subject.transfer(request({ ...body, recipientRef: customer('buyer') })), /injected/);
    eligibility = 'INELIGIBLE';
    assert.equal((await ({ ...subject }).transfer(request({ ...body, recipientRef: customer('buyer') }))).status, 'TRANSFERRED');
    assert.equal((await subject.holdings(request({ ownerRef: customer('buyer') }))).items[0].realized, '1.250');
});
test('tenant/principal permission isolation and bounded customization remain enforced', async () => {
    const lot = await synchronize(), body = component(lot);
    await assert.rejects(subject.reserve({ ...request(body), tenant: 'OTHER' }), { code: 'ERR_CARBON_FORBIDDEN' });
    await assert.rejects(subject.reserve({ ...request(body), authData: { ...request(body).authData, permissions: [] } }), { code: 'ERR_CARBON_FORBIDDEN' });
    const human = { ...request(body), authData: { tenant: 'T', principalType: 'customer', loginId: 'original', permissions } };
    await assert.rejects(subject.reserve(human), { code: 'ERR_CARBON_FORBIDDEN' });
    await assert.rejects(subject.holdings({ ...human, payload: { ownerRef: customer('original') } }), { code: 'ERR_CARBON_FORBIDDEN' });
    await assert.rejects(subject.holdings({ ...human, payload: { ownerRef: customer('foreign') } }), { code: 'ERR_CARBON_FORBIDDEN' });
    settings.limits = { operationsPerLot: 1 };
    await subject.reserve(request(body));
    await assert.rejects(subject.reserve(request({ ...body, operationKey: 'another' })), { code: 'ERR_CARBON_CAPACITY' });
    settings.limits = { quantityScale: -1 };
    assert.throws(() => subject.settings(request({})), { code: 'ERR_CARBON_CONFIGURATION' });
});

test('provider replacement, timeout and synthetic restrictions cannot unlock a held reservation', async () => {
    const lot = await synchronize(), body = component(lot);
    await subject.reserve(request(body));
    let aborted = false;
    SERVICE.AlternateEvidenceService = { eligibility: async (input, context) => {
        context.signal.addEventListener('abort', () => { aborted = true; });
        return new Promise(() => {});
    } };
    settings.evidence.providerService = 'AlternateEvidenceService'; settings.limits = { providerTimeoutMs: 5 };
    await assert.rejects(subject.transfer(request({ ...body, recipientRef: customer('buyer') })), { code: 'ERR_CARBON_UNAVAILABLE' });
    assert.equal(aborted, true); assert.equal((await subject.getOperation(request(body))).status, 'RESERVED');
    SERVICE.AlternateEvidenceService.eligibility = async () => { throw new Error('credential-secret'); };
    await assert.rejects(subject.transfer(request({ ...body, recipientRef: customer('buyer') })), error => error.code === 'ERR_CARBON_UNAVAILABLE' && !error.message.includes('secret'));
    settings.evidence.allowSynthetic = false;
    await assert.rejects(subject.transfer(request({ ...body, recipientRef: customer('buyer') })), { code: 'ERR_CARBON_INELIGIBLE' });
});
test('the same registry lot cannot be duplicated through a different provider identity', async () => {
    const lot = await synchronize();
    evidence.providerRef = ref('another-provider');
    await assert.rejects(synchronize(), { code: 'ERR_CARBON_CONFLICT' });
    assert.equal((await subject.holdings(request({ ownerRef: customer('original') }))).items[0].lotCode, lot.code);
});

test('controller/facade preserve trusted tenant and service dispatch through Promise and callback transports', async () => {
    const controller = require('../src/controller/defaultWasteCarbonController');
    const facade = require('../src/facade/defaultWasteCarbonFacade');
    global.FACADE = { DefaultWasteCarbonFacade: facade };
    const captured = [];
    SERVICE.DefaultWasteCarbonHoldingService = {
        reserve: async req => { captured.push(req); return { status: 'RESERVED' }; },
        finalize: async req => { captured.push(req); return { status: 'COMPLETED' }; }
    };
    const req = { authData: request({}).authData, httpRequest: { body: { tenant: 'SPOOF', lotCode: 'lot' }, headers: {} } };
    assert.equal((await controller.reserve(req)).data.status, 'RESERVED');
    await new Promise((resolve, reject) => controller.reserve(req, (error, value) => error ? reject(error) : resolve(value)));
    assert.equal(captured.length, 2); assert.equal(captured[0].tenant, 'T');
    assert.equal(captured[0].authData.principalType, 'service');
    assert.equal(captured[0].payload.tenant, 'SPOOF');
    assert.equal((await controller.finalize(req)).data.status, 'COMPLETED');
    assert.equal(captured[2].tenant, 'T');
});
test('explicit permission release has correct bytes and grants no role assignments', () => {
    const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto');
    const manifest = require('../data/manifest.json'), section = manifest.sections.permissionCatalogue;
    const forward = manifest.sections.transferFinalizationPermission;
    assert.equal(forward.selectionPolicy, 'EXPLICIT'); assert.equal(forward.version, '0.0.2');
    for (const [file, expected] of Object.entries(forward.files))
        assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.resolve(__dirname, '../data', file))).digest('hex'), expected);
    const finalization = require('../data/init-v001/records/identity/wasteCarbonFinalizationPermissionData');
    assert.equal(finalization.record0.code, 'carbon.holdings.finalize'); assert.equal(finalization.record0.userGroupCode, undefined);
    assert.equal(section.selectionPolicy, 'EXPLICIT');
    for (const [file, expected] of Object.entries(section.files))
        assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.resolve(__dirname, '../data', file))).digest('hex'), expected);
    const records = require('../data/init-v001/records/identity/wasteCarbonPermissionData');
    assert.equal(Object.values(records).length, 5);
    assert.ok(Object.values(records).every(item => item.ownerModule === 'wasteCarbon' && !item.userGroupCode));
});

function installMock() {
    const mock = require('../src/service/defaultWasteCarbonMockProviderService');
    SERVICE.DefaultWasteCarbonMockProviderService = mock;
    settings.evidence.providerService = 'DefaultWasteCarbonMockProviderService';
    settings.mock = { enabled: true };
    f.put('wasteCarbonMockEvidence', { code: 'scenario', synthetic: true,
        qualificationRef: settings.evidence.qualificationRef, evidence: { ...evidence, eligibility: 'ELIGIBLE' } });
    return () => subject.synchronize(request({ evidenceRef: mock.reference('scenario') }));
}
test('permanent mock preserves beneficiary, synthetic provenance and atomic recipient hold', async () => {
    const sync = installMock(), lot = await sync();
    assert.equal(lot.synthetic, true);
    assert.equal(lot.issuanceRef.schema, 'wasteCarbonMockEvidence');
    const body = { ...component(lot), recipientRef: customer('buyer') };
    assert.equal((await subject.reserve(request(body))).synthetic, true);
    await subject.transfer(request(body));
    assert.equal((await subject.holdings(request({ ownerRef: customer('buyer') }))).items[0].available, '0.000');
    f.failures.push({ schema: 'wasteCarbonLot', phase: 'after-update' });
    await assert.rejects(subject.finalize(request(body)), /injected/);
    assert.equal((await subject.finalize(request(body))).synthetic, true);
    assert.equal(f.get('wasteCarbonLot', lot.code).allocations[0].ownerRef.code, 'original');
    assert.equal((await sync()).issuedQuantity, lot.issuedQuantity);
});
test('mock carbon activation and qualified synthetic record gates fail closed', async () => {
    const sync = installMock();
    delete settings.mock;
    await assert.rejects(sync(), { code: 'ERR_CARBON_UNAVAILABLE' });
    settings.mock = { enabled: true }; settings.evidence.allowSynthetic = false;
    await assert.rejects(sync(), { code: 'ERR_CARBON_UNAVAILABLE' });
    settings.evidence.allowSynthetic = true;
    const row = f.get('wasteCarbonMockEvidence', 'scenario');
    row.evidence.synthetic = false; f.put('wasteCarbonMockEvidence', row);
    await assert.rejects(sync(), { code: 'ERR_CARBON_UNAVAILABLE' });
    row.evidence.synthetic = true; row.qualificationRef = ref('foreign'); f.put('wasteCarbonMockEvidence', row);
    await assert.rejects(sync(), { code: 'ERR_CARBON_UNAVAILABLE' });
    assert.equal(f.calls.length, 0);
});
test('mock carbon rechecks eligibility and refuses real lots and foreign tenant reads', async () => {
    const sync = installMock(), lot = await sync();
    const row = f.get('wasteCarbonMockEvidence', 'scenario');
    row.evidence.eligibility = 'INELIGIBLE'; f.put('wasteCarbonMockEvidence', row);
    await assert.rejects(subject.reserve(request(component(lot))), { code: 'ERR_CARBON_INELIGIBLE' });
    row.evidence.eligibility = 'ELIGIBLE'; f.put('wasteCarbonMockEvidence', row);
    await assert.rejects(subject.eligible(request({}), { ...lot, synthetic: false }), { code: 'ERR_CARBON_INELIGIBLE' });
    const mock = SERVICE.DefaultWasteCarbonMockProviderService;
    await assert.rejects(mock.readLot({ evidenceRef: mock.reference('scenario') },
        { tenant: 'foreign', qualificationRef: settings.evidence.qualificationRef }), { code: 'ERR_CARBON_EVIDENCE' });
    const abort = new AbortController(); abort.abort();
    await assert.rejects(mock.readLot({ evidenceRef: mock.reference('scenario') },
        { tenant: 'T', qualificationRef: settings.evidence.qualificationRef, signal: abort.signal }), { code: 'ERR_CARBON_UNAVAILABLE' });
});

test('native Admin uses real route gates and owner admission without replacing identity', async () => {
    const router = require('../../../../nodics.foundation/modules/nRouter/src/service/request/defaultSecuredRequestPipelineService');
    const previous = CONFIG.get;
    CONFIG.get = key => ({ defaultTenant: 'T', defaultEnterprise: 'platform',
        identityGovernance: { principalPolicy: { serviceGroup: 'serviceAccountUserGroup' } } }[key] ?? previous(key));
    SERVICE.DefaultSecuredRequestPipelineService = router;
    const authData = { tenant: 'T', entCode: 'platform', principalType: 'human', tokenType: 'access',
        authenticationMethod: 'PASSWORD', loginId: 'existing-admin', authVersion: 1,
        userGroups: ['platformAdministratorUserGroup'], permissions: ['*'] };
    const admin = payload => ({ tenant: 'T', authData: structuredClone(authData), authorization: 'Bearer existing-admin', payload });
    const routes = require('../src/router/routers').wasteCarbon.internal;
    for (const route of Object.values(routes)) {
        const req = { ...admin({}), router: route };
        assert.equal(router.hasAcceptedTokenType(req), true);
        assert.equal(router.hasAccessGroup(req), true);
        subject.authorize(req, route.permission);
        for (const patch of [{ principalType: 'customer' }, { userGroups: ['employeeUserGroup'] },
            { permissions: [] }, { tenant: 'foreign' }, { entCode: 'foreign' },
            { tokenType: 'service' }, { authenticationMethod: 'EXTERNAL' }, { sessionContext: {} },
            { runtimeScope: {} }, { isSystem: true }, { externalIdentityLinkCode: 'linked' }]) {
            const denied = { ...req, authData: { ...authData, ...patch } };
            assert.equal(router.hasPlatformFullAccess(denied), false);
            assert.throws(() => subject.authorize(denied, route.permission));
        }
        assert.equal(router.hasAcceptedTokenType({ ...req, authData: { ...authData, tokenType: 'refresh' } }), false);
    }
    const lot = await subject.synchronize(admin({ evidenceRef: ref('proof') }));
    const body = { ...component(lot), recipientRef: customer('buyer') };
    const command = admin(body), original = structuredClone(command);
    await subject.reserve(command); await subject.transfer(command);
    const done = await subject.finalize(command);
    assert.deepEqual(done.sourceActor, { principalType: 'human', principalCode: 'existing-admin' });
    assert.deepEqual(done.finalizationActor, done.sourceActor);
    assert.deepEqual(command, original);
    assert.equal((await subject.holdings(admin({ ownerRef: customer('buyer') }))).ownerRef.code, 'buyer');
    assert.equal((await subject.getOperation(admin(body))).status, 'COMPLETED');
});



test('canonical runtime serviceId authorizes holdings and all mutations with exact audit actors', async () => {
    const lot = await synchronize(), body = { ...component(lot), recipientRef: customer('runtime-buyer') };
    const runtime = payload => ({ ...request(payload), authData: { ...request(payload).authData,
        serviceId: 'apiAdmin', userGroups: [], modules: ['wasteCarbon'],
        runtimeInstanceId: 'commerce', runtimeScope: { instanceCode: 'commerce', assignmentCode: 'commerce-runtime' } } });
    assert.equal(runtime({}).authData.loginId, undefined);
    assert.equal((await subject.holdings(runtime({ ownerRef: customer('original') }))).items.length, 1);
    for (const operation of ['reserve', 'transfer', 'finalize']) {
        const result = await subject[operation](runtime(body));
        assert.deepEqual(result.sourceActor, { principalType: 'service', principalCode: 'apiAdmin' });
        if (operation === 'finalize') assert.deepEqual(result.finalizationActor, result.sourceActor);
    }
    const released = { ...body, operationKey: 'runtime-release', quantity: '0.500' };
    await subject.reserve(runtime(released));
    assert.deepEqual((await subject.release(runtime(released))).sourceActor, { principalType: 'service', principalCode: 'apiAdmin' });
    for (const patch of [{ serviceId: undefined, loginId: 'borrowed' }, { serviceId: '' },
        { permissions: [] }, { tenant: 'foreign' }, { principalType: 'human', serviceId: 'apiAdmin', loginId: undefined }]) {
        const denied = runtime({ ownerRef: customer('original') }); Object.assign(denied.authData, patch);
        await assert.rejects(subject.holdings(denied), { code: 'ERR_CARBON_FORBIDDEN' });
    }
});
