/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module wasteCarbon/data/participantAccess @description Defines customer access to owned carbon holdings; Profile retains grant authority. @owner wasteCarbon @layer data */
module.exports = {
  profile: {
    wasteCarbonParticipantUserGroup: {
      options: {
        enabled: true,
        schemaName: "userGroup",
        operation: "ensureReferenceAll",
        dataFilePrefix: "wasteCarbonParticipantUserGroupData",
        userGroups: ["adminGroup"],
      },
      query: { code: "$code" },
    },
  },
};
