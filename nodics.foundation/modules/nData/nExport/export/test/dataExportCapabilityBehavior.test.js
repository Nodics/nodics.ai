/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nodics.foundation/modules/nData/nExport/export/test/dataExportCapabilityBehavior
 * @description Verifies export request normalization, fail-closed default
 * behavior, export access-policy delegation, and export-safe model copy
 * handling.
 * @layer test
 * @owner export
 * @override Project modules should add implementation-specific export tests
 * while preserving these shared export engine contracts.
 */

const assert = require('assert');
const path = require('path');

// @nodics-capability-behavior @nodics-area system
global.CONFIG = {
    get: function (key) {
        if (key === 'defaultErrorCodes') {
            return {
                NodicsError: 'ERR_SYS_00000',
            };
        }
        if (key === 'dataExport') {
            return {
                enabled: true,
                allowedFormats: ['csv', 'json'],
                defaultFormat: 'csv',
                maximumRecords: 100,
                pageSize: 10,
                media: {
                    folderCode: 'exportFiles',
                    formatCode: 'exportFile',
                },
            };
        }
        if (key === 'returnErrorStack') {
            return false;
        }
        return undefined;
    },
};

global.SERVICE = {
    DefaultStatusService: {
        get: function (code) {
            return {
                code: 500,
                message: 'Status message for ' + code,
            };
        },
    },
};

global.UTILS = {
    isObject: function (value) {
        return value !== null && typeof value === 'object' && !Array.isArray(value);
    },
    isBlank: function (value) {
        return value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0) || (this.isObject(value) && Object.keys(value).length === 0);
    },
    extractFromError: function (error, message, defaultCode) {
        return {
            code: defaultCode,
            name: error.name,
            responseCode: global.SERVICE.DefaultStatusService.get(defaultCode).code,
            message: message ? error.message + ' : ' + message : error.message,
            stack: error.stack,
        };
    },
    extractFromMessage: function (message, defaultCode) {
        return {
            code: defaultCode,
            responseCode: global.SERVICE.DefaultStatusService.get(defaultCode).code,
            message: message,
        };
    },
};

global.CLASSES = {
    NodicsError: require('../../../../nCommon/src/lib/nodicsError'),
};

global.SERVICE.DataExportService = require('../src/service/DataExportService');
global.FACADE = {
    DataExportFacade: require('../src/facade/DataExportFacade'),
};

const controller = require('../src/controller/DataExportController');
const routerConfig = require('../src/router/routers');
const foundationPackage = require(path.join(__dirname, '../../../../../package.json'));

