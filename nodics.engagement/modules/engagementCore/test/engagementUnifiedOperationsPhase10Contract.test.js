/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
const assert = require('assert');
const schemas = require('../src/schemas/schemas').engagementCore;
const policy = require('../config/properties').engagementCore.unifiedOperations;
const service = require('../src/service/defaultEngagementUnifiedOperationsService');
['engagementUnifiedQueueItem', 'engagementDashboardSnapshot', 'engagementRepairCase', 'engagementExportEvidence'].forEach(name => { assert(schemas[name]); assert.strictEqual(schemas[name].router.enabled, false); });
const source = { tenant: 't1', code: 'f1', revision: 2, status: 'IN_PROGRESS', queueCode: 'support', priority: 'HIGH', dueAt: new Date('2026-08-09T00:00:00Z'), correlationId: 'corr' };
const item = service.project('FEEDBACK', source, { summary: { type: 'COMPLAINT' }, now: new Date('2026-08-10T00:00:00Z') });
assert(item.sourceHash);
assert.strictEqual(item.summary.type, 'COMPLAINT');
assert.strictEqual(service.rebuild([source], [item], value => service.project('FEEDBACK', value, { summary: { type: 'COMPLAINT' }, now: item.projectedAt })).drift.length, 0);
assert.strictEqual(service.rebuild([Object.assign({}, source, { status: 'RESOLVED' })], [item], value => service.project('FEEDBACK', value)).drift.length, 1);
const batch = service.batchPreview([item], { action: 'ASSIGN', reason: 'SLA balancing' }, policy);
assert.strictEqual(batch.directMutation, false);
assert.strictEqual(batch.commands[0].domainType, 'FEEDBACK');
assert.throws(() => service.batchPreview([item], { action: 'ASSIGN' }, policy));
const dashboard = service.dashboard('t1', 'operations', [item], { now: new Date('2026-08-10T00:00:00Z') });
assert.strictEqual(dashboard.metrics.overdue, 1);
const exported = service.exportPreview('t1', [item], { purpose: 'SLA audit', actorId: 'auditor', fields: ['domainType', 'status', 'summary'] }, policy);
assert.deepStrictEqual(exported.fields, ['domainType', 'status']);
assert.strictEqual(exported.status, 'PREVIEWED');
const repair = service.repair(item, { repairType: 'REBUILD_PROJECTION', reason: 'hash drift', actorId: 'operator' });
assert.strictEqual(repair.status, 'PREVIEWED');
console.log('Engagement unified operations contract validated');
