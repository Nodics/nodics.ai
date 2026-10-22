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
const counters = ["available", "reserved", "earned", "spent", "expired", "reversed"];

/**
 * @module loyaltyWallet/service/defaultLoyaltyEnterpriseTestCreditService
 * @description Posts explicitly confirmed Super Admin test allocations to existing
 * marked Enterprise wallets using canonical earning and atomic command receipts.
 * @layer service
 * @owner loyaltyWallet
 * @override Exported members may narrow admission. Preserve fresh Profile proof,
 * selected test environment, immutable intent and original signed credentials.
 */
module.exports = {
  /**
   * Resolves the effective Loyalty amount owner for every operation.
   * @returns {Object} Loader-selected amount service; no effects or inline fallback.
   * @override Preserve exact amount and precision contracts in later-layer overrides.
   */
  amount: function () { return SERVICE.DefaultLoyaltyAmountService; },
  /**
   * Refuses without exposing records, provider exceptions or authority internals.
   * @param {string} [suffix] Stable error or source-key suffix.
   * @returns {never} Always throws a content-safe owner error; no business writes.
   * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
   * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
   */
  fail: function (suffix = "UNAVAILABLE") {
    const code = "ERR_LOYALTY_TEST_CREDIT_" + suffix;
    const error = typeof CLASSES !== "undefined" && CLASSES.NodicsError
      ? new CLASSES.NodicsError(code) : new Error(code);
    error.code = code;
    throw error;
  },

  /**
   * Requires an existing loader service; unavailable integration never implies approval.
   * @param {string} name Owner-selected service or header name.
   * @returns {Object} Registered effective service; missing required dependencies refuse.
   * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
   * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
   */
  service: function (name) {
    const owner = typeof SERVICE !== "undefined" && SERVICE[name];
    if (!owner) this.fail();
    return owner;
  },

  /**
   * Accepts bounded exact identifiers and excludes query operators.
   * @param {*} value Value to validate, normalize or project as described above.
   * @returns {boolean} Whether the value satisfies the fixed identifier grammar; no effects.
   * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
   */
  identifier: function (value) {
    return typeof value === "string" && /^[A-Za-z0-9][A-Za-z0-9._:@-]{0,191}$/.test(value);
  },

  /**
   * Reads complete framework-owned definitions and actual environment selection.
   * @returns {*} Reads complete framework-owned definitions and actual environment selection.
   * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
   * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
   */
  policy: function () {
    const policy = CONFIG.get("loyalty")?.enterpriseTestCredits;
    const environmentCode = NODICS.getSelectedEnvironmentName();
    if (policy?.enabled !== true || CONFIG.get("runtimeRole")?.code !== "LOYALTY" ||
        !this.identifier(environmentCode) || !Array.isArray(policy.allowedEnvironments) ||
        policy.allowedEnvironments.some(value => !this.identifier(value)) ||
        new Set(policy.allowedEnvironments).size !== policy.allowedEnvironments.length ||
        !policy.allowedEnvironments.includes(environmentCode) ||
        !Number.isSafeInteger(policy.maximumReasonLength) || policy.maximumReasonLength < 1 ||
        typeof policy.platformAdministratorEvidencePath !== "string" ||
        !/^\/[A-Za-z0-9/_-]+$/.test(policy.platformAdministratorEvidencePath)) this.fail();
    return { policy: structuredClone(policy), environmentCode };
  },

  /**
   * Validates the complete confirmed command; runtime scope and authority never come from its body.
   * @param {Object} request Original trusted request, including tenant, signed principal and operation payload.
   * @param {Object} policy Effective owner configuration or retained governed policy.
   * @returns {*} Validates the complete confirmed command; runtime scope and authority never come from its body.
   * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
   * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
   */
  command: function (request, policy) {
    const input = request.payload;
    const fields = ["walletCode", "programCode", "rewardTypeCode", "amount", "reason", "idempotencyKey", "confirmed"];
    if (!input || Object.getPrototypeOf(input) !== Object.prototype ||
        Object.keys(input).length !== fields.length || Object.keys(input).some(key => !fields.includes(key)) ||
        ["walletCode", "programCode", "rewardTypeCode", "idempotencyKey"].some(key => !this.identifier(input[key])) ||
        typeof input.amount !== "string" || !/^\d{1,12}(\.\d{1,8})?$/.test(input.amount) ||
        typeof input.reason !== "string" || !input.reason.trim() || input.reason !== input.reason.trim() ||
        input.reason.length > policy.maximumReasonLength || /[\u0000-\u001f\u007f]/.test(input.reason) ||
        input.confirmed !== true || Object.keys(request.query || {}).length || request.transactionContext !== undefined) this.fail("INVALID");
    const { confirmed, ...intent } = input;
    return structuredClone(intent);
  },

  /**
   * Pins the original human command and checks independent owner permission before any records are read.
   * @param {Object} request Original trusted request, including tenant, signed principal and operation payload.
   * @returns {*} Pins the original human command and checks independent owner permission before any records are read.
   * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
   * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
   */
  context: function (request) {
    const selected = this.policy(), intent = this.command(request, selected.policy);
    const auth = request.authData || {}, enterpriseCode = auth.entCode;
    const router = this.service("DefaultSecuredRequestPipelineService");
    if (!this.identifier(request.tenant) || auth.tenant !== request.tenant || !this.identifier(enterpriseCode) ||
        !this.identifier(auth.loginId) || typeof request.authorization !== "string" || !request.authorization ||
        auth.principalType !== "human" || auth.tokenType !== "access" || auth.authenticationMethod !== "PASSWORD" ||
        auth.isSystem || auth.sessionContext !== undefined || auth.runtimeScope !== undefined || auth.externalIdentityLinkCode !== undefined ||
        !Number.isSafeInteger(auth.authVersion) || auth.authVersion < 1 ||
        [auth.enterpriseCode, request.entCode, request.enterpriseCode, request.httpRequest?.headers?.["x-enterprise-code"]]
          .some(value => value !== undefined && value !== enterpriseCode) ||
        [request.tenantCode, auth.tenantCode].some(value => value !== undefined && value !== request.tenant) ||
        !router.isPermissionGranted("loyalty.wallet.testCredit", router.getGrantedPermissions(request), {})) this.fail("FORBIDDEN");
    this.service("DefaultLoggerService").assertSensitiveRequest(request);
    const pin = { authData: structuredClone(auth), tenant: request.tenant, authorization: request.authorization,
      payload: structuredClone(request.payload), enterpriseCode, ...selected };
    const context = { tenant: pin.tenant, authData: structuredClone(auth), authorization: pin.authorization,
      enterpriseCode, environmentCode: selected.environmentCode, intent, policy: structuredClone(selected.policy) };
    const assertBound = () => {
      if (!isDeepStrictEqual(request.authData, pin.authData) || request.tenant !== pin.tenant ||
          request.authorization !== pin.authorization || !isDeepStrictEqual(request.payload, pin.payload) ||
          !isDeepStrictEqual(context.authData, pin.authData) || context.tenant !== pin.tenant ||
          context.authorization !== pin.authorization || context.enterpriseCode !== enterpriseCode ||
          context.environmentCode !== selected.environmentCode || !isDeepStrictEqual(context.policy, selected.policy) ||
          !isDeepStrictEqual(context.intent, this.command(request, selected.policy)) ||
          !isDeepStrictEqual(this.policy(), selected) ||
          [request.entCode, request.enterpriseCode, request.httpRequest?.headers?.["x-enterprise-code"]]
            .some(value => value !== undefined && value !== enterpriseCode) ||
          [request.tenantCode, request.authData?.tenantCode].some(value => value !== undefined && value !== pin.tenant) ||
          Object.keys(request.query || {}).length) this.fail("FORBIDDEN");
    };
    context.assertBound = assertBound;
    return context;
  },

  /**
   * Requires fresh nonce-bound Profile proof; a role name, participant scope or client flag is insufficient.
   * @param {Object} context Previously admitted owner context with immutable caller and scope.
   * @returns {Promise<*>} Requires fresh nonce-bound Profile proof; a role name, participant scope or client flag is insufficient.
   * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
   * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
   */
  platformAdministrator: async function (context) {
    context.assertBound();
    const nonce = crypto.randomUUID(), auth = structuredClone(context.authData);
    const proof = await this.service("DefaultLoyaltyParticipantService").profile(context,
      context.policy.platformAdministratorEvidencePath, context.enterpriseCode,
      { permission: "loyalty.wallet.testCredit", nonce });
    context.assertBound();
    if (!isDeepStrictEqual(auth, context.authData) || proof?.contractVersion !== 1 || proof.nonce !== nonce ||
        proof.tenant !== context.tenant || proof.enterpriseCode !== context.enterpriseCode || proof.actorCode !== auth.loginId ||
        proof.principalType !== "human" || proof.platformAdministrator !== true ||
        proof.permission !== "loyalty.wallet.testCredit" || proof.authVersion !== auth.authVersion) this.fail("FORBIDDEN");
    return { actorCode: proof.actorCode, authVersion: proof.authVersion,
      authorityTenant: proof.tenant, authorityEnterpriseCode: proof.enterpriseCode };
  },

  /**
   * Reuses sample-credit schema/index qualification, adding the atomic command-receipt participant.
   * @param {Object} context Previously admitted owner context with immutable caller and scope.
   * @returns {Promise<*>} Reuses sample-credit schema/index qualification, adding the atomic command-receipt participant.
   * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
   * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
   */
  persistence: async function (context) {
    const transaction = this.service("DefaultLoyaltyTransactionService");
    if (typeof transaction.compose !== "function") this.fail();
    await this.service("DefaultLoyaltySampleCreditContributionService").persistence(context);
    const qualified = transaction.qualify(context);
    const database = qualified.owner.resolve(qualified.scope).database;
    const model = NODICS.getModels("loyaltyWallet", context.tenant)?.[UTILS.createModelName("rewardTestCreditOperation")];
    if (!model || model.dataBase !== database || model.versioned === true || model.rawSchema?.transaction?.enabled !== true ||
        model.rawSchema.transaction.sideEffects !== "none" || model.rawSchema.cache?.enabled !== false ||
        model.rawSchema.event?.enabled !== false) this.fail();
    const evidence = await this.service("DefaultDatabaseModelHandlerService").inspectIndexes(model);
    if (evidence?.versioned !== false || !evidence.indexes?.some(index => index.unique === true && !index.sparse &&
        !index.partialFilterExpression && (!index.collation || index.collation.locale === "simple") &&
        Object.keys(index.key || {}).join(",") === "code" && index.key.code === 1)) this.fail();
    context.assertBound();
  },

  /**
   * Reads exact owner records using the established private Loyalty storage boundary.
   * @param {Object} context Previously admitted owner context with immutable caller and scope.
   * @param {string} name Owner-selected service or header name.
   * @param {Object} query Owner-built exact persistence selector, never a client query.
   * @returns {*} Reads exact owner records using the established private Loyalty storage boundary.
   * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
   * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
   */
  read: function (context, name, query) {
    return this.service("DefaultLoyaltySampleCreditContributionService").read(context, name, query);
  },

  /**
   * Requires existing, explicitly marked Enterprise wallet and balance in this exact test environment.
   * @param {Object} context Previously admitted owner context with immutable caller and scope.
   * @param {Object} intent Admitted immutable command intent.
   * @returns {Promise<*>} Requires existing, explicitly marked Enterprise wallet and balance in this exact test environment.
   * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
   * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
   */
  target: async function (context, intent) {
    const wallet = await this.read(context, "DefaultLoyaltyWalletService", { code: intent.walletCode });
    const marked = row => row?.active === true && row.metadata?.sample === true && row.metadata.testOnly === true &&
      row.metadata.testEnvironment === context.environmentCode;
    if (!marked(wallet) || wallet.status !== ENUMS.LoyaltyWalletStatus.OPEN.key || wallet.ownerType !== "ENTERPRISE" || !this.identifier(wallet.ownerCode)) this.fail("INELIGIBLE");
    const participant = await this.service("DefaultLoyaltyParticipantService").recipient(context,
      { ownerType: "ENTERPRISE", ownerCode: wallet.ownerCode });
    if (participant?.ownerType !== "ENTERPRISE" || participant.ownerCode !== wallet.ownerCode) this.fail("INELIGIBLE");
    const balance = await this.read(context, "DefaultLoyaltyWalletRewardBalanceService", {
      walletCode: wallet.code, programCode: intent.programCode, rewardTypeCode: intent.rewardTypeCode });
    if (!marked(balance) || !this.identifier(balance.code) || !Number.isSafeInteger(balance.revision) || balance.revision < 0) this.fail("INELIGIBLE");
    context.assertBound();
    return { wallet, balance };
  },

  /**
   * Uses existing POINT precision and earning policy plus an explicit governed issuer selection.
   * @param {Object} context Previously admitted owner context with immutable caller and scope.
   * @param {Object} intent Admitted immutable command intent.
   * @returns {Promise<number>} Canonical reward-unit precision after owner policy admission; no posting.
   * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
   * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
   */
  scale: async function (context, intent) {
    const scale = await this.service("DefaultLoyaltySampleCreditContributionService").scale(context, intent);
    const program = await this.read(context, "DefaultLoyaltyProgramService", { code: intent.programCode });
    const now = new Date();
    if (!Array.isArray(program.testCreditRewardTypeCodes) || !program.testCreditRewardTypeCodes.includes(intent.rewardTypeCode) ||
        program.startsAt !== undefined && !(new Date(program.startsAt) <= now) ||
        program.endsAt !== undefined && !(new Date(program.endsAt) > now)) this.fail("INELIGIBLE");
    return scale;
  },

  /**
   * Builds ledger intent from canonical owner and retained proof, never from browser authority or balance fields.
   * @param {Object} context Previously admitted owner context with immutable caller and scope.
   * @param {Object} record Persisted owner record or its detached projection.
   * @returns {*} Builds ledger intent from canonical owner and retained proof, never from browser authority or balance fields.
   * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
   * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
   */
  posting: function (context, record) {
    return { tenant: context.tenant, authData: context.authData, authorization: context.authorization,
      transactionContext: context.transactionContext, walletCode: record.intent.walletCode,
      programCode: record.intent.programCode, rewardTypeCode: record.intent.rewardTypeCode,
      amount: record.intent.amount, scale: record.scale, idempotencyKey: record.code, correlationId: record.code,
      sourceType: "ENTERPRISE_TEST_CREDIT", sourceCode: record.code, targetType: "ENTERPRISE", targetCode: record.ownerCode,
      metadata: { operatorCode: record.actor.actorCode, testCredit: {
        contractVersion: 1, testOnly: true, environmentCode: record.environmentCode, ownerCode: record.ownerCode,
        intent: record.intent, actor: record.actor } } };
  },

  /**
   * Verifies durable earning evidence against the exact original command and original actor audit.
   * @param {Object} context Previously admitted owner context with immutable caller and scope.
   * @param {Object} record Persisted owner record or its detached projection.
   * @returns {Promise<*>} Verifies durable earning evidence against the exact original command and original actor audit.
   * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
   * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
   */
  ledger: async function (context, record) {
    const posting = this.posting(context, record), operations = this.service("DefaultLoyaltyRewardOperationService");
    const entry = await this.read(context, "DefaultRewardLedgerEntryService", { code: operations.ledgerCode(posting, ENUMS.LoyaltyLedgerEntryType.EARN.key) });
    if (!entry || entry.entryType !== ENUMS.LoyaltyLedgerEntryType.EARN.key ||
        ["walletCode", "programCode", "rewardTypeCode", "amount", "sourceType", "sourceCode", "targetType", "targetCode", "idempotencyKey", "correlationId"]
          .some(key => entry[key] !== posting[key]) || !isDeepStrictEqual(entry.metadata, posting.metadata)) this.fail("CONFLICT");
    return entry;
  },

  /**
   * Returns minimal test allocation evidence; retries report the original posting, never current spendable balance.
   * @param {Object} record Persisted owner record or its detached projection.
   * @param {string} status Canonical lifecycle state to verify or project.
   * @returns {Object} Allowlisted evidence projection; no accounting or persistence writes.
   * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
   */
  project: function (record, status) {
    return { status, testOnly: true, operationCode: record.code, walletCode: record.intent.walletCode,
      ownerType: "ENTERPRISE", ownerCode: record.ownerCode, programCode: record.intent.programCode,
      rewardTypeCode: record.intent.rewardTypeCode, amount: record.intent.amount, ledgerEntryCode: record.ledgerEntryCode,
      actorCode: record.actor.actorCode, creditedAt: record.creditedAt };
  },

  /**
   * Credits once through canonical earn with receipt, ledger and all balance deltas in one qualified transaction.
   * @param {Object} request Original trusted request, including tenant, signed principal and operation payload.
   * @returns {Promise<*>} Credits once through canonical earn with receipt, ledger and all balance deltas in one qualified transaction.
   * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
   * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
   */
  credit: async function (request) {
    const context = this.context(request);
    await this.platformAdministrator(context);
    await this.persistence(context);
    const code = "enterpriseTestCredit:" + crypto.createHash("sha256")
      .update(JSON.stringify([context.tenant, context.environmentCode, context.intent.idempotencyKey])).digest("hex");
    return this.service("DefaultLoyaltyTransactionService").compose(context, async () => {
      const actor = await this.platformAdministrator(context);
      const prior = await this.read(context, "DefaultRewardTestCreditOperationService", { code });
      const { wallet, balance } = await this.target(context, context.intent);
      if (prior) {
        const repeated = { ...context.intent, amount: this.amount().assertPositive(context.intent.amount, prior.scale) };
        if (prior.testOnly !== true || prior.ownerType !== "ENTERPRISE" || prior.ownerCode !== wallet.ownerCode ||
            prior.environmentCode !== context.environmentCode || !isDeepStrictEqual(prior.intent, repeated)) this.fail("CONFLICT");
        const entry = await this.ledger(context, prior);
        if (entry.code !== prior.ledgerEntryCode) this.fail("CONFLICT");
        await this.platformAdministrator(context);
        context.assertBound();
        return this.project(prior, ENUMS.LoyaltyTestCreditStatus.CURRENT.key);
      }
      const scale = await this.scale(context, context.intent);
      const intent = { ...context.intent, amount: this.amount().assertPositive(context.intent.amount, scale) };
      if (counters.some(key => typeof balance[key] !== "string" || this.amount().compare(balance[key], "0", scale) < 0)) this.fail("INELIGIBLE");
      const record = { code, active: true, revision: 0, ownerType: "ENTERPRISE", ownerCode: wallet.ownerCode,
        testOnly: true, environmentCode: context.environmentCode, intent, scale, actor, creditedAt: new Date() };
      const posting = this.posting(context, record), operations = this.service("DefaultLoyaltyRewardOperationService");
      if (await this.read(context, "DefaultRewardLedgerEntryService", { code: operations.ledgerCode(posting, ENUMS.LoyaltyLedgerEntryType.EARN.key) })) this.fail("CONFLICT");
      const expected = operations.changeBalance(balance, posting, { available: intent.amount, earned: intent.amount });
      await operations.earn(posting);
      const entry = await this.ledger(context, record);
      const observed = await this.read(context, "DefaultLoyaltyWalletRewardBalanceService", { code: balance.code });
      if (!observed || observed.revision !== expected.revision ||
          counters.some(key => this.amount().compare(observed[key], expected[key], scale) !== 0) ||
          !isDeepStrictEqual(observed.metadata, balance.metadata)) this.fail("CONFLICT");
      record.ledgerEntryCode = entry.code;
      const response = await this.service("DefaultRewardTestCreditOperationService").save({
        ...operations.serviceRequest(context, { model: record }), options: { insertOnly: true } });
      if (!/^SUC_/.test(response?.code || "") || response.error || response.success === false ||
          response.acknowledged === false || response.result?.acknowledged === false || response.errors?.length) this.fail("CONFLICT");
      const retained = await this.read(context, "DefaultRewardTestCreditOperationService", { code });
      if (!retained || Object.keys(record).some(key => !isDeepStrictEqual(retained[key], record[key]))) this.fail("CONFLICT");
      await this.platformAdministrator(context);
      context.assertBound();
      return this.project(retained, ENUMS.LoyaltyTestCreditStatus.CREDITED.key);
    });
  },
};
