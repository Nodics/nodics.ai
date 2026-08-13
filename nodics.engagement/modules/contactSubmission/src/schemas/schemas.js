/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module contactSubmission/src/schemas/schemas @description Defines internal contact request, correspondence, attempt, resolution, and handoff records. @layer schema @owner contactSubmission @override Later modules may add governed fields while preserving tenant, ownership, audit, and provider boundaries. */
module.exports = { contactSubmission: {
    contactRequest: Object.assign({ super: 'base', model: true, schemaPolicies: ['customerOwned'], service: { enabled: true }, router: { enabled: false }, cache: { enabled: false }, event: { enabled: false }, search: { enabled: false } }, { definition: {
        tenant: { type: 'string', required: true }, engagementSubmissionCode: { type: 'string', required: true }, ownerId: { type: 'string', required: true },
        type: { type: 'string', required: true }, reasonCode: { type: 'string', required: false }, subject: { type: 'string', required: true }, message: { type: 'string', required: true },
        contactEmail: { type: 'string', required: true }, contactPhone: { type: 'string', required: false }, preferredChannel: { type: 'string', required: false },
        verificationStatus: { type: 'string', required: true, enum: ['NOT_REQUIRED', 'PENDING', 'VERIFIED', 'FAILED', 'EXPIRED'] }, status: { type: 'string', required: true, enum: ['SUBMITTED', 'VERIFICATION_PENDING', 'OPEN', 'IN_PROGRESS', 'WAITING_CUSTOMER', 'WAITING_INTERNAL', 'RESOLVED', 'CLOSED', 'REJECTED', 'SPAM', 'DUPLICATE', 'ARCHIVED'] },
        queueCode: { type: 'string', required: true }, teamCode: { type: 'string', required: false }, priorityCode: { type: 'string', required: true }, dueAt: { type: 'date', required: false },
        processInstanceCode: { type: 'string', required: false }, revision: { type: 'int', required: true, default: 0 }, retentionPolicyCode: { type: 'string', required: true },
        correlationId: { type: 'string', required: true }, submittedAt: { type: 'date', required: true }, resolvedAt: { type: 'date', required: false }, closedAt: { type: 'date', required: false }
    } }),
    contactCorrespondence: Object.assign({ super: 'base', model: true, schemaPolicies: ['customerOwned'], service: { enabled: true }, router: { enabled: false }, cache: { enabled: false }, event: { enabled: false }, search: { enabled: false } }, { definition: {
        tenant: { type: 'string', required: true }, contactRequestCode: { type: 'string', required: true }, ownerId: { type: 'string', required: true }, direction: { type: 'string', required: true, enum: ['INBOUND', 'OUTBOUND'] },
        visibility: { type: 'string', required: true, enum: ['CUSTOMER', 'INTERNAL'] }, channel: { type: 'string', required: true }, body: { type: 'string', required: true },
        authorId: { type: 'string', required: false }, deliveryReference: { type: 'string', required: false }, correlationId: { type: 'string', required: true }, occurredAt: { type: 'date', required: true }
    } }),
    contactAttempt: Object.assign({ super: 'base', model: true, schemaPolicies: ['operational'], service: { enabled: true }, router: { enabled: false }, cache: { enabled: false }, event: { enabled: false }, search: { enabled: false } }, { definition: {
        tenant: { type: 'string', required: true }, contactRequestCode: { type: 'string', required: true }, channel: { type: 'string', required: true }, outcome: { type: 'string', required: true },
        reasonCode: { type: 'string', required: false }, actorId: { type: 'string', required: false }, providerReference: { type: 'string', required: false }, correlationId: { type: 'string', required: true }, attemptedAt: { type: 'date', required: true }
    } }),
    contactResolution: Object.assign({ super: 'base', model: true, schemaPolicies: ['operational'], service: { enabled: true }, router: { enabled: false }, cache: { enabled: false }, event: { enabled: false }, search: { enabled: false } }, { definition: {
        tenant: { type: 'string', required: true }, contactRequestCode: { type: 'string', required: true }, resolutionCode: { type: 'string', required: true }, summary: { type: 'string', required: true },
        customerVisibleSummary: { type: 'string', required: false }, resolvedBy: { type: 'string', required: true }, correlationId: { type: 'string', required: true }, resolvedAt: { type: 'date', required: true }
    } }),
    contactHandoff: Object.assign({ super: 'base', model: true, schemaPolicies: ['operational'], service: { enabled: true }, router: { enabled: false }, cache: { enabled: false }, event: { enabled: false }, search: { enabled: false } }, { definition: {
        tenant: { type: 'string', required: true }, contactRequestCode: { type: 'string', required: true }, targetType: { type: 'string', required: true, enum: ['PROCESS', 'CRM', 'HELPDESK', 'CALENDAR', 'COMMUNICATION'] },
        provider: { type: 'string', required: false }, externalReference: { type: 'string', required: false }, status: { type: 'string', required: true, enum: ['PENDING', 'IN_PROGRESS', 'SUCCEEDED', 'FAILED', 'RETRY_PENDING', 'DEAD_LETTER', 'RECONCILED'] },
        attempts: { type: 'int', required: true, default: 0 }, revision: { type: 'int', required: true, default: 0 }, nextRetryAt: { type: 'date', required: false }, lastAttemptAt: { type: 'date', required: false }, completedAt: { type: 'date', required: false },
        leaseOwner: { type: 'string', required: false }, leaseExpiresAt: { type: 'date', required: false }, lastErrorCode: { type: 'string', required: false }, correlationId: { type: 'string', required: true }, updatedAt: { type: 'date', required: true }
    } }),
    contactVerification: Object.assign({ super: 'base', model: true, schemaPolicies: ['operational'], service: { enabled: true }, router: { enabled: false }, cache: { enabled: false }, event: { enabled: false }, search: { enabled: false } }, { definition: {
        tenant: { type: 'string', required: true }, contactRequestCode: { type: 'string', required: true }, challengeHash: { type: 'string', required: true }, status: { type: 'string', required: true, enum: ['PENDING', 'VERIFIED', 'FAILED', 'EXPIRED'] },
        attempts: { type: 'int', required: true, default: 0 }, expiresAt: { type: 'date', required: true }, verifiedAt: { type: 'date', required: false }, correlationId: { type: 'string', required: true }
    } })
} };
