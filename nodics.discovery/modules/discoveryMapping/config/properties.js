/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module discoveryMapping/config/properties @description Defines Discovery mapping access policies. @layer config @owner discoveryMapping */
module.exports = { schemaPolicies: { discoveryMapping: { tenantOwned: { accessGroups: { adminGroup: 10, runtimeConfigAdminUserGroup: 10, serviceAccountUserGroup: 10 } } } } };
