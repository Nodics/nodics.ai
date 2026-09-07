/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module locationMap/src/facade/defaultLocationMapFacade @description Coordinates Location Map API intents with map configuration services. @layer facade @owner locationMap */
module.exports = {
    getEffectiveConfiguration: function (request) {
        return SERVICE.DefaultLocationMapConfigurationOperationService.getEffectiveConfiguration(request);
    },

    getConfiguration: function (request) {
        return SERVICE.DefaultLocationMapConfigurationOperationService.getConfiguration(request);
    },

    saveConfiguration: function (request) {
        return SERVICE.DefaultLocationMapConfigurationOperationService.saveConfiguration(request);
    },

    reverseGeocode: function (request) {
        return SERVICE.DefaultLocationMapConfigurationOperationService.reverseGeocode(request);
    }
};
