/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
'use strict';
const assert = require('assert');
const metrics = require('../src/service/defaultCustomerFeedbackMetricsService');
const feedback = [
    { code: 'f1', scores: { NPS: 10, CSAT: 5, CES: 4 }, status: 'CLOSED', submittedAt: '2026-07-01T00:00:00Z' },
    { code: 'f2', scores: { NPS: 8, CSAT: 4, CES: 3 }, status: 'RESOLVED', submittedAt: '2026-07-02T00:00:00Z' },
    { code: 'f3', scores: { NPS: 4, CSAT: 3, CES: 2 }, status: 'IN_PROGRESS', submittedAt: '2026-08-01T00:00:00Z' }
];
assert.deepStrictEqual(metrics.calculate(feedback, 'NPS'), { metric: 'NPS', value: 0, responseCount: 3, promoters: 1, detractors: 1, passives: 1, scale: '0-10' });
assert.strictEqual(metrics.calculate(feedback, 'CSAT').value, 4);
assert.strictEqual(metrics.calculate(feedback, 'CES').value, 3);
assert.deepStrictEqual(metrics.trend(feedback, 'NPS').map(item => item.period), ['2026-07', '2026-08']);
assert.deepStrictEqual(metrics.operations(feedback), { total: 3, terminal: 2, open: 1, overdue: 0 });
assert.strictEqual(metrics.calculate([], 'NPS').reason, 'NO_RESPONSES');
assert.throws(() => metrics.calculate([{ scores: { CSAT: 6 } }], 'CSAT'), /outside the declared scale/u);
console.log('Customer feedback NPS, CSAT, CES, trend, and operations metrics passed');
