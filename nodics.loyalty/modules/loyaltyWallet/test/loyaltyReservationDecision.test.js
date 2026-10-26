/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
'use strict';
const test = require('node:test'), assert = require('node:assert/strict');
const { isDeepStrictEqual: same } = require('node:util');
const operations = require('../src/service/defaultLoyaltyRewardOperationService');
const decisions = require('../src/service/defaultLoyaltyReservationDecisionService');
const transaction = require('../src/service/defaultLoyaltyTransactionService');
const clone = structuredClone;

/** Actual owner services with isolated generated storage and optimistic atomic commit/rollback. */
function fixture(available = '49.00') {
  require('./helpers/runtimeEnums')();
  global.UTILS = { createModelName: name => name + 'Model' };
  const loyalty = { ...require('../../loyaltyCore/config/properties').loyalty,
    ...require('../../loyaltyReservation/config/properties').loyalty,
    transactions: { enabled: true, moduleName: 'loyaltyWallet' } };
  const grant = { tenant: 't', serviceId: 'commerce', entCode: 'platform', projectCode: 'project',
    environmentCode: 'Test', serverCode: 'commerce', instanceCode: 'instance', assignmentCode: 'assignment' };
  loyalty.reservationDecisions = { callers: [grant], maximumLedgerEntries: 10000 };
  global.CONFIG = { get: key => key === 'loyalty' ? loyalty : key === 'databaseTransactions'
    ? { enabled: true, failClosed: true, maximumCommitTimeMs: 1000 } : undefined };
  const request = { tenant: 't', authData: { tenant: 't', principalType: 'service', tokenType: 'service',
    serviceId: grant.serviceId, entCode: grant.entCode, runtimeScope: grant, runtimeInstanceId: grant.instanceCode,
    modules: ['loyaltyApi'], permissions: ['loyalty.rewards.reserve', 'loyalty.rewards.release', 'loyalty.wallet.read'] }, walletCode: 'wallet',
    reservationDecisionContract: 'LOYALTY_RESERVATION_DECISION_V1',
    programCode: 'program', rewardTypeCode: 'points', amount: '50.00', sourceType: 'PAYMENT', sourceCode: 'order',
    targetType: 'ORDER', targetCode: 'order', idempotencyKey: 'original:payment', correlationId: 'original' };
  const genesis = { code: 'genesis', walletCode: 'wallet', programCode: 'program', rewardTypeCode: 'points',
    entryType: 'EARN', amount: available };
  let db = { Balance: [{ ...operations.initialBalance(request), available, earned: available, revision: 1 }],
    Ledger: [genesis], Reservation: [], Decision: [], Redemption: [] };
  let version = 0, loseCommit = false, failWrite, corruptRead = false;
  const database = {}, models = {};
  for (const [moduleName, schema] of [['loyaltyReservation', 'rewardReservationDecision'], ['loyaltyReservation', 'rewardReservation'],
    ['loyaltyWallet', 'loyaltyWalletRewardBalance'], ['loyaltyLedger', 'rewardLedgerEntry']]) {
    models[moduleName] ||= {};
    models[moduleName][schema + 'Model'] = { dataBase: database, versioned: false, compareAndSetItem() {},
      rawSchema: { transaction: { enabled: true, sideEffects: 'none' }, cache: { enabled: false }, event: { enabled: false } } };
  }
  global.NODICS = { getModels: moduleName => models[moduleName], getSelectedEnvironmentName: () => 'Test' };
  global.SERVICE = { DefaultLoyaltyAmountService: require('../../loyaltyCore/src/service/defaultLoyaltyAmountService'),
    DefaultLoyaltyRewardOperationService: operations, DefaultLoyaltyReservationDecisionService: decisions,
    DefaultLoyaltyTransactionService: transaction,
    DefaultServiceTokenService: require('../../../../nodics.foundation/modules/nAuth/src/service/identity/defaultServiceTokenService'),
    DefaultDatabaseModelHandlerService: { inspectIndexes: async () => ({ versioned: false, indexes: [{ unique: true, key: { code: 1 } }] }) },
    DefaultDatabaseTransactionService: {
      capabilities: () => ({ multiRecordAtomic: true, contextPropagation: true }), resolve: () => ({ database }),
      execute: async (_scope, work) => {
        const base = version, token = { db: clone(db), dirty: false };
        const result = await work(token);
        if (token.dirty) {
          if (base !== version) throw Error('write conflict');
          db = token.db; version++;
          if (loseCommit) { loseCommit = false; throw Error('commit acknowledgement lost'); }
        }
        return result;
      }
    }
  };
  for (const [suffix, table] of [['LoyaltyWalletRewardBalance', 'Balance'], ['RewardLedgerEntry', 'Ledger'],
    ['RewardReservation', 'Reservation'], ['RewardReservationDecision', 'Decision'], ['RewardRedemption', 'Redemption']]) {
    const rows = r => r.transactionContext?.db[table] || db[table];
    const matches = (row, q) => Object.entries(q || {}).every(([k,v]) => same(row[k], v));
    SERVICE['Default' + suffix + 'Service'] = {
      get: async r => { const result = clone(rows(r).filter(row => matches(row, r.query)));
        return { code: 'SUC_READ', count: corruptRead ? undefined : result.length, result }; },
      save: async r => {
        assert.ok(r.transactionContext, 'every accounting/decision write uses the canonical transaction token');
        if (table === failWrite) throw Error('write failed');
        if (rows(r).some(row => row.code === r.model.code)) throw Error('duplicate code');
        if (table === 'Decision') assert.equal(r.options.insertOnly, true);
        rows(r).push(clone(r.model)); r.transactionContext.dirty = true;
        return { code: 'SUC_SAVE', result: clone(r.model) };
      },
      update: async r => {
        assert.ok(r.transactionContext);
        const row = rows(r).find(row => matches(row, r.query));
        if (!row) throw Error('CAS conflict');
        Object.assign(row, clone(r.model)); r.transactionContext.dirty = true;
        return { code: 'SUC_UPDATE', result: clone(row) };
      }
    };
  }
  return { request, get db() { return db; }, genesis, models, loyalty,
    loseCommit: () => { loseCommit = true; }, failWrite: name => { failWrite = name; },
    corruptRead: () => { corruptRead = true; } };
}

