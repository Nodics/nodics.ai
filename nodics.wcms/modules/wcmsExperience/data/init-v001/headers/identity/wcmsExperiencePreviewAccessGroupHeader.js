/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module wcmsExperience/data/previewAccessGroups @description Defines enterprise access to Experience preview and index status. @layer data @owner wcmsExperience @override Preserve installed governed definitions. */
module.exports = {
  "profile": {
    "wcmsExperiencePreviewAccessGroup": {
      "options": {
        "enabled": true,
        "schemaName": "userGroup",
        "operation": "ensureReferenceAll",
        "dataFilePrefix": "wcmsExperiencePreviewAccessGroupData",
        "userGroups": [
          "adminGroup"
        ]
      },
      "query": {
        "code": "$code"
      }
    }
  }
};
