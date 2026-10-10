/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module tax/data/taxPublicationWorkflowDefinitionData @description Forward release of Tax policy approval through existing Process and nPublish owners. @layer data @owner tax */
module.exports = {
    definitions: [{ code: 'taxPublicationApproval', name: 'Tax Policy Publication Approval',
        category: 'commerce', ownerModule: 'tax',
        description: 'Review exact retained policy without publishing operational state.',
        graph: { nodes: [
            { code: 'start', type: 'START', name: 'Start' },
            { code: 'policyReview', type: 'TASK', name: 'Review Tax Policy' },
            { code: 'applyDecision', type: 'ACTION', name: 'Apply Publication Decision',
                action: { moduleName: 'tax', operation: 'applyPublicationDecision' } },
            { code: 'end', type: 'END', name: 'End' }
        ], transitions: [
            { code: 'start_to_review', source: 'start', target: 'policyReview' },
            { code: 'review_to_apply', source: 'policyReview', target: 'applyDecision' },
            { code: 'apply_to_end', source: 'applyDecision', target: 'end' }
        ] } }]
};
