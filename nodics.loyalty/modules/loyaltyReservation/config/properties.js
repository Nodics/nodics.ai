/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module loyaltyReservation/config/properties @description Defines default reservation policy for reward holds. @layer config @owner loyaltyReservation @override Project layers may shorten or lengthen holds. */
module.exports = {
    schemaPolicies: { loyaltyReservation: {
        operational: { accessGroups: { adminGroup: 10, serviceAccountUserGroup: 10, employeeUserGroup: 10 } }
    } },
    loyalty: {
        reservations: {
            ttlSeconds: 900
        }
    }
};
