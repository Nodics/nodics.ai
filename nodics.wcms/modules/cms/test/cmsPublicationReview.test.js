/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** Tests the exact CMS approval identity and owner-only projection boundary. */
const assert = require('node:assert/strict');
const test = require('node:test');
const review = require('../src/service/publication/defaultCmsPublicationReviewService');
const workflow = require('../src/service/publication/defaultCmsPublicationWorkflowService');

class NodicsError extends Error {
    constructor(code) { super(code); this.code = code; }
}
global.CLASSES = { NodicsError };

const context = { tenantCode: 'tenant', enterpriseCode: 'enterprise', publicationCode: 'release',
    publicationRevision: 3, sourceVersion: '0', siteCode: 'site', catalogCode: 'catalog' };
const instanceCode = workflow.reference({ code: 'release', revision: 3 });
const taskCode = instanceCode + '--review';
const caller = { authData: { loginId: 'reviewer@example.test' } };
const scope = { tenant: 'tenant', enterpriseCode: 'enterprise' };
const detail = {
    instance: { code: instanceCode, definitionCode: 'cmsPublicationApproval', status: 'WAITING', context },
    tasks: [{ code: taskCode, instanceCode, nodeCode: 'publicationReview', status: 'OPEN',
        reviewContext: { contractVersion: 1, owner: 'cms', publicationCode: 'release', sourceVersion: '0', rootCode: 'site' } }]
};

test('accepts only the native current task, assignment, enterprise and revision', async () => {
    let response = structuredClone(detail);
    global.SERVICE = { DefaultCmsPublicationWorkflowService: {
        reference: workflow.reference, readReviewInstance: async () => response
    } };
    assert.deepEqual(await review.binding(caller, scope, instanceCode, taskCode), context);
    for (const invalidate of [
        data => { data.instance.context.enterpriseCode = 'foreign'; },
        data => { data.instance.context.publicationRevision += 1; },
        data => { data.instance.status = 'COMPLETED'; },
        data => { data.tasks[0].status = 'COMPLETED'; },
        data => { data.tasks[0].status = 'CLAIMED'; data.tasks[0].assignee = 'someone-else'; },
        data => { data.tasks[0].nodeCode = 'another-task'; },
        data => { data.tasks[0].reviewContext.sourceVersion = '1'; },
        data => { data.tasks[0].reviewerEligibility = { eligible: false }; },
        data => { data.tasks.push(data.tasks[0]); }
    ]) {
        response = structuredClone(detail);
        invalidate(response);
        await assert.rejects(review.binding(caller, scope, instanceCode, taskCode), { code: 'ERR_AUTH_00003' });
    }
});

test('projects exact changes as plain allowlisted text and treats absent proof as unknown', () => {
    const target = { site: 'site', path: '/path', locale: 'en', channel: 'web', accessMode: 'PUBLIC' };
    const route = title => ({ ...target, page: { code: 'page', name: title, components: [
        { code: 'hero', renderer: 'hero', slot: 'main', properties: { title, privateValue: 'excluded' } }
    ] } });
    const budget = () => ({ remaining: 100, components: 10, truncated: false });
    const comparison = review.project(route('Pinned title'), route('Online title'), 'UNAVAILABLE', budget());
    assert.deepEqual(comparison.target, target);
    assert.equal(comparison.changes.status, 'CHANGED');
    assert.deepEqual(comparison.changes.components[0].before.fields, { title: 'Online title' });
    assert.deepEqual(comparison.changes.components[0].component.fields, { title: 'Pinned title' });
    assert(!JSON.stringify(comparison).includes('privateValue'));
    assert.equal(review.project(route('Same'), route('Same'), 'UNAVAILABLE', budget()).changes.status, 'UNCHANGED');
    assert.equal(review.project(route('Unknown'), undefined, 'UNAVAILABLE', budget()).changes.status, 'UNAVAILABLE');
});


