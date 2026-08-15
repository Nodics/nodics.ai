/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

const assert = require('node:assert/strict');
const builder = require('../src/service/defaultDiscoveryQueryBuilderService');

/** @module discoveryQuery/test/discoveryQueryContract @description Verifies generic Discovery query building. @layer test @owner discoveryQuery */

global.CONFIG = { get: key => key === 'discovery' ? { query: { defaultPageSize: 10, maximumPageSize: 20 } } : undefined };
let options = builder.options({ query: { pageSize: '99', page: '2', sort: 'name-asc' } }, { sorts: [{ code: 'name-asc', sort: { name: 1 } }] });
assert.equal(options.pageSize, 20);
assert.equal(options.pageNumber, 2);
assert.deepEqual(options.sort, { name: 1 });
assert.deepEqual(builder.query({ query: { q: ' dress ' } }, { tenant: 'default' }), { tenant: 'default', text: 'dress' });

console.log('Discovery query contract validated');
