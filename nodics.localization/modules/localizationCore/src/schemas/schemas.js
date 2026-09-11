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
        namespace: { type: 'string', required: true , description: 'Stores the namespace value used by this record.'}, key: { type: 'string', required: true , description: 'Stores the key value used by this record.'}, defaultMessage: { type: 'string', required: true , description: 'Stores the default message value used by this record.'},
        parameters: { type: 'array', required: true, default: [] , description: 'Lists the parameters associated with this record.'}, exposure: { type: 'string', required: true, default: 'PUBLIC' , description: 'Stores the exposure value, using the configured default when no explicit value is provided.'}, ownerModule: { type: 'string', required: true , description: 'Stores the owner module value used by this record.'},
        protected: { type: 'bool', required: true, default: false , description: 'Indicates whether protected applies for this record.'}, overrideScopes: { type: 'array', required: true, default: ['STANDARD', 'PROJECT', 'TENANT'] , description: 'Lists the override scopes associated with this record.'}
    } },
    localizationValue: { super: 'base', model: true, isVersionedEnabled: false, service: { enabled: true }, router: { enabled: false }, definition: {
        namespace: { type: 'string', required: true , description: 'Stores the namespace value used by this record.'}, key: { type: 'string', required: true , description: 'Stores the key value used by this record.'}, locale: { type: 'string', required: true , description: 'Stores the locale code used for language, formatting, and regional behavior.'},
        message: { type: 'string', required: true , description: 'Stores the message value used by this record.'}, state: { type: 'string', required: true, default: 'DRAFT' , description: 'Stores the state value, using the configured default when no explicit value is provided.'}, revision: { type: 'int', required: true, default: 0 , description: 'Tracks the business revision used for governance, review, and optimistic update checks.'},
        scopeType: { type: 'string', required: true, default: 'TENANT', enum: ['STANDARD', 'PROJECT', 'TENANT'] , description: 'Classifies this record by scope type for validation and business handling.'}, scopeCode: { type: 'string', required: false , description: 'Stores the scope code used to classify, link, or resolve this record.'},
        provenance: { type: 'object', required: false , description: 'Stores structured provenance details used by this record.'}, auditTrail: { type: 'array', required: true, default: [] , description: 'Lists the audit trail associated with this record.'}
    } },
    localizationRelease: { super: 'base', model: true, isVersionedEnabled: false, service: { enabled: true }, router: { enabled: false }, definition: {
        version: { type: 'string', required: true , description: 'Stores the version value used by this record.'}, locale: { type: 'string', required: true , description: 'Stores the locale code used for language, formatting, and regional behavior.'}, namespaces: { type: 'array', required: true , description: 'Lists the namespaces associated with this record.'},
        entries: { type: 'object', required: true , description: 'Stores structured entries details used by this record.'}, checksum: { type: 'string', required: true , description: 'Stores the checksum value used by this record.'}, createdBy: { type: 'string', required: true , description: 'Identifies the principal that created this record.'}, createdAt: { type: 'date', required: true , description: 'Records when the created event or value applies.'}
    } },
    localizationOnlinePointer: { super: 'base', model: true, isVersionedEnabled: false, service: { enabled: true }, router: { enabled: false }, definition: {
        locale: { type: 'string', required: true , description: 'Stores the locale code used for language, formatting, and regional behavior.'}, scopeCode: { type: 'string', required: true , description: 'Stores the scope code used to classify, link, or resolve this record.'}, channel: { type: 'string', required: true , description: 'Stores the channel value used by this record.'},
        releaseVersion: { type: 'string', required: true , description: 'Stores the release version value used by this record.'}, previousReleaseVersion: { type: 'string', required: false , description: 'Stores the previous release version value used by this record.'}, revision: { type: 'int', required: true, default: 0 , description: 'Tracks the business revision used for governance, review, and optimistic update checks.'}
    } }
} };
