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

/** @module customerList/test/customerListCustomerApiContract @description Verifies customer-owned wishlist and compare API boundaries. @layer test @owner customerList */

const properties = require('../config/properties');
const routers = require('../src/router/routers');
const controller = require('../src/controller/defaultCustomerListCustomerController');
const facade = require('../src/facade/defaultCustomerListCustomerFacade');
const service = require('../src/service/defaultCustomerListOperationService');

let lists;
let entries;

function installGlobals() {
    lists = [];
    entries = [];
    global.CONFIG = { get: key => key === 'customerList' ? properties.customerList : undefined };
    global.SERVICE = {
        DefaultCustomerListOperationService: service,
        DefaultCustomerListService: {
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
        DefaultCustomerListEntryService: {
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
    global.FACADE = { DefaultCustomerListCustomerFacade: facade };
}

test.beforeEach(installGlobals);

test('Customer list routes expose secured wishlist and compare ownership APIs', () => {
    assert.equal(routers.customerList.customer.read.key, '/customer/lists/:listType');
    assert.equal(routers.customerList.customer.addEntry.method, 'POST');
    assert.equal(routers.customerList.customer.removeEntry.method, 'DELETE');
    assert.equal(routers.customerList.customer.clear.key, '/customer/lists/:listType/entries');
    assert.equal(routers.customerList.customer.addEntry.permission, 'commerce.customerList.own');
});

test('Customer list API creates customer-owned wishlist entries idempotently', async () => {
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
        /Customer list item limit exceeded/
    );
});

test('Customer list API scopes read and remove to authenticated owner', async () => {
    const customerOne = { tenant: 'default', principalId: 'customer-1' };
    const customerTwo = { tenant: 'default', principalId: 'customer-2' };
    let added = await controller.addEntry({ authData: customerOne, httpRequest: { params: { listType: 'wishlist' }, body: { productCode: 'agoraLeatherTote' } } });
    let entryCode = added.data.entries[0].code;

    let otherRead = await controller.read({ authData: customerTwo, httpRequest: { params: { listType: 'wishlist' }, query: {} } });
    assert.equal(otherRead.data.entries.length, 0);

    let removed = await controller.removeEntry({ authData: customerOne, httpRequest: { params: { listType: 'wishlist', entryCode } } });
    assert.equal(removed.data.entries.length, 0);
});

test('Customer list API rejects unauthenticated ownership context and unsupported list type', async () => {
    await assert.rejects(() => controller.read({ httpRequest: { params: { listType: 'wishlist' }, query: {} } }), /Authenticated tenant and customer are required/);
    await assert.rejects(() => controller.read({ authData: { tenant: 'default', principalId: 'customer-1' }, httpRequest: { params: { listType: 'recentlyViewed' }, query: {} } }), /Unsupported customer list type/);
});
