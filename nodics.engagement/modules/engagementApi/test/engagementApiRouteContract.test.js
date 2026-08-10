/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
const assert = require('assert');
const packageJson = require('../package.json');
const routers = require('../src/router/routers').engagementApi;
const routes = Object.values(routers).flatMap(family => Object.entries(family));
assert.strictEqual(routes.length, 40);
assert.strictEqual(packageJson.prefix, 'engagement');
routes.forEach(([name, route]) => {
    if (!['getActiveForm', 'submitContact', 'listTestimonials', 'listReviews', 'getReviewAggregate', 'submitFeedback'].includes(name)) assert.strictEqual(route.secured, true, name + ' must be secured');
    assert(route.permission && route.apiExposure && route.controller && route.operation);
    assert(!route.key.includes('/schema'), name + ' must not expose schema CRUD');
});
assert.deepStrictEqual(routers.integration.receiveCallback.authTokenTypes, ['service']);
assert.deepStrictEqual(routers.integration.receiveCallback.accessGroups, ['serviceAccountUserGroup']);
assert.strictEqual(routers.publicForms.getActiveForm.secured, false);
assert.strictEqual(routers.publicForms.submitContact.secured, false);
assert.strictEqual(routers.publicForms.listTestimonials.secured, false);
assert.strictEqual(routers.publicForms.listReviews.secured, false);
assert.strictEqual(routers.publicForms.getReviewAggregate.secured, false);
assert.strictEqual(routers.publicForms.submitFeedback.secured, false);
assert.strictEqual(routers.customer.voteReviewHelpfulness.secured, true);
assert.deepStrictEqual(routers.integration.createReviewRequest.authTokenTypes, ['service']);
assert.deepStrictEqual(routers.integration.importSyndicatedReview.authTokenTypes, ['service']);
assert.strictEqual(routers.operator.runHandoffRecovery.permission, 'engagement.handoff.recover');
assert.strictEqual(routers.operator.retryHandoff.permission, 'engagement.handoff.recover');
assert.strictEqual(routers.operator.reconcileHandoff.permission, 'engagement.handoff.reconcile');
assert.strictEqual(routers.operator.actOnTestimonial.permission, 'engagement.testimonial.act');
assert.strictEqual(routers.operator.moderateReview.permission, 'engagement.review.moderate');
assert.strictEqual(routers.operator.previewCresMigration.permission, 'engagement.review.migrate');
console.log('EngagementApi Phase 3 route contract validated');
