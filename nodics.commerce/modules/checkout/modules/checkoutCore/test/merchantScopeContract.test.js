/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
'use strict';
/** @module checkoutCore/test/merchantScopeContract @description Offline fixed-price Cart/Checkout/Payment namespace integration with real orchestration and controlled persistence/owner boundaries. @owner checkoutCore @layer test */
const test = require('node:test'), assert = require('node:assert/strict');
const { isDeepStrictEqual: same } = require('node:util');
const cartFacade = require('../../cart/src/facade/defaultCartCustomerFacade');
const cartController = require('../../cart/src/controller/defaultCartCustomerController');
const cartOperation = require('../../cart/src/service/defaultCartOperationService');
const cartScope = require('../../cart/src/service/defaultCartMerchantScopeService');
const checkoutScope = require('../src/service/defaultCheckoutMerchantScopeService');
const checkoutFacade = require('../src/facade/defaultCheckoutCustomerFacade');
const checkoutController = require('../src/controller/defaultCheckoutCustomerController');
const checkoutOperation = require('../src/service/defaultCheckoutOperationService');
const recovery = require('../src/service/defaultCheckoutCompensationRecoveryService');
const ports = require('../src/service/defaultCheckoutPlacementPortsService');
const clone = value => structuredClone(value);

function fixture(t, kind = 'human') {
    const keys = ['CONFIG', 'SERVICE', 'FACADE', 'NODICS', 'CLASSES'], before = keys.map(key => [key, global[key]]);
    t.after(() => before.forEach(([key, value]) => value === undefined ? delete global[key] : global[key] = value));
    const config = { cart: clone(require('../../cart/config/properties').cart),
        loyaltyRewardPayment: clone(require('../../../../payment/modules/paymentMethods/modules/loyaltyRewardPayment/config/properties').loyaltyRewardPayment) };
    const db = {}, reads = [], calls = [], payments = [], state = { failValidation: false };
    const auth = { tenant: 't', enterpriseCode: 'buyer-enterprise', entCode: 'buyer-enterprise', principalId: 'actor', loginId: 'actor',
        tokenType: 'access', principalType: kind, groups: [kind === 'human' ? 'employeeUserGroup' : 'customerUserGroup'] };
    const ownerRef = { module: 'profile', schema: kind === 'human' ? 'enterprise' : 'customer', code: kind === 'human' ? 'buyer-enterprise' : 'customer' };
    const request = (body, params = {}, query) => ({ authData: clone(auth), tenant: 't', enterpriseCode: 'buyer-enterprise',
        authorization: 'Bearer shopper', httpRequest: { body, params, query, headers: { authorization: 'Bearer shopper', 'x-enterprise-code': 'buyer-enterprise' } } });
    global.CONFIG = { get: key => config[key] };
    global.NODICS = { getInternalAuthToken: tenant => { assert.equal(tenant, 't'); return 'runtime'; } };
    global.CLASSES = { NodicsError: class extends Error { constructor(code, message) { super(message || code); this.code = code; } } };
    global.FACADE = { DefaultCartCustomerFacade: cartFacade, DefaultCheckoutCustomerFacade: checkoutFacade };
    global.SERVICE = {
        DefaultCartMerchantScopeService: cartScope, DefaultCheckoutMerchantScopeService: checkoutScope,
        DefaultCartOperationService: cartOperation, DefaultCheckoutOperationService: checkoutOperation,
        DefaultCheckoutPlacementPortsService: ports, DefaultCheckoutCompensationRecoveryService: recovery,
        DefaultOrderPlacementService: require('../src/service/defaultOrderPlacementService'),
        DefaultStoreContextService: require('../../../../baseCommerce/modules/store/src/service/defaultStoreContextService'),
        DefaultIdentityGovernanceService: { getSystemAuthData: () => ({ isSystem: true, principalType: 'system' }) },
        DefaultSecuredRequestPipelineService: { getGrantedPermissions: () => ['commerce.*'], isPermissionGranted: () => true },
        DefaultLoggerService: { assertSensitiveRequest: () => {} },
        DefaultModuleService: { invokeModule: async r => {
            calls.push(clone(r));
            if (r.moduleName === 'store') {
                assert.equal(r.apiName, '/internal/stores/placement'); assert.equal(r.header.Authorization, 'Bearer runtime');
                assert.deepEqual(Object.keys(r.requestBody).sort(), ['contractVersion', 'storeCode']);
                if (state.storeError) throw Error('Store unavailable');
                const result = { contractVersion: 1, tenant: 't', store: { code: r.requestBody.storeCode,
                    enterpriseCode: 'merchant', revision: 4, status: 'ACTIVE', active: true } };
                state.storeChange?.(result); return result;
            }
            assert.equal(r.header.Authorization, 'Bearer shopper'); assert.equal(r.header['X-Enterprise-Code'], 'buyer-enterprise');
            return kind === 'customer' ? { contractVersion: 1, tenant: 't', enterpriseCode: 'buyer-enterprise', customer: { code: 'customer', loginId: 'actor' } }
                : { principalCode: 'actor', scopes: [{ scopeType: 'ENTERPRISE', scopeCode: 'buyer-enterprise' }], deniedScopes: [] };
        } },
        DefaultProductDiscoveryService: { activeSelection: async () => ['version'], resolveVariantSku: async r => {
            assert.equal(r.enterpriseCode, 'merchant'); assert.equal(r.entCode, 'merchant'); assert.equal(r.authData.enterpriseCode, 'merchant');
            assert.equal(r.storeCode, 'shop'); return 'sku';
        } },
        DefaultCommerceCalculationPortsService: { create: () => ({}) },
        DefaultCartValidationService: { validate: async () => { if (state.failValidation) throw Error('validation unavailable'); return { status: 'VALID' }; } },
        DefaultCartCalculationEngineService: { calculate: async cart => ({ tenant: cart.tenant, enterpriseCode: cart.enterpriseCode,
            cartCode: cart.code, currency: 'POINTS', subtotal: '10', totalAmount: '10', discountAmount: '0', taxAmount: '0', decisions: {},
            entries: cart.entries.map(entry => ({ ...entry, availability: { productType: 'DIGITAL', inventoryStrategy: 'DIGITAL_COMMERCE', digitalDeliveryType: 'DIGITAL_OWNERSHIP' },
                priceDecision: { unitAmount: '10', totalAmount: '10' } })) }) },
        DefaultPipelineService: { start: async (name, r) => cartOperation.calculateDirect(r) },
        DefaultCommerceParticipantSpendService: { enforce: async r => { assert.equal(r.participantEnterpriseCode, 'buyer-enterprise'); return { confirmed: true }; } },
        DefaultExactAmountService: require('../../../../baseCommerce/modules/pricing/src/service/defaultExactAmountService'),
        DefaultLoyaltyRewardPaymentMethodService: require('../../../../payment/modules/paymentMethods/modules/loyaltyRewardPayment/src/service/defaultLoyaltyRewardPaymentMethodService'),
        DefaultPaymentExecutionService: require('../../../../payment/modules/paymentCore/src/service/defaultPaymentExecutionService'),
        DefaultLoyaltyRewardPaymentProviderService: { code: 'loyalty-reward-points', execute: async r => {
            assert.equal(r.enterpriseCode, 'buyer-enterprise'); assert.deepEqual(r.authData, auth); assert.deepEqual(r.ownerRef, ownerRef);
            payments.push(clone(r)); return { status: r.operation === 'AUTHORIZE' ? 'AUTHORIZED' : 'CAPTURED', reference: 'ledger-' + r.operation };
        } },
        DefaultDigitalCommerceCheckoutService: {
            reserveForCheckout: async r => { assert.equal(r.enterpriseCode, 'merchant'); assert.equal(r.authData.enterpriseCode, 'buyer-enterprise');
                assert.deepEqual(r.ownerRef, ownerRef); return [{ code: 'unit', digitalDeliveryType: 'DIGITAL_OWNERSHIP' }]; },
            confirmSale: async () => [{ code: 'sale' }], deliver: async () => [{ code: 'delivery' }],
        },
    };
    for (const name of ['Cart', 'CartEntry', 'CartCalculation', 'CheckoutCheckpoint', 'CommerceOrder', 'CommerceOrderEntry', 'PaymentTransactionEntry', 'Consignment']) {
        db[name] = [];
        const match = (row, query) => Object.entries(query || {}).every(([key, value]) => same(row[key], value));
        SERVICE['Default' + name + 'Service'] = {
            get: async r => {
                reads.push({ name, request: clone(r) });
                let rows = db[name].filter(row => match(row, r.query));
                if (!r.authData.isSystem && r.authData.enterpriseCode) rows = rows.filter(row => row.enterpriseCode === r.authData.enterpriseCode);
                const result = { code: 'SUC_READ', count: rows.length, result: clone(rows) };
                state.readChange?.(name, result, r); return result;
            },
            save: async r => {
                let model = clone(r.model);
                if (['Cart', 'CartEntry', 'CartCalculation'].includes(name)) {
                    const definition = require('../../cart/src/schemas/schemas').cart[name[0].toLowerCase() + name.slice(1)].definition;
                    model = Object.fromEntries(Object.entries(model).filter(([key]) => definition[key] || ['active', 'created', 'updated'].includes(key)));
                }
                const existing = db[name].find(row => row.code === model.code && row.enterpriseCode === model.enterpriseCode);
                if (existing && r.options?.insertOnly) throw Error('Duplicate identity');
                if (existing) Object.assign(existing, model); else db[name].push(model);
                if (name === 'PaymentTransactionEntry') assert.equal(r.authData.enterpriseCode, 'buyer-enterprise');
                return { code: 'SUC_SAVE', result: clone(model) };
            },
            update: async r => { const row = db[name].find(row => match(row, r.query));
                if (row) Object.assign(row, clone(r.model.$set || r.model)); return { code: 'SUC_UPDATE', result: { matchedCount: row ? 1 : 0 } }; },
        };
    }
    const create = () => cartController.create(request({ cartCode: 'cart', storeCode: 'shop', currency: 'POINTS' }));
    const add = () => cartController.addEntry(request({ productCode: 'product', variantCode: 'variant', quantity: '1' }, { cartCode: 'cart' }));
    const place = (body = {}) => checkoutController.place({ ...request({ cartCode: 'cart', orderCode: 'order', paymentMethod: 'LOYALTY_REWARD', walletCode: 'wallet', ...body }), idempotencyKey: 'purchase' });
    const command = () => checkoutController.commandStatus(request(undefined, { commandCode: 'purchase' }));
    return { db, auth, config, state, reads, calls, payments, ownerRef, request, create, add, place, command };
}

