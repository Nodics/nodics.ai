/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const writeEnvironment = require('./helpers/environmentFixture.cjs');
/** @module nTooling/test/projectTopologyIsolationContract @description Proves independent post-start runtime failure with real isolated child processes. @layer test @owner nTooling */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const net = require('node:net');
const { spawn } = require('node:child_process');
const script = path.resolve(__dirname, '../src/service/project/defaultProjectTopologyService.mjs');
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
async function until(check, message) {
    for (let i = 0; i < 200; i++) { if (await check()) return; await sleep(100); }
    throw new Error(message);
}
async function freePort() {
    const server = net.createServer();
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    const port = server.address().port;
    await new Promise(resolve => server.close(resolve));
    return port;
}
async function scenario(startupFailure) {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'nodics-isolation-'));
    const ports = [];
    while (ports.length < 3) { const port = await freePort(); if (!ports.includes(port)) ports.push(port); }
    const runtimes = ports.map((port, i) => ({ code: `runtime-${i}`, label: `Runtime ${i}`, port,
        command: process.execPath, args: ['-e', startupFailure && i === 1 ? 'process.exit(1)' :
            `require('node:http').createServer((req,res)=>res.end('ready')).listen(${port},'127.0.0.1')`] }));
    fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify({ name: 'isolated.project' }));
    fs.mkdirSync(path.join(dir, 'envs/local'), { recursive: true });
    writeEnvironment(path.join(dir, 'envs/local'), { environment: 'isolated', topology: {
        environment: 'isolated', stateDirectory: 'generated', groups: { backends: runtimes }
    } });
    let output = '';
    const supervisor = spawn(process.execPath, [script, 'start'], { cwd: dir, env: { ...process.env, ENV: '' } });
    supervisor.stdout.on('data', data => { output += data; });
    supervisor.stderr.on('data', data => { output += data; });
    let exited = false;
    supervisor.once('exit', () => { exited = true; });
    try {
        if (startupFailure) {
            await until(() => exited, 'failed startup did not terminate');
            assert.notEqual(supervisor.exitCode, 0);
            await assert.rejects(fetch(`http://127.0.0.1:${ports[0]}`, { signal: AbortSignal.timeout(1000) }));
            return;
        }
        await until(() => output.includes('is running under supervisor'), 'topology did not start: ' + output);
        const statePath = path.join(dir, 'generated/processes.json');
        const state = JSON.parse(fs.readFileSync(statePath));
        process.kill(state.children[1].pid, 'SIGTERM');
        await until(() => output.includes('other runtimes remain running'), 'runtime failure was not isolated');
        assert.equal(exited, false);
        for (const index of [0, 2]) {
            assert.equal((await fetch(`http://127.0.0.1:${ports[index]}`, { signal: AbortSignal.timeout(1000) })).status, 200);
        }
        const failed = JSON.parse(fs.readFileSync(statePath)).children.find(entry => entry.code === 'runtime-1');
        assert.equal(failed.exited, true);
    } catch (error) {
        error.message += '\nSupervisor output:\n' + output;
        throw error;
    } finally {
        if (!exited) supervisor.kill('SIGTERM');
        await until(() => exited, 'test supervisor did not shut down');
        fs.rmSync(dir, { recursive: true, force: true });
    }
}
(async () => {
    await scenario(false);
    await scenario(true);
    console.log('Topology post-start failure isolation and startup rollback validated');
})().catch(error => { console.error(error); process.exitCode = 1; });
