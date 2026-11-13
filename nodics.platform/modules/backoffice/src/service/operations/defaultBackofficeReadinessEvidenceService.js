/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module backoffice/service/operations/DefaultBackofficeReadinessEvidenceService
 * @description Persists bounded readiness observations and risk acknowledgements through the owning generated services.
 * @layer service
 * @owner backoffice
 * @override Replace persistence only through generated owner services while preserving actor, tenant, deployment and build bindings.
 */
const crypto = require('node:crypto');
module.exports = {
  _acknowledgements: new WeakMap(),
  init: function () { return Promise.resolve(true); },
  postInit: function () { return Promise.resolve(true); },
  /** Reads complete Framework defaults; malformed overrides never become implicit defaults. */
  getConfiguration: function () {
    const policy = ((CONFIG.get('backofficeRegistry') || {}).operations || {}).evidence || {};
    const bounds = { snapshotRetentionMs: 31536000000, acknowledgementValidityMs: 2592000000, maximumAcknowledgements: 4096, snapshotBlockerLimit: 4096, timelineLimit: 100 };
    for (const key of Object.keys(bounds)) {
      if (!Number.isSafeInteger(policy[key]) || policy[key] < 1 || policy[key] > bounds[key]) throw new Error('READINESS_EVIDENCE_POLICY_INVALID');
    }
    return policy;
  },
  /** Returns only bounded owner copy for the explicitly opened workspace inspector. */
  presentation: function () {
    const source = this.getConfiguration().presentation;
    const keys = ['openLabel','title','description','refreshLabel','closeLabel','loadingMessage','errorMessage',
      'checkedAtLabel','receiptLabel','buildLabel','stateLabel','nextActionLabel','historicalMessage'];
    if (!source || keys.some(key => typeof source[key] !== 'string' || !source[key].trim() || source[key].length > 1024))
      throw new Error('READINESS_EVIDENCE_PRESENTATION_INVALID');
    return Object.fromEntries(keys.map(key => [key, source[key]]));
  },
  /** Hashes stable non-secret identity projections; no credential value is persisted. */
  hash: function (value) { return crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex'); },
  /** Resolves the running build once validated by the existing generation owner. */
  buildIdentity: function () {
    const identity = SERVICE.DefaultInfraService && SERVICE.DefaultInfraService.getValidatedBuildIdentity();
    if (!identity || !/^[a-f0-9]{64}$/.test(identity.inputDigest || '')) throw new Error('READINESS_BUILD_IDENTITY_UNAVAILABLE');
    return { contractVersion: identity.contractVersion, inputDigest: identity.inputDigest,
      project: identity.project, environment: identity.environment, server: identity.server };
  },
  /** Binds retained evidence to authenticated authority and the selected deployment. */
  scope: function (request, actorBound) {
    const auth = request && request.authData || {};
    const principal = auth.principalId || auth.loginId || auth.userId || auth.code;
    const tenant = request && request.tenant;
    if (!principal || !tenant || auth.principalType === 'service' || auth.isSystem === true) throw new Error('READINESS_HUMAN_CONTEXT_REQUIRED');
    const identity = this.buildIdentity();
    const binding = [tenant, identity.project, identity.environment, identity.server];
    if (actorBound) binding.push(principal, auth.userGroups || [], auth.permissions || [],
      auth.scope || auth.scopes || {}, auth.enterprise || auth.enterpriseCode || '', auth.securityStamp || '');
    return { tenant, principal: String(principal), key: this.hash(binding), buildIdentity: identity };
  },
  /** Constrains internal persistence to an already admitted, owner-created observation. */
  persistenceRequest: function (scope) {
    const identity = SERVICE.DefaultIdentityGovernanceService;
    if (!identity || typeof identity.getSystemAuthData !== 'function') throw new Error('READINESS_PERSISTENCE_AUTHORITY_UNAVAILABLE');
    return { tenant: scope.tenant, authData: identity.getSystemAuthData(), options: { recursive: false, skipItemCache: true } };
  },
  /** Resolves only the existing generated persistence service for this evidence kind. */
  store: function (name) {
    const owner = SERVICE[name];
    if (!owner || typeof owner.get !== 'function' || typeof owner.save !== 'function') throw new Error('READINESS_PERSISTENCE_UNAVAILABLE');
    return owner;
  },
  /** Reads generated-service rows without accepting malformed provider acknowledgements. */
  rows: function (response) {
    if (!response || !Array.isArray(response.result)) throw new Error('READINESS_PERSISTENCE_RESPONSE_INVALID');
    return response.result;
  },
  /** Generates a binding from the active warning contract, never from a secret value. */
  findingIdentity: function (scope, finding) {
    return this.hash([scope.key, scope.buildIdentity.inputDigest, finding.code, finding.propertyPath || '',
      finding.owner, finding.ownerType, finding.severity, finding.message, finding.action]);
  },
  /** Rehydrates bounded active acknowledgements into this request only. */
  loadAcknowledgements: async function (request) {
    this._acknowledgements.delete(request);
    const scope = this.scope(request, false), policy = this.getConfiguration();
    const response = await this.store('DefaultBackofficeStartupAcknowledgementService').get({
      ...this.persistenceRequest(scope), query: { scopeKey: scope.key, expiresAt: { $gt: new Date() } },
      searchOptions: { limit: policy.maximumAcknowledgements, sort: { acknowledgedAt: -1 } }
    });
    this._acknowledgements.set(request, { scope, rows: this.rows(response) });
    return true;
  },
  /** Returns only current, same-rule acknowledgement evidence; it never suppresses a finding. */
  findAcknowledgement: function (request, finding) {
    const observation = request && this._acknowledgements.get(request);
    if (!observation) return undefined;
    const identity = this.findingIdentity(observation.scope, finding);
    const row = observation.rows.find(item => item.findingIdentity === identity && new Date(item.expiresAt).getTime() > Date.now());
    return row ? { acknowledged: true, acknowledgedAt: new Date(row.acknowledgedAt).toISOString(),
      acknowledgedBy: row.acknowledgedBy, reasonCode: row.reasonCode, evidenceCode: row.code,
      expiresAt: new Date(row.expiresAt).toISOString() } : undefined;
  },
  /** Persists an immutable acknowledgement before reporting it, then verifies its readback. */
  acknowledge: async function (request, finding, record) {
    const scope = this.scope(request, false), policy = this.getConfiguration();
    const store = this.store('DefaultBackofficeStartupAcknowledgementService');
    const model = { code: 'startupAcknowledgement:' + crypto.randomUUID(), scopeKey: scope.key,
      findingCode: finding.code, findingIdentity: this.findingIdentity(scope, finding),
      propertyPath: finding.propertyPath, acknowledgedAt: record.acknowledgedAt, acknowledgedBy: scope.principal,
      reasonCode: record.reasonCode, reason: record.reason,
      expiresAt: new Date(Date.now() + policy.acknowledgementValidityMs).toISOString(), buildIdentity: scope.buildIdentity };
    await store.save({ ...this.persistenceRequest(scope), model });
    const read = this.rows(await store.get({ ...this.persistenceRequest(scope), query: { code: model.code, scopeKey: scope.key }, searchOptions: { limit: 1 } }))[0];
    if (!read || read.findingIdentity !== model.findingIdentity || read.acknowledgedBy !== model.acknowledgedBy || read.reasonCode !== model.reasonCode || read.reason !== model.reason || new Date(read.expiresAt).getTime() !== new Date(model.expiresAt).getTime()) throw new Error('READINESS_ACKNOWLEDGEMENT_UNCONFIRMED');
    await this.loadAcknowledgements(request);
    return { ...record, evidenceCode: model.code, expiresAt: model.expiresAt, buildIdentity: scope.buildIdentity };
  },
  /** Stores the current compact observation and returns a same-authority predecessor. */
  recordSnapshot: async function (request, snapshot) {
    const scope = this.scope(request, true), policy = this.getConfiguration();
    const store = this.store('DefaultBackofficeReadinessSnapshotService'), persistence = this.persistenceRequest(scope);
    const history = this.rows(await store.get({ ...persistence,
      query: { scopeKey: scope.key, expiresAt: { $gt: new Date() } }, searchOptions: { limit: policy.timelineLimit, sort: { observedAt: -1 } } }));
    const previous = history[0];
    const code = 'readinessSnapshot:' + crypto.randomUUID();
    const stored = { ...snapshot, evidenceCode: code, buildIdentity: scope.buildIdentity };
    await store.save({ ...persistence, model: { code, scopeKey: scope.key, observedAt: snapshot.checkedAt,
      expiresAt: new Date(Date.now() + policy.snapshotRetentionMs).toISOString(), snapshot: stored } });
    const persisted = this.rows(await store.get({ ...persistence, query: { code, scopeKey: scope.key }, searchOptions: { limit: 1 } }))[0];
    if (!persisted || this.hash(persisted.snapshot) !== this.hash(stored)) throw new Error('READINESS_SNAPSHOT_UNCONFIRMED');
    return { ...stored, durable: true, history: history.map(row => ({ evidenceCode: row.code, checkedAt: row.snapshot.checkedAt, state: row.snapshot.state, blockerCount: row.snapshot.blockerCount, historical: true })), previousSnapshot: previous ? {
      evidenceCode: previous.code, checkedAt: previous.snapshot.checkedAt, state: previous.snapshot.state,
      blockerCount: previous.snapshot.blockerCount, buildIdentity: previous.snapshot.buildIdentity,
      historical: true
    } : undefined };
  }
};
