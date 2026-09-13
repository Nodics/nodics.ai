/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module nConfig/test/ServerGeneratedArtifactContract @description Exercises actual generation, cleanup and layered loading across independent servers and shared nodes. @layer test @owner nConfig */
const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const Nodics = require('../bin/nodics');
const Config = require('../bin/config');
const utils = require('../src/utils/utils');
const loader = require('../src/service/defaultFilesLoaderService');
const initializer = require('../src/service/DefaultFrameworkInitializerService');
const infra = require('../src/service/defaultInfraService');

// Keep only host logging and schema metadata in memory; execute the actual writers and loaders.
test('server build, clean and node loading preserve other servers and authored overrides', async () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'nodics-server-artifacts-'));
    const names = ['NODICS', 'CONFIG', 'UTILS', 'SERVICE', 'FACADE', 'CONTROLLER', 'PIPELINE'];
    const globals = Object.fromEntries(names.map(name => [name, global[name]]));
    const priorUpper = String.prototype.toUpperCaseEachWord;
    const priorFirst = String.prototype.toUpperCaseFirstChar;
    String.prototype.toUpperCaseFirstChar = function () { return this[0].toUpperCase() + this.slice(1); };
    String.prototype.toUpperCaseEachWord = function () { return this.replace(/(^|_)([a-z])/g, (match, prefix, char) => char.toUpperCase()); };
    const quiet = { debug() {}, info() {}, warn() {}, error() {} };
    loader.LOG = initializer.LOG = infra.LOG = quiet;
    const source = { name: 'sharedCapability', path: path.join(root, 'framework', 'capability'), index: '1' };
    const partner = { name: 'partnerCapability', path: path.join(root, 'partner'), index: '1.5' };
    const project = { name: 'customerApplication', path: path.join(root, 'project'), index: '2' };
    const environment = { name: 'deployment', path: path.join(project.path, 'envs', 'deployment'), parent: project.name, index: '2.5' };
    const serverA = { name: 'serverA', path: path.join(environment.path, 'serverA'), parent: environment.name, index: '3' };
    const serverB = { name: 'serverB', path: path.join(environment.path, 'serverB'), parent: environment.name, index: '3' };
    const write = (file, content) => { fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, content); };
    for (const item of [source, partner, project, environment, serverA, serverB]) write(path.join(item.path, 'nodics.js'), 'module.exports = {};');
    for (const layer of ['service', 'facade', 'controller']) {
        const suffix = layer[0].toUpperCase() + layer.slice(1);
        write(path.join(source.path, 'src', layer, 'support.cjs'), "module.exports = { label: 'source-package-import' };");
        write(path.join(source.path, 'src', layer, 'common.js'), "const dependency = require('./support.cjs');\nmodule.exports = { value: function () { return 'generated'; }, schema: function () { return 'schmanm'; }, dependency: function () { return dependency.label; } };");
        write(path.join(source.path, 'src', layer, 'defaultItem' + suffix + '.js'), "module.exports = { frameworkPolicy: function () { return 'framework'; } };");
        write(path.join(partner.path, 'src', layer, 'defaultItem' + suffix + '.js'), "module.exports = { partnerPolicy: function () { return 'partner'; }, value: function () { return 'partner'; } };");
        write(path.join(environment.path, 'src', layer, 'defaultItem' + suffix + '.js'), "module.exports = { environmentPolicy: function () { return 'environment'; } };");
        for (const server of [serverA, serverB]) {
            write(path.join(server.path, 'src', layer, 'defaultItem' + suffix + '.js'), "module.exports = { serverPolicy: function () { return '" + server.name + "'; } };");
            write(path.join(server.path, 'src', layer, 'support.cjs'), "module.exports = { label: 'source-package-import' };");
            const common = fs.readFileSync(path.join(source.path, 'src', layer, 'common.js'), 'utf8');
            write(path.join(server.path, 'src', layer, 'common.js'), common.replace('module.exports = {', "module.exports = { generatedScope: function () { return '" + server.name + "'; },"));
        }
        write(path.join(project.path, 'src', layer, 'defaultItem' + suffix + '.js'), "module.exports = { value: function () { return 'authored'; } };");
        write(path.join(source.path, 'src', layer, 'gen', 'DefaultStale' + suffix + '.js'), "module.exports = { stale: true };");
    }
    global.UTILS = Object.assign({}, utils, { getCopywriteComment: () => '', LOG: quiet });
    global.CONFIG = new Config();
    CONFIG.setProperties({ log: { level: 'error', transports: {} }, servers: { options: { contextRoot: '/' } } });
    let operation = 'build';
    const select = server => {
        const runtime = new Nodics();
        const options = { NODICS_HOME: root, CUSTOM_HOME: project.path, defaultServer: server.name, lifecycleOperation: operation };
        runtime.init(options);
        runtime.resolveTopologyModule = () => server;
        runtime.getRawModule = name => [source, partner, project, environment, server].find(item => item.name === name);
        runtime.initEnvironment(options);
        runtime.getIndexedModules = () => new Map([source, partner, project, environment, server].map(item => [item.index, item]));
        runtime.getModules = () => ({ sharedCapability: { rawSchema: { item: { model: true, service: { enabled: true } } } } });
        runtime.isModuleActive = () => true;
        global.NODICS = runtime;
        global.SERVICE = { DefaultFilesLoaderService: loader };
        global.FACADE = {}; global.CONTROLLER = {}; global.PIPELINE = {};
    };
    try {
        select(serverA);
        const aPaths = ['service', 'facade', 'controller'].map(layer => NODICS.getGeneratedArtifactPath(layer));
        await infra.buildEntities(); infra.writeBuildManifest();
        assert(aPaths.every(directory => fs.readdirSync(directory).length === 1));
        select(serverB);
        await infra.cleanEntities();
        assert(aPaths.every(directory => fs.existsSync(directory)), 'clean B preserves A');
        await infra.buildEntities(); infra.writeBuildManifest();
        const bContent = fs.readFileSync(path.join(serverB.path, 'src/service/gen/DefaultItemService.js'), 'utf8');
        assert.notEqual(fs.readFileSync(path.join(serverA.path, 'src/service/gen/DefaultItemService.js'), 'utf8'), bContent);
        operation = 'start'; select(serverB);
        await initializer.loadModules();
        assert.equal(SERVICE.DefaultItemService.generatedScope(), 'serverB');
        select(serverA);
        await initializer.loadModules();
        for (const [registry, suffix] of [[SERVICE, 'Service'], [FACADE, 'Facade'], [CONTROLLER, 'Controller']]) {
            const artifact = registry['DefaultItem' + suffix];
            assert.equal(artifact.value(), 'authored');
            assert.equal(artifact.schema(), 'item');
            assert.equal(artifact.dependency(), 'source-package-import');
            assert.equal(artifact.xNodics.overrideTrace.filter(entry => entry.generatedBaseline === true).length, 1);
            assert.equal(artifact.frameworkPolicy(), 'framework');
            assert.equal(artifact.partnerPolicy(), 'partner');
            assert.equal(artifact.environmentPolicy(), 'environment');
            assert.equal(artifact.serverPolicy(), 'serverA');
            assert.equal(artifact.generatedScope(), 'serverA');
            assert.equal(artifact.xNodics.memberOrigins.value.sourceModule, project.name);
            assert.equal(artifact.xNodics.memberOrigins.partnerPolicy.sourceModule, partner.name);
            assert.equal(artifact.xNodics.memberOrigins.environmentPolicy.sourceModule, environment.name);
            assert.equal(registry['DefaultStale' + suffix], undefined, 'shared source gen is excluded');
        }
        const originalTemplate = fs.readFileSync(path.join(source.path, 'src', 'service', 'common.js'), 'utf8');
        fs.appendFileSync(path.join(source.path, 'src', 'service', 'common.js'), '\n// changed template');
        select(serverA);
        await assert.rejects(initializer.loadModules(), /inputs are stale/);
        fs.writeFileSync(path.join(source.path, 'src', 'service', 'common.js'), originalTemplate);
        // A second process/node uses the same selected server directories and gets an uncontaminated baseline.
        select(serverA); await initializer.loadModules();
        assert.equal(SERVICE.DefaultItemService.value(), 'authored');
        assert.deepEqual(['service', 'facade', 'controller'].map(layer => NODICS.getGeneratedArtifactPath(layer)), aPaths);
        fs.rmSync(NODICS.getGeneratedArtifactPath('controller'), { recursive: true });
        select(serverA);
        await assert.rejects(initializer.loadModules(), /Run the selected project server build/);
        assert(fs.existsSync(path.join(serverB.path, 'src', 'controller', 'gen', 'DefaultItemController.js')));
        assert(fs.existsSync(path.join(source.path, 'src', 'service', 'gen', 'DefaultStaleService.js')), 'no implicit shared-file migration deletes');
        operation = 'build'; select(serverA);
        const failure = new Error('facade generation failed');
        const failingInfra = Object.assign({}, infra, { buildFacades: async function () { throw failure; } });
        await assert.rejects(failingInfra.buildEntities(), error => error === failure);
        assert(aPaths.every(directory => !fs.existsSync(directory)), 'failed build clears partial server output');
        assert(fs.existsSync(path.join(serverB.path, 'src', 'controller', 'gen', 'DefaultItemController.js')), 'failure cleanup preserves B');
        assert.equal(fs.readFileSync(path.join(serverB.path, 'src/service/gen/DefaultItemService.js'), 'utf8'), bContent);
        operation = 'start'; select(serverB); await initializer.loadModules();
        assert.equal(SERVICE.DefaultItemService.generatedScope(), 'serverB');

    } finally {
        names.forEach(name => { global[name] = globals[name]; });
        if (priorFirst) String.prototype.toUpperCaseFirstChar = priorFirst; else delete String.prototype.toUpperCaseFirstChar;
        if (priorUpper) String.prototype.toUpperCaseEachWord = priorUpper; else delete String.prototype.toUpperCaseEachWord;
        fs.rmSync(root, { recursive: true, force: true });
    }
});


