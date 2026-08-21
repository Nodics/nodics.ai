/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';
/** @module apparelProduct/service/defaultApparelProductSearchEnrichmentService @description Contributes Apparel records to Product search publication. @layer service @owner apparelProduct */
module.exports = {
    init: function () { return Promise.resolve(true); },
    postInit: function () { return Promise.resolve(true); },

    records: function (response) {
        if (Array.isArray(response)) return response;
        if (response && Array.isArray(response.result)) return response.result;
        if (response && response.data && Array.isArray(response.data.result)) return response.data.result;
        return [];
    },

    modelName: function (schemaName) {
        return schemaName.charAt(0).toUpperCase() + schemaName.slice(1) + 'Model';
    },

    read: async function (request, options) {
        let query = Object.assign({ tenant: request.tenant }, options.query || {});
        let service = SERVICE[options.serviceName];
        if (service && typeof service.get === 'function') {
            return this.records(await service.get({ tenant: request.tenant, authData: request.authData, query: query }));
        }
        let moduleModels = global.NODICS && typeof NODICS.getModels === 'function' && NODICS.getModels(options.moduleName, request.tenant);
        let model = moduleModels && moduleModels[this.modelName(options.schemaName)];
        if (model && typeof model.getItems === 'function') {
            return this.records(await model.getItems({ tenant: request.tenant, authData: request.authData, query: query }));
        }
        return [];
    },

    enrich: async function (request, input) {
        let styles = await this.read(request, {
            moduleName: 'apparelProduct',
            schemaName: 'apparelStyle',
            serviceName: 'DefaultApparelStyleService',
            query: { productCode: input.product.code, status: 'ACTIVE' }
        });
        if (!styles[0]) return {};
        let profiles = await this.read(request, {
            moduleName: 'apparelProduct',
            schemaName: 'apparelVariantProfile',
            serviceName: 'DefaultApparelVariantProfileService',
            query: { productCode: input.product.code, status: 'ACTIVE' }
        });
        return SERVICE.DefaultApparelProductProjectionService.project(styles[0], profiles);
    }
};
