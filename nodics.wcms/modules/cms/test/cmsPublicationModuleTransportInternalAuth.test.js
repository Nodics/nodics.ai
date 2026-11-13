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
        target: { moduleName: 'cms', connectionName: 'wcmsOnline', publication: 'ONLINE' } } } : key === 'runtimeRole' ? { code: 'RENAMED_CONTENT', publication: 'STAGED' } : undefined };
    global.CLASSES = { NodicsError: class NodicsError extends Error {
        constructor(code, message) { super(message); this.code = code; }
    } };
}

test('CMS publication transport refreshes stale internal auth once before retrying target call', async () => {
    installGlobals();
    let token = 'stale-token';
    let refreshes = 0;
    let calls = [];
    global.NODICS = { isModuleActive: name => name === 'cms', getInternalAuthToken: () => token };
    global.SERVICE = {
        DefaultInternalAuthenticationProviderService: {
            refreshInternalAuthTokens: async tenant => {
                assert.equal(tenant, 'default');
                refreshes++;
                token = 'fresh-token';
            }
        },
        DefaultModuleService: {
            ...require('../../../../nodics.foundation/modules/nService/src/service/module/defaultModuleService'),
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
    assert.deepEqual(calls[0].targetAuthority, { publication: 'ONLINE' });
    assert.equal(calls[0].local, false);
});

test('CMS publication transport does not retry non-auth target failures', async () => {
    installGlobals();
    let refreshes = 0;
    let calls = 0;
    global.NODICS = { isModuleActive: name => name === 'cms', getInternalAuthToken: () => 'service-token' };
    global.SERVICE = {
        DefaultInternalAuthenticationProviderService: { refreshInternalAuthTokens: async () => { refreshes++; } },
        DefaultModuleService: {
            ...require('../../../../nodics.foundation/modules/nService/src/service/module/defaultModuleService'),
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


test('transport rejects absent local ownership, wrong context and wrong target publication before dispatch', async () => {
    for (const fault of ['remote', 'unknown-context', 'wrong-target']) {
        installGlobals();
        const originalGet = CONFIG.get;
        global.CONFIG = { get: key => {
            if (fault === 'unknown-context' && key === 'runtimeRole') return { code: 'RENAMED_CONTENT' };
            const value = originalGet(key);
            if (fault === 'wrong-target' && key === 'cms') value.publication.target.publication = 'STAGED';
            return value;
        } };
        global.NODICS = { isModuleActive: () => fault !== 'remote', getInternalAuthToken: () => 'runtime-token' };
        global.SERVICE = { DefaultModuleService: {
            ...require('../../../../nodics.foundation/modules/nService/src/service/module/defaultModuleService'),
            invokeModule: async () => { assert.fail('Rejected ownership must not dispatch'); },
        } };
        await assert.rejects(definition.send('status', {}, { tenant: 'default' }));
    }
});
