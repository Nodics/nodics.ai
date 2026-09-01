/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module wasteCompliance/config/properties @description Provides Waste Compliance schema policy defaults. @layer config @owner wasteCompliance @override Partner modules may add jurisdiction-specific profiles. */
module.exports = { schemaPolicies: { wasteCompliance: { operational: { accessGroups: { adminGroup: 10, serviceAccountUserGroup: 10, employeeUserGroup: 10 } } } } };
