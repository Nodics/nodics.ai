/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module nTooling/test/applicationBuilderAcceleratorPackContract @description Verifies accelerator pack provenance, planning and duplicate-owner rejection without runtime startup. @layer test @owner nTooling */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const catalogueService = require('../src/service/applicationBuilder/defaultApplicationBuilderCatalogueService');
const guidedService = require('../src/service/applicationBuilder/defaultApplicationBuilderGuidedService');
const workspace = require('./helpers/applicationBuilderWorkspace')();
const input = { framework: path.resolve(__dirname, '../../../..'), frontend: workspace.frontend, customer: workspace.customer };
const catalogue = catalogueService.discover(input);
const pack = catalogue.frameworkDataPacks.find(item => item.code === 'nexus.web');
assert(pack);
assert.equal(pack.moduleRoot, 'nodics.accelerators/modules/nexus/modules/nexus.web');
assert.deepEqual(pack.extends, ['nexus']);
assert.equal(catalogue.customerDataPacks.some(item => item.code === 'nexus.web'), false);
const answers = guidedService.createAnswersTemplate({ projectCode: 'independentSite', customerCode: 'independent', preset: 'combined' }, catalogue);
answers.frontends.push('NEXUS');
const result = guidedService.guide(answers, catalogue);
assert(result.solution.data.packs.includes('nexus.web'));
assert(result.plan);
const duplicate = path.join(workspace.customer, 'modules/nexus.web');
fs.mkdirSync(duplicate, { recursive: true });
fs.writeFileSync(path.join(duplicate, 'package.json'), JSON.stringify({name:'nexus.web',nodics:{applicationBuilder:{dataPack:true}}}));
assert.throws(() => catalogueService.discover(input), /multiple source owners/);
console.log('Accelerator data-pack provenance and planning validated');
