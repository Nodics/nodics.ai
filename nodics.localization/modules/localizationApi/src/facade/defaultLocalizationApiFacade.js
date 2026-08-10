/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
'use strict';
/** @module localizationApi/facade/DefaultLocalizationApiFacade @description Delegates bounded localization API DTOs to authority services without exposing schema CRUD. @layer facade @owner localizationApi @override Audience projections may narrow fields but cannot weaken authorization. */
module.exports = {
    /** Gets one public published runtime bundle. */ getRuntimeBundle: function (request) { return SERVICE.DefaultLocalizationBundleService.get(request); },
    /** Imports one validated module contribution. */ importContribution: function (request) { return SERVICE.DefaultLocalizationImportExportService.importContribution(request.payload, request); },
    /** Exports one authorized translation work package. */ exportPackage: function (request) { return SERVICE.DefaultLocalizationImportExportService.exportPackage(request); },
    /** Delegates coverage projection. */ coverage: function (request) { return SERVICE.DefaultLocalizationOperationsService.coverage(request); },
    /** Delegates translation queue projection. */ queue: function (request) { return SERVICE.DefaultLocalizationOperationsService.queue(request); },
    /** Delegates side-by-side projection. */ sideBySide: function (request) { return SERVICE.DefaultLocalizationOperationsService.sideBySide(request); },
    /** Delegates lifecycle analytics projection. */ analytics: function (request) { return SERVICE.DefaultLocalizationOperationsService.analytics(request); },
    /** Delegates draft persistence. */ saveDraft: function (request) { return SERVICE.DefaultLocalizationValueLifecycleService.saveDraft(request); },
    /** Delegates review submission. */ submitReview: function (request) { return SERVICE.DefaultLocalizationValueLifecycleService.submitReview(request); },
    /** Delegates translation approval. */ approve: function (request) { return SERVICE.DefaultLocalizationValueLifecycleService.approve(request); },
    /** Delegates non-publishable suggestion generation. */ suggest: function (request) { return SERVICE.DefaultLocalizationMachineTranslationService.suggest(request); },
    /** Delegates immutable release construction. */ buildRelease: function (request) { return SERVICE.DefaultLocalizationReleaseManagementService.build(request); },
    /** Publishes an approved release through the shared publication authority. */ publishRelease: function (request) { return SERVICE.DefaultPublicationLifecycleService.publishApproved(Object.assign({}, request, { publication: { code: request.publicationCode || ['localization', request.scopeCode, request.channel, request.locale, request.version].join('.'), domain: 'localization', rootType: 'localizationScope', rootCode: request.scopeCode, sourceVersion: request.version } })); },
    /** Delegates rollback through the shared publication authority. */ rollbackRelease: function (request) { return SERVICE.DefaultPublicationLifecycleService.rollback(request); }
};
