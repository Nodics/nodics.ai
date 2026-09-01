/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module wasteSubmission/test/wasteSubmissionLifecycleContract @description Verifies submission lifecycle transitions remain separate from receipt and impact. @layer test @owner wasteSubmission */
const assert = require('assert');
const lifecycle = require('../src/service/defaultWasteSubmissionLifecycleService');

let submission = { code: 'ws-001', submissionStatus: 'DRAFT', revision: 0, tenant: 'runtimeTenantFromToken', enterpriseCode: 'shouldNotPersist' };
let submitted = lifecycle.transition(submission, 'SUBMITTED', { correlationId: 'corr-001', idempotencyKey: 'submit-001', now: new Date('2026-09-01T10:00:00.000Z') });
assert.strictEqual(submitted.submissionStatus, 'SUBMITTED');
assert.strictEqual(submitted.revision, 1);
assert.strictEqual(submitted.correlationId, 'corr-001');
assert.strictEqual(submitted.tenant, undefined);
assert.strictEqual(submitted.enterpriseCode, undefined);

let approved = lifecycle.transition(submitted, 'APPROVED', { correlationId: 'corr-002', idempotencyKey: 'approve-001' });
assert.strictEqual(approved.submissionStatus, 'APPROVED');
assert.throws(function () { lifecycle.transition(approved, 'RECEIVED', {}); }, /target status is not a submission lifecycle status/);
assert.throws(function () { lifecycle.transition(approved, 'IMPACT_CALCULATED', {}); }, /target status is not a submission lifecycle status/);

let confirmed = lifecycle.confirmFacts({ code: 'ws-002', submissionStatus: 'AWAITING_SUBMITTER_CONFIRMATION', revision: 3 }, { categoryCode: 'PHONE' }, { idempotencyKey: 'confirm-001' });
assert.strictEqual(confirmed.submissionStatus, 'SUBMITTED');
assert.deepStrictEqual(confirmed.confirmedFacts, { categoryCode: 'PHONE' });

console.log('Waste submission lifecycle contract validated');
