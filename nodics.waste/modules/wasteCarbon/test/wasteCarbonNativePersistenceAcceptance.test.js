/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';
/**
 * @module wasteCarbon/test/wasteCarbonNativePersistenceAcceptance
 * @description Opt-in native carbon lot/allocation/holding persistence, CAS race, uncertain acknowledgement and restart recovery.
 * Synthetic issuance and eligibility inputs qualify only owner persistence; they never qualify registry issuance or transfer.
 * @layer test
 * @owner wasteCarbon
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const Enum = require('../../../../nodics.foundation/modules/nConfig/bin/enum');
const fixture = require('../../../test/helpers/nativeOwnerPersistenceFixture');
const carbon = require('../src/service/defaultWasteCarbonHoldingService');

const ref = (code, schema = 'source', module = 'registry') => ({ module, schema, code });
const customer = code => ref(code, 'customer', 'profile');
const enterprise = code => ref(code, 'enterprise', 'profile');
const permissions = ['carbon.holdings.read', 'carbon.holdings.reserve', 'carbon.holdings.transfer',
    'carbon.holdings.release', 'carbon.holdings.finalize', 'carbon.evidence.record'];

function descriptors() {
    const carbonSchemas = require('../src/schemas/schemas').wasteCarbon;
    const submissionSchemas = require('../../wasteSubmission/src/schemas/schemas').wasteSubmission;
    const coreSchemas = require('../../wasteCore/src/schemas/schemas').wasteCore;
    return [
        ...['wasteCarbonLot', 'wasteCarbonAllocationClaim'].map(schemaName =>
            ({ moduleName: 'wasteCarbon', schemaName, schema: carbonSchemas[schemaName] })),
        { moduleName: 'wasteSubmission', schemaName: 'wasteSubmission', schema: submissionSchemas.wasteSubmission },
        { moduleName: 'wasteCore', schemaName: 'wasteAsset', schema: coreSchemas.wasteAsset },
    ];
}

function enums() {
    return Object.fromEntries(Object.entries(require('../src/utils/enums'))
        .map(([name, contribution]) => [name, new Enum(contribution.definition)]));
}

test('native Carbon: allocations, holdings and one-winner transfer survive unknown acknowledgement and reconnect', {
    skip: !process.env.NODICS_WASTE_NATIVE_MONGO_URI,
}, async t => {
    const settings = { wasteCarbon: { evidence: { providerService: 'NativeSyntheticCarbonEvidenceService',
        qualificationRef: ref('native-test-qualification'), allowSynthetic: true } } };
    const f = await fixture.create(t, { schemas: descriptors(), settings, enums: enums() });
    const request = payload => ({ tenant: f.tenant, authData: { tenant: f.tenant, principalType: 'service',
        loginId: 'native-carbon-owner', permissions }, payload });
    const evidence = { evidenceRef: ref('synthetic-carbon-evidence'), issuanceRef: ref('synthetic-registry-lot'),
        providerRef: ref('synthetic-provider'), programRef: ref('synthetic-program'), unitOfMeasure: 'tCO2e',
        scale: 3, issuedQuantity: '10.000', state: 'REALIZED', synthetic: true,
        allocations: [
            { code: 'contributor-allocation', ownerRef: customer('original-contributor'), quantity: '4.000', kind: 'CONTRIBUTOR',
                contributionRef: ref('native-submission', 'wasteSubmission', 'wasteSubmission'), allocationRef: ref('contributor-proof') },
            { code: 'partner-allocation', ownerRef: enterprise('operating-partner'), quantity: '6.000', kind: 'PARTNER',
                agreementRef: ref('synthetic-agreement', 'commercialAgreement', 'commercialAgreement'), allocationRef: ref('partner-proof') },
        ] };
    Object.assign(SERVICE, {
        DefaultWasteCarbonHoldingService: carbon,
        DefaultWasteCarbonReadAccessService: require('../src/service/defaultWasteCarbonReadAccessService'),
        DefaultSecuredRequestPipelineService: {
            getGrantedPermissions: input => input.authData.permissions || [],
            isPermissionGranted: (permission, granted) => granted.includes(permission),
        },
        NativeSyntheticCarbonEvidenceService: {
            readLot: async () => structuredClone(evidence),
            eligibility: async input => ({ ...input, status: 'ELIGIBLE', evidenceRef: ref('synthetic-eligibility') }),
        },
    });
    await SERVICE.DefaultWasteSubmissionService.save({ ...request({}), model: {
        code: 'native-submission', submitterRef: customer('original-contributor'), submissionChannel: 'WEB',
        submissionStatus: 'APPROVED', revision: 0,
    } });

    const lot = await carbon.synchronize(request({ evidenceRef: evidence.evidenceRef }));
    assert.equal(lot.synthetic, true);
    assert.equal((await carbon.holdings(request({ ownerRef: customer('original-contributor') }))).items[0].realized, '4.000');
    assert.equal((await carbon.holdings(request({ ownerRef: enterprise('operating-partner') }))).items[0].realized, '6.000');

    const base = { lotCode: lot.code, ownerRef: customer('original-contributor'), recipientRef: customer('buyer'),
        quantity: '3.000', unitOfMeasure: 'tCO2e', manifestRef: { ...ref('bundle', 'digitalBundle', 'digitalCore'), revision: 1 } };
    const contenders = ['first', 'second'].map(operationKey => request({ ...base, operationKey }));
    const reservations = await Promise.allSettled(contenders.map(carbon.reserve.bind(carbon)));
    assert.equal(reservations.filter(result => result.status === 'fulfilled').length, 1);
    assert.equal(reservations.filter(result => result.status === 'rejected').length, 1);
    const winnerIndex = reservations.findIndex(result => result.status === 'fulfilled');
    const winner = contenders[winnerIndex];
    assert.deepEqual(await carbon.reserve(winner), reservations[winnerIndex].value);

    const nativeUpdate = SERVICE.DefaultWasteCarbonLotService.update;
    let acknowledgementLost = true;
    SERVICE.DefaultWasteCarbonLotService.update = async input => {
        const result = await nativeUpdate(input);
        if (acknowledgementLost) {
            acknowledgementLost = false;
            throw new Error('synthetic transfer acknowledgement lost after durable CAS');
        }
        return result;
    };
    await assert.rejects(carbon.transfer(winner), /acknowledgement lost/);
    SERVICE.DefaultWasteCarbonLotService.update = nativeUpdate;
    await f.reconnect();
    const recovered = await carbon.transfer(winner);
    assert.equal(recovered.status, 'TRANSFERRED');
    assert.equal(recovered.destinationHold, 'HELD');
    assert.equal((await carbon.holdings(request({ ownerRef: customer('buyer') }))).items[0].available, '0.000');

    const final = await carbon.finalize(winner);
    assert.equal(final.status, 'COMPLETED');
    await f.reconnect();
    assert.deepEqual(await carbon.finalize(winner), final);
    const buyer = (await carbon.holdings(request({ ownerRef: customer('buyer') }))).items[0];
    assert.equal(buyer.realized, '3.000');
    assert.equal(buyer.reserved, '0.000');
    assert.equal(buyer.available, '3.000');
    const persisted = (await SERVICE.DefaultWasteCarbonLotService.get({ tenant: f.tenant, query: { code: lot.code } })).result[0];
    assert.equal(persisted.operations.length, 1);
    assert.equal(persisted.operations[0].status, 'COMPLETED');
    assert.ok(f.commands.some(command => command.name === 'findAndModify'));
    t.diagnostic('PASS: native Waste Carbon schemas/indexes, allocation persistence, one-winner CAS, exact replay, unknown acknowledgement and reconnect recovery. Evidence is synthetic; external registry issuance and transfer remain unqualified.');
});

test('native Carbon: unqualified external evidence cannot create a lot or holding', {
    skip: !process.env.NODICS_WASTE_NATIVE_MONGO_URI,
}, async t => {
    const f = await fixture.create(t, { schemas: descriptors(), settings: {}, enums: enums() });
    Object.assign(SERVICE, {
        DefaultWasteCarbonHoldingService: carbon,
        DefaultWasteCarbonReadAccessService: require('../src/service/defaultWasteCarbonReadAccessService'),
        DefaultSecuredRequestPipelineService: {
            getGrantedPermissions: input => input.authData.permissions || [],
            isPermissionGranted: (permission, granted) => granted.includes(permission),
        },
    });
    const request = { tenant: f.tenant, authData: { tenant: f.tenant, principalType: 'service',
        loginId: 'native-carbon-owner', permissions }, payload: { evidenceRef: ref('unqualified') } };
    await assert.rejects(carbon.synchronize(request), { code: 'ERR_CARBON_UNAVAILABLE' });
    assert.equal((await SERVICE.DefaultWasteCarbonLotService.get({ tenant: f.tenant, query: {} })).result.length, 0);
    assert.equal((await SERVICE.DefaultWasteCarbonAllocationClaimService.get({ tenant: f.tenant, query: {} })).result.length, 0);
});
