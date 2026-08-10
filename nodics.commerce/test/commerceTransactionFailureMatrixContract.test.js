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
    const placementSteps = ['calculateCart', 'reserveInventory', 'authorizePayment', 'createOrder', 'releaseFulfillment', 'complete'];
    const expectedCompleted = [[], ['CALCULATED'], ['CALCULATED', 'RESERVED'], ['CALCULATED', 'RESERVED', 'AUTHORIZED'], ['CALCULATED', 'RESERVED', 'AUTHORIZED', 'ORDERED'], ['CALCULATED', 'RESERVED', 'AUTHORIZED', 'ORDERED', 'RELEASED']];
    for (let index = 0; index < placementSteps.length; index += 1) {
        const failedStep = placementSteps[index];
        let compensation;
        const ports = {
            findPlacement: async function () { return null; },
            calculateCart: async function () { return { code: 'calc' }; },
            reserveInventory: async function () { return [{ code: 'reservation' }]; },
            authorizePayment: async function () { return { providerReference: 'authorization' }; },
            createOrder: async function () { return { code: 'order' }; },
            releaseFulfillment: async function () { return { code: 'consignment' }; },
            complete: async function () { return { status: 'COMPLETED' }; },
            compensate: async function (checkpoint, error) { compensation = { checkpoint: checkpoint, error: error }; }
        };
        ports[failedStep] = async function () { const error = new Error(failedStep + ' failed'); error.code = 'FAIL_' + failedStep.toUpperCase(); throw error; };
        await assert.rejects(function () { return placement.place({ tenant: 'tenant-a', ownerId: 'customer-a', idempotencyKey: 'placement-' + index, correlationId: 'corr-' + index }, ports); }, new RegExp(failedStep + ' failed', 'u'));
        assert.deepEqual(compensation.checkpoint.completed, expectedCompleted[index]);
        assert.equal(compensation.error.code, 'FAIL_' + failedStep.toUpperCase());
    }

    const replay = { tenant: 'tenant-a', idempotencyKey: 'placement-replay', status: 'COMPLETED' };
    assert.equal(await placement.place({ tenant: 'tenant-a', idempotencyKey: 'placement-replay' }, { findPlacement: async function () { return replay; } }), replay);

    const lifecycleSteps = ['fulfillmentIntent', 'inventoryDisposition', 'paymentIntent'];
    const lifecycleCompleted = [[], ['FULFILLMENT'], ['FULFILLMENT', 'INVENTORY']];
    for (let index = 0; index < lifecycleSteps.length; index += 1) {
        const failedStep = lifecycleSteps[index];
        let compensation;
        const ports = {
            find: async function () { return null; },
            evaluatePolicy: async function () { return { eligible: true, requiresApproval: false }; },
            fulfillmentIntent: async function () { return { code: 'fulfillment' }; },
            inventoryDisposition: async function () { return { code: 'inventory' }; },
            paymentIntent: async function () { return { code: 'payment' }; },
            complete: async function (request, evidence) { return evidence; },
            compensate: async function (request, checkpoint, error) { compensation = { request: request, checkpoint: checkpoint, error: error }; }
        };
        ports[failedStep] = async function () { const error = new Error(failedStep + ' failed'); error.code = 'FAIL_' + failedStep.toUpperCase(); throw error; };
        const request = { tenant: 'tenant-a', orderCode: 'order-a', requestType: 'RETURN', idempotencyKey: 'reverse-' + index };
        await assert.rejects(function () { return lifecycle.process(request, ports); }, new RegExp(failedStep + ' failed', 'u'));
        assert.equal(compensation.request, request);
        assert.deepEqual(compensation.checkpoint.completed, lifecycleCompleted[index]);
        assert.equal(compensation.error.code, 'FAIL_' + failedStep.toUpperCase());
    }

    console.log('Commerce transaction failure matrix contract validated');
}

run().catch(function (error) { console.error(error); process.exitCode = 1; });
