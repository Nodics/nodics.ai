/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/**
 * @module cms/controller/defaultCmsDocumentationGovernanceController
 * @description Maps secured Axis documentation management HTTP requests to CMS-owned documentation governance operations.
 * @layer controller
 * @owner cms
 * @override Preserve request projection, permissions, and CMS-owned authoring semantics for all documentation management routes.
 */
module.exports = {
    /** Initializes the documentation governance controller lifecycle. */
    init: function () { return Promise.resolve(true); },

    /** Completes documentation governance controller startup. */
    postInit: function () { return Promise.resolve(true); },

    /** Invokes one documentation governance facade operation and supports route callbacks. */
    invoke: function (operation, request, callback) {
        request.documentation = request.httpRequest && request.httpRequest.body || request.documentation || {};
        const promise = FACADE.DefaultCmsDocumentationGovernanceFacade.invoke(operation, request);
        if (!callback) return promise;
        Promise.resolve(promise).then(result => callback(null, result)).catch(callback);
    },

    /** Returns the Axis-facing documentation authoring workspace model. */
    authoringModel: function (request, callback) { return this.invoke('authoringModel', request, callback); },

    /** Validates Axis-authored documentation records before staging or publishing. */
    validateAuthoringRecords: function (request, callback) { return this.invoke('validateAuthoringRecords', request, callback); },

    /** Projects documentation for Axis or Nexus rendering with access filtering. */
    renderProjection: function (request, callback) { return this.invoke('renderProjection', request, callback); },

    /** Searches documentation metadata with lifecycle and access filtering. */
    search: function (request, callback) { return this.invoke('search', request, callback); },

    /** Builds the nPublish handoff request for documentation publication. */
    publicationHandoff: function (request, callback) { return this.invoke('publicationHandoff', request, callback); },

    /** Builds the migration plan from generated seed records into Axis-managed records. */
    migrationPlan: function (request, callback) { return this.invoke('migrationPlan', request, callback); }
};
