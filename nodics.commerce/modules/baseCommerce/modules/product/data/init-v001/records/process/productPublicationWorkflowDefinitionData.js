/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
'use strict';

/**
 * @module product/data/productPublicationWorkflowDefinitionData
 * @description Declares typed human decisions for the Product publication review successor.
 * @layer data
 * @owner product
 * @override Customize through a forward Process contribution; preserve immutable task versions and owner actions.
 */
module.exports = {
    definitions: [{ code: 'productPublicationApproval', name: 'Product Publication Approval', category: 'commerce', ownerModule: 'product',
        description: 'Review the exact immutable catalogue closure before governed Online activation.',
        graph: { nodes: [
            { code: 'start', type: 'START', name: 'Start' },
            { code: 'productReview', type: 'TASK', name: 'Review Product Publication',
                policy: { decisionContract: {
                    contractVersion: 1, kind: 'APPROVAL',
                    approveLabel: 'Approve', rejectLabel: 'Reject', reasonLabel: 'Reason',
                    rejectionReasonRequired: true, maximumReasonLength: 1000
                } } },
            { code: 'applyDecision', type: 'ACTION', name: 'Apply Product Decision', action: { moduleName: 'product', operation: 'applyPublicationDecision' } },
            { code: 'end', type: 'END', name: 'End' }
        ], transitions: [
            { code: 'start_to_review', source: 'start', target: 'productReview' },
            { code: 'review_to_apply', source: 'productReview', target: 'applyDecision' },
            { code: 'apply_to_end', source: 'applyDecision', target: 'end' }
        ] } }]
};
