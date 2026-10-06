/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';
/** @module copilotKnowledge/test/copilotRuntimeKnowledgeSource @description Verifies runtime order, module containment and authored source partitioning through the existing repository provider. @layer test @owner copilotKnowledge */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const binding = require('../src/service/defaultCopilotRuntimeKnowledgeSourceService');
const registry = require('../src/service/defaultCopilotKnowledgeSourceRegistryService');
const provider = require('../src/service/defaultCopilotRepositoryKnowledgeSourceProviderService');
const policy = require('../../copilotPolicy/src/service/defaultCopilotPolicyService');
const defaults = require('../config/properties').copilot.knowledge;

test('runtime binding reads authored module paths and invalidates evidence when canonical load order changes', async (t) => {
    const previous = { NODICS: global.NODICS, SERVICE: global.SERVICE };
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'copilot-runtime-'));
    t.after(() => {
        Object.assign(global, previous);
        fs.rmSync(root, { recursive: true, force: true });
    });
    const modulePath = path.join(root, 'modules', 'sample');
    fs.mkdirSync(path.join(modulePath, 'src', 'service', 'gen'), {
        recursive: true,
    });
    fs.writeFileSync(
        path.join(modulePath, 'src', 'service', 'sample.js'),
        'module.exports = {};',
    );
    fs.writeFileSync(
        path.join(modulePath, 'src', 'service', 'gen', 'derived.js'),
        'derived',
    );
    fs.writeFileSync(path.join(root, 'unrelated.js'), 'not loaded');
    for (const directory of ['modules/inactive', 'envs/unselected', 'nodes/other']) {
        fs.mkdirSync(path.join(modulePath, directory), { recursive: true });
        fs.writeFileSync(path.join(modulePath, directory, 'private.js'), 'not selected');
    }
    const modules = new Map([
        [10, { name: 'sample', index: 10, path: modulePath }],
    ]);
    global.NODICS = { getIndexedModules: () => modules };
    global.SERVICE = {
        DefaultCopilotPolicyService: policy,
        DefaultCopilotKnowledgeSourceRegistryService: registry,
    };
    assert.deepEqual(binding.choices({ repo: root }), [
        { code: 'repo/sample', repository: 'repo', moduleName: 'sample' },
    ]);
    const source = registry.normalize(
        {
            code: 'runtime-sample',
            runtimeModule: 'sample',
            repository: 'repo',
            project: 'project',
            module: 'sample',
            owner: 'sample',
            version: 'commit-one',
            sourceType: 'SOURCE_CODE',
            classification: 'RESTRICTED',
            paths: ['**/*'],
            allowedChannels: ['EMPLOYEE'],
            secretScanPolicy: 'REQUIRED',
            enabled: true,
        },
        defaults.sourceRegistry,
        policy,
    );
    const bound = binding.bind(source, { repo: root });
    fs.writeFileSync(
        path.join(modulePath, 'unindexed.bin'),
        'not an authored text format',
    );
    const files = await provider.read(bound, {
        configuration: { ...defaults.ingestion, maximumFilesPerSource: 1 },
        repositoryRoots: { repo: root },
    });
    assert.deepEqual(
        files.map((file) => file.relativePath),
        ['modules/sample/src/service/sample.js'],
    );
    assert.equal(bound.runtimeBinding.loadIndex, '10');
    modules.set(10, { name: 'sample', index: '1.17.5.20', path: modulePath });
    assert.equal(binding.bind(source, { repo: root }).runtimeBinding.loadIndex, '1.17.5.20');
    for (const index of [null, {}, NaN, Infinity, '1..2', '1e3', '1.-2', '1.9007199254740992']) {
        modules.set(10, { name: 'sample', index, path: modulePath });
        assert.throws(() => binding.bind(source, { repo: root }), /ORDER_INVALID/);
    }
    modules.set(10, { name: 'sample', index: 10, path: modulePath });
    assert.doesNotMatch(JSON.stringify(bound), new RegExp(os.tmpdir()));
    modules.set(20, { name: 'extension', index: 20, path: root });
    assert.equal(binding.choices({ repo: root }).length, 2);
    assert(!binding.choices({ repo: root }).some(item => item.moduleName === 'inactive'));
    assert.notEqual(
        binding.bind(source, { repo: root }).sourcePolicyDigest,
        bound.sourcePolicyDigest,
    );
    modules.delete(10);
    assert.throws(() => binding.bind(source, { repo: root }), /UNAVAILABLE/);
    modules.set(10, { name: 'sample', index: 10, path: os.tmpdir() });
    assert.ok(
        !binding
            .choices({ repo: root })
            .some((choice) => choice.moduleName === 'sample'),
    );
    assert.throws(
        () => binding.bind(source, { repo: root }),
        /OUTSIDE_REPOSITORY/,
    );
    await assert.rejects(
        provider.read(source, {
            configuration: defaults.ingestion,
            repositoryRoots: { repo: root },
        }),
        /BINDING_REQUIRED/,
    );
});

test('new installations have no sources; framework roots are trusted nConfig bindings', () => {
    assert.deepEqual(defaults.sourceRegistry.definitions, []);
    assert.deepEqual(defaults.repositoryRoots, {
        framework: { $config: 'path', base: 'framework', relative: '' },
        project: { $config: 'path', base: 'project', relative: '' },
    });
});

test('internal documentation registration has a Discovery provider without an application adapter', async t => {
    const previous = global.SERVICE;
    t.after(() => { global.SERVICE = previous; });
    const registered = new Map();
    global.SERVICE = {
        DefaultDiscoverySourceRegistryService: { register: (family, type, implementation) => registered.set(type, implementation) },
        DefaultCopilotRepositoryKnowledgeSourceProviderService: provider,
    };
    await require('../nodics').postInit({});
    assert.equal(registered.get('INTERNAL_DOCUMENTATION'), provider);
});
