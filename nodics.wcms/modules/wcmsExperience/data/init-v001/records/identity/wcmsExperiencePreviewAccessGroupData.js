/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module wcmsExperience/data/previewAccessGroups @description Defines enterprise access to Experience preview and index status. @layer data @owner wcmsExperience @override Preserve installed governed definitions. */
module.exports = {
  "record0": {
    "code": "wcmsExperiencePreviewUserGroup",
    "name": "Experience preview",
    "active": true,
    "parentGroups": [
      "axisOperationalUserGroup"
    ],
    "permissions": [
      "profile.scope.read",
      "WCMS_EXPERIENCE_VIEW",
      "WCMS_EXPERIENCE_PREVIEW",
      "WCMS_EXPERIENCE_PUBLISH_STATUS",
      "media.content.read"
    ]
  }
};
