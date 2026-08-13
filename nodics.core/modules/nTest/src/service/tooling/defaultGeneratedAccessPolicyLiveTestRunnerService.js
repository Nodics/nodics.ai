/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const path = require('path');
const { collectGeneratedTests } = require('./defaultGeneratedTestRunnerService');
const { collectTenantGuardFailures } = require('./defaultLiveTestTenantGuardService');

/**
 * @module nTest/service/tooling/defaultGeneratedAccessPolicyLiveTestRunnerService
 * @description Executes generated live access-policy scenarios with explicit enablement, authentication, tenant protection, and dry-run contract safeguards.
 * @layer tooling
 * @owner nTest
 * @override Projects may extend generated access scenarios or explicitly replace this command while preserving tenant guards.
 */

const rootPath = path.resolve(process.env.NODICS_HOME || process.cwd());
const enabled = process.env.NODICS_TEST_ENABLE_ACCESS_POLICY_LIVE === 'true';
const allowAll = process.env.NODICS_TEST_ACCESS_POLICY_ALL === 'true';
const baseUrl = process.env.NODICS_TEST_BASE_URL;
const token = process.env.NODICS_TEST_TOKEN;
const tenant = process.env.NODICS_TEST_TENANT;
const enterprise = process.env.NODICS_TEST_ENTERPRISE;
const policyTenant = process.env.NODICS_TEST_POLICY_TENANT || process.env.NODICS_TEST_CONTROL_TENANT || 'default';
const policyEnterprise = process.env.NODICS_TEST_POLICY_ENTERPRISE || process.env.NODICS_TEST_CONTROL_ENTERPRISE || policyTenant;
const policyToken = process.env.NODICS_TEST_POLICY_TOKEN || process.env.NODICS_TEST_CONTROL_TOKEN || token;
const contextRoot = process.env.NODICS_TEST_CONTEXT_ROOT || process.env.NODICS_TEST_API_PREFIX || '/nodics';
const restrictedUserGroup = process.env.NODICS_TEST_RESTRICTED_USER_GROUP || 'userGroup';
const dryRunContract = process.argv.includes('--dry-run-contract');
const runId = process.env.NODICS_TEST_RUN_ID || String(Date.now());

/** Executes generated access-policy tests when invoked as a tooling command. */


