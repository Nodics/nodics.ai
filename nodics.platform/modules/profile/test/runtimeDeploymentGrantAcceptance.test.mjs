/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { runRuntimeDeploymentGrantAcceptance as run } from '../src/service/acceptance/defaultRuntimeDeploymentGrantAcceptanceService.mjs';

function fixture(change = {}) {
  const account = {code:'apiAdmin', loginId:'apiAdmin', active:true, principalType:'service',
    apiKeyStatus:'active', apiKeyScopes:['auth.internal.token.read'], ...change};
  return {environment:{NODICS_AUTH_TOKEN:'fixture-token',NODICS_ACCEPTANCE_ORIGIN:'https://partner.invalid'},
    configuration:{environment:'partnerLocal',projectCode:'partner',topology:{groups:{backends:[{role:'PLATFORM',server:'platform',host:'localhost',port:1234}]}}},
    projections:[{server:'platform',properties:{runtimeIdentity:{instanceCode:'platform-1'}}}],
    fetch: async (url, request) => {
      assert.equal(new URL(url).pathname,'/nodics/profile/v0/employee/code/apiAdmin');
      assert.equal(request.headers.Authorization,'Bearer fixture-token');
      return Response.json({result:[account]});
    }};
}
test('read-only inspection reports account and topology evidence', async () => {
  assert.deepEqual(await run(fixture()), [{server:'platform',instanceCode:'platform-1',state:'ACCOUNT_AND_SOURCE_OBSERVED'}]);
  for (const change of [{active:false},{principalType:'human'},{apiKeyStatus:'revoked'},{apiKeyScopes:[]}])
    await assert.rejects(run(fixture(change)), /unavailable or disabled/);
});
