/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module profile/data/init-v002/headers/groups/runtimeConfigurationUserGroupsHeader
 * @description Adds runtime configuration read permissions through a new governed Profile init release.
 * @layer data
 * @owner profile
 */
module.exports = {
  profile: {
    runtimeConfigurationUserGroups: {
      options: {
        enabled: true,
        schemaName: "userGroup",
        operation: "saveAll",
        dataFilePrefix: "runtimeConfigurationUserGroupsData",
        userGroups: ["adminGroup"],
      },
      query: {
        code: "$code",
      },
    },
  },
};
