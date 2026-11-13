/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module cms/test/cmsDesignerCompositionContract
 * @description Validates Catalog-first Axis Page Designer APIs, arbitrary slots, governed media references, route uniqueness, and backend-owned persistence boundaries.
 * @layer test
 * @owner cms
 * @override Extend when designer authoring adds new operations, validation gates, or publication-readiness rules.
 */
const assert = require('assert');
const path = require('path');

const root = path.resolve(__dirname, '../../..');
const routers = require(path.join(root, 'modules/cms/src/router/routers')).cms.cmsDesignerComposition;
const statusDefinitions = require(path.join(root, 'modules/cms/src/utils/statusDefinitions'));
const service = require(path.join(root, 'modules/cms/src/service/designer/defaultCmsDesignerCompositionService'));
const wcmsProperties = require(path.join(root, 'config/properties'));
const permissions = Object.values(require('../data/init-v001/records/identity/cmsPermissionData')).map(row => row.code);
const groups = Object.fromEntries([
    ...Object.values(require('../data/init-v001/records/identity/cmsUserGroupData')),
    ...Object.values(require(path.join(root, '../nodics.platform/modules/profile/data/init-v001/records/identity/profileUserGroupData')))
].map(row => [row.code, row]));

assert.strictEqual(require('../config/properties').apiExposure.categories.cmsAuthoring.enabled, true,
    'CMS must own its cmsAuthoring route default so server config only carries intentional deltas');
assert.strictEqual(wcmsProperties.apiExposure, undefined, 'WCMS group must not duplicate capability route defaults');
assert.strictEqual(wcmsProperties.cms, undefined, 'WCMS group must not select a customer authoring application');
const cmsProperties = require('../config/properties');
assert.deepStrictEqual(cmsProperties.cms.designerAuthoring.draftDefaults, {});
assert.deepStrictEqual(cmsProperties.cms.designerAuthoring.componentKinds, []);
assert(permissions.includes('cms.backoffice.manage'),
    'cms.backoffice.manage must be in the governed permission catalog');
assert(permissions.includes('cms.publication.emergencyOverride'),
    'cms.publication.emergencyOverride must be in the governed permission catalog');
assert(groups.contentUserGroup.permissions.includes('cms.backoffice.manage'),
    'content authors must receive explicit CMS authoring permission through CMS-owned data');
assert(groups.adminGroup.permissions.includes('cms.publication.emergencyOverride'),
    'admin operators retain explicit CMS publication emergency override permission through Profile-managed data');

[
    ['getAuthoringModel', 'GET', '/designer/composition/model', 'cms.backoffice.view'],
    ['listDraftPages', 'GET', '/designer/composition/pages', 'cms.backoffice.view'],
    ['getDraftComposition', 'GET', '/designer/composition/draft', 'cms.backoffice.view'],
    ['validateDraftComposition', 'POST', '/designer/composition/validate', 'cms.backoffice.manage'],
    ['saveDraftComposition', 'PUT', '/designer/composition/draft', 'cms.backoffice.manage'],
    ['addSection', 'POST', '/designer/composition/sections', 'cms.backoffice.manage'],
    ['updateSection', 'PUT', '/designer/composition/sections', 'cms.backoffice.manage'],
    ['deleteSection', 'POST', '/designer/composition/sections/delete', 'cms.backoffice.manage'],
    ['reorderSection', 'POST', '/designer/composition/sections/reorder', 'cms.backoffice.manage'],
    ['addComponent', 'POST', '/designer/composition/components', 'cms.backoffice.manage'],
    ['updateComponent', 'PUT', '/designer/composition/components', 'cms.backoffice.manage'],
    ['deleteComponent', 'POST', '/designer/composition/components/delete', 'cms.backoffice.manage'],
    ['reorderComponent', 'POST', '/designer/composition/components/reorder', 'cms.backoffice.manage'],
    ['associateMedia', 'POST', '/designer/composition/media', 'cms.backoffice.manage'],
    ['detachMedia', 'POST', '/designer/composition/media/delete', 'cms.backoffice.manage'],
    ['assignRoute', 'PUT', '/designer/composition/route', 'cms.backoffice.manage'],
    ['assignNavigation', 'PUT', '/designer/composition/navigation', 'cms.backoffice.manage'],
    ['validatePublishReadiness', 'POST', '/designer/composition/publish-readiness', 'cms.backoffice.manage'],
    ['submitForPublication', 'POST', '/designer/composition/publication-request', 'cms.backoffice.manage']
].forEach(([operation, method, key, permission]) => {
    assert(routers[operation], operation + ' route must be registered');
    assert.strictEqual(routers[operation].secured, true, operation + ' must be secured');
    assert.strictEqual(routers[operation].apiExposure, 'cmsAuthoring', operation + ' must use cmsAuthoring exposure');
    assert.strictEqual(routers[operation].method, method, operation + ' method is incorrect');
    assert.strictEqual(routers[operation].key, key, operation + ' key is incorrect');
    assert.strictEqual(routers[operation].controller, 'DefaultCmsDesignerCompositionController');
    assert.strictEqual(routers[operation].operation, operation);
    assert.strictEqual(routers[operation].permission, ['getAuthoringModel', 'listDraftPages', 'getDraftComposition'].includes(operation) ? permission :
        ['deleteSection', 'deleteComponent', 'detachMedia'].includes(operation) ? 'cms.authoring.delete' : 'cms.authoring.write');
});