test('cross-process writers exclude the same server and release their lock on failure', async () => {
    const { spawn } = require('node:child_process');
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'nodics-build-lock-'));
    const manifest = path.join(root, 'generated', 'build.json');
    const script = path.join(root, 'holder.cjs');
    fs.writeFileSync(script, `const infra = require(${JSON.stringify(require.resolve('../src/service/defaultInfraService'))});
        global.NODICS = { getGeneratedArtifactPath: () => ${JSON.stringify(manifest)} };
        infra.withGeneratedArtifactLock(() => new Promise(resolve => {
            process.send('locked'); process.once('message', resolve);
        })).then(() => process.exit(0)).catch(error => { console.error(error); process.exit(1); });`);
    const child = spawn(process.execPath, [script], { stdio: ['ignore', 'ignore', 'pipe', 'ipc'] });
    try {
        await new Promise((resolve, reject) => { child.once('message', resolve); child.once('error', reject); child.once('exit', code => reject(new Error('holder exited ' + code))); });
        global.NODICS = { getGeneratedArtifactPath: () => manifest };
        let mutated = false;
        await assert.rejects(infra.withGeneratedArtifactLock(async () => { mutated = true; }), /already locked/);
        assert.equal(mutated, false);
        assert.throws(() => infra.validateBuildManifest(), /generation is locked/);
        // A distinct server can proceed while the first is locked.
        NODICS.getGeneratedArtifactPath = () => path.join(root, 'other', 'build.json');
        await infra.withGeneratedArtifactLock(async () => { mutated = true; });
        assert.equal(mutated, true);
        const exited = new Promise(resolve => child.once('exit', resolve));
        child.send('release');
        assert.equal(await exited, 0);
        NODICS.getGeneratedArtifactPath = () => manifest;
        const failure = new Error('generation failed');
        await assert.rejects(infra.withGeneratedArtifactLock(async () => { throw failure; }), error => error === failure);
        assert.equal(fs.existsSync(manifest + '.lock'), false);
        await infra.withGeneratedArtifactLock(async () => true);
    } finally { child.kill(); fs.rmSync(root, { recursive: true, force: true }); }
});

