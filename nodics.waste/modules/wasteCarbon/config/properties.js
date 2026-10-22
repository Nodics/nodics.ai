/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module wasteCarbon/config/properties @description Complete reusable defaults and validation bounds. Evidence selection remains governed data; no provider is qualified by default. @owner wasteCarbon @layer config @override Later layers supply intentional value overrides only. */
module.exports = {
    wasteCarbon: {
        profile: { connectionName: 'profile', targetAuthority: { runtimeRole: 'PLATFORM' }, timeoutMs: 10000 },
        evidence: { providerService: null, qualificationRef: null, allowSynthetic: false },
        validation: {
            quantityScale: { minimum: 0, maximum: 8 }, quantityDigits: { minimum: 1, maximum: 100 },
            operationalLimit: { minimum: 1, maximum: 100000 }, timeoutMs: { minimum: 1, maximum: 100000 }
        },
        limits: { quantityScale: 8, quantityDigits: 30, allocationsPerLot: 500, operationsPerLot: 2000, pageSize: 50, providerTimeoutMs: 10000 }
    },
    schemaPolicies: { wasteCarbon: { operational: { accessGroups: { serviceAccountUserGroup: 10, adminGroup: 10 } } } },
    apiExposure: { categories: { carbonInternal: { enabled: true }, carbonRead: { enabled: true } } }
};
