/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module loyaltyRewardProvider/test/loyaltyRewardPaymentProviderContract @description Verifies Commerce reward payment provider maps Payment operations to Loyalty module APIs. @layer test @owner loyaltyRewardProvider */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const provider = require('../src/service/defaultLoyaltyRewardPaymentProviderService');

const moduleRoot = path.resolve(__dirname, '..');
const paymentProvidersPackage = JSON.parse(fs.readFileSync(path.resolve(moduleRoot, '../../package.json'), 'utf8'));
const providerPackage = JSON.parse(fs.readFileSync(path.join(moduleRoot, 'package.json'), 'utf8'));
assert(paymentProvidersPackage.requiredModules.includes('loyaltyRewardProvider'));
assert.equal(providerPackage.name, 'loyaltyRewardProvider');
assert.equal(providerPackage.index, '70.41');
assert(providerPackage.nodics.owns.includes('service'));

const calls = [];
global.CONFIG = {
    get: key => key === 'loyaltyRewardProvider' ? {
        providerCode: 'loyalty-reward-points',
        programCode: 'default',
        rewardTypeCode: 'points',
        loyaltyTarget: { moduleName: 'loyaltyApi', connectionName: 'loyaltyServer', targetAuthority: { runtimeRole: 'LOYALTY' } }
    } : undefined
};
global.SERVICE = {
    DefaultModuleService: {
        invokeModule: async options => {
            calls.push(options);
            if (options.operationName === 'reserve') return { reservation: { code: 'reservation-001' }, ledgerEntry: { code: 'ledger-reserve-001' } };
            if (options.operationName === 'capture') return { redemption: { code: 'redemption-001' }, ledgerEntry: { code: 'ledger-capture-001' } };
            if (options.operationName === 'release') return { reservation: { code: 'reservation-001' }, ledgerEntry: { code: 'ledger-release-001' } };
            if (options.operationName === 'reverse') return { reversedEntry: { code: 'ledger-capture-001' }, ledgerEntry: { code: 'ledger-reverse-001' } };
            throw new Error('unexpected operation');
        }
    }
};

async function main() {
    const base = {
        tenant: 'runtimeTenantFromToken',
        walletCode: 'wallet-001',
        orderCode: 'order-001',
        amount: '25.00',
        currency: 'POINTS',
        idempotencyKey: 'pay-001',
        correlationId: 'corr-001',
        authData: { tenant: 'runtimeTenantFromToken' }
    };
    const authorize = await provider.execute(Object.assign({}, base, { operation: 'AUTHORIZE' }));
    assert.equal(authorize.status, 'AUTHORIZED');
    assert.equal(authorize.reference, 'reservation-001');
    assert.equal(calls[0].moduleName, 'loyaltyApi');
    assert.equal(calls[0].connectionName, 'loyaltyServer');
    assert.equal(calls[0].operationName, 'reserve');
    assert.equal(calls[0].apiName, '/reward-reservations');
    assert.equal(calls[0].requestBody.sourceType, 'PAYMENT');
    assert.equal(calls[0].requestBody.targetType, 'ORDER');
    assert.equal(calls[0].requestBody.programCode, 'default');
    assert.equal(calls[0].requestBody.rewardTypeCode, 'points');

    const capture = await provider.execute(Object.assign({}, base, {
        operation: 'CAPTURE',
        providerReference: authorize.reference,
        idempotencyKey: 'pay-001:capture'
    }));
    assert.equal(capture.status, 'CAPTURED');
    assert.equal(capture.reference, 'ledger-capture-001');
    assert.equal(calls[1].operationName, 'capture');
    assert.equal(calls[1].apiName, '/reward-reservations/reservation-001/capture');

    const voided = await provider.execute(Object.assign({}, base, {
        operation: 'VOID',
        providerReference: authorize.reference,
        idempotencyKey: 'pay-001:void'
    }));
    assert.equal(voided.status, 'VOIDED');
    assert.equal(voided.reference, 'ledger-release-001');
    assert.equal(calls[2].operationName, 'release');

    const refund = await provider.execute(Object.assign({}, base, {
        operation: 'REFUND',
        providerReference: capture.reference,
        idempotencyKey: 'pay-001:refund'
    }));
    assert.equal(refund.status, 'REFUNDED');
    assert.equal(refund.reference, 'ledger-reverse-001');
    assert.equal(calls[3].operationName, 'reverse');
    assert.equal(calls[3].apiName, '/reward-ledger-entries/ledger-capture-001/reverse');

    await assert.rejects(() => provider.execute({ tenant: 'default', operation: 'AUTHORIZE', idempotencyKey: 'missing-wallet' }), /walletCode is required/);
    console.log('Loyalty reward payment provider contract validated');
}

main().finally(() => {
    delete global.CONFIG;
    delete global.SERVICE;
}).catch(error => {
    console.error(error);
    process.exitCode = 1;
});
