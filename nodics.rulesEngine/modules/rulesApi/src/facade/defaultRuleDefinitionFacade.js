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
    /** Implements listDefinitions as an overrideable service operation. */
    listDefinitions: function (request) { return SERVICE.DefaultRuleManagementService.listDefinitions(request); },
    /** Implements getDefinition as an overrideable service operation. */
    getDefinition: function (request) { return SERVICE.DefaultRuleManagementService.getDefinition(request); },
    /** Implements createDefinition as an overrideable service operation. */
    createDefinition: function (request) { return SERVICE.DefaultRuleDefinitionLifecycleService.createRuleSet(request); },
    /** Implements updateDraft as an overrideable service operation. */
    updateDraft: function (request) { return SERVICE.DefaultRuleDefinitionLifecycleService.updateRuleSetDraft(request); },
    /** Implements validateDraft as an overrideable service operation. */
    validateDraft: function (request) { return SERVICE.DefaultRuleDefinitionLifecycleService.validateRuleSetDraft(request); },
    /** Implements simulateDraft as an overrideable service operation. */
    simulateDraft: function (request) { return SERVICE.DefaultRuleManagementService.simulateDraft(request); },
    /** Implements prepareNextDraft as an overrideable service operation. */
    prepareNextDraft: function (request) { return SERVICE.DefaultRuleDefinitionLifecycleService.prepareNextRuleSetDraft(request); },
    /** Implements submitForApproval as an overrideable service operation. */
    submitForApproval: function (request) { return SERVICE.DefaultRuleApprovalService.submit(request); },
    /** Implements publishDraft as an overrideable service operation. */
    publishDraft: function (request) { return SERVICE.DefaultRuleDefinitionLifecycleService.publishRuleSetDraft(request); },
    /** Implements listVersions as an overrideable service operation. */
    listVersions: function (request) { return SERVICE.DefaultRuleManagementService.listVersions(request); },
    /** Implements listAudit as an overrideable service operation. */
    listAudit: function (request) { return SERVICE.DefaultRuleManagementService.listAudit(request); },
    /** Implements propertyCatalogue as an overrideable service operation. */
    propertyCatalogue: function (request) { return SERVICE.DefaultRuleManagementService.propertyCatalogue(request); },
    /** Implements propertyValues as an overrideable service operation. */
    propertyValues: function (request) { return SERVICE.DefaultRuleManagementService.propertyValues(request); },
    /** Implements listBandSets as an overrideable service operation. */
    listBandSets: function (request) { return SERVICE.DefaultRuleManagementService.listBandSets(request); },
    /** Implements getBandSet as an overrideable service operation. */
    getBandSet: function (request) { return SERVICE.DefaultRuleManagementService.getBandSet(request); },
    /** Implements listBandVersions as an overrideable service operation. */
    listBandVersions: function (request) { return SERVICE.DefaultRuleManagementService.listBandVersions(request); },
    /** Implements createBandSet as an overrideable service operation. */
    createBandSet: function (request) { return SERVICE.DefaultRuleDefinitionLifecycleService.createBandSet(request); },
    /** Implements updateBandSetDraft as an overrideable service operation. */
    updateBandSetDraft: function (request) { return SERVICE.DefaultRuleDefinitionLifecycleService.updateBandSetDraft(request); },
    /** Implements prepareNextBandSetDraft as an overrideable service operation. */
    prepareNextBandSetDraft: function (request) { return SERVICE.DefaultRuleDefinitionLifecycleService.prepareNextBandSetDraft(request); },
    /** Implements publishBandSetDraft as an overrideable service operation. */
    publishBandSetDraft: function (request) { return SERVICE.DefaultRuleDefinitionLifecycleService.publishBandSetDraft(request); }
};
