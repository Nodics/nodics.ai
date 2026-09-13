/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module jsImport/test/StableRecordKeyContract @description Verifies layered source identity, isolated datasets and array replacement without business-code matching. @layer test @owner jsImport */
const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const processor = require('../src/service/init/defaultJsFileDataProcessService');
const importUtility = require('../../import/src/service/import/defaultImportUtilityService');
const commonUtils = require('../../../../nCommon/src/utils/utils');
const configUtils = require('../../../../nConfig/src/utils/utils');

test('stable keys inherit fields, replace arrays and do not collapse different keys with equal codes', () => {
    const base = { record0: { code: 'original', name: 'Framework', nested: { first: true }, values: ['old', 'stale'] } };
    const first = processor.mergeModels({}, base);
    const result = processor.mergeModels(first, { record0: { name: 'Partner', nested: { second: true }, values: ['new'] } });
    assert.deepEqual(result.record0, { code: 'original', name: 'Partner', nested: { first: true, second: true }, values: ['new'] });
    processor.mergeModels(result, { record0: { code: 'changed' }, differentKey: { code: 'changed', name: 'Distinct definition' } });
    assert.deepEqual(Object.keys(result), ['record0', 'differentKey']);
    assert.equal(result.record0.code, 'changed');
    assert.equal(base.record0.name, 'Framework');
    assert.deepEqual(base.record0.values, ['old', 'stale']);
    assert.throws(() => processor.mergeModels({}, []), /keyed object/);
    assert.throws(() => processor.mergeModels({}, JSON.parse('{"__proto__":{"polluted":true}}')), /Invalid JavaScript import record/);
});

test('the ordinary importer composes ordered file layers and keeps unrelated datasets separate', async () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'nodics-data-keys-'));
    const saved = { NODICS: global.NODICS, UTILS: global.UTILS, CLASSES: global.CLASSES };
    const modules = ['framework', 'partner'].map((name, index) => ({ name, index: String(index), path: path.join(root, name) }));
    for (const module of modules) fs.mkdirSync(path.join(module.path, 'data', 'init-v001', 'records'), { recursive: true });
    const write = (module, name, records) => fs.writeFileSync(path.join(module.path, 'data', 'init-v001', 'records', name + '.js'), 'module.exports = ' + JSON.stringify(records));
    write(modules[0], 'inventoryData', { record0: { code: 'inventory', name: 'Base' } });
    write(modules[1], 'inventoryData', { record0: { name: 'Partner' } });
    write(modules[0], 'contentData', { record0: { code: 'content', name: 'Unrelated' } });
    global.NODICS = { getIndexedModules: () => new Map(modules.map(module => [module.index, module])), getRawModule: name => modules.find(module => module.name === name) };
    global.UTILS = Object.assign({}, commonUtils, { isBlank: configUtils.isBlank });
    global.CLASSES = { DataImportError: class extends Error {} };
    try {
        const files = await importUtility.getSystemDataFiles(modules.map(module => module.name), 'init');
        const inventory = await processor.handleFiles({}, {}, files.inventoryData_js.slice());
        const content = await processor.handleFiles({}, {}, files.contentData_js.slice());
        assert.deepEqual(inventory, { record0: { code: 'inventory', name: 'Partner' } });
        assert.deepEqual(content, { record0: { code: 'content', name: 'Unrelated' } });
    } finally { Object.assign(global, saved); fs.rmSync(root, { recursive: true, force: true }); }
});
