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
 * @module fulfillmentCore/test/fulfillmentReturnExecutionContract
 * @description Verifies Fulfillment-owned return shipment, receipt, inspection, and disposition evidence.
 * @layer test
 * @owner fulfillmentCore
 */

const service = require('../src/service/defaultFulfillmentReturnExecutionService');

let saved;

function recorder(schema) {
    return {
        save: async request => {
            saved.push({ schema, request });
            return { result: request.model };
        }
    };
}

test.beforeEach(() => {
    saved = [];
    global.SERVICE = {
        DefaultFulfillmentReturnService: recorder('fulfillmentReturn'),
        DefaultTrackingEventService: recorder('trackingEvent'),
        DefaultReturnReceiptService: recorder('returnReceipt'),
        DefaultReturnInspectionService: recorder('returnInspection')
    };
});

test('Fulfillment return execution creates pickup drop-off and store-return intents with RMA evidence', async () => {
    const pickup = await service.createReturn({
        tenant: 'default',
        ownerId: 'customer-1',
        orderCode: 'order-1',
        idempotencyKey: 'order-1:return:pickup',
        payload: { returnMethod: 'PICKUP', reasonCode: 'DAMAGED_ITEM', quantity: '1', productCodes: ['agoraLinenWrapDress'] },
        correlationId: 'corr-return-1'
    });
    const dropOff = await service.createReturn({
        tenant: 'default',
        ownerId: 'customer-1',
        orderCode: 'order-1',
        idempotencyKey: 'order-1:return:drop',
        payload: { returnMethod: 'DROP_OFF' },
        correlationId: 'corr-return-2'
    });
    const store = await service.createReturn({
        tenant: 'default',
        ownerId: 'customer-1',
        orderCode: 'order-1',
        idempotencyKey: 'order-1:return:store',
        payload: { returnMethod: 'STORE_RETURN' },
        correlationId: 'corr-return-3'
    });

    assert.equal(pickup.status, 'PICKUP_REQUESTED');
    assert.equal(dropOff.status, 'DROP_OFF_AUTHORIZED');
    assert.equal(store.status, 'STORE_RETURN_AUTHORIZED');
    assert.match(pickup.evidence.rmaCode, /^order-1:RMA:/);
    assert.deepEqual(pickup.evidence.productCodes, ['agoraLinenWrapDress']);
    assert(saved.every(item => item.request.authData.groups.includes('serviceAccountUserGroup')));
});

test('Fulfillment return execution records tracking receipt and inspection disposition', async () => {
    const common = { tenant: 'default', ownerId: 'customer-1', orderCode: 'order-1', idempotencyKey: 'order-1:return:flow', correlationId: 'corr-return-flow' };
    const tracking = await service.recordTracking(Object.assign({}, common, { payload: { rmaCode: 'RMA-1', trackingNumber: 'TRACK-1', trackingStatus: 'IN_TRANSIT' } }));
    const receipt = await service.recordReceipt(Object.assign({}, common, { payload: { rmaCode: 'RMA-1', receivedQuantity: '1', packageCondition: 'SEALED' } }));
    const inspection = await service.recordInspection(Object.assign({}, common, { actorId: 'operator-1', payload: { rmaCode: 'RMA-1', disposition: 'RESTOCK' } }));

    assert.equal(tracking.status, 'IN_TRANSIT');
    assert.equal(receipt.status, 'RECEIVED');
    assert.equal(inspection.status, 'INSPECTED');
    assert.equal(inspection.evidence.disposition, 'RESTOCK');
    assert.equal(inspection.evidence.refundEligible, true);
    assert.deepEqual(saved.map(item => item.schema), ['trackingEvent', 'returnReceipt', 'returnInspection']);
});

test('Fulfillment return execution supports rejected inspection disposition', async () => {
    const inspection = await service.recordInspection({
        tenant: 'default',
        ownerId: 'customer-1',
        orderCode: 'order-1',
        idempotencyKey: 'order-1:return:reject',
        payload: { rmaCode: 'RMA-1', disposition: 'REJECT_RETURN' },
        correlationId: 'corr-return-reject'
    });

    assert.equal(inspection.status, 'REJECTED');
    assert.equal(inspection.evidence.refundEligible, false);
    assert.equal(inspection.evidence.inspectionStatus, 'FAILED');
});
