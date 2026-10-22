/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module wasteImpact/data/carbonEvidencePermissionHeader @description Governed forward Profile permission definition; does not grant access. @owner wasteImpact @layer data */
module.exports = { profile: { wasteImpactCarbonEvidencePermission: {
    options: { enabled: true, schemaName: 'permission', operation: 'ensureReferenceAll', dataFilePrefix: 'wasteImpactCarbonEvidencePermissionData',
        userGroups: ['adminGroup'], ...(typeof CONFIG !== 'undefined' ? { tenants: [CONFIG.get('defaultTenant')] } : {}) },
    query: { code: '$code' }
} } };
