/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module backoffice/test/backofficeReadinessEvidence @description Restart, isolation and failed-persistence evidence contracts. @layer test @owner backoffice */
const assert = require('node:assert/strict');
const { test, after } = require('node:test');
const template = require('../src/service/operations/defaultBackofficeReadinessEvidenceService');
const operational = require('../src/service/operations/defaultBackofficeOperationalReadinessService');
const defaults = require('../config/properties');
const prior = { CONFIG: global.CONFIG, SERVICE: global.SERVICE, NODICS: global.NODICS, CLASSES: global.CLASSES };
after(() => { for (const [key, value] of Object.entries(prior)) { if (value === undefined) delete global[key]; else global[key] = value; } });
function setup() {
  const records = { acknowledgements: [], snapshots: [] }, writes = [];
  const identity = { contractVersion: 1, inputDigest: 'a'.repeat(64), project: 'test-project', environment: 'local-test', server: 'platform-test' };
  const store = (name) => ({
    get: async request => {
      assert.equal(request.authData.isSystem, true);
      let rows = records[name].filter(row => row.tenant === request.tenant && Object.entries(request.query).every(([key, value]) =>
        value && value.$gt ? new Date(row[key]) > value.$gt : row[key] === value));
      const sort = request.searchOptions?.sort;
      if (sort) { const field = Object.keys(sort)[0]; rows.sort((a, b) => new Date(b[field]) - new Date(a[field])); }
      return { result: structuredClone(rows.slice(0, request.searchOptions?.limit || rows.length)) };
    },
    save: async request => { writes.push(name); records[name].push({ ...structuredClone(request.model), tenant: request.tenant }); return { result: request.model }; }
  });
  const ackStore = store('acknowledgements'), snapshotStore = store('snapshots');
  global.CONFIG = { get: key => key === 'backofficeRegistry' ? defaults.backofficeRegistry :
    key === 'bootstrapIdentity' ? { source: 'private', adminPassword: 'local-never-persist-this-secret' } :
    key === 'defaultAuthDetail' ? { apiKey: 'secret-not-a-local-default' } : undefined };
  global.CLASSES = { NodicsError: class extends Error { constructor(code, message) { super(message); this.code = code; } } };
  const fresh = () => Object.assign(Object.create(template), { _acknowledgements: new WeakMap() });
  global.SERVICE = { DefaultInfraService: { getValidatedBuildIdentity: () => ({ ...identity }) },
    DefaultIdentityGovernanceService: { getSystemAuthData: () => ({ isSystem: true }) },
    DefaultBackofficeStartupAcknowledgementService: ackStore, DefaultBackofficeReadinessSnapshotService: snapshotStore,
    DefaultBackofficeReadinessEvidenceService: fresh(), DefaultBackofficeAuditService: { record: async () => true } };
  const request = { tenant: 'tenant-a', authData: { loginId: 'operator-a', principalType: 'human', userGroups: ['adminGroup'], permissions: ['view'] } };
  const finding = { code: 'LOCAL_SAMPLE_ADMIN_PASSWORD', propertyPath: 'bootstrapIdentity.adminPassword', owner: 'nAuth', ownerType: 'AUTHENTICATION', severity: 'WARNING',
    message: 'A local or sample bootstrap admin password is active.', action: 'Rotate the bootstrap admin password through the owning server or external private configuration before non-local use.' };
  const record = { acknowledged: true, acknowledgedAt: new Date().toISOString(), reasonCode: 'LOCAL_TEST', reason: 'Reviewed for this local acceptance run.' };
  return { records, writes, identity, request, finding, record, fresh, ackStore, snapshotStore, owner: SERVICE.DefaultBackofficeReadinessEvidenceService };
}
test('acknowledgement confirms persistence and survives a new service instance without suppressing the warning', async () => {
  const f = setup();
  const saved = await f.owner.acknowledge(f.request, f.finding, f.record);
  assert(saved.evidenceCode); assert.equal(f.records.acknowledgements.length, 1);
  SERVICE.DefaultBackofficeReadinessEvidenceService = f.fresh();
  const request = structuredClone(f.request);
  await SERVICE.DefaultBackofficeReadinessEvidenceService.loadAcknowledgements(request);
  const actual = SERVICE.DefaultBackofficeReadinessEvidenceService.findAcknowledgement(request, f.finding);
  assert.equal(actual.evidenceCode, saved.evidenceCode); assert.equal(actual.acknowledgedBy, 'operator-a');
  const report = operational.startupValidationReport(request);
  assert.equal(report.state, 'NEEDS_ATTENTION'); assert.equal(report.summary.acknowledged, 1);
  assert(!JSON.stringify(f.records).includes('local-never-persist-this-secret'));
});
test('tenant, deployment, changed source, changed rule and expiry invalidate current acknowledgement', async () => {
  const f = setup(); await f.owner.acknowledge(f.request, f.finding, f.record);
  const foreign = { ...f.request, tenant: 'tenant-b' }; await f.owner.loadAcknowledgements(foreign);
  assert.equal(f.owner.findAcknowledgement(foreign, f.finding), undefined);
  f.identity.server = 'another-server'; await f.owner.loadAcknowledgements(f.request);
  assert.equal(f.owner.findAcknowledgement(f.request, f.finding), undefined);
  f.identity.server = 'platform-test'; f.identity.inputDigest = 'b'.repeat(64); await f.owner.loadAcknowledgements(f.request);
  assert.equal(f.owner.findAcknowledgement(f.request, f.finding), undefined);
  f.identity.inputDigest = 'a'.repeat(64); await f.owner.loadAcknowledgements(f.request);
  assert.equal(f.owner.findAcknowledgement(f.request, { ...f.finding, action: 'Changed policy' }), undefined);
  f.records.acknowledgements[0].expiresAt = new Date(0).toISOString(); await f.owner.loadAcknowledgements(f.request);
  assert.equal(f.owner.findAcknowledgement(f.request, f.finding), undefined);
});
test('persistence failure or missing readback never acknowledges success', async () => {
  const f = setup(); f.ackStore.save = async () => { throw Error('provider unavailable'); };
  await assert.rejects(f.owner.acknowledge(f.request, f.finding, f.record), /provider unavailable/);
  assert.equal(f.owner.findAcknowledgement(f.request, f.finding), undefined);
  f.ackStore.save = async () => ({ result: {} });
  await assert.rejects(f.owner.acknowledge(f.request, f.finding, f.record), /UNCONFIRMED/);
  delete SERVICE.DefaultBackofficeStartupAcknowledgementService;
  const report = await operational.startupValidationWithEvidence(f.request);
  assert.equal(report.state, 'NOT_READY'); assert(report.findings.some(x => x.code === 'READINESS_ACKNOWLEDGEMENTS_UNAVAILABLE'));
});
test('snapshots retain the previous receipt across restart, but never cross actor, grant or tenant scope', async () => {
  const f = setup(), snapshot = { checkedAt: new Date().toISOString(), state: 'NEEDS_ATTENTION', blockerCount: 1, blockers: [{ code: 'REQUIRED_RELEASE' }] };
  const first = await f.owner.recordSnapshot(f.request, snapshot);
  const afterRestart = await f.fresh().recordSnapshot(structuredClone(f.request), { ...snapshot, checkedAt: new Date(Date.now() + 1).toISOString() });
  assert.equal(afterRestart.durable, true); assert.equal(afterRestart.previousSnapshot.evidenceCode, first.evidenceCode);
  assert.equal(afterRestart.previousSnapshot.historical, true);
  for (const request of [ { ...f.request, tenant: 'tenant-b' },
    { ...f.request, authData: { ...f.request.authData, loginId: 'operator-b' } },
    { ...f.request, authData: { ...f.request.authData, permissions: ['different-permission'] } } ]) {
    assert.equal((await f.owner.recordSnapshot(request, snapshot)).previousSnapshot, undefined);
  }
});
test('missing build proof, anonymous/service callers and malformed configuration fail before persistence', async () => {
  const f = setup(), snapshot = { checkedAt: new Date().toISOString() };
  for (const request of [{}, { tenant: 'tenant-a', authData: { loginId: 'machine', principalType: 'service' } }]) {
    await assert.rejects(f.owner.recordSnapshot(request, snapshot), /CONTEXT_REQUIRED/);
  }
  f.identity.inputDigest = undefined; await assert.rejects(f.owner.recordSnapshot(f.request, snapshot), /BUILD_IDENTITY_UNAVAILABLE/);
  assert.equal(f.writes.length, 0);
  f.identity.inputDigest = 'a'.repeat(64); const before = defaults.backofficeRegistry.operations.evidence.snapshotRetentionMs;
  defaults.backofficeRegistry.operations.evidence.snapshotRetentionMs = 0;
  try { await assert.rejects(f.owner.recordSnapshot(f.request, snapshot), /POLICY_INVALID/); } finally { defaults.backofficeRegistry.operations.evidence.snapshotRetentionMs = before; }
});
test('generated evidence schemas expose no generic CRUD routes and retain owner policy', () => {
  const schemas = require('../src/schemas/schemas').backoffice;
  for (const name of ['backofficeReadinessSnapshot', 'backofficeStartupAcknowledgement']) {
    assert.equal(schemas[name].router.enabled, false); assert.equal(schemas[name].service.enabled, true);
    assert.deepEqual(schemas[name].schemaPolicies, ['administrator']);
  }
});