test('two projects with identical target names load distinct generated schemas from one immutable source tree', async () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'nodics-two-projects-'));
    const keys = ['NODICS', 'CONFIG', 'UTILS', 'SERVICE', 'FACADE', 'CONTROLLER', 'PIPELINE'];
    const beforeGlobals = Object.fromEntries(keys.map(key => [key, global[key]]));
    const previousUpper = String.prototype.toUpperCaseEachWord, previousFirst = String.prototype.toUpperCaseFirstChar;
    String.prototype.toUpperCaseFirstChar = function () { return this[0].toUpperCase() + this.slice(1); };
    String.prototype.toUpperCaseEachWord = function () { return this.replace(/(^|_)([a-z])/g, (match, prefix, char) => char.toUpperCase()); };
    const quiet = { debug() {}, info() {}, warn() {}, error() {} };
    loader.LOG = initializer.LOG = infra.LOG = quiet;
    const source = { name: 'sharedCapability', path: path.join(root, 'sharedFramework'), index: '1' };
    const write = (file, value) => { fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, value); };
    write(path.join(source.path, 'nodics.js'), 'module.exports = {};');
    for (const type of ['service', 'facade', 'controller']) {
        write(path.join(source.path, 'src', type, 'common.js'), "module.exports = { source: function () { return 'framework'; }, schema: function () { return 'schmanm'; } };");
    }
    const sourceSnapshot = infra.hashBuildFiles(source.path);
    let current;
    const select = (name, lifecycleOperation, schemaName = 'item') => {
        const project = { name, path: path.join(root, name), index: '2' };
        const environment = { name: 'local', path: path.join(project.path, 'envs', 'local'), parent: name };
        const server = { name: 'apiServer', path: path.join(environment.path, 'apiServer'), parent: 'local', index: '3' };
        for (const item of [project, server]) if (!fs.existsSync(path.join(item.path, 'nodics.js'))) write(path.join(item.path, 'nodics.js'), 'module.exports = {};');
        for (const type of ['service', 'facade', 'controller']) {
            const suffix = type[0].toUpperCase() + type.slice(1);
            const authored = path.join(project.path, 'src', type, 'defaultItem' + suffix + '.js');
            if (!fs.existsSync(authored)) write(authored, 'module.exports = { customer: function () { return ' + JSON.stringify(name) + '; } };');
            write(path.join(project.path, 'src', type, 'common.js'), "module.exports = { source: function () { return 'framework'; }, schema: function () { return 'schmanm'; }, generatedPolicy: function () { return " + JSON.stringify(name) + "; } };");
        }
        const runtime = new Nodics(), options = { NODICS_HOME: source.path, CUSTOM_HOME: project.path, defaultServer: server.name, lifecycleOperation };
        runtime.init(options); runtime.resolveTopologyModule = () => server;
        runtime.getRawModule = key => [source, project, environment, server].find(item => item.name === key);
        runtime.initEnvironment(options);
        runtime.getIndexedModules = () => new Map([source, project, server].map(item => [item.index, item]));
        runtime.getModules = () => ({ sharedCapability: { rawSchema: { [schemaName]: { model: true, service: { enabled: true } } } } });
        runtime.isModuleActive = () => true;
        global.NODICS = runtime; global.CONFIG = new Config();
        CONFIG.setProperties({ log: { level: 'error', transports: {} }, servers: { options: { contextRoot: '/' } } });
        global.UTILS = { ...utils, getCopywriteComment: () => '', LOG: quiet };
        global.SERVICE = { DefaultFilesLoaderService: loader }; global.FACADE = {}; global.CONTROLLER = {}; global.PIPELINE = {};
        current = { project, server };
    };
    try {
        select('alpha', 'build'); await infra.withGeneratedArtifactLock(async () => { await infra.buildEntities(); infra.writeBuildManifest(); });
        const alphaRoot = current.server.path;
        select('beta', 'build'); await infra.withGeneratedArtifactLock(async () => { await infra.buildEntities(); infra.writeBuildManifest(); });
        select('beta', 'start'); await initializer.loadModules();
        assert.equal(SERVICE.DefaultItemService.customer(), 'beta'); assert.equal(SERVICE.DefaultItemService.generatedPolicy(), 'beta');
        select('beta', 'build', 'other'); await infra.withGeneratedArtifactLock(async () => { await infra.buildEntities(); infra.writeBuildManifest(); });
        const betaRoot = current.server.path, betaOutput = fs.readFileSync(path.join(betaRoot, 'src/service/gen/DefaultOtherService.js'), 'utf8');
        select('alpha', 'start'); await initializer.loadModules();
        assert.equal(SERVICE.DefaultItemService.customer(), 'alpha'); assert.equal(SERVICE.DefaultItemService.schema(), 'item'); assert.equal(SERVICE.DefaultItemService.generatedPolicy(), 'alpha');
        assert.equal(SERVICE.DefaultOtherService, undefined);
        select('beta', 'start', 'other'); await initializer.loadModules();
        assert.equal(SERVICE.DefaultOtherService.schema(), 'other'); assert.equal(SERVICE.DefaultOtherService.source(), 'framework');
        assert.equal(SERVICE.DefaultItemService.customer(), 'beta'); assert.equal(SERVICE.DefaultItemService.schema, undefined);
        select('alpha', 'clean'); await infra.withGeneratedArtifactLock(() => infra.cleanEntities());
        assert.equal(fs.existsSync(path.join(alphaRoot, 'src/service/gen')), false);
        assert.equal(fs.readFileSync(path.join(betaRoot, 'src/service/gen/DefaultOtherService.js'), 'utf8'), betaOutput);
        select('beta', 'start', 'other'); await initializer.loadModules(); assert.equal(SERVICE.DefaultOtherService.schema(), 'other');
        select('alpha', 'build', 'replacement'); await infra.withGeneratedArtifactLock(async () => { await infra.buildEntities(); infra.writeBuildManifest(); });
        assert.equal(fs.existsSync(path.join(alphaRoot, 'src/service/gen/DefaultItemService.js')), false);
        assert.equal(fs.existsSync(path.join(alphaRoot, 'src/service/gen/DefaultReplacementService.js')), true);
        assert.deepEqual(infra.hashBuildFiles(source.path), sourceSnapshot, 'source tree content remains byte-identical');
    } finally {
        keys.forEach(key => { global[key] = beforeGlobals[key]; });
        if (previousUpper) String.prototype.toUpperCaseEachWord = previousUpper; else delete String.prototype.toUpperCaseEachWord;
        if (previousFirst) String.prototype.toUpperCaseFirstChar = previousFirst; else delete String.prototype.toUpperCaseFirstChar;
        fs.rmSync(root, { recursive: true, force: true });
    }
});


