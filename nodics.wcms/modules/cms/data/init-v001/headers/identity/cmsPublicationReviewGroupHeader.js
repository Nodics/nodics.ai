/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module cms/data/publicationReviewGroups @description Defines access to claim and decide a CMS publication review task. @layer data @owner cms @override Preserve installed governed definitions. */
module.exports = {
  "profile": {
    "cmsPublicationReviewGroup": {
      "options": {
        "enabled": true,
        "schemaName": "userGroup",
        "operation": "ensureReferenceAll",
        "dataFilePrefix": "cmsPublicationReviewGroupData",
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
