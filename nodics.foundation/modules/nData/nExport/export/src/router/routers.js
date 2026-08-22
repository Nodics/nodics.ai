/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nodics.foundation/modules/nData/nExport/export/src/router/routers
 * @description Publishes export orchestration routes owned by nExport. Generated-file delivery remains owned by media.
 * @layer router
 * @owner nExport
 * @override Project modules may add export orchestration routes through later active modules only when they do not duplicate media media delivery or download authority.
 */
module.exports = {
    export: {
        dataExport: {
            exportPost: {
                secured: true,
                accessGroups: ['userGroup'],
                permission: 'export.run',
                apiExposure: 'dataExport',
                key: '/export',
                method: 'POST',
                controller: 'DataExportController',
                operation: 'export',
                help: {
                    requestType: 'secured',
                    message: 'Authorization: Bearer <token> header is preferred; nExport creates governed export media and media owns file download.',
                    method: 'POST',
                    url: 'http://host:port/nodics/export/v0/export',
                    body: {
                        enterpriseCode: 'Business enterprise context for export authorization and target media placement',
                        tenantCode: 'Optional backend-resolved tenant context when explicitly narrowed by the caller',
                        moduleName: 'Owning module of the schema/model being exported',
                        schemaName: 'Schema/model to export',
                        format: 'Output file format such as csv or json',
                        query: 'Schema workbench query used to select records'
                    }
                }
            },
            exportHistoryGet: {
                secured: true,
                accessGroups: ['userGroup'],
                permission: 'export.run',
                apiExposure: 'dataExport',
                key: '/history',
                method: 'GET',
                controller: 'DataExportController',
                operation: 'history',
                help: {
                    requestType: 'secured',
                    message: 'Authorization: Bearer <token> header is preferred; nExport returns generated export history projected from media without exposing storage paths.',
                    method: 'GET',
                    url: 'http://host:port/nodics/export/v0/history',
                    query: {
                        limit: 'Optional maximum number of generated export records',
                        skip: 'Optional offset for generated export records'
                    }
                }
            }
        }
    }
};
