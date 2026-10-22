/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";
/** @module digitalCore/test/digitalBundleRecovery @description Exercises exact retained-command recovery through real Digital owners with isolated storage and provider I/O. @owner digitalCore @layer test */
const test = require('node:test'), assert = require('node:assert/strict');
const fixture = require('./bundlePublicationFixture.cjs');
const recovery = require('../src/service/defaultDigitalBundleRecoveryService');
const listings = require('../src/service/defaultDigitalCommerceAuctionService');
const gifts = require('../src/service/defaultDigitalBundleGiftService');
const ownerRef = { module: 'profile', schema: 'enterprise', code: 'seller-enterprise' };
const ref = { ownerRef, manifestKey: 'manifest' };
test('bundle successor validation dispatches effectively on normal and lost-acknowledgement readback', async t => {
  const f = fixture(t), base = SERVICE.DefaultDigitalBundleService;
  const manifest = await f.create();
  await listings.publish(f.request, f.command(manifest));
  let checks = 0;
  const effective = { ...base, assertSuccessor: function (...args) {
    checks++;
    return base.assertSuccessor.apply(this, args);
  } };
  let row = structuredClone(f.rows.DefaultDigitalBundleOperationService[0]);
  const scope = { ...f.request, tenant: row.tenant, enterpriseCode: row.enterpriseCode };
  row = await effective.update(scope, row, { status: row.status });
  const update = SERVICE.DefaultDigitalBundleOperationService.update;
  SERVICE.DefaultDigitalBundleOperationService.update = async request => {
    await update(request);
    throw new Error('Original acknowledgement lost');
  };
  row = await effective.update(scope, row, { status: row.status });
  assert.equal(checks, 2);
  assert.equal(row.revision, f.rows.DefaultDigitalBundleOperationService[0].revision);
  assert.throws(() => base.assertSuccessor(undefined, row), /unavailable/);
  assert.throws(() => base.assertSuccessor({ ...row, revision: row.revision - 1 }, row));
  const stricter = { ...effective, assertSuccessor: () => { throw new Error('Stricter successor proof'); } };
  SERVICE.DefaultDigitalBundleOperationService.update = update;
  await assert.rejects(stricter.update(scope, row, { status: row.status }), /Stricter successor proof/);
});

