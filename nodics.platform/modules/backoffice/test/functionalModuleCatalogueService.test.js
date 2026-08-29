/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module backoffice/test/FunctionalModuleCatalogueService
 * @description Validates explicit functional-root aggregation, project-module exclusion, durable first registration, and restart-safe reconciliation.
 * @layer test
 * @owner backoffice
 * @override Functional-module catalogue replacements must preserve the same project and runtime-state boundaries.
 */
const assert = require('assert');

global.CONFIG = { get: key => key === 'defaultTenant' ? 'default' :
    key === 'moduleIdentityAliases' ? { 'nodics.core': 'nodics.foundation' } : undefined };
global.SERVICE = {};
global.NODICS = { getEnvironmentName: () => 'example.project' };
global.CLASSES = { NodicsError: class NodicsError extends Error {
    constructor(code, message) { super(message || code); this.code = code; }
} };

const definition = require('../src/service/registry/defaultFunctionalModuleCatalogueService');
const service = Object.assign({}, definition);

const batch = {
    project: 'example.project', environment: 'localEnvironment', server: 'platformServer', node: null,
    registrations: [
        { moduleName: 'nodics.foundation', version: '0.0.0', moduleIndex: '10.99', functionalModule: {
            identity: 'nodics.foundation', displayName: 'Foundation', type: 'STANDARD', protected: true } },
        { moduleName: 'nConfig', parentModule: 'nodics.foundation' },
        { moduleName: 'nodics.platform', parentModule: 'nodics.foundation', version: '0.0.0', moduleIndex: '60.99', functionalModule: {
            identity: 'nodics.platform', displayName: 'Platform', type: 'STANDARD', protected: true } },
        { moduleName: 'profile', parentModule: 'nodics.platform' },
        { moduleName: 'backoffice', parentModule: 'nodics.platform' },
        { moduleName: 'nodics.wcms', parentModule: 'nodics.foundation', version: '0.0.0', moduleIndex: '80.99', functionalModule: {
            identity: 'nodics.wcms', displayName: 'WCMS', type: 'STANDARD', protected: true } },
        { moduleName: 'cms', parentModule: 'nodics.wcms' },
        { moduleName: 'media', parentModule: 'nodics.wcms' },
        { moduleName: 'wcms', parentModule: 'nodics.wcms' },
        { moduleName: 'example.project', parentModule: undefined },
        { moduleName: 'projectCore', parentModule: 'example.project' }
    ]
};

