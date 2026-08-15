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

test('Tax exposes only internal operational publication restoration', () => {
    const route = routers.tax.operator.restoreOperational;
    assert.equal(route.key, '/internal/tax/publication/operational/restore');
    assert.equal(route.apiExposure, 'commercePublicationIngestion');
    assert.equal(route.secured, true);
});

test('Tax operational restoration saves tenant-bound active policies', async () => {
    const saves = [];
    global.SERVICE = {
        DefaultTaxPolicyService: { save: async request => { saves.push(request); return { result: request.model }; } }
    };
    const result = await service.restoreOperational({ tenant: 'default', authData: { tenant: 'default' } }, {
        taxPolicies: [{ code: 'vat', tenant: 'default', jurisdiction: 'AE', taxCode: 'VAT', rate: '0.05', status: 'ACTIVE', revision: 1 }]
    });
    assert.equal(result.restored, 1);
    assert.equal(saves[0].model.active, true);
});
