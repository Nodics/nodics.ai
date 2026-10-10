/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";
/** @module eWaste/test/eWasteDigitalOwnershipBridge @description Exercises real DigitalCore/eWaste/Waste owners through isolated generated-service and secured module-invocation boundaries; no native/provider qualification. @layer test @owner eWaste */
const test = require("node:test"), assert = require("node:assert/strict"), path = require("node:path");
const root = path.resolve(__dirname, "../../../../../..");
const digitalRoot = path.join(root, "nodics.commerce/modules/digitalCommerce/modules/digitalCore/src/service");
const wasteRoot = path.join(root, "nodics.waste/modules/wasteCore/src/service");
const digital = require(path.join(digitalRoot, "defaultDigitalCommerceCheckoutService"));
const ownership = require(path.join(digitalRoot, "defaultDigitalCommerceOwnershipService"));
const entitlement = require(path.join(digitalRoot, "defaultDigitalCommerceEntitlementService"));
const waste = require(path.join(wasteRoot, "defaultWasteAssetTransferOperationService"));
const persistence = require(path.join(wasteRoot, "defaultWastePersistenceService"));
const reversal = require(path.join(wasteRoot, "defaultWasteAssetReversalOperationService"));
const domain = require("../src/service/defaultEWasteDigitalSaleService");
const saleEvidence = require("../src/service/defaultEWasteDigitalSaleEvidenceService");
const controller = require("../src/controller/defaultEWasteDigitalSaleController");
const orderReversal = require("../src/service/defaultEWasteOrderReversalService");
const paymentExecution = require(path.join(root, "nodics.commerce/modules/payment/modules/paymentCore/src/service/defaultPaymentExecutionService"));
const refund = require(path.join(digitalRoot, "defaultDigitalCommerceRefundService"));
const orderRefund = require(path.join(root, "nodics.commerce/modules/checkout/modules/order/src/service/defaultOrderRefundRecoveryService"));
const loyalty = require(path.join(root, "nodics.loyalty/modules/loyaltyWallet/src/service/defaultLoyaltyRewardOperationService"));
const loyaltyEvidence = require(path.join(root, "nodics.loyalty/modules/loyaltyWallet/src/service/defaultLoyaltyReadEvidenceService"));
const runtimePrincipal = require(path.join(root, "nodics.foundation/modules/nAuth/src/service/identity/defaultServiceTokenService"));
const commerceEvidenceRoutes = require(path.join(root, "nodics.commerce/modules/digitalCommerce/modules/digitalCore/src/router/routers")).digitalCore.ownershipEvidence;
const paymentRefund = require(path.join(root, "nodics.commerce/modules/payment/modules/paymentCore/src/service/defaultPaymentRefundExecutionService"));
const paymentProvider = require(path.join(root, "nodics.commerce/modules/payment/modules/paymentProviders/modules/loyaltyRewardProvider/src/service/defaultLoyaltyRewardPaymentProviderService"));

/** Fixed generated-query double, not an alternate persistence implementation for production. */
function matches(row, query) {
  return Object.entries(query).every(([key, value]) => {
    if (key === "$or") return value.some(branch => matches(row, branch));
    const actual = key.split(".").reduce((item, part) => item?.[part], row);
    return actual === value;
  });
}
/** Builds independent unapproved test terms and actual owner orchestration with bounded injected storage/transport. */
function fixture() {
  const ref = code => ({ module: "profile", schema: "customer", code });
  const request = { tenant: "t", enterpriseCode: "e", storeCode: "s", locale: "en", ownerId: "buyer-login",
    idempotencyKey: "checkout-key", correlationId: "correlation", authData: { principalType: "customer" }, payload: { orderCode: "order", cartCode: "cart" } };
  const serviceAuth = { tokenType: "service", principalType: "service", principalId: "commerce-owner", serviceId: "commerce-owner", tenant: "t", enterpriseCode: "e", entCode: "e",
    runtimeInstanceId: "instance", runtimeScope: { instanceCode: "instance", projectCode: "project", environmentCode: "local", serverCode: "commerce", assignmentCode: "grant" },
    modules: ["loyaltyApi", "eWaste"], permissions: ["loyalty.wallet.read", "waste.asset.sale.transfer", "waste.asset.marketplace.project"], userGroups: [], groups: [] };
  const projection = { code: "product-projection", tenant: "t", enterpriseCode: "e", storeCode: "s", locale: "en", productCode: "product", status: "STALE",
    sourceHash: "retained-source", publicationVersion: "publication-1", payload: { variantCodes: ["variant"], variantSkuMap: { variant: "SKU" },
      localizedAttributes: { productType: "DIGITAL", inventoryStrategy: "DIGITAL_COMMERCE", digitalDeliveryType: "DIGITAL_OWNERSHIP", assetCode: "asset" } } };
  const binding = { code: "binding", tenant: "t", enterpriseCode: "e", active: true, status: "ACTIVE", revision: 1, productCode: "product", variantCode: "variant", sku: "SKU",
    digitalDeliveryType: "DIGITAL_OWNERSHIP", inventoryStrategy: "DIGITAL_COMMERCE", providerOwner: "wasteCore",
    providerReference: { assetCode: "asset", projectionCode: "waste-projection", sellerRef: ref("seller"), storeCode: "s",
      transferPolicyCode: "transfer", rewardSettlementPolicyCode: "reward", carbonSettlementPolicyCode: "carbon" },
    evidence: { retainedProducts: [{ locale: "en", code: projection.code, sourceHash: projection.sourceHash, publicationVersion: projection.publicationVersion }] } };
  const rows = {
    wasteAsset: [{ code: "asset", tenant: "t", active: true, revision: 1, assetStatus: "LISTED", ownerRef: ref("seller"), digitalOwnerRef: ref("seller"),
      physicalOwnerRef: ref("custodian"), custodyStatus: "RECEIVED_BY_OPERATOR", metadata: {},
      marketplaceProjectionRef: { module: "wasteCore", schema: "wasteAssetMarketplaceProjection", code: "waste-projection" } }],
    wasteAssetOwnershipEvent: [],
    wasteAssetMarketplaceProjection: [{ code: "waste-projection", tenant: "t", active: true, assetCode: "asset", ownerRef: ref("seller"), projectionStatus: "LISTED",
      commerceProductRef: { module: "product", schema: "product", code: "product" }, metadata: { storeCode: "s", sku: "SKU" },
      transferPolicyCode: "transfer", rewardSettlementPolicyCode: "reward", carbonSettlementPolicyCode: "carbon" }],
    wasteAssetTransferPolicy: [{ code: "transfer", tenant: "t", active: true, status: "ACTIVE", revision: 1, transferType: "SELL", ownershipTransferMode: "TRANSFER_TO_COUNTERPARTY",
      completionAssetStatus: "SOLD", cancellationAssetStatus: "LISTED", allowSelfTransfer: false, lockRequired: true, carbonTransferMode: "NONE", rewardTransferMode: "RETAIN_ORIGINAL_OWNER",
      metadata: { digitalOwnership: { reservationSeconds: 37 } } }],
    wasteRewardSettlementPolicy: [{ code: "reward", tenant: "t", active: true, status: "ACTIVE", revision: 1, triggerType: "SALE", settlementMode: "POLICY_RESOLVED",
      walletCurrencyCode: "POINTS", metadata: { digitalOwnership: { version: 1, proceeds: "CAPTURED_TOTAL", payee: "CURRENT_SELLER", programCode: "program", rewardTypeCode: "points", scale: 2 } } }],
    wasteCarbonSettlementPolicy: [{ code: "carbon", tenant: "t", active: true, status: "ACTIVE", revision: 1, triggerType: "SALE", settlementMode: "NONE" }],
    digitalProductBinding: [binding], productSearchProjection: [projection],
    store: [{ code: "s", tenant: "t", active: true, status: "ACTIVE", revision: 1, enterpriseRef: { moduleName: "profile", schemaName: "enterprise", code: "e" } }],
    customer: [{ code: "buyer", loginId: "buyer-login", tenant: "t", active: true }, { code: "other-buyer", loginId: "other-login", tenant: "t", active: true },
      { code: "seller", loginId: "seller-login", tenant: "t", active: true }],
    commerceOrder: [], commerceOrderEntry: [], orderLifecycleRequest: [], paymentTransaction: [], paymentTransactionEntry: [], checkoutCheckpoint: [], digitalEntitlement: [], digitalDelivery: [], digitalReversal: [],
    loyaltyWalletRewardBalance: [],
    rewardLedgerEntry: [], loyaltyWallet: [{ code: "buyer-wallet", tenant: "t", ownerType: "CUSTOMER", ownerCode: "buyer", status: "OPEN" },
      { code: "seller-wallet", tenant: "t", ownerType: "CUSTOMER", ownerCode: "seller", status: "OPEN" }],
  };
  const counters = { acquisitions: 0, earnings: 0, writes: 0, transfers: 0, genericHttpReads: 0 };
  const failures = {};
  const repositories = {};
  for (const schema of Object.keys(rows)) repositories[schema] = {
    get: async r => {
      const result = structuredClone(rows[schema].filter(row => matches(row, r.query || {})));
      return { code: "SUC_GET", result, count: result.length };
    },
    save: async r => {
      counters.writes++;
      if (failures[schema + ":save"] === "before") { delete failures[schema + ":save"]; throw new Error("save unavailable"); }
      if (r.options?.insertOnly && rows[schema].some(row => row.code === r.model.code)) throw new Error("duplicate");
      assert.equal(rows[schema].some(row => row.code === r.model.code), false);
      rows[schema].push(structuredClone({ tenant: r.tenant, ...r.model }));
      if (failures[schema + ":save"] === "after") { delete failures[schema + ":save"]; throw new Error("save acknowledgement lost"); }
      return { code: "SUC_SAVE", result: structuredClone(r.model) };
    },
    update: async r => {
      counters.writes++;
      if (failures.refundCompletion && schema === "wasteAssetOwnershipEvent" && r.model.transferStatus === "COMPLETED" &&
          rows[schema].some(row => row.code === r.query.code && row.transferType === "REVERSAL")) {
        delete failures.refundCompletion; throw Error("refund completion unavailable");
      }
      if (failures.refundCleanup && schema === "wasteAsset" && r.model.assetStatus === "OWNED") {
        delete failures.refundCleanup; throw Error("refund cleanup unavailable");
      }
      if (failures[schema + ":update"] === "before") { delete failures[schema + ":update"]; throw new Error("update unavailable"); }
      const index = rows[schema].findIndex(row => matches(row, r.query));
      if (index < 0) return { code: "SUC_UPDATE", result: { acknowledged: true, matchedCount: 0, modifiedCount: 0 } };
      if (schema === "wasteAsset" && r.model.ownerRef) counters.transfers++;
      rows[schema][index] = { ...rows[schema][index], ...structuredClone(r.model),
        revision: schema === "wasteAsset" ? rows[schema][index].revision + 1 : r.model.revision };
      if (failures[schema + ":update"] === "after") { delete failures[schema + ":update"]; throw new Error("update acknowledgement lost"); }
      return { code: "SUC_UPDATE", result: { acknowledged: true, matchedCount: 1, modifiedCount: 1 } };
    },
  };
  const config = { digitalCore: { maximumCouponUnitsPerCheckout: 100, digitalOwnership: { enabled: true, qualified: true,
    owner: { moduleName: "eWaste", connectionName: "waste", targetAuthority: { runtimeRole: "WASTE" }, apiPrefix: "/internal/digital-sales" } } },
    eWaste: { marketplace: { digitalOwnership: { enabled: true, qualified: true, allowedServicePrincipals: ["commerce-owner"],
      customerEvidenceApiName: "/internal/source-test/customer-evidence",
      targets: { commerce: { runtimeRole: "COMMERCE" }, loyalty: { runtimeRole: "LOYALTY" }, profile: { runtimeRole: "PLATFORM" } } } } } };
  global.CONFIG = { get: key => config[key] };
  global.UTILS = { createModelName: name => name, normalizeString: value => String(value ?? "").trim() };
  global.NODICS = { getModels: () => Object.fromEntries(["wasteAsset", "wasteAssetOwnershipEvent"].map(name => [name,
    { primaryKey: "code", versioned: false, compareAndSetItem: () => {}, rawSchema: { managed: name === "wasteAsset" } }])) };
  global.SERVICE = {
    DefaultWastePersistenceService: persistence, DefaultWasteAssetTransferOperationService: waste,
    DefaultDigitalCommerceCheckoutService: digital, DefaultDigitalCommerceOwnershipService: ownership,
    DefaultDigitalCommerceEntitlementService: entitlement, DefaultEWasteDigitalSaleService: domain,
    DefaultEWasteDigitalSaleEvidenceService: saleEvidence,
    DefaultEWasteOrderReversalService: orderReversal, DefaultWasteAssetReversalOperationService: reversal,
    DefaultDigitalCommerceRefundService: refund,
    DefaultLoyaltyReadEvidenceService: loyaltyEvidence, DefaultLoyaltyRewardOperationService: loyalty, DefaultServiceTokenService: runtimePrincipal,
    DefaultLoggerService: { hasPrivateCaptureProtection: () => true },
    DefaultModelConcurrencyService: { getField: schema => schema.managed ? "revision" : undefined },
    DefaultDatabaseModelHandlerService: { inspectIndexes: async () => ({ versioned: false, indexes: [{ unique: true, key: { code: 1 } }] }) },
    DefaultSecuredRequestPipelineService: { getGrantedPermissions: () => ["waste.asset.sale.transfer"], isPermissionGranted: () => true },
    DefaultProductDiscoveryService: { query: () => ({}), searchPinned: async () => [projection] },
    DefaultProductSearchEnrichmentService: { retainedProjections: async () => [projection] },
    DefaultInventoryReservationOperationService: { reserveAll: () => assert.fail("No physical Inventory fallback") },
    DefaultModuleService: { invokeModule: async invocation => {
      assert.equal(invocation.maxAttempts, 1);
      if (invocation.moduleName === "eWaste") return controller.invoke({ tenant: invocation.tenant, authData: serviceAuth,
        requestId: "correlation", httpRequest: { params: { phase: invocation.apiName.split("/").at(-1) }, body: invocation.requestBody } });
      if (invocation.apiName === "/internal/source-test/customer-evidence") {
        assert.equal(invocation.moduleName, "profile");
        const body = invocation.requestBody;
        assert.deepEqual(Object.keys(body).sort(), ["contractVersion", "enterpriseCode", "identifier"]);
        return { data: { contractVersion: 1, tenant: invocation.tenant, enterpriseCode: body.enterpriseCode,
          customer: structuredClone(rows.customer.find(customer => customer.code === body.identifier || customer.loginId === body.identifier)) } };
      }
      if (invocation.apiName === "/internal/ownership/evidence/query") {
        assert.equal(invocation.moduleName, "digitalCore");
        assert.equal(invocation.apiName, commerceEvidenceRoutes.queryOwnershipEvidence.key);
        const p = invocation.requestBody, scope = { tenant: invocation.tenant, enterpriseCode: p.enterpriseCode };
        const bindingFields = ["bindingCode", "productCode", "sku", "storeCode", "locale"];
        assert.deepEqual(Object.keys(p).sort(), ["contractVersion", "kind", "enterpriseCode", ...bindingFields,
          ...(p.kind !== "BINDING" ? ["ownerId", "orderCode", "entryCode", "checkoutIdempotencyKey", "providerCode"] : []),
          ...(p.kind === "REFUND" ? ["entitlementCode", "refundCode"] : [])].sort());
        const read = async (schema, query) => (await repositories[schema].get({ query })).result;
        const selectedBinding = (await read("digitalProductBinding", { ...scope, code: p.bindingCode, productCode: p.productCode, sku: p.sku }))[0];
        const value = { contractVersion: 1, kind: p.kind, binding: selectedBinding,
          product: (await read("productSearchProjection", { ...scope, productCode: p.productCode, storeCode: p.storeCode, locale: p.locale }))[0],
          store: (await read("store", { tenant: invocation.tenant, code: p.storeCode }))[0] };
        if (["PURCHASE", "REFUND"].includes(p.kind)) {
          const owner = { ...scope, ownerId: p.ownerId };
          Object.assign(value, { orders: await read("commerceOrder", { ...owner, code: p.orderCode }),
            entries: await read("commerceOrderEntry", { ...owner, orderCode: p.orderCode }),
            payments: await read("paymentTransactionEntry", { ...owner, orderCode: p.orderCode }),
            checkpoints: await read("checkoutCheckpoint", { tenant: invocation.tenant, ownerId: p.ownerId, code: p.checkoutIdempotencyKey, idempotencyKey: p.checkoutIdempotencyKey }) });
          if (p.kind === "PURCHASE" && value.checkpoints.some(row => ["COMPENSATED", "COMPENSATION_REQUIRED"].includes(row.status)))
            value.entitlements = await read("digitalEntitlement", { ...owner, orderCode: p.orderCode });
          if (p.kind === "REFUND") {
            const refunds = await read("orderLifecycleRequest", { ...owner, code: p.refundCode, requestType: "REFUND" });
            Object.assign(value, { entitlement: (await read("digitalEntitlement", { ...owner, code: p.entitlementCode, orderCode: p.orderCode }))[0], refunds,
              cases: refunds[0]?.evidence?.caseCode ? await read("orderLifecycleRequest", { ...owner, code: refunds[0].evidence.caseCode, requestType: "DISPUTE" }) : [],
              transactions: refunds[0]?.evidence?.steps?.PAYMENT?.transactionCode ? await read("paymentTransaction", { ...owner, code: refunds[0].evidence.steps.PAYMENT.transactionCode }) : [] });
          }
        }
        return { data: value };
      }
      const route = invocation.apiName.slice(1);
      const schema = Object.keys(rows).find(name => name.toLowerCase() === route) || route;
      if (["reward-ledger-evidence", "wallet-evidence"].includes(route)) {
        assert.equal(invocation.moduleName, "loyaltyApi");
        const method = route === "reward-ledger-evidence" ? "ledgerEvidence" : "walletEvidence";
        return { data: await loyaltyEvidence[method]({ tenant: invocation.tenant, authData: serviceAuth, payload: invocation.requestBody }) };
      }
      if (["wallets", "wallet-projections"].includes(schema)) assert.fail("Evidence must never open or project a wallet");
      if (schema === "reward-earnings") {
        assert.equal(invocation.header["X-Enterprise-Code"], undefined);
        assert.equal(invocation.header.Authorization, undefined); assert.equal(invocation.request.authData, undefined);
        assert.equal(invocation.requestBody.authData, undefined); assert.equal(invocation.requestBody.enterpriseCode, undefined);
        assert.equal(invocation.header["Idempotency-Key"], invocation.requestBody.idempotencyKey);
        counters.earnings++;
        const body = invocation.requestBody;
        let entry = rows.rewardLedgerEntry.find(row => row.idempotencyKey === body.idempotencyKey);
        if (!entry) { entry = { code: "seller-credit", tenant: "t", entryType: "EARN", ...body }; rows.rewardLedgerEntry.push(entry); }
        if (failures.earning === "after") { delete failures.earning; throw new Error("earning acknowledgement lost"); }
        return { data: { ledgerEntry: structuredClone(entry) } };
      }
      assert.ok(repositories[schema], "Unknown owner read " + schema);
      counters.genericHttpReads++;
      return repositories[schema].get({ tenant: invocation.tenant, ...invocation.requestBody });
    } },
  };
  for (const [schema, repository] of Object.entries(repositories)) SERVICE["Default" + schema[0].toUpperCase() + schema.slice(1) + "Service"] = repository;
  const entry = { code: "cart|product|SKU", productCode: "product", sku: "SKU", variantCode: "variant", quantity: 1,
    availability: { productType: "DIGITAL", inventoryStrategy: "DIGITAL_COMMERCE", digitalDeliveryType: "DIGITAL_OWNERSHIP" } };
  const acquire = () => digital.reserveForCheckout(request, { entries: [entry] });
  const fund = unit => {
    rows.commerceOrder.push({ code: "order", tenant: "t", enterpriseCode: "e", ownerId: "buyer-login", cartCode: "cart", idempotencyKey: "checkout-key", active: true, status: "PLACED", currency: "POINTS", totalAmount: "12.00",
      evidence: { storeCode: "s", paymentReference: "buyer-reservation", paymentMethod: "LOYALTY_REWARD", paymentProvider: "loyalty-reward-points" } });
    rows.commerceOrderEntry.push({ code: "order:" + entry.code, tenant: "t", enterpriseCode: "e", orderCode: "order", ownerId: "buyer-login", active: true, productCode: "product", sku: "SKU", quantity: 1,
      cartCode: "cart", idempotencyKey: "checkout-key:order-entry:" + entry.code, unitAmount: "12.00", evidence: { digitalReservationCodes: [unit.code] } });
    const payment = { tenant: "t", enterpriseCode: "e", ownerId: "buyer-login", orderCode: "order", cartCode: "cart",
      methodCode: "LOYALTY_REWARD", currency: "POINTS", amount: "12.00", walletCode: "buyer-wallet", programCode: "program", rewardTypeCode: "points" };
    const transaction = (code, operation, status, idempotencyKey, reference) => ({ code, active: true,
      ...paymentExecution.transactionModel({ ...payment, operation, idempotencyKey }, { code: "loyalty-reward-points" }, { status, reference }) });
    rows.paymentTransactionEntry.push(transaction("order:capture", "CAPTURE", "CAPTURED", "checkout-key:payment:capture", "buyer-debit"),
      transaction("order:authorization", "AUTHORIZE", "AUTHORIZED", "checkout-key:payment", "buyer-reservation"));
    rows.rewardLedgerEntry.push({ code: "buyer-debit", tenant: "t", walletCode: "buyer-wallet", entryType: "CAPTURE", programCode: "program", rewardTypeCode: "points", amount: "12.00",
      idempotencyKey: "checkout-key:payment:capture", sourceType: "PAYMENT", sourceCode: "order", targetType: "ORDER", targetCode: "order", reservationCode: "buyer-reservation" });
    return rows.commerceOrder[0];
  };
  return { request, entry, projection, binding, rows, config, counters, failures, serviceAuth, acquire, fund };
}
test.afterEach(() => { for (const name of ["CONFIG", "SERVICE", "NODICS", "UTILS"]) delete global[name]; });

