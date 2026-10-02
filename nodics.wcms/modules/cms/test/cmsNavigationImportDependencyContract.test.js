/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
'use strict';
/**
 * @module cms/test/cmsNavigationImportDependencyContract
 * @description Composes CMS navigation validation, generated read/save failure serialization and actual import phase owners using inert providers. No runtime imports or writes.
 * @layer test
 * @owner cms
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const validation = require('../src/service/validation/defaultCmsContractValidationService');
const foundation = '../../../../nodics.foundation/modules/';
const outer = require(foundation + 'nData/nImport/import/src/service/process/init/defaultDataImportProcessService');
const file = require(foundation + 'nData/nImport/import/src/service/process/file/defaultFileDataImportProcessService');
const retry = require(foundation + 'nData/nImport/import/src/service/process/init/defaultImportRetryPolicyService');
const diagnostics = require(foundation + 'nData/nImport/import/src/service/diagnostics/defaultImportDiagnosticsService');
const modelImport = require(foundation + 'nData/nImport/import/src/service/process/model/defaultModelImportProcessService');
const bulk = require(foundation + 'nDatabase/database/src/service/procs/save/defaultModelsSaveInitializerService');
const read = require(foundation + 'nDatabase/database/src/service/procs/get/defaultModelsGetInitializerService');
const nexus = '../../../../nodics.accelerators/modules/nexus/modules/nexus.web/data/sample-v001/content/';
const headers = require(nexus + 'headers/wcms/nexusCorporateContentHeader').cms;
const navigation = require(nexus + 'records/wcms/corporate/nexusNavigationData');
const routes = require(nexus + 'records/wcms/corporate/nexusRouteData');

class FixtureError extends Error {
    constructor(value, message) {
        super(message || value?.message || String(value));
        Object.assign(this, typeof value === 'object' ? value : { code: value });
        this.responseCode = this.responseCode || 400;
        this.errors = this.errors || [];
        this.causes = this.causes || [];
    }
    add(error) { this.errors.push(error); }
}

/** Executes only in-memory provider and archive boundaries through the real import phase owners. */
async function run(scenario) {
    const persistedRoutes = new Map(), persistedNavigation = [], attempts = { navigation: 0, routes: 0 };
    const log = { debug() {}, warn() {}, error() {} };
    const processor = { ...outer, LOG: log }, fileProcessor = { ...file, LOG: log }, reader = { ...read, LOG: log };
    global.CLASSES = { NodicsError: FixtureError, DataImportError: FixtureError };
    global.CONFIG = { get: () => undefined };
    global.UTILS = { isArray: Array.isArray };
    global.NODICS = { getNodicsHome: () => __dirname, getActiveTenants: () => ['default'] };
    const prior = Object.getOwnPropertyDescriptor(String.prototype, 'toUpperCaseFirstChar');
    if (!prior) Object.defineProperty(String.prototype, 'toUpperCaseFirstChar', {
        configurable: true, value() { return this[0].toUpperCase() + this.slice(1); }
    });
    global.SERVICE = {
        DefaultImportRetryPolicyService: retry,
        DefaultImportDiagnosticsService: diagnostics,
        DefaultImportUtilityService: { isImportPending: files => Object.values(files).some(item => !item.done) },
        DefaultFileHandlerService: { moveFile: async () => true },
        DefaultCmsPageRouteService: { get: async request => {
            assert.equal(request.options.skipItemCache, true);
            if (scenario === 'denied') return { code: 'ERR_AUTH_00003', result: [] };
            if (scenario === 'malformed') return { code: 'SUC_FIND_00000', result: [] };
            const row = persistedRoutes.get(request.query.code);
            const response = {};
            await new Promise((resolve, reject) => reader.executeQuery({ ...request,
                schemaModel: { rawSchema: {}, getItems: async () => ({ count: row ? 1 : 0, result: row ? [row] : [] }) }
            }, response, { nextSuccess: resolve, error: (_request, _response, error) => reject(error) }));
            return response.success;
        } },
        DefaultCmsNavigationNodeService: { saveAll: async request => {
            const response = {};
            for (const model of request.models) {
                try {
                    await validation.validateNavigationNode({ tenant: request.tenant, model });
                    persistedNavigation.push(model.code);
                    response.success = response.success || [];
                    response.success.push(model);
                } catch (error) { bulk.addFailure(response, error, model); }
            }
            return new Promise(resolve => bulk.handleSucessEnd(request, response, { resolve }));
        } },
        DefaultPipelineService: { start: async (name, request) => {
            if (name === 'processFileDataImportPipeline') {
                attempts[request.fileName]++;
                const nav = request.fileName === 'navigation';
                request.fileData = { header: { ...headers[nav ? 'nexusNavigationData' : 'nexusRouteData'],
                    options: { ...headers[nav ? 'nexusNavigationData' : 'nexusRouteData'].options, moduleName: 'cms' } },
                    models: nav ? navigation : routes };
                return new Promise((resolve, reject) => fileProcessor.processModels(request, {}, {
                    nextSuccess: resolve, error: (_request, _response, error) => reject(error)
                }));
            }
            assert.equal(name, 'processModelImportPipeline');
            if (request.header.options.schemaName === 'cmsPageRoute') {
                persistedRoutes.set(request.dataModel.code, { ...request.dataModel });
                return { code: request.dataModel.code };
            }
            return modelImport.insertLocalSchemaModel(request, [{ ...request.dataModel }]);
        } }
    };
    const fixturePath = path.resolve(__dirname, nexus + 'records/wcms/corporate/nexusNavigationData.js');
    const request = { tenant: 'default', importRun: { summary: {} }, inputPath: { successPath: 'offline-only' },
        dataFiles: { navigation: { file: fixturePath, processed: [], done: false } } };
    if (scenario !== 'missing') request.dataFiles.routes = { file: fixturePath, processed: [], done: false };
    let failure;
    try { await processor.processFiles(request, {}, { phase: 0, phaseLimit: 3, pendingFiles: Object.keys(request.dataFiles) }); }
    catch (error) { failure = error; }
    finally { if (!prior) delete String.prototype.toUpperCaseFirstChar; }
    return { failure, attempts, persistedRoutes, persistedNavigation, request };
}

