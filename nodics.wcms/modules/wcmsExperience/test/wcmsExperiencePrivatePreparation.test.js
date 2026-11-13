/*
    Nodics - Enterprice Micro-Services Management Framework
    Copyright (c) 2026 Nodics All rights reserved.
    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.
 */
/** @module wcmsExperience/test/privatePreparation @description Exercises private preparation with the actual guarded Discovery generation protocol. @layer test @owner wcmsExperience */
const assert = require('node:assert/strict');
const { test } = require('node:test');
const definition = require('../src/service/defaultWcmsExperiencePreviewPreparationService');
const generation = require('../../../../nodics.discovery/modules/discoveryPublication/src/service/defaultDiscoveryGenerationPublicationService');
const runtime = require('../../../../nodics.discovery/modules/discoveryRuntime/src/service/defaultDiscoveryRuntimeService');
const resolver = require('../src/service/defaultWcmsExperienceResolverService');
const defaults = require('../config/properties');

/** Inert persistence/transport ports with revision CAS; generation orchestration remains the real owner implementation. */
function fixture() {
    const state = { manifest: null, documents: [], targets: [], failWrite: false, drift: false, reads: 0 };
    global.CONFIG = { get: key => key === 'runtimeRole' ? { publication: 'STAGED' } : defaults[key] };
    global.CLASSES = { NodicsError: class extends Error { constructor(code, message) { super(message); this.code = code; } } };
    global.SERVICE = {
        DefaultWcmsExperienceResolverService: resolver,
        DefaultDiscoveryGenerationPublicationService: generation,
        DefaultDiscoveryRuntimeService: runtime,
        DefaultDiscoveryGenerationTransportService: {
            get: async () => ({ code: 'SUC_FIND_00000', result: state.manifest ? [structuredClone(state.manifest)] : [] }),
            save: async input => { if (state.manifest) throw Error('DUPLICATE'); state.manifest = structuredClone(input.model); return { code: 'SUC_SAVE_00000' }; },
            update: async input => {
                if (state.manifest.revision !== input.query.revision) return { code: 'SUC_UPDATE_00000', result: { matchedCount: 0 } };
                Object.assign(state.manifest, structuredClone(input.model));
                return { code: 'SUC_UPDATE_00000', result: { matchedCount: 1 } };
            },
        },
        DefaultDiscoveryDocumentProjectionService: {
            doSave: async input => {
                state.targets.push(input.targetAuthority);
                if (state.failWrite) return { code: 'ERR_SOURCE_00001' };
                state.documents.push(structuredClone(input.model)); return { code: 'SUC_SAVE_00000' };
            },
            doRefresh: async input => { state.targets.push(input.targetAuthority); return { code: 'SUC_SEARCH_00000', result: { _shards: { failed: 0, successful: 1 } } }; },
            doSearch: async input => {
                const terms = Object.assign({}, ...input.query.bool.filter.map(item => item.term));
                const rows = state.documents.filter(row => row.payload.publicationGeneration === terms['payload.publicationGeneration.keyword']);
                return { code: 'SUC_SEARCH_00000', result: { body: { timed_out: false, _shards: { failed: 0, successful: 1 },
                    hits: { total: { value: rows.length, relation: 'eq' }, hits: rows.map(row => ({ _source: row })) } } } };
            },
        },
    };
    const service = { ...definition };
    service.admit = async () => ({ scope: { enterpriseCode: 'business-a', siteCode: 'site-a', catalogCode: 'catalog-a' } });
    service.source = async () => {
        state.reads++;
        return { scope: (await service.admit()).scope, digest: state.drift && state.reads > 1 ? 'b'.repeat(64) : 'a'.repeat(64),
            source: [{ payload: { code: 'hero', site: 'site-a', pageType: 'PRODUCT_LISTING', publicationStatus: 'STAGED',
                deliveryStatus: 'ACTIVE', rendererKey: 'hero', contractVersion: 1, properties: { title: 'Private draft' } } }] };
    };
    const request = { tenant: 'tenant-a', authData: { principalType: 'human' }, body: { site: 'site-a',
        pageType: 'PRODUCT_LISTING', targetType: 'DEFAULT', targetCode: '*', locale: 'en', channel: 'web', device: 'desktop' } };
    return { state, service, request };
}

test('complete private generations use Staged only and unchanged preparation reuses exact physical evidence', async () => {
    const x = fixture(), first = await x.service.prepare(x.request);
    assert.equal(first.state, 'READY'); assert.equal(first.onlineChanged, false);
    assert.equal(x.state.manifest.currentGeneration.writer.state, 'SEALED');
    assert.ok(x.state.targets.every(target => target.publication === 'STAGED'));
    const before = x.state.documents.length, again = await x.service.prepare(x.request);
    assert.equal(again.unchanged, true); assert.equal(x.state.documents.length, before);
    const rows = await x.service.readPrepared(x.request, x.service.context(x.request));
    assert.equal(rows[0].properties.title, 'Private draft');
});

test('source drift leaves the incomplete generation hidden until exact inspected retirement', async () => {
    const x = fixture(); x.state.drift = true;
    await assert.rejects(x.service.prepare(x.request), { code: 'ERR_WCMS_EXPERIENCE_PREPARATION_UNCONFIRMED' });
    const inspected = await x.service.inspect(x.request);
    assert.equal(inspected.state, 'INSPECTION_REQUIRED'); assert.equal(x.state.manifest.currentGeneration, null);
    await assert.rejects(x.service.readPrepared(x.request, x.service.context(x.request)));
    await assert.rejects(x.service.prepare(x.request), /INSPECTION_REQUIRED/);
    await assert.rejects(x.service.abandon({ ...x.request, body: { ...x.request.body,
        revision: inspected.revision - 1, pendingGeneration: inspected.pendingGeneration } }));
    const retired = await x.service.abandon({ ...x.request, body: { ...x.request.body,
        revision: inspected.revision, pendingGeneration: inspected.pendingGeneration } });
    assert.equal(retired.state, 'NOT_PREPARED'); assert.equal(retired.onlineChanged, false);
});

