/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
"use strict";
const { isDeepStrictEqual: same } = require("node:util");

/**
 * @module digitalCore/service/defaultDigitalBundleSettlementService
 * @description Durable quantity-one purchase obligations over existing Checkout, Payment, component
 * and Loyalty owners.
 * @owner digitalCore
 * @layer service
 * @override Transport defaults belong to Digital; reward selections belong to retained listing terms.
 * @remarks Digital settlement coordinates one quantity-one bundle purchase with existing
 * Checkout/Order/Payment/Loyalty owners. Original purchaser Payment namespace stays distinct from
 * seller manifest and merchant Store. All components finalize before one canonical seller earning;
 * completed purchases remain final-sale.
 * Inputs and outputs are specified on each exported member below.
 * Effects and failures remain in the existing owner flow; missing evidence is never synthetic success.
 * Exported members: bundles, settings, rows, listing, availability, rewardTerms, reserve, unit,
 * purchase, loyalty, wallet, captureLedger, capture, earning, confirm, record, resolve, status,
 * fenceCompensation, release.
 * @override Customize through the existing loader-visible module members, preserving private
 * authority.
 */
module.exports = {
  /**
   * Resolves existing managed-revision Digital persistence.
   * @returns {Object} Effective Digital bundle persistence/operation owner.
   * @remarks Effects: Registry lookup only.
   * Failure behavior: Missing owner fails when the delegated operation is required.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  bundles: function () { return SERVICE.DefaultDigitalBundleService; },
  /**
   * Requires complete framework configuration, never an implicit program or reward selection.
   * @returns {Object} Complete validated settlement policy.
   * @remarks Effects: Reads implementing mechanics/transports without implicit reward selections.
   * Failure behavior: Rejects missing/invalid limits, transport or unsupported accounting policy.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  settings: function () {
    const p = CONFIG.get("digitalCore")?.bundleSettlement;
    if (!p?.loyalty?.connectionName || !p.loyalty.targetAuthority || !Number.isSafeInteger(p.loyalty.timeoutMs) ||
        p.loyalty.timeoutMs < 1 || !Number.isSafeInteger(p.maximumPaymentRecords) || p.maximumPaymentRecords < 2 || p.feeAmount !== "0")
      throw new Error("Bundle settlement configuration is invalid");
    return p;
  },
  /**
   * Reads complete fixed generated owner rows; failed/truncated evidence is never absence.
   * @param {Object} r Original admitted tenant/Enterprise request, preserving authData and private owner
   * context.
   * @param {string} serviceName Fixed generated owner service selected by server code, never caller
   * executable input.
   * @param {Object} query Owner-scoped lookup selectors; never permission authority.
   * @param {number} maximum Effective owner-defined complete-read upper bound.
   * @returns {Promise<Object[]>} Complete exact generated owner rows within the selected bound.
   * @remarks Effects: Private scoped generated reads only.
   * Failure behavior: Rejects failed, truncated, duplicated or foreign evidence.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  rows: async function (r, serviceName, query, maximum) {
    const owner = SERVICE.DefaultDigitalCommerceEntitlementService;
    const response = await SERVICE[serviceName].get({ tenant: r.tenant, authData: owner.serviceAuthData(r),
      query: { tenant: r.tenant, enterpriseCode: r.enterpriseCode, ...query },
      options: { recursive: false, skipItemCache: true }, searchOptions: { pageSize: maximum + 1, pageNumber: 1 } });
    if (!/^SUC_/.test(response?.code || "") || response.error || response.success === false || response.acknowledged === false ||
        response.errors && (!Array.isArray(response.errors) || response.errors.length) || !Array.isArray(response.result) ||
        response.result.length > maximum || response.count !== response.result.length ||
        [response.total, response.totalCount].some(n => n !== undefined && n !== response.result.length))
      throw new Error("Complete bundle purchase evidence is unavailable");
    for (const row of response.result) {
      if (row.active !== true || Object.entries({ tenant: r.tenant, enterpriseCode: r.enterpriseCode, ...query }).some(([key, value]) =>
        !same(key.split(".").reduce((v, part) => v?.[part], row), value))) throw new Error("Bundle evidence scope changed");
    }
    return response.result;
  },
  /**
   * Identifies a published bundle by retained Product and manifest, not calculation-carried selectors.
   * @param {Object} r Original admitted tenant/Enterprise request, preserving authData and private owner
   * context.
   * @param {Object} projection Canonical Product/owner projection.
   * @returns {Promise<Object>} Original published listing operation matching canonical Product/binding.
   * @remarks Effects: Reads retained Product, manifest and publication identity.
   * Failure behavior: Rejects missing, changed, foreign or unpublished listing.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  listing: async function (r, projection) {
    const ref = projection.payload?.localizedAttributes?.bundleRef;
    if (ref?.module !== "digitalCore" || ref.schema !== "digitalBundleManifest") throw new Error("Retained bundle reference is required");
    const rows = await this.rows(r, "DefaultDigitalBundleOperationService", { purpose: "LISTING", manifestCode: ref.code,
      "evidence.listing.product.productCode": r.productCode }, 1);
    const row = rows[0], listing = row?.evidence?.listing, manifest = await this.bundles().operationManifest(r, row);
    if (!row || ref.revision !== manifest.revision || ref.digest !== manifest.digest || row.manifestRevision !== manifest.revision ||
        row.evidence.manifestDigest !== manifest.digest || listing.phase !== "PUBLISHED" || listing.release ||
        listing.termsDigest !== this.bundles().digest(listing.terms) || listing.terms.storeCode !== r.storeCode ||
        listing.product.sku !== r.sku || projection.payload.variantSkuMap?.[listing.product.variantCode] !== r.sku ||
        listing.publication?.targetVersion !== projection.publicationVersion ||
        listing.publication?.productCode !== r.productCode || listing.publication.status !== "ONLINE" ||
        listing.publication.confirmed !== true || !listing.publication.receiptCode)
      throw new Error("Exact published bundle is unavailable");
    return row;
  },
  /**
   * Returns non-reserving quantity-one availability without qualifying a provider or releasing content
   * holds.
   * @param {Object} r Original admitted tenant/Enterprise request, preserving authData and private owner
   * context.
   * @param {Object} projection Canonical Product/owner projection.
   * @returns {Promise<Object>} Non-guaranteed quantity-one availability with original listing binding.
   * @remarks Effects: Read-only retained claim/window check; no holds released or acquired.
   * Failure behavior: Rejects inconsistent published evidence rather than claiming supply.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  availability: async function (r, projection) {
    const row = await this.listing(r, projection), terms = row.evidence.listing.terms;
    const now = Date.now(), within = (terms.startsAt === null || Date.parse(terms.startsAt) <= now) &&
      (terms.endsAt === null || Date.parse(terms.endsAt) > now);
    return { available: row.status === "HELD" && !row.evidence.purchaseClaim && within,
      status: "OWNER_CHECKED", guaranteed: false, reservableAt: "CHECKOUT_BEFORE_PAYMENT",
      productType: "DIGITAL", inventoryStrategy: "DIGITAL_COMMERCE", digitalDeliveryType: "DIGITAL_OWNERSHIP",
      providerOwner: "digitalCore", publicationCode: row.code, manifestCode: row.manifestCode,
      sku: row.evidence.listing.product.sku, variantCode: row.evidence.listing.product.variantCode, locale: r.locale };
  },
  /**
   * Validates governed reward terms with the common exact-amount owner.
   * @param {Object} terms Immutable reviewed listing/reward terms.
   * @returns {Object} Detached canonical governed reward tuple.
   * @remarks Effects: Pure exact-amount/precision validation.
   * Failure behavior: Rejects absent/invalid program/type/scale or incompatible settlement terms.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  rewardTerms: function (terms) {
    const reward = terms?.reward;
    if (!reward || ![reward.programCode, reward.rewardTypeCode].every(v => typeof v === "string" && /^[A-Za-z0-9_.:@-]{1,191}$/.test(v)) ||
        !Number.isSafeInteger(reward.scale) || reward.scale < 0 || reward.scale > 18 ||
        typeof terms.amount !== "string" || SERVICE.DefaultExactAmountService.compare(terms.amount, "0") <= 0 ||
        (terms.amount.split(".")[1]?.length || 0) > reward.scale)
      throw new Error("Governed listing reward terms are required");
    return structuredClone(reward);
  },
  /**
   * Claims the listing once; a lost insert response resumes the claim's original complete command.
   * @param {Object} r Original admitted tenant/Enterprise request, preserving authData and private owner
   * context.
   * @param {Object} entry Original scoped Cart/Order entry.
   * @param {Object} availability Validated current listing availability and original publication
   * binding.
   * @returns {Promise<Object>} Original purchase reservation unit.
   * @remarks Effects: CAS-claims listing then inserts exact original purchase command; replay uses
   * retained claim.
   * Failure behavior: Rejects competing buyer, changed original terms or uncertain owner
   * acknowledgement.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  reserve: async function (r, entry, availability) {
    this.settings();
    const b = this.bundles(), buyer = b.owner(r.ownerRef);
    await b.authorize(r, buyer, "BUNDLE_BUY");
    if (String(entry.quantity) !== "1" || !r.ownerId || !r.idempotencyKey || !r.payload?.orderCode || !r.payload.cartCode)
      throw new Error("Original quantity-one Checkout command is required");
    let listing = await SERVICE.DefaultDigitalCommerceAuctionService.read(r, availability.publicationCode);
    const terms = listing.evidence.listing.terms, reward = this.rewardTerms(terms);
    if (r.payload.paymentMethod !== "LOYALTY_REWARD" || r.payload.programCode !== reward.programCode ||
        r.payload.rewardTypeCode !== reward.rewardTypeCode || r.payload.rewardCurrency !== terms.currency ||
        SERVICE.DefaultExactAmountService.compare(String(r.payload.rewardAmount), terms.amount) !== 0)
      throw new Error("Exact reward-only bundle payment is required");
    const entries = await this.rows(r, "DefaultCartEntryService", { ownerId: r.ownerId, cartCode: r.payload.cartCode, status: "ACTIVE" }, 1);
    if (entries.length !== 1 || entries[0].code !== entry.code || entries[0].productCode !== entry.productCode ||
        entries[0].sku !== entry.sku || String(entries[0].quantity) !== "1") throw new Error("Whole bundle requires its quantity-one Cart");
    if (same(buyer, listing.ownerRef)) throw new Error("Same-owner bundle purchase is prohibited");
    const code = "bundle-operation:" + b.digest([r.tenant, r.enterpriseCode, r.ownerId, r.idempotencyKey, entry.code, "PURCHASE"]);
    const command = { publicationCode: listing.code, buyerRef: buyer, ownerId: r.ownerId, actorRef: r.actorRef,
      orderCode: r.payload.orderCode, cartCode: r.payload.cartCode, entryCode: entry.code, productCode: entry.productCode,
      sku: entry.sku, storeCode: r.storeCode, locale: r.locale, checkoutIdempotencyKey: r.idempotencyKey,
      idempotencyKey: r.idempotencyKey + ":digital:" + entry.code + ":0", reward, gross: terms.amount,
      participantEnterpriseCode: r.participantEnterpriseCode || r.authData.enterpriseCode || r.authData.entCode,
      currency: terms.currency, fee: this.settings().feeAmount, net: terms.amount, finalSale: true };
    const digest = b.digest(command);
    const existing = await b.read(r, "DefaultDigitalBundleOperationService", code);
    if (existing) {
      if (existing.commandDigest !== digest || existing.evidence.command.publicationCode !== listing.code)
        throw new Error("Original purchase command changed");
      if (existing.status === "CANCELLED") throw new Error("Original purchase was cancelled");
      return this.unit(existing, "RESERVED");
    }
    if (terms.saleMode !== "FIXED") throw new Error("Auction selection requires the owning Checkout handoff");
    if (!listing.evidence.purchaseClaim && (terms.startsAt !== null && Date.parse(terms.startsAt) > Date.now() ||
        terms.endsAt !== null && Date.parse(terms.endsAt) <= Date.now())) throw new Error("Listing purchase window is closed");
    if (availability.available !== true && !listing.evidence.purchaseClaim || listing.status !== "HELD" ||
        listing.evidence.listing.product.productCode !== entry.productCode || listing.evidence.listing.product.sku !== entry.sku ||
        terms.storeCode !== r.storeCode || listing.evidence.listing.release)
      throw new Error("Listing cannot be purchased");
    if (!listing.evidence.purchaseClaim) {
      await SERVICE.DefaultDigitalCommerceAuctionService.held(r, listing);
      const publisher = SERVICE.DefaultDigitalCommerceAuctionService;
      publisher.published(listing, await publisher.product(r, "inspect", listing));
      await publisher.price(r, listing, "inspect");
      listing = await b.update(r, listing, { evidence: { ...listing.evidence,
        purchaseClaim: { code, digest, command: structuredClone(command) } } });
    }
    if (listing.evidence.purchaseClaim.code !== code || listing.evidence.purchaseClaim.digest !== digest)
      throw new Error("Listing is reserved by another purchase");
    const row = await b.insert(r, "DefaultDigitalBundleOperationService", { ...b.scope(r), code,
      manifestCode: listing.manifestCode, manifestRevision: listing.manifestRevision, ownerRef: listing.ownerRef, recipientRef: buyer,
      purpose: "PURCHASE", status: "RESERVED", revision: 0, checkpoints: {}, commandDigest: digest,
      idempotencyKey: command.idempotencyKey, correlationId: r.correlationId || r.idempotencyKey,
      evidence: { command, manifestDigest: listing.evidence.manifestDigest,
        manifestEnterpriseCode: listing.evidence.manifestEnterpriseCode, finalSale: true } });
    return this.unit(row, "RESERVED");
  },
  /**
   * Projects the original unit for existing Checkout ports without inventing domain transfer or payment
   * evidence.
   * @param {Object} row Original persisted owner record and retained evidence.
   * @param {string} status Owner-selected unit state projection.
   * @returns {Object} Existing Checkout-compatible original unit projection.
   * @remarks Effects: Pure allowlisted original-command projection; no transfer/payment proof invented.
   * Failure behavior: Invalid retained purchase evidence is rejected by required owner checks.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  unit: function (row, status) {
    const c = row.evidence.command;
    return { ...c, code: row.code, tenant: row.tenant, enterpriseCode: row.enterpriseCode, status,
      digitalDeliveryType: "DIGITAL_OWNERSHIP", providerOwner: "digitalCore", manifestCode: row.manifestCode,
      manifestRevision: row.manifestRevision, settlementStatus: row.status,
      ...(row.evidence.completedAt ? { soldAt: row.evidence.completedAt, deliveredAt: row.evidence.completedAt } : {}),
      evidence: { finalSale: true, physicalCustodyTransferred: false, publicationCode: c.publicationCode,
        manifestCode: row.manifestCode, capture: row.evidence.capture, settlement: row.evidence.settlement } };
  },
  /**
   * Re-reads original purchase scope before every continuation; caller unit amounts are never authority.
   * @param {Object} r Original admitted tenant/Enterprise request, preserving authData and private owner
   * context.
   * @param {Object} unit Retained original Digital reservation/delivery unit.
   * @returns {Promise<Object>} Verified original purchase row for continuation.
   * @remarks Effects: Exact owner read; caller unit amounts are comparisons, not authority.
   * Failure behavior: Rejects changed owner/Cart/Order/key/amount/namespace binding.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  purchase: async function (r, unit) {
    const row = await this.bundles().read(r, "DefaultDigitalBundleOperationService", unit.code), c = row?.evidence?.command;
    if (!row || row.purpose !== "PURCHASE" || !c || row.commandDigest !== this.bundles().digest(c) ||
        c.ownerId !== r.ownerId || c.orderCode !== (r.payload?.orderCode || unit.orderCode) ||
        c.checkoutIdempotencyKey !== (r.idempotencyKey || unit.checkoutIdempotencyKey) ||
        ["orderCode", "idempotencyKey", "productCode", "sku", "entryCode"].some(k => unit[k] !== c[k]))
      throw new Error("Original bundle purchase is unavailable");
    return row;
  },
  /**
   * Uses fixed Loyalty APIs with runtime credentials; no alternate wallet ledger exists here.
   * @param {Object} r Original admitted tenant/Enterprise request, preserving authData and private owner
   * context.
   * @param {string} path Fixed canonical owner API path.
   * @param {Object} payload Bounded original owner command selectors.
   * @returns {Promise<Object>} Validated canonical Loyalty response.
   * @remarks Effects: One fixed owner API invocation with original runtime scope.
   * Failure behavior: Rejects failed/malformed envelopes or unavailable transport.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  loyalty: async function (r, path, payload) {
    const target = this.settings().loyalty;
    const value = await SERVICE.DefaultModuleService.invokeModule({ ...target, local: false, moduleName: "loyaltyApi",
      apiName: path, methodName: "POST", tenant: r.tenant, request: { tenant: r.tenant }, requestBody: payload,
      requireInternalAuth: true, maxAttempts: 1,
      header: { "Idempotency-Key": payload.idempotencyKey, "X-Correlation-Id": r.correlationId } });
    return SERVICE.DefaultDigitalBundleAuthorityService.unwrap(value);
  },
  /**
   * Obtains canonical wallet identity only; bounded projected entries never prove original payment or
   * credit.
   * @param {Object} r Original admitted tenant/Enterprise request, preserving authData and private owner
   * context.
   * @param {Object} ownerRef Canonical typed Profile purchasing/selling owner reference.
   * @returns {Promise<Object>} Canonical typed owner's wallet identity.
   * @remarks Effects: Reads wallet identity only; history page cannot prove payment/earning.
   * Failure behavior: Rejects foreign, unavailable or malformed wallet evidence.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  wallet: async function (r, ownerRef) {
    const value = await this.loyalty(r, "/wallet-projections", { ownerType: ownerRef.schema.toUpperCase(), ownerCode: ownerRef.code });
    if (!value?.wallet?.code || value.wallet.ownerType !== ownerRef.schema.toUpperCase() || value.wallet.ownerCode !== ownerRef.code ||
        value.wallet.status !== "OPEN" || value.wallet.active === false || value.wallet.tenant !== undefined && value.wallet.tenant !== r.tenant ||
        !Array.isArray(value.entries) || value.entries.some(entry => entry.tenant !== undefined && entry.tenant !== r.tenant))
      throw new Error("Canonical bundle participant wallet is unconfirmed");
    return value;
  },
  /**
   * Reads the original capture through Loyalty's exact evidence owner, independently of wallet history
   * pagination.
   * @param {Object} r Original admitted tenant/Enterprise request, preserving authData and private owner
   * context.
   * @param {Object} command Exact original owner command including immutable identity and idempotency
   * key.
   * @param {string} entryCode Exact original Loyalty ledger entry reference.
   * @returns {Promise<Object>} Exact original capture-ledger evidence.
   * @remarks Effects: Reads original Payment provider reference via Loyalty's exact evidence API.
   * Failure behavior: Rejects mismatched tenant/owner/program/amount/source or incomplete capture.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  captureLedger: async function (r, command, entryCode) {
    this.bundles().owner(command.buyerRef);
    const ownerType = command.buyerRef.schema.toUpperCase();
    const value = await this.loyalty(r, "/reward-ledger-evidence", { enterpriseCode: command.participantEnterpriseCode,
      ownerType, ownerCode: command.buyerRef.code, programCode: command.reward.programCode, rewardTypeCode: command.reward.rewardTypeCode,
      sourceType: "PAYMENT", sourceCode: command.orderCode, entryCode });
    if (value?.contractVersion !== 1 || value.tenant !== r.tenant || value.enterpriseCode !== command.participantEnterpriseCode ||
        value.ownerType !== ownerType || value.ownerCode !== command.buyerRef.code || value.wallet?.ownerType !== ownerType ||
        value.wallet.ownerCode !== command.buyerRef.code || value.wallet.status !== "OPEN" || value.wallet.active === false ||
        value.wallet.tenant !== r.tenant || !Array.isArray(value.entries) || value.entries.length !== 1 ||
        value.entries[0].code !== entryCode || value.entries[0].tenant !== r.tenant)
      throw new Error("Exact original bundle debit evidence is unconfirmed");
    return value;
  },
  /**
   * Qualifies the original Order, complete Payment history and exact Loyalty debit.
   * @param {Object} r Admitted original purchase context in the merchant namespace.
   * @param {Object} row Persisted Digital purchase with immutable buyer and payment terms.
   * @returns {Promise<Object>} Verified Payment/ledger references, wallet, amount and currency.
   * @throws {Error} When owner configuration or any original financial evidence is incomplete or contradictory.
   * @override Use the effective Payment-method provider definition; never redefine its default in Digital.
   * This is read-only and grants no component transfer or seller credit by itself.
   */
  capture: async function (r, row) {
    const providerCode = CONFIG.get("loyaltyRewardPayment")?.providerCode;
    if (typeof providerCode !== "string" || !providerCode.trim())
      throw new Error("Bundle Payment provider configuration is unavailable");
    const c = row.evidence.command, query = { ownerId: c.ownerId, orderCode: c.orderCode };
    const orders = await this.rows(r, "DefaultCommerceOrderService", { code: c.orderCode, ownerId: c.ownerId }, 1);
    const entries = await this.rows(r, "DefaultCommerceOrderEntryService", query, 1);
    const payments = await this.rows({ ...r, enterpriseCode: c.participantEnterpriseCode }, "DefaultPaymentTransactionEntryService", query, this.settings().maximumPaymentRecords);
    const order = orders[0], entry = entries[0];
    const captures = payments.filter(p => p.evidence?.operation === "CAPTURE"), authorizations = payments.filter(p => p.evidence?.operation === "AUTHORIZE");
    const payment = captures[0], auth = authorizations[0];
    for (const value of payments) {
      if (["operation", "methodCode", "providerCode", "providerReference"].some(key => value[key] !== undefined && value[key] !== value.evidence?.[key]) ||
          value.amount !== undefined && value.amount !== value.totalAmount || value.reconciliationRequired === true ||
          value.evidence?.participant && !same(value.evidence.participant.ownerRef, c.buyerRef))
        throw new Error("Original Payment evidence is contradictory");
    }
    if (!order || !entry || orders.length !== 1 || entries.length !== 1 || captures.length !== 1 || authorizations.length !== 1 ||
        payments.some(p => !["CAPTURE", "AUTHORIZE"].includes(p.evidence?.operation)) ||
        !["PLACED", "FULFILLED", "COMPLETED"].includes(order.status) || order.cartCode !== c.cartCode ||
        order.idempotencyKey !== c.checkoutIdempotencyKey || order.evidence?.storeCode !== c.storeCode || !same(order.evidence.ownerRef, c.buyerRef) ||
        entry.code !== c.orderCode + ":" + c.entryCode || entry.productCode !== c.productCode || entry.sku !== c.sku ||
        String(entry.quantity) !== "1" || !entry.evidence?.digitalReservationCodes?.includes(row.code) ||
        order.currency !== c.currency || payment.currency !== c.currency || auth.currency !== c.currency ||
        [order, payment, auth].some(p => SERVICE.DefaultExactAmountService.compare(String(p.totalAmount), c.gross) !== 0) ||
        payment.code !== c.orderCode + ":capture" || payment.idempotencyKey !== c.checkoutIdempotencyKey + ":payment:capture" ||
        payment.status !== "CAPTURED" || auth.status !== "AUTHORIZED" || auth.idempotencyKey !== c.checkoutIdempotencyKey + ":payment" ||
        [payment, auth].some(p => p.cartCode !== c.cartCode || p.evidence?.methodCode !== "LOYALTY_REWARD" ||
          p.evidence.providerCode !== providerCode || p.evidence.programCode !== c.reward.programCode ||
          p.evidence.rewardTypeCode !== c.reward.rewardTypeCode)) throw new Error("Exact original bundle payment is unconfirmed");
    const wallet = await this.captureLedger(r, c, payment.evidence.providerReference), ledger = wallet.entries[0];
    if (ledger.active === false || ledger.walletCode !== wallet.wallet.code || ledger.entryType !== "CAPTURE" ||
        ledger.programCode !== c.reward.programCode || ledger.rewardTypeCode !== c.reward.rewardTypeCode ||
        ledger.idempotencyKey !== payment.idempotencyKey || ledger.sourceType !== "PAYMENT" || ledger.sourceCode !== c.orderCode ||
        ledger.targetType !== "ORDER" || ledger.targetCode !== c.orderCode || ledger.reservationCode !== auth.evidence.providerReference ||
        [payment, auth].some(p => p.evidence.walletCode !== wallet.wallet.code) ||
        SERVICE.DefaultExactAmountService.compare(String(ledger.amount), c.gross) !== 0)
      throw new Error("Original bundle buyer debit is unconfirmed");
    return { paymentRef: { module: "paymentCore", schema: "paymentTransactionEntry", code: payment.code },
      ledgerRef: { module: "loyaltyLedger", schema: "rewardLedgerEntry", code: ledger.code },
      walletCode: wallet.wallet.code, amount: c.gross, currency: c.currency };
  },
  /**
   * Verifies stable canonical seller credit evidence before marking proceeds available.
   * @param {Object} row Original persisted owner record and retained evidence.
   * @param {string} walletCode Canonical original seller wallet identity.
   * @param {Object} entry Original scoped Cart/Order entry.
   * @returns {Object} Canonical seller ledger reference after exact earning validation.
   * @remarks Effects: Pure original seller-credit proof validation.
   * Failure behavior: Rejects changed wallet/amount/source/key or nonpositive/unconfirmed earning
   * evidence.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  earning: function (row, walletCode, entry) {
    const c = row.evidence.command, key = row.code + ":proceeds";
    if (!entry?.code || entry.active === false || entry.walletCode !== walletCode || entry.entryType !== "EARN" || entry.idempotencyKey !== key ||
        entry.sourceType !== "DIGITAL_BUNDLE_SALE" || entry.sourceCode !== row.code || entry.targetType !== "ORDER" ||
        entry.targetCode !== c.orderCode || entry.programCode !== c.reward.programCode || entry.rewardTypeCode !== c.reward.rewardTypeCode ||
        SERVICE.DefaultExactAmountService.compare(String(entry.amount), c.net) !== 0 || entry.reversalOfEntryCode ||
        entry.metadata?.publicationCode !== c.publicationCode || entry.metadata?.manifestCode !== row.manifestCode)
      throw new Error("Original seller earning is unconfirmed");
    return { module: "loyaltyLedger", schema: "rewardLedgerEntry", code: entry.code };
  },
  /**
   * Confirms capture, transfers all original components, then posts one seller earning. Partial outcomes
   * preserve the original key and locks.
   * @param {Object} r Original admitted tenant/Enterprise request, preserving authData and private owner
   * context.
   * @param {Object} unit Retained original Digital reservation/delivery unit.
   * @returns {Promise<Object>} Original SOLD unit after full settlement.
   * @remarks Effects: Confirms original capture, transfers/finalizes all components, then posts one
   * stable seller earning.
   * Failure behavior: Partial or uncertain effects retain original key/locks and pending proceeds; no
   * second debit.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  confirm: async function (r, unit) {
    const b = this.bundles();
    let row = await this.purchase(r, unit);
    if (row.status === "CANCELLED" || row.status === "CANCELLING") throw new Error("Original purchase is cancelled");
    const capture = await this.capture(r, row);
    if (row.evidence.capture && !same(row.evidence.capture, capture)) throw new Error("Original capture changed");
    if (!row.evidence.capture) row = await b.update(r, row, { status: "CAPTURED", evidence: { ...row.evidence, capture } });
    let listing = await SERVICE.DefaultDigitalCommerceAuctionService.read(r, row.evidence.command.publicationCode);
    if (listing.evidence.purchaseClaim?.code !== row.code || listing.evidence.purchaseClaim.digest !== row.commandDigest)
      throw new Error("Original listing purchase claim changed");
    if (listing.status === "HELD") listing = await b.update(r, listing, { status: "TRANSFERRING", recipientRef: row.recipientRef });
    if (!same(listing.recipientRef, row.recipientRef)) throw new Error("Original purchase recipient changed");
    listing = await b.transfer(r, listing.code);
    const manifest = await b.operationManifest(r, listing);
    if (listing.status !== "COMPLETED" || manifest.components.some((component, index) =>
      ["transfer", "finalize"].some(phase => {
        const receipt = listing.checkpoints[index]?.[phase];
        return receipt?.status !== (phase === "transfer" ? "TRANSFERRED" : "COMPLETED") ||
          receipt.operationKey !== listing.code + ":" + index || !same(receipt.reference, component.reference) ||
          receipt.quantity !== component.quantity || !receipt.receiptCode;
      }))) throw new Error("Whole bundle transfer is unconfirmed");
    if (!row.evidence.transfer) row = await b.update(r, row, { status: "PROCEEDS_PENDING", evidence: { ...row.evidence,
      transfer: { operationCode: listing.code, manifestDigest: manifest.digest, checkpoints: listing.checkpoints } } });
    const wallet = await this.wallet(r, row.ownerRef), key = row.code + ":proceeds", c = row.evidence.command;
    if (row.evidence.sellerWalletCode && row.evidence.sellerWalletCode !== wallet.wallet.code) throw new Error("Seller wallet changed");
    if (!row.evidence.sellerWalletCode) row = await b.update(r, row, { evidence: { ...row.evidence, sellerWalletCode: wallet.wallet.code } });
    // The existing earning owner resolves its exact stable operation key before any mutation, including Enterprise wallets.
    // Never branch on the bounded wallet projection: an old credit can be outside its visible history.
    const result = await this.loyalty(r, "/reward-earnings", { walletCode: wallet.wallet.code, ...c.reward, amount: c.net,
      sourceType: "DIGITAL_BUNDLE_SALE", sourceCode: row.code, targetType: "ORDER", targetCode: c.orderCode,
      reasonCode: "BUNDLE_SALE_PROCEEDS", idempotencyKey: key,
      metadata: { publicationCode: c.publicationCode, manifestCode: row.manifestCode, captureRef: capture.paymentRef,
        sellerRef: row.ownerRef, gross: c.gross, fee: c.fee, net: c.net, sourceLabel: "Bundle sale proceeds" } });
    const receipt = this.earning(row, wallet.wallet.code, SERVICE.DefaultDigitalBundleAuthorityService.unwrap(result.ledgerEntry));
    if (row.evidence.settlement && !same(row.evidence.settlement.ledgerRef, receipt)) throw new Error("Seller settlement changed");
    if (row.status !== "COMPLETED") row = await b.update(r, row, { status: "COMPLETED", evidence: { ...row.evidence,
      completedAt: new Date().toISOString(), settlement: { ledgerRef: receipt, gross: c.gross, fee: c.fee, net: c.net, available: true } } });
    return this.unit(row, "SOLD");
  },
  /**
   * Persists the original digital entitlement/delivery after complete settlement, with explicit
   * final-sale policy.
   * @param {Object} r Original admitted tenant/Enterprise request, preserving authData and private owner
   * context.
   * @param {Object} order Persisted original Order and owner binding.
   * @param {Object} sale Original fully settled purchase evidence.
   * @param {boolean} delivered Whether complete delivery receipt persistence is requested.
   * @returns {Promise<Object>} Original entitlement after settled sale/delivery persistence.
   * @remarks Effects: Writes existing entitlement/delivery owners with explicit final-sale policy.
   * Failure behavior: Rejects incomplete settlement, conflicting original identity or unresolved
   * persistence.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  record: async function (r, order, sale, delivered) {
    const owner = SERVICE.DefaultDigitalCommerceEntitlementService, verifier = SERVICE.DefaultDigitalCommerceOwnershipService;
    const model = { code: owner.entitlementCode(r, { orderCode: order.code, providerCode: sale.code }),
      tenant: r.tenant, enterpriseCode: r.enterpriseCode, ownerId: sale.ownerId, orderCode: order.code, orderEntryCode: sale.entryCode,
      productCode: sale.productCode, sku: sale.sku, providerOwner: "digitalCore", providerCode: sale.code,
      digitalDeliveryType: "DIGITAL_OWNERSHIP", status: "ACTIVE", revision: 0, purchasedAt: sale.soldAt,
      idempotencyKey: sale.idempotencyKey + ":entitlement", correlationId: r.correlationId || sale.idempotencyKey, evidence: sale.evidence };
    await owner.save(SERVICE.DefaultDigitalEntitlementService, r, model);
    const entitlement = await verifier.verifyRecord(SERVICE.DefaultDigitalEntitlementService, r, model);
    if (delivered) {
      const delivery = { code: "digitalDelivery:" + sale.code, tenant: r.tenant, enterpriseCode: r.enterpriseCode,
        ownerId: sale.ownerId, entitlementCode: entitlement.code, orderCode: order.code, deliveryType: "DIGITAL_OWNERSHIP",
        providerOwner: "digitalCore", providerCode: sale.code, status: "DELIVERED", revision: 0, deliveredAt: sale.deliveredAt,
        idempotencyKey: sale.idempotencyKey + ":delivery", correlationId: r.correlationId || sale.idempotencyKey, evidence: sale.evidence };
      await owner.save(SERVICE.DefaultDigitalDeliveryService, r, delivery);
      await verifier.verifyRecord(SERVICE.DefaultDigitalDeliveryService, r, delivery);
    }
    return entitlement;
  },
  /**
   * Resolves an original persisted unit for Checkout recovery without trusting Cart or caller-carried
   * financial fields.
   * @param {Object} r Original admitted tenant/Enterprise request, preserving authData and private owner
   * context.
   * @param {Object} selector Exact original command selectors, not replacement financial instructions.
   * @returns {Promise<Object>} Original RESERVED/SOLD unit for Checkout recovery.
   * @remarks Effects: Exact retained purchase lookup, no current Cart repricing or new reservation.
   * Failure behavior: Rejects foreign, missing or mismatched original selectors.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  resolve: async function (r, selector) {
    const row = await this.bundles().read(r, "DefaultDigitalBundleOperationService", selector.code);
    if (row?.purpose !== "PURCHASE" || row.evidence.command.ownerId !== r.ownerId ||
        row.evidence.command.orderCode !== selector.orderCode || row.evidence.command.checkoutIdempotencyKey !== selector.checkoutIdempotencyKey)
      throw new Error("Original bundle recovery scope changed");
    return this.unit(row, row.status === "COMPLETED" ? "SOLD" : "RESERVED");
  },
  /**
   * Returns an authorized buyer/seller status projection; pending obligations are never a spendable
   * balance.
   * @param {Object} r Original admitted tenant/Enterprise request, preserving authData and private owner
   * context.
   * @param {Object} input Operation input/selectors validated by this owner; supplied identities do not
   * grant authority.
   * @returns {Promise<Object>} Authorized buyer/seller status with pending/available proceeds and
   * finality.
   * @remarks Effects: Read-only original purchase projection; pending proceeds are never spendable
   * balance.
   * Failure behavior: Rejects foreign participant or malformed retained purchase/receipt evidence.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  status: async function (r, input) {
    const b = this.bundles(), row = await b.read(r, "DefaultDigitalBundleOperationService", input.purchaseCode);
    const ownerRef = b.owner(input.ownerRef);
    if (!row || row.purpose !== "PURCHASE" || !same(ownerRef, row.ownerRef) && !same(ownerRef, row.recipientRef))
      throw new Error("Bundle purchase is unavailable");
    await b.authorize(r, ownerRef, same(ownerRef, row.recipientRef) ? "BUNDLE_BUY" : "BUNDLE_LIST");
    const c = row.evidence.command;
    return { contractVersion: 1, purchaseCode: row.code, orderCode: c.orderCode, publicationCode: c.publicationCode,
      manifestCode: row.manifestCode, manifestRevision: row.manifestRevision, status: row.status,
      finalSale: true, sellerRef: row.ownerRef, buyerRef: row.recipientRef,
      proceeds: { gross: c.gross, fee: c.fee, net: c.net, currency: c.currency, ...c.reward,
        status: row.status === "COMPLETED" ? "AVAILABLE_IN_LOYALTY" : row.status === "CANCELLED" ? "CANCELLED" : "PENDING",
        ledgerRef: row.evidence.settlement?.ledgerRef || null, spendableHere: false },
      paymentConfirmed: Boolean(row.evidence.capture), wholeTransferConfirmed: Boolean(row.evidence.transfer) };
  },
  /**
   * Provides Checkout a durable cancellation fence before it considers any Payment reversal. Never
   * unlocks listing content holds.
   * @param {Object} r Original admitted tenant/Enterprise request, preserving authData and private owner
   * context.
   * @param {Object} unit Retained original Digital reservation/delivery unit.
   * @returns {Promise<Object>} Positive durable original cancellation fence.
   * @remarks Effects: Persists cancellation only before capture/transfer obligations; does not unlock
   * listing components.
   * Failure behavior: Rejects captured, transferring or uncertain original obligation.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  fenceCompensation: async function (r, unit) {
    let row = await this.purchase(r, unit);
    const listing = await SERVICE.DefaultDigitalCommerceAuctionService.read(r, row.evidence.command.publicationCode);
    const c = row.evidence.command;
    const payments = await this.rows({ ...r, enterpriseCode: c.participantEnterpriseCode }, "DefaultPaymentTransactionEntryService",
      { ownerId: c.ownerId, orderCode: c.orderCode }, this.settings().maximumPaymentRecords);
    const orders = await this.rows(r, "DefaultCommerceOrderService", { ownerId: c.ownerId, code: c.orderCode }, 1);
    if (row.evidence.capture || row.evidence.transfer || !["RESERVED", "CANCELLING", "CANCELLED"].includes(row.status) ||
        listing.status !== "HELD" || orders.length || payments.some(payment => payment.evidence?.operation === "CAPTURE"))
      throw Object.assign(new Error("Original bundle settlement requires forward recovery"), { code: "ERR_DIGITAL_BUNDLE_RECOVERY_REQUIRED" });
    if (row.status === "RESERVED") row = await this.bundles().update(r, row, { status: "CANCELLING" });
    return { confirmed: true, compensationAllowed: true, code: row.code, status: row.status };
  },
  /**
   * Releases only a cancellation-fenced purchase with terminal Checkout/Payment proof, preserving active
   * listing reservations.
   * @param {Object} r Original admitted tenant/Enterprise request, preserving authData and private owner
   * context.
   * @param {Object} unit Retained original Digital reservation/delivery unit.
   * @returns {Promise<Object>} Original completed purchase-claim release receipt.
   * @remarks Effects: Requires retained cancellation and terminal Checkout/Payment proof; listing
   * content holds remain.
   * Failure behavior: Rejects unfenced/uncertain reversal or conflicting original purchase evidence.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  release: async function (r, unit) {
    const b = this.bundles();
    let row = await this.purchase(r, unit);
    if (!["CANCELLED", "CANCELLING"].includes(row.status)) throw new Error("Checkout cancellation fence is required");
    const c = row.evidence.command;
    const checkpoints = await this.rows(r, "DefaultCheckoutCheckpointService", { ownerId: c.ownerId,
      idempotencyKey: c.checkoutIdempotencyKey }, 1);
    const checkpoint = checkpoints[0];
    if (!checkpoint || !["COMPENSATED", "COMPENSATION_REQUIRED"].includes(checkpoint.status) ||
        checkpoint.evidence?.completed?.some(phase => ["ORDERED", "PAYMENT_CAPTURED", "DIGITAL_SOLD"].includes(phase)) ||
        !Array.isArray(checkpoint.evidence?.compensation)) throw new Error("Original Checkout compensation proof is required");
    const payments = await this.rows({ ...r, enterpriseCode: c.participantEnterpriseCode }, "DefaultPaymentTransactionEntryService", { ownerId: c.ownerId, orderCode: c.orderCode }, this.settings().maximumPaymentRecords);
    if (payments.some(p => p.evidence?.operation === "CAPTURE") || payments.some(p =>
      p.evidence?.operation === "AUTHORIZE" && !payments.some(v => v.evidence?.operation === "VOID" && v.status === "VOIDED" &&
        v.idempotencyKey === c.checkoutIdempotencyKey + ":payment:void" &&
        checkpoint.evidence.compensation.some(outcome => outcome.type === "PAYMENT_VOID" && outcome.status === "COMPLETED" &&
          outcome.paymentTransactionCode === v.code && outcome.providerReference === v.evidence.providerReference))))
      throw new Error("Terminal uncaptured Payment is required");
    let listing = await SERVICE.DefaultDigitalCommerceAuctionService.read(r, c.publicationCode);
    if (row.status === "CANCELLED" && listing.evidence.purchaseClaim?.code !== row.code)
      return { type: "DIGITAL_OWNERSHIP_RELEASE", code: row.code, status: "COMPLETED" };
    if (listing.status !== "HELD" || listing.evidence.purchaseClaim && listing.evidence.purchaseClaim.code !== row.code)
      throw new Error("Original listing cancellation changed");
    if (row.status !== "CANCELLED") row = await b.update(r, row, { status: "CANCELLED" });
    if (listing.evidence.purchaseClaim) await b.update(r, listing, { evidence: { ...listing.evidence, purchaseClaim: null } });
    return { type: "DIGITAL_OWNERSHIP_RELEASE", code: row.code, status: "COMPLETED" };
  },
};
