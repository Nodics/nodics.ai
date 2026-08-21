/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const bodyParser = require('body-parser');

/**
 * @module media/service/publication/DefaultMediaPublicationBodyParserHandlerService
 * @description Applies bounded JSON parsing for internal path-free media publication asset ingestion.
 * @layer service
 * @owner media
 * @override Deployment layers may tighten payload limits while preserving the internal publication-transfer contract.
 */
module.exports = {
    /** Initializes the parser handler. */
    init: function () { return Promise.resolve(true); },
    /** Completes parser handler initialization. */
    postInit: function () { return Promise.resolve(true); },
    /** Returns the bounded JSON body parser for media publication payloads. */
    getBodyParser: function () {
        let policy = (CONFIG.get('media') || {}).publication || {};
        let options = SERVICE.DefaultHttpHardeningService.getJsonParserOptions();
        return [bodyParser.json(Object.assign({}, options, {
            limit: policy.maximumPublicationRequestBytes || policy.maximumDeploymentRequestBytes || '16mb',
            strict: true,
            type: 'application/json'
        }))];
    }
};
