/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';
/**
 * @module auth/service/DefaultAuthLocalizationContributionService
 * @description Contributes Authentication-owned messages without claiming a database data release.
 * @owner auth
 * @layer service
 * @override Later Authentication layers may replace non-protected entries through standard service layering.
 */
const contribution = {
    formatVersion: 1,
    ownerModule: 'nAuth',
    entries: [{
        namespace: 'auth',
        key: 'invalidCredentials',
        defaultMessage: 'The employee identifier or password is incorrect.',
        parameters: [],
        exposure: 'PUBLIC'
    }]
};

module.exports = {
    /** @returns {object} Defensive copy of the Authentication localization contribution. */
    getLocalizationContribution: function () { return JSON.parse(JSON.stringify(contribution)); }
};
