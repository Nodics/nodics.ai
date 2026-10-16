/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module nodics.rulesEngine/config/properties @description Composes process-owned policy approval data-release contributions. @layer config @owner rulesEngine @override Later layers may select release placement by runtime role. */
module.exports = {
  data: {
    dataReleases: {
      runtimeRoleProfiles: {
        PROCESS: {
          contributions: [
            {
              moduleName: "rulesApi",
              sections: ["rulesPolicyApproval"],
            },
          ],
        },
      },
    },
  },
};
