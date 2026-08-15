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
 * @module commerceSearchCore/test/commerceSearchPublicationContract
 * @description Verifies Commerce Search approved rules publish to customer-runtime nSearch projections.
 * @layer test
 * @owner commerceSearchCore
 */

const properties = require('../config/properties');
const routers = require('../src/router/routers');
const controller = require('../src/controller/defaultCommerceSearchPublicationController');
const facade = require('../src/facade/defaultCommerceSearchPublicationFacade');
const publication = require('../src/service/defaultCommerceSearchPublicationService');
const builder = require('../src/service/defaultCommerceSearchProjectionBuilderService');
const indexes = require('../src/search/indexes');

const rules = [
    {
        code: 'agoraWomenRanking',
        tenant: 'default',
        name: 'Agora Women Ranking',
        storeCode: 'agoraMainStore',
        locale: 'en',
        scopeType: 'CATEGORY',
        categoryCode: 'agoraWomen',
        status: 'APPROVED',
        actions: [
            { actionType: 'PIN', productCode: 'agoraLinenWrapDress', position: 1 },
            { actionType: 'BOOST', productCode: 'agoraSatinMidiDress' },
            { actionType: 'BURY', productCode: 'agoraSilkScarf' }
        ],
        priority: 100,
        revision: 1
    },
    {
        code: 'draftRule',
        tenant: 'default',
        name: 'Draft Rule',
        storeCode: 'agoraMainStore',
        locale: 'en',
        scopeType: 'CATEGORY',
        categoryCode: 'agoraWomen',
        status: 'DRAFT',
        actions: [],
        priority: 1,
        revision: 1
    }
];

let readRequests;
let saved;
let indexed;

test.beforeEach(() => {
    readRequests = [];
    saved = [];
    indexed = [];
    global.CONFIG = { get: key => key === 'commerceSearch' ? properties.commerceSearch : undefined };
    global.SERVICE = {
        DefaultCommerceSearchPublicationService: publication,
        DefaultCommerceSearchProjectionBuilderService: builder,
        DefaultCommerceSearchRuleService: {
            get: async request => {
                readRequests.push(request);
                return { result: rules.filter(rule => rule.status === 'APPROVED' || rule.status === 'PUBLISHED') };
            }
        },
        DefaultCommerceSearchRuleProjectionService: {
            save: async request => saved.push(request),
            doSave: async request => indexed.push(request)
        }
    };
    global.FACADE = { DefaultCommerceSearchPublicationFacade: facade };
});

test('Commerce Search exposes only secured operator publication route', () => {
    const route = routers.commerceSearchCore.operatorPublication.publish;

    assert.equal(route.secured, true);
    assert.deepEqual(route.authTokenTypes, ['access']);
    assert.equal(route.accessGroups[0], 'employeeUserGroup');
    assert.equal(route.permission, 'commerce.search.publish');
    assert.equal(route.apiExposure, 'commerceManagement');
    assert.equal(route.key, '/operator/commerce-search/publication/rules');
});

test('Commerce Search publishes approved rules to persisted and indexed projections', async () => {
    let response = await controller.publish({
        authData: { tenant: 'default', groups: ['adminGroup'] },
        now: '2026-08-15T00:00:00.000Z',
        httpRequest: { body: { storeCode: 'agoraMainStore', locale: 'en' } }
    });

    assert.equal(response.data.requested, 1);
    assert.equal(response.data.published, 1);
    assert.equal(response.data.projectionCount, 1);
    assert.deepEqual(readRequests[0].query, {
        tenant: 'default',
        status: { $in: ['APPROVED', 'PUBLISHED'] },
        storeCode: 'agoraMainStore',
        locale: 'en'
    });
    assert.equal(saved.length, 1);
    assert.equal(indexed.length, 1);
    assert.equal(indexed[0].moduleName, 'commerceSearchCore');
    assert.equal(indexed[0].indexName, 'commerceSearchRuleProjection');
    assert.equal(indexed[0].model.status, 'CURRENT');
    assert.equal(indexed[0].model.categoryCode, 'agoraWomen');
    assert.equal(indexed[0].model.actions.length, 3);
});

test('Commerce Search contributes provider-neutral rule projection index', () => {
    const definition = indexes.commerceSearchCore.commerceSearchRuleProjection;

    assert.equal(definition.schemaName, 'commerceSearchRuleProjection');
    assert.equal(definition.tenantPropertyName, 'tenant');
    assert.deepEqual(definition.partitionProperties, ['tenant', 'storeCode', 'locale']);
    assert.equal(definition.properties.actions.type, 'object');
});
