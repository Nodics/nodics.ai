/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
'use strict';

/**
 * @module localizationCore/data/core-v001/records/localization/defaultLocalizationOnlinePointerData
 * @description Activates the default Axis localization releases for the public web channel.
 * @layer data
 * @owner localizationCore
 */
module.exports = {
    record0: {
        active: true,
        code: 'axisCmsSite.web.en',
        locale: 'en',
        scopeCode: 'axisCmsSite',
        channel: 'web',
        releaseVersion: '0',
        revision: 0
    },
    record1: {
        active: true,
        code: 'axisCmsSite.web.ar',
        locale: 'ar',
        scopeCode: 'axisCmsSite',
        channel: 'web',
        releaseVersion: '0',
        revision: 0
    }
};
