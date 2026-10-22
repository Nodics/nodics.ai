/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module import/test/identityAuthorityReleaseExecution @description Proves exact Init operation authority, lifetime and partition boundaries with existing release/dispatch owners and offline receipt ports. @layer test @owner import */
const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const crypto = require('node:crypto');
const dispatcher = require('../src/service/process/model/defaultModelImportProcessService');

/** Builds a canonical one-header Init release without any live service or Profile persistence. */
function fixture(t, { schemaName = 'permission', operation = 'ensureReferenceAll', dataType = 'init', tenant = 'default' } = {}) {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'nodics-identity-authority-'));
    t.after(() => fs.rmSync(root, { recursive: true, force: true }));
    const sourceRoot = dataType + '-v001';
    const options = { enabled: true, schemaName, operation, dataFilePrefix: 'seed' };
    const sources = {
        [sourceRoot + '/headers/seedHeader.js']: 'module.exports = ' + JSON.stringify({ profile: { seed: { options } } }) + ';',
        [sourceRoot + '/records/seedData.js']: 'module.exports = { record0: { code: "seed" } };'
    };
    for (const [file, source] of Object.entries(sources)) {
        fs.mkdirSync(path.dirname(path.join(root, 'data', file)), { recursive: true });
        fs.writeFileSync(path.join(root, 'data', file), source);
    }
    fs.writeFileSync(path.join(root, 'data/manifest.json'), JSON.stringify({ contractVersion: 2, module: 'seedOwner', sections: {
        seed: { kind: 'DATA_RELEASE', dataType, sourceRoot, version: '1.0.0', destinationRole: 'PLATFORM',
            owningDomain: 'seedOwner', lifecycle: 'REFERENCE', environmentScope: ['ALL'], sensitivity: 'INTERNAL',
            versioningPolicy: 'NONE', publicationPolicy: 'NONE', initialPublicationPolicy: 'NONE', removalPolicy: 'RETAIN',
            files: Object.fromEntries(Object.entries(sources).map(([file, source]) => [file, crypto.createHash('sha256').update(source).digest('hex')])) }
    } }));
    const state = require('./helpers/releaseExecution')({ modules: { seedOwner: { name: 'seedOwner', path: root } }, runtimeRole: 'PLATFORM' });
    const service = state.service;
    SERVICE.DefaultDataReleaseService = service;
    const targetName = 'Default' + schemaName[0].toUpperCase() + schemaName.slice(1) + 'Service';
    const dispatch = (request, target = SERVICE[targetName], op = {}) => dispatcher.executeAdmittedSchemaOperation(request,
        { tenant, authData: { isSystem: true }, ...op }, target);
    const request = { tenant, authData: { isSystem: true }, releaseRequest: { dataType, releaseCodes: ['seedOwner:seed'] } };
    const install = callback => {
        SERVICE.DefaultImportService[dataType === 'init' ? 'importInitData' : 'importCoreData'] = async input => {
            input.importRun = { runId: 'test-run', status: 'COMPLETED', summary: { recordsSucceeded: 1, recordsFailed: 0 } };
            service.bindOperationMetadataRun(input);
            const model = { tenant, importRun: input.importRun, header: { options: { ...options, moduleName: 'profile' } } };
            await callback(model, input);
            return { code: 'SUC_IMP_00000' };
        };
        return service.execute(request);
    };
    return { ...state, root, service, targetName, options, tenant, request, dispatch, install };
}

test('explicit operator Init admits only the bound Profile operation; expires on completion', async t => {
    const f = fixture(t); let deferredCheck, releaseDeferred;
    const deferred = new Promise(resolve => { releaseDeferred = resolve; });
    SERVICE[f.targetName] = { ensureReferenceAll: async () => {
        assert.equal(f.service.isStartupReleaseExecution('default'), false, 'operator execution is not disguised as startup');
        assert.equal(f.service.isIdentityAuthorityReleaseExecution('default', 'permission', 'ensureReferenceAll'), true);
        assert.equal(f.service.isIdentityAuthorityReleaseExecution('other'), false);
        assert.equal(f.service.isIdentityAuthorityReleaseExecution('default', 'userGroup'), false);
        deferredCheck = deferred.then(() => f.service.isIdentityAuthorityReleaseExecution('default'));
        await Promise.resolve();
        assert.equal(f.service.isIdentityAuthorityReleaseExecution('default'), true);
        return { result: [] };
    } };
    assert.equal(f.service.isIdentityAuthorityReleaseExecution('default'), false);
    await f.install(async model => {
        assert.equal(f.service.isIdentityAuthorityReleaseExecution('default'), false, 'whole-release context is not seed authority');
        await f.dispatch(model);
        assert.equal(f.service.isIdentityAuthorityReleaseExecution('default'), false, 'row completion revokes authority before import completes');
    });
    releaseDeferred();
    assert.equal(await deferredCheck, false);
    assert.equal(f.service.isIdentityAuthorityReleaseExecution('default'), false);
});

