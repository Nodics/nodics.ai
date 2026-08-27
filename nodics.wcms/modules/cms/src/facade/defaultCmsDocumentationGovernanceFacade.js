/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/**
 * @module cms/facade/defaultCmsDocumentationGovernanceFacade
 * @description Delegates Axis documentation management requests to CMS-owned documentation governance services.
 * @layer facade
 * @owner cms
 * @override Later modules may decorate the facade while preserving CMS content-catalog authority and nPublish handoff boundaries.
 */
module.exports = {
    /** Initializes the documentation governance facade lifecycle. */
    init: function () { return Promise.resolve(true); },

    /** Completes documentation governance facade startup. */
    postInit: function () { return Promise.resolve(true); },

    /** Resolves the documentation governance service. */
    service: function () { return SERVICE.DefaultCmsDocumentationGovernanceService; },

    /** Invokes one exported documentation governance operation. */
    invoke: function (operation, request) {
        return this.service()[operation](request);
    }
};
