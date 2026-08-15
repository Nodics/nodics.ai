/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module nTooling/test/RepositoryBuildCompositionContract @description Validates the isolated framework release-build topology. @layer test @owner nTooling */
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const compositionService = require('../src/service/command/defaultRepositoryBuildCompositionService');
const lifecycleService = require('../src/service/command/defaultNodicsLifecycleCommandService');

const repositoryRoot = path.resolve(__dirname, '../../../..');
const composition = compositionService.create();
try {
    assert(compositionService.runtimeGroups.includes('nodics.localization'),
        'Repository builds must regenerate Localization schema artifacts after clean');
    assert(compositionService.runtimeGroups.includes('nodics.discovery'),
        'Repository builds must regenerate Discovery schema artifacts after clean');
    assert(composition.root.startsWith(require('os').tmpdir()), 'Composition must be outside framework source');
    assert.strictEqual(compositionService.validate(composition), true);
    const serverPackagePath = path.join(composition.serverRoot, 'package.json');
    const serverPackage = JSON.parse(fs.readFileSync(serverPackagePath, 'utf8'));
    serverPackage.nodics.extends.pop();
    fs.writeFileSync(serverPackagePath, JSON.stringify(serverPackage, null, 2), 'utf8');
    assert.throws(() => compositionService.validate(composition), /every and only standard runtime group/);
    assert.throws(() => compositionService.validateMethod('start'), /Unsupported repository lifecycle method/);
    assert.strictEqual(lifecycleService.isFrameworkRepository({ home: repositoryRoot }), true);
} finally {
    fs.rmSync(composition.root, { recursive: true, force: true });
}
console.log('Repository build composition contract validated');
