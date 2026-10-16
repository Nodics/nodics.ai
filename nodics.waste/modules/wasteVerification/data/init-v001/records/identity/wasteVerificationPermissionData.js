/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module wasteVerification/data/permissionCatalogue @description Owns permission seed records administered through Profile and Axis. @layer data @owner wasteVerification @override Import explicitly; preserve existing governed records on replay. */
module.exports = {
  "record0": {
    "code": "waste.review.queue.read",
    "name": "waste.review.queue.read",
    "active": true,
    "ownerModule": "wasteVerification"
  },
  "record1": {
    "code": "waste.review.evidence.read",
    "name": "waste.review.evidence.read",
    "active": true,
    "ownerModule": "wasteVerification"
  },
  "record2": {
    "code": "waste.verification.record",
    "name": "waste.verification.record",
    "active": true,
    "ownerModule": "wasteVerification"
  },
  "record3": {
    "code": "waste.review.approve",
    "name": "waste.review.approve",
    "active": true,
    "ownerModule": "wasteVerification"
  }
};