['ERR_CMS_00100', 'ERR_CMS_00101', 'ERR_CMS_00102', 'ERR_CMS_00103',
    'ERR_CMS_00104', 'ERR_CMS_00105', 'ERR_CMS_00106'].forEach(code => {
    assert(statusDefinitions[code], code + ' must be registered');
});

const records = {
    catalogs: [{ code: 'nexusContentCatalog', name: 'Nexus Content', catalogType: 'CONTENT', active: true }],
    sites: [{ code: 'nexusCorporateSite', name: 'Nexus Corporate', catalog: 'nexusContentCatalog', enterpriseCode: 'enterprise-a', active: true }],
    templates: [{ code: 'nexusCorporatePageTemplate', name: 'Nexus Corporate Page', renderer: 'nexus.template.corporate', active: true }],
    slots: [
        { code: 'nexusCorporateMainSlot', template: 'nexusCorporatePageTemplate', name: 'main', minItems: 1, maxItems: 20,
            allowedComponentTypeGroups: ['nexusCorporateSectionGroup'], active: true }
    ],
    types: [
        { code: 'nexusCorporateStandardPageType', kind: 'PAGE', active: true },
        { code: 'nexusPageHeroType', kind: 'COMPONENT', active: true,
            propertySchema: {
                title: { localized: true, requiredLocales: ['en'] },
                body: { localized: true }
            } },
        { code: 'nexusContentSectionType', kind: 'COMPONENT', active: true },
        { code: 'richTextComponentType', kind: 'COMPONENT', active: true },
        { code: 'mediaCardComponentType', kind: 'COMPONENT', active: true }
    ],
    groups: [{ code: 'nexusCorporateSectionGroup', componentTypeCodes: ['nexusPageHeroType', 'nexusContentSectionType'], active: true }],
    mediaFolders: [{ code: 'cmsAssets', name: 'CMS Assets', status: 'ACTIVE', access: 'PUBLIC', businessPurpose: 'cms-asset', reusable: true }],
    mediaFormats: [{ code: 'original', name: 'Original', status: 'ACTIVE' }],
    navigationNodes: [{ code: 'nexusCorporateRoot', name: 'Nexus Corporate', title: 'Nexus Corporate', site: 'nexusCorporateSite', nodeType: 'CONTAINER', status: 'ACTIVE',
        authoringScope: { enterpriseCode: 'enterprise-a', siteCode: 'nexusCorporateSite', catalogCode: 'nexusContentCatalog' } }],
    routes: []
};
// The real authoring metadata reader admits explicitly owned reusable references.
for (const collection of [records.templates, records.slots, records.types, records.groups]) {
    collection.forEach(item => { item.authoringScope = { enterpriseCode: 'enterprise-a', catalogCode: 'nexusContentCatalog' }; });
}
const saved = [];
const removed = [];
const publicationCalls = [];
const matches = (model, query) => Object.keys(query).every(key => {
    if (key === 'active' && model[key] === undefined) return true;
    let expected = query[key];
    const actual = key.split('.').reduce((value, part) => value?.[part], model);
    return expected && expected.$in ? expected.$in.includes(actual) : actual === expected;
});
const generatedService = list => ({
    get: request => {
        request.schemaModel = { tenant: request.tenant };
        const result = list.filter(item => matches(item, request.query || {})).map(item => Object.assign({ active: true }, item));
        return Promise.resolve({ code: 'SUC_FIND_00000', query: request.query, count: result.length, result });
    },
    save: request => { if (request.model.versionId === undefined) request.model.versionId = 0; saved.push(request.model); list.push(request.model); return Promise.resolve({ result: [request.model] }); },
    remove: request => { removed.push(request.query); return Promise.resolve({ result: request.query }); }
});

