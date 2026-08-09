/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module cms/facade/defaultCmsDesignerCompositionFacade
 * @description Delegates Axis Page Designer authoring intents to the CMS composition service.
 * @layer facade
 * @owner cms
 * @override Later WCMS modules may decorate orchestration while preserving backend-owned Catalog-first authoring authority.
 */
module.exports = {
    /** Initializes the designer facade lifecycle. */
    init: function () { return Promise.resolve(true); },

    /** Completes the designer facade lifecycle. */
    postInit: function () { return Promise.resolve(true); },

    /** Invokes one exported CMS designer composition service operation. */
    invoke: function (operation, request) {
        return SERVICE.DefaultCmsDesignerCompositionService[operation](request);
    }
};
