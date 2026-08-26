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
    init: function () { return Promise.resolve(true); },
    postInit: function () { return Promise.resolve(true); },

    info: request => service().info(request),
    operations: request => service().operations(request),
    workspaceStatus: request => service().workspaceStatus(request),
    workspaceInventory: request => service().workspaceInventory(request),
    workspacePreflight: request => service().workspacePreflight(request),
    setupPlan: request => service().setupPlan(request),
    evidenceRead: request => service().evidenceRead(request)
};