async function run() {
    assert.deepStrictEqual(service.getQuery({ httpRequest: { query: { project: 'example.project' } } }), { project: 'example.project' });
    assert.deepStrictEqual(service.getBody({ httpRequest: { body: { reason: 'approved' } } }), { reason: 'approved' });
    assert.strictEqual(service.normalizeFunctionalModule('nodics.core'), 'nodics.foundation');
    assert.strictEqual(service.getCode('example.project', 'nodics.core'), 'example.project::nodics.foundation');
    let observations = service.buildObservations(batch);
    assert.deepStrictEqual(observations.map(item => item.functionalModule), ['nodics.foundation', 'nodics.platform', 'nodics.wcms']);
    assert.deepStrictEqual(observations[0].technicalModules, ['nConfig']);
    assert.strictEqual(observations[0].moduleIndex, '10.99');
    assert.deepStrictEqual(observations[1].technicalModules, ['backoffice', 'profile']);
    assert.deepStrictEqual(observations[2].technicalModules, ['cms', 'media', 'wcms']);
    assert.strictEqual(observations[2].required, true, 'WCMS is an Axis prerequisite and must be default-registered');
    assert(!observations.some(item => item.functionalModule === 'example.project'));
    let leaseIndex = service.buildLeaseFunctionalModuleIndex(batch);
    assert.strictEqual(leaseIndex.profile, 'nodics.platform');
    assert.strictEqual(leaseIndex.media, 'nodics.wcms');
    assert.strictEqual(leaseIndex.projectCore, undefined, 'project modules must not become functional capability owners');

    let saved;
    let updated;
    let existing;
    service.getRecord = async () => existing;
    service.retireDuplicateLegacyRecords = async () => 0;
    service.saveRecord = async request => { saved = request.model; return { result: [request.model] }; };
    service.updateRecord = async request => { updated = request.model; return { result: { modifiedCount: 1 } }; };
    service.getPersistenceAuthData = authData => authData;

    let first = await service.reconcileObservation(observations[0], { tenant: 'default', authData: {} });
    assert(saved);
    assert.strictEqual(first.registrationState, 'REGISTERED');
    assert.strictEqual(first.catalogueRevision, 1);
    assert.strictEqual(first.required, true);
    assert.strictEqual(first.code, 'example.project::nodics.foundation');

    existing = Object.assign({}, first, { registeredAt: new Date('2026-01-01T00:00:00Z') });
    saved = undefined;
    let renewed = await service.reconcileObservation(observations[0], { tenant: 'default', authData: {} });
    assert.strictEqual(saved, undefined, 'restart reconciliation must not recreate registration');
    assert(updated, 'restart reconciliation should refresh observed time');
    assert.strictEqual(renewed.catalogueRevision, 1, 'unchanged restart must not advance catalogue revision');
    assert.strictEqual(renewed.registeredAt.toISOString(), '2026-01-01T00:00:00.000Z');

    existing = Object.assign({}, first, { code: 'example.project::nodics.core', functionalModule: 'nodics.core',
        registeredAt: new Date('2026-01-01T00:00:00Z') });
    updated = undefined;
    let migrated = await service.reconcileObservation(observations[0], { tenant: 'default', authData: {} });
    assert.strictEqual(updated.code, 'example.project::nodics.foundation');
    assert.strictEqual(updated.functionalModule, 'nodics.foundation');
    assert.strictEqual(migrated.catalogueRevision, 2, 'legacy identity migration must advance the catalogue revision');

    const migrationService = Object.assign({}, definition);
    let retiredRequest;
    migrationService.getRecordForExactIdentity = async (project, identity) => identity === 'nodics.core' ? {
        code: 'example.project::nodics.core', functionalModule: 'nodics.core', registrationState: 'REGISTERED',
        enabled: true, runtimeState: 'ACTIVE', catalogueRevision: 4
    } : undefined;
    migrationService.updateRecord = async request => { retiredRequest = request; return { result: { modifiedCount: 1 } }; };
    migrationService.getPersistenceAuthData = authData => authData;
    let retired = await migrationService.retireDuplicateLegacyRecords('example.project', 'nodics.foundation',
        { tenant: 'default', authData: {} }, first);
    assert.strictEqual(retired, 1);
    assert.strictEqual(retiredRequest.model.functionalModule, 'nodics.foundation');
    assert.strictEqual(retiredRequest.model.registrationState, 'DEREGISTERED');
    assert.strictEqual(retiredRequest.model.enabled, false);

    let requiredRequest = { body: { project: 'example.project', expectedRevision: 1, reason: 'not allowed' },
        params: { functionalModule: 'nodics.foundation' }, authData: { tokenType: 'access', principalId: 'admin' } };
    await assert.rejects(() => service.deactivate(requiredRequest), /Required functional module/);

    existing = Object.assign({}, first, { code: 'example.project::nodics.process', functionalModule: 'nodics.process',
        displayName: 'Process', required: false, registrationState: 'AVAILABLE', enabled: false,
        runtimeState: 'ACTIVE', catalogueRevision: 1 });
    updated = undefined;
    let optionalRequest = { body: { project: 'example.project', expectedRevision: 1, reason: 'approved for project' },
        params: { functionalModule: 'nodics.process' }, authData: { tokenType: 'access', principalId: 'admin' } };
    let registered = await service.register(optionalRequest);
    assert.strictEqual(registered.data.registrationState, 'REGISTERED');
    assert.strictEqual(registered.data.enabled, false);
    assert.strictEqual(registered.data.catalogueRevision, 2);

    existing = Object.assign({}, existing, updated);
    optionalRequest.body.expectedRevision = 2;
    let activated = await service.activate(optionalRequest);
    assert.strictEqual(activated.data.enabled, true);
    assert.strictEqual(activated.data.catalogueRevision, 3);

    existing = Object.assign({}, existing, updated);
    optionalRequest.body.expectedRevision = 3;
    let deregistered = await service.deregister(optionalRequest);
    assert.strictEqual(deregistered.data.registrationState, 'AVAILABLE',
        'live optional modules must return to available after deregistration');
    assert.strictEqual(deregistered.data.enabled, false);
    assert.strictEqual(deregistered.data.catalogueRevision, 4);

    existing = Object.assign({}, existing, updated, { registrationState: 'DEREGISTERED', runtimeState: 'ACTIVE' });
    let rediscovered = await service.reconcileObservation(Object.assign({}, observations[0], {
        functionalModule: 'nodics.process', displayName: 'Process', required: false
    }), { tenant: 'default', authData: {} });
    assert.strictEqual(rediscovered.registrationState, 'AVAILABLE',
        'live reconciliation must make previously deregistered optional modules available again');

    await assert.rejects(() => service.deregister(Object.assign({}, optionalRequest, {
        authData: { tokenType: 'service', principalId: 'runtime' }
    })), /human employee/);

    service.getRecords = async () => ({ result: [
        { functionalModule: 'nodics.platform', technicalModules: ['backoffice', 'profile'],
            registrationState: 'REGISTERED', enabled: true, runtimeState: 'ACTIVE' },
        { functionalModule: 'nodics.process', technicalModules: ['cronjob', 'workflow'],
            registrationState: 'REGISTERED', enabled: false, runtimeState: 'ACTIVE' }
    ] });
    let eligibility = await service.getPresentationEligibility({ tenant: 'default', authData: {} });
    assert.deepStrictEqual(eligibility.eligibleModules, ['backoffice', 'nodics.platform', 'profile']);
    assert(eligibility.governedModules.includes('cronjob'));
    assert(!eligibility.eligibleModules.includes('workflow'));

    let runtimeRecords = [{ code: 'example.project::nodics.process', projectCode: 'example.project',
        functionalModule: 'nodics.process', runtimeState: 'ACTIVE', observedServers: ['local:oldServer:default'],
        catalogueRevision: 8 }];
    let runtimeUpdates = [];
    service.getRecords = async () => ({ result: runtimeRecords });
    service.updateRecord = async request => { runtimeUpdates.push(request); return { result: { modifiedCount: 1 } }; };
    let reconciled = await service.reconcileActiveRuntimeLeases([], ['example.project'], { tenant: 'default', authData: {} });
    assert.strictEqual(reconciled, 1);
    assert.strictEqual(runtimeUpdates[0].model.runtimeState, 'OFFLINE');
    assert.deepStrictEqual(runtimeUpdates[0].model.observedServers, []);
    runtimeRecords[0] = Object.assign({}, runtimeRecords[0], runtimeUpdates[0].model);
    runtimeUpdates = [];
    reconciled = await service.reconcileActiveRuntimeLeases([{ projectCode: 'example.project',
        functionalModuleIdentity: 'nodics.process', environment: 'local', server: 'processServer', node: null }],
    ['example.project'], { tenant: 'default', authData: {} });
    assert.strictEqual(reconciled, 1);
    assert.strictEqual(runtimeUpdates[0].model.runtimeState, 'ACTIVE');
    assert.deepStrictEqual(runtimeUpdates[0].model.observedServers, ['local:processServer:default']);

    let originalConfigGet = CONFIG.get;
    let originalNodics = NODICS;
    let resolvedOptions;
    let transportOptions;
    CONFIG.get = key => key === 'defaultTenant' ? 'default' :
        key === 'backofficeFunctionalModuleActivationData' ? { timeoutMs: 1234 } :
            key === 'servers' ? { options: { contextRoot: 'nodics' } } : originalConfigGet(key);
    NODICS = {
        getEnvironmentName: () => 'example.project',
        getServerName: () => 'platformServer',
        getInternalAuthToken: tenant => tenant === 'default' ? 'internal-token' : undefined
    };
    SERVICE.DefaultBackofficeRegistryService = {
        resolveRuntimeOwner: async options => {
            resolvedOptions = options;
            return { moduleName: 'system', server: 'commerceServer', endpoint: 'http://localhost:4350/nodics/system' };
        }
    };
    SERVICE.DefaultModuleService = {
        buildExternalRequest: options => {
            transportOptions = options;
            return Object.assign({ built: true }, options);
        },
        fetch: async request => ({ code: 'SUC_IMP_00000', data: { requestUri: request.uri, releases: [
            { releaseCode: 'baseCommerce:core-reference', status: 'CURRENT' }
        ] } })
    };
    let remotePreflight = await service.runActivationDataReleaseOperation('preflight',
        { dataType: 'core', releaseCodes: ['baseCommerce:core-reference'] },
        { targetServer: 'commerceServer', targetModule: 'commerce' },
        { tenant: 'default', body: { correlationId: 'activation-1' } });
    assert.strictEqual(resolvedOptions.moduleName, 'system');
    assert.strictEqual(resolvedOptions.connectionName, 'commerceServer');
    assert.strictEqual(transportOptions.uri, 'http://localhost:4350/nodics/import/v0/core/validate');
    assert.strictEqual(transportOptions.header.Authorization, 'Bearer internal-token');
    assert.strictEqual(transportOptions.requestBody.releaseCodes[0], 'baseCommerce:core-reference');
    assert.strictEqual(remotePreflight.data.releases[0].status, 'CURRENT');
    CONFIG.get = originalConfigGet;
    NODICS = originalNodics;

    const dependencyService = Object.assign({}, definition);
    let dependencyRecords = {
        'nodics.commerce': { functionalModule: 'nodics.commerce', displayName: 'Commerce',
            registrationState: 'REGISTERED', enabled: true, runtimeState: 'ACTIVE' },
        'nodics.discovery': { functionalModule: 'nodics.discovery', displayName: 'Discovery',
            registrationState: 'AVAILABLE', enabled: false, runtimeState: 'ACTIVE' }
    };
    CONFIG.get = key => key === 'defaultTenant' ? 'default' :
        key === 'backofficeFunctionalModuleActivationData' ? { modules: {
            'nodics.accelerators': { dependencies: ['nodics.commerce', 'nodics.discovery'] }
        } } : originalConfigGet(key);
    dependencyService.getRecord = async (project, functionalModule) => dependencyRecords[functionalModule];
    let acceleratorRecord = { projectCode: 'example.project', functionalModule: 'nodics.accelerators' };
    let dependencyStates = await dependencyService.getFunctionalDependencyStates(acceleratorRecord, {});
    assert.deepStrictEqual(dependencyStates.map(item => item.functionalModule), ['nodics.commerce', 'nodics.discovery']);
    assert.strictEqual(dependencyStates[0].satisfied, true);
    assert.strictEqual(dependencyStates[1].satisfied, false);
    let dependencyPlan = dependencyService.buildActivationDataPlan(Object.assign({}, acceleratorRecord, {
        registrationState: 'REGISTERED', runtimeState: 'ACTIVE'
    }), 'dryRun', { dependencyStates: dependencyStates });
    assert(dependencyPlan.preflight.blockedReasons.includes('MISSING_DEPENDENCY:nodics.discovery'),
        'dry-run activation plan must expose missing functional dependencies');
    await assert.rejects(() => dependencyService.assertFunctionalDependenciesSatisfied(acceleratorRecord, {}), /Discovery/);
    dependencyRecords['nodics.discovery'] = Object.assign({}, dependencyRecords['nodics.discovery'], {
        registrationState: 'REGISTERED', enabled: true
    });
    await dependencyService.assertFunctionalDependenciesSatisfied(acceleratorRecord, {});
    CONFIG.get = originalConfigGet;

    console.log('Functional-module catalogue service validated');
}

run().catch(error => { console.error(error); process.exit(1); });
