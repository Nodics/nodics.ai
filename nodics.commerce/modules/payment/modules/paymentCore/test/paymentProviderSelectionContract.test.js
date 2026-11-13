/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";
const test = require('node:test');
const assert = require('node:assert/strict');
const service = require('../src/service/defaultPaymentProviderSelectionService');
const defaults = require('../config/properties').paymentCore;
const ports = require('../../../../checkout/modules/checkoutCore/src/service/defaultCheckoutPlacementPortsService');
function fixture() {
 const settings = structuredClone(defaults);
 const mock = { code: 'stripe-sandbox', execute: async () => ({sandbox:true}) };
 const future = { code: 'test-installed-provider', execute: async () => ({}) };
 global.CONFIG = {get: key => key === 'paymentCore' ? settings : {}};
 global.SERVICE = {DefaultPaymentProviderSelectionService:service, DefaultStripeSandboxAdapterService:mock, DefaultTestInstalledProviderService:future};
 return {settings,mock,future};
}
test('Framework selects the offline card mock and Checkout consumes it', () => {
 const f=fixture(); assert.equal(ports.paymentAdapter({methodCode:'CARD'}),f.mock);
});
test('a project configuration selects an installed provider while capture retains the original provider', () => {
 const f=fixture();f.settings.providerBindings[f.future.code]={serviceName:'DefaultTestInstalledProviderService',methods:['CARD']};
 f.settings.providerSelection.CARD=f.future.code;
 assert.equal(ports.paymentAdapter({methodCode:'CARD'}),f.future);
 assert.equal(ports.paymentAdapter({methodCode:'CARD',providerCode:'stripe-sandbox'}),f.mock);
});
test('unknown, unavailable, mismatched and wrong-method providers fail closed without mock fallback', () => {
 const f=fixture();assert.throws(()=>service.resolve('UNKNOWN'),/unavailable/);
 f.settings.providerSelection.CARD='missing';assert.throws(()=>service.resolve('CARD'),/unavailable/);
 assert.throws(()=>service.resolve('CARD','loyalty-reward-points'),/unavailable/);
 f.settings.providerBindings.missing={serviceName:'DefaultMissingService',methods:['CARD']};assert.throws(()=>service.resolve('CARD'),/not available/);
 f.settings.providerBindings.missing.serviceName='DefaultStripeSandboxAdapterService';assert.throws(()=>service.resolve('CARD'),/not available/);
});
