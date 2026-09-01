/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module loyaltyWallet/test/loyaltyRewardOperationContract @description Verifies earn, reserve, capture, release, and reverse wallet operations. @layer test @owner loyaltyWallet */
const assert = require('assert');
const operationService = require('../src/service/defaultLoyaltyRewardOperationService');

function createStore() {
    const rows = [];
    const matches = (row, query) => Object.keys(query || {}).every(key => row[key] === query[key]);
    return {
        rows,
        get: async request => ({ result: rows.filter(row => matches(row, request.query || {})) }),
        save: async request => {
            rows.push(Object.assign({}, request.model));
            return { result: Object.assign({}, request.model) };
        },
        update: async request => {
            const index = rows.findIndex(row => matches(row, request.query || {}));
            if (index >= 0) rows[index] = Object.assign({}, rows[index], request.model);
            else rows.push(Object.assign({}, request.model));
            return { result: Object.assign({}, request.model) };
        }
    };
}

const balanceStore = createStore();
const ledgerStore = createStore();
const reservationStore = createStore();
const redemptionStore = createStore();

global.SERVICE = {
    DefaultLoyaltyWalletRewardBalanceService: balanceStore,
    DefaultRewardLedgerEntryService: ledgerStore,
    DefaultRewardReservationService: reservationStore,
    DefaultRewardRedemptionService: redemptionStore
};

