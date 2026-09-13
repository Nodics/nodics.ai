/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module nTooling/test/projectCommandEntryContract @description Verifies installed command binding and explicit runtime target options using disposable projects. @layer test @owner nTooling */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const tooling = require('../src/service/defaultToolingCommandService');
const runtime = require('../src/service/project/defaultProjectRuntimeStartService');
test('public command options reuse canonical tooling options and reject ambiguous selectors', () => {
    assert.deepEqual(tooling.normalizeArguments(['start', '--env', 'qa', '--server=jobs', '--node', 'worker1', '--project', '/tmp/customer']),
        ['start', '--environment=qa', '--server=jobs', '--node=worker1', '--home=/tmp/customer']);
    assert.throws(() => tooling.normalizeArguments(['build', '--server']), /Missing value/);
    assert.throws(() => tooling.normalizeArguments(['build', '--env=qa', '--environment=prod']), /Duplicate/);
    assert.throws(() => tooling.normalizeArguments(['start', '--server', '--env=qa']), /Missing value/);
    let invocation;
    runtime.runCli.call({ start: options => { invocation = options; return true; } },
        ['--environment=qa', '--server=jobs', '--node=worker1'], { NODICS_PROJECT_ROOT: '/tmp/customer', ENV: 'old', SERVER: 'oldServer' });
    assert.equal(invocation.serverCode, 'jobs');
    assert.equal(invocation.environment.E, 'qa');
    assert.equal(invocation.environment.NODICS_NODE, 'worker1');
});
test('a local Foundation dependency installs the nodics executable without a project JavaScript wrapper', t => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'nodics-installed-cli-'));
    t.after(() => fs.rmSync(root, { recursive: true, force: true }));
    const foundation = path.resolve(__dirname, '../../..');
    fs.writeFileSync(path.join(root, 'package.json'), JSON.stringify({ name: 'example.command-fixture', private: true,
        dependencies: { 'nodics.foundation': 'file:' + foundation } }));
    const installed = spawnSync('npm', ['install', '--offline', '--ignore-scripts', '--no-audit', '--no-fund'], { cwd: root, encoding: 'utf8' });
    assert.equal(installed.status, 0, installed.stderr);
    const command = path.join(root, 'node_modules/.bin/nodics');
    assert.equal(fs.realpathSync(command), path.join(foundation, 'modules/nTooling/bin/nodics-project.js'));
    const result = spawnSync(command, ['help'], { cwd: root, encoding: 'utf8', env: { ...process.env, NODICS_HOME: root } });
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /project:runtime-start/);
    assert.match(result.stdout, /start/);
    assert.equal(fs.existsSync(path.join(root, 'scripts')), false);
});
