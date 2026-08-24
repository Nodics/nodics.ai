/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nService/test/moduleInvocationContract
 * @description Verifies the shared local-versus-remote module invocation
 * contract used by split-runtime services.
 * @layer test
 * @owner nService
 */

const assert = require('assert');

class NodicsError extends Error {
    constructor(code, message) {
        super(message || String(code));
        this.code = code;
    }
}

let activeModules = ['inventory'];
let availableEndpoints = ['profile'];
let capturedRequest;
let fetchedRequest;
let registryOwners = [];

global.CLASSES = {
    NodicsError: NodicsError
};
global.CONFIG = {
	    get: key => {
	        if (key === 'defaultContentType') return 'application/json';
	        if (key === 'defaultTenant') return 'default';
	        if (key === 'runtimeRole') return { code: 'INVENTORY', publication: 'OPERATIONAL' };
	        if (key === 'serviceCommunication') return {
	            timeoutMs: 1000,
	            connectionPool: {},
	            retry: { maxAttempts: 1 },
	            circuitBreaker: { enabled: false }
	        };
	        return undefined;
	    }
	};
global.NODICS = {
    isModuleActive: moduleName => activeModules.includes(moduleName),
    getInternalAuthToken: tenant => tenant === 'default' ? 'service-token' : undefined
};
global.UTILS = {
    isBlank: value => !value || Object.keys(value).length === 0
};
global.SERVICE = {
    DefaultInventoryService: {
        reserve: request => Promise.resolve({ mode: 'local', sku: request.sku })
    },
    DefaultModulesConfigurationService: {
        isAvailableModuleConfig: moduleName => availableEndpoints.includes(moduleName)
    },
    DefaultRouterService: {
        prepareUrl: options => {
            capturedRequest = options;
            return 'http://remote.test/nodics/' + options.moduleName;
        }
    },
    DefaultRuntimeRegistryResolverService: {
        resolveOwner: options => Promise.resolve(registryOwners.find(owner => owner.moduleName === options.moduleName))
    }
};

const definition = require('../src/service/module/defaultModuleService');
const service = Object.assign({}, definition, {
    LOG: { debug: function () {} },
    fetch: request => {
        fetchedRequest = request;
        return Promise.resolve({ result: [{ code: 'ENT' }] });
    }
});

(async function () {
    let local = await service.invokeModule({
        moduleName: 'inventory',
        serviceName: 'DefaultInventoryService',
        operationName: 'reserve',
        request: { sku: 'SKU-1' }
    });
    assert.deepStrictEqual(local, { mode: 'local', sku: 'SKU-1' });
    assert.strictEqual(fetchedRequest, undefined, 'Active modules must use local service when available');
    assert.strictEqual(service.getTransportDiagnostics().moduleInvocation.local, 1);

	    await assert.rejects(() => service.invokeModule({
	        moduleName: 'inventory',
	        serviceName: 'DefaultMissingInventoryService',
	        operationName: 'reserve',
	        request: {}
	    }), /Local module service is not available/);

	    availableEndpoints = ['inventoryOnline'];
	    let authorityRemote = await service.invokeModule({
	        moduleName: 'inventory',
	        connectionName: 'inventoryOnline',
	        targetAuthority: { runtimeRole: 'INVENTORY_ONLINE' },
	        serviceName: 'DefaultInventoryService',
	        operationName: 'reserve',
	        apiName: '/inventory/reservations',
	        request: { tenant: 'default', sku: 'SKU-2' },
	        responseSelector: response => response.result[0]
	    });
	    assert.deepStrictEqual(authorityRemote, { code: 'ENT' });
	    assert.strictEqual(capturedRequest.connectionName, 'inventoryOnline');
	    assert.strictEqual(capturedRequest.targetAuthority.runtimeRole, 'INVENTORY_ONLINE');
	    assert.strictEqual(fetchedRequest.uri, 'http://remote.test/nodics/inventory/v0/inventory/reservations');
	    assert.strictEqual(service.getTransportDiagnostics().moduleInvocation.staticFallback, 1);

	    availableEndpoints = ['profile'];
	    let remote = await service.invokeModule({
        moduleName: 'profile',
        serviceName: 'DefaultEnterpriseService',
        operationName: 'get',
        apiName: '/enterprise',
        request: { tenant: 'default', query: { code: 'ENT' } },
        responseSelector: response => response.result[0]
    });
    assert.deepStrictEqual(remote, { code: 'ENT' });
    assert.strictEqual(capturedRequest.moduleName, 'profile');
    assert.strictEqual(capturedRequest.apiName, '/enterprise');
    assert.strictEqual(capturedRequest.methodName, 'POST');
    assert.strictEqual(fetchedRequest.headers.Authorization, 'Bearer service-token');
    assert.strictEqual(fetchedRequest.uri, 'http://remote.test/nodics/profile/v0/enterprise');

    availableEndpoints = [];
    await assert.rejects(() => service.invokeModule({
        moduleName: 'checkout',
        apiName: '/cart',
        request: { tenant: 'default' }
    }), /Remote module endpoint is unavailable/);

    registryOwners = [{
        moduleName: 'checkout',
        instanceId: 'checkout-online-1',
        endpoint: 'http://registry.test/nodics/checkout',
        runtimeRole: { code: 'CHECKOUT_ONLINE' },
        state: 'UP'
    }];
    let registryRemote = await service.invokeModule({
        moduleName: 'checkout',
        targetAuthority: { runtimeRole: 'CHECKOUT_ONLINE' },
        apiName: '/cart',
        methodName: 'GET',
        request: { tenant: 'default' },
        responseSelector: response => response.result[0]
    });
    assert.deepStrictEqual(registryRemote, { code: 'ENT' });
    assert.strictEqual(fetchedRequest.uri, 'http://registry.test/nodics/checkout/v0/cart');
    assert.strictEqual(fetchedRequest.nodicsContext.layer, 'runtime-registry');
    assert.strictEqual(fetchedRequest.nodicsContext.instanceId, 'checkout-online-1');
    assert.strictEqual(service.getTransportDiagnostics().moduleInvocation.runtimeRegistry, 1);
    assert.strictEqual(service.getTransportDiagnostics().moduleInvocation.lastResolution.source, 'runtimeRegistry');

    registryOwners = [];
    availableEndpoints = ['publicCatalog'];
    activeModules = [];
    NODICS.getInternalAuthToken = () => undefined;
    await service.invokeModule({
        moduleName: 'publicCatalog',
        apiName: '/health',
        methodName: 'GET',
        request: {},
        requireInternalAuth: false
    });
    assert.strictEqual(fetchedRequest.headers.Authorization, undefined,
        'Explicit unauthenticated remote calls must not invent service credentials');

    console.log('Module invocation local/remote contract validated');
})().catch(error => {
    console.error(error);
    process.exit(1);
});
