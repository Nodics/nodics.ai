/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module import/test/dataReleasePrerequisites @description Exercises exact dependency planning and awaited Init execution using offline owner ports. @layer test @owner import */
const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const crypto = require('node:crypto');
const releaseExecution = require('./helpers/releaseExecution');
const utility = require('../src/service/import/defaultImportUtilityService');
const initializer = require('../src/service/system/defaultSystemDataImportInitializerService');
const processor = require('../../jsImport/src/service/init/defaultJsFileDataProcessService');
const common = require('../../../../nCommon/src/utils/utils');

/** Runs an existing pipeline step with inert continuation ports. */
function invoke(owner, operation, request) {
    return new Promise((resolve, reject) => owner[operation](request, {}, {
        nextSuccess: resolve, stop: resolve, error: (_request, _response, error) => reject(error),
    }));
}

/** Creates inert independent owner packs and the existing in-memory installation ports. */
function fixture(t, onImport) {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'nodics-prerequisites-'));
    t.after(() => fs.rmSync(root, { recursive: true, force: true }));
    const modules = {}, manifests = {};
    const state = releaseExecution({ modules, runtimeRole: 'PLATFORM', onImport });
    const importInitData = SERVICE.DefaultImportService.importInitData;
    SERVICE.DefaultImportService.importInitData = async request => {
        const result = await importInitData(request);
        Object.assign(request.importRun, { status: 'COMPLETED', summary: { recordsSucceeded: 1, recordsFailed: 0 } });
        return result;
    };
    NODICS.getActiveModules = () => ['authority'];
    const service = state.service;
    const write = moduleName => fs.writeFileSync(path.join(modules[moduleName].path, 'data/manifest.json'), JSON.stringify(manifests[moduleName]));
    const add = (moduleName, sectionCode, overrides = {}) => {
        if (!modules[moduleName]) {
            modules[moduleName] = { name: moduleName, path: path.join(root, moduleName), index: '90' };
            manifests[moduleName] = { contractVersion: 2, module: moduleName, sections: {} };
        }
        const dataType = overrides.dataType || 'init', sourceRoot = dataType + '-v001';
        const header = sourceRoot + '/headers/' + sectionCode + 'Header.js';
        const record = sourceRoot + '/records/' + sectionCode + 'Data.js';
        const sources = {
            [header]: 'module.exports = ' + JSON.stringify({ authority: { [sectionCode]: { options: {
                enabled: true, schemaName: sectionCode, operation: 'ensureReferenceAll', dataFilePrefix: sectionCode,
            } } } }) + ';\n',
            [record]: 'module.exports = { record0: { code: "' + moduleName + '.' + sectionCode + '" } };\n'
        };
        for (const [file, source] of Object.entries(sources)) {
            fs.mkdirSync(path.dirname(path.join(modules[moduleName].path, 'data', file)), { recursive: true });
            fs.writeFileSync(path.join(modules[moduleName].path, 'data', file), source);
        }
        manifests[moduleName].sections[sectionCode] = {
            kind: 'DATA_RELEASE', dataType, sourceRoot, version: '0.0.2', selectionPolicy: 'EXPLICIT',
            owningDomain: moduleName, lifecycle: 'REFERENCE', destinationRole: 'PLATFORM', environmentScope: ['ALL'],
            sensitivity: 'INTERNAL', versioningPolicy: 'NONE', publicationPolicy: 'NONE',
            initialPublicationPolicy: 'NONE', removalPolicy: 'RETAIN',
            files: Object.fromEntries(Object.entries(sources).map(([file, source]) => [file, crypto.createHash('sha256').update(source).digest('hex')])),
            ...overrides
        };
        write(moduleName);
        return reference(moduleName, sectionCode);
    };
    const reference = (moduleName, sectionCode) => {
        const section = manifests[moduleName].sections[sectionCode];
        const release = service.inspectManifest(modules[moduleName], section.dataType,
            path.join(modules[moduleName].path, 'data/manifest.json'), section, sectionCode, true);
        return { moduleName, sectionCode, version: release.version, checksum: release.checksum };
    };
    const request = { tenant: 'default', releaseRequest: { dataType: 'init', releaseCodes: ['authority:bootstrap'] } };
    const chain = () => {
        const permission = add('optionalOwner', 'permissions');
        const base = add('authority', 'baseGroups', { prerequisites: [permission] });
        const group = add('optionalOwner', 'accessGroups', { prerequisites: [base] });
        const role = add('optionalOwner', 'enterpriseRoles', { prerequisites: [group] });
        add('authority', 'bootstrap', { selectionPolicy: 'DEFAULT', prerequisites: [permission, base, group, role] });
    };
    return { ...state, service, modules, manifests, write, add, reference, request, chain };
}

test('54 inactive permission owners are selected exactly and awaited before groups and roles', async t => {
    const order = [];
    const f = fixture(t, async request => {
        assert.equal(f.service.isStartupReleaseExecution('default'), true);
        const release = request.dataReleasePlan.find(item => !item.sourceOnly);
        const headers = await utility.getSystemDataHeaders(request.modules, 'init', request.dataReleasePlan);
        assert.equal(Object.keys(headers).length, 1);
        order.push(release.releaseCode);
        if (release.sectionCode === 'baseGroups') assert.equal(order.length, 55);
    });
    const refs = Array.from({ length: 54 }, (_, i) => f.add('owner' + i, 'permissionCatalogue'));
    f.add('owner0', 'unselected');
    f.add('owner0', 'business', { dataType: 'core', selectionPolicy: 'DEFAULT' });
    const base = f.add('authority', 'baseGroups', { prerequisites: refs });
    const groups = f.add('owner0', 'accessGroups', { prerequisites: [base] });
    const roles = f.add('owner0', 'enterpriseRoles', { prerequisites: [groups] });
    f.add('authority', 'bootstrap', { selectionPolicy: 'DEFAULT', prerequisites: [...refs, base, groups, roles] });
    const preflight = await f.service.preflight(f.request);
    assert.equal(preflight.data.releases.length, 58);
    assert.equal(f.imports.length, 0);
    assert.equal(f.installations.length, 0);
    await f.service.installStartupReleases({ tenant: 'default', modules: ['authority'] });
    assert.deepEqual(order, [...refs.map(ref => ref.moduleName + ':' + ref.sectionCode),
        'authority:baseGroups', 'owner0:accessGroups', 'owner0:enterpriseRoles', 'authority:bootstrap']);
    assert.equal(f.installations.length, 58);
    assert.equal(f.service.isStartupReleaseExecution('default'), false);
    assert.deepEqual(NODICS.getActiveModules(), ['authority']);
    const before = structuredClone(f.installations);
    assert.deepEqual(await f.service.installStartupReleases({ tenant: 'default' }), { skipped: true, reason: 'INIT_CURRENT' });
    assert.deepEqual(f.installations, before);
    assert.equal(f.imports.length, 58);
});

