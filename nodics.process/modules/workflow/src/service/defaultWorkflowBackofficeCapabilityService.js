/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module workflow/service/DefaultWorkflowBackofficeCapabilityService @description Publishes the concrete workflow-owned BackOffice capability projection. @layer service @owner workflow */
const capability = {
    "enabled": true,
    "capabilityId": "business-process-workflow",
    "displayName": "Business Processes and Workflows",
    "category": "operations",
    "icon": "workflow",
    "contractVersion": 0,
    "minimumClientContractVersion": 0,
    "roles": [
        "FUNCTIONAL_CAPABILITY_PROVIDER"
    ],
    "discovery": {
        "openApiPath": "/nodics/system/v0/contract/openapi/internal",
        "contractVersion": 0
    },
    "requiredPermissions": [
        "process.backoffice.view"
    ],
    "documentation": [],
    "navigation": [
        {
            "id": "process-workflows",
            "label": "Operations Workspace",
            "route": "/process",
            "icon": "workflow",
            "order": 1500,
            "group": {
                "id": "process-and-automations",
                "label": "Process and Automations",
                "order": 1500
            },
            "perspectives": [
                "operations",
                "process"
            ],
            "contexts": [
                "environment",
                "tenant",
                "enterprise"
            ],
            "help": {
                "summary": "Review pending workflow tasks, running workflows, failed pipeline executions, upcoming or failed cron jobs, incidents, retries, SLA warnings, and operational exceptions.",
                "documentationRoute": "/docs/capabilities/process-workflow/process-workflow-model",
                "documentationFragment": "business-process-governance"
            },
            "featureState": "PREVIEW",
            "requiredPermissions": [
                "process.backoffice.view"
            ]
        },
        {
            "id": "workflow-management",
            "label": "Workflow Management",
            "route": "/process/workflows",
            "icon": "workflow",
            "order": 1510,
            "group": {
                "id": "process-and-automations",
                "label": "Process and Automations",
                "order": 1500
            },
            "perspectives": [
                "operations",
                "process"
            ],
            "contexts": [
                "environment",
                "tenant",
                "enterprise"
            ],
            "help": {
                "summary": "Manage tasks, approvals, workflow definitions, instances, designer, versions, activation, assignments, incidents, recovery, and audit.",
                "documentationRoute": "/docs/capabilities/process-workflow/process-workflow-model",
                "documentationFragment": "workflow-management"
            },
            "featureState": "PREVIEW",
            "requiredPermissions": [
                "process.backoffice.view"
            ]
        },
        {
            "id": "pipeline-management",
            "label": "Pipeline Management",
            "route": "/process/pipelines",
            "icon": "workflow",
            "order": 1520,
            "group": {
                "id": "process-and-automations",
                "label": "Process and Automations",
                "order": 1500
            },
            "perspectives": [
                "operations",
                "process"
            ],
            "contexts": [
                "environment",
                "tenant",
                "enterprise"
            ],
            "help": {
                "summary": "Planned pipeline workspace for definitions, designer, executions, stages, processors, validation, transformation, versions, failures, recovery, and audit.",
                "documentationRoute": "/docs/framework/process/runtime-lifecycle",
                "documentationFragment": "pipeline-management"
            },
            "featureState": "DISABLED",
            "requiredPermissions": [
                "process.backoffice.view"
            ]
        },
        {
            "id": "triggers-relationships",
            "label": "Triggers and Relationships",
            "route": "/process/triggers",
            "icon": "cronjob",
            "order": 1540,
            "group": {
                "id": "process-and-automations",
                "label": "Process and Automations",
                "order": 1500
            },
            "perspectives": [
                "operations",
                "process"
            ],
            "contexts": [
                "environment",
                "tenant",
                "enterprise"
            ],
            "help": {
                "summary": "Connect manual, event, and scheduled triggers to workflows, pipelines, and domain operations without transferring ownership.",
                "documentationRoute": "/docs/framework/process/runtime-lifecycle",
                "documentationFragment": "scheduled-trigger-relationships"
            },
            "featureState": "PREVIEW",
            "requiredPermissions": [
                "process.backoffice.view"
            ]
        },
        {
            "id": "automation-monitoring",
            "label": "Automation Monitoring",
            "route": "/process/monitoring",
            "icon": "health",
            "order": 1550,
            "group": {
                "id": "process-and-automations",
                "label": "Process and Automations",
                "order": 1500
            },
            "perspectives": [
                "operations",
                "process"
            ],
            "contexts": [
                "environment",
                "tenant",
                "enterprise"
            ],
            "help": {
                "summary": "Planned cross-engine monitoring for activity, queues, waiting work, duration, throughput, failures, retries, incidents, dead letters, and correlated executions.",
                "documentationRoute": "/docs/framework/process/runtime-lifecycle",
                "documentationFragment": "automation-monitoring"
            },
            "featureState": "DISABLED",
            "requiredPermissions": [
                "process.backoffice.view"
            ]
        },
        {
            "id": "automation-advanced-configuration",
            "label": "Advanced Configuration",
            "route": "/process/advanced-configuration",
            "icon": "settings",
            "order": 1560,
            "group": {
                "id": "process-and-automations",
                "label": "Process and Automations",
                "order": 1500
            },
            "perspectives": [
                "operations",
                "process"
            ],
            "contexts": [
                "environment",
                "tenant",
                "enterprise"
            ],
            "help": {
                "summary": "Planned governed adapters, policies, retry limits, execution boundaries, retention, and diagnostics with no secrets or executable code.",
                "documentationRoute": "/docs/framework/process/runtime-lifecycle",
                "documentationFragment": "automation-advanced-configuration"
            },
            "featureState": "DISABLED",
            "requiredPermissions": [
                "process.backoffice.view"
            ]
        },
        {
            "id": "process-definitions",
            "parentId": "workflow-management",
            "label": "Process Definitions",
            "route": "/process/definitions",
            "icon": "schema",
            "order": 510,
            "group": {
                "id": "process-and-automations",
                "label": "Process and Automations",
                "order": 1500
            },
            "perspectives": [
                "operations",
                "process"
            ],
            "contexts": [
                "environment",
                "tenant",
                "enterprise"
            ],
            "help": {
                "summary": "Create, update, version, deactivate, and archive governed process definitions after process APIs are active.",
                "documentationRoute": "/docs/capabilities/process-workflow/process-workflow-model",
                "documentationFragment": "process-definitions"
            },
            "featureState": "PREVIEW",
            "requiredPermissions": [
                "process.backoffice.view"
            ]
        },
        {
            "id": "process-tasks",
            "parentId": "workflow-management",
            "label": "My Tasks and Approvals",
            "route": "/process/tasks",
            "icon": "tasks",
            "order": 520,
            "group": {
                "id": "process-and-automations",
                "label": "Process and Automations",
                "order": 1500
            },
            "perspectives": [
                "operations",
                "process"
            ],
            "contexts": [
                "environment",
                "tenant",
                "enterprise"
            ],
            "help": {
                "summary": "Review human tasks, assignments, escalations, approvals, and handoffs created by governed workflow instances.",
                "documentationRoute": "/docs/capabilities/process-workflow/process-workflow-model",
                "documentationFragment": "tasks-and-approvals"
            },
            "featureState": "PREVIEW",
            "requiredPermissions": [
                "process.backoffice.view"
            ]
        },
        {
            "id": "process-triggers",
            "parentId": "triggers-relationships",
            "label": "Manual, Event, and Scheduled Triggers",
            "route": "/process/triggers",
            "icon": "cronjob",
            "order": 530,
            "group": {
                "id": "process-and-automations",
                "label": "Process and Automations",
                "order": 1500
            },
            "perspectives": [
                "operations",
                "process"
            ],
            "contexts": [
                "environment",
                "tenant",
                "enterprise"
            ],
            "help": {
                "summary": "Create and manage Process-owned trigger relationships while Cron continues to own job execution.",
                "documentationRoute": "/docs/framework/process/runtime-lifecycle",
                "documentationFragment": "scheduled-trigger-relationships"
            },
            "featureState": "PREVIEW",
            "requiredPermissions": [
                "process.backoffice.view"
            ]
        },
        {
            "id": "process-designer",
            "parentId": "workflow-management",
            "label": "Process Designer",
            "route": "/process/designer",
            "icon": "design",
            "order": 540,
            "group": {
                "id": "process-and-automations",
                "label": "Process and Automations",
                "order": 1500
            },
            "perspectives": [
                "operations",
                "process"
            ],
            "contexts": [
                "environment",
                "tenant",
                "enterprise"
            ],
            "help": {
                "summary": "Preview and edit backend-owned draft workflow graph metadata before validation and publishing.",
                "documentationRoute": "/docs/framework/process/visual-designer",
                "documentationFragment": "visual-workflow-designer-contract"
            },
            "featureState": "PREVIEW",
            "requiredPermissions": [
                "process.backoffice.view"
            ]
        }
    ]
};

module.exports = {
    /** Registers this module BackOffice capability provider. */
    init: function () {
        SERVICE.DefaultModuleRegistrationAgentService.registerBackofficeCapabilityProvider('workflow', this);
        return Promise.resolve(true);
    },
    /** Completes provider lifecycle initialization. */
    postInit: function () { return Promise.resolve(true); },
    /** Returns this module owned BackOffice capability contract. */
    getCapability: function () { return JSON.parse(JSON.stringify(capability)); }
};
