/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module copilotConversation/data/permissionCatalogue @description Owns permission seed records administered through Profile and Axis. @layer data @owner copilotConversation @override Import explicitly; preserve existing governed records on replay. */
module.exports = {
  "record0": {
    "code": "copilot.assistant.use",
    "name": "copilot.assistant.use",
    "active": true,
    "ownerModule": "copilotConversation"
  },
  "record1": {
    "code": "copilot.assistant.read",
    "name": "copilot.assistant.read",
    "active": true,
    "ownerModule": "copilotConversation"
  },
  "record2": {
    "code": "copilot.assistant.cancel",
    "name": "copilot.assistant.cancel",
    "active": true,
    "ownerModule": "copilotConversation"
  },
  "record3": {
    "code": "copilot.activity.read",
    "name": "copilot.activity.read",
    "active": true,
    "ownerModule": "copilotConversation"
  },
  "record4": {
    "code": "copilot.activity.content.search",
    "name": "copilot.activity.content.search",
    "active": true,
    "ownerModule": "copilotConversation"
  },
  "record5": {
    "code": "copilot.activity.lifecycle.read",
    "name": "copilot.activity.lifecycle.read",
    "active": true,
    "ownerModule": "copilotConversation"
  },
  "record6": {
    "code": "copilot.activity.lifecycle.execute",
    "name": "copilot.activity.lifecycle.execute",
    "active": true,
    "ownerModule": "copilotConversation"
  },
  "record7": {
    "code": "copilot.activity.transcript.read",
    "name": "copilot.activity.transcript.read",
    "active": true,
    "ownerModule": "copilotConversation"
  }
};
