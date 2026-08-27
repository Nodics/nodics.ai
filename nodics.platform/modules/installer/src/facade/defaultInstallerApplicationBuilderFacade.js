/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

const fallbackService = require('../service/defaultInstallerApplicationBuilderService');

/**
 * @module installer/facade/DefaultInstallerApplicationBuilderFacade
 * @description Delegates current installer API requests to the read-only Application Builder service.
 * @layer facade
 * @owner installer
 * @override Add mutating facade operations only after idempotency, audit, allowlist, and rollback contracts are implemented.
 */
module.exports = {
    /** Initializes the facade lifecycle boundary. */
    init: function () { return Promise.resolve(true); },
    /** Completes post-initialization for the facade lifecycle boundary. */
    postInit: function () { return Promise.resolve(true); },

    /** Resolves the runtime Application Builder service with a local fallback for isolated tests. */
    service: function () {
        return global.SERVICE && SERVICE.DefaultInstallerApplicationBuilderService ||
            fallbackService;
    },

    /** Delegates installer metadata lookup to the service. */
    info: function (request) { return this.service().info(request); },
    /** Delegates installer operation listing to the service. */
    operations: function (request) { return this.service().operations(request); },
    /** Delegates workspace status lookup to the service. */
    workspaceStatus: function (request) { return this.service().workspaceStatus(request); },
    /** Delegates workspace inventory lookup to the service. */
    workspaceInventory: function (request) { return this.service().workspaceInventory(request); },
    /** Delegates workspace preflight checks to the service. */
    workspacePreflight: function (request) { return this.service().workspacePreflight(request); },
    /** Delegates setup planning to the service. */
    setupPlan: function (request) { return this.service().setupPlan(request); },
    /** Delegates allowlisted evidence reading to the service. */
    evidenceRead: function (request) { return this.service().evidenceRead(request); }
};
