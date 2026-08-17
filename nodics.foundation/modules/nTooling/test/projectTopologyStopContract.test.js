/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nTooling/test/projectTopologyStopContract
 * @description Verifies local topology stop handles stale generated supervisor
 * state safely without killing unrelated processes.
 * @layer test
 * @owner nTooling
 */

const assert = require('assert');
const { execFileSync, spawnSync } = require('child_process');
const fs = require('fs');
const net = require('net');
const os = require('os');
const path = require('path');

const repositoryRoot = path.resolve(__dirname, '../../../..');
const topologyScript = path.join(
    repositoryRoot,
    'nodics.foundation/modules/nTooling/src/service/project/defaultProjectTopologyService.mjs'
);

const topologySource = fs.readFileSync(topologyScript, 'utf8');

assert(topologySource.includes('detached: true'),
    'Runtime commands should be spawned as process groups so wrapper and server children can be stopped together');
assert(topologySource.includes('process.kill(-pid, signal)'),
    'Topology stop should signal the runtime process group before falling back to the direct child PID');
assert(topologySource.includes('Supervisor exited but runtime ports are still listening'),
    'External stop should wait for runtime ports to close before reporting success');

function reservePort() {
    return new Promise((resolve, reject) => {
        const server = net.createServer();
        server.once('error', reject);
        server.listen(0, '127.0.0.1', () => {
            const address = server.address();
            server.close(() => resolve(address.port));
        });
    });
}

function createProject(port) {
    const projectRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'nodics-topology-stop-'));
    fs.mkdirSync(path.join(projectRoot, 'generated/local-topology'), { recursive: true });
    fs.writeFileSync(path.join(projectRoot, 'nodics.project.json'), JSON.stringify({
        topology: {
            environment: 'testLocal',
            stateDirectory: 'generated/local-topology',
            groups: {
                backends: [{ code: 'platform', label: 'Platform', port }]
            }
        }
    }, null, 2) + '\n');
    fs.writeFileSync(path.join(projectRoot, 'generated/local-topology/processes.json'), JSON.stringify({
        contractVersion: 1,
        environment: 'testLocal',
        projectRoot,
        supervisorPid: 999999,
        children: [{ code: 'platform', pid: 999998, port }]
    }, null, 2) + '\n');
    return projectRoot;
}

reservePort().then(port => {
    const projectRoot = createProject(port);
    const output = execFileSync(process.execPath, [topologyScript, 'stop'], {
        cwd: projectRoot,
        encoding: 'utf8'
    });
    assert(output.includes('removed stale testLocal supervisor state'),
        'Stop should clean stale state when no declared runtime ports are listening');
    assert(!fs.existsSync(path.join(projectRoot, 'generated/local-topology/processes.json')),
        'Stale state file should be removed after safe no-op stop');
}).then(() => new Promise((resolve, reject) => {
    const server = net.createServer();
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => {
        const address = server.address();
        const projectRoot = createProject(address.port);
        const result = spawnSync(process.execPath, [topologyScript, 'stop'], {
            cwd: projectRoot,
            encoding: 'utf8'
        });
        server.close(() => {
            try {
                assert.notStrictEqual(result.status, 0,
                    'Stop should fail closed when stale state has a listening runtime port');
                assert(result.stderr.includes('Listening ports require explicit resolution'),
                    'Failure should name that busy ports require explicit resolution');
                assert(fs.existsSync(path.join(projectRoot, 'generated/local-topology/processes.json')),
                    'Busy stale state should remain for operator inspection');
                resolve();
            } catch (error) {
                reject(error);
            }
        });
    });
})).catch(error => {
    console.error(error);
    process.exitCode = 1;
});
