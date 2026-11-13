/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @module backoffice/test/importReadinessTargetBinding
 * @description Verifies owner catalogue reads against the actual module authority validator and preparation type boundary.
 * @layer test
 * @owner backoffice
 */
const assert = require('node:assert/strict');
const { test, afterEach } = require('node:test');
const readiness = require('../src/service/operations/defaultBackofficeOperationalReadinessService');
const application = require('../src/service/defaultBackofficeApplicationInitializationService');
const moduleService = require('../../../../nodics.foundation/modules/nService/src/service/module/defaultModuleService');
const previousServices = global.SERVICE;
const previousClasses = global.CLASSES;
afterEach(() => { global.SERVICE = previousServices; global.CLASSES = previousClasses; });

const request = { tenant: 'test-tenant', httpRequest: { headers: { authorization: 'Bearer synthetic-operator-token' } } };
const target = { targetServer: 'stageAlias', targetRuntimeRole: 'CATALOG_STAGED', dataType: 'core' };

test('import readiness uses the existing canonical deployment binding and initiating identity', async () => {
    const bindings = [];
    const calls = [];
    global.SERVICE = {
        DefaultBackofficeApplicationInitializationService: {
            applicationTargetBinding: (...args) => {
                bindings.push(args);
                return { connectionName: 'catalogueStageServer', targetAuthority: { server: 'catalogueStageServer', publication: 'STAGED' } };
            }
        },
        DefaultModuleService: { invokeModule: descriptor => {
            moduleService.normalizeTargetAuthority(descriptor.targetAuthority);
            calls.push(descriptor);
            return Promise.resolve([{ code: 'catalogue:core' }]);
        } }
    };
    assert.deepEqual(await readiness.invokeImportCatalogue(target, request), [{ code: 'catalogue:core' }]);
    assert.deepEqual(bindings, [['stageAlias', 'import']]);
    assert.equal(calls.length, 1);
    assert.equal(calls[0].moduleName, 'import');
    assert.equal(calls[0].connectionName, 'catalogueStageServer');
    assert.deepEqual(calls[0].targetAuthority, { server: 'catalogueStageServer', publication: 'STAGED' });
    assert.equal(calls[0].header.Authorization, 'Bearer synthetic-operator-token');
    assert.equal(calls[0].methodName, 'GET');
    assert.equal(calls[0].apiName, '/core');
    assert.equal(calls[0].local, false);
    assert.equal(calls[0].maxAttempts, 1);
});

test('ambiguous deployment binding refuses before any owner invocation', async () => {
    let calls = 0;
    global.SERVICE = {
        DefaultBackofficeApplicationInitializationService: { applicationTargetBinding: () => { throw new Error('ambiguous deployment'); } },
        DefaultModuleService: { invokeModule: () => { calls++; return Promise.resolve([]); } }
    };
    await assert.rejects(readiness.invokeImportCatalogue(target, request), /ambiguous deployment/);
    assert.equal(calls, 0);
});

test('missing deployment binding never falls back to a retired role selector', async () => {
    let calls = 0;
    global.CLASSES = { NodicsError: class extends Error { constructor(code, message) { super(message); this.code = code; } } };
    global.SERVICE = { DefaultModuleService: { invokeModule: () => { calls++; return Promise.resolve([]); } } };
    await assert.rejects(readiness.invokeImportCatalogue(target, request), /Application target binding is unavailable/);
    assert.equal(calls, 0);
});

test('catalogue target selection excludes Media, publication and disabled preparation steps', () => {
    const profiles = [{ dataPackages: [
        { ...target, type: 'DATA_RELEASE' },
        { targetServer: 'platform', targetRuntimeRole: 'PLATFORM', dataType: 'init' },
        { ...target, type: 'MEDIA_ASSET_MANIFEST', dataType: 'media' },
        { ...target, type: 'GOVERNED_PUBLICATIONS', dataType: 'sample' },
        { ...target, type: 'DATA_RELEASE', dataType: 'sample', enabled: false },
        { ...target, type: 'DATA_RELEASE' }
    ] }];
    assert.deepEqual(readiness.importReadinessTargets(profiles), [
        { targetServer: 'platform', targetRuntimeRole: 'PLATFORM', dataType: 'init' },
        target
    ]);
});

test('real profile projection makes typed preparation authoritative for catalogue selection', () => {
    const steps = [
        { ...target, code: 'catalogue:core', type: 'DATA_RELEASE', kind: 'Project foundation' },
        { ...target, code: 'catalogue:assets', type: 'MEDIA_ASSET_MANIFEST', dataType: 'media' },
        { ...target, code: 'catalogue:publication', type: 'GOVERNED_PUBLICATIONS', dataType: 'sample' }
    ];
    const owner = Object.assign(Object.create(application), {
        preparationSteps: () => steps,
        requiredFunctionalModules: () => [],
        setupPlan: () => undefined
    });
    const profile = owner.describe({ code: 'test-app', dataPackages: steps });
    assert.deepEqual(profile.preparationSteps.map(step => step.type), [
        'DATA_RELEASE', 'MEDIA_ASSET_MANIFEST', 'GOVERNED_PUBLICATIONS'
    ]);
    assert.equal(profile.dataPackages[0].kind, 'Project foundation');
    assert.deepEqual(readiness.importReadinessTargets([profile]), [target]);
});

test('an explicitly empty preparation list does not resurrect presentation packages', () => {
    assert.deepEqual(readiness.importReadinessTargets([{ preparationSteps: [], dataPackages: [target] }]), []);
});

test('malformed explicit preparation refuses instead of falling back to presentation packages', () => {
    global.CLASSES = { NodicsError: class extends Error { constructor(code, message) { super(message); this.code = code; } } };
    assert.throws(() => readiness.importReadinessTargets([{ preparationSteps: {}, dataPackages: [target] }]), /preparation catalogue must be an array/);
});
