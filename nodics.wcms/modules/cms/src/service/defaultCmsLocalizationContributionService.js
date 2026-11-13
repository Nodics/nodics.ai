/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
'use strict';
/** @module cms/service/defaultCmsLocalizationContributionService
 * @description Contributes inert standard workflow copy. Localization owns value approval and release.
 * @owner cms @layer service
 * @override Later owner layers may extend copy through the existing Localization contract, without granting actions. */
module.exports = {
    /** Returns detached definitions; reference translations require explicit owner API review and publication. */
    getLocalizationContribution: function () {
        const source = require('./localization/workflowMessages.json');
        return JSON.parse(JSON.stringify({ ...source, entries: source.entries.map(({ translations, ...entry }) => entry) }));
    }
};
