/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
/** @module eWaste/test/eWasteDigitalOwnershipAcceptance
 * @description Source contract tests for inert help and read-only signed API plan boundaries. Injected plan records are not native/provider or financial acceptance evidence.
 * @layer test @owner eWaste
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { main, validateSelection, planOwnershipAcceptance, runOwnershipAcceptance, schemaReadContract } from '../src/service/acceptance/defaultEWasteDigitalOwnershipAcceptanceService.mjs';
const require = createRequire(import.meta.url);
const inspection = require('../../../../../../nodics.waste/modules/wasteCore/src/service/defaultWasteInstalledDataInspectionService');
const loyaltyRoutes = require('../../../../../../nodics.loyalty/modules/loyaltyApi/src/router/routers').loyaltyApi.internal;
const wasteRoutes = require('../../../../../../nodics.waste/modules/wasteApi/src/router/routers').wasteApi.internal;
const commerceRoutes = require('../../../../../../nodics.commerce/modules/digitalCommerce/modules/digitalCore/src/router/routers').digitalCore.ownershipEvidence;
const profileEvidenceRoute = require('../../../../../../nodics.platform/modules/profile/src/router/routers').profile.references.customerEvidence;
const wasteEvidenceRoute = require('../src/router/routers').eWaste.internalDigitalSale.internalDigitalSaleInvoke;
function fixture() {
  const fields = ['tenant', 'enterpriseCode', 'storeCode', 'locale', 'jurisdiction', 'productCode', 'variantCode', 'sku',
    'assetCode', 'bindingCode', 'projectionCode', 'transferPolicyCode', 'rewardPolicyCode', 'carbonPolicyCode',
    'buyerCode', 'buyerLoginId', 'sellerCode', 'sellerLoginId', 'buyerWalletCode', 'sellerWalletCode',
    'programCode', 'rewardTypeCode', 'cartCode', 'orderCode'];
  const s = Object.fromEntries(fields.map(field => [field, field + '_test']));
  Object.assign(s, { currency: 'POINTS', amount: '12.00', checkoutKey: 'original-checkout', disputeKey: 'original-dispute',
    refundKey: 'original-refund', refundReason: 'Reviewed isolated source contract test' });
  const ref = code => ({ module: 'profile', schema: 'customer', code });
  const row = value => ({ tenant: s.tenant, active: true, ...value });
  const records = {
    digitalProductBinding: [row({ code: s.bindingCode, status: 'ACTIVE', enterpriseCode: s.enterpriseCode,
      productCode: s.productCode, variantCode: s.variantCode, sku: s.sku, providerOwner: 'wasteCore', digitalDeliveryType: 'DIGITAL_OWNERSHIP',
      inventoryStrategy: 'DIGITAL_COMMERCE', providerReference: { assetCode: s.assetCode, projectionCode: s.projectionCode,
        storeCode: s.storeCode, sellerRef: ref(s.sellerCode), transferPolicyCode: s.transferPolicyCode,
        rewardSettlementPolicyCode: s.rewardPolicyCode, carbonSettlementPolicyCode: s.carbonPolicyCode } })],
    wasteAsset: [row({ code: s.assetCode, assetStatus: 'LISTED', ownerRef: ref(s.sellerCode), digitalOwnerRef: ref(s.sellerCode), revision: 1,
      marketplaceProjectionRef: { code: s.projectionCode }, custodyStatus: 'CUSTOMER_HELD', metadata: {} })],
    wasteAssetMarketplaceProjection: [row({ code: s.projectionCode, projectionStatus: 'LISTED', assetCode: s.assetCode, commerceProductRef: { code: s.productCode } })],
    wasteAssetTransferPolicy: [row({ code: s.transferPolicyCode, status: 'ACTIVE', metadata: { digitalOwnership: { refund: 'ORIGINAL_TRANSFER_REVERSAL_ONLY_BEFORE_ONWARD_TRANSFER' } } })],
    wasteRewardSettlementPolicy: [row({ code: s.rewardPolicyCode, status: 'ACTIVE', walletCurrencyCode: 'POINTS', metadata: { digitalOwnership: {
      proceeds: 'CAPTURED_TOTAL', payee: 'CURRENT_SELLER', programCode: s.programCode, rewardTypeCode: s.rewardTypeCode } } })],
    wasteCarbonSettlementPolicy: [row({ code: s.carbonPolicyCode, status: 'ACTIVE', settlementMode: 'NONE' })],
    customer: ['buyer', 'seller'].map(actor => row({ code: s[actor + 'Code'], loginId: s[actor + 'LoginId'] })),
    loyaltyWallet: ['buyer', 'seller'].map(actor => row({ code: s[actor + 'WalletCode'], ownerType: 'CUSTOMER', ownerCode: s[actor + 'Code'], status: 'OPEN' })),
    loyaltyWalletRewardBalance: ['buyer', 'seller'].map(actor => row({ code: actor + '_balance', walletCode: s[actor + 'WalletCode'],
      programCode: s.programCode, rewardTypeCode: s.rewardTypeCode, available: '100.00', reserved: '0.00', revision: 1 })),
    cart: [], commerceOrder: [],
  };
  const calls = [];
  const context = { configuration: { topology: { groups: { backends: ['PLATFORM', 'COMMERCE', 'WASTE', 'LOYALTY'].map((role, i) =>
    ({ role, code: role, server: role, host: '127.0.0.1', protocol: 'http', port: 49000 + i })) } } },
    request: async (role, route, options) => {
      calls.push({ role, route, options });
      assert.equal(options.headers.Authorization, route.endsWith('/wallet-evidence') || route.endsWith('/internal/customer-evidence') ? 'Bearer source-loyalty' :
        route.endsWith('/digital-sales/evidence') ? 'Bearer source-waste' :
        route.endsWith('/internal/ownership/evidence/query') ? 'Bearer source-commerce' : 'Bearer source-inspector');
      if (route.startsWith('/nodics/loyaltyApi/v0/wallets/')) {
        assert.equal(role, 'LOYALTY'); assert.equal(options.method, 'GET'); assert.equal(options.body, undefined);
        const value = records.loyaltyWallet.find(row => row.code === decodeURIComponent(route.split('/').at(-1)));
        if (!value) throw Error('Wallet unavailable');
        return structuredClone(value);
      }
      assert.equal(options.method, 'POST');
      const payload = JSON.parse(options.body);
      if (route === '/nodics/loyaltyApi/v0/wallet-evidence') {
        assert.equal(role, 'LOYALTY');
        assert.deepEqual(Object.keys(payload).sort(), ['customerCode', 'enterpriseCode', 'programCode', 'rewardTypeCode']);
        const wallet = records.loyaltyWallet.find(value => value.ownerType === 'CUSTOMER' && value.ownerCode === payload.customerCode);
        return { contractVersion: 1, tenant: s.tenant, enterpriseCode: s.enterpriseCode, customerCode: payload.customerCode,
          wallet: structuredClone(wallet),
          balance: structuredClone(records.loyaltyWalletRewardBalance.find(value => value.walletCode === wallet?.code)) || null };
      }
      if (route === '/nodics/digitalCore/v0/internal/ownership/evidence/query') {
        assert.equal(role, 'COMMERCE'); assert.equal(payload.kind, 'BINDING');
        return { contractVersion: 1, kind: 'BINDING', binding: structuredClone(records.digitalProductBinding[0]) };
      }
      if (route === '/nodics/profile/v0/internal/customer-evidence') {
        const customer = records.customer.find(value => value.code === payload.identifier);
        return { contractVersion: 1, tenant: s.tenant, enterpriseCode: s.enterpriseCode, customer: structuredClone(customer) };
      }
      if (route === '/nodics/eWaste/v0/internal/digital-sales/evidence') {
        assert.equal(payload.kind, 'LISTING');
        const asset = records.wasteAsset[0], projection = records.wasteAssetMarketplaceProjection[0];
        const policies = { transfer: records.wasteAssetTransferPolicy[0], reward: records.wasteRewardSettlementPolicy[0], carbon: records.wasteCarbonSettlementPolicy[0] };
        return { contractVersion: 1, kind: payload.kind, tenant: s.tenant, enterpriseCode: s.enterpriseCode,
          asset: structuredClone(asset), projection: structuredClone(projection), policies: structuredClone(policies),
          pins: { asset: inspection.checksum(asset), projection: inspection.checksum(projection),
            ...Object.fromEntries(Object.entries(policies).map(([name, value]) => [name, inspection.checksum(value)])) } };
      }
      if (route === '/nodics/wasteApi/v0/waste/installed-data/inspect') {
        const rows = records[payload.resource]; assert.ok(rows, 'Only existing inspection inventory allowed');
        assert.deepEqual(Object.keys(payload).sort(), ['page', 'resource']);
        const mode = payload.resource === 'wasteAsset' ? 'FINGERPRINT' : 'REFERENCE';
        const items = rows.map(row => ({ code: row.code, checksum: inspection.checksum(row),
          ...(mode === 'REFERENCE' ? { record: row } : {}) }));
        const evidence = { tenant: s.tenant, resource: payload.resource, page: 1, limit: 100, total: rows.length,
          items: items.map(({ code, checksum }) => ({ code, checksum })) };
        return { resource: payload.resource, mode, page: 1, limit: 100, total: rows.length, nextPage: null,
          migrationAuthorized: false, pageChecksum: inspection.checksum(evidence), items };
      }
      assert.fail('Only existing capability routes allowed: ' + route);
    } };
  const actors = Object.fromEntries(['buyer', 'seller', 'reviewer', 'inspector'].map(actor => [actor, { Authorization: 'Bearer source-' + actor }]));
  return { s, records, calls, context, actors };
}
test('help is inert without topology, sessions, secrets or runtime', async () => assert.match((await main(['--help'])).usage, /--plan\|--execute/));
test('selection rejects authority/provider overrides, unknown secrets, reused command keys and self-sale', () => {
  const { s } = fixture();
  assert.equal(validateSelection(s), s);
  for (const extra of [{ qualified: true }, { password: 'must-not-leak' }, { targetAuthority: { runtimeRole: 'OTHER' } },
    { refundKey: s.checkoutKey }, { buyerCode: s.sellerCode }, { amount: '0' }, { currency: 'USD' }])
    assert.throws(() => validateSelection({ ...s, ...extra }));
});
test('plan uses only existing canonical capabilities and explicitly cannot qualify private financial evidence', async () => {
  const f = fixture(), p = await planOwnershipAcceptance({ context: f.context, actors: f.actors, selection: f.s });
  assert.equal(p.state, 'BLOCKED_OWNER_EVIDENCE');
  assert.equal(p.productionQualified, false);
  assert.equal(p.executable, false);
  assert.equal(Object.hasOwn(p, 'planDigest'), false);
  assert.equal(p.asset.disclosure, 'FINGERPRINT');
  assert.equal(p.wallets.buyer.identityVerified, true);
  assert.equal(p.wallets.buyer.balanceVerified, false);
  assert.equal(JSON.stringify(p).includes('Bearer'), false);
  assert.ok(f.calls.every(call => !/checkout|refund|wallet-projections/.test(call.route)));
  assert.ok(f.calls.every(call => !/\/nodics\/(wasteCore|loyaltyWallet|loyaltyLedger)\//.test(call.route)));
  const reordered = Object.fromEntries(Object.entries(f.s).reverse());
  assert.deepEqual(await planOwnershipAcceptance({ context: f.context, actors: f.actors, selection: reordered }), p);
});
test('absent or foreign canonical wallet identity refuses without opening wallets or creating a Cart', async () => {
  for (const mutate of [f => { f.records.loyaltyWallet = []; }, f => { f.records.loyaltyWallet[0].ownerCode = 'foreign'; }]) {
    const f = fixture(); mutate(f);
    await assert.rejects(planOwnershipAcceptance({ context: f.context, actors: f.actors, selection: f.s }));
    assert.ok(f.calls.every(call => call.options.method === 'GET'));
  }
});
test('remote runtime and missing original access sessions refuse before owner reads', async () => {
  const f = fixture();
  f.context.configuration.topology.groups.backends[0].host = 'remote.example';
  await assert.rejects(planOwnershipAcceptance({ context: f.context, actors: f.actors, selection: f.s }), /loopback/);
  assert.equal(f.calls.length, 0);
  f.context.configuration.topology.groups.backends[0].host = '127.0.0.1';
  delete f.actors.buyer.Authorization;
  await assert.rejects(planOwnershipAcceptance({ context: f.context, actors: f.actors, selection: f.s }), /sessions/);
  assert.equal(f.calls.length, 0);
});
test('even a supplied reviewed digest cannot authorize execution with unavailable canonical evidence APIs', async () => {
  const f = fixture();
  await assert.rejects(runOwnershipAcceptance({ context: f.context, actors: f.actors,
    selection: { ...f.s, reviewedPlanDigest: 'a'.repeat(64) }, confirmed: true }), error => error.code === 'OWNER_EVIDENCE_API_UNAVAILABLE');
  await assert.rejects(runOwnershipAcceptance({ context: f.context, actors: f.actors,
    selection: { ...f.s, reviewedPlanDigest: 'a'.repeat(64) } }), /confirmation/);
  assert.ok(f.calls.every(call => !/carts|checkouts|refund|wallet-projections/.test(call.route)));
});
test('owner failure diagnostics never echo credentials or private response bodies', async () => {
  const f = fixture();
  f.context.request = async () => { throw new Error('Bearer private-token with private-record-value'); };
  await assert.rejects(planOwnershipAcceptance({ context: f.context, actors: f.actors, selection: f.s }), error => {
    assert.equal(error.code, 'OWNER_REQUEST_UNCONFIRMED');
    assert.equal(error.message.includes('private'), false);
    return true;
  });
});
test('CLI requires qualified private capture before loading selections or calling APIs', async () => {
  await assert.rejects(main(['--plan'], { environment: {} }), /capture/);
  await assert.rejects(main([]), /Select --plan or --execute/);
});
test('CLI plan reports blockers, not a fabricated executable digest or private financial records', async () => {
  const f = fixture();
  const report = await main(['--plan'], { environment: { NODICS_LOCAL_PRIVATE_CAPTURE_QUALIFIED: 'true' },
    context: f.context, actors: f.actors, selection: f.s });
  assert.equal(Object.hasOwn(report, 'planDigest'), false);
  assert.equal(report.state, 'BLOCKED_OWNER_EVIDENCE');
  for (const field of ['buyer', 'seller', 'custody', 'intent', 'Authorization']) assert.equal(Object.hasOwn(report, field), false);
  assert.equal(JSON.stringify(report).includes('100.00'), false);
});
test('route contracts follow actual module switches and generated lowercase aliases for every assumed owner', () => {
  for (const [module, schema] of [['wasteCore', 'wasteAsset'], ['wasteCore', 'wasteAssetMarketplaceProjection'],
    ['loyaltyWallet', 'loyaltyWalletRewardBalance'], ['loyaltyLedger', 'rewardLedgerEntry']])
    assert.equal(schemaReadContract(module, schema).schemaRoute, null);
  for (const [module, schema] of [['digitalCore', 'digitalProductBinding'], ['profile', 'customer'], ['store', 'store'],
    ['product', 'productSearchProjection'], ['order', 'commerceOrder'], ['paymentCore', 'paymentTransactionEntry'], ['cart', 'cart']]) {
    const contract = schemaReadContract(module, schema);
    assert.equal(contract.schemaRoute, '/nodics/' + module + '/v0/' + schema.toLowerCase());
    assert.equal(contract.sourceContractOnly, true);
  }
});
test('without a signed Commerce runtime, binding presence remains unknown rather than inferred from generic HTTP', async () => {
  const f = fixture(); f.records.digitalProductBinding = []; f.records.wasteAsset = [];
  const plan = await planOwnershipAcceptance({ context: f.context, actors: f.actors, selection: f.s });
  assert.equal(plan.bindingPresent, null); assert.equal(plan.asset.present, false);
  assert.ok(plan.blockers.includes('COMMERCE_RUNTIME_EVIDENCE_SESSION_REQUIRED'));
  assert.ok(plan.blockers.includes('WASTE_ASSET_MISSING'));
});
test('canonical evidence paths match their real protected capability router declarations', () => {
  assert.equal(loyaltyRoutes.wallet.key, '/wallets/:walletCode');
  assert.equal(loyaltyRoutes.wallet.method, 'GET');
  assert.equal(loyaltyRoutes.wallet.secured, true);
  assert.ok(loyaltyRoutes.wallet.authTokenTypes.includes('access'));
  assert.equal(loyaltyRoutes.wallet.permission, 'loyalty.wallet.read');
  assert.equal(loyaltyRoutes.ownerWalletProjection.method, 'POST');
  assert.deepEqual(loyaltyRoutes.ownerWalletProjection.authTokenTypes, ['service']);
  assert.equal(wasteRoutes.inspectInstalledData.key, '/waste/installed-data/inspect');
  assert.equal(wasteRoutes.inspectInstalledData.method, 'POST');
  assert.equal(wasteRoutes.inspectInstalledData.secured, true);
  assert.deepEqual(wasteRoutes.inspectInstalledData.accessGroups, ['adminGroup']);
  assert.equal(wasteRoutes.inspectInstalledData.permission, 'waste.audit.read');
  assert.equal(commerceRoutes.queryOwnershipEvidence.key, '/internal/ownership/evidence/query');
  assert.equal(commerceRoutes.queryOwnershipEvidence.permission, 'commerce.digital.own.read');
  assert.deepEqual(commerceRoutes.queryOwnershipEvidence.authTokenTypes, ['service']);
  assert.equal(loyaltyRoutes.walletEvidence.key, '/wallet-evidence');
  assert.equal(loyaltyRoutes.ledgerEvidence.key, '/reward-ledger-evidence');
  assert.equal(profileEvidenceRoute.key, '/internal/customer-evidence');
  assert.equal(profileEvidenceRoute.permission, 'profile.customer.reference.read');
  assert.equal(profileEvidenceRoute.requestPrivacy.sensitive, true);
  assert.equal(wasteEvidenceRoute.key, '/internal/digital-sales/:phase');
  assert.equal(wasteEvidenceRoute.permission, 'waste.asset.sale.transfer');
  assert.equal(wasteEvidenceRoute.requestPrivacy.sensitive, true);
});
test('inspection rejects disclosure widening, corrupt checksums and pagination drift before any business action', async () => {
  for (const mutate of [value => { value.mode = 'REFERENCE'; }, value => { value.items[0].record = { private: true }; },
    value => { value.pageChecksum = '0'.repeat(64); }, value => { value.nextPage = 2; },
    value => { value.migrationAuthorized = true; }]) {
    const f = fixture(), request = f.context.request;
    f.context.request = async (...args) => {
      const result = await request(...args);
      if (args[1] === '/nodics/wasteApi/v0/waste/installed-data/inspect') mutate(result);
      return result;
    };
    await assert.rejects(planOwnershipAcceptance({ context: f.context, actors: f.actors, selection: f.s }));
    assert.ok(f.calls.every(call => !/carts|checkouts|refund|wallet-projections/.test(call.route)));
  }
});
test('supplied original runtime sessions use bounded financial and Digital evidence, never generic schemas or wallet-opening projection', async () => {
  const f = fixture();
  f.actors.loyalty = { Authorization: 'Bearer source-loyalty' }; f.actors.commerce = { Authorization: 'Bearer source-commerce' };
  const p = await planOwnershipAcceptance({ context: f.context, actors: f.actors, selection: f.s });
  assert.equal(p.wallets.buyer.balanceVerified, true); assert.equal(p.wallets.buyer.sufficientExistingFunds, true);
  assert.equal(p.bindingPresent, true); assert.equal(p.executable, false);
  assert.equal(p.blockers.includes('LOYALTY_RUNTIME_EVIDENCE_SESSION_REQUIRED'), false);
  assert.ok(f.calls.every(call => !/\/nodics\/(wasteCore|loyaltyWallet|loyaltyLedger)\//.test(call.route)));
  assert.ok(f.calls.every(call => !/wallet-projections|digitalproductbinding/.test(call.route)));
  f.records.loyaltyWalletRewardBalance = [];
  assert.ok((await planOwnershipAcceptance({ context: f.context, actors: f.actors, selection: f.s })).blockers.includes('LOYALTY_BALANCE_MISSING'));
});

test('all exact owner runtimes produce a real read-only plan path; wrong reviewed digest refuses before Cart and private records stay out of report', async () => {
  const f = fixture();
  for (const actor of ['loyalty', 'commerce', 'waste']) f.actors[actor] = { Authorization: 'Bearer source-' + actor };
  const plan = await planOwnershipAcceptance({ context: f.context, actors: f.actors, selection: f.s });
  assert.equal(plan.state, 'READ_ONLY_PLAN'); assert.equal(plan.executable, true); assert.match(plan.planDigest, /^[a-f0-9]{64}$/);
  assert.equal(plan.nativeSaleRefundProven, false); assert.equal(plan.productionQualified, false);
  assert.equal(JSON.stringify(plan).includes('100.00'), false);
  assert.ok(f.calls.every(value => !/carts|checkouts|refund|wallet-projections|installed-data/.test(value.route)));
  await assert.rejects(runOwnershipAcceptance({ context: f.context, actors: f.actors,
    selection: { ...f.s, reviewedPlanDigest: '0'.repeat(64) }, confirmed: true }), /plan changed/);
  assert.ok(f.calls.every(value => !/carts|checkouts/.test(value.route)));
});

test('full plan rejects foreign Waste evidence, missing balance, changed binding and canonical identity before any business operation', async () => {
  for (const change of [f => { f.records.digitalProductBinding[0].providerReference.assetCode = 'foreign'; },
    f => { f.records.wasteAsset[0].digitalOwnerRef.code = 'other'; }, f => { f.records.customer[0].loginId = 'other'; },
    f => { f.records.loyaltyWalletRewardBalance = []; }]) {
    const f = fixture(); for (const actor of ['loyalty', 'commerce', 'waste']) f.actors[actor] = { Authorization: 'Bearer source-' + actor };
    change(f); await assert.rejects(planOwnershipAcceptance({ context: f.context, actors: f.actors, selection: f.s }));
    assert.ok(f.calls.every(value => !/carts|checkouts/.test(value.route)));
  }
});

/** Injected wire responses exercise the complete helper only; they are not native persistence, capture or policy evidence. */
function journeyFixture() {
  const f = fixture(), s = f.s, originalRequest = f.context.request;
  for (const actor of ['loyalty', 'commerce', 'waste']) f.actors[actor] = { Authorization: 'Bearer source-' + actor };
  const state = { purchased: false, refunded: false, checkouts: 0, refunds: 0 }, calls = [];
  const row = value => ({ tenant: s.tenant, enterpriseCode: s.enterpriseCode, active: true, ...value });
  const transferCode = 'TRANSFER_' + 'A'.repeat(32), entryCode = s.cartCode + '|asset|sku', refundCode = 'ORDER_REFUND_SOURCE';
  const buyerDebit = row({ code: 'buyer-debit', walletCode: s.buyerWalletCode, entryType: 'CAPTURE', amount: s.amount,
    programCode: s.programCode, rewardTypeCode: s.rewardTypeCode, sourceType: 'PAYMENT', sourceCode: s.orderCode,
    targetType: 'ORDER', targetCode: s.orderCode, reservationCode: 'reservation', idempotencyKey: s.checkoutKey + ':payment:capture' });
  const sellerEarning = row({ code: 'seller-credit', walletCode: s.sellerWalletCode, entryType: 'EARN', amount: s.amount,
    programCode: s.programCode, rewardTypeCode: s.rewardTypeCode, sourceType: 'WASTE_ASSET_SALE', sourceCode: transferCode,
    idempotencyKey: transferCode + ':sale-proceeds' });
  const sellerReversal = row({ ...sellerEarning, code: 'seller-reversal', entryType: 'REVERSE', sourceType: 'ORDER_REFUND', sourceCode: s.orderCode,
    reversalOfEntryCode: sellerEarning.code, idempotencyKey: refundCode + ':' + sellerEarning.code });
  const buyerReversal = row({ ...buyerDebit, code: 'buyer-reversal', entryType: 'REVERSE', reversalOfEntryCode: buyerDebit.code, idempotencyKey: 'refund-payment-command' });
  const capture = row({ code: s.orderCode + ':capture', status: 'CAPTURED', ownerId: s.buyerLoginId, orderCode: s.orderCode,
    methodCode: 'LOYALTY_REWARD', providerCode: 'loyalty-reward-points', providerReference: buyerDebit.code,
    idempotencyKey: s.checkoutKey + ':payment:capture', currency: s.currency, totalAmount: s.amount, evidence: { operation: 'CAPTURE' } });
  const authorization = row({ ...capture, code: s.orderCode + ':authorization', status: 'AUTHORIZED', providerReference: 'reservation',
    idempotencyKey: s.checkoutKey + ':payment', evidence: { operation: 'AUTHORIZE' } });
  const payment = row({ code: 'refund-payment', status: 'REFUND_SUCCEEDED', ownerId: s.buyerLoginId, orderCode: s.orderCode,
    currency: s.currency, totalAmount: s.amount, idempotencyKey: buyerReversal.idempotencyKey,
    evidence: { operation: 'REFUND', providerReference: buyerReversal.code,
      refundIntent: { captureCode: capture.code, refundCode, approvalCommandKey: s.refundKey } } });
  const sale = row({ code: transferCode, transferStatus: 'COMPLETED', rewardSettlementRefs: [{ code: sellerEarning.code }], carbonSettlementRefs: [],
    metadata: { digitalSale: { capture: { ledgerCode: buyerDebit.code } } } });
  const reversal = row({ code: 'reversal', transferType: 'REVERSAL', transferStatus: 'COMPLETED', triggerRef: { code: transferCode },
    metadata: { digitalRefund: { command: { refundCode }, sellerReversalRef: { code: sellerReversal.code }, paymentRef: { code: payment.code } } } });
  const item = () => row({ code: 'entitlement', orderCode: s.orderCode, orderEntryCode: entryCode, ownerId: s.buyerLoginId,
    status: state.refunded ? 'REVOKED' : 'ACTIVE', providerOwner: 'wasteCore', providerCode: transferCode, digitalDeliveryType: 'DIGITAL_OWNERSHIP',
    evidence: { assetCode: s.assetCode, bindingCode: s.bindingCode, physicalCustodyTransferred: false } });
  const order = () => ({ order: row({ code: s.orderCode, ownerId: s.buyerLoginId, totalAmount: s.amount,
    evidence: { storeCode: s.storeCode, paymentReference: authorization.providerReference } }),
    entries: [row({ code: s.orderCode + ':' + entryCode, productCode: s.productCode, sku: s.sku, quantity: 1 })] });
  const asset = () => ({ ...structuredClone(f.records.wasteAsset[0]), assetStatus: state.refunded ? 'OWNED' : 'SOLD',
    ownerRef: { module: 'profile', schema: 'customer', code: state.refunded ? s.sellerCode : s.buyerCode },
    digitalOwnerRef: { module: 'profile', schema: 'customer', code: state.refunded ? s.sellerCode : s.buyerCode },
    metadata: { lastTransferCode: state.refunded ? reversal.code : sale.code } });
  const caseRow = { code: 'case', orderCode: s.orderCode, status: 'SUBMITTED', revision: 1 };
  const balance = () => {
    for (const actor of ['buyer', 'seller']) {
      const record = f.records.loyaltyWalletRewardBalance.find(v => v.walletCode === s[actor + 'WalletCode']);
      record.available = state.refunded || !state.purchased ? '100.00' : actor === 'buyer' ? '88.00' : '112.00';
    }
  };
  f.context.request = async (role, route, options) => {
    calls.push({ role, route, options }); const body = options.body ? JSON.parse(options.body) : {};
    if (route === '/nodics/loyaltyApi/v0/reward-ledger-evidence') {
      const entries = [buyerDebit, sellerEarning, ...(state.refunded ? [buyerReversal, sellerReversal] : [])].filter(v =>
        (body.entryCode ? v.code === body.entryCode : v.reversalOfEntryCode === body.reversalOfEntryCode) &&
        v.sourceType === body.sourceType && v.sourceCode === body.sourceCode);
      return { contractVersion: 1, tenant: s.tenant, enterpriseCode: s.enterpriseCode, customerCode: body.customerCode,
        wallet: f.records.loyaltyWallet.find(v => v.ownerCode === body.customerCode), entries: structuredClone(entries) };
    }
    if (route.endsWith('/ownership/evidence/query') && body.kind !== 'BINDING') {
      assert.equal(body.entryCode, entryCode); assert.equal(body.providerCode, transferCode);
      const value = { contractVersion: 1, kind: body.kind, orders: [order().order], entries: order().entries, payments: [capture, authorization], checkpoints: [] };
      if (body.kind === 'REFUND') Object.assign(value, { entitlement: item(), refunds: [{ evidence: { caseCode: caseRow.code } }], cases: [caseRow], transactions: [payment] });
      return structuredClone(value);
    }
    if (route.endsWith('/digital-sales/evidence') && body.kind !== 'LISTING') {
      assert.equal(body.code, transferCode); assert.equal(body.entryCode, entryCode);
      return { contractVersion: 1, kind: body.kind, tenant: s.tenant, enterpriseCode: s.enterpriseCode,
        asset: asset(), projection: f.records.wasteAssetMarketplaceProjection[0], sale: structuredClone(sale),
        ...(state.refunded ? { reversal: structuredClone(reversal) } : {}), pins: { asset: inspection.checksum(asset()), sale: inspection.checksum(sale) } };
    }
    if (route === '/nodics/cart/v0/carts') return { cart: { code: s.cartCode, revision: 1 }, entries: [] };
    if (route.endsWith('/entries')) return { cart: { code: s.cartCode, revision: 1 },
      entries: [{ code: entryCode, productCode: s.productCode, sku: s.sku, quantity: 1 }], calculation: { totalAmount: s.amount, currency: s.currency }, validation: { status: 'VALID' } };
    if (route === '/nodics/checkoutCore/v0/checkouts/place') { state.checkouts++; state.purchased = true; balance(); return { status: 'COMPLETED' }; }
    if (route === '/nodics/digitalCore/v0/entitlements') return { entitlements: [item()] };
    if (route === '/nodics/order/v0/orders/' + s.orderCode) return order();
    if (route.endsWith('/disputes')) return caseRow;
    if (route.endsWith('/refund-preview')) return { eligible: true, provider: 'digitalCore', domain: { assetCode: s.assetCode },
      captureCode: capture.code, amount: s.amount, currency: s.currency, previewToken: 'source-preview' };
    if (route.endsWith('/refund')) { state.refunds++; state.refunded = true; balance(); return { status: 'COMPLETED', amount: s.amount, refundCode,
      steps: ['PREPARE', 'SETTLE', 'PAYMENT', 'COMPLETE'] }; }
    return originalRequest(role, route, options);
  };
  return { ...f, state, journeyCalls: calls };
}

