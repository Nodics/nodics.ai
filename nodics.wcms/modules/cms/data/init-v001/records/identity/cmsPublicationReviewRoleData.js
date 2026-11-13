/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module cms/data/publicationReviewRoles @description Makes CMS publication review assignable independently of publish and rollback authority. @layer data @owner cms @override Preserve installed governed definitions. */
module.exports = {
  "record0": {
    "code": "CONTENT_PUBLICATION_REVIEW",
    "name": "Content publication review",
    "label": "Content publication review",
    "active": true,
    "ownerModule": "cms",
    "businessArea": "contentPublicationReview",
    "businessAreaLabel": "Content publication review",
    "accessLevel": "edit",
    "groupCodes": [
      "cmsPublicationReviewUserGroup"
    ],
    "scopeType": "ENTERPRISE",
    "delegable": true,
    "assignmentPermissions": []
  }
};
