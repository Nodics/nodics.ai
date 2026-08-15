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
 * @module cart/test/cartCustomerApiContract
 * @description Verifies customer Cart lifecycle route and service contracts.
 * @layer test
 * @owner cart
 */

const properties = require('../config/properties');
const routers = require('../src/router/routers');
const controller = require('../src/controller/defaultCartApiController');
const facade = require('../src/facade/defaultCartApiFacade');
const service = require('../src/service/defaultCartApiService');

let carts;
let entries;

function installGlobals() {
    carts = [];
    entries = [];
    global.CONFIG = { get: key => key === 'cart' ? properties.cart : undefined };
    global.SERVICE = {
        DefaultCartApiService: service,
        DefaultCartService: {
            save: async request => {
                let existing = carts.find(item => item.code === request.model.code);
                if (existing) Object.assign(existing, request.model);
                else carts.push(Object.assign({}, request.model));
                return { result: Object.assign({}, request.model) };
            },
            get: async request => ({ result: carts.filter(item => item.tenant === request.query.tenant && item.ownerId === request.query.ownerId && (!request.query.code || item.code === request.query.code)) })
        },
        DefaultCartEntryService: {
            save: async request => {
                let existing = entries.find(item => item.code === request.model.code);
                if (existing) Object.assign(existing, request.model);
                else entries.push(Object.assign({}, request.model));
                return { result: Object.assign({}, request.model) };
            },
            update: async request => {
                let existing = entries.find(item => item.code === request.query.code && item.ownerId === request.query.ownerId);
                if (existing) Object.assign(existing, request.model);
                return { result: Object.assign({}, existing) };
            },
            get: async request => ({ result: entries.filter(item => item.tenant === request.query.tenant && item.ownerId === request.query.ownerId && item.cartCode === request.query.cartCode && (!request.query.status || item.status === request.query.status)) })
        },
        DefaultProductVariantService: {
            get: async request => ({
                result: request.query.code === 'agoraLinenWrapDressNaturalS' && request.query.productCode === 'agoraLinenWrapDress'
                    ? [{ code: 'agoraLinenWrapDressNaturalS', tenant: request.tenant, productCode: 'agoraLinenWrapDress', sku: 'AGORA-DRESS-LINEN-NAT-S', status: 'ACTIVE' }]
                    : []
            })
        }
    };
    global.FACADE = { DefaultCartApiFacade: facade };
}

test.beforeEach(installGlobals);

test('Cart customer routes expose create read entry mutation and calculation through secured customer permission', () => {
    assert.equal(routers.cart.customer.create.key, '/customer/carts');
    assert.equal(routers.cart.customer.read.key, '/customer/carts/:cartCode');
    assert.equal(routers.cart.customer.addEntry.key, '/customer/carts/:cartCode/entries');
    assert.equal(routers.cart.customer.updateEntry.method, 'PATCH');
    assert.equal(routers.cart.customer.removeEntry.method, 'DELETE');
    assert.equal(routers.cart.customer.calculate.permission, 'commerce.cart.own');
});

test('Cart customer API creates a cart and manages active entries for the authenticated owner', async () => {
    let authData = { tenant: 'default', principalId: 'customer-1' };
    let created = await controller.create({ authData, httpRequest: { body: { cartCode: 'cart1', storeCode: 'agoraMainStore' } } });
    assert.equal(created.data.cart.code, 'cart1');
    assert.equal(created.data.cart.ownerId, 'customer-1');

    let added = await controller.addEntry({ authData, httpRequest: { params: { cartCode: 'cart1' }, body: { productCode: 'agoraLinenWrapDress', sku: 'AGORA-DRESS-S', quantity: '2' } } });
    assert.equal(added.data.entries.length, 1);
    assert.equal(added.data.entries[0].status, 'ACTIVE');

    let updated = await controller.updateEntry({ authData, httpRequest: { params: { cartCode: 'cart1', entryCode: 'cart1|agoraLinenWrapDress|AGORA-DRESS-S' }, body: { quantity: '3' } } });
    assert.equal(updated.data.entries[0].quantity, '3');

    let removed = await controller.removeEntry({ authData, httpRequest: { params: { cartCode: 'cart1', entryCode: 'cart1|agoraLinenWrapDress|AGORA-DRESS-S' } } });
    assert.equal(removed.data.entries.length, 0);
});

test('Cart customer API accepts Product variant identity and resolves internal SKU server-side', async () => {
    let authData = { tenant: 'default', principalId: 'customer-1' };
    await controller.create({ authData, httpRequest: { body: { cartCode: 'cartVariant', storeCode: 'agoraMainStore' } } });

    let added = await controller.addEntry({
        authData,
        httpRequest: {
            params: { cartCode: 'cartVariant' },
            body: { productCode: 'agoraLinenWrapDress', variantCode: 'agoraLinenWrapDressNaturalS', quantity: '1' }
        }
    });

    assert.equal(added.data.entries.length, 1);
    assert.equal(added.data.entries[0].variantCode, 'agoraLinenWrapDressNaturalS');
    assert.equal(added.data.entries[0].sku, 'AGORA-DRESS-LINEN-NAT-S');
    assert.equal(added.data.entries[0].code, 'cartVariant|agoraLinenWrapDress|AGORA-DRESS-LINEN-NAT-S');
});

test('Cart customer API rejects unauthenticated ownership context', async () => {
    await assert.rejects(() => controller.create({ httpRequest: { body: { cartCode: 'cart1' } } }), /Authenticated tenant and customer are required/);
});
