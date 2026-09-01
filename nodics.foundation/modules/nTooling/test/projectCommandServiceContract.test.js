/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nTooling/test/projectCommandServiceContract
 * @description Guards manifest-driven project commands so generated projects keep facts locally while framework tooling owns execution and validation.
 * @layer test
 * @owner nTooling
 */

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const service = require('../src/service/command/defaultProjectCommandService');

function createProject(manifestOverrides = {}, packageOverrides = {}) {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'nodics-project-contract-'));
    fs.mkdirSync(path.join(root, 'scripts'), { recursive: true });
    fs.writeFileSync(
        path.join(root, 'scripts', 'hello.js'),
        'console.log("hello project command");\n'
    );
    const manifest = Object.assign(
        {
            tooling: {
                scriptOwnership: {
                    projectOwned: ['scripts/hello.js'],
                    forbiddenProjectOwnedPatterns: ['local-security-boundary-qualification']
                },
                commands: {
                    hello: { type: 'projectScript', script: 'scripts/hello.js' }
                }
            }
        },
        manifestOverrides
    );
    const packageJson = Object.assign({ name: 'duShop', version: '0.0.0', private: true }, packageOverrides);
    fs.writeFileSync(path.join(root, 'package.json'), JSON.stringify(packageJson, null, 2));
    if (manifestOverrides !== false) {
        fs.writeFileSync(path.join(root, 'nodics.project.json'), JSON.stringify(manifest, null, 2));
    }
    return root;
}

const validRoot = createProject();
const validManifest = service.readManifest(validRoot);
service.validateManifest(validRoot, validManifest);
assert.equal(service.runProjectCommand(validRoot, validManifest, 'hello', []), true);

const minimalRoot = createProject(false, { name: 'acme.startio' });
const minimalManifest = service.readManifest(minimalRoot);
service.validateManifest(minimalRoot, minimalManifest);
assert.equal(service.resolveProjectCode(minimalRoot, minimalManifest), 'acme.startio');
assert.equal(service.resolveCommands(minimalManifest)['start:platform'].command, 'project:runtime-start');
assert.deepEqual(service.resolveCommands(minimalManifest)['docker-local:preflight'].args, ['dockerLocal', 'preflight']);
assert.equal(service.resolveCommands(minimalManifest)['acceptance:nexus-cms-media-seed'].command, 'project:nexus-cms-media-seed');

const descriptorProjectCodeRoot = createProject({
    projectCode: 'right.shop',
    tooling: undefined
}, { name: 'right.shop' });
assert.throws(
    () => service.validateManifest(descriptorProjectCodeRoot, service.readManifest(descriptorProjectCodeRoot)),
    /must not declare projectCode/
);

const descriptorContractVersionRoot = createProject({
    contractVersion: 1,
    tooling: undefined
}, { name: 'right.shop' });
assert.throws(
    () => service.validateManifest(descriptorContractVersionRoot, service.readManifest(descriptorContractVersionRoot)),
    /must not declare contractVersion/
);

const emptyDescriptorRoot = createProject({
    tooling: undefined
}, { name: 'right.shop' });
assert.deepEqual(service.readManifest(emptyDescriptorRoot), {});
assert.throws(
    () => service.validateManifest(emptyDescriptorRoot, service.readManifest(emptyDescriptorRoot)),
    /Unnecessary nodics\.project\.json/
);

const misplacedTopologyRoot = createProject({
    topology: { environment: 'rightLocal' },
    tooling: undefined
}, { name: 'right.shop' });
assert.throws(
    () => service.validateManifest(misplacedTopologyRoot, service.readManifest(misplacedTopologyRoot)),
    /Unsupported nodics\.project\.json property `topology`/
);

const emptyToolingRoot = createProject({
    tooling: {}
}, { name: 'right.shop' });
assert.throws(
    () => service.validateManifest(emptyToolingRoot, service.readManifest(emptyToolingRoot)),
    /remove empty override sections/
);

const forbiddenRoot = createProject({
    tooling: {
        scriptOwnership: {
            projectOwned: ['scripts/local-security-boundary-qualification.mjs'],
            forbiddenProjectOwnedPatterns: ['local-security-boundary-qualification']
        },
        commands: {
            unsafe: { type: 'projectScript', script: 'scripts/local-security-boundary-qualification.mjs' }
        }
    }
});
fs.writeFileSync(path.join(forbiddenRoot, 'scripts', 'local-security-boundary-qualification.mjs'), 'console.log("unsafe");\n');
assert.throws(
    () => service.validateManifest(forbiddenRoot, service.readManifest(forbiddenRoot)),
    /Forbidden framework-owned script pattern/
);

const forbiddenDirectoryRoot = createProject({
    tooling: {
        scriptOwnership: {
            projectOwned: ['scripts/hello.js'],
            forbiddenProjectDirectories: ['src', 'local-engines']
        },
        commands: {
            hello: { type: 'projectScript', script: 'scripts/hello.js' }
        }
    }
});
fs.mkdirSync(path.join(forbiddenDirectoryRoot, 'src'), { recursive: true });
assert.throws(
    () => service.validateManifest(forbiddenDirectoryRoot, service.readManifest(forbiddenDirectoryRoot)),
    /Forbidden project-owned implementation directory exists: src/
);

console.log('nTooling project command service contract validated');
