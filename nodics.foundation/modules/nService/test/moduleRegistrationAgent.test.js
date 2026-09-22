/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nService/test/moduleRegistrationAgent
 * @description Validates non-blocking lifecycle registration, all-active-module batching, service-token use, adaptive retry, and graceful deregistration.
 * @layer test
 * @owner nService
 * @override Project registration agents must preserve startup isolation and service identity boundaries.
 */
const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');

let contributor;
let requests = [];
let fixtureModuleRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'nodics-registration-agent-'));
fs.mkdirSync(path.join(fixtureModuleRoot, 'data'), { recursive: true });
fs.writeFileSync(path.join(fixtureModuleRoot, 'data', 'manifest.json'), JSON.stringify({
    contractVersion: 2,
    module: 'cms',
    sections: {
        'core-reference': {
            kind: 'DATA_RELEASE',
            dataType: 'core',
            sourceRoot: 'core-v001',
            lifecycle: 'REFERENCE',
            initialPublicationPolicy: 'NONE'
        },
        'sample-demo': {
            kind: 'DATA_RELEASE',
            dataType: 'sample',
            sourceRoot: 'sample-v001',
            lifecycle: 'SAMPLE',
            initialPublicationPolicy: 'NONE'
        }
    }
}), 'utf8');
global.CONFIG = { get: key => ({
    backofficeRegistration: { enabled: true, moduleName: 'backoffice', heartbeatIntervalMs: 10000,
        retryIntervalMs: 5000, operationalStateTtlMs: 30000, maxModulesPerRegistration: 512, requestTimeoutMs: 20,
        connectionName: 'default' },
    backofficeCapabilities: { cms: { enabled: true, capabilityId: 'content-management', contractVersion: 0,
        minimumClientContractVersion: 0, requiredPermissions: ['cms.backoffice.view'] } },
    runtimeRole: { code: 'WCMS_STAGED', publication: 'STAGED' },
    defaultTenant: 'default'
}[key]) };
global.NODICS = {
    getActiveModules: () => ['cms', 'utility', 'remoteProfile'],
    getRawModule: name => ({ parent: 'nodics.wcms', canonicalIdentity: 'nodics.wcms/modules/' + name,
        path: name === 'cms' ? fixtureModuleRoot : undefined,
        rawSchema: name === 'cms' ? {
            cmsPage: { model: true, service: { enabled: true }, authorityContext: 'wcms.content' },
            cmsHelper: { model: false, service: { enabled: false } }
        } : {},
        metaData: { version: '0.0.0', prefix: name === 'cms' ? 'content' : undefined, nodics: Object.assign({
            runtime: { router: name === 'cms' }, owns: ['router']
        }, name === 'cms' ? { displayName: 'Content Management' } : {}) } }),
    getEnvironmentName: () => 'envs', getSelectedEnvironmentName: () => 'local', getServerName: () => 'cmsServer', getNodeName: () => null,
    getInternalAuthToken: () => 'service-token'
};
let refreshedRuntimeTokens = 0;
global.SERVICE = {
    DefaultInternalAuthenticationProviderService: {
        buildRuntimeIdentityHeaders: () => ({ 'x-nodics-runtime-instance': 'cms-instance' }),
        refreshInternalAuthTokens: async () => { refreshedRuntimeTokens++; return ['default']; }
    },
    DefaultRuntimeLifecycleService: { registerContributor: (name, value) => { contributor = value; } },
    DefaultRouterService: {
        prepareUrl: options => 'http://localhost:3040/nodics/' + options.moduleName,
        getModuleServerConfig: moduleName => ({ getOptions: () => ({ remoteOnly: moduleName === 'remoteProfile' }) })
    },
    DefaultModuleService: {
        buildRequest: options => options,
        fetch: request => { requests.push(request); return Promise.resolve({ data: { operationalState: { instanceId: 'cms-instance', projectCode: 'envs', expiresAt: Date.now() + 30000, modules: ['cms', 'utility'].map(moduleName => ({ moduleName, enabled: true })) } } }); }
    }
};

const definition = require('../src/service/module/defaultModuleRegistrationAgentService');
const service = Object.assign({}, definition, {
    _timer: null, _running: false, _registered: [],
    _backofficeCapabilityProviders: new Map(),
    _metrics: { attempts: 0, successes: 0, failures: 0, deregistrations: 0, lastSuccessAt: null, lastFailureAt: null },
    LOG: { warn: function () {} }
});

