/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const assert = require('assert');
const path = require('path');

const wcmsProperties = require('../../../config/properties');
const moduleRoot = path.resolve(__dirname, '..');
const load = name => require(path.join(moduleRoot, 'data/init/data/axis', name));
const records = data => Object.values(data);

const catalog = records(load('axisContentCatalogData'));
const sites = records(load('axisCmsSiteData'));
const types = records(load('axisCmsTypeCodeData'));
const renderers = records(load('axisCmsRendererData'));
const slots = records(load('axisCmsSlotData'));
const templates = records(load('axisCmsTemplateData'));
const components = records(load('axisCmsComponentData'));
const pages = records(load('axisCmsPageData'));
const routes = records(load('axisCmsRouteData'));
const header = require(path.join(moduleRoot, 'data/init/headers/axis/axisContentCatalogHeader'));
const axisDataSets = [catalog, sites, types, renderers, slots, templates, components, pages, routes];

assert.strictEqual(wcmsProperties.apiExposure.categories.dataImport.enabled, true,
    'WCMS must expose governed dataImport routes for documentation content-pack lifecycle');
assert.strictEqual(wcmsProperties.apiExposure.categories.dataExport.enabled, true,
    'WCMS must expose governed dataExport routes for content and media export lifecycle');
assert.strictEqual(wcmsProperties.apiExposure.categories.mediaManagement.enabled, true,
    'WCMS must expose governed mediaManagement routes because media is part of the WCMS functional module');
assert.strictEqual(wcmsProperties.data.contentPacks.enabled, true,
    'WCMS must enable documentation content packs because CMS owns documentation routes and pages');
assert.deepStrictEqual(wcmsProperties.data.contentPacks.packs.axisDocumentation.source, {
    type: 'LOCAL_SIBLING',
    repositoryName: 'nodics.platform',
    contentPath: 'modules/axis/data/core',
    manifestPath: 'modules/axis/manifest/docs-content-pack.json'
}, 'Axis documentation pack must be imported by WCMS from the Platform axis backend module');
assert.deepStrictEqual(wcmsProperties.data.contentPacks.packs.nodicsDocumentation.source, {
    type: 'LOCAL_SIBLING',
    repositoryName: 'nodics.docs',
    contentPath: 'data/core',
    manifestPath: 'manifest/generated-content-pack.json'
}, 'Framework documentation pack must be imported by WCMS from the nodics.docs backend documentation module');
assert.deepStrictEqual(wcmsProperties.data.contentPacks.packs.kickoffDocumentation.source, {
    type: 'LOCAL_PROJECT',
    contentPath: 'data/core',
    manifestPath: 'manifest/docs-content-pack.json'
}, 'Kickoff documentation pack must be imported by WCMS from the active customer project');
assert.strictEqual(wcmsProperties.data.contentPacks.packs.kickoffDocumentation.manifestPack, 'nodics.kickoff',
    'Kickoff documentation pack must keep the customer project manifest identity');

axisDataSets.flat().forEach(item => {
    assert.strictEqual(item.functionalModule, 'nodics.wcms', item.code + ' must be owned by nodics.wcms');
    assert.strictEqual(item.activationMode, 'RUNTIME_MODULE_ACTIVE', item.code + ' must require runtime module activation');
});

assert.strictEqual(catalog.length, 2);
assert.strictEqual(catalog[0].code, 'axisContentCatalog');
assert.strictEqual(catalog[0].catalogType, 'CONTENT');
assert.deepStrictEqual(catalog[0].accessGroups, ['employeeUserGroup']);
assert.strictEqual(catalog[1].code, 'documentationContentCatalog');
assert.strictEqual(catalog[1].catalogType, 'CONTENT');
assert.deepStrictEqual(catalog[1].accessGroups, ['employeeUserGroup']);
assert.strictEqual(sites[0].catalog, 'axisContentCatalog');

const typeByCode = new Map(types.map(item => [item.code, item]));
const rendererByCode = new Map(renderers.map(item => [item.code, item]));
types.forEach(type => {
    assert(rendererByCode.has(type.code), 'Missing renderer mapping for ' + type.code);
    assert.strictEqual(rendererByCode.get(type.code).contractVersion, type.contractVersion);
    assert(!rendererByCode.get(type.code).renderer.includes('://'), 'Renderer keys must not be URLs');
});

const slotByCode = new Map(slots.map(item => [item.code, item]));
templates.forEach(template => {
    template.slots.forEach(slotCode => {
        assert(slotByCode.has(slotCode), 'Missing slot ' + slotCode);
        assert.strictEqual(slotByCode.get(slotCode).template, template.code);
    });
});

