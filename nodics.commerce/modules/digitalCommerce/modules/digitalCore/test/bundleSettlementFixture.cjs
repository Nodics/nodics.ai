/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
"use strict";
/** @module digitalCore/test/digitalBundleSettlement @description Real bundle persistence, Payment model and Loyalty API/earning integration with isolated generated storage. @owner digitalCore @layer test */
const test = require("node:test"), assert = require("node:assert/strict");
const bundles = require("../src/service/defaultDigitalBundleService");
const settlement = require("../src/service/defaultDigitalBundleSettlementService");
const persistence = require("../src/service/defaultDigitalCommerceEntitlementService");
const authority = require("../src/service/defaultDigitalBundleAuthorityService");
const ownership = require("../src/service/defaultDigitalCommerceOwnershipService");
const digitalCheckout = require("../src/service/defaultDigitalCommerceCheckoutService");
const exact = require("../../../../baseCommerce/modules/pricing/src/service/defaultExactAmountService");
const payment = require("../../../../payment/modules/paymentCore/src/service/defaultPaymentExecutionService");
const loyaltyFixture = require("../../../../../../nodics.waste/modules/wasteReward/test/loyaltyHandoffFixture");
const defaults = require("../config/properties").digitalCore;
const paymentDefaults = require("../../../../payment/modules/paymentMethods/modules/loyaltyRewardPayment/config/properties");
const clone = value => structuredClone(value);
const owner = (code, schema = "customer") => ({ module: "profile", schema, code });

