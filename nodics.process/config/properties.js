/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nodics.process/config/properties
 * @description Defines default process/workflow BackOffice metadata and designer policy for the Process functional module group.
 * @layer config
 * @owner nodics.process
 * @override Project, environment, server, tenant, or customer process overlays may enable APIs, designer providers, and process schemas without changing framework defaults.
 */
module.exports = {
    apiExposure: {
        categories: {
            processManagement: {
                enabled: true
            }
        }
    },
    backofficeCapabilities: {
        process: {
            enabled: true,
            capabilityId: 'business-process-workflow',
            displayName: 'Business Processes and Workflows',
            category: 'operations',
            icon: 'workflow',
            contractVersion: 1,
            minimumClientContractVersion: 1,
            roles: ['FUNCTIONAL_CAPABILITY_PROVIDER'],
            discovery: { openApiPath: '/nodics/system/v0/contract/openapi/internal', contractVersion: 1 },
            requiredPermissions: ['process.backoffice.view'],
            navigation: [
                {
                    id: 'process-workflows',
                    label: 'Business Processes',
                    route: '/process',
                    icon: 'workflow',
                    order: 500,
                    group: { id: 'automation', label: 'Process and Automation', order: 500 },
                    perspectives: ['operations', 'process'],
                    contexts: ['environment', 'tenant', 'enterprise'],
                    help: {
                        summary: 'Design, govern, publish, and monitor business process and workflow definitions owned by nodics.process.',
                        documentationRoute: '/docs/capabilities/process-workflow/process-workflow-model',
                        documentationFragment: 'business-process-governance'
                    },
                    featureState: 'PREVIEW',
                    requiredPermissions: ['process.backoffice.view']
                },
                {
                    id: 'process-definitions',
                    parentId: 'process-workflows',
                    label: 'Definitions',
                    route: '/process/definitions',
                    icon: 'schema',
                    order: 510,
                    group: { id: 'automation', label: 'Process and Automation', order: 500 },
                    perspectives: ['operations', 'process'],
                    contexts: ['environment', 'tenant', 'enterprise'],
                    help: {
                        summary: 'Create, update, version, deactivate, and archive governed process definitions after process APIs are active.',
                        documentationRoute: '/docs/capabilities/process-workflow/process-workflow-model',
                        documentationFragment: 'process-definitions'
                    },
                    featureState: 'PREVIEW',
                    requiredPermissions: ['process.backoffice.view']
                },
                {
                    id: 'process-designer',
                    parentId: 'process-workflows',
                    label: 'Visual Designer',
                    route: '/process/designer',
                    icon: 'workflow',
                    order: 520,
                    group: { id: 'automation', label: 'Process and Automation', order: 500 },
                    perspectives: ['operations', 'process'],
                    contexts: ['environment', 'tenant', 'enterprise'],
                    help: {
                        summary: 'Visually compose workflow nodes and transitions while nodics.process remains the validation and persistence authority.',
                        documentationRoute: '/docs/capabilities/process-workflow/visual-designer',
                        documentationFragment: 'axis-visual-designer'
                    },
                    featureState: 'PREVIEW',
                    requiredPermissions: ['process.backoffice.view']
                },
                {
                    id: 'process-instances',
                    parentId: 'process-workflows',
                    label: 'Instances',
                    route: '/process/instances',
                    icon: 'tasks',
                    order: 530,
                    group: { id: 'automation', label: 'Process and Automation', order: 500 },
                    perspectives: ['operations', 'process'],
                    contexts: ['environment', 'tenant', 'enterprise'],
                    help: {
                        summary: 'Inspect active and historical workflow instances, retries, pauses, failures, and audit evidence.',
                        documentationRoute: '/docs/capabilities/process-workflow/process-workflow-model',
                        documentationFragment: 'process-instances'
                    },
                    featureState: 'PREVIEW',
                    requiredPermissions: ['process.backoffice.view']
                },
                {
                    id: 'process-tasks',
                    parentId: 'process-workflows',
                    label: 'Tasks and Approvals',
                    route: '/process/tasks',
                    icon: 'tasks',
                    order: 540,
                    group: { id: 'automation', label: 'Process and Automation', order: 500 },
                    perspectives: ['operations', 'process'],
                    contexts: ['environment', 'tenant', 'enterprise'],
                    help: {
                        summary: 'Review human tasks, assignments, escalations, approvals, and handoffs created by governed workflow instances.',
                        documentationRoute: '/docs/capabilities/process-workflow/process-workflow-model',
                        documentationFragment: 'tasks-and-approvals'
                    },
                    featureState: 'PREVIEW',
                    requiredPermissions: ['process.backoffice.view']
                }
            ]
        }
    },
    process: {
        designer: {
            enabled: false,
            provider: 'NODICS_NATIVE_GRAPH',
            persistDrafts: false,
            allowBpmnImport: false,
            allowBpmnExport: false,
            maximumNodesPerDefinition: 250,
            maximumTransitionsPerDefinition: 500
        }
    }
};
