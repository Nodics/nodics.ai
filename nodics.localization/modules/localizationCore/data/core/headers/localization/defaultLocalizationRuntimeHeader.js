/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
'use strict';

/**
 * @module localizationCore/data/core/headers/localization/defaultLocalizationRuntimeHeader
 * @description Imports the minimal published runtime bundle records needed by Axis after a clean bootstrap.
 * @layer data
 * @owner localizationCore
 */
module.exports = {
    localizationCore: {
        defaultLocalizationKeyData: {
            options: { enabled: true, schemaName: 'localizationKey', operation: 'saveAll', dataFilePrefix: 'defaultLocalizationKeyData' },
            query: { code: '$code' }
        },
        defaultLocalizationValueData: {
            options: { enabled: true, schemaName: 'localizationValue', operation: 'saveAll', dataFilePrefix: 'defaultLocalizationValueData' },
            query: { code: '$code' }
        },
        defaultLocalizationReleaseData: {
            options: { enabled: true, schemaName: 'localizationRelease', operation: 'saveAll', dataFilePrefix: 'defaultLocalizationReleaseData' },
            query: { code: '$code' }
        },
        defaultLocalizationOnlinePointerData: {
            options: { enabled: true, schemaName: 'localizationOnlinePointer', operation: 'saveAll', dataFilePrefix: 'defaultLocalizationOnlinePointerData' },
            query: { code: '$code' }
        }
    }
};
