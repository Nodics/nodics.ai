/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module emsClient/test/activeEmsPublisherGuard
 * @description Proves EMS smoke discovery remains inert without loading runtime configuration, accessing services, or exercising its live path.
 * @layer test
 * @owner emsClient
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const vm = require('node:vm');
const { spawnSync } = require('node:child_process');

const target = path.join(__dirname, 'activeEmsPublisher.test.js');
const source = fs.readFileSync(target, 'utf8');
const scenarios = [
    { name: 'default discovery', args: [], env: {}, direct: true },
    { name: 'environment variables cannot opt in', args: [], env: { NODICS_EMS_REQUIRE_LIVE: 'true', NODICS_EMS_TEST_SERVER: 'fixture', SERVER: 'fixture' }, direct: true },
    { name: 'non-exact flag cannot opt in', args: ['--require-live=true'], env: {}, direct: true },
    { name: 'test-runner context rejects even the exact live flag', args: ['--require-live'], env: { NODE_TEST_CONTEXT: 'child-v8' }, direct: true },
    { name: 'import rejects even the exact live flag', args: ['--require-live'], env: {}, direct: false },
];

for (const scenario of scenarios) {
    test('EMS publisher guard: ' + scenario.name, async () => {
        const imports = [], messages = [], forbidden = [];
        const module = { exports: {} };
        const reject = (name) => {
            forbidden.push(name);
            throw new Error('Forbidden smoke side effect: ' + name);
        };
        const load = (name) => {
            imports.push(name);
            if (name === 'assert') return require('node:assert');
            if (name === 'path') return path;
            return reject('require ' + name);
        };
        load.main = scenario.direct ? module : {};
        const sandbox = {
            module, require: load, __dirname,
            process: { argv: [process.execPath, target, ...scenario.args], env: scenario.env, exit: () => reject('exit') },
            console: { log: (...args) => messages.push(args.join(' ')), error: () => reject('error') },
        };
        sandbox.global = sandbox;
        for (const name of ['SERVICE', 'CONFIG']) {
            Object.defineProperty(sandbox, name, { get: () => reject(name) });
        }
        vm.runInNewContext(source, sandbox, { filename: target, timeout: 1000 });
        await new Promise(resolve => setImmediate(resolve));
        assert.deepEqual(forbidden, [], 'no runtime load, startup, service access or cleanup');
        assert.deepEqual(imports, ['assert', 'path']);
        assert.equal(messages.length, 1);
        assert.match(messages[0], /NOT EXECUTED/);
    });
}

test('generic node --test discovery cannot load the EMS runtime', () => {
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'nodics-ems-guard-'));
    const preload = path.join(directory, 'deny-runtime.cjs');
    try {
        // Deny every non-builtin dependency requested by the smoke before it can execute.
        fs.writeFileSync(preload, `
const Module = require('node:module');
const original = Module._load;
Module._load = function (name, parent, isMain) {
    if (parent && parent.filename === ${JSON.stringify(target)} && !Module.isBuiltin(name)) {
        throw new Error('EMS_RUNTIME_IMPORT_BLOCKED');
    }
    return original.apply(this, arguments);
};
`);
        const child = spawnSync(process.execPath, ['--require', preload, '--test', target], {
            env: {}, encoding: 'utf8', timeout: 10000,
        });
        assert.ifError(child.error);
        assert.equal(child.status, 0, child.stdout + child.stderr);
        assert.match(child.stdout, /NOT EXECUTED/);
        assert.doesNotMatch(child.stdout + child.stderr, /EMS_RUNTIME_IMPORT_BLOCKED|EMS publish smoke passed/);
    } finally {
        fs.rmSync(directory, { recursive: true, force: true });
    }
});
