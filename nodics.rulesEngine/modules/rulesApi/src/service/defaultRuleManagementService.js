/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module rulesApi/src/service/defaultRuleManagementService @description Read and simulation orchestration over Rules definition/evaluation owners. @layer service @owner rulesApi */
module.exports = {
    lifecycle: function () { return SERVICE.DefaultRuleDefinitionLifecycleService; },

    serviceRequest: function (request, additions) {
        return this.lifecycle().serviceRequest(request, additions);
    },

    listDefinitions: async function (request) {
        let response = await SERVICE.DefaultRuleSetService.get(this.serviceRequest(request, {
            query: request.query || {},
            searchOptions: Object.assign({ limit: 100 }, request.searchOptions || {})
        }));
        return { code: 'RULE_SET_LIST', data: response.result || [] };
    },

    getDefinition: async function (request) {
        return { code: 'RULE_SET_DETAIL', data: await this.lifecycle().requireRuleSet(request, request.ruleSetCode) };
    },

    listVersions: async function (request) {
        this.lifecycle().assertCode(request.ruleSetCode);
        let response = await SERVICE.DefaultRuleSetVersionService.get(this.serviceRequest(request, {
            query: { ruleSetCode: request.ruleSetCode },
            searchOptions: { limit: 100, sort: { version: -1 } }
        }));
        return { code: 'RULE_SET_VERSIONS', data: response.result || [] };
    },

    simulateDraft: async function (request) {
        let ruleSet = await this.lifecycle().requireRuleSet(request, request.ruleSetCode);
        if (ruleSet.status !== 'DRAFT') throw new Error('Simulation requires an editable draft');
        let validation = await this.lifecycle().validateRuleSetDraft(Object.assign({}, request, { ruleSetCode: ruleSet.code }));
        let bandVersion = await this.lifecycle().currentBandVersion(request, ruleSet.scoreBandSetCode);
        if (!bandVersion) throw new Error('Simulation requires a published score band set');
        let provider = SERVICE.DefaultRulePropertyCatalogueRegistryService.getProvider(ruleSet.propertyProviderCode);
        let catalogue = provider.getCatalogue({ tenant: request.tenant, consumerModule: ruleSet.consumerModule }) || {};
        let simulationRequest = {
            ruleSet: {
                code: ruleSet.code,
                version: 'DRAFT-' + String(ruleSet.draftRevision || 1),
                minimumScore: ruleSet.minimumScore,
                maximumScore: ruleSet.maximumScore,
                groups: (ruleSet.definition && ruleSet.definition.groups) || [],
                scoreBands: bandVersion.bands
            },
            propertyProviderCode: ruleSet.propertyProviderCode,
            propertyCatalogueCode: catalogue.code || ruleSet.propertyProviderCode,
            propertyCatalogueVersion: catalogue.version || ruleSet.propertyCatalogueVersion,
            bandSetCode: bandVersion.bandSetCode,
            bandSetVersion: bandVersion.version,
            input: request.model && request.model.input || request.input || {},
            correlationId: request.correlationId || request.requestId
        };
        let result = SERVICE.DefaultRuleSimulationService.simulate(simulationRequest);
        return { code: 'RULE_SIMULATION', data: Object.assign({ validation: validation.data || validation }, result) };
    }
};
