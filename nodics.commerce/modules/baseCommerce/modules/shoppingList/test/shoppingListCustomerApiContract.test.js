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

/** @module shoppingList/test/shoppingListCustomerApiContract @description Verifies customer-owned shopping-list API boundaries. @layer test @owner shoppingList */

const properties = require('../config/properties');
const routers = require('../src/router/routers');
const controller = require('../src/controller/defaultShoppingListCustomerController');
const facade = require('../src/facade/defaultShoppingListCustomerFacade');
const service = require('../src/service/defaultShoppingListOperationService');

let lists;
let entries;

function installGlobals() {
    lists = [];
    entries = [];
    global.CONFIG = { get: key => key === 'shoppingList' ? properties.shoppingList : undefined };
    global.SERVICE = {
        DefaultShoppingListOperationService: service,
        DefaultShoppingListService: {
            save: async request => {
                let existing = lists.find(item => item.code === request.model.code);
                if (existing) Object.assign(existing, request.model);
                else lists.push(Object.assign({}, request.model));
                return { result: Object.assign({}, request.model) };
            },
            get: async request => ({
                result: lists.filter(item => item.tenant === request.query.tenant
                    && item.ownerId === request.query.ownerId
                    && (!request.query.code || item.code === request.query.code)
                    && (!request.query.status || item.status === request.query.status))
            })
        },
        DefaultShoppingListEntryService: {
            save: async request => {
                let existing = entries.find(item => item.code === request.model.code);
                if (existing) Object.assign(existing, request.model);
                else entries.push(Object.assign({}, request.model));
                return { result: Object.assign({}, request.model) };
            },
            update: async request => {
                let existing = entries.find(item => item.code === request.query.code
                    && item.ownerId === request.query.ownerId
                    && item.listCode === request.query.listCode);
                if (existing) Object.assign(existing, request.model);
                return { result: Object.assign({}, existing) };
            },
            get: async request => ({
                result: entries.filter(item => item.tenant === request.query.tenant
                    && item.ownerId === request.query.ownerId
                    && item.listCode === request.query.listCode
                    && (!request.query.status || item.status === request.query.status))
            })
        }
    };
    global.FACADE = { DefaultShoppingListCustomerFacade: facade };
}

test.beforeEach(installGlobals);

test('Shopping list routes expose secured wishlist, compare, and save-for-later ownership APIs', () => {
    assert.equal(routers.shoppingList.customer.read.key, '/lists/:listType');
    assert.equal(routers.shoppingList.customer.addEntry.method, 'POST');
    assert.equal(routers.shoppingList.customer.removeEntry.method, 'DELETE');
    assert.equal(routers.shoppingList.customer.clear.key, '/lists/:listType/entries');
    assert.equal(routers.shoppingList.customer.addEntry.permission, 'commerce.shoppingList.own');
});

test('Shopping list API creates customer-owned wishlist entries idempotently', async () => {
    const authData = { tenant: 'default', principalId: 'customer-1' };
    let added = await controller.addEntry({ authData, httpRequest: { params: { listType: 'wishlist' }, body: { productCode: 'agoraLinenWrapDress', variantCode: 'agoraLinenWrapDressNaturalS' } } });
    assert.equal(added.data.list.ownerId, 'customer-1');
    assert.equal(added.data.list.listType, 'WISHLIST');
    assert.equal(added.data.entries.length, 1);
    assert.equal(added.data.entries[0].productCode, 'agoraLinenWrapDress');

    await controller.addEntry({ authData, httpRequest: { params: { listType: 'wishlist' }, body: { productCode: 'agoraLinenWrapDress', variantCode: 'agoraLinenWrapDressNaturalS' } } });
    let read = await controller.read({ authData, httpRequest: { params: { listType: 'wishlist' }, query: {} } });
    assert.equal(read.data.entries.length, 1);
});

test('Customer compare API enforces configured item bound', async () => {
    const authData = { tenant: 'default', principalId: 'customer-1' };
    for (const productCode of ['p1', 'p2', 'p3', 'p4']) {
        await controller.addEntry({ authData, httpRequest: { params: { listType: 'compare' }, body: { productCode } } });
    }
    await assert.rejects(
        () => controller.addEntry({ authData, httpRequest: { params: { listType: 'compare' }, body: { productCode: 'p5' } } }),
        /Shopping list item limit exceeded/
    );
});

test('Shopping list API creates save-for-later entries under the same commerce capability', async () => {
    const authData = { tenant: 'default', principalId: 'customer-1' };
    const added = await controller.addEntry({ authData, httpRequest: { params: { listType: 'save_for_later' }, body: { productCode: 'agoraLeatherTote' } } });
    assert.equal(added.data.list.listType, 'SAVE_FOR_LATER');
    assert.equal(added.data.entries.length, 1);
});

test('Shopping list API scopes read and remove to authenticated owner', async () => {
    const customerOne = { tenant: 'default', principalId: 'customer-1' };
    const customerTwo = { tenant: 'default', principalId: 'customer-2' };
    let added = await controller.addEntry({ authData: customerOne, httpRequest: { params: { listType: 'wishlist' }, body: { productCode: 'agoraLeatherTote' } } });
    let entryCode = added.data.entries[0].code;

    let otherRead = await controller.read({ authData: customerTwo, httpRequest: { params: { listType: 'wishlist' }, query: {} } });
    assert.equal(otherRead.data.entries.length, 0);

    let removed = await controller.removeEntry({ authData: customerOne, httpRequest: { params: { listType: 'wishlist', entryCode } } });
    assert.equal(removed.data.entries.length, 0);
});

test('Shopping list API rejects unauthenticated ownership context and unsupported list type', async () => {
    await assert.rejects(() => controller.read({ httpRequest: { params: { listType: 'wishlist' }, query: {} } }), /Authenticated tenant and customer are required/);
    await assert.rejects(() => controller.read({ authData: { tenant: 'default', principalId: 'customer-1' }, httpRequest: { params: { listType: 'recentlyViewed' }, query: {} } }), /Unsupported shopping list type/);
});
