/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const assert = require('assert');
const path = require('path');

/**
 * @module wcms/test/axisContentCatalogDataContract
 * @description Validates Axis baseline contracts and canonical WCMS startup using offline installation ports.
 * @layer test
 * @owner wcms
 * @override Extend data assertions without adding another startup import authority.
 */

const wcmsProperties = require('../../../config/properties');
const moduleRoot = path.resolve(__dirname, '..');
const axisModuleRoot = path.resolve(moduleRoot, '../../../nodics.platform/modules/axis');
const load = name => require(path.join(axisModuleRoot, 'data/init-v001/records/axis', name));
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
const header = require(path.join(axisModuleRoot, 'data/init-v001/headers/axis/axisContentCatalogHeader'));
const axisDataSets = [catalog, sites, types, renderers, slots, templates, components, pages, routes];

const frameworkRoot = path.resolve(moduleRoot, '../../..');
const exportProperties = require(path.join(frameworkRoot, 'nodics.foundation/modules/nData/nExport/export/config/properties'));
const mediaProperties = require('../../media/config/properties');
assert.strictEqual(exportProperties.apiExposure.categories.dataExport.enabled, false,
    'Export must remain closed until a deployment explicitly enables governed data exports');
assert.strictEqual(mediaProperties.apiExposure.categories.mediaManagement.enabled, true,
    'Media must own its mediaManagement route default');
assert.strictEqual(wcmsProperties.apiExposure, undefined, 'WCMS group must not duplicate capability route defaults');
assert.strictEqual(wcmsProperties.data.contentPacks.enabled, true,
    'WCMS must enable documentation content packs because CMS owns documentation routes and pages');
assert.deepStrictEqual(wcmsProperties.data.contentPacks.packs.axisDocumentation.source, {
    type: 'LOCAL_SIBLING',
    repositoryName: 'nodics.platform',
    contentPath: 'modules/axis/data/core-v001',
    manifestPath: 'modules/axis/data/manifest.json',
    manifestSection: 'documentation'
}, 'Axis documentation pack must be imported by WCMS from the Platform axis backend module');
assert.deepStrictEqual(wcmsProperties.data.contentPacks.packs.nodicsDocumentation.source, {
    type: 'LOCAL_SIBLING',
    repositoryName: 'nodics.docs',
    contentPath: 'data/core-v001',
    manifestPath: 'data/manifest.json',
    manifestSection: 'documentation'
}, 'Framework documentation pack must be imported by WCMS from the nodics.docs backend documentation module');
assert.deepStrictEqual(wcmsProperties.data.contentPacks.packs.customerProjectDocumentation.source, {
    type: 'LOCAL_PROJECT',
    contentPath: 'data/core-v001',
    manifestPath: 'data/manifest.json',
    manifestSection: 'documentation'
}, 'Customer project documentation pack must be imported by WCMS from the active customer project');
assert.strictEqual(wcmsProperties.data.contentPacks.packs.customerProjectDocumentation.manifestPack, undefined,
    'Customer project documentation pack must derive manifest identity from the active project package metadata');