test('complete helper source fixture traverses only canonical purchase/evidence/review/refund APIs and verifies both original replays', async () => {
  const f = journeyFixture(), plan = await planOwnershipAcceptance({ context: f.context, actors: f.actors, selection: f.s });
  const result = await runOwnershipAcceptance({ context: f.context, actors: f.actors, selection: { ...f.s, reviewedPlanDigest: plan.planDigest }, confirmed: true });
  assert.equal(result.state, 'PASSED'); assert.equal(result.originalCheckoutReplayVerified, true); assert.equal(result.originalRefundReplayVerified, true);
  assert.equal(result.originalBalancesRestored, true); assert.equal(result.productionQualified, false);
  assert.equal(f.state.checkouts, 2); assert.equal(f.state.refunds, 2);
  assert.ok(f.journeyCalls.every(v => !/wallet-projections|\/nodics\/(wasteCore|loyaltyWallet|loyaltyLedger)\//.test(v.route)));
  assert.ok(f.journeyCalls.some(v => v.route.endsWith('/reward-ledger-evidence')));
  assert.equal(JSON.stringify(result).includes('Bearer'), false);
});

test('helper refuses changed original capture and a duplicate checkout balance movement instead of proceeding to refund approval', async () => {
  for (const fault of ['capture', 'replay-balance']) {
    const f = journeyFixture(), originalRequest = f.context.request;
    const plan = await planOwnershipAcceptance({ context: f.context, actors: f.actors, selection: f.s });
    f.context.request = async (...args) => {
      const result = await originalRequest(...args), route = args[1], body = args[2].body ? JSON.parse(args[2].body) : {};
      if (fault === 'capture' && route.endsWith('/ownership/evidence/query') && body.kind === 'PURCHASE') result.payments[0].status = 'DECLINED';
      if (fault === 'replay-balance' && route.endsWith('/wallet-evidence') && f.state.checkouts === 2) result.balance.available = '1.00';
      return result;
    };
    await assert.rejects(runOwnershipAcceptance({ context: f.context, actors: f.actors,
      selection: { ...f.s, reviewedPlanDigest: plan.planDigest }, confirmed: true }));
    assert.equal(f.state.refunds, 0);
  }
});
