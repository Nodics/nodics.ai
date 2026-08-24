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
const cronjobPackage = require('../modules/cronjob/package.json');
const workflowPackage = require('../modules/workflow/package.json');

const capability = require('../modules/workflow/src/service/defaultWorkflowBackofficeCapabilityService').getCapability();
const rootDir = path.resolve(__dirname, '..');
const frameworkRootDir = path.resolve(rootDir, '..');

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
    ['nodics.foundation'],
    'nodics.process must extend nodics.foundation directly',
);
assert.strictEqual(
    packageJson.nodics.functionalModule.identity,
    'nodics.process',
    'functional module identity must remain nodics.process',
);
assert.strictEqual(
    packageJson.nodics.functionalModule.protected,
    true,
    'nodics.process must remain registered when present because publishing approval cannot bootstrap without Process',
);
assert.deepStrictEqual(
    packageJson.requiredModules,
    ['cronjob', 'workflow'],
    'nodics.process group must compose cronjob and workflow instead of owning direct runtime code',
);
assert(
    !fs.existsSync(processPath('src')),
    'nodics.process must not contain direct runtime src files; place runtime code under modules/workflow',
);
assert.deepStrictEqual(
    cronjobPackage.requiredModules || [],
    [],
    'cronjob must own scheduled-job artifacts directly without nested runtime modules',
);
assert.deepStrictEqual(
    workflowPackage.requiredModules || [],
    [],
    'workflow must own its process artifacts directly without nested flow* modules',
);
assert.strictEqual(
    workflowPackage.prefix,
    'process',
    'workflow must expose APIs under the /process route prefix',
);
assert.strictEqual(
    workflowPackage.nodics.runtime.router,
    true,
    'workflow must own process HTTP routes',
);
assert(
    !fs.existsSync(processPath('modules/workflow/modules')),
    'workflow must not contain nested technical runtime modules',
);
[
    'llm/contracts/process-module-contract.md',
    'llm/contracts/process-ownership-and-designer-contract.md',
    'modules/workflow/src/schemas/schemas.js',
    'modules/workflow/src/utils/statusDefinitions.js',
    'modules/workflow/src/service/designer/defaultProcessGraphValidationService.js',
    'modules/workflow/src/service/definition/defaultProcessDefinitionLifecycleService.js',
    'modules/workflow/src/router/routers.js',
    'modules/workflow/src/controller/defaultProcessDefinitionController.js',
    'modules/workflow/src/facade/defaultProcessDefinitionFacade.js'
].forEach((relativePath) => {
    assert(
        fs.existsSync(processPath(relativePath)),
        `Expected process artifact to exist under correct workflow module: ${relativePath}`,
    );
});
[
    'ProcessDefinition',
    'ProcessDefinitionVersion',
    'ProcessInstance',
    'ProcessTask',
    'ProcessTrigger',
    'ProcessIncident',
    'ProcessAuditEvent'
].forEach((schemaName) => {
    [
        path.join(frameworkRootDir, 'nodics.foundation/modules/nService/src/service/gen/Default' + schemaName + 'Service.js'),
        path.join(frameworkRootDir, 'nodics.foundation/modules/nFacade/src/facade/gen/Default' + schemaName + 'Facade.js'),
        path.join(frameworkRootDir, 'nodics.foundation/modules/nController/src/controller/gen/Default' + schemaName + 'Controller.js')
    ].forEach((generatedPath) => {
        const source = fs.readFileSync(generatedPath, 'utf8');
        assert(
            !source.includes('flowSchema') && !source.includes('flowApi') && !source.includes('flowCore'),
            'Generated Process artifacts must not reference removed flow* modules: ' + generatedPath,
        );
        assert(
            source.includes('@owner workflow') || source.includes("request.moduleName || 'workflow'"),
            'Generated Process artifacts must be owned by the workflow module: ' + generatedPath,
        );
    });
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
assert.deepStrictEqual(
    capability.navigation.map(item => item.label),
    [
        'Operations Workspace',
        'Workflow Management',
        'Pipeline Management',
        'Triggers and Relationships',
        'Automation Monitoring',
        'Advanced Configuration',
        'Process Definitions',
        'My Tasks and Approvals',
        'Manual, Event, and Scheduled Triggers',
        'Process Designer'
    ],
    'Axis Process navigation must stay business-journey oriented for automation workspaces',
);
assert(
    capability.navigation.every((item) => item.group.id === 'process-and-automations' &&
        item.group.label === 'Process and Automations'),
    'process navigation must stay in the Process and Automations group',
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
