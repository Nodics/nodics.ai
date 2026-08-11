/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
'use strict';

/**
 * @module localizationCore/data/core/data/localization/defaultLocalizationKeyData
 * @description Provides default public localization key contracts required by a fresh Axis runtime.
 * @layer data
 * @owner localizationCore
 */
module.exports = {
    record0: {
        code: 'common.action.save',
        namespace: 'common',
        key: 'action.save',
        defaultMessage: 'Save',
        parameters: [],
        exposure: 'PUBLIC',
        ownerModule: 'localizationCore',
        protected: false,
        overrideScopes: ['STANDARD', 'PROJECT', 'TENANT']
    },
    record1: {
        code: 'common.action.cancel',
        namespace: 'common',
        key: 'action.cancel',
        defaultMessage: 'Cancel',
        parameters: [],
        exposure: 'PUBLIC',
        ownerModule: 'localizationCore',
        protected: false,
        overrideScopes: ['STANDARD', 'PROJECT', 'TENANT']
    }
};
