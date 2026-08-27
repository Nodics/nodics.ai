/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
'use strict';
const assert = require('assert');
const service = require('../src/service/defaultEngagementAutomationGovernanceService');
const policy = { aiEnabled: true, policyVersion: '1', minimumConfidence: 0.75, humanReviewCapabilities: ['RESPONSE_DRAFT'], directActionAllowed: false, deterministicFallbackRequired: true, prohibitedInputFields: ['password'], evaluation: { minimumSampleSize: 25, requiredMetrics: ['accuracy', 'precision', 'recall'], maximumErrorRate: 0.1 } };
(async () => {
    let proposal = await service.propose('RESPONSE_DRAFT', { code: 'f1', revision: 2, message: 'Help' }, { tenant: 't1', domainType: 'FEEDBACK', correlationId: 'c1' }, { propose: async () => ({ output: { draft: 'We can help.' }, confidence: 0.9, providerCode: 'provider', modelReference: 'model-v1', promptVersion: 'prompt-v1' }) }, async () => ({ output: {}, confidence: 1 }), policy);
    assert.strictEqual(proposal.status, 'REVIEW_REQUIRED'); assert.strictEqual(proposal.directActionAllowed, false); assert(proposal.sourceHash); assert.strictEqual(proposal.source, 'AI');
    let reviewed = service.review(proposal, { status: 'OVERRIDDEN', output: { draft: 'A human response.' }, actorId: 'operator1', reason: 'clarity' }); assert.strictEqual(reviewed.status, 'OVERRIDDEN'); assert.strictEqual(reviewed.output.draft, 'A human response.');
    let fallback = await service.propose('CLASSIFICATION', { code: 'f2', revision: 1 }, { tenant: 't1', domainType: 'FEEDBACK' }, { propose: async () => { throw new Error('offline'); } }, async () => ({ output: { category: 'GENERAL' }, confidence: 1 }), policy); assert.strictEqual(fallback.source, 'RULE');
    let evaluation = service.evaluate({ tenant: 't1', capability: 'CLASSIFICATION', datasetReference: 'gold-v1', sampleSize: 30, metrics: { accuracy: 0.95, precision: 0.9, recall: 0.88, errorRate: 0.05 }, thresholds: { accuracy: 0.9, precision: 0.8, recall: 0.8 }, evaluatedBy: 'reviewer', correlationId: 'c2' }, policy); assert.strictEqual(evaluation.passed, true);
    assert.throws(() => service.evidence({ code: 'f3', password: 'secret' }, policy), /prohibited/);
    console.log('Engagement governed automation contract validated');
})().catch(error => { console.error(error); process.exitCode = 1; });
