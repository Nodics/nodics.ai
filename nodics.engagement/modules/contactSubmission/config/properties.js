/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module contactSubmission/config/properties
 * @description Defines contact intake, routing, SLA, verification, lifecycle, and handoff defaults.
 * @layer config
 * @owner contactSubmission
 * @override Project, environment, server, node, tenant, or customer layers may override these defaults through Nodics configuration layering.
 */
module.exports = {
    schemaPolicies: { contactSubmission: {
        customerOwned: { accessGroups: { adminGroup: 10, serviceAccountUserGroup: 10, employeeUserGroup: 10, customerUserGroup: 10 }, ownership: { enabled: true, ownerProperty: 'ownerId', bypassGroups: { adminGroup: true, serviceAccountUserGroup: true, employeeUserGroup: true }, subjectGroups: { customerUserGroup: true }, principalTypes: { customer: true } } },
        operational: { accessGroups: { adminGroup: 10, serviceAccountUserGroup: 10, employeeUserGroup: 10 } }
    } },
    contactSubmission: {
        types: ['ENQUIRY', 'SUPPORT', 'CALLBACK', 'COMPLAINT', 'OTHER'],
        requiredFields: ['subject', 'message', 'contactEmail'],
        limits: { subjectLength: 200, messageLength: 10000 },
        verification: { guestRequired: true, registeredRequired: false },
        retentionPolicyCode: 'CONTACT_STANDARD',
        processDefinitionCode: 'contactResolution',
        handoffRecovery: { batchSize: 25, leaseMs: 30000, maximumAttempts: 5, baseBackoffMs: 1000, maximumBackoffMs: 300000 },
        routing: { fallbackQueue: 'GENERAL_SUPPORT', fallbackTeam: 'CUSTOMER_CARE', defaultSlaMinutes: 1440, reasons: {} },
        lifecycle: { transitions: {
            SUBMITTED: ['VERIFICATION_PENDING', 'OPEN', 'SPAM', 'DUPLICATE', 'REJECTED'], VERIFICATION_PENDING: ['OPEN', 'REJECTED'],
            OPEN: ['IN_PROGRESS', 'WAITING_CUSTOMER', 'RESOLVED', 'SPAM', 'DUPLICATE'], IN_PROGRESS: ['WAITING_CUSTOMER', 'WAITING_INTERNAL', 'RESOLVED'],
            WAITING_CUSTOMER: ['IN_PROGRESS', 'RESOLVED'], WAITING_INTERNAL: ['IN_PROGRESS', 'RESOLVED'], RESOLVED: ['IN_PROGRESS', 'CLOSED'],
            CLOSED: ['IN_PROGRESS', 'ARCHIVED'], REJECTED: ['ARCHIVED'], SPAM: ['ARCHIVED'], DUPLICATE: ['ARCHIVED'], ARCHIVED: []
        } },
        adapters: { processService: null, communicationService: null, crmService: null, calendarService: null },
        helpdeskProvider: { enabled: false, maturity: 'SANDBOX_CAPABLE', sandboxOnly: true, liveQualified: false, endpoint: '', credentialReference: '', workspaceReference: '', timeoutMilliseconds: 5000 }
    }
};