global.CLASSES = { NodicsError: class NodicsError extends Error { constructor(code, message) { super(message); this.code = code; } } };
global.CONFIG = { get: key => key === 'cms' ? { designerAuthoring: { maximumReferenceLookupItems: 25 } } :
    key === 'runtimeRole' ? { publication: 'STAGED' } : undefined };
// Project form copy is inert and bounded; it cannot disclose unrelated configuration or create authority.
const originalConfigurationGet = CONFIG.get;
const presentationDefaults = cmsProperties.cms.designerAuthoring.presentation;
CONFIG.get = key => key === 'cms' ? { designerAuthoring: { presentation: {
    ...presentationDefaults, pageNameLabel: 'Business page name', secret: 'must-not-be-projected', operations: ['saveDraftComposition']
} } } : originalConfigurationGet(key);
assert.deepStrictEqual(service.authoringPresentation(), { ...presentationDefaults, pageNameLabel: 'Business page name' });
for (const invalid of [null, [], { ...presentationDefaults, continueLabel: '' },
    { ...presentationDefaults, pageNameHelp: 'x'.repeat(1025) },
    { ...presentationDefaults, newPageTitle: 'Name\u0000hidden' }]) {
    CONFIG.get = key => key === 'cms' ? { designerAuthoring: { presentation: invalid } } : originalConfigurationGet(key);
    assert.throws(() => service.authoringPresentation(), error => error.code === 'ERR_CMS_00100');
}
CONFIG.get = originalConfigurationGet;
assert.strictEqual(service.authoringPresentation(), undefined, 'older owner models remain compatible without form presentation');
global.SERVICE = { DefaultCmsDesignerCompositionService: service,
    DefaultCmsDesignerReadService: require('../src/service/designer/defaultCmsDesignerReadService'),
    DefaultCmsDesignerAccessService: require('../src/service/designer/defaultCmsDesignerAccessService'),
    DefaultSecuredRequestPipelineService: require('../../../../nodics.foundation/modules/nRouter/src/service/request/defaultSecuredRequestPipelineService'),
    DefaultIdentityGovernanceService: { getSystemAuthData: () => ({ userGroups: ['serviceAccountUserGroup'], principalType: 'service' }) },
    DefaultCatalogService: generatedService(records.catalogs),
    DefaultCmsSiteService: generatedService(records.sites),
    DefaultCmsPageTemplateService: generatedService(records.templates),
    DefaultCmsSlotDefinitionService: generatedService(records.slots),
    DefaultCmsTypeCodeService: generatedService(records.types),
    DefaultCmsComponentTypeGroupService: generatedService(records.groups),
    DefaultMediaFolderService: generatedService(records.mediaFolders),
    DefaultMediaFormatService: generatedService(records.mediaFormats),
    DefaultCmsNavigationNodeService: generatedService(records.navigationNodes),
    DefaultCmsPageRouteService: generatedService(records.routes),
    DefaultCmsPageService: generatedService([]),
    DefaultCmsComponentService: generatedService([]),
    DefaultCmsComponentDetailService: generatedService([]),
    DefaultCmsComponentLocalizationService: generatedService([]),
    DefaultCmsComponentMediaService: generatedService([]),
    DefaultCmsDeliveryCacheInvalidationService: { invalidate: () => Promise.resolve(true) },
    DefaultPublicationLifecycleService: {
        create: request => {
            publicationCalls.push(['create', request.publication]);
            return Promise.resolve(Object.assign({ state: 'STAGED', revision: 0 }, request.publication));
        },
        validate: request => {
            publicationCalls.push(['validate', request.publicationCode, request.expectedRevision]);
            return Promise.resolve({ code: request.publicationCode, state: 'VALIDATED', revision: 1 });
        },
        requestApproval: request => {
            publicationCalls.push(['requestApproval', request.publicationCode, request.expectedRevision]);
            return Promise.resolve({ code: request.publicationCode, state: 'PENDING_APPROVAL', revision: 2 });
        }
    },
    DefaultMediaReferenceLookupService: {
        validateInternal: request => Promise.resolve({
            referenceType: request.body.referenceType,
            code: request.body.referenceCode
        })
    }
};
global.SERVICE.DefaultCmsContractValidationService = require(path.join(root, 'modules/cms/src/service/validation/defaultCmsContractValidationService'));

