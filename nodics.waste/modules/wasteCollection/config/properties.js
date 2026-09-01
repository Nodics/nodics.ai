/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module wasteCollection/config/properties @description Provides Waste Collection defaults. @layer config @owner wasteCollection @override Partner modules may tune collection policies. */
module.exports = { schemaPolicies: { wasteCollection: { operational: { accessGroups: { adminGroup: 10, serviceAccountUserGroup: 10, employeeUserGroup: 10 } } } }, wasteCollection: { defaultReceiptRequired: false } };
