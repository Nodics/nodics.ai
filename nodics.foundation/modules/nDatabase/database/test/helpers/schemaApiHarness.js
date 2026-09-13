/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @module database/test/helpers/schemaApiHarness
 * @description Exercises compiled canonical controller, facade and service templates against test persistence doubles.
 * @layer test
 * @owner nDatabase
 */
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const utility = require('../../src/service/schema/defaultSchemaUtilityService');
const safeQuery = require('../../src/service/schema/defaultSchemaSafeQueryService');
const authoring = require('../../src/service/schema/defaultSchemaAuthoringPolicyService');

function compile(owner, schema, moduleName, serviceName, facadeName) {
    const filename = path.resolve(__dirname, '../../../../', owner, 'src', owner === 'nController' ? 'controller' : owner === 'nFacade' ? 'facade' : 'service', 'common.js');
    let source = fs.readFileSync(filename, 'utf8');
    for (const [key, value] of Object.entries({ schmanm: schema, mdulnm: moduleName, mdlnm: schema + 'Model', srvcName: serviceName, dsdName: facadeName })) source = source.replaceAll(key, value);
    const compiled = new Module(filename, module);
    compiled.paths = module.paths;
    compiled._compile(source, filename);
    return compiled.exports;
}

function invoke(operation, source) {
    const schema = source.httpRequest.params.schema;
    const name = schema.charAt(0).toUpperCase() + schema.slice(1);
    const serviceName = 'Default' + name + 'Service', facadeName = 'Default' + name + 'Facade';
    const request = Object.defineProperties({}, Object.getOwnPropertyDescriptors(source));
    request.router = { schemaGoverned: true };
    const body = source.httpRequest.body || {};
    request.httpRequest = { ...source.httpRequest, get: source.httpRequest.get || (() => undefined),
        body: operation === 'save' ? (body.model || body) : ['update', 'remove'].includes(operation) ? { ...body, query: body.identity, options: { recursive: false, returnModified: operation === 'update' } } : body };
    global.UTILS = { isBlank: value => !value || Object.keys(value).length === 0, ...global.UTILS };
    SERVICE.DefaultSchemaSafeQueryService ||= safeQuery;
    SERVICE.DefaultSchemaAuthoringPolicyService ||= authoring;
    const methods = compile('nService', schema, source.moduleName, serviceName, facadeName);
    SERVICE[serviceName] = { safeSearch: methods.safeSearch, capabilities: methods.capabilities, deleteImpact: methods.deleteImpact, bulk: methods.bulk, ...SERVICE[serviceName] };
    NODICS.getModels ||= () => ({});
    global.FACADE ||= {};
    FACADE[facadeName] = compile('nFacade', schema, source.moduleName, serviceName, facadeName);
    const controller = compile('nController', schema, source.moduleName, serviceName, facadeName);
    return controller[operation](request);
}

/** Test-only response normalization; actual wire envelopes are asserted in client and compiled pipeline contracts. */
function record(result) {
    if (result && result.result !== undefined) return record(result.result);
    if (result && Array.isArray(result.models)) return result.models[0];
    if (Array.isArray(result)) return result[0];
    return result;
}
module.exports = {
    ...utility, ...safeQuery,
    search: request => invoke('safeSearch', request),
    createRecord: request => Promise.resolve(invoke('save', request)).then(result => ({ data: record(result) })),
    updateRecord: request => Promise.resolve(invoke('update', request)).then(result => ({ data: record(result) })),
    deleteRecord: request => Promise.resolve(invoke('remove', request)).then(data => ({ data })),
    previewDeleteImpact: request => invoke('deleteImpact', request),
    bulk: request => invoke('bulk', request),
};
