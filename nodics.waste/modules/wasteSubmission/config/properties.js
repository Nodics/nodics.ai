/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module wasteSubmission/config/properties @description Provides Waste Submission policy defaults. @layer config @owner wasteSubmission @override Partner modules may tune staged journey requirements. */
module.exports = {
    // Inert inventory; an allowed local server must explicitly select this capability.
    localResetProvider: {
        "contributions": {
            "wasteSubmission": {
                "serviceNames": {
                    "DefaultWasteEvidenceService": true,
                    "DefaultWasteMetadataSuggestionService": true,
                    "DefaultWasteSubmissionService": true
                }
            }
        }
    },
 schemaPolicies: { wasteSubmission: { operational: { accessGroups: { adminGroup: 10, serviceAccountUserGroup: 10, employeeUserGroup: 10, customerGroup: 10 } } } }, wasteSubmission: { evidenceRequiredForSubmit: true, metadataSuggestion: { enabled: false, subjectLabel: "waste item", fallbackItemTypeCode: null } } };
