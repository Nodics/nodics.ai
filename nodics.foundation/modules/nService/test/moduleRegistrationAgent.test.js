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

let contributor;
let requests = [];
global.CONFIG = { get: key => ({
    backofficeRegistration: { enabled: true, moduleName: 'backoffice', heartbeatIntervalMs: 10000,
        retryIntervalMs: 5000, maxModulesPerRegistration: 512, requestTimeoutMs: 20,
        connectionName: 'default' },
    backofficeCapabilities: { cms: { enabled: true, capabilityId: 'content-management', contractVersion: 0,
        minimumClientContractVersion: 0, requiredPermissions: ['cms.backoffice.view'] } },
    runtimeRole: { code: 'WCMS_STAGED', publication: 'STAGED' },
    defaultTenant: 'default'
}[key]) };
global.NODICS = {
    getActiveModules: () => ['cms', 'utility'],
    getRawModule: name => ({ parent: 'nodics.wcms', canonicalIdentity: 'nodics.wcms/modules/' + name,
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
global.SERVICE = {
    DefaultRuntimeLifecycleService: { registerContributor: (name, value) => { contributor = value; } },
    DefaultRouterService: { prepareUrl: options => 'http://localhost:3040/nodics/' + options.moduleName },
    DefaultModuleService: {
        buildRequest: options => options,
        fetch: request => { requests.push(request); return Promise.resolve({}); }
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
    assert.strictEqual(requests.length, 1, 'one bounded runtime batch should register all active modules');
    assert.strictEqual(requests[0].connectionName, 'default',
        'registration agent must honor an explicit BackOffice connection without creating a duplicate server alias');
    assert.strictEqual(requests[0].header.Authorization, 'Bearer service-token');
    assert(requests[0].header['Idempotency-Key']);
    assert.deepStrictEqual(requests[0].requestBody.runtimeRole,
        { code: 'WCMS_STAGED', publication: 'STAGED' });
    assert.deepStrictEqual(requests[0].requestBody.registrations.map(item => item.moduleName), ['cms', 'utility']);
    assert.strictEqual(requests[0].requestBody.registrations[0].clientCallable, true);
    assert.strictEqual(requests[0].requestBody.registrations[0].displayName, 'Content Management');
    assert.strictEqual(requests[0].requestBody.registrations[0].parentModule, 'nodics.wcms');
    assert.strictEqual(requests[0].requestBody.registrations[0].canonicalIdentity, 'nodics.wcms/modules/cms');
    assert.strictEqual(requests[0].requestBody.registrations[0].backoffice.capabilityId, 'content-management');
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
        heartbeatIntervalMs: 10000, retryIntervalMs: 5000, maxModulesPerRegistration: 512 }, backofficeCapabilities: {
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
    console.log('Module registration agent validated');
}

run().catch(error => { console.error(error); process.exit(1); });
