/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
/** @module editorial/test/helpers/editorialOwnerServices @description Actual local owner bindings shared by isolated Editorial fixtures; references do not grant Media authority. @layer test @owner editorial */
module.exports = {
    DefaultEditorialFeaturedMediaService: require('../../src/service/defaultEditorialFeaturedMediaService'),
    DefaultEditorialReadinessService: require('../../src/service/defaultEditorialReadinessService'),
};