test('49 < 50 commits durable denial without ledger/balance effects and replay remains denied after funding changes', async () => {
  const f = fixture();
  const first = await operations.reserve(f.request);
  assert.equal(first.decision.status, 'DENIED');
  assert.equal(first.decision.noEffects, true);
  assert.equal(f.db.Balance[0].available, '49.00'); assert.deepEqual(f.db.Ledger, [f.genesis]); assert.deepEqual(f.db.Reservation, []);
  f.db.Balance[0].available = '100.00';
  assert.deepEqual(await operations.reserve(f.request), first); assert.equal(f.db.Decision.length, 1);
  await assert.rejects(operations.reserve({ ...f.request, amount: '51.00' }));
});
test('held pre-adoption original key cancels with no wallet/amount and fences delayed authorization', async () => {
  const f = fixture();
  const { walletCode, amount, programCode, rewardTypeCode, ...key } = f.request;
  const cancelled = await decisions.cancel(key);
  assert.equal(cancelled.status, 'CANCELLED');
  assert.equal(cancelled.noEffects, false, 'fencing does not prove historical atomicity or explain prior balance writes');
  assert.deepEqual(await decisions.inspect(key), cancelled);
  assert.deepEqual(await decisions.cancel(key), cancelled);
  f.db.Balance[0].available = '100.00';
  assert.deepEqual((await operations.reserve(f.request)).decision, cancelled);
  assert.equal(f.db.Balance[0].available, '100.00'); assert.deepEqual(f.db.Ledger, [f.genesis]);
});
test('lost denial commit acknowledgement is safely reconciled by original-key inspection', async () => {
  const f = fixture(); f.loseCommit();
  await assert.rejects(operations.reserve(f.request), /acknowledgement/);
  assert.equal((await decisions.inspect(f.request)).status, 'DENIED');
  assert.equal(f.db.Balance[0].available, '49.00');
});
test('lost cancellation acknowledgement can only replay the original fence', async () => {
  const f = fixture(); f.loseCommit();
  await assert.rejects(decisions.cancel(f.request), /acknowledgement/);
  assert.equal((await decisions.cancel(f.request)).status, 'CANCELLED'); assert.equal(f.db.Decision.length, 1);
});
test('atomic rollback removes accounting when durable authorization decision write fails', async () => {
  const f = fixture('119.00'); f.failWrite('Decision');
  await assert.rejects(operations.reserve(f.request), /write failed/);
  assert.equal(f.db.Balance[0].available, '119.00'); assert.deepEqual(f.db.Ledger, [f.genesis]);
  assert.deepEqual(f.db.Reservation, []); assert.deepEqual(f.db.Decision, []);
});
test('completed original 50 capture leaves 69 and cannot be cancelled or reversed by decision recovery', async () => {
  const f = fixture('119.00');
  const reserved = await operations.reserve(f.request);
  await operations.capture({ ...f.request, reservationCode: reserved.reservation.code, idempotencyKey: 'original:payment:capture' });
  const before = clone(f.db);
  await assert.rejects(decisions.cancel(f.request)); await assert.rejects(decisions.inspect(f.request));
  assert.deepEqual(f.db, before); assert.equal(f.db.Balance[0].available, '69.00');
  assert.equal(f.db.Ledger.filter(r => r.entryType === 'CAPTURE').length, 1);
});
test('concurrent authorize/cancel cannot commit both accounting and cancellation', async () => {
  const f = fixture('119.00');
  const results = await Promise.allSettled([operations.reserve(f.request), decisions.cancel(f.request)]);
  assert.equal(results.filter(r => r.status === 'fulfilled').length, 1);
  assert.equal(f.db.Decision.length, 1);
  const decision = f.db.Decision[0];
  if (decision.status === 'CANCELLED') { assert.deepEqual(f.db.Ledger, [f.genesis]); assert.equal(f.db.Balance[0].available, '119.00'); }
  else { assert.equal(decision.status, 'AUTHORIZED'); assert.equal(f.db.Balance[0].available, '69.00'); }
});
test('pre-adoption reservation or partial ledger effects block cancellation, even without Payment rows', async () => {
  for (const table of ['Reservation', 'Ledger']) {
    const f = fixture(); f.db[table].push({ code: decisions.code(f.request), idempotencyKey: f.request.idempotencyKey });
    await assert.rejects(decisions.cancel(f.request)); assert.deepEqual(f.db.Decision, []);
  }
});
test('historical balance-only partial effect remains unconfirmed despite absent reservation and ledger', async () => {
  const f = fixture('49.00');
  f.db.Balance[0].reserved = '50.00';
  const fence = await decisions.cancel(f.request);
  assert.equal(fence.status, 'CANCELLED'); assert.equal(fence.noEffects, false);
  assert.equal(f.db.Balance[0].reserved, '50.00');
  assert.deepEqual((await operations.reserve(f.request)).decision, fence);
  assert.equal(f.db.Ledger.length, 1);
});
test('unchanged delayed pre-contract authorization cannot mint a new atomic denial or debit', async () => {
  const f = fixture('49.00');
  const { reservationDecisionContract, ...historical } = f.request;
  await assert.rejects(operations.reserve(historical), { code: 'ERR_LOYALTY_RESERVATION_DECISION' });
  assert.deepEqual(f.db.Decision, []); assert.deepEqual(f.db.Ledger, [f.genesis]);
  assert.equal(f.db.Balance[0].available, '49.00');
});
test('absence, failed completeness, unqualified transaction, missing unique index and foreign intent fail closed', async () => {
  let f = fixture(); await assert.rejects(decisions.inspect(f.request));
  f = fixture(); f.corruptRead(); await assert.rejects(decisions.cancel(f.request));
  f = fixture(); f.loyalty.transactions.enabled = false; await assert.rejects(operations.reserve(f.request));
  f = fixture(); SERVICE.DefaultDatabaseModelHandlerService.inspectIndexes = async () => ({ versioned: false, indexes: [] });
  await assert.rejects(decisions.cancel(f.request));
  f = fixture(); await decisions.cancel(f.request);
  await assert.rejects(operations.reserve({ ...f.request, sourceCode: 'foreign', targetCode: 'foreign' }));
  await assert.rejects(decisions.cancel({ ...f.request, tenant: 'foreign' }));
  await assert.rejects(decisions.cancel({ ...f.request, authData: { tenant: 't', principalType: 'human' } }));
});
test('effective validation helper overrides apply without exposing private reservation admission', async () => {
  const f = fixture(); let called = false;
  const customized = { ...decisions, persistence: async function (r) { called = true; return decisions.persistence.call(this, r); } };
  SERVICE.DefaultLoyaltyReservationDecisionService = customized;
  await operations.reserve(f.request); assert.equal(called, true); assert.equal(customized.owns(f.request), false);
});
test('owner status and lifecycle vocabulary remain registered and use NodicsError in the runtime', () => {
  fixture();
  const definitions = require('../src/utils/statusDefinitions');
  assert.equal(definitions.ERR_LOYALTY_RESERVATION_DECISION.code, '409');
  const schema = require('../../loyaltyReservation/src/schemas/schemas').loyaltyReservation.rewardReservationDecision;
  assert.deepEqual(schema.definition.status.enum, require('../src/utils/enums').LoyaltyReservationDecisionStatus.definition);
  const previous = global.CLASSES;
  class NodicsError extends Error { constructor(code, message) { super(message); this.code = code; } }
  global.CLASSES = { NodicsError };
  try { assert.throws(() => decisions.fail(), e => e instanceof NodicsError && e.code === 'ERR_LOYALTY_RESERVATION_DECISION'); }
  finally { global.CLASSES = previous; }
});
test('restamping an old key cannot certify unexplained balance effects or an incomplete ledger', async () => {
  for (const corrupt of [f => { f.db.Balance[0].reserved = '50.00'; },
    f => { f.db.Balance[0].revision++; }, f => { f.db.Ledger.length = 0; },
    f => { f.loyalty.reservationDecisions.maximumLedgerEntries = 0; }]) {
    const f = fixture(); corrupt(f); const before = clone(f.db);
    await assert.rejects(operations.reserve(f.request)); assert.deepEqual(f.db, before);
  }
});
test('AUTHORIZED replay never reserves again when original receipt rows disappear after capture', async () => {
  for (const remove of ['Reservation', 'Ledger']) {
    const f = fixture('119.00'), reserved = await operations.reserve(f.request);
    assert.equal((await operations.reserve(f.request)).idempotent, true);
    await operations.capture({ ...f.request, reservationCode: reserved.reservation.code, idempotencyKey: 'capture' });
    if (remove === 'Reservation') f.db.Reservation.length = 0;
    else f.db.Ledger.splice(f.db.Ledger.findIndex(e => e.entryType === 'RESERVE'), 1);
    const before = clone(f.db);
    await assert.rejects(operations.reserve(f.request)); assert.deepEqual(f.db, before);
    assert.equal(f.db.Balance[0].available, '69.00');
  }
});
test('unselected, stale and same-tenant foreign runtime callers cannot fence another source', async () => {
  for (const corrupt of [f => { f.loyalty.reservationDecisions.callers = []; },
    f => { f.request.authData.serviceId = 'other'; }, f => { f.request.authData.permissions = []; },
    f => { f.request.authData.runtimeScope = { ...f.request.authData.runtimeScope, assignmentCode: 'stale' }; }]) {
    const f = fixture(); corrupt(f);
    await assert.rejects(decisions.cancel(f.request)); assert.deepEqual(f.db.Decision, []);
  }
});
test('decision save failure acknowledgement rolls back all owner writes', async () => {
  const f = fixture('119.00'), before = clone(f.db);
  const save = SERVICE.DefaultRewardReservationDecisionService.save;
  SERVICE.DefaultRewardReservationDecisionService.save = async r => { await save(r); return { code: 'SUC_SAVE', acknowledged: false }; };
  await assert.rejects(operations.reserve(f.request)); assert.deepEqual(f.db, before);
});
test('complete captured ledger reconciles for a distinct insufficient-balance command without reversing purchase', async () => {
  const f = fixture('119.00'), reserved = await operations.reserve(f.request);
  await operations.capture({ ...f.request, reservationCode: reserved.reservation.code, idempotencyKey: 'capture' });
  const before = clone(f.db.Balance);
  const result = await operations.reserve({ ...f.request, idempotencyKey: 'distinct:payment', sourceCode: 'distinct', targetCode: 'distinct', amount: '70.00' });
  assert.equal(result.decision.status, 'DENIED'); assert.deepEqual(f.db.Balance, before);
  assert.equal(f.db.Ledger.filter(e => e.entryType === 'CAPTURE').length, 1);
});