async function fixture(t, enterpriseSeller = false, options = {}) {
  const before = Object.fromEntries(["CONFIG", "SERVICE", "NODICS", "UTILS", "FACADE", "CLASSES"].map(k => [k, global[k]]));
  t.after(() => Object.assign(global, before));
  const config = clone(defaults), paymentConfig = clone(paymentDefaults), rows = {}, effects = [], holds = new Map(), receipts = new Map();
  let failedComponent, loseFinalization = false;
  config.bundles.ownerAuthorityService = "Authority";
  config.bundles.componentProviders = { CERTIFICATE: "Component", REALIZED_CARBON: "Component" };
  global.CONFIG = { get: key => key === "digitalCore" ? config : paymentConfig[key] };
  global.UTILS = { createModelName: name => name };
  global.CLASSES = { NodicsError: class extends Error { constructor(code, message) { super(message); this.code = code; } } };
  global.NODICS = { getModels: () => Object.fromEntries(["digitalBundleManifest", "digitalBundleOperation"].map(name =>
    [name, { primaryKey: "code", rawSchema: {}, compareAndSetItem() {} }])) };
  global.SERVICE = { DefaultDigitalBundleService: bundles, DefaultDigitalBundleSettlementService: settlement,
    DefaultDigitalBundleAuthorityService: authority, DefaultDigitalCommerceEntitlementService: persistence,
    DefaultDigitalCommerceOwnershipService: ownership, DefaultExactAmountService: exact,
    DefaultModelConcurrencyService: { getField: () => "revision" },
    DefaultDatabaseModelHandlerService: { inspectIndexes: async () => ({ versioned: false, indexes: [{ unique: true, key: { code: 1 } }] }) },
    Authority: { authorize: async (r, input) => {
      if (r.actor !== input.ownerRef.code) throw new Error("Profile denied owner");
      return { tenant: r.tenant, authorized: true, ownerRef: input.ownerRef, actorRef: owner(r.actor) };
    } },
  };
  for (const name of ["DigitalBundleManifest", "DigitalBundleOperation", "CartEntry", "CommerceOrder", "CommerceOrderEntry",
    "PaymentTransactionEntry", "DigitalEntitlement", "DigitalDelivery", "CheckoutCheckpoint"]) {
    rows[name] = [];
    const matches = (row, query) => Object.entries(query || {}).every(([k, v]) =>
      JSON.stringify(k.split(".").reduce((x, key) => x?.[key], row)) === JSON.stringify(v));
    SERVICE["Default" + name + "Service"] = {
      get: async r => { const selected = rows[name].filter(row => matches(row, r.query));
        return { code: "SUC_UNIT", count: selected.length, result: clone(selected.slice(0, r.searchOptions?.pageSize || 100)) }; },
      save: async r => {
        if (rows[name].some(row => row.code === r.model.code)) throw Error("duplicate");
        rows[name].push(clone({ active: true, ...r.model })); return { code: "SUC_UNIT", result: clone(r.model) };
      },
      update: async r => {
        const row = rows[name].find(row => matches(row, r.query));
        if (row) Object.assign(row, clone(r.model), { revision: r.query.revision + 1 });
        return { code: "SUC_UNIT", result: { acknowledged: true, matchedCount: row ? 1 : 0 } };
      },
    };
  }
  const phase = (name, status) => async (_, input) => {
    const key = input.operationKey + ":" + name;
    if (receipts.has(key)) return clone(receipts.get(key));
    if (name === "transfer" && input.component.reference.code === failedComponent) throw Error("component uncertain");
    if (name === "finalize") {
      const listing = rows.DigitalBundleOperation.find(row => row.code + ":0" === input.operationKey || row.code + ":1" === input.operationKey);
      assert.ok(Object.values(listing.checkpoints).every(c => c.transfer), "every transfer is durably saved before any unlock");
    }
    holds.set(input.component.reference.code, status); effects.push(name + ":" + input.component.reference.code);
    const receipt = { status, operationKey: input.operationKey, reference: input.component.reference,
      quantity: input.component.quantity, receiptCode: key };
    receipts.set(key, clone(receipt));
    if (name === "finalize" && loseFinalization) { loseFinalization = false; throw Error("finalization acknowledgement lost"); }
    return receipt;
  };
  SERVICE.Component = { retainsTransferLock: true,
    inspect: async (_, input) => ({ available: true, ownerRef: input.ownerRef, revision: input.component.expectedRevision }),
    reserve: phase("reserve", "RESERVED"), transfer: phase("transfer", "TRANSFERRED"),
    finalize: phase("finalize", "COMPLETED"), release: phase("release", "RELEASED") };
  const seller = owner("seller", enterpriseSeller ? "enterprise" : "customer"), buyer = owner("buyer", options.enterpriseBuyer ? "enterprise" : "customer");
  options.installComponents?.({ rows, effects, holds });
  const context = who => ({ tenant: "T", enterpriseCode: "market", actor: who.code, ownerId: who.code,
    ownerRef: who, actorRef: owner(who.code), participantEnterpriseCode: "market",
    authData: { tenant: "T", principalType: who.schema === "customer" ? "customer" : "human", enterpriseCode: "market" } });
  const manifest = await bundles.create(context(seller), { ownerRef: seller, idempotencyKey: "manifest",
    components: [{ kind: "CERTIFICATE", reference: { module: "wasteCore", schema: "wasteAsset", code: "a" }, expectedRevision: 1, quantity: "1" },
      { kind: "REALIZED_CARBON", reference: { module: "wasteCarbon", schema: "wasteCarbonLot", code: "b" }, expectedRevision: 1, quantity: "1.25", unitOfMeasure: "tCO2e" }] });
  let listing = await bundles.reserve(context(seller), { manifestCode: manifest.code, manifestRevision: manifest.revision,
    purpose: "LISTING", idempotencyKey: "listing" });
  const terms = { saleMode: "FIXED", storeCode: "store", amount: "12.50", currency: "POINTS", startsAt: null, endsAt: null,
    reward: { programCode: "selected-program", rewardTypeCode: "selected-reward", scale: 2 } };
  listing = await bundles.update(context(seller), listing, { evidence: { ...listing.evidence, listing: {
    publicationCode: listing.code, phase: "PUBLISHED", terms, termsDigest: bundles.digest(terms),
    product: { productCode: "product", variantCode: "variant", sku: "sku" },
    publication: { productCode: "product", confirmed: true, status: "ONLINE", targetVersion: "version", receiptCode: "actual-unit-publication" } } } });
  SERVICE.DefaultDigitalCommerceAuctionService = {
    read: async (r, code) => bundles.read(r, "DefaultDigitalBundleOperationService", code),
    held: async () => manifest, product: async () => clone(listing.evidence.listing.publication), published: () => {}, price: async () => ({}),
  };
  if (options.manifestEnterpriseCode) {
    rows.DigitalBundleManifest[0].enterpriseCode = options.manifestEnterpriseCode;
    rows.DigitalBundleOperation[0].evidence.manifestEnterpriseCode = options.manifestEnterpriseCode;
  }
  const entry = { code: "entry", productCode: "product", sku: "sku", quantity: "1", cartCode: "cart", status: "ACTIVE" };
  const r = { ...context(buyer), idempotencyKey: "checkout", storeCode: "store", locale: "en",
    payload: { orderCode: "order", cartCode: "cart", paymentMethod: "LOYALTY_REWARD", programCode: terms.reward.programCode,
      rewardTypeCode: terms.reward.rewardTypeCode, rewardCurrency: "POINTS", rewardAmount: "12.50" } };
  rows.CartEntry.push({ ...entry, tenant: "T", enterpriseCode: "market", ownerId: "buyer", active: true });
  const projection = { publicationVersion: "version", status: "CURRENT", tenant: "T", enterpriseCode: "market", storeCode: "store", locale: "en", productCode: "product",
    payload: { variantCodes: ['variant'], localizedAttributes: { productType: 'DIGITAL', inventoryStrategy: 'DIGITAL_COMMERCE', digitalDeliveryType: 'DIGITAL_OWNERSHIP', bundleRef: {
    module: "digitalCore", schema: "digitalBundleManifest", code: manifest.code, revision: manifest.revision, digest: manifest.digest } },
    variantSkuMap: { variant: "sku" } } };
  const available = await settlement.availability({ ...r, productCode: "product", sku: "sku" }, projection);
  SERVICE.DefaultDigitalCommerceCheckoutService = digitalCheckout;
  SERVICE.DefaultProductDiscoveryService = { query: r => r, searchPinned: async () => [projection] };
  SERVICE.DefaultProductSearchEnrichmentService = { retainedProjections: async () => [projection] };
  const loyalty = loyaltyFixture.install({ allowProjection: true });
  const seedCapture = async unit => {
    const wallet = await settlement.wallet(r, buyer);
    loyalty.rows.RewardLedgerEntry.push({ code: "capture-ledger", walletCode: wallet.wallet.code, entryType: "CAPTURE",
      programCode: terms.reward.programCode, rewardTypeCode: terms.reward.rewardTypeCode, amount: "12.50",
      idempotencyKey: "checkout:payment:capture", sourceType: "PAYMENT", sourceCode: "order", targetType: "ORDER", targetCode: "order",
      reservationCode: "buyer-reservation", active: true });
    rows.CommerceOrder.push({ code: "order", tenant: "T", enterpriseCode: "market", ownerId: "buyer", cartCode: "cart",
      idempotencyKey: "checkout", status: "PLACED", currency: "POINTS", totalAmount: "12.50", active: true,
      evidence: { storeCode: "store", ownerRef: buyer } });
    rows.CommerceOrderEntry.push({ ...entry, code: "order:entry", orderCode: "order", tenant: "T", enterpriseCode: "market", ownerId: "buyer",
      active: true, evidence: { digitalReservationCodes: [unit.code] } });
    for (const operation of ["AUTHORIZE", "CAPTURE"]) {
      const model = payment.transactionModel({ tenant: "T", enterpriseCode: "market", ownerId: "buyer", orderCode: "order", cartCode: "cart",
        methodCode: "LOYALTY_REWARD", operation, amount: "12.50", currency: "POINTS", walletCode: wallet.wallet.code,
        programCode: terms.reward.programCode, rewardTypeCode: terms.reward.rewardTypeCode,
        idempotencyKey: operation === "CAPTURE" ? "checkout:payment:capture" : "checkout:payment" },
      { code: paymentConfig.loyaltyRewardPayment.providerCode }, { reference: operation === "CAPTURE" ? "capture-ledger" : "buyer-reservation",
        status: operation === "CAPTURE" ? "CAPTURED" : "AUTHORIZED" });
      rows.PaymentTransactionEntry.push({ ...clone(model), active: true, code: operation === "CAPTURE" ? "order:capture" : "order:authorization" });
    }
  };
  return { r, rows, config, paymentConfig, loyalty, context, seller, buyer, manifest, listing, projection, available, entry, seedCapture, effects, holds,
    reserve: () => settlement.reserve(r, entry, available), failTransfer: code => { failedComponent = code; },
    loseFinalize: () => { loseFinalization = true; } };
}

module.exports = fixture;
