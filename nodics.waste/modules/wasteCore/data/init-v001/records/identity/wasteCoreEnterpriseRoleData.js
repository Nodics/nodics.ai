/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module wasteCore/data/enterpriseRoles @description Owns enterpriseRole seed records administered through Profile and Axis. @layer data @owner wasteCore @override Import explicitly; preserve existing governed records on replay. */
module.exports = {
  "record0": {
    "code": "WASTE_CENTRE_OPERATOR",
    "name": "Collection centre operator",
    "active": true,
    "label": "Collection centre operator",
    "description": "Collection centre operator within the assigned enterprise or collection-centre scope.",
    "groupCodes": [
      "wasteCentreOperatorUserGroup"
    ],
    "scopeType": "ENTERPRISE",
    "delegable": true,
    "assignmentPermissions": []
  },
  "record1": {
    "code": "WASTE_VERIFIER",
    "name": "Waste verifier",
    "active": true,
    "label": "Waste verifier",
    "description": "Waste verifier within the assigned enterprise or collection-centre scope.",
    "groupCodes": [
      "wasteVerifierUserGroup"
    ],
    "scopeType": "ENTERPRISE",
    "delegable": true,
    "assignmentPermissions": []
  },
  "record2": {
    "code": "WASTE_APPROVER",
    "name": "Waste approver",
    "active": true,
    "label": "Waste approver",
    "description": "Waste approver within the assigned enterprise or collection-centre scope.",
    "groupCodes": [
      "wasteApproverUserGroup"
    ],
    "scopeType": "ENTERPRISE",
    "delegable": true,
    "assignmentPermissions": []
  },
  "record3": {
    "code": "WASTE_COUPON_MANAGER",
    "name": "Coupon manager",
    "active": true,
    "label": "Coupon manager",
    "description": "Coupon manager within the assigned enterprise or collection-centre scope.",
    "groupCodes": [
      "wasteCouponManagerUserGroup"
    ],
    "scopeType": "ENTERPRISE",
    "delegable": true,
    "assignmentPermissions": []
  },
  "record4": {
    "code": "WASTE_MARKETPLACE_MODERATOR",
    "name": "Marketplace moderator",
    "active": true,
    "label": "Marketplace moderator",
    "description": "Marketplace moderator within the assigned enterprise or collection-centre scope.",
    "groupCodes": [
      "wasteMarketplaceModeratorUserGroup"
    ],
    "scopeType": "ENTERPRISE",
    "delegable": true,
    "assignmentPermissions": []
  },
  "record5": {
    "code": "WASTE_AUDITOR",
    "name": "Waste auditor",
    "active": true,
    "label": "Waste auditor",
    "description": "Waste auditor within the assigned enterprise or collection-centre scope.",
    "groupCodes": [
      "wasteAuditorUserGroup"
    ],
    "scopeType": "ENTERPRISE",
    "delegable": true,
    "assignmentPermissions": []
  }
};