for (const kind of ['customer', 'human']) test(`${kind} fixed-price create/add/place/replay/status keeps merchant and participant namespaces separate`, async t => {
    const f = fixture(t, kind), before = clone(f.auth);
    const created = (await f.create()).data.cart;
    assert.equal(created.enterpriseCode, 'merchant'); assert.equal(created.participantEnterpriseCode, 'buyer-enterprise');
    assert.deepEqual(created.ownerRef, f.ownerRef); assert.equal(created.merchantScope.revision, 4);
    await f.add();
    const result = (await f.place()).data;
    assert.equal(result.status, 'COMPLETED'); assert.equal(f.db.CommerceOrder[0].enterpriseCode, 'merchant');
    assert.equal(f.db.CheckoutCheckpoint[0].evidence.participantEnterpriseCode, 'buyer-enterprise');
    assert.deepEqual(f.db.CheckoutCheckpoint[0].evidence.merchantScope, created.merchantScope);
    assert.equal(f.db.PaymentTransactionEntry.length, 2); assert.equal(f.payments.length, 2);
    const command = (await f.command()).data;
    assert.equal(command.scopeQualified, true); assert.equal(command.cartCode, 'cart'); assert.equal(command.orderCode, 'order');
    assert.equal(command.originalPaymentRecordCount, 2);
    const completed = (await checkoutController.status(f.request(undefined, { orderCode: command.orderCode }))).data;
    assert.equal(completed.code, 'order'); assert.equal(completed.status, 'COMPLETED');
    assert.deepEqual((await f.place()).data, result); assert.equal(f.payments.length, 2);
    assert.equal(f.calls.filter(r => r.moduleName === 'store').length, 1); assert.deepEqual(f.auth, before);
    for (const read of f.reads.filter(read => read.request.authData.isSystem)) {
        assert.equal(read.request.query.tenant, 't'); assert.ok(read.request.query.ownerId);
        assert.equal(read.request.searchOptions.limit, 2); assert.equal(read.request.options.skipItemCache, true);
    }
});

