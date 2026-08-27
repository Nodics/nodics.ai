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
const authProperties = require(path.join(root, '../nodics.foundation/modules/nAuth/config/properties'));
const profileGroups = require(path.join(root, '../nodics.platform/modules/profile/data/init-v001/records/groups/defaultBootstrapUserGroupsData'));

assert.strictEqual(wcmsProperties.apiExposure.categories.cmsAuthoring.enabled, true,
    'WCMS must enable cmsAuthoring at module default so server config only carries topology deltas');
assert.strictEqual(wcmsProperties.cms.designerAuthoring.draftDefaults.catalogCode, 'nexusContentCatalog',
    'WCMS module default designer policy must point to an installed Nexus authoring catalog');
assert.strictEqual(wcmsProperties.cms.designerAuthoring.draftDefaults.templateCode, 'nexusCorporatePageTemplate',
    'WCMS module default designer policy must not point to stale documentation templates');
assert.deepStrictEqual(wcmsProperties.cms.designerAuthoring.draftDefaults.slots, ['main'],
    'WCMS module default designer policy must expose the Nexus template slot shape');
assert(wcmsProperties.cms.designerAuthoring.componentKinds.some(kind => kind.typeCode === 'nexusPageHeroType'),
    'WCMS module default designer policy must expose Nexus component kinds');
assert(authProperties.identityGovernance.permissionCatalog.includes('cms.backoffice.manage'),
    'cms.backoffice.manage must be in the governed permission catalog');
assert(authProperties.identityGovernance.permissionCatalog.includes('cms.publication.emergencyOverride'),
    'cms.publication.emergencyOverride must be in the governed permission catalog');
assert(profileGroups.record4.permissions.includes('cms.backoffice.manage'),
    'content authors must receive explicit CMS authoring permission through profile data');
assert(profileGroups.record1.permissions.includes('cms.publication.emergencyOverride'),
    'admin operators must receive explicit CMS publication emergency override permission through profile data');

[
    ['getAuthoringModel', 'GET', '/designer/composition/model', 'cms.backoffice.view'],
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
    assert.strictEqual(routers[operation].permission, permission);
});

['ERR_CMS_00100', 'ERR_CMS_00101', 'ERR_CMS_00102', 'ERR_CMS_00103',
    'ERR_CMS_00104', 'ERR_CMS_00105', 'ERR_CMS_00106'].forEach(code => {
    assert(statusDefinitions[code], code + ' must be registered');
});

const records = {
    catalogs: [{ code: 'nexusContentCatalog', name: 'Nexus Content', catalogType: 'CONTENT', active: true }],
    sites: [{ code: 'nexusCorporateSite', name: 'Nexus Corporate', catalog: 'nexusContentCatalog', active: true }],
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
    navigationNodes: [{ code: 'nexusCorporateRoot', name: 'Nexus Corporate', title: 'Nexus Corporate', site: 'nexusCorporateSite', nodeType: 'CONTAINER', status: 'ACTIVE' }],
    routes: []
};
const saved = [];
const removed = [];
const publicationCalls = [];
const matches = (model, query) => Object.keys(query).every(key => {
    if (key === 'active' && model[key] === undefined) return true;
    let expected = query[key];
    return expected && expected.$in ? expected.$in.includes(model[key]) : model[key] === expected;
});
const generatedService = list => ({
    get: request => Promise.resolve({ result: list.filter(item => matches(item, request.query || {})) }),
    save: request => { saved.push(request.model); list.push(request.model); return Promise.resolve({ result: [request.model] }); },
    remove: request => { removed.push(request.query); return Promise.resolve({ result: request.query }); }
});