(async function () {
    let request = {
        httpRequest: {
            query: {
                schema: 'tenant',
            },
            body: {
                format: 'json',
            },
        },
    };

    let exportError;
    try {
        await controller.export(request);
    } catch (error) {
        exportError = error;
    }

    assert.deepStrictEqual(request.export, {
        format: 'json',
        query: {
            schema: 'tenant',
        },
    });
    assert(exportError instanceof global.CLASSES.NodicsError);
    assert.strictEqual(exportError.code, 'ERR_EXP_00001');
    assert(exportError.message.includes('Export module is invalid'));

    assert.throws(
        () => global.SERVICE.DataExportService.normalizeRequest({
            tenant: 'default',
            authData: { enterprise: { code: 'default' } },
            export: { moduleName: 'profile', schemaName: 'tenant', enterpriseCode: 'anotherEnterprise' },
        }),
        (error) => error.code === 'ERR_EXP_00001' && error.message.includes('Cross-enterprise'),
    );
    assert.strictEqual(global.SERVICE.DataExportService.escapeCsvValue('=SUM(A1:A2)'), "'=SUM(A1:A2)");

    let selectedModels = [
        {
            code: 'product-001',
            internalCost: 99,
        },
    ];
    global.SERVICE.DefaultSchemaReadAccessPolicyService = {
        applyExportPolicies: function (policyRequest, policyResponse) {
            if (policyRequest.schemaModel.schemaName === 'product') {
                assert.strictEqual(policyRequest.tenant, 'electronics');
            }
            delete policyResponse.success.result[0].internalCost;
            policyResponse.success.policy = {
                action: 'export',
                appliedCount: 1,
            };
            return Promise.resolve(policyResponse);
        },
    };
    let filteredModels = await global.SERVICE.DataExportService.applyExportAccessPolicies(
        {
            tenant: 'electronics',
            schemaModel: {
                schemaName: 'product',
            },
        },
        selectedModels,
    );

    assert.deepStrictEqual(filteredModels, [
        {
            code: 'product-001',
        },
    ]);
    assert.deepStrictEqual(selectedModels, [
        {
            code: 'product-001',
            internalCost: 99,
        },
    ]);

    global.SERVICE.DefaultSchemaWorkbenchService = {
        get: function (workbenchRequest) {
            assert.strictEqual(workbenchRequest.moduleName, 'profile');
            assert.strictEqual(workbenchRequest.httpRequest.params.schema, 'tenant');
            return Promise.resolve({
                data: {
                    label: 'Tenant',
                    fields: [
                        { name: 'code', type: 'string' },
                        { name: 'description', type: 'string' },
                        { name: 'properties', type: 'object' },
                    ],
                    queryCapabilities: {
                        allowedPageSizes: [10],
                        defaultPageSize: 10,
                        maximumPageSize: 10,
                        defaultSort: { field: 'code', direction: 'ASC' },
                        sortableFields: ['code'],
                    },
                },
            });
        },
        search: function (workbenchRequest) {
            assert.strictEqual(workbenchRequest.moduleName, 'profile');
            assert.strictEqual(workbenchRequest.httpRequest.params.schema, 'tenant');
            assert.strictEqual(workbenchRequest.httpRequest.body.pageSize, 10);
            return Promise.resolve({
                data: {
                    records: [
                        {
                            code: 'default',
                            description: 'Default tenant',
                            internalCost: 99,
                        },
                        {
                            code: 'qa',
                            description: 'QA tenant',
                            internalCost: 88,
                        },
                    ],
                    totalCount: 2,
                },
            });
        },
    };
    global.SERVICE.DefaultMediaUploadService = {
        upload: function (mediaRequest) {
            assert.strictEqual(mediaRequest.folderCode, 'exportFiles');
            assert.strictEqual(mediaRequest.formatCode, 'exportFile');
            assert.strictEqual(mediaRequest.moduleName, 'profile');
            assert.strictEqual(mediaRequest.schemaName, 'tenant');
            assert.strictEqual(mediaRequest.files.length, 1);
            assert(Buffer.isBuffer(mediaRequest.files[0].buffer));
            return Promise.resolve({
                code: 'tenant-export-test',
                accessUrl: '/nodics/media/v0/content/tenant-export-test',
                originalFileName: mediaRequest.files[0].originalFileName,
                storageKey: 'must-not-leave-export-boundary',
            });
        },
    };
    global.NODICS = {
        getModels: function (moduleName, tenant) {
            assert.strictEqual(moduleName, 'profile');
            assert.strictEqual(tenant, 'default');
            return {
                Tenant: {
                    schemaName: 'tenant',
                },
            };
        },
    };
    global.UTILS.createModelName = function (schemaName) {
        return schemaName.charAt(0).toUpperCase() + schemaName.slice(1);
    };

    let exportResult = await global.SERVICE.DataExportService.export({
        tenant: 'default',
        authData: {
            enterprise: {
                code: 'default',
            },
        },
        export: {
            moduleName: 'profile',
            schemaName: 'tenant',
            format: 'csv',
            query: {
                search: 'default',
            },
        },
    });

    assert.strictEqual(exportResult.code, 'SUC_SYS_00000');
    assert.strictEqual(exportResult.data.media.code, 'tenant-export-test');
    assert.strictEqual(exportResult.data.media.storageKey, undefined);
    assert.strictEqual(exportResult.data.summary.exportedRecords, 2);
    assert.strictEqual(exportResult.data.provenance.contractType, 'NODICS_SCHEMA_EXPORT');
    assert.strictEqual(exportResult.data.provenance.importAuthorization, false);
    assert.strictEqual(exportResult.data.provenance.publicationAuthorization, false);
    assert.strictEqual(exportResult.data.provenance.onlineWriteAuthorization, false);
    assert.match(exportResult.data.provenance.checksum, /^[a-f0-9]{64}$/);

    let mediaHistoryRequest;
    global.SERVICE.DefaultMediaService = {
        get: async function (request) {
            mediaHistoryRequest = request;
            return {
                success: {
                    result: [
                        {
                            code: 'tenant-export-test',
                            name: 'tenant-export-test.csv',
                            folderCode: 'exportFiles',
                            formatCode: 'exportFile',
                            originalFileName: 'tenant-export-test.csv',
                            mimeType: 'text/csv',
                            extension: 'csv',
                            sizeBytes: 128,
                            checksum: 'a'.repeat(64),
                            checksumAlgorithm: 'SHA-256',
                            enterpriseCode: 'default',
                            status: 'READY',
                            updatedAt: new Date('2026-08-21T10:00:00.000Z'),
                        },
                    ],
                },
            };
        },
    };
    let historyResult = await global.SERVICE.DataExportService.history({
        tenant: 'default',
        authData: {
            enterprise: {
                code: 'default',
            },
        },
        httpRequest: {
            query: {
                limit: '10',
            },
        },
    });
    assert.strictEqual(historyResult.code, 'SUC_SYS_00000');
    assert.strictEqual(historyResult.data[0].runId, 'tenant-export-test');
    assert.strictEqual(historyResult.data[0].dataType, 'export');
    assert.strictEqual(historyResult.data[0].media.originalFileName, 'tenant-export-test.csv');
    assert.strictEqual(historyResult.data[0].media.sizeBytes, 128);
    assert.deepStrictEqual(mediaHistoryRequest.query, {
        folderCode: 'exportFiles',
        formatCode: 'exportFile',
        enterpriseCode: 'default',
    });
    assert.strictEqual(mediaHistoryRequest.searchOptions.projection.storageKey, undefined);

    const jsonPayload = JSON.parse(global.SERVICE.DataExportService.renderJson(
        { moduleName: 'profile', schemaName: 'tenant' },
        [{ code: 'default' }],
        { label: 'Tenant' },
        { contractType: 'NODICS_SCHEMA_EXPORT', contractVersion: 0 },
    ));
    assert.strictEqual(jsonPayload.contract.contractType, 'NODICS_SCHEMA_EXPORT');
    assert.deepStrictEqual(jsonPayload.records, [{ code: 'default' }]);

    assert.strictEqual(typeof controller.downloadGeneratedExport, 'undefined', 'nExport must not expose a duplicate download controller operation');
    assert.strictEqual(typeof global.FACADE.DataExportFacade.downloadGeneratedExport, 'undefined', 'nExport must not expose a duplicate download facade operation');
    assert.strictEqual(typeof global.SERVICE.DataExportService.downloadGeneratedExport, 'undefined', 'nExport must not expose a duplicate download service operation');
    const exportRoute = routerConfig.export.dataExport.exportPost;
    assert.strictEqual(exportRoute.key, '/export');
    assert.strictEqual(exportRoute.controller, 'DataExportController');
    assert.strictEqual(exportRoute.operation, 'export');
    assert.strictEqual(exportRoute.permission, 'export.run');
    assert.strictEqual(exportRoute.apiExposure, 'dataExport');
    const historyRoute = routerConfig.export.dataExport.exportHistoryGet;
    assert.strictEqual(historyRoute.key, '/history');
    assert.strictEqual(historyRoute.controller, 'DataExportController');
    assert.strictEqual(historyRoute.operation, 'history');
    assert.strictEqual(historyRoute.permission, 'export.run');
    assert.strictEqual(historyRoute.apiExposure, 'dataExport');
    assert(
        foundationPackage.requiredModules.includes('export'),
        'Foundation must load the export capability directly so fresh runtimes expose /nodics/export/v0/export',
    );

    console.log('Data export capability behavior validated');
})().catch((error) => {
    console.error(error);
    process.exit(1);
});