test('dependency failure records only the claimed attempt and never dispatches dependent writes', async t => {
    const f = fixture(t, () => { throw new Error('owner rejected import'); });
    f.chain();
    await assert.rejects(f.service.installStartupReleases({}), /owner rejected import/);
    assert.equal(f.imports.length, 1);
    assert.equal(f.installations.length, 1);
    assert.equal(f.installations[0].status, 'FAILED');
    assert.equal(f.service.isStartupReleaseExecution('default'), false);
});

test('restricted raw roots carry exact source descriptors through targets, headers, file filtering and dispatch without activation', async t => {
    const saved = { CLASSES: global.CLASSES, UTILS: global.UTILS };
    t.after(() => Object.assign(global, saved));
    global.CLASSES = { DataImportError: class extends Error {} };
    global.UTILS = { ...common, isBlank: value => value === undefined || value === null || value === '' };
    const quiet = { debug() {}, info() {}, warn() {}, error() {} };
    const prep = { ...initializer, LOG: quiet }, js = { ...processor, LOG: quiet }, dispatched = [];
    const f = fixture(t, async request => {
        request.inputPath = { dataType: 'init' }; request.data = {};
        const headers = await utility.getSystemDataHeaders(request.modules, 'init', request.dataReleasePlan);
        const files = await utility.getSystemDataFiles(request.modules, 'init', request.dataReleasePlan);
        assert.deepEqual(utility.filterDeclaredReleaseFiles(headers, request.dataReleasePlan, 'headers'), headers);
        assert.deepEqual(utility.filterDeclaredReleaseFiles(files, request.dataReleasePlan, 'data'), files);
        request.data.headerFiles = headers; request.data.dataFiles = files;
        await invoke(prep, 'buildHeaderInstances', request);
        await invoke(prep, 'resolveFileType', request);
        await invoke(prep, 'assignDataFilesToHeader', request);
        for (const header of Object.values(request.data.headers)) for (const file of Object.values(header.dataFiles)) {
            assert.equal(file.selectionFiles.length, 1);
            await invoke(js, 'processDataChunk', { header, files: file.list, selectionFiles: file.selectionFiles, outputPath: {} });
        }
    });
    f.chain();
    const raw = { authority: f.modules.authority };
    NODICS.getRawModule = name => raw[name];
    NODICS.getIndexedModules = () => new Map([['90', raw.authority]]);
    SERVICE.DefaultDataReleaseService = f.service;
    SERVICE.DefaultImportUtilityService = utility;
    SERVICE.DefaultPipelineService = { start: async (_name, request) => dispatched.push(...request.models) };
    await assert.rejects(f.service.preparePlan(f.request), /prerequisite owner is unavailable/);
    assert.equal(f.imports.length, 0); assert.equal(f.installations.length, 0);
    UTILS.resolveInstalledSourceDescriptor = name => f.modules[name];
    const targets = [];
    f.service.configuration().targetValidators = { authority: 'TargetAdmission' };
    SERVICE.TargetAdmission = { validateImportTarget: async input => { targets.push(input.schemaName); return true; } };
    await f.service.execute(f.request);
    assert.equal(dispatched.length, 5);
    assert.deepEqual(new Set(targets), new Set(['permissions', 'baseGroups', 'accessGroups', 'enterpriseRoles', 'bootstrap']));
    assert.equal(f.installations.length, 5);
    assert(f.installations.every(row => row.status === 'CURRENT'));
    assert.deepEqual(Object.keys(raw), ['authority']);
    assert.equal(NODICS.getRawModule('optionalOwner'), undefined);
    assert.deepEqual(NODICS.getActiveModules(), ['authority']);
    assert.deepEqual([...NODICS.getIndexedModules().values()], [raw.authority]);
});

