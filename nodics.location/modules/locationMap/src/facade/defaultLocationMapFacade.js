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
    /** Delegates retrieval of the public-safe map configuration through the Location owner. */
    getPublicConfiguration: function (request) {
        return SERVICE.DefaultLocationMapConfigurationOperationService.getPublicConfiguration(request);
    },

    /** Delegates effective map configuration resolution through the Location owner. */
    getEffectiveConfiguration: function (request) {
        return SERVICE.DefaultLocationMapConfigurationOperationService.getEffectiveConfiguration(request);
    },

    /** Delegates the authorized map configuration read to the Location owner. */
    getConfiguration: function (request) {
        return SERVICE.DefaultLocationMapConfigurationOperationService.getConfiguration(request);
    },

    /** Delegates a map configuration change to the owning validation and persistence operation. */
    saveConfiguration: function (request) {
        return SERVICE.DefaultLocationMapConfigurationOperationService.saveConfiguration(request);
    },

    /** Delegates coordinate-to-address lookup through the configured Location provider. */
    reverseGeocode: function (request) {
        return SERVICE.DefaultLocationMapConfigurationOperationService.reverseGeocode(request);
    }
};
