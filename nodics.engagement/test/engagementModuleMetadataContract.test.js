/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nodics.engagement/test/engagementModuleMetadataContract
 * @description Verifies the Phase 1 Customer Engagement ownership and dormant-capability metadata contract.
 * @layer test
 * @owner nodics.engagement
 */
const assert = require('assert');
const fs = require('fs');
const path = require('path');

const groupRoot = path.resolve(__dirname, '..');
const properties = require('../config/properties');
const backofficeContract = require('../../nodics.platform/modules/backoffice/src/service/contract/defaultBackofficeContractService');
const engagementCapabilities = [
    require('../modules/engagementCore/src/service/defaultEngagementCoreBackofficeCapabilityService').getCapability(),
    require('../modules/contactSubmission/src/service/defaultContactSubmissionBackofficeCapabilityService').getCapability(),
    require('../modules/testimonial/src/service/defaultTestimonialBackofficeCapabilityService').getCapability(),
    require('../modules/customerReview/src/service/defaultCustomerReviewBackofficeCapabilityService').getCapability(),
    require('../modules/customerFeedback/src/service/defaultCustomerFeedbackBackofficeCapabilityService').getCapability()
];
const packagePaths = [groupRoot].concat(
    fs.readdirSync(path.join(groupRoot, 'modules')).map(name => path.join(groupRoot, 'modules', name))
);

packagePaths.forEach(packageRoot => {
    const packageJson = JSON.parse(fs.readFileSync(path.join(packageRoot, 'package.json'), 'utf8'));
    assert.strictEqual(packageJson.main, 'nodics.js');
    assert.strictEqual(packageJson.nodics.runtimeModule, true);
    assert.strictEqual(packageJson.nodics.loadableByNodicsModuleLoader, true);
    assert.strictEqual(packageJson.nodics.runtime.publish, false);
    assert.strictEqual(packageJson.nodics.runtime.web, false);
    assert(!Object.prototype.hasOwnProperty.call(packageJson, 'dependencies'));
    assert(!Object.prototype.hasOwnProperty.call(packageJson, 'devDependencies'));
    ['README.md', 'AGENTS.md', 'config/properties.js', 'config/prescripts.js', 'config/postscripts.js',
        'llm/contracts/README.md', 'llm/examples/README.md'].forEach(relativePath => {
        assert(fs.existsSync(path.join(packageRoot, relativePath)), packageJson.name + ' must contain ' + relativePath);
    });
    assert(!fs.existsSync(path.join(packageRoot, 'docs')), packageJson.name + ' must not own module-local docs');
    assert(!fs.existsSync(path.join(packageRoot, 'llm', 'README.md')), packageJson.name + ' must use AGENTS.md for AI navigation');
});

assert(engagementCapabilities.every(capability => capability.enabled === true));
assert(engagementCapabilities.every(capability => backofficeContract.validateBackofficeMetadata(capability)), 'Each concrete Engagement module metadata contribution must be accepted by the live BackOffice registration contract');
const engagementNavigation = engagementCapabilities.flatMap(capability => capability.navigation).sort((left, right) => left.order - right.order);
assert.deepStrictEqual(engagementNavigation.map(item => item.id), ['customer-engagement', 'contact-submissions', 'contact-handoffs', 'testimonial-candidates', 'testimonial-editorial', 'testimonial-consents', 'testimonial-publications', 'customer-reviews', 'review-moderation', 'review-responses', 'review-abuse', 'review-publications', 'review-aggregates', 'review-requests', 'review-syndication', 'customer-feedback', 'feedback-complaints', 'feedback-follow-up', 'feedback-surveys', 'feedback-insights', 'engagement-unified-queue', 'engagement-dashboards', 'engagement-repairs', 'engagement-exports', 'engagement-privacy', 'engagement-automation-decisions', 'engagement-automation-evaluations', 'engagement-delivery-attempts', 'engagement-recovery-checkpoints', 'engagement-compatibility']);
assert.deepStrictEqual(engagementNavigation[1].workbenchTarget, { moduleName: 'contactSubmission', schemaName: 'contactRequest' });
assert(engagementNavigation[1].lifecycleActions.every(action => action.ownerModule === 'engagementApi' && action.operationRoute.startsWith('/operator/contact-submissions/')));
assert.deepStrictEqual(engagementNavigation[2].workbenchTarget, { moduleName: 'contactSubmission', schemaName: 'contactHandoff' });
assert(engagementNavigation[2].lifecycleActions.every(action => action.ownerModule === 'engagementApi' && action.operationRoute.startsWith('/operator/handoffs/')));
assert.deepStrictEqual(engagementNavigation.slice(3, 7).map(item => item.workbenchTarget.schemaName), ['testimonialCandidate', 'testimonialVersion', 'testimonialConsent', 'testimonialProjection']);
assert(engagementNavigation[6].lifecycleActions.every(action => action.ownerModule === 'engagementApi' && action.operationRoute.startsWith('/operator/testimonials/')));
assert.deepStrictEqual(engagementNavigation.slice(7, 15).map(item => item.workbenchTarget.schemaName), ['customerReview', 'customerReviewModeration', 'customerReviewResponse', 'customerReviewAbuseReport', 'customerReviewProjection', 'customerReviewAggregate', 'customerReviewRequest', 'customerReviewSyndication']);
assert(engagementNavigation[7].lifecycleActions.every(action => action.ownerModule === 'engagementApi' && action.operationRoute.startsWith('/operator/reviews/')));
assert.deepStrictEqual(engagementNavigation.slice(15, 20).map(item => item.workbenchTarget.schemaName), ['customerFeedback', 'customerFeedback', 'customerFeedbackFollowUp', 'engagementFormDefinition', 'customerFeedbackInsight']);
assert(engagementNavigation[15].lifecycleActions.every(action => action.ownerModule === 'engagementApi' && action.operationRoute.startsWith('/operator/feedback/')));
assert.deepStrictEqual(engagementNavigation.slice(20).map(item => item.workbenchTarget.schemaName), ['engagementUnifiedQueueItem', 'engagementDashboardSnapshot', 'engagementRepairCase', 'engagementExportEvidence', 'engagementPrivacyCase', 'engagementAutomationDecision', 'engagementAutomationEvaluation', 'engagementDeliveryAttempt', 'engagementRecoveryCheckpoint', 'engagementCompatibilityRecord']);
assert(engagementNavigation.slice(20).every(item => item.workbenchTarget.moduleName === 'engagementCore'));
assert.strictEqual(properties.engagement.capabilities.contactSubmission, true);
Object.entries(properties.engagement.capabilities).filter(([name]) => name !== 'contactSubmission').forEach(([, enabled]) => {
    assert.strictEqual(enabled, false, 'Unimplemented experiences must default inactive');
});

console.log('Customer Engagement module metadata contract validated');
