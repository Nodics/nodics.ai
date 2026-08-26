/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

const fallbackService = require('../service/defaultInstallerApplicationBuilderService');

function service() {
    return global.SERVICE && SERVICE.DefaultInstallerApplicationBuilderService ||
        fallbackService;
}

/**
 * @module installer/facade/DefaultInstallerApplicationBuilderFacade
 * @description Delegates Phase 1 installer API requests to the read-only Application Builder service.
 * @layer facade
 * @owner installer
 * @override Add mutating facade operations only after idempotency, audit, allowlist, and rollback contracts are implemented.
 */
module.exports = {
    /** Initializes the facade lifecycle boundary. */
    init: function () { return Promise.resolve(true); },
    /** Completes post-initialization for the facade lifecycle boundary. */
    postInit: function () { return Promise.resolve(true); },

    /** Delegates installer metadata lookup to the service. */
    info: request => service().info(request),
    /** Delegates installer operation listing to the service. */
    operations: request => service().operations(request),
    /** Delegates workspace status lookup to the service. */
    workspaceStatus: request => service().workspaceStatus(request),
    /** Delegates workspace inventory lookup to the service. */
    workspaceInventory: request => service().workspaceInventory(request),
    /** Delegates workspace preflight checks to the service. */
    workspacePreflight: request => service().workspacePreflight(request),
    /** Delegates setup planning to the service. */
    setupPlan: request => service().setupPlan(request),
    /** Delegates allowlisted evidence reading to the service. */
    evidenceRead: request => service().evidenceRead(request)
};
