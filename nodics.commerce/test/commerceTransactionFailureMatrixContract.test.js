/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/**
 * @module nodics.commerce/test/commerceTransactionFailureMatrixContract
 * @description Proves commit ordering, idempotent replay, and owner-safe
 * compensation checkpoints for placement and reverse lifecycle transactions.
 * @layer test
 * @owner nodics.commerce
 */

const assert = require('node:assert/strict');
const path = require('node:path');
const modules = path.resolve(__dirname, '../modules');
const placement = require(path.join(modules, 'checkout/modules/checkoutCore/src/service/defaultOrderPlacementService'));
const lifecycle = require(path.join(modules, 'checkout/modules/order/src/service/defaultOrderLifecycleService'));

/** Runs the Commerce transaction failure-matrix contract. @returns {Promise<void>} Completion promise. */
async function run() {
    const placementPhases = [
        ['validateCart', 'VALIDATED', 'validation', { status: 'PASSED' }],
        ['calculateCart', 'CALCULATED', 'calculation', { code: 'calc' }],
        ['reserveInventory', 'RESERVED', 'reservation', [{ code: 'reservation' }]],
        ['reserveDigitalUnits', 'DIGITAL_RESERVED', 'digitalReservation', [{ code: 'digital-reservation' }]],
        ['authorizePayment', 'AUTHORIZED', 'authorization', { providerReference: 'authorization' }],
        ['createOrder', 'ORDERED', 'order', { code: 'order' }],
        ['capturePayment', 'PAYMENT_CAPTURED', 'capture', { status: 'CAPTURED', code: 'capture' }],
        ['commitPromotions', 'PROMOTION_COMMITTED', 'promotionCommit', { code: 'promotion-commit' }],
        ['confirmDigitalSale', 'DIGITAL_SOLD', 'digitalSale', [{ code: 'digital-sale' }]],
        ['releaseFulfillment', 'RELEASED', 'release', { code: 'consignment' }],
        ['deliverDigitalUnits', 'DIGITAL_DELIVERED', 'digitalDelivery', [{ code: 'digital-delivery' }]],
        ['complete', undefined, undefined, { status: 'COMPLETED' }]
    ];
    const placementSteps = placementPhases.map(phase => phase[0]);
    for (let index = 0; index < placementSteps.length; index += 1) {
        const failedStep = placementSteps[index];
        let compensation; const calls = [];
        const failure = Object.assign(new Error(failedStep + ' failed'), { code: 'FAIL_' + failedStep.toUpperCase() });
        const ports = {
            findPlacement: async function () { return null; },
            compensate: async function (checkpoint, error, request) { compensation = { checkpoint, error, request }; }
        };
        placementPhases.forEach(([name, phase, resultKey, result]) => {
            ports[name] = async function () {
                calls.push(name);
                if (name === failedStep) throw failure;
                return result;
            };
        });
        const request = { tenant: 'tenant-a', ownerId: 'customer-a', idempotencyKey: 'placement-' + index, correlationId: 'corr-' + index };
        await assert.rejects(() => placement.place(request, ports), error => error === failure);
        assert.deepEqual(calls, placementSteps.slice(0, index + 1), 'Placement must stop at the failed owner');
        assert.deepEqual(compensation.checkpoint.completed, placementPhases.slice(0, index).map(phase => phase[1]));
        assert.deepEqual(compensation.checkpoint.results, Object.fromEntries(placementPhases.slice(0, index).map(phase => [phase[2], phase[3]])));
        assert.equal(compensation.checkpoint.tenant, request.tenant);
        assert.equal(compensation.checkpoint.idempotencyKey, request.idempotencyKey);
        assert.equal(compensation.checkpoint.correlationId, request.correlationId);
        assert.equal(compensation.request, request);
        assert.equal(compensation.error, failure);
    }

    let validationCompensation;
    const blockedValidation = { status: 'BLOCKED', reasonCodes: ['PRODUCT_NOT_SELLABLE'] };
    await assert.rejects(() => placement.place({ tenant: 'tenant-a', idempotencyKey: 'validation-blocked' }, {
        findPlacement: async () => null,
        validateCart: async () => blockedValidation,
        calculateCart: async () => { assert.fail('Blocked validation must stop before calculation'); },
        compensate: async (checkpoint, error) => { validationCompensation = { checkpoint, error }; }
    }), /Cart validation failed/u);
    assert.deepEqual(validationCompensation.checkpoint.completed, ['VALIDATED']);
    assert.deepEqual(validationCompensation.checkpoint.results, { validation: blockedValidation });

    const replay = { tenant: 'tenant-a', idempotencyKey: 'placement-replay', status: 'COMPLETED' };
    assert.equal(await placement.place({ tenant: 'tenant-a', idempotencyKey: 'placement-replay' }, { findPlacement: async function () { return replay; } }), replay);

    const lifecyclePhases = [
        ['fulfillmentIntent', 'FULFILLMENT', { status: 'PREPARED', code: 'fulfillment' }],
        ['inventoryDisposition', 'INVENTORY', { status: 'SETTLED', code: 'inventory' }],
        ['paymentIntent', 'PAYMENT', { status: 'REFUND_SUCCEEDED', transactionCode: 'refund-transaction' }],
        ['complete', 'COMPLETE', { status: 'COMPLETED' }]
    ];
    const lifecycleSteps = lifecyclePhases.map(phase => phase[0]);
    for (const failureMode of ['THROWN', 'PENDING']) {
        for (let index = 0; index < lifecycleSteps.length; index += 1) {
            const failedStep = lifecycleSteps[index];
            let compensation; const calls = [];
            const failure = Object.assign(new Error(failedStep + ' failed'), { code: 'FAIL_' + failedStep.toUpperCase() });
            const ports = {
                find: async function () { return null; },
                evaluatePolicy: async function () { return { eligible: true, requiresApproval: false }; },
                compensate: async function (request, checkpoint, error) { compensation = { request, checkpoint, error }; }
            };
            lifecyclePhases.forEach(([name, owner, result]) => {
                ports[name] = async function () {
                    calls.push(name);
                    if (name === failedStep) {
                        if (failureMode === 'THROWN') throw failure;
                        return { status: 'PENDING' };
                    }
                    return result;
                };
            });
            const request = { tenant: 'tenant-a', orderCode: 'order-a', requestType: 'RETURN', idempotencyKey: 'reverse-' + failureMode + '-' + index };
            const owner = lifecyclePhases[index][1];
            await assert.rejects(() => lifecycle.process(request, ports), error => failureMode === 'THROWN'
                ? error === failure : error.message === 'Reverse ' + owner + ' outcome is unconfirmed; reconcile before retry');
            assert.deepEqual(calls, lifecycleSteps.slice(0, index + 1), 'Reverse must stop at the failed or unconfirmed owner');
            assert.equal(compensation.request, request);
            assert.deepEqual(compensation.checkpoint.completed, lifecyclePhases.slice(0, index).map(phase => phase[1]));
            assert.deepEqual(compensation.checkpoint.results, Object.fromEntries(lifecyclePhases.slice(0, index).map(phase => [phase[1].toLowerCase(), phase[2]])));
            assert.deepEqual(compensation.checkpoint.unconfirmed, { owner, status: 'UNCONFIRMED' });
            assert.deepEqual(compensation.checkpoint.eligibility, { eligible: true, requiresApproval: false });
            assert.deepEqual(compensation.checkpoint.approval, { status: 'APPROVED' });
            if (failureMode === 'THROWN') assert.equal(compensation.error, failure);
        }
    }

    const reverseRequest = { tenant: 'tenant-a', orderCode: 'order-a', idempotencyKey: 'reverse-replay' };
    const reverseReplay = { ...reverseRequest, status: 'COMPLETED' };
    assert.equal(await lifecycle.process(reverseRequest, { find: async () => reverseReplay }), reverseReplay);
    for (const unconfirmed of [{ ...reverseReplay, status: 'PENDING' }, { ...reverseReplay, tenant: 'tenant-b' },
        { ...reverseReplay, orderCode: 'order-b' }, { ...reverseReplay, idempotencyKey: 'foreign-key' }]) {
        await assert.rejects(() => lifecycle.process(reverseRequest, { find: async () => unconfirmed }), /Reverse replay evidence is unconfirmed/u);
    }

    console.log('Commerce transaction failure matrix contract validated');
}

run().catch(function (error) { console.error(error); process.exitCode = 1; });
