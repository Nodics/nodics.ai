/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nImport/test/versionedSystemImportDiscovery
 * @description Verifies ordinary system imports discover versioned data roots
 * without an explicit release plan, preserving fresh-schema bootstrap support.
 * @layer test
 * @owner nData
 * @override Projects may add more versioned release folders while preserving
 * deterministic discovery of headers and records.
 */
const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');

const importUtility = require('../src/service/import/defaultImportUtilityService');
const commonUtils = require('../../../../nCommon/src/utils/utils');

const root = fs.mkdtempSync(path.join(os.tmpdir(), 'nodics-versioned-import-'));
const moduleRoot = path.join(root, 'versionedModule');

function write(relativePath, content) {
    let filePath = path.join(moduleRoot, relativePath);
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, content);
}

write('data/init-v001/headers/defaultUsersHeader.js', 'module.exports = {};\n');
write('data/init-v001/records/defaultUsersData.js', 'module.exports = {};\n');
write('data/init-v002/headers/defaultTenantsHeader.js', 'module.exports = {};\n');
write('data/init-v002/records/defaultTenantsData.js', 'module.exports = {};\n');

global.UTILS = Object.assign({}, commonUtils, {
    isBlank: value => value === null || value === undefined || value === ''
});
global.CLASSES = {
    DataImportError: class DataImportError extends Error {
        constructor(error, message) {
            super(message || error && error.message || error);
            this.code = error && error.code ? error.code : error;
        }
    }
};
global.NODICS = {
    getIndexedModules: () => [{ name: 'versionedModule', path: moduleRoot }]
};

(async function () {
    try {
        let roots = importUtility.releaseRoots({ name: 'versionedModule', path: moduleRoot }, 'init')
            .map(rootPath => path.basename(rootPath));
        assert.deepStrictEqual(roots, ['init-v001', 'init-v002']);

        let headers = await importUtility.getSystemDataHeaders(['versionedModule'], 'init');
        assert.deepStrictEqual(Object.keys(headers).sort(), ['defaultTenantsHeader', 'defaultUsersHeader']);
        assert(headers.defaultUsersHeader[0].includes(path.join('init-v001', 'headers')));
        assert(headers.defaultTenantsHeader[0].includes(path.join('init-v002', 'headers')));

        let records = await importUtility.getSystemDataFiles(['versionedModule'], 'init');
        assert.deepStrictEqual(Object.keys(records).sort(), ['defaultTenantsData_js', 'defaultUsersData_js']);
        assert(records.defaultUsersData_js[0].includes(path.join('init-v001', 'records')));
        assert(records.defaultTenantsData_js[0].includes(path.join('init-v002', 'records')));

        console.log('Versioned system import discovery validated');
    } finally {
        fs.rmSync(root, { recursive: true, force: true });
    }
})().catch(error => {
    console.error(error);
    process.exit(1);
});
