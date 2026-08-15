/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

const assert = require('node:assert/strict');
const runtime = require('../src/service/defaultDiscoveryRuntimeService');

/** @module discoveryRuntime/test/discoveryRuntimeContract @description Verifies generic Discovery runtime nSearch delegation. @layer test @owner discoveryRuntime */

let requestSeen;
global.SERVICE = {
    DefaultDiscoveryConfigurationResolverService: { resolveIndexConfiguration: async () => ({ indexName: 'genericindex' }) },
    DefaultDiscoveryDocumentProjectionService: { doSearch: async request => { requestSeen = request; return { result: [{ code: 'doc1' }] }; } }
};

runtime.search({ tenant: 'default', ownerType: 'PRODUCT', query: { tenant: 'default' } }).then(records => {
    assert.equal(records[0].code, 'doc1');
    assert.equal(requestSeen.indexName, 'genericindex');
    console.log('Discovery runtime contract validated');
});
