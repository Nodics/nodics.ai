/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/**
 * @module nodics.process/modules/workflow/modules/flowApi/src/facade/defaultProcessDefinitionFacade
 * @description Facade boundary for process definition lifecycle APIs.
 * @layer facade
 * @owner flowApi
 * @override Customer process overlays may add approval, policy, or domain-specific orchestration before delegating to lifecycle services.
 */
module.exports = {
    /** Delegates definition listing. */
    listDefinitions: function (request) { return SERVICE.DefaultProcessDefinitionLifecycleService.listDefinitions(request); },
    /** Delegates definition read. */
    getDefinition: function (request) { return SERVICE.DefaultProcessDefinitionLifecycleService.getDefinition(request); },
    /** Delegates draft creation. */
    createDefinition: function (request) { return SERVICE.DefaultProcessDefinitionLifecycleService.createDefinition(request); },
    /** Delegates draft update. */
    updateDraft: function (request) { return SERVICE.DefaultProcessDefinitionLifecycleService.updateDraft(request); },
    /** Delegates draft validation. */
    validateDraft: function (request) { return SERVICE.DefaultProcessDefinitionLifecycleService.validateDraft(request); },
    /** Delegates draft publication. */
    publishDraft: function (request) { return SERVICE.DefaultProcessDefinitionLifecycleService.publishDraft(request); },
    /** Delegates draft delete or published archive. */
    deleteOrArchive: function (request) { return SERVICE.DefaultProcessDefinitionLifecycleService.deleteOrArchive(request); },
    /** Delegates version listing. */
    listVersions: function (request) { return SERVICE.DefaultProcessDefinitionLifecycleService.listVersions(request); }
};
