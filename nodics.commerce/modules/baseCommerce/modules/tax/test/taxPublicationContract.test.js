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
const routers = require('../src/router/routers');
const service = require('../src/service/defaultTaxPublicationService');

/** @module tax/test/taxPublicationContract @description Keeps the secured legacy transport fail-closed until nPublish qualification. @layer test @owner tax */
test('Tax legacy transport remains secured and rejects before writes', async () => {
    const route = routers.tax.operator.restoreOperational;
    assert.equal(route.apiExposure, 'commercePublicationIngestion');
    assert.equal(route.secured, true);
    global.CLASSES = { NodicsError: class extends Error { constructor(code, message) { super(message); this.code = code; } } };
    global.SERVICE = new Proxy({}, { get() { assert.fail('Unqualified transport must not access persistence'); } });
    await assert.rejects(service.restoreOperational({ tenant: 'default', enterpriseCode: 'enterprise-a' }, {}),
        error => error.code === 'ERR_PUB_00006');
});