/** Original captured/refunded failure, not a completed sale or a manufactured live cleanup receipt. */
async function compensationFixture() {
  const f = fixture(), [unit] = await f.acquire();
  f.unit = unit; f.fund(unit);
  const intent = { tenant: "t", enterpriseCode: "e", ownerId: "buyer-login", orderCode: "order", cartCode: "cart",
    operation: "REFUND", idempotencyKey: "checkout-key:payment:refund", originalPaymentTransactionCode: "order:capture",
    originalIdempotencyKey: "checkout-key:payment:capture", originalProviderReference: "buyer-debit",
    providerCode: "loyalty-reward-points", methodCode: "LOYALTY_REWARD", amount: "12.00", currency: "POINTS" };
  f.rows.paymentTransactionEntry.push({ code: "checkout-key:refund", active: true,
    ...paymentExecution.transactionModel(intent, { code: intent.providerCode }, { status: "REFUNDED", reference: "buyer-refund" }) });
  f.rows.rewardLedgerEntry.push({ code: "buyer-refund", tenant: "t", walletCode: "buyer-wallet", entryType: "REVERSE",
    reversalOfEntryCode: "buyer-debit", programCode: "program", rewardTypeCode: "points", amount: "12.00",
    idempotencyKey: intent.idempotencyKey, sourceType: "PAYMENT", sourceCode: "order" });
  f.rows.checkoutCheckpoint.push({ code: "checkout-key", tenant: "t", ownerId: "buyer-login", revision: 0,
    idempotencyKey: "checkout-key", status: "COMPENSATION_REQUIRED", evidence: {
      completed: ["VALIDATED", "CALCULATED", "RESERVED", "DIGITAL_RESERVED", "AUTHORIZED", "ORDERED", "PAYMENT_CAPTURED"],
      inventoryReservationRecoveryRequired: false, digitalReservationRecoveryRequired: false, paymentCompensationIntent: intent,
      errorCode: "ERR_EWASTE_SALE_DIAGNOSTIC_041", compensation: [
        { type: "DIGITAL_OWNERSHIP_RELEASE", code: unit.code, status: "FAILED", errorCode: "DIGITAL_OWNERSHIP_RECOVERY_REQUIRED" },
        { type: "PAYMENT_REFUND", status: "COMPLETED", paymentStatus: "REFUND_SUCCEEDED", providerReference: "buyer-refund",
          paymentTransactionCode: "checkout-key:refund", idempotencyKey: intent.idempotencyKey } ] } });
  f.event = () => f.rows.wasteAssetOwnershipEvent[0];
  f.input = { tenant: "t", enterpriseCode: "e", authData: f.serviceAuth, payload: ownership.command(f.request, unit) };
  f.cancel = () => domain.invoke(f.input, "cancel");
  f.resolve = () => ownership.resolveCompensation(f.request, { code: unit.code, ownerId: "buyer-login", orderCode: "order", checkoutIdempotencyKey: "checkout-key" });
  return f;
}

test("original compensation resolver returns only the persisted bounded command without Cart reconstruction or writes", async () => {
  const f = await compensationFixture(), before = f.counters.writes;
  const unit = await f.resolve();
  assert.equal(unit.code, f.unit.code); assert.equal(unit.eventRevision, 0);
  assert.equal(unit.idempotencyKey, f.unit.idempotencyKey); assert.equal(unit.commandDigest, domain.compensationDigest(f.event()));
  assert.equal(unit.evidence, undefined); assert.equal(unit.policies, undefined);
  assert.equal(f.counters.writes, before); assert.equal(f.counters.genericHttpReads, 0);
  for (const payload of [ { contractVersion: 1, code: unit.code, ownerId: "other", orderCode: "order", checkoutIdempotencyKey: "checkout-key" },
    { contractVersion: 1, code: unit.code, ownerId: "buyer-login", orderCode: "other", checkoutIdempotencyKey: "checkout-key" },
    { contractVersion: 1, code: unit.code, ownerId: "buyer-login", orderCode: "order", checkoutIdempotencyKey: "checkout-key", productCode: "product" } ])
    await assert.rejects(domain.invoke({ ...f.input, payload }, "compensation-resolve"));
  assert.equal(f.counters.writes, before);
});

test("captured fully-refunded unfenced reservation cleans up once with both qualified absence reads, preserved audit and no financial writes", async () => {
  const f = await compensationFixture(), original = structuredClone(f.event()), asset = structuredClone(f.rows.wasteAsset[0]);
  const financial = structuredClone([f.rows.paymentTransactionEntry, f.rows.rewardLedgerEntry, f.rows.loyaltyWallet]);
  const invoke = SERVICE.DefaultModuleService.invokeModule, reads = [];
  SERVICE.DefaultModuleService.invokeModule = async input => {
    if (input.apiName === "/reward-ledger-evidence" && input.requestBody.earningIdempotencyKey) {
      reads.push(structuredClone(input.requestBody));
      assert.equal(f.event().transferStatus, "CANCELLED");
      if (reads.length === 1) {
        assert.equal(f.event().metadata.digitalSale.compensationRecovery.status, "FENCED");
        assert.equal(f.rows.wasteAsset[0].assetStatus, "SALE_PENDING");
      }
    }
    return invoke(input);
  };
  const resolved = await f.resolve();
  assert.equal((await ownership.release(f.request, resolved)).status, "COMPLETED");
  assert.equal(f.event().transferStatus, "CANCELLED"); assert.equal(f.event().metadata.digitalSale.compensationRecovery.status, "COMPLETED");
  assert.equal(f.event().metadata.digitalSale.capture, undefined);
  assert.deepEqual(f.event().metadata.digitalSale.command, original.metadata.digitalSale.command);
  assert.deepEqual(f.event().metadata.digitalSale.compensationRecovery.proof.paymentCompensationIntent, f.rows.checkoutCheckpoint[0].evidence.paymentCompensationIntent);
  assert.equal(f.rows.wasteAsset[0].assetStatus, "LISTED"); assert.equal(f.rows.wasteAsset[0].metadata.pendingTransferCode, null);
  for (const key of ["ownerRef", "digitalOwnerRef", "physicalOwnerRef", "custodyStatus"]) assert.deepEqual(f.rows.wasteAsset[0][key], asset[key]);
  assert.deepEqual([f.rows.paymentTransactionEntry, f.rows.rewardLedgerEntry, f.rows.loyaltyWallet], financial);
  assert.equal(f.counters.earnings, 0); assert.equal(f.counters.transfers, 0); assert.equal(SERVICE.DefaultExactAmountService, undefined);
  assert.deepEqual(reads[0], { enterpriseCode: "e", customerCode: "seller", programCode: "program", rewardTypeCode: "points",
    earningIdempotencyKey: f.unit.code + ":sale-proceeds", sourceType: "WASTE_ASSET_SALE", sourceCode: f.unit.code });
  const writes = f.counters.writes;
  await f.cancel(); await f.resolve(); assert.equal(f.counters.writes, writes);
  await assert.rejects(domain.invoke(f.input, "confirm")); await assert.rejects(f.acquire());
});

