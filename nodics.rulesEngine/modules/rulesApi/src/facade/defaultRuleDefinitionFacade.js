/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module rulesApi/src/facade/defaultRuleDefinitionFacade @description Facade boundary for Rules definition lifecycle and simulation APIs. @layer facade @owner rulesApi */
module.exports = {
    listDefinitions: function (request) { return SERVICE.DefaultRuleManagementService.listDefinitions(request); },
    getDefinition: function (request) { return SERVICE.DefaultRuleManagementService.getDefinition(request); },
    createDefinition: function (request) { return SERVICE.DefaultRuleDefinitionLifecycleService.createRuleSet(request); },
    updateDraft: function (request) { return SERVICE.DefaultRuleDefinitionLifecycleService.updateRuleSetDraft(request); },
    validateDraft: function (request) { return SERVICE.DefaultRuleDefinitionLifecycleService.validateRuleSetDraft(request); },
    simulateDraft: function (request) { return SERVICE.DefaultRuleManagementService.simulateDraft(request); },
    prepareNextDraft: function (request) { return SERVICE.DefaultRuleDefinitionLifecycleService.prepareNextRuleSetDraft(request); },
    submitForApproval: function (request) { return SERVICE.DefaultRuleApprovalService.submit(request); },
    publishDraft: function (request) { return SERVICE.DefaultRuleDefinitionLifecycleService.publishRuleSetDraft(request); },
    listVersions: function (request) { return SERVICE.DefaultRuleManagementService.listVersions(request); },
    propertyCatalogue: function (request) { return SERVICE.DefaultRuleManagementService.propertyCatalogue(request); },
    propertyValues: function (request) { return SERVICE.DefaultRuleManagementService.propertyValues(request); },
    listBandSets: function (request) { return SERVICE.DefaultRuleManagementService.listBandSets(request); },
    getBandSet: function (request) { return SERVICE.DefaultRuleManagementService.getBandSet(request); },
    listBandVersions: function (request) { return SERVICE.DefaultRuleManagementService.listBandVersions(request); },
    createBandSet: function (request) { return SERVICE.DefaultRuleDefinitionLifecycleService.createBandSet(request); },
    updateBandSetDraft: function (request) { return SERVICE.DefaultRuleDefinitionLifecycleService.updateBandSetDraft(request); },
    publishBandSetDraft: function (request) { return SERVICE.DefaultRuleDefinitionLifecycleService.publishBandSetDraft(request); }
};
