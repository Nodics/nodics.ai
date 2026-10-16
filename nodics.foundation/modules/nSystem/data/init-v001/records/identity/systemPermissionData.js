/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module system/data/permissionCatalogue @description Owns permission seed records administered through Profile and Axis. @layer data @owner system @override Import explicitly; preserve existing governed records on replay. */
module.exports = {
  "record0": {
    "code": "system.health.readiness.view",
    "name": "system.health.readiness.view",
    "active": true,
    "ownerModule": "system"
  },
  "record1": {
    "code": "system.contract.openapi.view",
    "name": "system.contract.openapi.view",
    "active": true,
    "ownerModule": "system"
  },
  "record2": {
    "code": "system.contract.swagger.view",
    "name": "system.contract.swagger.view",
    "active": true,
    "ownerModule": "system"
  },
  "record3": {
    "code": "system.log.level.update",
    "name": "system.log.level.update",
    "active": true,
    "ownerModule": "system"
  },
  "record4": {
    "code": "system.schema.index.rebuild",
    "name": "system.schema.index.rebuild",
    "active": true,
    "ownerModule": "system"
  },
  "record5": {
    "code": "system.schema.validator.rebuild",
    "name": "system.schema.validator.rebuild",
    "active": true,
    "ownerModule": "system"
  },
  "record6": {
    "code": "system.schema.view",
    "name": "system.schema.view",
    "active": true,
    "ownerModule": "system"
  },
  "record7": {
    "code": "system.schema.manage",
    "name": "system.schema.manage",
    "active": true,
    "ownerModule": "system"
  },
  "record8": {
    "code": "system.test.unit.run",
    "name": "system.test.unit.run",
    "active": true,
    "ownerModule": "system"
  },
  "record9": {
    "code": "system.test.nodics.run",
    "name": "system.test.nodics.run",
    "active": true,
    "ownerModule": "system"
  }
};
