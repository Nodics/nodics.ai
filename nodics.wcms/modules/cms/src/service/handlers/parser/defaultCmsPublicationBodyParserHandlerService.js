/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const bodyParser = require('body-parser');

/**
 * @module cms/service/handlers/parser/DefaultCmsPublicationBodyParserHandlerService
 * @description Applies the bounded CMS publication-package JSON limit only to internal target deployment routes.
 * @layer service
 * @owner cms
 */
module.exports = {
    /** Executes the documented bounded module operation. */
    init: function () { return Promise.resolve(true); },
    /** Executes the documented bounded module operation. */
    postInit: function () { return Promise.resolve(true); },
    /** Executes the documented bounded module operation. */
    getBodyParser: function () {
        let policy = (CONFIG.get('cms') || {}).publication || {};
        let options = SERVICE.DefaultHttpHardeningService.getJsonParserOptions();
        return [bodyParser.json(Object.assign({}, options, {
            limit: policy.maximumDeploymentRequestBytes || '16mb',
            strict: true,
            type: 'application/json'
        }))];
    }
};
