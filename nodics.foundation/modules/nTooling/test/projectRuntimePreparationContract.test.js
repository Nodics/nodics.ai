/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nTooling/test/projectRuntimePreparationContract
 * @description Verifies isolated project runtime preparation from deployment metadata, role selection, API exposure, invalid selections, and global-state preservation without starting application runtimes.
 * @owner nTooling
 * @layer test
 */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const test = require('node:test');

test('preparation uses independent deployment metadata, isolates roles and rejects invalid selections', t => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'runtime-preparation-'));
    t.after(() => fs.rmSync(root, { recursive: true, force: true }));
    const write = (file, value) => { fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, value); };
    const boundary = (directory, name, kind, index, properties, extra = {}) => {
        write(path.join(directory, 'package.json'), JSON.stringify({ name, version: '1.0.0', index, main: 'nodics.js',
            nodics: { kind, runtimeModule: true, displayName: name, owns: ['configuration'],
                runtime: { router: false, publish: false, web: false }, ...extra } }));
        write(path.join(directory, 'nodics.js'), 'module.exports = {};');
        write(path.join(directory, 'config/properties.js'), 'module.exports = ' + JSON.stringify(properties));
    };
    boundary(root, 'independent.runtime', 'application', '1000.00', {});
    boundary(path.join(root, 'envs', 'quality'), 'quality', 'group', '1001.00', {});
    for (const [index, server] of ['author', 'reader'].entries()) {
        boundary(path.join(root, 'envs', 'quality', server), server, 'server', '1002.0' + index, {
            activeModules: { modules: ['nodics.foundation', 'independent.runtime', 'quality', server] },
            runtimeRole: { code: server.toUpperCase() },
            servers: {
                default: { endpoint: { httpHost: '127.0.0.1', httpPort: 5800 + index } },
                profile: { remoteOnly: true, endpoint: { httpHost: 'identity.example.test', httpPort: 5802 } },
            },
            apiExposure: { categories: { fixtureApi: { enabled: server === 'author' } } },
            fixturePolicy: { value: server },
        }, { extends: ['nodics.foundation'], runtimeModuleRoots: [] });
    }
    const prepare = require.resolve('./helpers/projectRuntimePreparation.cjs');
    const run = (server, options = {}) => spawnSync(process.execPath, ['-e',
        'const assert = require("node:assert/strict"); const prepare = require(process.argv[1]); ' +
        'const options = JSON.parse(process.argv[2]); const sentinel = {}; ' +
        'if (options.preserveGlobal) global._ = sentinel; else delete global._; ' +
        'const descriptor = Object.getOwnPropertyDescriptor(global, "_"); ' +
        'let result; try { result = prepare(options); } finally { ' +
        'assert.deepEqual(Object.getOwnPropertyDescriptor(global, "_"), descriptor); } ' +
        'process.stdout.write(JSON.stringify(result));',
        prepare, JSON.stringify({ projectRoot: root, environment: 'quality', server, ...options }),
    ], { encoding: 'utf8', timeout: 30000, env: { PATH: process.env.PATH, HOME: process.env.HOME } });
    for (const server of ['author', 'reader']) {
        const result = run(server);
        assert.equal(result.status, 0, result.stderr);
        const prepared = JSON.parse(result.stdout);
        assert.equal(prepared.properties.fixturePolicy.value, server);
        assert(prepared.modules.includes(server));
        assert(!prepared.modules.includes(server === 'author' ? 'reader' : 'author'));
        assert.equal(fs.existsSync(path.join(root, 'envs', 'quality', server, 'temp')), false);
    }
    assert.equal(run('author', { expectedApiExposure: ['fixtureApi'] }).status, 0);
    assert.equal(run('author', { expectedApiExposure: ['fixtureApi'], preserveGlobal: true }).status, 0);
    assert.match(run('reader', { expectedApiExposure: ['fixtureApi'] }).stderr, /API exposure should be enabled/);
    assert.match(run('missing').stderr, /Unknown project runtime server/);
    assert.match(run('../escape').stderr, /valid server/);
    assert.match(run('author', { environment: 'absent' }).stderr, /Unknown project runtime server/);
});
