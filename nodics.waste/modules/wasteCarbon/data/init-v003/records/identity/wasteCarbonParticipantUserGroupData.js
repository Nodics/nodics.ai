/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module wasteCarbon/data/participantAccess @description Owns the customer group for reading self-owned carbon holdings. @owner wasteCarbon @layer data */
module.exports = {
  wasteCarbonCustomerUserGroup: {
    code: "wasteCarbonCustomerUserGroup",
    name: "Waste carbon customer",
    active: true,
    parentGroups: ["customerUserGroup"],
    permissions: ["carbon.holdings.read"],
  },
};
