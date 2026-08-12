/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module testimonial/config/properties
 * @description Defines consent, editorial, publication, expiry, and recovery policy defaults for testimonials.
 * @layer config
 * @owner testimonial
 * @override Project, environment, server, node, tenant, or customer layers may override these defaults through Nodics configuration layering.
 */
module.exports = {
schemaPolicies: { testimonial: {
    customerOwned: { accessGroups: { adminGroup: 10, serviceAccountUserGroup: 10, employeeUserGroup: 10, customerUserGroup: 10 }, ownership: { enabled: true, ownerProperty: 'ownerId', bypassGroups: { adminGroup: true, serviceAccountUserGroup: true, employeeUserGroup: true }, subjectGroups: { customerUserGroup: true }, principalTypes: { customer: true } } },
    operational: { accessGroups: { adminGroup: 10, serviceAccountUserGroup: 10, employeeUserGroup: 10 } }
} },
testimonial: {
    enabled: false,
    intake: { publicCandidateMaximumTextLength: 1000 },
    editorial: { requireCustomerConfirmation: true, allowedVariants: ['SHORT_QUOTE', 'FULL_STORY', 'CASE_STUDY_TEASER', 'VIDEO'] },
    consent: { required: true, defaultPolicyVersion: '1', requireExplicitChannels: true, requireExplicitRegions: true },
    publication: { domain: 'testimonial', emergencyHideSynchronous: true, withdrawalSynchronous: true, defaultLocale: 'en' },
    recovery: { batchSize: 100, expireEnabled: true, reconcileEnabled: true }
},
publish: { providers: { domainAdapters: { testimonial: 'DefaultTestimonialPublicationAdapterService' }, versionProviders: { testimonial: 'DefaultTestimonialPublicationAdapterService' } } }
};
