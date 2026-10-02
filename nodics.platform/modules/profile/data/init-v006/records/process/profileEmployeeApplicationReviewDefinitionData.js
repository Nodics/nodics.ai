/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module profile/data/init-v006/process/profileEmployeeApplicationReviewDefinitionData @description Immutable Profile-owned employee application review contribution for the existing Process installer. @owner profile @layer module-data */
module.exports = {
    definitions: [{
        code: 'profileEmployeeApplicationReview', name: 'Employee Application Review',
        description: 'Reviews an immutable mailbox-proven application without creating credentials or login access.',
        category: 'enterprise-access', ownerModule: 'profile',
        policy: {
            taskPermission: 'profile.enterpriseAccess.assign', assignmentPolicy: 'QUEUE',
            requiredApprovals: 1, requireReasonOnReject: true, maximumContextBytes: 16384,
            contextAllowlist: ['applicationCode', 'requestHash', 'enterpriseCode', 'requestedBy'],
            actorPolicy: { permission: 'profile.enterpriseAccess.assign',
                enterpriseContextField: 'enterpriseCode', requesterContextField: 'requestedBy' },
        },
        graph: {
            nodes: [
                { code: 'start', type: 'START', name: 'Start' },
                { code: 'review', type: 'TASK', name: 'Review employee application', assignee: 'enterpriseEmployeeReviewQueue' },
                { code: 'applyDecision', type: 'ACTION', name: 'Record application decision',
                    action: { moduleName: 'profile', operation: 'applyEmployeeApplicationDecision' } },
                { code: 'end', type: 'END', name: 'End' },
            ],
            transitions: [
                { code: 'start_review', source: 'start', target: 'review' },
                { code: 'review_apply', source: 'review', target: 'applyDecision' },
                { code: 'apply_end', source: 'applyDecision', target: 'end' },
            ],
        },
    }],
};