let exportedService;
module.exports = exportedService = {
    /** Implements runCli as an overrideable service operation. */
    runCli: function () {
    (this.validateGuard || exportedService.validateGuard).call(this, );
    (this.run || exportedService.run).call(this, ).then(() => {
        let mode = dryRunContract ? 'contract' : 'live';
        console.log(`\nGenerated access policy ${mode} tests passed`);
    }).catch(error => {
        console.error('\nGenerated access policy tests failed');
        console.error(error && error.stack ? error.stack : error);
        process.exit(1);
    });
},

    /** Implements run as an overrideable service operation. */
    run: async function () {
    const selectedModule = (this.getArgValue || exportedService.getArgValue).call(this, '--module=');
    const selectedSchema = (this.getArgValue || exportedService.getArgValue).call(this, '--schema=');
    let specs = (this.collectSpecs || exportedService.collectSpecs).call(this, );
    let policySpec = specs.find(spec => spec.moduleName === 'dynamo' && spec.schemaName === 'schemaAccessPolicy');
    if (!policySpec) {
        throw new Error('schemaAccessPolicy generated CRUD spec not found. Run npm run build first.');
    }

    specs = specs.filter(spec => {
        return spec.accessPolicyScenarios &&
            spec.accessPolicyScenarios.length > 0 &&
            (!selectedModule || spec.moduleName === selectedModule) &&
            (!selectedSchema || spec.schemaName === selectedSchema);
    });

    if (specs.length === 0) {
        throw new Error('No generated access policy specs found for the selected target. Run npm run build first.');
    }

    for (const spec of specs.sort(exportedService.compareSpecs)) {
        (this.validateSpecContract || exportedService.validateSpecContract).call(this, spec);
        if (!dryRunContract) {
            await (this.runLiveSpec || exportedService.runLiveSpec).call(this, spec, policySpec);
        }
    }
},

    /** Implements collectSpecs as an overrideable service operation. */
    collectSpecs: function () {
    return collectGeneratedTests(rootPath, [], {
        selectedType: 'crud',
        includeDestructive: true
    }).map(testPath => (this.requireGeneratedSpec || exportedService.requireGeneratedSpec).call(this, testPath));
},

    /** Implements requireGeneratedSpec as an overrideable service operation. */
    requireGeneratedSpec: function (testPath) {
    if (process.env.NODICS_TEST_VERBOSE_GENERATED_LOAD === 'true') {
        return require(testPath);
    }
    let originalLog = console.log;
    console.log = function () {};
    try {
        return require(testPath);
    } finally {
        console.log = originalLog;
    }
},

    /** Implements validateSpecContract as an overrideable service operation. */
    validateSpecContract: function (spec) {
    let actions = (spec.accessPolicyScenarios || []).map(scenario => scenario.policyAction).sort();
    ['create', 'delete', 'read', 'update'].forEach(action => {
        if (!actions.includes(action)) {
            throw new Error(`Generated access policy scenario missing ${action} for ${spec.moduleName}.${spec.schemaName}`);
        }
    });
    let deleteScenario = spec.accessPolicyScenarios.find(scenario => scenario.policyAction === 'delete');
    if (!deleteScenario || deleteScenario.policy.propertyName !== '*') {
        throw new Error(`Generated delete access policy must be schema-level for ${spec.moduleName}.${spec.schemaName}`);
    }
},

    /** Implements runLiveSpec as an overrideable service operation. */
    runLiveSpec: async function (spec, policySpec) {
    console.log(`\nRunning live access policy scenarios for ${spec.moduleName}.${spec.schemaName} ` +
        `(targetTenant=${tenant}, policyTenant=${policyTenant})`);
    let state = {};
    await (this.cleanupPolicies || exportedService.cleanupPolicies).call(this, spec, policySpec);
    await (this.runOptionalLifecycleStep || exportedService.runOptionalLifecycleStep).call(this, spec, 'cleanupBefore', state);
    await (this.runRequiredLifecycleStep || exportedService.runRequiredLifecycleStep).call(this, spec, 'create', state);

    try {
        for (const scenario of spec.accessPolicyScenarios) {
            await (this.runAccessPolicyScenario || exportedService.runAccessPolicyScenario).call(this, spec, policySpec, scenario, state);
        }
    } finally {
        await (this.cleanupPolicies || exportedService.cleanupPolicies).call(this, spec, policySpec);
        await (this.runOptionalLifecycleStep || exportedService.runOptionalLifecycleStep).call(this, spec, 'delete', state);
    }
},

    /** Implements runAccessPolicyScenario as an overrideable service operation. */
    runAccessPolicyScenario: async function (spec, policySpec, scenario, state) {
    let policyCode = (this.createPolicyCode || exportedService.createPolicyCode).call(this, spec, scenario);
    await (this.savePolicy || exportedService.savePolicy).call(this, policySpec, spec, scenario, policyCode);
    try {
        let request = (this.replacePlaceholders || exportedService.replacePlaceholders).call(this, scenario.request, state);
        let url = (this.createUrl || exportedService.createUrl).call(this, spec, scenario.route, request.params || {});
        let response = await (this.executeRequest || exportedService.executeRequest).call(this, scenario.route.method, url, request);
        let body = await (this.parseBody || exportedService.parseBody).call(this, response);
        (this.assertScenarioOutcome || exportedService.assertScenarioOutcome).call(this, spec, scenario, state, response, body);
        console.log(`${scenario.name} ${spec.moduleName}.${spec.schemaName}: ${response.status}`);
    } finally {
        await (this.removePolicy || exportedService.removePolicy).call(this, policySpec, policyCode);
    }
},

    /** Implements savePolicy as an overrideable service operation. */
    savePolicy: async function (policySpec, spec, scenario, policyCode) {
    let route = (this.findScenario || exportedService.findScenario).call(this, policySpec.scenarios, 'save').route;
    let policy = {
        code: policyCode,
        active: true,
        moduleName: spec.moduleName,
        schemaName: spec.schemaName,
        propertyName: scenario.policy.propertyName,
        userGroups: [restrictedUserGroup],
        actions: [scenario.policyAction],
        effect: scenario.expected.effect,
        priority: 1,
        appliesToTenants: [tenant],
        maskStrategy: scenario.policyAction === 'read' && scenario.expected.effect === 'MASK' ? 'empty' : undefined,
        status: 'ACTIVE',
        reason: 'Generated live access policy test ' + runId
    };
    let response = await (this.executeRequest || exportedService.executeRequest).call(this, route.method, this.createUrl(policySpec, route, {}), {
        headers: (this.createPolicyHeaders || exportedService.createPolicyHeaders).call(this, ),
        body: policy
    });
    let body = await (this.parseBody || exportedService.parseBody).call(this, response);
    if (!response.ok) {
        throw (this.createHttpError || exportedService.createHttpError).call(this, policySpec, { name: 'saveAccessPolicy', route }, response, body, 'Unable to create schema access policy');
    }
},

    /** Implements removePolicy as an overrideable service operation. */
    removePolicy: async function (policySpec, policyCode) {
    let scenario = (this.findScenario || exportedService.findScenario).call(this, policySpec.scenarios, 'removeByCode') || this.findScenario(policySpec.scenarios, 'remove');
    let request = {
        headers: (this.createPolicyHeaders || exportedService.createPolicyHeaders).call(this, ),
        params: scenario.route.key.includes(':code') ? { code: policyCode } : {},
        body: scenario.route.key.includes(':code') ? {} : {
            options: {
                returnModified: true
            },
            query: {
                code: policyCode
            }
        }
    };
    let response = await (this.executeRequest || exportedService.executeRequest).call(this, scenario.route.method, this.createUrl(policySpec, scenario.route, request.params), request);
    let body = await (this.parseBody || exportedService.parseBody).call(this, response);
    if (!response.ok && !(this.isMissing || exportedService.isMissing).call(this, response, body)) {
        throw (this.createHttpError || exportedService.createHttpError).call(this, policySpec, scenario, response, body, 'Unable to remove schema access policy');
    }
},

    /** Implements cleanupPolicies as an overrideable service operation. */
    cleanupPolicies: async function (spec, policySpec) {
    for (const scenario of spec.accessPolicyScenarios || []) {
        await (this.removePolicy || exportedService.removePolicy).call(this, policySpec, this.createPolicyCode(spec, scenario));
    }
},

    /** Implements runRequiredLifecycleStep as an overrideable service operation. */
    runRequiredLifecycleStep: async function (spec, stepName, state) {
    let step = (this.findLifecycleStep || exportedService.findLifecycleStep).call(this, spec, stepName);
    if (!step) {
        throw new Error(`Missing lifecycle step ${stepName} for ${spec.moduleName}.${spec.schemaName}`);
    }
    let response = await (this.executeLifecycleStep || exportedService.executeLifecycleStep).call(this, spec, step, state);
    if (!response.response.ok) {
        throw (this.createHttpError || exportedService.createHttpError).call(this, spec, step, response.response, response.body, `Lifecycle step ${stepName} failed`);
    }
    let modelId = (this.findFirstValue || exportedService.findFirstValue).call(this, response.body, '_id') || this.findFirstValue(response.body, 'id');
    if (modelId) {
        state.createdModelId = modelId;
    }
    state.createdModel = (this.replacePlaceholders || exportedService.replacePlaceholders).call(this, step.request.body || {}, state);
},

    /** Implements runOptionalLifecycleStep as an overrideable service operation. */
    runOptionalLifecycleStep: async function (spec, stepName, state) {
    let step = (this.findLifecycleStep || exportedService.findLifecycleStep).call(this, spec, stepName);
    if (!step) {
        return;
    }
    let response = await (this.executeLifecycleStep || exportedService.executeLifecycleStep).call(this, spec, step, state);
    if (!response.response.ok && !(this.isMissing || exportedService.isMissing).call(this, response.response, response.body)) {
        throw (this.createHttpError || exportedService.createHttpError).call(this, spec, step, response.response, response.body, `Optional lifecycle step ${stepName} failed`);
    }
},

    /** Implements executeLifecycleStep as an overrideable service operation. */
    executeLifecycleStep: async function (spec, step, state) {
    let request = (this.replacePlaceholders || exportedService.replacePlaceholders).call(this, step.request, state);
    let url = (this.createUrl || exportedService.createUrl).call(this, spec, step.route, request.params || {});
    let response = await (this.executeRequest || exportedService.executeRequest).call(this, step.route.method, url, request);
    let body = await (this.parseBody || exportedService.parseBody).call(this, response);
    return {
        response: response,
        body: body
    };
},

    /** Implements assertScenarioOutcome as an overrideable service operation. */
    assertScenarioOutcome: function (spec, scenario, state, response, body) {
    if (scenario.expected.blocked) {
        if (!(this.isErrorResponse || exportedService.isErrorResponse).call(this, response, body)) {
            throw (this.createHttpError || exportedService.createHttpError).call(this, spec, scenario, response, body, 'Expected access policy to block request');
        }
        let code = body && body.code;
        if (code && code !== 'ERR_AUTH_00003') {
            throw (this.createHttpError || exportedService.createHttpError).call(this, spec, scenario, response, body, 'Expected access policy authorization error');
        }
        return;
    }

    if (!response.ok) {
        throw (this.createHttpError || exportedService.createHttpError).call(this, spec, scenario, response, body, 'Expected access policy request to succeed');
    }
    if (scenario.expected.responseFiltering) {
        (this.assertResponseFiltered || exportedService.assertResponseFiltered).call(this, spec, scenario, state, response, body);
    }
},

    /** Implements assertResponseFiltered as an overrideable service operation. */
    assertResponseFiltered: function (spec, scenario, state, response, body) {
    let propertyName = scenario.policy.propertyName;
    let original = state.createdModel ? state.createdModel[propertyName] : undefined;
    let filtered = (this.findFirstValue || exportedService.findFirstValue).call(this, body, propertyName);
    if (original === undefined) {
        return;
    }
    if (filtered === original) {
        throw (this.createHttpError || exportedService.createHttpError).call(this, spec, scenario, response, body, `Expected ${propertyName} to be filtered`);
    }
},

    /** Implements executeRequest as an overrideable service operation. */
    executeRequest: async function (method, url, request) {
    let headers = Object.assign({}, request.headers || {}, {
        Accept: 'application/json'
    });
    let options = {
        method: method.toUpperCase(),
        headers: headers
    };
    if (method !== 'get' && request.body !== undefined) {
        headers['Content-Type'] = 'application/json';
        options.body = JSON.stringify(request.body);
    }
    return fetch(url, options);
},

    /** Implements createUrl as an overrideable service operation. */
    createUrl: function (spec, route, params) {
    let routeKey = route.key;
    let apiVersion = route.apiVersion || 'v0';
    let urlPrefix = spec.urlPrefix || spec.moduleName;
    let resolvedRoute = String(routeKey).split('/').map(part => {
        if (part.startsWith(':')) {
            let paramName = part.substring(1);
            return encodeURIComponent(params[paramName]);
        }
        return part;
    }).join('/');
    return (this.trimRight || exportedService.trimRight).call(this, baseUrl, '/') + this.trimRight(contextRoot, '/') + '/' + urlPrefix + '/' + apiVersion + resolvedRoute;
},

    /** Implements parseBody as an overrideable service operation. */
    parseBody: async function (response) {
    let text = await response.text();
    if (!text) {
        return null;
    }
    try {
        return JSON.parse(text);
    } catch (error) {
        return text;
    }
},

    /** Implements createHeaders as an overrideable service operation. */
    createHeaders: function () {
    return {
        Authorization: 'Bearer ' + token,
        tenant: tenant,
        'x-enterprise-code': enterprise
    };
},

    /** Implements createPolicyHeaders as an overrideable service operation. */
    createPolicyHeaders: function () {
    return {
        Authorization: 'Bearer ' + policyToken,
        tenant: policyTenant,
        'x-enterprise-code': policyEnterprise
    };
},

    /** Implements replacePlaceholders as an overrideable service operation. */
    replacePlaceholders: function (value, state) {
    if (Array.isArray(value)) {
        return value.map(item => (this.replacePlaceholders || exportedService.replacePlaceholders).call(this, item, state));
    }
    if (value && typeof value === 'object') {
        let copy = {};
        Object.keys(value).forEach(key => {
            copy[key] = (this.replacePlaceholders || exportedService.replacePlaceholders).call(this, value[key], state);
        });
        return copy;
    }
    if (typeof value !== 'string') {
        return value;
    }
    return value
        .replaceAll('<token>', token)
        .replaceAll('<testTenant>', tenant)
        .replaceAll('<enterpriseCode>', enterprise)
        .replaceAll('<policyTenant>', policyTenant)
        .replaceAll('<policyEnterpriseCode>', policyEnterprise)
        .replaceAll('<restrictedUserGroup>', restrictedUserGroup)
        .replaceAll('<runId>', runId)
        .replaceAll('<createdModelId>', state.createdModelId || '<createdModelId>')
        .replaceAll('<timestamp>', new Date().toISOString());
},

    /** Implements findScenario as an overrideable service operation. */
    findScenario: function (scenarios, operation) {
    return (scenarios || []).find(scenario => scenario.operation === operation || scenario.name === operation);
},

    /** Implements findLifecycleStep as an overrideable service operation. */
    findLifecycleStep: function (spec, name) {
    return (spec.lifecycle || []).find(step => step.name === name);
},

    /** Implements createPolicyCode as an overrideable service operation. */
    createPolicyCode: function (spec, scenario) {
    return [
        'ntest',
        'accesspolicy',
        spec.moduleName,
        spec.schemaName,
        scenario.policyAction,
        runId
    ].join('_').replace(/[^a-zA-Z0-9_-]/g, '_');
},

    /** Implements isMissing as an overrideable service operation. */
    isMissing: function (response, body) {
    if (response.status === 404) {
        return true;
    }
    if (!response.ok) {
        return false;
    }
    if (body === null || body === undefined) {
        return true;
    }
    if (Array.isArray(body)) {
        return body.length === 0;
    }
    if (Array.isArray(body.result)) {
        return body.result.length === 0;
    }
    if (body.result && Array.isArray(body.result.models)) {
        return body.result.models.length === 0;
    }
    if (body.count === 0) {
        return true;
    }
    return false;
},

    /** Implements isErrorResponse as an overrideable service operation. */
    isErrorResponse: function (response, body) {
    return !response.ok ||
        (body && body.success === false) ||
        (body && typeof body.code === 'string' && body.code.startsWith('ERR_')) ||
        (body && Array.isArray(body.errors) && body.errors.length > 0);
},

    /** Implements findFirstValue as an overrideable service operation. */
    findFirstValue: function (value, keyName) {
    if (!value || typeof value !== 'object') {
        return null;
    }
    if (Object.prototype.hasOwnProperty.call(value, keyName)) {
        return value[keyName];
    }
    if (Array.isArray(value)) {
        for (const item of value) {
            let found = (this.findFirstValue || exportedService.findFirstValue).call(this, item, keyName);
            if (found !== null && found !== undefined) {
                return found;
            }
        }
        return null;
    }
    for (const key of Object.keys(value)) {
        let found = (this.findFirstValue || exportedService.findFirstValue).call(this, value[key], keyName);
        if (found !== null && found !== undefined) {
            return found;
        }
    }
    return null;
},

    /** Implements validateGuard as an overrideable service operation. */
    validateGuard: function () {
    if (dryRunContract) {
        return;
    }
    let missing = [];
    if (!enabled) {
        missing.push('NODICS_TEST_ENABLE_ACCESS_POLICY_LIVE=true');
    }
    if (!selectedModule || !selectedSchema) {
        if (!allowAll) {
            missing.push('--module=<moduleName> and --schema=<schemaName> or NODICS_TEST_ACCESS_POLICY_ALL=true');
        }
    }
    if (!baseUrl) {
        missing.push('NODICS_TEST_BASE_URL');
    }
    if (!token) {
        missing.push('NODICS_TEST_TOKEN');
    }
    collectTenantGuardFailures({
        tenant: tenant,
        env: process.env
    }).forEach(failure => missing.push(failure));
    if (!enterprise) {
        missing.push('NODICS_TEST_ENTERPRISE');
    }
    if (!policyToken) {
        missing.push('NODICS_TEST_POLICY_TOKEN or NODICS_TEST_TOKEN');
    }
    if (policyTenant !== tenant && policyToken === token) {
        missing.push('NODICS_TEST_POLICY_TOKEN is required when policy tenant differs from test tenant');
    }
    if (!policyTenant) {
        missing.push('NODICS_TEST_POLICY_TENANT or NODICS_TEST_CONTROL_TENANT');
    }
    if (!policyEnterprise) {
        missing.push('NODICS_TEST_POLICY_ENTERPRISE or NODICS_TEST_CONTROL_ENTERPRISE');
    }
    if (missing.length > 0) {
        console.error('Live generated access policy tests mutate test-tenant data and require explicit settings.');
        console.error('Missing: ' + missing.join(', '));
        process.exit(1);
    }
},

    /** Implements createHttpError as an overrideable service operation. */
    createHttpError: function (spec, step, response, body, message) {
    return new Error(JSON.stringify({
        message: message,
        moduleName: spec.moduleName,
        schemaName: spec.schemaName,
        step: step.name,
        route: step.route,
        status: response.status,
        body: body
    }, null, 4));
},

    /** Implements compareSpecs as an overrideable service operation. */
    compareSpecs: function (left, right) {
    return `${left.moduleName}.${left.schemaName}`.localeCompare(`${right.moduleName}.${right.schemaName}`);
},

    /** Implements getArgValue as an overrideable service operation. */
    getArgValue: function (prefix) {
    let arg = process.argv.find(item => item.startsWith(prefix));
    return arg ? arg.substring(prefix.length) : null;
},

    /** Implements trimRight as an overrideable service operation. */
    trimRight: function (value, char) {
    let output = String(value || '');
    while (output.endsWith(char)) {
        output = output.substring(0, output.length - 1);
    }
    return output;
}
};

if (require.main === module) {
    exportedService.runCli();
}
