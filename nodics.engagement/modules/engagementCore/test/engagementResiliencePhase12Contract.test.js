/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
'use strict';
const assert = require('assert');
const service = require('../src/service/defaultEngagementResilienceService');
const policy = { defaultRegion: 'ae', allowedRegions: ['ae'], maximumPageSize: 100, maximumInFlightDeliveries: 2, maximumDeliveryAttempts: 3, baseRetryMilliseconds: 1000, maximumRetryMilliseconds: 5000, webhook: { signatureAlgorithm: 'sha256', replayWindowSeconds: 300 }, compatibility: { supportedMajorVersions: [1], minimumDeprecationDays: 180 } };
assert.strictEqual(service.page({ limit: 1000 }, policy).limit, 100);
assert.throws(() => service.assertRegion('eu', policy), /residency/);
let signature = service.sign({ code: 'e1' }, 1000, 'secret', policy); assert.strictEqual(service.verify({ code: 'e1' }, 1000, signature, 'secret', 2000, policy), true); assert.strictEqual(service.verify({ code: 'e1' }, 1000, signature, 'secret', 999999, policy), false);
assert.strictEqual(service.capacity(2, policy).status, 'BACKPRESSURE'); assert.strictEqual(service.retry(0, 1000, policy).nextAttemptAt.toISOString(), new Date(2000).toISOString()); assert.strictEqual(service.retry(2, 1000, policy).status, 'DEAD_LETTER');
let checkpoint = service.checkpoint({ tenant: 't1', workloadCode: 'projection', partitionKey: 'p1', cursor: 'c1', sourceHash: 'h1', startedAt: new Date(0) }, policy); assert.strictEqual(checkpoint.region, 'ae');
assert.strictEqual(service.compatibility({ tenant: 't1', contractType: 'API', contractCode: 'reviews', version: '1.2.0', evidence: {}, correlationId: 'c1' }, policy).compatibility, 'CURRENT');
assert.throws(() => service.compatibility({ version: '1.0.0', deprecatedAt: '2026-01-01', sunsetAt: '2026-02-01' }, policy), /deprecation window/);
console.log('Engagement enterprise resilience Phase 12 contract validated');
