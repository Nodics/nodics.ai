/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module discoveryRanking/config/properties @description Defines Discovery ranking defaults. @layer config @owner discoveryRanking */
module.exports = {
    discovery: { ranking: { boostScore: 1000, buryScore: -1000 } },
    schemaPolicies: {
        discoveryRanking: {
            tenantOwned: { accessGroups: { adminGroup: 10, runtimeConfigAdminUserGroup: 10, serviceAccountUserGroup: 10 } }
        }
    }
};
