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
    }[key]),
    getProperties: () => ({}),
    setProperties: function () {}
};
global._ = { merge: Object.assign };
global.SERVICE = {
    DefaultIdentityGovernanceService: {
        getSystemAuthData: () => ({
            isSystem: true,
            userGroups: ['serviceAccountUserGroup'],
            permissions: []
        })
    },
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
    assert.strictEqual(calls[0].apiName, '/enterprise/get');
    assert.deepStrictEqual(calls[0].request.authData, {
        isSystem: true,
        userGroups: ['serviceAccountUserGroup'],
        permissions: []
    });
    assert.deepStrictEqual(calls[0].request.query, { code: 'enterprise-a' });
    assert.deepStrictEqual(calls[0].requestBody.query, { code: 'enterprise-a' });

    let enterprises = await handler.fetchEnterprise();
    assert.strictEqual(enterprises.length, 1);
    assert.strictEqual(calls[1].moduleName, 'profile');
    assert.strictEqual(calls[1].serviceName, 'DefaultEnterpriseService');
    assert.strictEqual(calls[1].operationName, 'get');
    assert.strictEqual(calls[1].apiName, '/enterprise/get');
    assert.deepStrictEqual(calls[1].request, {
        tenant: 'default',
        options: { recursive: true }
    });
    assert.deepStrictEqual(calls[1].requestBody, {});
    assert.strictEqual(calls[1].header.recursive, true);

    let activeTenants = [];
    let bootstrapRequest;
    let issuedTokenRequest;
    global.NODICS = {
        addActiveEnterprise: function () {},
        removeActiveEnterprise: function () {},
        getActiveTenants: () => activeTenants,
        addActiveTenant: tenant => activeTenants.push(tenant),
        isModuleActive: () => true,
        getActiveModules: () => ['profile'],
        getModules: () => ({ profile: {} }),
        getSelectedEnvironmentName: () => 'local',
        getServerName: () => 'platformServer',
        getNodeName: () => 'default',
        addInternalAuthToken: function () {}
    };
    global.SERVICE.DefaultDatabaseConnectionHandlerService = {
        createDatabaseConnection: () => Promise.resolve(true)
    };
    global.SERVICE.DefaultDatabaseModelHandlerService = {
        buildModelsForTenant: () => Promise.resolve(true)
    };
    global.SERVICE.DefaultMandatoryIdentityBootstrapService = {
        prepareTenant: async request => { bootstrapRequest = request; }
    };
    global.SERVICE.DefaultInternalAuthenticationProviderService = {
        fetchInternalAuthToken: tenant => {
            issuedTokenRequest = { tenant };
            return Promise.resolve({ authToken: 'service-token' });
        }
    };
    handler.LOG.debug = function () {};
    await handler.buildEnterprise([{
        code: 'enterprise-b',
        active: true,
        tenant: { code: 'tenant-b', active: true, properties: {} }
    }]);
    assert.deepStrictEqual(bootstrapRequest, {
        tenant: 'tenant-b', modules: ['profile'], source: 'tenant-startup'
    });
    assert.strictEqual(issuedTokenRequest.tenant, 'tenant-b');

    console.log('Profile enterprise module invocation contract validated');
})().catch(error => {
    console.error(error);
    process.exit(1);
});
