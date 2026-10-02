/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module search/test/searchSchemaLoaderBindingContract
 * @description Verifies receiver-bound schema loading and disabled-provider diagnostics without provider operations.
 * @layer test
 * @owner nSearch
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const implementation = require('../src/service/schema/defaultSearchSchemaHandlerService');

test('module schema loading keeps the receiver and disabled-engine branch logs safely', () => {
    const schema = { search: { enabled: true }, definition: {} };
    global.NODICS = {
        getModule: () => ({ rawSchema: { example: schema } }),
        getModules: () => ({ exampleModule: {} })
    };
    global.CLASSES = { SearchError: Error };
    global.SERVICE = {
        DefaultSearchConfigurationService: { getTenantSearchEngine: () => ({ getOptions: () => ({ enabled: false }) }) }
    };
    const calls = [], errors = [];
    const owner = { ...implementation, LOG: { debug() {}, error: (message) => errors.push(message) } };
    owner.prepareFromSchema = function (...args) {
        assert.equal(this, owner);
        calls.push(args);
        return implementation.prepareFromSchema.apply(this, args);
    };
    owner.loadSearchSchemaFromSchema(['default']);
    assert.deepEqual(calls, [['exampleModule', 'example', 'default']]);
    assert.equal(errors.length, 1);
    assert.match(errors[0], /Invalid connection handler/);
});