const componentByCode = new Map(components.map(item => [item.code, item]));
components.forEach(component => {
    assert(typeByCode.has(component.typeCode), 'Missing component type ' + component.typeCode);
    assert(['PUBLIC', 'AUTHENTICATED'].includes(component.accessMode));
    assert(component.properties && typeof component.properties === 'object');
    const serialized = JSON.stringify(component.properties);
    assert(!/<script/i.test(serialized), 'Executable markup is prohibited');
    assert(!serialized.includes('http://') && !serialized.includes('https://'), 'Component properties must not contain endpoint URLs');
});

const pageByCode = new Map(pages.map(item => [item.code, item]));
const templateByCode = new Map(templates.map(item => [item.code, item]));
pages.forEach(page => {
    assert(typeByCode.has(page.typeCode), 'Missing page type ' + page.typeCode);
    assert(templateByCode.has(page.template), 'Missing page template ' + page.template);
    page.cmsComponents.forEach(association => {
        const component = componentByCode.get(association.target);
        const slot = slots.find(item => item.template === page.template && item.name === association.slot);
        assert(component, 'Missing component ' + association.target);
        assert(slot, 'Missing slot ' + association.slot);
        assert(slot.allowedComponentTypes.includes(component.typeCode), 'Component type is not allowed in slot');
    });
});

assert.deepStrictEqual(routes.map(route => route.path),
    ['/login', '/forgot-password', '/dashboard', '/lock-screen', '/assistant', '/schema-workbench',
        '/media-management', '/platform', '/platform/initialize', '/platform/runtime-modules']);
routes.forEach(route => {
    const page = pageByCode.get(route.page);
    assert(page, 'Missing route page ' + route.page);
    assert.strictEqual(route.site, 'axisCmsSite');
    assert.strictEqual(route.deliveryState, 'ONLINE');
    page.cmsComponents.forEach(association => {
        const component = componentByCode.get(association.target);
        if (route.accessMode === 'PUBLIC') {
            assert.strictEqual(component.accessMode, 'PUBLIC', 'Public pages may contain only public components');
        }
    });
});

assert.strictEqual(routes.find(route => route.path === '/login').accessMode, 'PUBLIC');
assert.strictEqual(routes.find(route => route.path === '/forgot-password').accessMode, 'PUBLIC');
assert.strictEqual(routes.find(route => route.path === '/dashboard').accessMode, 'AUTHENTICATED');
assert.strictEqual(routes.find(route => route.path === '/lock-screen').accessMode, 'AUTHENTICATED');
assert.strictEqual(routes.find(route => route.path === '/assistant').accessMode, 'AUTHENTICATED');
assert.strictEqual(routes.find(route => route.path === '/schema-workbench').accessMode, 'AUTHENTICATED');
assert.strictEqual(routes.find(route => route.path === '/media-management').accessMode, 'AUTHENTICATED');
assert.strictEqual(routes.find(route => route.path === '/platform').accessMode, 'AUTHENTICATED');
assert.strictEqual(routes.find(route => route.path === '/platform/initialize').accessMode, 'AUTHENTICATED');
assert.strictEqual(routes.find(route => route.path === '/platform/runtime-modules').accessMode, 'AUTHENTICATED');
assert(pages.find(page => page.code === 'axisDashboardPage').cmsComponents.every(association =>
    componentByCode.get(association.target).accessMode === 'AUTHENTICATED'));
assert(!componentByCode.has('axisDashboardHeaderComponent'),
    'Dashboard must not import the redundant Axis brand header component');
assert(!slotByCode.has('axisDashboardHeaderSlot'),
    'Dashboard must not import the redundant Axis brand header slot');
assert(!pages.find(page => page.code === 'axisDashboardPage').cmsComponents.some(association =>
    association.target === 'axisDashboardHeaderComponent' || association.slot === 'header'),
'Dashboard page must not render a separate brand header because the shell already owns Axis branding');
assert(pages.find(page => page.code === 'axisLockScreenPage').cmsComponents.every(association =>
    componentByCode.get(association.target).accessMode === 'AUTHENTICATED'));
assert(pages.find(page => page.code === 'axisAssistantPage').cmsComponents.every(association =>
    componentByCode.get(association.target).accessMode === 'AUTHENTICATED'));
assert(pages.find(page => page.code === 'axisSchemaWorkbenchPage').cmsComponents.every(association =>
    componentByCode.get(association.target).accessMode === 'AUTHENTICATED'));
assert(pages.find(page => page.code === 'axisMediaManagementPage').cmsComponents.every(association =>
    componentByCode.get(association.target).accessMode === 'AUTHENTICATED'));
