/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nService/test/profileEnterpriseInvocationContract
 * @description Verifies Profile enterprise lookup uses the shared local/remote
 * module invocation boundary.
 * @layer test
 * @owner nService
 */

const assert = require('assert');

class NodicsError extends Error {
    constructor(code, message, fallbackCode) {
        if (code instanceof Error) {
            super(code.message);
            this.code = fallbackCode || code.code;
        } else {
            super(message || String(code));
            this.code = code;
        }
    }
}

let calls = [];
global.CLASSES = { NodicsError };
global.CONFIG = {
    get: key => ({
        profileModuleName: 'profile',
        defaultTenant: 'default'
    }[key])
};
global.SERVICE = {
    DefaultModuleService: {
        invokeModule: options => {
            calls.push(options);
            return Promise.resolve({
                success: true,
                result: [
                    { code: 'enterprise-a', tenant: { code: 'default', active: true } }
                ]
            });
        }
    }
};

const provider = require('../src/service/profile/defaultEnterpriseProviderService');
const handler = Object.assign({}, require('../src/service/enterprise/defaultEnterpriseHandlerService'), {
    LOG: { error: function () {} }
});

(async function () {
    let enterprise = await provider.loadEnterprise({ moduleName: 'checkout', entCode: 'enterprise-a' });
    assert.strictEqual(enterprise.code, 'enterprise-a');
    assert.strictEqual(calls[0].moduleName, 'profile');
    assert.strictEqual(calls[0].serviceName, 'DefaultEnterpriseService');
    assert.strictEqual(calls[0].operationName, 'get');
    assert.strictEqual(calls[0].apiName, '/enterprise');
    assert.deepStrictEqual(calls[0].request.query, { code: 'enterprise-a' });
    assert.deepStrictEqual(calls[0].requestBody.query, { code: 'enterprise-a' });

    let enterprises = await handler.fetchEnterprise();
    assert.strictEqual(enterprises.length, 1);
    assert.strictEqual(calls[1].moduleName, 'profile');
    assert.strictEqual(calls[1].serviceName, 'DefaultEnterpriseService');
    assert.strictEqual(calls[1].operationName, 'get');
    assert.strictEqual(calls[1].apiName, '/enterprise');
    assert.deepStrictEqual(calls[1].request, {
        tenant: 'default',
        options: { recursive: true }
    });
    assert.deepStrictEqual(calls[1].requestBody, {});
    assert.strictEqual(calls[1].header.recursive, true);

    console.log('Profile enterprise module invocation contract validated');
})().catch(error => {
    console.error(error);
    process.exit(1);
});
