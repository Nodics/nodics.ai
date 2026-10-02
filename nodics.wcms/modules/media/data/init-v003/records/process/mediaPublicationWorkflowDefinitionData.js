/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/**
 * @module media/data/MediaPublicationWorkflowDefinitionData
 * @description Immutable successor of the Media approval contribution with native maker-checker decisions.
 * @layer data
 * @owner media
 * @override Customize reviewer assignments through Process; preserve requester binding and pinned decision policy.
 */
module.exports = {
    definitions: [{
        code: 'mediaPublicationApproval', name: 'Media Publication Approval',
        description: 'Review exact retained Media metadata and bytes before Online activation.',
        category: 'content', ownerModule: 'media',
        policy: {
            actorPolicy: {
                permission: 'publish.lifecycle.approve',
                enterpriseContextField: 'enterpriseCode',
                requesterContextField: 'requestedBy'
            }
        },
        graph: {
            nodes: [
                { code: 'start', type: 'START', name: 'Start' },
                { code: 'mediaReview', type: 'TASK', name: 'Review Media Publication',
                    policy: { decisionContract: {
                        contractVersion: 1, kind: 'APPROVAL',
                        approveLabel: 'Approve', rejectLabel: 'Reject', reasonLabel: 'Reason',
                        rejectionReasonRequired: true, maximumReasonLength: 1000
                    } } },
                { code: 'applyDecision', type: 'ACTION', name: 'Apply Media Decision',
                    action: { moduleName: 'media', operation: 'applyPublicationDecision' } },
                { code: 'end', type: 'END', name: 'End' }
            ],
            transitions: [
                { code: 'start_to_review', source: 'start', target: 'mediaReview' },
                { code: 'review_to_apply', source: 'mediaReview', target: 'applyDecision' },
                { code: 'apply_to_end', source: 'applyDecision', target: 'end' }
            ]
        }
    }]
};