/** Uses the actual administrator proof consumer, Profile transport and native wrapper resolver without opening connections. */
function readinessFixture() {
  const f = fixture(), defaults = require('../config/properties').loyalty;
  f.loyalty.enterpriseTestCredits = structuredClone(defaults.enterpriseTestCredits);
  f.loyalty.transfers = structuredClone(defaults.transfers);
  const request = { tenant: 't', authorization: 'Bearer isolated-test', payload: {},
    authData: { tenant: 't', entCode: 'platform', loginId: 'admin', principalType: 'human', tokenType: 'access',
      authenticationMethod: 'PASSWORD', authVersion: 1, userGroups: ['platformAdministratorUserGroup'],
      permissions: ['loyalty.wallet.testCredit'] } };
  SERVICE.DefaultSecuredRequestPipelineService = {
    hasPlatformFullAccess: r => r.authData.userGroups?.includes('platformAdministratorUserGroup') === true,
    getGrantedPermissions: r => r.authData.permissions,
    isPermissionGranted: (permission, permissions) => permissions?.includes(permission) === true,
  };
  SERVICE.DefaultLoggerService = { assertSensitiveRequest: () => {} };
  SERVICE.DefaultLoyaltyEnterpriseTestCreditService = require('../src/service/defaultLoyaltyEnterpriseTestCreditService');
  SERVICE.DefaultLoyaltyParticipantService = require('../src/service/defaultLoyaltyParticipantService');
  let proofCalls = 0, indexReads = 0;
  const proofNonces = [], response = { alter: undefined };
  SERVICE.DefaultModuleService = { invokeModule: async call => {
    proofCalls++;
    assert.equal(call.header.Authorization, request.authorization);
    assert.equal(call.header['X-Enterprise-Code'], 'platform');
    assert.equal(call.apiName, defaults.enterpriseTestCredits.platformAdministratorEvidencePath);
    assert.equal(call.requestBody.permission, 'loyalty.wallet.testCredit');
    proofNonces.push(call.requestBody.nonce);
    const proof = { contractVersion: 1, nonce: call.requestBody.nonce, tenant: 't', enterpriseCode: 'platform',
      actorCode: 'admin', principalType: 'human', platformAdministrator: true,
      permission: 'loyalty.wallet.testCredit', authVersion: 1 };
    response.alter?.(proof, proofCalls);
    return proof;
  } };
  const database = f.models.loyaltyWallet.loyaltyWalletRewardBalanceModel.dataBase;
  database.getOptions = () => ({ connectionHandler: 'DefaultMongodbDatabaseConnectionHandlerService',
    modelHandler: 'DefaultMongodbDatabaseModelHandlerService' });
  database.getCapabilities = () => ({ transaction: { multiRecordAtomic: true } });
  SERVICE.DefaultDatabaseConfigurationService = { getTenantDatabase: (module, tenant) => {
    assert.equal(module, 'loyaltyWallet'); assert.equal(tenant, 't'); return { master: database };
  } };
  SERVICE.DefaultMongodbDatabaseConnectionHandlerService = require(
    '../../../../nodics.foundation/modules/nDatabase/mongodb/src/service/connection/defaultMongodbDatabaseConnectionHandlerService');
  SERVICE.DefaultDatabaseTransactionService = { ...require(
    '../../../../nodics.foundation/modules/nDatabase/database/src/service/transaction/defaultDatabaseTransactionService'),
    execute: () => assert.fail('readiness must not execute a transaction') };
  SERVICE.DefaultDatabaseModelHandlerService = { ...require(
    '../../../../nodics.foundation/modules/nDatabase/database/src/service/model/defaultDatabaseModelHandlerService') };
  SERVICE.DefaultMongodbDatabaseModelHandlerService = require(
    '../../../../nodics.foundation/modules/nDatabase/mongodb/src/service/model/defaultMongodbDatabaseModelHandlerService');
  for (const group of Object.values(f.models)) for (const model of Object.values(group)) {
    model.indexes = callback => { indexReads++; callback(null, [{ name: 'code_1', key: { code: 1 }, unique: true }]); };
    model.countDocuments = async () => 0;
  }
  SERVICE.DefaultLoyaltyTransactionService = { ...transaction, compose: () => assert.fail('readiness must not compose') };
  for (const name of ['DefaultRewardReservationDecisionService', 'DefaultRewardReservationService',
    'DefaultLoyaltyWalletRewardBalanceService', 'DefaultRewardLedgerEntryService'])
    for (const action of ['get', 'save', 'update', 'remove']) SERVICE[name][action] = () => assert.fail('no financial record access');
  return { ...f, request, response, database, proofNonces,
    get proofCalls() { return proofCalls; }, get indexReads() { return indexReads; } };
}

