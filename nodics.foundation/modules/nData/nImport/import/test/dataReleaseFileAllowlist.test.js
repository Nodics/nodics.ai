/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** Proves selected release sections cannot execute undeclared sibling import files. */
const assert = require('assert');
const path = require('path');
global.NODICS = {
    getRawModule: name => name === 'owner' ? ({ name: 'owner', path: '/trusted/owner' }) : undefined,
    getIndexedModules: () => new Map()
};
global.UTILS = {};
const utility = require('../src/service/import/defaultImportUtilityService');
const files = {
    declared: ['/trusted/owner/data/init/data/declared.js'],
    sibling: ['/trusted/owner/data/init/data/sibling.js']
};
const selected = utility.filterDeclaredReleaseFiles(files, [{
    moduleName: 'owner', dataType: 'init', declaredFiles: ['init/data/declared.js', 'init/headers/declaredHeader.js']
}], 'data');
assert.deepStrictEqual(selected, { declared: [path.resolve('/trusted/owner/data/init/data/declared.js')] });
assert.deepStrictEqual(utility.filterDeclaredReleaseFiles(files, undefined, 'data'), files,
    'legacy non-release import callers retain established behavior');
assert.deepStrictEqual(utility.modulesForImport(['owner'], [{ moduleName: 'owner' }]).map(item => item.name), ['owner'],
    'a manifest-qualified inactive owner remains importable without runtime activation');
assert.deepStrictEqual(utility.modulesForImport(['missing'], [{ moduleName: 'missing' }]), [],
    'an unavailable contribution owner must fail closed');
console.log('Data release execution file allowlist validated');
