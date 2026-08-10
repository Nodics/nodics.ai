/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module customerReview/config/properties
 * @description Defines review validation, moderation, authenticity, response, abuse, and CRES migration defaults.
 * @layer config
 * @owner customerReview
 * @override Project, environment, server, node, tenant, or customer layers may override these defaults through Nodics configuration layering.
 */
module.exports = {
    schemaPolicies: { customerReview: {
        customerOwned: { accessGroups: { adminGroup: 10, serviceAccountUserGroup: 10, employeeUserGroup: 10, customerUserGroup: 10 }, ownership: { enabled: true, ownerProperty: 'ownerId', bypassGroups: { adminGroup: true, serviceAccountUserGroup: true, employeeUserGroup: true }, subjectGroups: { customerUserGroup: true }, principalTypes: { customer: true } } },
        operational: { accessGroups: { adminGroup: 10, serviceAccountUserGroup: 10, employeeUserGroup: 10 } }
    } },
    customerReview: {
        enabled: false,
        review: { targetTypes: ['PRODUCT', 'CATEGORY', 'ORDER', 'ORDER_ENTRY', 'SERVICE', 'STORE', 'SELLER', 'CONTENT', 'EVENT', 'LOCATION', 'CUSTOM'], ratingMinimum: 1, ratingMaximum: 5, allowRatingOnly: true, allowTextOnly: true, onePerOwnerTargetOrder: true, editWindowMinutes: 1440 },
        authenticity: { guestVerificationRequired: true, purchaseVerificationProvider: null, policyVersion: '1', prohibitSentimentConditionedIncentives: true },
        moderation: { mode: 'PRE', reasonCodes: ['OFFENSIVE', 'PERSONAL_DATA', 'IRRELEVANT', 'FAKE', 'DUPLICATE', 'CONFLICT_OF_INTEREST', 'LEGAL', 'SAFETY', 'SPAM'], transitions: {
            DRAFT: { SUBMIT: 'PENDING_MODERATION', WITHDRAW: 'WITHDRAWN' }, SUBMITTED: { APPROVE: 'APPROVED', QUARANTINE: 'QUARANTINED', REJECT: 'REJECTED' }, PENDING_MODERATION: { APPROVE: 'APPROVED', QUARANTINE: 'QUARANTINED', MARK_SPAM: 'QUARANTINED', REJECT: 'REJECTED', REQUEST_CORRECTION: 'DRAFT', WITHDRAW: 'WITHDRAWN' },
            APPROVED: { HIDE: 'HIDDEN', WITHDRAW: 'WITHDRAWN', ARCHIVE: 'ARCHIVED', ESCALATE: 'QUARANTINED' }, QUARANTINED: { APPROVE: 'APPROVED', REJECT: 'REJECTED', RESTORE: 'PENDING_MODERATION', ARCHIVE: 'ARCHIVED' }, REJECTED: { RESTORE: 'PENDING_MODERATION', ARCHIVE: 'ARCHIVED' }, HIDDEN: { RESTORE: 'APPROVED', ARCHIVE: 'ARCHIVED' }, WITHDRAWN: { RESTORE: 'PENDING_MODERATION', ARCHIVE: 'ARCHIVED' }, ARCHIVED: {}
        } },
        response: { requireApproval: true, notifyCustomer: true },
        abuse: { duplicateOpenReportPolicy: true },
        migration: { legacyAliases: ['cres', 'gMrkty/cres'], strategy: 'CUTOVER', dualWrite: false, mappingVersion: '1' }
        , publicExperience: { enabled: true, pageSize: 20, maximumPageSize: 100, sortModes: ['RECENT', 'HELPFUL', 'RATING_HIGH', 'RATING_LOW'], aggregatePolicyVersion: '1', calculationVersion: '1', cacheTtlSeconds: 300, maximumGalleryItems: 12, schemaOrgEnabled: true }
        , solicitation: { enabled: false, policyVersion: '1', delayAfterFulfillmentHours: 24, requestExpiryDays: 30, maximumReminders: 1, reminderDelayHours: 168, quietPeriodStartHour: 21, quietPeriodEndHour: 8, allowedChannels: ['EMAIL', 'SMS', 'ACCOUNT', 'QR', 'IN_APP'], prohibitSentimentSelection: true }
        , syndication: { enabled: false, mappingVersion: '1', requireLicense: true, requireDisclosure: true, providers: { googleCustomerReviews: { enabled: false, mode: 'REFERENCE_ONLY' } } }
    }
};
