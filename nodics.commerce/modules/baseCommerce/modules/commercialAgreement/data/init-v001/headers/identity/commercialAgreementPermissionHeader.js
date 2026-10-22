/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module commercialAgreement/data/permissionHeader @description Explicit Profile permission definition import, never automatic grants. @layer data @owner commercialAgreement */
module.exports = { profile: { commercialAgreementPermission: {
    options: { enabled: true, schemaName: 'permission', operation: 'ensureReferenceAll',
        dataFilePrefix: 'commercialAgreementPermissionData', userGroups: ['adminGroup'],
        ...(typeof CONFIG !== 'undefined' ? { tenants: [CONFIG.get('defaultTenant')] } : {}) },
    query: { code: '$code' }
} } };
