/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module customerFeedback/data/permissionCatalogue @description Owns permission seed records administered through Profile and Axis. @layer data @owner customerFeedback @override Import explicitly; preserve existing governed records on replay. */
module.exports = {
  "record0": {
    "code": "engagement.feedback.read",
    "name": "engagement.feedback.read",
    "active": true,
    "ownerModule": "customerFeedback"
  },
  "record1": {
    "code": "engagement.feedback.customer.read",
    "name": "engagement.feedback.customer.read",
    "active": true,
    "ownerModule": "customerFeedback"
  },
  "record2": {
    "code": "engagement.feedback.act",
    "name": "engagement.feedback.act",
    "active": true,
    "ownerModule": "customerFeedback"
  },
  "record3": {
    "code": "engagement.feedback.classify",
    "name": "engagement.feedback.classify",
    "active": true,
    "ownerModule": "customerFeedback"
  },
  "record4": {
    "code": "engagement.feedback.insight",
    "name": "engagement.feedback.insight",
    "active": true,
    "ownerModule": "customerFeedback"
  }
};
