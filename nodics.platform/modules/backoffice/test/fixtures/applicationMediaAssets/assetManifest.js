/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/**
 * @module backoffice/test/fixtures/applicationMediaAssets/assetManifest
 * @description Declares one project-owned media asset for application initialization publication contracts.
 */
module.exports = Object.freeze([
    { mediaCode: 'sample-product-media', fileName: 'sample-product-media.svg', name: 'Sample product media',
        businessPurpose: 'PRODUCT_PRIMARY_IMAGE', ownerType: 'PRODUCT', ownerCode: 'sampleProduct' }
]);