test('readiness reuses fresh Super Admin proof and actual native wrapper qualification without writes or credit opt-in', async () => {
  const f = readinessFixture();
  assert.equal(f.loyalty.enterpriseTestCredits.enabled, false);
  assert.deepEqual(await decisions.readiness(f.request), {
    contract: 'LOYALTY_RESERVATION_READINESS_V1', qualified: true, readOnly: true,
  });
  assert.equal(f.proofCalls, 2); assert.equal(new Set(f.proofNonces).size, 2); assert.equal(f.indexReads, 4);
});
test('readiness excludes employee/customer/service and refuses selectors, scope substitution and missing private capture', async () => {
  for (const alter of [f => { f.request.authData.userGroups = ['employeeUserGroup']; },
    f => { f.request.authData.principalType = 'customer'; }, f => { f.request.authData.principalType = 'service'; },
    f => { f.request.authData.permissions = []; }, f => { f.request.payload = { idempotencyKey: 'original' }; },
    f => { f.request.query = { tenant: 'foreign' }; }, f => { f.request.enterpriseCode = 'foreign'; },
    f => { f.request.headers = { 'X-Tenant-Code': 'foreign' }; },
    () => { SERVICE.DefaultLoggerService.assertSensitiveRequest = () => { throw Error('private capture missing'); }; }]) {
    const f = readinessFixture(); alter(f);
    await assert.rejects(decisions.readiness(f.request), { code: 'ERR_LOYALTY_RESERVATION_DECISION' });
    assert.equal(f.indexReads, 0); assert.equal(f.proofCalls, 0);
  }
});
test('readiness refuses stale/forged fresh proof and authority drift, including final revalidation', async () => {
  for (const alter of [(p) => { p.nonce = 'stale'; }, (p) => { p.authVersion = 0; },
    (p) => { p.platformAdministrator = false; }, (p, n) => { if (n === 2) p.actorCode = 'other'; }]) {
    const f = readinessFixture(); f.response.alter = alter;
    await assert.rejects(decisions.readiness(f.request));
  }
  const f = readinessFixture(); f.response.alter = () => { f.request.authorization = 'changed'; };
  await assert.rejects(decisions.readiness(f.request)); assert.equal(f.indexReads, 0);
});
test('readiness rejects native unsupported topology, foreign wrappers, missing model/CAS and unsuitable indexes', async () => {
  for (const alter of [f => { f.database.getCapabilities = () => ({ transaction: { multiRecordAtomic: false } }); },
    f => { f.models.loyaltyReservation.rewardReservationDecisionModel.dataBase = {}; },
    f => { delete f.models.loyaltyReservation.rewardReservationDecisionModel; },
    f => { delete f.models.loyaltyWallet.loyaltyWalletRewardBalanceModel.compareAndSetItem; },
    f => { f.models.loyaltyReservation.rewardReservationDecisionModel.rawSchema.transaction.enabled = false; },
    () => { SERVICE.DefaultDatabaseModelHandlerService.inspectIndexes = async () => ({ versioned: false, indexes: [] }); },
    () => { SERVICE.DefaultDatabaseModelHandlerService.inspectIndexes = async () => ({ versioned: false,
      indexes: [{ unique: true, key: { code: 1 }, sparse: true }] }); }]) {
    const f = readinessFixture(); alter(f);
    await assert.rejects(decisions.readiness(f.request), { code: 'ERR_LOYALTY_RESERVATION_DECISION' });
  }
});
test('readiness actual controller/facade maps header-only bearer, retains no-store and refuses conflicting transport', async () => {
  const controller = require('../../loyaltyApi/src/controller/defaultLoyaltyInternalController');
  const facade = require('../../loyaltyApi/src/facade/defaultLoyaltyInternalFacade');
  const previous = global.FACADE;
  global.FACADE = { DefaultLoyaltyInternalFacade: facade };
  try {
    const f = readinessFixture(), auth = clone(f.request.authData), authorization = f.request.authorization;
    delete f.request.authorization;
    f.request.httpRequest = { headers: { authorization }, body: {} };
    const headers = {};
    f.request.httpResponse = { setHeader: (key, value) => { headers[key] = value; } };
    assert.deepEqual(await controller.reservationDecisionReadiness(f.request), { data: {
      contract: 'LOYALTY_RESERVATION_READINESS_V1', qualified: true, readOnly: true,
    } });
    assert.equal(headers['Cache-Control'], 'no-store'); assert.deepEqual(f.request.authData, auth);
    assert.equal(f.request.authorization, authorization); assert.equal(f.proofCalls, 2);
    const conflict = readinessFixture();
    conflict.request.httpRequest = { headers: { authorization: 'Bearer different' } };
    await assert.rejects(controller.reservationDecisionReadiness(conflict.request));
    assert.equal(conflict.proofCalls, 0); assert.equal(conflict.indexReads, 0);
  } finally { global.FACADE = previous; }
});
test('bodyless GET uses actual Express query parsing and nRouter request-context mapping without a server boot', async () => {
  const f = readinessFixture(), express = require('express');
  const handler = require('../../../../nodics.foundation/modules/nRouter/src/service/defaultRequestHandlerService');
  const controller = require('../../loyaltyApi/src/controller/defaultLoyaltyInternalController');
  const route = require('../../loyaltyApi/src/router/routers').loyaltyApi.participation.reservationDecisionReadiness;
  const previous = global.FACADE;
  global.FACADE = { DefaultLoyaltyInternalFacade: require('../../loyaltyApi/src/facade/defaultLoyaltyInternalFacade') };
  try {
    const http = Object.create(express.request);
    http.app = express(); http.method = 'GET'; http.url = route.key; http.originalUrl = route.key;
    http.headers = { authorization: f.request.authorization, host: 'localhost' };
    http.connection = { remoteAddress: '127.0.0.1' };
    require('express/lib/middleware/query')()(http, {}, () => {});
    assert.equal(http.body, undefined); assert.equal(Object.keys(http.query).length, 0);
    UTILS.generateUniqueCode = () => 'isolated-readiness-request';
    const get = CONFIG.get;
    CONFIG.get = key => key === 'responseHandler' ? { jsonResponseHandler: 'TestReadinessResponse' } : get(key);
    SERVICE.DefaultLoggerService.inheritRequestPrivacy = (input, original) => {
      assert.equal(original, http); assert.equal(input.router.requestPrivacy.sensitive, true);
    };
    SERVICE.DefaultPipelineService = { start: async (name, input) => {
      assert.equal(name, 'requestHandlerPipeline'); assert.equal(input.authorization, undefined);
      assert.deepEqual(input.body, {}); assert.equal(input.httpRequest, http);
      // Authentication is isolated; the request shape, controller and owner chain are real.
      input.tenant = f.request.tenant; input.authData = clone(f.request.authData);
      return controller.reservationDecisionReadiness(input);
    } };
    const headers = {};
    const result = await new Promise((resolve, reject) => {
      SERVICE.TestReadinessResponse = { handleSuccess: (_req, _res, value) => resolve(value),
        handleError: (_req, _res, error) => reject(error) };
      handler.startRequestHandler(http, { setHeader: (key, value) => { headers[key] = value; } },
        { ...route, moduleName: 'loyaltyApi' });
    });
    assert.deepEqual(result.data, { contract: 'LOYALTY_RESERVATION_READINESS_V1', qualified: true, readOnly: true });
    assert.equal(headers['Cache-Control'], 'no-store'); assert.equal(f.proofCalls, 2); assert.equal(f.indexReads, 4);
  } finally { global.FACADE = previous; }
});


