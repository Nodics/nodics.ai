/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module loyaltyApi/test/loyaltyApiRouteContract @description Verifies Loyalty API routes remain generic reward/wallet integration APIs. @layer test @owner loyaltyApi */
const assert = require('assert');
const routes = require('../src/router/routers').loyaltyApi.internal;
const controller = require('../src/controller/defaultLoyaltyInternalController');
const facade = require('../src/facade/defaultLoyaltyInternalFacade');

const routeValues = Object.values(routes);
assert(routeValues.length > 0, 'Loyalty API must declare explicit integration routes');
routeValues.forEach(route => {
    assert.strictEqual(route.secured, true);
    assert.strictEqual(route.apiExposure, 'loyaltyInternal');
    assert(!route.key.includes('/coupons'), 'Loyalty API must not own Commerce coupon routes');
    assert(!route.operation.toLowerCase().includes('coupon'), 'Loyalty API operations must remain generic reward operations');
});

assert.strictEqual(routes.reserveRewards.key, '/reward-reservations');
assert.deepStrictEqual(routes.wallet.authTokenTypes, ['access', 'service']);
['reserveRewards', 'captureReservation', 'releaseReservation', 'reverseLedgerEntry'].forEach(operation => {
    assert.deepStrictEqual(routes[operation].authTokenTypes, ['service']);
});
assert.strictEqual(routes.captureReservation.key, '/reward-reservations/:reservationCode/capture');
assert.strictEqual(routes.releaseReservation.key, '/reward-reservations/:reservationCode/release');
assert.strictEqual(routes.reverseLedgerEntry.key, '/reward-ledger-entries/:entryCode/reverse');

async function main() {
    const calls = [];
    global.FACADE = {
        DefaultLoyaltyInternalFacade: {
            reserveRewards: async request => {
                calls.push(request);
                return { ok: true, idempotencyKey: request.idempotencyKey, correlationId: request.correlationId, tenant: request.tenant };
            }
        }
    };
    const response = await controller.reserveRewards({
        authData: { tenant: 'runtimeTenantFromToken' },
        httpRequest: {
            headers: { 'Idempotency-Key': 'reserve-header-001', 'X-Correlation-Id': 'corr-header-001' },
            body: { walletCode: 'wallet-001' }
        }
    });
    assert.strictEqual(response.data.idempotencyKey, 'reserve-header-001');
    assert.strictEqual(response.data.correlationId, 'corr-header-001');
    assert.strictEqual(response.data.tenant, 'runtimeTenantFromToken');
    assert.strictEqual(calls[0].payload.walletCode, 'wallet-001');
    delete global.FACADE;

    assert.throws(() => facade.captureReservation({ params: { reservationCode: 'reservation-001' }, payload: {} }), /idempotencyKey is required/);
    assert.throws(() => facade.releaseReservation({ payload: { idempotencyKey: 'release-001' } }), /reservationCode is required/);
    assert.throws(() => facade.reverseLedgerEntry({ payload: { idempotencyKey: 'reverse-001' } }), /entryCode is required/);

    console.log('Loyalty API route contract validated');
}

main().catch(error => {
    console.error(error);
    process.exitCode = 1;
});
