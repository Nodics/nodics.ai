/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module media/test/mediaReplicationCronJobContract
 * @description Validates that Media contributes a Cron-owned scheduled job for media replication retry without bypassing governed Media APIs.
 * @layer test
 * @owner media
 */

const assert = require('assert');
const manifest = require('../data/manifest.json');
const jobData = require('../data/init-v001/records/jobs/mediaReplicationRetryJobData');
const header = require('../data/init-v001/headers/jobs/mediaReplicationRetryJobHeader');

const job = jobData.record1;

assert.strictEqual(job.code, 'mediaReplicationRetryJob');
assert.strictEqual(job.active, true, 'Generic media retry job should be active when init data is installed');
assert.strictEqual(job.runOnInit, false, 'Generic media retry job must wait for its governed schedule');
assert.strictEqual(job.runOnNode, 'node0', 'Generic media retry job should be node-owned to avoid duplicate schedulers');
assert.strictEqual(job.logResult, true, 'Generic media retry job should retain execution evidence');
assert.deepStrictEqual(job.trigger, { expression: '0 */5 * * * *' });
assert.strictEqual(job.priority, 900);

assert.ok(job.jobDetail.internal, 'Generic media retry job must use Cron internal target contract');
assert.strictEqual(job.jobDetail.internal.module, 'media');
assert.strictEqual(job.jobDetail.internal.method, 'POST');
assert.strictEqual(job.jobDetail.internal.uri, '/publication/replication/retry-pending');
assert.strictEqual(job.jobDetail.internal.body.batchSize, 100);
assert.strictEqual(job.jobDetail.internal.body.source, 'cronjob');
assert.strictEqual(job.jobDetail.internal.timeoutMs, 60000);

assert.strictEqual(header.cronjob.mediaReplicationRetryJob.options.schemaName, 'cronJob');
assert.strictEqual(header.cronjob.mediaReplicationRetryJob.options.operation, 'saveAll');
assert.strictEqual(header.cronjob.mediaReplicationRetryJob.options.dataFilePrefix, 'mediaReplicationRetryJobData');
assert.deepStrictEqual(header.cronjob.mediaReplicationRetryJob.query, { code: '$code' });

assert.ok(manifest.sections.mediaReplicationRetryJob, 'Media manifest must expose the retry job section');
assert.strictEqual(manifest.sections.mediaReplicationRetryJob.owningDomain, 'media');
assert.strictEqual(manifest.sections.mediaReplicationRetryJob.destinationRole, 'CRON');
assert.strictEqual(manifest.sections.mediaReplicationRetryJob.installer, 'CRON_JOB');
assert.strictEqual(manifest.sections.mediaReplicationRetryJob.files['init-v001/records/jobs/mediaReplicationRetryJobData.js'] !== undefined, true);
assert.strictEqual(manifest.sections.mediaReplicationRetryJob.files['init-v001/headers/jobs/mediaReplicationRetryJobHeader.js'] !== undefined, true);
