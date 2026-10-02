/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
'use strict';
/** @module profile/test/enterpriseRegistrationJourney @owner profile @layer test
 * Executes actual Profile, Communication RPC and verification source. Storage,
 * cache, mail transport, hashing provider and HTTP origin policy are explicit
 * controlled fixtures. No live database, SMTP or deployed-router claim is made.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const Enum = require('../../../../nodics.foundation/modules/nConfig/bin/enum');
global.ENUMS = Object.fromEntries(Object.entries(require('../src/utils/enums'))
    .map(([name, definition]) => [name, new Enum(definition.definition, definition._options)]));
const crypto = require('node:crypto');
const profile = require('../src/service/enterprise/defaultEnterpriseManagementService');
const journey = require('../src/service/enterprise/defaultEnterpriseRegistrationService');
const verifierSource = require('../../../../nodics.communication/modules/commsVerification/src/service/defaultCommunicationVerificationService');
const rpcSource = require('../../../../nodics.communication/modules/commsApi/src/service/defaultCommunicationVerificationApiService');
const clone = value => structuredClone(value);
const matches = (row, query) => Object.entries(query).every(([key, value]) => {
  const actual = key.split('.').reduce((o, k) => o && o[k], row);
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    if ('$gt' in value) return new Date(actual).getTime() > new Date(value.$gt).getTime();
    if ('$exists' in value) return (actual !== undefined) === value.$exists;
    if ('$in' in value) return value.$in.includes(actual);
    if ('$ne' in value) return actual !== value.$ne;
  }
  return JSON.stringify(actual) === JSON.stringify(value);
});
const checksum = password => 'test-scrypt:' + crypto.scryptSync(password, 'fixture-only-salt', 32).toString('hex');
let tables, cache, sent, calls, time, owner, management, policy, faults, state, rateCalls, consumeWrites;
const key = (tenant, code) => tenant + ':' + code;
function table(name) { return tables[name]; }
function generated(name) {
  return {
    get: async req => {
      if (faults[name + '.get']) throw Object.assign(Error('injected private storage error'), { code: 'ERR_FIXTURE' });
      const all = [...table(name).values()].filter(row => row.tenant === req.tenant && matches(row, req.query || {}));
      const size = req.searchOptions && req.searchOptions.pageSize || 100, page = req.searchOptions && req.searchOptions.pageNumber || 1;
      return { code: 'SUC_FIXTURE_READ', count: all.length, result: clone(all.sort((a, b) => a.code.localeCompare(b.code)).slice((page - 1) * size, page * size)) };
    },
    save: async req => {
      calls.push(name + '.save');
      if (faults[name + '.save.before']) { faults[name + '.save.before']--; throw Error('before write'); }
      assert.equal(req.query, undefined, 'registration inserts never pass an upsert selector');
      const model = clone(req.model), k = key(req.tenant, model.code);
      if (table(name).has(k)) throw Error('duplicate code');
      if (['Employee', 'Customer'].includes(name) && [...table(name).values()].some(row => row.tenant === req.tenant && row.loginId === model.loginId)) throw Error('duplicate login');
      model.tenant = req.tenant; model._id = 'id_' + model.code;
      if (name === 'Password') model.password = checksum(model.password);
      if (name === 'Employee') model.authVersion = 1;
      if (['Assignment', 'Challenge'].includes(name)) model.revision = 1;
      table(name).set(k, model);
      if (faults[name + '.save.after']) { faults[name + '.save.after']--; throw Error('response lost after write'); }
      return { code: 'SUC_FIXTURE_SAVE', result: clone(model) };
    },
    update: async req => {
      calls.push(name + '.update');
      if (faults[name + '.update.before']) { faults[name + '.update.before']--; throw Error('before update'); }
      if (faults[name + '.update.hook']) await faults[name + '.update.hook'](req);
      const row = [...table(name).values()].find(row => row.tenant === req.tenant && matches(row, req.query));
      if (!row) return { code: 'SUC_FIXTURE_UPDATE', result: { matchedCount: 0, modifiedCount: 0 } };
      const model = { ...row, ...clone(req.model) };
      if (['Assignment', 'Challenge'].includes(name)) model.revision = (row.revision || 0) + 1;
      if (name === 'Assignment' && model.identityClaimed && [...table(name).values()].some(other => other.code !== row.code && other.tenant === row.tenant && other.normalizedEmail === row.normalizedEmail && other.identityClaimed)) throw Error('unique active identity claim');
      if (name === 'Employee') model.authVersion = (row.authVersion || 1) + 1;
      if (name === 'Challenge' && model.status === 'CONSUMED') consumeWrites++;
      table(name).set(key(req.tenant, row.code), model);
      if (faults[name + '.update.after']) { faults[name + '.update.after']--; throw Error('response lost after update'); }
      return { code: 'SUC_FIXTURE_UPDATE', result: { matchedCount: 1, modifiedCount: 1 } };
    },
  };
}
function put(name, tenant, model) { table(name).set(key(tenant, model.code), { tenant, ...clone(model) }); }
function get(name, tenant, code) { return table(name).get(key(tenant, code)); }
function assignment(code = 'invite-a', enterprise = 'business-a', email = 'alex@example.test') {
  return { code, normalizedEmail: email, email, enterpriseCode: enterprise, tenantCode: enterprise,
    scopeType: 'ENTERPRISE', scopeCode: enterprise, roleCode: 'OPERATOR', groupCodes: ['operators'],
    invitedBy: 'owner', active: true, status: 'PENDING', revision: 1, expiresAt: new Date(time + 86400000).toISOString() };
}
function request(body, origin = 'https://axis.example.test') { return { body, httpRequest: { headers: { origin }, ip: '192.0.2.1' } }; }
const execute = (operation, body, origin) => owner.execute(request(body, origin), operation);
const otp = () => sent.at(-1).variables.verificationCode;
let token;
async function verified(email = 'alex@example.test') {
  const start = await execute('START', { email }); token = start.continuation;
  return execute('VERIFY', { continuation: token, code: otp() });
}
const details = extra => ({ continuation: token, firstName: 'Alex', lastName: 'Example', password: 'Test-only-password-794!', ...extra });
const finish = extra => execute('COMPLETE', details(extra));
test.beforeEach(() => {
  tables = Object.fromEntries(['Enterprise', 'Assignment', 'Employee', 'Customer', 'Password', 'Scope', 'Challenge'].map(name => [name, new Map()]));
  cache = new Map(); sent = []; calls = []; faults = {}; time = Date.now(); state = { locked: false }; rateCalls = []; consumeWrites = 0;
  policy = { enabled: true, method: 'PASSWORD', continuationSeconds: 1800, maximumInventoryPages: 20, pageSize: 2,
    maximumNameLength: 128, minimumPasswordLength: 12, maximumPasswordLength: 256,
    requireDistributedRateLimit: true, inventoryQualified: true, assignmentClaimIndexQualified: true,
    rates: { request: { limit: 60, windowSeconds: 60 }, email: { limit: 5, windowSeconds: 600 }, complete: { limit: 10, windowSeconds: 600 } },
    presentation: { title: 'Join your enterprise' }, endpoints: {},
    mail: { connectionName: 'commsApi', templateCode: 'profile.employee.emailVerification', purpose: 'EMPLOYEE_EMAIL_VERIFICATION', locale: 'en', timeoutMilliseconds: 10000 } };
  global.CONFIG = { get: name => {
    if (['defaultTenant', 'defaultEnterprise'].includes(name)) return 'authority';
    if (name === 'enterpriseManagement') return { registration: policy,
      accessAssignments: { roles: { OPERATOR: { groupCodes: ['operators'] }, ENTERPRISE_ADMIN: { groupCodes: ['admins'] } },
        registrationVerification: { enabled: true, mode: 'REMOTE', connectionName: 'commsApi', purpose: 'ENTERPRISE_EMPLOYEE_REGISTRATION', timeoutMilliseconds: 10000, maximumResponseBytes: 16384 } } };
    if (name === 'communicationVerification') return { enabled: true, ttlSeconds: 600, maximumAttempts: 3, secretBytes: 6,
      stored: { enabled: true, trustedSourceModules: ['profile'], proofTtlSeconds: 300, resendCooldownSeconds: 30, maximumIssues: 3 } };
  } };
  global.CLASSES = { NodicsError: class extends Error { constructor(code, message) { super(message || code); this.code = code; } } };
  global.UTILS = { compareHash: async (password, hash) => hash === checksum(password) };
  management = { ...profile, retrieveEnterpriseForAccess: async code => {
    const enterprise = get('Enterprise', 'authority', code);
    if (!enterprise || enterprise.active !== true) throw new Error('enterprise unavailable');
    return { enterprise, tenantCode: enterprise.tenant };
  } };
  owner = { ...journey, now: () => time };
  const verification = { ...verifierSource, now: () => new Date(time) };
  const privateEntries = new WeakSet();
  global.SERVICE = {
    DefaultCommunicationRuntimeService: require('../../../../nodics.communication/modules/commsCore/src/service/defaultCommunicationRuntimeService'),
    // This isolated journey fixture selects legacy credential mode explicitly.
    DefaultPasswordSaveInterceptorService: { mutationQuery: () => undefined },
    DefaultEnterpriseManagementService: management, DefaultEnterpriseRegistrationService: owner,
    DefaultLoggerService: {
      runSensitiveOperation: async (request, operation) => { privateEntries.add(request); return operation(); },
      assertSensitiveRequest: request => assert(privateEntries.has(request)),
      hasPrivateCaptureProtection: request => privateEntries.has(request),
      inheritRequestPrivacy: (target, source) => { if (privateEntries.has(source)) privateEntries.add(target); },
    },
    // Isolated access-owner substitute; exact private-reader integration has separate deferred fixtures.
    DefaultEnterpriseTeamAdministrationService: { enterpriseForAccess: code => management.retrieveEnterpriseForAccess(code) },
    DefaultCommunicationVerificationService: verification,
    DefaultEnterpriseService: generated('Enterprise'), DefaultEnterpriseAccessAssignmentService: generated('Assignment'),
    DefaultEmployeeService: generated('Employee'), DefaultCustomerService: generated('Customer'),
    DefaultPasswordService: generated('Password'), DefaultPrincipalScopeAssignmentService: generated('Scope'),
    DefaultCommsVerificationChallengeService: generated('Challenge'),
    DefaultIdentityGovernanceService: { getSystemAuthData: () => ({ isSystem: true, userGroups: ['serviceAccountUserGroup'] }) },
    DefaultBrowserSessionService: { config: () => ({}), validateOrigin: req => { if (req.httpRequest.headers.origin !== 'https://axis.example.test') throw Error('origin denied'); } },
    DefaultUserStateService: { findUserState: async () => clone(state) },
    DefaultRateLimitService: { enforce: async opts => { rateCalls.push(opts); if (faults.rate) throw Error('rate exceeded'); assert.equal(opts.requireDistributed, true); return { allowed: true }; } },
    DefaultAuthenticationProviderService: {
      addToken: async (module, exp, key, value, ttl) => { assert.equal(module, 'profile'); assert(ttl > 0); cache.set(key, clone(value)); return true; },
      consumeToken: async (module, key) => { const value = cache.get(key); if (!value) throw Object.assign(Error('missing'), { code: 'ERR_CACHE_00001' }); cache.delete(key); return clone(value); },
    },
    DefaultModuleService: { invokeModule: async options => {
      assert.equal(options.local, false); assert.equal(options.requireInternalAuth, true); assert.equal(options.maxAttempts, 1); assert.equal(options.followRedirects, false);
      assert.equal(options.header.Authorization, undefined, 'browser credentials are not relayed');
      if (options.apiName === '/internal/verification/commands') {
        const internalRequest = { tenant: options.tenant, payload: options.requestBody,
          authData: { tokenType: 'service', principalType: 'service', serviceId: 'runtime-fixture', tenant: options.tenant,
            modules: ['profile', 'commsApi'], permissions: ['communication.verification.execute'] } };
        privateEntries.add(internalRequest);
        const result = await rpcSource.execute(internalRequest);
        if (faults.consumeResponse && options.requestBody.operation === 'CONSUME') { faults.consumeResponse--; throw Error('lost consume response'); }
        return { data: result };
      }
      if (faults.mail) throw Error('mail transport unavailable');
      sent.push(clone(options.requestBody));
      return { data: { intentCode: 'mail_' + sent.length, status: 'QUEUED' } };
    } },
  };
  // Registry rows reference tenant partitions; the fixture keeps storage context separate.
  put('Enterprise', 'authority', { code: 'authority', name: 'Platform', active: true });
  put('Enterprise', 'authority', { code: 'business-a', name: 'Business A', active: true });
  // Generated enterprise data carries the tenant reference inside the row.
  // Supply a dedicated owner read because registry partition != enterprise.tenant.
  global.SERVICE.DefaultEnterpriseService.get = async req => {
    if (faults['Enterprise.get']) throw Error('directory unavailable');
    const all = [{ code: 'authority', tenant: 'authority', name: 'Platform', active: true },
      { code: 'business-a', tenant: 'business-a', name: 'Business A', active: true },
      ...(faults.extraEnterprises || [])];
    const size = req.searchOptions.pageSize, page = req.searchOptions.pageNumber;
    return { code: 'SUC_READ', count: all.length, result: clone(all.slice((page - 1) * size, page * size)) };
  };
  management.retrieveEnterpriseForAccess = async code => {
    if (faults.inactiveEnterprise) throw Error('enterprise unavailable');
    return { enterprise: { code, name: 'Business ' + code, active: true, tenant: code }, tenantCode: code };
  };
  put('Assignment', 'authority', assignment());
});

test('email-first start reveals no invitation, roles, enterprise, proof or code', async () => {
  const result = await execute('START', { email: 'Alex@Example.Test' });
  assert.equal(result.stage, 'VERIFY_EMAIL'); assert.equal(result.email, 'alex@example.test');
  assert.equal(result.deliveryStatus, 'QUEUED'); assert.equal(result.assignments, undefined);
  const body = JSON.stringify(result); assert(!body.includes(otp())); assert(!body.includes('invite-a')); assert(!body.includes('operators'));
});
test('unknown and existing emails receive the same pre-proof response shape', async () => {
  const first = await execute('START', { email: 'unknown@example.test' });
  put('Customer', 'business-a', { code: 'customer', loginId: 'existing@example.test', active: true });
  const second = await execute('START', { email: 'existing@example.test' });
  assert.deepEqual(Object.keys(first), Object.keys(second)); assert.equal(first.stage, second.stage);
});
test('verified invite resolves one named enterprise without asking for technical IDs', async () => {
  const result = await verified(); assert.equal(result.stage, 'DETAILS'); assert.equal(result.selectedAssignment, 'invite-a');
  assert.equal(result.assignments.length, 1); assert.equal(result.proof, undefined); assert.equal(result.tenantCode, undefined);
});
test('full happy path composes real RPC verification and Profile service ownership', async () => {
  await verified(); const result = await finish(); assert.equal(result.stage, 'COMPLETE');
  assert.equal(tables.Password.size, 1); assert.equal(tables.Employee.size, 1); assert.equal(tables.Scope.size, 1);
  assert.equal(get('Employee', 'business-a', 'alex@example.test').active, true);
  assert.equal(get('Assignment', 'authority', 'invite-a').status, 'REGISTERED'); assert.equal(consumeWrites, 1);
});
test('unknown email does not create an employee or self-approve', async () => {
  const result = await verified('unknown@example.test'); assert.equal(result.stage, 'NO_INVITATION');
  await assert.rejects(finish()); assert.equal(tables.Employee.size, 0);
});
test('registered customer is directed to existing-account authentication', async () => {
  put('Customer', 'business-a', { code: 'customer', loginId: 'alex@example.test', active: true });
  assert.equal((await verified()).stage, 'SIGN_IN'); await assert.rejects(finish()); assert.equal(tables.Password.size, 0);
});
test('employee in another enterprise is not registered again', async () => {
  put('Employee', 'authority', { code: 'existing', loginId: 'alex@example.test', active: true });
  assert.equal((await verified()).stage, 'SIGN_IN'); assert.equal(tables.Password.size, 0);
});
test('wrong OTP persists attempts and never exposes proof', async () => {
  const start = await execute('START', { email: 'alex@example.test' }); token = start.continuation;
  const result = await execute('VERIFY', { continuation: token, code: '000000000000' });
  assert.equal(result.stage, 'VERIFY_EMAIL'); assert.equal([...tables.Challenge.values()][0].attempt, 1);
});
test('exhausted OTP locks and cannot register', async () => {
  const start = await execute('START', { email: 'alex@example.test' }); token = start.continuation;
  for (let i = 0; i < 3; i++) await execute('VERIFY', { continuation: token, code: '000000000000' });
  assert.equal([...tables.Challenge.values()][0].status, 'LOCKED'); await assert.rejects(finish());
});
test('resend observes cooldown and invalidates an earlier code', async () => {
  const start = await execute('START', { email: 'alex@example.test' }); token = start.continuation; const old = otp();
  await assert.rejects(execute('RESEND', { continuation: token })); time += 31000;
  await execute('RESEND', { continuation: token });
  const result = await execute('VERIFY', { continuation: token, code: old }); assert.equal(result.stage, 'VERIFY_EMAIL');
  assert.equal((await execute('VERIFY', { continuation: token, code: otp() })).stage, 'DETAILS');
});
test('mail failure returns truthful progress and permits bounded resend', async () => {
  faults.mail = true; const start = await execute('START', { email: 'alex@example.test' }); token = start.continuation;
  assert.equal(start.deliveryStatus, 'UNAVAILABLE'); delete faults.mail; time += 31000;
  assert.equal((await execute('RESEND', { continuation: token })).deliveryStatus, 'QUEUED');
});
test('email and IP limits fail closed through the existing rate owner', async () => {
  faults.rate = true; await assert.rejects(execute('START', { email: 'alex@example.test' })); assert.equal(sent.length, 0);
});
test('wrong origin cannot use another origin continuation', async () => {
  await verified(); await assert.rejects(execute('COMPLETE', details(), 'https://attacker.example.test')); assert.equal(tables.Password.size, 0);
});
test('body authority, role and verification flags are rejected', async () => {
  await verified(); await assert.rejects(finish({ verified: true, roleCode: 'ENTERPRISE_ADMIN', authData: { isSystem: true } })); assert.equal(tables.Password.size, 0);
});
test('legacy unverified registration method now fails closed', async () => {
  await assert.rejects(management.registerPreAssignedEmployee(request({ email: 'alex@example.test', password: 'Test-only-password-794!' })));
  assert.equal(tables.Employee.size, 0);
});
test('legacy public resolver no longer enumerates membership', () => {
  assert.deepEqual(management.resolvePreAssignedAccess(request({ email: 'alex@example.test' })), { verificationRequired: true });
});
test('credential insert failure resumes without an already-exists dead end', async () => {
  await verified(); faults['Password.save.before'] = 1; await assert.rejects(finish());
  assert.equal((await finish()).stage, 'COMPLETE'); assert.equal(tables.Password.size, 1); assert.equal(consumeWrites, 1);
});
test('employee insert failure preserves the original password on resume', async () => {
  await verified(); faults['Employee.save.before'] = 1; await assert.rejects(finish());
  const password = [...tables.Password.values()][0].password;
  await assert.rejects(finish({ password: 'Changed-test-password-93!' }), { code: 'ERR_PROFILE_REG_CREDENTIAL' });
  assert.equal((await finish()).stage, 'COMPLETE'); assert.equal([...tables.Password.values()][0].password, password);
});
test('scope failure leaves the employee inactive and resumes only missing work', async () => {
  await verified(); faults['Scope.save.before'] = 1; await assert.rejects(finish());
  assert.equal(get('Employee', 'business-a', 'alex@example.test').active, false);
  assert.equal((await finish()).stage, 'COMPLETE'); assert.equal(calls.filter(x => x === 'Password.save').length, 1); assert.equal(tables.Employee.size, 1);
});
test('lost credential save response is inspected, not overwritten', async () => {
  await verified(); faults['Password.save.after'] = 1;
  assert.equal((await finish()).stage, 'COMPLETE'); assert.equal(calls.filter(x => x === 'Password.save').length, 1);
});
test('lost proof-consume response is resolved by receipt, not another grant', async () => {
  await verified(); faults.consumeResponse = 1;
  assert.equal((await finish()).stage, 'COMPLETE'); assert.equal(consumeWrites, 1);
});
test('lost final response uses status without any provisioning writes', async () => {
  await verified(); await finish(); const before = calls.length;
  assert.equal((await execute('STATUS', { continuation: token })).stage, 'COMPLETE');
  assert.equal((await finish()).stage, 'COMPLETE'); assert.equal(calls.length, before);
});
test('changed non-secret details cannot replace an unfinished operation', async () => {
  await verified(); faults['Scope.save.before'] = 1; await assert.rejects(finish());
  await assert.rejects(finish({ firstName: 'Someone else' }), { code: 'ERR_PROFILE_REG_CONFLICT' });
});
test('revoked assignment during provisioning never reaches ready status', async () => {
  await verified(); faults['Scope.update.hook'] = async () => { get('Assignment', 'authority', 'invite-a').status = 'REVOKED'; };
  await assert.rejects(finish()); assert.equal(get('Employee', 'business-a', 'alex@example.test').active, false);
});
test('a changed assignment responsibility invalidates the old continuation', async () => {
  await verified(); get('Assignment', 'authority', 'invite-a').groupCodes = ['administrators'];
  await assert.rejects(finish()); assert.equal(tables.Password.size, 0);
});
test('expiry before completion requires fresh verification', async () => {
  await verified(); time += 301000; await assert.rejects(finish(), { code: 'ERR_PROFILE_REG_VERIFY_AGAIN' }); assert.equal(tables.Password.size, 0);
});
test('partial registration can resume after a fresh email verification', async () => {
  await verified(); faults['Scope.save.before'] = 1; await assert.rejects(finish()); time += 601000;
  const result = await verified(); assert.equal(result.stage, 'DETAILS');
  assert.equal((await finish()).stage, 'COMPLETE'); assert.equal(tables.Password.size, 1);
});
test('directory failures never imply that an existing identity is absent', async () => {
  const start = await execute('START', { email: 'alex@example.test' }); token = start.continuation;
  faults['Enterprise.get'] = true; await assert.rejects(execute('VERIFY', { continuation: token, code: otp() }));
  assert.equal(tables.Employee.size, 0); delete faults['Enterprise.get'];
  assert.equal((await execute('STATUS', { continuation: token })).stage, 'DETAILS');
});
test('multiple pending invitations require a permitted named selection', async () => {
  put('Assignment', 'authority', assignment('invite-b', 'business-b'));
  const result = await verified(); assert.equal(result.assignments.length, 2); assert.equal(result.selectedAssignment, undefined);
  await assert.rejects(finish({ assignmentCode: 'forged' }));
  assert.equal((await finish({ assignmentCode: 'invite-b' })).stage, 'COMPLETE');
});
test('two concurrent completions cannot duplicate identity records', async () => {
  await verified(); const results = await Promise.allSettled([finish(), finish()]);
  assert(results.some(x => x.status === 'fulfilled')); assert.equal(tables.Employee.size, 1); assert.equal(tables.Password.size, 1); assert.equal(tables.Scope.size, 1);
});
test('registration-aware session gate rejects a provisioning-only employee', async () => {
  await verified(); faults['Scope.save.before'] = 1; await assert.rejects(finish());
  const person = get('Employee', 'business-a', 'alex@example.test');
  await assert.rejects(owner.assertSessionEligible({ person, enterprise: { code: 'business-a', tenant: { code: 'business-a' } } }));
});
test('registration-aware session gate rejects a revoked completed assignment', async () => {
  await verified(); await finish(); get('Assignment', 'authority', 'invite-a').status = 'REVOKED';
  await assert.rejects(owner.assertSessionEligible({ person: get('Employee', 'business-a', 'alex@example.test'), enterprise: { code: 'business-a', tenant: { code: 'business-a' } } }));
});
test('legacy account session policy is not replaced by a new registry', async () => {
  const before = calls.length; await owner.assertSessionEligible({ person: { code: 'old', active: true } }); assert.equal(calls.length, before);
});
test('a locked identity cannot be reactivated by registration recovery', async () => {
  await verified(); faults['Scope.save.before'] = 1; await assert.rejects(finish()); state.locked = true;
  await assert.rejects(finish()); assert.equal(get('Employee', 'business-a', 'alex@example.test').active, false);
});
test('new route is opt-in and fails before sending when rollout is incomplete', async () => {
  policy.assignmentClaimIndexQualified = false; await assert.rejects(execute('START', { email: 'alex@example.test' })); assert.equal(sent.length, 0);
});
test('registration checkpoint never contains password, OTP or verification proof', async () => {
  await verified(); const code = otp(); await finish();
  const saved = JSON.stringify(get('Assignment', 'authority', 'invite-a').registration);
  assert(!saved.includes('Test-only-password-794!')); assert(!saved.includes(code));
  assert(!Object.hasOwn(get('Assignment', 'authority', 'invite-a').registration, 'proof'));
});

test('explicit administrator suspension during an incomplete registration is not undone', async () => {
  await verified(); faults['Scope.save.before'] = 1; await assert.rejects(finish());
  const employee = get('Employee', 'business-a', 'alex@example.test');
  employee.active = false; employee.registrationSuspended = true; employee.authVersion++;
  await assert.rejects(finish()); assert.equal(employee.active, false);
});
test('suspension racing the activation compare-and-set prevents readiness', async () => {
  await verified(); faults['Employee.update.hook'] = async () => {
    const employee = get('Employee', 'business-a', 'alex@example.test');
    employee.active = false; employee.registrationSuspended = true; employee.authVersion++;
  };
  await assert.rejects(finish()); assert.equal(get('Employee', 'business-a', 'alex@example.test').active, false);
});
test('activation failure resumes with the same credential and scope', async () => {
  await verified(); faults['Employee.update.before'] = 1; await assert.rejects(finish());
  assert.equal((await finish()).stage, 'COMPLETE'); assert.equal(tables.Password.size, 1); assert.equal(tables.Scope.size, 1);
});
test('lost activation acknowledgement is re-acknowledged before final registration', async () => {
  await verified(); faults['Employee.update.after'] = 1; await assert.rejects(finish());
  assert.equal(get('Assignment', 'authority', 'invite-a').status, 'PENDING');
  assert.equal((await finish()).stage, 'COMPLETE'); assert.equal(tables.Employee.size, 1);
});
test('two invited enterprises cannot claim two new identities for one email', async () => {
  put('Assignment', 'authority', assignment('invite-b', 'business-b'));
  await verified(); const tokenA = token; await verified(); const tokenB = token;
  const results = await Promise.allSettled([
    execute('COMPLETE', { ...details(), continuation: tokenA, assignmentCode: 'invite-a' }),
    execute('COMPLETE', { ...details(), continuation: tokenB, assignmentCode: 'invite-b' }),
  ]);
  assert(results.some(r => r.status === 'fulfilled')); assert.equal(tables.Employee.size, 1); assert.equal(tables.Password.size, 1);
});

const controller = require('../src/controller/enterprise/defaultEnterpriseManagementController');
const facade = require('../src/facade/enterprise/defaultEnterpriseManagementFacade');
test('controller/facade start and completion execute the same proof-enforced journey', async () => {
  global.FACADE = { DefaultEnterpriseManagementFacade: facade };
  const headers = {};
  const invoke = (operation, body) => controller[operation]({ ...request(body), httpRequest: { ...request(body).httpRequest, body }, httpResponse: { setHeader: (name, value) => { headers[name] = value; } } });
  const started = await invoke('startEmployeeRegistration', { email: 'alex@example.test' }); token = started.data.continuation;
  assert.equal(headers['Cache-Control'], 'no-store');
  const checked = await invoke('verifyEmployeeRegistration', { continuation: token, code: otp() });
  assert.equal(checked.data.stage, 'DETAILS'); assert.equal(checked.data.proof, undefined);
  const complete = await invoke('registerPreAssignedEmployee', details());
  assert.equal(complete.data.stage, 'COMPLETE'); assert.equal(complete.data.signInEnterpriseCode, 'business-a');
  assert.equal(complete.data.continuation, undefined); assert.equal(complete.data.proof, undefined);
});
test('controller redacts private storage diagnostics on failure', async () => {
  global.FACADE = { DefaultEnterpriseManagementFacade: { registrationAction: async () => { throw Object.assign(Error('private-database-and-password'), { code: 'ERR_DRIVER' }); } } };
  await assert.rejects(controller.startEmployeeRegistration(request({ email: 'alex@example.test' })), error => error.code === 'ERR_PROFILE_REG_STORAGE' && !error.message.includes('private'));
});
test('controller preserves the rate-limit category without exposing recipient data', async () => {
  global.FACADE = { DefaultEnterpriseManagementFacade: { registrationAction: async () => { throw Object.assign(Error('private-email'), { code: 'ERR_CACHE_00011' }); } } };
  await assert.rejects(controller.startEmployeeRegistration(request({ email: 'alex@example.test' })), error => error.code === 'ERR_PROFILE_REG_RATE');
});
test('controller callback is called once with safe failure', async () => {
  global.FACADE = { DefaultEnterpriseManagementFacade: { registrationAction: async () => { throw Error('private'); } } };
  let count = 0;
  await controller.startEmployeeRegistration(request({ email: 'alex@example.test' }), error => { count++; assert.equal(error.code, 'ERR_PROFILE_REG_STORAGE'); });
  assert.equal(count, 1);
});
test('controller reports an unavailable distributed limiter without implying uncertain registration', async () => {
  global.FACADE = { DefaultEnterpriseManagementFacade: { registrationAction: async () => { throw Object.assign(Error('private-provider'), { code: 'ERR_CACHE_00012' }); } } };
  await assert.rejects(controller.startEmployeeRegistration(request({ email: 'alex@example.test' })), error => error.code === 'ERR_PROFILE_REG_UNAVAILABLE' && !error.message.includes('private'));
});
test('fresh OTP recovery restores known non-sensitive profile fields', async () => {
  await verified(); faults['Scope.save.before'] = 1; await assert.rejects(finish());
  const result = await verified();
  assert.deepEqual(result.assignments[0].profile, { firstName: 'Alex', lastName: 'Example' });
  assert.equal(result.assignments[0].password, undefined);
});
test('stale principal snapshot does not pass session readiness', async () => {
  await verified(); await finish();
  const person = clone(get('Employee', 'business-a', 'alex@example.test'));
  get('Employee', 'business-a', 'alex@example.test').authVersion++;
  await assert.rejects(owner.assertSessionEligible({ person, enterprise: { code: 'business-a', tenant: { code: 'business-a' } } }));
});
test('new completion reports only its server-resolved sign-in enterprise', async () => {
  await verified(); const result = await finish();
  assert.equal(result.signInEnterpriseCode, 'business-a');
  assert.equal(result.tenantCode, undefined); assert.equal(result.authToken, undefined);
});

for (const membershipEnabled of [false, true]) {
  test('fresh proof returns the completed employee sign-in hint without side effects, membership=' + membershipEnabled, async () => {
    await verified(); await finish();
    const saved = clone(tables), writes = calls.filter(call => !call.startsWith('Challenge.'));
    const consumed = consumeWrites;
    SERVICE.DefaultEnterpriseMembershipService = {
      enabled: () => membershipEnabled,
      adoptRegistration: async () => assert.fail('Sign-in resolution must not adopt registration'),
    };
    SERVICE.DefaultEnterpriseNotificationService = { request: async () => assert.fail('No readiness notification') };
    owner.completed = async () => assert.fail('Sign-in resolution must not complete registration again');
    const originalGet = CONFIG.get;
    CONFIG.get = name => name === 'enterpriseManagement'
      ? { ...originalGet(name), notifications: { enabled: true } } : originalGet(name);
    // Registered responsibilities remain valid after the invitation deadline.
    time += 86400001;
    const started = await execute('START', { email: 'alex@example.test' }); token = started.continuation;
    assert.equal(Object.hasOwn(started, 'signInEnterpriseCode'), false);
    const result = await execute('VERIFY', { continuation: token, code: otp() });
    assert.equal(result.stage, 'SIGN_IN'); assert.equal(result.codeState, 'VERIFIED');
    assert.equal(result.signInEnterpriseCode, 'business-a');
    for (const field of ['assignments', 'selectedAssignment', 'tenantCode', 'authToken', 'proof', 'password', 'registration'])
      assert.equal(Object.hasOwn(result, field), false, field);
    assert.equal((await execute('STATUS', { continuation: token })).signInEnterpriseCode, 'business-a');
    for (const name of ['Enterprise', 'Assignment', 'Employee', 'Customer', 'Password', 'Scope'])
      assert.deepEqual(tables[name], saved[name], name + ' remains unchanged');
    assert.deepEqual(calls.filter(call => !call.startsWith('Challenge.')), writes);
    assert.equal(consumeWrites, consumed);
    assert.equal(sent.length, 2, 'only the two explicitly requested verification messages');
  });
}

for (const [name, alter] of [
  ['missing assignment', () => tables.Assignment.clear()],
  ['unfinished checkpoint', () => { get('Assignment', 'authority', 'invite-a').registration.phase = 'ACTIVATING'; }],
  ['wrong assignment link', () => { get('Employee', 'business-a', 'alex@example.test').registrationAssignmentCode = 'other'; }],
  ['wrong registered login', () => { get('Assignment', 'authority', 'invite-a').registeredLoginId = 'other@example.test'; }],
  ['wrong employee checkpoint', () => { get('Assignment', 'authority', 'invite-a').registration.employeeCode = 'other'; }],
  ['wrong password checkpoint', () => { get('Assignment', 'authority', 'invite-a').registration.passwordId = 'other'; }],
  ['wrong tenant', () => { get('Assignment', 'authority', 'invite-a').tenantCode = 'other'; }],
  ['customer-only identity', () => {
    tables.Employee.clear(); put('Customer', 'business-a', { code: 'customer', loginId: 'alex@example.test', active: true });
  }],
  ['employee and customer collision', () => { put('Customer', 'business-a', { code: 'customer', loginId: 'alex@example.test', active: true }); }],
  ['two employee tenants', () => { put('Employee', 'authority', { code: 'other', loginId: 'alex@example.test', active: true }); }],
  ['no identity', () => tables.Employee.clear()],
]) {
  test('verified sign-in omits enterprise hint for ' + name, async () => {
    await verified(); await finish(); alter();
    const result = await verified();
    assert.equal(result.stage, 'SIGN_IN');
    assert.equal(Object.hasOwn(result, 'signInEnterpriseCode'), false);
  });
}

for (const [name, alter] of [
  ['inactive employee', () => { get('Employee', 'business-a', 'alex@example.test').active = false; }],
  ['suspended employee', () => { get('Employee', 'business-a', 'alex@example.test').registrationSuspended = true; }],
  ['inactive registered assignment', () => { get('Assignment', 'authority', 'invite-a').active = false; }],
  ['revoked scope', () => { [...tables.Scope.values()][0].status = 'REVOKED'; }],
  ['inactive credential', () => { [...tables.Password.values()][0].active = false; }],
  ['missing credential', () => tables.Password.clear()],
  ['changed credential identity', () => { [...tables.Password.values()][0]._id = 'different'; }],
  ['unavailable enterprise', () => { faults.inactiveEnterprise = true; }],
  ...['Assignment', 'Enterprise', 'Employee', 'Customer', 'Scope', 'Password'].map(name =>
    ['unavailable ' + name + ' read', () => { faults[name + '.get'] = true; }]),
]) {
  test('registered sign-in fails closed for ' + name, async () => {
    await verified(); await finish(); alter();
    const before = calls.filter(call => !call.startsWith('Challenge.'));
    await assert.rejects(verified());
    assert.deepEqual(calls.filter(call => !call.startsWith('Challenge.')), before);
    assert.equal(consumeWrites, 1);
    assert.equal(cache.get(owner.cacheKey(token)).signInEnterpriseCode, undefined);
  });
}

test('sign-in candidate matching is repeated on the fresh assignment', async () => {
  await verified(); await finish();
  const current = owner.current;
  owner.current = async function (...args) {
    const item = await current.apply(this, args);
    item.registration.phase = 'ACTIVATING';
    return item;
  };
  await assert.rejects(verified(), { code: 'ERR_PROFILE_REG_ASSIGNMENT' });
});

test('unrelated registered assignments do not select or hide the exact employee checkpoint', async () => {
  await verified(); await finish();
  const unrelated = clone(get('Assignment', 'authority', 'invite-a'));
  unrelated.code = 'invite-b'; unrelated.enterpriseCode = 'business-b';
  put('Assignment', 'authority', unrelated);
  assert.equal((await verified()).signInEnterpriseCode, 'business-a');
});

test('ambiguous employee reads fail closed instead of selecting a registered tenant', async () => {
  await verified(); await finish();
  put('Employee', 'business-a', { ...clone(get('Employee', 'business-a', 'alex@example.test')), code: 'duplicate' });
  await assert.rejects(verified(), { code: 'ERR_PROFILE_REG_CONFLICT' });
});

test('a fresh enterprise tenant mismatch cannot produce a sign-in hint', async () => {
  await verified(); await finish();
  management.retrieveEnterpriseForAccess = async code => ({ enterprise: { code }, tenantCode: 'different' });
  await assert.rejects(verified(), { code: 'ERR_PROFILE_REG_ASSIGNMENT' });
});

test('membership invitation selection remains EXISTING_ACCOUNT without a sign-in hint', async () => {
  await verified(); await finish();
  SERVICE.DefaultEnterpriseMembershipService = { enabled: () => true };
  put('Assignment', 'authority', assignment('invite-b', 'business-b'));
  const result = await verified();
  assert.equal(result.stage, 'EXISTING_ACCOUNT');
  assert.equal(Object.hasOwn(result, 'signInEnterpriseCode'), false);
  assert.equal(result.selectedAssignment, 'invite-b');
});

test('sign-in reuses the effective readiness gate and rejects a changed employee snapshot', async () => {
  await verified(); await finish();
  const gate = owner.assertSessionEligible;
  let checked = 0;
  owner.assertSessionEligible = async function (options) {
    checked++;
    get('Employee', 'business-a', 'alex@example.test').authVersion++;
    return gate.call(this, options);
  };
  await assert.rejects(verified(), { code: 'ERR_PROFILE_REG_ASSIGNMENT' });
  assert.equal(checked, 1);
});

test('registered sign-in retains RESOLVING after a failed read and recovers on explicit status', async () => {
  await verified(); await finish(); faults['Password.get'] = true;
  await assert.rejects(verified());
  delete faults['Password.get'];
  const result = await execute('STATUS', { continuation: token });
  assert.equal(result.stage, 'SIGN_IN'); assert.equal(result.signInEnterpriseCode, 'business-a');
  assert.equal(consumeWrites, 1);
});

test('expired proof cannot resolve or continue projecting a SIGN_IN hint', async () => {
  await verified(); await finish();
  assert.equal((await verified()).signInEnterpriseCode, 'business-a');
  time += 301000;
  const result = await execute('STATUS', { continuation: token });
  assert.equal(result.stage, 'SIGN_IN');
  assert.equal(Object.hasOwn(result, 'signInEnterpriseCode'), false);
  faults['Password.get'] = true; await assert.rejects(verified());
  delete faults['Password.get']; time += 301000;
  await assert.rejects(execute('STATUS', { continuation: token }), { code: 'ERR_PROFILE_REG_VERIFY_AGAIN' });
});

test('SIGN_IN projection is bounded and requires verified proof without changing COMPLETE', () => {
  const session = { stage: 'SIGN_IN', email: 'alex@example.test', expiresAt: time + 600000,
    challenge: { status: 'VERIFIED' }, proof: 'private-proof', proofExpiresAt: time + 300000,
    signInEnterpriseCode: 'business-a' };
  for (const stage of ['VERIFY_EMAIL', 'RESOLVING', 'DETAILS', 'RECOVERY', 'NO_INVITATION', 'EXISTING_ACCOUNT', 'APPLICATION_PENDING'])
    assert.equal(Object.hasOwn(owner.project({ ...session, stage }), 'signInEnterpriseCode'), false);
  for (const code of ['', 'x'.repeat(129), '../business-a', ' business-a', 'business-a\n'])
    assert.equal(Object.hasOwn(owner.project({ ...session, signInEnterpriseCode: code }), 'signInEnterpriseCode'), false);
  for (const status of ['PENDING', 'LOCKED', 'EXPIRED', 'CONSUMED'])
    assert.equal(Object.hasOwn(owner.project({ ...session, challenge: { status } }), 'signInEnterpriseCode'), false);
  assert.equal(Object.hasOwn(owner.project({ ...session, proof: undefined }), 'signInEnterpriseCode'), false);
  assert.equal(owner.project({ ...session, stage: 'COMPLETE', proof: undefined,
    challenge: { status: 'CONSUMED' } }).signInEnterpriseCode, 'business-a');
});

test('public start rejects array-shaped email before any message is requested', async () => {
  await assert.rejects(execute('START', { email: ['alex@example.test'] }), error => error.code === 'ERR_PROFILE_REG_INPUT');
  assert.equal(sent.length, 0);
});
test('explicit employee suspension hook is not a browser-forgeable field', async () => {
  const interceptor = require('../src/service/interceptors/defaultEmployeeUpdateInterceptorService');
  const input = { model: { active: false }, options: {}, isRegistration: true };
  await interceptor.employeePreUpdate(input, {});
  assert.equal(input.model.registrationSuspended, true);
  const reactivated = { model: { active: true }, options: {} };
  await interceptor.employeePreUpdate(reactivated, {});
  assert.equal(reactivated.model.registrationSuspended, false);
});

test('a pre-enrolled enterprise administrator follows the same verified flow without a global scope', async () => {
  const invite = get('Assignment', 'authority', 'invite-a');
  invite.roleCode = 'ENTERPRISE_ADMIN'; invite.groupCodes = ['admins'];
  await verified(); const result = await finish();
  assert.equal(result.stage, 'COMPLETE');
  assert.deepEqual(get('Employee', 'business-a', 'alex@example.test').userGroups, ['admins']);
  const scopes = [...table('Scope').values()];
  assert.equal(scopes.length, 1); assert.equal(scopes[0].scopeType, 'ENTERPRISE');
  assert.equal(scopes[0].scopeCode, 'business-a'); assert.equal(scopes[0].effect, 'ALLOW');
});

// Closure regressions use the exact completed record, then alter one authority
// field. They exercise readiness, not the deployed authorization middleware.
for (const [field, value] of [
  ['principalType', 'service'], ['scopeType', 'GLOBAL'],
  ['tenantCode', 'another-tenant'], ['inheritanceMode', 'GROUP'],
  ['groupCode', 'another-group'],
]) {
  test('session readiness rejects altered scope ' + field, async () => {
    await verified(); await finish();
    const person = clone(get('Employee', 'business-a', 'alex@example.test'));
    const item = get('Assignment', 'authority', 'invite-a');
    get('Scope', 'business-a', item.registration.scopeCode)[field] = value;
    await assert.rejects(owner.assertSessionEligible({ person,
      enterprise: { code: 'business-a', tenant: { code: 'business-a' } } }),
    error => error.code === 'ERR_PROFILE_REG_ASSIGNMENT');
  });
}
for (const [field, value] of [
  ['effectiveFrom', 'not-a-date'], ['effectiveTo', 'not-a-date'],
  ['effectiveFrom', () => new Date(time + 1000).toISOString()],
  ['effectiveTo', () => new Date(time).toISOString()],
]) {
  test('session readiness rejects inactive or invalid scope window ' + field + ':' + String(value), async () => {
    await verified(); await finish();
    const person = clone(get('Employee', 'business-a', 'alex@example.test'));
    const item = get('Assignment', 'authority', 'invite-a');
    get('Scope', 'business-a', item.registration.scopeCode)[field] = typeof value === 'function' ? value() : value;
    await assert.rejects(owner.assertSessionEligible({ person,
      enterprise: { code: 'business-a', tenant: { code: 'business-a' } } }),
    error => error.code === 'ERR_PROFILE_REG_ASSIGNMENT');
  });
}
test('session readiness accepts a presently effective direct enterprise scope', async () => {
  await verified(); await finish();
  const item = get('Assignment', 'authority', 'invite-a');
  Object.assign(get('Scope', 'business-a', item.registration.scopeCode), {
    effectiveFrom: new Date(time - 1000).toISOString(), effectiveTo: new Date(time + 1000).toISOString(),
  });
  await owner.assertSessionEligible({ person: clone(get('Employee', 'business-a', 'alex@example.test')),
    enterprise: { code: 'business-a', tenant: { code: 'business-a' } } });
});
test('session readiness rejects changed persisted credential even with an unchanged stamp', async () => {
  await verified(); await finish();
  const person = clone(get('Employee', 'business-a', 'alex@example.test'));
  get('Employee', 'business-a', 'alex@example.test').password = 'different-password-reference';
  await assert.rejects(owner.assertSessionEligible({ person,
    enterprise: { code: 'business-a', tenant: { code: 'business-a' } } }),
  error => error.code === 'ERR_PROFILE_REG_ASSIGNMENT');
});
test('session readiness rejects changed persisted principal type', async () => {
  await verified(); await finish();
  const person = clone(get('Employee', 'business-a', 'alex@example.test'));
  get('Employee', 'business-a', 'alex@example.test').principalType = 'customer';
  await assert.rejects(owner.assertSessionEligible({ person,
    enterprise: { code: 'business-a', tenant: { code: 'business-a' } } }),
  error => error.code === 'ERR_PROFILE_REG_ASSIGNMENT');
});
