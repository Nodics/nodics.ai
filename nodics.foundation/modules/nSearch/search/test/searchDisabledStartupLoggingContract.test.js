/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';
/**
 * @module nSearch/search/test/searchDisabledStartupLoggingContract
 * @description Composes actual search configuration and startup owners to distinguish disabled debug skips from selected-provider failures without live providers.
 * @layer test
 * @owner nSearch
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const configuration = require('../src/service/config/defaultSearchConfigurationService');
const connection = require('../src/service/connection/defaultSearchEngineConnectionHandlerService');
const models = require('../src/service/model/defaultSearchModelHandlerService');
const defaults = require('../config/properties');

/** Builds isolated effective configuration and records log levels; never opens a provider. */
function fixture(enabled = false) {
    const messages = [], module = { searchModels: {} };
    const search = { default: { ...defaults.search.default,
        options: { ...defaults.search.default.options, enabled }, elastic: { options: {} } } };
    global.CONFIG = { get: key => key === 'search' ? search : undefined };
    global.NODICS = { isModuleActive: () => true, getActiveTenants: () => ['default'],
        getModule: () => module, getSearchModels: () => ({ item: {} }) };
    global.UTILS = { isBlank: value => !value || Object.keys(value).length === 0 };
    global.CLASSES = { SearchError: class extends Error {
        constructor(code, message) { super(message || String(code)); this.code = code; }
    } };
    const log = Object.fromEntries(['debug', 'warn', 'error'].map(level => [level, message => messages.push({ level, message })]));
    const config = { ...configuration, searchEngines: {},
        getRawSearchModelDefinition: () => ({}), getRawSearchSchema: () => ({ item: {} }) };
    global.SERVICE = { DefaultSearchConfigurationService: config };
    return { messages, search, config, connection: { ...connection, LOG: log }, models: { ...models, LOG: log } };
}

test('effective default-disabled startup emits debug at all three skip sites', async () => {
    const f = fixture();
    assert.equal(defaults.search.default.options.enabled, false);
    assert.equal(await f.connection.createModuleSearchEngines('catalog', 'default'), true);
    assert.equal(await f.models.prepareTenantSearchModels('catalog', 'default'), true);
    assert.equal(await f.models.updateModuleIndexesSchema('catalog', ['default']), true);
    assert.equal(f.messages.filter(item => item.message.startsWith('Search is not enabled')).length, 3);
    assert.equal(f.messages.some(item => item.level !== 'debug'), false);
});

test('selected but missing engine retains both model warnings', async () => {
    const f = fixture(true);
    await f.models.prepareTenantSearchModels('catalog', 'default');
    await f.models.updateModuleIndexesSchema('catalog', ['default']);
    assert.deepEqual(f.messages.map(item => item.level), ['warn', 'warn']);
});

test('invalid effective configuration is not misclassified as an expected disabled skip', async () => {
    const f = fixture();
    delete f.search.default.elastic;
    assert.equal(f.config.isSearchExplicitlyDisabled('catalog', 'default'), false);
    await f.models.prepareTenantSearchModels('catalog', 'default');
    await f.models.updateModuleIndexesSchema('catalog', ['default']);
    assert.deepEqual(f.messages.map(item => item.level), ['warn', 'warn']);
});

test('selected connection failure remains a rejected owner operation', async () => {
    const f = fixture(true), failure = new Error('provider unavailable');
    f.search.default.options.connectionHandler = 'SelectedSearchConnection';
    SERVICE.SelectedSearchConnection = { createSearchConnection: async () => { throw failure; } };
    await assert.rejects(f.connection.createModuleSearchEngines('catalog', 'default'), error => error === failure);
    assert.equal(f.messages.some(item => item.message.startsWith('Search is not enabled')), false);
});

test('selected missing connection handler still rejects', async () => {
    const f = fixture(true);
    await assert.rejects(f.connection.createModuleSearchEngines('catalog', 'default'), /Invalid connection handler/);
    assert.equal(f.messages.some(item => item.message.startsWith('Search is not enabled')), false);
});

test('selected model preparation and index update failures are not disabled skips', async () => {
    const f = fixture(true), failure = new Error('index provider unavailable');
    f.config.searchEngines.catalog = { default: { getOptions: () => ({ enabled: true, engine: 'elastic' }) } };
    f.models.prepareTypeSearchModels = async () => { throw failure; };
    f.models.updateIndexTypeSchema = async () => { throw failure; };
    await assert.rejects(f.models.prepareTenantSearchModels('catalog', 'default'), error => error === failure);
    await assert.rejects(f.models.updateModuleIndexesSchema('catalog', ['default']), error => error === failure);
    assert.equal(f.messages.some(item => item.message.startsWith('Search is not enabled')), false);
});
