/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module profile/data/init-v003/records/groups/runtimeConfigurationUpdateUserGroupsData
 * @description Grants runtime configuration validation to requesters and runtime value updates to operators.
 * @layer data
 * @owner profile
 */
module.exports = {
  record1: {
    code: "runtimeConfigRequesterUserGroup",
    name: "runtimeConfigRequesterUserGroup",
    active: true,
    parentGroups: ["runtimeConfigViewerUserGroup"],
    permissions: [
      "runtime.config.preview",
      "runtime.config.validate",
      "runtime.config.request.create",
    ],
  },
  record2: {
    code: "runtimeConfigOperatorUserGroup",
    name: "runtimeConfigOperatorUserGroup",
    active: true,
    parentGroups: ["runtimeConfigRequesterUserGroup"],
    permissions: [
      "runtime.config.request.activate",
      "runtime.config.update",
      "runtime.config.rollback",
      "runtime.config.cleanup.preview",
    ],
  },
};
