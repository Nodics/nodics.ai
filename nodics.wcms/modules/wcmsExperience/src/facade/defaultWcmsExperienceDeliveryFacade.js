/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module wcmsExperience/facade/defaultWcmsExperienceDeliveryFacade
 * @description Facade boundary for WCMS Experience delivery resolution.
 * @layer facade
 * @owner wcmsExperience
 * @override Project modules may override orchestration without bypassing resolver safety.
 */
module.exports = {
    /** Reads only the existing private preparation manifest. */
    inspectPreparation: function (request) { return SERVICE.DefaultWcmsExperiencePreviewPreparationService.inspect(request); },
    /** Delegates explicit private Staged preparation to its existing owner. */
    preparePreview: function (request) { return SERVICE.DefaultWcmsExperiencePreviewPreparationService.prepare(request); },
    /** Delegates exact pending-writer retirement, without publication or cleanup. */
    abandonPreparation: function (request) { return SERVICE.DefaultWcmsExperiencePreviewPreparationService.abandon(request); },
    /** Resolves a WCMS Experience through the service layer. @param {Object} request Nodics request. @returns {Promise<Object>} Resolved experience. */
    resolve: function (request) {
        return SERVICE.DefaultWcmsExperienceResolverService.resolve(request);
    }
};