test('absent prerequisite sources compose inherited fields without replaying unselected records', async t => {
    const saved = { CLASSES: global.CLASSES, UTILS: global.UTILS };
    t.after(() => Object.assign(global, saved));
    global.CLASSES = { DataImportError: class extends Error {} };
    global.UTILS = { ...common, isBlank: value => value === undefined || value === null || value === '' };
    const quiet = { debug() {}, info() {}, warn() {}, error() {} };
    const prep = { ...initializer, LOG: quiet }, js = { ...processor, LOG: quiet }, writes = [], calls = [];
    const f = fixture(t, async request => {
        calls.push(request.dataReleasePlan.map(row => [row.moduleName, row.sourceOnly]));
        request.inputPath = { dataType: 'init' }; request.data = {};
        request.data.headerFiles = await utility.getSystemDataHeaders(request.modules, 'init', request.dataReleasePlan);
        request.data.dataFiles = await utility.getSystemDataFiles(request.modules, 'init', request.dataReleasePlan);
        await invoke(prep, 'buildHeaderInstances', request);
        await invoke(prep, 'resolveFileType', request);
        await invoke(prep, 'assignDataFilesToHeader', request);
        for (const header of Object.values(request.data.headers)) for (const file of Object.values(header.dataFiles)) {
            assert.equal(file.selectionFiles.length, 1);
            await invoke(js, 'processDataChunk', { header, files: file.list, selectionFiles: file.selectionFiles, outputPath: {} });
        }
    });
    f.add('optionalOwner', 'permissions');
    f.modules.optionalOwner.index = '10';
    const replaceRecords = (owner, records) => {
        const file = 'init-v001/records/permissionsData.js', source = 'module.exports = ' + JSON.stringify(records) + ';\n';
        fs.writeFileSync(path.join(f.modules[owner].path, 'data', file), source);
        f.manifests[owner].sections.permissions.files[file] = crypto.createHash('sha256').update(source).digest('hex');
        f.write(owner);
    };
    replaceRecords('optionalOwner', { record0: { code: 'inherited', name: 'Base' }, untouched: { code: 'untouched' } });
    f.add('authority', 'permissions', { prerequisites: [f.reference('optionalOwner', 'permissions')] });
    replaceRecords('authority', { record0: { name: 'Override' } });
    NODICS.getRawModule = name => name === 'authority' ? f.modules.authority : undefined;
    NODICS.getIndexedModules = () => new Map([['90', f.modules.authority]]);
    UTILS.resolveInstalledSourceDescriptor = name => f.modules[name];
    SERVICE.DefaultDataReleaseService = f.service;
    SERVICE.DefaultImportUtilityService = utility;
    SERVICE.DefaultPipelineService = { start: async (_name, request) => writes.push(structuredClone(request.models)) };
    await f.service.execute({ tenant: 'default', releaseRequest: { dataType: 'init', releaseCodes: ['authority:permissions'] } });
    assert.deepEqual(calls, [[['optionalOwner', false]], [['optionalOwner', true], ['authority', false]]]);
    assert.deepEqual(writes.map(batch => batch.map(row => row.code)), [['inherited', 'untouched'], ['inherited']]);
    assert.deepEqual(writes[1], [{ code: 'inherited', name: 'Override' }]);
    assert.equal(NODICS.getRawModule('optionalOwner'), undefined);
    assert.deepEqual(NODICS.getActiveModules(), ['authority']);
});

test('absent-owner dispatch rejects serialized descriptors, selector drift and changed canonical metadata or bytes', async t => {
    const saved = global.UTILS;
    t.after(() => { global.UTILS = saved; });
    const f = fixture(t); f.chain();
    NODICS.getRawModule = name => name === 'authority' ? f.modules.authority : undefined;
    SERVICE.DefaultDataReleaseService = f.service;
    global.UTILS = { resolveInstalledSourceDescriptor: name => f.modules[name] };
    const plan = await f.service.preparePlan(f.request);
    const release = plan.releases.find(row => row.moduleName === 'optionalOwner');
    const request = f.service.createImportRequest(f.request, { ...plan, releases: [release] }, false);
    const selected = request.dataReleasePlan[0];
    assert.equal(utility.modulesForImport(request.modules, request.dataReleasePlan)[0].name, 'optionalOwner');
    assert.throws(() => utility.modulesForImport(request.modules, structuredClone(request.dataReleasePlan)), /source owner is unavailable/);
    assert.throws(() => utility.declaredReleaseFiles(request.modules, [{ ...selected, path: f.modules.optionalOwner.path }], 'headers'), /source owner is unavailable/);
    selected.declaredFiles.push('init-v001/records/unselectedData.js');
    assert.throws(() => utility.declaredReleaseFiles(request.modules, request.dataReleasePlan, 'data'), /descriptor changed/);
    selected.declaredFiles.pop();
    const owner = f.modules.optionalOwner;
    f.modules.optionalOwner = { ...owner, canonicalIdentity: 'different/optionalOwner' };
    assert.throws(() => utility.declaredReleaseFiles(request.modules, request.dataReleasePlan, 'headers'), /source owner changed/);
    f.modules.optionalOwner = owner;
    fs.appendFileSync(path.join(owner.path, 'data', release.declaredFiles.find(file => file.includes('/records/'))), '\n// changed');
    assert.throws(() => utility.declaredReleaseFiles(request.modules, request.dataReleasePlan, 'data'), /source owner changed/);
    assert.equal(f.imports.length, 0); assert.equal(f.installations.length, 0);
});

test('late missing owner fails the entire preflight without any write', async t => {
    const f = fixture(t); f.chain();
    f.manifests.authority.sections.bootstrap.prerequisites.push({ moduleName: 'missing', sectionCode: 'permissions', version: '1.0.0', checksum: 'a'.repeat(64) });
    f.write('authority');
    await assert.rejects(f.service.installStartupReleases({}), /owner is unavailable/);
    assert.equal(f.imports.length, 0); assert.equal(f.installations.length, 0);
});

test('missing section, wrong type, wrong destination, wrong version and changed checksum fail closed', async t => {
    const f = fixture(t); f.chain();
    const section = f.manifests.optionalOwner.sections.permissions;
    const original = structuredClone(section);
    for (const mutate of [
        () => { delete f.manifests.optionalOwner.sections.permissions; },
        () => { section.dataType = 'core'; },
        () => { section.destinationRole = 'WASTE'; },
        () => { section.version = '1.0.0'; },
        () => { f.manifests.authority.sections.bootstrap.prerequisites[0].checksum = '0'.repeat(64); f.write('authority'); }
    ]) {
        f.manifests.optionalOwner.sections.permissions = section;
        Object.assign(section, original); mutate(); f.write('optionalOwner');
        await assert.rejects(f.service.installStartupReleases({}), /prerequisite|destination/);
        assert.equal(f.imports.length, 0); assert.equal(f.installations.length, 0);
    }
});

