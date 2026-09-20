/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/**
 * @module modules/nexus.web/data/sample-v001/content/records/media/nexusMediaData
 * @description Defines Nexus media records that hydrate release-owned assets into WCMS Staged media storage.
 * @layer data
 * @owner nexus.web
 * @override Customer projects may extend or replace this artifact in their own project layer.
 */

/** @lifecycle PUBLISHABLE @destination WCMS_STAGED @owner nexus.web */

const assets = require('../../assets/nexus-cms-media/assetManifest');

const media = function (asset) {
  return {
    code: asset.mediaCode,
    name: asset.name,
    description: asset.description,
    folderCode: asset.folderCode,
    formatCode: asset.formatCode,
    businessPurpose: asset.businessPurpose,
    ownerType: asset.ownerType,
    ownerReference: asset.ownerCode,
    reusable: false,
    legalHold: false,
    active: true,
    asset: {
      sourceFile: 'content/assets/nexus-cms-media/files/' + asset.fileName
    }
  };
};

module.exports = Object.freeze(Object.fromEntries(
  assets.map((asset, index) => ['record' + index, media(asset)])
));
