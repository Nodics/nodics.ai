/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module locationType/config/properties
 * @description Defines generated configurable defaults for locationType.
 * @layer config
 * @owner generated
 * @override Project, environment, server, node, tenant, or customer layers may override these defaults through Nodics configuration layering.
 */
module.exports = {
    // Inert inventory; an allowed local server must explicitly select this capability.
    localResetProvider: {
        "contributions": {
            "locationType": {
                "serviceNames": {
                    "DefaultLocationCapabilityService": true,
                    "DefaultLocationCategoryService": true,
                    "DefaultLocationTypeService": true
                }
            }
        }
    },

    schemaPolicies: { locationType: { operational: { accessGroups: { adminGroup: 10, serviceAccountUserGroup: 10, employeeUserGroup: 10 } } } }
};
