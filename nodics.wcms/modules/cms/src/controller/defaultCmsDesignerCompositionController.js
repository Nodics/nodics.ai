/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module cms/controller/defaultCmsDesignerCompositionController
 * @description Maps secured Axis Page Designer HTTP requests to CMS-owned composition operations.
 * @layer controller
 * @owner cms
 * @override Later modules may adapt request mapping while preserving permissioned CMS authoring semantics.
 */
module.exports = {
    /** Initializes the designer controller lifecycle. */
    init: function () { return Promise.resolve(true); },

    /** Completes the designer controller lifecycle. */
    postInit: function () { return Promise.resolve(true); },

    /** Invokes one designer facade operation and returns the standard route callback shape. */
    invoke: function (operation, request, callback) {
        request.cmsDesigner = request.httpRequest && request.httpRequest.body || request.cmsDesigner || {};
        let promise = FACADE.DefaultCmsDesignerCompositionFacade.invoke(operation, request);
        if (!callback) return promise;
        promise.then(result => callback(null, result)).catch(callback);
    },

    /** Returns the client-safe designer authoring model. */
    getAuthoringModel: function (request, callback) { return this.invoke('getAuthoringModel', request, callback); },

    /** Validates one complete draft composition. */
    validateDraftComposition: function (request, callback) { return this.invoke('validateDraftComposition', request, callback); },

    /** Saves one complete draft composition. */
    saveDraftComposition: function (request, callback) { return this.invoke('saveDraftComposition', request, callback); },

    /** Adds one page section/component placement. */
    addSection: function (request, callback) { return this.invoke('addSection', request, callback); },

    /** Updates one page section/component placement. */
    updateSection: function (request, callback) { return this.invoke('updateSection', request, callback); },

    /** Deletes one page section/component placement. */
    deleteSection: function (request, callback) { return this.invoke('deleteSection', request, callback); },

    /** Reorders one page section/component placement. */
    reorderSection: function (request, callback) { return this.invoke('reorderSection', request, callback); },

    /** Adds one component. */
    addComponent: function (request, callback) { return this.invoke('addComponent', request, callback); },

    /** Updates one component. */
    updateComponent: function (request, callback) { return this.invoke('updateComponent', request, callback); },

    /** Deletes one component. */
    deleteComponent: function (request, callback) { return this.invoke('deleteComponent', request, callback); },

    /** Reorders one component placement. */
    reorderComponent: function (request, callback) { return this.invoke('reorderComponent', request, callback); },

    /** Associates one media reference with one component. */
    associateMedia: function (request, callback) { return this.invoke('associateMedia', request, callback); },

    /** Detaches one media association from one component. */
    detachMedia: function (request, callback) { return this.invoke('detachMedia', request, callback); },

    /** Assigns one page route. */
    assignRoute: function (request, callback) { return this.invoke('assignRoute', request, callback); },

    /** Assigns one navigation node. */
    assignNavigation: function (request, callback) { return this.invoke('assignNavigation', request, callback); },

    /** Validates whether a draft is ready to enter publication governance. */
    validatePublishReadiness: function (request, callback) { return this.invoke('validatePublishReadiness', request, callback); },

    /** Submits a saved Page Designer draft route to CMS/nPublish governance. */
    submitForPublication: function (request, callback) { return this.invoke('submitForPublication', request, callback); }
};
