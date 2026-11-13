/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const assert = require('assert');
global.SERVICE = {
        ...require('./helpers/editorialOwnerServices.js'),
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

// The canonical all-types authoring route retains the same owner actions and independent permissions.
const canonical = capability.navigation.find(item => item.id === 'editorial-articles');
assert.deepEqual(canonical.lifecycleActions, capability.navigation.find(item => item.id === 'editorial-blogs').lifecycleActions);
const registry = require('../../../../nodics.platform/modules/backoffice/src/service/registry/defaultBackofficeCapabilityRegistryService');
const projected = permissions => registry.authorizeNavigation(capability.navigation, ['editorial.backoffice.read', ...permissions]).find(item => item.id === canonical.id);
assert.deepEqual(projected([]).lifecycleActions, []);
assert.deepEqual(projected(['editorial.workflow.submit']).lifecycleActions.map(action => action.id), ['submit', 'approve', 'reject']);
assert.deepEqual(projected(['editorial.publish.execute']).lifecycleActions.map(action => action.id), ['publish']);
assert.deepEqual(projected(['editorial.publish.withdraw']).lifecycleActions.map(action => action.id), ['withdraw']);
assert.equal(projected(['editorial.publish.execute']).lifecycleActions[0].operationRoute, '/authoring/articles/:code/publish');