test("captured cleanup refuses missing, partial, ambiguous or foreign financial/checkpoint evidence before any fence", async () => {
  for (const alter of [f => f.rows.paymentTransactionEntry.pop(), f => f.rows.paymentTransactionEntry[2].totalAmount = "11.00",
    f => f.rows.paymentTransactionEntry[2].status = "REFUND_PENDING", f => f.rows.paymentTransactionEntry[2].enterpriseCode = "foreign",
    f => f.rows.paymentTransactionEntry.push(structuredClone(f.rows.paymentTransactionEntry[2])),
    f => f.rows.rewardLedgerEntry[1].amount = "11.00", f => f.rows.rewardLedgerEntry[1].reversalOfEntryCode = "foreign",
    f => f.rows.checkoutCheckpoint[0].evidence.compensation[1].providerReference = "foreign",
    f => f.rows.checkoutCheckpoint[0].evidence.paymentCompensationIntent.originalProviderReference = "foreign",
    f => f.rows.checkoutCheckpoint[0].evidence.completed.push("DIGITAL_SOLD"),
    f => delete f.rows.checkoutCheckpoint[0].evidence.inventoryReservationRecoveryRequired,
    f => f.rows.checkoutCheckpoint[0].revision = -1 ]) {
    const f = await compensationFixture(), before = f.counters.writes; alter(f);
    await assert.rejects(f.cancel()); assert.equal(f.counters.writes, before); assert.equal(f.rows.wasteAsset[0].assetStatus, "SALE_PENDING");
  }
});

test("schema-native evidence-only Payment projections resolve and clean up without root mirrors or Pricing activation", async () => {
  const f = await compensationFixture();
  for (const row of f.rows.paymentTransactionEntry)
    for (const field of ["operation", "methodCode", "providerCode", "providerReference", "amount"]) delete row[field];
  const financial = structuredClone(f.rows.paymentTransactionEntry), unit = await f.resolve();
  assert.equal(unit.code, f.unit.code); await f.cancel();
  assert.equal(f.rows.wasteAsset[0].assetStatus, "LISTED");
  assert.deepEqual(f.rows.paymentTransactionEntry, financial); assert.equal(f.counters.earnings, 0);
  assert.equal(SERVICE.DefaultExactAmountService, undefined);
  const funded = fixture(), units = await funded.acquire(), order = funded.fund(units[0]);
  for (const row of funded.rows.paymentTransactionEntry)
    for (const field of ["operation", "methodCode", "providerCode", "providerReference", "amount"]) delete row[field];
  await digital.confirmSale(funded.request, order, units); assert.equal(funded.counters.earnings, 1);
});

test("contradictory Payment mirrors on any original row refuse before cancellation fence or financial effects", async () => {
  for (const index of [0, 1, 2]) for (const field of ["operation", "methodCode", "providerCode", "providerReference", "amount"]) {
    const f = await compensationFixture(), before = f.counters.writes;
    f.rows.paymentTransactionEntry[index][field] = field === "amount" ? "11.00" : "contradiction";
    await assert.rejects(f.resolve()); await assert.rejects(f.cancel());
    assert.equal(f.counters.writes, before); assert.equal(f.event().transferStatus, "RESERVED"); assert.equal(f.counters.earnings, 0);
  }
});

test("capture-fenced, settling, completed and contradictory Waste scope never enter refunded cleanup", async () => {
  for (const alter of [f => f.event().metadata.digitalSale.capture = {}, f => f.event().metadata.digitalSale.settlement = {},
    f => f.event().transferStatus = "SETTLEMENT_PENDING", f => f.event().transferStatus = "COMPLETED",
    f => f.event().rewardSettlementRefs = [{ code: "seller-credit" }], f => f.event().tenant = "foreign",
    f => f.rows.wasteAsset[0].digitalOwnerRef.code = "buyer", f => f.rows.wasteAsset[0].metadata.pendingTransferCode = "foreign",
    f => f.rows.wasteAsset[0].metadata.pendingRefundCode = "refund" ]) {
    const f = await compensationFixture(), before = f.counters.writes; alter(f);
    await assert.rejects(f.cancel()); await assert.rejects(f.resolve());
    assert.equal(f.counters.writes, before); assert.equal(f.counters.earnings, 0);
  }
});

test("any entitlement or source-wide seller earning refuses release after cancellation fence", async () => {
  for (const mode of ["entitlement", "earning", "other-earning-key"]) {
    const f = await compensationFixture();
    if (mode === "entitlement") f.rows.digitalEntitlement.push({ code: "entitlement", tenant: "t", enterpriseCode: "e", ownerId: "buyer-login", orderCode: "order" });
    else f.rows.rewardLedgerEntry.push({ code: "earning", tenant: "t", walletCode: "seller-wallet", entryType: "EARN", programCode: "program",
      rewardTypeCode: "points", sourceType: "WASTE_ASSET_SALE", sourceCode: f.unit.code,
      idempotencyKey: mode === "earning" ? f.unit.code + ":sale-proceeds" : "other" });
    await assert.rejects(f.cancel());
    assert.equal(f.event().transferStatus, "CANCELLED"); assert.equal(f.rows.wasteAsset[0].assetStatus, "SALE_PENDING");
    assert.equal(f.event().metadata.digitalSale.compensationRecovery.status, "FENCED");
    assert.equal(f.counters.earnings, 0); assert.equal(f.counters.transfers, 0);
  }
});

test("empty is qualified only by the exact Loyalty earning selection and Commerce success contract", async () => {
  for (const mode of ["missing-entitlements", "commerce-error", "missing-selection", "selection-key", "selection-type", "selection-program", "wallet-owner", "failed-count", "owner-error"]) {
    const f = await compensationFixture(), invoke = SERVICE.DefaultModuleService.invokeModule;
    SERVICE.DefaultModuleService.invokeModule = async input => {
      const result = await invoke(input);
      if (input.apiName === "/internal/ownership/evidence/query" && f.event().metadata.digitalSale.compensationRecovery) {
        if (mode === "missing-entitlements") delete result.data.entitlements;
        if (mode === "commerce-error") return { success: false, data: result.data };
      }
      if (input.requestBody.earningIdempotencyKey) {
        if (mode === "missing-selection") delete result.data.ledgerSelection;
        if (mode === "selection-key") result.data.ledgerSelection.idempotencyKey = "foreign";
        if (mode === "selection-type") result.data.ledgerSelection.entryType = "REVERSE";
        if (mode === "selection-program") result.data.ledgerSelection.programCode = "foreign";
        if (mode === "wallet-owner") result.data.wallet.ownerCode = "buyer";
        if (mode === "failed-count") return { code: "SUC_GET", count: 1, result: [] };
        if (mode === "owner-error") throw Error("private-owner-detail");
      }
      return result;
    };
    await assert.rejects(f.cancel()); assert.equal(f.rows.wasteAsset[0].assetStatus, "SALE_PENDING");
    assert.equal(f.event().transferStatus, "CANCELLED"); assert.equal(f.counters.earnings, 0);
  }
});

test("capture and cancellation race through the same event CAS; neither stale capture nor absence-read race can settle", async () => {
  for (const winner of ["capture", "cancel"]) {
    const f = await compensationFixture(), r = domain.context(f.input), stale = structuredClone(f.event());
    const capture = await domain.capture(r, stale);
    if (winner === "capture") {
      await waste.prepareDigitalSettlement(r, stale, capture);
      const writes = f.counters.writes; await assert.rejects(f.cancel()); assert.equal(f.counters.writes, writes);
    } else {
      const proof = await domain.refundedCompensationProof(r, stale);
      await waste.fenceDigitalCompensation(r, stale, proof);
      await assert.rejects(waste.prepareDigitalSettlement(r, stale, capture)); await assert.rejects(domain.capture(r, stale));
      await f.cancel(); assert.equal(f.rows.wasteAsset[0].assetStatus, "LISTED");
    }
    assert.equal(f.counters.earnings, 0);
  }
});

test("revision or custody drift during qualified absence reads retains the lock", async () => {
  for (const mode of ["asset-revision", "event-revision", "custody", "capture", "refund"]) {
    const f = await compensationFixture(), invoke = SERVICE.DefaultModuleService.invokeModule;
    SERVICE.DefaultModuleService.invokeModule = async input => {
      const result = await invoke(input);
      if (input.requestBody.earningIdempotencyKey) {
        if (mode === "asset-revision") f.rows.wasteAsset[0].revision++;
        if (mode === "event-revision") f.event().revision++;
        if (mode === "custody") f.rows.wasteAsset[0].custodyStatus = "CHANGED";
        if (mode === "capture") f.event().metadata.digitalSale.capture = {};
        if (mode === "refund") f.rows.paymentTransactionEntry[2].totalAmount = "11.00";
      }
      return result;
    };
    await assert.rejects(f.cancel()); assert.equal(f.rows.wasteAsset[0].assetStatus, "SALE_PENDING");
  }
});

test("cancellation fence loses a real generated event CAS without releasing a concurrently capture-fenced asset", async () => {
  const f = await compensationFixture(), repository = SERVICE.DefaultWasteAssetOwnershipEventService, update = repository.update;
  repository.update = async input => {
    if (input.model.metadata?.digitalSale?.compensationRecovery) {
      f.event().revision++; f.event().metadata.digitalSale.capture = { code: "concurrent-capture-fence" };
    }
    return update(input);
  };
  await assert.rejects(f.cancel());
  assert.equal(f.rows.wasteAsset[0].assetStatus, "SALE_PENDING");
  assert.equal(f.event().metadata.digitalSale.compensationRecovery, undefined);
  assert.equal(f.counters.earnings, 0);
});

test("delegated cancellation refuses private capture and original runtime/config drift before releasing the fenced asset", async () => {
  for (const mode of ["capture", "auth", "grant"]) {
    const f = await compensationFixture(), auth = f.serviceAuth;
    delete auth.principalId; auth.enterpriseCode = "default"; auth.entCode = "default";
    NODICS.getSelectedEnvironmentName = () => "local";
    f.config.eWaste.marketplace.digitalOwnership.businessCallers = [{ tenant: "t", principalEnterpriseCode: "default", enterpriseCode: "e",
      serviceId: auth.serviceId, ...auth.runtimeScope, permissions: ["waste.asset.sale.transfer"] }];
    f.config.runtimeRole = { code: "LOYALTY" };
    f.config.loyalty = { api: { readEvidence: { runtimeRole: "LOYALTY", callers: [{ tenant: "t", principalEnterpriseCode: "default",
      enterpriseCode: "e", serviceId: auth.serviceId, ...auth.runtimeScope }] } } };
    f.input.privateRequest = { tenant: "t", authData: auth };
    const invoke = SERVICE.DefaultModuleService.invokeModule;
    SERVICE.DefaultModuleService.invokeModule = async input => {
      const result = await invoke(input);
      if (input.requestBody.earningIdempotencyKey) {
        if (mode === "capture") SERVICE.DefaultLoggerService.hasPrivateCaptureProtection = () => false;
        if (mode === "auth") auth.permissions = [];
        if (mode === "grant") f.config.eWaste.marketplace.digitalOwnership.businessCallers = [];
      }
      return result;
    };
    await assert.rejects(f.cancel()); assert.equal(f.rows.wasteAsset[0].assetStatus, "SALE_PENDING");
    assert.equal(f.event().transferStatus, "CANCELLED");
  }
});

test("lost cancellation/event/asset acknowledgements recover exact original audit without duplicate effects", async () => {
  for (const [schema, mode] of [["wasteAssetOwnershipEvent", "after"], ["wasteAsset", "after"], ["wasteAsset", "before"]]) {
    const f = await compensationFixture(); f.failures[schema + ":update"] = mode;
    if (mode === "before") { await assert.rejects(f.cancel()); assert.equal(f.rows.wasteAsset[0].assetStatus, "SALE_PENDING"); }
    await f.cancel();
    const writes = f.counters.writes; await f.cancel(); assert.equal(f.counters.writes, writes);
    assert.equal(f.event().metadata.digitalSale.compensationRecovery.status, "COMPLETED");
    assert.equal(f.counters.earnings, 0); assert.equal(f.counters.transfers, 0);
  }
});
test("Waste-only confirmation and delivery use canonical pure amounts without a Pricing service", async () => {
  const f = fixture();
  assert.equal(SERVICE.DefaultExactAmountService, undefined);
  assert.equal(domain.amount(), require(path.join(root, "nodics.foundation/modules/nCommon/src/utils/exactAmount")));
  const units = await f.acquire(), order = f.fund(units[0]);
  const sales = await digital.confirmSale(f.request, order, units);
  await digital.deliver(f.request, order, sales);
  assert.equal(f.rows.wasteAssetOwnershipEvent[0].transferStatus, "COMPLETED");
  assert.equal(f.counters.earnings, 1);
  assert.equal(SERVICE.DefaultExactAmountService, undefined);
});

test("later owner layers can replace only the pure amount accessor while retaining capture checks", async () => {
  const f = fixture(), units = await f.acquire();
  f.fund(units[0]);
  let comparisons = 0;
  const canonical = domain.amount(), custom = { ...domain, amount: () => ({ compare: (...args) => {
    comparisons++;
    return canonical.compare(...args);
  } }) };
  const r = custom.context({ tenant: "t", authData: f.serviceAuth, payload: {} });
  assert.equal((await custom.capture(r, f.rows.wasteAssetOwnershipEvent[0])).ledgerCode, "buyer-debit");
  assert.ok(comparisons >= 3);
  f.rows.paymentTransactionEntry[0].totalAmount = "11.00";
  await assert.rejects(custom.capture(r, f.rows.wasteAssetOwnershipEvent[0]), /captured digital-sale payment/);
  assert.equal(f.counters.earnings, 0);
});

test("generic schema HTTP is disabled independently of module exposure and missing Profile evidence refuses before transport", async () => {
  const f = fixture(), r = domain.context({ tenant: "t", authData: f.serviceAuth, payload: {} });
  for (const module of ["profile", "store", "product", "digitalCore", "order", "paymentCore", "checkoutCore", "loyaltyWallet", "loyaltyLedger"])
    await assert.rejects(domain.rows(r, module, "commerce", "schema", { code: "record" }), /capability evidence/);
  delete f.config.eWaste.marketplace.digitalOwnership.customerEvidenceApiName;
  await assert.rejects(domain.buyer(r, "seller"), /Profile customer evidence route/);
  assert.equal(f.counters.genericHttpReads, 0); assert.equal(f.counters.writes, 0);
});