test('generated output rejects escaped server roots and symlink traversal before lock or cleanup writes', async () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'nodics-generated-containment-'));
    const project = path.join(root, 'project'), outside = path.join(root, 'outside');
    const server = path.join(project, 'envs', 'local', 'apiServer');
    const previous = global.NODICS;
    const select = (projectPath, serverPath) => {
        const runtime = new Nodics(), options = { NODICS_HOME: projectPath, CUSTOM_HOME: projectPath, defaultServer: 'apiServer' };
        runtime.init(options);
        runtime.resolveTopologyModule = () => ({ name: 'apiServer', path: serverPath, parent: 'local' });
        runtime.getRawModule = name => name === 'local' ? { path: path.join(projectPath, 'envs', 'local'), parent: 'project' } : { path: projectPath };
        runtime.initEnvironment(options); global.NODICS = runtime;
        return runtime;
    };
    fs.mkdirSync(path.join(server, 'src', 'facade', 'gen'), { recursive: true });
    fs.mkdirSync(outside); fs.writeFileSync(path.join(outside, 'sentinel'), 'external data');
    const sibling = path.join(server, 'src', 'facade', 'gen', 'preserved'); fs.writeFileSync(sibling, 'server data');
    try {
        select(project, outside);
        assert.throws(() => NODICS.getGeneratedArtifactPath('service'), /inside the selected project/);
        select(project, server);
        fs.symlinkSync(outside, path.join(server, 'src', 'service'), 'dir');
        let entered = false;
        await assert.rejects(infra.withGeneratedArtifactLock(async () => { entered = true; }), /symbolic link/);
        assert.equal(entered, false);
        assert.equal(fs.existsSync(path.join(server, 'generated')), false, 'preflight creates no lock or output directories');
        assert.equal(fs.readFileSync(sibling, 'utf8'), 'server data');
        assert.equal(fs.readFileSync(path.join(outside, 'sentinel'), 'utf8'), 'external data');
        fs.unlinkSync(path.join(server, 'src', 'service'));
        const alias = path.join(root, 'project-alias'); fs.symlinkSync(project, alias, 'dir');
        select(alias, path.join(alias, 'envs', 'local', 'apiServer'));
        assert.equal(NODICS.getGeneratedArtifactPath('service'), path.join(alias, 'envs', 'local', 'apiServer', 'src', 'service', 'gen'));
    } finally { global.NODICS = previous; fs.rmSync(root, { recursive: true, force: true }); }
});