const draft = {
    catalogCode: 'nexusContentCatalog',
    siteCode: 'nexusCorporateSite',
    templateCode: 'nexusCorporatePageTemplate',
    page: { code: 'gettingStartedPage', name: 'Getting Started', typeCode: 'nexusCorporateStandardPageType' },
    sections: [
        { slot: 'main', index: 0, components: [{ code: 'gettingStartedHero', typeCode: 'nexusPageHeroType', accessMode: 'AUTHENTICATED',
            localizations: [{ locale: 'en', properties: { title: 'Getting Started', body: 'A governed localized draft.' }, status: 'DRAFT' }],
            media: [{ componentMediaCode: 'gettingStartedHeroMedia', mediaCode: 'heroMedia', mediaType: 'IMAGE', role: 'primary', position: 0 }] }] }
    ],
    route: { path: '/docs/getting-started', accessMode: 'AUTHENTICATED' }
};

const context = { tenant: 'tenant-a', authorization: 'Bearer cms-author-token', authData: { tenant: 'tenant-a', enterpriseCode: 'enterprise-a',
    principalType: 'human', tokenType: 'access', loginId: 'author', userGroups: ['employeeUserGroup'],
    permissions: ['cms.backoffice.view', 'cms.authoring.write', 'cms.authoring.delete'] } };
const scope = { enterpriseCode: 'enterprise-a', siteCode: draft.siteCode, catalogCode: draft.catalogCode };

