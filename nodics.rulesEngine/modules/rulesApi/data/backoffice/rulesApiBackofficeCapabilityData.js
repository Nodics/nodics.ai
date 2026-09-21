/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module rulesApi/data/backoffice/rulesApiBackofficeCapabilityData @description Rules Engine navigation and native workspace metadata owned by rulesApi. @layer data @owner rulesApi */
module.exports = {
    capability: {
        capabilityId: 'business-rules',
        displayName: 'Business Rules',
        category: 'operations',
        icon: 'workflow',
        requiredPermissions: ['rules.backoffice.view'],
        discovery: {
            openApiPath: '/nodics/system/v0/contract/openapi/internal',
            contractVersion: 0
        }
    },
    defaults: {
        icon: 'workflow',
        permission: 'rules.backoffice.view',
        perspectives: ['operations','business'],
        contexts: ['environment','tenant','enterprise'],
        featureState: 'PREVIEW'
    },
    navigation: [
        {
            id: 'business-rules',
            label: 'Business Rules',
            route: '/rules',
            order: 1570,
            group: { id: 'process-and-automations', label: 'Process and Automations', order: 1500 },
            backendWorkspace: {
                contractVersion: 1,
                renderer: 'axis.workspace.native',
                workspaceCode: 'rules.policy',
                viewCode: 'rules.overview',
                title: 'Business Rules'
            },
            summary: 'Create, simulate, review and govern versioned business rule policies without executable expressions.'
        },
        {
            id: 'business-rule-definitions',
            parentId: 'business-rules',
            label: 'Rule Definitions',
            route: '/rules/definitions',
            order: 10,
            backendWorkspace: {
                contractVersion: 1,
                renderer: 'axis.workspace.native',
                workspaceCode: 'rules.policy',
                viewCode: 'rules.definitions',
                title: 'Rule Definitions'
            },
            summary: 'Manage governed rule definitions and immutable versions.'
        }
    ]
};
