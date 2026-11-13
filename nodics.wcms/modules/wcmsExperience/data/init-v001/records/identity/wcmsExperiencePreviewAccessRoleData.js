/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module wcmsExperience/data/previewAccessRoles @description Makes read-only Experience preview access assignable to enterprise employees. @layer data @owner wcmsExperience @override Preserve installed governed definitions. */
module.exports = {
  "record0": {
    "code": "EXPERIENCE_PREVIEW",
    "name": "Experience preview",
    "label": "Experience preview",
    "active": true,
    "ownerModule": "wcmsExperience",
    "businessArea": "experiencePreview",
    "businessAreaLabel": "Experience preview",
    "accessLevel": "view",
    "groupCodes": [
      "wcmsExperiencePreviewUserGroup"
    ],
    "scopeType": "ENTERPRISE",
    "delegable": true,
    "assignmentPermissions": []
  }
};
