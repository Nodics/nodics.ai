/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module cms/test/cmsContentDeliveryContract
 * @description Covers CMS delivery, association identity and nested generated-query composition without runtime providers.
 * @layer test
 * @owner cms
 * @override Extend existing owner assertions when association identity or selected service customization changes.
 */
const assert = require('assert');
const path = require('path');

const root = path.resolve(__dirname, '../../..');
const schemas = require(path.join(root, 'modules/cms/src/schemas/schemas'));
const routes = require(path.join(root, 'modules/cms/src/router/routers')).cms;
const statusDefinitions = require(path.join(root, 'modules/cms/src/utils/statusDefinitions'));
const initialTypes = require(path.join(root, 'modules/cms/data/init-v001/records/content/defaultCmsTypeCodeData'));
const sampleHeaderComponents = require(path.join(root, 'modules/cms/data/sample-v001/records/components/sampleHeaderCmsComponentData'));
const validation = require(path.join(root, 'modules/cms/src/service/validation/defaultCmsContractValidationService'));
const componentDetailInterceptor = require(path.join(root, 'modules/cms/src/service/interceptors/defaultCmsComponentDetailInterceptorService'));

assert.strictEqual(Object.keys(initialTypes).length, new Set(Object.keys(initialTypes)).size);
assert(Object.values(initialTypes).some(item => item.code === 'menuLinkComponentType'));
assert(Object.values(initialTypes).some(item => item.code === 'navigationalComponentType'));

['cmsPageRoute', 'cmsPageTemplate', 'cmsSlotDefinition'].forEach(name => {
    assert(schemas.cms[name] && schemas.cms[name].model, name + ' must be an owned CMS model');
});
assert(schemas.cms.cmsTypeCode.definition.kind, 'existing cmsTypeCode must remain the component/page type authority');
assert(schemas.cms.cmsTypeCode.definition.propertySchema, 'type authority must support declarative property contracts');
assert(schemas.cms.cmsTypeCode.definition.mediaSchema, 'type authority must support declarative media-association contracts');
assert.deepStrictEqual(schemas.cms.cmsTypeCode2Renderer.definition.channels.default, ['web']);
assert.strictEqual(schemas.cms.cmsTypeCode2Renderer.definition.deprecated.type, 'bool',
    'persistent CMS boolean fields must use the MongoDB BSON bool type');
assert.strictEqual(schemas.cms.cmsTypeCode2Renderer.definition.deprecated.default, false);
assert(schemas.cms.cmsTypeCode2Renderer.definition.replacementRenderer);
assert(schemas.cms.cmsComponent.definition.properties, 'component delivery properties must be an explicit schema contract');
assert.strictEqual(schemas.cms.cmsComponent.definition.accessMode.default, 'AUTHENTICATED');
assert.deepStrictEqual(schemas.cms.cmsComponent.definition.accessMode.enum, ['PUBLIC', 'AUTHENTICATED', 'CUSTOMER']);
assert.deepStrictEqual(schemas.cms.cmsPageRoute.definition.accessMode.enum, ['PUBLIC', 'AUTHENTICATED', 'CUSTOMER']);
assert(schemas.cms.cmsComponentMedia.definition.componentMediaCode, 'CMS must own structured component media associations');
assert(schemas.cms.cmsComponentMedia.definition.componentCode, 'CMS component medias must point to a CMS component');
assert(schemas.cms.cmsComponentMedia.definition.mediaCode, 'CMS component medias may point to one media media item');
assert(schemas.cms.cmsComponentMedia.definition.mediaSetCode, 'CMS component medias may point to one media media set');
const typeByCode = Object.values(initialTypes).reduce((accumulator, item) => {
    accumulator[item.code] = item;
    return accumulator;
}, {});
['imageComponentType', 'imagesComponentType', 'imageTextComponentType', 'homePageBannerComponentType'].forEach(typeCode => {
    assert(typeByCode[typeCode].mediaSchema, typeCode + ' must declare its CMS-owned media association contract');
});
assert.strictEqual(typeByCode.imageComponentType.propertySchema.mediaCode, undefined, 'media item codes do not belong in generic component properties');
assert.strictEqual(typeByCode.homePageBannerComponentType.propertySchema.mediaSetCode, undefined, 'media set codes do not belong in generic component properties');
assert.strictEqual(sampleHeaderComponents.record2.media, undefined, 'CMS samples must not store raw media objects or URLs');
assert.strictEqual(sampleHeaderComponents.record2.properties, undefined, 'CMS sample media association belongs in cmsComponentMedia data');
assert.strictEqual(routes.cmsDelivery.resolvePublicPage.publicAccess, true);
assert.strictEqual(routes.cmsDelivery.resolvePublicPage.secured, false);
assert.strictEqual(routes.cmsDelivery.resolveAuthenticatedPage.secured, true);
assert.strictEqual(routes.cmsDelivery.resolveAuthenticatedPage.permissionConfig, 'cms.delivery.authenticatedPermission');
assert.strictEqual(statusDefinitions.ERR_CMS_00087.code, '404');
assert.strictEqual(statusDefinitions.ERR_CMS_00086.code, '403');
assert.strictEqual(statusDefinitions.ERR_CMS_00092.code, '422');
assert.strictEqual(statusDefinitions.ERR_CMS_00093.code, '422');