test('failure checkpoints retain the reviewed binding and route bounded recovery without Store input', async t => {
    const f = fixture(t); await f.create(); await f.add(); f.state.failValidation = true;
    await assert.rejects(f.place(), /validation unavailable/);
    const row = f.db.CheckoutCheckpoint[0]; assert.equal(row.cartCode, 'cart'); assert.equal(row.evidence.orderCode, 'order');
    assert.equal(row.evidence.merchantScope.enterpriseCode, 'merchant');
    const result = (await f.command()).data;
    assert.equal(result.cartCode, 'cart'); assert.equal(result.orderCode, 'order'); assert.equal(result.scopeQualified, true);
    assert.equal(result.status, 'COMPENSATED');
    SERVICE.DefaultCheckoutCompensationRecoveryService = { ...recovery, recover: async r => {
        assert.equal(r.enterpriseCode, 'merchant'); assert.equal(r.participantEnterpriseCode, 'buyer-enterprise');
        assert.deepEqual(r.ownerRef, f.ownerRef); return recovery.recover(r);
    } };
    // An already compensated pre-acquisition failure has no eligible cleanup to dispatch.
    await assert.rejects(checkoutController.recoverCompensation(f.request({}, { commandCode: 'purchase' })), /UNCONFIRMED/);
    assert.equal(f.payments.length, 0);
});

