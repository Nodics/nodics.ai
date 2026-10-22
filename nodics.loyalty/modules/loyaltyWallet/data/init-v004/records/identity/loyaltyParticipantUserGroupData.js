/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module loyaltyWallet/data/participantAccess @description Owns the customer group for reward transfers and partner conversions. @owner loyaltyWallet @layer data */
module.exports = {
  loyaltyParticipantCustomerUserGroup: {
    code: "loyaltyParticipantCustomerUserGroup",
    name: "Loyalty participant customer",
    active: true,
    parentGroups: ["customerUserGroup"],
    permissions: [
      "loyalty.rewards.transfer",
      "loyalty.partnerConversion.read",
      "loyalty.partnerConversion.execute",
    ],
  },
};