test('a failed write never publishes a pointer or becomes an empty successful preview', async () => {
    const x = fixture(); x.state.failWrite = true;
    await assert.rejects(x.service.prepare(x.request));
    assert.equal(x.state.manifest.currentGeneration, null);
    assert.equal(x.state.manifest.pendingGeneration.writer.state, 'WRITING');
    assert.equal((await x.service.inspect(x.request)).state, 'INSPECTION_REQUIRED');
    await assert.rejects(x.service.readPrepared(x.request, x.service.context(x.request)));
});

test('browser inputs cannot supply identity, projections, clocks or execution targets; non-Staged admission fails first', async () => {
    const x = fixture();
    for (const key of ['tenant', 'authData', 'projections', 'now', 'targetAuthority']) {
        assert.throws(() => definition.context({ ...x.request, body: { ...x.request.body, [key]: 'forged' } }));
    }
    global.CONFIG = { get: key => key === 'runtimeRole' ? { publication: 'ONLINE' } : defaults[key] };
    await assert.rejects(definition.admit(x.request, definition.context(x.request)));
    assert.equal(x.state.manifest, null); assert.equal(x.state.documents.length, 0);
});


test('the actual BackOffice contract admits the owner navigation and private preparation action', () => {
    const contract = require('../../../../nodics.platform/modules/backoffice/src/service/contract/defaultBackofficeContractService');
    const capability = require('../src/service/defaultWcmsExperienceBackofficeCapabilityService');
    const navigation = capability.navigation({});
    assert.equal(contract.validateNavigation(navigation), true);
    const actions = navigation.find(item => item.id === 'wcms-experience-preview').lifecycleActions;
    assert.equal(contract.validateNavigationLifecycleActions(actions), true);
    assert.equal(actions[0].permission, 'WCMS_EXPERIENCE_PREVIEW');
    assert.equal(contract.validateNavigationLifecycleActions([{ ...actions[0], requiredPermissions: ['WCMS_EXPERIENCE_PREVIEW'] }]), false);
});


test('HTTP preparation and preview preserve only the original transport authorization for CMS admission', async () => {
    const controller = require('../src/controller/defaultWcmsExperienceAuthoringController');
    const observed = [];
    global.FACADE = { DefaultWcmsExperienceDeliveryFacade: { inspectPreparation: async request => { observed.push(request.authorization); return {}; }, resolve: async request => { observed.push(request.authorization); return {}; } } };
    for (const operation of ['inspectPreparation', 'preview']) {
        await controller[operation]({ authorization: 'forged', httpRequest: { headers: { authorization: 'Bearer original-test-employee' }, body: { authorization: 'Bearer forged-body' } } });
    }
    assert.deepEqual(observed, ['Bearer original-test-employee', 'Bearer original-test-employee']);
});


test('uncertain preparation dependencies become stable inspection-required guidance while owner authorization stays denied', async () => {
    fixture();
    const controller = require('../src/controller/defaultWcmsExperienceAuthoringController');
    global.SERVICE.DefaultWcmsExperiencePreviewPreparationService = definition;
    global.FACADE = { DefaultWcmsExperienceDeliveryFacade: { preparePreview: async () => { throw Error('private provider material'); } } };
    await assert.rejects(controller.preparePreview({}), error => error.code === 'ERR_WCMS_EXPERIENCE_PREPARATION_UNCONFIRMED' && !error.message.includes('private provider material'));
    const denial = new CLASSES.NodicsError('ERR_AUTH_00003', 'Access denied');
    global.FACADE.DefaultWcmsExperienceDeliveryFacade.preparePreview = async () => { throw denial; };
    await assert.rejects(controller.preparePreview({}), error => error === denial);
});


test('nested preview pins every scoped current component, includes child content, and rejects cycles', async () => {
    fixture(); const seen = [], scope = {enterpriseCode:'business-a',siteCode:'site-a',catalogCode:'catalog-a'};
    const components = {root:{code:'root',active:true,versionId:1,renderer:'hero',properties:{title:'root'}}, child:{code:'child',active:true,versionId:2,renderer:'text',properties:{body:'nested'}}};
    const relations = {root:[{code:'nested',source:'root',target:'child',slot:'body',index:0,active:true}],child:[]};
    SERVICE.DefaultCmsDesignerAccessService={assertIdentity:async (owner,request,code,actual,required)=>{assert.equal(owner,'DefaultCmsComponentService');assert.equal(actual,scope);assert.equal(required,true);seen.push(code);return [components[code]];}};
    SERVICE.DefaultCmsDesignerReadService={currentHeads:async (owner,request,query,actual)=>{assert.equal(actual,scope);return owner==='DefaultCmsComponentDetailService'?relations[query.source]:[];}};
    SERVICE.DefaultCmsDeliveryService={projectComponent:c=>({...c,components:[]}),projectComponentMedia:r=>r};
    const result=await definition.componentSnapshot({},scope,'root','en');
    assert.equal(result.components[0].slot,'body');assert.equal(result.components[0].properties.body,'nested');assert.deepEqual(seen,['root','child']);
    relations.child=[{code:'cycle',source:'child',target:'root',slot:'body',index:0,active:true}];
    await assert.rejects(definition.componentSnapshot({},scope,'root','en'),{code:'ERR_WCMS_EXPERIENCE_PREPARATION_UNCONFIRMED'});
});
