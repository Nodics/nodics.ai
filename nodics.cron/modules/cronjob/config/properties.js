/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module cronjob/config/properties
 * @description Cronjob runtime properties for node responsibility handlers, startup activation, retry timing, and default error codes.
 * @layer config
 * @owner cronjob
 * @override Project, environment, server, or node layers may override cronjob scheduling behavior without changing framework defaults.
 */
module.exports = {
    backofficeCapabilities: {
        cronjob: {
            enabled: true, capabilityId: 'job-scheduling', displayName: 'Cron Jobs', category: 'operations', icon: 'schedule',
            contractVersion: 1, minimumClientContractVersion: 1, roles: ['FUNCTIONAL_CAPABILITY_PROVIDER'],
            discovery: { openApiPath: '/nodics/system/v0/contract/openapi/internal', contractVersion: 1 },
            requiredPermissions: ['cronjob.backoffice.view'],
            navigation: [{ id: 'cronjob', label: 'Cron jobs', route: '/cron', icon: 'cronjob', order: 530,
                group: { id: 'business-process-automation', label: 'Business Process & Automation', order: 500 },
                perspectives: ['operations'], contexts: ['environment', 'tenant'],
                featureState: 'ACTIVE', requiredPermissions: ['cronjob.backoffice.view'] },
            { id: 'job-triggers', label: 'Scheduled triggers', route: '/cron/triggers', icon: 'cronjob',
                order: 540, group: { id: 'business-process-automation', label: 'Business Process & Automation', order: 500 },
                perspectives: ['operations'], contexts: ['environment', 'tenant'],
                featureState: 'PREVIEW', requiredPermissions: ['cronjob.backoffice.view'] }]
        }
    },

    nodePingableModules: {
        cronjob: {
            enabled: false,
            nodeUpHandler: 'defaultCronJobNodeUpHandlerPipeline',
            nodeDownHandler: 'defaultCronJobNodeDownHandlerPipeline'
        }
    },

    cronjob: {
        runOnStartup: false,
        waitTime: 1000,
    },

    defaultErrorCodes: {
        CronJobError: 'ERR_JOB_00000'
    }
};
