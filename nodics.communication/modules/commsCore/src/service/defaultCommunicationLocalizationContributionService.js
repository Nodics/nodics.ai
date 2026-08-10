/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';
/**
 * @module commsCore/service/DefaultCommunicationLocalizationContributionService
 * @description Contributes Communication-owned localization defaults without becoming the Localization runtime authority.
 * @owner commsCore
 * @layer service
 * @override Later Communication modules may replace this contribution through standard service layering.
 */
const contribution = { formatVersion: 1, ownerModule: 'commsCore', entries: [
    { namespace: 'communication', key: 'navigation.title', defaultMessage: 'Communication', parameters: [], exposure: 'OPERATOR' },
    { namespace: 'communication', key: 'delivery.failed', defaultMessage: 'Message delivery failed', parameters: [], exposure: 'AUTHENTICATED' }
] };
module.exports = {
    /** @returns {object} Defensive copy of the Communication localization contribution. */
    getLocalizationContribution: function () { return JSON.parse(JSON.stringify(contribution)); }
};
