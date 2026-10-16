/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module publish/data/accessGroups @description Owns userGroup seed records administered through Profile and Axis. @layer data @owner publish @override Import explicitly; preserve existing governed records on replay. */
module.exports = {
  "record0": {
    "code": "commercePublicationStarterUserGroup",
    "name": "Commerce Publication Starter",
    "active": true,
    "parentGroups": [
      "employeeUserGroup"
    ],
    "permissions": [
      "process.instance.start"
    ]
  }
};
