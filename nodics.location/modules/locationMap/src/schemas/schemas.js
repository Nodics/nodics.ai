/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module locationMap/src/schemas/schemas
 * @description Schema definition registry for this boundary.
 * @layer definition
 * @owner generated
 * @override Later active modules may extend or replace this registry through Nodics layering.
 */
module.exports = { locationMap: {
    locationMapLayer: Object.assign({ super: 'base', model: true, schemaPolicies: ['operational'], service: { enabled: true }, router: { enabled: false }, cache: { enabled: false }, event: { enabled: false }, search: { enabled: false } }, { definition: {
        code: { type: 'string', required: true },
        name: { type: 'object', required: true },
        categoryCodes: { type: 'array', required: false },
        typeCodes: { type: 'array', required: false },
        capabilityCodes: { type: 'array', required: false },
        defaultVisible: { type: 'bool', required: true, default: true },
        clusteringEnabled: { type: 'bool', required: true, default: true },
        presentation: { type: 'object', required: false },
        visibility: { type: 'object', required: true },
        status: { type: 'string', required: true, enum: ['DRAFT', 'ACTIVE', 'INACTIVE', 'ARCHIVED'] },
        revision: { type: 'int', required: true, default: 0 }
    } })
} };
