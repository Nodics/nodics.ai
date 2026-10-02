/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/*
 * Nodics - Enterprise Micro-Services Management Framework
 * Copyright (c) 2026 Nodics. Governed by the root LICENSE.
 */

/**
 * @module nService/test/moduleTransportFailureClassification
 * @description Exercises real Nodics normalization and Axis outage/conflict projection with an isolated transport stub; no runtime endpoints or data writes.
 * @layer test
 * @owner nService
 */
const assert = require('assert');
const fs = require('fs');
const vm = require('vm');
const policy = {
    timeoutMs: 100,
    retry: { maxAttempts: 1, statuses: [], errorCodes: [] },
    circuitBreaker: { enabled: true, failureThreshold: 1, recoveryTimeoutMs: 1000 },
    connectionPool: {}
};
const statuses = require('../../../../nodics.platform/modules/backoffice/src/utils/statusDefinitions');
global.CONFIG = { get: key => key === 'defaultErrorCodes' ? { NodicsError: 'ERR_SYS_00000' } : undefined };
global.SERVICE = { DefaultStatusService: { get: code => statuses[code] || { code: '500', message: 'Internal error' } } };
global.UTILS = {
    isObject: value => value !== null && typeof value === 'object',
    extractFromError: require('../../nCommon/src/utils/utils').extractFromError
};
global.CLASSES = { NodicsError: require('../../nCommon/src/lib/nodicsError') };
const NodicsError = CLASSES.NodicsError;
let calls = 0;
let outcome;
const sandbox = {
    module: { exports: {} },
    require: name => name === 'node-fetch' ? async () => { calls++; return outcome(); } : require(name),
    CLASSES, CONFIG, SERVICE, URL, AbortController, setTimeout, clearTimeout,
    process, Buffer
};
vm.runInNewContext(fs.readFileSync(require.resolve('../src/service/module/defaultModuleService'), 'utf8'), sandbox);
const definition = sandbox.module.exports;
const service = Object.assign({}, definition, {
    LOG: { debug() {} },
    getTransportConfiguration: () => policy,
    buildFetchErrorContext: () => ({ layer: 'test' }),
    _agents: null, _circuits: null, _diagnostics: null
});
const axis = require('../../../../nodics.platform/modules/axis/src/service/defaultAxisInitializationService');
SERVICE.DefaultModuleService = service;
const request = { uri: 'http://127.0.0.1:1/isolated-stub', method: 'GET', headers: {}, json: true };

