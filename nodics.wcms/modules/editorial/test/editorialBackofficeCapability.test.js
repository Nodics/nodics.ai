/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const assert = require('assert');
global.SERVICE = {
    DefaultBackofficeCapabilityDefinitionService: {
        workbench: value => value,
        capability: value => value
    }
};
const provider = require('../src/service/defaultEditorialBackofficeCapabilityService');
const capability = provider.getCapability();
assert.equal(capability.capabilityId, 'wcms-editorial');
assert.equal(capability.navigation.length, 16);
assert.deepEqual(capability.navigation.map(item => item.id), [
    'editorial-content',
    'editorial-articles',
    'editorial-news',
    'editorial-blogs',
    'article-editor',
    'editorial-review-approval',
    'editorial-localizations',
    'editorial-authors',
    'editorial-taxonomy',
    'editorial-series',
    'featured-special-content',
    'editorial-corrections',
    'editorial-content-types',
    'editorial-calendar',
    'editorial-preview-distribution',
    'editorial-history-insights'
]);
assert.equal(capability.navigation.find(item => item.id === 'editorial-news').presentation.fixedFilters[0].value, 'NEWS');
assert.equal(capability.navigation.find(item => item.id === 'editorial-articles').moduleName, 'editorial');
assert.equal(capability.navigation.find(item => item.id === 'editorial-articles').schemaName, 'editorialArticle');
assert.equal(capability.navigation.find(item => item.id === 'editorial-localizations').moduleName, 'editorial');
assert.equal(capability.navigation.find(item => item.id === 'editorial-localizations').schemaName, 'editorialArticleLocalization');
assert.equal(capability.navigation.find(item => item.id === 'article-editor').featureState, 'DISABLED');
assert.equal(capability.navigation.find(item => item.id === 'editorial-content').lifecycleActions.length, 7);
assert.equal(capability.navigation.find(item => item.id === 'editorial-content').lifecycleActions[1].ownerModule, 'editorial');
assert.deepEqual(capability.navigation.find(item => item.id === 'editorial-content').lifecycleActions.map(action => action.id), ['validate', 'submit', 'approve', 'reject', 'publish', 'schedule', 'withdraw']);
assert.deepEqual(capability.navigation.find(item => item.id === 'editorial-content').lifecycleActions.find(action => action.id === 'submit').targetStatuses, ['READY']);
