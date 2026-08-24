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

const nbpmRoot = path.resolve(__dirname, '..');
const coreRoot = path.resolve(nbpmRoot, '../..');
const repositoryRoot = path.resolve(coreRoot, '..');
const coreBootstrap = fs.readFileSync(path.join(coreRoot, 'nodics.js'), 'utf8');
const schemas = require('../src/schemas/schemas');
const generatedServicePath = path.join(coreRoot, 'modules/nService/src/service/gen/DefaultWorkflow2SchemaService.js');
const generatedFacadePath = path.join(coreRoot, 'modules/nFacade/src/facade/gen/DefaultWorkflow2SchemaFacade.js');
const generatedControllerPath = path.join(coreRoot, 'modules/nController/src/controller/gen/DefaultWorkflow2SchemaController.js');
const processPackagePath = path.join(repositoryRoot, 'nodics.process/package.json');
const processPackage = require(processPackagePath);
const workflowPackage = require(path.join(repositoryRoot, 'nodics.process/modules/workflow/package.json'));

assert(
    coreBootstrap.includes('DefaultWorkflow2SchemaService.buildWorkflow2SchemaAssociations()'),
    'Core bootstrap must keep the nbpm workflow-to-schema association call until a compatibility adapter replaces it',
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
assert(fs.existsSync(generatedServicePath), 'Generated DefaultWorkflow2SchemaService must remain available');
assert(fs.existsSync(generatedFacadePath), 'Generated DefaultWorkflow2SchemaFacade must remain available');
assert(fs.existsSync(generatedControllerPath), 'Generated DefaultWorkflow2SchemaController must remain available');
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
