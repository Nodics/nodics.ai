/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/**
 * @module nodics.process/test/processModuleContract
 * @description Protects the initial Process functional module metadata, Axis navigation contract, and visual-designer safety defaults.
 * @layer test
 * @owner nodics.process
 */
const assert = require('assert');
const fs = require('fs');
const path = require('path');

const packageJson = require('../package.json');
const properties = require('../config/properties');
const workflowPackage = require('../modules/workflow/package.json');
const flowSchemaPackage = require('../modules/workflow/modules/flowSchema/package.json');
const flowCorePackage = require('../modules/workflow/modules/flowCore/package.json');
const flowApiPackage = require('../modules/workflow/modules/flowApi/package.json');

const capability = properties.backofficeCapabilities.process;
const rootDir = path.resolve(__dirname, '..');

/**
 * Resolves a path under nodics.process.
 *
 * @param {...string} segments Path segments.
 * @returns {string} Absolute path.
 */
function processPath(...segments) {
    return path.join(rootDir, ...segments);
}

assert.deepStrictEqual(
    packageJson.nodics.extends,
    ['nodics.core'],
    'nodics.process must extend nodics.core directly',
);
assert.strictEqual(
    packageJson.nodics.functionalModule.identity,
    'nodics.process',
    'functional module identity must remain nodics.process',
);
assert.deepStrictEqual(
    packageJson.requiredModules,
    ['workflow'],
    'nodics.process group must compose workflow instead of owning direct runtime code',
);
assert(
    !fs.existsSync(processPath('src')),
    'nodics.process must not contain direct runtime src files; place runtime code under modules/workflow/modules/*',
);
assert.deepStrictEqual(
    workflowPackage.requiredModules,
    ['flowSchema', 'flowCore', 'flowApi'],
    'workflow must compose archive-backed flowSchema, flowCore, and flowApi modules',
);
assert.strictEqual(
    flowSchemaPackage.nodics.runtime.router,
    false,
    'flowSchema must not expose HTTP routes',
);
assert.strictEqual(
    flowCorePackage.nodics.runtime.router,
    false,
    'flowCore must not expose HTTP routes',
);
assert.strictEqual(
    flowApiPackage.prefix,
    'process',
    'flowApi must expose APIs under the /process route prefix',
);
assert.strictEqual(
    flowApiPackage.nodics.runtime.router,
    true,
    'flowApi must own process HTTP routes',
);
[
    'modules/workflow/modules/flowSchema/src/schemas/schemas.js',
    'modules/workflow/modules/flowSchema/src/utils/statusDefinitions.js',
    'modules/workflow/modules/flowCore/src/service/designer/defaultProcessGraphValidationService.js',
    'modules/workflow/modules/flowCore/src/service/definition/defaultProcessDefinitionLifecycleService.js',
    'modules/workflow/modules/flowApi/src/router/routers.js',
    'modules/workflow/modules/flowApi/src/controller/defaultProcessDefinitionController.js',
    'modules/workflow/modules/flowApi/src/facade/defaultProcessDefinitionFacade.js'
].forEach((relativePath) => {
    assert(
        fs.existsSync(processPath(relativePath)),
        `Expected process artifact to exist under correct workflow module: ${relativePath}`,
    );
});
assert.strictEqual(
    capability.capabilityId,
    'business-process-workflow',
    'process capability id must remain stable for BackOffice',
);
assert(
    capability.navigation.every((item) => item.route.startsWith('/process')),
    'process navigation must stay under the /process route family',
);
assert.strictEqual(
    properties.process.designer.enabled,
    false,
    'visual designer must stay disabled until process validation and persistence APIs exist',
);
assert.strictEqual(
    properties.process.designer.provider,
    'NODICS_NATIVE_GRAPH',
    'initial designer provider must prefer the Nodics-native graph contract',
);

console.log('Process module contract passed');
