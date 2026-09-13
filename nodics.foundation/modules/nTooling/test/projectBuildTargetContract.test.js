/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module nTooling/test/ProjectBuildTargetContract @description Validates selected project generation coordinates, preserved runtime roots and generated-test isolation. @layer test @owner nTooling */
const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const runtime = require('../src/service/project/defaultProjectRuntimeStartService');
const lifecycle = require('../src/service/command/defaultNodicsLifecycleCommandService');
const runner = require('../../nTest/src/service/tooling/defaultGeneratedTestRunnerService');

test('project build resolves the selected server graph and leaves environment selection unchanged', async () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'nodics-project-build-target-'));
    const projectRoot = path.join(root, 'project');
    const frameworkRoot = path.join(root, 'framework');
    const write = (file, value) => { fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, typeof value === 'string' ? value : JSON.stringify(value)); };
    write(path.join(projectRoot, 'package.json'), { name: 'customer.project', nodics: { kind: 'application', runtimeModule: true } });
    write(path.join(projectRoot, 'envs', 'chosen', 'capabilityServer', 'package.json'), { name: 'capabilityServer', nodics: { kind: 'server', extends: ['arbitrary.capability'] } });
    write(path.join(frameworkRoot, 'package.json'), { name: 'nodics.ai', nodics: { kind: 'framework', runtimeModule: false } });
    write(path.join(frameworkRoot, 'arbitrary.capability', 'package.json'), { name: 'arbitrary.capability' });
    write(path.join(frameworkRoot, 'nodics.foundation', 'package.json'), { name: 'nodics.foundation', main: 'index.js' });
    write(path.join(frameworkRoot, 'nodics.foundation', 'index.js'), 'module.exports = { buildAll: async function (options) { return { options, server: process.env.S, environment: process.env.E }; } };');
    const environment = { NODICS_PROJECT_ROOT: projectRoot, NODICS_FRAMEWORK_ROOT: frameworkRoot };
    const previous = { S: process.env.S, E: process.env.E };
    try {
        await assert.rejects(runtime.lifecycle({ projectRoot, method: 'buildAll', environment }), /Select a server/);
        const result = await runtime.runCli(['--lifecycle=buildAll', '--server=capability', '--environment=chosen'], environment);
        assert.equal(result.options.CUSTOM_HOME, projectRoot);
        assert.equal(result.options.defaultServer, 'capabilityServer');
        assert.equal(result.options.defaultEnvironment, 'chosen');
        assert.deepEqual(result.options.MODULE_ROOTS, [path.join(frameworkRoot, 'nodics.foundation'), path.join(frameworkRoot, 'arbitrary.capability'), projectRoot]);
        const originalHomes = { NODICS_HOME: process.env.NODICS_HOME, NODICS_FRAMEWORK_ROOT: process.env.NODICS_FRAMEWORK_ROOT };
        try {
            process.env.NODICS_HOME = projectRoot; process.env.NODICS_FRAMEWORK_ROOT = frameworkRoot;
            const generator = require('../../nRouter/src/service/tooling/defaultOpenapiContractGeneratorService');
            const roots = generator.resolveRuntimeRoots(['--environment=chosen', '--server=capability']);
            assert.deepEqual(roots.MODULE_ROOTS, result.options.MODULE_ROOTS);
            assert.equal(roots.CUSTOM_HOME, projectRoot);
            assert.equal(roots.NODICS_HOME, path.join(frameworkRoot, 'nodics.foundation'));
            await assert.rejects(async () => generator.resolveRuntimeRoots(['--environment=chosen', '--server=missing']), /Unknown project runtime/);
        } finally {
            for (const [key, value] of Object.entries(originalHomes)) { if (value === undefined) delete process.env[key]; else process.env[key] = value; }
        }

        assert.equal(result.server, 'capabilityServer'); assert.equal(result.environment, 'chosen');
        assert.deepEqual({ S: process.env.S, E: process.env.E }, previous);
        const calls = [];
        lifecycle.runNodicsMethod.call(Object.assign({}, lifecycle, { spawn: (...args) => calls.push(args) }),
            { home: projectRoot, frameworkHome: frameworkRoot, args: ['--server=capability', '--environment=chosen'] }, 'buildAll');
        assert(calls[0][2][0].endsWith('defaultProjectRuntimeStartService.js'));
        assert(calls[0][2].includes('--server=capability'));
        const selected = runner.resolveTestRoot(['--server=capability', '--environment=chosen'], { NODICS_HOME: projectRoot });
        const selectedFile = path.join(selected, 'schema', 'ownedModule', 'schema.test.js');
        write(selectedFile, '');
        write(path.join(projectRoot, 'envs', 'chosen', 'otherServer', 'test', 'gen', 'schema', 'other.test.js'), '');
        write(path.join(selected, 'crud', 'ownedModule', 'destructive.test.js'), '');
        assert.deepEqual(runner.collectGeneratedTests(selected).sort(), [selectedFile]);
        assert.equal(runner.collectGeneratedTests(selected, [], { selectedType: 'crud', includeDestructive: true }).length, 1);
        assert.equal(runner.resolveTestRoot(['--root=' + selected], {}), selected);
        assert.throws(() => runner.resolveTestRoot([], { NODICS_HOME: projectRoot }), /Select --server/);
    } finally { fs.rmSync(root, { recursive: true, force: true }); }
});


