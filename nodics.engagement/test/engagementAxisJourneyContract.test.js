/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';
const assert = require('assert');
const navigation = [
    require('../modules/engagementCore/src/service/defaultEngagementCoreBackofficeCapabilityService').getCapability(),
    require('../modules/contactSubmission/src/service/defaultContactSubmissionBackofficeCapabilityService').getCapability(),
    require('../modules/testimonial/src/service/defaultTestimonialBackofficeCapabilityService').getCapability(),
    require('../modules/customerReview/src/service/defaultCustomerReviewBackofficeCapabilityService').getCapability(),
    require('../modules/customerFeedback/src/service/defaultCustomerFeedbackBackofficeCapabilityService').getCapability()
].flatMap(capability => capability.navigation).sort((left, right) => left.order - right.order);
const byId = id => navigation.find(item => item.id === id);
const expected = {
    'contact-submissions': ['ATTEMPT_CONTACT', 'REQUEST_INFORMATION', 'RESOLVE', 'CLOSE', 'REOPEN'],
    'customer-reviews': ['APPROVE', 'QUARANTINE', 'REJECT', 'RESTORE'],
    'testimonial-publications': ['EMERGENCY_HIDE', 'RECONCILE'],
    'customer-feedback': ['TRIAGE', 'ASSIGN', 'START', 'RESOLVE', 'CONFIRM', 'REOPEN'],
    'contact-handoffs': ['retry', 'reconcile']
};

Object.entries(expected).forEach(([id, operations]) => {
    const item = byId(id);
    assert(item, `${id} must be available in the Engagement business journey`);
    assert(item.workbenchTarget, `${id} must resolve a backend-owned workbench contract`);
    assert(item.help && item.help.summary, `${id} must provide beginner-safe journey guidance`);
    const routes = (item.lifecycleActions || []).map(action => action.operationRoute);
    operations.forEach(operation => assert(routes.some(route => route.includes(operation)), `${id} must expose ${operation}`));
});

assert(byId('customer-engagement'), 'Engagement must retain one clean parent journey');
assert(navigation.filter(item => item.id === 'customer-engagement').length === 1, 'Engagement must not duplicate its parent journey');
console.log('Engagement Axis journey contract validated');
