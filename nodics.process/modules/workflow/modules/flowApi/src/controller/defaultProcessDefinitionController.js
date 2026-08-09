/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/**
 * @module nodics.process/modules/workflow/modules/flowApi/src/controller/defaultProcessDefinitionController
 * @description Maps secured Process HTTP requests into process definition facade calls while preserving tenant and authenticated actor context.
 * @layer controller
 * @owner flowApi
 * @override Customer process overlays may customize request mapping while preserving backend lifecycle semantics.
 */
module.exports = {
    /**
     * Normalizes request body, query, params, and invokes a facade operation.
     *
     * @param {string} operation Facade operation name.
     * @param {Object} request Nodics request context.
     * @param {Function} [callback] Optional Node-style callback.
     * @returns {Promise<Object>|void} Promise when callback is omitted.
     */
    invoke: function (operation, request, callback) {
        let httpRequest = request.httpRequest || {};
        request.definitionCode = httpRequest.params && httpRequest.params.definitionCode || request.definitionCode;
        request.processDefinition = httpRequest.body || request.processDefinition || {};
        request.query = httpRequest.query || request.query || {};
        let promise = FACADE.DefaultProcessDefinitionFacade[operation](request);
        if (!callback) return promise;
        promise.then(result => callback(null, result)).catch(callback);
    },

    /** Lists governed process definitions. */
    listDefinitions: function (request, callback) { return this.invoke('listDefinitions', request, callback); },
    /** Reads one governed process definition. */
    getDefinition: function (request, callback) { return this.invoke('getDefinition', request, callback); },
    /** Creates a new draft process definition. */
    createDefinition: function (request, callback) { return this.invoke('createDefinition', request, callback); },
    /** Updates a draft process definition. */
    updateDraft: function (request, callback) { return this.invoke('updateDraft', request, callback); },
    /** Validates a draft process definition graph. */
    validateDraft: function (request, callback) { return this.invoke('validateDraft', request, callback); },
    /** Publishes a valid draft process definition. */
    publishDraft: function (request, callback) { return this.invoke('publishDraft', request, callback); },
    /** Prepares the next editable draft from the latest published version. */
    prepareNextDraft: function (request, callback) { return this.invoke('prepareNextDraft', request, callback); },
    /** Deletes a draft or archives a published process definition. */
    deleteOrArchive: function (request, callback) { return this.invoke('deleteOrArchive', request, callback); },
    /** Lists published versions for one definition. */
    listVersions: function (request, callback) { return this.invoke('listVersions', request, callback); }
};
