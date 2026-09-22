/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module profile/data/init-v005/headers/groups/backofficeCircaUserGroupsHeader
 * @description Extends baseline administrative and customer groups for governed BackOffice module activation and Circa wallet access.
 * @layer data
 * @owner profile
 */
module.exports = {
  profile: {
    backofficeCircaUserGroups: {
      options: {
        enabled: true,
        schemaName: "userGroup",
        operation: "saveAll",
        dataFilePrefix: "backofficeCircaUserGroupsData",
        userGroups: ["adminGroup"],
      },
      query: {
        code: "$code",
      },
    },
  },
};