test('Nexus navigation-before-routes recovers through generated failure serialization and real import phases', async () => {
    const result = await run('recover');
    assert.equal(result.failure, undefined);
    assert.deepEqual(result.attempts, { navigation: 2, routes: 1 });
    assert.equal(result.persistedRoutes.size, Object.keys(routes).length);
    assert.equal(result.persistedNavigation.length, Object.keys(navigation).length);
    assert.equal(new Set(result.persistedNavigation).size, Object.keys(navigation).length);
    assert.equal(result.request.importRun.summary.recordsFailed || 0, 0);
});

test('missing targets exhaust bounded phases; denied and malformed owners never defer', async () => {
    for (const scenario of ['missing', 'denied', 'malformed']) {
        const result = await run(scenario);
        assert.ok(result.failure);
        assert.equal(result.persistedNavigation.length, 0);
        assert.equal(result.attempts.navigation, scenario === 'missing' ? 3 : 1);
        assert.equal(result.attempts.routes, 0);
    }
});

test('invalid navigation remains terminal and absent owner is not a retryable dependency', async () => {
    await run('recover');
    for (const model of [{ nodeType: 'ROUTE' }, { nodeType: 'ROUTE', targetRoute: { code: 'x' } },
        { nodeType: 'PAGE', targetPage: ' ' }, { nodeType: 'OTHER' }, { nodeType: 'CONTAINER', targetRoute: 'x' }]) {
        await assert.rejects(validation.validateNavigationNode({ tenant: 'default', model }), error => !retry.canRetry(error));
    }
    delete SERVICE.DefaultCmsPageRouteService;
    await assert.rejects(validation.validateNavigationNode({ tenant: 'default', model: { nodeType: 'ROUTE', targetRoute: 'x' } }),
        error => !retry.canRetry(error));
});
