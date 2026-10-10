/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module media/data/MediaPublicationWorkflowDefinitionData
 * @description Media-owned explicit Process contribution for human review and a claimed nPublish callback.
 * @layer data
 * @owner media
 * @override Use existing Process reviewer assignments; graph changes require an immutable successor release.
 */
module.exports = {
    definitions: [{
        code: 'mediaPublicationApproval', name: 'Media Publication Approval',
        description: 'Review exact retained Media metadata and bytes before Online activation.',
        category: 'content', ownerModule: 'media',
        graph: {
            nodes: [
                { code: 'start', type: 'START', name: 'Start' },
                { code: 'mediaReview', type: 'TASK', name: 'Review Media Publication' },
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
