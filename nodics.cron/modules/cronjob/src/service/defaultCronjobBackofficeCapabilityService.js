/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module cronjob/service/DefaultCronjobBackofficeCapabilityService @description Publishes the concrete cronjob-owned BackOffice capability projection. @layer service @owner cronjob */
const capability = {
    "enabled": true,
    "capabilityId": "job-scheduling",
    "displayName": "Cron Jobs",
    "category": "operations",
    "icon": "schedule",
    "contractVersion": 1,
    "minimumClientContractVersion": 1,
    "roles": [
        "FUNCTIONAL_CAPABILITY_PROVIDER"
    ],
    "discovery": {
        "openApiPath": "/nodics/system/v0/contract/openapi/internal",
        "contractVersion": 1
    },
    "requiredPermissions": [
        "cronjob.backoffice.view"
    ],
    "navigation": [
        {
            "id": "cronjob",
            "label": "Cron Job Management",
            "route": "/cron",
            "icon": "cronjob",
            "order": 1530,
            "group": {
                "id": "process-and-automations",
                "label": "Process and Automations",
                "order": 1500
            },
            "perspectives": [
                "operations"
            ],
            "contexts": [
                "environment",
                "tenant"
            ],
            "featureState": "ACTIVE",
            "requiredPermissions": [
                "cronjob.backoffice.view"
            ]
        },
        {
            "id": "job-triggers",
            "parentId": "triggers-relationships",
            "parentModuleName": "flowCore",
            "label": "Scheduled triggers",
            "route": "/cron/triggers",
            "icon": "cronjob",
            "order": 540,
            "group": {
                "id": "process-and-automations",
                "label": "Process and Automations",
                "order": 1500
            },
            "perspectives": [
                "operations"
            ],
            "contexts": [
                "environment",
                "tenant"
            ],
            "featureState": "PREVIEW",
            "requiredPermissions": [
                "cronjob.backoffice.view"
            ]
        }
    ]
};

module.exports = {
    /** Registers this module BackOffice capability provider. */
    init: function () {
        SERVICE.DefaultModuleRegistrationAgentService.registerBackofficeCapabilityProvider('cronjob', this);
        return Promise.resolve(true);
    },
    /** Completes provider lifecycle initialization. */
    postInit: function () { return Promise.resolve(true); },
    /** Returns this module owned BackOffice capability contract. */
    getCapability: function () { return JSON.parse(JSON.stringify(capability)); }
};
