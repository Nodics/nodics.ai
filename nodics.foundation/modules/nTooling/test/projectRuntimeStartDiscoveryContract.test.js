/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nTooling/test/projectRuntimeStartDiscoveryContract
 * @description Verifies project runtime startup derives server facts from environment server package metadata.
 * @layer test
 * @owner nTooling
 */

'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const service = require('../src/service/project/defaultProjectRuntimeStartService');

const root = fs.mkdtempSync(path.join(os.tmpdir(), 'nodics-runtime-discovery-'));
const frameworkRoot = path.join(root, 'nodics.ai');
const projectRoot = path.join(root, 'customer.project');
const environmentRoot = path.join(projectRoot, 'envs', 'customerLocal');
const serverRoot = path.join(environmentRoot, 'loyaltyServer');
const retiredRoot = path.join(environmentRoot, 'legacyServer');

function writeJson(file, value) {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, JSON.stringify(value, null, 2) + '\n');
}

writeJson(path.join(frameworkRoot, 'package.json'), { name: 'nodics.ai' });
writeJson(path.join(frameworkRoot, 'nodics.foundation', 'package.json'), { name: 'nodics.foundation' });
writeJson(path.join(frameworkRoot, 'nodics.loyalty', 'package.json'), { name: 'nodics.loyalty' });
writeJson(path.join(frameworkRoot, 'nodics.waste', 'package.json'), { name: 'nodics.waste' });
writeJson(path.join(frameworkRoot, 'nodics.accelerators/modules/waste', 'package.json'), { name: 'waste' });
writeJson(path.join(projectRoot, 'package.json'), { name: 'customer.project' });
writeJson(path.join(projectRoot, 'nodics.project.json'), {
    topology: { environment: 'customerLocal' }
});
writeJson(path.join(serverRoot, 'package.json'), {
    name: 'loyaltyServer',
    nodics: { kind: 'server', extends: ['nodics.loyalty'] }
});
writeJson(path.join(environmentRoot, 'wasteServer', 'package.json'), {
    name: 'wasteServer',
    nodics: {
        kind: 'server',
        extends: ['nodics.waste'],
        runtimeModuleRoots: ['nodics.waste', 'nodics.accelerators/modules/waste']
    }
});
writeJson(path.join(retiredRoot, 'package.json'), {
    name: 'legacyServerRetired',
    nodics: { kind: 'server', retired: true, replacementServers: ['wcmsStagedServer', 'wcmsOnlineServer'] }
});

const manifest = service.readManifest(projectRoot);
const server = service.resolveServer(projectRoot, manifest, 'loyalty', {});
assert.equal(server.environment, 'customerLocal');
assert.equal(server.server, 'loyaltyServer');
assert.deepEqual(server.moduleRoots, ['nodics.foundation', 'nodics.loyalty', '{project}']);

const moduleRoots = service.resolveModuleRoots(projectRoot, frameworkRoot, server);
assert.deepEqual(moduleRoots, [
    path.join(frameworkRoot, 'nodics.foundation'),
    path.join(frameworkRoot, 'nodics.loyalty'),
    projectRoot
]);

const dockerServer = service.resolveServer(projectRoot, manifest, 'loyalty', { ENV: 'customerLocal' });
assert.equal(dockerServer.server, 'loyaltyServer');

const wasteServer = service.resolveServer(projectRoot, manifest, 'waste', {});
assert.deepEqual(wasteServer.moduleRoots, [
    'nodics.foundation',
    'nodics.waste',
    'nodics.accelerators/modules/waste',
    '{project}'
]);
assert.deepEqual(service.resolveModuleRoots(projectRoot, frameworkRoot, wasteServer), [
    path.join(frameworkRoot, 'nodics.foundation'),
    path.join(frameworkRoot, 'nodics.waste'),
    path.join(frameworkRoot, 'nodics.accelerators/modules/waste'),
    projectRoot
]);

assert.throws(
    () => service.resolveServer(projectRoot, manifest, 'legacy', {}),
    /Project runtime server is retired: legacy/
);

console.log('nTooling project runtime start discovery contract validated');
