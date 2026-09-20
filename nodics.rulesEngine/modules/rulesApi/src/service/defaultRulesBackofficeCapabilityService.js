/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module rulesApi/src/service/defaultRulesBackofficeCapabilityService @description Publishes the rulesApi-owned BackOffice capability through the standard capability builder. @layer service @owner rulesApi */
module.exports = {
    init: function () {
        SERVICE.DefaultModuleRegistrationAgentService.registerBackofficeCapabilityProvider('rulesApi', this);
        return Promise.resolve(true);
    },
    postInit: function () { return Promise.resolve(true); },
    capabilityData: function () {
        return require('../../data/backoffice/rulesApiBackofficeCapabilityData');
    },
    capabilityDataService: function () {
        return typeof SERVICE !== 'undefined' && SERVICE.DefaultBackofficeCapabilityDataService
            ? SERVICE.DefaultBackofficeCapabilityDataService
            : require('../../../../../nodics.foundation/modules/nService/src/service/module/defaultBackofficeCapabilityDataService');
    },
    buildCapability: function (data) {
        return this.capabilityDataService().capability(data);
    },
    getCapability: function () {
        return this.buildCapability(this.capabilityData());
    }
};
