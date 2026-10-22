/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module checkoutCore/test/checkoutAuctionRoutePermission @description Checks actual router ANY grants for auction evidence. @layer test @owner checkoutCore */
const test = require('node:test');
const assert = require('node:assert/strict');
const route = require('../src/router/routers').checkoutCore.auction.auctionFundsEvidence;
const router = require('../../../../../../nodics.foundation/modules/nRouter/src/service/request/defaultSecuredRequestPipelineService');
test('auction evidence admits manage-only schedulers and participate-only callers through actual router permissions', () => {
  const gate = { ...router, getRouteActionAuthorizationConfig: () => ({ enabled: true, strict: true }) };
  assert.deepEqual(route.authTokenTypes, ['access', 'service']);
  assert.equal(route.requestPrivacy.sensitive, true);
  assert.equal(route.cache.enabled, false);
  for (const permission of ['commerce.bid.manage', 'commerce.bid.participate'])
    assert.equal(gate.hasRoutePermission({ router: route, authData: { permissions: [permission] } }), true);
  for (const permissions of [[], ['commerce.checkout.place']])
    assert.equal(gate.hasRoutePermission({ router: route, authData: { permissions } }), false);
});
