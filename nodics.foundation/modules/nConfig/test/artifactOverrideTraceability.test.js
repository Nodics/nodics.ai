/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module config/test/artifactOverrideTraceability
 * @description Verifies that layered service, facade, controller, pipeline, and related artifact contributions retain ordered source-module override trace metadata.
 * @layer test
 * @owner nConfig
 * @override Project modules may add capability-specific traceability scenarios; the framework contract for ordered contribution history must remain unchanged.
 */
const assert = require('assert');

global.NODICS = {
    getNodicsHome: function () {
        return '/nodics';
    }
};

const loader = require('../src/service/defaultFilesLoaderService');

let serviceArtifact = {
    init: function () {}
};

loader.recordArtifactContribution(serviceArtifact, {
    name: 'DefaultCatalogService',
    layer: 'service',
    sourceModule: 'catalog',
    action: 'create',
    contribution: { init() {}, calculate() {} },
    generatedBaseline: true,
    filePath: '/nodics/nodics.foundation/modules/nCatalog/src/service/DefaultCatalogService.js'
});

loader.recordArtifactContribution(serviceArtifact, {
    name: 'DefaultCatalogService',
    layer: 'service',
    sourceModule: 'customerCatalog',
    action: 'override',
    contribution: { calculate() {}, extra: true },
    filePath: '/nodics/customer/customerCatalog/src/service/DefaultCatalogService.js'
});

assert.strictEqual(serviceArtifact.xNodics.overrideTrace.length, 2);
assert.strictEqual(serviceArtifact.xNodics.overrideTrace[0].sourceModule, 'catalog');
assert.strictEqual(serviceArtifact.xNodics.overrideTrace[1].sourceModule, 'customerCatalog');
assert.strictEqual(serviceArtifact.xNodics.overrideTrace[1].action, 'override');
assert.strictEqual(serviceArtifact.xNodics.overrideTrace[1].file, './customer/customerCatalog/src/service/DefaultCatalogService.js');

assert.deepStrictEqual(serviceArtifact.xNodics.overrideTrace[0].members, ['init', 'calculate']);
assert.equal(serviceArtifact.xNodics.overrideTrace[0].generatedBaseline, true);
assert.equal(serviceArtifact.xNodics.memberOrigins.init.sourceModule, 'catalog');
assert.equal(serviceArtifact.xNodics.memberOrigins.calculate.sourceModule, 'customerCatalog');
assert.equal(serviceArtifact.xNodics.memberOrigins.calculate.firstSourceModule, 'catalog');
assert.equal(serviceArtifact.xNodics.memberOrigins.calculate.contributionIndex, 1);
assert.equal(serviceArtifact.xNodics.memberOrigins.calculate.kind, 'method');
assert.equal(serviceArtifact.xNodics.memberOrigins.extra.kind, 'property');
global.SERVICE = { DefaultCatalogService: serviceArtifact };
global.FACADE = {}; global.CONTROLLER = {}; global.PIPELINE = {};
const report = require('../../nDynamo/src/service/tooling/defaultGovernanceReportGeneratorService').collectArtifactSummary();
assert.equal(report.length, 1);
assert.equal(report[0].contributions[0].generatedBaseline, true);
assert.equal(report[0].memberOrigins.init.sourceModule, 'catalog');
assert.equal(report[0].memberOrigins.calculate.sourceModule, 'customerCatalog');
assert.equal(report[0].finalSourceModule, 'customerCatalog');
assert(!JSON.stringify(report).includes('function ()'), 'Reports must not serialize implementation bodies');
console.log('Artifact override traceability validated');
