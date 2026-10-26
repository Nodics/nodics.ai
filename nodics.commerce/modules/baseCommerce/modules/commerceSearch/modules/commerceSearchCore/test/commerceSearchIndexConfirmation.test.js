/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';
/** @module commerceSearchCore/test/indexConfirmation @description Composes real nSearch save/read processors and Elastic adapter with an in-memory transport to prove publisher evidence handling. @layer test @owner commerceSearchCore */
const test = require('node:test');
const assert = require('node:assert/strict');
const publication = require('../src/service/defaultCommerceSearchPublicationService');
const policy = require('../src/service/defaultCommerceSearchPolicyService');
const properties = require('../config/properties');
const statuses = require('../src/utils/statusDefinitions');
const base = '../../../../../../../../nodics.foundation/modules/nSearch/';
const bulk = require(base + 'search/src/service/procs/dosave/defaultDoSaveModelsInitializerService');
const single = require(base + 'search/src/service/procs/dosave/defaultDoSaveModelInitializerService');
const search = require(base + 'search/src/service/procs/doSearch/defaultDoSearchModelsInitializerService');
const elastic = require(base + 'elastic/src/schemas/elasticSearchModel').default;
const model = { code: 'rule|shop|en', tenant: 't', storeCode: 'shop', locale: 'en', status: 'CURRENT',
    scopeType: 'GLOBAL', sourceHash: 'a'.repeat(64), priority: 1, actions: [],
    benefitRef: { agreementCode: 'agreement', enterpriseCode: 'issuer', benefitCode: 'visibility' },
    validFrom: '2026-10-01T00:00:00.000Z', validTo: '2026-11-01T00:00:00.000Z' };
const request = { tenant: 't', authData: { tenant: 't', principalType: 'human', tokenType: 'access' } };
let fault, stored, indexCalls, searchCalls, lastSave;
function step(service, name, input, output) {
    return new Promise((resolve, reject) => service[name](input, output, {
        nextSuccess: resolve, error: (_r, _o, error) => reject(error), resolve
    }));
}
test.beforeEach(() => {
    fault = undefined; stored = undefined; indexCalls = 0; searchCalls = 0;
    global.CONFIG = { get: key => key === 'commerceSearch' ? properties.commerceSearch : undefined };
    global.CLASSES = { NodicsError: class extends Error { constructor(code) { super(statuses[code].message); this.code = code; } } };
    const logger = { debug() {} };
    const adapter = { indexDef: { indexName: 'commerceSearchRuleProjection', idPropertyName: 'code' }, LOG: logger,
        searchEngine: { getOptions: () => ({}), getConnection: () => ({
            index: async input => {
                indexCalls++; assert.equal(input.refresh, 'wait_for');
                if (fault === 'write') throw new Error('SECRET_PROVIDER_BODY');
                stored = JSON.parse(JSON.stringify(input.document));
                return { _id: fault === 'wrongAck' ? 'other' : input.id, result: 'created', _shards: { failed: fault === 'shardAck' ? 1 : 0 } };
            },
            search: async input => {
                searchCalls++; assert.deepEqual(input.body.query, { ids: { values: [model.code] } });
                assert.equal(input.size, 2);
                if (fault === 'read') throw new Error('SECRET_PROVIDER_BODY');
                const source = structuredClone(stored);
                if (fault?.startsWith('field:')) source[fault.slice(6)] = 'foreign';
                const hits = fault === 'missing' ? [] : [{ _id: model.code, _source: source }];
                if (fault === 'duplicate') hits.push(hits[0]);
                return { body: { timed_out: fault === 'timeout', _shards: { failed: 0 },
                    hits: { total: { value: hits.length, relation: 'eq' }, hits } } };
            }
        }) } };
    elastic.defineDefaultDoSave(adapter); elastic.defineDefaultDoSearch(adapter);
    const bulkProcessor = Object.assign(Object.create(bulk), { LOG: logger });
    const singleProcessor = Object.assign(Object.create(single), { LOG: logger });
    const searchProcessor = Object.assign(Object.create(search), { LOG: logger });
    global.SERVICE = {
        DefaultCommerceSearchPolicyService: policy,
        DefaultPipelineService: { start: async (name, input, output) => {
            assert.equal(name, 'doSaveModelInitializerPipeline');
            await step(singleProcessor, 'doSaveModel', input, output);
            return output.success;
        } },
        DefaultCommerceSearchRuleProjectionService: {
            doSave: async input => {
                assert.equal(input.authData, request.authData);
                const output = {}; input.searchModel = adapter;
                await bulkProcessor.handleModelsDoSave(input, output, [input.model]);
                lastSave = await step(bulkProcessor, 'handleSucessEnd', input, output);
                return fault === 'malformedAck' ? undefined : lastSave;
            },
            doSearch: async input => {
                assert.equal(input.authData, request.authData);
                const output = {}; input.searchModel = adapter;
                await step(searchProcessor, 'executeQuery', input, output);
                return output.success;
            }
        }
    };
});

test('real save/read pipelines confirm exact indexed content and ordinary retry', async () => {
    await publication.indexProjection(request, model);
    await publication.indexProjection(request, model);
    assert.equal(indexCalls, 2); assert.equal(searchCalls, 2);
    assert.equal(lastSave.result.length, 1);
});

test('real nSearch resolved error envelope never counts as index success or leaks provider body', async () => {
    fault = 'write';
    await assert.rejects(publication.indexProjection(request, model), error => {
        assert.equal(error.code, 'ERR_COMMERCE_SEARCH_INDEX_ACK');
        assert.equal(String(error).includes('SECRET'), false);
        assert.equal(error.cause, undefined); return true;
    });
    assert.equal(lastSave.code, 'SUC_SRCH_00000'); assert.equal(lastSave.errors.length, 1);
    assert.equal(searchCalls, 0);
    fault = undefined;
    await publication.indexProjection(request, model);
});

for (const [mode, stage] of [['wrongAck', 'INDEX_ACK'], ['shardAck', 'INDEX_ACK'], ['malformedAck', 'INDEX_ACK'],
    ['read', 'INDEX_READ'], ['timeout', 'INDEX_READ'], ['missing', 'INDEX_MISSING'], ['duplicate', 'INDEX_BINDING'],
    ...['code', 'tenant', 'storeCode', 'locale', 'status', 'sourceHash', 'benefitRef', 'actions', 'validTo'].map(field => ['field:' + field, 'INDEX_BINDING'])]) {
    test('index evidence rejects ' + mode + ' at ' + stage, async () => {
        fault = mode;
        await assert.rejects(publication.indexProjection(request, model), { code: 'ERR_COMMERCE_SEARCH_' + stage });
    });
}
