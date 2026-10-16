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

// Explicit installed sources use the canonical descriptor builder without widening runtime discovery.
const installedRoot = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'nodics-installed-source-')));
const frameworkRoot = path.join(installedRoot, 'framework');
const projectRoot = path.join(installedRoot, 'project');
const oldNodics = global.NODICS;
const oldConfig = global.CONFIG;
const selectedRoots = [path.join(frameworkRoot, 'foundation'), projectRoot];
const active = ['selectedOwner'];
const raw = { selectedOwner: { name: 'selectedOwner' } };
const properties = { selected: true };
/** Creates only disposable package metadata, never executable runtime fixtures. */
function packageAt(relative, name, kind, extra = {}) {
    const directory = path.join(installedRoot, relative);
    fs.mkdirSync(directory, { recursive: true });
    fs.writeFileSync(path.join(directory, 'package.json'), JSON.stringify({
        name, index: '1.0', nodics: { kind, ...extra }
    }));
    return directory;
}
try {
    packageAt('framework', 'fixtureFramework', 'framework', { runtimeModule: false });
    packageAt('framework/foundation', 'fixtureFoundation', 'group');
    packageAt('framework/catalogue', 'catalogueGroup', 'group');
    const owner = packageAt('framework/catalogue/modules/owner', 'installedOwner', 'capability');
    packageAt('framework/foundation/publisher', 'publisherOwner', 'publish');
    packageAt('project', 'fixtureProject', 'application');
    packageAt('project/modules', 'structuralModules', 'group', { runtimeModule: false });
    const projectOwner = packageAt('project/modules/owner', 'projectOwner', 'capability');
    packageAt('project/modules/disabled', 'disabledOwner', 'capability', { loadableByNodicsModuleLoader: false });
    packageAt('project/test/fixtures/copied', 'copiedOwner', 'capability');
    fs.mkdirSync(path.join(owner, 'config'));
    fs.writeFileSync(path.join(owner, 'config/properties.js'), 'throw new Error("Configuration must not execute");');
    global.NODICS = {
        getNodicsHome: () => selectedRoots[0], getCustomHome: () => projectRoot,
        getRawModules: () => raw, getIndexedModules: () => active,
        addRawModules: () => { throw new Error('Installed sources must not register'); }
    };
    global.CONFIG = { get: () => properties, set: () => { throw new Error('Configuration must not change'); } };
    const before = JSON.stringify({ selectedRoots, active, raw, properties });
    const descriptor = utils.resolveInstalledSourceDescriptor('installedOwner');
    assert.strictEqual(descriptor.path, owner);
    assert.strictEqual(descriptor.parent, 'catalogueGroup');
    assert.strictEqual(descriptor.canonicalIdentity, 'catalogueGroup/installedOwner');
    assert.strictEqual(utils.resolveInstalledSourceDescriptor('publisherOwner').metaData.nodics.kind, 'publish');
    assert.strictEqual(utils.resolveInstalledSourceDescriptor('projectOwner').path, projectOwner);
    assert.strictEqual(utils.resolveInstalledSourceDescriptor('projectOwner').parent, 'fixtureProject');
    assert.strictEqual(JSON.stringify({ selectedRoots, active, raw, properties }), before);
    assert.strictEqual(require.cache[path.join(owner, 'package.json')], undefined, 'metadata must not populate require cache');
    for (const name of ['missingOwner', 'disabledOwner', 'copiedOwner']) {
        assert.throws(() => utils.resolveInstalledSourceDescriptor(name), /Missing installed source owner/);
    }
    for (const name of ['../installedOwner', '*', '', null, 'owner/path']) {
        assert.throws(() => utils.resolveInstalledSourceDescriptor(name), /Invalid installed source owner selection/);
    }
    const duplicate = packageAt('project/modules/duplicate', 'installedOwner', 'capability');
    assert.throws(() => utils.resolveInstalledSourceDescriptor('installedOwner'), /Duplicate runtime module name/);
    fs.rmSync(duplicate, { recursive: true });
    const duplicateConstructor = packageAt('project/modules/constructor1', 'constructor', 'capability');
    const duplicateConstructor2 = packageAt('project/modules/constructor2', 'constructor', 'capability');
    assert.throws(() => utils.resolveInstalledSourceDescriptor('constructor'), /Duplicate runtime module name/);
    fs.rmSync(duplicateConstructor, { recursive: true });
    fs.rmSync(duplicateConstructor2, { recursive: true });
    const outside = packageAt('outside', 'outsideOwner', 'capability');
    const escaping = path.join(projectRoot, 'modules/escaping');
    fs.symlinkSync(outside, escaping);
    assert.throws(() => utils.resolveInstalledSourceDescriptor('outsideOwner'), /escapes its trusted root/);
    fs.unlinkSync(escaping);
    const packageFile = path.join(owner, 'package.json');
    const original = fs.readFileSync(packageFile);
    fs.unlinkSync(packageFile);
    fs.symlinkSync(path.join(outside, 'package.json'), packageFile);
    assert.throws(() => utils.resolveInstalledSourceDescriptor('installedOwner'), /Invalid installed source package metadata/);
    fs.unlinkSync(packageFile);
    fs.writeFileSync(packageFile, '{invalid');
    assert.throws(() => utils.resolveInstalledSourceDescriptor('installedOwner'), SyntaxError);
    fs.writeFileSync(packageFile, ' '.repeat(262145));
    assert.throws(() => utils.resolveInstalledSourceDescriptor('installedOwner'), /Invalid installed source package metadata/);
    fs.writeFileSync(packageFile, original);
    const firstServer = packageAt('project/modules/serverA', 'repeatedServer', 'server');
    const secondServer = packageAt('project/modules/serverB', 'repeatedServer', 'server');
    assert.throws(() => utils.resolveInstalledSourceDescriptor('repeatedServer'), /Ambiguous installed source owner/);
    fs.rmSync(secondServer, { recursive: true });
    assert.throws(() => utils.resolveInstalledSourceDescriptor('repeatedServer'), /must not be a topology package/);
    fs.rmSync(firstServer, { recursive: true });
    assert.throws(() => utils.collectModuleRecords(projectRoot, [], null, {
        root: projectRoot, visited: new Set(), directories: 8192, depth: 0
    }), /bound exceeded/);
    assert.strictEqual(JSON.stringify({ selectedRoots, active, raw, properties }), before);
} finally {
    if (oldNodics === undefined) delete global.NODICS;
    else global.NODICS = oldNodics;
    if (oldConfig === undefined) delete global.CONFIG;
    else global.CONFIG = oldConfig;
    fs.rmSync(installedRoot, { recursive: true, force: true });
}
console.log('Bounded installed-source descriptor resolution validated');