// Exercise the generated update acknowledgement and real timestamp ownership, not a document-returning update double.
async function realPersistence(f, corrupt) {
  global.UTILS.isBlank = value => !value || Object.keys(value).length === 0;
  const root = '../../../../nodics.foundation/modules/nDatabase/';
  const update = require(root + 'database/src/service/procs/update/defaultModelsUpdateInitializerService');
  const save = require(root + 'database/src/service/procs/save/defaultModelSaveInitializerService');
  const interceptor = require(root + 'database/src/service/interceptors/defaultInterceptorService');
  const mongo = require(root + 'mongodb/src/schemas/model').default;
  const { ObjectId } = require('mongodb');
  SERVICE.DefaultModelValidatorService = { validateMandate: async () => true, validateDataType: async () => true };
  const updateTable = table => async r => {
    assert.ok(r.transactionContext);
    await interceptor.setUpdatedTimestamp(r, {});
    const model = { ...mongo, versioned: false, dataBase: { getOptions: () => ({}) },
      transactionOptions: input => { assert.equal(input.transactionContext, r.transactionContext); return { session: r.transactionContext }; },
      updateMany: async (query, mutation, options) => {
        assert.equal(options.session, r.transactionContext);
        assert.equal(options.upsert, false);
        const row = r.transactionContext.db[table].find(candidate => Object.entries(query).every(([k,v]) => same(candidate[k], v)));
        if (!row) return { acknowledged: true, matchedCount: 0, modifiedCount: 0 };
        Object.assign(row, clone(mutation.$set));
        if (corrupt && table === 'Balance') row[corrupt] = corrupt === 'revision' ? row.revision + 1 : 'tampered';
        r.transactionContext.dirty = true;
        return { acknowledged: true, matchedCount: 1, modifiedCount: 1 };
      } };
    return { code: 'SUC_UPDATE', result: await update.persistUpdates({ ...r, schemaModel: model }) };
  };
  SERVICE.DefaultLoyaltyWalletRewardBalanceService.update = updateTable('Balance');
  SERVICE.DefaultRewardReservationDecisionService.update = updateTable('Decision');
  SERVICE.DefaultRewardReservationDecisionService.save = async r => {
    assert.ok(r.transactionContext); assert.equal(r.options.insertOnly, true);
    // Separate timestamps deterministically while invoking the actual interceptor.
    await new Promise(resolve => setTimeout(resolve, 3));
    await interceptor.setUpdatedTimestamp(r, {});
    const model = { ...mongo, rawSchema: {}, dataBase: { getOptions: () => ({}) },
      transactionOptions: input => { assert.equal(input.transactionContext, r.transactionContext); return { session: r.transactionContext }; },
      insertOne: async value => {
        const rows = r.transactionContext.db.Decision;
        assert(!rows.some(row => row.code === value.code));
        const id = new ObjectId(); rows.push({ ...clone(value), _id: id });
        r.transactionContext.dirty = true;
        return { acknowledged: true, insertedId: id };
      } };
    return { code: 'SUC_SAVE', result: await save.persistModel({ ...r, schemaModel: model }) };
  };
}