global.CLASSES = { NodicsError: class NodicsError extends Error { constructor(code, message) { super(message); this.code = code; } } };
global.CONFIG = { get: key => key === 'cms' ? { designerAuthoring: { maximumReferenceLookupItems: 25 } } : undefined };
global.SERVICE = {
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

(async () => {
    let model = await service.getAuthoringModel({});
    assert.strictEqual(model.result.hierarchy[0], 'Content Catalog');
    assert.strictEqual(model.result.rules.arbitrarySlots, true);
    assert.strictEqual(model.result.rules.frontendPersistence, false);
    assert(model.result.operations.includes('associateMedia'));
    assert.strictEqual(model.result.defaults.draftDefaults.catalogCode, 'nexusContentCatalog',
        'WCMS must publish designer draft defaults through the authoring model');
    assert(model.result.defaults.componentKinds.some(kind => kind.typeCode === 'nexusPageHeroType'),
        'WCMS must publish component-kind options instead of forcing Axis to own backend type codes');
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

    const catalogService = global.SERVICE.DefaultCatalogService;
    global.SERVICE.DefaultCatalogService = {
        get: () => {
            const error = new TypeError("Cannot read properties of undefined (reading 'models')");
            error.stack = 'TypeError: Cannot read properties of undefined (reading \'models\')\n    at module.exports.getModels';
            return Promise.reject(error);
        }
    };
    model = await service.getAuthoringModel({});
    assert(model.result.metadata.contentCatalogs.some(catalog => catalog.code === 'nexusContentCatalog'),
        'WCMS Designer must derive catalog references from CMS sites when catalog metadata is remote');
    global.SERVICE.DefaultCatalogService = catalogService;

    let validation = await service.validateDraftComposition({ tenant: 'tenant-a', authData: {}, body: draft });
    assert.strictEqual(validation.result.status, 'VALID_DRAFT');
    assert.deepStrictEqual(validation.result.template.slots, ['main']);
    assert.strictEqual(validation.result.componentCount, 1);

    let save = await service.saveDraftComposition({ tenant: 'tenant-a', authData: {}, body: draft });
    assert.strictEqual(save.result.status, 'DRAFT_SAVED');
    assert(saved.some(item => item.code === 'gettingStartedPage'), 'draft page must be saved through cmsPage');
    assert(saved.some(item => item.source === 'gettingStartedPage' && item.slot === 'main'),
        'arbitrary template slots must be persisted through cmsComponentDetail');
    assert(saved.some(item => item.componentMediaCode === 'gettingStartedHeroMedia' && item.mediaCode === 'heroMedia'),
        'media item references must be persisted through cmsComponentMedia');

    records.routes.push({ code: 'existingRoute', site: 'nexusCorporateSite', path: '/docs/getting-started',
        locale: 'default', channel: 'web', active: true });
    await assert.rejects(service.validateDraftComposition({ tenant: 'tenant-a', authData: {}, body: draft }),
        error => error.code === 'ERR_CMS_00105');
    records.routes.length = 0;

    let invalidSlot = JSON.parse(JSON.stringify(draft));
    invalidSlot.sections[0].slot = 'fixedMain';
    await assert.rejects(service.validateDraftComposition({ tenant: 'tenant-a', authData: {}, body: invalidSlot }),
        error => error.code === 'ERR_CMS_00104');

    let invalidComponent = JSON.parse(JSON.stringify(draft));
    invalidComponent.sections[0].components[0].typeCode = 'richTextComponentType';
    await assert.rejects(service.validateDraftComposition({ tenant: 'tenant-a', authData: {}, body: invalidComponent }),
        error => error.code === 'ERR_CMS_00104');

    await service.deleteSection({ body: { code: 'gettingStartedPage-navigation-gettingStartedNav' } });
    assert.deepStrictEqual(removed.pop(), { code: 'gettingStartedPage-navigation-gettingStartedNav' });

    let publishReady = await service.validatePublishReadiness({ tenant: 'tenant-a', authData: {}, body: draft });
    assert.strictEqual(publishReady.result.status, 'READY_TO_PUBLISH');
    records.routes.push({ code: 'nexusCorporateSite-gettingStartedPage-route', site: 'nexusCorporateSite',
        path: '/docs/getting-started', locale: 'default', channel: 'web', active: true, page: 'gettingStartedPage',
        versionId: 7 });
    let publication = await service.submitForPublication({ tenant: 'tenant-a', authData: {}, body: draft });
    assert.strictEqual(publication.result.status, 'PENDING_APPROVAL');
    assert.strictEqual(publicationCalls[0][1].rootType, 'pageRoute');
    assert.strictEqual(publicationCalls[0][1].rootCode, 'nexusCorporateSite-gettingStartedPage-route');
    assert.strictEqual(publicationCalls[0][1].sourceVersion, '7');
    assert.deepStrictEqual(publicationCalls.map(item => item[0]), ['create', 'validate', 'requestApproval']);
    records.routes.length = 0;
    let noRoute = JSON.parse(JSON.stringify(draft));
    delete noRoute.route;
    await assert.rejects(service.validatePublishReadiness({ tenant: 'tenant-a', authData: {}, body: noRoute }),
        error => error.code === 'ERR_CMS_00106');

    console.log('CMS designer composition contract validated');
})().catch(error => {
    console.error(error);
    process.exitCode = 1;
});