test("business-enterprise authority requires exact original groupless runtime deployment and preserves its principal enterprise", async () => {
  const f = fixture(), auth = f.serviceAuth;
  auth.entCode = "default"; auth.enterpriseCode = "default";
  NODICS.getSelectedEnvironmentName = () => "local";
  const settings = f.config.eWaste.marketplace.digitalOwnership;
  settings.businessCallers = [{ tenant: "t", principalEnterpriseCode: "default", enterpriseCode: "e", serviceId: auth.serviceId,
    ...auth.runtimeScope, permissions: ["waste.asset.sale.transfer"] }];
  const input = { tenant: "t", enterpriseCode: "e", authData: auth, privateRequest: { tenant: "t", authData: auth }, payload: {} };
  const before = structuredClone(auth), r = domain.context(input);
  assert.equal(r.enterpriseCode, "e"); assert.deepEqual(auth, before);
  settings.businessCallers.push(structuredClone(settings.businessCallers[0]));
  assert.throws(() => domain.context(input), /authority/); settings.businessCallers.pop();
  auth.runtimeScope.instanceCode = "other"; assert.throws(() => domain.context(input)); auth.runtimeScope.instanceCode = "instance";
  input.privateRequest.authData = { ...auth, entCode: "other" };
  assert.throws(() => domain.recheckAuthority(r), /changed/); assert.equal(f.counters.writes, 0);
});

test("sale and listing controllers separate normalized principal namespace from the exact business body selector", async () => {
  const f = fixture(), auth = f.serviceAuth;
  auth.entCode = "default"; auth.enterpriseCode = "default";
  NODICS.getSelectedEnvironmentName = () => "local";
  const settings = f.config.eWaste.marketplace.digitalOwnership;
  settings.businessCallers = [{ tenant: "t", principalEnterpriseCode: "default", enterpriseCode: "e", serviceId: auth.serviceId,
    ...auth.runtimeScope, permissions: ["waste.asset.sale.transfer", "waste.asset.marketplace.project"] }];
  const request = { tenant: "t", enterpriseCode: "default", entCode: "default", authData: auth,
    httpRequest: { headers: { "x-enterprise-code": "default" }, params: { phase: "evidence" }, body: { enterpriseCode: "e", kind: "LISTING" } } };
  SERVICE.DefaultEWasteDigitalSaleService = { ...domain, invoke: async input => {
    const r = domain.context(input); assert.equal(r.enterpriseCode, "e"); assert.equal(r.payload.enterpriseCode, undefined);
    assert.equal(r.authData.entCode, "default"); return { checked: true };
  } };
  assert.equal((await controller.invoke(request)).data.checked, true);
  request.httpRequest.headers["x-enterprise-code"] = "e";
  await assert.rejects(controller.invoke(request), /authority/);
  request.httpRequest.headers["x-enterprise-code"] = "default"; request.httpRequest.params.phase = "plan";
  SERVICE.DefaultEWasteDigitalListingService = { plan: async input => {
    const r = domain.authority(input, "waste.asset.marketplace.project");
    assert.equal(r.enterpriseCode, "e"); assert.equal(r.payload.enterpriseCode, undefined); return { checked: true };
  } };
  const listingController = require("../src/controller/defaultEWasteDigitalListingController");
  assert.equal((await listingController.invoke(request)).data.checked, true);
  assert.equal(f.counters.writes, 0);
});

test("private sale diagnostics expose only static owner failures, not arbitrary remote details", async () => {
  fixture();
  const original = global.CLASSES;
  global.CLASSES = { NodicsError: class extends Error {
    constructor(value) { super(value.message); this.code = value.code; }
  } };
  const request = { httpRequest: { params: { phase: "evidence" }, body: {} } };
  try {
    SERVICE.DefaultEWasteDigitalSaleService = { invoke: async () => { throw new Error("Retained Product proof changed"); } };
    const statuses = require("../src/utils/statusDefinitions");
    const router = require("../../../../../../nodics.foundation/modules/nRouter/src/service/router/defaultRouterOperationService");
    SERVICE.DefaultStatusService = { get: code => statuses[code] };
    SERVICE.DefaultLoggerService.isSensitiveRequest = () => true;
    await assert.rejects(controller.invoke(request), error => {
      let response, status;
      assert.equal(router.sendPrivateError({}, { status: value => { status = value; return { json: value => { response = value; } }; } }, error), true);
      assert.equal(status, 503);
      assert.deepEqual(response, { responseCode: "503", code: "ERR_EWASTE_SALE_DIAGNOSTIC_011", message: "Retained Product proof changed" });
      return error.code === response.code;
    });
    const remote = new Error("private remote detail sentinel");
    SERVICE.DefaultEWasteDigitalSaleService.invoke = async () => { throw remote; };
    await assert.rejects(controller.invoke(request), error => error !== remote && error.code === "ERR_EWASTE_SALE_DIAGNOSTIC_041" &&
      error.message === "Digital ownership controller operation is unavailable");
  } finally { if (original === undefined) delete global.CLASSES; else global.CLASSES = original; }
});

test("outgoing exact evidence derives namespace from the actual transport token, not the business enterprise or incoming actor", async () => {
  const f = fixture(), calls = [], r = domain.context({ tenant: "t", authData: f.serviceAuth, payload: {} });
  SERVICE.DefaultModuleService.invokeModule = async input => { calls.push(input); return { data: { acknowledged: true } }; };
  for (const [moduleName, target, route] of [["profile", "profile", "/internal/customer-evidence"],
    ["loyaltyApi", "loyalty", "/reward-ledger-evidence"], ["digitalCore", "commerce", "/internal/ownership/evidence/query"]]) {
    await domain.remote(r, moduleName, target, route, { enterpriseCode: "e" }, true);
    const sent = calls.at(-1); assert.equal(sent.header["X-Enterprise-Code"], undefined);
    assert.equal(sent.requestBody.enterpriseCode, "e"); assert.equal(sent.header.Authorization, undefined);
    assert.equal(sent.tenant, "t"); assert.equal(sent.maxAttempts, 1);
  }
  assert.equal(f.counters.writes, 0);
});

test("private evidence dependency refusal returns only its fixed owner stage", async () => {
  const f = fixture();
  const original = SERVICE.DefaultEWasteDigitalSaleService;
  SERVICE.DefaultEWasteDigitalSaleService = { ...original, binding: async () => { throw new Error("private dependency sentinel"); } };
  try {
    await assert.rejects(controller.invoke({ tenant: "t", authData: f.serviceAuth,
      httpRequest: { params: { phase: "evidence" }, body: { contractVersion: 1, kind: "LISTING", bindingCode: "binding",
        productCode: "product", sku: "SKU", storeCode: "s", locale: "en", assetCode: "asset" } } }),
    error => error.message.includes("BINDING_OWNER") && !error.message.includes("sentinel"));
    assert.equal(f.counters.writes, 0);
  } finally { SERVICE.DefaultEWasteDigitalSaleService = original; }
});

test("exact private Waste evidence reads listed and original completed sale through generated owners without a mutation", async () => {
  const f = fixture(), payload = { contractVersion: 1, kind: "LISTING", bindingCode: "binding", productCode: "product", sku: "SKU", storeCode: "s", locale: "en", assetCode: "asset" };
  const read = body => controller.invoke({ tenant: "t", authData: f.serviceAuth, httpRequest: { params: { phase: "evidence" }, body } });
  const before = f.counters.writes, listed = (await read(payload)).data;
  assert.equal(listed.asset.assetStatus, "LISTED"); assert.equal(listed.asset.metadata.pendingTransferEvent, undefined);
  assert.match(listed.pins.asset, /^[a-f0-9]{64}$/); assert.equal(f.counters.writes, before);
  await assert.rejects(read({ ...payload, query: {} }));
  const units = await f.acquire(), order = f.fund(units[0]), sales = await digital.confirmSale(f.request, order, units);
  await digital.deliver(f.request, order, sales);
  const writes = f.counters.writes;
  const purchase = (await read({ ...payload, kind: "PURCHASE", code: units[0].code, ownerId: "buyer-login", orderCode: "order", entryCode: f.entry.code, checkoutIdempotencyKey: "checkout-key" })).data;
  assert.equal(purchase.sale.transferStatus, "COMPLETED"); assert.equal(purchase.asset.digitalOwnerRef.code, "buyer");
  assert.equal(purchase.sale.metadata.digitalSale.command, undefined); assert.equal(f.counters.writes, writes);
  SERVICE.DefaultLoggerService.hasPrivateCaptureProtection = () => false;
  await assert.rejects(read(payload)); assert.equal(f.counters.writes, writes);
});

/** Exercises existing Order approval, Digital, eWaste, Waste and real Loyalty reversal owners with isolated transport/storage and staff admission. */
async function refundFixture(approved = true) {
  const f = fixture();
  if (approved) f.rows.wasteAssetTransferPolicy[0].metadata.digitalOwnership.refund = "ORIGINAL_TRANSFER_REVERSAL_ONLY_BEFORE_ONWARD_TRANSFER";
  const units = await f.acquire(), order = f.fund(units[0]);
  order.revision = 1;
  const sales = await digital.confirmSale(f.request, order, units);
  await digital.deliver(f.request, order, sales);
  f.original = structuredClone(f.rows.wasteAssetOwnershipEvent[0]);
  // The combined refund fixture also executes Commerce Payment, where Pricing is active.
  SERVICE.DefaultExactAmountService = require(path.join(root, "nodics.commerce/modules/baseCommerce/modules/pricing/src/service/defaultExactAmountService"));
  f.config.runtimeRole = "COMMERCE";
  f.config.order = { refunds: { enabled: true, storeCodes: { s: true } } };
  const request = { ...f.request, code: "review", idempotencyKey: "moderator-command-key",
    authData: { tokenType: "access", principalType: "employee", tenant: "t", enterpriseCode: "e", loginId: "reviewer" },
    payload: { confirmed: true, reason: "Approved original asset refund" } };
  const review = { code: "review", tenant: "t", enterpriseCode: "e", active: true, revision: 1,
    ownerId: "buyer-login", orderCode: "order", requestType: "DISPUTE", status: "SUBMITTED", evidence: { requestedResolution: "REFUND" } };
  f.rows.orderLifecycleRequest.push(review);
  SERVICE.DefaultOrderDisputeService = {
    staff: async input => {
      assert.equal(input.authData.tokenType, "access"); assert.equal(input.authData.principalType, "employee");
      return input;
    },
    storage: r => ({ tenant: r.tenant, authData: r.authData }),
    rows: value => value.result,
    records: async (r, query) => (await SERVICE.DefaultOrderLifecycleRequestService.get({ ...r, query })).result,
    policyAdmission: async (_r, retained) => { assert.equal(retained.evidence.storeCode, "s"); return "s"; },
  };
  SERVICE.DefaultOrderOperationService = { entries: async () => structuredClone(f.rows.commerceOrderEntry) };
  SERVICE.DefaultOrderRefundRecoveryService = orderRefund;
  SERVICE.DefaultOrderLifecycleService = require(path.join(root, "nodics.commerce/modules/checkout/modules/order/src/service/defaultOrderLifecycleService"));
  SERVICE.DefaultPaymentRefundExecutionService = paymentRefund;
  SERVICE.DefaultPaymentExecutionService = paymentExecution;
  SERVICE.DefaultLoyaltyRewardPaymentProviderService = paymentProvider;
  f.load = () => orderRefund.load(request);
  f.refundRequest = request;
  f.phase = async phase => refund[phase](await f.load());
  f.refundCode = orderRefund.refundCode({ tenant: "t", enterpriseCode: "e", orderCode: "order" });
  f.approve = async () => {
    const r = await f.load(), preview = await refund.preview(r), originalCapture = {
      captureCode: "order:capture", amount: "12.00", currency: "POINTS", providerCode: "loyalty-reward-points", methodCode: "LOYALTY_REWARD",
      walletCode: "buyer-wallet", programCode: "program", rewardTypeCode: "points", reversalOfEntryCode: "buyer-debit",
    };
    assert.equal(preview.eligible, true);
    f.approval = { code: f.refundCode, tenant: "t", enterpriseCode: "e", active: true, ownerId: "buyer-login", orderCode: "order",
      requestType: "REFUND", status: "APPROVED", revision: 0, evidence: { caseCode: review.code,
        approval: { by: "reviewer", at: new Date().toISOString(), reason: request.payload.reason, commandKey: request.idempotencyKey },
        plan: { provider: "digitalCore", amount: "12.00", currency: "POINTS", captureCode: "order:capture", originalCapture, domain: preview }, steps: {} } };
    f.rows.orderLifecycleRequest.push(f.approval);
    order.status = "REFUND_PENDING"; order.evidence.refundCode = f.refundCode;
    return f.approval;
  };
  for (const walletCode of ["seller-wallet", "buyer-wallet"]) f.rows.loyaltyWalletRewardBalance.push({ code: walletCode + ":balance", tenant: "t", walletCode,
    programCode: "program", rewardTypeCode: "points", available: walletCode === "seller-wallet" ? "12.00" : "0.00",
    reserved: "0.00", earned: walletCode === "seller-wallet" ? "12.00" : "0.00", spent: walletCode === "buyer-wallet" ? "12.00" : "0.00",
    expired: "0.00", reversed: "0.00", revision: 1, metadata: {} });
  const transport = SERVICE.DefaultModuleService.invokeModule;
  SERVICE.DefaultModuleService.invokeModule = async invocation => {
    const match = invocation.apiName.match(/^\/reward-ledger-entries\/([^/]+)\/reverse$/);
    if (!match) return transport(invocation);
    if (invocation.requestBody.sourceType === "ORDER_REFUND") {
      assert.equal(invocation.header["X-Enterprise-Code"], undefined);
      assert.equal(invocation.header.Authorization, undefined); assert.equal(invocation.request.authData, undefined);
      assert.equal(invocation.requestBody.authData, undefined); assert.equal(invocation.requestBody.enterpriseCode, undefined);
    }
    assert.equal(invocation.header?.["Idempotency-Key"] || invocation.idempotencyKey, invocation.requestBody.idempotencyKey);
    const result = await loyalty.reverse({ tenant: "t", authData: f.serviceAuth,
      ...invocation.requestBody, reversalOfEntryCode: decodeURIComponent(match[1]) });
    if (f.failures.sellerReverse === "after") { delete f.failures.sellerReverse; throw Error("seller reversal acknowledgement lost"); }
    return { data: result };
  };
  f.checkpoint = async phase => {
    const result = await f.phase(phase);
    f.approval.evidence.steps[phase.toUpperCase()] = result;
    return result;
  };
  // Use canonical guarded Payment dispatch, not a synthetic PAYMENT success checkpoint.
  f.payment = async () => {
    const payment = await paymentRefund.refundOrder(await f.load());
    assert.equal(payment.status, "REFUND_SUCCEEDED");
    f.approval.evidence.steps.PAYMENT = { status: payment.status, transactionCode: payment.transaction.code };
  };
  return f;
}

