/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
'use strict';
const { isDeepStrictEqual: same } = require('node:util');
const active = new WeakSet();
const { createHash } = require('node:crypto');

/**
 * @module loyaltyWallet/service/defaultLoyaltyReservationDecisionService
 * @description Serializes Payment reservation decisions with wallet accounting through the existing
 * Loyalty transaction owner. Cancellation fences an exact key without inventing missing spend terms.
 * @layer service
 * @owner loyaltyWallet
 * @override Effective helpers may narrow validation; preserve atomic insert-only identity, original
 * scope and no-effects cancellation. Private admission cannot be supplied by callers.
 */
module.exports = {
  /**
   * Reports loaded persistence readiness after fresh native Super Admin proof before and after reads.
   * Reuses the existing administrator evidence permission, not credit enablement or a new grant.
   * No command selectors, transaction execution, decisions or accounting writes are admitted.
   */
  readiness: async function (request) {
    const auth = structuredClone(request.authData || {});
    const tenant = request.tenant, authorization = request.authorization;
    const path = CONFIG.get('loyalty')?.enterpriseTestCredits?.platformAdministratorEvidencePath;
    const headers = () => [request.headers, request.header, request.httpRequest?.headers, request.httpRequest?.header]
      .filter(value => value && typeof value === 'object')
      .flatMap(value => Object.entries(value).filter(([key]) => /^(authorization|x-enterprise-code|x-tenant-code)$/i.test(key)));
    const headerPin = structuredClone(headers());
    const context = { tenant, authData: structuredClone(auth), authorization, enterpriseCode: auth.entCode,
      policy: { platformAdministratorEvidencePath: path } };
    context.assertBound = () => {
      const security = SERVICE.DefaultSecuredRequestPipelineService;
      if (!same(request.authData, auth) || !same(context.authData, auth) || request.tenant !== tenant ||
          context.tenant !== tenant || auth.tenant !== tenant || !tenant ||
          request.authorization !== authorization || context.authorization !== authorization ||
          typeof authorization !== 'string' || !authorization || context.enterpriseCode !== auth.entCode ||
          auth.principalType !== 'human' || auth.tokenType !== 'access' || auth.authenticationMethod !== 'PASSWORD' ||
          auth.isSystem || auth.sessionContext !== undefined || auth.runtimeScope !== undefined ||
          auth.externalIdentityLinkCode !== undefined || !auth.loginId || !auth.entCode ||
          !Number.isSafeInteger(auth.authVersion) || auth.authVersion < 1 ||
          request.transactionContext !== undefined || !same(headers(), headerPin) ||
          [request.payload, request.body, request.httpRequest?.body, request.query, request.httpRequest?.query]
            .some(value => value !== undefined && (!value ||
              ![Object.prototype, null].includes(Object.getPrototypeOf(value)) || Object.keys(value).length)) ||
          [auth.enterpriseCode, request.entCode, request.enterpriseCode].some(value => value !== undefined && value !== auth.entCode) ||
          [auth.tenantCode, request.tenantCode].some(value => value !== undefined && value !== tenant) ||
          headerPin.some(([key, value]) => key.toLowerCase() === 'x-enterprise-code' && value !== auth.entCode ||
            key.toLowerCase() === 'x-tenant-code' && value !== tenant || key.toLowerCase() === 'authorization' && value !== authorization) ||
          typeof path !== 'string' || !/^\/[A-Za-z0-9/_-]+$/.test(path) ||
          context.policy.platformAdministratorEvidencePath !== path ||
          CONFIG.get('loyalty')?.enterpriseTestCredits?.platformAdministratorEvidencePath !== path ||
          !security.hasPlatformFullAccess(request) ||
          !security.isPermissionGranted('loyalty.wallet.testCredit', security.getGrantedPermissions(request), {})) this.fail();
      SERVICE.DefaultLoggerService.assertSensitiveRequest(request);
    };
    try {
      context.assertBound();
      await SERVICE.DefaultLoyaltyEnterpriseTestCreditService.platformAdministrator(context);
      await this.persistence({ tenant });
      context.assertBound();
      await SERVICE.DefaultLoyaltyEnterpriseTestCreditService.platformAdministrator(context);
      context.assertBound();
      return { contract: 'LOYALTY_RESERVATION_READINESS_V1', qualified: true, readOnly: true };
    } catch (_) { this.fail(); }
  },
  /** Recognizes only an active in-process reservation invocation. */
  owns: function (request) { return active.has(request); },
  /** Stops on uncertainty; no financial repair or retry. */
  fail: function () { return this.operations().fail('ERR_LOYALTY_RESERVATION_DECISION', 'Original reservation decision cannot be confirmed'); },
  /** Returns stable Wallet-owned decision vocabulary through the runtime enum registry. */
  statuses: function () { return ENUMS.LoyaltyReservationDecisionStatus; },
  /** Resolves canonical accounting, including later-loaded amount and persistence implementations. */
  operations: function () { return SERVICE.DefaultLoyaltyRewardOperationService; },
  /** Validates trusted service context and the original payment/order key, with no wallet inference. */
  context: function (request, permission = 'loyalty.rewards.reserve') {
    const auth = SERVICE.DefaultServiceTokenService.requireRuntimePrincipal(request, 'loyaltyApi');
    const policy = CONFIG.get('loyalty')?.reservationDecisions;
    const grants = (Array.isArray(policy?.callers) ? policy.callers : []).filter(g =>
      ['tenant', 'serviceId', 'entCode'].every(k => typeof g[k] === 'string' && g[k] === auth[k]) &&
      ['projectCode', 'environmentCode', 'serverCode', 'instanceCode', 'assignmentCode'].every(k =>
        typeof g[k] === 'string' && g[k].length > 0 && g[k] === auth.runtimeScope?.[k]) &&
      g.instanceCode === auth.runtimeInstanceId && g.environmentCode === NODICS.getSelectedEnvironmentName());
    if (auth !== request.authData || auth.isSystem || grants.length !== 1 || !auth.permissions?.includes(permission)) this.fail();
    const p = request.payload || request;
    const r = { ...request, tenant: request.tenant || request.authData?.tenant,
      idempotencyKey: p.idempotencyKey, sourceType: p.sourceType, sourceCode: p.sourceCode,
      targetType: p.targetType, targetCode: p.targetCode };
    const id = value => typeof value === 'string' && /^[A-Za-z0-9][A-Za-z0-9_.:@|\-]{0,511}$/.test(value);
    if (r.authData?.principalType !== 'service' || r.authData.tenant !== r.tenant ||
        ![r.tenant, r.idempotencyKey, r.sourceCode, r.targetCode].every(id) ||
        r.sourceType !== 'PAYMENT' || r.targetType !== 'ORDER' || r.sourceCode !== r.targetCode ||
        request.transactionContext !== undefined || request.reservationCode !== undefined || p.reservationCode !== undefined) this.fail();
    return r;
  },
  /** Exact source binding shared by authorize, inspect and cancel; no current price or wallet lookup. */
  binding: function (r) { return { idempotencyKey: r.idempotencyKey, sourceType: r.sourceType,
    sourceCode: r.sourceCode, targetType: r.targetType, targetCode: r.targetCode }; },
  /** Reuses the canonical reservation identity; no independent financial key. */
  code: function (r) { return this.operations().hashCode('rewardReservation', [r.idempotencyKey]); },
  /** Qualifies actual schema wrappers and installed unique indexes before any decision or accounting. */
  persistence: async function (r) {
    const tx = SERVICE.DefaultLoyaltyTransactionService;
    const qualified = tx?.qualify(r), database = qualified?.owner.resolve(qualified.scope).database;
    if (!database || typeof tx.compose !== 'function') this.fail();
    for (const [moduleName, schema] of [['loyaltyReservation', 'rewardReservationDecision'],
      ['loyaltyReservation', 'rewardReservation'], ['loyaltyWallet', 'loyaltyWalletRewardBalance'], ['loyaltyLedger', 'rewardLedgerEntry']]) {
      const model = NODICS.getModels(moduleName, r.tenant)?.[UTILS.createModelName(schema)];
      if (!model || model.dataBase !== database || model.versioned === true ||
          model.rawSchema?.transaction?.enabled !== true || model.rawSchema.transaction.sideEffects !== 'none' ||
          model.rawSchema.cache?.enabled !== false || model.rawSchema.event?.enabled !== false ||
          schema === 'loyaltyWalletRewardBalance' && typeof model.compareAndSetItem !== 'function') this.fail();
      const indexes = await SERVICE.DefaultDatabaseModelHandlerService.inspectIndexes(model);
      if (indexes?.versioned !== false || !indexes.indexes?.some(index => index.unique === true && !index.sparse &&
          !index.partialFilterExpression && (!index.collation || index.collation.locale === 'simple') &&
          Object.keys(index.key || {}).join(',') === 'code' && index.key.code === 1)) this.fail();
    }
  },
  /** Performs complete bounded generated reads inside the original transaction; errors never mean absence. */
  rows: async function (name, r, query) {
    const response = await SERVICE[name].get({ ...this.operations().serviceRequest(r, { query }),
      options: { recursive: false, skipItemCache: true }, searchOptions: { pageSize: 2, pageNumber: 1 } });
    if (!/^SUC_/.test(response?.code || '') || response.error || response.success === false || response.acknowledged === false ||
        response.errors !== undefined && (!Array.isArray(response.errors) || response.errors.length) ||
        !Array.isArray(response.result) || response.count !== response.result.length ||
        response.result.length > 1 || [response.total, response.totalCount].some(n => n !== undefined && n !== response.result.length) ||
        response.result.some(row => Object.entries(query).some(([k, v]) => !same(row[k], v)))) this.fail();
    return response.result;
  },
  /** Returns a retained decision only after exact original source comparison. */
  read: async function (r) {
    const [row] = await this.rows('DefaultRewardReservationDecisionService', r, { code: this.code(r) });
    const status = this.statuses();
    if (row && (!same(row.binding, this.binding(r)) || ![status.AUTHORIZED.key, status.DENIED.key, status.CANCELLED.key].includes(row.status) ||
        row.noEffects !== (row.status === status.DENIED.key || row.status === status.CANCELLED.key && this.validReconciliation(row)))) this.fail();
    if (row?.reconciliation !== undefined && !this.validReconciliation(row)) this.fail();
    return row;
  },
  /** Refuses pre-adoption holds or postings, including partial/uncertain historical effects. */
  assertNoEffects: async function (r) {
    if ((await this.rows('DefaultRewardReservationService', r, { code: this.code(r) })).length ||
        (await this.rows('DefaultRewardLedgerEntryService', r, { idempotencyKey: r.idempotencyKey })).length) this.fail();
  },
  /** Rejects unexplained pre-contract balance effects using complete owner accounting, never row absence alone. */
  reconcileBalance: async function (r, normalized, balance) {
    const op = this.operations(), limit = CONFIG.get('loyalty')?.reservationDecisions?.maximumLedgerEntries;
    if (!Number.isSafeInteger(limit) || limit < 1 || !Number.isSafeInteger(balance.revision)) this.fail();
    const query = Object.fromEntries(['walletCode', 'programCode', 'rewardTypeCode'].map(k => [k, normalized[k]]));
    const response = await SERVICE.DefaultRewardLedgerEntryService.get({ ...op.serviceRequest(r, { query }),
      options: { recursive: false, skipItemCache: true }, searchOptions: { pageSize: limit + 1, pageNumber: 1 } });
    const entries = response?.result;
    if (!/^SUC_/.test(response?.code || '') || response.error || response.success === false || response.acknowledged === false ||
        response.errors !== undefined && (!Array.isArray(response.errors) || response.errors.length) ||
        !Array.isArray(entries) || entries.length > limit || response.count !== entries.length ||
        [response.total, response.totalCount].some(n => n !== undefined && n !== entries.length) ||
        balance.revision !== entries.length || new Set(entries.map(e => e.code)).size !== entries.length ||
        entries.some(e => !e.code || Object.entries(query).some(([k, v]) => e[k] !== v))) this.fail();
    const fields = ['available', 'reserved', 'earned', 'spent', 'expired', 'reversed'];
    const totals = Object.fromEntries(fields.map(k => [k, '0']));
    for (const entry of entries) {
      const amount = op.amount().assertPositive(entry.amount, normalized.scale), negative = op.negative(amount, normalized.scale);
      const movements = { EARN: { available: amount, earned: amount }, RESERVE: { available: negative, reserved: amount },
        CAPTURE: { reserved: negative, spent: amount }, RELEASE: { available: amount, reserved: negative },
        EXPIRE: { available: negative, expired: amount } };
      let delta = movements[entry.entryType];
      if (entry.entryType === ENUMS.LoyaltyLedgerEntryType.REVERSE.key) {
        const original = entries.find(e => e.code === entry.reversalOfEntryCode);
        if (!original || original.amount !== entry.amount ||
            entries.filter(e => e.reversalOfEntryCode === original.code).length !== 1) this.fail();
        delta = op.reverseDeltas(original, normalized);
      }
      if (!delta) this.fail();
      for (const [key, value] of Object.entries(delta)) totals[key] = op.amount().add(totals[key], value, normalized.scale);
    }
    if (fields.some(k => op.amount().compare(totals[k], balance[k], normalized.scale) !== 0)) this.fail();
    return { balanceCode: balance.code, balanceRevision: balance.revision, ledgerCount: entries.length,
      ledgerDigest: createHash('sha256').update(JSON.stringify([...entries].sort((a, b) => a.code.localeCompare(b.code)))).digest('hex'),
      totals: Object.fromEntries(fields.map(key => [key, balance[key]])) };
  },
  /** Inserts the immutable decision in the same transaction as accounting, then positively reads it back. */
  write: async function (r, status, intent) {
    const now = new Date(), model = { code: this.code(r), binding: this.binding(r), status, noEffects: status === this.statuses().DENIED.key,
      ...(intent ? { intent } : {}), active: true, created: now, updated: now, decidedAt: now };
    const response = await SERVICE.DefaultRewardReservationDecisionService.save({
      ...this.operations().serviceRequest(r, { model }), options: { insertOnly: true } });
    if (!/^SUC_/.test(response?.code || '') || response.error || response.success === false || response.acknowledged === false ||
        response.result?.acknowledged === false ||
        response.errors !== undefined && (!Array.isArray(response.errors) || response.errors.length)) this.fail();
    const row = await this.read(r);
    if (!row || !(row.updated instanceof Date) || !Number.isFinite(row.updated.getTime()) ||
        Object.keys(model).filter(key => key !== 'updated').some(key => !same(row[key], model[key]))) this.fail();
    return row;
  },
  /** Distinguishes a proven atomic denial from a fence whose historical effects remain unconfirmed. */
  receipt: function (r, row) {
    if (!row || ![this.statuses().DENIED.key, this.statuses().CANCELLED.key].includes(row.status)) this.fail();
    return { contract: 'LOYALTY_RESERVATION_DECISION_V1', tenant: r.tenant, code: row.code,
      ...row.binding, status: row.status, noEffects: row.status === this.statuses().DENIED.key };
  },
  /** Atomically reserves or commits an insufficient-funds denial; a denied key never becomes spendable. */
  reserve: async function (request) {
    // Pre-contract delayed requests cannot be relabelled as newly atomic authorization attempts.
    if ((request.payload || request).reservationDecisionContract !== 'LOYALTY_RESERVATION_DECISION_V1') this.fail();
    const r = this.context(request), op = this.operations();
    const normalized = op.operationRequest(r, ENUMS.LoyaltyLedgerEntryType.RESERVE.key);
    const intent = Object.fromEntries(['walletCode', 'programCode', 'rewardTypeCode', 'amount'].map(k => [k, normalized[k]]));
    await this.persistence(r);
    return SERVICE.DefaultLoyaltyTransactionService.compose(r, async () => {
      const prior = await this.read(r);
      if (prior) {
        if (prior.intent && !same(prior.intent, intent)) this.fail();
        if (prior.status !== this.statuses().AUTHORIZED.key) return { decision: this.receipt(r, prior) };
        const [hold] = await this.rows('DefaultRewardReservationService', r, { code: this.code(r) });
        const [entry] = await this.rows('DefaultRewardLedgerEntryService', r, { idempotencyKey: r.idempotencyKey });
        if (!hold || !entry || hold.idempotencyKey !== r.idempotencyKey || entry.reservationCode !== hold.code ||
            entry.entryType !== ENUMS.LoyaltyLedgerEntryType.RESERVE.key ||
            Object.entries(intent).some(([k, v]) => hold[k] !== v || entry[k] !== v)) this.fail();
        // A committed authorization is read-only, even when its accounting evidence is damaged.
        return op.existingOperationResult(ENUMS.LoyaltyLedgerEntryType.RESERVE.key,
          { ...normalized, transactionContext: r.transactionContext }, entry);
      } else {
        await this.assertNoEffects(r);
        const [before] = await this.rows('DefaultLoyaltyWalletRewardBalanceService', r, op.balanceQuery(normalized));
        if (!before) this.fail();
        await this.reconcileBalance(r, normalized, before);
        if (op.amount().compare(before.available, normalized.amount, normalized.scale) < 0)
          return { decision: this.receipt(r, await this.write(r, this.statuses().DENIED.key, intent)) };
      }
      // The same opaque transaction token reaches all generated accounting writes.
      const posting = { ...normalized, transactionContext: r.transactionContext };
      active.add(posting);
      try {
        const result = await op.reserve(posting);
        const [hold] = await this.rows('DefaultRewardReservationService', r, { code: this.code(r) });
        const [entry] = await this.rows('DefaultRewardLedgerEntryService', r, { idempotencyKey: r.idempotencyKey });
        if (!hold || !entry || !same(result.reservation, hold) || !same(result.ledgerEntry, entry) ||
            hold.idempotencyKey !== r.idempotencyKey || entry.reservationCode !== hold.code ||
            entry.entryType !== ENUMS.LoyaltyLedgerEntryType.RESERVE.key ||
            Object.entries(intent).some(([k,v]) => hold[k] !== v || entry[k] !== v)) this.fail();
        if (!prior) {
          const [balance] = await this.rows('DefaultLoyaltyWalletRewardBalanceService', r, op.balanceQuery(normalized));
          if (!balance || !same(balance, result.balance) || balance.available !== entry.availableAfter ||
              balance.reserved !== entry.reservedAfter) this.fail();
        }
        if (!prior) await this.write(r, this.statuses().AUTHORIZED.key, intent);
        return result;
      } finally { active.delete(posting); }
    });
  },
  /** Validates owner-retained accounting proof; client proof fields are never accepted. */
  validReconciliation: function (row) {
    const p = row.reconciliation;
    return !!(p && p.contractVersion === 1 && p.method === 'ATOMIC_LEDGER_RECONCILIATION' &&
      p.reconciledAt instanceof Date && Number.isFinite(p.reconciledAt.getTime()) &&
      typeof p.balanceCode === 'string' && p.balanceCode &&
      Number.isSafeInteger(p.balanceRevision) && p.balanceRevision >= 0 &&
      p.ledgerCount === p.balanceRevision && /^[a-f0-9]{64}$/.test(p.ledgerDigest || '') &&
      ['available', 'reserved', 'earned', 'spent', 'expired', 'reversed'].every(k => typeof p.totals?.[k] === 'string') &&
      ['walletCode', 'programCode', 'rewardTypeCode', 'amount'].every(k => typeof row.intent?.[k] === 'string' && row.intent[k]));
  },
  /**
   * Proves a cancelled exact authorization has no accounting effects using a complete ledger,
   * exact balance revision/totals and the canonical unique decision fence in one transaction.
   * Effects: inserts a cancellation if absent and CAS-appends proof once; never changes accounting.
   * Failure: authorization, conflicting intent, incomplete evidence or concurrent writes refuse.
   * Override: preserve original service admission, immutable identity and positive proof requirements.
   */
  reconcile: async function (request) {
    const p = request.payload || request;
    const keys = ['reservationDecisionContract', 'idempotencyKey', 'sourceType', 'sourceCode', 'targetType', 'targetCode',
      'walletCode', 'programCode', 'rewardTypeCode', 'amount'];
    if (request.payload && (Object.keys(p).some(k => !keys.includes(k)) || keys.some(k => !Object.hasOwn(p, k))) ||
        p.reservationDecisionContract !== 'LOYALTY_RESERVATION_DECISION_V1') this.fail();
    const r = this.context(request, 'loyalty.rewards.release'), op = this.operations();
    const normalized = op.operationRequest(r, ENUMS.LoyaltyLedgerEntryType.RESERVE.key);
    const intent = Object.fromEntries(['walletCode', 'programCode', 'rewardTypeCode', 'amount'].map(k => [k, normalized[k]]));
    await this.persistence(r);
    return SERVICE.DefaultLoyaltyTransactionService.compose(r, async () => {
      let row = await this.read(r);
      if (row && (row.status !== this.statuses().CANCELLED.key || row.intent && !same(row.intent, intent))) this.fail();
      await this.assertNoEffects(r);
      const [balance] = await this.rows('DefaultLoyaltyWalletRewardBalanceService', r, op.balanceQuery(normalized));
      if (!balance) this.fail();
      const accounting = await this.reconcileBalance(r, normalized, balance);
      if (!row) row = await this.write(r, this.statuses().CANCELLED.key, intent);
      if (!row.noEffects) {
        const reconciliation = { contractVersion: 1, method: 'ATOMIC_LEDGER_RECONCILIATION', ...accounting, reconciledAt: new Date() };
        const response = await SERVICE.DefaultRewardReservationDecisionService.update({
          ...op.serviceRequest(r, { query: { code: row.code, status: this.statuses().CANCELLED.key,
            noEffects: false, binding: this.binding(r), decidedAt: row.decidedAt },
            model: { noEffects: true, intent, reconciliation } }),
          options: { recursive: false, skipItemCache: true, upsert: false } });
        if (!/^SUC_/.test(response?.code || '') || response.error || response.success === false ||
            response.acknowledged === false || response.result?.acknowledged === false ||
            response.errors !== undefined && (!Array.isArray(response.errors) || response.errors.length)) this.fail();
        const saved = await this.read(r);
        if (!saved || saved.status !== row.status || !saved.noEffects || !same(saved.intent, intent) || !same(saved.reconciliation, reconciliation) ||
            Object.keys(row).filter(k => !['updated', 'intent', 'noEffects', 'reconciliation'].includes(k)).some(k => !same(saved[k], row[k])) ||
            !same(saved.created, row.created) || !same(saved.decidedAt, row.decidedAt) ||
            !(saved.updated instanceof Date) || !Number.isFinite(saved.updated.getTime())) this.fail();
        row = saved;
      }
      await this.assertNoEffects(r);
      return { contract: 'LOYALTY_RESERVATION_RECONCILIATION_V1', tenant: r.tenant, code: row.code,
        ...row.binding, status: row.status, noEffects: true, intent: structuredClone(row.intent),
        proof: structuredClone(row.reconciliation) };
    });
  },
  /**
   * Fences a key without known holds/postings. An absent decision cannot exclude historical partial
   * non-atomic balance effects: CANCELLED therefore never claims noEffects. Only existing DENIED
   * supplies that proof. A racing new authorization aborts one atomic transaction.
   */
  cancel: async function (request) {
    const r = this.context(request, 'loyalty.rewards.release');
    await this.persistence(r);
    return SERVICE.DefaultLoyaltyTransactionService.compose(r, async () => {
      let row = await this.read(r);
      if (row?.status === this.statuses().AUTHORIZED.key) this.fail();
      await this.assertNoEffects(r);
      if (!row) row = await this.write(r, this.statuses().CANCELLED.key);
      return this.receipt(r, row);
    });
  },
  /** Reads terminal proof without cancelling, reserving, reversing or changing a decision. */
  inspect: async function (request) {
    const r = this.context(request, 'loyalty.wallet.read');
    await this.persistence(r);
    return SERVICE.DefaultLoyaltyTransactionService.compose(r, async () => {
      const row = await this.read(r);
      await this.assertNoEffects(r);
      return this.receipt(r, row);
    });
  }
};
