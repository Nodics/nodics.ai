/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module media/data/init-v001/jobs/mediaCleanupRetentionJobData
 * @description Contributes the Media-owned passive retention cleanup job for Cron execution.
 * @layer module-data
 * @owner media
 * @override Projects may override cadence, retention batch size, or approval policy through later data releases.
 */
module.exports = {
    record1: {
        code: 'mediaCleanupRetentionJob',
        name: 'Media Cleanup Retention Job',
        description: 'Runs approved passive-retention cleanup for generic media artifacts across content, product, import, export, and custom media owners.',
        runOnNode: 'node0',
        runOnInit: false,
        active: true,
        logResult: true,
        jobDetail: {
            internal: {
                nodeId: 'node0',
                module: 'media',
                method: 'POST',
                uri: '/cleanup/retention/run',
                body: { batchSize: 100, source: 'cronjob' },
                timeoutMs: 60000
            }
        },
        trigger: { expression: '0 0 */6 * * *' },
        emails: [{ email: 'nodics.framework@nodics.com' }],
        start: new Date('2026-01-01T00:00:00.000Z'),
        priority: 910,
        status: 'NEW',
        state: 'NEW'
    }
};
