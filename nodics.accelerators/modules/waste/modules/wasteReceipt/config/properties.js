/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module wasteReceipt/config/properties @description Provides Waste Receipt schema policy defaults. @layer config @owner wasteReceipt @override Partner modules may tune receipt policy. */
module.exports = { schemaPolicies: { wasteReceipt: { operational: { accessGroups: { adminGroup: 10, serviceAccountUserGroup: 10, employeeUserGroup: 10 } } } } };
