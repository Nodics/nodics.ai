/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nTooling/test/projectCommandServiceContract
 * @description Guards structure-discovered project commands so generated projects avoid duplicate command descriptors while framework tooling owns execution and validation.
 * @layer test
 * @owner nTooling
 */

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const service = require('../src/service/command/defaultProjectCommandService');

function createProject(packageOverrides = {}) {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'nodics-project-contract-'));
    fs.mkdirSync(path.join(root, 'scripts', 'acceptance'), { recursive: true });
    fs.writeFileSync(
        path.join(root, 'scripts', 'acceptance', 'defaultProjectLocalBootstrapAcceptanceService.mjs'),
        'console.log("hello project command");\n'
    );
    const packageJson = Object.assign({ name: 'duShop', version: '0.0.0', private: true }, packageOverrides);
    fs.writeFileSync(path.join(root, 'package.json'), JSON.stringify(packageJson, null, 2));
    fs.mkdirSync(path.join(root, 'envs', 'duShopLocal', 'platformServer'), { recursive: true });
    fs.writeFileSync(path.join(root, 'envs', 'duShopLocal', 'platformServer', 'package.json'), JSON.stringify({
        name: 'platformServer',
        nodics: { kind: 'server' }
    }, null, 2));
    return root;
}

const validRoot = createProject();
service.validateProject(validRoot);
assert.equal(service.runProjectCommand(validRoot, 'acceptance:local', []), true);
assert.equal(service.resolveCommands(validRoot)['start:platform'].command, 'project:runtime-start');
assert.equal(service.resolveCommands(validRoot)['docker-local:preflight'].command, 'project:container');
assert.equal(service.resolveCommands(validRoot)['post-reset:readiness'].command, 'project:post-reset-readiness');

const minimalRoot = createProject({ name: 'acme.startio' });
service.validateProject(minimalRoot);
assert.equal(service.resolveProjectCode(minimalRoot), 'acme.startio');
assert.equal(service.resolveCommands(minimalRoot)['docs:generate'].command, 'project:documentation-content');
assert.equal(service.defaultCommands()['post-reset:readiness'].home, 'project');
assert.equal(Object.keys(service.defaultCommands()).some(name => /kickoff/.test(name)), false);

const descriptorProjectCodeRoot = createProject({ name: 'right.shop' });
fs.writeFileSync(path.join(descriptorProjectCodeRoot, 'nodics.project.json'), JSON.stringify({ projectCode: 'right.shop' }, null, 2));
assert.throws(
    () => service.validateProject(descriptorProjectCodeRoot),
    /Unsupported nodics\.project\.json/
);

const forbiddenRoot = createProject();
fs.writeFileSync(path.join(forbiddenRoot, 'scripts', 'acceptance', 'local-security-boundary-qualificationService.mjs'), 'console.log("unsafe");\n');
assert.throws(
    () => service.validateProject(forbiddenRoot),
    /Forbidden framework-owned script pattern/
);

const forbiddenDirectoryRoot = createProject();
fs.mkdirSync(path.join(forbiddenDirectoryRoot, 'src'), { recursive: true });
assert.throws(
    () => service.validateProject(forbiddenDirectoryRoot),
    /Forbidden project-owned implementation directory exists: src/
);

console.log('nTooling project command service contract validated');
