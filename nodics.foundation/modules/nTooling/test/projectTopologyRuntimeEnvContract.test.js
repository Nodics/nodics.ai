/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

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
const projectRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'nodics-topology-env-'));
fs.writeFileSync(path.join(projectRoot, 'nodics.project.json'), JSON.stringify({
    topology: {
        environment: 'testLocal',
        groups: {
            backends: [{
                code: 'platform',
                label: 'Platform',
                port: 4300,
                env: {
                    NODICS_TEST_PROJECT_ROOT: '{projectRoot}',
                    NODICS_TEST_WORKSPACE_ROOT: '{workspaceRoot}',
                    NODICS_TEST_NUMBER: 42,
                    NODICS_TEST_SKIPPED: null
                }
            }]
        }
    }
}, null, 2) + '\n');

(async () => {
    try {
        process.chdir(projectRoot);
        const moduleUrl = pathToFileURL(topologyScript).href + '?runtime-env=' + Date.now();
        const topology = await import(moduleUrl);
        const runtime = topology.backendRuntimes[0];
        assert.equal(fs.realpathSync(runtime.env.NODICS_TEST_PROJECT_ROOT), fs.realpathSync(projectRoot));
        assert.equal(fs.realpathSync(runtime.env.NODICS_TEST_WORKSPACE_ROOT), fs.realpathSync(path.dirname(projectRoot)));
        assert.equal(runtime.env.NODICS_TEST_NUMBER, '42');
        assert.equal(Object.prototype.hasOwnProperty.call(runtime.env, 'NODICS_TEST_SKIPPED'), false);
    } finally {
        process.chdir(originalCwd);
    }
})().catch(error => {
    console.error(error);
    process.exitCode = 1;
});