test('malformed and duplicate references are rejected rather than ignored', async t => {
    const f = fixture(t); f.chain();
    const ref = f.reference('optionalOwner', 'permissions');
    for (const value of [null, {}, [ref, ref], [{ ...ref, path: '/untrusted' }], [{ ...ref, partition: 'otherTenant' }],
        [{ ...ref, partition: null }], [{ ...ref, version: '0.0.0' }], [{ ...ref, checksum: '*' }], [{ ...ref, moduleName: '../owner' }]]) {
        f.manifests.authority.sections.bootstrap.prerequisites = value; f.write('authority');
        await assert.rejects(f.service.preparePlan(f.request), /manifest is invalid/);
    }
    assert.equal(f.installations.length, 0);
});

test('cycles and conflicting pins reject before writes', async t => {
    const f = fixture(t); f.chain();
    const bootstrap = f.reference('authority', 'bootstrap');
    f.manifests.optionalOwner.sections.permissions.prerequisites = [bootstrap]; f.write('optionalOwner');
    await assert.rejects(f.service.preparePlan(f.request), /cycle/);
    delete f.manifests.optionalOwner.sections.permissions.prerequisites; f.write('optionalOwner');
    const base = f.manifests.authority.sections.baseGroups;
    base.prerequisites = [{ ...base.prerequisites[0], checksum: 'b'.repeat(64) }]; f.write('authority');
    await assert.rejects(f.service.preparePlan(f.request), /Conflicting/);
    assert.equal(f.installations.length, 0);
});

test('expanded graph enforces the existing plan bound', async t => {
    const f = fixture(t); f.chain();
    f.service.configuration().maximumModulesPerRun = 4;
    await assert.rejects(f.service.preparePlan(f.request), /exceeds the release limit/);
    assert.equal(f.imports.length, 0);
});

test('changed bytes after planning fail before the first installation claim', async t => {
    const f = fixture(t); f.chain();
    const plan = await f.service.preparePlan(f.request);
    fs.appendFileSync(path.join(f.modules.optionalOwner.path, 'data/init-v001/records/enterpriseRolesData.js'), '// changed\n');
    await assert.rejects(f.service.executePreparedPlan(f.request, plan), /changed before execution/);
    assert.equal(f.imports.length, 0); assert.equal(f.installations.length, 0);
});

test('source changes during a predecessor import never dispatch the altered dependent', async t => {
    const f = fixture(t, request => {
        if (request.dataReleasePlan[0].sectionCode === 'permissions')
            fs.appendFileSync(path.join(f.modules.authority.path, 'data/init-v001/records/baseGroupsData.js'), '// changed\n');
    });
    f.chain();
    await assert.rejects(f.service.installStartupReleases({}), /source changed before dispatch/);
    assert.equal(f.imports.length, 1);
    assert.equal(f.installations[0].status, 'CURRENT');
    assert.equal(f.installations[1].status, 'FAILED');
    assert.equal(f.installations.length, 2);
});

test('CURRENT prerequisites are skipped even with forceCurrent and retain receipts unchanged', async t => {
    const f = fixture(t); f.chain();
    await f.service.installStartupReleases({});
    const plan = await f.service.preparePlan(f.request);
    const states = await f.service.operationReleases(plan, 'AVAILABLE');
    const forced = f.service.executablePlan(plan, states, true, new Set(states.map(item => item.releaseCode)));
    assert.deepEqual(forced.releases.map(item => item.releaseCode), ['authority:bootstrap'],
        'even independently qualified zero-work recovery cannot replay current prerequisites');
    const old = structuredClone(f.installations.filter(item => item.releaseCode !== 'authority:bootstrap'));
    f.installations.splice(f.installations.findIndex(item => item.releaseCode === 'authority:bootstrap'), 1);
    f.imports.length = 0;
    await f.service.execute({ ...f.request, releaseRequest: { ...f.request.releaseRequest, forceCurrent: true } });
    assert.equal(f.imports.length, 1);
    assert.deepEqual(f.installations.filter(item => item.releaseCode !== 'authority:bootstrap'), old);
});

test('existing owner Init receipt blocks successor bootstrap on startup but permits explicit operator execution', async t => {
    const f = fixture(t); f.chain();
    const old = { code: 'testEnvironment:default:authority:legacy:init', tenant: 'default',
        environment: 'testEnvironment', moduleName: 'authority', releaseCode: 'authority:legacy',
        dataType: 'init', status: 'CURRENT', version: '0.0.1', checksum: '1'.repeat(64) };
    f.installations.push(old);
    await assert.rejects(f.service.installStartupReleases({}), /operator-selected/);
    assert.equal(f.imports.length, 0); assert.deepEqual(f.installations, [old]);
    await f.service.execute(f.request);
    assert.deepEqual(f.installations[0], old);
});

