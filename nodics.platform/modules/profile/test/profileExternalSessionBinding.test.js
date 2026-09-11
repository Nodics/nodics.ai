/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module profile/test/profileExternalSessionBinding @description Verifies trusted external binding issuance and preservation/revalidation during normal Profile refresh rotation. @owner profile @layer test */
const {test, beforeEach} = require('node:test');
const assert = require('node:assert/strict');
const security = require('../../../../nodics.foundation/modules/nAuth/src/service/security/defaultAuthSecurityService');
let provider, cache, person, enterprise, revoked, checks;
const code = 'EID_'+'a'.repeat(64);
beforeEach(() => {
  cache = new Map(); revoked = false; checks = 0;
  person = {loginId:'customer-a', active:true, principalType:'customer', password:{active:true}, authVersion:1, userGroupCodes:['customer'], userGroupPermissions:[]};
  enterprise = {code:'enterprise-a', active:true, tenant:{code:'tenant-a', active:true}};
  global.CONFIG = {get:key => key==='authSecurity' ? {refreshToken:{expiresInSeconds:600}} : undefined};
  global.CLASSES = {NodicsError:class extends Error {constructor(code){super(code);this.code=code;}}};
  global.SERVICE = {
    DefaultEnterpriseService:{retrieveEnterprise:async()=>enterprise},
    DefaultCustomerService:{findByLoginId:async()=>person},
    DefaultUserStateService:{findUserState:async()=>({locked:false})},
    DefaultPrincipalSecurityStampService:{register:async()=>{}},
    DefaultExternalIdentityService:{validateSessionBinding:async session=>{
      checks++; assert.equal(session.externalIdentityLinkCode, code);
      if(revoked) throw new CLASSES.NodicsError('ERR_PROFILE_EXTERNAL_ASSERTION');
    }},
  };
  provider = Object.assign({}, require('../src/service/authentication/defaultAuthenticationProviderService'), {
    updateAuthData:async()=>{}, recordAuthEvent:async()=>{},
    addToken:async(module,expires,key,value)=>cache.set(key,structuredClone(value)),
    removeToken:async(module,key)=>cache.delete(key),
    consumeToken:async(module,key)=>{const item=cache.get(key);cache.delete(key);return item;},
    generateAuthToken:options=>security.buildPayload(options),
  });
});
const options=()=>({person,enterprise,type:'Customer'});
test('external issuance and repeated refresh keep the same validated opaque binding',async()=>{
  let result=await provider.issueSession({...options(),externalIdentityLinkCode:code},{locked:false},'external_identity.authentication');
  assert.equal(result.authToken.externalIdentityLinkCode,code);
  for(let n=0;n<2;n++){
    const previous=result.refreshToken;
    result=await provider.rotateRefreshToken({refreshToken:previous,type:'Customer',entCode:enterprise.code});
    assert.equal(result.authToken.externalIdentityLinkCode,code);
    assert.equal(cache.get(result.refreshToken).externalIdentityLinkCode,code);
    assert.equal(cache.has(previous),false);
  }
  assert.equal(checks,2);
});
test('ordinary password sessions and caller refresh fields cannot manufacture a channel binding',async()=>{
  await assert.rejects(provider.issueSession({...options(),externalIdentityLinkCode:code},{locked:false},'password.authentication'),{code:'ERR_AUTH_00001'});
  assert.equal(cache.size,0);
  const result=await provider.issueSession(options(),{locked:false},'password.authentication');
  assert.equal(result.authToken.externalIdentityLinkCode,undefined);
  const rotated=await provider.rotateRefreshToken({refreshToken:result.refreshToken,type:'Customer',externalIdentityLinkCode:code});
  assert.equal(rotated.authToken.externalIdentityLinkCode,undefined);
  assert.equal(checks,0);
});
test('a revoked channel binding blocks refresh before issuing replacement credentials',async()=>{
  const result=await provider.issueSession({...options(),externalIdentityLinkCode:code},{locked:false},'external_identity.authentication');
  revoked=true;
  await assert.rejects(provider.rotateRefreshToken({refreshToken:result.refreshToken,type:'Customer'}),{code:'ERR_PROFILE_EXTERNAL_ASSERTION'});
  assert.equal(cache.size,0);
});
