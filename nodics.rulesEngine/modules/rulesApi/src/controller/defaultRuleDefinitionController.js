/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module rulesApi/src/controller/defaultRuleDefinitionController @description Maps secured Rules HTTP requests into facade operations while preserving trusted request context. @layer controller @owner rulesApi */
module.exports = {
    /** Implements invoke as an overrideable service operation. */
    invoke: function (operation, request, callback) {
        let httpRequest = request.httpRequest || {};
        request.ruleSetCode = httpRequest.params && httpRequest.params.ruleSetCode || request.ruleSetCode;
        request.bandSetCode = httpRequest.params && httpRequest.params.bandSetCode || request.bandSetCode;
        request.propertyProviderCode = httpRequest.params && httpRequest.params.propertyProviderCode || request.propertyProviderCode;
        request.propertyCode = httpRequest.params && httpRequest.params.propertyCode || request.propertyCode;
        request.model = httpRequest.body || request.model || {};
        request.query = httpRequest.query || request.query || {};
        let promise = FACADE.DefaultRuleDefinitionFacade[operation](request);
        if (!callback) return promise;
        promise.then(result => callback(null, result)).catch(callback);
    },

    /** Implements listDefinitions as an overrideable service operation. */
    listDefinitions: function (request, callback) { return this.invoke('listDefinitions', request, callback); },
    /** Implements getDefinition as an overrideable service operation. */
    getDefinition: function (request, callback) { return this.invoke('getDefinition', request, callback); },
    /** Implements createDefinition as an overrideable service operation. */
    createDefinition: function (request, callback) { return this.invoke('createDefinition', request, callback); },
    /** Implements updateDraft as an overrideable service operation. */
    updateDraft: function (request, callback) { return this.invoke('updateDraft', request, callback); },
    /** Implements validateDraft as an overrideable service operation. */
    validateDraft: function (request, callback) { return this.invoke('validateDraft', request, callback); },
    /** Implements simulateDraft as an overrideable service operation. */
    simulateDraft: function (request, callback) { return this.invoke('simulateDraft', request, callback); },
    /** Implements prepareNextDraft as an overrideable service operation. */
    prepareNextDraft: function (request, callback) { return this.invoke('prepareNextDraft', request, callback); },
    /** Implements submitForApproval as an overrideable service operation. */
    submitForApproval: function (request, callback) { return this.invoke('submitForApproval', request, callback); },
    /** Implements publishDraft as an overrideable service operation. */
    publishDraft: function (request, callback) { return this.invoke('publishDraft', request, callback); },
    /** Implements listVersions as an overrideable service operation. */
    listVersions: function (request, callback) { return this.invoke('listVersions', request, callback); },
    /** Implements listAudit as an overrideable service operation. */
    listAudit: function (request, callback) { return this.invoke('listAudit', request, callback); },
    /** Implements propertyCatalogue as an overrideable service operation. */
    propertyCatalogue: function (request, callback) { return this.invoke('propertyCatalogue', request, callback); },
    /** Implements propertyValues as an overrideable service operation. */
    propertyValues: function (request, callback) { return this.invoke('propertyValues', request, callback); },
    /** Implements listBandSets as an overrideable service operation. */
    listBandSets: function (request, callback) { return this.invoke('listBandSets', request, callback); },
    /** Implements getBandSet as an overrideable service operation. */
    getBandSet: function (request, callback) { return this.invoke('getBandSet', request, callback); },
    /** Implements listBandVersions as an overrideable service operation. */
    listBandVersions: function (request, callback) { return this.invoke('listBandVersions', request, callback); },
    /** Implements createBandSet as an overrideable service operation. */
    createBandSet: function (request, callback) { return this.invoke('createBandSet', request, callback); },
    /** Implements updateBandSetDraft as an overrideable service operation. */
    updateBandSetDraft: function (request, callback) { return this.invoke('updateBandSetDraft', request, callback); },
    /** Implements prepareNextBandSetDraft as an overrideable service operation. */
    prepareNextBandSetDraft: function (request, callback) { return this.invoke('prepareNextBandSetDraft', request, callback); },
    /** Implements publishBandSetDraft as an overrideable service operation. */
    publishBandSetDraft: function (request, callback) { return this.invoke('publishBandSetDraft', request, callback); }
};
