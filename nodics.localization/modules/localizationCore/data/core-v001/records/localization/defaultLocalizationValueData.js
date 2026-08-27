/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
'use strict';

/**
 * @module localizationCore/data/core-v001/records/localization/defaultLocalizationValueData
 * @description Provides approved default values used to build the initial Axis localization bundles.
 * @layer data
 * @owner localizationCore
 */
module.exports = {
    record0: {
        active: true,
        code: 'STANDARD.default.en.common.action.save',
        namespace: 'common',
        key: 'action.save',
        locale: 'en',
        message: 'Save',
        state: 'APPROVED',
        revision: 1,
        scopeType: 'STANDARD',
        scopeCode: 'default',
        provenance: { source: 'localizationCore.default' },
        auditTrail: [{ toState: 'APPROVED', actor: 'system', reason: 'Initial runtime bundle seed' }]
    },
    record1: {
        active: true,
        code: 'STANDARD.default.en.common.action.cancel',
        namespace: 'common',
        key: 'action.cancel',
        locale: 'en',
        message: 'Cancel',
        state: 'APPROVED',
        revision: 1,
        scopeType: 'STANDARD',
        scopeCode: 'default',
        provenance: { source: 'localizationCore.default' },
        auditTrail: [{ toState: 'APPROVED', actor: 'system', reason: 'Initial runtime bundle seed' }]
    },
    record2: {
        active: true,
        code: 'STANDARD.default.ar.common.action.save',
        namespace: 'common',
        key: 'action.save',
        locale: 'ar',
        message: 'حفظ',
        state: 'APPROVED',
        revision: 1,
        scopeType: 'STANDARD',
        scopeCode: 'default',
        provenance: { source: 'localizationCore.default' },
        auditTrail: [{ toState: 'APPROVED', actor: 'system', reason: 'Initial runtime bundle seed' }]
    },
    record3: {
        active: true,
        code: 'STANDARD.default.ar.common.action.cancel',
        namespace: 'common',
        key: 'action.cancel',
        locale: 'ar',
        message: 'إلغاء',
        state: 'APPROVED',
        revision: 1,
        scopeType: 'STANDARD',
        scopeCode: 'default',
        provenance: { source: 'localizationCore.default' },
        auditTrail: [{ toState: 'APPROVED', actor: 'system', reason: 'Initial runtime bundle seed' }]
    }
};
