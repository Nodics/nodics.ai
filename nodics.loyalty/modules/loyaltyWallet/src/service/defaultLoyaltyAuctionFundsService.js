/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
"use strict";
const { isDeepStrictEqual } = require("node:util");
const crypto = require("node:crypto");
const admissions = new WeakMap();

/** @module loyaltyWallet/service/defaultLoyaltyAuctionFundsService @description Resolves governed auction funding and composes original reservation postings with durable command receipts. @layer service @owner loyaltyWallet */
module.exports = {
  /**
   * Resolves the effective Loyalty amount owner for every operation.
   * @returns {Object} Loader-selected amount service; no effects or inline fallback.
   * @override Preserve exact amount and precision contracts in later-layer overrides.
   */
  amount: function () { return SERVICE.DefaultLoyaltyAmountService; },
  /**
   * Rejects missing authority, configuration or persistence without inventing a funds outcome.
   * @param {string} reason Fixed owner refusal reason.
   * @returns {never} Always throws a content-safe owner error; no business writes.
   * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
   * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
   */
  fail: function (reason) {
    SERVICE.DefaultLoyaltyRewardOperationService.fail("ERR_LOYALTY_AUCTION_" + reason, "Auction funds " + reason.toLowerCase());
  },
  /**
   * Loads only framework-defined policy; missing owner configuration fails closed.
   * @returns {*} Loads only framework-defined policy; missing owner configuration fails closed.
   * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
   * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
   */
  policy: function () {
    const p = CONFIG.get("loyalty")?.auctions;
    if (!p || p.enabled !== true || !Number.isSafeInteger(p.maximumCommands) || p.maximumCommands < 1 ||
        !p.biddingEvidence || !p.checkoutEvidence) this.fail("CONFIGURATION");
    return p;
  },
  /**
   * Freezes the signed transport boundary before asynchronous owner reads.
   * @param {Object} request Original trusted request, including tenant, signed principal and operation payload.
   * @returns {*} Freezes the signed transport boundary before asynchronous owner reads.
   * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
   * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
   */
  context: function (request) {
    this.policy();
    const auth = request.authData, enterprise = auth?.enterpriseCode || auth?.entCode;
    if (!request.authorization || !request.tenant || auth?.tenant !== request.tenant || !auth.loginId || !enterprise ||
        auth.tokenType !== (auth.principalType === "service" ? "service" : "access") ||
        !["customer", "human", "service"].includes(auth.principalType) ||
        auth.enterpriseCode && auth.entCode && auth.enterpriseCode !== auth.entCode || request.transactionContext)
      this.fail("FORBIDDEN");
    return { tenant: request.tenant, authorization: request.authorization, authData: structuredClone(auth),
      payload: structuredClone(request.payload || {}), enterpriseCode: enterprise };
  },
  /**
   * Calls only configured owner routes with original credentials and no caller-controlled transport.
   * @param {Object} request Original trusted request, including tenant, signed principal and operation payload.
   * @param {Object} target Configured remote capability target.
   * @param {Object} body Owner-built remote payload; does not replace trusted request scope.
   * @returns {Promise<*>} Calls only configured owner routes with original credentials and no caller-controlled transport.
   * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
   * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
   */
  remote: async function (request, target, body) {
    if (!target.moduleName || !target.connectionName || !target.apiName || !target.targetAuthority?.runtimeRole ||
        !Number.isSafeInteger(target.timeoutMs) || target.timeoutMs < 1 || target.maxAttempts !== 1)
      this.fail("CONFIGURATION");
    const result = await SERVICE.DefaultModuleService.invokeModule({ ...target, local: false, methodName: "POST",
      tenant: request.tenant, request: { tenant: request.tenant }, requestBody: body,
      header: { Authorization: request.authorization, "X-Enterprise-Code": request.enterpriseCode } });
    return SERVICE.DefaultLoyaltyParticipantService.unwrap(result);
  },
  /**
   * Verifies exact durable Bidding intent; selected purchase postings additionally require Checkout's terminal fence.
   * @param {Object} request Original trusted request, including tenant, signed principal and operation payload.
   * @param {string|Function|Object} operation Owner-selected operation, transaction callback or persisted operation as described above.
   * @returns {Promise<void>} Admission succeeds without return data; effects and evidence checks are described above.
   * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
   * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
   */
  authorize: async function (request, operation) {
    const p = request.payload;
    const pinned = structuredClone({ payload: p, authData: request.authData, tenant: request.tenant,
      authorization: request.authorization });
    if (typeof p.idempotencyKey !== "string" || !p.idempotencyKey || !p.roundCode || !p.storeCode)
      this.fail("FORBIDDEN");
    const proof = await this.remote(request, this.policy().biddingEvidence, { operation, command: p });
    if (!isDeepStrictEqual(pinned, { payload: request.payload, authData: request.authData, tenant: request.tenant,
      authorization: request.authorization }) || proof?.confirmed !== true || proof.tenant !== request.tenant || proof.operation !== operation ||
        !isDeepStrictEqual(proof.command, p)) this.fail("FORBIDDEN");
    if (operation === "capture" && proof.checkoutRequired !== true) this.fail("FORBIDDEN");
    if (["qualify", "inspect", "reserve", "adjust"].includes(operation)) {
      const spend = proof.spendAdmission;
      if (spend?.confirmed !== true || !isDeepStrictEqual(spend.ownerRef, p.ownerRef) ||
          !isDeepStrictEqual(spend.actorRef, p.actorRef) || spend.amount !== p.amount || spend.currency !== p.currency ||
          typeof spend.actorAuthorized !== "boolean" || typeof spend.withinLimit !== "boolean") this.fail("FORBIDDEN");
      request.spendAdmission = structuredClone(spend);
    }
    if (proof.checkoutRequired) {
      const receipt = await this.remote(request, this.policy().checkoutEvidence, { operation, command: p });
      if (!isDeepStrictEqual(pinned, { payload: request.payload, authData: request.authData, tenant: request.tenant,
        authorization: request.authorization }) || receipt?.confirmed !== true || receipt.tenant !== request.tenant || receipt.operation !== operation ||
          receipt.orderCode !== p.orderCode || receipt.roundCode !== p.roundCode || receipt.bidCode !== p.sourceCode ||
          receipt.reservationCode !== p.reservationCode || receipt.idempotencyKey !== p.idempotencyKey ||
          receipt.amount !== p.amount || !receipt.receiptCode || receipt.terminalFence !== true ||
          receipt.decision !== (operation === "capture" ? ENUMS.LoyaltyLedgerEntryType.CAPTURE.key : ENUMS.LoyaltyLedgerEntryType.RELEASE.key)) this.fail("FORBIDDEN");
      request.purchaseReceipt = receipt.receiptCode;
    }
  },
  /**
   * Requires unique, acknowledged generated-service reads, including inside the shared transaction.
   * @param {Object} request Original trusted request, including tenant, signed principal and operation payload.
   * @param {string} name Owner-selected service or header name.
   * @param {Object} query Owner-built exact persistence selector, never a client query.
   * @returns {Promise<*>} Requires unique, acknowledged generated-service reads, including inside the shared transaction.
   * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
   * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
   */
  read: async function (request, name, query) {
    const service = SERVICE["Default" + name + "Service"];
    if (typeof service?.get !== "function") this.fail("PERSISTENCE");
    const input = SERVICE.DefaultLoyaltyRewardOperationService.serviceRequest(request, { query });
    const result = await service.get({ ...input, searchOptions: { pageSize: 2, pageNumber: 1 },
      options: { skipItemCache: true, recursive: false } });
    if (!/^SUC_/.test(result?.code || "") || result.error || result.success === false ||
        !Array.isArray(result.result) || result.result.length > 1 || result.count !== result.result.length ||
        result.result.some(row => !row || Object.entries(query).some(([key, value]) => !isDeepStrictEqual(row[key], value))))
      this.fail("PERSISTENCE");
    return result.result[0];
  },
  /**
   * Checks a configured record's business validity without changing that record or choosing another owner.
   * @param {Object} row Persisted owner record with original revision and evidence.
   * @param {string} status Canonical lifecycle state to verify or project.
   * @returns {*} Checks a configured record's business validity without changing that record or choosing another owner.
   * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
   * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
   */
  active: function (row, status) {
    const now = Date.now();
    return !!row && row.active === true && row.status === status &&
      (!row.startsAt || Number.isFinite(Date.parse(row.startsAt)) && Date.parse(row.startsAt) <= now) &&
      (!row.endsAt || Number.isFinite(Date.parse(row.endsAt)) && now < Date.parse(row.endsAt));
  },
  /**
   * Resolves governed reward funding; Commerce alone supplies actor spending policy evidence.
   * @param {Object} request Original trusted request, including tenant, signed principal and operation payload.
   * @param {string|Function|Object} operation Owner-selected operation, transaction callback or persisted operation as described above.
   * @returns {Promise<*>} Resolves governed reward funding; Commerce alone supplies actor spending policy evidence.
   * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
   * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
   */
  funding: async function (request, operation) {
    const p = request.payload, selected = operation === "qualify" ? p.funding || {} : p;
    if (p.ownerRef?.module !== "profile" || !["customer", "enterprise"].includes(p.ownerRef.schema) || !p.ownerRef.code ||
        !p.actorRef?.loginId || !["customer", "human"].includes(p.actorRef.principalType)) this.fail("FORBIDDEN");
    const ownerType = p.ownerRef.schema.toUpperCase(), ownerCode = p.ownerRef.code;
    const wallet = await this.read(request, "LoyaltyWallet", selected.walletCode
      ? { code: selected.walletCode } : { ownerType, ownerCode });
    if (!wallet || wallet.ownerType !== ownerType || wallet.ownerCode !== ownerCode) this.fail("FORBIDDEN");
    const choices = wallet.metadata?.auctionFunding;
    const disposition = ["capture", "release"].includes(operation);
    if (!Array.isArray(choices) && !disposition) this.fail("FUNDING");
    const matches = disposition ? [selected] : choices.filter(row => row.currency === p.currency &&
      (!selected.programCode || selected.programCode === row.programCode) &&
      (!selected.rewardTypeCode || selected.rewardTypeCode === row.rewardTypeCode));
    if (matches.length !== 1) this.fail("FUNDING");
    const choice = matches[0];
    const type = await this.read(request, "LoyaltyRewardType", { code: choice.rewardTypeCode });
    const program = await this.read(request, "LoyaltyProgram", { code: choice.programCode });
    if (!type || !program) this.fail("FUNDING");
    const scale = this.amount().precision(type.precision), amount = this.amount().assertPositive(p.amount, scale);
    if (p.scale !== undefined && p.scale !== scale) this.fail("FUNDING");
    const withinLimit = request.spendAdmission?.withinLimit === true;
    const active = this.active(wallet, ENUMS.LoyaltyWalletStatus.OPEN.key) && this.active(type, ENUMS.LoyaltyRewardTypeStatus.ACTIVE.key) && this.active(program, ENUMS.LoyaltyProgramStatus.ACTIVE.key) &&
      program.spendEnabled === true && choice.enabled === true;
    const balance = await this.read(request, "LoyaltyWalletRewardBalance", { walletCode: wallet.code,
      programCode: program.code, rewardTypeCode: type.code });
    if (!balance) this.fail("FUNDING");
    let reservation;
    if (p.reservationCode) {
      reservation = await this.read(request, "RewardReservation", { code: p.reservationCode });
      if (!reservation || reservation.walletCode !== wallet.code || reservation.programCode !== program.code ||
          reservation.rewardTypeCode !== type.code || reservation.holdPolicy !== ENUMS.LoyaltyProtectedHoldPolicy.AUCTION_ROUND.key ||
          reservation.sourceType !== "BIDDING" || reservation.targetType !== ENUMS.LoyaltyProtectedHoldPolicy.AUCTION_ROUND.key ||
          reservation.targetCode !== p.roundCode || !isDeepStrictEqual(reservation.metadata?.auction?.ownerRef, p.ownerRef) ||
          operation !== "qualify" && reservation.sourceCode !== p.sourceCode) this.fail("FORBIDDEN");
    }
    const available = this.amount().toMinor(balance.available, scale) +
      (reservation?.status === ENUMS.LoyaltyReservationStatus.RESERVED.key ? this.amount().toMinor(reservation.amount, scale) : 0n);
    return { wallet, type, program, scale, amount, balance, reservation, withinLimit,
      actorAuthorized: request.spendAdmission?.actorAuthorized === true,
      active, affordable: available >= this.amount().toMinor(amount, scale) };
  },
  /**
   * Resolves admission and exact reward precision without creating wallets or changing balances.
   * @param {Object} input Operation-specific command or evidence input described above; not authorization.
   * @returns {Promise<*>} Resolves admission and exact reward precision without creating wallets or changing balances.
   * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
   * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
   */
  qualify: async function (input) {
    const request = this.context(input);
    await this.authorize(request, "qualify");
    const f = await this.funding(request, "qualify");
    return { eligible: f.active && f.actorAuthorized && f.withinLimit, affordable: f.affordable,
      actorAuthorized: f.actorAuthorized, withinLimit: f.withinLimit, ownerRef: request.payload.ownerRef,
      amount: f.amount, scale: f.scale, walletCode: f.wallet.code, programCode: f.program.code, rewardTypeCode: f.type.code };
  },
  /**
   * Reads only confirmed funding state; unavailable persistence is not an ineligible bid.
   * @param {Object} input Operation-specific command or evidence input described above; not authorization.
   * @returns {Promise<*>} Reads only confirmed funding state; unavailable persistence is not an ineligible bid.
   * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
   * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
   */
  inspect: async function (input) {
    const request = this.context(input);
    await this.authorize(request, "inspect");
    const f = await this.funding(request, "inspect");
    const held = !request.payload.reservationCode || f.reservation?.status === ENUMS.LoyaltyReservationStatus.RESERVED.key &&
      f.reservation.expiresAt === null && this.amount().compare(f.reservation.amount, f.amount, f.scale) === 0 &&
      this.amount().compare(f.balance.reserved, f.reservation.amount, f.scale) >= 0;
    return { confirmed: true, eligible: f.active && f.actorAuthorized && f.withinLimit && f.affordable && held,
      ownerRef: request.payload.ownerRef, amount: f.amount,
      ...(f.reservation ? { reservation: this.project(f.reservation) } : {}) };
  },
  /**
   * Returns only public reservation evidence, not command history or actor funding rules.
   * @param {Object} row Persisted owner record with original revision and evidence.
   * @returns {Object} Allowlisted evidence projection; no accounting or persistence writes.
   * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
   */
  project: function (row) {
    return { code: row.code, walletCode: row.walletCode, programCode: row.programCode, rewardTypeCode: row.rewardTypeCode,
      amount: row.amount, status: row.status, expiresAt: row.expiresAt, holdUntilRelease: row.holdPolicy === ENUMS.LoyaltyProtectedHoldPolicy.AUCTION_ROUND.key };
  },
  /**
   * Hashes immutable operation terms into receipt keys and fingerprints.
   * @param {*} value Value to validate, normalize or project as described above.
   * @returns {string} Deterministic digest of ordered identity components; no persistence.
   * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
   */
  hash: function (value) { return crypto.createHash("sha256").update(JSON.stringify(value)).digest("hex"); },
  /**
   * Admits source operations only for the lifetime of the exact canonical composed transaction.
   * @param {Object} request Original trusted request, including tenant, signed principal and operation payload.
   * @returns {boolean} Whether private original-operation admission owns this request.
   * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
   */
  ownsSourceRequest: function (request) {
    const admitted = admissions.get(request?.auctionContext);
    return !!admitted && Object.keys(admitted).every(key => key === "transactionContext"
      ? request[key] === admitted[key] : isDeepStrictEqual(request[key], admitted[key]));
  },
  /**
   * Performs all balance, ledger, reservation and command-receipt writes in one canonical transaction.
   * @param {Object} input Operation-specific command or evidence input described above; not authorization.
   * @param {string|Function|Object} operation Owner-selected operation, transaction callback or persisted operation as described above.
   * @returns {Promise<*>} Performs all balance, ledger, reservation and command-receipt writes in one canonical transaction.
   * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
   * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
   */
  post: async function (input, operation) {
    const request = this.context(input);
    await this.authorize(request, operation);
    const operations = SERVICE.DefaultLoyaltyRewardOperationService, transactions = SERVICE.DefaultLoyaltyTransactionService;
    if (!transactions?.compose || !transactions?.join) this.fail("TRANSACTION");
    return transactions.compose(request, async () => {
      const p = request.payload, f = await this.funding(request, operation);
      const reservationCode = p.reservationCode || "AUCTION_HOLD_" + this.hash([request.tenant, p.roundCode, p.sourceCode]);
      let before = f.reservation || await this.read(request, "RewardReservation", { code: reservationCode });
      const fingerprint = this.hash([operation, p]), key = this.hash(p.idempotencyKey);
      if (before) {
        const a = before.metadata?.auction;
        if (before.holdPolicy !== ENUMS.LoyaltyProtectedHoldPolicy.AUCTION_ROUND.key || before.walletCode !== f.wallet.code || before.programCode !== f.program.code ||
            before.rewardTypeCode !== f.type.code || before.targetCode !== p.roundCode || before.sourceCode !== p.sourceCode ||
            !isDeepStrictEqual(a?.ownerRef, p.ownerRef) || a.publicationCode !== p.publicationCode) this.fail("FORBIDDEN");
        if (!a.commands || typeof a.commands !== "object") this.fail("PERSISTENCE");
        if (a.commands[key]) {
          if (a.commands[key].fingerprint !== fingerprint) this.fail("IDEMPOTENCY");
          return structuredClone(a.commands[key].result);
        }
        if (operation === "reserve" || before.status !== ENUMS.LoyaltyReservationStatus.RESERVED.key || before.expiresAt !== null ||
            operation === "adjust" && Object.keys(a.commands).length >= this.policy().maximumCommands) this.fail("RESERVATION");
      } else if (operation !== "reserve") this.fail("RESERVATION");
      if (["reserve", "adjust"].includes(operation) && (!f.active || !f.actorAuthorized || !f.withinLimit || !f.affordable))
        this.fail("FUNDING");
      const source = { tenant: request.tenant, authData: structuredClone(request.authData), authorization: request.authorization,
        transactionContext: request.transactionContext, walletCode: f.wallet.code, programCode: f.program.code,
        rewardTypeCode: f.type.code, amount: f.amount, scale: f.scale, reservationCode,
        sourceType: "BIDDING", sourceCode: p.sourceCode, targetType: ENUMS.LoyaltyProtectedHoldPolicy.AUCTION_ROUND.key, targetCode: p.roundCode,
        holdPolicy: ENUMS.LoyaltyProtectedHoldPolicy.AUCTION_ROUND.key, auctionOperation: operation, idempotencyKey: p.idempotencyKey, correlationId: p.roundCode,
        ...(request.purchaseReceipt ? { providerReference: request.purchaseReceipt } : {}) };
      const token = {};
      admissions.set(token, { ...source, authData: structuredClone(source.authData) });
      let result;
      try { result = await operations[operation === "adjust" ? "adjustAuction" : operation]({ ...source, auctionContext: token }); }
      finally { admissions.delete(token); }
      let saved = await this.read(request, "RewardReservation", { code: reservationCode });
      const status = operation === "capture" ? ENUMS.LoyaltyReservationStatus.CAPTURED.key : operation === "release" ? ENUMS.LoyaltyReservationStatus.RELEASED.key : ENUMS.LoyaltyReservationStatus.RESERVED.key;
      if (!saved || saved.status !== status || saved.amount !== f.amount || saved.expiresAt !== null ||
          saved.holdPolicy !== ENUMS.LoyaltyProtectedHoldPolicy.AUCTION_ROUND.key || saved.walletCode !== f.wallet.code || saved.sourceCode !== p.sourceCode ||
          saved.targetCode !== p.roundCode || saved.programCode !== f.program.code || saved.rewardTypeCode !== f.type.code)
        this.fail("PERSISTENCE");
      if (result?.ledgerEntry) {
        const ledger = await this.read(request, "RewardLedgerEntry", { code: result.ledgerEntry.code });
        if (!ledger || ledger.reservationCode !== reservationCode || ledger.idempotencyKey !== p.idempotencyKey ||
            !saved.ledgerEntryCodes.includes(ledger.code)) this.fail("PERSISTENCE");
      } else if (operation !== "adjust" || !before || before.amount !== f.amount) this.fail("PERSISTENCE");
      const balance = await this.read(request, "LoyaltyWalletRewardBalance", { code: f.balance.code });
      if (result.balance && (!balance || ["available", "reserved", "spent", "revision"].some(field =>
        balance[field] !== result.balance[field]))) this.fail("PERSISTENCE");
      if (operation === "capture") {
        const redemption = await this.read(request, "RewardRedemption", { code: result.redemption?.code });
        if (!redemption || redemption.reservationCode !== reservationCode || redemption.amount !== f.amount ||
            redemption.status !== ENUMS.LoyaltyRedemptionStatus.CAPTURED.key || redemption.providerReference !== request.purchaseReceipt) this.fail("PERSISTENCE");
      }
      const response = { confirmed: true, reservation: this.project(saved),
        ...(result.redemption ? { redemptionCode: result.redemption.code } : {}) };
      const model = { ...saved, revision: saved.revision + 1, metadata: { ...saved.metadata, auction: {
        ...saved.metadata?.auction, ownerRef: p.ownerRef, publicationCode: p.publicationCode,
        commands: { ...saved.metadata?.auction?.commands, [key]: { fingerprint, result: response } },
      } } };
      const write = await SERVICE.DefaultRewardReservationService.update(operations.serviceRequest(request, {
        query: { code: saved.code, revision: saved.revision }, model }));
      if (!/^SUC_/.test(write?.code || "") || write.error || write.success === false) this.fail("PERSISTENCE");
      saved = await this.read(request, "RewardReservation", { code: saved.code });
      if (saved?.revision !== model.revision || !isDeepStrictEqual(saved.metadata, model.metadata)) this.fail("PERSISTENCE");
      return response;
    });
  },
  /**
   * Creates one full original protected hold.
   * @param {Object} request Original trusted request, including tenant, signed principal and operation payload.
   * @returns {*} Creates one full original protected hold.
   * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
   * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
   */
  reserve: function (request) { return this.post(request, "reserve"); },
  /**
   * Adjusts only the delta on the original reservation.
   * @param {Object} request Original trusted request, including tenant, signed principal and operation payload.
   * @returns {*} Adjusts only the delta on the original reservation.
   * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
   * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
   */
  adjust: function (request) { return this.post(request, "adjust"); },
  /**
   * Releases only a Bidding-reconciled loser or Checkout-reconciled winner.
   * @param {Object} request Original trusted request, including tenant, signed principal and operation payload.
   * @returns {*} Releases only a Bidding-reconciled loser or Checkout-reconciled winner.
   * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
   * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
   */
  release: function (request) { return this.post(request, "release"); },
  /**
   * Captures exactly the selected original hold after Checkout's terminal decision.
   * @param {Object} request Original trusted request, including tenant, signed principal and operation payload.
   * @returns {*} Captures exactly the selected original hold after Checkout's terminal decision.
   * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
   * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
   */
  capture: function (request) { return this.post(request, "capture"); },
};
