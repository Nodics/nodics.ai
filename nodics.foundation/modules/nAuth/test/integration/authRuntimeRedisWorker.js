/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module nAuth/test/integration/authRuntimeRedisWorker @description Runs actual JWT, cache, revocation and operational-admission owners in an isolated process with an independent Redis client. @layer test @owner nAuth */
const { performance } = require('node:perf_hooks');
const { createClient } = require('redis');
let client, channel, token, settings;
class ContractError extends Error {
    constructor(error, message) { super(message || error && error.message || String(error)); this.code = typeof error === 'string' ? error : error && error.code; }
}
/** Composes production service definitions against an explicit disposable cache namespace. */
async function initialize(input) {
    settings = input;
    client = createClient({ url: input.url, disableOfflineQueue: true, socket: { reconnectStrategy: false } });
    client.on('error', () => {});
    await client.connect();
    const authSecurity = structuredClone(require('../../config/properties').authSecurity);
    authSecurity.jwt.secret = input.secret;
    global.CONFIG = { get: key => ({ authSecurity, runtimeIdentity: { instanceCode: input.instance }, profileModuleName: 'profile' })[key] };
    global.CLASSES = { CacheError: ContractError, NodicsError: ContractError };
    const redisDefinition = require('../../../nCache/cache/config/properties').cache.default.engines.redis;
    channel = { channelName: 'auth', channelOptions: { ttl: 30 }, engineOptions: { ...redisDefinition, enabled: true, options: { prefix: input.prefix } }, client };
    global.NODICS = {
        getEnvironmentName: () => 'runtime.test', getSelectedEnvironmentName: () => 'test', getServerName: () => 'worker',
        getInternalAuthToken: () => token
    };
    global.SERVICE = {
        DefaultCacheConfigurationService: require('../../../nCache/cache/src/service/config/defaultCacheConfigurationService'),
        DefaultCacheService: require('../../../nCache/cache/src/service/cache/defaultCacheService'),
        DefaultCacheEngineService: { getCacheEngine: () => channel },
        DefaultRedisCacheService: { ...require('../../../nCache/redisCache/src/service/cache/defaultRedisCacheService'), LOG: { debug() {} } },
        DefaultAuthenticationProviderService: { ...require('../../../nService/src/service/authentication/defaultAuthenticationProviderService'), ...require('../../src/service/authentication/defaultAuthenticationProviderService') },
        DefaultAuthSecurityService: require('../../src/service/security/defaultAuthSecurityService'),
        DefaultPrincipalSecurityStampService: require('../../src/service/identity/defaultPrincipalSecurityStampService'),
        DefaultServiceTokenService: require('../../src/service/identity/defaultServiceTokenService'),
        DefaultAuthorizationProviderService: require('../../../nService/src/service/authorization/defaultAuthorizationProviderService'),
        DefaultModuleRegistrationAgentService: { ...require('../../../nService/src/service/module/defaultModuleRegistrationAgentService'),
            getInstanceId: () => input.instance, getConfiguration: () => ({ operationalStateTtlMs: 1000 }) }
    };
    return true;
}
/** Executes only the explicit integration operations; token values remain on the private IPC channel. */
async function execute(action, input) {
    if (action === 'initialize') return initialize(input);
    if (action === 'issue') return SERVICE.DefaultServiceTokenService.issue(input);
    if (action === 'verify') { await SERVICE.DefaultAuthorizationProviderService.authorizeToken({ authToken: input.token }); return true; }
    if (action === 'revoke') return SERVICE.DefaultServiceTokenService.revoke(input.tenant, input.serviceId);
    if (action === 'revokeToken') return SERVICE.DefaultAuthenticationProviderService.revokeAccessToken(require('jsonwebtoken').decode(input.token));
    if (action === 'state') {
        SERVICE.DefaultModuleRegistrationAgentService.recordOperationalState({ operationalState: {
            instanceId: settings.instance, projectCode: 'runtime.test', expiresAt: Date.now() + 1000,
            modules: [{ moduleName: 'cronjob', enabled: input.enabled }]
        } }, ['cronjob']);
        return true;
    }
    if (action === 'admit') { token = input.token; await SERVICE.DefaultModuleRegistrationAgentService.assertModuleOperational(input.moduleName || 'cronjob', input.tenant); return true; }
    if (action === 'disconnect') { await client.quit(); return true; }
    if (action === 'reconnect') { await client.connect(); return true; }
    if (action === 'benchmark') {
        const reads = () => Object.values(SERVICE.DefaultCacheService.cacheMetrics.operations).filter(item => item.operation === 'get').reduce((sum, item) => sum + item.count, 0);
        const samples = [], beforeReads = reads(), beforeRss = process.memoryUsage().rss, started = performance.now(), cpu = process.cpuUsage();
        for (let index = 0; index < input.samples; index++) {
            const time = performance.now();
            await SERVICE.DefaultAuthorizationProviderService.authorizeToken({ authToken: input.token });
            samples.push(performance.now() - time);
        }
        samples.sort((a, b) => a - b);
        return { samples: samples.length, durationMs: performance.now() - started, p95Ms: samples[Math.ceil(samples.length * .95) - 1],
            p99Ms: samples[Math.ceil(samples.length * .99) - 1], cpuMicros: process.cpuUsage(cpu), rssBytes: process.memoryUsage().rss, rssDeltaBytes: process.memoryUsage().rss - beforeRss, cacheReads: reads() - beforeReads };
    }
    if (action === 'stop') { if (client.isOpen) await client.quit(); return true; }
    throw new Error('Unsupported integration operation');
}
process.on('message', async message => {
    try { const result = await execute(message.action, message.input); process.send({ id: message.id, result }); }
    catch (error) { process.send({ id: message.id, error: { code: error.code || error.name || 'AUTH_REJECTED', action: message.action, frames: String(error.stack || '').split('\n').slice(1, 5) } }); }
});