test('project build and clean select project gates while framework authoring keeps its own governance', async () => {
    const commands = require('../config/properties').tooling.commands;
    const run = async (framework, command) => {
        const steps = [];
        await lifecycle.run.call({ isFrameworkRepository: () => framework, runStep: (context, step) => steps.push(step) }, { command });
        return steps;
    };
    const customer = await run(false, commands.build), framework = await run(true, commands.build);
    assert.deepEqual(customer, commands.build.projectSteps);
    assert(customer.some(step => step.tool && step.tool[0] === 'project:validate'));
    assert(customer.some(step => step.tool && step.tool[0] === 'docs:coverage'));
    assert(framework.some(step => step.tool && step.tool[0] === 'ai:validate'));
    assert(framework.some(step => step.tool && step.tool[0] === 'ai:principle-audit'));
    assert.deepEqual(await run(false, commands.clean), [{ nodicsMethod: 'cleanAll' }]);
});


test('OpenAPI preparation loads metadata without starting runtime service hooks', async () => {
    const config = require('../../nConfig');
    const generator = require('../../nRouter/src/service/tooling/defaultOpenapiContractGeneratorService');
    const methods = ['prepareBuild', 'initUtilities', 'loadModules', 'initEntities'];
    const previous = Object.fromEntries(methods.map(key => [key, config[key]]));
    const previousServices = global.SERVICE;
    const calls = [];
    try {
        for (const key of methods) config[key] = async () => {
            if (key === 'initEntities') throw new Error('Runtime credential and resource startup is forbidden during static generation');
            calls.push(key);
        };
        global.SERVICE = {
            DefaultRouterService: { prepareModulesConfiguration: async () => calls.push('routerMetadata') },
            DefaultFilesLoaderService: { loadRouterFiles: () => ({ owned: {} }) },
            DefaultRouterConfigurationService: { setRawRouters: () => calls.push('routerDefinitions') }
        };
        const result = await generator.initialize.call({ loadEffectiveSchemas: async () => ({ owned: {} }) }, {}, []);
        assert.deepEqual(result.rawSchema, { owned: {} });
        assert.deepEqual(calls, ['prepareBuild', 'initUtilities', 'loadModules', 'routerMetadata', 'routerDefinitions']);
    } finally {
        Object.assign(config, previous);
        if (previousServices === undefined) delete global.SERVICE; else global.SERVICE = previousServices;
    }
});
