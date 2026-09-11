/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module backoffice/test/functionalModuleEligibilityPagination
 * @description Exercises complete eligibility reads with real Nodics paging normalization and functional-owner gating.
 * @layer test
 * @owner backoffice
 * @override Later-layer page-size and getRecords overrides must preserve project/tenant scope and fail-closed reads.
 */
const assert = require('node:assert/strict');
const properties = require('../config/properties');
const definition = require('../src/service/registry/defaultFunctionalModuleCatalogueService');
const registry = require('../src/service/registry/defaultBackofficeCapabilityRegistryService');
const leaseRegistry = Object.assign({}, require('../src/service/registry/defaultBackofficeRegistryService'),
    { getConfiguration: () => properties.backofficeRegistry });
const paging = Object.assign({}, require('../../../../nodics.foundation/modules/nDatabase/database/src/service/procs/get/defaultModelsGetInitializerService'),
    { LOG: { debug() {} } });
let pageSize = properties.backofficeFunctionalModuleCatalogue.eligibilityPageSize;
global.CONFIG = { get: key => key === 'backofficeFunctionalModuleCatalogue' ? { eligibilityPageSize: pageSize } :
    key === 'defaultPageSize' ? 10 : key === 'defaultPageNumber' ? 1 : undefined };
global.CLASSES = { NodicsError: class extends Error { constructor(code, message) { super(message); this.code = code; } } };
global.NODICS = { getEnvironmentName: () => 'example.project' };
const authData = { principalId: 'system' };
const service = Object.assign({}, definition, { getModel: () => ({}), getPersistenceAuthData: () => authData });
let records = [];
let calls = [];
global.SERVICE = { DefaultPipelineService: { start: async (pipeline, request) => {
    assert.equal(pipeline, 'modelsGetInitializerPipeline');
    assert.equal(request.moduleName, 'backoffice');
    assert.equal(request.tenant, 'tenant-one');
    assert.equal(request.authData, authData);
    assert.deepEqual(request.query, { projectCode: 'example.project' });
    assert.deepEqual(request.searchOptions.sort, { functionalModule: 1, code: 1 });
    paging.buildOptions(request, {}, { nextSuccess() {} });
    calls.push({ ...request.searchOptions });
    const { skip, limit } = request.searchOptions;
    return { result: records.slice(skip, skip + limit) };
} } };

async function run() {
    assert(properties.backofficeRegistry.clientSafeMetadata.includes('functionalModuleIdentity'),
        'the effective catalogue must retain the registered lease ownership');
    assert.deepEqual(leaseRegistry.projectClientSafe({ moduleName: 'wasteCore',
        functionalModuleIdentity: 'nodics.waste', privateSecret: 'not-public' }),
    { moduleName: 'wasteCore', functionalModuleIdentity: 'nodics.waste' });
    for (const size of [0, 14, 256, 257, 513]) {
        calls = [];
        records = Array.from({ length: size }, (_, index) => ({
            code: `example.project::module${index}`, functionalModule: `module${index}`,
            technicalModules: [`member${index}`], registrationState: 'AVAILABLE', enabled: false, runtimeState: 'ACTIVE'
        }));
        const eligibility = await service.getPresentationEligibility({ tenant: 'tenant-one' });
        assert.equal(eligibility.governedModules.length, size * 2);
        assert.deepEqual(eligibility.eligibleModules, []);
        assert.equal(calls.length, Math.floor(size / pageSize) + 1);
        assert(calls.every(call => call.limit === pageSize), 'the pipeline must not silently reduce reads to ten');
    }
    pageSize = 3;
    records = Array.from({ length: 11 }, (_, index) => ({
        functionalModule: `module${index}`, technicalModules: [`member${index}`],
        registrationState: 'REGISTERED', enabled: true, runtimeState: 'ACTIVE'
    })).concat([{ functionalModule: 'nodics.waste', technicalModules: ['wasteCore'],
        registrationState: 'AVAILABLE', enabled: false, runtimeState: 'ACTIVE' }]);
    calls = [];
    let eligibility = await service.getPresentationEligibility({ tenant: 'tenant-one' });
    assert.equal(calls.length, 5, 'a later-layer page-size override must traverse every page, including an exact boundary');
    const modules = { wasteCore: [{ functionalModuleIdentity: 'nodics.waste' }] };
    assert.deepEqual(registry.applyFunctionalModuleEligibility(modules, eligibility), {});
    const waste = records.at(-1);
    for (const state of [
        { registrationState: 'REGISTERED', enabled: false, runtimeState: 'ACTIVE' },
        { registrationState: 'REGISTERED', enabled: true, runtimeState: 'OFFLINE' },
        { registrationState: 'REGISTERED', enabled: true, runtimeState: 'ACTIVE' }
    ]) {
        Object.assign(waste, state);
        eligibility = await service.getPresentationEligibility({ tenant: 'tenant-one' });
        assert.equal(Boolean(registry.applyFunctionalModuleEligibility(modules, eligibility).wasteCore),
            state.enabled && state.runtimeState === 'ACTIVE');
    }
    const getRecords = service.getRecords;
    service.getRecords = async function (request) {
        if (request.searchOptions.pageNumber === 2) throw new Error('later page unavailable');
        return getRecords.call(this, request);
    };
    await assert.rejects(service.getPresentationEligibility({ tenant: 'tenant-one' }), /later page unavailable/);
    service.getRecords = async () => ({});
    await assert.rejects(service.getPresentationEligibility({ tenant: 'tenant-one' }), /eligibility query failed/);
    pageSize = -1;
    await assert.rejects(service.getPresentationEligibility({ tenant: 'tenant-one' }), /Invalid functional-module eligibility page size/);
    console.log('Functional-module eligibility pagination and fail-closed projection validated');
}
run().catch(error => { console.error(error); process.exitCode = 1; });
