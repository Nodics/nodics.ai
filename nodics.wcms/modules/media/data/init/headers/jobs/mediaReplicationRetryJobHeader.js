/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module cms/data/init/headers/jobs/mediaReplicationRetryJobHeader
 * @description Import header for saving the media replication retry cronjob record.
 * @layer module-data
 * @owner media
 * @override Projects may contribute later headers for customer-specific scheduled media retry jobs.
 */
module.exports = {
    cronjob: {
        mediaReplicationRetryJob: {
            options: {
                enabled: true,
                schemaName: 'cronJob',
                operation: 'saveAll',
                dataFilePrefix: 'mediaReplicationRetryJobData'
            },
            query: {
                code: '$code'
            }
        }
    }
};