global.CONFIG = { get: () => undefined };
global.SERVICE = {
    DefaultCmsComponentDetailInterceptorService: componentDetailInterceptor,
    DefaultCmsComponentDetailService: {
        get: () => Promise.resolve({ result: [] }),
        remove: () => Promise.resolve({ result: true }),
        update: () => Promise.resolve({ result: true })
    },
    DefaultCmsComponentMediaService: {
        get: () => Promise.resolve({ result: [] })
    },
    DefaultCmsComponentService: {
        get: () => Promise.resolve({ result: [{ code: 'hero', active: true }] })
    },
    DefaultMediaReferenceLookupService: {
        validateInternal: request => Promise.resolve({
            referenceType: request.body.referenceType,
            code: request.body.referenceCode
        })
    }
};

/** Exercises parent normalization, actual nested-save delegation and the actual generated primary query guard without providers. */
async function verifyNestedAssociationIdentity() {
    const previous = Object.fromEntries(['SERVICE', 'UTILS', 'CLASSES', 'NODICS'].map(key => [key, global[key]]));
    const stringProperties = Object.getOwnPropertyDescriptors(String.prototype);
    const queryBuilder = Object.assign({}, require('../../../../nodics.foundation/modules/nDatabase/database/src/service/procs/query/defaultModelQueryBuilderPipelineService'), { LOG: { debug() {} } });
    const nested = require('../../../../nodics.foundation/modules/nDatabase/database/src/service/model/defaultModelService');
    const base = require('../../../../nodics.foundation/modules/nDatabase/database/src/schemas/schemas');
    const cmsSchemas = schemas.cms;
    const childSchema = { ...cmsSchemas.cmsComponentDetail,
        definition: { ...base.default.base.definition, ...cmsSchemas.cmsComponentDetail.definition } };
    const reads = [], saved = [];
    const auth = { tenant: 'tenant-a', entCode: 'enterprise-a' };
    const selected = { ...componentDetailInterceptor };
    try {
        require('../../../../nodics.foundation/modules/nConfig/config/prescripts').addStringCamelCaseFunction();
        global.CLASSES = { NodicsError: class extends Error {
            constructor(code, message) { super(message); this.code = code; }
            add(error) { this.causes = [...(this.causes || []), error]; }
        } };
        global.UTILS = { isObject: value => value !== null && typeof value === 'object' && !Array.isArray(value),
            isObjectId: () => false, isArrayOfObject: value => Array.isArray(value) && value.every(item => item && typeof item === 'object') };
        global.NODICS = { getModule: name => name === 'cms' ? { rawSchema: cmsSchemas } : undefined };
        global.SERVICE = {
            DefaultCmsComponentDetailInterceptorService: selected,
            DefaultModelService: nested,
            DefaultCmsComponentDetailService: {
                get: async request => { reads.push(request); return { result: [] }; },
                saveAll: async request => {
                    assert.strictEqual(request.authData, auth);
                    assert.strictEqual(request.tenant, 'tenant-a');
                    assert.strictEqual(request.options.replaceAllMatchesByQuery, true);
                    const result = [];
                    for (const model of request.models) {
                        const child = { ...request, model, schemaModel: { moduleName: 'cms', schemaName: 'cmsComponentDetail', rawSchema: childSchema } };
                        queryBuilder.buildPrimeryQuery(child, {}, { stop() {}, nextSuccess: () => assert.fail('Primary code guard must remain active') });
                        assert.deepStrictEqual(child.query, { code: model.code });
                        await selected.generateCmsComponentDetailCode(child, {});
                        await validation.validateAssociation(child);
                        saved.push(structuredClone(model));
                        result.push(model);
                    }
                    return { result };
                }
            }
        };
        const persist = async (schemaName, property, parent, normalize = true) => {
            const request = { tenant: 'tenant-a', authData: auth, model: parent, options: { replaceAllMatchesByQuery: true },
                schemaModel: { moduleName: 'cms', schemaName, rawSchema: cmsSchemas[schemaName] } };
            if (normalize) await componentDetailInterceptor[property === 'subComponents' ? 'setCompDetailSourceForComp' : 'setCompDetailSourceForPage'](request, {});
            await nested.saveNestedModels({ request, response: {}, model: parent, propertiesList: [property] });
            return parent;
        };
        await assert.rejects(persist('cmsComponent', 'subComponents', { code: 'parent', subComponents: [{ source: 'parent', target: 'hero', slot: 'body', index: 0 }] }, false),
            error => error.code === 'ERR_SAVE_00003');
        assert.strictEqual(saved.length, 0, 'No child can reach validation/persistence before primary identity exists');
        for (const [schemaName, property] of [['cmsComponent', 'subComponents'], ['cmsPage', 'cmsComponents']]) {
            const parent = { code: 'parent', accessGroups: ['authors'], [property]: [
                { target: 'hero', slot: 'body', index: 0, active: true },
                { code: 'explicit-code', source: 'explicit-source', target: 'footer', slot: 'footer', index: 1, active: true }
            ] };
            await persist(schemaName, property, parent);
            assert.deepStrictEqual(parent[property], ['parent2Hero', 'explicit-code']);
            assert.strictEqual(saved.at(-1).source, 'explicit-source');
            assert.strictEqual(saved.at(-2).slot, 'body');
            assert.strictEqual(saved.at(-2).index, 0);
            assert.strictEqual(saved.at(-2).active, true);
        }
        let overrideCalls = 0;
        selected.generateCmsComponentDetailCode = async request => {
            await Promise.resolve();
            if (!request.model.code) { overrideCalls++; request.model.code = 'project-placement'; }
            return true;
        };
        for (const [schemaName, property] of [['cmsComponent', 'subComponents'], ['cmsPage', 'cmsComponents']]) {
            const parent = { code: 'custom-parent', [property]: [{ target: 'hero', slot: 'custom', index: 2 },
                { code: 'custom-explicit', target: 'footer', slot: 'footer', index: 3 }] };
            await persist(schemaName, property, parent);
            assert.deepStrictEqual(parent[property], ['project-placement', 'custom-explicit']);
        }
        assert.strictEqual(overrideCalls, 2, 'Parent preparation uses selected asynchronous helper only for missing identities');
        const customizedIdentity = selected.generateCmsComponentDetailCode;
        selected.generateCmsComponentDetailCode = async () => true;
        const beforeInvalidOverride = saved.length;
        await assert.rejects(persist('cmsComponent', 'subComponents', { code: 'parent', subComponents: [{ target: 'hero', slot: 'body', index: 0 }] }),
            error => error.code === 'ERR_SAVE_00003');
        assert.strictEqual(saved.length, beforeInvalidOverride, 'An incomplete project helper cannot bypass the generated replacement identity guard');
        selected.generateCmsComponentDetailCode = async () => { throw new Error('Project identity preparation denied'); };
        await assert.rejects(persist('cmsPage', 'cmsComponents', { code: 'parent', cmsComponents: [{ target: 'hero', slot: 'body', index: 0 }] }),
            /Project identity preparation denied/);
        assert.strictEqual(saved.length, beforeInvalidOverride, 'Selected helper failure stops before nested save');
        selected.generateCmsComponentDetailCode = customizedIdentity;
        const service = SERVICE.DefaultCmsComponentDetailService;
        service.get = async () => ({ result: [{ code: 'occupied-placement', source: 'parent', slot: 'body', index: 0, active: true }] });
        const beforeCollision = saved.length;
        await assert.rejects(persist('cmsComponent', 'subComponents', { code: 'parent', subComponents: [{ target: 'hero', slot: 'body', index: 0 }] }),
            error => error.code === 'CMS_ASSOCIATION_POSITION_CONFLICT');
        assert.strictEqual(saved.length, beforeCollision, 'Project identity cannot bypass existing association collision validation');
        service.get = async () => ({ result: [] });
        await assert.rejects(persist('cmsPage', 'cmsComponents', { code: 'parent', cmsComponents: [{ target: 'hero', slot: 'body', index: -1 }] }),
            error => error.code === 'CMS_ASSOCIATION_INVALID');
        const removed = [];
        service.get = async () => ({ result: [{ code: 'project-placement' }, { code: 'old-placement' }] });
        service.remove = async request => { removed.push(request.query.code); return { result: true }; };
        await componentDetailInterceptor.retireObsoletePageComponentDetails({ tenant: 'tenant-a', authData: auth,
            model: { code: 'custom-parent', cmsComponents: [{ target: 'hero', slot: 'body', index: 0 }] }, options: {} }, {});
        assert.deepStrictEqual(removed, ['old-placement'], 'Retirement must compare selected prepared identities, not rederive default codes');
        assert(reads.length > 0);
        console.log('CMS nested association identity composition validated: strict primary guard, component/page defaults, explicit codes, selected override, collision/invariant and retirement');
    } finally {
        for (const [key, value] of Object.entries(previous)) {
            if (value === undefined) delete global[key]; else global[key] = value;
        }
        for (const key of Object.getOwnPropertyNames(String.prototype)) {
            if (!Object.hasOwn(stringProperties, key)) delete String.prototype[key];
        }
        Object.defineProperties(String.prototype, stringProperties);
    }
}

