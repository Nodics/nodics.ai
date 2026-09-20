/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module profile/test/profileInitializationIdentitySelection @description Guards initializer identity checks independently of runtime authentication proof. @layer test @owner profile */
const test = require('node:test');
const assert = require('node:assert/strict');
const service = require('../src/service/profile/defaultProfileService');

test('Profile checks both selected initializer identities and preserves custom identity selection', async t => {
  const previous = {CONFIG:global.CONFIG,NODICS:global.NODICS,UTILS:global.UTILS};
  t.after(() => Object.assign(global, previous));
  let logins = ['admin','apiAdmin'], rows = [{loginId:'apiAdmin'}], lastRequest;
  global.CONFIG = {get:key => key === 'profileInitialization' ? {requiredEmployeeLogins:logins} : {loginId:'unrelated-runtime-login'}};
  global.UTILS = {isArray:Array.isArray};
  global.NODICS = {getModels:(module,tenant) => {
    assert.equal(module,'profile'); assert.equal(tenant,'tenant-b');
    return {EmployeeModel:{getItems:async request => {lastRequest=request;return {result:rows};}}};
  }};
  assert.equal(await service.hasBootstrapEmployee('profile','tenant-b'), false);
  rows.push({loginId:'admin'});
  assert.equal(await service.hasBootstrapEmployee('profile','tenant-b'), true);
  assert.deepEqual(lastRequest.query,{loginId:{$in:['admin','apiAdmin']}});
  logins = ['customOperator']; rows = [{loginId:'customOperator'}];
  assert.equal(await service.hasBootstrapEmployee('profile','tenant-b'), true);
  logins=[];
  assert.equal(await service.hasBootstrapEmployee('profile','tenant-b'), false);
});
