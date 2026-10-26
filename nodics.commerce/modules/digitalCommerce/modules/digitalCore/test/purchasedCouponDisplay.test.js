/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
'use strict';
const test = require('node:test'), assert = require('node:assert/strict');
const digital = require('../src/service/defaultDigitalCommerceEntitlementService');
const promotion = require('../../../../baseCommerce/modules/promotion/src/service/defaultCouponOfferService');
const properties = require('../../../../baseCommerce/modules/promotion/config/properties');

/** Presentation must use the original promise even when today's catalogue is unavailable. */
test('purchased coupon title uses immutable retained offer name without querying a catalogue', t => {
  const previous = global.SERVICE, config = global.CONFIG;
  t.after(() => { global.SERVICE = previous; global.CONFIG = config; });
  global.CONFIG = { get: key => properties[key] };
  global.SERVICE = { DefaultCouponOfferService: promotion,
    DefaultProductService: { get: () => assert.fail('Current Product must not be read') } };
  const owner = { ...digital, couponWindow: () => ({ mode: 'NONE', expired: false }) };
  const record = { code: 'coupon', productCode: 'product', purchasePolicy: {
    version: 2, name: 'Original 10% partner offer', couponOffer: { terms: ['Original promise'] },
  } };
  const before = structuredClone(record);
  assert.equal(owner.publicEntitlement(record).productName, 'Original 10% partner offer');
  assert.deepEqual(record, before);
  for (const name of ['', 'bad\nlabel', 'x'.repeat(properties.promotion.couponOffers.maximumTermLength + 1)]) {
    record.purchasePolicy.name = name;
    const result = owner.publicEntitlement(record);
    assert.equal(result.productName, undefined);
    assert.deepEqual(result.purchaseTerms, ['Original promise']);
    assert.equal(result.code, 'coupon');
  }
});
