/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module wasteReward/data/participantAccess @description Owns the customer group for reading self-owned material-value entitlements. @owner wasteReward @layer data */
module.exports = {
  wasteMaterialValueCustomerUserGroup: {
    code: "wasteMaterialValueCustomerUserGroup",
    name: "Waste material-value customer",
    active: true,
    parentGroups: ["customerUserGroup"],
    permissions: ["waste.materialValue.read"],
  },
};
