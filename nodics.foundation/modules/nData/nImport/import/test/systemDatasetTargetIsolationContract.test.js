/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module import/test/systemDatasetTargetIsolationContract
 * @description Exercises target-qualified header composition and actual JavaScript records across source owners with identical filenames and exported keys.
 * @layer test
 * @owner import
 */
const assert = require('node:assert/strict');
const test = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const initializer = require('../src/service/system/defaultSystemDataImportInitializerService');
const utility = require('../src/service/import/defaultImportUtilityService');
const processor = require('../../jsImport/src/service/init/defaultJsFileDataProcessService');

test('identical dataset filenames and record keys compose only within their header target', async () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'nodics-dataset-targets-'));
    try {
        const owners = [];
        const headers = [], files = [];
        for (const [name, target, record] of [
            ['baseInventory', 'inventory', { code: 'inventoryItem', name: 'Base', tags: ['a', 'b'] }],
            ['baseCms', 'cms', { code: 'cmsPage', name: 'Page' }],
            ['projectInventory', 'inventory', { name: 'Project', tags: ['c'] }]
        ]) {
            const owner = { name, path: path.join(root, name) }; owners.push(owner);
            const release = path.join(owner.path, 'data', 'core-v001');
            fs.mkdirSync(path.join(release, 'headers'), { recursive: true });
            fs.mkdirSync(path.join(release, 'records'), { recursive: true });
            const header = path.join(release, 'headers', 'sharedHeader.js');
            const file = path.join(release, 'records', 'sharedData.js');
            fs.writeFileSync(header, 'module.exports = ' + JSON.stringify({ [target]: { entry: { options: {
                enabled: true, schemaName: target === 'inventory' ? 'stock' : 'page', operation: 'saveAll', dataFilePrefix: 'sharedData'
            } } } }));
            fs.writeFileSync(file, 'module.exports = ' + JSON.stringify({ record0: record }));
            headers.push(header); files.push(file);
        }
        global.SERVICE = { DefaultImportUtilityService: utility };
        global.NODICS = { getRawModule: name => owners.find(owner => owner.name === name),
            getIndexedModules: () => new Map(owners.map((owner, index) => [index, owner])), isModuleActive: () => true };
        global.CLASSES = { DataImportError: class extends Error { constructor(code, message) { super(message); this.code = code; } } };
        const service = Object.assign({}, initializer, { LOG: { debug() {} } });
        const request = { modules: owners.map(owner => owner.name), inputPath: { dataType: 'core' }, data: {
            headerFiles: { sharedHeader_js: headers }, dataFiles: { sharedData_js: files }
        } };
        const next = { nextSuccess() {} };
        service.buildHeaderInstances(request, {}, next);
        service.resolveFileType(request, {}, next);
        service.assignDataFilesToHeader(request, {}, next);
        assert.deepEqual(Object.keys(request.data.headers), ['inventory:entry', 'cms:entry']);
        const inventory = request.data.headers['inventory:entry'].dataFiles.sharedData_js;
        const cms = request.data.headers['cms:entry'].dataFiles.sharedData_js;
        assert.deepEqual(inventory.list, [files[0], files[2]]);
        assert.deepEqual(cms.list, [files[1]]);
        assert.deepEqual(await processor.handleFiles({}, {}, inventory.list.slice()), {
            record0: { code: 'inventoryItem', name: 'Project', tags: ['c'] }
        });
        assert.deepEqual(await processor.handleFiles({}, {}, cms.list.slice()), { record0: { code: 'cmsPage', name: 'Page' } });
        inventory.done = true;
        assert.equal(cms.done, undefined, 'targets must not share mutable processing state');
        assert.equal(require(headers[0]).inventory.entry.options.moduleName, undefined, 'header composition must not mutate source exports');
        fs.writeFileSync(headers[2], 'module.exports = { inventory: { entry: { options: { enabled: true, schemaName: "other" } } } };');
        assert.throws(() => service.buildHeaderInstances({ ...request, data: { headerFiles: { sharedHeader_js: headers } } }, {}, next), /cannot change its owning target/);
    } finally { fs.rmSync(root, { recursive: true, force: true }); }
});
