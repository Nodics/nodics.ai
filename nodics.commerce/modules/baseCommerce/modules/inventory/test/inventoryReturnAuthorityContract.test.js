/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
'use strict';
/** @module inventory/test/inventoryReturnAuthorityContract @description Refuses unqualified return restocking before any generated owner access. @layer test @owner inventory */
const test = require('node:test');
const assert = require('node:assert/strict');
const owner = require('../src/service/defaultInventoryOperationService');
const definitions = require('../src/utils/statusDefinitions');

test('legacy RETURN cannot restock from caller-supplied receipt, inspection or quantity', async () => {
    let reads = 0, writes = 0;
    global.SERVICE = {
        DefaultInventoryBalanceService: {
            get: async () => { reads++; return { result: [{ code: 'balance', onHand: '1', available: '1', revision: 0 }] }; },
            update: async () => { writes++; return {}; }
        },
        DefaultInventoryMovementService: { save: async () => { writes++; return {}; } }
    };
    global.CONFIG = { get: () => 'COMMERCE' };
    global.CLASSES = { NodicsError: class extends Error {
        constructor(code) { super(definitions[code]?.message); this.code = code; }
    } };
    for (const actionCode of ['RETURN', 'return', undefined]) {
        await assert.rejects(owner.balanceAction({ tenant: 't', enterpriseCode: 'e', actorId: 'operator',
            balanceCode: 'balance', actionCode, idempotencyKey: 'return',
            payload: { actionCode: 'RETURN', quantity: '1', rmaCode: 'claimed', receiptCode: 'claimed', disposition: 'RESTOCK' }
        }), error => error.code === 'ERR_INVENTORY_RETURN_UNQUALIFIED');
    }
    assert.equal(reads, 0);
    assert.equal(writes, 0);
    assert.throws(() => owner.operationDelta({ actionCode: 'RETURN', payload: { quantity: '1' } }),
        error => error.code === 'ERR_INVENTORY_RETURN_UNQUALIFIED');
    assert.equal(definitions.ERR_INVENTORY_RETURN_UNQUALIFIED.code, '409');
});
