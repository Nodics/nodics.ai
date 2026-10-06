/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module cronjob/utils/statusDefinitions
 * @description Cronjob success and error status definitions used by lifecycle APIs and scheduler services.
 * @layer utility
 * @owner cronjob
 * @override Project modules may add later status definitions for custom cronjob behavior.
 */
module.exports = {
    SUC_JOB_00000: {
        code: '200',
        message: 'Job successfully processed'
    },
    SUC_JOB_00001: {
        code: '200',
        message: 'Job partially processed'
    },
    SUC_JOB_00002: {
        code: '200',
        message: 'Jobs removed successfully'
    },

    ERR_JOB_00000: {
        code: '500',
        message: 'Job internal server error'
    },
    ERR_JOB_00001: {
        code: '501',
        message: 'Job not implemented'
    },
    ERR_JOB_00002: {
        code: '503',
        message: 'Job unavailable currently'
    },
    ERR_JOB_00003: {
        code: '400',
        message: 'Invalid job request'
    },
    ERR_JOB_00004: {
        code: '404',
        message: 'Job not found'
    },
    ERR_JOB_00005: {
        code: '400',
        message: 'Invalid job schedule, end date has already passed'
    },
    ERR_JOB_00006: {
        code: '409',
        message: 'Job is already running'
    },
    ERR_JOB_00007: {
        code: '400',
        message: 'Invalid job tenant'
    },
    ERR_JOB_00008: {
        code: '424',
        message: 'Cron process trigger execution dependency failed'
    },
    ERR_JOB_00009: {
        code: '400',
        message: 'Schedule draft or review is invalid or no longer available'
    },
    ERR_JOB_00010: {
        code: '403',
        message: 'Schedule draft access is not permitted'
    },
    ERR_JOB_00011: {
        code: '409',
        message: 'Schedule draft outcome is uncertain; inspect the original save without retrying'
    }
};
