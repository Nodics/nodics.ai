/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';
/**
 * @module flowCore/service/DefaultProcessLocalizationContributionService
 * @description Contributes Process-owned localization defaults for workflow and task operations.
 * @owner flowCore
 * @layer service
 * @override Later Process modules may replace this contribution through standard service layering.
 */
const contribution = { formatVersion: 1, ownerModule: 'flowCore', entries: [
    { namespace: 'process', key: 'navigation.title', defaultMessage: 'Process and Automation', parameters: [], exposure: 'OPERATOR' },
    { namespace: 'process', key: 'task.pending', defaultMessage: '{count, plural, one {One pending task} other {{count} pending tasks}}', parameters: ['count'], exposure: 'OPERATOR' }
] };
module.exports = {
    /** @returns {object} Defensive copy of the Process localization contribution. */
    getLocalizationContribution: function () { return JSON.parse(JSON.stringify(contribution)); }
};
