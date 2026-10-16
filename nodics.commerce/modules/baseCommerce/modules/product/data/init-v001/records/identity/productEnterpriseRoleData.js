/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module product/data/enterpriseRoles @description Owns enterpriseRole seed records administered through Profile and Axis. @layer data @owner product @override Import explicitly; preserve existing governed records on replay. */
module.exports = {
  "record0": {
    "code": "COMMERCE_SETUP_PUBLISHER",
    "name": "Commerce Setup Publisher",
    "active": true,
    "label": "Commerce Setup Publisher",
    "description": "Submits enterprise product and promotion setup publications for independent review without approval or activation authority.",
    "groupCodes": [
      "commerceSetupPublisherUserGroup",
      "commercePublicationStarterUserGroup"
    ],
    "scopeType": "ENTERPRISE",
    "delegable": true,
    "assignmentPermissions": []
  }
};