test('real generated update acknowledgement and timestamped decision commit once and replay unchanged', async () => {
  const f = fixture('50.00'); await realPersistence(f);
  const result = await operations.reserve(f.request);
  assert.equal(result.balance.available, '0.00'); assert.equal(result.balance.reserved, '50.00');
  assert.equal(f.db.Decision[0].status, 'AUTHORIZED');
  const before = clone(f.db);
  await operations.reserve(f.request);
  assert.deepEqual(clone(f.db), before);
});

for (const field of ['available', 'reserved', 'revision', 'created', 'updatedAt', 'updated'])
  test(`generated balance readback refuses changed ${field} and rolls back`, async () => {
    const f = fixture('50.00'); await realPersistence(f, field); const before = clone(f.db);
    await assert.rejects(operations.reserve(f.request), { code: 'ERR_LOYALTY_RESERVATION_DECISION' }); assert.deepEqual(f.db, before);
  });

test('real timestamped denial and absent-key cancellation preserve distinct noEffects contracts', async () => {
  const f = fixture(); await realPersistence(f);
  assert.equal((await operations.reserve(f.request)).decision.noEffects, true);
  const cancelled = await decisions.cancel({ ...f.request, idempotencyKey: 'another:payment' });
  assert.equal(cancelled.status, 'CANCELLED'); assert.equal(cancelled.noEffects, false);
});


