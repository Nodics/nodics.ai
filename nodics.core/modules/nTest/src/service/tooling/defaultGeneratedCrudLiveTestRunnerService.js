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
 * @module nTest/service/tooling/defaultGeneratedCrudLiveTestRunnerService
 * @description Executes generated destructive CRUD scenarios only when explicitly enabled and protected by tenant, authentication, and cleanup contracts.
 * @layer tooling
 * @owner nTest
 * @override Projects may extend generated CRUD scenarios or explicitly replace this command while preserving destructive-test safeguards.
 */

const rootPath = path.resolve(process.env.NODICS_HOME || process.cwd());
const enabled = process.env.NODICS_TEST_ENABLE_DESTRUCTIVE_CRUD === 'true';
const baseUrl = process.env.NODICS_TEST_BASE_URL;
const token = process.env.NODICS_TEST_TOKEN;
const tenant = process.env.NODICS_TEST_TENANT;
const enterprise = process.env.NODICS_TEST_ENTERPRISE;
const contextRoot = process.env.NODICS_TEST_CONTEXT_ROOT || process.env.NODICS_TEST_API_PREFIX || '/nodics';
const selectedModule = (this.getArgValue || exportedService.getArgValue).call(this, '--module=');
const selectedSchema = (this.getArgValue || exportedService.getArgValue).call(this, '--schema=');
const runId = process.env.NODICS_TEST_RUN_ID || String(Date.now());

/** Executes generated live CRUD tests when invoked as a tooling command. */


let exportedService;
module.exports = exportedService = {
    /** Implements runCli as an overrideable service operation. */
    runCli: function () {
    (this.validateGuard || exportedService.validateGuard).call(this, );
    (this.run || exportedService.run).call(this, ).then(() => {
        console.log('\nGenerated live CRUD tests passed');
    }).catch(error => {
        console.error('\nGenerated live CRUD tests failed');
        console.error(error && error.stack ? error.stack : error);
        process.exit(1);
    });
},

    /** Implements run as an overrideable service operation. */
    run: async function () {
    let testPaths = collectGeneratedTests(rootPath, [], {
        selectedType: 'crud',
        includeDestructive: true
    });

    testPaths = testPaths.filter(testPath => {
        let spec = require(testPath);
        return (!selectedModule || spec.moduleName === selectedModule) &&
            (!selectedSchema || spec.schemaName === selectedSchema);
    });

    if (testPaths.length === 0) {
        throw new Error('No generated CRUD tests found. Run npm run build first.');
    }

    for (const testPath of testPaths.sort()) {
        let spec = require(testPath);
        await (this.runSpec || exportedService.runSpec).call(this, spec, testPath);
    }
},

    /** Implements runSpec as an overrideable service operation. */
    runSpec: async function (spec, testPath) {
    console.log(`\nRunning live CRUD lifecycle for ${spec.moduleName}.${spec.schemaName}`);
    let state = {};
    for (const step of spec.lifecycle || []) {
        await (this.runStep || exportedService.runStep).call(this, spec, step, state, testPath);
    }
},

    /** Implements runStep as an overrideable service operation. */
    runStep: async function (spec, step, state, testPath) {
    let request = (this.replacePlaceholders || exportedService.replacePlaceholders).call(this, step.request, state);
    if (step.optional && (this.hasUnresolvedValue || exportedService.hasUnresolvedValue).call(this, request)) {
        console.log(`Skipping optional ${step.name} for ${spec.moduleName}.${spec.schemaName}: unresolved runtime value`);
        return;
    }

    let url = (this.createUrl || exportedService.createUrl).call(this, spec, step.route, request.params || {});
    let response = await (this.executeRequest || exportedService.executeRequest).call(this, step.route.method, url, request);
    let body = await (this.parseBody || exportedService.parseBody).call(this, response);

    if (step.optional && (this.isMissing || exportedService.isMissing).call(this, response, body)) {
        console.log(`Optional ${step.name} found no prior record for ${spec.moduleName}.${spec.schemaName}`);
        return;
    }

    if (step.optional && step.expectMissing && response.ok) {
        console.log(`Optional ${step.name} removed prior record for ${spec.moduleName}.${spec.schemaName}`);
        return;
    }

    if (step.expectMissing) {
        if (!(this.isMissing || exportedService.isMissing).call(this, response, body)) {
            throw (this.createStepError || exportedService.createStepError).call(this, spec, step, testPath, response, body, 'Expected record to be missing');
        }
        console.log(`Verified deleted ${spec.moduleName}.${spec.schemaName}`);
        return;
    }

    if (!response.ok) {
        throw (this.createStepError || exportedService.createStepError).call(this, spec, step, testPath, response, body, 'Unexpected HTTP failure');
    }

    let modelId = (this.findFirstValue || exportedService.findFirstValue).call(this, body, '_id') || this.findFirstValue(body, 'id');
    if (modelId) {
        state.createdModelId = modelId;
    }
    console.log(`${step.name} ${spec.moduleName}.${spec.schemaName}: ${response.status}`);
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
    if (Array.isArray(body.success)) {
        return body.success.length === 0;
    }
    if (Array.isArray(body.data)) {
        return body.data.length === 0;
    }
    if (Array.isArray(body.result)) {
        return body.result.length === 0;
    }
    if (body.success && Array.isArray(body.success.data)) {
        return body.success.data.length === 0;
    }
    if (body.count === 0) {
        return true;
    }
    return false;
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
        .replaceAll('<runId>', runId)
        .replaceAll('<createdModelId>', state.createdModelId || '<createdModelId>')
        .replaceAll('<timestamp>', new Date().toISOString());
},

    /** Implements hasUnresolvedValue as an overrideable service operation. */
    hasUnresolvedValue: function (value) {
    if (Array.isArray(value)) {
        return value.some(exportedService.hasUnresolvedValue);
    }
    if (value && typeof value === 'object') {
        return Object.keys(value).some(key => (this.hasUnresolvedValue || exportedService.hasUnresolvedValue).call(this, value[key]));
    }
    return typeof value === 'string' && value.includes('<') && value.includes('>');
},

    /** Implements findFirstValue as an overrideable service operation. */
    findFirstValue: function (value, keyName) {
    if (!value || typeof value !== 'object') {
        return null;
    }
    if (Object.prototype.hasOwnProperty.call(value, keyName) && value[keyName]) {
        return value[keyName];
    }
    if (Array.isArray(value)) {
        for (const item of value) {
            let found = (this.findFirstValue || exportedService.findFirstValue).call(this, item, keyName);
            if (found) {
                return found;
            }
        }
        return null;
    }
    for (const key of Object.keys(value)) {
        let found = (this.findFirstValue || exportedService.findFirstValue).call(this, value[key], keyName);
        if (found) {
            return found;
        }
    }
    return null;
},

    /** Implements validateGuard as an overrideable service operation. */
    validateGuard: function () {
    let missing = [];
    if (!enabled) {
        missing.push('NODICS_TEST_ENABLE_DESTRUCTIVE_CRUD=true');
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
    if (missing.length > 0) {
        console.error('Live generated CRUD tests are destructive and require explicit test-environment settings.');
        console.error('Missing: ' + missing.join(', '));
        process.exit(1);
    }
},

    /** Implements createStepError as an overrideable service operation. */
    createStepError: function (spec, step, testPath, response, body, message) {
    return new Error(JSON.stringify({
        message: message,
        moduleName: spec.moduleName,
        schemaName: spec.schemaName,
        step: step.name,
        route: step.route,
        testPath: path.relative(rootPath, testPath),
        status: response.status,
        body: body
    }, null, 4));
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
