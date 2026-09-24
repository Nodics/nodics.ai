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
const definition = require('../src/service/publication/defaultCmsPublicationModuleTransportService');

/**
 * @module cms/test/cmsPublicationModuleTransportInternalAuth
 * @description Verifies CMS publication target transport retries stale runtime tokens through the internal auth provider.
 * @layer test
 * @owner cms
 */

function installGlobals() {
    global.CONFIG = { get: key => key === 'cms' ? { publication: { runtimeRole: 'STAGED',
        target: { moduleName: 'cms', connectionName: 'wcmsOnline', runtimeRole: 'WCMS_ONLINE' } } } : undefined };
    global.CLASSES = { NodicsError: class NodicsError extends Error {
        constructor(code, message) { super(message); this.code = code; }
    } };
}

test('CMS publication transport refreshes stale internal auth once before retrying target call', async () => {
    installGlobals();
    let token = 'stale-token';
    let refreshes = 0;
    let calls = [];
    global.NODICS = { getInternalAuthToken: () => token };
    global.SERVICE = {
        DefaultInternalAuthenticationProviderService: {
            refreshInternalAuthTokens: async tenant => {
                assert.equal(tenant, 'default');
                refreshes++;
                token = 'fresh-token';
            }
        },
        DefaultModuleService: {
            invokeModule: async request => {
                calls.push(request);
                if (request.header.Authorization === 'Bearer stale-token') {
                    let error = new Error('Authentication token security stamp is stale');
                    error.code = 'ERR_AUTH_00001';
                    throw error;
                }
                return { status: 'CONSISTENT', repaired: false };
            }
        }
    };
    let service = Object.assign({}, definition);
    let result = await service.reconcile({ manifestCode: 'm1', operationKey: 'pub:1' },
        { tenant: 'default', correlationId: 'corr-1' });
    assert.deepEqual(result, { status: 'CONSISTENT', repaired: false });
    assert.equal(refreshes, 1);
    assert.equal(calls.length, 2);
    assert.equal(calls[0].header.Authorization, 'Bearer stale-token');
    assert.equal(calls[1].header.Authorization, 'Bearer fresh-token');
});

test('CMS publication transport does not retry non-auth target failures', async () => {
    installGlobals();
    let refreshes = 0;
    let calls = 0;
    global.NODICS = { getInternalAuthToken: () => 'service-token' };
    global.SERVICE = {
        DefaultInternalAuthenticationProviderService: { refreshInternalAuthTokens: async () => { refreshes++; } },
        DefaultModuleService: {
            invokeModule: async () => {
                calls++;
                let error = new Error('target unavailable');
                error.code = 'CMS_TARGET_DOWN';
                throw error;
            }
        }
    };
    let service = Object.assign({}, definition);
    await assert.rejects(() => service.getStatus({ manifestCode: 'm1' }, { tenant: 'default' }), /target unavailable/);
    assert.equal(refreshes, 0);
    assert.equal(calls, 1);
});
