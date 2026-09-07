/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module locationMap/src/service/defaultLocationMapBackofficeCapabilityService @description Publishes Location Map BackOffice metadata for Axis discovery. @layer service @owner locationMap */
module.exports = {
    /** Registers Location Map as a concrete BackOffice capability provider. */
    init: function () {
        SERVICE.DefaultModuleRegistrationAgentService.registerBackofficeCapabilityProvider('locationMap', this);
        return Promise.resolve(true);
    },

    /** Completes provider lifecycle initialization. */
    postInit: function () { return Promise.resolve(true); },

    /** Returns the module-owned declarative BackOffice capability data. */
    capabilityData: function () {
        return require('../../data/core-v001/records/backoffice/locationMapBackofficeCapabilityData');
    },
    /** Returns the effective shared BackOffice capability data builder. */
    capabilityDataService: function () {
        return typeof SERVICE !== 'undefined' && SERVICE.DefaultBackofficeCapabilityDataService ?
            SERVICE.DefaultBackofficeCapabilityDataService :
            require('../../../../../nodics.foundation/modules/nService/src/service/module/defaultBackofficeCapabilityDataService');
    },

    /** Builds the Location Map capability from module-owned data. */
    buildCapability: function (data) {
        return this.capabilityDataService().capability(data);
    },

    /** Returns the Location Map BackOffice capability contract. */
    getCapability: function () {
        return this.buildCapability(this.capabilityData());
    }
};
