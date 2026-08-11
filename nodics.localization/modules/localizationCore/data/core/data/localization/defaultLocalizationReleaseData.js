/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
'use strict';

/**
 * @module localizationCore/data/core/data/localization/defaultLocalizationReleaseData
 * @description Provides immutable published releases for the default Axis localization scope.
 * @layer data
 * @owner localizationCore
 */
module.exports = {
    record0: {
        code: '0a3f590a4a907627',
        version: '0a3f590a4a907627',
        locale: 'en',
        namespaces: ['common'],
        entries: {
            'common:action.save': { message: 'Save', parameters: [], exposure: 'PUBLIC', ownerModule: 'localizationCore', resolvedScope: 'STANDARD' },
            'common:action.cancel': { message: 'Cancel', parameters: [], exposure: 'PUBLIC', ownerModule: 'localizationCore', resolvedScope: 'STANDARD' }
        },
        checksum: '0a3f590a4a907627e53efb1e605cbfdc18cfd5ded92488e6c88b337f2dec160b',
        createdBy: 'system',
        createdAt: new Date('2026-08-11T00:00:00.000Z')
    },
    record1: {
        code: 'b6effe65a8ebf79c',
        version: 'b6effe65a8ebf79c',
        locale: 'ar',
        namespaces: ['common'],
        entries: {
            'common:action.save': { message: 'حفظ', parameters: [], exposure: 'PUBLIC', ownerModule: 'localizationCore', resolvedScope: 'STANDARD' },
            'common:action.cancel': { message: 'إلغاء', parameters: [], exposure: 'PUBLIC', ownerModule: 'localizationCore', resolvedScope: 'STANDARD' }
        },
        checksum: 'b6effe65a8ebf79ca7eff3935ad3bb6d1552c2571f3a5ee87a9540838ebe9a03',
        createdBy: 'system',
        createdAt: new Date('2026-08-11T00:00:00.000Z')
    }
};