test("seller reversal preserves the original signed runtime namespace and admission across transport", async () => {
  for (const mode of ["valid", "authority-drift"]) {
    const f = await refundFixture(); await f.approve(); await f.checkpoint("prepare");
    const auth = f.serviceAuth;
    delete auth.principalId; auth.entCode = "default"; auth.enterpriseCode = "default";
    NODICS.getSelectedEnvironmentName = () => "local";
    f.config.eWaste.marketplace.digitalOwnership.businessCallers = [{ tenant: "t", principalEnterpriseCode: "default", enterpriseCode: "e",
      serviceId: auth.serviceId, ...auth.runtimeScope, permissions: ["waste.asset.sale.transfer"] }];
    f.config.runtimeRole = { code: "LOYALTY" };
    f.config.loyalty = { api: { readEvidence: { runtimeRole: "LOYALTY", callers: [{ tenant: "t", principalEnterpriseCode: "default",
      enterpriseCode: "e", serviceId: auth.serviceId, ...auth.runtimeScope }] } } };
    const before = structuredClone(auth), invoke = SERVICE.DefaultModuleService.invokeModule; let calls = 0;
    SERVICE.DefaultModuleService.invokeModule = async input => {
      if (input.apiName.endsWith("/reverse")) {
        calls++; assert.equal(input.header["X-Enterprise-Code"], undefined);
        assert.equal(input.header.Authorization, undefined); assert.equal(input.request.authData, undefined);
        assert.equal(input.requestBody.authData, undefined); assert.equal(input.requestBody.enterpriseCode, undefined);
        assert.equal(input.header["Idempotency-Key"], input.requestBody.idempotencyKey); assert.deepEqual(auth, before);
      }
      const result = await invoke(input);
      if (input.apiName.endsWith("/reverse") && mode === "authority-drift") auth.permissions = [];
      return result;
    };
    const settle = () => controller.invoke({ tenant: "t", authData: auth, httpRequest: { params: { phase: "refund-settle" }, body: {
      enterpriseCode: "e", code: f.original.code, entitlementCode: f.rows.digitalEntitlement[0].code,
      ownerId: "buyer-login", orderCode: "order", refundCode: f.refundCode, idempotencyKey: f.refundCode } } });
    if (mode === "valid") { await settle(); assert.deepEqual(auth, before); }
    else await assert.rejects(settle(), /changed/);
    assert.equal(calls, 1);
  }
});

test("original-sale digital refund recovers seller proceeds and buyer capture, restores seller without moving custody, and replays exactly", async () => {
  const f = await refundFixture();
  const commerceAmounts = SERVICE.DefaultExactAmountService;
  delete SERVICE.DefaultExactAmountService;
  await f.approve(); await f.checkpoint("prepare"); await f.phase("prepare");
  assert.equal(f.rows.wasteAsset[0].assetStatus, "LOCKED");
  await f.checkpoint("settle"); await f.phase("settle");
  assert.equal(f.rows.loyaltyWalletRewardBalance[0].available, "0.00");
  assert.equal(f.rows.loyaltyWalletRewardBalance[1].available, "0.00");
  await assert.rejects(f.phase("complete"), /checkpoints/);
  SERVICE.DefaultExactAmountService = commerceAmounts;
  await f.payment();
  delete SERVICE.DefaultExactAmountService;
  await f.checkpoint("complete"); await f.phase("complete");
  assert.equal(f.rows.wasteAsset[0].assetStatus, "OWNED"); assert.equal(f.rows.wasteAsset[0].ownerRef.code, "seller");
  assert.equal(f.rows.wasteAsset[0].digitalOwnerRef.code, "seller"); assert.equal(f.rows.wasteAsset[0].physicalOwnerRef.code, "custodian");
  assert.equal(f.rows.wasteAsset[0].custodyStatus, "RECEIVED_BY_OPERATOR"); assert.equal(f.rows.wasteAsset[0].metadata.pendingRefundCode, null);
  assert.equal(f.rows.digitalEntitlement[0].status, "REVOKED"); assert.equal(f.rows.digitalReversal.length, 1);
  assert.equal(f.rows.loyaltyWalletRewardBalance[1].available, "12.00");
  assert.equal(f.rows.rewardLedgerEntry.filter(row => row.entryType === "REVERSE").length, 2);
  assert.equal(f.counters.earnings, 1); assert.deepEqual(f.rows.wasteAssetOwnershipEvent[0], f.original);
  assert.equal(SERVICE.DefaultExactAmountService, undefined);
});

test("exact original refund evidence joins the persisted sale/reversal and restored owner without mutating or expanding maintenance inspection", async () => {
  const f = await refundFixture();
  await f.approve(); await f.checkpoint("prepare"); await f.checkpoint("settle"); await f.payment(); await f.checkpoint("complete");
  const payload = { contractVersion: 1, kind: "REFUND", bindingCode: "binding", productCode: "product", sku: "SKU", storeCode: "s", locale: "en", assetCode: "asset",
    code: f.original.code, ownerId: "buyer-login", orderCode: "order", entryCode: f.entry.code, checkoutIdempotencyKey: "checkout-key", refundCode: f.refundCode };
  const input = { tenant: "t", authData: f.serviceAuth, httpRequest: { params: { phase: "evidence" }, body: payload } };
  const writes = f.counters.writes, evidence = (await controller.invoke(input)).data;
  assert.equal(evidence.asset.digitalOwnerRef.code, "seller"); assert.equal(evidence.reversal.transferStatus, "COMPLETED");
  assert.equal(evidence.reversal.metadata.digitalRefund.command.refundCode, f.refundCode); assert.equal(f.counters.writes, writes);
  await assert.rejects(controller.invoke({ ...input, httpRequest: { ...input.httpRequest, body: { ...payload, refundCode: "other" } } }));
  assert.equal(f.counters.writes, writes);
});

test("canonical Order approval executes all four owners and resumes uncertain seller settlement under its original command", async () => {
  for (const interrupted of [false, true]) {
    const f = await refundFixture();
    const plan = await orderRefund.plan(await f.load());
    Object.assign(f.refundRequest.payload, { expectedRevision: 1, previewToken: plan.previewToken });
    if (interrupted) f.failures.sellerReverse = "after";
    let result = await orderRefund.execute(f.refundRequest);
    if (interrupted) {
      assert.equal(result.status, "RECONCILIATION_REQUIRED");
      assert.equal(f.rows.paymentTransaction.length, 0); assert.equal(f.rows.wasteAsset[0].assetStatus, "LOCKED");
      result = await orderRefund.execute(f.refundRequest);
    }
    assert.equal(result.status, "COMPLETED"); assert.deepEqual(result.steps, ["PREPARE", "SETTLE", "PAYMENT", "COMPLETE"]);
    const completedCaseRevision = f.rows.orderLifecycleRequest[0].revision;
    assert.equal((await orderRefund.execute(f.refundRequest)).status, "COMPLETED");
    assert.equal(f.rows.orderLifecycleRequest[0].revision, completedCaseRevision);
    assert.equal(f.rows.commerceOrder[0].status, "REFUNDED"); assert.equal(f.rows.orderLifecycleRequest[0].status, "REFUNDED");
    assert.equal(f.rows.wasteAsset[0].ownerRef.code, "seller"); assert.equal(f.rows.digitalEntitlement[0].status, "REVOKED");
    assert.equal(f.rows.paymentTransaction.length, 1); assert.equal(f.rows.digitalReversal.length, 1);
    assert.equal(f.rows.rewardLedgerEntry.filter(row => row.entryType === "REVERSE").length, 2);
  }
});

test("digital refunds require explicit original retained policy and reject onwards ownership before financial effects", async () => {
  const missing = await refundFixture(false);
  await assert.rejects(missing.phase("preview"), /Reviewed original-sale/);
  const f = await refundFixture(); f.rows.wasteAsset[0].metadata.lastTransferCode = "onward";
  assert.deepEqual(await f.phase("preview"), { eligible: false, reason: "ASSET_MOVED_OR_LOCKED" });
  assert.equal(f.rows.rewardLedgerEntry.filter(row => row.entryType === "REVERSE").length, 0);
});

test("mutations require original persisted approval, unique complete units, scope and unchanged policy", async () => {
  for (const alter of [f => f.rows.orderLifecycleRequest.pop(), f => f.approval.evidence.plan.domain.saleCode = "other",
    f => f.approval.evidence.plan.originalCapture.reversalOfEntryCode = "other", f => f.approval.evidence.approval.commandKey = "different-command",
    f => f.rows.commerceOrder[0].evidence.refundCode = "other", f => f.rows.wasteAssetTransferPolicy[0].revision++,
    f => f.rows.digitalEntitlement.push(structuredClone(f.rows.digitalEntitlement[0])), f => f.rows.commerceOrderEntry.push(structuredClone(f.rows.commerceOrderEntry[0])),
    f => f.rows.wasteAsset[0].digitalOwnerRef.code = "other", f => f.rows.wasteAsset[0].metadata.pendingTransferCode = "onward"]) {
    const f = await refundFixture(); await f.approve(); alter(f);
    await assert.rejects(f.phase("prepare"));
    assert.equal(f.rows.rewardLedgerEntry.filter(row => row.entryType === "REVERSE").length, 0);
  }
});

test("lost seller acknowledgement and ledger posting recover only the original reversal without repeated debit", async () => {
  for (const failure of ["ack", "ledger"]) {
    const f = await refundFixture(); await f.approve(); await f.checkpoint("prepare");
    if (failure === "ack") f.failures.sellerReverse = "after";
    else f.failures["rewardLedgerEntry:save"] = "before";
    await assert.rejects(f.phase("settle"));
    assert.equal(f.rows.wasteAsset[0].assetStatus, "LOCKED"); assert.equal(f.rows.loyaltyWalletRewardBalance[0].available, "0.00");
    assert.equal(f.rows.loyaltyWalletRewardBalance[1].available, "0.00");
    await f.checkpoint("settle"); await f.payment(); await f.phase("complete");
    assert.equal(f.rows.loyaltyWalletRewardBalance[0].available, "0.00");
    assert.equal(f.rows.rewardLedgerEntry.filter(row => row.reversalOfEntryCode === "seller-credit").length, 1);
  }
});

test("spent seller proceeds refuse settlement and cannot trigger buyer refund or ownership return", async () => {
  const f = await refundFixture(); await f.approve(); await f.checkpoint("prepare");
  f.rows.loyaltyWalletRewardBalance[0].available = "1.00";
  await assert.rejects(f.phase("settle"), /negative/);
  assert.equal(f.rows.wasteAsset[0].ownerRef.code, "buyer"); assert.equal(f.rows.wasteAsset[0].assetStatus, "LOCKED");
  assert.equal(f.rows.digitalEntitlement[0].status, "REFUND_PENDING"); assert.equal(f.rows.paymentTransaction.length, 0);
});

test("original Payment and seller reversal evidence are required, not a successful checkpoint alone", async () => {
  for (const alter of [f => f.rows.paymentTransaction[0].evidence.refundIntent.approvalCommandKey = "other",
    f => f.rows.paymentTransaction[0].evidence.providerReference = "other",
    f => f.rows.paymentTransaction[0].enterpriseCode = "other", f => f.rows.paymentTransaction[0].totalAmount = "1.00",
    f => f.rows.rewardLedgerEntry.find(row => row.reversalOfEntryCode === "seller-credit").idempotencyKey = "other",
    f => f.rows.rewardLedgerEntry.find(row => row.reversalOfEntryCode === "buyer-debit").walletCode = "seller-wallet"]) {
    const f = await refundFixture(); await f.approve(); await f.checkpoint("prepare"); await f.checkpoint("settle"); await f.payment(); alter(f);
    await assert.rejects(f.phase("complete"));
    assert.equal(f.rows.wasteAsset[0].ownerRef.code, "buyer"); assert.equal(f.rows.wasteAsset[0].assetStatus, "LOCKED");
    assert.equal(f.rows.digitalEntitlement[0].status, "REFUND_PENDING");
  }
});

test("interrupted asset lock acquisition and completion resume with exact original ownership reversal", async () => {
  for (const stage of ["prepare-before", "prepare-after", "complete-before", "complete-after", "event-before"]) {
    const f = await refundFixture(); await f.approve();
    if (stage.startsWith("prepare")) {
      f.failures["wasteAssetOwnershipEvent:save"] = stage.endsWith("before") ? "before" : "after";
      if (stage.endsWith("before")) await assert.rejects(f.phase("prepare"));
      else await f.phase("prepare");
    }
    await f.checkpoint("prepare"); await f.checkpoint("settle"); await f.payment();
    if (stage.startsWith("complete")) f.failures["wasteAsset:update"] = stage.endsWith("before") ? "before" : "after";
    if (stage === "event-before") f.failures["wasteAssetOwnershipEvent:update"] = "before";
    if (stage === "complete-before" || stage === "event-before") await assert.rejects(f.phase("complete"));
    else await f.phase("complete");
    await f.phase("complete");
    assert.equal(f.rows.wasteAsset[0].ownerRef.code, "seller"); assert.equal(f.rows.wasteAssetOwnershipEvent.length, 2);
    assert.equal(f.rows.rewardLedgerEntry.filter(row => row.entryType === "REVERSE").length, 2);
  }
});

test("private digital refund refuses customer identity, scope alias conflicts and caller financial overrides", async () => {
  const f = await refundFixture(); await f.approve();
  const payload = { code: f.original.code, entitlementCode: f.rows.digitalEntitlement[0].code, orderCode: "order", ownerId: "buyer-login",
    refundCode: f.refundCode, idempotencyKey: f.refundCode };
  for (const patch of [{ authData: f.request.authData }, { tenant: "other" }, { authData: { ...f.serviceAuth, entCode: "other" } },
    { payload: { ...payload, walletCode: "other" } }, { payload: { ...payload, refundCode: "other" } }])
    await assert.rejects(orderReversal.digitalInvoke({ tenant: "t", authData: f.serviceAuth, payload, ...patch }, "prepare"));
  assert.equal(f.rows.rewardLedgerEntry.filter(row => row.entryType === "REVERSE").length, 0);
});

test("concurrent original refund retries retain one ownership reversal and one seller/buyer reversal each", async () => {
  const f = await refundFixture(); await f.approve();
  await Promise.allSettled([f.phase("prepare"), f.phase("prepare")]); await f.checkpoint("prepare");
  await Promise.allSettled([f.phase("settle"), f.phase("settle")]); await f.checkpoint("settle");
  await Promise.all([f.payment(), f.payment()]);
  await Promise.allSettled([f.phase("complete"), f.phase("complete")]); await f.phase("complete");
  assert.equal(f.rows.wasteAssetOwnershipEvent.length, 2); assert.equal(f.rows.digitalReversal.length, 1);
  assert.equal(f.rows.paymentTransaction.length, 1); assert.equal(f.rows.rewardLedgerEntry.filter(row => row.entryType === "REVERSE").length, 2);
  assert.equal(f.rows.loyaltyWalletRewardBalance[0].available, "0.00"); assert.equal(f.rows.loyaltyWalletRewardBalance[1].available, "12.00");
});

