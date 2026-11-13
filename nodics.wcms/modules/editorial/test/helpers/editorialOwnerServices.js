/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
/** @module editorial/test/helpers/editorialOwnerServices @description Actual local owner bindings shared by isolated Editorial fixtures; references do not grant Media authority. @layer test @owner editorial */
module.exports = {
    DefaultEditorialFeaturedMediaService: require('../../src/service/defaultEditorialFeaturedMediaService'),
    DefaultEditorialReadinessService: require('../../src/service/defaultEditorialReadinessService'),
};