test('presentation rejects malformed overrides and never projects undeclared values', () => {
  const f = setup(), copy = defaults.backofficeRegistry.operations.evidence.presentation;
  const old = copy.title; copy.secret = 'never-project';
  try { assert.equal(f.owner.presentation().secret, undefined); copy.title = ''; assert.throws(() => f.owner.presentation(), /PRESENTATION_INVALID/); }
  finally { copy.title = old; delete copy.secret; }
});
test('audit failure after durable acknowledgement is explicitly uncertain and remains inspectable without replay', async () => {
  const f = setup();
  SERVICE.DefaultBackofficeAuditService.record = async () => { throw Error('audit unavailable'); };
  const req = { ...f.request, startupFindingAcknowledgement: { code: f.finding.code, propertyPath: f.finding.propertyPath, reason: f.record.reason, reasonCode: f.record.reasonCode } };
  await assert.rejects(operational.acknowledgeFinding(req), err => err.code === 'ERR_BOF_00100');
  assert.equal(f.records.acknowledgements.length, 1);
  assert(f.owner.findAcknowledgement(req, f.finding).evidenceCode);
});
test('corrupted persisted snapshot cannot certify a durable observation', async () => {
  const f = setup(); const get = f.snapshotStore.get;
  f.snapshotStore.get = async req => { const result = await get(req); if (req.query.code && result.result[0]) result.result[0].snapshot.state = 'OTHER'; return result; };
  await assert.rejects(f.owner.recordSnapshot(f.request, { checkedAt: new Date().toISOString(), state: 'READY' }), /SNAPSHOT_UNCONFIRMED/);
});