axisDataSets.flat().forEach(item => {
    assert.strictEqual(item.functionalModule, 'nodics.platform', item.code + ' must be owned by nodics.platform');
    assert.strictEqual(item.activationMode, 'PLATFORM_ACTIVE', item.code + ' must require Platform activation');
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

assert.deepStrictEqual(routes.map(route => route.path).sort(),
    ['/login', '/forgot-password', '/dashboard', '/lock-screen', '/assistant', '/schema-workbench',
        '/media-management', '/platform', '/platform/initialize', '/platform/runtime-modules'].sort());
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
const schemaApi = componentByCode.get('axisSchemaWorkbenchComponent');
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
    assert.strictEqual(typeof schemaApi.properties[property], 'string');
    assert(schemaApi.properties[property].length > 0);
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

/** Exercises actual framework startup and release installation with offline persistence/import ports. */
async function verifyCanonicalWcmsStartup() {
    const wcms = require('../nodics');
    const framework = require('../../../../nodics.foundation/nodics');
    const config = require('../../../../nodics.foundation/modules/nConfig');
    const lifecycle = require('../../../../nodics.foundation/modules/nConfig/src/service/DefaultRuntimeLifecycleService');
    const releaseExecution = require('../../../../nodics.foundation/modules/nData/nImport/import/test/helpers/releaseExecution');
    const lodash = require('lodash');
    const originals = Object.fromEntries(['CONFIG', 'NODICS', 'SERVICE', 'CLASSES', 'UTILS'].map(key =>
        [key, { exists: Object.hasOwn(global, key), value: global[key] }]));
    const configMethods = ['start', 'initUtilities', 'loadModules', 'initEntities', 'finalizeEntities', 'finalizeModules'];
    const originalConfig = Object.fromEntries(configMethods.map(key => [key, config[key]]));
    const originalLog = lifecycle.LOG;
    let failImport;
    try {
        const selectedPolicy = structuredClone(require('../../../../nodics.foundation/modules/nData/nImport/import/config/properties').data.dataReleases);
        selectedPolicy.allowedDestinationRoles = ['WCMS_STAGED'];
        const state = releaseExecution({
            modules: { axis: { ...require(path.join(axisModuleRoot, 'package.json')), name: 'axis', path: axisModuleRoot, parent: 'nodics.platform' } },
            configuration: selectedPolicy,
            onImport: async () => { if (failImport) throw failImport; }
        });
        global.UTILS = { isObject: lodash.isObject, isArray: Array.isArray, isBlank: lodash.isEmpty };
        global.CLASSES = { NodicsError: class extends Error {
            constructor(code, message) { super(message || String(code)); this.code = code; }
        } };
        const releaseOwner = { ...state.service, activeExecutions: new Map() };
        let serverState = 'starting';
        let listeners = 0;
        let grants = 0;
        Object.assign(NODICS, {
            getServerState: () => serverState, setServerState: value => { serverState = value; },
            isInitRequired: () => false, setEndTime() {}, getStartDuration: () => 0,
            addInternalAuthToken() {}, LOG: { info() {} }
        });
        lifecycle.reset();
        lifecycle.LOG = { error() {} };
        Object.assign(SERVICE, {
            DefaultDataReleaseService: releaseOwner,
            DefaultRuntimeLifecycleService: lifecycle,
            DefaultScriptsHandlerService: { executePostScripts: async () => true },
            DefaultRouterService: { startServers: async () => { listeners += 1; } },
            DefaultInternalAuthenticationProviderService: {
                fetchInternalAuthToken: async () => { grants += 1; return { authToken: 'offline-fixture-only' }; },
                scheduleInternalAuthTokenRefresh() {}
            },
            DefaultEnterpriseHandlerService: { buildEnterprises: async () => true }
        });
        configMethods.forEach(key => { config[key] = async () => true; });
        config.finalizeModules = () => wcms.postInit({});
        const runtime = { ...framework, executeMandatoryBootstrapServices: async () => true };
        assert.strictEqual(await runtime.start({}), true);
        assert.strictEqual(serverState, 'started');
        assert(state.imports.length > 0, 'First startup installs actual immutable Axis Init releases');
        const imported = state.imports.length;
        const receiptSnapshot = JSON.stringify(state.installations);
        assert.strictEqual(lifecycle.getContributors().some(c => c.name === 'wcmsStartupImport'), false,
            'Mandatory Init must not run in a log-and-continue READY contributor');
        assert.strictEqual(await runtime.start({}), true);
        assert.strictEqual(await wcms.importStartupData(), true);
        assert.strictEqual(state.imports.length, imported, 'Restart and compatibility calls must not replay CURRENT releases');
        assert.strictEqual(JSON.stringify(state.installations), receiptSnapshot, 'No-op startup leaves durable receipts unchanged');

        const checksum = state.installations[0].checksum;
        state.installations[0].checksum = 'offline-drift';
        const beforeListeners = listeners;
        const beforeGrants = grants;
        await assert.rejects(runtime.start({}), /changed without a new version/);
        assert.strictEqual(listeners, beforeListeners);
        assert.strictEqual(grants, beforeGrants);
        assert.strictEqual(serverState, 'stopped');
        assert.strictEqual(state.imports.length, imported);
        state.installations[0].checksum = checksum;

        lifecycle.reset(); serverState = 'starting';
        state.installations[0].status = 'RUNNING';
        await assert.rejects(runtime.start({}), /still running/);
        assert.strictEqual(listeners, beforeListeners);
        assert.strictEqual(state.imports.length, imported);

        lifecycle.reset(); serverState = 'starting';
        state.installations.length = 0;
        failImport = new Error('offline mandatory Init failure');
        await assert.rejects(runtime.start({}), error => error === failImport);
        assert.strictEqual(listeners, beforeListeners);
        assert.strictEqual(grants, beforeGrants);
        assert.strictEqual(serverState, 'stopped');

        failImport = undefined;
        state.installations.length = 0;
        state.runtimeRole = 'WCMS_ONLINE';
        selectedPolicy.allowedDestinationRoles = [];
        const beforeOnline = state.imports.length;
        assert.strictEqual(await wcms.importStartupData(), true);
        assert.strictEqual(state.imports.length, beforeOnline, 'Online must not receive Staged Init through compatibility delegation');
        await assert.rejects(releaseOwner.preparePlan({ tenant: 'default', releaseRequest: {
            dataType: 'init', releaseCodes: ['axis:axisBaseline']
        } }), { code: 'ERR_IMP_00004' });
        delete SERVICE.DefaultDataReleaseService;
        await assert.rejects(wcms.importStartupData(), /requires DefaultDataReleaseService/);
        console.log('WCMS canonical startup validated: immutable install, repeat no-op, destination/drift/running guards and blocking mandatory failure');
    } finally {
        Object.assign(config, originalConfig);
        lifecycle.reset(); lifecycle.LOG = originalLog;
        Object.entries(originals).forEach(([key, value]) => {
            if (value.exists) global[key] = value.value;
            else delete global[key];
        });
    }
}

verifyCanonicalWcmsStartup().then(() => {
    console.log('Axis content catalog init-data contract tests passed');
}).catch(error => { console.error(error); process.exitCode = 1; });