test('startup-disabled maintenance permits governed manual migration, default partition first', async t => {
    const f = fixture(t); partitionChain(f);
    const old = { code: 'testEnvironment:default:authority:legacy:init', tenant: 'default',
        environment: 'testEnvironment', moduleName: 'authority', releaseCode: 'authority:legacy',
        dataType: 'init', status: 'CURRENT', version: '0.0.1', checksum: '1'.repeat(64) };
    f.installations.push(old);
    await assert.rejects(f.service.installStartupReleases({}), /operator-selected/);
    const policy = f.service.configuration().types.init;
    policy.enabled = true;
    policy.startupExecution = false;
    for (const tenant of ['default', 'business'])
        assert.deepEqual(await f.service.installStartupReleases({ tenant }), { skipped: true, reason: 'INIT_DISABLED' });
    assert.equal(f.imports.length, 0); assert.deepEqual(f.installations, [old]);
    const preflight = await f.service.preflight(f.request);
    assert.equal(preflight.data.validation.ready, true);
    assert.equal(preflight.data.validation.importExecuted, false);
    const business = { ...f.request, tenant: 'business' };
    await assert.rejects(f.service.preflight(business), /Referenced partition prerequisite is not current/);
    await assert.rejects(f.service.execute(business), /Referenced partition prerequisite is not current/);
    policy.operatorExecution = false;
    await assert.rejects(f.service.execute(f.request), /Operator execution is disabled/);
    policy.operatorExecution = true;
    policy.enabled = false;
    await assert.rejects(f.service.preflight(f.request), /Data release type is disabled/);
    await assert.rejects(f.service.execute(f.request), /Data release type is disabled/);
    policy.enabled = true;
    f.service.configuration().targetValidators = { authority: 'MaintenanceAdmission' };
    SERVICE.MaintenanceAdmission = { validateImportTarget: async () => false };
    await assert.rejects(f.service.execute(f.request), /not admitted/);
    SERVICE.MaintenanceAdmission.validateImportTarget = async () => true;
    await assert.rejects(f.service.execute({ ...f.request, releaseRequest: { ...f.request.releaseRequest,
        expectedReleases: { 'authority:bootstrap': '9.0.0' }
    } }), /changed after selection/);
    assert.equal(f.imports.length, 0); assert.deepEqual(f.installations, [old]);
    await f.service.execute(f.request);
    assert.deepEqual(f.installations[0], old);
    const authorityReceipts = structuredClone(f.installations);
    assert.equal((await f.service.preflight(business)).data.validation.ready, true);
    await f.service.execute(business);
    assert.deepEqual(f.installations.filter(item => item.tenant === 'default'), authorityReceipts);
    const beforeRestore = structuredClone(f.installations);
    const imported = f.imports.length;
    policy.startupExecution = true;
    for (const tenant of ['default', 'business'])
        assert.deepEqual(await f.service.installStartupReleases({ tenant }), { skipped: true, reason: 'INIT_CURRENT' });
    assert.equal(f.imports.length, imported); assert.deepEqual(f.installations, beforeRestore);
});

test('missing dependency receipt beneath CURRENT parent is not silently recreated by startup', async t => {
    const f = fixture(t); f.chain(); await f.service.installStartupReleases({});
    f.installations.splice(f.installations.findIndex(item => item.releaseCode === 'optionalOwner:permissions'), 1);
    const before = structuredClone(f.installations); f.imports.length = 0;
    await assert.rejects(f.service.installStartupReleases({}), /operator-selected/);
    assert.deepEqual(f.installations, before); assert.equal(f.imports.length, 0);
});

test('concurrent prerequisite receipt loss stops before the dependent claim', async t => {
    const f = fixture(t, request => {
        if (request.dataReleasePlan[0].sectionCode === 'accessGroups')
            f.installations.splice(f.installations.findIndex(item => item.releaseCode === 'authority:baseGroups'), 1);
    });
    f.chain();
    await assert.rejects(f.service.installStartupReleases({}), /prerequisite is not current/);
    assert.equal(f.installations.some(item => item.releaseCode === 'authority:bootstrap'), false);
});

test('adding dependency metadata changes only the new parent checksum and old payloads are untouched', async t => {
    const f = fixture(t);
    const parent = f.add('authority', 'bootstrap', { selectionPolicy: 'DEFAULT' });
    const section = f.manifests.authority.sections.bootstrap;
    const legacyHash = crypto.createHash('sha256').update(Object.keys(section.files).sort().map(file => file + ':' + section.files[file]).join('|')).digest('hex');
    assert.equal(parent.checksum, legacyHash);
    const dependency = f.add('optionalOwner', 'permissions');
    section.prerequisites = [dependency]; f.write('authority');
    assert.notEqual(f.reference('authority', 'bootstrap').checksum, parent.checksum);
    assert.deepEqual(f.reference('optionalOwner', 'permissions'), dependency);
});

test('Init prerequisites never authorize Core startup or request-supplied dependencies', async t => {
    const f = fixture(t);
    const core = f.add('optionalOwner', 'permissions', { dataType: 'core' });
    f.add('authority', 'bootstrap', { selectionPolicy: 'DEFAULT', prerequisites: [core] });
    await assert.rejects(f.service.installStartupReleases({}), /different data type/);
    delete f.manifests.authority.sections.bootstrap.prerequisites; f.write('authority');
    const plan = await f.service.preparePlan({ ...f.request, releaseRequest: { ...f.request.releaseRequest, prerequisites: [core] } });
    assert.deepEqual(plan.releases.map(item => item.releaseCode), ['authority:bootstrap']);
    assert.equal(f.imports.length, 0);
});

test('late owner admission failure rejects before all installation claims', async t => {
    const f = fixture(t); f.chain();
    f.service.configuration().targetValidators = { authority: 'TestAdmission' };
    SERVICE.TestAdmission = { validateImportTarget: async metadata => metadata.schemaName !== 'enterpriseRoles' };
    await assert.rejects(f.service.installStartupReleases({}), /not admitted/);
    assert.equal(f.imports.length, 0); assert.equal(f.installations.length, 0);
});

test('RUNNING prerequisite prevents any replay or receipt takeover', async t => {
    const f = fixture(t); f.chain();
    const plan = await f.service.preparePlan(f.request);
    const release = plan.releases[0];
    const current = { code: f.service.installationCode('default', release), tenant: 'default', environment: 'testEnvironment',
        moduleName: release.moduleName, dataType: 'init', releaseCode: release.releaseCode, status: 'RUNNING' };
    f.installations.push(current);
    await assert.rejects(f.service.execute(f.request), /still running/);
    assert.deepEqual(f.installations, [current]); assert.equal(f.imports.length, 0);
});

test('partial, failed, missing and zero-work outcomes cannot unlock dependent imports', async t => {
    const f = fixture(t); f.chain();
    for (const run of [undefined, { status: 'FAILED' }, { status: 'COMPLETED', summary: { recordsSucceeded: 1, recordsFailed: 1 } },
        { status: 'COMPLETED', summary: { recordsSucceeded: 0, recordsFailed: 0 } },
        { status: 'COMPLETED', summary: { recordsSucceeded: 1 } },
        { status: 'COMPLETED', summary: { recordsSucceeded: '1', recordsFailed: 0 } },
        { status: 'COMPLETED', summary: { recordsSucceeded: 1, recordsFailed: 0 }, failures: [{}] }]) {
        f.installations.length = 0; f.imports.length = 0;
        SERVICE.DefaultImportService.importInitData = async request => { f.imports.push(request); request.importRun = run; return {}; };
        await assert.rejects(f.service.installStartupReleases({}), /did not complete successfully/);
        assert.equal(f.imports.length, 1); assert.equal(f.installations.length, 1);
        assert.equal(f.installations[0].status, 'FAILED');
    }
});

