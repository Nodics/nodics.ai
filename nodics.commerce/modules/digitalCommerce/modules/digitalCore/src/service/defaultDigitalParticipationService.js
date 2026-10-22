/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';
const { isDeepStrictEqual: same } = require('node:util');
const configuration = require('../utils/configuration');
const reads = new WeakSet(), writes = new WeakMap();
const fields = ['giftingEnabled', 'receivingEnabled', 'couponPurchasingEnabled'];
/**
 * @module digitalCore/service/defaultDigitalParticipationService
 * @description Owns scoped Enterprise participation selections and atomic new-start admission, not
 * holdings or checkout recovery.
 * @layer service
 * @owner digitalCore
 * @override Framework properties supply complete defaults; Enterprises select governed values through
 * current Profile authority.
 * @remarks Digital participation owns governed Enterprise switches and private audited original
 * commands. Profile owns administrator scope; transaction/CAS and private request identity protect
 * state. Defaults are inherited without creating records, and disabling new starts never rewrites
 * previous admission.
 * Inputs and outputs are specified on each exported member below.
 * Effects and failures remain in the existing owner flow; missing evidence is never synthetic success.
 * Exported members: fail, settings, defaults, schemas, service, providerRead, providerResult, protect,
 * installed, read, write, transaction, policy, projection, administrator, current, status, couponUnit,
 * command, configure, admit.
 * @override Customize through the existing loader-visible module members, preserving private
 * authority.
 */
