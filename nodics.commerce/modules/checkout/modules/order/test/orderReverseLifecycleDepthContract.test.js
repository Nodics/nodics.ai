/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');

/**
 * @module order/test/orderReverseLifecycleDepthContract
 * @description Verifies Order-owned reverse lifecycle eligibility, RMA, refund preview, and evidence boundaries.
 * @layer test
 * @owner order
 */

const service = require('../src/service/defaultOrderLifecycleApiService');
const facade = require('../src/facade/defaultOrderLifecycleFacade');

let saved;
let auths;

test.beforeEach(() => {
    saved = [];
    auths = [];
    global.SERVICE = {
        DefaultOrderLifecycleRepositoryService: {
            list: async (_tenant, _query, authData) => {
                auths.push(authData);
                return [];
            },
            save: async (_tenant, model, authData) => {
                auths.push(authData);
                saved.push(model);
                return model;
            }
        }
    };
});

test('reverse lifecycle preview exposes cancellation return and refund customer policy depth', async () => {
    const cancellation = await service.preview({
        tenant: 'default',
        ownerId: 'customer-1',
        orderCode: 'order-1',
        payload: { requestType: 'CANCELLATION', policyVersion: '1' },
        correlationId: 'corr-1'
    });
    const returnPreview = await service.preview({
        tenant: 'default',
        ownerId: 'customer-1',
        orderCode: 'order-1',
        payload: { requestType: 'RETURN', evidence: { quantity: '1', returnMethod: 'DROP_OFF', productCodes: ['agoraLinenWrapDress'] } },
        correlationId: 'corr-2'
    });
    const refund = await service.preview({
        tenant: 'default',
        ownerId: 'customer-1',
        orderCode: 'order-1',
        payload: { requestType: 'REFUND', refundAmount: '12.00', currency: 'USD', evidence: { refundMethod: 'ORIGINAL_PAYMENT' } },
        correlationId: 'corr-3'
    });

    assert.equal(cancellation.eligible, true);
    assert.equal(cancellation.itemSelectionRequired, true);
    assert(cancellation.reasonCodes.includes('CUSTOMER_CHANGED_MIND'));
    assert.deepEqual(returnPreview.returnMethods, ['PICKUP', 'DROP_OFF', 'STORE_RETURN']);
    assert.match(returnPreview.rmaCode, /^order-1:RMA:/);
    assert.equal(returnPreview.refundPreview.status, 'REQUIRES_BACKOFFICE_CALCULATION');
    assert.equal(refund.requiresApproval, true);
    assert.equal(refund.refundPreview.amount, '12.00');
    assert.equal(refund.refundPreview.reconciliationRequired, true);
    assert(refund.downstreamOwners.includes('payment'));
});

test('reverse lifecycle create persists structured item return refund and reconciliation evidence', async () => {
    const result = await service.create({
        tenant: 'default',
        ownerId: 'customer-1',
        orderCode: 'order-1',
        idempotencyKey: 'order-1:return:1',
        payload: {
            code: 'order-1:return:1',
            requestType: 'RETURN',
            reasonCode: 'DAMAGED_ITEM',
            evidence: {
                quantity: '2',
                returnMethod: 'PICKUP',
                refundMethod: 'ORIGINAL_PAYMENT',
                productCodes: ['agoraLinenWrapDress'],
                reconciliationStatus: 'REQUIRED'
            }
        },
        correlationId: 'corr-create-1',
        authData: { groups: ['customerUserGroup'] }
    });

    assert.equal(result.status, 'SUBMITTED');
    assert.equal(saved[0].evidence.quantity, '2');
    assert.equal(saved[0].evidence.returnMethod, 'PICKUP');
    assert.equal(saved[0].evidence.refundPreview.reconciliationRequired, true);
    assert.match(saved[0].evidence.rmaCode, /^order-1:RMA:/);
    assert.deepEqual(saved[0].evidence.productCodes, ['agoraLinenWrapDress']);
    assert.equal(saved[0].active, true);
    assert(saved[0].created instanceof Date);
    assert(auths.every(authData => authData.groups.includes('serviceAccountUserGroup')));
    assert(auths.every(authData => authData.userGroups.includes('serviceAccountUserGroup')));
});

test('reverse lifecycle facade resolves customer ownership from authenticated login id', async () => {
    let captured;
    global.SERVICE = {
        DefaultOrderLifecycleApiService: {
            preview: async request => {
                captured = request;
                return { ownerId: request.ownerId, actorId: request.actorId, tenant: request.tenant };
            }
        }
    };

    const result = await facade.preview({
        authData: { tenant: 'default', loginId: 'customer@example.com' },
        orderCode: 'order-1',
        payload: { requestType: 'CANCELLATION' }
    });

    assert.equal(result.ownerId, 'customer@example.com');
    assert.equal(result.actorId, 'customer@example.com');
    assert.equal(captured.tenant, 'default');
});