async function run() {
    await service.init();
    assert(contributor, 'registration agent must use the central lifecycle');
    assert.strictEqual(contributor.ready(), true, 'ready hook must not await BackOffice network traffic');
    await new Promise(resolve => setTimeout(resolve, 5));
    assert.strictEqual(requests.length, 1, 'one bounded runtime batch should register active locally hosted modules');
    assert.strictEqual(requests[0].connectionName, 'default',
        'registration agent must honor an explicit BackOffice connection without creating a duplicate server alias');
    assert.strictEqual(requests[0].header.Authorization, 'Bearer service-token');
    assert(requests[0].header['Idempotency-Key']);
    assert.deepStrictEqual(requests[0].requestBody.runtimeRole,
        { code: 'WCMS_STAGED', publication: 'STAGED' });
    assert.deepStrictEqual(requests[0].requestBody.registrations.map(item => item.moduleName), ['cms', 'utility']);
    assert.deepStrictEqual(service._registered, ['cms', 'utility'],
        'remote-only dependencies must not renew local leases or advertise foreign authority claims');
    const remoteConfiguration = SERVICE.DefaultRouterService.getModuleServerConfig;
    SERVICE.DefaultRouterService.getModuleServerConfig = () => ({ getOptions: () => ({ remoteOnly: false }) });
    assert.deepStrictEqual(service.getLocalModules(), ['cms', 'utility', 'remoteProfile'],
        'a later-layer topology override making a module local must make it eligible for registration');
    SERVICE.DefaultRouterService.getModuleServerConfig = remoteConfiguration;
    assert.strictEqual(requests[0].requestBody.registrations[0].clientCallable, true);
    assert.strictEqual(requests[0].requestBody.registrations[0].displayName, 'Content Management');
    assert.strictEqual(requests[0].requestBody.registrations[0].parentModule, 'nodics.wcms');
    assert.strictEqual(requests[0].requestBody.registrations[0].canonicalIdentity, 'nodics.wcms/modules/cms');
    assert.strictEqual(requests[0].requestBody.registrations[0].backoffice, undefined,
        'legacy configuration must not synthesize BackOffice navigation without a module-owned provider');
    assert.deepStrictEqual(requests[0].requestBody.registrations[0].activationDataPackages.map(item => item.code),
        ['cms:core-reference', 'cms:sample-demo']);
    assert.strictEqual(requests[0].requestBody.registrations[0].activationDataPackages[0].trigger, 'ACTIVATION');
    assert.strictEqual(requests[0].requestBody.registrations[0].activationDataPackages[1].trigger, 'USER');
    assert.deepStrictEqual(requests[0].requestBody.registrations[0].authorityClaims, [{
        kind: 'schema',
        moduleName: 'cms',
        claimName: 'cmsPage',
        authorityContext: 'wcms.content'
    }, {
        kind: 'service',
        moduleName: 'cms',
        claimName: 'cmsPage',
        authorityContext: 'wcms.content'
    }]);
    assert.strictEqual(requests[0].requestBody.registrations[0].endpoint, 'http://localhost:3040/nodics/content',
        'client-callable registration endpoint must follow the router prefix when a module declares one');
    let provider = { getCapability: () => ({ enabled: true, capabilityId: 'service-owned-content',
        displayName: 'Service-owned content', category: 'content', icon: 'content', contractVersion: 0,
        minimumClientContractVersion: 0, roles: ['FUNCTIONAL_CAPABILITY_PROVIDER'] }) };
    assert.strictEqual(service.registerBackofficeCapabilityProvider('cms', provider), true);
    assert.strictEqual(service.buildRegistration('cms').backoffice.capabilityId, 'service-owned-content',
        'concrete module service must take precedence over legacy capability configuration');
    assert.throws(() => service.registerBackofficeCapabilityProvider('cms', { getCapability: () => ({}) }),
        /Duplicate BackOffice capability provider/);
    CONFIG.get = key => ({ backofficeRegistration: { enabled: true, moduleName: 'backoffice',
        heartbeatIntervalMs: 10000, retryIntervalMs: 5000, operationalStateTtlMs: 30000, maxModulesPerRegistration: 512 }, backofficeCapabilities: {
        cms: { enabled: false, capabilityId: 'environment-disabled' }
    }, defaultTenant: 'default' }[key]);
    assert.strictEqual(service.buildRegistration('cms').backoffice, undefined,
        'later layered configuration must be able to disable module BackOffice exposure');
    assert.strictEqual(requests[0].requestBody.registrations[1].clientCallable, false);
    assert.strictEqual(requests[0].requestBody.registrations[1].endpoint, undefined);
    assert.strictEqual(requests[0].requestBody.registrations[1].displayName, 'utility',
        'modules without UI display metadata must still produce valid bounded registration names');
    await contributor.drain();
    assert.strictEqual(requests.length, 2, 'drain should attempt one instance-wide deregistration');
    assert.strictEqual(service._timer, null);

    NODICS.getInternalAuthToken = () => undefined;
    assert.strictEqual(await service.runRegistration(), false, 'missing service identity must not fail runtime startup');

    let staleAttempts = 0;
    let currentToken = 'stale-token';
    refreshedRuntimeTokens = 0;
    NODICS.getInternalAuthToken = () => currentToken;
    SERVICE.DefaultInternalAuthenticationProviderService.refreshInternalAuthTokens = async () => {
        refreshedRuntimeTokens++;
        currentToken = 'fresh-token';
        return ['default'];
    };
    SERVICE.DefaultModuleService.fetch = request => {
        staleAttempts++;
        if (request.header.Authorization === 'Bearer stale-token') {
            const error = new Error('Authentication token security stamp is stale');
            error.code = 'ERR_AUTH_00001';
            return Promise.reject(error);
        }
        return Promise.resolve({ data: { operationalState: { instanceId: 'cms-instance', projectCode: 'envs', expiresAt: Date.now() + 30000, modules: ['cms', 'utility'].map(moduleName => ({ moduleName, enabled: true })) } } });
    };
    assert.strictEqual(await service.runRegistration(), true,
        'registration must refresh stale runtime credentials and retry once');
    assert.strictEqual(refreshedRuntimeTokens, 1,
        'stale-token recovery must use the internal token owner instead of bypassing authorization');
    assert.strictEqual(staleAttempts, 2,
        'stale-token recovery must retry the same bounded registration cycle exactly once');

    // A BackOffice restart temporarily rejects registration. The same runtime
    // must recover on its configured retry loop without restarting itself.
    NODICS.getInternalAuthToken = () => 'service-token';
    let recoveryAttempts = 0;
    CONFIG.get = key => ({ backofficeRegistration: { enabled: true, moduleName: 'backoffice',
        heartbeatIntervalMs: 20, retryIntervalMs: 5, operationalStateTtlMs: 30000, maxModulesPerRegistration: 512,
        requestTimeoutMs: 20, connectionName: 'default' }, backofficeCapabilities: {},
        runtimeRole: { code: 'WCMS_STAGED', publication: 'STAGED' }, defaultTenant: 'default' }[key]);
    SERVICE.DefaultModuleService.fetch = () => {
        recoveryAttempts++;
        return recoveryAttempts === 1 ? Promise.reject(new Error('BackOffice restarting')) : Promise.resolve({ data: { operationalState: { instanceId: 'cms-instance', projectCode: 'envs', expiresAt: Date.now() + 30000, modules: ['cms', 'utility'].map(moduleName => ({ moduleName, enabled: true })) } } });
    };
    const recovering = Object.assign({}, definition, {
        _timer: null, _running: false, _registered: [], _backofficeCapabilityProviders: new Map(),
        _metrics: { attempts: 0, successes: 0, failures: 0, deregistrations: 0, lastSuccessAt: null, lastFailureAt: null },
        LOG: { warn: function () {} }
    });
    assert.strictEqual(recovering.start(), true);
    await new Promise(resolve => setTimeout(resolve, 16));
    await recovering.stop(false);
    assert(recoveryAttempts >= 2, 'registration must retry after BackOffice becomes available again');
    assert(recovering._metrics.failures >= 1, 'the unavailable BackOffice attempt must remain observable');
    assert(recovering._metrics.successes >= 1, 'the next retry must recover registration without a runtime restart');
    console.log('Module registration agent validated');
}

run().catch(error => { console.error(error); process.exit(1); });
