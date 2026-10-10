/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";
const { isDeepStrictEqual } = require("node:util");
const businessAdmissions = new WeakMap();
/** @module eWaste/service/defaultEWasteDigitalSaleService @description Secured persisted digital-sale orchestration over Waste locks, Commerce capture and Loyalty ledgers; never implies physical custody. @layer service @owner eWaste @override Later layers select exact active policies and trusted service principals; no policy or qualification is enabled by this source. */
module.exports = {
  /** Uses canonical pure decimal arithmetic without activating the Pricing runtime. Later owner layers may replace this accessor. */
  amount: function () {
    return require("../../../../../../../nodics.foundation/modules/nCommon/src/utils/exactAmount");
  },
  /** Reads exact timestamp milliseconds for native Date fields and transport strings; other values remain invalid. */
  timestamp: function (value) {
    return value instanceof Date ? value.getTime() : typeof value === "string" ? Date.parse(value) : NaN;
  },
  /** Checks signed scoped authority for owner-selected operations; this alone never admits a sale. */
  authority: function (input, permission) {
    const p = (CONFIG.get("eWaste") || {}).marketplace?.digitalOwnership || {}, a = input.authData || {};
    const principalEnterpriseCode = a.enterpriseCode || a.entCode;
    const runtimeIdentity = a.principalId === undefined;
    const serviceIdentity = runtimeIdentity ? a.serviceId : a.principalId;
    const enterpriseCode = input.enterpriseCode ?? principalEnterpriseCode;
    const identifier = value => typeof value === "string" && /^[A-Za-z0-9_.:@-]{1,128}$/.test(value);
    const tenants = [a.tenant, a.tenantCode, input.tenant, input.tenantCode].filter(value => value !== undefined);
    const enterprises = [input.enterpriseCode, input.entCode].filter(value => value !== undefined);
    const security = SERVICE.DefaultSecuredRequestPipelineService;
    if (a.tokenType !== "service" || a.principalType !== "service" ||
        !identifier(serviceIdentity) || !Array.isArray(p.allowedServicePrincipals) || !p.allowedServicePrincipals.includes(serviceIdentity) ||
        !identifier(a.tenant) || !identifier(input.tenant) || tenants.some(value => !identifier(value) || value !== a.tenant) ||
        !identifier(principalEnterpriseCode) || [a.enterpriseCode, a.entCode].some(value => value !== undefined && value !== principalEnterpriseCode) ||
        [input.privateRequest?.enterpriseCode, input.privateRequest?.entCode, input.privateRequest?.httpRequest?.headers?.["x-enterprise-code"]]
          .some(value => value !== undefined && value !== principalEnterpriseCode) ||
        !identifier(enterpriseCode) || enterprises.some(value => !identifier(value) || value !== enterpriseCode) ||
        !security?.isPermissionGranted(permission, security.getGrantedPermissions(input), {}))
      throw new Error("Digital ownership service authority is unavailable");
    const delegated = enterpriseCode !== principalEnterpriseCode;
    if (runtimeIdentity || delegated) {
      if (!input.privateRequest || SERVICE.DefaultServiceTokenService?.requireRuntimePrincipal?.(input.privateRequest, "eWaste") !== a ||
          a.isSystem || !a.permissions?.includes(permission) ||
          SERVICE.DefaultLoggerService?.hasPrivateCaptureProtection?.(input.privateRequest) !== true)
        throw new Error("Digital ownership service authority is unavailable");
    }
    if (delegated) {
      if (!input.privateRequest || !Array.isArray(p.businessCallers)) throw new Error("Digital ownership service authority is unavailable");
      const grants = (Array.isArray(p.businessCallers) ? p.businessCallers : []).filter(g => g.tenant === a.tenant &&
        g.principalEnterpriseCode === principalEnterpriseCode && g.enterpriseCode === enterpriseCode && g.serviceId === a.serviceId &&
        Array.isArray(g.permissions) && g.permissions.includes(permission) &&
        ["projectCode", "environmentCode", "serverCode", "instanceCode", "assignmentCode"].every(k => identifier(g[k]) && g[k] === a.runtimeScope?.[k]) &&
        g.instanceCode === a.runtimeInstanceId && g.environmentCode === NODICS.getSelectedEnvironmentName());
      if (grants.length !== 1) throw new Error("Digital ownership service authority is unavailable");
    }
    const r = { tenant: a.tenant, enterpriseCode, authData: structuredClone(a), correlationId: input.correlationId,
      payload: structuredClone(input.payload || {}), settings: p };
    if (runtimeIdentity || delegated) businessAdmissions.set(r, { input, auth: structuredClone(a), policy: structuredClone(p) });
    return r;
  },
  /** Rechecks original delegated authority across asynchronous owner transport without rewriting token enterprise/groups. */
  recheckAuthority: function (r) {
    const proof = businessAdmissions.get(r);
    if (proof && (!isDeepStrictEqual(proof.input.privateRequest.authData, proof.auth) || !isDeepStrictEqual(r.authData, proof.auth) ||
        [proof.input.privateRequest.enterpriseCode, proof.input.privateRequest.entCode, proof.input.privateRequest.httpRequest?.headers?.["x-enterprise-code"]]
          .some(value => value !== undefined && value !== (proof.auth.enterpriseCode || proof.auth.entCode)) ||
        !isDeepStrictEqual(CONFIG.get("eWaste")?.marketplace?.digitalOwnership, proof.policy) ||
        NODICS.getSelectedEnvironmentName() !== proof.auth.runtimeScope.environmentCode ||
        SERVICE.DefaultLoggerService.hasPrivateCaptureProtection(proof.input.privateRequest) !== true))
      throw new Error("Digital ownership service authority changed");
  },
  /** Requires explicit integration selection in addition to signed transfer authority. */
  context: function (input) {
    const r = this.authority(input, "waste.asset.sale.transfer");
    if (r.settings.enabled !== true || r.settings.qualified !== true)
      throw new Error("Digital ownership service authority is unavailable");
    return r;
  },
  /** Calls only existing owning APIs with server-selected targets, no caller-selected services or automatic retries. */
  remote: async function (r, moduleName, connectionName, apiName, body, principalNamespace = false) {
    this.recheckAuthority(r);
    if (!r.settings.targets?.[connectionName]) throw new Error("Digital-sale owner target is unavailable");
    const result = await SERVICE.DefaultModuleService.invokeModule({ local: false, moduleName, connectionName,
      targetAuthority: r.settings.targets?.[connectionName], apiName, methodName: "POST", tenant: r.tenant,
      request: { tenant: r.tenant }, requestBody: body,
      header: { ...(principalNamespace ? {} : { "X-Enterprise-Code": r.enterpriseCode }), "Idempotency-Key": body.idempotencyKey || r.payload.idempotencyKey,
        "X-Correlation-Id": r.correlationId || r.payload.idempotencyKey }, timeoutMs: 15000, maxAttempts: 1 });
    this.recheckAuthority(r);
    let value = result;
    for (let n = 0; n < 6 && value; n++) {
      if (value.error || value.success === false || value.acknowledged === false ||
          (value.errors && (!Array.isArray(value.errors) || value.errors.length)) || /^ERR_/.test(value.code || "")) throw new Error("Digital-sale owner response failed");
      if (value.count !== undefined) {
        const rows = value.result ?? value.data;
        if (!Array.isArray(rows) || value.count !== rows.length) throw new Error("Digital-sale owner read is truncated");
      }
      if (value.result !== undefined) value = value.result;
      else if (value.data !== undefined) value = value.data;
      else break;
    }
    return value;
  },
  /** Generic schema HTTP is not an integration contract, including when the module router happens to be enabled. */
  rows: async function (r, moduleName, connectionName, schema, query) {
    throw new Error("Use exact capability evidence, not generic schema HTTP");
  },
  /** Calls the declared fixed Commerce evidence owner with exact commands and no generic-schema fallback. */
  commerceEvidence: async function (r, kind, selectors) {
    if (!["LISTING", "BINDING", "PURCHASE", "REFUND"].includes(kind))
      throw new Error("Canonical Commerce ownership evidence route is unavailable");
    const value = await this.remote(r, "digitalCore", "commerce", "/internal/ownership/evidence/query", { contractVersion: 1, kind, enterpriseCode: r.enterpriseCode, ...selectors }, true);
    if (value?.contractVersion !== 1 || value.kind !== kind) throw new Error("Exact Commerce ownership evidence is unconfirmed");
    return value;
  },
  /** Exact original command selectors prevent an approved refund read from becoming an arbitrary schema query. */
  purchaseSelectors: function (event) {
    const c = event.metadata.digitalSale.command;
    return { bindingCode: c.binding.code, productCode: c.productCode, sku: c.sku, storeCode: c.storeCode, locale: c.locale,
      ownerId: c.ownerId, orderCode: c.orderCode, entryCode: c.entryCode, checkoutIdempotencyKey: c.checkoutIdempotencyKey, providerCode: event.code };
  },
  /** Reads purchase or approved-refund evidence from its original persisted Waste event, never caller query objects. */
  purchaseEvidence: function (r, event, refund = false) {
    return this.commerceEvidence(r, refund ? "REFUND" : "PURCHASE", { ...this.purchaseSelectors(event),
      ...(refund ? { entitlementCode: r.payload.entitlementCode, refundCode: r.payload.refundCode } : {}) });
  },
  /** Normalizes only schema-mirrored Payment fields; partition, owner, status, totals and keys never fall back to evidence. */
  paymentEvidence: function (row) {
    if (!row || !row.evidence) throw new Error("Exact captured digital-sale payment is unconfirmed");
    const value = { ...row };
    for (const field of ["operation", "methodCode", "providerCode", "providerReference"]) {
      const canonical = row.evidence[field];
      if (typeof canonical !== "string" || !canonical || (row[field] !== undefined && row[field] !== canonical))
        throw new Error("Exact captured digital-sale payment is unconfirmed");
      if (row[field] === undefined) value[field] = canonical;
    }
    if (row.amount !== undefined && row.amount !== row.totalAmount) throw new Error("Exact captured digital-sale payment is unconfirmed");
    if (row.amount === undefined) value.amount = row.totalAmount;
    return value;
  },
  /** Reads the canonical Loyalty evidence capability with exact customer and source binding, never a hidden schema route. */
  ledgerEvidence: async function (r, customerCode, terms, selectors) {
    const evidence = await this.remote(r, "loyaltyApi", "loyalty", "/reward-ledger-evidence", {
      enterpriseCode: r.enterpriseCode, customerCode, programCode: terms.programCode, rewardTypeCode: terms.rewardTypeCode, ...selectors }, true);
    if (evidence?.contractVersion !== 1 || evidence.tenant !== r.tenant || evidence.enterpriseCode !== r.enterpriseCode ||
        evidence.customerCode !== customerCode || evidence.wallet?.tenant !== r.tenant || evidence.wallet.ownerType !== "CUSTOMER" ||
        evidence.wallet.ownerCode !== customerCode || evidence.wallet.status !== "OPEN" || evidence.wallet.active === false || !evidence.wallet.code ||
        (selectors.earningIdempotencyKey && !isDeepStrictEqual(evidence.ledgerSelection, { entryType: "EARN",
          sourceType: selectors.sourceType, sourceCode: selectors.sourceCode, idempotencyKey: selectors.earningIdempotencyKey,
          programCode: terms.programCode, rewardTypeCode: terms.rewardTypeCode })) ||
        !Array.isArray(evidence.entries) || evidence.entries.length > 1 || evidence.entries.some(entry =>
          entry.tenant !== r.tenant || entry.walletCode !== evidence.wallet.code || entry.programCode !== terms.programCode ||
          entry.rewardTypeCode !== terms.rewardTypeCode || entry.sourceType !== selectors.sourceType || entry.sourceCode !== selectors.sourceCode ||
          (selectors.earningIdempotencyKey ? entry.entryType !== "EARN" || entry.idempotencyKey !== selectors.earningIdempotencyKey || entry.reversalOfEntryCode :
            selectors.entryCode ? entry.code !== selectors.entryCode : entry.reversalOfEntryCode !== selectors.reversalOfEntryCode || entry.entryType !== "REVERSE")))
      throw new Error("Exact Loyalty owner evidence is unconfirmed");
    return evidence;
  },
  /** Reads an existing exact seller wallet under current pinned policies; no wallet opening or schema HTTP fallback. */
  sellerWalletEvidence: async function (r, event) {
    const command = structuredClone(event.metadata.digitalSale.command), terms = command.policies.reward.metadata.digitalOwnership;
    const current = async () => {
      this.recheckAuthority(r);
      const projection = await SERVICE.DefaultWasteAssetTransferOperationService.digitalRead(r, "wasteAssetMarketplaceProjection", command.projectionCode);
      if (r.tenant !== command.tenant || r.enterpriseCode !== command.enterpriseCode ||
          !projection || projection.active !== true || projection.assetCode !== command.assetCode ||
          !isDeepStrictEqual(await this.policies(r, command.binding.providerReference, projection), command.policies) ||
          !isDeepStrictEqual(await this.buyer(r, command.sellerRef.code), command.sellerRef) ||
          !isDeepStrictEqual(event.metadata.digitalSale.command, command))
        throw new Error("Original seller settlement scope changed");
      this.recheckAuthority(r);
    };
    await current();
    const evidence = await this.remote(r, "loyaltyApi", "loyalty", "/wallet-evidence", {
      enterpriseCode: r.enterpriseCode, customerCode: command.sellerRef.code,
      programCode: terms.programCode, rewardTypeCode: terms.rewardTypeCode }, true);
    const wallet = evidence?.wallet, balance = evidence?.balance;
    if (evidence?.contractVersion !== 1 || evidence.tenant !== r.tenant || evidence.enterpriseCode !== r.enterpriseCode ||
        evidence.customerCode !== command.sellerRef.code || evidence.programCode !== terms.programCode || evidence.rewardTypeCode !== terms.rewardTypeCode ||
        typeof wallet?.code !== "string" || !/^[A-Za-z0-9][A-Za-z0-9_.:@|\-]{0,191}$/.test(wallet.code) ||
        wallet.tenant !== r.tenant || wallet.ownerType !== "CUSTOMER" || wallet.ownerCode !== command.sellerRef.code ||
        wallet.status !== "OPEN" || wallet.active === false ||
        (balance !== null && (!balance?.code || balance.tenant !== r.tenant || balance.walletCode !== wallet.code ||
          balance.programCode !== terms.programCode || balance.rewardTypeCode !== terms.rewardTypeCode || balance.active === false)))
      throw new Error("Exact seller wallet evidence is unconfirmed");
    const confirmed = structuredClone(evidence);
    await current();
    if (!isDeepStrictEqual(evidence, confirmed)) throw new Error("Exact seller wallet evidence changed");
    return confirmed.wallet;
  },
  /** Resolves one current canonical Profile customer, retaining login-to-code distinction. */
  buyer: async function (r, ownerId) {
    const path = r.settings.customerEvidenceApiName;
    if (typeof ownerId !== "string" || !/^[A-Za-z0-9_.:@|\-]{1,192}$/.test(ownerId) ||
        typeof path !== "string" || !/^\/internal\/[A-Za-z0-9_/-]{1,180}$/.test(path))
      throw new Error("Canonical Profile customer evidence route is unavailable");
    const evidence = await this.remote(r, "profile", "profile", path, { contractVersion: 1, enterpriseCode: r.enterpriseCode, identifier: ownerId }, true);
    const customer = evidence?.customer;
    if (evidence?.contractVersion !== 1 || evidence.tenant !== r.tenant || evidence.enterpriseCode !== r.enterpriseCode ||
        customer?.active !== true || !customer.code || (customer.code !== ownerId && customer.loginId !== ownerId))
      throw new Error("Digital-sale buyer is unavailable");
    return { module: "profile", schema: "customer", code: customer.code };
  },
  /** Re-reads canonical binding, reverse Waste projection and three exact active policies. Unsupported modes refuse rather than invent settlement. */
  binding: async function (r) {
    const p = r.payload, store = SERVICE.DefaultWasteAssetTransferOperationService;
    for (const key of ["bindingCode", "productCode", "sku", "storeCode", "locale"])
      if (typeof p[key] !== "string" || !/^[A-Za-z0-9_.:@|\-]{1,192}$/.test(p[key])) throw new Error("Exact digital binding is required");
    const evidence = await this.commerceEvidence(r, "BINDING", { bindingCode: p.bindingCode,
      productCode: p.productCode, sku: p.sku, storeCode: p.storeCode, locale: p.locale });
    const rows = evidence.binding ? [evidence.binding] : [];
    const b = rows[0], ref = b?.providerReference;
    if (rows.length !== 1 || b.active !== true || b.tenant !== r.tenant || b.enterpriseCode !== r.enterpriseCode ||
        b.code !== p.bindingCode || b.productCode !== p.productCode || b.sku !== p.sku || b.status !== "ACTIVE" ||
        b.digitalDeliveryType !== "DIGITAL_OWNERSHIP" || b.inventoryStrategy !== "DIGITAL_COMMERCE" || b.providerOwner !== "wasteCore" ||
        ref?.storeCode !== p.storeCode || !ref.assetCode || !ref.projectionCode ||
        ref.sellerRef?.module !== "profile" || ref.sellerRef.schema !== "customer" || !ref.sellerRef.code)
      throw new Error("Digital ownership binding is unavailable");
    const projection = await store.digitalRead(r, "wasteAssetMarketplaceProjection", ref.projectionCode);
    const asset = await store.digitalRead(r, "wasteAsset", ref.assetCode);
    if (!projection || projection.active !== true || projection.projectionStatus !== "LISTED" || projection.assetCode !== ref.assetCode ||
        !isDeepStrictEqual(projection.commerceProductRef, { module: "product", schema: "product", code: b.productCode }) ||
        projection.metadata?.storeCode !== p.storeCode || projection.metadata?.sku !== p.sku ||
        !isDeepStrictEqual(projection.ownerRef, ref.sellerRef) || !asset || asset.active !== true)
      throw new Error("Waste reverse Product binding is unavailable");
    const pins = b.evidence?.retainedProducts;
    if (!Array.isArray(pins) || !pins.length || pins.length > 20 || new Set(pins.map(pin => pin.locale)).size !== pins.length)
      throw new Error("Retained Product locale proof is required");
    const pin = pins.find(value => value.locale === p.locale);
    if (!pin?.code || !pin.sourceHash || !pin.publicationVersion) throw new Error("Retained Product proof is required");
    const retained = evidence.product ? [evidence.product] : [];
    const product = retained[0];
    if (retained.length !== 1 || product.tenant !== r.tenant || product.enterpriseCode !== r.enterpriseCode ||
        product.productCode !== p.productCode || product.storeCode !== p.storeCode || product.locale !== p.locale || !["CURRENT", "STALE"].includes(product.status) ||
        product.sourceHash !== pin.sourceHash || product.publicationVersion !== pin.publicationVersion ||
        product.payload?.variantSkuMap?.[b.variantCode] !== p.sku || product.payload?.localizedAttributes?.assetCode !== ref.assetCode ||
        product.payload?.localizedAttributes?.productType !== "DIGITAL" || product.payload?.localizedAttributes?.inventoryStrategy !== "DIGITAL_COMMERCE" ||
        product.payload?.localizedAttributes?.digitalDeliveryType !== "DIGITAL_OWNERSHIP")
      throw new Error("Retained Product proof changed");
    const stores = evidence.store ? [evidence.store] : [];
    const merchantStore = stores[0], enterpriseRef = merchantStore?.enterpriseRef;
    // StoreContext owns these reference forms; the remote read must preserve the same enterprise/type checks.
    if (stores.length !== 1 || merchantStore.code !== p.storeCode || merchantStore.active !== true || merchantStore.status !== "ACTIVE" ||
        !Number.isSafeInteger(merchantStore.revision) || merchantStore.revision < 1 ||
        (typeof enterpriseRef === "string" ? enterpriseRef : enterpriseRef?.code) !== r.enterpriseCode ||
        (typeof enterpriseRef === "object" && ([enterpriseRef.moduleName, enterpriseRef.module].some(v => v !== undefined && v !== "profile") ||
          [enterpriseRef.schemaName, enterpriseRef.schema].some(v => v !== undefined && v !== "enterprise"))))
      throw new Error("Canonical digital-sale Store is unavailable");
    const policies = await this.policies(r, ref, projection);
    return { binding: b, ref, asset, projection, policies };
  },
  /** Resolves current supported policy terms for both onboarding and sale; selectors never supply policy records. */
  policies: async function (r, ref, projection) {
    const store = SERVICE.DefaultWasteAssetTransferOperationService, policies = {};
    for (const [name, schema] of [["transfer", "wasteAssetTransferPolicy"], ["reward", "wasteRewardSettlementPolicy"], ["carbon", "wasteCarbonSettlementPolicy"]]) {
      const key = name === "transfer" ? "transferPolicyCode" : name + "SettlementPolicyCode";
      if (!ref[key] || projection[key] !== ref[key]) throw new Error("Exact digital-sale policy is required");
      const policy = await store.digitalRead(r, schema, ref[key]);
      if (!policy || policy.active !== true || policy.status !== "ACTIVE" || !Number.isSafeInteger(policy.revision) ||
          (policy.effectiveFrom && (!Number.isFinite(this.timestamp(policy.effectiveFrom)) || this.timestamp(policy.effectiveFrom) > Date.now())) ||
          (policy.effectiveTo && (!Number.isFinite(this.timestamp(policy.effectiveTo)) || this.timestamp(policy.effectiveTo) <= Date.now()))) throw new Error("Digital-sale policy is unavailable");
      policies[name] = policy;
    }
    const t = policies.transfer, reward = policies.reward, carbon = policies.carbon, terms = reward.metadata?.digitalOwnership;
    if (t.transferType !== "SELL" || t.ownershipTransferMode !== "TRANSFER_TO_COUNTERPARTY" || t.completionAssetStatus !== "SOLD" ||
        t.cancellationAssetStatus !== "LISTED" || t.completionCustodyStatus || t.requiresReceiptConfirmation || t.requiresComplianceReview || t.requiresCounterpartyAcceptance ||
        t.allowSelfTransfer !== false || t.lockRequired !== true || t.rewardTransferMode !== "RETAIN_ORIGINAL_OWNER" ||
        !Number.isSafeInteger(t.metadata?.digitalOwnership?.reservationSeconds) || t.metadata.digitalOwnership.reservationSeconds < 1 || t.metadata.digitalOwnership.reservationSeconds > 86400 ||
        reward.triggerType !== "SALE" || reward.settlementMode !== "POLICY_RESOLVED" || terms?.version !== 1 ||
        terms.proceeds !== "CAPTURED_TOTAL" || terms.payee !== "CURRENT_SELLER" || !terms.programCode || !terms.rewardTypeCode || !reward.walletCurrencyCode ||
        !Number.isSafeInteger(terms.scale) || terms.scale < 0 || terms.scale > 12 ||
        carbon.triggerType !== "SALE" || carbon.settlementMode !== "NONE" || t.carbonTransferMode !== "NONE")
      throw new Error("Digital-sale settlement policy is unsupported or incomplete");
    return policies;
  },
  /** Builds the immutable complete purchase command; neither caller asset IDs nor mutable prices become authority. */
  command: async function (r, resolved) {
    const p = r.payload;
    for (const key of ["ownerId", "orderCode", "entryCode", "idempotencyKey", "checkoutIdempotencyKey"])
      if (typeof p[key] !== "string" || !/^[A-Za-z0-9_.:@|\-]{1,192}$/.test(p[key])) throw new Error("Stable digital purchase identity is required");
    if (!isDeepStrictEqual(await this.buyer(r, resolved.ref.sellerRef.code), resolved.ref.sellerRef))
      throw new Error("Canonical seller changed");
    return { tenant: r.tenant, enterpriseCode: r.enterpriseCode, ownerId: p.ownerId, orderCode: p.orderCode,
      entryCode: p.entryCode, productCode: p.productCode, sku: p.sku, storeCode: p.storeCode, locale: p.locale, idempotencyKey: p.idempotencyKey, checkoutIdempotencyKey: p.checkoutIdempotencyKey,
      assetCode: resolved.ref.assetCode, projectionCode: resolved.ref.projectionCode, sellerRef: resolved.ref.sellerRef,
      buyerRef: await this.buyer(r, p.ownerId), transferPolicyCode: resolved.policies.transfer.code,
      binding: resolved.binding, policies: resolved.policies };
  },
  /** Returns the current source-scoped persisted event; supplied reservation snapshots never authorize mutation. */
  event: async function (r) {
    if (typeof r.payload.code !== "string" || !/^TRANSFER_[A-F0-9]{32}$/.test(r.payload.code))
      throw new Error("Original digital-sale reservation is unavailable");
    const event = await SERVICE.DefaultWasteAssetTransferOperationService.digitalRead(r, "wasteAssetOwnershipEvent", r.payload.code);
    const c = event?.metadata?.digitalSale?.command;
    if (!c || c.tenant !== r.tenant || c.enterpriseCode !== r.enterpriseCode ||
        c.binding?.code !== r.payload.bindingCode || event.active !== true || event.assetCode !== c.assetCode || event.transferType !== "SELL" ||
        !isDeepStrictEqual(event.fromOwnerRef, c.sellerRef) || !isDeepStrictEqual(event.toOwnerRef, c.buyerRef) ||
        !isDeepStrictEqual(event.commerceOrderRef, { module: "order", schema: "commerceOrder", code: c.orderCode }) ||
        ["ownerId", "orderCode", "entryCode", "productCode", "sku", "storeCode", "locale", "idempotencyKey", "checkoutIdempotencyKey"].some(key => c[key] !== r.payload[key]))
      throw new Error("Original digital-sale reservation is unavailable");
    return event;
  },
  /** Fingerprints the persisted complete command using Waste's existing canonical evidence checksum. */
  compensationDigest: function (event) {
    return require("../../../../../../../nodics.waste/modules/wasteCore/src/service/defaultWasteInstalledDataInspectionService")
      .checksum(event.metadata.digitalSale.command);
  },
  /** Resolves a bounded original unit from its reservation and authenticated checkout scope, never current Cart/Product data. */
  resolveCompensation: async function (r) {
    const p = r.payload, keys = ["contractVersion", "code", "ownerId", "orderCode", "checkoutIdempotencyKey"];
    if (p.contractVersion !== 1 || !isDeepStrictEqual(Object.keys(p).sort(), keys.sort()) ||
        !/^TRANSFER_[A-F0-9]{32}$/.test(p.code || "") || ["ownerId", "orderCode", "checkoutIdempotencyKey"].some(k => typeof p[k] !== "string" || !/^[A-Za-z0-9_.:@|\-]{1,192}$/.test(p[k])))
      throw new Error("Original digital-sale reservation is unavailable");
    const waste = SERVICE.DefaultWasteAssetTransferOperationService;
    const original = await waste.digitalRead(r, "wasteAssetOwnershipEvent", p.code), c = original?.metadata?.digitalSale?.command;
    if (!c || ["ownerId", "orderCode", "checkoutIdempotencyKey"].some(k => c[k] !== p[k]) ||
        ["entryCode", "productCode", "sku", "storeCode", "locale", "assetCode", "projectionCode"].some(k => typeof c[k] !== "string" || !c[k]) ||
        !c.binding?.code || c.idempotencyKey !== c.checkoutIdempotencyKey + ":digital:" + c.entryCode + ":0" ||
        original.idempotencyKey !== c.idempotencyKey || original.policyCode !== c.transferPolicyCode ||
        original.code !== waste.digitalEventCode(r, c))
      throw new Error("Original digital-sale reservation is unavailable");
    r.payload = { code: original.code, bindingCode: c.binding.code,
      ...Object.fromEntries(["ownerId", "orderCode", "entryCode", "productCode", "sku", "storeCode", "locale", "idempotencyKey", "checkoutIdempotencyKey"].map(k => [k, c[k]])) };
    let event = await this.event(r);
    await waste.digitalCompensationState(r, event);
    await this.refundedCompensationProof(r, event);
    this.recheckAuthority(r);
    const current = await this.event(r);
    if (!isDeepStrictEqual(current, event)) throw new Error("Original digital compensation changed");
    const { evidence, ...unit } = this.result(event, "ORIGINAL_COMMAND_RESOLVED");
    return { ...unit, contractVersion: 1, eventRevision: event.revision, commandDigest: this.compensationDigest(event) };
  },
  /** Qualifies the original failed captured checkout and its full completed buyer refund, including original Loyalty reversal readback. */
  refundedCompensationProof: async function (r, event) {
    const c = event.metadata.digitalSale.command, evidence = await this.purchaseEvidence(r, event);
    const capture = await this.captureEvidence(r, event, ["PLACED"]), exact = this.amount();
    const checkpoints = evidence.checkpoints, payments = Array.isArray(evidence.payments) ? evidence.payments.map(p => this.paymentEvidence(p)) : evidence.payments;
    const checkpoint = checkpoints?.[0], intent = checkpoint?.evidence?.paymentCompensationIntent;
    const receipts = checkpoint?.evidence?.compensation;
    const stages = ["VALIDATED", "CALCULATED", "RESERVED", "DIGITAL_RESERVED", "AUTHORIZED", "ORDERED", "PAYMENT_CAPTURED"];
    if (!Array.isArray(checkpoints) || checkpoints.length !== 1 || checkpoint.tenant !== r.tenant || checkpoint.ownerId !== c.ownerId ||
        checkpoint.code !== c.checkoutIdempotencyKey || checkpoint.idempotencyKey !== c.checkoutIdempotencyKey ||
        (checkpoint.enterpriseCode !== undefined && checkpoint.enterpriseCode !== r.enterpriseCode) ||
        !["COMPENSATION_REQUIRED", "COMPENSATED"].includes(checkpoint.status) || !Number.isSafeInteger(checkpoint.revision) || checkpoint.revision < 0 ||
        !isDeepStrictEqual(checkpoint.evidence?.completed, stages) || checkpoint.evidence.inventoryReservationRecoveryRequired !== false ||
        checkpoint.evidence.digitalReservationRecoveryRequired !== false || checkpoint.evidence.digitalReservationUncertainKey ||
        !Array.isArray(receipts) || receipts.length !== 2 || !Array.isArray(payments) || payments.length !== 3)
      throw new Error("Original buyer Payment refund is unconfirmed");
    const refunds = payments.filter(p => p.evidence?.operation === "REFUND"), refund = refunds[0];
    const paymentReceipts = receipts.filter(p => p.type === "PAYMENT_REFUND"), receipt = paymentReceipts[0];
    const releases = receipts.filter(p => p.type === "DIGITAL_OWNERSHIP_RELEASE"), release = releases[0];
    const payment = payments.find(p => p.code === capture.paymentRef.code), order = evidence.orders?.[0];
    const expectedIntent = { tenant: r.tenant, enterpriseCode: r.enterpriseCode, ownerId: c.ownerId, orderCode: c.orderCode,
      cartCode: order?.cartCode, operation: "REFUND", idempotencyKey: c.checkoutIdempotencyKey + ":payment:refund",
      originalPaymentTransactionCode: capture.paymentRef.code, originalIdempotencyKey: c.checkoutIdempotencyKey + ":payment:capture",
      originalProviderReference: capture.ledgerCode, providerCode: payment?.providerCode, methodCode: payment?.methodCode,
      amount: capture.amount, currency: capture.currency };
    if (!isDeepStrictEqual(intent, expectedIntent) || releases.length !== 1 || release.code !== event.code || release.status !== "FAILED" ||
        release.errorCode !== "DIGITAL_OWNERSHIP_RECOVERY_REQUIRED" || paymentReceipts.length !== 1 || receipt.status !== "COMPLETED" ||
        receipt.paymentStatus !== "REFUND_SUCCEEDED" || refunds.length !== 1 || refund.active !== true || refund.tenant !== r.tenant ||
        refund.enterpriseCode !== r.enterpriseCode || refund.ownerId !== c.ownerId || refund.orderCode !== c.orderCode || refund.cartCode !== order.cartCode ||
        refund.code !== c.checkoutIdempotencyKey + ":refund" || refund.idempotencyKey !== expectedIntent.idempotencyKey ||
        refund.status !== "REFUND_SUCCEEDED" || refund.operation !== "REFUND" || refund.methodCode !== payment.methodCode ||
        refund.providerCode !== payment.providerCode || refund.currency !== capture.currency || !refund.providerReference ||
        receipt.providerReference !== refund.providerReference || receipt.paymentTransactionCode !== refund.code || receipt.idempotencyKey !== refund.idempotencyKey ||
        [payment, refund].some(p => p.reconciliationRequired === true || p.evidence?.originalRefundUnconfirmed === true) ||
        exact.compare(String(refund.amount), capture.amount) !== 0 || exact.compare(String(refund.totalAmount), capture.amount) !== 0)
      throw new Error("Original buyer Payment refund is unconfirmed");
    const terms = c.policies.reward.metadata.digitalOwnership;
    const loyalty = await this.ledgerEvidence(r, c.buyerRef.code, terms,
      { reversalOfEntryCode: capture.ledgerCode, sourceType: "PAYMENT", sourceCode: c.orderCode });
    const ledger = loyalty.entries[0];
    if (loyalty.entries.length !== 1 || ledger.code !== refund.providerReference || ledger.walletCode !== payment.evidence.walletCode ||
        ledger.idempotencyKey !== refund.idempotencyKey || exact.compare(String(ledger.amount), capture.amount) !== 0)
      throw new Error("Original buyer refund ledger is unconfirmed");
    return { contractVersion: 1, reservationCode: event.code, checkoutIdempotencyKey: c.checkoutIdempotencyKey,
      commandDigest: this.compensationDigest(event), capture, refundRef: { module: "paymentCore", schema: "paymentTransactionEntry", code: refund.code },
      refundLedgerCode: ledger.code, paymentCompensationIntent: structuredClone(intent), paymentReceipt: structuredClone(receipt),
      originalRelease: structuredClone(release), completed: stages };
  },
  /** Fences before successful owner absence reads; no financial operation, entitlement creation, owner transfer or custody change is allowed. */
  cancelRefundedCompensation: async function (r, event) {
    const waste = SERVICE.DefaultWasteAssetTransferOperationService;
    await waste.digitalCompensationState(r, event);
    const proof = await this.refundedCompensationProof(r, event);
    this.recheckAuthority(r);
    event = await waste.fenceDigitalCompensation(r, event, proof);
    const c = event.metadata.digitalSale.command, terms = c.policies.reward.metadata.digitalOwnership;
    const evidence = await this.purchaseEvidence(r, event);
    // The fixed Commerce owner itself requires an explicit successful generated count before returning this array.
    if (!Array.isArray(evidence.entitlements) || evidence.entitlements.length !== 0)
      throw new Error("Digital compensation absence is unconfirmed");
    const earningIdempotencyKey = event.code + ":sale-proceeds";
    const loyalty = await this.ledgerEvidence(r, c.sellerRef.code, terms,
      { earningIdempotencyKey, sourceType: "WASTE_ASSET_SALE", sourceCode: event.code });
    if (loyalty.entries.length !== 0) throw new Error("Digital compensation absence is unconfirmed");
    if (!isDeepStrictEqual(proof, await this.refundedCompensationProof(r, event))) throw new Error("Original digital compensation changed");
    this.recheckAuthority(r);
    return this.result(await waste.completeDigitalCompensation(r, event, proof, { contractVersion: 1,
      reservationCode: event.code, entitlementCount: 0, sellerEarningCount: 0, sellerWalletCode: loyalty.wallet.code, earningIdempotencyKey }), "CANCELLED");
  },
  /** Verifies a fresh canonical Order entry and unique captured Payment. Refund coordination supplies its independently approved locked Order states. */
  capture: async function (r, event, orderStatuses = ["PLACED", "COMPLETED", "FULFILLED"]) {
    const check = async () => {
      this.recheckAuthority(r);
      const current = await SERVICE.DefaultWasteAssetTransferOperationService.digitalRead(r, "wasteAssetOwnershipEvent", event.code);
      if (!current || !["RESERVED", "COMPLETED"].includes(current.transferStatus) || current.metadata?.digitalSale?.compensationRecovery ||
          !isDeepStrictEqual(current.metadata?.digitalSale?.command, event.metadata?.digitalSale?.command))
        throw new Error("Digital sale cannot settle");
    };
    await check();
    const capture = await this.captureEvidence(r, event, orderStatuses);
    await check();
    return capture;
  },
  /** Reads original financial evidence independently of transfer state; recovery must qualify and fence that state separately. */
  captureEvidence: async function (r, event, orderStatuses = ["PLACED", "COMPLETED", "FULFILLED"]) {
    const c = event.metadata.digitalSale.command;
    const evidence = await this.purchaseEvidence(r, event);
    if (![evidence.orders, evidence.entries, evidence.payments].every(Array.isArray)) throw new Error("Exact captured digital-sale payment is unconfirmed");
    const orders = evidence.orders, entries = evidence.entries;
    const payments = evidence.payments.map(row => this.paymentEvidence(row));
    const captures = payments.filter(row => row.operation === "CAPTURE");
    const authorizations = payments.filter(row => row.code === c.orderCode + ":authorization");
    const order = orders[0], entry = entries[0], payment = captures[0], authorization = authorizations[0], exact = this.amount();
    if (orders.length !== 1 || entries.length !== 1 || captures.length !== 1 || order?.active !== true || order.tenant !== r.tenant || order.enterpriseCode !== r.enterpriseCode ||
        order.ownerId !== c.ownerId || order.code !== c.orderCode || order.idempotencyKey !== c.checkoutIdempotencyKey ||
        !order.cartCode || !orderStatuses.includes(order.status) ||
        order.evidence?.storeCode !== c.storeCode || entry.active !== true || entry.tenant !== r.tenant || entry.enterpriseCode !== r.enterpriseCode ||
        entry.code !== c.orderCode + ":" + c.entryCode || entry.orderCode !== c.orderCode || entry.ownerId !== c.ownerId ||
        entry.productCode !== c.productCode || entry.sku !== c.sku || String(entry.quantity) !== "1" || entry.cartCode !== order.cartCode ||
        entry.idempotencyKey !== c.checkoutIdempotencyKey + ":order-entry:" + c.entryCode ||
        payment.active !== true || payment.tenant !== r.tenant || payment.orderCode !== c.orderCode || payment.ownerId !== c.ownerId ||
        payment.enterpriseCode !== c.enterpriseCode || payment.cartCode !== order.cartCode || payment.code !== c.orderCode + ":capture" ||
        payment.idempotencyKey !== c.checkoutIdempotencyKey + ":payment:capture" ||
        payment.status !== "CAPTURED" || payment.evidence?.operation !== "CAPTURE" || payment.methodCode !== "LOYALTY_REWARD" ||
        payment.providerCode !== "loyalty-reward-points" || order.evidence.paymentMethod !== payment.methodCode || order.evidence.paymentProvider !== payment.providerCode ||
        authorizations.length !== 1 || authorization.active !== true || authorization.tenant !== r.tenant || authorization.enterpriseCode !== c.enterpriseCode ||
        authorization.orderCode !== c.orderCode || authorization.ownerId !== c.ownerId || authorization.cartCode !== order.cartCode ||
        authorization.idempotencyKey !== c.checkoutIdempotencyKey + ":payment" || authorization.status !== "AUTHORIZED" ||
        authorization.evidence?.operation !== "AUTHORIZE" || authorization.methodCode !== payment.methodCode || authorization.providerCode !== payment.providerCode ||
        !authorization.providerReference || order.evidence.paymentReference !== authorization.providerReference || authorization.currency !== payment.currency ||
        payment.currency !== c.policies.reward.walletCurrencyCode || order.currency !== payment.currency ||
        !exact?.compare || exact.compare(String(payment.totalAmount), String(order.totalAmount)) !== 0 ||
        exact.compare(String(authorization.totalAmount), String(payment.totalAmount)) !== 0 ||
        !Array.isArray(entry.evidence?.digitalReservationCodes) || !entry.evidence.digitalReservationCodes.includes(event.code) || !payment.providerReference ||
        exact.compare(String(payment.totalAmount), "0") <= 0)
      throw new Error("Exact captured digital-sale payment is unconfirmed");
    const terms = c.policies.reward.metadata.digitalOwnership;
    const loyaltyEvidence = await this.ledgerEvidence(r, c.buyerRef.code, terms, { entryCode: payment.providerReference, sourceType: "PAYMENT", sourceCode: c.orderCode });
    const ledgers = loyaltyEvidence.entries, ledger = ledgers[0];
    if (ledgers.length !== 1 || ledger.code !== payment.providerReference || ledger.entryType !== "CAPTURE" || ledger.programCode !== terms.programCode ||
        ledger.rewardTypeCode !== terms.rewardTypeCode || exact.compare(String(ledger.amount), String(payment.totalAmount)) !== 0 || !ledger.walletCode ||
        ledger.idempotencyKey !== payment.idempotencyKey || ledger.sourceType !== "PAYMENT" || ledger.sourceCode !== c.orderCode ||
        ledger.targetType !== "ORDER" || ledger.targetCode !== c.orderCode || ledger.reservationCode !== authorization.providerReference ||
        [payment, authorization].some(row => row.evidence.walletCode !== ledger.walletCode || row.evidence.programCode !== terms.programCode || row.evidence.rewardTypeCode !== terms.rewardTypeCode))
      throw new Error("Original buyer debit is unconfirmed");
    const wallets = [loyaltyEvidence.wallet];
    if (wallets.length !== 1 || wallets[0].code !== ledger.walletCode || wallets[0].ownerType !== "CUSTOMER" || wallets[0].ownerCode !== c.buyerRef.code)
      throw new Error("Captured buyer wallet changed");
    return { paymentRef: { module: "paymentCore", schema: "paymentTransactionEntry", code: payment.code },
      authorizationRef: { module: "paymentCore", schema: "paymentTransactionEntry", code: authorization.code },
      enterpriseCode: c.enterpriseCode, checkoutIdempotencyKey: c.checkoutIdempotencyKey, reservationCode: authorization.providerReference,
      ledgerCode: payment.providerReference, amount: String(payment.totalAmount), currency: payment.currency };
  },
  /** Maps durable Waste evidence to DigitalCore's existing checkout contract, without asserting physical delivery. */
  result: function (event, status) {
    const d = event.metadata.digitalSale, c = d.command;
    return { code: event.code, status, digitalDeliveryType: "DIGITAL_OWNERSHIP", providerOwner: "wasteCore",
      tenant: c.tenant, enterpriseCode: c.enterpriseCode, ownerId: c.ownerId, soldTo: c.ownerId, orderCode: c.orderCode,
      entryCode: c.entryCode, productCode: c.productCode, sku: c.sku, storeCode: c.storeCode, locale: c.locale, assetCode: c.assetCode,
      bindingCode: c.binding.code, idempotencyKey: c.idempotencyKey, checkoutIdempotencyKey: c.checkoutIdempotencyKey, expiresAt: d.expiresAt,
      soldAt: d.completedAt, deliveredAt: status === "DELIVERED" ? d.completedAt : undefined,
      evidence: { transferCode: event.code, buyerRef: c.buyerRef, sellerRef: c.sellerRef,
        capture: d.capture, settlement: d.settlement, physicalCustodyTransferred: false } };
  },
  /** Re-reads the original seller ledger and payee wallet before acknowledging delivery or a completed-sale replay. */
  verifySettlement: async function (r, event) {
    const d = event.metadata.digitalSale, c = d.command, refs = event.rewardSettlementRefs;
    if (!Array.isArray(refs) || refs.length !== 1 || refs[0].module !== "loyaltyLedger" || refs[0].schema !== "rewardLedgerEntry" ||
        !Array.isArray(event.carbonSettlementRefs) || event.carbonSettlementRefs.length)
      throw new Error("Original digital-sale ledger references are incomplete");
    const terms = c.policies.reward.metadata.digitalOwnership;
    const evidence = await this.ledgerEvidence(r, c.sellerRef.code, terms, { entryCode: refs[0].code, sourceType: "WASTE_ASSET_SALE", sourceCode: event.code });
    const rows = evidence.entries, entry = rows[0];
    if (rows.length !== 1 || entry.code !== refs[0].code || entry.entryType !== "EARN" || entry.sourceType !== "WASTE_ASSET_SALE" ||
        entry.sourceCode !== event.code || entry.idempotencyKey !== event.code + ":sale-proceeds" || entry.programCode !== terms.programCode ||
        entry.rewardTypeCode !== terms.rewardTypeCode || this.amount().compare(String(entry.amount), d.capture.amount) !== 0)
      throw new Error("Original digital-sale ledger evidence changed");
    const wallets = [evidence.wallet];
    if (wallets.length !== 1 || wallets[0].code !== entry.walletCode || wallets[0].ownerType !== "CUSTOMER" || wallets[0].ownerCode !== c.sellerRef.code)
      throw new Error("Original seller wallet changed");
  },
  /** Coordinates allowlisted phases only. Missing policy, ambiguous payment and uncertain ledger outcomes remain recovery-required. */
  invoke: async function (input, phase) {
    if (phase === "evidence") return SERVICE.DefaultEWasteDigitalSaleEvidenceService.read(input);
    if (["refund-preview", "refund-prepare", "refund-settle", "refund-complete"].includes(phase))
      return SERVICE.DefaultEWasteOrderReversalService.digitalInvoke(input, phase.slice(7));
    const r = this.context(input), waste = SERVICE.DefaultWasteAssetTransferOperationService;
    if (phase === "compensation-resolve") return this.resolveCompensation(r);
    if (["availability", "reserve"].includes(phase)) {
      const resolved = await this.binding(r);
      if (phase === "availability") return { available: resolved.asset.assetStatus === "LISTED" && !resolved.asset.metadata?.pendingTransferCode &&
          isDeepStrictEqual(resolved.asset.ownerRef, resolved.ref.sellerRef), status: "OWNER_CHECKED", assetCode: resolved.ref.assetCode };
      const command = await this.command(r, resolved);
      const event = await waste.reserveDigitalSale(r, command, resolved.policies.transfer.metadata.digitalOwnership.reservationSeconds);
      if (event.transferStatus !== "RESERVED") throw new Error("Digital purchase requires original-command recovery");
      return this.result(event, "RESERVED");
    }
    let event = await this.event(r);
    if (phase === "cancel") {
      const c = event.metadata.digitalSale.command;
      const evidence = await this.purchaseEvidence(r, event), checkpoints = evidence.checkpoints, payments = evidence.payments;
      if (event.metadata.digitalSale.compensationRecovery || payments?.some(p => p.evidence?.operation === "CAPTURE"))
        return this.cancelRefundedCompensation(r, event);
      if (!Array.isArray(checkpoints) || !Array.isArray(payments)) throw new Error("Uncaptured terminal payment is unconfirmed");
      const checkpoint = checkpoints[0], intent = checkpoint?.evidence?.paymentCompensationIntent;
      const voids = payments.filter(p => p.status === "VOIDED" && p.evidence?.operation === "VOID");
      const receipt = checkpoint?.evidence?.compensation?.filter(p => p.type === "PAYMENT_VOID");
      if (checkpoints.length !== 1 || checkpoint.tenant !== r.tenant || checkpoint.ownerId !== c.ownerId ||
          !["COMPENSATED", "COMPENSATION_REQUIRED"].includes(checkpoint.status) || checkpoint.idempotencyKey !== c.checkoutIdempotencyKey ||
          payments.some(p => p.tenant !== r.tenant || p.orderCode !== c.orderCode || p.ownerId !== c.ownerId ||
            !["AUTHORIZED", "VOIDED", "DECLINED", "CANCELLED"].includes(p.status)) ||
          (payments.some(p => p.status === "AUTHORIZED") && (voids.length !== 1 || receipt?.length !== 1 || receipt[0].status !== "COMPLETED" ||
            receipt[0].paymentTransactionCode !== voids[0].code || receipt[0].providerReference !== voids[0].providerReference ||
            receipt[0].idempotencyKey !== c.checkoutIdempotencyKey + ":payment:void" || voids[0].idempotencyKey !== receipt[0].idempotencyKey ||
            intent?.operation !== "VOID" || intent.orderCode !== c.orderCode || intent.ownerId !== c.ownerId || intent.tenant !== r.tenant)) ||
          (!payments.length && (intent || !Array.isArray(checkpoint.evidence?.completed) ||
            checkpoint.evidence.completed.some(step => ["AUTHORIZED", "ORDERED", "PAYMENT_CAPTURED"].includes(step)))))
        throw new Error("Uncaptured terminal payment is unconfirmed");
      return this.result(await waste.cancelDigitalSale(r, event), this.timestamp(event.metadata.digitalSale.expiresAt) <= Date.now() ? "EXPIRED" : "CANCELLED");
    }
    if (phase === "confirm") {
      const capture = await this.capture(r, event);
      if (event.transferStatus !== "COMPLETED") {
        event = await waste.prepareDigitalSettlement(r, event, capture);
        const c = event.metadata.digitalSale.command, terms = c.policies.reward.metadata.digitalOwnership;
        const wallet = await this.sellerWalletEvidence(r, event);
        const key = event.code + ":sale-proceeds";
        const result = await this.remote(r, "loyaltyApi", "loyalty", "/reward-earnings", { walletCode: wallet.code,
          programCode: terms.programCode, rewardTypeCode: terms.rewardTypeCode, amount: capture.amount, scale: terms.scale,
          sourceType: "WASTE_ASSET_SALE", sourceCode: event.code, idempotencyKey: key }, true);
        const entry = result?.ledgerEntry;
        if (!entry?.code || entry.walletCode !== wallet.code || entry.programCode !== terms.programCode || entry.rewardTypeCode !== terms.rewardTypeCode ||
            entry.sourceType !== "WASTE_ASSET_SALE" || entry.entryType !== "EARN" ||
            entry.sourceCode !== event.code || entry.idempotencyKey !== key || this.amount().compare(String(entry.amount), capture.amount) !== 0)
          throw new Error("Original seller-proceeds ledger is unconfirmed");
        event = await waste.completeDigitalSale(r, event, { rewardSettlementRefs: [{ module: "loyaltyLedger", schema: "rewardLedgerEntry", code: entry.code }], carbonSettlementRefs: [] });
      } else {
        if (!isDeepStrictEqual(event.metadata.digitalSale.capture, capture)) throw new Error("Original capture changed");
        event = await waste.completeDigitalSale(r, event, event.metadata.digitalSale.settlement);
      }
      await this.verifySettlement(r, event);
      return this.result(event, "SOLD");
    }
    if (phase === "deliver") {
      if (!isDeepStrictEqual(event.metadata.digitalSale.capture, await this.capture(r, event))) throw new Error("Original capture changed");
      await this.verifySettlement(r, event);
      return this.result(await waste.verifyDigitalSale(r, event), "DELIVERED");
    }
    throw new Error("Unsupported digital-sale phase");
  },
};
