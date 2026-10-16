/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module copilotKnowledge/data/permissionCatalogue @description Owns permission seed records administered through Profile and Axis. @layer data @owner copilotKnowledge @override Import explicitly; preserve existing governed records on replay. */
module.exports = {
  "record0": {
    "code": "copilot.knowledge.internal.read",
    "name": "copilot.knowledge.internal.read",
    "active": true,
    "ownerModule": "copilotKnowledge"
  },
  "record1": {
    "code": "copilot.knowledge.restricted.read",
    "name": "copilot.knowledge.restricted.read",
    "active": true,
    "ownerModule": "copilotKnowledge"
  },
  "record2": {
    "code": "copilot.knowledge.customer.read",
    "name": "copilot.knowledge.customer.read",
    "active": true,
    "ownerModule": "copilotKnowledge"
  },
  "record3": {
    "code": "copilot.knowledge.source.manage",
    "name": "copilot.knowledge.source.manage",
    "active": true,
    "ownerModule": "copilotKnowledge"
  },
  "record4": {
    "code": "copilot.knowledge.migration.read",
    "name": "copilot.knowledge.migration.read",
    "active": true,
    "ownerModule": "copilotKnowledge"
  },
  "record5": {
    "code": "copilot.knowledge.migration.execute",
    "name": "copilot.knowledge.migration.execute",
    "active": true,
    "ownerModule": "copilotKnowledge"
  },
  "record6": {
    "code": "copilot.knowledge.migration.erase",
    "name": "copilot.knowledge.migration.erase",
    "active": true,
    "ownerModule": "copilotKnowledge"
  },
  "record7": {
    "code": "copilot.knowledge.source.notify",
    "name": "copilot.knowledge.source.notify",
    "active": true,
    "ownerModule": "copilotKnowledge"
  },
  "record8": {
    "code": "copilot.knowledge.recovery.execute",
    "name": "copilot.knowledge.recovery.execute",
    "active": true,
    "ownerModule": "copilotKnowledge"
  },
  "record9": {
    "code": "copilot.knowledge.maintenance.read",
    "name": "copilot.knowledge.maintenance.read",
    "active": true,
    "ownerModule": "copilotKnowledge"
  },
  "record10": {
    "code": "copilot.knowledge.cleanup.execute",
    "name": "copilot.knowledge.cleanup.execute",
    "active": true,
    "ownerModule": "copilotKnowledge"
  }
};
