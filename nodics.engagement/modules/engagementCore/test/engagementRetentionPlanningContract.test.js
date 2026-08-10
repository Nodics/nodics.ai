/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
'use strict';
const assert = require('assert');
const retention = require('../src/service/defaultEngagementRetentionPlanningService');
const records = [
    { code: 'f1', tenant: 't1', closedAt: '2025-01-01T00:00:00Z' },
    { code: 'f2', tenant: 't1', closedAt: '2025-01-01T00:00:00Z', legalHold: true },
    { code: 'f3', tenant: 't1', closedAt: '2026-08-01T00:00:00Z' }
];
let plan = retention.plan(records, { tenant: 't1', domainType: 'FEEDBACK', correlationId: 'retention-1', now: '2026-08-10T00:00:00Z', retentionDays: 365, maximumBatchSize: 2 }, { legalHoldOverridesExpiry: true });
assert.strictEqual(plan.mode, 'DRY_RUN'); assert.strictEqual(plan.commands.length, 0); assert.strictEqual(plan.nextCursor, 2); assert.strictEqual(plan.decisions[0].eligible, true); assert.strictEqual(plan.decisions[1].decision, 'SKIP_LEGAL_HOLD');
plan = retention.plan(records, { tenant: 't1', domainType: 'FEEDBACK', correlationId: 'retention-1', now: '2026-08-10T00:00:00Z', retentionDays: 365, maximumBatchSize: 2, approved: true, actorId: 'retention-cron', purpose: 'policy expiry' }, { legalHoldOverridesExpiry: true });
assert.strictEqual(plan.mode, 'EXECUTE_OWNER_COMMANDS'); assert.strictEqual(plan.commands.length, 1); assert.strictEqual(plan.commands[0].operation, 'ANONYMIZE'); assert.strictEqual(plan.hardDeleteAllowed, false);
console.log('Engagement Cron-triggerable retention planning contract passed');