test('dependency receipts are isolated by tenant and environment', async t => {
    const f = fixture(t); f.chain();
    await f.service.installStartupReleases({ tenant: 'otherTenant' });
    assert.equal(f.installations.length, 5);
    await f.service.installStartupReleases({ tenant: 'default' });
    assert.equal(f.installations.length, 10);
    const release = (await f.service.preparePlan(f.request)).releases.at(-1);
    const foreign = f.installations.find(item => item.code === 'testEnvironment:default:optionalOwner:permissions:init');
    foreign.code = foreign.code.replace('testEnvironment:', 'otherEnvironment:');
    await assert.rejects(f.service.assertPrerequisiteReceipts({ tenant: 'default', dataType: 'init' }, release), /not current/);
});

test('actual Profile graph resolves absent owners from restricted Platform roots without activation or row writes', async () => {
    const previous = { CONFIG: global.CONFIG, NODICS: global.NODICS, SERVICE: global.SERVICE, UTILS: global.UTILS };
    const project = fs.mkdtempSync(path.join(os.tmpdir(), 'nodics-restricted-source-project-'));
    try {
        const repo = path.resolve(__dirname, '../../../../../..');
        fs.writeFileSync(path.join(project, 'package.json'), JSON.stringify({ name: 'independentSourceProject', index: '1000',
            nodics: { kind: 'application', runtimeModule: true, loadableByNodicsModuleLoader: true } }));
        const discovery = require('../../../../nConfig/src/utils/utils');
        const modules = {}, records = [];
        for (const root of ['nodics.foundation', 'nodics.platform'])
            discovery.collectModuleRecords(path.join(repo, root), records, null);
        discovery.indexModuleRecords(records, modules);
        const rawSnapshot = structuredClone(modules);
        const f = releaseExecution({ modules, runtimeRole: 'PLATFORM' });
        NODICS.getActiveModules = () => ['profile'];
        NODICS.getIndexedModules = () => new Map([['profile', modules.profile]]);
        NODICS.getNodicsHome = () => path.join(repo, 'nodics.foundation');
        NODICS.getCustomHome = () => project;
        global.UTILS = discovery;
        SERVICE.DefaultDataReleaseService = f.service;
        SERVICE.DefaultImportUtilityService = utility;
        assert.equal(NODICS.getRawModule('cart'), undefined);
        const config = CONFIG.get;
        CONFIG.get = key => key === 'bootstrapIdentity' ? {
            source: 'test', adminPassword: 'test-admin-password-12345', servicePassword: 'test-service-password-12345',
            serviceApiKey: 'test-service-api-key-value-12345678901234567890'
        } : key === 'authSecurity' ? { ...require('../../../../nAuth/config/properties').authSecurity,
            compatibility: { ...require('../../../../nAuth/config/properties').authSecurity.compatibility, allowLocalBootstrapIdentity: true }
        } : config(key);
        const targets = [];
        f.service.configuration().targetValidators = { profile: 'StructuralAdmission' };
        SERVICE.StructuralAdmission = { validateImportTarget: async metadata => {
            targets.push(metadata);
            assert.equal(metadata.moduleName, 'profile');
            assert.equal(typeof metadata.schemaName, 'string');
            assert.equal(metadata.model, undefined);
            return true;
        } };
        const request = { tenant: 'default', releaseRequest: { dataType: 'init', releaseCodes: ['profile:init-v001'] } };
        const plan = await f.service.preparePlan(request);
        const catalogue = plan.releases.filter(item => item.sectionCode === 'permissionCatalogue');
        const manifest = JSON.parse(fs.readFileSync(path.join(modules.profile.path, 'data/manifest.json'), 'utf8'));
        const pinned = manifest.sections['init-v001'].prerequisites;
        const catalogues = pinned.filter(item => item.sectionCode === 'permissionCatalogue');
        assert(catalogues.length >= 54, 'the full capability vocabulary remains explicitly pinned');
        assert.equal(catalogue.length, catalogues.length);
        assert.equal(plan.prerequisiteReferences.length, pinned.length);
        assert.equal(plan.releases.length, pinned.length + 1);
        assert.equal(plan.releases.at(-1).releaseCode, 'profile:init-v001');
        assert.equal(plan.releases.at(-1).version, '0.0.8');
        const cart = plan.releases.find(release => release.moduleName === 'cart');
        assert(cart, 'the real absent Cart prerequisite is resolved without loading Cart');
        const cartRequest = f.service.createImportRequest(request, { ...plan, releases: [cart] }, false);
        cartRequest.inputPath = { dataType: 'init' };
        const headers = await utility.getSystemDataHeaders(cartRequest.modules, 'init', cartRequest.dataReleasePlan);
        const files = await utility.getSystemDataFiles(cartRequest.modules, 'init', cartRequest.dataReleasePlan);
        assert(Object.keys(headers).length > 0); assert(Object.keys(files).length > 0);
        assert.deepEqual(utility.filterDeclaredReleaseFiles(files, cartRequest.dataReleasePlan, 'data'), files);
        cartRequest.data = { headerFiles: headers, dataFiles: files };
        const prep = { ...initializer, LOG: { debug() {} } };
        await invoke(prep, 'buildHeaderInstances', cartRequest);
        await invoke(prep, 'resolveFileType', cartRequest);
        await invoke(prep, 'assignDataFilesToHeader', cartRequest);
        assert(Object.values(cartRequest.data.headers).every(header =>
            header.options.moduleName === 'profile' && Object.values(header.dataFiles).every(file => file.selectionFiles.length > 0)));
        const positions = new Map(plan.releases.map((item, index) => [item.releaseCode, index]));
        const dependentIdentityReleases = plan.releases.filter(item =>
            /(accessGroups|enterpriseRoles|businessAccessGroups|businessAccessRoles|specialAccessGroups|specialAccessRoles)$/.test(item.sectionCode));
        assert(catalogue.every(permission => dependentIdentityReleases.every(dependent =>
            positions.get(permission.releaseCode) < positions.get(dependent.releaseCode))),
            'all independent permission catalogues precede every dependent group or role');
        for (const release of plan.releases) {
            assert.equal(release.dataType, 'init');
            assert.match(release.sourceRoot, /^init-v\d{3}$/);
            for (const prerequisite of release.prerequisites)
                assert(positions.get(prerequisite.moduleName + ':' + prerequisite.sectionCode) < positions.get(release.releaseCode));
        }
        const result = await f.service.preflight(request);
        assert.equal(result.data.validation.ready, true);
        assert.equal(result.data.validation.importExecuted, false);
        assert(targets.length > pinned.length);
        assert.equal(f.imports.length, 0); assert.equal(f.installations.length, 0);
        assert.deepEqual(NODICS.getActiveModules(), ['profile']);

        assert(catalogues.every(item => item.partition === 'DEFAULT'), 'authority references must be explicit in the actual parent manifests');
        const tenantRequest = { ...request, tenant: 'businessTenant' };
        await assert.rejects(f.service.preparePlan(tenantRequest), /Referenced partition prerequisite is not current/);
        // Seed only receipt evidence, never execute actual repository payloads in this offline regression.
        for (const release of plan.releases) f.installations.push({
            code: f.service.installationCode('default', release), tenant: 'default', environment: 'testEnvironment',
            moduleName: release.moduleName, releaseCode: release.releaseCode, dataType: 'init',
            version: release.version, checksum: release.checksum, status: 'CURRENT'
        });
        const tenantPlan = await f.service.preparePlan(tenantRequest);
        assert(tenantPlan.referenceReleases.length >= catalogues.length);
        assert(tenantPlan.releases.every(item => !['permissionCatalogue', 'enterpriseRoles'].includes(item.sectionCode)));
        assert(tenantPlan.releases.some(item => item.sectionCode === 'accessGroups'));
        const shared = tenantPlan.releases.find(item => tenantPlan.referenceReleases.some(other => item.releaseCode === other.releaseCode));
        assert(shared, 'group dependency closure must retain separate default and business nodes');
        const foreign = structuredClone(f.installations);
        SERVICE.DefaultImportService.importInitData = async importRequest => {
            assert.equal(importRequest.tenant, 'businessTenant');
            f.imports.push(importRequest);
            importRequest.importRun = { status: 'COMPLETED', summary: { recordsSucceeded: 1, recordsFailed: 0 } };
            return {};
        };
        const closureReceipt = f.installations.find(item => item.releaseCode === shared.releaseCode);
        const closureIndex = f.installations.indexOf(closureReceipt);
        f.installations.splice(closureIndex, 1);
        await assert.rejects(f.service.executePreparedPlan(tenantRequest, tenantPlan), /Referenced partition prerequisite is not current/);
        assert.equal(f.imports.length, 0);
        f.installations.splice(closureIndex, 0, closureReceipt);
        for (const mutation of [{ status: 'FAILED' }, { status: 'RUNNING' }, { checksum: '0'.repeat(64) }, { version: '9.0.0' }]) {
            const saved = { ...closureReceipt };
            Object.assign(closureReceipt, mutation);
            await assert.rejects(f.service.executePreparedPlan(tenantRequest, tenantPlan), /Referenced partition prerequisite is not current/);
            Object.assign(closureReceipt, saved);
            assert.equal(f.imports.length, 0);
        }
        await f.service.executePreparedPlan(tenantRequest, tenantPlan);
        assert.equal(f.imports.length, tenantPlan.releases.length);
        assert.deepEqual(f.installations.filter(item => item.tenant === 'default'), foreign);
        assert.equal(f.installations.filter(item => item.tenant === 'businessTenant').length, tenantPlan.releases.length);
        assert.deepEqual(modules, rawSnapshot);
        assert.equal(NODICS.getRawModule('cart'), undefined);
        assert.deepEqual(NODICS.getActiveModules(), ['profile']);
        assert.deepEqual([...NODICS.getIndexedModules().values()], [modules.profile]);
    } finally { Object.assign(global, previous); fs.rmSync(project, { recursive: true, force: true }); }
});

