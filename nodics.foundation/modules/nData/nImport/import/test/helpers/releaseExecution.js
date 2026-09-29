/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module import/test/helpers/releaseExecution @description Shared offline release execution ports extracted from the owner contract. @layer test @owner import */

/** Installs in-memory receipt/import ports; callers supply module and runtime selections. No importer or database is started. */
module.exports = function releaseExecution({ modules, configuration, environment = 'testEnvironment',
    environmentClass = 'LOCAL', runtimeRole = 'WCMS_STAGED', onImport } = {}) {
    const policy = configuration || {
        ...structuredClone(require('../../config/properties').data.dataReleases),
        allowedDestinationRoles: [runtimeRole]
    };
    const installations = [];
    const imports = [];
    const state = { installations, imports, runtimeRole };
    global.CONFIG = { get: key => ({
        data: { dataReleases: policy }, environment: { class: environmentClass },
        defaultTenant: 'default', runtimeRole: { code: state.runtimeRole, publication: 'STAGED' }
    })[key] };
    global.NODICS = {
        getActiveModules: () => Object.keys(modules),
        getRawModule: name => modules[name],
        getSelectedEnvironmentName: () => environment
    };
    const importData = async request => {
        imports.push(structuredClone(request));
        if (onImport) await onImport(request);
        request.importRun = { runId: request.options.validateOnly ? 'validate-run' : 'install-run' };
        return { validationOnly: request.options.validateOnly };
    };
    global.SERVICE = {
        DefaultDataInstallationService: {
            get: async request => {
                const matched = installations.filter(item =>
                    (!request.tenant || item.tenant === request.tenant) &&
                    (!request.query.code || item.code === request.query.code));
                const size = request.searchOptions?.pageSize || 10;
                const skip = size * ((request.searchOptions?.pageNumber || 1) - 1);
                return { result: matched.slice(skip, skip + size) };
            },
            save: async request => { installations.push(request.model); return request.model; },
            update: async request => {
                const index = installations.findIndex(item => item.code === request.query.code);
                installations[index] = request.model;
                return request.model;
            }
        },
        DefaultImportService: { importInitData: importData, importCoreData: importData, importSampleData: importData }
    };
    state.service = require('../../src/service/release/defaultDataReleaseService');
    return state;
};
