/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';
/**
 * @module localizationCore/service/DefaultLocalizationCoreLocalizationContributionService
 * @description Supplies the protected Localization capability's own default messages and navigation labels.
 * @owner localizationCore
 * @layer service
 * @override Later standard Localization layers may replace only entries permitted by contribution policy.
 */
const contribution = { formatVersion: 1, ownerModule: 'localizationCore', entries: [
    { namespace: 'localization', key: 'navigation.title', defaultMessage: 'Localization Operations', parameters: [], exposure: 'PUBLIC' },
    { namespace: 'localization', key: 'navigation.coverage', defaultMessage: 'Coverage', parameters: [], exposure: 'PUBLIC' },
    { namespace: 'localization', key: 'navigation.keys', defaultMessage: 'Translation Keys', parameters: [], exposure: 'PUBLIC' },
    { namespace: 'localization', key: 'navigation.queue', defaultMessage: 'Translation Queue', parameters: [], exposure: 'PUBLIC' },
    { namespace: 'localization', key: 'navigation.releases', defaultMessage: 'Translation Releases', parameters: [], exposure: 'PUBLIC' },
    { namespace: 'localization', key: 'navigation.memory', defaultMessage: 'Translation Memory', parameters: [], exposure: 'PUBLIC' },
    { namespace: 'localization', key: 'internal.protected', defaultMessage: 'Protected localization contract', parameters: [], exposure: 'INTERNAL', protected: true, overrideScopes: ['STANDARD'] }
] };
module.exports = {
    /** @returns {object} Defensive copy of the Localization core contribution. */
    getLocalizationContribution: function () { return JSON.parse(JSON.stringify(contribution)); }
};
