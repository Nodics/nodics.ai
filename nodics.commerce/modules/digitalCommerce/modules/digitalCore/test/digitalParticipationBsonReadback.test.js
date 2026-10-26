/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
'use strict';
/** @module digitalCore/test/digitalParticipationBsonReadback @description Actual participation admission with the installed MongoDB BSON codec and isolated transactional storage; no live database. @layer test @owner digitalCore */
const test = require('node:test');
const assert = require('node:assert/strict');
const { BSON } = require('mongodb');
const { setup } = require('./helpers/couponCheckoutFixture');
const checkout = require('../src/service/defaultDigitalCommerceCheckoutService');
const participation = require('../src/service/defaultDigitalParticipationService');
const bundle = require('../src/service/defaultDigitalBundleService');

function fixture(t, kind, corrupt = false) {
  const f = setup(t, 'REWARDS', true, 'buyer-enterprise');
  if (kind !== 'promotion') f.entry.availability.couponBatchCode = 'batch';
  if (kind === 'batch') delete f.entry.availability.promotionCode;
  const units = checkout.couponUnits({ entries: [f.entry] });
  const input = { kind: 'COUPON', ownerRef: f.r.ownerRef, key: f.r.idempotencyKey,
    identity: { ownerId: f.r.ownerId, merchantEnterpriseCode: f.r.enterpriseCode,
      cartCode: f.r.payload.cartCode, orderCode: f.r.payload.orderCode, storeCode: f.r.storeCode,
      units, selections: f.r.payload.couponSelections } };
  for (const schema of ['DigitalBundleOwnerPolicy', 'DigitalParticipationCommand']) {
    const service = SERVICE['Default' + schema + 'Service'], get = service.get;
    service.get = async request => {
      const response = BSON.deserialize(BSON.serialize(await get(request)));
      if (corrupt && schema === 'DigitalParticipationCommand' && response.result[0])
        response.result[0].evidence.identity.units[0].productCode = 'foreign-product';
      return response;
    };
  }
  return { ...f, units, input };
}

for (const kind of ['promotion', 'batch', 'both']) test(kind + '-backed coupon participation survives BSON readback and preserves original digest', async t => {
  const f = fixture(t, kind);
  const legacy = structuredClone(f.units);
  if (kind === 'promotion') legacy[0].couponBatchCode = undefined;
  if (kind === 'batch') legacy[0].promotionCode = undefined;
  assert.equal(bundle.digest(f.units), bundle.digest(legacy));
  await participation.admit(f.r, f.input);
  const saved = f.participation.rows.digitalParticipationCommand;
  assert.equal(saved.length, 1);
  assert.deepEqual(saved[0].evidence.identity.units, f.units);
  assert.deepEqual(BSON.deserialize(BSON.serialize({ units: f.units })).units, f.units);
  await participation.admit(f.r, f.input);
  assert.equal(saved.length, 1);
  assert.equal(f.participation.rows.digitalBundleOwnerPolicy[0].revision, 0);
});

test('BSON-backed participation still refuses changed business evidence and rolls back', async t => {
  const f = fixture(t, 'both', true);
  await assert.rejects(participation.admit(f.r, f.input), /participation.*unconfirmed/i);
  assert.equal(f.participation.rows.digitalParticipationCommand.length, 0);
  assert.equal(f.participation.rows.digitalBundleOwnerPolicy.length, 0);
});
