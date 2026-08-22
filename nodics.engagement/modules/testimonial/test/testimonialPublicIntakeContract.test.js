/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
const assert = require('assert');
const policy = require('../src/service/defaultTestimonialPolicyService');
const api = require('../src/service/defaultTestimonialOperationService');
let savedCandidate;
global.SERVICE = {
    DefaultTestimonialPolicyService: policy,
    DefaultTestimonialRepositoryService: {
        save: async function (type, tenant, value) {
            savedCandidate = Object.assign({ code: 'candidate-001' }, value);
            assert.strictEqual(type, 'testimonialCandidate');
            assert.strictEqual(tenant, 't1');
            return savedCandidate;
        }
    }
};

api.submitCandidate({
    tenant: 't1',
    correlationId: 'corr-public-testimonial',
    payload: {
        name: 'Aarohi Mehta',
        email: 'aarohi@example.test',
        company: 'Example Retail',
        role: 'Head of Commerce',
        testimonial: 'Nodics helped us see a safer way to move from MVP to governed enterprise delivery.'
    }
}).then(result => {
    assert.strictEqual(result.referenceCode, 'candidate-001');
    assert.strictEqual(result.status, 'CANDIDATE');
    assert.strictEqual(result.verificationRequired, true);
    assert.strictEqual(savedCandidate.sourceType, 'DIRECT');
    assert.strictEqual(savedCandidate.sourceModule, 'engagementApi');
    assert.strictEqual(savedCandidate.status, 'CANDIDATE');
    assert.strictEqual(savedCandidate.originalText, 'Nodics helped us see a safer way to move from MVP to governed enterprise delivery.');
    assert(savedCandidate.ownerId.startsWith('public:'));
    assert(!('publicText' in savedCandidate));
    console.log('testimonial public intake contract validated');
}).catch(error => {
    console.error(error);
    process.exitCode = 1;
});
