/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module profile/data/permissionCatalogue @description Owns permission seed records administered through Profile and Axis. @layer data @owner profile @override Import explicitly; preserve existing governed records on replay. */
module.exports = {
  "platformFullAccess": {
    "code": "*",
    "name": "Human Platform administrator full access",
    "active": true,
    "ownerModule": "profile"
  },
  "record0": {
    "code": "profile.address.reference.read",
    "name": "profile.address.reference.read",
    "active": true,
    "ownerModule": "profile"
  },
  "record1": {
    "code": "profile.enterprise.reference.read",
    "name": "profile.enterprise.reference.read",
    "active": true,
    "ownerModule": "profile"
  },
  "record2": {
    "code": "identity.migration.preview",
    "name": "identity.migration.preview",
    "active": true,
    "ownerModule": "profile"
  },
  "record3": {
    "code": "identity.migration.apply",
    "name": "identity.migration.apply",
    "active": true,
    "ownerModule": "profile"
  },
  "record4": {
    "code": "identity.migration.rollback",
    "name": "identity.migration.rollback",
    "active": true,
    "ownerModule": "profile"
  },
  "record5": {
    "code": "identity.credential.rotate",
    "name": "identity.credential.rotate",
    "active": true,
    "ownerModule": "profile"
  },
  "record6": {
    "code": "profile.backoffice.view",
    "name": "profile.backoffice.view",
    "active": true,
    "ownerModule": "profile"
  },
  "record7": {
    "code": "profile.enterprise.search",
    "name": "profile.enterprise.search",
    "active": true,
    "ownerModule": "profile"
  },
  "record8": {
    "code": "profile.enterprise.create",
    "name": "profile.enterprise.create",
    "active": true,
    "ownerModule": "profile"
  },
  "record9": {
    "code": "profile.enterpriseAccess.search",
    "name": "profile.enterpriseAccess.search",
    "active": true,
    "ownerModule": "profile"
  },
  "record10": {
    "code": "profile.enterpriseAccess.assign",
    "name": "profile.enterpriseAccess.assign",
    "active": true,
    "ownerModule": "profile"
  },
  "record11": {
    "code": "profile.enterpriseAccess.register",
    "name": "profile.enterpriseAccess.register",
    "active": true,
    "ownerModule": "profile"
  },
  "record12": {
    "code": "profile.enterpriseAccess.applyDecision",
    "name": "profile.enterpriseAccess.applyDecision",
    "active": true,
    "ownerModule": "profile"
  },
  "record13": {
    "code": "profile.externalIdentity.prepare",
    "name": "profile.externalIdentity.prepare",
    "active": true,
    "ownerModule": "profile"
  },
  "record14": {
    "code": "profile.customer.register",
    "name": "profile.customer.register",
    "active": true,
    "ownerModule": "profile"
  },
  "record15": {
    "code": "profile.scope.read",
    "name": "profile.scope.read",
    "active": true,
    "ownerModule": "profile"
  }
};
