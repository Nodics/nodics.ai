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

const packageJson = require('../package.json');
const properties = require('../config/properties');

const capability = properties.backofficeCapabilities.process;

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
assert.strictEqual(
    capability.capabilityId,
    'business-process-workflow',
    'process capability id must remain stable for BackOffice',
);
assert(
    capability.navigation.every((item) => item.route.startsWith('/process')),
    'process navigation must stay under the /process route family',
);
assert(
    capability.navigation.every((item) => item.featureState === 'PREVIEW'),
    'initial process navigation must remain preview until process APIs are implemented',
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
