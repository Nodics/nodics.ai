/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
"use strict";
/**
 * @module profile/data/docs-v002/records/documentation/profileNotificationRecipientsDocumentationPageData
 * @description Owns canonical profileNotificationRecipientsDocumentationPageData successor records; installation and publication remain governed.
 * @layer data
 * @owner profile
 */
module.exports = {
  "record0": {
    "code": "nodicsDocsPageprofileNotificationRecipients",
    "name": "Source-Proven Notification Recipients",
    "cmsSite": [
      "nodicsDocumentationSite"
    ],
    "typeCode": "nodicsDocumentationArticlePageType",
    "template": "nodicsDocumentationArticleTemplate",
    "renderer": "documentation.page.article",
    "cmsComponents": [
      {
        "target": "nodicsDocumentationNavigation",
        "slot": "navigation",
        "index": 5,
        "active": true
      },
      {
        "target": "nodicsDocsComponentprofileNotificationRecipients",
        "slot": "article",
        "index": 10,
        "active": true
      }
    ],
    "active": true
  }
};