test('documentation review includes frozen body blocks and their changes without source metadata', () => {
    const item = body => ({code:'guide', renderer:'documentation.component.article', slot:'article', properties:{title:'Guide', source:{privateCredential:'never'}, blocks:body}});
    const blocks=[{kind:'heading',text:'Review the current revision'},{kind:'paragraph',text:'Approved body '+ 'x'.repeat(5000)}, {kind:'table',headers:['Outcome'],rows:[['Current snapshot']]},{kind:'unordered-list',items:['One exact receipt']},{kind:'image',alt:'Workflow',mediaCode:'approved-diagram',url:'private-provider-url'},{kind:'code',text:'safe example'}, {kind:'paragraph',text:'The final changed section'}];
    const budget={remaining:40000,components:10,truncated:false};
    const projected=review.component(item(blocks),budget);
    assert(projected.fields.documentationBody.includes('The final changed section'));
    assert(projected.fields.documentationBody.includes('Current snapshot'));
    assert(projected.fields.documentationBody.includes('Media: approved-diagram'));
    assert(!JSON.stringify(projected).includes('never'));
    assert(!JSON.stringify(projected).includes('private-provider-url'));
    assert.equal(budget.truncated,false);
    const route=body=>({site:'site',path:'/guide',locale:'en',channel:'web',accessMode:'PUBLIC',page:{code:'page',components:[item(body)]}});
    const compared=review.project(route(blocks),route([{kind:'paragraph',text:'Previous immutable body'}]),'AVAILABLE',{remaining:160000,components:10,truncated:false});
    assert.equal(compared.changes.status,'CHANGED');
    assert.equal(compared.changes.components[0].before.fields.documentationBody,'Previous immutable body');
    assert(compared.changes.components[0].component.fields.documentationBody.endsWith('The final changed section'));
    const limited={remaining:20,components:10,truncated:false};
    const bounded=review.component(item(blocks),limited);
    assert.equal(limited.remaining,0);assert.equal(limited.truncated,true);
    assert(Object.values(bounded.fields).join('').length<=20);
    assert.equal(review.documentationBody([{kind:'unknown',secret:'never'}],100).truncated,true);
});

test('legacy comparison requires the exact frozen Site catalog and preserves current scope denial', async () => {
    const publication={siteCode:'site',catalogCode:'catalog'}, predecessor={rootType:'site',rootCode:'site'};
    const manifest={dependencies:[{schema:'cmsSite',code:'site',version:'4'}]};
    let loads=0;const manifests={load:async identity=>{loads++;assert.deepEqual(identity,manifest.dependencies[0]);return {code:'site',catalog:{code:'catalog'}};}};
    assert.equal(await review.baselineCatalogMatches(publication,predecessor,manifest,manifests,{}),true);
    assert.equal(loads,1);
    assert.equal(await review.baselineCatalogMatches(publication,{...predecessor,catalogCode:'foreign'},manifest,manifests,{}),false);
    assert.equal(await review.baselineCatalogMatches(publication,{...predecessor,rootCode:'foreign'},manifest,manifests,{}),false);
    assert.equal(await review.baselineCatalogMatches(publication,predecessor,{dependencies:[]},manifests,{}),false);
    assert.equal(await review.baselineCatalogMatches(publication,predecessor,{dependencies:[...manifest.dependencies,...manifest.dependencies]},manifests,{}),false);
    assert.equal(await review.baselineCatalogMatches(publication,predecessor,manifest,{load:async()=>({code:'site',catalog:'foreign'})},{}),false);
    await assert.rejects(review.baselineCatalogMatches(publication,predecessor,manifest,{load:async()=>{throw Error('exact version unavailable')}},{}),/exact version unavailable/);
});

