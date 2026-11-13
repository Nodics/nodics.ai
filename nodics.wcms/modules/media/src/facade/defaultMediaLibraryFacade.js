/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
/**
 * @module media/facade/DefaultMediaLibraryFacade
 * @description Delegates fixed library reads and publication initiation to Media authority.
 * @layer facade
 * @owner media
 * @override Preserve fixed operations and signed context when customizing orchestration.
 */
module.exports = {
    /** Reads exact immutable publication review metadata through the owning Media service. */
    reviewPublication: function (input, request) { return SERVICE.DefaultMediaPublicationReviewService.review(input, request); },
    /** Reads only scoped retained raster bytes, independently of Online delivery. */
    reviewImage: function (input, request) { return SERVICE.DefaultMediaPublicationReviewService.image(input, request); },
    /** Returns a bounded safe library page. */
    list: function (input, request) {
        return SERVICE.DefaultMediaLibraryService.list(input, request);
    },
    /** Returns safe current metadata and permission-filtered commands. */
    inspect: function (input, request) {
        return SERVICE.DefaultMediaLibraryService.inspect(input, request);
    },
    /** Requests the existing governed publication lifecycle without accepting approval decisions. */
    requestPublication: function (input, request) {
        return SERVICE.DefaultMediaLibraryService.requestPublication(
            input,
            request
        );
    }
};
