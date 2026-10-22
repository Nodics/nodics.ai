/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/**
 * @module nodics.foundation/modules/nbpm/test/coreBootstrapWorkflowBridgeContract
 * @description Protects the Core bootstrap dependency on nbpm workflow-to-schema association behavior before any future Process migration.
 * @layer test
 * @owner nbpm
 * @override Process migration may replace this bridge only after preserving Core bootstrap, generated schema contracts, and compatibility evidence.
 */
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const os = require('os');
const vm = require('vm');
const test = require('node:test');

const nbpmRoot = path.resolve(__dirname, '..');
const coreRoot = path.resolve(nbpmRoot, '../..');
const repositoryRoot = path.resolve(coreRoot, '..');
const coreBootstrap = fs.readFileSync(path.join(coreRoot, 'nodics.js'), 'utf8');
const schemas = require('../src/schemas/schemas');
const processPackagePath = path.join(repositoryRoot, 'nodics.process/package.json');
const processPackage = require(processPackagePath);
const workflowPackage = require(path.join(repositoryRoot, 'nodics.process/modules/workflow/package.json'));

assert(
    coreBootstrap.includes("typeof SERVICE.DefaultWorkflow2SchemaService.buildWorkflow2SchemaAssociations !== 'function'"),
    'Core bootstrap must skip workflow-to-schema association when workflow is not active in the current runtime',
);
assert(
    coreBootstrap.includes('DefaultWorkflow2SchemaService.buildWorkflow2SchemaAssociations().then'),
    'Core bootstrap must still execute workflow-to-schema association when the service is active in this runtime',
);
assert(
    schemas.system && schemas.system.workflow2Schema,
    'nbpm must continue to expose system.workflow2Schema while Core bootstrap depends on workflow-to-schema association',
);
assert.strictEqual(
    schemas.system.workflow2Schema.service.enabled,
    true,
    'workflow2Schema must keep generated service enabled for Core bootstrap compatibility',
);
assert.deepStrictEqual(
    processPackage.requiredModules,
    ['cronjob', 'workflow'],
    'nodics.process must compose cronjob and workflow instead of absorbing nbpm directly',
);
assert.deepStrictEqual(
    workflowPackage.requiredModules || [],
    [],
    'workflow must own schemas, services, and APIs directly after Process hierarchy simplification',
);

console.log('NBPM Core bootstrap workflow bridge contract validated');

test('workflow association artifacts generate from owner schemas into an isolated selected-server directory', async (t) => {
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'nbpm-schema-artifacts-'));
    const previous = { UTILS: global.UTILS, CONFIG: global.CONFIG, NODICS: global.NODICS, _: global._ };
    const stringKeys = ['toUpperCaseFirstChar', 'toLowerCaseFirstChar', 'toUpperCaseEachWord', 'toLowerCaseEachWord', 'replaceAll'];
    const descriptors = Object.fromEntries(stringKeys.map(key => [key, Object.getOwnPropertyDescriptor(String.prototype, key)]));
    t.after(() => {
        fs.rmSync(directory, { recursive: true, force: true });
        Object.assign(global, previous);
        for (const key of stringKeys) {
            if (descriptors[key]) Object.defineProperty(String.prototype, key, descriptors[key]);
            else delete String.prototype[key];
        }
    });
    require('../../nConfig/config/prescripts').addStringCamelCaseFunction();
    global._ = require('lodash');
    global.UTILS = { ...require('../../nConfig/src/utils/utils'), LOG: { debug() {}, error() {} } };
    global.CONFIG = { get: () => ({ options: { contextRoot: '/fixture' } }) };
    global.NODICS = { getNodicsHome: () => directory };
    for (const [owner, layer, postFix] of [
        ['nService', 'service', 'Service'], ['nFacade', 'facade', 'Facade'], ['nController', 'controller', 'Controller']
    ]) {
        const target = path.join(directory, layer);
        fs.mkdirSync(target);
        await UTILS.createObject({
            currentDir: target, postFix, moduleName: 'system', schemaName: 'workflow2Schema',
            schemaObject: schemas.system.workflow2Schema,
            commonDefinition: require(path.join(coreRoot, 'modules', owner, 'src', layer, 'common.js'))
        });
        const file = path.join(target, 'DefaultWorkflow2Schema' + postFix + '.js');
        assert(fs.existsSync(file), 'Owner schema must generate the required ' + layer);
        const source = fs.readFileSync(file, 'utf8');
        assert.doesNotThrow(() => new vm.Script(source));
        assert(source.includes('workflow2Schema'));
    }
});
