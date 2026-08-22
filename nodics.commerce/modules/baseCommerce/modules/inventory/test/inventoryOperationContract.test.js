/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
'use strict';
const assert = require('node:assert/strict');
const service = require('../src/service/defaultInventoryOperationService');
const facade = require('../src/facade/defaultInventoryOperationFacade');
const controller = require('../src/controller/defaultInventoryOperationController');

(async () => {
    const writes = [];
    global.FACADE = { DefaultInventoryOperationFacade: facade };
    global.SERVICE = {
        DefaultInventoryOperationService: service,
        DefaultInventoryBalanceService: {
            get: async request => {
                assert.equal(request.authData.principalId, 'inventoryOperationService');
                assert.deepEqual(request.query, { tenant: 'default', code: 'main|SKU-1' });
                return { result: [{ code: 'main|SKU-1', tenant: 'default', warehouseCode: 'main', sku: 'SKU-1', onHand: '10', reserved: '1', allocated: '0', available: '9', revision: 2 }] };
            },
            update: async request => { writes.push({ type: 'balance', request }); return { result: request.model }; }
        },
        DefaultInventoryMovementService: {
            save: async request => { writes.push({ type: 'movement', request }); return { result: request.model }; }
        }
    };
    const result = await controller.balanceAction({
        authData: { tenant: 'default', principalId: 'operator-1' },
        httpRequest: {
            params: { balanceCode: 'main|SKU-1', actionCode: 'RECEIVE' },
            headers: { 'idempotency-key': 'receive-1' },
            body: { quantity: '5', referenceCode: 'ASN-1' }
        }
    });
    assert.equal(result.data.balance.onHand, '15');
    assert.equal(result.data.balance.available, '14');
    assert.equal(result.data.balance.revision, 3);
    assert.equal(result.data.movement.movementType, 'RECEIPT');
    assert.equal(result.data.movement.quantity, '5');
    assert.equal(result.data.movement.referenceCode, 'ASN-1');
    assert.equal(writes.length, 2);
    await assert.rejects(() => facade.balanceAction({ authData: { tenant: 'default' }, balanceCode: 'main|SKU-1', actionCode: 'ADJUST', payload: { quantity: '1' }, idempotencyKey: 'adjust-1' }), /operator/);
    await assert.rejects(() => service.balanceAction({ tenant: 'default', actorId: 'operator-1', balanceCode: 'main|SKU-1', actionCode: 'SHIP', payload: { quantity: '1' }, idempotencyKey: 'ship-1' }), /Unsupported/);
    console.log('Inventory operation contract validated');
})();
