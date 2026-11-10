/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module cms/data/publicationReviewGroups @description Defines access to claim and decide a CMS publication review task. @layer data @owner cms @override Preserve installed governed definitions. */
module.exports = {
  "record0": {
    "code": "cmsPublicationReviewUserGroup",
    "name": "Content publication review",
    "active": true,
    "parentGroups": [
      "axisOperationalUserGroup"
    ],
    "permissions": [
      "profile.scope.read",
      "process.backoffice.view",
      "process.task.claim",
      "process.task.complete",
      "cms.publication.approve"
    ]
  }
};
