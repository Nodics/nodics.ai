/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
"use strict";
const { isDeepStrictEqual } = require("node:util");
const inspection = require("../../../../../../../nodics.waste/modules/wasteCore/src/service/defaultWasteInstalledDataInspectionService");
const diagnostics = require("../utils/digitalSaleDiagnostics");
/** @module eWaste/service/defaultEWasteDigitalSaleEvidenceService
 * @description Exact private original-sale ownership evidence through Waste's verified generated-read partition. Tenant-less domain rows stay unchanged; response tenant is an envelope projection, never persisted authority. No arbitrary query, mutation, grant or inspector disclosure expansion.
 * @layer service @owner eWaste
 */
const owner = {
  fail(gate = "OWNER") { throw new Error("Exact original digital ownership evidence is unavailable: " + gate); },
  async dependency(gate, operation) {
    try { return await operation(); }
    catch (error) {
      if (Object.hasOwn(diagnostics.codes, error?.message)) throw error;
      this.fail(gate);
    }
  },
  async read(input, stage, helpers) {
    const sale = SERVICE.DefaultEWasteDigitalSaleService, waste = SERVICE.DefaultWasteAssetTransferOperationService;
    const request = input.privateRequest;
    if (!request || SERVICE.DefaultLoggerService?.hasPrivateCaptureProtection?.(request) !== true ||
        await this.dependency("PRIVATE_OWNER", () => SERVICE.DefaultServiceTokenService.requireRuntimePrincipal(request, "eWaste")) !== input.authData ||
        Object.keys(request.query || request.httpRequest?.query || {}).length) this.fail("PRIVATE_REQUEST");
    const r = await this.dependency("CONTEXT_OWNER", () => sale.context(input)), p = r.payload;
    stage.gate = "EVIDENCE_SELECTORS";
    const fields = ["contractVersion", "kind", "bindingCode", "productCode", "sku", "storeCode", "locale", "assetCode",
      ...(["PURCHASE", "REFUND"].includes(p.kind) ? ["code", "ownerId", "orderCode", "entryCode", "checkoutIdempotencyKey"] : []),
      ...(p.kind === "REFUND" ? ["refundCode"] : [])];
    if (p.contractVersion !== 1 || !["LISTING", "PURCHASE", "REFUND"].includes(p.kind) ||
        !isDeepStrictEqual(Object.keys(p).sort(), fields.sort()) || fields.some(k => !["contractVersion", "kind"].includes(k) &&
          (typeof p[k] !== "string" || !/^[A-Za-z0-9][A-Za-z0-9_.:@|\-]{0,191}$/.test(p[k])))) this.fail("SELECTORS");
    stage.gate = "EVIDENCE_SNAPSHOT";
    const auth = structuredClone(input.authData), policy = structuredClone(r.settings);
    const scope = { tenant: r.tenant, enterpriseCode: r.enterpriseCode };
    const originalScope = { tenant: input.tenant, enterpriseCode: input.enterpriseCode, entCode: input.entCode };
    const check = () => { stage.gate = "EVIDENCE_AUTHORITY"; sale.recheckAuthority(r); if (!isDeepStrictEqual(request.authData, auth) ||
      !isDeepStrictEqual(input.authData, auth) || !isDeepStrictEqual(r.authData, auth) ||
      request.tenant !== auth.tenant || r.tenant !== scope.tenant || r.enterpriseCode !== scope.enterpriseCode ||
      !isDeepStrictEqual({ tenant: input.tenant, enterpriseCode: input.enterpriseCode, entCode: input.entCode }, originalScope) ||
      !isDeepStrictEqual(CONFIG.get("eWaste")?.marketplace?.digitalOwnership, policy) ||
      SERVICE.DefaultLoggerService.hasPrivateCaptureProtection(request) !== true) this.fail("AUTHORITY_DRIFT"); };
    check();
    const resolved = await this.dependency("BINDING_OWNER", () => sale.binding(r)), { asset, projection, policies } = resolved;
    check();
    stage.gate = "EVIDENCE_PROJECTION";
    if (asset.code !== p.assetCode || resolved.ref.assetCode !== p.assetCode ||
        (asset.tenant !== undefined && asset.tenant !== scope.tenant)) this.fail("ASSET_SCOPE");
    const evidence = { contractVersion: 1, kind: p.kind, tenant: r.tenant, enterpriseCode: r.enterpriseCode,
      asset: { ...helpers.project(asset, ["code", "active", "revision", "assetStatus", "ownerRef", "digitalOwnerRef", "physicalOwnerRef", "custodyStatus", "marketplaceProjectionRef"]), tenant: scope.tenant },
      projection: { ...helpers.project(projection, ["code", "active", "revision", "projectionStatus", "assetCode", "commerceProductRef", "ownerRef"]), tenant: scope.tenant },
      policies: Object.fromEntries(Object.entries(policies).map(([name, value]) => [name,
        { ...helpers.project(value, ["code", "active", "status", "revision", "walletCurrencyCode", "settlementMode"]), tenant: scope.tenant,
          ...(name !== "carbon" ? { metadata: { digitalOwnership: structuredClone(value.metadata?.digitalOwnership) } } : {}) }])),
      pins: { asset: helpers.checksum(asset), projection: helpers.checksum(projection), ...Object.fromEntries(Object.entries(policies).map(([name, value]) => [name, helpers.checksum(value)])) } };
    evidence.asset.metadata = helpers.project(asset.metadata || {}, ["pendingTransferCode", "pendingRefundCode", "lastTransferCode"]);
    const observations = [["wasteAsset", asset], ["wasteAssetMarketplaceProjection", projection],
      ["wasteAssetTransferPolicy", policies.transfer], ["wasteRewardSettlementPolicy", policies.reward], ["wasteCarbonSettlementPolicy", policies.carbon]];
    if (p.kind === "LISTING") {
      if (asset.assetStatus !== "LISTED" || asset.metadata?.pendingTransferCode || asset.metadata?.pendingRefundCode ||
          !isDeepStrictEqual(asset.ownerRef, resolved.ref.sellerRef) || !isDeepStrictEqual(asset.digitalOwnerRef, resolved.ref.sellerRef)) this.fail();
      if (!isDeepStrictEqual(await this.dependency("CUSTOMER_OWNER", () => sale.buyer(r, asset.ownerRef.code)), asset.ownerRef)) this.fail();
    } else {
      stage.gate = "EVIDENCE_EVENT";
      const stored = await waste.digitalRead(r, "wasteAssetOwnershipEvent", p.code), command = stored?.metadata?.digitalSale?.command;
      if (!command) this.fail();
      const event = await sale.event({ ...r, payload: { ...p, idempotencyKey: command.idempotencyKey } });
      if (event.transferStatus !== "COMPLETED" || event.assetCode !== asset.code || !isDeepStrictEqual(command.policies, policies) ||
          command.projectionCode !== projection.code || !isDeepStrictEqual(command.sellerRef, resolved.ref.sellerRef)) this.fail();
      evidence.sale = { ...helpers.project(event, ["code", "tenant", "active", "revision", "assetCode", "transferType", "transferStatus", "fromOwnerRef", "toOwnerRef", "commerceOrderRef", "rewardSettlementRefs", "carbonSettlementRefs"]),
        tenant: scope.tenant,
        metadata: { digitalSale: helpers.project(event.metadata.digitalSale, ["capture", "settlement", "completedAt"]) } };
      evidence.pins.sale = helpers.checksum(event); observations.push(["wasteAssetOwnershipEvent", event]);
      if (p.kind === "PURCHASE") {
        if (asset.assetStatus !== "SOLD" || asset.metadata?.lastTransferCode !== event.code || asset.metadata?.pendingTransferCode ||
            !isDeepStrictEqual(asset.ownerRef, command.buyerRef) || !isDeepStrictEqual(asset.digitalOwnerRef, command.buyerRef)) this.fail();
      } else {
        const reversal = await waste.digitalRead(r, "wasteAssetOwnershipEvent", asset.metadata?.lastTransferCode), refund = reversal?.metadata?.digitalRefund;
        if (!reversal || reversal.active !== true || reversal.assetCode !== asset.code || reversal.transferType !== "REVERSAL" ||
            reversal.transferStatus !== "COMPLETED" || reversal.triggerRef?.code !== event.code || refund?.command?.refundCode !== p.refundCode ||
            refund.command.orderCode !== command.orderCode || refund.command.ownerId !== command.ownerId || asset.assetStatus !== "OWNED" ||
            asset.metadata?.pendingRefundCode || !isDeepStrictEqual(asset.ownerRef, command.sellerRef) || !isDeepStrictEqual(asset.digitalOwnerRef, command.sellerRef)) this.fail();
        evidence.reversal = { ...helpers.project(reversal, ["code", "tenant", "active", "revision", "assetCode", "transferType", "transferStatus", "triggerRef"]),
          tenant: scope.tenant,
          metadata: { digitalRefund: { command: helpers.project(refund.command, ["refundCode", "orderCode", "ownerId"]),
            ...helpers.project(refund, ["sellerReversalRef", "paymentRef"]) } } };
        evidence.pins.reversal = helpers.checksum(reversal); observations.push(["wasteAssetOwnershipEvent", reversal]);
      }
    }
    // Verify the actual generated-read envelope, not a tenant field absent from operational schemas.
    for (const [schema, record] of observations) {
      check();
      if (!record?.code || (record.tenant !== undefined && record.tenant !== scope.tenant)) this.fail();
      stage.gate = "EVIDENCE_GENERATED_CONTEXT";
      const storedRequest = { ...waste.store().context(r), query: { code: record.code },
        searchOptions: { pageSize: 2, pageNumber: 1 }, options: { recursive: false, skipItemCache: true } };
      if (storedRequest.tenant !== scope.tenant || storedRequest.authData?.tenant !== scope.tenant) this.fail("GENERATED_PARTITION");
      const storedAuth = structuredClone(storedRequest.authData);
      const response = await this.dependency("GENERATED_READ_OWNER", () => waste.store().repository(schema).get(storedRequest));
      check();
      stage.gate = "EVIDENCE_GENERATED_RECORDS";
      const expectedPage = { pageSize: 2, pageNumber: 1 };
      const boundedPage = [expectedPage, { ...expectedPage, limit: 2, skip: 0, snapshot: false }]
        .some(value => isDeepStrictEqual(storedRequest.searchOptions, value));
      if (storedRequest.tenant !== scope.tenant || !isDeepStrictEqual(storedRequest.authData, storedAuth) ||
          !isDeepStrictEqual(storedRequest.query, { code: record.code }) ||
          !boundedPage ||
          !isDeepStrictEqual(storedRequest.options, { recursive: false, skipItemCache: true }) ||
          !/^SUC_/.test(response?.code || "") || response.error || response.success === false || response.acknowledged === false ||
          (response.errors && (!Array.isArray(response.errors) || response.errors.length)) || !Array.isArray(response.result) ||
          response.result.length !== 1 || [response.count, response.total, response.totalCount].some(value => value !== undefined && value !== 1)) this.fail("GENERATED_ENVELOPE");
      const stored = waste.store().records(response)[0];
      if (!stored || (stored.tenant !== undefined && stored.tenant !== scope.tenant) || !isDeepStrictEqual(record, stored)) this.fail("GENERATED_READBACK");
    }
    check(); return evidence;
  },
};
module.exports = {
  /** Hashes the original stored record before envelope projection. @param {*} value Stored value. @returns {string} Waste-owned checksum. */
  checksum: function (value) { return inspection.checksum(value); },
  /** Detaches only selected fields without mutating owner records. @param {Object} record Stored record. @param {string[]} fields Exact projection fields. @returns {Object|undefined} Detached projection. */
  project: function (record, fields) { return record && Object.fromEntries(fields.filter(k => record[k] !== undefined).map(k => [k, structuredClone(record[k])])); },
  /** Only fixed owner stage names cross the private boundary; error details remain masked. */
  read: async function (input) {
    const stage = { gate: "EVIDENCE_PRIVATE" };
    // Detached entrypoint calls retain defaults; effective receivers supply later-layer pure helpers.
    try { return await owner.read(input, stage, this || module.exports); }
    catch (error) {
      if (Object.hasOwn(diagnostics.codes, error?.message)) throw error;
      owner.fail(stage.gate);
    }
  },
};
