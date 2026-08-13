/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/**
 * @module cmsStaged/src/schemas/schemas
 * @description Enables immutable versions only for CMS records transferred from Staged to Online.
 * @layer schemas
 * @owner cms
 */
const versioned = Object.freeze({ isVersionedEnabled: true });

module.exports = {
    cms: {
        cmsSite: versioned,
        cmsPageRoute: versioned,
        cmsPage: versioned,
        cmsComponentDetail: versioned,
        cmsComponent: versioned,
        cmsComponentLocalization: versioned,
        cmsComponentMedia: versioned,
        cmsTypeCode: versioned,
        cmsPageTemplate: versioned,
        cmsSlotDefinition: versioned
    }
};
