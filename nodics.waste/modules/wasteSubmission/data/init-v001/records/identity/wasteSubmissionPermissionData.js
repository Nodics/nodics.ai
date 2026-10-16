/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module wasteSubmission/data/permissionCatalogue @description Owns permission seed records administered through Profile and Axis. @layer data @owner wasteSubmission @override Import explicitly; preserve existing governed records on replay. */
module.exports = {
  "record0": {
    "code": "waste.submission.create",
    "name": "waste.submission.create",
    "active": true,
    "ownerModule": "wasteSubmission"
  },
  "record1": {
    "code": "waste.submission.transition",
    "name": "waste.submission.transition",
    "active": true,
    "ownerModule": "wasteSubmission"
  }
};
