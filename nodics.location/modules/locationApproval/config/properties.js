/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module locationApproval/config/properties
 * @description Defines generated configurable defaults for locationApproval.
 * @layer config
 * @owner generated
 * @override Project, environment, server, node, tenant, or customer layers may override these defaults through Nodics configuration layering.
 */
module.exports = {
    schemaPolicies: { locationApproval: { operational: { accessGroups: { adminGroup: 10, serviceAccountUserGroup: 10, employeeUserGroup: 10 } } } }
};
