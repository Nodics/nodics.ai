/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";

const crypto = require("node:crypto");
const LEDGER = require("../../../loyaltyLedger/src/service/defaultLoyaltyLedgerPostingService");
const UTILS = require("../../../loyaltyCore/src/utils/utils");

/** @module loyaltyWallet/src/service/defaultLoyaltyRewardOperationService @description Coordinates reward earn, reserve, capture, release, and reverse operations against wallet balances and append-only ledger evidence. @layer service @owner loyaltyWallet @override Later modules may wrap persistence in stronger storage transactions while preserving ledger-backed balance semantics. */
module.exports = {
  /**
   * Resolves the effective Loyalty amount owner for every operation.
   * @returns {Object} Loader-selected amount service; no effects or inline fallback.
   * @override Preserve exact amount and precision contracts in later-layer overrides.
   */
  amount: function () { return SERVICE.DefaultLoyaltyAmountService; },
  /**
   * Declares guarded outcome-based holds; only private conversion-owner commands may mutate them.
   * @returns {*} Declares guarded outcome-based holds; only private conversion-owner commands may mutate them.
   * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
   * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
   */
  partnerConversionCapabilities: function () { return { heldUntilOutcome: true, originalAuthority: true }; },
  /**
   * Protects uncertain external credits from generic release, capture, expiry or forged hold policies.
   * @param {Object} request Original trusted request, including tenant, signed principal and operation payload.
   * @param {Object} reservation Original reservation and its protected-hold evidence.
   * @returns {boolean} True for a privately admitted protected hold; false for an ordinary hold.
   * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
   * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
   */
  authorizeProtectedHold: function (request, reservation) {
    const selected = request.holdPolicy || request.payload?.holdPolicy;
    if (selected !== undefined && ![ENUMS.LoyaltyProtectedHoldPolicy.EXTERNAL_OUTCOME.key, ENUMS.LoyaltyProtectedHoldPolicy.AUCTION_ROUND.key].includes(selected))
      this.fail("ERR_LOYALTY_CONVERSION_FORBIDDEN", "Unknown reward hold policy");
    if (selected === ENUMS.LoyaltyProtectedHoldPolicy.EXTERNAL_OUTCOME.key || reservation?.holdPolicy === ENUMS.LoyaltyProtectedHoldPolicy.EXTERNAL_OUTCOME.key) {
      if (SERVICE.DefaultLoyaltyPartnerRewardConversionService?.ownsSourceRequest(request) !== true ||
        reservation && ["walletCode", "programCode", "rewardTypeCode", "sourceType", "sourceCode", "targetType", "targetCode", "amount"]
          .some(key => reservation[key] !== request[key]))
        this.fail("ERR_LOYALTY_CONVERSION_FORBIDDEN", "External outcome hold requires its original owner");
      return true;
    }
    if (selected === ENUMS.LoyaltyProtectedHoldPolicy.AUCTION_ROUND.key || reservation?.holdPolicy === ENUMS.LoyaltyProtectedHoldPolicy.AUCTION_ROUND.key ||
        (request.targetType || request.payload?.targetType) === ENUMS.LoyaltyProtectedHoldPolicy.AUCTION_ROUND.key) {
      if (SERVICE.DefaultLoyaltyAuctionFundsService?.ownsSourceRequest(request) !== true ||
          reservation && ["walletCode", "programCode", "rewardTypeCode", "sourceType", "sourceCode", "targetType", "targetCode"]
            .some(key => reservation[key] !== request[key]) ||
          reservation && request.auctionOperation !== "adjust" && reservation.amount !== request.amount)
        this.fail("ERR_LOYALTY_AUCTION_FORBIDDEN", "Auction hold requires its original owner");
      return true;
    }
    return false;
  },
  /**
   * Unwraps a standard result envelope while preserving raw provider values.
   * @param {Object} response Dependency response envelope to validate.
   * @returns {*} Existing result payload when present, otherwise the original envelope; performs no success validation or writes.
   * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
   */
  unwrap: function (response) { return response && Object.prototype.hasOwnProperty.call(response, "result")
      ? response.result
      : response; },
  /**
   * Throws the owning operation error and stops processing; callers retain responsibility for recovery.
   * @param {string} code Exact record identity or stable owner error code, as described above.
   * @param {string} message Content-safe owner diagnostic.
   * @returns {never} Always throws a content-safe owner error; no business writes.
   * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
   * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
   */
  fail: function (code, message) {
    let error =
      typeof CLASSES !== "undefined" && CLASSES.NodicsError
        ? new CLASSES.NodicsError(code, message)
        : new Error(message);
    error.code = code;
    throw error;
  },
  /**
   * Normalizes a supplied timestamp to a Date, defaulting to the operation time.
   * @param {*} value Value to validate, normalize or project as described above.
   * @returns {Date} Schema-compatible date for retained operation evidence.
   * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
   */
  schemaDate: function (value) {
    return value instanceof Date ? value : value ? new Date(value) : new Date();
  },
  /**
   * Builds the internal Loyalty service actor while retaining the incoming runtime tenant context.
   * @param {Object} request Original trusted request, including tenant, signed principal and operation payload.
   * @returns {*} Builds the internal Loyalty service actor while retaining the incoming runtime tenant context.
   * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
   * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
   */
  serviceAuthData: function (request) {
    return Object.assign({}, request.authData || {}, {
      tenant: request.tenant || (request.authData && request.authData.tenant),
      principalId: "loyaltyRewardOperationService",
      code: "loyaltyRewardOperationService",
      loginId: "loyaltyRewardOperationService",
      principalType: "service",
      userGroups: ["serviceAccountUserGroup"],
      groups: ["serviceAccountUserGroup"],
    });
  },
  /**
   * Resolves the named loader-composed service and rejects a required service that is unavailable.
   * @param {string} name Owner-selected service or header name.
   * @param {boolean} required Whether a missing service must fail closed.
   * @returns {Object} Registered effective service; missing required dependencies refuse.
   * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
   * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
   */
  service: function (name, required) {
    let service = typeof SERVICE !== "undefined" ? SERVICE[name] : undefined;
    if (!service && required !== false)
      this.fail("ERR_LOYALTY_SERVICE_MISSING", name + " is not available");
    return service;
  },
  /**
   * Builds a bounded generated-service request containing trusted context and the specified query or model.
   * @param {Object} request Original trusted request, including tenant, signed principal and operation payload.
   * @param {Object} options Owner-built persistence or operation options.
   * @returns {*} Builds a bounded generated-service request containing trusted context and the specified query or model.
   * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
   * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
   */
  serviceRequest: function (request, options) {
    options = options || {};
    let serviceRequest = {
      tenant: request.tenant || (request.authData && request.authData.tenant),
      authData: this.serviceAuthData(request),
    };
    if (options.query) serviceRequest.query = options.query;
    if (options.model) serviceRequest.model = options.model;
    if (options.pageSize) serviceRequest.pageSize = options.pageSize;
    if (request.transactionContext)
      serviceRequest.transactionContext = request.transactionContext;
    return serviceRequest;
  },
  /**
   * Unwraps the first record returned by a generated-service read.
   * @param {Object|string} service Effective generated persistence service or its registered name.
   * @param {Object} request Original trusted request, including tenant, signed principal and operation payload.
   * @returns {Promise<*>} Unwraps the first record returned by a generated-service read.
   * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
   * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
   */
  getOne: async function (service, request) {
    if (!service || !service.get) return undefined;
    let result = this.unwrap(await service.get(request));
    return Array.isArray(result) ? result[0] : result;
  },
  /**
   * Removes transport and runtime-context fields from the model sent to owning persistence.
   * @param {Object} model Owner-built persistence model.
   * @returns {*} Removes transport and runtime-context fields from the model sent to owning persistence.
   * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
   * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
   */
  persistenceModel: function (model) {
    let copy = Object.assign({}, model || {});
    [
      "tenant",
      "enterpriseCode",
      "authData",
      "payload",
      "httpRequest",
      "scale",
    ].forEach((field) => delete copy[field]);
    return copy;
  },
  /**
   * Uses the generated service update or save operation; optional absent persistence returns the supplied model.
   * @param {Object|string} service Effective generated persistence service or its registered name.
   * @param {Object} request Original trusted request, including tenant, signed principal and operation payload.
   * @param {Object} model Owner-built persistence model.
   * @param {Object} query Owner-built exact persistence selector, never a client query.
   * @returns {Promise<*>} Uses the generated service update or save operation; optional absent persistence returns the supplied model.
   * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
   * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
   */
  saveModel: async function (service, request, model, query) {
    if (!service) return model;
    let serviceRequest = this.serviceRequest(request, {
      model: this.persistenceModel(model),
      query: query,
    });
    if (query && service.update)
      return this.unwrap(await service.update(serviceRequest));
    if (service.save) return this.unwrap(await service.save(serviceRequest));
    return model;
  },
  /**
   * Derives a stable prefixed identity from the ordered operation parts for replay-safe record references.
   * @param {string} prefix Stable identity namespace.
   * @param {Array} parts Ordered identity components.
   * @returns {string} Deterministic namespaced identity; no persistence.
   * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
   */
  hashCode: function (prefix, parts) {
    return [
      prefix,
      crypto
        .createHash("sha1")
        .update(parts.map((part) => String(part || "")).join("|"))
        .digest("hex"),
    ].join(":");
  },
  /**
   * Resolves or derives the balance identity for a wallet, reward program and reward type.
   * @param {Object} request Original trusted request, including tenant, signed principal and operation payload.
   * @returns {string} Stable canonical balance identity; no persistence.
   * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
   */
  balanceCode: function (request) {
    let payload = request.payload || {};
    return (
      request.balanceCode ||
      payload.balanceCode ||
      this.hashCode("loyaltyWalletRewardBalance", [
        request.walletCode || payload.walletCode,
        request.programCode || payload.programCode,
        request.rewardTypeCode || payload.rewardTypeCode,
      ])
    );
  },
  /**
   * Resolves or derives the reservation identity from its stable operation key.
   * @param {Object} request Original trusted request, including tenant, signed principal and operation payload.
   * @returns {string} Stable original reservation identity; no persistence.
   * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
   */
  reservationCode: function (request) {
    let payload = request.payload || {};
    return (
      request.reservationCode ||
      payload.reservationCode ||
      this.hashCode("rewardReservation", [this.idempotencyKey(request)])
    );
  },
  /**
   * Resolves or derives redemption identity from the operation and reservation references.
   * @param {Object} request Original trusted request, including tenant, signed principal and operation payload.
   * @returns {string} Stable original redemption identity; no persistence.
   * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
   */
  redemptionCode: function (request) {
    let payload = request.payload || {};
    return (
      request.redemptionCode ||
      payload.redemptionCode ||
      this.hashCode("rewardRedemption", [
        this.idempotencyKey(request),
        request.reservationCode || payload.reservationCode,
      ])
    );
  },
  /**
   * Derives ledger identity from movement type, operation key and wallet/reservation references.
   * @param {Object} request Original trusted request, including tenant, signed principal and operation payload.
   * @param {string} entryType Canonical ledger movement type.
   * @returns {string} Stable original ledger identity; no persistence.
   * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
   */
  ledgerCode: function (request, entryType) {
    return this.hashCode("rewardLedgerEntry", [
      entryType,
      this.idempotencyKey(request),
      request.walletCode,
      request.programCode,
      request.rewardTypeCode,
      request.reservationCode || "",
      request.redemptionCode || "",
    ]);
  },
  /**
   * Reads the stable operation key from the request or payload for replay detection.
   * @param {Object} request Original trusted request, including tenant, signed principal and operation payload.
   * @returns {string} Validated original operation key; no persistence.
   * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
   * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
   */
  idempotencyKey: function (request) {
    let payload = request.payload || {};
    return (
      request.idempotencyKey || payload.idempotencyKey || request.requestId
    );
  },
  /**
   * Reads the diagnostic correlation identifier, falling back to the stable operation key.
   * @param {Object} request Original trusted request, including tenant, signed principal and operation payload.
   * @returns {string} Operation correlation identity; no persistence.
   * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
   * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
   */
  correlationId: function (request) {
    let payload = request.payload || {};
    return (
      request.correlationId ||
      payload.correlationId ||
      request.requestId ||
      this.idempotencyKey(request)
    );
  },
  /**
   * Normalizes required reward movement fields and validates a positive exact amount before persistence.
   * @param {Object} request Original trusted request, including tenant, signed principal and operation payload.
   * @param {string} entryType Canonical ledger movement type.
   * @returns {*} Normalizes required reward movement fields and validates a positive exact amount before persistence.
   * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
   * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
   */
  operationRequest: function (request, entryType) {
    request = Object.assign({}, request || {});
    let payload = request.payload || {};
    request.walletCode = request.walletCode || payload.walletCode;
    request.programCode = request.programCode || payload.programCode;
    request.rewardTypeCode = request.rewardTypeCode || payload.rewardTypeCode;
    request.amount = request.amount || payload.amount;
    request.sourceType = request.sourceType || payload.sourceType || entryType;
    request.sourceCode =
      request.sourceCode || payload.sourceCode || this.idempotencyKey(request);
    request.targetType = request.targetType || payload.targetType;
    request.targetCode = request.targetCode || payload.targetCode;
    // Only these evidence fields cross the payload boundary; metadata never supplies operation authority.
    const reasonCode = request.reasonCode === undefined ? payload.reasonCode : request.reasonCode;
    const metadata = request.metadata === undefined ? payload.metadata : request.metadata;
    if (reasonCode !== undefined) {
      if (typeof reasonCode !== "string" || !reasonCode.trim())
        this.fail("ERR_LOYALTY_OPERATION_REQUIRED", "reasonCode must be nonempty text");
      request.reasonCode = reasonCode;
    }
    if (metadata !== undefined) {
      if (!metadata || typeof metadata !== "object" || Array.isArray(metadata) ||
          ![Object.prototype, null].includes(Object.getPrototypeOf(metadata)))
        this.fail("ERR_LOYALTY_OPERATION_REQUIRED", "metadata must be an evidence object");
      request.metadata = structuredClone(metadata);
    }
    request.idempotencyKey = this.idempotencyKey(request);
    request.correlationId = this.correlationId(request);
    request.scale = request.scale === undefined ? payload.scale : request.scale;
    [
      "walletCode",
      "programCode",
      "rewardTypeCode",
      "amount",
      "idempotencyKey",
      "correlationId",
    ].forEach((field) => {
      if (!UTILS.normalizeString(request[field]))
        this.fail("ERR_LOYALTY_OPERATION_REQUIRED", field + " is required");
    });
    request.amount = this.amount().assertPositive(request.amount, request.scale);
    return request;
  },
  /**
   * Selects a balance by explicit code or by its wallet/program/reward-type tuple.
   * @param {Object} request Original trusted request, including tenant, signed principal and operation payload.
   * @returns {*} Selects a balance by explicit code or by its wallet/program/reward-type tuple.
   * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
   * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
   */
  balanceQuery: function (request) {
    if (request.balanceCode) return { code: request.balanceCode };
    return {
      walletCode: request.walletCode,
      programCode: request.programCode,
      rewardTypeCode: request.rewardTypeCode,
    };
  },
  /**
   * Builds an unsaved zero balance with lifecycle timestamps and revision zero.
   * @param {Object} request Original trusted request, including tenant, signed principal and operation payload.
   * @returns {*} Builds an unsaved zero balance with lifecycle timestamps and revision zero.
   * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
   * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
   */
  initialBalance: function (request) {
    let now = this.schemaDate(request.now);
    return {
      code: this.balanceCode(request),
      walletCode: request.walletCode,
      programCode: request.programCode,
      rewardTypeCode: request.rewardTypeCode,
      available: "0.00",
      reserved: "0.00",
      earned: "0.00",
      spent: "0.00",
      expired: "0.00",
      reversed: "0.00",
      revision: 0,
      updatedAt: now,
      active: true,
      created: now,
      updated: now,
    };
  },
  /**
   * Loads the owning reward balance or, only when allowed, returns a marked unsaved zero balance.
   * @param {Object} request Original trusted request, including tenant, signed principal and operation payload.
   * @param {boolean} createIfMissing Allow owner-authorized initial balance creation.
   * @returns {Promise<*>} Loads the owning reward balance or, only when allowed, returns a marked unsaved zero balance.
   * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
   * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
   */
  getBalance: async function (request, createIfMissing) {
    let service = this.service("DefaultLoyaltyWalletRewardBalanceService");
    let balance = await this.getOne(
      service,
      this.serviceRequest(request, {
        query: this.balanceQuery(request),
        pageSize: 1,
      }),
    );
    if (!balance && createIfMissing)
      return Object.assign(this.initialBalance(request), { _new: true });
    if (!balance)
      this.fail(
        "ERR_LOYALTY_BALANCE_MISSING",
        "loyalty wallet reward balance was not found",
      );
    return balance;
  },
  /**
   * Persists a new or existing balance through its generated service without storing the transient new-record marker.
   * @param {Object} request Original trusted request, including tenant, signed principal and operation payload.
   * @param {Object} balance Canonical balance snapshot with exact amounts and revision.
   * @returns {Promise<*>} Persists a new or existing balance through its generated service without storing the transient new-record marker.
   * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
   * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
   */
  saveBalance: async function (request, balance) {
    let model = Object.assign({}, balance);
    let isNew = !!model._new;
    delete model._new;
    const expectedRevision = Number(model.revision) - 1;
    return this.saveModel(
      this.service("DefaultLoyaltyWalletRewardBalanceService"),
      request,
      model,
      isNew ? undefined : { code: model.code, revision: expectedRevision },
    );
  },
  /**
   * Loads the referenced reward reservation and rejects a missing identifier or record.
   * @param {Object} request Original trusted request, including tenant, signed principal and operation payload.
   * @returns {Promise<*>} Loads the referenced reward reservation and rejects a missing identifier or record.
   * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
   * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
   */
  getReservation: async function (request) {
    let service = this.service("DefaultRewardReservationService");
    let reservationCode =
      request.reservationCode ||
      (request.payload && request.payload.reservationCode);
    if (!reservationCode)
      this.fail(
        "ERR_LOYALTY_RESERVATION_REQUIRED",
        "reservationCode is required",
      );
    let reservation = await this.getOne(
      service,
      this.serviceRequest(request, {
        query: { code: reservationCode },
        pageSize: 1,
      }),
    );
    if (!reservation)
      this.fail(
        "ERR_LOYALTY_RESERVATION_MISSING",
        "reward reservation was not found",
      );
    return reservation;
  },
  /**
   * Creates or updates the reward reservation through its owning generated service.
   * @param {Object} request Original trusted request, including tenant, signed principal and operation payload.
   * @param {Object} reservation Original reservation and its protected-hold evidence.
   * @param {Object} existing Previously persisted record for conditional update.
   * @returns {Promise<*>} Creates or updates the reward reservation through its owning generated service.
   * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
   * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
   */
  saveReservation: async function (request, reservation, existing) {
    await this.saveModel(
      this.service("DefaultRewardReservationService"),
      request,
      reservation,
      existing ? { code: reservation.code } : undefined,
    );
    let persisted = await this.getOne(
      this.service("DefaultRewardReservationService"),
      this.serviceRequest(request, {
        query: { code: reservation.code },
        pageSize: 1,
      }),
    );
    let expectedLedgerEntries = reservation.ledgerEntryCodes || [];
    let persistedLedgerEntries = (persisted && persisted.ledgerEntryCodes) || [];
    if (
      !persisted ||
      persisted.code !== reservation.code ||
      persisted.walletCode !== reservation.walletCode ||
      persisted.status !== reservation.status ||
      Number(persisted.revision || 0) !== Number(reservation.revision || 0) ||
      expectedLedgerEntries.some(
        (entryCode) => !persistedLedgerEntries.includes(entryCode),
      )
    )
      this.fail(
        "ERR_LOYALTY_RESERVATION_WRITE_UNCONFIRMED",
        "reward reservation write could not be confirmed",
      );
    return persisted;
  },
  /**
   * Loads the original ledger entry required for a reversal and rejects missing evidence.
   * @param {Object} request Original trusted request, including tenant, signed principal and operation payload.
   * @returns {Promise<*>} Loads the original ledger entry required for a reversal and rejects missing evidence.
   * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
   * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
   */
  getLedgerEntry: async function (request) {
    let service = this.service("DefaultRewardLedgerEntryService");
    let entryCode =
      request.reversalOfEntryCode ||
      (request.payload && request.payload.reversalOfEntryCode);
    if (!entryCode)
      this.fail(
        "ERR_LOYALTY_REVERSAL_REQUIRED",
        "reversalOfEntryCode is required",
      );
    let entry = await this.getOne(
      service,
      this.serviceRequest(request, { query: { code: entryCode }, pageSize: 1 }),
    );
    if (!entry)
      this.fail(
        "ERR_LOYALTY_LEDGER_ENTRY_MISSING",
        "reward ledger entry was not found",
      );
    return entry;
  },
  /**
   * Finds prior movement evidence by operation key, type and available wallet/reservation scope.
   * @param {Object} request Original trusted request, including tenant, signed principal and operation payload.
   * @param {string} entryType Canonical ledger movement type.
   * @returns {Promise<*>} Finds prior movement evidence by operation key, type and available wallet/reservation scope.
   * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
   * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
   */
  getOperationLedgerEntry: async function (request, entryType) {
    if (!request.idempotencyKey) return undefined;
    let query = {
      idempotencyKey: request.idempotencyKey,
      entryType: entryType,
    };
    if (request.walletCode) query.walletCode = request.walletCode;
    if (request.programCode) query.programCode = request.programCode;
    if (request.rewardTypeCode) query.rewardTypeCode = request.rewardTypeCode;
    if (request.reservationCode)
      query.reservationCode = request.reservationCode;
    return this.getOne(
      this.service("DefaultRewardLedgerEntryService"),
      this.serviceRequest(request, { query: query, pageSize: 1 }),
    );
  },
  /**
   * Reads a reservation by code for an already-scoped operation result.
   * @param {Object} request Original trusted request, including tenant, signed principal and operation payload.
   * @param {string} reservationCode Original reservation identity.
   * @returns {Promise<*>} Reads a reservation by code for an already-scoped operation result.
   * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
   * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
   */
  getReservationByCode: async function (request, reservationCode) {
    if (!reservationCode) return undefined;
    return this.getOne(
      this.service("DefaultRewardReservationService"),
      this.serviceRequest(request, {
        query: { code: reservationCode },
        pageSize: 1,
      }),
    );
  },
  /**
   * Finds redemption evidence by code or idempotency/reservation reference.
   * @param {Object} request Original trusted request, including tenant, signed principal and operation payload.
   * @returns {Promise<*>} Finds redemption evidence by code or idempotency/reservation reference.
   * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
   * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
   */
  getRedemptionByRequest: async function (request) {
    let query = {};
    if (request.redemptionCode) query.code = request.redemptionCode;
    if (!query.code && request.idempotencyKey)
      query.idempotencyKey = request.idempotencyKey;
    if (request.reservationCode)
      query.reservationCode = request.reservationCode;
    if (!Object.keys(query).length) return undefined;
    return this.getOne(
      this.service("DefaultRewardRedemptionService"),
      this.serviceRequest(request, { query: query, pageSize: 1 }),
    );
  },
  /**
   * Reconstructs an idempotent result from existing ledger, balance and related movement evidence.
   * @param {string|Function|Object} operation Owner-selected operation, transaction callback or persisted operation as described above.
   * @param {Object} request Original trusted request, including tenant, signed principal and operation payload.
   * @param {Object} ledgerEntry Original immutable ledger entry.
   * @returns {Promise<*>} Reconstructs an idempotent result from existing ledger, balance and related movement evidence.
   * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
   * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
   */
  existingOperationResult: async function (operation, request, ledgerEntry) {
    let result = {
      operation: operation,
      ledgerEntry: ledgerEntry,
      idempotent: true,
    };
    result.balance = await this.getBalance(request, false);
    if (
      operation === ENUMS.LoyaltyLedgerEntryType.RESERVE.key ||
      operation === ENUMS.LoyaltyLedgerEntryType.CAPTURE.key ||
      operation === ENUMS.LoyaltyLedgerEntryType.RELEASE.key
    ) {
      result.reservation = await this.getReservationByCode(
        request,
        ledgerEntry.reservationCode || request.reservationCode,
      );
    }
    if (operation === ENUMS.LoyaltyLedgerEntryType.CAPTURE.key) {
      result.redemption = await this.getRedemptionByRequest(
        Object.assign({}, request, {
          redemptionCode: ledgerEntry.redemptionCode,
        }),
      );
    }
    if (operation === ENUMS.LoyaltyLedgerEntryType.REVERSE.key) {
      result.reversedEntry = await this.getOne(
        this.service("DefaultRewardLedgerEntryService"),
        this.serviceRequest(request, {
          query: { code: ledgerEntry.reversalOfEntryCode },
          pageSize: 1,
        }),
      );
    }
    return result;
  },
  /**
   * Appends movement evidence through the owning generated ledger service.
   * @param {Object} request Original trusted request, including tenant, signed principal and operation payload.
   * @param {Object} entry Original immutable ledger entry.
   * @returns {Promise<*>} Appends movement evidence through the owning generated ledger service.
   * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
   * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
   */
  saveLedgerEntry: async function (request, entry) {
    return this.saveModel(
      this.service("DefaultRewardLedgerEntryService"),
      request,
      entry,
    );
  },
  /**
   * Persists capture/redemption evidence through the owning generated service.
   * @param {Object} request Original trusted request, including tenant, signed principal and operation payload.
   * @param {Object} redemption Original redemption evidence.
   * @returns {Promise<*>} Persists capture/redemption evidence through the owning generated service.
   * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
   * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
   */
  saveRedemption: async function (request, redemption) {
    return this.saveModel(
      this.service("DefaultRewardRedemptionService"),
      request,
      redemption,
    );
  },
  /**
   * Returns exact decimal zero at the requested reward scale.
   * @param {number} scale Validated decimal precision from the canonical reward unit or issued lot.
   * @returns {string} Exact zero at the requested scale; no persistence.
   * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
   * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
   */
  amountZero: function (scale) {
    return this.amount().normalize("0", scale);
  },
  /**
   * Returns the exact negative of a normalized reward amount.
   * @param {string} amount Exact decimal amount; no floating-point conversion.
   * @param {number} scale Validated decimal precision from the canonical reward unit or issued lot.
   * @returns {string} Exact negative amount; no persistence.
   * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
   * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
   */
  negative: function (amount, scale) {
    return this.amount().subtract(this.amountZero(scale), amount, scale);
  },
  /**
   * Applies exact balance deltas to a copy, rejects negative fields and advances revision/timestamps.
   * @param {Object} balance Canonical balance snapshot with exact amounts and revision.
   * @param {Object} request Original trusted request, including tenant, signed principal and operation payload.
   * @param {Object} deltas Exact signed changes to balance counters.
   * @returns {*} Applies exact balance deltas to a copy, rejects negative fields and advances revision/timestamps.
   * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
   * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
   */
  changeBalance: function (balance, request, deltas) {
    let now = this.schemaDate(request.now);
    let after = Object.assign({}, balance);
    ["available", "reserved", "earned", "spent", "expired", "reversed"].forEach(
      (field) => {
        after[field] = this.amount().normalize(after[field] || "0", request.scale);
        if (deltas[field])
          after[field] = this.amount().add(
            after[field],
            deltas[field],
            request.scale,
          );
        if (this.amount().compare(after[field], "0", request.scale) < 0)
          this.fail(
            "ERR_LOYALTY_BALANCE_NEGATIVE",
            field + " balance cannot be negative",
          );
      },
    );
    after.revision = Number(after.revision || 0) + 1;
    after.updatedAt = now;
    after.updated = now;
    return after;
  },
  /**
   * Builds movement evidence with post-operation balances and stable source, target and replay references.
   * @param {Object} request Original trusted request, including tenant, signed principal and operation payload.
   * @param {Object} balance Canonical balance snapshot with exact amounts and revision.
   * @param {string} entryType Canonical ledger movement type.
   * @param {Object} options Owner-built persistence or operation options.
   * @returns {*} Builds movement evidence with post-operation balances and stable source, target and replay references.
   * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
   * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
   */
  ledgerEntry: function (request, balance, entryType, options) {
    options = options || {};
    let entry = LEDGER.buildEntry({
      code: this.ledgerCode(request, entryType),
      walletCode: request.walletCode,
      programCode: request.programCode,
      rewardTypeCode: request.rewardTypeCode,
      amount: request.amount,
      sourceType: request.sourceType,
      sourceCode: request.sourceCode,
      targetType: request.targetType,
      targetCode: request.targetCode,
      entryType: entryType,
      availableAfter: balance.available,
      reservedAfter: balance.reserved,
      reservationCode: request.reservationCode || options.reservationCode,
      redemptionCode: request.redemptionCode || options.redemptionCode,
      reversalOfEntryCode:
        request.reversalOfEntryCode || options.reversalOfEntryCode,
      idempotencyKey: request.idempotencyKey,
      correlationId: request.correlationId,
      reasonCode: request.reasonCode,
      metadata: request.metadata,
      scale: request.scale,
      postedAt: this.schemaDate(request.now),
    });
    return Object.assign(
      { active: true, created: entry.postedAt, updated: entry.postedAt },
      entry,
    );
  },
  /**
   * Uses the configured Loyalty transaction hook when present; the direct fallback does not promise atomic multi-record writes.
   * @param {Object} request Original trusted request, including tenant, signed principal and operation payload.
   * @param {string|Function|Object} operation Owner-selected operation, transaction callback or persisted operation as described above.
   * @returns {Promise<*>} Uses the configured Loyalty transaction hook when present; the direct fallback does not promise atomic multi-record writes.
   * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
   * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
   */
  transaction: async function (request, operation) {
    let transactionService = this.service(
      "DefaultLoyaltyTransactionService",
      false,
    );
    if (transactionService && transactionService.run)
      if (transactionService.isComposed?.(request))
        return transactionService.join(request, operation);
    if (transactionService && transactionService.run)
      return transactionService.run(request, operation);
    return operation();
  },
  /**
   * Reuses existing earn evidence or credits available/earned amounts and appends the corresponding ledger entry.
   * @param {Object} request Original trusted request, including tenant, signed principal and operation payload.
   * @returns {Promise<*>} Reuses existing earn evidence or credits available/earned amounts and appends the corresponding ledger entry.
   * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
   * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
   */
  earn: async function (request) {
    request = this.operationRequest(request, ENUMS.LoyaltyLedgerEntryType.EARN.key);
    return this.transaction(request, async () => {
      let existing = await this.getOperationLedgerEntry(request, ENUMS.LoyaltyLedgerEntryType.EARN.key);
      if (existing)
        return this.existingOperationResult(ENUMS.LoyaltyLedgerEntryType.EARN.key, request, existing);
      let before = await this.getBalance(request, true);
      let after = this.changeBalance(before, request, {
        available: request.amount,
        earned: request.amount,
      });
      let ledgerEntry = this.ledgerEntry(request, after, ENUMS.LoyaltyLedgerEntryType.EARN.key);
      let savedBalance = await this.saveBalance(request, after);
      let savedLedgerEntry = await this.saveLedgerEntry(request, ledgerEntry);
      return {
        operation: ENUMS.LoyaltyLedgerEntryType.EARN.key,
        balance: savedBalance || after,
        ledgerEntry: savedLedgerEntry || ledgerEntry,
        before: before,
      };
    });
  },
  /**
   * Reuses prior reservation evidence or moves spendable value into reserved balance and records its reservation.
   * @param {Object} request Original trusted request, including tenant, signed principal and operation payload.
   * @returns {Promise<*>} Reuses prior reservation evidence or moves spendable value into reserved balance and records its reservation.
   * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
   * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
   */
  reserve: async function (request) {
    const protectedHold = this.authorizeProtectedHold(request);
    request = this.operationRequest(request, ENUMS.LoyaltyLedgerEntryType.RESERVE.key);
    request.reservationCode = this.reservationCode(request);
    return this.transaction(request, async () => {
      let existing = await this.getOperationLedgerEntry(request, ENUMS.LoyaltyLedgerEntryType.RESERVE.key);
      if (existing)
        return this.existingOperationResult(ENUMS.LoyaltyLedgerEntryType.RESERVE.key, request, existing);
      let before = await this.getBalance(request, false);
      let after = this.changeBalance(before, request, {
        available: this.negative(request.amount, request.scale),
        reserved: request.amount,
      });
      let ledgerEntry = this.ledgerEntry(request, after, ENUMS.LoyaltyLedgerEntryType.RESERVE.key, {
        reservationCode: request.reservationCode,
      });
      let now = this.schemaDate(request.now);
      const ttlSeconds = typeof CONFIG !== "undefined" && CONFIG.get("loyalty")?.reservations?.ttlSeconds;
      if (!protectedHold && (!Number.isSafeInteger(ttlSeconds) || ttlSeconds < 1))
        this.fail("ERR_LOYALTY_RESERVATION_STATUS", "Reservation duration is unavailable");
      let reservation = {
        code: request.reservationCode,
        walletCode: request.walletCode,
        programCode: request.programCode,
        rewardTypeCode: request.rewardTypeCode,
        amount: request.amount,
        status: ENUMS.LoyaltyReservationStatus.RESERVED.key,
        sourceType: request.sourceType,
        sourceCode: request.sourceCode,
        targetType: request.targetType,
        targetCode: request.targetCode,
        ...(protectedHold ? { holdPolicy: request.holdPolicy,
          ...(request.holdPolicy === ENUMS.LoyaltyProtectedHoldPolicy.AUCTION_ROUND.key ? { expiresAt: null } : {}) } : { expiresAt:
          request.expiresAt || (request.payload && request.payload.expiresAt) || new Date(now.getTime() + ttlSeconds * 1000) }),
        createdAt: now,
        ledgerEntryCodes: [ledgerEntry.code],
        idempotencyKey: request.idempotencyKey,
        correlationId: request.correlationId,
        revision: 0,
        active: true,
        created: now,
        updated: now,
      };
      let savedBalance = await this.saveBalance(request, after);
      let savedLedgerEntry = await this.saveLedgerEntry(request, ledgerEntry);
      let savedReservation = await this.saveReservation(
        request,
        reservation,
        false,
      );
      return {
        operation: ENUMS.LoyaltyLedgerEntryType.RESERVE.key,
        balance: savedBalance || after,
        ledgerEntry: savedLedgerEntry || ledgerEntry,
        reservation: savedReservation || reservation,
        before: before,
      };
    });
  },
  /**
   * Adjusts only the delta of an owner-admitted original auction hold inside the caller's atomic composition.
   * @param {Object} request Original trusted request, including tenant, signed principal and operation payload.
   * @returns {Promise<*>} Adjusts only the delta of an owner-admitted original auction hold inside the caller's atomic composition.
   * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
   * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
   */
  adjustAuction: async function (request) {
    const reservation = await this.getReservation(request);
    this.authorizeProtectedHold(request, reservation);
    if (reservation.holdPolicy !== ENUMS.LoyaltyProtectedHoldPolicy.AUCTION_ROUND.key || request.auctionOperation !== "adjust" ||
        !SERVICE.DefaultLoyaltyTransactionService.isComposed(request) || reservation.status !== ENUMS.LoyaltyReservationStatus.RESERVED.key)
      this.fail("ERR_LOYALTY_AUCTION_FORBIDDEN", "Atomic auction adjustment requires an active original hold");
    request = this.operationRequest(request, ENUMS.LoyaltyLedgerEntryType.RESERVE.key);
    const delta = this.amount().toMinor(request.amount, request.scale) - this.amount().toMinor(reservation.amount, request.scale);
    if (delta === 0n) return { reservation };
    const posting = { ...request, amount: this.amount().fromMinor(delta < 0n ? -delta : delta, request.scale) };
    const before = await this.getBalance(request, false);
    const after = this.changeBalance(before, request, {
      available: this.amount().fromMinor(-delta, request.scale), reserved: this.amount().fromMinor(delta, request.scale),
    });
    const ledgerEntry = this.ledgerEntry(posting, after, delta > 0n ? ENUMS.LoyaltyLedgerEntryType.RESERVE.key : ENUMS.LoyaltyLedgerEntryType.RELEASE.key, {
      reservationCode: reservation.code,
    });
    const next = { ...reservation, amount: request.amount, revision: reservation.revision + 1,
      updated: new Date(), ledgerEntryCodes: [...reservation.ledgerEntryCodes, ledgerEntry.code] };
    await this.saveBalance(request, after);
    await this.saveLedgerEntry(request, ledgerEntry);
    await this.saveModel(this.service("DefaultRewardReservationService"), request, next,
      { code: reservation.code, revision: reservation.revision });
    return { reservation: next, ledgerEntry, balance: after, before };
  },
  /**
   * Requires a RESERVED hold, consumes its exact amount and records spent balance, redemption and capture evidence.
   * @param {Object} request Original trusted request, including tenant, signed principal and operation payload.
   * @returns {Promise<*>} Requires a RESERVED hold, consumes its exact amount and records spent balance, redemption and capture evidence.
   * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
   * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
   */
  capture: async function (request) {
    let incoming = request || {};
    let reservation = await this.getReservation(incoming);
    this.authorizeProtectedHold(incoming, reservation);
    request = this.operationRequest(
      Object.assign({}, reservation, incoming, {
        amount: reservation.amount,
        walletCode: reservation.walletCode,
        programCode: reservation.programCode,
        rewardTypeCode: reservation.rewardTypeCode,
        reservationCode: reservation.code,
        targetType:
          incoming.targetType ||
          (incoming.payload && incoming.payload.targetType) ||
          reservation.targetType,
        targetCode:
          incoming.targetCode ||
          (incoming.payload && incoming.payload.targetCode) ||
          reservation.targetCode,
      }),
      ENUMS.LoyaltyLedgerEntryType.CAPTURE.key,
    );
    request.reservationCode = reservation.code;
    request.redemptionCode = this.redemptionCode(request);
    let existing = await this.getOperationLedgerEntry(request, ENUMS.LoyaltyLedgerEntryType.CAPTURE.key);
    if (existing)
      return this.existingOperationResult(ENUMS.LoyaltyLedgerEntryType.CAPTURE.key, request, existing);
    if (reservation.status !== ENUMS.LoyaltyReservationStatus.RESERVED.key)
      this.fail(
        "ERR_LOYALTY_RESERVATION_STATUS",
        "only RESERVED reward reservations can be captured",
      );
    return this.transaction(request, async () => {
      let before = await this.getBalance(request, false);
      let after = this.changeBalance(before, request, {
        reserved: this.negative(request.amount, request.scale),
        spent: request.amount,
      });
      let ledgerEntry = this.ledgerEntry(request, after, ENUMS.LoyaltyLedgerEntryType.CAPTURE.key, {
        reservationCode: reservation.code,
        redemptionCode: request.redemptionCode,
      });
      let now = this.schemaDate(request.now);
      let redemption = {
        code: request.redemptionCode,
        walletCode: request.walletCode,
        programCode: request.programCode,
        rewardTypeCode: request.rewardTypeCode,
        amount: request.amount,
        status: ENUMS.LoyaltyRedemptionStatus.CAPTURED.key,
        targetType: request.targetType || "EXTERNAL",
        targetCode: request.targetCode || request.idempotencyKey,
        reservationCode: reservation.code,
        captureLedgerEntryCode: ledgerEntry.code,
        providerReference:
          request.providerReference ||
          (request.payload && request.payload.providerReference),
        idempotencyKey: request.idempotencyKey,
        correlationId: request.correlationId,
        redeemedAt: now,
        revision: 0,
        active: true,
        created: now,
        updated: now,
      };
      let updatedReservation = Object.assign({}, reservation, {
        status: ENUMS.LoyaltyReservationStatus.CAPTURED.key,
        capturedAt: now,
        ledgerEntryCodes: (reservation.ledgerEntryCodes || []).concat(
          ledgerEntry.code,
        ),
        revision: Number(reservation.revision || 0) + 1,
        updated: now,
      });
      let savedBalance = await this.saveBalance(request, after);
      let savedLedgerEntry = await this.saveLedgerEntry(request, ledgerEntry);
      let savedRedemption = await this.saveRedemption(request, redemption);
      let savedReservation = await this.saveReservation(
        request,
        updatedReservation,
        true,
      );
      return {
        operation: ENUMS.LoyaltyLedgerEntryType.CAPTURE.key,
        balance: savedBalance || after,
        ledgerEntry: savedLedgerEntry || ledgerEntry,
        redemption: savedRedemption || redemption,
        reservation: savedReservation || updatedReservation,
        before: before,
      };
    });
  },
  /**
   * Requires a RESERVED hold, returns its amount to available balance and records release evidence.
   * @param {Object} request Original trusted request, including tenant, signed principal and operation payload.
   * @returns {Promise<*>} Requires a RESERVED hold, returns its amount to available balance and records release evidence.
   * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
   * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
   */
  release: async function (request) {
    let incoming = request || {};
    let reservation = await this.getReservation(incoming);
    this.authorizeProtectedHold(incoming, reservation);
    request = this.operationRequest(
      Object.assign({}, reservation, incoming, {
        amount: reservation.amount,
        walletCode: reservation.walletCode,
        programCode: reservation.programCode,
        rewardTypeCode: reservation.rewardTypeCode,
        reservationCode: reservation.code,
        targetType:
          incoming.targetType ||
          (incoming.payload && incoming.payload.targetType) ||
          reservation.targetType,
        targetCode:
          incoming.targetCode ||
          (incoming.payload && incoming.payload.targetCode) ||
          reservation.targetCode,
      }),
      ENUMS.LoyaltyLedgerEntryType.RELEASE.key,
    );
    request.reservationCode = reservation.code;
    let existing = await this.getOperationLedgerEntry(request, ENUMS.LoyaltyLedgerEntryType.RELEASE.key);
    if (existing)
      return this.existingOperationResult(ENUMS.LoyaltyLedgerEntryType.RELEASE.key, request, existing);
    if (reservation.status !== ENUMS.LoyaltyReservationStatus.RESERVED.key)
      this.fail(
        "ERR_LOYALTY_RESERVATION_STATUS",
        "only RESERVED reward reservations can be released",
      );
    return this.transaction(request, async () => {
      let before = await this.getBalance(request, false);
      let after = this.changeBalance(before, request, {
        available: request.amount,
        reserved: this.negative(request.amount, request.scale),
      });
      let ledgerEntry = this.ledgerEntry(request, after, ENUMS.LoyaltyLedgerEntryType.RELEASE.key, {
        reservationCode: reservation.code,
      });
      let now = this.schemaDate(request.now);
      let updatedReservation = Object.assign({}, reservation, {
        status: ENUMS.LoyaltyReservationStatus.RELEASED.key,
        releasedAt: now,
        ledgerEntryCodes: (reservation.ledgerEntryCodes || []).concat(
          ledgerEntry.code,
        ),
        revision: Number(reservation.revision || 0) + 1,
        updated: now,
      });
      let savedBalance = await this.saveBalance(request, after);
      let savedLedgerEntry = await this.saveLedgerEntry(request, ledgerEntry);
      let savedReservation = await this.saveReservation(
        request,
        updatedReservation,
        true,
      );
      return {
        operation: ENUMS.LoyaltyLedgerEntryType.RELEASE.key,
        balance: savedBalance || after,
        ledgerEntry: savedLedgerEntry || ledgerEntry,
        reservation: savedReservation || updatedReservation,
        before: before,
      };
    });
  },
  /**
   * Builds compensating balance deltas for supported original movement types without editing historical entries.
   * @param {Object} entry Original immutable ledger entry.
   * @param {Object} request Original trusted request, including tenant, signed principal and operation payload.
   * @returns {*} Builds compensating balance deltas for supported original movement types without editing historical entries.
   * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
   * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
   */
  reverseDeltas: function (entry, request) {
    let amount = this.amount().assertPositive(entry.amount, request.scale);
    if (entry.entryType === ENUMS.LoyaltyLedgerEntryType.EARN.key)
      return {
        available: this.negative(amount, request.scale),
        reversed: amount,
      };
    if (entry.entryType === ENUMS.LoyaltyLedgerEntryType.RESERVE.key)
      return {
        available: amount,
        reserved: this.negative(amount, request.scale),
        reversed: amount,
      };
    if (entry.entryType === ENUMS.LoyaltyLedgerEntryType.CAPTURE.key)
      return {
        available: amount,
        spent: this.negative(amount, request.scale),
        reversed: amount,
      };
    if (entry.entryType === ENUMS.LoyaltyLedgerEntryType.RELEASE.key)
      return {
        available: this.negative(amount, request.scale),
        reserved: amount,
        reversed: amount,
      };
    if (entry.entryType === ENUMS.LoyaltyLedgerEntryType.EXPIRE.key)
      return {
        available: amount,
        expired: this.negative(amount, request.scale),
        reversed: amount,
      };
    this.fail(
      "ERR_LOYALTY_REVERSAL_TYPE",
      "ledger entry type cannot be reversed automatically",
    );
  },
  /**
   * Reuses existing reversal evidence or applies compensating deltas and appends a ledger entry referencing the original.
   * @param {Object} request Original trusted request, including tenant, signed principal and operation payload.
   * @returns {Promise<*>} Reuses existing reversal evidence or applies compensating deltas and appends a ledger entry referencing the original.
   * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
   * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
   */
  reverse: async function (request) {
    let sourceEntry = await this.getLedgerEntry(request || {});
    if (sourceEntry.sourceType === "PARTNER_REWARD_CONVERSION")
      this.fail("ERR_LOYALTY_CONVERSION_FORBIDDEN", "Completed or uncertain partner conversions cannot be reversed");
    if (sourceEntry.sourceType === "BIDDING" && sourceEntry.targetType === ENUMS.LoyaltyProtectedHoldPolicy.AUCTION_ROUND.key)
      this.fail("ERR_LOYALTY_AUCTION_FORBIDDEN", "Auction postings require original hold reconciliation");
    request = this.operationRequest(
      Object.assign({}, request, {
        walletCode: sourceEntry.walletCode,
        programCode: sourceEntry.programCode,
        rewardTypeCode: sourceEntry.rewardTypeCode,
        amount: sourceEntry.amount,
        reversalOfEntryCode: sourceEntry.code,
        sourceType:
          (request &&
            (request.sourceType ||
              (request.payload && request.payload.sourceType))) ||
          "REVERSAL",
        sourceCode:
          (request &&
            (request.sourceCode ||
              (request.payload && request.payload.sourceCode))) ||
          sourceEntry.code,
        targetType: sourceEntry.targetType,
        targetCode: sourceEntry.targetCode,
      }),
      ENUMS.LoyaltyLedgerEntryType.REVERSE.key,
    );
    return this.transaction(request, async () => {
      let existing = await this.getOne(
        this.service("DefaultRewardLedgerEntryService"),
        this.serviceRequest(request, {
          query: {
            reversalOfEntryCode: sourceEntry.code,
            entryType: ENUMS.LoyaltyLedgerEntryType.REVERSE.key,
          },
          pageSize: 1,
        }),
      );
      if (existing)
        return this.existingOperationResult(ENUMS.LoyaltyLedgerEntryType.REVERSE.key, request, existing);
      existing = await this.getOperationLedgerEntry(request, ENUMS.LoyaltyLedgerEntryType.REVERSE.key);
      if (existing) {
        if (existing.reversalOfEntryCode !== sourceEntry.code)
          this.fail(
            "ERR_LOYALTY_REVERSAL_CONFLICT",
            "This reversal command belongs to a different ledger entry",
          );
        return this.existingOperationResult(ENUMS.LoyaltyLedgerEntryType.REVERSE.key, request, existing);
      }
      let before = await this.getBalance(request, false);
      const pendingKey = crypto
        .createHash("sha256")
        .update(sourceEntry.code)
        .digest("hex");
      let ledgerEntry = before.metadata?.pendingReversalPostings?.[pendingKey];
      let after = before;
      if (!ledgerEntry) {
        after = this.changeBalance(
          before,
          request,
          this.reverseDeltas(sourceEntry, request),
        );
        ledgerEntry = this.ledgerEntry(request, after, ENUMS.LoyaltyLedgerEntryType.REVERSE.key, {
          reversalOfEntryCode: sourceEntry.code,
        });
        after.metadata = {
          ...before.metadata,
          pendingReversalPostings: {
            ...before.metadata?.pendingReversalPostings,
            [pendingKey]: ledgerEntry,
          },
        };
        await this.saveBalance(request, after);
        // The balance and pending posting are one optimistic owner write. A crash cannot apply the delta twice.
        const saved = await this.getBalance(request, false);
        if (
          saved.metadata?.pendingReversalPostings?.[pendingKey]?.code !==
          ledgerEntry.code
        )
          this.fail(
            "ERR_LOYALTY_REVERSAL_CONFLICT",
            "Reversal balance changed; retry the original command",
          );
      }
      let savedLedgerEntry;
      try {
        savedLedgerEntry = await this.saveLedgerEntry(request, {
          ...ledgerEntry,
          postedAt: new Date(ledgerEntry.postedAt),
        });
      } catch (error) {
        savedLedgerEntry = await this.getOne(
          this.service("DefaultRewardLedgerEntryService"),
          this.serviceRequest(request, {
            query: { code: ledgerEntry.code },
            pageSize: 1,
          }),
        );
        if (!savedLedgerEntry) throw error;
      }
      return {
        operation: ENUMS.LoyaltyLedgerEntryType.REVERSE.key,
        balance: await this.getBalance(request, false),
        ledgerEntry: savedLedgerEntry || ledgerEntry,
        reversedEntry: sourceEntry,
        before: before,
      };
    });
  },
};
