/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';
/**
 * @module engagementCore/service/DefaultEngagementLocalizationContributionService
 * @description Contributes Customer Engagement localization defaults while Localization retains bundle authority.
 * @owner engagementCore
 * @layer service
 * @override Later Engagement modules may replace this contribution through standard service layering.
 */
const contribution = { formatVersion: 1, ownerModule: 'engagementCore', entries: [
    { namespace: 'engagement', key: 'navigation.title', defaultMessage: 'Customer Engagement', parameters: [], exposure: 'OPERATOR' },
    { namespace: 'engagement', key: 'feedback.received', defaultMessage: 'Feedback received', parameters: [], exposure: 'PUBLIC' }
] };
module.exports = {
    /** @returns {object} Defensive copy of the Engagement localization contribution. */
    getLocalizationContribution: function () { return JSON.parse(JSON.stringify(contribution)); }
};
