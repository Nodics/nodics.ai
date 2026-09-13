/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module import/test/layeredReleaseCompositionContract
 * @description Runs actual release discovery, planning, header assignment and JS processing with in-memory installation and persistence boundaries.
 * @layer test
 * @owner import
 */
const assert = require('node:assert/strict');
const test = require('node:test');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const releases = require('../src/service/release/defaultDataReleaseService');
const utility = require('../src/service/import/defaultImportUtilityService');
const initializer = require('../src/service/system/defaultSystemDataImportInitializerService');
const processor = require('../../jsImport/src/service/init/defaultJsFileDataProcessService');
const common = require('../../../../nCommon/src/utils/utils');

test('project release inherits matching current source fields without replaying unrelated baseline records', async () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'nodics-layered-releases-'));
    const owners = [{ name: 'base', index: '10', path: path.join(root, 'base') },
        { name: 'project', index: '20', path: path.join(root, 'project') }];
    const installations = new Map(), models = new Map(), writes = [], calls = [];
    const quiet = { debug() {}, info() {}, warn() {}, error() {} };
    const service = Object.assign({}, releases, { activeExecutions: new Map() });
    const prep = Object.assign({}, initializer, { LOG: quiet });
    const js = Object.assign({}, processor, { LOG: quiet });
    const writeRelease = (owner, wave, records) => {
        const sourceRoot = 'core-v' + String(wave).padStart(3, '0');
        const releaseRoot = path.join(owner.path, 'data', sourceRoot);
        fs.mkdirSync(path.join(releaseRoot, 'headers'), { recursive: true });
        fs.mkdirSync(path.join(releaseRoot, 'records'), { recursive: true });
        fs.writeFileSync(path.join(releaseRoot, 'headers', 'stockHeader.js'),
            'module.exports = { inventory: { stock: { options: { enabled: true, schemaName: "stock", operation: "saveAll", dataFilePrefix: "stockData" } } } };');
        fs.writeFileSync(path.join(releaseRoot, 'records', 'stockData.js'), 'module.exports = ' + JSON.stringify(records));
        const manifestFile = path.join(owner.path, 'data', 'manifest.json');
        const manifest = fs.existsSync(manifestFile) ? JSON.parse(fs.readFileSync(manifestFile)) : { contractVersion: 2, module: owner.name, sections: {} };
        manifest.sections[sourceRoot] = { kind: 'DATA_RELEASE', dataType: 'core', sourceRoot, version: wave + '.0.0' };
        fs.writeFileSync(manifestFile, JSON.stringify(manifest));
    };
    const invoke = (object, method, request) => new Promise((resolve, reject) => object[method](request, {}, {
        nextSuccess: resolve, error: (request, response, error) => reject(error), stop: resolve
    }));
    try {
        writeRelease(owners[0], 1, { record0: { code: 'first', name: 'Base', flags: ['a', 'b'] }, untouched: { code: 'untouched', name: 'Baseline' } });
        writeRelease(owners[1], 1, { record0: { name: 'Partner', flags: ['c'] } });
        global.NODICS = { getActiveModules: () => owners.map(owner => owner.name), getRawModule: name => owners.find(owner => owner.name === name),
            getIndexedModules: () => new Map(owners.map(owner => [owner.index, owner])), isModuleActive: () => true,
            getSelectedEnvironmentName: () => 'test' };
        global.CONFIG = { get: name => name === 'data' ? { dataReleases: { types: { core: { enabled: true, operatorExecution: true } } } } : undefined };
        global.CLASSES = { NodicsError: class extends Error { constructor(code, message) { super(message); this.code = code; } },
            DataImportError: class extends Error { constructor(code, message) { super(message || String(code)); this.code = code; } } };
        global.UTILS = Object.assign({}, common, { isBlank: value => value === undefined || value === null || value === '' });
        global.SERVICE = {
            DefaultImportUtilityService: utility,
            DefaultDataInstallationService: {
                get: async request => ({ result: [...installations.values()].filter(value => !request.query.code || value.code === request.query.code) }),
                save: async request => { installations.set(request.model.code, request.model); return request.model; },
                update: async request => { installations.set(request.model.code, request.model); return request.model; }
            },
            DefaultPipelineService: { start: async (name, request) => {
                writes.push(request.models.map(model => ({ ...model })));
                for (const model of request.models) {
                    assert(model.code, 'inherited required code must reach the existing persistence pipeline');
                    models.set(model.code, { ...model });
                }
            } },
            DefaultImportService: { importCoreData: async request => {
                calls.push(request.dataReleasePlan.map(release => [release.releaseCode, release.sourceOnly]));
                request.inputPath = { dataType: 'core' }; request.data = {};
                request.data.headerFiles = await utility.getSystemDataHeaders(request.modules, 'core', request.dataReleasePlan);
                request.data.dataFiles = await utility.getSystemDataFiles(request.modules, 'core', request.dataReleasePlan);
                await invoke(prep, 'buildHeaderInstances', request);
                await invoke(prep, 'resolveFileType', request);
                await invoke(prep, 'assignDataFilesToHeader', request);
                for (const header of Object.values(request.data.headers)) for (const file of Object.values(header.dataFiles)) {
                    await invoke(js, 'processDataChunk', { header, files: file.list, selectionFiles: file.selectionFiles, outputPath: {} });
                }
                if (request.dataReleasePlan.every(release => release.moduleName === 'base')) models.get('untouched').name = 'Operator edit';
                request.importRun = { runId: 'run-' + calls.length, status: 'COMPLETED' };
                return { importRun: request.importRun };
            } }
        };
        const request = codes => ({ tenant: 'tenant', releaseRequest: { dataType: 'core', releaseCodes: codes } });
        await assert.rejects(service.preflight(request(['project:core-v001'])), /Install the matching lower-layer release/);
        await service.preflight(request(['project:core-v001', 'base:core-v001']));
        const result = await service.execute(request(['project:core-v001', 'base:core-v001']));
        assert.equal(result.data.releases.length, 2);
        assert.deepEqual(calls, [[['base:core-v001', false]], [['base:core-v001', true], ['project:core-v001', false]]]);
        assert.deepEqual(writes.map(batch => batch.map(model => model.code)), [['first', 'untouched'], ['first']]);
        assert.deepEqual(models.get('first'), { code: 'first', name: 'Partner', flags: ['c'] });
        assert.equal(models.get('untouched').name, 'Operator edit');
        await assert.rejects(service.execute(request(['base:core-v001', 'project:core-v001'])), /already current/);
        assert.equal(calls.length, 2);
        writeRelease(owners[0], 2, { record0: { code: 'second', name: 'Next base', flags: ['new'] } });
        writeRelease(owners[1], 2, { record0: { name: 'Next partner' } });
        await service.execute(request(['project:core-v002', 'base:core-v002']));
        assert.equal(calls.length, 4);
        assert.deepEqual(models.get('second'), { code: 'second', name: 'Next partner', flags: ['new'] });
        assert.equal(models.get('first').name, 'Partner', 'source code change must not rename old persisted identity');
        assert.deepEqual(service.discoverReleases('core').map(release => release.releaseCode),
            ['base:core-v001', 'project:core-v001', 'base:core-v002', 'project:core-v002'], 'fresh installs apply each version before advancing to the next delta');
        const plan = await service.preparePlan(request(['project:core-v002']));
        const base = plan.sourceReleases.find(release => release.releaseCode === 'base:core-v002');
        installations.get(service.installationCode('tenant', base)).status = 'RUNNING';
        await assert.rejects(service.resolveCompositionSources(plan, plan.releases[0]), /Install the matching lower-layer release/);
        installations.get(service.installationCode('tenant', base)).status = 'CURRENT';
        fs.appendFileSync(path.join(owners[0].path, 'data/core-v002/records/stockData.js'), '\n// immutable change');
        const changed = await service.preparePlan(request(['project:core-v002']));
        await assert.rejects(service.resolveCompositionSources(changed, changed.releases[0]), /changed without a version change/);
    } finally { fs.rmSync(root, { recursive: true, force: true }); }
});


