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
    // Inert inventory; an allowed local server must explicitly select this capability.
    localResetProvider: {
        "contributions": {
            "cronjob": {
                "serviceNames": {
                    "DefaultCronJobLogService": true,
                    "DefaultCronJobService": true
                }
            }
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
        scheduleDrafts: {
            enabled: false,
            activationEnabled: false,
            targets: [],
            lifecyclePresentation: {
                title: 'Schedule control', code: 'Existing job code', inspect: 'Inspect schedule',
                activate: 'Review activation', deactivate: 'Review deactivation',
                confirm: 'I confirm the reviewed schedule change', execute: 'Apply change',
                reconcile: 'Reconcile original command', reference: 'Review reference',
                ACTIVE: 'Schedule is active on this execution node.',
                INACTIVE: 'Schedule is inactive. A callback already in progress may still finish.',
                SAVED_INACTIVE: 'Draft is saved and has no lifecycle command.',
                OUTCOME_UNKNOWN: 'The command outcome is unconfirmed. Inspect or reconcile its original evidence.',
                failed: 'Current schedule evidence is unavailable. No command was retried.',
            },
            presentation: {
                title: 'Schedule drafts',
                empty: 'No approved schedule targets are available.',
                code: 'Job code',
                name: 'Name',
                target: 'Approved target',
                expression: 'Approved timing',
                trigger: 'Process trigger',
                node: 'Execution node',
                review: 'Review draft',
                reference: 'Review reference',
                confirm: 'I confirm this inactive schedule draft',
                save: 'Save inactive draft',
                inspect: 'Inspect original save',
                saved: 'Inactive draft saved. No job has been started.',
                unknown: 'Save outcome is uncertain. Inspect the original save before taking further action.',
                reviewFailed: 'Draft could not be reviewed. Check the selected target and current access.',
                inspectionFailed: 'The original save could not be confirmed. No retry was performed.',
            },
        },
    },

    defaultErrorCodes: {
        CronJobError: 'ERR_JOB_00000'
    }
};