/** Pins global catalogues/roles while allowing the same group closure in both partitions. */
function partitionChain(f) {
    const permission = { ...f.add('optionalOwner', 'permissions'), partition: 'DEFAULT' };
    const base = f.add('authority', 'baseGroups', { prerequisites: [permission] });
    const group = f.add('optionalOwner', 'accessGroups', { prerequisites: [base] });
    const role = { ...f.add('optionalOwner', 'enterpriseRoles', { prerequisites: [group] }), partition: 'DEFAULT' };
    f.add('authority', 'bootstrap', { selectionPolicy: 'DEFAULT', prerequisites: [permission, base, group, role] });
}

test('DEFAULT references preserve default bootstrap and reuse exact foreign closure without foreign writes', async t => {
    const f = fixture(t); partitionChain(f);
    await f.service.installStartupReleases({ tenant: 'default' });
    assert.equal(f.imports.length, 5);
    const original = structuredClone(f.installations);
    f.imports.length = 0;
    const request = { ...f.request, tenant: 'business' };
    const plan = await f.service.preparePlan(request);
    assert.equal(plan.referenceReleases.length, 4);
    assert.deepEqual(plan.releases.map(item => item.sectionCode), ['baseGroups', 'accessGroups', 'bootstrap']);
    const preflight = await f.service.preflight(request);
    assert.equal(preflight.data.referenceReleases.length, 4);
    assert(preflight.data.referenceReleases.every(item => item.referenceOnly && item.tenant === 'default' && item.status === 'CURRENT'));
    await f.service.installStartupReleases({ tenant: 'business' });
    assert.equal(f.imports.length, 3);
    assert(f.imports.every(item => item.tenant === 'business'));
    assert.deepEqual(f.installations.filter(item => item.tenant === 'default'), original);
    assert.deepEqual(await f.service.installStartupReleases({ tenant: 'business' }), { skipped: true, reason: 'INIT_CURRENT' });
    const forced = f.service.executablePlan(plan, await f.service.operationReleases(plan, 'AVAILABLE'), true,
        new Set(plan.releases.map(item => item.releaseCode)));
    assert.deepEqual(forced.releases.map(item => item.sectionCode), ['bootstrap']);
});