(async () => {
    let assertions = 0;
    const check = async (expectedCode, transportCode) => {
        await assert.rejects(service.fetch(request), error => {
            assert(error instanceof NodicsError);
            const projected = axis.targetDiagnostic(error, 'axis');
            assert.strictEqual(projected.code, expectedCode);
            assert.strictEqual(projected.responseCode, expectedCode === 'ERR_BOF_00083' ? '503' : '409');
            if (transportCode) {
                assert.strictEqual(error.metadata.transportFailure.code, transportCode);
                assert.strictEqual(projected.metadata.targetCode, transportCode);
                assert.strictEqual(projected.message, 'Axis initialization target is temporarily unavailable.');
                assert.strictEqual(projected.causes.length, 0);
            } else assert.strictEqual(error.metadata && error.metadata.transportFailure, undefined);
            assertions++;
            return true;
        });
        service._circuits.clear();
    };
    service.initializeTransport();
    service._circuits.set(new URL(request.uri).origin, { state: 'open', openedAt: Date.now(), failures: 1 });
    await check('ERR_BOF_00083', 'EOPENBREAKER');
    assert.strictEqual(calls, 0, 'Circuit rejection must not invoke the transport');
    for (const code of ['ECONNREFUSED', 'ECONNRESET', 'ETIMEDOUT', 'EAI_AGAIN']) {
        outcome = () => { throw Object.assign(new Error('Opaque unavailable detail'), { code }); };
        await check('ERR_BOF_00083', code);
    }
    for (const status of [502, 503, 504]) {
        outcome = () => ({ ok: false, status, json: async () => ({ code: 'ERR_SYS_00000', message: 'Opaque target detail' }) });
        await check('ERR_BOF_00083', 'REMOTE_HTTP_' + status);
    }
    for (const status of [400, 401, 403, 409, 500]) {
        outcome = () => ({ ok: false, status, json: async () => ({ code: 'ERR_AUTH_00001', message: 'Remote service circuit is open' }) });
        await check('ERR_BOF_00085');
    }
    outcome = () => { throw new Error('Remote service circuit is open'); };
    await check('ERR_BOF_00085');

    // Compose the selected remote transport, actual normalization, agent and
    // nSystem contributor. Status definitions use string HTTP codes.
    const agentDefinition = require('../src/service/module/defaultModuleRegistrationAgentService');
    const health = { ...require('../../nSystem/src/service/health/defaultHealthService'),
        _readinessContributors: {}, _readinessCache: null };
    SERVICE.DefaultHealthService = health;
    global.NODICS = { getEnvironmentName: () => 'isolated', getSelectedEnvironmentName: () => 'isolated',
        getServerName: () => 'isolated', getNodeName: () => null };
    const warnings = [];
    const agent = { ...agentDefinition, _terminalRegistrationFailure: false, _registrationPromise: null,
        _metrics: { attempts: 0, successes: 0, failures: 0 }, LOG: { warn: (...args) => warnings.push(args) },
        getConfiguration: () => ({ enabled: true, moduleName: 'backoffice', maxModulesPerRegistration: 2 }),
        getLocalModules: () => ['profile'], getInstanceId: () => 'isolated-instance',
        getAuthorizationHeader: () => ({ Authorization: 'Bearer harmless-fixture-proof' }),
        buildRegistration: moduleName => ({ moduleName }) };
    service.buildRequest = options => {
        assert.strictEqual(options.apiName, '/registry/instances');
        assert.strictEqual(options.methodName, 'PUT');
        return { ...request, method: 'PUT', body: options.requestBody, headers: options.header };
    };
    outcome = () => ({ ok: false, status: 400, json: async () => ({
        code: 'ERR_BOF_00000', message: 'private-descriptor-sentinel', responseCode: '400' }) });
    await assert.rejects(service.fetch(request), error => {
        assert(error instanceof NodicsError);
        assert.strictEqual(error.code, 'ERR_BOF_00000');
        assert.strictEqual(error.responseCode, '400');
        assert.strictEqual(agent.isPermanentRegistrationFailure(error), true);
        return true;
    });
    service._circuits.clear();
    await agent.init();
    const before = calls;
    assert.strictEqual(await agent.runRegistration(), false);
    assert.strictEqual(calls, before + 1);
    assert.strictEqual(await agent.runRegistration(), false);
    assert.strictEqual(calls, before + 1, 'actual normalized validation rejection must latch without a second transport call');
    const contributor = health._readinessContributors.backofficeRegistration;
    const permanentCheck = await health.evaluateReadinessContributor({ name: 'backofficeRegistration', ...contributor });
    assert.strictEqual(permanentCheck.status, 'DOWN');
    assert.strictEqual(permanentCheck.required, true);
    assert.strictEqual(permanentCheck.reasonCode, 'BACKOFFICE_REGISTRATION_REPAIR_REQUIRED');
    assert(permanentCheck.suggestedAction.includes('Repair'));
    assert.strictEqual(JSON.stringify({ permanentCheck, warnings }).includes('private-descriptor-sentinel'), false);
    assertions++;
    service._circuits.clear();
    outcome = () => ({ ok: false, status: 503, json: async () => ({ code: 'ERR_BOF_00000', message: 'temporary' }) });
    await assert.rejects(service.fetch(request), error => {
        assert(error instanceof NodicsError);
        assert.strictEqual(error.responseCode, '400');
        assert.strictEqual(error.metadata.transportFailure.httpStatus, 503);
        assert.strictEqual(agent.isPermanentRegistrationFailure(error), false);
        return true;
    });
    assertions++;
    assert.strictEqual(service.classifyTransportFailure({ status: 403, code: 'ECONNRESET' }), undefined);
    assert.strictEqual(service.classifyTransportFailure({ status: 403, metadata: { transportFailure: { code: 'REMOTE_HTTP_503', httpStatus: 503 } } }), undefined);
    await service.closeTransport();
    console.log('Transport normalization/Axis classification: ' + assertions + ' scenarios passed; no network requests');
})().catch(async error => { await service.closeTransport(); console.error(error); process.exitCode = 1; });
