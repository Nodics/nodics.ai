/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
"use strict";
const crypto = require("node:crypto"), { isDeepStrictEqual } = require("node:util");
const sourceType = "LOYALTY_TRANSFER_COMPLETED";

/** @module loyaltyWallet/service/defaultLoyaltyTransferNotificationService @description Proves committed transfer sources and retains frozen Communication pointers on existing receipts; never moves value or stores contacts. @layer service @owner loyaltyWallet @override Preserve post-commit admission, typed Profile proof, current preferences, immutable message identity and Communication-owned delivery. */
module.exports = {
  /**
   * Resolves the effective Loyalty amount owner for every operation.
   * @returns {Object} Loader-selected amount service; no effects or inline fallback.
   * @override Preserve exact amount and precision contracts in later-layer overrides.
   */
  amount: function () { return SERVICE.DefaultLoyaltyAmountService; },
  /**
   * Throws a content-free existing owner status.
   * @returns {never} Always throws a content-safe owner error; no business writes.
   * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
   * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
   */
  fail: function () { SERVICE.DefaultLoyaltyRewardOperationService.fail("ERR_LOYALTY_TRANSFER", "Transfer notification evidence is unavailable"); },
  /**
   * Stable identity over ordered non-contact facts.
   * @param {*} value Value to validate, normalize or project as described above.
   * @returns {string} Deterministic digest of ordered identity components; no persistence.
   * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
   */
  digest: function (value) { return crypto.createHash("sha256").update(JSON.stringify(value)).digest("hex"); },
  /**
   * Requires bounded exact record references.
   * @param {*} value Value to validate, normalize or project as described above.
   * @returns {boolean} Whether the value satisfies the fixed identifier grammar; no effects.
   * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
   */
  identifier: function (value) { return typeof value === "string" && /^[A-Za-z0-9_.:@|-]{1,200}$/.test(value); },
  /**
   * Reads framework-owned definitions; no inline transport/template defaults or automatic enabling.
   * @returns {*} Reads framework-owned definitions; no inline transport/template defaults or automatic enabling.
   * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
   * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
   */
  policy: function () {
    const p = CONFIG.get("loyalty")?.transferNotifications;
    if (p?.enabled !== true || p.qualified !== true ||
        [p.profileConnectionName, p.communicationConnectionName, p.sourcePermission, p.templates?.SENDER, p.templates?.RECIPIENT].some(value => !this.identifier(value)) ||
        !Number.isSafeInteger(p.timeoutMs) || p.timeoutMs < 1 || !Number.isSafeInteger(p.maximumRecipients) || p.maximumRecipients < 1 ||
        !Number.isSafeInteger(p.maxResponseBytes) || p.maxResponseBytes < 1 ||
        typeof p.allowInsecureLoopback !== "boolean" || typeof p.locale !== "string" || !/^[a-z]{2,3}(?:-[A-Za-z0-9]{2,8})*$/.test(p.locale)) this.fail();
    return structuredClone(p);
  },
  /**
   * Reads exact durable records through the existing private Wallet boundary after owner admission.
   * @param {string} name Owner-selected service or header name.
   * @param {Object} request Original trusted request, including tenant, signed principal and operation payload.
   * @param {Object} query Owner-built exact persistence selector, never a client query.
   * @returns {*} Reads exact durable records through the existing private Wallet boundary after owner admission.
   * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
   * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
   */
  read: function (name, request, query) { return SERVICE.DefaultLoyaltyParticipantTransferService.read(name, request, query); },
  /**
   * Proves a committed receipt from canonical debit/credit evidence, never a request result or balance snapshot.
   * @param {Object} request Original trusted request, including tenant, signed principal and operation payload.
   * @param {string} code Exact record identity or stable owner error code, as described above.
   * @returns {Promise<*>} Proves a committed receipt from canonical debit/credit evidence, never a request result or balance snapshot.
   * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
   * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
   */
  record: async function (request, code) {
    if (!this.identifier(code) || request.transactionContext !== undefined) this.fail();
    const row = await this.read("DefaultRewardTransferOperationService", request, { code });
    const intent = row?.intent, result = row?.result;
    if (!row || row.active === false || !Number.isSafeInteger(row.revision) || row.revision < 0 ||
        !row.completedAt || !Number.isFinite(new Date(row.completedAt).getTime()) || result?.status !== ENUMS.LoyaltyTransferStatus.COMPLETED.key ||
        !["CUSTOMER", "ENTERPRISE"].includes(row.ownerType) || !this.identifier(row.ownerCode) ||
        intent?.ownerType !== row.ownerType || intent.ownerCode !== row.ownerCode ||
        !["CUSTOMER", "ENTERPRISE"].includes(intent.recipient?.ownerType) || !this.identifier(intent.recipient.ownerCode) ||
        !Number.isSafeInteger(intent.scale) || !this.identifier(result.debitEntryCode) || !this.identifier(result.creditEntryCode)) this.fail();
    const amount = this.amount().assertPositive(intent.amount, intent.scale), fee = this.amount().normalize(result.feeAmount, intent.scale);
    if (result.amount !== amount || this.amount().compare(fee, "0", intent.scale) < 0) this.fail();
    const debit = await this.read("DefaultRewardLedgerEntryService", request, { code: result.debitEntryCode });
    const credit = await this.read("DefaultRewardLedgerEntryService", request, { code: result.creditEntryCode });
    if (!debit || !credit || debit.entryType !== ENUMS.LoyaltyLedgerEntryType.CAPTURE.key || credit.entryType !== ENUMS.LoyaltyLedgerEntryType.EARN.key ||
        debit.amount !== this.amount().add(amount, fee, intent.scale) || credit.amount !== amount || debit.walletCode === credit.walletCode ||
        credit.metadata?.debitEntryCode !== debit.code || credit.metadata?.fromWalletCode !== debit.walletCode ||
        debit.targetCode !== credit.walletCode || [debit, credit].some(entry => entry.active === false ||
          entry.sourceType !== "WALLET_TRANSFER" || entry.sourceCode !== row.code ||
          entry.programCode !== intent.programCode || entry.rewardTypeCode !== intent.rewardTypeCode)) this.fail();
    for (const [entry, owner] of [[debit, row], [credit, intent.recipient]]) {
      const wallet = await this.read("DefaultLoyaltyWalletService", request, { code: entry.walletCode });
      if (!wallet || wallet.ownerType !== owner.ownerType || wallet.ownerCode !== owner.ownerCode) this.fail();
    }
    return row;
  },
  /**
   * Hashes only immutable committed facts, not mutable notification pointer/revision.
   * @param {Object} row Persisted owner record with original revision and evidence.
   * @returns {string} Digest of immutable source facts; no persistence.
   * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
   */
  sourceDigest: function (row) { return this.digest([row.code, row.ownerType, row.ownerCode, row.intent, row.result, row.actorCode, new Date(row.completedAt).toISOString()]); },
  /**
   * Private source endpoint with real runtime module/permission admission and no generic owner lookup.
   * @param {Object} request Original trusted request, including tenant, signed principal and operation payload.
   * @returns {Promise<*>} Private source endpoint with real runtime module/permission admission and no generic owner lookup.
   * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
   * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
   */
  source: async function (request) {
    SERVICE.DefaultLoggerService.assertSensitiveRequest(request);
    const p = this.policy(), auth = SERVICE.DefaultServiceTokenService.requireRuntimePrincipal(request, "loyaltyApi");
    const input = request.payload ?? request.body ?? request.httpRequest?.body;
    if (auth.principalType !== "service" || !auth.modules.includes("profile") || !Array.isArray(auth.permissions) || !auth.permissions.includes(p.sourcePermission) ||
        !input || Object.keys(input).sort().join(",") !== "channel,operationCode,side" || input.channel !== "IN_APP" ||
        !["SENDER", "RECIPIENT"].includes(input.side) || request.entCode !== undefined && request.entCode !== auth.entCode ||
        Object.keys(request.query || {}).length) this.fail();
    const original = structuredClone({ auth, tenant: request.tenant, input });
    const row = await this.record(request, input.operationCode);
    if (!isDeepStrictEqual(request.authData, original.auth) || request.tenant !== original.tenant ||
        request.entCode !== undefined && request.entCode !== original.auth.entCode || !isDeepStrictEqual(input, original.input) ||
        [request.payload, request.body, request.httpRequest?.body].some(value => value !== undefined && !isDeepStrictEqual(value, original.input)) ||
        !isDeepStrictEqual(this.policy(), p) || Object.keys(request.query || {}).length) this.fail();
    const owner = input.side === "SENDER" ? row : row.intent.recipient;
    return { contractVersion: 1, committed: true, tenant: request.tenant, sourceModule: "loyaltyWallet", sourceType,
      sourceCode: row.code, sourceDigest: this.sourceDigest(row), side: input.side, channel: "IN_APP",
      owner: { ownerType: owner.ownerType, ownerCode: owner.ownerCode } };
  },
  /**
   * Uses the existing runtime credential owner for private RPC; never forges authData or forwards a human token as service authority.
   * @param {Object} request Original trusted request, including tenant, signed principal and operation payload.
   * @param {string} moduleName Owner-configured remote implementing module.
   * @param {string} path Owner-configured canonical capability path.
   * @param {Object} body Owner-built remote payload; does not replace trusted request scope.
   * @param {Object} p Validated selectors or effective transport policy, as described above.
   * @returns {Promise<*>} Uses the existing runtime credential owner for private RPC; never forges authData or forwards a human token as service authority.
   * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
   * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
   */
  rpc: async function (request, moduleName, path, body, p) {
    const invocation = { local: false, moduleName,
      connectionName: moduleName === "profile" ? p.profileConnectionName : p.communicationConnectionName,
      targetAuthority: { runtimeRole: moduleName === "profile" ? "PLATFORM" : "ENGAGEMENT" },
      tenant: request.tenant, request: { tenant: request.tenant }, apiName: path, methodName: "POST", requestBody: body,
      requireInternalAuth: true, timeoutMs: p.timeoutMs, maxAttempts: 1, maxResponseBytes: p.maxResponseBytes, followRedirects: false,
      secureTransport: { required: true, allowInsecureLoopback: p.allowInsecureLoopback } };
    const response = await SERVICE.DefaultLoggerService.runSensitiveOperation(invocation, () => SERVICE.DefaultModuleService.invokeModule(invocation));
    return SERVICE.DefaultLoyaltyParticipantService.unwrap(response);
  },
  /**
   * Resolves current opt-in inbox references with exact source binding, not employee/contact fallbacks.
   * @param {Object} request Original trusted request, including tenant, signed principal and operation payload.
   * @param {string} code Exact record identity or stable owner error code, as described above.
   * @param {string} side Original sender or recipient notification side.
   * @param {Object} p Validated selectors or effective transport policy, as described above.
   * @returns {Promise<*>} Resolves current opt-in inbox references with exact source binding, not employee/contact fallbacks.
   * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
   * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
   */
  recipients: async function (request, code, side, p) {
    const proof = await this.rpc(request, "profile", "/internal/transfers/notification-recipients", { source: { operationCode: code, side }, channel: "IN_APP" }, p);
    if (proof?.contractVersion !== 1 || proof.tenant !== request.tenant || proof.sourceCode !== code || proof.side !== side ||
        proof.channel !== "IN_APP" || !/^[a-f0-9]{64}$/.test(proof.sourceDigest || "") ||
        !["CUSTOMER", "ENTERPRISE"].includes(proof.owner?.ownerType) || !this.identifier(proof.owner.ownerCode) ||
        Object.keys(proof.owner).sort().join(",") !== "ownerCode,ownerType" ||
        !Array.isArray(proof.recipients) || proof.recipients.length > p.maximumRecipients ||
        new Set(proof.recipients.map(row => row.recipientId)).size !== proof.recipients.length ||
        proof.recipients.some(row => !row || Object.keys(row).sort().join(",") !== "recipientAddressReference,recipientId" ||
          !this.identifier(row.recipientId) || !/^profile-inbox:[a-f0-9]{64}$/.test(row.recipientAddressReference))) this.fail();
    return proof;
  },
  /**
   * Persists a source pointer snapshot by receipt revision; no outbox, lease, attempt counter or accounting write.
   * @param {Object} request Original trusted request, including tenant, signed principal and operation payload.
   * @param {Object} row Persisted owner record with original revision and evidence.
   * @param {Object} plan Previously frozen operation or recipient plan.
   * @returns {Promise<*>} Persists a source pointer snapshot by receipt revision; no outbox, lease, attempt counter or accounting write.
   * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
   * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
   */
  save: async function (request, row, plan) {
    await SERVICE.DefaultLoyaltyParticipantTransferService.write("DefaultRewardTransferOperationService", request,
      { code: row.code, revision: row.revision + 1, notificationPlan: plan }, row);
    return this.read("DefaultRewardTransferOperationService", request, { code: row.code });
  },
  /**
   * Checks the frozen source/side/recipient/key identity before reuse or inspect.
   * @param {Object} row Persisted owner record with original revision and evidence.
   * @param {Object} p Validated selectors or effective transport policy, as described above.
   * @returns {Object} Validated frozen recipient plan; no readdressing or dispatch.
   * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
   * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
   */
  validatePlan: function (row, p) {
    const plan = row.notificationPlan;
    if (plan?.version !== 1 || plan.sourceDigest !== this.sourceDigest(row) || !Array.isArray(plan.entries) ||
        !Array.isArray(plan.resolvedSides) || plan.resolvedSides.length > 2 ||
        new Set(plan.resolvedSides).size !== plan.resolvedSides.length || plan.resolvedSides.some(side => !["SENDER", "RECIPIENT"].includes(side)) ||
        plan.entries.length > p.maximumRecipients * 2 || new Set(plan.entries.map(entry => entry.idempotencyKey)).size !== plan.entries.length) this.fail();
    for (const entry of plan.entries) {
      if (!plan.resolvedSides.includes(entry.side) || !this.identifier(entry.recipientId) ||
          !/^profile-inbox:[a-f0-9]{64}$/.test(entry.recipientAddressReference) || entry.channel !== "IN_APP" || entry.purpose !== sourceType ||
          entry.idempotencyKey !== this.key(row.code, entry.side, entry.recipientId) ||
          !this.identifier(entry.templateCode) || typeof entry.locale !== "string" ||
          !isDeepStrictEqual(entry.variables, this.variables(row)) || entry.intentCode !== undefined && !/^COMM_[a-f0-9]{64}$/.test(entry.intentCode)) this.fail();
    }
    return plan;
  },
  /**
   * Distinguishes original sender/recipient notifications even when their configured inbox recipients coincide.
   * @param {string} code Exact record identity or stable owner error code, as described above.
   * @param {string} side Original sender or recipient notification side.
   * @param {string} recipientId Frozen canonical inbox recipient identity.
   * @returns {string} Stable original-operation key; no persistence.
   * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
   */
  key: function (code, side, recipientId) { return "loyalty-transfer:" + this.digest([code, side, recipientId]); },
  /**
   * Freezes only public accounting quantities and a source reference, never contacts or recipient balances.
   * @param {Object} row Persisted owner record with original revision and evidence.
   * @returns {Object} Frozen public presentation quantities; no private contacts or new recipient lookup.
   * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
   */
  variables: function (row) { return { transferReference: row.code, amount: row.intent.amount, feeAmount: row.result.feeAmount, rewardTypeCode: row.intent.rewardTypeCode }; },
  /**
   * Post-commit only: resolves original owner, freezes recipients once and requests/inspects Communication-owned intents.
   * @param {Object} request Original trusted request, including tenant, signed principal and operation payload.
   * @param {string} operationCode Original persisted transfer operation identity.
   * @returns {Promise<Object>} NOT_REQUESTED, RECORDED or UNCONFIRMED notification outcome; uncertainty never reverses committed accounting.
   * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
   */
  notify: async function (request, operationCode) {
    if (CONFIG.get("loyalty")?.transferNotifications?.enabled !== true) return { status: ENUMS.LoyaltyTransferNotificationStatus.NOT_REQUESTED.key };
    try {
      const p = this.policy();
      if (request.transactionContext !== undefined) this.fail();
      return await SERVICE.DefaultLoggerService.runSensitiveOperation(request, async () => {
        const context = { tenant: request.tenant, authData: structuredClone(request.authData), authorization: request.authorization };
        const owner = await SERVICE.DefaultLoyaltyParticipantService.resolve(request, "loyalty.wallet.read");
        if (!isDeepStrictEqual(context, { tenant: request.tenant, authData: request.authData, authorization: request.authorization })) this.fail();
        request = context;
        let row = await this.record(request, operationCode);
        if (row.ownerType !== owner.ownerType || row.ownerCode !== owner.ownerCode) this.fail();
        const sourceDigest = this.sourceDigest(row);
        if (row.notificationPlan) this.validatePlan(row, p);
        for (const side of ["SENDER", "RECIPIENT"]) {
          if (row.notificationPlan?.resolvedSides.includes(side)) continue;
          try {
            const proof = await this.recipients(request, row.code, side, p);
            const expectedOwner = side === "SENDER" ? { ownerType: row.ownerType, ownerCode: row.ownerCode } : row.intent.recipient;
            if (proof.sourceDigest !== sourceDigest || !isDeepStrictEqual(proof.owner, expectedOwner)) this.fail();
            const current = await this.record(request, operationCode);
            if (this.sourceDigest(current) !== sourceDigest || !isDeepStrictEqual(this.policy(), p)) this.fail();
            const plan = current.notificationPlan ? structuredClone(this.validatePlan(current, p))
              : { version: 1, sourceDigest, resolvedSides: [], entries: [] };
            if (plan.resolvedSides.includes(side)) { row = current; continue; }
            plan.resolvedSides.push(side);
            plan.entries.push(...proof.recipients.map(recipient => ({ side, ...recipient, templateCode: p.templates[side], purpose: sourceType,
              channel: "IN_APP", locale: p.locale, idempotencyKey: this.key(row.code, side, recipient.recipientId), variables: this.variables(row) })));
            row = await this.save(request, current, plan);
          } catch (_) { /* An unresolved side cannot suppress the other owner's eligible notification. */ }
        }
        row = await this.record(request, operationCode);
        this.validatePlan(row, p);
        const outcomes = ["SENDER", "RECIPIENT"].filter(side => !row.notificationPlan.resolvedSides.includes(side))
          .map(side => ({ side, status: ENUMS.LoyaltyTransferNotificationStatus.UNCONFIRMED.key }));
        for (const frozen of row.notificationPlan.entries) {
          try {
            if (!isDeepStrictEqual(this.policy(), p)) this.fail();
            const message = { sourceModule: "loyaltyWallet", sourceType, sourceCode: row.code,
              ...Object.fromEntries(["templateCode", "recipientId", "recipientAddressReference", "purpose", "channel", "locale", "idempotencyKey", "variables"].map(key => [key, frozen[key]])),
              requiresSourceEligibility: true };
            const result = await this.rpc(request, "commsApi", frozen.intentCode
              ? "/internal/communications/" + frozen.intentCode + "/inspect" : "/internal/communications", frozen.intentCode ? {} : message, p);
            if (!/^COMM_[a-f0-9]{64}$/.test(result?.intentCode || "") || frozen.intentCode && frozen.intentCode !== result.intentCode ||
                ![ENUMS.LoyaltyTransferNotificationStatus.ACCEPTED.key, ENUMS.LoyaltyTransferNotificationStatus.QUEUED.key, ENUMS.LoyaltyTransferNotificationStatus.DELIVERING.key, ENUMS.LoyaltyTransferNotificationStatus.DELIVERED.key, ENUMS.LoyaltyTransferNotificationStatus.RETRY_PENDING.key, ENUMS.LoyaltyTransferNotificationStatus.UNCERTAIN.key, ENUMS.LoyaltyTransferNotificationStatus.SUPPRESSED.key,
                  ENUMS.LoyaltyTransferNotificationStatus.FAILED.key, ENUMS.LoyaltyTransferNotificationStatus.CANCELLED.key, ENUMS.LoyaltyTransferNotificationStatus.DEAD_LETTER.key, ENUMS.LoyaltyTransferNotificationStatus.UNCONFIGURED.key].includes(result.status)) this.fail();
            if (!frozen.intentCode) {
              const current = await this.read("DefaultRewardTransferOperationService", request, { code: row.code });
              const plan = structuredClone(this.validatePlan(current, p));
              const entry = plan.entries.find(item => item.idempotencyKey === frozen.idempotencyKey);
              if (!entry || entry.intentCode && entry.intentCode !== result.intentCode) this.fail();
              if (!entry.intentCode) { Object.assign(entry, { intentCode: result.intentCode, status: result.status }); await this.save(request, current, plan); }
            }
            outcomes.push({ side: frozen.side, status: result.status, intentCode: result.intentCode });
          } catch (_) { outcomes.push({ side: frozen.side, status: ENUMS.LoyaltyTransferNotificationStatus.UNCONFIRMED.key }); }
        }
        return { status: outcomes.some(row => row.status === ENUMS.LoyaltyTransferNotificationStatus.UNCONFIRMED.key) ? ENUMS.LoyaltyTransferNotificationStatus.UNCONFIRMED.key : ENUMS.LoyaltyTransferNotificationStatus.RECORDED.key, outcomes };
      });
    } catch (_) { return { status: ENUMS.LoyaltyTransferNotificationStatus.UNCONFIRMED.key }; }
  },
  /**
   * Communication pre-dispatch hook: current source/roster/preferences may suppress but cannot readdress frozen intent.
   * @param {Object} input Operation-specific command or evidence input described above; not authorization.
   * @returns {Promise<Object>} Current eligibility and the unchanged tenant/source/recipient binding.
   * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
   * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
   */
  isDispatchEligible: async function (input) {
    const p = this.policy();
    if (input.sourceModule !== "loyaltyWallet" || input.sourceType !== sourceType || input.purpose !== sourceType || input.channel !== "IN_APP") this.fail();
    const side = ["SENDER", "RECIPIENT"].find(value => input.idempotencyKey === this.key(input.sourceCode, value, input.recipientId));
    if (!side) this.fail();
    const proof = await this.recipients(input, input.sourceCode, side, p);
    return { eligible: proof.recipients.some(row => row.recipientId === input.recipientId && row.recipientAddressReference === input.recipientAddressReference),
      tenant: input.tenant, sourceCode: input.sourceCode, recipientId: input.recipientId, recipientAddressReference: input.recipientAddressReference };
  },
};
