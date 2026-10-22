/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module loyaltyWallet/data/participantAccess @description Defines customer participation groups for Loyalty capabilities; Profile retains grant authority. @owner loyaltyWallet @layer data */
module.exports = {
  profile: {
    loyaltyParticipantUserGroup: {
      options: {
        enabled: true,
        schemaName: "userGroup",
        operation: "ensureReferenceAll",
        dataFilePrefix: "loyaltyParticipantUserGroupData",
        userGroups: ["adminGroup"],
      },
      query: { code: "$code" },
    },
  },
};