(async () => {
    const mapping = 'nexus.component.page-hero';
    SERVICE.DefaultCmsTypeCode2RendererService = generatedService([{
        code: 'nexusPageHeroType', renderer: mapping, active: true,
        authoringScope: { enterpriseCode: 'enterprise-a', catalogCode: draft.catalogCode }
    }]);
    const withRenderer = structuredClone(draft);
    withRenderer.sections[0].components[0].renderer = 'unknown.renderer';
    const beforeRendererCheck = saved.length;
    await assert.rejects(service.validateDraftComposition({ ...context, cmsDesigner: withRenderer }), {
        code: 'ERR_CMS_00100', message: 'Choose an active renderer mapped to the selected content type'
    });
    assert.strictEqual(saved.length, beforeRendererCheck);
    withRenderer.sections[0].components[0].renderer = mapping;
    assert.strictEqual((await service.validateDraftComposition({ ...context, cmsDesigner: withRenderer })).result.valid, true);
    delete SERVICE.DefaultCmsTypeCode2RendererService;

    let model = await service.getAuthoringModel(context);
    assert.strictEqual(model.result.hierarchy[0], 'Content Catalog');
    assert.strictEqual(model.result.rules.arbitrarySlots, true);
    assert.strictEqual(model.result.rules.frontendPersistence, false);
    assert(model.result.operations.includes('associateMedia'));
    assert.deepStrictEqual(model.result.defaults.draftDefaults, {}, 'An unconfigured runtime must not invent application references');
    assert.deepStrictEqual(model.result.defaults.componentKinds, [], 'An unconfigured runtime must not invent renderer/type bindings');
    assert(model.result.metadata.contentCatalogs.some(catalog => catalog.code === 'nexusContentCatalog'),
        'WCMS must expose live content catalog references for Axis Designer selection');
    assert(model.result.metadata.sites.some(site => site.code === 'nexusCorporateSite' &&
        site.catalogCode === 'nexusContentCatalog'), 'WCMS must expose live site references with catalog ownership');
    assert(model.result.metadata.pageTemplates.some(template => template.code === 'nexusCorporatePageTemplate'),
        'WCMS must expose live page template references');
    assert.deepStrictEqual(model.result.metadata.slotDefinitions.map(slot => slot.name),
        ['main'], 'WCMS must expose template slot definitions without hardcoding three slots');
    assert(model.result.metadata.componentTypes.some(type => type.code === 'nexusPageHeroType'),
        'WCMS must expose live component type references');
    assert(model.result.metadata.componentTypeGroups.some(group =>
        group.code === 'nexusCorporateSectionGroup' && group.componentTypeCodes.includes('nexusPageHeroType')),
    'WCMS must expose live component type group references');
    assert(model.result.metadata.mediaFolders.some(folder => folder.code === 'cmsAssets' &&
        folder.businessPurpose === 'cms-asset'), 'WCMS must expose media folder references without making Axis own media policy');
    assert(model.result.metadata.mediaFormats.some(format => format.code === 'original'),
        'WCMS must expose media format references for authoring guidance');
    assert(model.result.metadata.mediaTypes.includes('IMAGE'),
        'WCMS must expose media type options for media association guidance');
    assert(model.result.metadata.navigationNodes.some(node => node.code === 'nexusCorporateRoot' &&
        node.siteCode === 'nexusCorporateSite'), 'WCMS must expose navigation parent references');
    assert.deepStrictEqual(model.result.metadata.publicationReadiness.requiredDraftParts,
        ['catalogCode', 'siteCode', 'templateCode', 'page', 'sections', 'route'],
    'WCMS must expose publication readiness hints in the authoring model');

    // The same owner must derive independent application selections from persisted references.
    const originalSizes = Object.fromEntries(Object.entries(records).map(([key, rows]) => [key, rows.length]));
    records.sites.push({ code: 'secondSite', catalog: 'secondCatalog', enterpriseCode: 'enterprise-a', active: true });
    const secondScope = { enterpriseCode: 'enterprise-a', catalogCode: 'secondCatalog' };
    records.templates.push({ code: 'secondTemplate', active: true, authoringScope: secondScope });
    records.types.push({ code: 'secondPage', kind: 'PAGE', active: true, authoringScope: secondScope });
    const configuredDefaults = { siteCode: 'nexusCorporateSite', catalogCode: 'nexusContentCatalog',
        templateCode: 'nexusCorporatePageTemplate', pageTypeCode: 'nexusCorporateStandardPageType', slots: ['main'] };
    CONFIG.get = key => key === 'cms' ? { designerAuthoring: { draftDefaults: configuredDefaults,
        componentKinds: [{ typeCode: 'nexusPageHeroType', renderer: 'nexus.component.page-hero' }] } } : originalConfigurationGet(key);
    const fresh = body => ({ ...JSON.parse(JSON.stringify(context)), body });
    const firstModel = (await service.getAuthoringModel(fresh({ siteCode: 'nexusCorporateSite', catalogCode: 'nexusContentCatalog' }))).result;
    assert.deepStrictEqual(firstModel.metadata.sites.map(item => item.code), ['nexusCorporateSite']);
    assert.deepStrictEqual(firstModel.defaults.draftDefaults, configuredDefaults);
    const secondModel = (await service.getAuthoringModel(fresh({ siteCode: 'secondSite', catalogCode: 'secondCatalog' }))).result;
    assert.deepStrictEqual(secondModel.metadata.sites.map(item => item.code), ['secondSite']);
    assert.deepStrictEqual(secondModel.metadata.pageTemplates.map(item => item.code), ['secondTemplate']);
    assert.deepStrictEqual(secondModel.defaults.draftDefaults, {});
    assert.deepStrictEqual(secondModel.defaults.componentKinds, []);
    for (const selection of [{ siteCode: 'secondSite', catalogCode: 'nexusContentCatalog' },
        { siteCode: 'foreignSite', catalogCode: 'secondCatalog' }, { siteCode: 'secondSite' }]) {
        await assert.rejects(service.getAuthoringModel(fresh(selection)), { code: 'ERR_AUTH_00003' });
    }
    for (const [key, size] of Object.entries(originalSizes)) records[key].length = size;
    CONFIG.get = originalConfigurationGet;

    const catalogService = global.SERVICE.DefaultCatalogService;
    global.SERVICE.DefaultCatalogService = {
        get: () => {
            const error = new TypeError("Cannot read properties of undefined (reading 'models')");
            error.stack = 'TypeError: Cannot read properties of undefined (reading \'models\')\n    at module.exports.getModels';
            return Promise.reject(error);
        }
    };
    model = await service.getAuthoringModel(context);
    assert(model.result.metadata.contentCatalogs.some(catalog => catalog.code === 'nexusContentCatalog'),
        'WCMS Designer must derive catalog references from CMS sites when catalog metadata is remote');
    global.SERVICE.DefaultCatalogService = catalogService;

    const missingMedia = structuredClone(draft);
    missingMedia.sections[0].components[0].media[0].mediaCode = 'missingAsset';
    const mediaOwner = global.SERVICE.DefaultMediaReferenceLookupService;
    const missing = Object.assign(new Error('Media reference not found'), { code: 'ERR_MED_00008' });
    global.SERVICE.DefaultMediaReferenceLookupService = {
        validateInternal: request => request.body.referenceCode === 'missingAsset'
            ? Promise.reject(missing) : mediaOwner.validateInternal(request)
    };
    const writesBeforeMissingMedia = saved.length;
    for (const operation of ['validateDraftComposition', 'saveDraftComposition']) {
        await assert.rejects(service[operation]({ ...context, body: missingMedia }),
            error => error === missing);
    }
    assert.equal(saved.length, writesBeforeMissingMedia, 'An invalid media reference must fail before any draft write');
    global.SERVICE.DefaultMediaReferenceLookupService = mediaOwner;

    let validation = await service.validateDraftComposition({ ...context, body: draft });
    assert.strictEqual(validation.result.status, 'VALID_DRAFT');
    assert.deepStrictEqual(validation.result.template.slots, ['main']);
    assert.strictEqual(validation.result.componentCount, 1);

    let save = await service.saveDraftComposition({ ...context, body: draft });
    assert.strictEqual(save.result.status, 'DRAFT_SAVED');
    assert(saved.some(item => item.code === 'gettingStartedPage'), 'draft page must be saved through cmsPage');
    assert(saved.some(item => item.source === 'gettingStartedPage' && item.slot === 'main'),
        'arbitrary template slots must be persisted through cmsComponentDetail');
    assert(saved.some(item => item.componentMediaCode === 'gettingStartedHeroMedia' && item.mediaCode === 'heroMedia'),
        'media item references must be persisted through cmsComponentMedia');

    records.routes.push({ code: 'existingRoute', site: 'nexusCorporateSite', path: '/docs/getting-started',
        locale: 'default', channel: 'web', active: true });
    await assert.rejects(service.validateDraftComposition({ ...context, body: draft }),
        error => error.code === 'ERR_CMS_00105');
    records.routes.length = 0;

    let invalidSlot = JSON.parse(JSON.stringify(draft));
    invalidSlot.sections[0].slot = 'fixedMain';
    await assert.rejects(service.validateDraftComposition({ ...context, body: invalidSlot }),
        error => error.code === 'ERR_CMS_00104');

    let invalidComponent = JSON.parse(JSON.stringify(draft));
    invalidComponent.sections[0].components[0].typeCode = 'richTextComponentType';
    await assert.rejects(service.validateDraftComposition({ ...context, body: invalidComponent }),
        error => error.code === 'ERR_CMS_00104');

    await service.deleteSection({ ...context, body: { ...scope, code: 'gettingStartedPage-main-gettingStartedHero' } });
    assert.equal(removed.length, 0, 'Delete retains historical versions instead of hard removal');
    assert.equal(saved.at(-1).active, false);

    await assert.rejects(service.validatePublishReadiness({ ...context, body: draft }), error => error.code === 'ERR_CMS_00106' && /mark it ready/.test(error.message));
    draft.sections[0].components[0].localizations[0].status = 'READY';
    let publishReady = await service.validatePublishReadiness({ ...context, body: draft });
    assert.strictEqual(publishReady.result.status, 'READY_TO_PUBLISH');
    const reopened = (await service.getDraftComposition({ ...context, body: draft })).result;
    draft.sourceVersion = reopened.sourceVersion;
    await service.saveDraftComposition({ ...context, body: draft });
    records.routes.length = 0;
    records.routes.push({ code: 'nexusCorporateSite-gettingStartedPage-route', site: 'nexusCorporateSite',
        path: '/docs/getting-started', locale: 'default', channel: 'web', active: true, page: 'gettingStartedPage',
        versionId: 7, authoringScope: scope });
    let submitted = (await service.getDraftComposition({ ...context, body: draft })).result.draft;
    let publication = await service.submitForPublication({ ...context, body: submitted });
    assert.strictEqual(publication.result.status, 'PENDING_APPROVAL');
    assert.strictEqual(publicationCalls[0][1].rootType, 'pageRoute');
    assert.strictEqual(publicationCalls[0][1].rootCode, 'nexusCorporateSite-gettingStartedPage-route');
    assert.strictEqual(publicationCalls[0][1].sourceVersion, '7');
    assert.deepStrictEqual(publicationCalls.map(item => item[0]), ['create', 'validate', 'requestApproval']);
    records.routes[0].versionId = 0;
    submitted = (await service.getDraftComposition({ ...context, body: draft })).result.draft;
    await service.submitForPublication({ ...context, body: submitted });
    assert.strictEqual(publicationCalls[3][1].sourceVersion, '0');
    assert(publicationCalls[3][1].code.endsWith('-0'), 'Initial immutable route version is part of the publication identity');
    records.routes.length = 0;
    let noRoute = JSON.parse(JSON.stringify(draft));
    delete noRoute.route;
    await assert.rejects(service.validatePublishReadiness({ ...context, body: noRoute }),
        error => error.code === 'ERR_CMS_00106');

    const longDraft = structuredClone(draft);
    delete longDraft.sourceVersion;
    const longCode = 'a'.repeat(127) + 'b';
    const longComponent = longDraft.sections[0].components[0];
    longDraft.page.code = longCode;
    longDraft.route.path = '/designer-long-identity';
    longComponent.code = longCode + 'MainComponent';
    delete longComponent.media[0].componentMediaCode;
    const start = saved.length;
    assert.equal((await service.validateDraftComposition({ ...context, body: longDraft })).result.status, 'VALID_DRAFT');
    assert.equal(saved.length, start);
    await service.saveDraftComposition({ ...context, body: longDraft });
    const persisted = saved.slice(start);
    assert(persisted.some(row => row.code === longCode));
    assert(persisted.every(row => /^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/.test(row.code)));
    const readback = (await service.getDraftComposition({ ...context, body: longDraft })).result;
    assert.equal(readback.editable, true);
    const component = readback.draft.sections[0].components[0];
    assert.match(component.code, /^component-[a-f0-9]{64}$/);
    assert.equal(component.media[0].mediaCode, longComponent.media[0].mediaCode);
    assert.equal(component.localizations[0].locale, 'en');
    await service.submitForPublication({ ...context, body: readback.draft });
    assert.match(publicationCalls.at(-3)[1].code, /^cms-nexusCorporateSite-route-[a-f0-9]{64}-0$/);
    const invalid = structuredClone(longDraft);
    invalid.sections[0].components[0].code = 'b'.repeat(129);
    await assert.rejects(service.validateDraftComposition({ ...context, body: invalid }),
        error => error.code === 'ERR_CMS_00100');

    console.log('CMS designer composition contract validated');
})().catch(error => {
    console.error(error);
    process.exitCode = 1;
});
