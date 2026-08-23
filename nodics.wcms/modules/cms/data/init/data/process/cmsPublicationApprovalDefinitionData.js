/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module cms/data/init/process/cmsPublicationApprovalDefinitionData
 * @description Contributes the mandatory reusable CMS publication approval workflow and secure policy defaults for installation into Process.
 * @layer module-data
 * @owner cms
 */
module.exports = {
    definitions: [{
        code: 'cmsPublicationApproval',
        name: 'CMS Publication Approval',
        description: 'Reviews an immutable CMS Staged publication candidate before nPublish activates it Online.',
        category: 'content-governance',
        ownerModule: 'cms',
        policy: {
            taskPermission: 'cms.publication.approve',
            assignmentPolicy: 'QUEUE',
            escalationPolicy: {
                level1Assignee: 'cmsPublicationSeniorApprovalQueue',
                level2Assignee: 'cmsPublicationGovernanceQueue',
                escalateAfterHours: 24
            },
            slaHours: 24,
            submitterMayApprove: false,
            requiredApprovals: 1,
            emergencyOverridePermission: 'cms.publication.emergencyOverride',
            requireReasonOnReject: true,
            maximumContextBytes: 65536,
            contextAllowlist: ['publicationCode', 'sourceVersion', 'siteCode', 'catalogCode', 'correlationId', 'requestedBy']
        },
        graph: {
            nodes: [
                { code: 'start', type: 'START', name: 'Start' },
                { code: 'publicationReview', type: 'TASK', name: 'Review CMS Publication', assignee: 'cmsPublicationApprovalQueue' },
                { code: 'approvalDecision', type: 'DECISION', name: 'Approval Decision' },
                { code: 'applyDecision', type: 'ACTION', name: 'Apply Publication Decision',
                    action: { moduleName: 'cms', operation: 'applyPublicationDecision' } },
                { code: 'end', type: 'END', name: 'End' }
            ],
            transitions: [
                { code: 'start_to_review', source: 'start', target: 'publicationReview' },
                { code: 'review_to_decision', source: 'publicationReview', target: 'approvalDecision' },
                { code: 'approved_to_apply', source: 'approvalDecision', target: 'applyDecision',
                    condition: { field: 'approved', equals: true } },
                { code: 'rejected_to_apply', source: 'approvalDecision', target: 'applyDecision', default: true },
                { code: 'apply_to_end', source: 'applyDecision', target: 'end' }
            ]
        }
    }]
};