test('atomic reconciliation proves rolled-back original authorization and permanently fences it', async () => {
  const f = fixture('100.00'); await realPersistence(f);
  const originalSave = SERVICE.DefaultRewardReservationDecisionService.save;
  SERVICE.DefaultRewardReservationDecisionService.save = async () => { throw Error('rollback'); };
  await assert.rejects(operations.reserve(f.request));
  SERVICE.DefaultRewardReservationDecisionService.save = originalSave;
  const before = clone(f.db);
  const proof = await decisions.reconcile(f.request);
  assert.equal(proof.contract, 'LOYALTY_RESERVATION_RECONCILIATION_V1');
  assert.equal(proof.status, 'CANCELLED'); assert.equal(proof.noEffects, true);
  assert.equal(proof.proof.ledgerCount, 1); assert.equal(proof.proof.balanceRevision, 1);
  assert.equal(proof.intent.walletCode, f.request.walletCode);
  for (const table of ['Balance', 'Ledger', 'Reservation']) assert.deepEqual(f.db[table], before[table]);
  const committed = clone(f.db);
  assert.deepEqual(await decisions.reconcile(f.request), proof);
  assert.deepEqual(clone(f.db), committed);
  assert.equal((await operations.reserve(f.request)).decision.status, 'CANCELLED');
  assert.equal((await decisions.inspect(f.request)).noEffects, false, 'legacy receipt never upgrades itself');
  assert.deepEqual(clone(f.db), committed);
});

test('existing unproven cancellation gains exact proof once without changing its decision identity or time', async () => {
  const f = fixture(); await realPersistence(f);
  await decisions.cancel(f.request);
  const original = clone(f.db.Decision[0]);
  const proof = await decisions.reconcile(f.request);
  assert.equal(proof.noEffects, true); assert.equal(f.db.Decision.length, 1);
  assert.deepEqual(f.db.Decision[0].decidedAt, original.decidedAt);
  assert.deepEqual(f.db.Decision[0].binding, original.binding);
  await assert.rejects(decisions.reconcile({ ...f.request, amount: '1.00' }));
});

