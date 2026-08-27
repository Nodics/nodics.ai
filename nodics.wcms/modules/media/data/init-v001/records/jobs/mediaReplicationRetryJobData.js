/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module cms/data/init-v001/jobs/mediaReplicationRetryJobData
 * @description Contributes the Media-owned scheduled replication retry job for Cron execution.
 * @layer module-data
 * @owner media
 * @override Projects may override this job through later data releases to adjust cadence, node ownership, batch size, or activation policy.
 */
module.exports = {
    record1: {
        code: 'mediaReplicationRetryJob',
        name: 'Media Replication Retry Job',
        description: 'Retries due failed media replication obligations for content, product, import, export, and custom media owners.',
        runOnNode: 'node0',
        runOnInit: false,
        active: true,
        logResult: true,
        jobDetail: {
            internal: {
                nodeId: 'node0',
                module: 'media',
                method: 'POST',
                uri: '/publication/replication/retry-pending',
                body: {
                    batchSize: 100,
                    source: 'cronjob'
                },
                timeoutMs: 60000
            }
        },
        trigger: {
            expression: '0 */5 * * * *'
        },
        emails: [{
            email: 'nodics.framework@nodics.com'
        }],
        start: new Date('2026-01-01T00:00:00.000Z'),
        priority: 900,
        status: 'NEW',
        state: 'NEW'
    }
};
