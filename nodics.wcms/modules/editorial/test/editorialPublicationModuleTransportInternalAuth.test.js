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
const definition = require('../src/service/defaultEditorialPublicationModuleTransportService');

/**
 * @module editorial/test/editorialPublicationModuleTransportInternalAuth
 * @description Verifies Editorial publication target transport refreshes stale runtime identity without weakening target authorization.
 * @layer test
 * @owner editorial
 */

function installGlobals() {
    global.CONFIG = { get: key => key === 'editorial' ? { publication: { runtimeRole: 'STAGED',
        target: { moduleName: 'editorial', connectionName: 'wcmsOnline', runtimeRole: 'WCMS_ONLINE' } } } : undefined };
    global.CLASSES = { NodicsError: class NodicsError extends Error {
        constructor(code, message) { super(message); this.code = code; }
    } };
}

test('Editorial publication transport refreshes stale internal auth once before retrying target call', async () => {
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
                return { status: 'PUBLISHED' };
            }
        }
    };
    let service = Object.assign({}, definition);
    let result = await service.status({ articleCode: 'article-1', operationKey: 'article-1:status' },
        { tenant: 'default', requestId: 'req-1' });
    assert.deepEqual(result, { status: 'PUBLISHED' });
    assert.equal(refreshes, 1);
    assert.equal(calls.length, 2);
    assert.equal(calls[0].header.Authorization, 'Bearer stale-token');
    assert.equal(calls[1].header.Authorization, 'Bearer fresh-token');
});