test('startup and explicit migration use the same exact bootstrap operation context', async t => {
    const f = fixture(t, { schemaName: 'employee', operation: 'ensureBootstrapAll' });
    let count = 0;
    SERVICE[f.targetName] = { ensureBootstrapAll: async () => {
        count++;
        assert.equal(f.service.isIdentityAuthorityReleaseExecution('default', 'employee', 'ensureBootstrapAll'), true);
    } };
    await f.install(model => f.dispatch(model));
    f.installations.length = 0;
    await f.service.installStartupReleases({ tenant: 'default' });
    assert.equal(count, 2);
});

test('authority-partition Init admits only the exact runtime deployment assignment operation', async t => {
    const f = fixture(t, { schemaName: 'principalScopeAssignment', operation: 'ensureDeploymentAll' });
    SERVICE[f.targetName] = { ensureDeploymentAll: async () => {
        assert.equal(f.service.isIdentityAuthorityReleaseExecution('default', 'principalScopeAssignment', 'ensureDeploymentAll'), true);
        assert.equal(f.service.isIdentityAuthorityReleaseExecution('default', 'principalScopeAssignment', 'ensureReferenceAll'), false);
        assert.equal(f.service.isIdentityAuthorityReleaseExecution('partner', 'principalScopeAssignment', 'ensureDeploymentAll'), false);
    } };
    await f.install(model => f.dispatch(model));
    assert.equal(f.service.isIdentityAuthorityReleaseExecution('default', 'principalScopeAssignment', 'ensureDeploymentAll'), false);

    const partner = fixture(t, { tenant: 'partner', schemaName: 'principalScopeAssignment', operation: 'ensureDeploymentAll' });
    SERVICE[partner.targetName] = { ensureDeploymentAll: async () =>
        assert.equal(partner.service.isIdentityAuthorityReleaseExecution('partner', 'principalScopeAssignment', 'ensureDeploymentAll'), false) };
    await partner.install(model => partner.dispatch(model));
});

test('authority-partition Init admits only the exact runtime service-scope adoption operation', async t => {
    const f = fixture(t, { schemaName: 'employee', operation: 'adoptRuntimeServiceScopesAll' });
    SERVICE[f.targetName] = { adoptRuntimeServiceScopesAll: async () => {
        assert.equal(f.service.isIdentityAuthorityReleaseExecution('default', 'employee', 'adoptRuntimeServiceScopesAll'), true);
        assert.equal(f.service.isIdentityAuthorityReleaseExecution('default', 'employee', 'ensureBootstrapAll'), false);
        assert.equal(f.service.isIdentityAuthorityReleaseExecution('partner', 'employee', 'adoptRuntimeServiceScopesAll'), false);
    } };
    await f.install(model => f.dispatch(model));
    assert.equal(f.service.isIdentityAuthorityReleaseExecution('default', 'employee', 'adoptRuntimeServiceScopesAll'), false);

    const partner = fixture(t, { tenant: 'partner', schemaName: 'employee', operation: 'adoptRuntimeServiceScopesAll' });
    SERVICE[partner.targetName] = { adoptRuntimeServiceScopesAll: async () =>
        assert.equal(partner.service.isIdentityAuthorityReleaseExecution('partner', 'employee', 'adoptRuntimeServiceScopesAll'), false) };
    await partner.install(model => partner.dispatch(model));
});

