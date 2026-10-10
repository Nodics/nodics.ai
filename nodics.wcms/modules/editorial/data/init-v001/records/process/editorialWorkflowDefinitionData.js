/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/**
 * @module editorial/data/EditorialWorkflowDefinitionData
 * @description Immutable neutral approval and publication graphs installed by Process.
 * @layer data
 * @owner editorial
 * @override Customer contribution adapters supply reviewer policy; future graph changes require a new release.
 */
module.exports = {
    definitions: [
        {
            code: 'editorialApproval',
            name: 'Editorial Approval',
            description: 'Default News and Blog business review.',
            category: 'content',
            ownerModule: 'editorial',
            graph: {
                nodes: [
                    { code: 'start', type: 'START', name: 'Start' },
                    { code: 'editorialReview', type: 'TASK', name: 'Editorial Review' },
                    { code: 'approvalDecision', type: 'DECISION', name: 'Approval Decision' },
                    { code: 'applyDecision', type: 'ACTION', name: 'Apply Editorial Decision', action: { moduleName: 'editorial', operation: 'applyDecision' } },
                    { code: 'end', type: 'END', name: 'End' }
                ],
                transitions: [
                    { code: 'start_to_review', source: 'start', target: 'editorialReview' },
                    { code: 'review_to_decision', source: 'editorialReview', target: 'approvalDecision' },
                    { code: 'decision_approved_to_apply', source: 'approvalDecision', target: 'applyDecision', condition: { field: 'approved', equals: true } },
                    { code: 'decision_rejected_to_apply', source: 'approvalDecision', target: 'applyDecision', default: true },
                    { code: 'apply_to_end', source: 'applyDecision', target: 'end' }
                ]
            }
        },
        {
            code: 'editorialPublication',
            name: 'Editorial Publication',
            description: 'Cron-triggerable nPublish release orchestration.',
            category: 'content',
            ownerModule: 'editorial',
            graph: {
                nodes: [
                    { code: 'start', type: 'START', name: 'Start' },
                    { code: 'publishApproved', type: 'ACTION', name: 'Publish approved Editorial revision', action: { moduleName: 'editorial', operation: 'publishApproved' } },
                    { code: 'end', type: 'END', name: 'End' }
                ],
                transitions: [
                    { code: 'start_to_publish', source: 'start', target: 'publishApproved' },
                    { code: 'publish_to_end', source: 'publishApproved', target: 'end' }
                ]
            }
        }
    ]
};