test("ownership/event cleanup and Digital write interruptions recover after buyer refund without new financial effects", async () => {
  for (const stage of ["refundCompletion", "refundCleanup", "digitalEntitlement:update", "digitalReversal:save"]) {
    const f = await refundFixture(); await f.approve(); await f.checkpoint("prepare"); await f.checkpoint("settle"); await f.payment();
    f.failures[stage] = stage.startsWith("refund") ? true : "after";
    await assert.rejects(f.phase("complete"));
    await f.phase("complete");
    assert.equal(f.rows.wasteAsset[0].ownerRef.code, "seller"); assert.equal(f.rows.wasteAsset[0].assetStatus, "OWNED");
    assert.equal(f.rows.wasteAsset[0].metadata.pendingRefundCode, null); assert.equal(f.rows.digitalEntitlement[0].status, "REVOKED");
    assert.equal(f.rows.digitalReversal.length, 1); assert.equal(f.rows.paymentTransaction.length, 1);
    assert.equal(f.rows.rewardLedgerEntry.filter(row => row.entryType === "REVERSE").length, 2);
  }
});

test("refund lock rejects custody drift and incomplete units before a seller write; later layers may narrow eligibility", async () => {
  const f = await refundFixture(); await f.approve(); await f.checkpoint("prepare");
  f.rows.wasteAsset[0].custodyStatus = "OTHER_CUSTODY";
  await assert.rejects(f.phase("settle"), /lock or command changed/);
  assert.equal(f.rows.rewardLedgerEntry.filter(row => row.entryType === "REVERSE").length, 0);
  f.rows.wasteAsset[0].custodyStatus = "RECEIVED_BY_OPERATOR";
  f.rows.digitalEntitlement.length = 0;
  await assert.rejects(f.phase("settle"), /incomplete or ambiguous/);
  const custom = await refundFixture();
  SERVICE.DefaultDigitalCommerceOwnershipService = { ...ownership, refund: async function (r, items, phase) {
    const result = await ownership.refund.call(this, r, items, phase);
    return phase === "preview" ? { ...result, eligible: false, reason: "PROJECT_REVIEW_REQUIRED" } : result;
  } };
  assert.equal((await custom.phase("preview")).eligible, false);
  assert.equal(custom.rows.wasteAsset[0].assetStatus, "SOLD");
  assert.equal(custom.rows.rewardLedgerEntry.filter(row => row.entryType === "REVERSE").length, 0);
});

test("BSON Date ownership readback and original-sale refund preserve exact 123ms timestamps", async () => {
  const f = await refundFixture(), timestamp = "2026-10-09T12:34:56.123Z";
  const event = f.rows.wasteAssetOwnershipEvent[0];
  event.metadata.digitalSale.completedAt = timestamp;
  f.rows.wasteAsset[0].metadata.digitalSaleCompletedAt = timestamp;
  f.rows.digitalEntitlement[0].purchasedAt = new Date(timestamp);
  f.rows.digitalDelivery[0].deliveredAt = new Date(timestamp);
  const sale = domain.result(event, "DELIVERED");
  const command = ownership.command(f.request, sale);
  const bsonResponse = { ...sale, deliveredAt: new Date(timestamp), expiresAt: new Date(sale.expiresAt) };
  assert.equal(ownership.verify(f.request, command, bsonResponse, "DELIVERED"), bsonResponse);
  assert.throws(() => ownership.verify(f.request, command,
    { ...bsonResponse, deliveredAt: new Date("2026-10-09T12:34:56.124Z") }, "DELIVERED"), /evidence is unconfirmed/);
  await ownership.record(f.request, f.rows.commerceOrder[0], sale, true);
  assert.equal(f.rows.digitalEntitlement[0].purchasedAt.getUTCMilliseconds(), 123);
  assert.equal(f.rows.digitalDelivery[0].deliveredAt.getUTCMilliseconds(), 123);
  assert.equal((await f.phase("preview")).eligible, true);
  await f.approve(); await f.checkpoint("prepare"); await f.checkpoint("settle"); await f.payment(); await f.checkpoint("complete");
  assert.equal(f.rows.digitalEntitlement[0].status, "REVOKED");
  assert.equal(f.rows.digitalEntitlement[0].purchasedAt.getUTCMilliseconds(), 123);
  assert.equal(f.rows.digitalDelivery[0].deliveredAt.getUTCMilliseconds(), 123);
});

test("ownership timestamp checks reject millisecond drift, invalid dates and coercible non-date values", async () => {
  for (const value of [new Date("2026-10-09T12:34:56.124Z"), new Date("invalid"), null, 1791549296123]) {
    const f = await refundFixture(), timestamp = "2026-10-09T12:34:56.123Z";
    f.rows.wasteAssetOwnershipEvent[0].metadata.digitalSale.completedAt = timestamp;
    f.rows.wasteAsset[0].metadata.digitalSaleCompletedAt = timestamp;
    f.rows.digitalEntitlement[0].purchasedAt = value;
    await assert.rejects(f.phase("preview"), /original digital ownership entitlement/);
    assert.equal(f.rows.rewardLedgerEntry.filter(row => row.entryType === "REVERSE").length, 0);
  }
});

test("a missing original buyer ledger on the final context read gives explicit refusal, not a TypeError", async () => {
  const f = await refundFixture(); let reads = 0;
  SERVICE.DefaultEWasteDigitalSaleService = { ...domain, ledgerEvidence: async function (r, customerCode, terms, selectors) {
    const evidence = await domain.ledgerEvidence.call(this, r, customerCode, terms, selectors);
    if (selectors.entryCode === "buyer-debit" && ++reads === 2) return { ...evidence, entries: [] };
    return evidence;
  } };
  await assert.rejects(f.phase("preview"), error => {
    assert.equal(error instanceof TypeError, false);
    assert.match(error.message, /Original buyer debit is unconfirmed/);
    return true;
  });
  assert.equal(reads, 2); assert.equal(f.rows.wasteAsset[0].assetStatus, "SOLD");
});