module.exports = {
  /**
   * Fails closed without disclosing private policy or command evidence.
   * @returns {never} Never returns.
   * @remarks Effects: No private evidence is disclosed or mutated.
   * Failure behavior: Throws the bounded participation evidence error.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  fail: function () { throw new Error('Enterprise participation is unconfirmed'); },
  /**
   * Validates framework-owned mechanics and default values.
   * @returns {Object} Validated effective participation mechanics/defaults.
   * @remarks Effects: Reads owner configuration only.
   * Failure behavior: Rejects absent or malformed definitions.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  settings: function () {
    const p = CONFIG.get('digitalCore')?.enterpriseParticipation;
    if (!p || typeof p.couponPurchasingEnabled !== 'boolean' ||
        ![p.maximumReasonLength, p.maximumCommandKeyLength, p.maximumCopyLength].every(v => configuration.integer(v, p.validation?.length)) ||
        !configuration.integer(p.exactReadPageSize, p.validation?.readPageSize) || p.exactReadPageSize < 2 ||
        p.transactionModuleName !== 'digitalCore' || !p.presentation || Object.values(p.presentation).some(v =>
          typeof v !== 'string' || !v.trim() || v.length > p.maximumCopyLength)) this.fail();
    return p;
  },
  /**
   * Returns inherited business selections without treating a failed read as absence.
   * @returns {Object} Inherited gifting/receiving/coupon-purchasing switches.
   * @remarks Effects: Pure validated owner-default projection; no record creation.
   * Failure behavior: Propagates invalid configuration, never converts a failed governed read into
   * absence.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  defaults: function () {
    const b = SERVICE.DefaultDigitalBundleService.settings();
    return { giftingEnabled: b.enterpriseGiftingEnabled, receivingEnabled: b.enterpriseReceivingEnabled,
      couponPurchasingEnabled: this.settings().couponPurchasingEnabled };
  },
  /**
   * Resolves only fixed generated owners; body values cannot choose storage.
   * @returns {string[]} Fixed generated policy and command schema names.
   * @remarks Effects: Pure owner inventory; no storage lookup.
   * Failure behavior: No deliberate exception.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  schemas: function () { return ['digitalBundleOwnerPolicy', 'digitalParticipationCommand']; },
  /**
   * Looks up an installed generated owner.
   * @param {string} schema Generated schema within the verified Product graph.
   * @returns {Object} Installed fixed generated owner service.
   * @remarks Effects: Registry lookup only; body cannot choose schema.
   * Failure behavior: Rejects unknown schema or unavailable owner.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  service: function (schema) {
    if (!this.schemas().includes(schema)) this.fail();
    const s = SERVICE['Default' + schema[0].toUpperCase() + schema.slice(1) + 'Service'];
    if (!s?.get || !s.save || !s.update) this.fail();
    return s;
  },
  /**
   * Denies generic reads, exports and counts, even for service identities.
   * @param {Object} r Original admitted tenant/Enterprise request, preserving authData and private owner
   * context.
   * @param {Object} model Fixed generated model or owner-selected persistence record for this operation.
   * @returns {boolean} True for the exact privately admitted read.
   * @remarks Effects: Checks private operation identity; no reusable grant is returned.
   * Failure behavior: Rejects generic read/export/count, including arbitrary service requests.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  providerRead: function (r, model) {
    if (!reads.has(r) || model.moduleName !== 'digitalCore' || !this.schemas().includes(model.schemaName)) this.fail();
    return true;
  },
  /**
   * Keeps the exact private read admission through generated projection.
   * @param {Object} r Original admitted tenant/Enterprise request, preserving authData and private owner
   * context.
   * @param {Object} response Canonical owner response envelope.
   * @param {Object} model Fixed generated model or owner-selected persistence record for this operation.
   * @returns {boolean} True while exact private read admission still holds.
   * @remarks Effects: Revalidates original request identity through generated projection.
   * Failure behavior: Rejects changed, cloned or expired private read context.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  providerResult: function (r, response, model) { return this.providerRead(r, model); },
  /**
   * Only the exact unchanged transaction command can write private state.
   * @param {Object} r Original admitted tenant/Enterprise request, preserving authData and private owner
   * context.
   * @returns {boolean} True for the exact unchanged transactional write.
   * @remarks Effects: Private request/transaction pin validation only.
   * Failure behavior: Rejects generic, changed or foreign writes.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  protect: function (r) {
    const proof = writes.get(r);
    if (!proof || !r.transactionContext || proof.transactionContext !== r.transactionContext ||
        !same(proof.identity, { tenant: r.tenant, authData: r.authData, query: r.query, model: r.model })) this.fail();
    return true;
  },
  /**
   * Qualifies installed private hooks, non-managed CAS and unique identity before writes.
   * @param {Object} r Original admitted tenant/Enterprise request, preserving authData and private owner
   * context.
   * @returns {Promise<void>} Completes when installed hooks, transaction and unique CAS identity
   * qualify.
   * @remarks Effects: Inspects installed generated provider/model capabilities; no mutation.
   * Failure behavior: Rejects missing hooks, managed/versioned mismatch or unsafe unique identity.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  installed: async function (r) {
    for (const name of this.schemas()) {
      this.service(name);
      const m = NODICS.getModels('digitalCore', r.tenant)?.[UTILS.createModelName(name)], s = m?.rawSchema;
      if (!m || m.versioned === true || m.primaryKey !== 'code' || typeof m.compareAndSetItem !== 'function' ||
          s?.transaction?.enabled !== true || s.transaction.sideEffects !== 'none' || s.cache?.enabled !== false ||
          s.event?.enabled !== false || s.search?.enabled !== false || s.readProtection?.owner !== 'DefaultDigitalParticipationService' ||
          !m.guardProtectedRead || !m.projectReadResult || SERVICE.DefaultModelConcurrencyService.getField(s)) this.fail();
      const hooks = SERVICE.DefaultDatabaseConfigurationService.getSchemaInterceptors(name);
      for (const trigger of ['preSave', 'preUpdate', 'preRemove']) if (!hooks?.[trigger]?.some(h =>
          [true, 'true'].includes(h.active) && h.handler === 'DefaultDigitalParticipationService.protect')) this.fail();
      const indexes = await SERVICE.DefaultDatabaseModelHandlerService.inspectIndexes(m);
      if (indexes?.versioned !== false || !indexes.indexes?.some(i => i.unique === true && !i.sparse && !i.partialFilterExpression &&
          (!i.collation || i.collation.locale === 'simple') && Object.keys(i.key || {}).length === 1 && i.key.code === 1)) this.fail();
    }
  },
  /**
   * Reads exact acknowledged evidence; private persistence authority never reaches another module
   * transport.
   * @param {Object} r Original admitted tenant/Enterprise request, preserving authData and private owner
   * context.
   * @param {string} schema Generated schema within the verified Product graph.
   * @param {string} code Exact original owner record code.
   * @returns {Promise<Object|undefined>} Detached exact acknowledged private record, or absence.
   * @remarks Effects: Scoped generated read under internal identity guard.
   * Failure behavior: Rejects malformed/ambiguous/foreign/failed evidence; authority never escapes
   * transport.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  read: async function (r, schema, code) {
    const owner = SERVICE.DefaultDigitalCommerceEntitlementService;
    const command = { tenant: r.tenant, authData: owner.serviceAuthData(r), query: { tenant: r.tenant, code },
      options: { recursive: false, skipItemCache: true }, searchOptions: { pageSize: this.settings().exactReadPageSize, pageNumber: 1 },
      ...(r.transactionContext ? { transactionContext: r.transactionContext } : {}) };
    reads.add(command);
    try {
      const result = await this.service(schema).get(command);
      owner.assertPersistence(result);
      if (!Array.isArray(result.result) || result.count !== result.result.length || result.count > 1 ||
          result.result.some(row => row.tenant !== r.tenant || row.code !== code || row.active !== true)) this.fail();
      return structuredClone(result.result[0]);
    } finally { reads.delete(command); }
  },
  /**
   * Persists insert-only or exact CAS state with readback in the same transaction.
   * @param {Object} r Original admitted tenant/Enterprise request, preserving authData and private owner
   * context.
   * @param {string} schema Generated schema within the verified Product graph.
   * @param {Object|undefined} prior Previously read original record and revision, or confirmed absence
   * for insert.
   * @param {Object} model Fixed generated model or owner-selected persistence record for this operation.
   * @returns {Promise<Object>} Verified persisted insert or exact CAS successor.
   * @remarks Effects: Writes/readbacks in existing owner transaction; no remote effects.
   * Failure behavior: Rejects conflict, failed acknowledgement or mismatched successor.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  write: async function (r, schema, prior, model) {
    const owner = SERVICE.DefaultDigitalCommerceEntitlementService;
    if (!r.transactionContext || model.tenant !== r.tenant || !Number.isSafeInteger(model.revision) ||
        model.revision !== (prior ? prior.revision + 1 : 0)) this.fail();
    const command = { tenant: r.tenant, authData: owner.serviceAuthData(r), transactionContext: r.transactionContext,
      query: { tenant: r.tenant, code: model.code, ...(prior ? { revision: prior.revision } : {}) },
      model: prior ? { ...model, active: true, updated: new Date() } : owner.persistenceModel(model),
      options: { recursive: false, ...(prior ? {} : { insertOnly: true }) } };
    if (!prior) {
      command.schemaModel = NODICS.getModels('digitalCore', r.tenant)?.[UTILS.createModelName(schema)];
      const initializer = SERVICE.DefaultModelSaveInitializerService;
      if (!command.schemaModel || typeof initializer?.applyDefaultValues !== 'function') this.fail();
      await new Promise((resolve, reject) => initializer.applyDefaultValues(command, {}, {
        nextSuccess: resolve, error: (_request, _response, error) => reject(error),
      }));
    }
    writes.set(command, { transactionContext: command.transactionContext,
      identity: structuredClone({ tenant: command.tenant, authData: command.authData, query: command.query, model: command.model }) });
    try {
      const result = await this.service(schema)[prior ? 'update' : 'save'](command);
      owner.assertPersistence(result);
      if (prior && (result.result?.acknowledged !== true || result.result.matchedCount !== 1)) this.fail();
    } finally { writes.delete(command); }
    const saved = await this.read(r, schema, model.code);
    if (!saved || Object.keys(model).some(k => !same(saved[k], model[k]))) this.fail();
    return saved;
  },
  /**
   * Uses the existing owner transaction; no provider or remote side effects execute inside it.
   * @param {Object} r Original admitted tenant/Enterprise request, preserving authData and private owner
   * context.
   * @param {function(Object):Promise<*>} work Owner-local transactional work; receives the scoped
   * transaction context and must not invoke remote effects.
   * @returns {Promise<*>} Result of supplied owner-local work in transaction scope.
   * @remarks Effects: Uses existing database transaction owner and propagates scoped transaction
   * context.
   * Failure behavior: Transaction/owner-work failure rolls back through existing provider semantics.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  transaction: async function (r, work) {
    await this.installed(r);
    return SERVICE.DefaultDatabaseTransactionService.execute({ moduleName: this.settings().transactionModuleName, tenant: r.tenant },
      transactionContext => work({ ...r, transactionContext }));
  },
  /**
   * Resolves the existing governed owner policy, validating every stored selection.
   * @param {Object} r Original admitted tenant/Enterprise request, preserving authData and private owner
   * context.
   * @param {Object} owner Canonical typed owner whose governed policy is being read.
   * @returns {Promise<Object|undefined>} Validated governed owner policy, or confirmed absence.
   * @remarks Effects: Exact private policy read; no default backfill.
   * Failure behavior: Rejects malformed selections or foreign owner.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  policy: async function (r, owner) {
    const b = SERVICE.DefaultDigitalBundleService, ownerRef = b.owner(owner);
    if (ownerRef.schema !== 'enterprise') this.fail();
    const row = await this.read(r, 'digitalBundleOwnerPolicy', 'bundle-policy:' + b.digest([r.tenant, ownerRef]));
    if (row && (row.enterpriseCode !== ownerRef.code || row.status !== 'ACTIVE' || !same(row.ownerRef, ownerRef) ||
        !Number.isSafeInteger(row.revision) || row.revision < 0 || fields.some(k => typeof row[k] !== 'boolean'))) this.fail();
    return row;
  },
  /**
   * Projects only effective switches and opaque revision; audit and start receipts remain private.
   * @param {Object} ownerRef Canonical typed Profile purchasing/selling owner reference.
   * @param {Object} row Original persisted owner record and retained evidence.
   * @returns {Object} Safe effective switches and opaque revision for typed owner.
   * @remarks Effects: Pure projection; audit/start receipts remain private.
   * Failure behavior: Invalid defaults propagate when no governed row exists.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  projection: function (ownerRef, row) {
    return { contractVersion: 1, ownerRef, revision: row?.revision ?? null,
      effective: row ? Object.fromEntries(fields.map(k => [k, row[k]])) : this.defaults() };
  },
  /**
   * Derives signed Enterprise and freshly checks Profile configuration scope, never body ownership.
   * @param {Object} r Original admitted tenant/Enterprise request, preserving authData and private owner
   * context.
   * @returns {Promise<Object>} Fresh signed Enterprise owner and actor proof.
   * @remarks Effects: Calls current Profile configuration-scope admission.
   * Failure behavior: Rejects body ownership, denied scope or changed authority.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  administrator: async function (r) {
    const auth = r.authData || {}, code = auth.enterpriseCode || auth.entCode;
    if (auth.principalType !== 'human' || r.enterpriseCode !== code) this.fail();
    const ownerRef = SERVICE.DefaultDigitalBundleService.owner({ module: 'profile', schema: 'enterprise', code });
    const authority = await SERVICE.DefaultDigitalBundleService.authorize(r, ownerRef, 'GIFT_CONFIGURE');
    return { ownerRef, actorRef: authority.actorRef };
  },
  /**
   * Reads current effective policy without creating a default business record.
   * @param {Object} r Original admitted tenant/Enterprise request, preserving authData and private owner
   * context.
   * @returns {Promise<Object>} Current effective policy and framework-owned presentation.
   * @remarks Effects: Reads original governed selection/defaults without creating a record.
   * Failure behavior: Rejects failed authority or owner read rather than inventing defaults.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  current: async function (r) {
    const authority = await this.administrator(r), row = await this.policy(r, authority.ownerRef);
    if (!same(authority, await this.administrator(r))) this.fail();
    return { ...this.projection(authority.ownerRef, row), presentation: structuredClone(this.settings().presentation) };
  },
  /**
   * Inspects only the current administrator's exact original change; absence never means a previously
   * submitted write failed.
   * @param {Object} r Original admitted tenant/Enterprise request, preserving authData and private owner
   * context.
   * @param {Object} input Operation input/selectors validated by this owner; supplied identities do not
   * grant authority.
   * @returns {Promise<Object>} APPLIED original receipt or UNCONFIRMED exact-key status.
   * @remarks Effects: Reads only current administrator's original change; absence is not failed-write
   * proof.
   * Failure behavior: Rejects foreign actor/key or contradictory command evidence.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  status: async function (r, input) {
    if (!input || Object.keys(input).join(',') !== 'idempotencyKey' || typeof input.idempotencyKey !== 'string' ||
        !input.idempotencyKey.trim() || input.idempotencyKey.length > this.settings().maximumCommandKeyLength) this.fail();
    const authority = await this.administrator(r), b = SERVICE.DefaultDigitalBundleService;
    const code = 'participation:' + b.digest([r.tenant, authority, 'SETTINGS', input.idempotencyKey]);
    const row = await this.read(r, 'digitalParticipationCommand', code);
    if (row && (row.status !== 'COMPLETED' || row.evidence.kind !== 'SETTINGS' ||
        !same(row.evidence.ownerRef, authority.ownerRef) || !same(row.evidence.actorRef, authority.actorRef))) this.fail();
    if (!same(authority, await this.administrator(r))) this.fail();
    return { contractVersion: 1, ownerRef: authority.ownerRef, status: row ? 'APPLIED' : 'UNCONFIRMED',
      ...(row ? { receipt: row.evidence.result } : {}) };
  },
  /**
   * Proves a unit belongs to the retained whole-checkout admission before Promotion starts an
   * allocation.
   * @param {Object} r Original admitted tenant/Enterprise request, preserving authData and private owner
   * context.
   * @returns {Promise<void>} Completes when original unit is covered by retained whole-checkout
   * admission.
   * @remarks Effects: Reads exact original admission; does not start another allocation.
   * Failure behavior: Rejects foreign/missing unit or changed checkout binding.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  couponUnit: async function (r) {
    const acquisition = SERVICE.DefaultDigitalCommerceCouponAcquisitionService, owner = acquisition.typedOwner(r.ownerRef);
    if (owner.type !== 'ENTERPRISE') return;
    await acquisition.authorize(r);
    const b = SERVICE.DefaultDigitalBundleService, ownerRef = b.owner({ module: 'profile', schema: 'enterprise', code: owner.code });
    const marker = ':digital:' + r.payload.entryCode + ':', split = r.idempotencyKey.lastIndexOf(marker);
    if (split < 1 || !/^\d+$/.test(r.idempotencyKey.slice(split + marker.length))) this.fail();
    const key = r.idempotencyKey.slice(0, split), index = Number(r.idempotencyKey.slice(split + marker.length));
    const code = 'participation:' + b.digest([r.tenant, ownerRef, 'COUPON', key]);
    const row = await this.read(r, 'digitalParticipationCommand', code), proof = row?.evidence, i = proof?.identity;
    const actor = (await b.authorize(r, ownerRef, 'BUNDLE_BUY')).actorRef;
    if (!row || row.status !== 'ADMITTED' || proof.kind !== 'COUPON' || !same(proof.ownerRef, ownerRef) || !same(proof.actorRef, actor) ||
        i?.merchantEnterpriseCode !== r.enterpriseCode || i.ownerId !== r.ownerId || i.orderCode !== r.payload.orderCode ||
        i.cartCode !== r.payload.cartCode || i.storeCode !== r.storeCode ||
        !i.units.some(u => u.entryCode === r.payload.entryCode && u.unitIndex === index && u.productCode === r.payload.productCode &&
          u.sku === r.payload.sku && u.promotionCode === r.payload.promotionCode && u.couponBatchCode === r.payload.batchCode) ||
        !same((i.selections[r.payload.entryCode]?.[index] || []).slice().sort(), (r.payload.certificateCodes || []).slice().sort())) this.fail();
  },
  /**
   * Validates exact audited independent selections; no caller-selected owner, permission or default.
   * @param {Object} input Operation input/selectors validated by this owner; supplied identities do not
   * grant authority.
   * @returns {Object} Validated exact audited selection, expected revision, key and reason.
   * @remarks Effects: Pure input validation; no caller-defined defaults or owner selectors.
   * Failure behavior: Rejects extra fields, malformed selections, absent audit reason or invalid
   * revision/key.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  command: function (input) {
    const p = this.settings();
    if (!input || Object.keys(input).some(k => ![...fields, 'expectedRevision', 'idempotencyKey', 'reason'].includes(k)) ||
        fields.some(k => typeof input[k] !== 'boolean') ||
        !(input.expectedRevision === null || Number.isSafeInteger(input.expectedRevision) && input.expectedRevision >= 0) ||
        typeof input.idempotencyKey !== 'string' || !input.idempotencyKey.trim() || input.idempotencyKey.length > p.maximumCommandKeyLength ||
        typeof input.reason !== 'string' || !input.reason.trim() || input.reason.length > p.maximumReasonLength) this.fail();
    return { ...Object.fromEntries(fields.map(k => [k, input[k]])), expectedRevision: input.expectedRevision,
      idempotencyKey: input.idempotencyKey, reason: input.reason };
  },
  /**
   * Atomically retains audited change and revision fence. Exact key replay never reapplies old values.
   * @param {Object} r Original admitted tenant/Enterprise request, preserving authData and private owner
   * context.
   * @param {Object} input Operation input/selectors validated by this owner; supplied identities do not
   * grant authority.
   * @returns {Promise<Object>} Original confirmed policy-change receipt.
   * @remarks Effects: Atomically retains audited command and policy revision; exact replay never
   * reapplies old values.
   * Failure behavior: Rejects stale revision, reused key with changed command or uncertain transaction.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  configure: async function (r, input) {
    const command = this.command(input), authority = await this.administrator(r), b = SERVICE.DefaultDigitalBundleService;
    const code = 'participation:' + b.digest([r.tenant, authority, 'SETTINGS', command.idempotencyKey]);
    const digest = b.digest(command);
    const result = await this.transaction(r, async scoped => {
      const original = await this.read(scoped, 'digitalParticipationCommand', code);
      if (original) {
        if (original.commandDigest !== digest) this.fail();
        return original.evidence.result;
      }
      const prior = await this.policy(scoped, authority.ownerRef);
      if ((prior?.revision ?? null) !== command.expectedRevision) this.fail();
      const model = { tenant: r.tenant, enterpriseCode: authority.ownerRef.code,
        code: 'bundle-policy:' + b.digest([r.tenant, authority.ownerRef]), status: 'ACTIVE', revision: (prior?.revision ?? -1) + 1,
        correlationId: r.correlationId || code, ownerRef: authority.ownerRef,
        ...Object.fromEntries(fields.map(k => [k, command[k]])) };
      const saved = await this.write(scoped, 'digitalBundleOwnerPolicy', prior, model);
      const receipt = { ...this.projection(authority.ownerRef, saved), commandCode: code };
      await this.write(scoped, 'digitalParticipationCommand', undefined, { tenant: r.tenant, enterpriseCode: authority.ownerRef.code,
        code, revision: 0, status: 'COMPLETED', correlationId: r.correlationId || code, commandDigest: digest,
        evidence: { kind: 'SETTINGS', ...authority, reason: command.reason, before: this.projection(authority.ownerRef, prior),
          at: new Date().toISOString(), result: receipt } });
      return receipt;
    });
    if (!same(authority, await this.administrator(r))) this.fail();
    return result;
  },
  /**
   * Records a new gift or coupon start while touching the same policy revision as settings changes.
   * Original admission is immutable.
   * @param {Object} r Original admitted tenant/Enterprise request, preserving authData and private owner
   * context.
   * @param {Object} input Operation input/selectors validated by this owner; supplied identities do not
   * grant authority.
   * @returns {Promise<void>} Completes after original new-start admission is durably retained.
   * @remarks Effects: Touches same governed policy revision as settings changes and retains immutable
   * gift/coupon start.
   * Failure behavior: Rejects disabled new start, stale policy or conflicting original admission; prior
   * starts remain recoverable.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  admit: async function (r, input) {
    const b = SERVICE.DefaultDigitalBundleService, ownerRef = b.owner(input.ownerRef);
    if (!['GIFT', 'COUPON'].includes(input.kind) || typeof input.key !== 'string' || !input.key || !input.identity) this.fail();
    const authority = await b.authorize(r, ownerRef, input.kind === 'GIFT' ? 'GIFT_SEND' : 'BUNDLE_BUY');
    const recipient = input.kind === 'GIFT' ? b.owner(input.recipientRef) : undefined;
    const policies = [ownerRef.schema === 'enterprise' ? { ownerRef, field: input.kind === 'GIFT' ? 'giftingEnabled' : 'couponPurchasingEnabled' } : null,
      recipient?.schema === 'enterprise' ? { ownerRef: recipient, field: 'receivingEnabled' } : null].filter(Boolean);
    if (!policies.length) return;
    const identity = { kind: input.kind, ownerRef, ...(recipient ? { recipientRef: recipient } : {}), actorRef: authority.actorRef, identity: input.identity };
    const code = 'participation:' + b.digest([r.tenant, ownerRef, input.kind, input.key]), digest = b.digest(identity);
    await this.transaction(r, async scoped => {
      const original = await this.read(scoped, 'digitalParticipationCommand', code);
      if (original) {
        if (original.commandDigest !== digest || original.status !== 'ADMITTED') this.fail();
        return;
      }
      for (const selection of policies.sort((a, z) => a.ownerRef.code.localeCompare(z.ownerRef.code))) {
        const prior = await this.policy(scoped, selection.ownerRef), effective = this.projection(selection.ownerRef, prior).effective;
        if (effective[selection.field] !== true) throw new Error('New Enterprise participation is disabled');
        await this.write(scoped, 'digitalBundleOwnerPolicy', prior, { tenant: r.tenant, enterpriseCode: selection.ownerRef.code,
          code: 'bundle-policy:' + b.digest([r.tenant, selection.ownerRef]), status: 'ACTIVE', revision: (prior?.revision ?? -1) + 1,
          correlationId: r.correlationId || code, ownerRef: selection.ownerRef, ...effective });
      }
      await this.write(scoped, 'digitalParticipationCommand', undefined, { tenant: r.tenant, enterpriseCode: r.enterpriseCode,
        code, revision: 0, status: 'ADMITTED', correlationId: r.correlationId || code, commandDigest: digest,
        evidence: { ...identity, at: new Date().toISOString() } });
    });
    if (!same(authority, await b.authorize(r, ownerRef, input.kind === 'GIFT' ? 'GIFT_SEND' : 'BUNDLE_BUY'))) this.fail();
  },
};