function instruction(f) {
  const command = f.command({ code: 'unused', revision: 0 });
  const { manifestCode, manifestRevision, confirmed, idempotencyKey, ...terms } = command;
  return { mode: 'FIXED', operationKey: idempotencyKey, terms: { ...terms, saleMode: 'FIXED' } };
}
test('retained manifest closes the pre-publication reload gap without any browser intent or new identity', async t => {
  const f = fixture(t), c = instruction(f), manifest = await f.create(c);
  assert.equal(manifest.compositionDigest, SERVICE.DefaultDigitalBundleService.digest(manifest.composition));
  assert.equal((await recovery.query(f.request, ref)).status, 'PREPARED');
  assert.deepEqual(f.effects, []);
  const result = await recovery.resume(f.request, { ...ref, confirmed: true });
  assert.equal(result.status, 'PUBLISHED'); assert.equal(result.canResume, false);
  assert.deepEqual(await recovery.query(f.request, ref), result);
  const effects = [...f.effects];
  assert.deepEqual(await recovery.resume(f.request, { ...ref, confirmed: true }), result);
  assert.deepEqual(f.effects, effects);
  assert.equal(f.rows.DefaultDigitalBundleManifestService.length, 1);
  assert.equal(f.rows.DefaultDigitalBundleOperationService.length, 1);
});
test('lost activation acknowledgement resumes original held publication after a fresh request, not a replacement', async t => {
  const f = fixture(t), c = instruction(f), manifest = await f.create(c);
  f.failPublish(true);
  await assert.rejects(listings.publish(f.request, { ...f.command(manifest), ...c.terms }), /unknown/);
  const state = await recovery.query({ ...f.request, authorization: 'Bearer refreshed' }, ref);
  assert.equal(state.canResume, true); assert.equal(f.holds.size, 1);
  f.failPublish(false);
  assert.equal((await recovery.resume({ ...f.request, authorization: 'Bearer refreshed' }, { ...ref, confirmed: true })).status, 'PUBLISHED');
  assert.equal(f.effects.filter(e => e === 'reserve').length, 1);
});
test('unknown key never grants replacement or resume; malformed, denied and truncated reads fail closed', async t => {
  const f = fixture(t);
  assert.deepEqual(await recovery.query(f.request, ref), { contractVersion: 1, ...ref, status: 'UNCONFIRMED', canResume: false });
  assert.equal((await recovery.resume(f.request, { ...ref, confirmed: true })).canResume, false);
  await assert.rejects(recovery.query(f.request, { ...ref, tenant: 'foreign' }));
  await assert.rejects(recovery.resume(f.request, { ...ref, confirmed: false }));
  await assert.rejects(recovery.query({ ...f.request, authData: { ...f.request.authData, loginId: 'other' } }, ref), /denied/);
  SERVICE.DefaultDigitalBundleManifestService.get = async () => ({ code: 'SUC_TEST', result: [], count: 1 });
  await assert.rejects(recovery.query(f.request, ref), /unavailable/);
  assert.deepEqual(f.effects, []);
});
test('changed reviewed composition, scope, key or credentials cannot replace an original manifest', async t => {
  const f = fixture(t), c = instruction(f); await f.create(c);
  await assert.rejects(f.create({ ...c, terms: { ...c.terms, amount: '11' } }), /conflicts/);
  const row = f.rows.DefaultDigitalBundleManifestService[0];
  row.composition.terms.amount = '99';
  await assert.rejects(recovery.query(f.request, ref), /unavailable/);
  const get = SERVICE.DefaultDigitalBundleManifestService.get;
  SERVICE.DefaultDigitalBundleManifestService.get = async r => { const result = await get(r); f.request.authData.loginId = 'other'; return result; };
  await assert.rejects(recovery.query(f.request, ref), /authority changed/);
  assert.deepEqual(f.effects, []);
});
test('default and overridden recovery key bounds live only in Digital config', async t => {
  const f = fixture(t);
  assert.equal(recovery.key('x'.repeat(f.policy.bundles.commandRecovery.maximumKeyLength)).length, 200);
  assert.throws(() => recovery.key('x'.repeat(201)));
  f.policy.bundles.commandRecovery.maximumKeyLength = 8;
  assert.throws(() => recovery.key('x'.repeat(9)));
  delete f.policy.bundles.commandRecovery;
  assert.throws(() => recovery.key('x'));
});
test('manifest, gift and listing intake honor the same effective command-key bound as recovery', async t => {
  const f = fixture(t), b = SERVICE.DefaultDigitalBundleService, manifest = await f.create();
  f.policy.bundles.commandRecovery.maximumKeyLength = 4;
  await assert.rejects(f.create());
  await assert.rejects(listings.publish(f.request, f.command(manifest)));
  await assert.rejects(b.reserve(f.request, { manifestCode: manifest.code, manifestRevision: manifest.revision,
    purpose: 'GIFT', recipientRef: { module: 'profile', schema: 'customer', code: 'recipient' }, idempotencyKey: 'long-gift' }));
  assert.deepEqual(f.effects, []);
  assert.equal(f.rows.DefaultDigitalBundleManifestService.length, 1);
  assert.equal(f.rows.DefaultDigitalBundleOperationService.length, 0);
  f.policy.bundles.commandRecovery.maximumKeyLength = 220;
  const key = 'x'.repeat(201), created = await b.create(f.request, { ownerRef, components: manifest.components, idempotencyKey: key });
  assert.equal(created.idempotencyKey, recovery.key(key));
});
test('exact gift inspection and original decision continuation survive list pagination without recreating a gift', async t => {
  const f = fixture(t), recipientRef = { module: 'profile', schema: 'customer', code: 'recipient' };
  SERVICE.Authority.resolveRecipient = async (_, input) => ({ active: true, ownerRef: input.ownerRef });
  require('./helpers/participationFixture')();
  const manifest = await f.create({ mode: 'GIFT', operationKey: 'gift', recipientRef });
  const pending = await recovery.resume(f.request, { ...ref, confirmed: true });
  assert.equal(pending.status, 'PENDING'); assert.equal(pending.canResume, false);
  const reference = { operationCode: pending.code, ownerRef };
  assert.equal((await recovery.inspectGift(f.request, reference)).status, 'PENDING');
  const release = SERVICE.Components.release; let lost = true;
  SERVICE.Components.release = async (...args) => { if (lost) throw Error('lost release'); return release(...args); };
  const row = f.row();
  await assert.rejects(gifts.decide(f.request, { operationCode: row.code, expectedRevision: row.revision, decision: 'CANCEL', confirmed: true }), /lost release/);
  const observed = await recovery.inspectGift(f.request, reference);
  assert.equal(observed.canResume, true); assert.equal(observed.decision, 'CANCEL');
  lost = false;
  await gifts.decide(f.request, { operationCode: row.code, expectedRevision: observed.revision, decision: observed.decision, confirmed: true });
  assert.equal((await recovery.inspectGift(f.request, reference)).status, 'RELEASED');
  assert.equal((await recovery.query(f.request, ref)).status, 'RELEASED');
  assert.equal(f.rows.DefaultDigitalBundleOperationService.length, 1);
  await assert.rejects(recovery.inspectGift(f.request, { operationCode: row.code, ownerRef: { ...ownerRef, code: 'foreign' } }), /unavailable/);
  assert.equal(manifest.composition.recipientRef.code, 'recipient');
});
test('public recovery routes use actual controller dispatch, no-store and original access authority', async t => {
  const f = fixture(t), routes = require('../src/router/routers').digitalCore.customer;
  const controller = require('../src/controller/defaultDigitalBundleListingController'), headers = [];
  for (const [name, operation] of [['bundleCommandStatus','commandStatus'], ['bundleCommandResume','commandResume'], ['giftStatus','giftStatus']]) {
    assert.equal(routes[name].secured, true); assert.deepEqual(routes[name].authTokenTypes, ['access']);
    assert.equal(routes[name].operation, operation); assert.equal(routes[name].cache.enabled, false);
  }
  const r = { ...f.request, httpRequest: { body: ref }, httpResponse: { setHeader: (...args) => headers.push(args) } };
  const result = await controller.commandStatus(r);
  assert.equal(result.data.status, 'UNCONFIRMED');
  assert.deepEqual(headers, [['Cache-Control','no-store']]);
});