test('unbound, copied and foreign-tenant requests cannot manufacture authority in-flight', async t => {
    const f = fixture(t);
    let expected = false;
    SERVICE[f.targetName] = { ensureReferenceAll: async () => assert.equal(f.service.isIdentityAuthorityReleaseExecution('default'), expected) };
    await f.install(async (model, input) => {
        await f.dispatch({ ...model, importRun: structuredClone(model.importRun) });
        await f.dispatch({ ...model, importRun: undefined });
        await f.dispatch({ ...model, tenant: 'other' });
        await f.dispatch(model, SERVICE[f.targetName], { tenant: 'other' });
        await f.dispatch({ ...model, header: { options: { ...model.header.options, dataFilePrefix: 'unrelated' } } });
        await f.dispatch({ ...model, header: { options: { ...model.header.options, schemaName: 'userGroup' } } });
        const forged = { ...input, importRun: {} }; f.service.bindOperationMetadataRun(forged);
        await f.dispatch({ ...model, importRun: forged.importRun });
        expected = true; await f.dispatch(model);
    });
    expected = false;
    await f.dispatch({ tenant: 'default', importRun: {}, source: 'startup', isIdentityAuthorityReleaseExecution: true,
        header: { options: { ...f.options, moduleName: 'profile' } } });
});

test('unrelated nested imports and wrong schema services never inherit seed authority', async t => {
    const f = fixture(t); let nested = false;
    const other = { ensureReferenceAll: async () => assert.equal(f.service.isIdentityAuthorityReleaseExecution('default'), false) };
    SERVICE[f.targetName] = { ensureReferenceAll: async () => {
        assert.equal(f.service.isIdentityAuthorityReleaseExecution('default'), true);
        await f.dispatch({ tenant: 'default', importRun: {}, header: { options: { ...f.options, moduleName: 'profile' } } }, other);
        nested = true;
        assert.equal(f.service.isIdentityAuthorityReleaseExecution('default'), true);
    } };
    await f.install(async model => { await f.dispatch(model, other); await f.dispatch(model); });
    assert(nested);
});

test('Core imports cannot authorize identity seeding despite matching operation and system flags', async t => {
    const f = fixture(t, { dataType: 'core' });
    SERVICE[f.targetName] = { ensureReferenceAll: async () => assert.equal(f.service.isIdentityAuthorityReleaseExecution('default'), false) };
    await f.install(model => f.dispatch(model));
});

test('nondefault groups can bootstrap but permissions and roles cannot be seeded outside the authority partition', async t => {
    for (const schemaName of ['userGroup', 'permission', 'enterpriseRole']) {
        const f = fixture(t, { tenant: 'partner', schemaName });
        SERVICE[f.targetName] = { ensureReferenceAll: async () => {
            assert.equal(f.service.isIdentityAuthorityReleaseExecution('partner', schemaName, 'ensureReferenceAll'), schemaName === 'userGroup');
            assert.equal(f.service.isIdentityAuthorityReleaseExecution('default'), false);
        } };
        await f.install(model => f.dispatch(model));
    }
});

test('owner rejection revokes authority for detached continuations and retains FAILED receipt', async t => {
    const f = fixture(t); let check, resolve;
    const pending = new Promise(done => { resolve = done; });
    SERVICE[f.targetName] = { ensureReferenceAll: async () => {
        check = pending.then(() => f.service.isIdentityAuthorityReleaseExecution('default'));
        throw new Error('controlled seed rejection');
    } };
    await assert.rejects(f.install(model => f.dispatch(model)), /controlled seed rejection/);
    resolve(); assert.equal(await check, false);
    assert.equal(f.installations[0].status, 'FAILED');
    assert.equal(f.service.isIdentityAuthorityReleaseExecution('default'), false);
});

test('direct system dispatch and public flags outside a claimed release have no seed authority', async t => {
    const f = fixture(t);
    SERVICE[f.targetName] = { ensureReferenceAll: async () => assert.equal(f.service.isIdentityAuthorityReleaseExecution('default'), false) };
    const request = { tenant: 'default', authData: { isSystem: true }, source: 'startup', importRun: {},
        header: { options: { ...f.options, moduleName: 'profile' } }, options: { identityAuthority: true, startup: true } };
    f.service.bindOperationMetadataRun(request);
    await f.dispatch(request);
    const plan = await f.service.preparePlan(f.request);
    const forged = f.service.createImportRequest(f.request, plan, false);
    await f.service.invokeImport(forged, 'init');
    assert.equal(f.service.isIdentityAuthorityReleaseExecution('default'), false);
});
