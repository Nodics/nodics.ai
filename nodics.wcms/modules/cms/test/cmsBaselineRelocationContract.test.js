'use strict';
/** @module cms/test/cmsBaselineRelocationContract @description Offline proof that physical host relocation does not rewrite governed release metadata. @owner cms @layer test */
const {test} = require('node:test');
const assert = require('node:assert/strict');
const baseline = require('../src/service/publication/defaultCmsPublicationBaselineService');

test('renamed and combined STAGED hosts retain exact baseline destination/version/lifecycle metadata', async t => {
    const saved = {CONFIG:global.CONFIG,SERVICE:global.SERVICE,CLASSES:global.CLASSES};
    t.after(() => {for (const [key,value] of Object.entries(saved)) global[key]=value;});
    global.CLASSES = {NodicsError:class extends Error {constructor(code,message){super(message);this.code=code;}}};
    const descriptor = {releaseCode:'axis:axisBaseline',releaseVersion:'1',rootType:'site',rootCode:'axis',sourceVersion:'0'};
    let release = {releaseCode:descriptor.releaseCode,version:'1',destinationRole:'WCMS_STAGED',lifecycle:'PUBLISHABLE',initialPublicationPolicy:'ADMIN_INITIATED'};
    let manifest = {...release,sites:['axis']};
    const settings = {runtimeRole:'STAGED',baselines:{axis:descriptor,pack:{contentPackCode:'pack',releaseVersion:'1',sourceVersion:'0'}}};
    let runtime;
    global.CONFIG = {get:key => key === 'cms' ? {publication:settings} : key === 'runtimeRole' ? runtime : undefined};
    global.SERVICE = {
        DefaultDataReleaseService:{getCatalogue:async()=>({data:[release]})},
        DefaultContentPackService:{resolvePackContext:()=>({}),inspectRelease:()=>({available:true,version:'1',manifest}),
            getStatus:async()=>({state:'CURRENT'})}
    };
    for (const code of ['RENAMED_AUTHOR','COMBINED_BUSINESS_HOST']) {
        runtime={code,publication:'STAGED'};
        baseline.assertStaged();
        assert.equal((await baseline.release(descriptor,{})).destinationRole,'WCMS_STAGED');
        const pack=baseline.descriptor('pack');
        assert.equal(pack.rootCode,'axis');
        assert.equal((await baseline.release(pack,{})).status,'CURRENT');
    }
    for (const patch of [{destinationRole:'RENAMED_AUTHOR'},{version:'2'},{lifecycle:'REFERENCE'}, {initialPublicationPolicy:'AUTOMATIC'}]) {
        const savedRelease=release;release={...release,...patch};
        await assert.rejects(baseline.release(descriptor,{}), {code:'CMS_BASELINE_RELEASE_INVALID'});
        release=savedRelease;
    }
    for (const patch of [{destinationRole:'RENAMED_AUTHOR'},{lifecycle:'REFERENCE'}, {initialPublicationPolicy:'AUTOMATIC'}, {sites:['axis','other']}]) {
        const savedManifest=manifest;manifest={...manifest,...patch};
        assert.throws(()=>baseline.descriptor('pack'),{code:'CMS_BASELINE_RELEASE_INVALID'});
        manifest=savedManifest;
    }
    settings.runtimeRole='ONLINE';
    assert.throws(()=>baseline.assertStaged(),{code:'CMS_BASELINE_SOURCE_ROLE_INVALID'});
});
