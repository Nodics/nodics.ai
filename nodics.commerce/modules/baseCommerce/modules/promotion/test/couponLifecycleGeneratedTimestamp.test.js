/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
'use strict';
/** @module promotion/test/couponLifecycleGeneratedTimestamp
 * @description Lifecycle CAS through actual generated update steps, owner guards, timestamp interceptor and Mongo adapter; storage is isolated memory, not native qualification.
 * @layer test @owner promotion
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const root = path.resolve(__dirname, '../../../../../..');
const foundation = p => require(path.join(root, 'nodics.foundation/modules', p));
const operation = require('../src/service/defaultPromotionOperationService');
const seller = require('../src/service/defaultCouponSellerAuthorizationService');
const secure = require('../src/service/defaultCouponSecureIssuanceService');
const mongo = foundation('nDatabase/mongodb/src/schemas/model').default;
const update = foundation('nDatabase/database/src/service/procs/update/defaultModelsUpdateInitializerService');
const timestamps = foundation('nDatabase/database/src/service/interceptors/defaultInterceptorService');
const interceptors = foundation('nCommon/src/service/interceptor/defaultInterceptorService');
const registry = foundation('nDatabase/database/src/interceptors/interceptors');

function fixture(t, fault) {
  const globals = Object.fromEntries(['SERVICE', 'UTILS', 'CLASSES'].map(k => [k, global[k]]));
  const upper = Object.getOwnPropertyDescriptor(String.prototype, 'toUpperCaseFirstChar');
  Object.defineProperty(String.prototype, 'toUpperCaseFirstChar', { configurable: true, value() { return this[0].toUpperCase() + this.slice(1); } });
  t.after(() => {
    for (const [k, v] of Object.entries(globals)) { if (v === undefined) delete global[k]; else global[k] = v; }
    if (upper) Object.defineProperty(String.prototype, 'toUpperCaseFirstChar', upper);
    else delete String.prototype.toUpperCaseFirstChar;
  });
  global.CLASSES = { NodicsError: class extends Error {
    constructor(error, message) { super(message || (error instanceof Error ? error.message : error)); this.code = error.code || error; }
    static enrich(error) { return error; }
  } };
  global.UTILS = { isBlank: value => !value || !Object.keys(value).length, isObject: value => value !== null && typeof value === 'object' };
  const original = { _id: 'unchanged-provider-identity', tenant: 't', enterpriseCode: 'merchant', code: 'coupon',
    status: 'RESERVED', saleStatus: 'RESERVED', revision: 2, reservedFor: 'buyer', idempotencyKey: 'original',
    updated: new Date('2026-01-01T00:00:00Z'), secureIssuanceCode: 'retained-issuance' };
  const state = { row: structuredClone(original), calls: 0 };
  const transactionContext = {};
  const schema = { ...mongo, schemaName: 'coupon', versioned: false,
    rawSchema: { definition: { updated: { type: 'date' } } },
    transactionOptions: r => { assert.equal(r.transactionContext, transactionContext); return {}; },
    dataBase: { getOptions: () => ({}) },
    updateMany: async (query, document) => {
      state.calls++;
      assert.deepEqual(query, { tenant: 't', enterpriseCode: 'merchant', code: 'coupon', revision: 2, status: 'RESERVED' });
      assert.equal(document.$set._id, original._id);
      assert.equal(document.$set.secureIssuanceCode, undefined);
      assert.ok(document.$set.updated instanceof Date);
      assert.ok(document.$set.updated > original.updated);
      if (fault === 'cas') return { acknowledged: true, matchedCount: 0 };
      state.row = { ...state.row, ...document.$set };
      if (fault !== 'unset') for (const key of Object.keys(document.$unset || {})) delete state.row[key];
      if (fault === 'domain') state.row.saleStatus = 'WRONG';
      if (fault === 'identity') state.row._id = 'changed';
      if (fault === 'secure') state.row.secureIssuanceCode = 'changed';
      return { acknowledged: true, matchedCount: 1 };
    } };
  const initializer = { ...update, LOG: { debug() {} } };
  const step = (name, r) => new Promise((resolve, reject) => initializer[name](r, {}, {
    nextSuccess: resolve, error: (_r, _s, error) => reject(error),
  }));
  global.SERVICE = {
    DefaultCouponSellerAuthorizationService: seller,
    DefaultCouponSecureIssuanceService: { ...secure, privateOperation: (_r, fn) => fn(), read: async () => [structuredClone(state.row)] },
    DefaultInterceptorService: { ...interceptors, ...timestamps },
    DefaultDatabaseConfigurationService: { getSchemaInterceptors: () => ({ preUpdate: [
      { handler: 'DefaultCouponSecureIssuanceService.protect' },
      { handler: 'DefaultCouponSellerAuthorizationService.protectCoupon' },
      registry.updateModifiedTimeOnUpdate,
    ] }) },
    DefaultCouponService: {
      get: async () => ({ code: 'SUC_GET', result: [structuredClone(state.row)] }),
      update: async r => {
        r.schemaModel = schema;
        await step('validateRequest', r);
        await step('buildQuery', r);
        await step('applyPreInterceptors', r);
        return { code: 'SUC_UPDATE', result: await initializer.persistUpdates(r) };
      },
    },
  };
  const owner = { ...operation, enterpriseQuery: (r, query) => ({ ...query, enterpriseCode: r.enterpriseCode }) };
  const request = { tenant: 't', enterpriseCode: 'merchant', authData: {}, transactionContext };
  return { state, original, run: release => owner.commitLifecycleCoupon(request, original, {
    ...original, revision: 3, status: release ? 'ACTIVE' : 'SOLD', saleStatus: release ? 'AVAILABLE' : 'SOLD',
    ...(release ? { reservedFor: undefined, idempotencyKey: undefined } : {}),
  }) };
}

for (const release of [false, true]) test(`generated timestamp preserves ${release ? 'operator release' : 'plain forward'} lifecycle readback`, async t => {
  const f = fixture(t);
  const saved = await f.run(release);
  assert.equal(f.state.calls, 1);
  assert.equal(saved.revision, 3);
  assert.equal(saved.secureIssuanceCode, f.original.secureIssuanceCode);
  assert.equal(saved._id, f.original._id);
  assert.equal(Object.hasOwn(saved, 'reservedFor'), !release);
  assert.equal(Object.hasOwn(saved, 'idempotencyKey'), !release);
  assert.ok(saved.updated > f.original.updated);
});
for (const fault of ['domain', 'identity', 'unset', 'cas', 'secure']) test(`generated release still rejects ${fault} failure`, async t => {
  const f = fixture(t, fault);
  await assert.rejects(f.run(true), fault === 'cas' ? /lost its revision/ : fault === 'secure'
    ? { code: 'ERR_PROMOTION_SECURE_ISSUANCE_UNCONFIRMED' } : /readback changed/);
  assert.equal(f.state.calls, 1);
});
