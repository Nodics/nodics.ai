/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module locationCore/src/schemas/schemas
 * @description Schema definition registry for this boundary.
 * @layer definition
 * @owner generated
 * @override Later active modules may extend or replace this registry through Nodics layering.
 */
module.exports = { locationCore: {
    location: Object.assign({ super: 'base', model: true, schemaPolicies: ['operational'], service: { enabled: true }, router: { enabled: false }, cache: { enabled: false }, event: { enabled: false }, search: { enabled: false } }, { definition: {
        code: { type: 'string', required: true },
        name: { type: 'object', required: true },
        categoryCode: { type: 'string', required: true },
        typeCode: { type: 'string', required: true },
        status: { type: 'string', required: true, enum: ['DRAFT', 'PENDING_APPROVAL', 'ACTIVE', 'INACTIVE', 'REJECTED', 'ARCHIVED'] },
        latitude: { type: 'number', required: true },
        longitude: { type: 'number', required: true },
        addressRef: { type: 'object', required: true },
        contactRefs: { type: 'array', required: false },
        openingHours: { type: 'object', required: false },
        capabilityCodes: { type: 'array', required: false },
        visibility: { type: 'object', required: true },
        sourceRef: { type: 'object', required: true },
        parentLocationCode: { type: 'string', required: false },
        enterpriseRef: { type: 'object', required: false },
        operatorEnterpriseRef: { type: 'object', required: false },
        mediaRefs: { type: 'array', required: false },
        presentation: { type: 'object', required: false },
        quality: { type: 'object', required: false },
        revision: { type: 'int', required: true, default: 0 }
    } })
} };