for (const corruption of ['balance', 'revision', 'missing-ledger', 'hold', 'posting', 'ambiguous-read', 'caller', 'contract'])
 test(`reconciliation refuses ${corruption} without issuing proof or changing accounting`, async () => {
  const f = fixture();
  if (corruption === 'balance') f.db.Balance[0].available = '48.00';
  if (corruption === 'revision') f.db.Balance[0].revision++;
  if (corruption === 'missing-ledger') f.db.Ledger.length = 0;
  if (corruption === 'hold') f.db.Reservation.push({ code: decisions.code(f.request) });
  if (corruption === 'posting') f.db.Ledger.push({ code: 'unexpected', idempotencyKey: f.request.idempotencyKey });
  if (corruption === 'ambiguous-read') f.corruptRead();
  if (corruption === 'caller') f.loyalty.reservationDecisions.callers = [];
  if (corruption === 'contract') delete f.request.reservationDecisionContract;
  const before = clone(f.db);
  await assert.rejects(decisions.reconcile(f.request)); assert.deepEqual(f.db, before);
 });

test('lost reconciliation commit acknowledgement replays the durable proof without accounting effects', async () => {
  const f = fixture(); f.loseCommit();
  await assert.rejects(decisions.reconcile(f.request), /commit acknowledgement lost/);
  const before = clone(f.db);
  assert.equal((await decisions.reconcile(f.request)).noEffects, true);
  assert.deepEqual(f.db, before);
});

test('authorized and denied decisions cannot be relabelled as reconciled cancellation', async () => {
  for (const amount of ['49.00', '100.00']) {
    const f = fixture(amount); await operations.reserve(f.request); const before = clone(f.db);
    await assert.rejects(decisions.reconcile(f.request)); assert.deepEqual(f.db, before);
  }
});

test('racing authorization and reconciliation commit only one original-key outcome', async () => {
  for (const reverse of [false, true]) {
    const f = fixture('100.00');
    const actions = [() => operations.reserve(f.request), () => decisions.reconcile(f.request)];
    const outcomes = await Promise.allSettled((reverse ? actions.reverse() : actions).map(run => run()));
    assert(outcomes.some(o => o.status === 'fulfilled')); assert.equal(f.db.Decision.length, 1);
    if (f.db.Decision[0].status === 'AUTHORIZED') {
      assert.equal(f.db.Balance[0].reserved, '50.00');
      assert.equal(f.db.Reservation.length, 1); assert.equal(f.db.Decision[0].reconciliation, undefined);
    } else {
      assert.equal(f.db.Decision[0].status, 'CANCELLED'); assert.equal(f.db.Decision[0].noEffects, true);
      assert.equal(f.db.Balance[0].reserved, '0.00'); assert.equal(f.db.Reservation.length, 0); assert.equal(f.db.Ledger.length, 1);
    }
  }
});

test('reconciliation CAS failure and proof corruption roll back without a durable positive receipt', async () => {
  for (const mode of ['miss', 'corrupt', 'unacknowledged']) {
    const f = fixture(); const before = clone(f.db), update = SERVICE.DefaultRewardReservationDecisionService.update;
    SERVICE.DefaultRewardReservationDecisionService.update = async r => {
      if (mode === 'miss') return { code: 'SUC_UPDATE', result: { acknowledged: true, matchedCount: 0 } };
      const response = await update(r);
      if (mode === 'corrupt') r.transactionContext.db.Decision[0].reconciliation.ledgerDigest = 'changed';
      if (mode === 'unacknowledged') response.acknowledged = false;
      return response;
    };
    await assert.rejects(decisions.reconcile(f.request)); assert.deepEqual(f.db, before);
  }
});

test('reconciliation transport stays sensitive service-only release permission with exact owner delegation', () => {
  const route = require('../../loyaltyApi/src/router/routers').loyaltyApi;
  const routes = Object.values(route).flatMap(group => Object.values(group));
  const target = routes.find(r => r.key === '/reward-reservation-decisions/reconcile');
  assert.deepEqual(target.authTokenTypes, ['service']); assert.equal(target.permission, 'loyalty.rewards.release');
  assert.equal(target.requestPrivacy.sensitive, true); assert.equal(target.cache.enabled, false);
});


test('reconciliation rejects changed binding/intent, caller proof and damaged replay evidence', async () => {
  for (const change of ['amount', 'walletCode', 'sourceCode', 'proof', 'ledger']) {
    const f = fixture(); await decisions.reconcile(f.request);
    const request = { ...f.request };
    if (change === 'amount') request.amount = '1.00';
    if (change === 'walletCode') request.walletCode = 'another-wallet';
    if (change === 'sourceCode') request.sourceCode = request.targetCode = 'another-order';
    if (change === 'proof') request.payload = { reservationDecisionContract: 'LOYALTY_RESERVATION_DECISION_V1', proof: {} };
    if (change === 'ledger') f.db.Ledger[0].amount = '1.00';
    const before = clone(f.db);
    await assert.rejects(decisions.reconcile(request)); assert.deepEqual(f.db, before);
  }
});

test('public reconciliation accepts only the exact retained authorization envelope', async () => {
  const f = fixture();
  const keys = ['reservationDecisionContract','idempotencyKey','sourceType','sourceCode','targetType','targetCode',
    'walletCode','programCode','rewardTypeCode','amount'];
  const payload = Object.fromEntries(keys.map(k => [k, f.request[k]]));
  const request = { tenant: f.request.tenant, authData: f.request.authData, payload };
  assert.equal((await decisions.reconcile(request)).noEffects, true);
  await assert.rejects(decisions.reconcile({ ...request, payload: { ...payload, noEffects: true } }));
});
