/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module waste/test/wasteAcceleratorCompositionContract @description Verifies Waste accelerator remains an umbrella over scenario presets. @layer test @owner waste */
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const toolingCommandService = require('../../../../nodics.foundation/modules/nTooling/src/service/defaultToolingCommandService');

const acceleratorRoot = path.resolve(__dirname, '..');
const acceleratorPackage = JSON.parse(fs.readFileSync(path.join(acceleratorRoot, 'package.json'), 'utf8'));
const scenarioRoot = path.join(acceleratorRoot, 'modules', 'eWaste');
const scenarioPackage = JSON.parse(fs.readFileSync(path.join(scenarioRoot, 'package.json'), 'utf8'));
const recyclingRoot = path.join(acceleratorRoot, 'modules', 'wasteRecycling');
const recyclingPackage = JSON.parse(fs.readFileSync(path.join(recyclingRoot, 'package.json'), 'utf8'));
const circaRoot = path.join(acceleratorRoot, 'modules', 'circa.eWaste');
const circaPackage = JSON.parse(fs.readFileSync(path.join(circaRoot, 'package.json'), 'utf8'));

assert.strictEqual(acceleratorPackage.name, 'waste');
assert.strictEqual(acceleratorPackage.index, '92.79');
assert.strictEqual(acceleratorPackage.nodics.kind, 'group');
assert.deepStrictEqual(acceleratorPackage.requiredModules, ['eWaste', 'wasteRecycling', 'circa.eWaste']);
assert.deepStrictEqual(acceleratorPackage.nodics.extends, ['nodics.waste']);
assert.strictEqual(acceleratorPackage.nodics.runtime.router, false);
assert.strictEqual(acceleratorPackage.nodics.runtime.publish, false);
assert(!fs.existsSync(path.join(acceleratorRoot, 'src')), 'Waste accelerator umbrella must not own common runtime source');
assert(!fs.existsSync(path.join(acceleratorRoot, 'data')), 'Waste accelerator umbrella must not own scenario data directly');

assert.strictEqual(scenarioPackage.name, 'eWaste');
assert.strictEqual(scenarioPackage.index, '92.71');
assert.strictEqual(scenarioPackage.nodics.kind, 'capability');
assert.deepStrictEqual(scenarioPackage.nodics.extends, ['nodics.waste']);
assert.strictEqual(scenarioPackage.nodics.runtime.router, false);
assert(!fs.existsSync(path.join(scenarioRoot, 'src')), 'Scenario accelerator must contribute presets, not alternate services');

assert.strictEqual(recyclingPackage.name, 'wasteRecycling');
assert.strictEqual(recyclingPackage.index, '92.72');
assert.strictEqual(recyclingPackage.nodics.kind, 'capability');
assert.deepStrictEqual(recyclingPackage.nodics.extends, ['nodics.waste']);
assert.strictEqual(recyclingPackage.nodics.runtime.router, false);
assert(fs.existsSync(path.join(recyclingRoot, 'src/service/defaultWasteRecyclingHandoffContractService.js')), 'Waste Recycling must own the reusable provider-neutral handoff contract');

assert.strictEqual(circaPackage.name, 'circa.eWaste');
assert.strictEqual(circaPackage.index, '92.73');
assert.strictEqual(circaPackage.nodics.kind, 'capability');
assert.deepStrictEqual(circaPackage.requiredModules, ['eWaste', 'wasteRecycling']);
assert.deepStrictEqual(circaPackage.nodics.extends, ['eWaste', 'wasteRecycling']);
assert.strictEqual(circaPackage.nodics.runtime.router, false);
assert(circaPackage.nodics.owns.includes('composition'));
assert(!fs.existsSync(path.join(circaRoot, 'src/schemas')), 'Circa eWaste must not define app-owned Waste schemas');
assert(!fs.existsSync(path.join(circaRoot, 'src/router')), 'Circa eWaste must not expose app-owned routers');
assert(fs.existsSync(path.join(circaRoot, 'src/service/defaultCircaEWasteApplicationContractService.js')), 'Circa eWaste must own reusable application composition service');

const discovered = toolingCommandService.collectModules(path.resolve(acceleratorRoot, '../../..'), [])
    .filter(function (moduleObject) {
        return moduleObject.path === acceleratorRoot || moduleObject.path.startsWith(path.join(acceleratorRoot, 'modules'));
    })
    .map(function (moduleObject) { return moduleObject.name; })
    .sort();

assert.deepStrictEqual(discovered, ['circa.eWaste', 'eWaste', 'waste', 'wasteRecycling']);

console.log('Waste accelerator composition contract validated');