['axisPlatformDashboardPage', 'axisPlatformInitializePage', 'axisRuntimeModulesRegistryPage'].forEach(pageCode => {
    assert(pages.find(page => page.code === pageCode).cmsComponents.every(association =>
        componentByCode.get(association.target).accessMode === 'AUTHENTICATED'));
});
const assistantWorkspace = componentByCode.get('axisAssistantWorkspaceComponent');
['title', 'welcomeMessage', 'inputPlaceholder', 'submitLabel', 'stopLabel', 'emptyState',
    'employeeLabel', 'assistantLabel', 'workingLabel', 'cancellingLabel', 'errorLabel']
    .concat(['historyLabel', 'newConversationLabel', 'noConversationsLabel', 'loadMoreLabel'])
    .concat(['clarificationTitle', 'clarificationSubmitLabel', 'toolPlanTitle',
        'confirmationTitle', 'approveLabel', 'rejectLabel', 'executeLabel',
        'confirmationExpiredLabel', 'confirmationCompletedLabel'])
    .concat(['toolPlannedLabel', 'toolRunningLabel', 'toolSucceededLabel',
        'toolFailedLabel', 'citationsTitle', 'noCitationsLabel', 'usageTitle',
        'inputTokensLabel', 'outputTokensLabel', 'cachedTokensLabel',
        'reasoningTokensLabel', 'embeddingTokensLabel', 'reconciliationLabel'])
    .forEach(property => {
        assert.strictEqual(typeof assistantWorkspace.properties[property], 'string');
        assert(assistantWorkspace.properties[property].length > 0);
    });
const schemaWorkbench = componentByCode.get('axisSchemaWorkbenchComponent');
['title', 'introduction', 'schemaSearchLabel', 'schemaSearchPlaceholder', 'schemasLabel',
    'recordsLabel', 'noSchemasLabel', 'noRecordsLabel', 'selectSchemaLabel', 'loadingLabel',
    'retryLabel', 'createLabel', 'cancelLabel', 'savingLabel', 'selectExistingLabel',
    'createRelatedLabel', 'addToDraftLabel', 'removeRelatedLabel',
    'noRelatedRecordsLabel', 'relatedSearchLabel', 'missingReferencePropertyLabel',
    'searchRecordsLabel', 'searchRecordsPlaceholder',
    'actionsLabel', 'viewLabel', 'editLabel', 'updateLabel', 'updatingLabel',
    'closeLabel', 'trueLabel', 'falseLabel',
    'deleteLabel', 'deletingLabel', 'confirmDeleteLabel', 'deleteTitle',
    'deleteWarning', 'tenantLabel', 'enterpriseLabel',
    'moduleLabel', 'availableOperationsLabel', 'resultsLabel',
    'pageSizeLabel', 'paginationLabel', 'filterBuilderLabel',
    'addConditionLabel', 'addGroupLabel', 'applyFiltersLabel', 'clearFiltersLabel',
    'filterFieldLabel', 'filterOperatorLabel', 'filterValueLabel',
    'filterMatchLabel', 'removeFilterLabel', 'requestPreviewLabel',
    'addFavouriteLabel', 'removeFavouriteLabel', 'gridSettingsLabel',
    'savedViewNameLabel', 'saveViewLabel', 'selectVisibleRecordsLabel',
    'selectRecordLabel', 'selectedRecordsLabel', 'bulkDeleteLabel',
    'bulkDeletingLabel', 'deleteImpactLoadingLabel', 'deleteImpactBlockedLabel',
    'deleteImpactClearLabel', 'editRelatedLabel'].forEach(property => {
    assert.strictEqual(typeof schemaWorkbench.properties[property], 'string');
    assert(schemaWorkbench.properties[property].length > 0);
});
const mediaManagement = componentByCode.get('axisMediaManagementWorkspaceComponent');
['title', 'introduction', 'backendAuthority', 'customizationBoundary'].forEach(property => {
    assert.strictEqual(typeof mediaManagement.properties[property], 'string');
    assert(mediaManagement.properties[property].length > 0);
});
const platformSummary = componentByCode.get('axisPlatformDashboardSummaryComponent');
['title', 'introduction', 'primaryMetricLabel', 'secondaryMetricLabel', 'emptyState'].forEach(property => {
    assert.strictEqual(typeof platformSummary.properties[property], 'string');
    assert(platformSummary.properties[property].length > 0);
});
const platformInitialize = componentByCode.get('axisPlatformInitializeComponent');
['title', 'introduction', 'disabledMessage', 'previewLabel', 'executeLabel'].forEach(property => {
    assert.strictEqual(typeof platformInitialize.properties[property], 'string');
    assert(platformInitialize.properties[property].length > 0);
});
const runtimeModules = componentByCode.get('axisRuntimeModulesRegistryComponent');
['title', 'introduction', 'registeredLabel', 'availableLabel', 'protectedLabel', 'activeLabel'].forEach(property => {
    assert.strictEqual(typeof runtimeModules.properties[property], 'string');
    assert(runtimeModules.properties[property].length > 0);
});

const enabledHeaders = Object.values(header).flatMap(group => Object.values(group)).filter(item => item.options.enabled);
assert.strictEqual(enabledHeaders.length, 9);
assert(enabledHeaders.every(item => item.options.operation === 'saveAll'));
assert(enabledHeaders.every(item => item.query.code === '$code'));

console.log('Axis content catalog init-data contract tests passed');
