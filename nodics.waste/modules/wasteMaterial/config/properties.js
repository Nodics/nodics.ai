/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module wasteMaterial/config/properties @description Provides Waste Material schema policy defaults. @layer config @owner wasteMaterial @override Partner modules may add taxonomy seed/configuration. */
module.exports = { schemaPolicies: { wasteMaterial: { operational: { accessGroups: { adminGroup: 10, serviceAccountUserGroup: 10, employeeUserGroup: 10 } } } } };
