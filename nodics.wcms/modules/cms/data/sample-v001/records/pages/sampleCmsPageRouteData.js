/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module cms/data/sample-v001/sampleCmsPageRouteData @description Provides English and Arabic routes pointing to one representative localized page. @layer data @owner cms */
module.exports = {
    record0: {
        code: 'sampleLocalizedHomePage-en-route',
        site: 'sampleLocalizedCmsSite',
        path: '/localized-home',
        locale: 'en',
        channel: 'web',
        page: 'sampleLocalizedHomePage',
        routeType: 'PAGE',
        deliveryState: 'ONLINE',
        accessMode: 'PUBLIC',
        active: true
    },
    record1: {
        code: 'sampleLocalizedHomePage-ar-route',
        site: 'sampleLocalizedCmsSite',
        path: '/localized-home',
        locale: 'ar',
        channel: 'web',
        page: 'sampleLocalizedHomePage',
        routeType: 'PAGE',
        deliveryState: 'ONLINE',
        accessMode: 'PUBLIC',
        active: true
    }
};
