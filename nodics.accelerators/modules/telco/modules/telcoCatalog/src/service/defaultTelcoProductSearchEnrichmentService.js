/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';
/** @module telcoCatalog/service/defaultTelcoProductSearchEnrichmentService @description Contributes customer-safe Telco plan details to Product search publication. @layer service @owner telcoCatalog */
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
        let plans = await this.read(request, {
            moduleName: 'telcoCatalog',
            schemaName: 'telcoPlanOffering',
            serviceName: 'DefaultTelcoPlanOfferingService',
            query: { productCode: input.product.code, status: 'ACTIVE' }
        });
        if (!plans[0]) return {};
        let allowances = plans[0].allowanceCodes && plans[0].allowanceCodes.length ? await this.read(request, {
            moduleName: 'telcoCatalog',
            schemaName: 'telcoAllowance',
            serviceName: 'DefaultTelcoAllowanceService',
            query: { code: { $in: plans[0].allowanceCodes }, status: 'ACTIVE' }
        }) : [];
        return {
            telco: {
                planType: plans[0].planType,
                billingCycle: plans[0].billingCycle,
                minimumTermMonths: plans[0].minimumTermMonths,
                simTypes: plans[0].simTypes || [],
                compatibleDeviceProfileCodes: plans[0].compatibleDeviceProfileCodes || [],
                allowances: allowances.map(function (item) {
                    return { code: item.code, type: item.allowanceType, amount: item.amount, unit: item.unit };
                })
            }
        };
    }
};
