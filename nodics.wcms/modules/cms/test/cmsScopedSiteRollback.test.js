/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.
 */


/** Verifies exact lineage and sibling preservation for route rollback from a site bundle. */
const test=require('node:test');const assert=require('node:assert/strict');
const target=require('../src/service/publication/defaultCmsPublicationTargetService');
const scope=path=>({site:'site',path,locale:'en',channel:'web',accessMode:'PUBLIC'});
const old={code:'old-site',rootType:'site',snapshot:{bundleType:'SITE',routes:[scope('/guide'),scope('/unrelated')]}};
const current={code:'new-guide',rootType:'pageRoute',snapshot:scope('/guide')};
class NodicsError extends Error{constructor(code){super(code);this.code=code;}};global.CLASSES={NodicsError};
test('one route restores its site-bundle predecessor without touching sibling pointers',async()=>{
 const pointers=new Map([['/guide',{manifestCode:current.code,previousManifestCode:old.code}],['/unrelated',{manifestCode:'another-approved-release'}]]);const writes=[];
 const manifests={getManifest:async code=>code===current.code?current:old,deliveryScopes:m=>m.snapshot.routes||[m.snapshot],getPointer:async s=>pointers.get(s.path),isSiteIndexManifest:()=>false,activateScope:async(m,s)=>{writes.push(s.path);pointers.set(s.path,{manifestCode:m.code});}};
 const svc={...target,manifests:()=>manifests,assertOnlineRuntime(){},transaction:async(req,fn)=>fn(req),recordReceipt:async()=>true,deactivateOutsideBundleScope:async()=>{throw Error('Must not rewrite siblings')}};
 global.SERVICE={DefaultCmsPublicationOutboxService:{enqueue:async()=>({code:'rollback-event'}),deliver:async()=>true}};
 const result=await svc.rollback({cmsPublicationTarget:{manifestCode:old.code,expectedCurrentManifestCode:current.code}});
 assert.equal(result.version,old.code);assert.deepEqual(writes,['/guide']);assert.equal(pointers.get('/unrelated').manifestCode,'another-approved-release');
 await assert.rejects(svc.assertRollbackScope(current.code,old,{}),{code:'ERR_CMS_00116'});
 pointers.set('/guide',{manifestCode:current.code,previousManifestCode:'unrelated-predecessor'});
 await assert.rejects(svc.assertRollbackScope(current.code,old,{}),{code:'ERR_CMS_00116'});
 const missing={...old,snapshot:{bundleType:'SITE',routes:[scope('/other')]}};
 await assert.rejects(svc.assertRollbackScope(current.code,missing,{}),{code:'ERR_CMS_00116'});
});