test('retained Cart works after Store outage and refuses changed Store/body scope', async t => {
    const f = fixture(t); await f.create(); f.state.storeError = true;
    await f.add(); await assert.rejects(f.create(), /Store unavailable/);
    await assert.rejects(cartController.read(f.request(undefined, { cartCode: 'cart' }, { storeCode: 'other' })), /Store context does not match/);
    await assert.rejects(f.place({ storeCode: 'other' }), /Store context does not match/);
});

test('original command cannot be rebound to a different reviewed order or Cart', async t => {
    const f = fixture(t); await f.create(); await f.add(); await f.place();
    await assert.rejects(f.place({ orderCode: 'other' }), /binding cannot change/);
    await cartController.create(f.request({ cartCode: 'other', storeCode: 'shop' }));
    await assert.rejects(f.place({ cartCode: 'other' }), /binding cannot change/);
    assert.equal(f.payments.length, 2);
});

for (const [name, mutate] of Object.entries({
    'typed owner mismatch': row => { row.ownerRef.schema = 'customer'; },
    'participant mismatch': row => { row.participantEnterpriseCode = 'other'; },
    'merchant mismatch': row => { row.enterpriseCode = 'other'; },
    'Store mismatch': row => { row.storeCode = 'other'; },
    'missing binding': row => { delete row.merchantScope; },
})) test(`Cart rejects ${name} before entry mutation`, async t => {
    const f = fixture(t); await f.create(); mutate(f.db.Cart[0]);
    await assert.rejects(f.add()); assert.equal(f.db.CartEntry.length, 0);
});

for (const [name, mutate] of Object.entries({
    'typed owner mismatch': row => { row.evidence.ownerRef.schema = 'customer'; },
    'participant mismatch': row => { row.evidence.participantEnterpriseCode = 'other'; },
    'merchant mismatch': row => { row.enterpriseCode = 'other'; },
    'order mismatch': row => { row.evidence.orderCode = 'other'; },
    'missing cart': row => { delete row.cartCode; },
    'missing binding': row => { delete row.evidence.merchantScope; },
})) test(`Checkout reads reject ${name}`, async t => {
    const f = fixture(t); await f.create(); await f.add(); await f.place(); mutate(f.db.CheckoutCheckpoint[0]);
    await assert.rejects(f.command()); await assert.rejects(checkoutController.status(f.request(undefined, { orderCode: 'order' })));
});

test('ambiguous Cart and command identities fail closed across merchant namespaces', async t => {
    const f = fixture(t); await f.create(); f.db.Cart.push(clone(f.db.Cart[0]));
    await assert.rejects(f.add(), /ambiguous/); f.db.Cart.pop(); await f.add(); await f.place();
    f.db.CheckoutCheckpoint.push(clone(f.db.CheckoutCheckpoint[0]));
    await assert.rejects(f.command()); assert.equal(f.payments.length, 2);
});

test('Store response tenant/revision/active/merchant and changed authority are never accepted', async t => {
    const f = fixture(t);
    for (const mutate of [r => r.tenant = 'other', r => r.store.revision = 0, r => r.store.active = false,
        r => r.store.enterpriseCode = '*', r => r.store.code = 'other', r => r.success = false]) {
        f.state.storeChange = mutate; await assert.rejects(f.create()); assert.equal(f.db.Cart.length, 0);
    }
    f.state.storeChange = () => { f.config.cart.merchantScope.storeTarget.timeoutMs++; };
    await assert.rejects(f.create()); assert.equal(f.db.Cart.length, 0);
});

