/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module media/data/init-v001/headers/jobs/mediaCleanupRetentionJobHeader
 * @description Import header for saving the media cleanup retention cronjob record.
 * @layer module-data
 * @owner media
 * @override Projects may contribute later headers for customer-specific media cleanup retention jobs.
 */
module.exports = {
    cronjob: {
        mediaCleanupRetentionJob: {
            options: { enabled: true, schemaName: 'cronJob', operation: 'saveAll', dataFilePrefix: 'mediaCleanupRetentionJobData' },
            query: { code: '$code' }
        }
    }
};
