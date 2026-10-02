/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
"use strict";
/** @module backoffice/test/fixtures/applicationMediaAssets/readinessManifest
 * @description Independent 37-asset fixture for bounded setup readiness transport; no business records or live imports.
 * @layer test
 * @owner backoffice
 */
module.exports = Object.freeze(
  Array.from({ length: 37 }, (_, index) => ({
    ...require("./assetManifest")[0],
    mediaCode: `sample-asset-${index}`,
  })),
);
