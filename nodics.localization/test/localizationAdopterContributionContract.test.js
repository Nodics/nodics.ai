/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
'use strict';
const assert = require('node:assert/strict');
const path = require('node:path');
const root = path.resolve(__dirname, '../..');
const sources = [
    ['localizationCore', 'nodics.localization/modules/localizationCore/src/service/defaultLocalizationCoreLocalizationContributionService.js'],
    ['commsCore', 'nodics.communication/modules/commsCore/src/service/defaultCommunicationLocalizationContributionService.js'],
    ['profile', 'nodics.platform/modules/profile/src/service/defaultProfileLocalizationContributionService.js'],
    ['workflow', 'nodics.process/modules/workflow/src/service/defaultProcessLocalizationContributionService.js'],
    ['engagementCore', 'nodics.engagement/modules/engagementCore/src/service/defaultEngagementLocalizationContributionService.js'],
    ['cronjob', 'nodics.process/modules/cronjob/src/service/defaultCronjobLocalizationContributionService.js']
];
sources.forEach(([owner, file]) => {
    let contribution = require(path.join(root, file)).getLocalizationContribution();
    assert.equal(contribution.ownerModule, owner);
    assert.equal(contribution.formatVersion, 1);
    assert(contribution.entries.length > 0);
    assert(contribution.entries.every(entry => entry.namespace && entry.key && entry.defaultMessage && entry.exposure));
});
[
    ['product', 'nodics.commerce/modules/baseCommerce/modules/product/src/service/defaultProductLocalizationContributionService.js'],
    ['cart', 'nodics.commerce/modules/checkout/modules/cart/src/service/defaultCartLocalizationContributionService.js'],
    ['order', 'nodics.commerce/modules/checkout/modules/order/src/service/defaultOrderLocalizationContributionService.js']
].forEach(([owner, file]) => {
    let contribution = require(path.join(root, file)).getLocalizationContribution();
    assert.equal(contribution.ownerModule, owner);
    assert.equal(contribution.formatVersion, 1);
    assert(contribution.entries.length > 0);
});
assert(require('../modules/localizationCore/src/service/defaultLocalizationCoreBackofficeCapabilityService').getCapability().navigation.length >= 5);
console.log('localizationAdopterContributionContract.test.js passed');
