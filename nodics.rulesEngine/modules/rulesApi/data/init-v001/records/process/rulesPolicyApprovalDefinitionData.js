/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module rulesApi/data/init-v001/process/rulesPolicyApprovalDefinitionData @description Contributes the reusable Rules policy maker-checker workflow for installation into Process. @layer module-data @owner rulesApi */
module.exports = {
    definitions: [{
        code: 'rulesPolicyApproval',
        name: 'Rules Policy Approval',
        description: 'Reviews one immutable Rules draft revision before it can become a published active or scheduled policy version.',
        category: 'rules-governance',
        ownerModule: 'rulesApi',
        policy: {
            taskPermission: 'rules.definition.approve',
            assignmentPolicy: 'QUEUE',
            requiredApprovals: 1,
            requireReasonOnReject: true,
            maximumContextBytes: 65536,
            contextAllowlist: ['ruleSetCode', 'draftRevision', 'consumerModule', 'policyType', 'scopeType', 'scopeCode', 'correlationId', 'requestedBy']
        },
        graph: {
            nodes: [
                { code: 'start', type: 'START', name: 'Start' },
                { code: 'policyReview', type: 'TASK', name: 'Review Rules Policy', assignee: 'rulesPolicyApprovalQueue' },
                { code: 'approvalDecision', type: 'DECISION', name: 'Approval Decision' },
                { code: 'applyDecision', type: 'ACTION', name: 'Apply Rules Policy Decision',
                    action: { moduleName: 'rulesApi', operation: 'applyDecision' } },
                { code: 'end', type: 'END', name: 'End' }
            ],
            transitions: [
                { code: 'start_to_review', source: 'start', target: 'policyReview' },
                { code: 'review_to_decision', source: 'policyReview', target: 'approvalDecision' },
                { code: 'approved_to_apply', source: 'approvalDecision', target: 'applyDecision',
                    condition: { field: 'approved', equals: true } },
                { code: 'rejected_to_apply', source: 'approvalDecision', target: 'applyDecision', default: true },
                { code: 'apply_to_end', source: 'applyDecision', target: 'end' }
            ]
        }
    }]
};
