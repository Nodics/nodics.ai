/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module customerFeedback/config/properties
 * @description Reserves the layered configuration boundary for customerFeedback; no active business defaults are enabled.
 * @layer config
 * @owner customerFeedback
 * @override Project, environment, server, node, tenant, or customer layers may override these defaults through Nodics configuration layering.
 */
module.exports = {
    schemaPolicies: { customerFeedback: {
        customerOwned: { accessGroups: { adminGroup: 10, serviceAccountUserGroup: 10, employeeUserGroup: 10, customerUserGroup: 10 }, ownership: { enabled: true, ownerProperty: 'ownerId', bypassGroups: { adminGroup: true, serviceAccountUserGroup: true, employeeUserGroup: true }, subjectGroups: { customerUserGroup: true }, principalTypes: { customer: true } } },
        operational: { accessGroups: { adminGroup: 10, serviceAccountUserGroup: 10, employeeUserGroup: 10 } }
    } },
    customerFeedback: {
        enabled: false,
        intake: { types: ['SUGGESTION', 'COMPLAINT', 'EXPERIENCE', 'SURVEY_RESPONSE', 'PRAISE', 'OTHER'], anonymousAllowed: true, maximumAttachments: 5, defaultPriority: 'NORMAL' },
        lifecycle: { transitions: { RECEIVED: { TRIAGE: 'TRIAGED', REJECT: 'REJECTED' }, TRIAGED: { ASSIGN: 'ASSIGNED', ESCALATE: 'ESCALATED', REJECT: 'REJECTED' }, ASSIGNED: { START: 'IN_PROGRESS', ESCALATE: 'ESCALATED' }, IN_PROGRESS: { REQUEST_INFORMATION: 'WAITING_CUSTOMER', HANDOFF: 'WAITING_INTERNAL', RESOLVE: 'RESOLVED', ESCALATE: 'ESCALATED' }, WAITING_CUSTOMER: { RECEIVE_INFORMATION: 'IN_PROGRESS', RESOLVE: 'RESOLVED' }, WAITING_INTERNAL: { RESUME: 'IN_PROGRESS', RESOLVE: 'RESOLVED' }, ESCALATED: { ASSIGN: 'ASSIGNED', START: 'IN_PROGRESS', RESOLVE: 'RESOLVED' }, RESOLVED: { CONFIRM: 'CLOSED', REOPEN: 'IN_PROGRESS' }, CLOSED: { REOPEN: 'IN_PROGRESS' }, REJECTED: {} } },
        followUp: { channels: ['SAME', 'PREFERRED', 'EMAIL', 'SMS', 'PHONE', 'IN_APP'], maximumAttempts: 3 },
        insight: { enabled: true, policyVersion: '1', minimumConfidence: 0.6, aiRequired: false },
        retention: { policyCode: 'customer-feedback-default' }
    }
};
