/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/**
 * @module nSearch/search/test/searchModelRegistrationContract
 * @description Verifies search model registration applies operation contributors without executing helper utilities.
 * @layer test
 * @owner nSearch
 */

const assert = require('node:assert/strict');

const service = require('../src/service/model/defaultSearchModelHandlerService');

let helperCalled = false;
let contributorCalled = false;
const model = {};

service.registerSearchModels({
    invokeClient: function () { helperCalled = true; },
    defineDefaultDoSearch: function (searchModel) {
        contributorCalled = true;
        searchModel.doSearch = function () { return true; };
    }
}, model);

assert.equal(helperCalled, false);
assert.equal(contributorCalled, true);
assert.equal(typeof model.doSearch, 'function');

console.log('Search model registration contract passed');
