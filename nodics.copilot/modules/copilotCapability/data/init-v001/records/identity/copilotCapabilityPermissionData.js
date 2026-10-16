/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module copilotCapability/data/permissionCatalogue @description Owns permission seed records administered through Profile and Axis. @layer data @owner copilotCapability @override Import explicitly; preserve existing governed records on replay. */
module.exports = {
  "record0": {
    "code": "copilot.data.query",
    "name": "copilot.data.query",
    "active": true,
    "ownerModule": "copilotCapability"
  },
  "record1": {
    "code": "copilot.logs.read",
    "name": "copilot.logs.read",
    "active": true,
    "ownerModule": "copilotCapability"
  },
  "record2": {
    "code": "copilot.mutation.reconcile",
    "name": "copilot.mutation.reconcile",
    "active": true,
    "ownerModule": "copilotCapability"
  },
  "record3": {
    "code": "copilot.export",
    "name": "copilot.export",
    "active": true,
    "ownerModule": "copilotCapability"
  },
  "record4": {
    "code": "copilot.mutation.prepare",
    "name": "copilot.mutation.prepare",
    "active": true,
    "ownerModule": "copilotCapability"
  },
  "record5": {
    "code": "copilot.mutation.execute",
    "name": "copilot.mutation.execute",
    "active": true,
    "ownerModule": "copilotCapability"
  }
};
