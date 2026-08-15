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
 * @module commerceSearchCore/test/commerceSearchRankingContract
 * @description Verifies Commerce Search boost, bury, and pin ranking without exposing rule internals.
 * @layer test
 * @owner commerceSearchCore
 */

const properties = require('../config/properties');
const ranking = require('../src/service/defaultCommerceSearchRankingService');
const backoffice = require('../src/service/defaultCommerceSearchBackofficeCapabilityService');
const schemas = require('../src/schemas/schemas');

const products = [
    { productCode: 'agoraSilkScarf', name: 'Silk Scarf' },
    { productCode: 'agoraSatinMidiDress', name: 'Satin Midi Dress' },
    { productCode: 'agoraLinenWrapDress', name: 'Linen Wrap Dress' },
    { productCode: 'agoraLeatherTote', name: 'Leather Tote' }
];

const rules = [
    {
        code: 'agoraWomenRanking',
        tenant: 'default',
        storeCode: 'agoraMainStore',
        locale: 'en',
        scopeType: 'CATEGORY',
        categoryCode: 'agoraWomen',
        status: 'CURRENT',
        priority: 100,
        actions: [
            { actionType: 'PIN', productCode: 'agoraLinenWrapDress', position: 1 },
            { actionType: 'BOOST', productCode: 'agoraSatinMidiDress' },
            { actionType: 'BURY', productCode: 'agoraSilkScarf' }
        ]
    }
];

let ruleRequests;

test.beforeEach(() => {
    ruleRequests = [];
    global.CONFIG = { get: key => key === 'commerceSearch' ? properties.commerceSearch : undefined };
    global.SERVICE = {
        DefaultCommerceSearchRuleProjectionService: {
            get: async request => {
                ruleRequests.push(request);
                return { result: rules };
            }
        }
    };
});

test('Commerce Search schemas own rules versions and projections', () => {
    assert(schemas.commerceSearchCore.commerceSearchRule);
    assert(schemas.commerceSearchCore.commerceSearchRuleVersion);
    assert(schemas.commerceSearchCore.commerceSearchRuleProjection);
    assert.deepEqual(schemas.commerceSearchCore.commerceSearchRule.definition.scopeType.enum, ['GLOBAL', 'CATEGORY', 'SEARCH_TERM']);
    assert.deepEqual(schemas.commerceSearchCore.commerceSearchRule.definition.status.enum, ['DRAFT', 'READY', 'APPROVED', 'PUBLISHED', 'RETIRED']);
});

test('Commerce Search ranks pinned boosted and buried products for a category scope', async () => {
    let result = await ranking.rank({
        tenant: 'default',
        storeCode: 'agoraMainStore',
        locale: 'en',
        query: { categoryCode: 'agoraWomen' },
        authData: { groups: ['customerUserGroup'] }
    }, products);

    assert.deepEqual(result.map(item => item.productCode), [
        'agoraLinenWrapDress',
        'agoraSatinMidiDress',
        'agoraLeatherTote',
        'agoraSilkScarf'
    ]);
    assert.deepEqual(ruleRequests[0].authData.groups, ['serviceAccountUserGroup']);
    assert.deepEqual(ruleRequests[0].query.storeCode, 'agoraMainStore');
});

test('Commerce Search ignores unpublished non-matching or expired rules and preserves original order', async () => {
    global.SERVICE.DefaultCommerceSearchRuleProjectionService.get = async () => ({ result: [
        Object.assign({}, rules[0], { categoryCode: 'otherCategory' }),
        Object.assign({}, rules[0], { status: 'WITHDRAWN' }),
        Object.assign({}, rules[0], { validTo: '2026-01-01T00:00:00.000Z' })
    ] });

    let result = await ranking.rank({
        tenant: 'default',
        storeCode: 'agoraMainStore',
        locale: 'en',
        now: '2026-08-15T00:00:00.000Z',
        query: { categoryCode: 'agoraWomen' }
    }, products);

    assert.deepEqual(result.map(item => item.productCode), products.map(item => item.productCode));
});

test('Commerce Search publishes Axis BackOffice capability metadata from concrete module', () => {
    let registered;
    global.SERVICE = {
        DefaultModuleRegistrationAgentService: { registerBackofficeCapabilityProvider: (name, provider) => { registered = { name, provider }; } },
        DefaultBackofficeCapabilityDefinitionService: {
            capability: value => value,
            workbench: value => value
        }
    };

    return backoffice.init().then(() => {
        let capability = registered.provider.getCapability();
        assert.equal(registered.name, 'commerceSearchCore');
        assert.equal(capability.capabilityId, 'commerce-search');
        assert.equal(capability.displayName, 'Commerce Search');
        assert.equal(capability.navigation[0].moduleName, 'commerceSearchCore');
        assert.equal(capability.navigation[0].schemaName, 'commerceSearchRule');
        assert.equal(capability.navigation[0].permission, 'commerce.search.read');
    });
});
