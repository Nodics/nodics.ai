/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module loyaltyCore/config/properties @description Provides shared Loyalty defaults. @layer config @owner loyaltyCore @override Later active modules may refine defaults through configuration layering. */
module.exports = {
    schemaPolicies: { loyaltyCore: {
        operational: { accessGroups: { adminGroup: 10, serviceAccountUserGroup: 10, employeeUserGroup: 10 } }
    } },
    loyalty: {
        amount: {
            scale: 2,
            roundingMode: 'HALF_UP'
        },
        idempotency: {
            required: true
        }
    }
};
