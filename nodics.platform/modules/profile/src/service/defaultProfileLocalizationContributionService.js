/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';
/**
 * @module profile/service/DefaultProfileLocalizationContributionService
 * @description Contributes Profile-owned localization defaults for identity and employee access journeys.
 * @owner profile
 * @layer service
 * @override Later Profile layers may replace non-protected entries through standard service layering.
 */
const contribution = { formatVersion: 1, ownerModule: 'profile', entries: [
    { namespace: 'profile', key: 'navigation.title', defaultMessage: 'People and access', parameters: [], exposure: 'OPERATOR' },
    { namespace: 'profile', key: 'login.failed', defaultMessage: 'Sign-in failed', parameters: [], exposure: 'PUBLIC', protected: true, overrideScopes: ['STANDARD'] }
] };
module.exports = {
    /** @returns {object} Defensive copy of the Profile localization contribution. */
    getLocalizationContribution: function () { return JSON.parse(JSON.stringify(contribution)); }
};
