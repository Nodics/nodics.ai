/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const writeEnvironment = require('./helpers/environmentFixture.cjs');
/**
 * @module nTooling/test/projectTopologyRuntimeEnvContract
 * @description Verifies local topology runtime environment values are declared
 * by the customer project manifest and injected by framework tooling.
 * @layer test
 * @owner nTooling
 */

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { pathToFileURL } = require('url');

const repositoryRoot = path.resolve(__dirname, '../../../..');
const topologyScript = path.join(
    repositoryRoot,
    'nodics.foundation/modules/nTooling/src/service/project/defaultProjectTopologyService.mjs'
);

const originalCwd = process.cwd();
const originalEnv = process.env.ENV;
const projectRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'nodics-topology-env-'));
function writeJson(filePath, value) {
  if (filePath.endsWith('/config/properties.js')) return writeEnvironment(path.dirname(path.dirname(filePath)), value);
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(value, null, 2) + '\n');
}

writeJson(path.join(projectRoot, 'package.json'), { name: 'acme.startio' });
writeJson(path.join(projectRoot, 'envs', 'testLocal', 'config/properties.js'), {
    contractVersion: 1,
    environment: 'testLocal',
    topology: {
        environment: 'testLocal',
        groups: {
            backends: [{
                code: 'platform',
                label: 'Platform',
                port: 4300,
                readinessChecks: [{
                    label: 'Bootstrap',
                    path: '/nodics/backoffice/v0/bootstrap/public',
                    headers: {
                        'x-enterprise-code': 'default',
                        'x-project-root': '{projectRoot}'
                    }
                }],
                env: {
                    NODICS_TEST_PROJECT_ROOT: '{projectRoot}',
                    NODICS_TEST_WORKSPACE_ROOT: '{workspaceRoot}',
                    NODICS_TEST_NUMBER: 42,
                    NODICS_TEST_SKIPPED: null
                }
            }, {
                code: 'location',
                label: 'Location',
                port: 4380,
                dependsOn: ['platform']
            }]
        }
    }
});

(async () => {
    try {
        process.chdir(projectRoot);
        process.env.ENV = 'testLocal';
        const moduleUrl = pathToFileURL(topologyScript).href + '?runtime-env=' + Date.now();
        const topology = await import(moduleUrl);
        const runtime = topology.backendRuntimes[0];
        assert.equal(fs.realpathSync(runtime.env.NODICS_TEST_PROJECT_ROOT), fs.realpathSync(projectRoot));
        assert.equal(fs.realpathSync(runtime.env.NODICS_TEST_WORKSPACE_ROOT), fs.realpathSync(path.dirname(projectRoot)));
        assert.equal(runtime.env.NODICS_TEST_NUMBER, '42');
        assert.equal(Object.prototype.hasOwnProperty.call(runtime.env, 'NODICS_TEST_SKIPPED'), false);
        assert.equal(runtime.readinessChecks[0].headers['x-enterprise-code'], 'default');
        assert.equal(fs.realpathSync(runtime.readinessChecks[0].headers['x-project-root']), fs.realpathSync(projectRoot));
        assert.deepEqual(topology.backendRuntimes[1].dependsOn, ['platform']);
        assert.deepEqual(topology.runtimeDependencyViolations(topology.backendRuntimes), []);
    } finally {
        process.chdir(originalCwd);
        if (originalEnv === undefined) delete process.env.ENV;
        else process.env.ENV = originalEnv;
    }
})().catch(error => {
    console.error(error);
    process.exitCode = 1;
});
