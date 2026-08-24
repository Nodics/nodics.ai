/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';
/**
 * @module cronjob/service/DefaultCronjobLocalizationContributionService
 * @description Contributes CronJob-owned localization defaults for scheduled-operation journeys.
 * @owner cronjob
 * @layer service
 * @override Later Cron modules may replace this contribution through standard service layering.
 */
const contribution = { formatVersion: 1, ownerModule: 'cronjob', entries: [
    { namespace: 'cron', key: 'navigation.title', defaultMessage: 'Scheduled Operations', parameters: [], exposure: 'OPERATOR' },
    { namespace: 'cron', key: 'job.failed', defaultMessage: 'Scheduled job {code} failed', parameters: ['code'], exposure: 'OPERATOR' }
] };
module.exports = {
    /** @returns {object} Defensive copy of the CronJob localization contribution. */
    getLocalizationContribution: function () { return JSON.parse(JSON.stringify(contribution)); }
};