test('body owner/merchant fields do not override canonical evidence and signed merchant spoof headers reject', async t => {
    const f = fixture(t);
    const created = await cartController.create(f.request({ cartCode: 'cart', storeCode: 'shop', enterpriseCode: 'forged',
        ownerRef: { module: 'profile', schema: 'enterprise', code: 'forged' }, merchantScope: { enterpriseCode: 'forged' } }));
    assert.equal(created.data.cart.enterpriseCode, 'merchant'); assert.deepEqual(created.data.cart.ownerRef, f.ownerRef);
    const r = f.request(undefined, { cartCode: 'cart' }); r.httpRequest.headers['x-enterprise-code'] = 'merchant';
    await assert.rejects(cartController.read(r), /participant authority/);
});

test('scope reads reject partial envelopes and changed original caller without effects', async t => {
    const f = fixture(t); await f.create();
    f.state.readChange = (name, result) => { if (name === 'Cart') result.count = 2; };
    await assert.rejects(f.add(), /ambiguous/); assert.equal(f.db.CartEntry.length, 0);
    f.state.readChange = undefined;
    const r = await cartFacade.resolveContext({ ...f.request({ cartCode: 'cart' }), cartCode: 'cart' });
    f.state.readChange = () => { r.ownerRef.code = 'changed'; };
    await assert.rejects(cartScope.retained(r), /changed during scope read/);
});

test('Store transport uses complete framework defaults and intentional deployment overrides', async t => {
    const f = fixture(t);
    assert.deepEqual(f.config.cart.merchantScope.storeTarget,
        { connectionName: 'commerce', targetAuthority: { runtimeRole: 'COMMERCE' }, timeoutMs: 15000 });
    f.config.cart.merchantScope.storeTarget = { connectionName: 'selling-owner', targetAuthority: { runtimeRole: 'COMMERCE' }, timeoutMs: 23000 };
    await f.create();
    const call = f.calls.find(r => r.moduleName === 'store');
    assert.equal(call.connectionName, 'selling-owner'); assert.equal(call.timeoutMs, 23000); assert.equal(call.maxAttempts, 1);
    assert.equal(call.followRedirects, false); assert.equal(call.rejectUnauthorized, true);
});

test('missing Store transport definitions fail closed without inline defaults or persistence', async t => {
    const f = fixture(t), original = clone(f.config.cart.merchantScope.storeTarget);
    for (const key of ['connectionName', 'targetAuthority', 'timeoutMs']) {
        f.config.cart.merchantScope.storeTarget = clone(original); delete f.config.cart.merchantScope.storeTarget[key];
        await assert.rejects(f.create(), /transport is unavailable/);
    }
    assert.equal(f.calls.filter(r => r.moduleName === 'store').length, 0); assert.equal(f.db.Cart.length, 0);
});

test('completed status refuses a binding changed between merchant resolution and the protected read', async t => {
    const f = fixture(t); await f.create(); await f.add(); await f.place();
    f.state.readChange = (name, result, r) => {
        if (name === 'CheckoutCheckpoint' && !r.authData.isSystem) result.result[0].evidence.merchantScope.enterpriseCode = 'changed';
    };
    await assert.rejects(checkoutController.status(f.request(undefined, { orderCode: 'order' })), /UNCONFIRMED/);
});

test('another signed owner cannot recover a Cart or observe command-to-order bindings', async t => {
    const f = fixture(t); await f.create(); await f.add(); await f.place();
    // Tenant remains the same; changed Profile evidence establishes another represented Enterprise.
    f.auth.enterpriseCode = 'other'; f.auth.entCode = 'other';
    SERVICE.DefaultModuleService.invokeModule = async () => ({ principalCode: 'actor', scopes: [{ scopeType: 'ENTERPRISE', scopeCode: 'other' }], deniedScopes: [] });
    const r = f.request(undefined, { cartCode: 'cart' }); r.enterpriseCode = 'other'; r.httpRequest.headers['x-enterprise-code'] = 'other';
    await assert.rejects(cartController.read(r), error => error.code === 'ERR_AUTH_00003');
    const command = f.request(undefined, { commandCode: 'purchase' }); command.enterpriseCode = 'other'; command.httpRequest.headers['x-enterprise-code'] = 'other';
    const result = (await checkoutController.commandStatus(command)).data;
    assert.equal(result.status, 'UNCONFIRMED'); assert.equal(result.scopeQualified, false);
    assert.equal(result.orderCode, undefined); assert.equal(result.cartCode, undefined);
});
