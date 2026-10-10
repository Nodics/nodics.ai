/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nDynamo/test/GovernanceReportMaturityMatrix
 * @description Validates source-derived provider and capability maturity
 * evidence and offline runtime target selection emitted by the governance report generator.
 * @layer test
 * @owner nDynamo
 * @override Projects may extend governance report fields, but provider and
 * capability maturity must remain generated from repository evidence.
 */

const assert = require('assert');
const path = require('path');

const repositoryRoot = path.resolve(__dirname, '../../../..');
const rootPackage = require(path.join(repositoryRoot, 'package.json'));
const generator = require('../src/service/tooling/defaultGovernanceReportGeneratorService');
const ownedDependencies = rootPackage.nodics.dependencyGovernance.ownedDependencies;

const modules = [
    {
        name: 'elastic',
        path: path.join(repositoryRoot, 'nodics.foundation/modules/nSearch/elastic')
    },
    {
        name: 'activemq',
        path: path.join(repositoryRoot, 'nodics.foundation/modules/nEms/activemq')
    },
    {
        name: 'media',
        path: path.join(repositoryRoot, 'nodics.wcms/modules/media')
    }
];

const matrix = generator.collectProviderCapabilityMaturitySummary(modules, ownedDependencies);
const elastic = matrix.find(entry => entry.modulePath === 'nodics.foundation/modules/nSearch/elastic');
const activemq = matrix.find(entry => entry.modulePath === 'nodics.foundation/modules/nEms/activemq');
const media = matrix.find(entry => entry.modulePath === 'nodics.wcms/modules/media');

assert(elastic, 'Elasticsearch provider module must be present in the maturity matrix');
assert.strictEqual(elastic.displayName, 'Elasticsearch');
assert.strictEqual(elastic.providerBacked, true, 'Elasticsearch must be classified as provider-backed');
assert(elastic.evidence.dependencyPackages.some(item => item.packageName === '@elastic/elasticsearch'),
    'Elasticsearch maturity evidence must include the owned provider dependency');
assert(elastic.evidence.readme, 'Provider maturity evidence must include README presence');
assert(elastic.evidence.generatedContext, 'Provider maturity evidence must include generated context presence');
assert(elastic.evidence.sourceFiles > 0, 'Provider maturity evidence must include source file count');
assert(elastic.evidence.testFiles > 0, 'Provider maturity evidence must include test file count');

assert(activemq, 'ActiveMQ provider module must be present in the maturity matrix');
assert.strictEqual(activemq.providerBacked, true, 'ActiveMQ must be classified as provider-backed');
assert(activemq.evidence.dependencyPackages.some(item => item.packageName === 'stompit'),
    'ActiveMQ maturity evidence must include the owned provider dependency');
assert(String(activemq.maturity).toLowerCase().includes('placeholder'),
    'Placeholder provider maturity must not be promoted by scaffold ownership alone');

assert(media, 'Media capability module must be present in the maturity matrix');
assert.strictEqual(media.displayName, 'Media Management');
assert(media.owns.includes('schema') && media.owns.includes('service'),
    'Capability maturity evidence must include package ownership metadata');
assert.strictEqual(media.providerBacked, false, 'Media capability must not be misclassified as a provider adapter');
assert(media.evidence.sourceFiles > 0, 'Capability maturity evidence must include source file count');
assert(media.evidence.testFiles > 0, 'Capability maturity evidence must include test file count');
assert(media.maturity, 'Capability maturity must be explicitly inferred');

console.log('Governance report maturity matrix validated');

const fs = require('node:fs');
const os = require('node:os');
const { test } = require('node:test');
const runtime = require('../../nTooling/src/service/project/defaultProjectRuntimeStartService');
const composition = require('../../nTooling/src/service/command/defaultRepositoryBuildCompositionService');
const config = require('../../nConfig');

function withTargetFixture(run) {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'nodics-governance-target-'));
    const framework = path.join(root, 'framework');
    const project = path.join(root, 'project');
    const write = (relative, value) => {
        const file = path.join(root, relative);
        fs.mkdirSync(path.dirname(file), { recursive: true });
        fs.writeFileSync(file, JSON.stringify(value));
    };
    write('framework/package.json', { name: 'nodics.ai', workspaces: ['nodics.foundation', 'nodics.discovery'], nodics: { kind: 'framework', runtimeModule: false } });
    for (const name of ['nodics.foundation', 'nodics.discovery']) {
        write('framework/' + name + '/package.json', { name, nodics: { kind: 'group', runtimeModule: true, loadableByNodicsModuleLoader: true } });
    }
    write('project/package.json', { name: 'customer.project', nodics: { kind: 'application', runtimeModule: true } });
    write('project/envs/chosen/commerceServer/package.json', { name: 'commerceServer', nodics: { kind: 'server', extends: ['nodics.discovery'] } });
    try { return run({ framework, project }); }
    finally { fs.rmSync(root, { recursive: true, force: true }); }
}

