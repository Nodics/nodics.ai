/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module wasteReward/data/participantAccess @description Defines customer access to owned material-value entitlements; Profile retains grant authority. @owner wasteReward @layer data */
module.exports = {
  profile: {
    wasteMaterialValueParticipantUserGroup: {
      options: {
        enabled: true,
        schemaName: "userGroup",
        operation: "ensureReferenceAll",
        dataFilePrefix: "wasteMaterialValueParticipantUserGroupData",
        userGroups: ["adminGroup"],
      },
      query: { code: "$code" },
    },
  },
};
