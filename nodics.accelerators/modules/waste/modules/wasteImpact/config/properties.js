/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module wasteImpact/config/properties @description Provides Waste Impact calculation defaults. @layer config @owner wasteImpact @override Partner modules may provide project-specific formula profiles and claim policy. */
module.exports = { schemaPolicies: { wasteImpact: { operational: { accessGroups: { adminGroup: 10, serviceAccountUserGroup: 10, employeeUserGroup: 10 } } } }, wasteImpact: { defaultStatus: 'ESTIMATED' } };
