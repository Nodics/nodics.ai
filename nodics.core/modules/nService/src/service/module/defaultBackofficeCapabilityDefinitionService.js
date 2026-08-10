/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nService/service/module/DefaultBackofficeCapabilityDefinitionService
 * @description Provides bounded constructors for concrete module-owned BackOffice capability projections sent through runtime registration.
 * @layer service
 * @owner nService
 * @override Projects may extend safe optional fields while preserving non-executable registration metadata.
 */
module.exports = {
    /** Initializes the shared capability definition service. */
    init: function () { return Promise.resolve(true); },
    /** Completes shared capability definition lifecycle initialization. */
    postInit: function () { return Promise.resolve(true); },

    /** Creates one standard functional capability envelope. */
    capability: function (options) {
        return {
            enabled: options.enabled !== false,
            capabilityId: options.capabilityId,
            displayName: options.displayName,
            category: options.category,
            icon: options.icon,
            contractVersion: options.contractVersion || 1,
            minimumClientContractVersion: options.minimumClientContractVersion || 1,
            roles: options.roles || ['FUNCTIONAL_CAPABILITY_PROVIDER'],
            navigation: options.navigation || []
        };
    },

    /** Creates one schema-workbench navigation contribution owned by a concrete module. */
    workbench: function (options) {
        let item = {
            id: options.id,
            label: options.label,
            route: options.route,
            icon: options.icon || 'commerce',
            order: options.order,
            perspectives: options.perspectives || ['business', 'operations'],
            contexts: options.contexts || ['environment', 'tenant', 'enterprise'],
            featureState: options.featureState || 'ACTIVE',
            requiredPermissions: [options.permission],
            workbenchTarget: { moduleName: options.moduleName, schemaName: options.schemaName },
            workbenchPresentation: options.presentation || {
                defaultColumns: ['code', 'status', 'revision'],
                hiddenFields: ['evidence', 'idempotencyKey', 'correlationId']
            },
            help: { summary: options.summary }
        };
        if (options.parentId) item.parentId = options.parentId;
        if (options.parentModuleName) item.parentModuleName = options.parentModuleName;
        if (options.group) item.group = options.group;
        if (options.lifecycleActions) item.lifecycleActions = options.lifecycleActions;
        return item;
    }
};
