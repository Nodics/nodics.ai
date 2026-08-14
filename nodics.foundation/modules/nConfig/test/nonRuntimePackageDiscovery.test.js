/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module config/test/nonRuntimePackageDiscovery
 * @description Verifies that setup and other explicitly non-runtime packages are excluded from Nodics runtime module discovery while canonical capability modules remain discoverable.
 * @layer test
 * @owner nConfig
 * @override New package kinds must extend this contract with explicit discovery expectations rather than path-name hardcoding.
 */
const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');

const utils = require('../src/utils/utils');

let root = fs.mkdtempSync(path.join(os.tmpdir(), 'nodics-non-runtime-'));
let runtimeModule = path.join(root, 'runtimeModule');
let setupPackage = path.join(root, 'nSetup');
let structuralGroup = path.join(root, 'project', 'modules');
let structuralChild = path.join(structuralGroup, 'projectCore');
let docsPackage = path.join(root, 'docs', 'copiedReferenceModule');
fs.mkdirSync(runtimeModule, { recursive: true });
fs.mkdirSync(setupPackage, { recursive: true });
fs.mkdirSync(structuralChild, { recursive: true });
fs.mkdirSync(docsPackage, { recursive: true });

fs.writeFileSync(path.join(runtimeModule, 'package.json'), JSON.stringify({
    name: 'runtimeModule',
    index: '1.0',
    nodics: {
        kind: 'capability',
        runtime: {
            router: false,
            publish: false,
            web: false
        },
        owns: []
    },
    main: 'nodics.js'
}, null, 4));

fs.writeFileSync(path.join(setupPackage, 'package.json'), JSON.stringify({
    name: 'nSetup',
    index: '0.5',
    runtimeModule: false,
    nodics: {
        kind: 'setup',
        runtime: {
            router: false,
            publish: false,
            web: false
        },
        runtimeModule: false,
        loadableByNodicsModuleLoader: false,
        owns: ['llm']
    },
    main: 'nodics.js'
}, null, 4));

fs.writeFileSync(path.join(structuralGroup, 'package.json'), JSON.stringify({
    name: 'projectModules',
    index: '100.0',
    nodics: {
        kind: 'group',
        runtimeModule: false,
        loadableByNodicsModuleLoader: false,
        runtime: { router: false, publish: false, web: false },
        owns: ['composition']
    },
    main: 'nodics.js'
}, null, 4));

fs.writeFileSync(path.join(structuralChild, 'package.json'), JSON.stringify({
    name: 'projectCore',
    index: '100.1',
    nodics: {
        kind: 'capability',
        runtimeModule: true,
        loadableByNodicsModuleLoader: true,
        runtime: { router: false, publish: false, web: false },
        owns: ['service']
    },
    main: 'nodics.js'
}, null, 4));

fs.writeFileSync(path.join(docsPackage, 'package.json'), JSON.stringify({
    name: 'copiedReferenceModule',
    index: '2.0',
    nodics: {
        kind: 'capability',
        runtime: {
            router: false,
            publish: false,
            web: false
        },
        owns: []
    },
    main: 'nodics.js'
}, null, 4));

let modulesList = {};
utils.collectModulesList(root, modulesList);

assert(modulesList.runtimeModule, 'runtime module should be discovered');
assert.strictEqual(modulesList.nSetup, undefined, 'non-runtime setup package should not be discovered as a Nodics module');
assert.strictEqual(modulesList.projectModules, undefined, 'structural group should not be discovered as a runtime module');
assert(modulesList.projectCore, 'runtime child below a structural group should remain discoverable');
assert.strictEqual(modulesList.projectCore.parent, undefined,
    'structural group must not become the runtime parent of its child');
assert.strictEqual(modulesList.copiedReferenceModule, undefined, 'packages under docs must not be discovered as Nodics runtime modules');
assert.strictEqual(utils.isRuntimeModule({ name: 'missingMetadata' }), false);
assert.strictEqual(utils.isRuntimeModule({ name: 'normal', nodics: { kind: 'capability' } }), true);
assert.strictEqual(utils.isRuntimeModule({ name: 'disabled', runtimeModule: false }), false);
assert.strictEqual(utils.isRuntimeModule({
    name: 'disabledNested',
    nodics: {
        loadableByNodicsModuleLoader: false
    }
}), false);

fs.rmSync(root, { recursive: true, force: true });

console.log('Non-runtime package discovery validated');