async function main() {
    const base = {
        tenant: 'runtimeTenantFromToken',
        walletCode: 'wallet-001',
        programCode: 'default',
        rewardTypeCode: 'points',
        sourceType: 'ORDER',
        sourceCode: 'order-001',
        targetType: 'ORDER',
        targetCode: 'order-001',
        correlationId: 'corr-001',
        now: new Date('2026-09-01T10:00:00.000Z')
    };

    const earn = await operationService.earn(Object.assign({}, base, {
        amount: '100',
        idempotencyKey: 'earn-001'
    }));
    assert.strictEqual(earn.balance.available, '100.00');
    assert.strictEqual(earn.balance.earned, '100.00');
    assert.strictEqual(earn.ledgerEntry.entryType, 'EARN');
    assert.strictEqual(earn.ledgerEntry.availableAfter, '100.00');
    assert.strictEqual(earn.balance.tenant, undefined);
    assert.strictEqual(earn.balance.enterpriseCode, undefined);
    const duplicateEarn = await operationService.earn(Object.assign({}, base, {
        amount: '100',
        idempotencyKey: 'earn-001'
    }));
    assert.strictEqual(duplicateEarn.idempotent, true);
    assert.strictEqual(duplicateEarn.balance.available, '100.00');
    assert.strictEqual(ledgerStore.rows.filter(row => row.entryType === 'EARN').length, 1);

    const reserve = await operationService.reserve(Object.assign({}, base, {
        amount: '30.00',
        idempotencyKey: 'reserve-001'
    }));
    assert.strictEqual(reserve.balance.available, '70.00');
    assert.strictEqual(reserve.balance.reserved, '30.00');
    assert.strictEqual(reserve.reservation.status, 'RESERVED');
    assert.strictEqual(reserve.ledgerEntry.entryType, 'RESERVE');
    const duplicateReserve = await operationService.reserve(Object.assign({}, base, {
        amount: '30.00',
        idempotencyKey: 'reserve-001'
    }));
    assert.strictEqual(duplicateReserve.idempotent, true);
    assert.strictEqual(duplicateReserve.balance.available, '70.00');
    assert.strictEqual(ledgerStore.rows.filter(row => row.entryType === 'RESERVE').length, 1);

    const capture = await operationService.capture({
        tenant: 'runtimeTenantFromToken',
        reservationCode: reserve.reservation.code,
        idempotencyKey: 'capture-001',
        correlationId: 'corr-001',
        now: new Date('2026-09-01T10:05:00.000Z')
    });
    assert.strictEqual(capture.balance.available, '70.00');
    assert.strictEqual(capture.balance.reserved, '0.00');
    assert.strictEqual(capture.balance.spent, '30.00');
    assert.strictEqual(capture.reservation.status, 'CAPTURED');
    assert.strictEqual(capture.redemption.status, 'CAPTURED');
    assert.strictEqual(capture.ledgerEntry.entryType, 'CAPTURE');
    assert.strictEqual(capture.ledgerEntry.idempotencyKey, 'capture-001');
    const duplicateCapture = await operationService.capture({
        tenant: 'runtimeTenantFromToken',
        reservationCode: reserve.reservation.code,
        idempotencyKey: 'capture-001',
        correlationId: 'corr-001',
        now: new Date('2026-09-01T10:06:00.000Z')
    });
    assert.strictEqual(duplicateCapture.idempotent, true);
    assert.strictEqual(duplicateCapture.balance.spent, '30.00');
    assert.strictEqual(ledgerStore.rows.filter(row => row.entryType === 'CAPTURE').length, 1);

    const reverse = await operationService.reverse({
        tenant: 'runtimeTenantFromToken',
        reversalOfEntryCode: capture.ledgerEntry.code,
        idempotencyKey: 'reverse-001',
        correlationId: 'corr-001',
        now: new Date('2026-09-01T10:10:00.000Z')
    });
    assert.strictEqual(reverse.balance.available, '100.00');
    assert.strictEqual(reverse.balance.spent, '0.00');
    assert.strictEqual(reverse.balance.reversed, '30.00');
    assert.strictEqual(reverse.ledgerEntry.entryType, 'REVERSE');
    assert.strictEqual(reverse.ledgerEntry.reversalOfEntryCode, capture.ledgerEntry.code);
    const duplicateReverse = await operationService.reverse({
        tenant: 'runtimeTenantFromToken',
        reversalOfEntryCode: capture.ledgerEntry.code,
        idempotencyKey: 'reverse-001',
        correlationId: 'corr-001',
        now: new Date('2026-09-01T10:11:00.000Z')
    });
    assert.strictEqual(duplicateReverse.idempotent, true);
    assert.strictEqual(duplicateReverse.balance.available, '100.00');
    assert.strictEqual(ledgerStore.rows.filter(row => row.entryType === 'REVERSE').length, 1);

    const releaseEarn = await operationService.earn(Object.assign({}, base, {
        walletCode: 'wallet-002',
        sourceCode: 'order-002',
        targetCode: 'order-002',
        amount: '25',
        idempotencyKey: 'earn-002'
    }));
    const releaseReserve = await operationService.reserve(Object.assign({}, base, {
        walletCode: 'wallet-002',
        sourceCode: 'order-002',
        targetCode: 'order-002',
        amount: '10',
        idempotencyKey: 'reserve-002'
    }));
    const release = await operationService.release({
        tenant: 'runtimeTenantFromToken',
        reservationCode: releaseReserve.reservation.code,
        idempotencyKey: 'release-001',
        correlationId: 'corr-002'
    });
    assert.strictEqual(releaseEarn.balance.available, '25.00');
    assert.strictEqual(release.balance.available, '25.00');
    assert.strictEqual(release.balance.reserved, '0.00');
    assert.strictEqual(release.reservation.status, 'RELEASED');
    assert.strictEqual(release.ledgerEntry.entryType, 'RELEASE');
    assert.strictEqual(release.ledgerEntry.idempotencyKey, 'release-001');
    const duplicateRelease = await operationService.release({
        tenant: 'runtimeTenantFromToken',
        reservationCode: releaseReserve.reservation.code,
        idempotencyKey: 'release-001',
        correlationId: 'corr-002'
    });
    assert.strictEqual(duplicateRelease.idempotent, true);
    assert.strictEqual(duplicateRelease.balance.available, '25.00');
    assert.strictEqual(ledgerStore.rows.filter(row => row.entryType === 'RELEASE').length, 1);
    [balanceStore, ledgerStore, reservationStore, redemptionStore].forEach(store => {
        store.rows.forEach(row => {
            assert.strictEqual(row.tenant, undefined);
            assert.strictEqual(row.enterpriseCode, undefined);
            assert.strictEqual(row.authData, undefined);
            assert.strictEqual(row.payload, undefined);
            assert.strictEqual(row.scale, undefined);
        });
    });

    assert.throws(() => operationService.changeBalance({ available: '5.00', reserved: '0.00' }, { scale: 2 }, { available: '-10.00' }), /cannot be negative/);
    console.log('Loyalty reward operation contract validated');
}

main().finally(() => {
    delete global.SERVICE;
}).catch(error => {
    console.error(error);
    process.exitCode = 1;
});