test("source defaults report unavailable supply while selected missing owner and domain writes remain strict", async () => {
  const f = fixture(); delete f.config.digitalCore.digitalOwnership;
  const Enum = require('../../../../../../nodics.foundation/modules/nConfig/bin/enum');
  const previous = global.ENUMS;
  global.ENUMS = { DigitalOwnershipAvailabilityReason: new Enum(require('../../../../../../nodics.commerce/modules/digitalCommerce/modules/digitalCore/src/utils/enums').DigitalOwnershipAvailabilityReason.definition) };
  try {
    const result = await digital.availability({ ...f.request, productCode: "product", sku: "SKU", quantity: 1 });
    assert.equal(result.available, false); assert.equal(result.status, 'UNAVAILABLE');
    assert.equal(result.reasonCode, 'DIGITAL_OWNERSHIP_NOT_SELECTED');
    assert.equal(result.bindingCode, undefined); assert.equal(result.assetCode, undefined);
  } finally { global.ENUMS = previous; }
  f.config.digitalCore.digitalOwnership = { enabled: true, qualified: true };
  await assert.rejects(digital.availability({ ...f.request, productCode: "product", sku: "SKU", quantity: 1 }), /not qualified/);
  const defaults = require("../config/properties");
  assert.deepEqual(defaults.eWaste.marketplace.digitalOwnership, { enabled: false, qualified: false, allowedServicePrincipals: [], targets: {} });
  f.config.eWaste.marketplace.digitalOwnership = defaults.eWaste.marketplace.digitalOwnership;
  await assert.rejects(domain.invoke({ tenant: "t", authData: f.serviceAuth }, "availability"), /authority is unavailable/);
  assert.equal(f.counters.writes, 0);
});
test("availability returns the exact Checkout classification and never reserves", async () => {
  const f = fixture(); const result = await digital.availability({ ...f.request, productCode: "product", sku: "SKU", quantity: 1 });
  assert.equal(result.inventoryStrategy, "DIGITAL_COMMERCE"); assert.equal(result.productType, "DIGITAL"); assert.equal(result.digitalDeliveryType, "DIGITAL_OWNERSHIP");
  assert.equal(result.available, true); assert.equal(f.counters.writes, 0);
});
test("one canonical binding pins both retained locales without duplicating an asset or transfer", async () => {
  const f = fixture(), arabic = structuredClone(f.projection);
  Object.assign(arabic, { code: "product-projection-ar", locale: "ar", sourceHash: "retained-source-ar" });
  f.rows.productSearchProjection.push(arabic);
  f.binding.evidence.retainedProducts.push({ locale: "ar", code: arabic.code, sourceHash: arabic.sourceHash, publicationVersion: arabic.publicationVersion });
  SERVICE.DefaultProductDiscoveryService.searchPinned = async r => f.rows.productSearchProjection.filter(row => row.locale === r.locale);
  SERVICE.DefaultProductSearchEnrichmentService.retainedProjections = async (r, indexed) => indexed;
  for (const locale of ["en", "ar"]) {
    const available = await digital.availability({ ...f.request, locale, productCode: "product", sku: "SKU", quantity: 1 });
    assert.equal(available.bindingCode, "binding"); assert.equal(available.assetCode, "asset"); assert.equal(available.locale, locale);
  }
  assert.equal(f.counters.writes, 0);
  f.request.locale = "ar";
  const units = await f.acquire(), order = f.fund(units[0]);
  const sales = await digital.confirmSale(f.request, order, units);
  const deliveries = await digital.deliver(f.request, order, sales);
  assert.equal(deliveries[0].locale, "ar"); assert.equal(f.rows.wasteAssetOwnershipEvent.length, 1); assert.equal(f.rows.digitalProductBinding.length, 1);
});
test("retained Product, SKU, Store and reverse asset binding drift refuse before acquisition", async () => {
  for (const alter of [f => f.binding.sku = "forged", f => f.binding.evidence.retainedProducts[0].sourceHash = "forged",
    f => f.binding.providerReference.assetCode = "other", f => f.rows.store[0].enterpriseRef.code = "other",
    f => f.rows.wasteAssetMarketplaceProjection[0].commerceProductRef.code = "other"]) {
    const f = fixture(); alter(f); await assert.rejects(f.acquire()); assert.equal(f.counters.writes, 0);
  }
});
test("absent or unsupported approved settlement terms never manufacture a policy", async () => {
  for (const alter of [f => f.rows.wasteRewardSettlementPolicy[0].status = "DRAFT", f => delete f.rows.wasteAssetTransferPolicy[0].metadata,
    f => f.rows.wasteCarbonSettlementPolicy[0].settlementMode = "TRANSFER_TO_COUNTERPARTY", f => f.rows.wasteAssetTransferPolicy[0].completionCustodyStatus = "CUSTOMER_HELD",
    f => f.rows.wasteAssetTransferPolicy[0].requiresCounterpartyAcceptance = true]) {
    const f = fixture(); alter(f); await assert.rejects(f.acquire()); assert.equal(f.counters.writes, 0);
  }
});
test("reservation persists the full command, original expiry and seller lock; a competing buyer cannot acquire", async () => {
  const f = fixture(), [unit] = await f.acquire();
  const event = f.rows.wasteAssetOwnershipEvent[0]; assert.equal(unit.status, "RESERVED");
  assert.equal(Date.parse(unit.expiresAt) - Date.parse(event.occurredAt), 37000);
  assert.equal(event.metadata.digitalSale.command.buyerRef.code, "buyer"); assert.equal(event.metadata.digitalSale.command.storeCode, "s");
  assert.equal(event.metadata.digitalSale.command.orderCode, "order"); assert.equal(f.rows.wasteAsset[0].assetStatus, "SALE_PENDING");
  const replay = await f.acquire(); assert.equal(replay[0].expiresAt, unit.expiresAt); assert.equal(f.rows.wasteAssetOwnershipEvent.length, 1);
  await assert.rejects(digital.reserveForCheckout({ ...f.request, ownerId: "other-login", idempotencyKey: "other-command" }, { entries: [f.entry] }));
});
test("event-store interruption after the asset lock recovers the exact original event", async () => {
  const f = fixture(); f.failures["wasteAssetOwnershipEvent:save"] = "before";
  await assert.rejects(f.acquire(), error => error.digitalReservationRecoveryRequired === true && error.digitalReservations.length === 0);
  const original = structuredClone(f.rows.wasteAsset[0].metadata.pendingTransferEvent);
  const [unit] = await f.acquire(); assert.equal(unit.code, original.code); assert.equal(unit.expiresAt, original.metadata.digitalSale.expiresAt);
  assert.equal(f.rows.wasteAssetOwnershipEvent.length, 1);
});
test("lost asset-lock and event-create acknowledgements recover only exact readback", async () => {
  const f = fixture(); f.failures["wasteAsset:update"] = "after"; f.failures["wasteAssetOwnershipEvent:save"] = "after";
  const [unit] = await f.acquire(); assert.equal(unit.status, "RESERVED"); assert.equal(f.rows.wasteAssetOwnershipEvent.length, 1);
});
test("missing CAS/unique identity refuses, not qualified-by-flag", async () => {
  const f = fixture(); SERVICE.DefaultDatabaseModelHandlerService.inspectIndexes = async () => ({ indexes: [] });
  await assert.rejects(f.acquire()); assert.equal(f.rows.wasteAsset[0].assetStatus, "LISTED");
});
test("authorization rejects employee, wrong service, tenant and permission independently", async () => {
  for (const alter of [f => f.serviceAuth.principalType = "human", f => f.serviceAuth.principalId = "other",
    f => f.serviceAuth.tenant = "foreign", () => SERVICE.DefaultSecuredRequestPipelineService.isPermissionGranted = () => false]) {
    const f = fixture(); alter(f); await assert.rejects(f.acquire()); assert.equal(f.counters.writes, 0);
  }
});
test("signed and input tenant/enterprise aliases must all agree before any owner reads or writes", async () => {
  for (const alter of [r => r.authData.entCode = "foreign", r => r.entCode = "foreign", r => r.enterpriseCode = "foreign",
    r => r.tenantCode = "foreign", r => r.authData.tenantCode = "foreign", r => r.authData.entCode = "",
    r => r.entCode = null, r => r.authData.enterpriseCode = { code: "e" }, r => r.authData.tenant = " t"]) {
    const f = fixture(), request = { tenant: "t", enterpriseCode: "e", authData: structuredClone(f.serviceAuth) };
    alter(request);
    SERVICE.DefaultModuleService.invokeModule = async () => assert.fail("Alias denial must precede owner reads");
    await assert.rejects(domain.invoke(request, "availability"), /authority is unavailable/);
    assert.equal(f.counters.writes, 0); assert.equal(f.counters.earnings, 0);
  }
  const f = fixture(), request = { tenant: "t", tenantCode: "t", enterpriseCode: "e", entCode: "e",
    authData: { ...f.serviceAuth, tenantCode: "t", entCode: "e" }, payload: { enterpriseCode: "body-ignored", qualified: true } };
  assert.equal(domain.context(request).enterpriseCode, "e");
  delete request.authData.enterpriseCode;
  assert.equal(domain.context(request).enterpriseCode, "e");
});
test("signed principal and scope identifiers are bounded even when malformed values are allowlisted", async () => {
  for (const value of ["", " service", "service\n", "x".repeat(129), { code: "commerce-owner" }]) {
    const f = fixture(), request = { tenant: "t", authData: { ...f.serviceAuth, principalId: value } };
    f.config.eWaste.marketplace.digitalOwnership.allowedServicePrincipals = [value];
    assert.throws(() => domain.context(request), /authority is unavailable/); assert.equal(f.counters.writes, 0);
  }
  for (const patch of [{ tenant: "x".repeat(129) }, { enterpriseCode: "x".repeat(129) }, { enterpriseCode: "e\n" }]) {
    const f = fixture(), authData = { ...f.serviceAuth, ...patch };
    assert.throws(() => domain.context({ tenant: authData.tenant, authData }), /authority is unavailable/);
  }
  const f = fixture(); f.config.eWaste.marketplace.digitalOwnership.allowedServicePrincipals = "commerce-owner";
  assert.throws(() => domain.context({ tenant: "t", authData: f.serviceAuth }), /authority is unavailable/);
});
test("captured Payment, complete original order unit and buyer debit are required before seller settlement", async () => {
  for (const alter of [f => f.rows.paymentTransactionEntry[0].status = "AUTHORIZED", f => f.rows.paymentTransactionEntry[0].ownerId = "other",
    f => f.rows.commerceOrderEntry[0].sku = "other", f => f.rows.commerceOrderEntry.push({ ...f.rows.commerceOrderEntry[0], code: "extra" }),
    f => f.rows.rewardLedgerEntry[0].amount = "1.00", f => f.rows.loyaltyWallet[0].ownerCode = "other"]) {
    const f = fixture(), units = await f.acquire(), order = f.fund(units[0]); alter(f);
    await assert.rejects(digital.confirmSale(f.request, order, units)); assert.equal(f.counters.earnings, 0);
    assert.equal(f.rows.wasteAsset[0].ownerRef.code, "seller");
  }
});
test("capture binds exact merchant enterprise, original Checkout key and authorization-ledger chain", async () => {
  for (const alter of [f => f.rows.paymentTransactionEntry[0].enterpriseCode = "foreign", f => delete f.rows.paymentTransactionEntry[0].enterpriseCode,
    f => f.rows.paymentTransactionEntry[1].enterpriseCode = "foreign", f => f.rows.commerceOrder[0].idempotencyKey = "foreign",
    f => f.rows.paymentTransactionEntry[0].idempotencyKey = "foreign:payment:capture", f => f.rows.paymentTransactionEntry[1].idempotencyKey = "foreign:payment",
    f => f.rows.commerceOrder[0].evidence.paymentReference = "foreign", f => f.rows.paymentTransactionEntry[1].providerReference = "foreign",
    f => f.rows.rewardLedgerEntry[0].reservationCode = "foreign", f => f.rows.rewardLedgerEntry[0].targetCode = "foreign",
    f => f.rows.rewardLedgerEntry[0].idempotencyKey = "foreign:payment:capture", f => f.rows.paymentTransactionEntry[0].cartCode = "foreign"]) {
    const f = fixture(), units = await f.acquire(), order = f.fund(units[0]); alter(f);
    await assert.rejects(digital.confirmSale(f.request, order, units), /payment is unconfirmed|buyer debit is unconfirmed/);
    assert.equal(f.counters.earnings, 0); assert.equal(f.rows.wasteAsset[0].ownerRef.code, "seller");
  }
});
test("Store canonical reference forms preserve enterprise binding and reject contradictory aliases", async () => {
  for (const enterpriseRef of ["e", { code: "e" }, { module: "profile", schema: "enterprise", code: "e" },
    { moduleName: "profile", schemaName: "enterprise", code: "e" }]) {
    const f = fixture(); f.rows.store[0].enterpriseRef = enterpriseRef; assert.equal((await f.acquire())[0].status, "RESERVED");
  }
  for (const enterpriseRef of ["foreign", { moduleName: "other", schemaName: "enterprise", code: "e" },
    { moduleName: "profile", module: "other", schemaName: "enterprise", code: "e" }]) {
    const f = fixture(); f.rows.store[0].enterpriseRef = enterpriseRef; await assert.rejects(f.acquire(), /Store is unavailable/); assert.equal(f.counters.writes, 0);
  }
});
test("reservation ignores calculated entry locale and retains the authoritative Cart locale", async () => {
  const f = fixture(); f.entry.locale = "foreign";
  const [unit] = await f.acquire(); assert.equal(unit.locale, "en");
  assert.equal(f.rows.wasteAssetOwnershipEvent[0].metadata.digitalSale.command.locale, "en");
});
test("sale and delivery require original saved locale and Checkout key instead of later caller defaults", async () => {
  const f = fixture(), units = await f.acquire(), order = f.fund(units[0]);
  const later = { ...f.request, locale: "foreign", idempotencyKey: "later-caller-key" };
  const sales = await digital.confirmSale(later, order, units);
  const deliveries = await digital.deliver(later, order, sales);
  assert.equal(deliveries[0].locale, "en"); assert.equal(deliveries[0].checkoutIdempotencyKey, "checkout-key");
  for (const key of ["locale", "checkoutIdempotencyKey"]) {
    const partial = structuredClone(sales[0]); delete partial[key];
    await assert.rejects(digital.deliver(f.request, order, [partial]), /Stable digital ownership purchase identity/);
  }
  assert.equal(f.counters.earnings, 1);
});
test("sale and delivery retain original capture/ledger/time, replay without earnings and never change physical custody", async () => {
  const f = fixture(), units = await f.acquire(), order = f.fund(units[0]);
  const sales = await digital.confirmSale(f.request, order, units);
  const deliveries = await digital.deliver(f.request, order, sales);
  const replay = await digital.deliver(f.request, order, sales);
  assert.equal(deliveries[0].deliveredAt, replay[0].deliveredAt); assert.equal(f.counters.earnings, 1);
  assert.equal(f.rows.wasteAsset[0].ownerRef.code, "buyer"); assert.equal(f.rows.wasteAsset[0].physicalOwnerRef.code, "custodian");
  assert.equal(f.rows.wasteAsset[0].custodyStatus, "RECEIVED_BY_OPERATOR");
  assert.equal(f.rows.digitalEntitlement.length, 1); assert.equal(f.rows.digitalDelivery.length, 1);
  assert.equal(f.rows.wasteAssetOwnershipEvent[0].rewardSettlementRefs[0].code, "seller-credit");
  assert.deepEqual(f.rows.wasteAssetOwnershipEvent[0].carbonSettlementRefs, []);
});
test("seller settlement reads an existing tenant-less canonical wallet without wallet opening and preserves original delivery replay", async () => {
  const f = fixture(), units = await f.acquire(), order = f.fund(units[0]);
  for (const row of f.rows.loyaltyWallet) delete row.tenant;
  const wallets = structuredClone(f.rows.loyaltyWallet), calls = [], invoke = SERVICE.DefaultModuleService.invokeModule;
  SERVICE.DefaultModuleService.invokeModule = async input => {
    if (["/wallets", "/wallet-projections"].includes(input.apiName)) assert.fail("Seller discovery cannot open a wallet");
    if (input.apiName === "/wallet-evidence") calls.push(structuredClone(input));
    return invoke(input);
  };
  const sales = await digital.confirmSale(f.request, order, units);
  await digital.deliver(f.request, order, sales); await digital.confirmSale(f.request, order, units);
  assert.equal(calls.length, 1); assert.deepEqual(calls[0].requestBody, { enterpriseCode: "e", customerCode: "seller", programCode: "program", rewardTypeCode: "points" });
  assert.equal(calls[0].header["X-Enterprise-Code"], undefined);
  assert.equal(f.counters.earnings, 1); assert.deepEqual(f.rows.loyaltyWallet, wallets);
});
test("missing seller wallet refuses before credit without opening or creating a wallet", async () => {
  const f = fixture(), units = await f.acquire(), order = f.fund(units[0]);
  f.rows.loyaltyWallet = f.rows.loyaltyWallet.filter(row => row.ownerCode !== "seller");
  const wallets = structuredClone(f.rows.loyaltyWallet), invoke = SERVICE.DefaultModuleService.invokeModule;
  SERVICE.DefaultModuleService.invokeModule = input => {
    if (["/wallets", "/wallet-projections"].includes(input.apiName)) assert.fail("No wallet opening fallback");
    return invoke(input);
  };
  await assert.rejects(digital.confirmSale(f.request, order, units));
  assert.equal(f.counters.earnings, 0); assert.deepEqual(f.rows.loyaltyWallet, wallets);
  assert.equal(f.rows.rewardLedgerEntry.filter(row => row.entryType === "EARN").length, 0);
});
test("seller wallet owner refuses ambiguous, foreign, inactive and closed rows before credit", async () => {
  for (const change of [f => f.rows.loyaltyWallet.push({ ...f.rows.loyaltyWallet.find(row => row.ownerCode === "seller"), code: "duplicate" }),
    (_f, row) => { row.ownerCode = "foreign"; }, (_f, row) => { row.ownerType = "EMPLOYEE"; },
    (_f, row) => { row.tenant = "foreign"; }, (_f, row) => { row.active = false; }, (_f, row) => { row.status = "CLOSED"; }]) {
    const f = fixture(), units = await f.acquire(), order = f.fund(units[0]);
    change(f, f.rows.loyaltyWallet.find(row => row.ownerCode === "seller"));
    const before = structuredClone(f.rows.loyaltyWallet);
    await assert.rejects(digital.confirmSale(f.request, order, units), /unavailable/);
    assert.equal(f.counters.earnings, 0); assert.deepEqual(f.rows.loyaltyWallet, before);
    assert.equal(f.rows.digitalEntitlement.length, 0);
    assert.equal(f.rows.rewardLedgerEntry.filter(row => row.entryType === "CAPTURE").length, 1);
  }
});
test("seller independently rejects contradictory Loyalty envelope and exact wallet/balance fields before credit", async () => {
  for (const change of [value => { value.contractVersion = 2; }, value => { value.tenant = "foreign"; },
    value => { value.enterpriseCode = "foreign"; }, value => { value.customerCode = "buyer"; },
    value => { value.programCode = "foreign"; }, value => { value.rewardTypeCode = "foreign"; },
    value => { value.wallet.tenant = "foreign"; }, value => { value.wallet.ownerType = "EMPLOYEE"; },
    value => { value.wallet.ownerCode = "buyer"; }, value => { value.wallet.code = ""; },
    value => { value.wallet.active = false; }, value => { value.wallet.status = "CLOSED"; },
    value => { value.balance.walletCode = "buyer-wallet"; }, value => { value.balance.programCode = "foreign"; },
    value => { value.balance.rewardTypeCode = "foreign"; }, value => { value.balance.tenant = "foreign"; },
    value => { value.balance.active = false; }, value => { delete value.balance; }]) {
    const f = fixture(), units = await f.acquire(), order = f.fund(units[0]);
    f.rows.loyaltyWalletRewardBalance.push({ code: "seller-balance", walletCode: "seller-wallet", programCode: "program", rewardTypeCode: "points", available: "0.00", reserved: "0.00" });
    const wallets = structuredClone(f.rows.loyaltyWallet), invoke = SERVICE.DefaultModuleService.invokeModule;
    SERVICE.DefaultModuleService.invokeModule = async input => {
      const result = await invoke(input);
      if (input.apiName === "/wallet-evidence") change(result.data);
      return result;
    };
    await assert.rejects(digital.confirmSale(f.request, order, units), /seller wallet evidence/);
    assert.equal(f.counters.earnings, 0); assert.deepEqual(f.rows.loyaltyWallet, wallets);
    assert.equal(f.rows.rewardLedgerEntry.filter(row => row.entryType === "EARN").length, 0);
    assert.ok(f.rows.wasteAssetOwnershipEvent[0].metadata.digitalSale.capture);
  }
});
test("seller credit rechecks current approved policy, canonical Profile and response drift after wallet lookup", async () => {
  for (const mode of ["program", "reward", "revision", "inactive", "profile", "response"]) {
    const f = fixture(), units = await f.acquire(), order = f.fund(units[0]);
    const invoke = SERVICE.DefaultModuleService.invokeModule; let evidence, lookedUp = false;
    SERVICE.DefaultModuleService.invokeModule = async input => {
      const result = await invoke(input);
      if (input.apiName === "/wallet-evidence") {
        lookedUp = true; evidence = result.data;
        const policy = f.rows.wasteRewardSettlementPolicy[0];
        if (mode === "program") policy.metadata.digitalOwnership.programCode = "foreign";
        if (mode === "reward") policy.metadata.digitalOwnership.rewardTypeCode = "foreign";
        if (mode === "revision") policy.revision++;
        if (mode === "inactive") policy.active = false;
      } else if (lookedUp && input.moduleName === "profile") {
        if (mode === "profile") result.data.customer.active = false;
        if (mode === "response") evidence.enterpriseCode = "foreign";
      }
      return result;
    };
    await assert.rejects(digital.confirmSale(f.request, order, units), /changed|unavailable/);
    assert.equal(lookedUp, true); assert.equal(f.counters.earnings, 0);
    assert.equal(f.rows.digitalEntitlement.length, 0);
    assert.equal(f.rows.rewardLedgerEntry.filter(row => row.entryType === "CAPTURE").length, 1);
  }
});
test("seller wallet evidence preserves original delegated runtime and refuses credential or read-grant drift before credit", async () => {
  for (const mode of ["valid", "credential", "read-grant"]) {
    const f = fixture(), units = await f.acquire(), order = f.fund(units[0]), auth = f.serviceAuth;
    delete auth.principalId; auth.entCode = "default"; auth.enterpriseCode = "default";
    NODICS.getSelectedEnvironmentName = () => "local";
    f.config.eWaste.marketplace.digitalOwnership.businessCallers = [{ tenant: "t", principalEnterpriseCode: "default", enterpriseCode: "e", serviceId: auth.serviceId,
      ...auth.runtimeScope, permissions: ["waste.asset.sale.transfer"] }];
    f.config.runtimeRole = { code: "LOYALTY" };
    f.config.loyalty = { api: { readEvidence: { runtimeRole: "LOYALTY", callers: [{ tenant: "t", principalEnterpriseCode: "default", enterpriseCode: "e", serviceId: auth.serviceId, ...auth.runtimeScope }] } } };
    const before = structuredClone(auth), invoke = SERVICE.DefaultModuleService.invokeModule;
    SERVICE.DefaultModuleService.invokeModule = async input => {
      const result = await invoke(input);
      if (input.apiName === "/wallet-evidence") {
        assert.equal(input.header["X-Enterprise-Code"], undefined); assert.deepEqual(auth, before);
        if (mode === "credential") auth.entCode = "foreign";
      }
      return result;
    };
    // The consumer independently retains its original authority; Loyalty owns its read grant.
    if (mode === "read-grant") {
      const get = SERVICE.DefaultLoyaltyWalletService.get;
      SERVICE.DefaultLoyaltyWalletService.get = async input => {
        const result = await get(input); f.config.loyalty.api.readEvidence.callers = []; return result;
      };
    }
    if (mode === "valid") {
      await digital.confirmSale(f.request, order, units); assert.equal(f.counters.earnings, 1); assert.deepEqual(auth, before);
    } else {
      await assert.rejects(digital.confirmSale(f.request, order, units), /changed|unavailable/); assert.equal(f.counters.earnings, 0);
    }
  }
});
test("uncertain seller earning remains fenced and recovers using the original ledger command", async () => {
  const f = fixture(), units = await f.acquire(), order = f.fund(units[0]); f.failures.earning = "after";
  await assert.rejects(digital.confirmSale(f.request, order, units), /acknowledgement lost/);
  assert.ok(f.rows.wasteAssetOwnershipEvent[0].metadata.digitalSale.capture);
  assert.equal((await digital.releaseReservations(f.request, units))[0].status, "FAILED");
  await digital.confirmSale(f.request, order, units); assert.equal(f.rows.rewardLedgerEntry.filter(row => row.entryType === "EARN").length, 1);
});
test("ownership entitlement replay requires original complete evidence and active status without crediting again", async () => {
  for (const alter of [row => row.sku = "foreign", row => row.digitalDeliveryType = "COUPON_CODE", row => row.status = "REVOKED",
    row => row.active = false, row => delete row.evidence, row => row.evidence.assetCode = "foreign",
    row => row.evidence.bindingCode = "foreign", row => row.evidence.transferCode = "foreign",
    row => row.evidence.capture.ledgerCode = "foreign", row => row.evidence.capture.paymentRef.code = "foreign",
    row => row.evidence.settlement.rewardSettlementRefs[0].code = "foreign"]) {
    const f = fixture(), units = await f.acquire(), order = f.fund(units[0]);
    await digital.confirmSale(f.request, order, units);
    alter(f.rows.digitalEntitlement[0]);
    await assert.rejects(digital.confirmSale(f.request, order, units), /record evidence changed/);
    assert.equal(f.counters.earnings, 1); assert.equal(f.rows.digitalDelivery.length, 0);
    assert.equal(f.rows.rewardLedgerEntry.filter(row => row.entryType === "CAPTURE").length, 1);
  }
});
test("ownership delivery replay requires exact terminal readback, not a foreign partial same-code row", async () => {
  for (const alter of [row => row.status = "PENDING", row => row.active = false, row => row.deliveryType = "COUPON_CODE",
    row => row.deliveredAt = "2000-01-01T00:00:00.000Z", row => delete row.evidence,
    row => row.evidence.assetCode = "foreign", row => row.evidence.bindingCode = "foreign", row => row.evidence.transferCode = "foreign",
    row => row.evidence.capture.ledgerCode = "foreign", row => row.evidence.capture.paymentRef.code = "foreign",
    row => row.evidence.settlement.rewardSettlementRefs[0].code = "foreign"]) {
    const f = fixture(), units = await f.acquire(), order = f.fund(units[0]);
    const sales = await digital.confirmSale(f.request, order, units);
    await digital.deliver(f.request, order, sales); alter(f.rows.digitalDelivery[0]);
    await assert.rejects(digital.deliver(f.request, order, sales), /record evidence changed/);
    assert.equal(f.counters.earnings, 1); assert.equal(f.rows.digitalDelivery.length, 1);
  }
});
test("missing real owner endpoint remains explicitly unavailable with no fallback", async () => {
  const f = fixture(), invoke = SERVICE.DefaultModuleService.invokeModule;
  SERVICE.DefaultModuleService.invokeModule = async r => r.moduleName === "eWaste" ? { code: "ERR_ROUTE_UNAVAILABLE" } : invoke(r);
  await assert.rejects(f.acquire(), /owner failed/); assert.equal(f.counters.writes, 0); assert.equal(f.counters.earnings, 0);
});
test("completion event failure after ownership CAS recovers without repeating ownership", async () => {
  const f = fixture(), units = await f.acquire(), order = f.fund(units[0]);
  const original = SERVICE.DefaultWasteAssetTransferOperationService;
  SERVICE.DefaultWasteAssetTransferOperationService = { ...original, completeDigitalSale: async function (...args) {
    const repo = SERVICE.DefaultWasteAssetOwnershipEventService, update = repo.update;
    repo.update = async r => { if (r.model.transferStatus === "COMPLETED") { repo.update = update; throw new Error("final event unavailable"); } return update(r); };
    return original.completeDigitalSale.call(this, ...args);
  } };
  await assert.rejects(digital.confirmSale(f.request, order, units), /final event unavailable/);
  const revision = f.rows.wasteAsset[0].revision;
  SERVICE.DefaultWasteAssetTransferOperationService = original;
  const originalTime = f.rows.wasteAsset[0].metadata.digitalSaleCompletedAt;
  await digital.confirmSale(f.request, order, units); assert.equal(f.rows.wasteAsset[0].revision, revision + 1);
  assert.equal(f.counters.transfers, 1); assert.equal(f.rows.wasteAsset[0].metadata.digitalSaleCompletedAt, originalTime);
});
test("completed-event cleanup failure retains the lock and recovers original delivery time without another credit", async () => {
  const f = fixture(), units = await f.acquire(), order = f.fund(units[0]);
  const repository = SERVICE.DefaultWasteAssetService, update = repository.update;
  repository.update = async r => {
    if (r.model.assetStatus === "SOLD") { repository.update = update; throw new Error("cleanup unavailable"); }
    return update(r);
  };
  await assert.rejects(digital.confirmSale(f.request, order, units), /cleanup unavailable/);
  assert.equal(f.rows.wasteAssetOwnershipEvent[0].transferStatus, "COMPLETED"); assert.equal(f.rows.wasteAsset[0].assetStatus, "LOCKED");
  const originalTime = f.rows.wasteAssetOwnershipEvent[0].metadata.digitalSale.completedAt;
  const sales = await digital.confirmSale(f.request, order, units);
  const deliveries = await digital.deliver(f.request, order, sales);
  assert.equal(deliveries[0].deliveredAt, originalTime); assert.equal(f.counters.earnings, 1); assert.equal(f.counters.transfers, 1);
});
test("altered completed Waste timestamp and ledger references cannot qualify ownership delivery", async () => {
  for (const alter of [f => f.rows.wasteAssetOwnershipEvent[0].metadata.digitalSale.completedAt = "2000-01-01T00:00:00.000Z",
    f => f.rows.wasteAssetOwnershipEvent[0].metadata.digitalSale.settlement.rewardSettlementRefs[0].code = "foreign",
    f => f.rows.wasteAsset[0].metadata.pendingTransferCode = "foreign"]) {
    const f = fixture(), units = await f.acquire(), order = f.fund(units[0]);
    const sales = await digital.confirmSale(f.request, order, units); alter(f);
    await assert.rejects(digital.deliver(f.request, order, sales), /delivery is unconfirmed/);
    assert.equal(f.rows.digitalDelivery.length, 0); assert.equal(f.counters.earnings, 1);
  }
});
test("elapsed reservation alone never unlocks; proven pre-payment compensation permits persisted expiry", async () => {
  const f = fixture(), units = await f.acquire();
  f.rows.wasteAssetOwnershipEvent[0].metadata.digitalSale.expiresAt = "2000-01-01T00:00:00.000Z";
  assert.equal((await digital.releaseReservations(f.request, units))[0].status, "FAILED");
  f.rows.checkoutCheckpoint.push({ code: "checkout-key", tenant: "t", ownerId: "buyer-login", idempotencyKey: "checkout-key", status: "COMPENSATION_REQUIRED",
    evidence: { completed: ["VALIDATED", "CALCULATED", "DIGITAL_RESERVED"] } });
  const result = await digital.releaseReservations(f.request, units); assert.equal(result[0].status, "COMPLETED");
  assert.equal(f.rows.wasteAssetOwnershipEvent[0].transferStatus, "EXPIRED"); assert.equal(f.rows.wasteAsset[0].assetStatus, "LISTED");
});
test("cancelled original commands cannot reacquire or settle even under a fresh availability read", async () => {
  const f = fixture(), units = await f.acquire();
  f.rows.checkoutCheckpoint.push({ code: "checkout-key", tenant: "t", ownerId: "buyer-login", idempotencyKey: "checkout-key", status: "COMPENSATION_REQUIRED",
    evidence: { completed: ["VALIDATED", "CALCULATED", "DIGITAL_RESERVED"] } });
  assert.equal((await digital.releaseReservations(f.request, units))[0].status, "COMPLETED");
  await assert.rejects(f.acquire(), /original-command recovery/);
  const order = f.fund(units[0]); await assert.rejects(digital.confirmSale(f.request, order, units));
  assert.equal(f.rows.wasteAsset[0].ownerRef.code, "seller"); assert.equal(f.counters.earnings, 0);
});
test("authorized payment requires an exact durable VOID receipt before release", async () => {
  const f = fixture(), units = await f.acquire();
  f.rows.paymentTransactionEntry.push({ code: "order:authorization", tenant: "t", enterpriseCode: "e", ownerId: "buyer-login", orderCode: "order", status: "AUTHORIZED", evidence: { operation: "AUTHORIZE" } });
  const checkpoint = { code: "checkout-key", tenant: "t", ownerId: "buyer-login", idempotencyKey: "checkout-key", status: "COMPENSATION_REQUIRED", evidence: {
    paymentCompensationIntent: { tenant: "t", ownerId: "buyer-login", orderCode: "order", operation: "VOID" }, compensation: [] } };
  f.rows.checkoutCheckpoint.push(checkpoint);
  assert.equal((await digital.releaseReservations(f.request, units))[0].status, "FAILED");
  f.rows.paymentTransactionEntry.push({ code: "original-void", tenant: "t", enterpriseCode: "e", ownerId: "buyer-login", orderCode: "order", status: "VOIDED",
    idempotencyKey: "checkout-key:payment:void", providerReference: "released", evidence: { operation: "VOID" } });
  checkpoint.evidence.compensation.push({ type: "PAYMENT_VOID", status: "COMPLETED", paymentTransactionCode: "original-void", providerReference: "released", idempotencyKey: "checkout-key:payment:void" });
  assert.equal((await digital.releaseReservations(f.request, units))[0].status, "COMPLETED");
});
test("onward transfers refuse delivery and automatic refunds; ownership never inherits coupon revocation", async () => {
  const f = fixture(), units = await f.acquire(), order = f.fund(units[0]);
  const sales = await digital.confirmSale(f.request, order, units);
  f.rows.wasteAsset[0].ownerRef.code = "next-buyer"; f.rows.wasteAsset[0].metadata.lastTransferCode = "onward";
  await assert.rejects(digital.deliver(f.request, order, sales));
  assert.equal(reversal.eligible(f.rows.wasteAsset[0], f.rows.wasteAssetOwnershipEvent[0]), false);
  assert.equal(entitlement.revocationPolicy(f.rows.digitalEntitlement[0], "REFUND").refundable, false);
  assert.equal(entitlement.revocationPolicy(f.rows.digitalEntitlement[0], "RETURN").policyDecision, "BLOCKED");
});
test("altered original seller ledger refuses delivery despite completed ownership", async () => {
  const f = fixture(), units = await f.acquire(), order = f.fund(units[0]);
  const sales = await digital.confirmSale(f.request, order, units);
  f.rows.rewardLedgerEntry.find(row => row.entryType === "EARN").amount = "999.00";
  await assert.rejects(digital.deliver(f.request, order, sales), /ledger evidence changed/);
  assert.equal(f.rows.digitalDelivery.length, 0);
});
test("new ownership sales require reviewed refund policy and refuse onward-transfer preview", async () => {
  const f = fixture(), units = await f.acquire(), order = f.fund(units[0]);
  await digital.confirmSale(f.request, order, units);
  SERVICE.DefaultWasteAssetReversalOperationService = reversal;
  SERVICE.DefaultEWasteExperienceService = { settings: () => ({ marketplace: { refundsEnabled: true, orderCodePrefix: "order" } }),
    remote: async () => [{ code: "buyer" }] };
  const request = { tenant: "t", enterpriseCode: "e", authData: f.serviceAuth,
    payload: { orderCode: "order", refundCode: "refund", ownerId: "buyer-login", totalAmount: "12.00" } };
  assert.equal((await orderReversal.preview(request)).reason, "DIGITAL_OWNERSHIP_REFUND_POLICY_REQUIRES_REVIEW");
  for (const phase of ["prepare", "settle", "complete"])
    await assert.rejects(orderReversal[phase](request), /Reviewed digital ownership refund policy/);
  f.rows.wasteAsset[0].metadata.lastTransferCode = "onward";
  assert.equal((await orderReversal.preview(request)).reason, "ASSET_MOVED_OR_LOCKED"); assert.equal(f.counters.earnings, 1);
});
test("contradictory asset metadata and missing digital owner refuse before acquisition", async () => {
  const f = fixture(); f.entry.availability.inventoryStrategy = "PHYSICAL_STOCK";
  await assert.rejects(f.acquire(), /Contradictory/);
  f.entry.availability.inventoryStrategy = "DIGITAL_COMMERCE"; delete SERVICE.DefaultDigitalCommerceOwnershipService;
  await assert.rejects(f.acquire(), /owner is required/); assert.equal(f.counters.writes, 0);
});
test("later-loaded availability override is honored without copying pinned Product lookup or coupon owners", async () => {
  const f = fixture(); let seen = false;
  SERVICE.DefaultDigitalCommerceOwnershipService = { ...ownership, availability: async function (r, projection) {
    seen = true; const result = await ownership.availability.call(this, r, projection); return { ...result, available: false };
  } };
  assert.equal((await digital.availability({ ...f.request, productCode: "product", sku: "SKU", quantity: 1 })).available, false);
  assert.equal(seen, true); assert.equal(f.counters.writes, 0);
});