test('site baseline review resolves only its frozen catalog and leaves the admitted context unchanged', async () => {
    const dependency = { schema: 'cmsSite', code: 'site', version: '4' };
    const publication = Object.freeze({ code: 'release', rootType: 'site', rootCode: 'site', siteCode: 'site',
        sourceVersion: '0', revision: 3, dependencies: [dependency], validation: { valid: true } });
    const admitted = Object.freeze({ ...context, catalogCode: undefined });
    const request = { ...caller, httpRequest: { params: { instanceCode, taskCode },
        headers: { authorization: 'Bearer original-reviewer' } } };
    const manifests = {
        load: async (identity, read) => {
            assert.deepEqual(identity, dependency);
            assert.equal(read.tenant, scope.tenant);
            return { code: 'site', versionId: 4, catalog: { code: 'catalog' } };
        },
        buildSnapshot: async row => {
            assert.equal(row, publication);
            return { site: 'site', path: '/', locale: 'en', channel: 'web', accessMode: 'PUBLIC',
                page: { code: 'home', name: 'Frozen home', components: [] } };
        },
        publicationExperiencePlacements: async () => [], publicationMediaCodes: () => []
    };
    global.SERVICE = {
        DefaultCmsDesignerAccessService: { authorize: (original, permission) => {
            assert.equal(original.authorization, 'Bearer original-reviewer');
            assert.equal(permission, 'cms.publication.approve'); return scope;
        } },
        DefaultIdentityGovernanceService: { getSystemAuthData: () => ({ privateRead: true }) },
        DefaultCmsPublicationVersionProviderService: { assertStagedRuntime() {}, manifests: () => manifests }
    };
    let bindings = 0, reads = 0;
    const service = { ...review,
        binding: async () => { bindings++; return admitted; },
        publication: async original => { assert.equal(original, admitted); reads++; return publication; },
        baseline: async projected => {
            assert.equal(projected.catalogCode, 'catalog');
            assert.equal(publication.catalogCode, undefined); return { status: 'NEW' };
        }
    };
    const result = await service.inspect(request);
    assert.equal(result.catalogCode, 'catalog');
    assert.equal(result.routes[0].page.name, 'Frozen home');
    assert.equal(result.revision, 3);
    assert.equal(bindings, 2); assert.equal(reads, 2);
    assert.equal(admitted.catalogCode, undefined);
    assert.equal(publication.catalogCode, undefined);
});

test('catalog resolution refuses absent, ambiguous, foreign and non-exact frozen evidence', async () => {
    const dependency = { schema: 'cmsSite', code: 'site', version: '4' };
    const publication = { rootType: 'site', rootCode: 'site', siteCode: 'site', dependencies: [dependency] };
    const site = { code: 'site', versionId: 4, catalog: 'catalog' };
    const manifests = { load: async () => site };
    assert.equal(await review.reviewCatalog(publication, manifests, {}), 'catalog');
    assert.equal(await review.reviewCatalog({ catalogCode: 'explicit' }, {
        load: async () => { throw Error('explicit catalog does not require another read'); }
    }, {}), 'explicit');
    for (const invalid of [
        { dependencies: [] }, { dependencies: [dependency, dependency] },
        { rootType: 'pageRoute' }, { rootCode: 'foreign' }, { catalogCode: null },
        { dependencies: [{ ...dependency, version: 'latest' }] }
    ]) await assert.rejects(review.reviewCatalog({ ...publication, ...invalid }, manifests, {}), { code: 'ERR_AUTH_00003' });
    for (const invalid of [{ code: 'foreign' }, { versionId: 5 }, { catalog: null }, { catalog: '../foreign' }])
        await assert.rejects(review.reviewCatalog(publication, { load: async () => ({ ...site, ...invalid }) }, {}),
            { code: 'ERR_AUTH_00003' });
    await assert.rejects(review.reviewCatalog(publication, { load: async () => {
        throw Error('exact version unavailable');
    } }, {}), /exact version unavailable/);
});


test('experience approvals present frozen target values and overrides without opaque JSON identity dumps', () => {
  const route = { site: 'site', path: '/page', locale: 'en', channel: 'web', accessMode: 'PUBLIC', page: { code: 'page', components: [{code:'hero',renderer:'hero',slot:'main',properties:{title:'Base'}}] } };
  const placement = { code:'placement',site:'site',component:'hero',slot:'hero',pageType:'HOME',targetType:'COLLECTION',targetCode:'summer',priority:30,revision:1,properties:{title:'Preferred collection'} };
  const result = review.project(route, undefined, 'NEW', { remaining: 10000, components: 10, truncated:false }, [placement]);
  const content = result.components.find(row => row.renderer === 'experience.targeting');
  assert.equal(content.fields.targetCode,'summer'); assert.equal(content.fields.priority,'30');
  assert.equal(content.fields['content.title'],'Preferred collection'); assert.equal(content.fields.description,undefined);
});
