/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module profile/data/init-v004/headers/groups/serviceAccountCircaUserGroupsHeader
 * @description Adds service-account permissions required by Circa customer registration and photo evidence upload.
 * @layer data
 * @owner profile
 */
module.exports = {
  profile: {
    serviceAccountCircaUserGroups: {
      options: {
        enabled: true,
        schemaName: "userGroup",
        operation: "saveAll",
        dataFilePrefix: "serviceAccountCircaUserGroupsData",
        userGroups: ["adminGroup"],
      },
      query: {
        code: "$code",
      },
    },
  },
};
