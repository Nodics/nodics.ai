/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module eWaste/test/eWasteBiddingBoundaryContract @description Exercises complete private auction history and retirement of Circa negotiation adapters. @layer test @owner eWaste */
const test = require('node:test'), assert = require('node:assert/strict');
const base = require('../src/service/defaultEWasteMarketplaceService');
const controller = require('../src/controller/defaultEWasteExperienceController');
const experience = require('../src/service/defaultEWasteExperienceService');
const defaults = require('../config/properties').eWaste;
const routes = require('../src/router/routers').eWaste;
const code = digit => 'AUCTION_' + digit.repeat(64);
const round = { code: code('2'), storeCode: 'store', participantRole: 'BUYER', bids: [{ code: 'private', amount: '2' }] };
function fixture(t, pages, kind = 'customer', overrides = {}) {
  const previous = global.SERVICE, calls = [], headers = [];
  const settings = structuredClone(defaults);
  settings.marketplace.storeCode = 'store';
  Object.assign(settings.marketplace.auctionHistory, overrides);
  const req = { tenant: 'tenant', authData: { tokenType: 'access', principalType: kind, loginId: 'actor', tenant: 'tenant', enterpriseCode: 'owner' },
    httpRequest: { headers: { authorization: 'Bearer original', 'x-enterprise-code': 'owner' }, body: {}, query: {} },
    httpResponse: { setHeader: (...args) => headers.push(args) } };
  const adapter = { ...base, settings: () => settings.marketplace, experience: () => ({ settings: () => settings, unwrap: value => value }) };
  global.SERVICE = { DefaultEWasteExperienceService: { ...experience, bids: request => adapter.bids(request) },
    DefaultModuleService: { invokeModule: async command => { calls.push(command); return typeof pages === 'function' ? pages(command) : pages.shift(); } } };
  t.after(() => { global.SERVICE = previous; });
  return { req, calls, headers, settings, adapter, read: () => controller.bids(req) };
}
for (const kind of ['customer', 'human']) test(kind + ' history preserves original identity and continues empty visible pages', async t => {
  const f = fixture(t, [{ rounds: [], afterCode: code('1') }, { rounds: [round], afterCode: null }], kind);
  assert.deepEqual(await f.read(), { data: { auctions: [round] } });
  assert.deepEqual(f.headers, [['Cache-Control', 'no-store']]);
  assert.equal(f.calls.length, 2);
  assert.equal(f.calls[1].apiName, '/auctions?storeCode=store&afterCode=' + code('1'));
  for (const command of f.calls) {
    assert.equal(command.moduleName, 'bidding'); assert.equal(command.methodName, 'GET');
    assert.deepEqual(command.targetAuthority, { runtimeRole: 'COMMERCE' });
    assert.deepEqual(command.header, { Authorization: 'Bearer original', 'X-Enterprise-Code': 'owner' });
    assert.equal(command.tenant, 'tenant');
  }
});
test('history rejects malformed, foreign and unbounded pages without partial results', async t => {
  for (const pages of [
    [{ rounds: [], afterCode: undefined }],
    [{ rounds: [round], afterCode: code('1') }, { rounds: [round], afterCode: null }],
    [{ rounds: [{ ...round, storeCode: 'foreign' }], afterCode: null }],
    [{ rounds: [{ ...round, participantRole: 'VIEWER' }], afterCode: null }],
    [{ rounds: [], afterCode: code('1') }, { rounds: [], afterCode: code('1') }],
  ]) { const f = fixture(t, pages); await assert.rejects(f.read(), /incomplete/); }
  const bounded = fixture(t, [{ rounds: [], afterCode: code('1') }], 'human', { maximumPages: 1 });
  await assert.rejects(bounded.read(), /bound/);
  const records = fixture(t, [{ rounds: [round, { ...round, code: code('3') }], afterCode: null }], 'human', { maximumRounds: 1 });
  await assert.rejects(records.read(), /incomplete/);
});
test('history rejects services, caller selectors, partition mismatch and mid-read authority drift', async t => {
  const service = fixture(t, [], 'service'); await assert.rejects(service.read()); assert.equal(service.calls.length, 0);
  const selector = fixture(t, []); selector.req.httpRequest.query.storeCode = 'other';
  await assert.rejects(selector.read()); assert.equal(selector.calls.length, 0);
  const partition = fixture(t, []); partition.req.tenant = 'other';
  await assert.rejects(partition.read()); assert.equal(partition.calls.length, 0);
  const disabledTarget = fixture(t, []); delete disabledTarget.settings.targetAuthorities.commerce;
  await assert.rejects(disabledTarget.read()); assert.equal(disabledTarget.calls.length, 0);
  const spoofed = fixture(t, []); spoofed.req.httpRequest.headers['x-enterprise-code'] = 'other';
  await assert.rejects(spoofed.read()); assert.equal(spoofed.calls.length, 0);
  const drift = fixture(t, () => { drift.req.authData.loginId = 'changed'; return { rounds: [round], afterCode: null }; });
  await assert.rejects(drift.read(), /incomplete/);
});
test('Circa closes legacy negotiation mutation routes and uses private original-participant history', () => {
  assert.equal(base.placeBid, undefined); assert.equal(base.decideBid, undefined);
  assert.equal(controller.placeBid, undefined); assert.equal(experience.decideBid, undefined);
  assert.deepEqual(routes.bids.bids.authTokenTypes, ['access']);
  assert.equal(routes.bids.bids.permission, 'commerce.bid.participate');
  assert.equal(routes.bids.bids.cache.enabled, false);
  assert.equal(routes.bids.bids.requestPrivacy.sensitive, true);
  const all = Object.values(routes).flatMap(group => Object.values(group));
  assert.equal(all.some(route => ['placeBid', 'decideBid'].includes(route.operation)), false);
});
test('legacy accepted bids have no eWaste fixed purchase adapter', () => {
  assert.equal(base.purchase, undefined);
  assert.equal(controller.purchase, undefined);
  assert.equal(experience.purchase, undefined);
});
