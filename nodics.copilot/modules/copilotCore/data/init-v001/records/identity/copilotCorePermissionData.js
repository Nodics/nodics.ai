/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module copilotCore/data/permissionCatalogue @description Owns permission seed records administered through Profile and Axis. @layer data @owner copilotCore @override Import explicitly; preserve existing governed records on replay. */
module.exports = {
  "record0": {
    "code": "copilot.configuration.read",
    "name": "copilot.configuration.read",
    "active": true,
    "ownerModule": "copilotCore"
  },
  "record1": {
    "code": "copilot.configuration.manage",
    "name": "copilot.configuration.manage",
    "active": true,
    "ownerModule": "copilotCore"
  },
  "record2": {
    "code": "copilot.configuration.admin",
    "name": "copilot.configuration.admin",
    "active": true,
    "ownerModule": "copilotCore"
  },
  "record3": {
    "code": "copilot.provider.check",
    "name": "copilot.provider.check",
    "active": true,
    "ownerModule": "copilotCore"
  },
  "record4": {
    "code": "copilot.usage.read",
    "name": "copilot.usage.read",
    "active": true,
    "ownerModule": "copilotCore"
  },
  "record5": {
    "code": "copilot.usage.reconcile",
    "name": "copilot.usage.reconcile",
    "active": true,
    "ownerModule": "copilotCore"
  },
  "record6": {
    "code": "copilot.budget.enterprise.manage",
    "name": "copilot.budget.enterprise.manage",
    "active": true,
    "ownerModule": "copilotCore"
  },
  "record7": {
    "code": "copilot.budget.user.manage",
    "name": "copilot.budget.user.manage",
    "active": true,
    "ownerModule": "copilotCore"
  },
  "record8": {
    "code": "copilot.audit.retention.execute",
    "name": "copilot.audit.retention.execute",
    "active": true,
    "ownerModule": "copilotCore"
  },
  "record9": {
    "code": "ai.knowledge.read",
    "name": "ai.knowledge.read",
    "active": true,
    "ownerModule": "copilotCore"
  },
  "record10": {
    "code": "ai.knowledge.manage",
    "name": "ai.knowledge.manage",
    "active": true,
    "ownerModule": "copilotCore"
  },
  "record11": {
    "code": "ai.assistant.use",
    "name": "ai.assistant.use",
    "active": true,
    "ownerModule": "copilotCore"
  },
  "record12": {
    "code": "ai.assistant.read",
    "name": "ai.assistant.read",
    "active": true,
    "ownerModule": "copilotCore"
  },
  "record13": {
    "code": "ai.assistant.cancel",
    "name": "ai.assistant.cancel",
    "active": true,
    "ownerModule": "copilotCore"
  },
  "record14": {
    "code": "ai.assistant.operations.read",
    "name": "ai.assistant.operations.read",
    "active": true,
    "ownerModule": "copilotCore"
  },
  "record15": {
    "code": "ai.ledger.read",
    "name": "ai.ledger.read",
    "active": true,
    "ownerModule": "copilotCore"
  },
  "record16": {
    "code": "ai.usage.readOwn",
    "name": "ai.usage.readOwn",
    "active": true,
    "ownerModule": "copilotCore"
  },
  "record17": {
    "code": "ai.ledger.manage",
    "name": "ai.ledger.manage",
    "active": true,
    "ownerModule": "copilotCore"
  },
  "record18": {
    "code": "ai.ledger.repair.approve",
    "name": "ai.ledger.repair.approve",
    "active": true,
    "ownerModule": "copilotCore"
  }
};
