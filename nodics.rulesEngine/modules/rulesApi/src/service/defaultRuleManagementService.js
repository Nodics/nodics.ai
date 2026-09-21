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
    /** Implements lifecycle as an overrideable service operation. */
    lifecycle: function () { return SERVICE.DefaultRuleDefinitionLifecycleService; },

    /** Implements serviceRequest as an overrideable service operation. */
    serviceRequest: function (request, additions) {
        return this.lifecycle().serviceRequest(request, additions);
    },

    /** Implements listDefinitions as an overrideable service operation. */
    listDefinitions: async function (request) {
        let response = await SERVICE.DefaultRuleSetService.get(this.serviceRequest(request, {
            query: request.query || {},
            searchOptions: Object.assign({ limit: 100 }, request.searchOptions || {})
        }));
        return { code: 'RULE_SET_LIST', data: response.result || [] };
    },

    /** Implements getDefinition as an overrideable service operation. */
    getDefinition: async function (request) {
        return { code: 'RULE_SET_DETAIL', data: await this.lifecycle().requireRuleSet(request, request.ruleSetCode) };
    },

    /** Implements listVersions as an overrideable service operation. */
    listVersions: async function (request) {
        this.lifecycle().assertCode(request.ruleSetCode);
        let response = await SERVICE.DefaultRuleSetVersionService.get(this.serviceRequest(request, {
            query: { ruleSetCode: request.ruleSetCode },
            searchOptions: { limit: 100, sort: { version: -1 } }
        }));
        return { code: 'RULE_SET_VERSIONS', data: response.result || [] };
    },

    /** Implements listAudit as an overrideable service operation. */
    listAudit: async function (request) {
        this.lifecycle().assertCode(request.ruleSetCode);
        let response = await SERVICE.DefaultRuleAuditEventService.get(this.serviceRequest(request, {
            query: { ruleSetCode: request.ruleSetCode },
            searchOptions: { limit: 200, sort: { createdAt: -1 } }
        }));
        return { code: 'RULE_SET_AUDIT', data: response.result || [] };
    },

    /** Implements propertyCatalogue as an overrideable service operation. */
    propertyCatalogue: function (request) {
        let code = request.propertyProviderCode;
        this.lifecycle().assertCode(code);
        let registry = SERVICE.DefaultRulePropertyCatalogueRegistryService;
        let catalogue = registry.getCatalogue(code, {
            tenant: request.tenant,
            consumerModule: request.query && request.query.consumerModule,
            policyType: request.query && request.query.policyType,
            scopeType: request.query && request.query.scopeType,
            scopeCode: request.query && request.query.scopeCode
        });
        return {
            code: 'RULE_PROPERTY_CATALOGUE',
            data: {
                catalogue: catalogue,
                operators: SERVICE.DefaultRuleOperatorService.operators()
            }
        };
    },

    /** Implements propertyValues as an overrideable service operation. */
    propertyValues: async function (request) {
        this.lifecycle().assertCode(request.propertyProviderCode);
        this.lifecycle().assertCode(request.propertyCode);
        let values = await SERVICE.DefaultRulePropertyCatalogueRegistryService.resolveAllowedValues(
            request.propertyProviderCode,
            {
                propertyCode: request.propertyCode,
                context: {
                    request: request,
                    tenant: request.tenant,
                    consumerModule: request.query && request.query.consumerModule,
                    filters: request.query || {}
                }
            }
        );
        return { code: 'RULE_PROPERTY_VALUES', data: values || [] };
    },

    /** Implements listBandSets as an overrideable service operation. */
    listBandSets: async function (request) {
        let response = await SERVICE.DefaultScoreBandSetService.get(this.serviceRequest(request, {
            query: request.query || {},
            searchOptions: Object.assign({ limit: 100 }, request.searchOptions || {})
        }));
        return { code: 'SCORE_BAND_SET_LIST', data: response.result || [] };
    },

    /** Implements getBandSet as an overrideable service operation. */
    getBandSet: async function (request) {
        return { code: 'SCORE_BAND_SET_DETAIL', data: await this.lifecycle().requireBandSet(request, request.bandSetCode) };
    },

    /** Implements listBandVersions as an overrideable service operation. */
    listBandVersions: async function (request) {
        this.lifecycle().assertCode(request.bandSetCode);
        let response = await SERVICE.DefaultScoreBandSetVersionService.get(this.serviceRequest(request, {
            query: { bandSetCode: request.bandSetCode },
            searchOptions: { limit: 100, sort: { version: -1 } }
        }));
        return { code: 'SCORE_BAND_SET_VERSIONS', data: response.result || [] };
    },

    /** Implements simulateDraft as an overrideable service operation. */
    simulateDraft: async function (request) {
        let ruleSet = await this.lifecycle().requireRuleSet(request, request.ruleSetCode);
        if (ruleSet.status !== 'DRAFT') throw new Error('Simulation requires an editable draft');
        let validation = await this.lifecycle().validateRuleSetDraft(Object.assign({}, request, { ruleSetCode: ruleSet.code }));
        let bandVersion = ruleSet.scoreBandSetCode
            ? await this.lifecycle().currentBandVersion(request, ruleSet.scoreBandSetCode)
            : null;
        let provider = SERVICE.DefaultRulePropertyCatalogueRegistryService.getProvider(ruleSet.propertyProviderCode);
        let catalogue = provider.getCatalogue({ tenant: request.tenant, consumerModule: ruleSet.consumerModule }) || {};
        let simulationRequest = {
            ruleSet: {
                code: ruleSet.code,
                version: 'DRAFT-' + String(ruleSet.draftRevision || 1),
                minimumScore: ruleSet.minimumScore,
                maximumScore: ruleSet.maximumScore,
                groups: (ruleSet.definition && ruleSet.definition.groups) || [],
                scoreBands: bandVersion ? bandVersion.bands : [],
                gapBehavior: bandVersion ? bandVersion.gapBehavior || 'REJECT' : 'NO_OUTCOME'
            },
            propertyProviderCode: ruleSet.propertyProviderCode,
            propertyCatalogueCode: catalogue.code || ruleSet.propertyProviderCode,
            propertyCatalogueVersion: catalogue.version || ruleSet.propertyCatalogueVersion,
            bandSetCode: bandVersion && bandVersion.bandSetCode,
            bandSetVersion: bandVersion && bandVersion.version,
            input: request.model && request.model.input || request.input || {},
            correlationId: request.correlationId || request.requestId
        };
        let result = SERVICE.DefaultRuleSimulationService.simulate(simulationRequest);
        let simulation = {
            draftRevision: Number(ruleSet.draftRevision || 1),
            sourceHash: result.sourceHash,
            simulatedAt: new Date(),
            bandSetCode: bandVersion && bandVersion.bandSetCode,
            bandSetVersion: bandVersion ? Number(bandVersion.version) : undefined,
            propertyCatalogueCode: simulationRequest.propertyCatalogueCode,
            propertyCatalogueVersion: String(simulationRequest.propertyCatalogueVersion || '')
        };
        await SERVICE.DefaultRuleSetService.update(this.serviceRequest(request, {
            query: { code: ruleSet.code, status: 'DRAFT', draftRevision: Number(ruleSet.draftRevision || 1) },
            model: { $set: { lastSimulation: simulation } }
        }));
        if (SERVICE.DefaultRuleAuditService) {
            await SERVICE.DefaultRuleAuditService.record(request, {
                ruleSetCode: ruleSet.code,
                draftRevision: Number(ruleSet.draftRevision || 1),
                eventType: 'RULE_SET_SIMULATED',
                outcome: 'SUCCESS',
                metadata: {
                    sourceHash: result.sourceHash,
                    bandSetCode: bandVersion && bandVersion.bandSetCode,
                    bandSetVersion: bandVersion ? Number(bandVersion.version) : undefined,
                    finalScore: result.finalScore,
                    scoreBandCode: result.scoreBandCode
                }
            });
        }
        return {
            code: 'RULE_SIMULATION',
            data: Object.assign({ validation: validation.data || validation, simulation: simulation }, result)
        };
    }
};
