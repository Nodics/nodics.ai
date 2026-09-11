/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module wasteMaterial/config/properties @description Provides Waste Material schema policy defaults. @layer config @owner wasteMaterial @override Partner modules may add taxonomy seed/configuration. */
module.exports = { wasteMaterial: { descriptor: { imageEvidence: { minimumPhotoConfidence: 0.8, manualLabel: 'Manual approval required', customerMessage: 'This image needs a collection-team check. You can continue submitting; the team will verify the actual item before approval.', customerReviewedMessage: 'The collection team manually reviewed this item’s image evidence before approval.', customerRecordedMessage: 'The image-evidence assessment is retained with this item’s review record. See the review outcome and public feedback for the decision.', reviewedLabel: 'Approved after manual evidence review', reviewedMessage: 'The image-evidence flag remains on this item. Its approval was recorded by an authorized human reviewer.', manualMessage: 'This image does not establish the physical item. Inspect the evidence and verify the actual item before approving. Automatic approval is prohibited.', unassessedLabel: 'Image source not assessed', unassessedMessage: 'This evidence has not been assessed for image source. It must follow manual review.', acknowledgementLabel: 'I have inspected the flagged evidence and verified the physical item for this approval.', sourceLabels: { ITEM_PHOTOGRAPH: 'Item photograph', PROMOTIONAL_GRAPHIC: 'Promotional graphic', ILLUSTRATION_OR_PAINTING: 'Illustration or painting', SCREENSHOT_OR_REPHOTO: 'Screenshot or photograph of another image', SUSPECTED_GENERATED: 'Possible generated or rendered image', UNCERTAIN: 'Image source uncertain', LOW_SOURCE_CONFIDENCE: 'Image source confidence is low' } }, maximumCatalogueRecords: 5000, maximumMaterials: 24, maximumWeightKg: 10000, maximumDimensionCm: 10000 } }, schemaPolicies: { wasteMaterial: { operational: { accessGroups: { adminGroup: 10, serviceAccountUserGroup: 10, employeeUserGroup: 10 } } } } };
