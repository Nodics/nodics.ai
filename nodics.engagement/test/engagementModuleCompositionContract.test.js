/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nodics.engagement/test/engagementModuleCompositionContract
 * @description Verifies the Customer Engagement group composition and deterministic package order.
 * @layer test
 * @owner nodics.engagement
 */
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const toolingCommandService = require('../../nodics.foundation/modules/nTooling/src/service/defaultToolingCommandService');

const groupRoot = path.resolve(__dirname, '..');
const groupPackage = JSON.parse(fs.readFileSync(path.join(groupRoot, 'package.json'), 'utf8'));
const expectedModules = [
    ['engagementCore', '90.10'],
    ['customerReview', '90.20'],
    ['customerFeedback', '90.30'],
    ['testimonial', '90.40'],
    ['contactSubmission', '90.50'],
    ['engagementComms', '90.70'],
    ['engagementApi', '90.80']
];

assert.strictEqual(groupPackage.name, 'nodics.engagement');
assert.strictEqual(groupPackage.index, '90.99');
assert.deepStrictEqual(groupPackage.requiredModules, expectedModules.map(item => item[0]));
assert.deepStrictEqual(groupPackage.nodics.extends, ['nodics.foundation']);
assert.strictEqual(groupPackage.nodics.functionalModule.identity, 'nodics.engagement');
assert.strictEqual(groupPackage.nodics.kind, 'group');
assert.strictEqual(groupPackage.nodics.runtime.router, false);
assert(!fs.existsSync(path.join(groupRoot, 'src')), 'Pure Engagement group must not own runtime source');
assert(!fs.existsSync(path.join(groupRoot, 'data')), 'Pure Engagement group must not own data');

const packageIndexes = new Set([groupPackage.index]);
expectedModules.forEach(([moduleName, expectedIndex]) => {
    const moduleRoot = path.join(groupRoot, 'modules', moduleName);
    const modulePackage = JSON.parse(fs.readFileSync(path.join(moduleRoot, 'package.json'), 'utf8'));
    assert.strictEqual(modulePackage.name, moduleName);
    assert.strictEqual(modulePackage.index, expectedIndex);
    assert.strictEqual(modulePackage.nodics.kind, 'capability');
    assert(!packageIndexes.has(modulePackage.index), 'Engagement package indexes must be unique');
    packageIndexes.add(modulePackage.index);
});

const discoveredEngagementModules = toolingCommandService.collectModules(path.resolve(groupRoot, '..'), [])
    .filter(moduleObject => moduleObject.path === groupRoot || moduleObject.path.startsWith(path.join(groupRoot, 'modules')))
    .map(moduleObject => moduleObject.name);
assert.deepStrictEqual(
    discoveredEngagementModules.sort(),
    ['nodics.engagement'].concat(expectedModules.map(item => item[0])).sort(),
    'Standard module discovery must find the Engagement group and all required children'
);

const previous = { NODICS: global.NODICS, _: global._, UTILS: global.UTILS };
try {
    global._ = require('lodash');
    global.UTILS = { isBlank: global._.isEmpty };
    global.NODICS = { getModules: () => ({}) };
    const registered = [];
    const router = {
        ...require('../../nodics.foundation/modules/nRouter/src/service/router/defaultRouterService'),
        isLocalActiveModule: () => true,
        prepareDefaultRouter: options => registered.push(options.schemaName)
    };
    for (const moduleName of ['engagementCore', 'customerReview', 'customerFeedback', 'testimonial', 'contactSubmission']) {
        const schemas = require(path.join(groupRoot, 'modules', moduleName, 'src/schemas/schemas.js'))[moduleName];
        assert(Object.keys(schemas).length > 0);
        router.activateRouters({}, { metaData: {}, rawSchema: schemas }, moduleName, { default: {} });
    }
    assert.deepStrictEqual(registered, [], 'Internal Engagement records must not acquire generic CRUD routes even when their module is router-capable');
    router.activateRouters({}, {
        metaData: {},
        rawSchema: { fixture: { service: { enabled: true }, router: { enabled: true } } }
    }, 'fixture', { default: {} });
    assert.deepStrictEqual(registered, ['fixture'], 'The actual router consumer must detect an enabled schema');
} finally {
    global.NODICS = previous.NODICS;
    global._ = previous._;
    global.UTILS = previous.UTILS;
}

console.log('Customer Engagement module composition contract validated');
