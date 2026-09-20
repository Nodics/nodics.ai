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

    listDefinitions: function (request, callback) { return this.invoke('listDefinitions', request, callback); },
    getDefinition: function (request, callback) { return this.invoke('getDefinition', request, callback); },
    createDefinition: function (request, callback) { return this.invoke('createDefinition', request, callback); },
    updateDraft: function (request, callback) { return this.invoke('updateDraft', request, callback); },
    validateDraft: function (request, callback) { return this.invoke('validateDraft', request, callback); },
    simulateDraft: function (request, callback) { return this.invoke('simulateDraft', request, callback); },
    prepareNextDraft: function (request, callback) { return this.invoke('prepareNextDraft', request, callback); },
    submitForApproval: function (request, callback) { return this.invoke('submitForApproval', request, callback); },
    publishDraft: function (request, callback) { return this.invoke('publishDraft', request, callback); },
    listVersions: function (request, callback) { return this.invoke('listVersions', request, callback); },
    listAudit: function (request, callback) { return this.invoke('listAudit', request, callback); },
    propertyCatalogue: function (request, callback) { return this.invoke('propertyCatalogue', request, callback); },
    propertyValues: function (request, callback) { return this.invoke('propertyValues', request, callback); },
    listBandSets: function (request, callback) { return this.invoke('listBandSets', request, callback); },
    getBandSet: function (request, callback) { return this.invoke('getBandSet', request, callback); },
    listBandVersions: function (request, callback) { return this.invoke('listBandVersions', request, callback); },
    createBandSet: function (request, callback) { return this.invoke('createBandSet', request, callback); },
    updateBandSetDraft: function (request, callback) { return this.invoke('updateBandSetDraft', request, callback); },
    prepareNextBandSetDraft: function (request, callback) { return this.invoke('prepareNextBandSetDraft', request, callback); },
    publishBandSetDraft: function (request, callback) { return this.invoke('publishBandSetDraft', request, callback); }
};
