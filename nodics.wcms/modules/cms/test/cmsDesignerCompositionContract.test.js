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
const authProperties = require(path.join(root, '../nodics.core/modules/nAuth/config/properties'));
const profileGroups = require(path.join(root, '../nodics.platform/modules/profile/data/init/data/groups/defaultBootstrapUserGroupsData'));

assert.strictEqual(wcmsProperties.apiExposure.categories.cmsAuthoring.enabled, true,
    'WCMS must enable cmsAuthoring at module default so server config only carries topology deltas');
assert(authProperties.identityGovernance.permissionCatalog.includes('cms.backoffice.manage'),
    'cms.backoffice.manage must be in the governed permission catalog');
assert(profileGroups.record4.permissions.includes('cms.backoffice.manage'),
    'content authors must receive explicit CMS authoring permission through profile data');

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
    ['validatePublishReadiness', 'POST', '/designer/composition/publish-readiness', 'cms.backoffice.manage']
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
    catalogs: [{ code: 'documentationContentCatalog', name: 'Documentation', catalogType: 'CONTENT', active: true }],
    sites: [{ code: 'axisDocumentationSite', name: 'Axis Docs', catalog: 'documentationContentCatalog', active: true }],
    templates: [{ code: 'articleTemplate', name: 'Article Template', renderer: 'axis.template.documentation-article', active: true }],
    slots: [
        { code: 'articleNavigationSlot', template: 'articleTemplate', name: 'navigation', minItems: 0, maxItems: 3,
            allowedComponentTypes: ['documentationNavigationComponentType'], active: true },
        { code: 'articleBodySlot', template: 'articleTemplate', name: 'article', minItems: 1,
            allowedComponentTypeGroups: ['documentationAuthoringGroup'], active: true },
        { code: 'relatedSlot', template: 'articleTemplate', name: 'relatedResources', minItems: 0, maxItems: 5, active: true }
    ],
    types: [
        { code: 'documentationPageType', kind: 'PAGE', active: true },
        { code: 'documentationNavigationComponentType', kind: 'COMPONENT', active: true },
        { code: 'richTextComponentType', kind: 'COMPONENT', active: true },
        { code: 'mediaCardComponentType', kind: 'COMPONENT', active: true }
    ],
    groups: [{ code: 'documentationAuthoringGroup', componentTypeCodes: ['richTextComponentType', 'mediaCardComponentType'], active: true }],
    routes: []
};
const saved = [];
const removed = [];
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
    DefaultCmsPageRouteService: generatedService(records.routes),
    DefaultCmsPageService: generatedService([]),
    DefaultCmsComponentService: generatedService([]),
    DefaultCmsComponentDetailService: generatedService([]),
    DefaultCmsComponentMediaService: generatedService([]),
    DefaultCmsNavigationNodeService: generatedService([]),
    DefaultCmsDeliveryCacheInvalidationService: { invalidate: () => Promise.resolve(true) },
    DefaultMediaReferenceLookupService: {
        validateInternal: request => Promise.resolve({
            referenceType: request.body.referenceType,
            code: request.body.referenceCode
        })
    }
};
global.SERVICE.DefaultCmsContractValidationService = require(path.join(root, 'modules/cms/src/service/validation/defaultCmsContractValidationService'));

const draft = {
    catalogCode: 'documentationContentCatalog',
    siteCode: 'axisDocumentationSite',
    templateCode: 'articleTemplate',
    page: { code: 'gettingStartedPage', name: 'Getting Started', typeCode: 'documentationPageType' },
    sections: [
        { slot: 'navigation', index: 0, components: [{ code: 'gettingStartedNav', typeCode: 'documentationNavigationComponentType', accessMode: 'AUTHENTICATED' }] },
        { slot: 'article', index: 0, components: [{ code: 'gettingStartedArticle', typeCode: 'richTextComponentType', properties: { markdown: '# Hello' },
            media: [{ componentMediaCode: 'gettingStartedHeroMedia', mediaCode: 'heroMedia', mediaType: 'IMAGE', role: 'primary', position: 0 }] }] },
        { slot: 'relatedResources', index: 0, components: [{ code: 'gettingStartedRelated', typeCode: 'mediaCardComponentType',
            media: [{ componentMediaCode: 'gettingStartedRelatedSet', mediaSetCode: 'relatedSet', mediaType: 'IMAGE', role: 'gallery', position: 0 }] }] }
    ],
    route: { path: '/docs/getting-started', accessMode: 'AUTHENTICATED' },
    navigation: { title: 'Getting Started', position: 10 }
};

(async () => {
    let model = await service.getAuthoringModel({});
    assert.strictEqual(model.result.hierarchy[0], 'Content Catalog');
    assert.strictEqual(model.result.rules.arbitrarySlots, true);
    assert.strictEqual(model.result.rules.frontendPersistence, false);
    assert(model.result.operations.includes('associateMedia'));
    assert.strictEqual(model.result.defaults.draftDefaults.catalogCode, 'documentationContentCatalog',
        'WCMS must publish designer draft defaults through the authoring model');
    assert(model.result.defaults.componentKinds.some(kind => kind.typeCode === 'richTextComponentType'),
        'WCMS must publish component-kind options instead of forcing Axis to own backend type codes');

    let validation = await service.validateDraftComposition({ tenant: 'tenant-a', authData: {}, body: draft });
    assert.strictEqual(validation.result.status, 'VALID_DRAFT');
    assert.deepStrictEqual(validation.result.template.slots, ['navigation', 'article', 'relatedResources']);
    assert.strictEqual(validation.result.componentCount, 3);

    let save = await service.saveDraftComposition({ tenant: 'tenant-a', authData: {}, body: draft });
    assert.strictEqual(save.result.status, 'DRAFT_SAVED');
    assert(saved.some(item => item.code === 'gettingStartedPage'), 'draft page must be saved through cmsPage');
    assert(saved.some(item => item.source === 'gettingStartedPage' && item.slot === 'relatedResources'),
        'arbitrary template slots must be persisted through cmsComponentDetail');
    assert(saved.some(item => item.componentMediaCode === 'gettingStartedHeroMedia' && item.mediaCode === 'heroMedia'),
        'media item references must be persisted through cmsComponentMedia');

    records.routes.push({ code: 'existingRoute', site: 'axisDocumentationSite', path: '/docs/getting-started',
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
    let noRoute = JSON.parse(JSON.stringify(draft));
    delete noRoute.route;
    await assert.rejects(service.validatePublishReadiness({ tenant: 'tenant-a', authData: {}, body: noRoute }),
        error => error.code === 'ERR_CMS_00106');

    console.log('CMS designer composition contract validated');
})().catch(error => {
    console.error(error);
    process.exitCode = 1;
});
