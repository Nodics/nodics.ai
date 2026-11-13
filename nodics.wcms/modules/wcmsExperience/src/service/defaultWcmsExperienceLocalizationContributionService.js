/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
'use strict';
/** @module wcmsExperience/service/defaultWcmsExperienceLocalizationContributionService
 * @description Contributes inert standard workflow copy. Localization owns value approval and release.
 * @owner wcmsExperience @layer service
 * @override Later owner layers may extend copy through the existing Localization contract, without granting actions. */
module.exports = {
    /** Returns detached definitions; reference translations require explicit owner API review and publication. */
    getLocalizationContribution: function () {
        const source = require('./localization/workflowMessages.json');
        return JSON.parse(JSON.stringify({ ...source, entries: source.entries.map(({ translations, ...entry }) => entry) }));
    }
};
