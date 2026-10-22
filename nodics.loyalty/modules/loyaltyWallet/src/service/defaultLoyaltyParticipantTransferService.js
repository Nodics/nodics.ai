/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";
const crypto = require("node:crypto");
const { isDeepStrictEqual } = require("node:util");

/** @module loyaltyWallet/service/defaultLoyaltyParticipantTransferService @description Owner-authorized atomic reward transfers with shared daily limits and original-command recovery. @layer service @owner loyaltyWallet @override Preserve Profile authority, qualified transactions and exact immutable intent. */
module.exports = {
  /**
   * Resolves the effective Loyalty amount owner for every operation.
   * @returns {Object} Loader-selected amount service; no effects or inline fallback.
   * @override Preserve exact amount and precision contracts in later-layer overrides.
   */
  amount: function () { return SERVICE.DefaultLoyaltyAmountService; },
  /**
   * Returns the owning operation service, never a parallel balance writer.
   * @returns {Object} Effective existing mutation owner; does not itself mutate records.
   * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
   */
  operations: function () { return SERVICE.DefaultLoyaltyRewardOperationService; },
  /**
   * Throws a stable owner refusal without exposing recipient balances.
   * @param {string} message Content-safe owner diagnostic.
   * @returns {never} Always throws a content-safe owner error; no business writes.
   * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
   * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
   */
  fail: function (message) { this.operations().fail("ERR_LOYALTY_TRANSFER", message); },
  /**
   * Derives opaque deterministic record identity from exact selectors.
   * @param {string} kind Fixed operation or evidence discriminator.
   * @param {Array} values Ordered canonical identity components.
   * @returns {string} Deterministic namespaced identity; no persistence.
   * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
   */
  code: function (kind, values) { return kind + "_" + crypto.createHash("sha256").update(JSON.stringify(values)).digest("hex"); },
  /**
   * Validates a bounded public identifier.
   * @param {*} value Value to validate, normalize or project as described above.
   * @returns {string} Validated exact transfer reference; invalid references throw before effects.
   * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
   */
  identifier: function (value) { if (typeof value !== "string" || !/^[A-Za-z0-9_.:@|-]{1,200}$/.test(value)) this.fail("Invalid transfer reference"); return value; },
  /**
   * Reads one exact generated owner record, refusing failed or ambiguous evidence.
   * @param {string} name Owner-selected service or header name.
   * @param {Object} request Original trusted request, including tenant, signed principal and operation payload.
   * @param {Object} query Owner-built exact persistence selector, never a client query.
   * @returns {Promise<*>} Reads one exact generated owner record, refusing failed or ambiguous evidence.
   * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
   * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
   */
  read: async function (name, request, query) {
    const service = SERVICE[name];
    if (typeof service?.get !== "function") this.fail("Transfer persistence is unavailable");
    const result = await service.get({ ...this.operations().serviceRequest(request, { query }),
      searchOptions: { pageSize: 2, pageNumber: 1 }, options: { skipItemCache: true, recursive: false } });
    if (!/^SUC_/.test(result?.code || "") || result.error || result.success === false ||
      result.errors && (!Array.isArray(result.errors) || result.errors.length) || result.acknowledged === false ||
      !Array.isArray(result.result) || result.result.length > 1 || result.count !== result.result.length ||
      result.result.some(row => Object.entries(query).some(([key, value]) => !isDeepStrictEqual(row[key], value))))
      this.fail("Transfer evidence could not be confirmed");
    return result.result[0];
  },
  /**
   * Persists inside the active transaction and requires exact readback before completion.
   * @param {string} name Owner-selected service or header name.
   * @param {Object} request Original trusted request, including tenant, signed principal and operation payload.
   * @param {Object} model Owner-built persistence model.
   * @param {Object} previous Prior persisted revision used for conditional writes.
   * @returns {Promise<*>} Persists inside the active transaction and requires exact readback before completion.
   * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
   * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
   */
  write: async function (name, request, model, previous) {
    const service = SERVICE[name], op = this.operations();
    const query = previous ? { code: previous.code, revision: previous.revision } : undefined;
    const timestamp = new Date();
    const persisted = previous
      ? model
      : { active: true, created: timestamp, updated: timestamp, ...model };
    const command = op.serviceRequest(request, { model: persisted, query });
    const result = await (previous ? service.update(command) : service.save(command));
    if (!/^SUC_/.test(result?.code || "") || result.error || result.success === false || result.acknowledged === false)
      this.fail("Transfer persistence was not acknowledged");
    const saved = await this.read(name, request, { code: model.code });
    if (!saved || Object.entries(persisted).some(([key, value]) => key !== "completedAt" && !isDeepStrictEqual(saved[key], value)))
      this.fail("Transfer persistence could not be confirmed");
    return saved;
  },
  /**
   * Resolves complete framework defaults plus governed owner selections; input cannot supply policy.
   * @param {Object} request Original trusted request, including tenant, signed principal and operation payload.
   * @param {Object} owner Canonical beneficiary identity, distinct from the actor or runtime enterprise.
   * @param {string} programCode Canonical program identity.
   * @param {string} rewardTypeCode Canonical reward-unit identity.
   * @param {number} scale Validated decimal precision from the canonical reward unit or issued lot.
   * @returns {Promise<*>} Resolves complete framework defaults plus governed owner selections; input cannot supply policy.
   * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
   * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
   */
  policy: async function (request, owner, programCode, rewardTypeCode, scale) {
    const defaults = CONFIG.get("loyalty")?.transfers;
    const record = await this.read("DefaultRewardTransferPolicyService", request,
      { ownerType: owner.ownerType, ownerCode: owner.ownerCode, programCode, rewardTypeCode });
    const allowed = ["outgoingEnabled", "incomingEnabled", "maximumAmount", "maximumDailyAmount", "maximumDailyCount"];
    if (!defaults || record && (record.active === false || !record.selections || Object.keys(record.selections).some(key => !allowed.includes(key))))
      this.fail("Transfer policy is unavailable");
    const effective = this.validatePolicy({ ...defaults, ...(record?.selections || {}) }, scale);
    for (const key of ["maximumAmount", "maximumDailyAmount", "maximumDailyCount"])
      if (defaults[key] !== null && (effective[key] === null || (key === "maximumDailyCount" ? effective[key] > defaults[key] : this.amount().compare(effective[key], defaults[key], scale) > 0)))
        effective[key] = defaults[key];
    return effective;
  },
  /**
   * Validates effective policy for reads and governed changes through one contract.
   * @param {Object} policy Effective owner configuration or retained governed policy.
   * @param {number} scale Validated decimal precision from the canonical reward unit or issued lot.
   * @returns {Object} Validated governed transfer policy; no persistence changes.
   * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
   * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
   */
  validatePolicy: function (policy, scale) {
    for (const key of ["enabled", "incomingEnabled", "outgoingEnabled"])
      if (typeof policy[key] !== "boolean") this.fail("Invalid transfer policy");
    for (const key of ["maximumAmount", "maximumDailyAmount"])
      if (policy[key] !== null) {
        if (typeof policy[key] !== "string") this.fail("Transfer amount limits require exact decimal strings");
        this.amount().assertPositive(policy[key], scale);
      }
    if (policy.maximumDailyCount !== null && (!Number.isSafeInteger(policy.maximumDailyCount) || policy.maximumDailyCount < 1)) this.fail("Invalid transfer count limit");
    if (typeof policy.feeAmount !== "string" || this.amount().compare(policy.feeAmount, "0", scale) < 0) this.fail("Invalid transfer fee");
    if (typeof policy.timeZone !== "string" || !policy.timeZone.trim()) this.fail("Invalid transfer timezone");
    try { new Intl.DateTimeFormat("en-CA", { timeZone: policy.timeZone }).format(new Date()); }
    catch { this.fail("Invalid transfer timezone"); }
    return policy;
  },
  /**
   * Reads the represented owner's selections and framework limits, never another owner's configuration.
   * @param {Object} request Original trusted request, including tenant, signed principal and operation payload.
   * @returns {Promise<*>} Reads the represented owner's selections and framework limits, never another owner's configuration.
   * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
   * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
   */
  settings: async function (request) {
    const owner = await SERVICE.DefaultLoyaltyParticipantService.resolve(request, "loyalty.transfers.manage");
    const input = request.payload || request.body || {};
    const query = { ownerType: owner.ownerType, ownerCode: owner.ownerCode,
      programCode: this.identifier(input.programCode), rewardTypeCode: this.identifier(input.rewardTypeCode) };
    const type = await this.read("DefaultLoyaltyRewardTypeService", request, { code: query.rewardTypeCode });
    if (!type || type.status !== ENUMS.LoyaltyRewardTypeStatus.ACTIVE.key) this.fail("Reward type is unavailable");
    const scale = SERVICE.DefaultLoyaltyRewardTransferService.scale(type.precision);
    const record = await this.read("DefaultRewardTransferPolicyService", request, query);
    const effective = await this.policy(request, owner, query.programCode, query.rewardTypeCode, scale);
    return { ...query, revision: record?.revision ?? null, selections: record?.selections || {}, effective };
  },
  /**
   * Stores only governed selections under original owner authority and an exact expected revision.
   * @param {Object} request Original trusted request, including tenant, signed principal and operation payload.
   * @returns {Promise<*>} Stores only governed selections under original owner authority and an exact expected revision.
   * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
   * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
   */
  updateSettings: async function (request) {
    const owner = await SERVICE.DefaultLoyaltyParticipantService.resolve(request, "loyalty.transfers.manage");
    const input = structuredClone(request.payload || request.body || {}), allowed = ["outgoingEnabled", "incomingEnabled", "maximumAmount", "maximumDailyAmount", "maximumDailyCount"];
    if (!input.selections || Object.getPrototypeOf(input.selections) !== Object.prototype ||
      Object.keys(input.selections).some(key => !allowed.includes(key)) ||
      input.expectedRevision !== null && (!Number.isSafeInteger(input.expectedRevision) || input.expectedRevision < 0)) this.fail("Invalid transfer selection");
    const query = { ownerType: owner.ownerType, ownerCode: owner.ownerCode,
      programCode: this.identifier(input.programCode), rewardTypeCode: this.identifier(input.rewardTypeCode) };
    const type = await this.read("DefaultLoyaltyRewardTypeService", request, { code: query.rewardTypeCode });
    if (!type || type.status !== ENUMS.LoyaltyRewardTypeStatus.ACTIVE.key) this.fail("Reward type is unavailable");
    const scale = SERVICE.DefaultLoyaltyRewardTransferService.scale(type.precision), defaults = CONFIG.get("loyalty")?.transfers;
    const policy = this.validatePolicy({ ...defaults, ...input.selections }, scale);
    // Enterprise selections may narrow an administrator's framework ceiling, not silently lift it.
    for (const key of ["maximumAmount", "maximumDailyAmount", "maximumDailyCount"]) {
      if (defaults[key] !== null && (policy[key] === null || (key === "maximumDailyCount" ? policy[key] > defaults[key] : this.amount().compare(policy[key], defaults[key], scale) > 0)))
        this.fail("Transfer selection exceeds framework limit");
    }
    const work = { ...request, payload: undefined, body: undefined };
    return SERVICE.DefaultLoyaltyTransactionService.compose(work, async () => {
      const previous = await this.read("DefaultRewardTransferPolicyService", work, query);
      if ((previous?.revision ?? null) !== input.expectedRevision) this.fail("Transfer selections changed; reload before saving");
      const row = { ...query, code: this.code("TRANSFER_POLICY", Object.values(query)), selections: input.selections,
        revision: (previous?.revision ?? -1) + 1, updatedBy: owner.actorCode, updatedAt: new Date() };
      await this.write("DefaultRewardTransferPolicyService", work, row, previous);
      return { ...query, revision: row.revision, selections: row.selections, effective: policy };
    });
  },
  /**
   * Builds an owner-wide calendar-day counter key without accepting a client timestamp.
   * @param {Date} now Owner clock timestamp, not caller authority.
   * @param {string} timeZone Configured accounting timezone.
   * @returns {*} Builds an owner-wide calendar-day counter key without accepting a client timestamp.
   * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
   * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
   */
  period: function (now, timeZone) {
    const parts = new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(now);
    return ["year", "month", "day"].map(key => parts.find(p => p.type === key).value).join("-") + "@" + timeZone;
  },
  /**
   * Derives immutable intent from authenticated owner and explicitly confirmed public inputs.
   * @param {Object} request Original trusted request, including tenant, signed principal and operation payload.
   * @param {Object} owner Canonical beneficiary identity, distinct from the actor or runtime enterprise.
   * @returns {Promise<*>} Derives immutable intent from authenticated owner and explicitly confirmed public inputs.
   * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
   * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
   */
  intent: async function (request, owner) {
    const p = request.payload || request.body || {};
    if (p.confirmed !== true) this.fail("Transfer confirmation is required");
    if (typeof p.amount !== "string" || p.confirmedFeeAmount !== undefined && typeof p.confirmedFeeAmount !== "string")
      this.fail("Transfer amount and fee require exact decimal strings");
    const rewardTypeCode = this.identifier(p.rewardTypeCode);
    const type = await this.read("DefaultLoyaltyRewardTypeService", request, { code: rewardTypeCode });
    if (!type || type.status !== ENUMS.LoyaltyRewardTypeStatus.ACTIVE.key || type.active === false) this.fail("Reward type is unavailable");
    const scale = SERVICE.DefaultLoyaltyRewardTransferService.scale(type.precision);
    if (p.scale !== undefined && p.scale !== scale) this.fail("Reward precision does not match its owner");
    if (!["CUSTOMER", "ENTERPRISE"].includes(p.recipient?.ownerType)) this.fail("A selected recipient is required");
    return { ownerType: owner.ownerType, ownerCode: owner.ownerCode,
      recipient: { ownerType: p.recipient.ownerType, ownerCode: this.identifier(p.recipient.ownerCode) }, programCode: this.identifier(p.programCode),
      rewardTypeCode, idempotencyKey: this.identifier(p.idempotencyKey),
      amount: this.amount().assertPositive(p.amount, scale), scale };
  },
  /**
   * Reads an original result under the current authorized source owner; never dispatches a repeat payment.
   * @param {Object} request Original trusted request, including tenant, signed principal and operation payload.
   * @returns {Promise<*>} Reads an original result under the current authorized source owner; never dispatches a repeat payment.
   * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
   * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
   */
  status: async function (request) {
    const owner = await SERVICE.DefaultLoyaltyParticipantService.resolve(request, "loyalty.wallet.read");
    const key = this.identifier(request.params?.operationKey || request.payload?.idempotencyKey);
    const code = this.code("TRANSFER", [owner.ownerType, owner.ownerCode, key]);
    const record = await this.read("DefaultRewardTransferOperationService", request, { code, ownerType: owner.ownerType, ownerCode: owner.ownerCode });
    if (!record) return { status: ENUMS.LoyaltyTransferStatus.UNCONFIRMED.key, operationCode: code };
    await this.notifyCommitted(request, code);
    return { ...record.result, operationCode: code };
  },
  /**
   * Runs only after accounting commits; delivery uncertainty never rejects or reverses completed value movement.
   * @param {Object} request Original trusted request, including tenant, signed principal and operation payload.
   * @param {string} operationCode Original persisted transfer operation identity.
   * @returns {Promise<void>} Post-commit notification attempt; failures are suppressed and never reverse settlement.
   * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
   */
  notifyCommitted: async function (request, operationCode) {
    try {
      const notification = SERVICE.DefaultLoyaltyTransferNotificationService;
      if (notification?.notify) await notification.notify(request, operationCode);
    } catch (_) { /* Communication recovery is independent of the immutable settlement result. */ }
  },
  /**
   * Executes debit, recipient credit and owner-wide usage in one qualified transaction; no service-identity spoofing.
   * @param {Object} request Original trusted request, including tenant, signed principal and operation payload.
   * @returns {Promise<*>} Executes debit, recipient credit and owner-wide usage in one qualified transaction; no service-identity spoofing.
   * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
   * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
   */
  transfer: async function (request) {
    const original = { authData: structuredClone(request.authData), tenant: request.tenant,
      authorization: request.authorization, payload: structuredClone(request.payload || request.body || {}) };
    const bound = () => {
      if (!isDeepStrictEqual(request.authData, original.authData) || request.tenant !== original.tenant ||
        request.authorization !== original.authorization || !isDeepStrictEqual(request.payload || request.body || {}, original.payload))
        this.fail("Transfer context changed");
    };
    const owner = await SERVICE.DefaultLoyaltyParticipantService.resolve(request, "loyalty.rewards.transfer");
    bound();
    const intent = await this.intent(request, owner), code = this.code("TRANSFER", [owner.ownerType, owner.ownerCode, intent.idempotencyKey]);
    const transaction = SERVICE.DefaultLoyaltyTransactionService;
    if (typeof transaction?.compose !== "function") this.fail("Atomic transfer storage is unavailable");
    const work = { ...request, payload: undefined, body: undefined };
    const completed = await transaction.compose(work, async () => {
      const prior = await this.read("DefaultRewardTransferOperationService", work, { code });
      if (prior) {
        if (!isDeepStrictEqual(prior.intent, intent)) this.fail("Transfer reference belongs to different details");
        bound();
        return { ...prior.result, operationCode: code };
      }
      await SERVICE.DefaultLoyaltyParticipantService.recipient(request, intent.recipient);
      const from = await this.read("DefaultLoyaltyWalletService", work, { ownerType: owner.ownerType, ownerCode: owner.ownerCode });
      const to = await this.read("DefaultLoyaltyWalletService", work, intent.recipient);
      if (!from || !to || [from, to].some(wallet => wallet.status !== ENUMS.LoyaltyWalletStatus.OPEN.key || wallet.active === false) ||
        !["CUSTOMER", "ENTERPRISE"].includes(to.ownerType) || typeof to.ownerCode !== "string" || !to.ownerCode ||
        from.ownerType === to.ownerType && from.ownerCode === to.ownerCode) this.fail("Eligible distinct wallet owners are required");
      const program = await this.read("DefaultLoyaltyProgramService", request, { code: intent.programCode });
      const now = new Date();
      if (!program || program.status !== ENUMS.LoyaltyProgramStatus.ACTIVE.key || program.active === false || program.transferEnabled !== true ||
        !(Array.isArray(program.transferRewardTypeCodes) ? program.transferRewardTypeCodes : [program.defaultRewardTypeCode]).includes(intent.rewardTypeCode) ||
        program.startsAt && !(new Date(program.startsAt) <= now) || program.endsAt && !(new Date(program.endsAt) > now))
        this.fail("Issuer program does not permit transfers");
      const senderPolicy = await this.policy(work, owner, intent.programCode, intent.rewardTypeCode, intent.scale);
      const recipientPolicy = await this.policy(work, to, intent.programCode, intent.rewardTypeCode, intent.scale);
      if (!senderPolicy.enabled || !senderPolicy.outgoingEnabled || !recipientPolicy.incomingEnabled) this.fail("Reward transfers are disabled");
      if (senderPolicy.maximumAmount !== null && this.amount().compare(intent.amount, senderPolicy.maximumAmount, intent.scale) > 0)
        this.fail("Per-transfer limit exceeded");
      const period = this.period(now, senderPolicy.timeZone);
      const usageCode = this.code("TRANSFER_USAGE", [owner.ownerType, owner.ownerCode, intent.programCode, intent.rewardTypeCode, period]);
      const old = await this.read("DefaultRewardTransferUsageService", work, { code: usageCode });
      const total = this.amount().add(old?.amount || "0", intent.amount, intent.scale), count = (old?.count || 0) + 1;
      if (!Number.isSafeInteger(count) || senderPolicy.maximumDailyCount !== null && count > senderPolicy.maximumDailyCount ||
        senderPolicy.maximumDailyAmount !== null && this.amount().compare(total, senderPolicy.maximumDailyAmount, intent.scale) > 0)
        this.fail("Daily transfer limit exceeded");
      const fee = this.amount().normalize(senderPolicy.feeAmount, intent.scale);
      const input = request.payload || request.body || {};
      if (this.amount().compare(fee, "0", intent.scale) > 0 &&
        (input.confirmedFeeAmount === undefined || this.amount().compare(input.confirmedFeeAmount, fee, intent.scale) !== 0))
        this.fail("The current transfer fee requires explicit confirmation");
      const result = await SERVICE.DefaultLoyaltyRewardTransferService.settle({ ...work,
        fromWalletCode: from.code, toWalletCode: to.code, programCode: intent.programCode,
        rewardTypeCode: intent.rewardTypeCode, amount: intent.amount, scale: intent.scale,
        sourceCode: code, idempotencyKey: code, correlationId: request.correlationId || code }, fee);
      await this.write("DefaultRewardTransferUsageService", work, { code: usageCode, ownerType: owner.ownerType, ownerCode: owner.ownerCode,
        programCode: intent.programCode, rewardTypeCode: intent.rewardTypeCode, period, amount: total, count, revision: (old?.revision ?? -1) + 1 }, old);
      await this.write("DefaultRewardTransferOperationService", work, { code, ownerType: owner.ownerType, ownerCode: owner.ownerCode,
        intent, result, actorCode: owner.actorCode, completedAt: now, revision: 0 });
      bound();
      const current = await SERVICE.DefaultLoyaltyParticipantService.resolve(request, "loyalty.rewards.transfer");
      bound();
      if (!isDeepStrictEqual(current, owner)) this.fail("Transfer owner changed");
      return { ...result, operationCode: code };
    });
    await this.notifyCommitted(request, code);
    return completed;
  },
};
