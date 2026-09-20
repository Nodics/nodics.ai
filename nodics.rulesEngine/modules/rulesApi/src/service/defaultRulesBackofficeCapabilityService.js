/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module rulesApi/src/service/defaultRulesBackofficeCapabilityService @description Publishes Rules Engine BackOffice navigation and native workspace metadata for Axis discovery. @layer service @owner rulesApi */
const capability = {
    enabled: true,
    capabilityId: 'business-rules',
    displayName: 'Business Rules',
    category: 'operations',
    icon: 'workflow',
    contractVersion: 0,
    minimumClientContractVersion: 0,
    roles: ['FUNCTIONAL_CAPABILITY_PROVIDER'],
    discovery: {
        openApiPath: '/nodics/system/v0/contract/openapi/internal',
        contractVersion: 0
    },
    requiredPermissions: ['rules.backoffice.view'],
    documentation: [],
    navigation: [
        {
            id: 'business-rules',
            label: 'Business Rules',
            route: '/rules',
            icon: 'workflow',
            order: 1570,
            group: { id: 'process-and-automations', label: 'Process and Automations', order: 1500 },
            perspectives: ['operations','business'],
            contexts: ['environment','tenant','enterprise'],
            featureState: 'PREVIEW',
            requiredPermissions: ['rules.backoffice.view'],
            backendWorkspace: {
                contractVersion: 1,
                renderer: 'axis.workspace.native',
                workspaceCode: 'rules.policy',
                viewCode: 'rules.overview',
                title: 'Business Rules'
            },
            help: {
                summary: 'Create, simulate, review and govern versioned business rule policies without executable expressions.'
            }
        },
        {
            id: 'business-rule-definitions',
            parentId: 'business-rules',
            label: 'Rule Definitions',
            route: '/rules/definitions',
            icon: 'schema',
            order: 10,
            perspectives: ['operations','business'],
            contexts: ['environment','tenant','enterprise'],
            featureState: 'PREVIEW',
            requiredPermissions: ['rules.backoffice.view'],
            backendWorkspace: {
                contractVersion: 1,
                renderer: 'axis.workspace.native',
                workspaceCode: 'rules.policy',
                viewCode: 'rules.definitions',
                title: 'Rule Definitions'
            }
        }
    ]
};

module.exports = {
    init: function () {
        SERVICE.DefaultModuleRegistrationAgentService.registerBackofficeCapabilityProvider('rulesApi', this);
        return Promise.resolve(true);
    },
    postInit: function () { return Promise.resolve(true); },
    getCapability: function () { return JSON.parse(JSON.stringify(capability)); }
};
