/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module profile/data/init-v002/records/groups/runtimeConfigurationUserGroupsData
 * @description Updates the Runtime Configuration viewer group with the schema and effective-value read permissions required by Axis.
 * @layer data
 * @owner profile
 */
module.exports = {
  record1: {
    code: "runtimeConfigViewerUserGroup",
    name: "runtimeConfigViewerUserGroup",
    active: true,
    parentGroups: ["employeeUserGroup"],
    permissions: [
      "runtime.config.schema.view",
      "runtime.config.effective.view",
      "runtime.config.history.view",
      "runtime.config.summary.view",
      "runtime.config.request.view",
    ],
  },
};
