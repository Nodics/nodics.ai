/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module wasteCore/config/properties @description Provides shared Waste defaults. @layer config @owner wasteCore @override Partner modules may refine policy through configuration layering. */
module.exports = {
    schemaPolicies: { wasteCore: { operational: { accessGroups: { adminGroup: 10, serviceAccountUserGroup: 10, employeeUserGroup: 10 } } } },
    waste: {
        sourceReference: { requiredFields: ['module', 'schema', 'code'] },
        idempotency: { required: true }
    }
};
