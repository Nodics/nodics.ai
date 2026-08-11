/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module editorial/service/DefaultEditorialLocalizationContributionService @description Evaluates localized Editorial authoring contributions. @layer service @owner editorial */
module.exports = { /** Returns whether a localization contains the minimum ready contribution. */ isReady: function (item) { return Boolean(item && item.articleCode && item.localeCode && item.title && item.slug && item.body && item.status === 'READY'); } };
