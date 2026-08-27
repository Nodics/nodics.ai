/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
'use strict';
const assert = require('node:assert/strict'); const path = require('node:path');
const orderRoot = path.resolve(__dirname, '../modules/checkout/modules/order');
const routers = require(path.join(orderRoot, 'src/router/routers')).order;
global.SERVICE = {};
Object.values(routers).flatMap(group => Object.values(group)).forEach(route => {
    assert.equal(route.secured, true); assert.deepEqual(route.authTokenTypes, ['access']);
    assert(!route.key.includes('/catalog'), 'Lifecycle action must not be exposed from Catalog');
});
assert.equal(routers.customer.create.permission, 'commerce.lifecycle.own.create');
assert.equal(routers.operator.action.permission, 'commerce.lifecycle.act');
const api = require(path.join(orderRoot, 'src/service/defaultOrderLifecycleOperationService'));
(async function () {
    const saved = []; api.repository = () => ({
        list: async (tenant, query) => saved.filter(item => item.tenant === tenant && Object.entries(query).every(([key, value]) => item[key] === value)),
        save: async (tenant, item) => { saved.push(item); return item; },
        get: async (tenant, code) => saved.find(item => item.tenant === tenant && item.code === code),
        update: async (tenant, item, update) => Object.assign({}, item, update)
    });
    const request = { tenant: 't1', ownerId: 'customer1', actorId: 'customer1', orderCode: 'o1', idempotencyKey: 'i1', correlationId: 'x', payload: { code: 'r1', requestType: 'REFUND' }, query: {} };
    const created = await api.create(request); assert.equal(created.status, 'SUBMITTED'); assert.equal((await api.create(request)).code, 'r1');
    await assert.rejects(() => api.action({ tenant: 't1', actorId: 'customer1', requestCode: 'r1', actionCode: 'APPROVE', payload: {} }), /Maker-checker/u);
    assert.equal((await api.action({ tenant: 't1', actorId: 'approver1', requestCode: 'r1', actionCode: 'APPROVE', payload: {} })).status, 'APPROVED');
    console.log('Commerce lifecycle API contract validated');
})().catch(error => { console.error(error); process.exitCode = 1; });
