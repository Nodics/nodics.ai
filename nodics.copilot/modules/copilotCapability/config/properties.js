/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module copilotCapability/config/properties
 * @description Defines generated configurable defaults for copilotCapability.
 * @layer config
 * @owner generated
 * @override Project, environment, server, node, tenant, or customer layers may override these defaults through Nodics configuration layering.
 */
module.exports = {
    copilot: { capability: { maximumRows: 10000, maximumModuleRows: 500, allowedExportFormats: ['csv', 'xlsx', 'text'], mutationToolsEnabled: false } }
};
