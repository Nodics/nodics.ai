/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

const assert = require('assert');
const properties = require('../config/properties');
const routers = require('../src/router/routers');
const manifest = require('../data/manifest.json');
const workflow = require('../data/init-v001/records/process/rulesPolicyApprovalDefinitionData');

const action = properties.process.actionAdapters.definitions['rulesApi.applyDecision'];
assert(action, 'Rules must contribute its Process action definition');
assert.strictEqual(action.remote.requiresCompletedTask, true);
assert.strictEqual(action.remote.apiName, '/workflow/actions/applyDecision');

const route = routers.rulesApi.processActions.applyDecision;
assert.deepStrictEqual(route.authTokenTypes, ['service']);
assert.strictEqual(route.permissionConfig, 'authSecurity.internalToken.routePermission');
assert.strictEqual(route.apiExposure, 'moduleInternal');
assert.strictEqual(properties.apiExposure.categories.moduleInternal.enabled, true);

const definition = workflow.definitions.find(item => item.code === 'rulesPolicyApproval');
assert(definition, 'Rules maker-checker workflow must be contributed');
assert.strictEqual(manifest.sections.rulesPolicyApproval.owningDomain, definition.ownerModule);
const apply = definition.graph.nodes.find(node => node.code === 'applyDecision');
assert.deepStrictEqual(apply.action, { moduleName:'rulesApi', operation:'applyDecision' });

console.log('Rules Process maker-checker contribution contract validated');
