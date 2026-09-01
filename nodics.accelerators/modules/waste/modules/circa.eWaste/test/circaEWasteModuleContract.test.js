/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module circa.eWaste/test/circaEWasteModuleContract @description Verifies Circa eWaste is a Nodics-compliant backend application composition module. @layer test @owner circa.eWaste */
const assert = require('assert');
const fs = require('fs');
const path = require('path');

const moduleRoot = path.resolve(__dirname, '..');
const packageJson = JSON.parse(fs.readFileSync(path.join(moduleRoot, 'package.json'), 'utf8'));
const properties = require('../config/properties');

assert.strictEqual(packageJson.name, 'circa.eWaste');
assert.strictEqual(packageJson.index, '92.73');
assert.strictEqual(packageJson.main, 'nodics.js');
assert.strictEqual(packageJson.nodics.kind, 'capability');
assert.strictEqual(packageJson.nodics.runtimeModule, true);
assert.strictEqual(packageJson.nodics.loadableByNodicsModuleLoader, true);
assert.strictEqual(packageJson.nodics.runtime.router, false);
assert.strictEqual(packageJson.nodics.runtime.publish, false);
assert.strictEqual(packageJson.nodics.runtime.web, false);
assert.deepStrictEqual(packageJson.requiredModules, ['eWaste', 'wasteRecycling']);
assert.deepStrictEqual(packageJson.nodics.extends, ['eWaste', 'wasteRecycling']);
assert(packageJson.nodics.owns.includes('composition'));
assert(packageJson.nodics.owns.includes('configuration'));
assert(packageJson.nodics.owns.includes('source'));
assert(!packageJson.nodics.owns.includes('data'), 'Circa eWaste backend must not own imported data');
assert(!fs.existsSync(path.join(moduleRoot, 'src/schemas')), 'Circa eWaste must not define parallel persistence schemas');
assert(!fs.existsSync(path.join(moduleRoot, 'src/router')), 'Circa eWaste must not expose framework-owned routers');
assert(fs.existsSync(path.join(moduleRoot, 'src/service/defaultCircaEWasteApplicationContractService.js')));
assert(fs.existsSync(path.join(moduleRoot, 'llm/contracts/README.md')));

assert.strictEqual(properties.circaEWaste.application.code, 'CIRCA_EWASTE');
assert.strictEqual(properties.circaEWaste.application.frontendModuleName, 'nodics.circa.eWaste');
assert.strictEqual(properties.circaEWaste.application.projectModuleName, 'circa.eWaste');
assert.deepStrictEqual(properties.circaEWaste.application.requiredScenarioModules, ['eWaste', 'wasteRecycling']);
assert.strictEqual(properties.circaEWaste.journeys.submission.enabled, true);
assert.strictEqual(properties.circaEWaste.journeys.recyclingHandoff.enabled, true);

console.log('Circa eWaste module contract validated');
