/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module wasteReward/data/permissionHeader @description Governed Profile permission contribution. @owner wasteReward @layer data */
module.exports = { profile: { wasteRewardPermission: {
    options: { enabled: true, schemaName: 'permission', operation: 'ensureReferenceAll', dataFilePrefix: 'wasteRewardPermissionData', userGroups: ['adminGroup'],
        ...(typeof CONFIG !== 'undefined' ? { tenants: [CONFIG.get('defaultTenant')] } : {}) },
    query: { code: '$code' }
} } };