test('foreign closure receipts fail closed before any tenant claim, including with forceCurrent', async t => {
    const f = fixture(t); partitionChain(f);
    await f.service.installStartupReleases({ tenant: 'default' });
    const original = structuredClone(f.installations);
    f.imports.length = 0;
    const request = { ...f.request, tenant: 'business', releaseRequest: { ...f.request.releaseRequest, forceCurrent: true } };
    const plan = await f.service.preparePlan(request);
    for (const mutate of [
        receipt => { f.installations.splice(f.installations.indexOf(receipt), 1); },
        receipt => { receipt.status = 'FAILED'; }, receipt => { receipt.status = 'RUNNING'; },
        receipt => { receipt.version = '9.0.0'; }, receipt => { receipt.checksum = 'a'.repeat(64); },
        receipt => { receipt.code = receipt.code.replace('testEnvironment:', 'otherEnvironment:'); }
    ]) {
        f.installations.splice(0, f.installations.length, ...structuredClone(original));
        mutate(f.installations.find(item => item.releaseCode === 'authority:baseGroups'));
        const before = structuredClone(f.installations);
        await assert.rejects(f.service.preparePlan(request), /Referenced partition prerequisite is not current/);
        await assert.rejects(f.service.executePreparedPlan(request, plan), /Referenced partition prerequisite is not current/);
        assert.deepEqual(f.installations, before); assert.equal(f.imports.length, 0);
    }
});

test('foreign receipt loss during execution stops before the next tenant claim', async t => {
    const f = fixture(t, request => {
        if (request.tenant === 'business') f.installations.splice(f.installations.findIndex(item =>
            item.tenant === 'default' && item.releaseCode === 'optionalOwner:enterpriseRoles'), 1);
    });
    partitionChain(f);
    await f.service.installStartupReleases({ tenant: 'default' });
    f.imports.length = 0;
    await assert.rejects(f.service.installStartupReleases({ tenant: 'business' }), /Referenced partition prerequisite is not current/);
    assert.equal(f.imports.length, 1);
    assert.equal(f.installations.filter(item => item.tenant === 'business').length, 1);
    assert.equal(f.installations.find(item => item.tenant === 'business').status, 'CURRENT');
});

test('DEFAULT metadata is canonical, checksummed, and cannot be supplied by a request', async t => {
    const f = fixture(t); f.chain();
    const ref = f.reference('optionalOwner', 'permissions');
    const scoped = f.service.validatePrerequisites([{ partition: 'DEFAULT', ...ref }])[0];
    assert.deepEqual(Object.keys(scoped), ['moduleName', 'sectionCode', 'version', 'checksum', 'partition']);
    const original = f.reference('authority', 'bootstrap').checksum;
    f.manifests.authority.sections.bootstrap.prerequisites[0] = scoped; f.write('authority');
    assert.notEqual(f.reference('authority', 'bootstrap').checksum, original);
    f.manifests.authority.sections.bootstrap.prerequisites[0] = ref; f.write('authority');
    const plan = await f.service.preparePlan({ ...f.request, tenant: 'business', releaseRequest: {
        ...f.request.releaseRequest, prerequisites: [scoped], partition: 'DEFAULT'
    } });
    assert.equal(plan.referenceReleases.length, 0);
    assert(plan.releases.every(item => item.tenant === 'business'));
});

test('DEFAULT follows the framework partition configuration and fails closed when unavailable', async t => {
    const f = fixture(t); partitionChain(f);
    const get = CONFIG.get;
    CONFIG.get = key => key === 'defaultTenant' ? 'authorityPartition' : get(key);
    await f.service.installStartupReleases({ tenant: 'authorityPartition' });
    const original = structuredClone(f.installations);
    await f.service.installStartupReleases({ tenant: 'business' });
    assert.deepEqual(f.installations.filter(item => item.tenant === 'authorityPartition'), original);
    assert.equal(f.installations.some(item => item.tenant === 'default'), false);
    const plan = await f.service.preparePlan({ ...f.request, tenant: 'business' });
    CONFIG.get = key => key === 'defaultTenant' ? 'changedPartition' : get(key);
    await assert.rejects(f.service.executePreparedPlan({ ...f.request, tenant: 'business' }, plan), /partition changed after planning/);
    CONFIG.get = key => key === 'defaultTenant' ? undefined : get(key);
    await assert.rejects(f.service.preparePlan({ ...f.request, tenant: 'business' }), /Default prerequisite partition is unavailable/);
});

test('changed foreign dependency source cannot rely on an old CURRENT receipt', async t => {
    const f = fixture(t); partitionChain(f);
    await f.service.installStartupReleases({ tenant: 'default' });
    f.imports.length = 0;
    const request = { ...f.request, tenant: 'business' };
    const plan = await f.service.preparePlan(request);
    const before = structuredClone(f.installations);
    fs.appendFileSync(path.join(f.modules.optionalOwner.path, 'data/init-v001/records/permissionsData.js'), '// changed\n');
    await assert.rejects(f.service.executePreparedPlan(request, plan), /changed before execution/);
    assert.equal(f.imports.length, 0); assert.deepEqual(f.installations, before);
});
