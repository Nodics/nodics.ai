/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module locationCore/src/facade/defaultLocationCoreFacade @description Coordinates Location Core API intents with the Location operation service. @layer facade @owner locationCore */
module.exports = {
    createLocation: function (request) {
        return SERVICE.DefaultLocationOperationService.create(request);
    },

    updateLocation: function (request) {
        return SERVICE.DefaultLocationOperationService.update(request);
    },

    getLocation: function (request) {
        return SERVICE.DefaultLocationOperationService.read(request);
    },

    searchLocations: function (request) {
        return SERVICE.DefaultLocationOperationService.search(request);
    }
};