(async () => {
    await verifyNestedAssociationIdentity();
    await validation.validateRenderer({ model: { renderer: 'component.hero-banner' } });
    await validation.validateRenderer({ model: { renderer: 'agora.heroBanner' } });
    await assert.rejects(validation.validateRenderer({ model: { renderer: 'https://host/view.js' } }), error => error.code === 'CMS_RENDERER_KEY_INVALID');
    await assert.rejects(validation.validateRenderer({ model: { renderer: 'agora/heroBanner' } }), error => error.code === 'CMS_RENDERER_KEY_INVALID');
    let route = { model: { path: '//account///profile', routeType: 'PAGE' } };
    await validation.validateRoute(route);
    assert.strictEqual(route.model.path, '/account/profile');
    await assert.rejects(validation.validateRoute({ model: { path: 'https://host/path', routeType: 'PAGE' } }), error => error.code === 'CMS_ROUTE_PATH_INVALID');
    await validation.validateAssociation({ tenant: 'tenant-a', model: { source: 'page', target: 'hero', index: 0 }, options: {} });
    let retiredCodes = [];
    global.SERVICE.DefaultCmsComponentDetailService.get = () => Promise.resolve({ result: [
        { code: 'home2OldHero', source: 'home', target: 'oldHero', slot: 'main', index: 0, active: true },
        { code: 'home2NewHero', source: 'home', target: 'newHero', slot: 'main', index: 0, active: true }
    ] });
    global.SERVICE.DefaultCmsComponentDetailService.remove = request => {
        retiredCodes.push(request.query.code);
        return Promise.resolve({ result: true });
    };
    await componentDetailInterceptor.retireObsoletePageComponentDetails({ tenant: 'tenant-a', authData: {},
        model: { code: 'home', cmsComponents: [{ code: 'home2NewHero', target: 'newHero', slot: 'main', index: 0 }] } }, {});
    assert.deepStrictEqual(retiredCodes, ['home2OldHero']);
    retiredCodes = [];
    global.SERVICE.DefaultCmsComponentDetailService.get = () => Promise.resolve({ result: [
        { code: 'home2OldHero', source: 'home', target: 'oldHero', slot: 'main', index: 0, active: true }
    ] });
    await validation.validateAssociation({ tenant: 'tenant-a', options: { allowCmsAssociationReplacement: true },
        model: { code: 'home2NewHero', source: 'home', target: 'newHero', slot: 'main', index: 0 } });
    assert.deepStrictEqual(retiredCodes, ['home2OldHero']);
    retiredCodes = [];
    await validation.validateAssociation({ tenant: 'tenant-a',
        model: { code: 'home2NewHero', source: 'home', target: 'newHero', slot: 'main', index: 0,
            allowCmsAssociationReplacement: true } });
    assert.deepStrictEqual(retiredCodes, ['home2OldHero']);
    await validation.validateComponentMedia({ tenant: 'tenant-a', authData: {}, model: {
        code: 'hero-primary-media',
        componentMediaCode: 'hero-primary-media',
        componentCode: 'hero',
        mediaCode: 'hero-image',
        mediaType: 'IMAGE',
        role: 'primary',
        position: 0
    } });
    await assert.rejects(validation.validateComponentMedia({ tenant: 'tenant-a', authData: {}, model: {
        componentMediaCode: 'hero-invalid-media',
        componentCode: 'hero',
        mediaCode: 'hero-image',
        mediaSetCode: 'hero-image-set',
        mediaType: 'IMAGE',
        role: 'primary',
        position: 0
    } }), error => error.code === 'ERR_CMS_00094');

    global._ = require('lodash');
    global.UTILS = {
        isObject: value => value !== null && typeof value === 'object' && !Array.isArray(value)
    };
    global.CONFIG = { get: key => key === 'cms' ? {
        delivery: { defaultLocale: 'en', defaultChannel: 'web', maxDepth: 3, maxComponents: 4 }
    } : undefined };
    const data = {
        routes: [
            { site: 'site', path: '/home', locale: 'en', channel: 'web', page: 'home', routeType: 'PAGE', deliveryState: 'ONLINE', accessMode: 'PUBLIC' },
            { site: 'site', path: '/account', locale: 'en', channel: 'web', page: 'account', routeType: 'PAGE', deliveryState: 'ONLINE', accessMode: 'CUSTOMER' }
        ],
        pages: [
            { code: 'home', name: 'Home', typeCode: 'homePage', template: 'main', internalNote: 'hidden' },
            { code: 'account', name: 'Account', typeCode: 'accountPage', template: 'main', internalNote: 'hidden' }
        ],
        details: [
            { code: 'homeHero', source: 'home', target: 'hero', slot: 'main', index: 0, active: true },
            { code: 'accountPanelPlacement', source: 'account', target: 'accountPanel', slot: 'main', index: 0, active: true }
        ],
        components: [{ code: 'hero', typeCode: 'heroType', accessMode: 'PUBLIC', active: true,
            properties: { title: 'Hello' }, secret: 'hidden' },
        { code: 'accountPanel', typeCode: 'accountPanelType', accessMode: 'CUSTOMER', active: true,
            properties: { title: 'Customer account' }, secret: 'hidden' }],
        componentMedia: [{ code: 'heroBackground', componentMediaCode: 'heroBackground', componentCode: 'hero',
            mediaSetCode: 'heroBackgroundSet', mediaType: 'IMAGE', role: 'background', slot: 'default',
            position: 0, altText: 'Hero background', storageKey: 'hidden', active: true }],
        templates: [{ code: 'main', renderer: 'template.main', contractVersion: 0 }],
        rendererMappings: [
            { code: 'homePage', renderer: 'page.home', contractVersion: 0, channels: ['web'] },
            { code: 'accountPage', renderer: 'page.account', contractVersion: 0, channels: ['web'] },
            { code: 'heroType', renderer: 'component.hero', contractVersion: 2,
                channels: ['web', 'mobile-webview'], deprecated: true, replacementRenderer: 'component.hero-v2' },
            { code: 'accountPanelType', renderer: 'component.account-panel', contractVersion: 0, channels: ['web'] }
        ]
    };
    const matches = (model, query) => Object.keys(query).every(key => {
        if (key === 'active' && model[key] === undefined) return true;
        let expected = query[key];
        return expected && expected.$in ? expected.$in.includes(model[key]) : model[key] === expected;
    });
    const deliverySearchOptions = [];
    const service = list => ({ get: request => {
        deliverySearchOptions.push(request.searchOptions);
        return Promise.resolve({ result: list.filter(model => matches(model, request.query)) });
    } });
    global.SERVICE = {
        DefaultCmsPageRouteService: service(data.routes),
        DefaultCmsPageService: service(data.pages),
        DefaultCmsPageTemplateService: service(data.templates),
        DefaultCmsComponentDetailService: service(data.details),
        DefaultCmsComponentService: service(data.components),
        DefaultCmsComponentMediaService: service(data.componentMedia),
        DefaultCmsTypeCode2RendererService: service(data.rendererMappings)
    };
    const rendererInterceptor = require(path.join(root, 'modules/cms/src/service/interceptors/defaultItemRendererInterceptorService'));
    await rendererInterceptor.fatchItemRenderer({ tenant: 'tenant-a', authData: {}, options: {} }, data.pages);
    await rendererInterceptor.fatchItemRenderer({ tenant: 'tenant-a', authData: {}, options: {} }, data.components);
    const deliveryPath = path.join(root, 'modules/cms/src/service/delivery/defaultCmsDeliveryService');
    delete require.cache[require.resolve(deliveryPath)];
    const delivery = require(deliveryPath);
    deliverySearchOptions.length = 0;
    let response = await delivery.resolvePage({ tenant: 'tenant-a', authData: {}, options: {}, router: { publicAccess: true }, delivery: { site: 'site', path: '/home', locale: 'en', channel: 'web' } });
    assert(deliverySearchOptions.length > 0);
    deliverySearchOptions.forEach(options => assert.strictEqual(options.pageSize, 4,
        'CMS delivery reads must use the configured graph bound instead of the database default page size'));
    assert.strictEqual(response.result.contractVersion, 1);
    assert.strictEqual(response.result.page.renderer, 'page.home');
    assert.strictEqual(response.result.page.rendererContractVersion, 1);
    assert.deepStrictEqual(response.result.page.rendererChannels, ['web']);
    assert.strictEqual(response.result.page.rendererDeprecated, false);
    assert.deepStrictEqual(response.result.page.templateContract, {
        code: 'main',
        renderer: 'template.main',
        contractVersion: 0
    });
    assert.strictEqual(response.result.page.components[0].code, 'hero');
    assert.strictEqual(response.result.page.components[0].active, true);
    assert.strictEqual(response.result.page.components[0].renderer, 'component.hero');
    assert.strictEqual(response.result.page.components[0].rendererContractVersion, 2);
    assert.deepStrictEqual(response.result.page.components[0].rendererChannels, ['web', 'mobile-webview']);
    assert.strictEqual(response.result.page.components[0].rendererDeprecated, true);
    assert.strictEqual(response.result.page.components[0].rendererReplacement, 'component.hero-v2');
    assert.strictEqual(response.result.page.components[0].media[0].mediaSetCode, 'heroBackgroundSet');
    assert.strictEqual(response.result.page.components[0].media[0].role, 'background');
    assert.strictEqual(response.result.page.components[0].media[0].storageKey, undefined);
    assert.strictEqual(response.result.page.internalNote, undefined);
    assert.strictEqual(response.result.page.components[0].secret, undefined);
    await assert.rejects(delivery.resolvePage({ tenant: 'tenant-a', authData: {}, options: {}, router: { publicAccess: true },
        delivery: { site: 'site', path: '/account', locale: 'en', channel: 'web', accessMode: 'CUSTOMER' } }),
    error => error.code === 'ERR_CMS_00087');
    let customerResponse = await delivery.resolvePage({ tenant: 'tenant-a',
        authData: { tokenType: 'storefront_context' }, options: {}, router: { publicAccess: true },
        delivery: { site: 'site', path: '/account', locale: 'en', channel: 'web', accessMode: 'CUSTOMER' } });
    assert.strictEqual(customerResponse.result.page.code, 'account');
    assert.strictEqual(customerResponse.result.page.components[0].code, 'accountPanel');
    assert.strictEqual(customerResponse.result.page.components[0].renderer, 'component.account-panel');
    assert.strictEqual(customerResponse.result.page.components[0].accessMode, undefined);
    data.components[0].accessMode = 'AUTHENTICATED';
    await assert.rejects(delivery.resolvePage({ tenant: 'tenant-a', authData: {}, options: {}, router: { publicAccess: true },
        delivery: { site: 'site', path: '/home', locale: 'en', channel: 'web' } }),
    error => error.code === 'ERR_CMS_00086');
    data.components[0].accessMode = 'PUBLIC';
    data.routes[0].deliveryState = 'DRAFT';
    await assert.rejects(delivery.resolvePage({ tenant: 'tenant-a', router: { publicAccess: true }, delivery: { site: 'site', path: '/home', locale: 'en', channel: 'web' } }), error => error.code === 'ERR_CMS_00087');
    data.routes[0].deliveryState = 'ONLINE';
    await assert.rejects(delivery.resolvePage({ tenant: 'tenant-a', delivery: { site: 'site', path: 'https://host' } }), error => error.code === 'ERR_CMS_00085');
    await assert.rejects(delivery.resolvePage({ tenant: 'tenant-a', delivery: { site: 'site', path: '/missing', locale: 'en', channel: 'web' } }), error => error.code === 'ERR_CMS_00087');

    const overridden = Object.assign({}, delivery, {
        normalizeContext: request => ({ site: request.delivery.site, path: '/home', locale: 'en', channel: 'web' })
    });
    let customized = await overridden.resolvePage({ tenant: 'tenant-a', router: { publicAccess: true }, delivery: { site: 'site', path: '/customer-alias' } });
    assert.strictEqual(customized.result.path, '/home', 'later service override must customize effective resolution behavior');

    let invalidationRequests = [];
    global.SERVICE.DefaultCacheService = {
        invalidateResource: request => { invalidationRequests.push(request); return Promise.resolve(true); }
    };
    const invalidation = require(path.join(root, 'modules/cms/src/service/delivery/defaultCmsDeliveryCacheInvalidationService'));
    await invalidation.invalidate({ tenant: 'tenant-a', authData: { tenant: 'tenant-a' } });
    assert.deepStrictEqual(invalidationRequests.map(item => item.resourceName),
        ['resolvePublicPage', 'resolveAuthenticatedPage']);
    invalidationRequests.forEach(item => {
        assert.strictEqual(item.tenant, 'tenant-a');
        assert.strictEqual(item.cacheType, 'router');
    });
    console.log('CMS content delivery contract validated');
})().catch(error => {
    console.error(error);
    process.exitCode = 1;
});