test('startup evaluates init deltas on every run and refuses running or edited applied releases', async () => {
    const release = { releaseCode: 'owner:init-v001', moduleName: 'owner', dataType: 'init', version: '0.0.0', checksum: 'initial' };
    let state = 'NOT_INSTALLED', checksum = undefined, executions = 0;
    const service = Object.assign({}, releases, {
        configuration: () => ({ types: { init: { enabled: true, operatorExecution: false } } }),
        discoverReleases: () => [release], isDestinationCompatible: () => true,
        preparePlan: async request => { assert.equal(request.releaseRequest.dataType, 'init'); return { releases: [release] }; },
        operationReleases: async () => [{ ...release, status: state, installedVersion: checksum ? release.version : undefined, installedChecksum: checksum }],
        executePreparedPlan: async () => { if (state === 'RUNNING') throw new Error('still running'); executions++; state = 'CURRENT'; checksum = release.checksum; return { installed: true }; }
    });
    assert.deepEqual(await service.installStartupReleases({ modules: ['owner'] }), { installed: true });
    assert.deepEqual(await service.installStartupReleases({ modules: ['owner'] }), { skipped: true, reason: 'INIT_CURRENT' });
    assert.equal(executions, 1);
    release.checksum = 'edited'; state = 'UPDATE_AVAILABLE';
    await assert.rejects(service.installStartupReleases({ modules: ['owner'] }), /must not replay edited releases/);
    release.version = '0.0.1';
    service.operationReleases = async () => [{ ...release, status: state, installedVersion: '0.0.0', installedChecksum: checksum }];
    await service.installStartupReleases({ modules: ['owner'] });
    assert.equal(executions, 2);
    state = 'RUNNING';
    await assert.rejects(service.installStartupReleases({ modules: ['owner'] }), /still running/);
});