test('governance project targets reuse build server resolution and preserve declared discovery roots', () => withTargetFixture(({ framework, project }) => {
    const environment = { NODICS_HOME: project, NODICS_FRAMEWORK_ROOT: framework, E: 'wrong', S: 'wrong' };
    for (const args of [
        ['--env', 'chosen', '--server', 'commerce'],
        ['--environment=chosen', '--server=commerceServer'],
        ['--env=chosen', '--server=commerce']
    ]) {
        const options = generator.resolveRuntimeOptions(args, environment);
        const server = runtime.resolveServer(project, 'commerce', { ENV: 'chosen' });
        assert.deepStrictEqual(options.MODULE_ROOTS, runtime.resolveModuleRoots(project, framework, server));
        assert.strictEqual(options.defaultEnvironment, 'chosen');
        assert.strictEqual(options.defaultServer, 'commerceServer');
        assert.strictEqual(options.NODICS_HOME, path.join(framework, 'nodics.foundation'));
        assert.strictEqual(options.CUSTOM_HOME, project);
        assert(options.MODULE_ROOTS.includes(path.join(framework, 'nodics.discovery')));
    }
    assert.deepStrictEqual(environment, { NODICS_HOME: project, NODICS_FRAMEWORK_ROOT: framework, E: 'wrong', S: 'wrong' });
}));

test('governance accepts legacy E/S selection and public project-home alias', () => withTargetFixture(({ framework, project }) => {
    const environment = { NODICS_HOME: framework, NODICS_FRAMEWORK_ROOT: framework, E: 'chosen', S: 'commerce' };
    const options = generator.resolveRuntimeOptions(['--project', project], environment);
    assert.strictEqual(options.CUSTOM_HOME, project);
    assert.strictEqual(options.defaultEnvironment, 'chosen');
    assert.strictEqual(options.defaultServer, 'commerceServer');
}));

test('governance framework root uses the existing retained build composition without recursive discovery', () => withTargetFixture(({ framework }) => {
    const options = generator.resolveRuntimeOptions([], { NODICS_HOME: framework });
    const coordinates = composition.persistentCoordinates(framework);
    assert.strictEqual(options.CUSTOM_HOME, coordinates.root);
    assert.strictEqual(options.defaultServer, 'repositoryBuildServer');
    assert.strictEqual(options.defaultEnvironment, 'repositoryBuildEnvironment');
    assert(!options.MODULE_ROOTS.includes(framework));
    assert.strictEqual(options.MODULE_ROOTS.filter(root => root === path.join(framework, 'nodics.foundation')).length, 1);
    assert.deepStrictEqual(options.MODULE_ROOTS, [path.join(framework, 'nodics.foundation'), path.join(framework, 'nodics.discovery'), coordinates.root]);
    const retained = generator.resolveRuntimeOptions([], {
        NODICS_HOME: framework, CUSTOM_HOME: coordinates.root,
        E: 'repositoryBuildEnvironment', S: 'repositoryBuildServer'
    });
    assert.deepStrictEqual(retained, options);
}));

test('governance refuses ambiguous or unavailable project targets before preparation', () => withTargetFixture(({ framework, project }) => {
    const environment = { NODICS_HOME: project, NODICS_FRAMEWORK_ROOT: framework };
    assert.throws(() => generator.resolveRuntimeOptions([], environment), /Select --server/);
    assert.throws(() => generator.resolveRuntimeOptions(['--env=chosen', '--server=missing'], environment), /Unknown project runtime/);
    assert.throws(() => generator.resolveRuntimeOptions(['--env=missing', '--server=commerce'], environment), /Unknown project runtime/);
    assert.throws(() => generator.resolveRuntimeOptions(['--env=chosen', '--environment=other'], environment), /Duplicate target option/);
    assert.throws(() => generator.resolveRuntimeOptions(['--server'], environment), /Missing value/);
}));

for (const failure of [null, 'prepareBuild', 'initUtilities', 'loadModules']) {
    test('governance preparation remains generation-only and restores selection: ' + (failure || 'success'), async () => {
        const methods = ['prepareBuild', 'initUtilities', 'loadModules', 'initEntities', 'start'];
        const previous = Object.fromEntries(methods.map(key => [key, config[key]]));
        const selection = { S: process.env.S, E: process.env.E, NODICS_NODE: process.env.NODICS_NODE };
        const calls = [];
        const options = { defaultServer: 'commerceServer', defaultEnvironment: 'chosen' };
        try {
            for (const method of methods) config[method] = async supplied => {
                assert(!['initEntities', 'start'].includes(method), 'No resource or runtime startup during reporting');
                calls.push(method);
                assert.strictEqual(process.env.S, 'commerceServer');
                assert.strictEqual(process.env.E, 'chosen');
                assert.strictEqual(process.env.NODICS_NODE, 'worker');
                if (method !== 'loadModules') assert.strictEqual(supplied, options);
                if (method === failure) throw new Error('expected preparation failure');
            };
            const operation = generator.initialize.call({ resolveRuntimeOptions: (args, environment) => {
                assert.deepStrictEqual(args, ['--environment=chosen', '--server=commerce', '--node=worker']);
                assert.strictEqual(environment.S, 'old');
                return options;
            } }, ['--env', 'chosen', '--server', 'commerce', '--node', 'worker'], { S: 'old' });
            if (failure) await assert.rejects(operation, /expected preparation failure/); else await operation;
            const expected = ['prepareBuild', 'initUtilities', 'loadModules'];
            assert.deepStrictEqual(calls, failure ? expected.slice(0, expected.indexOf(failure) + 1) : expected);
            assert.deepStrictEqual({ S: process.env.S, E: process.env.E, NODICS_NODE: process.env.NODICS_NODE }, selection);
        } finally {
            for (const [key, value] of Object.entries(previous)) {
                if (value === undefined) delete config[key]; else config[key] = value;
            }
            for (const [key, value] of Object.entries(selection)) {
                if (value === undefined) delete process.env[key]; else process.env[key] = value;
            }
        }
    });
}
