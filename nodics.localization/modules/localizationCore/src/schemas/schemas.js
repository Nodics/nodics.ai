/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module localizationCore/src/schemas/schemas
 * @description Schema definition registry for this boundary.
 * @layer definition
 * @owner generated
 * @override Later active modules may extend or replace this registry through Nodics layering.
 */
module.exports = { localizationCore: {
    localizationKey: { super: 'base', model: true, isVersionedEnabled: false, service: { enabled: true }, router: { enabled: false }, definition: {
        namespace: { type: 'string', required: true }, key: { type: 'string', required: true }, defaultMessage: { type: 'string', required: true },
        parameters: { type: 'array', required: true, default: [] }, exposure: { type: 'string', required: true, default: 'PUBLIC' }, ownerModule: { type: 'string', required: true },
        protected: { type: 'bool', required: true, default: false }, overrideScopes: { type: 'array', required: true, default: ['STANDARD', 'PROJECT', 'TENANT'] }
    } },
    localizationValue: { super: 'base', model: true, isVersionedEnabled: false, service: { enabled: true }, router: { enabled: false }, definition: {
        namespace: { type: 'string', required: true }, key: { type: 'string', required: true }, locale: { type: 'string', required: true },
        message: { type: 'string', required: true }, state: { type: 'string', required: true, default: 'DRAFT' }, revision: { type: 'int', required: true, default: 0 },
        scopeType: { type: 'string', required: true, default: 'TENANT', enum: ['STANDARD', 'PROJECT', 'TENANT'] }, scopeCode: { type: 'string', required: false },
        provenance: { type: 'object', required: false }, auditTrail: { type: 'array', required: true, default: [] }
    } },
    localizationRelease: { super: 'base', model: true, isVersionedEnabled: false, service: { enabled: true }, router: { enabled: false }, definition: {
        version: { type: 'string', required: true }, locale: { type: 'string', required: true }, namespaces: { type: 'array', required: true },
        entries: { type: 'object', required: true }, checksum: { type: 'string', required: true }, createdBy: { type: 'string', required: true }, createdAt: { type: 'date', required: true }
    } },
    localizationOnlinePointer: { super: 'base', model: true, isVersionedEnabled: false, service: { enabled: true }, router: { enabled: false }, definition: {
        locale: { type: 'string', required: true }, scopeCode: { type: 'string', required: true }, channel: { type: 'string', required: true },
        releaseVersion: { type: 'string', required: true }, previousReleaseVersion: { type: 'string', required: false }, revision: { type: 'int', required: true, default: 0 }
    } }
} };
