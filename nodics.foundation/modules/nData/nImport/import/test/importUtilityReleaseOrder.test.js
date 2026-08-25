/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');

/**
 * @module import/test/importUtilityReleaseOrder
 * @description Proves governed data-release file filtering preserves selected release dependency order instead of filesystem order.
 * @layer test
 * @owner import
 */

const root = fs.mkdtempSync(path.join(os.tmpdir(), 'nodics-import-utility-order-'));
const moduleRoot = path.join(root, 'orderedModule');

fs.mkdirSync(path.join(moduleRoot, 'data', 'staged', 'media', 'data'), { recursive: true });
fs.mkdirSync(path.join(moduleRoot, 'data', 'staged', 'wcms', 'data'), { recursive: true });
const mediaFile = path.join(moduleRoot, 'data', 'staged', 'media', 'data', 'mediaReferenceData.js');
const componentFile = path.join(moduleRoot, 'data', 'staged', 'wcms', 'data', 'componentMediaData.js');
fs.writeFileSync(mediaFile, 'module.exports = [];\n');
fs.writeFileSync(componentFile, 'module.exports = [];\n');

global.NODICS = {
    getRawModule: moduleName => moduleName === 'orderedModule' ? { name: 'orderedModule', path: moduleRoot } : undefined
};

const service = require('../src/service/import/defaultImportUtilityService');

try {
    const fileList = {
        componentMediaData_js: [componentFile],
        mediaReferenceData_js: [mediaFile]
    };
    const plan = [
        {
            moduleName: 'orderedModule',
            declaredFiles: ['staged/media/data/mediaReferenceData.js']
        },
        {
            moduleName: 'orderedModule',
            declaredFiles: ['staged/wcms/data/componentMediaData.js']
        }
    ];
    const filtered = service.filterDeclaredReleaseFiles(fileList, plan, 'data');
    assert.deepStrictEqual(Object.keys(filtered), ['mediaReferenceData_js', 'componentMediaData_js']);
    assert.deepStrictEqual(filtered.mediaReferenceData_js, [mediaFile]);
    assert.deepStrictEqual(filtered.componentMediaData_js, [componentFile]);
    console.log('Import utility release order contract validated');
} finally {
    fs.rmSync(root, { recursive: true, force: true });
}
