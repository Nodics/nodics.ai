/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module profile/test/platformAdministratorFullAccess
 * @description Exercises reserved authority and reviewed native-account adoption with real governance/stamp owners and isolated persistence.
 * @owner profile @layer test
 */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const employeeSource = require('../src/service/employee/defaultEmployeeService');
const principal = require('../src/service/identity/defaultPrincipalGovernanceService');
const catalogueSource = require('../src/service/identity/defaultIdentityCatalogueService');
const catalogueGovernance = require('../src/service/identity/defaultIdentityCatalogueGovernanceService');
const groupGovernance = require('../src/service/group/defaultUserGroupGovernanceService');
const stamps = require('../src/service/identity/defaultPrincipalSecurityStampGovernanceService');
const team = require('../src/service/enterprise/defaultEnterpriseTeamAdministrationService');
const groupCode = 'platformAdministratorUserGroup';

function matches(row, query) {
  return Object.entries(query).every(([field, value]) => {
    if (field === '$or') return value.some(part => matches(row, part));
    const actual = field.split('.').reduce((item, name) => item?.[name], row);
    if (value && Object.hasOwn(value, '$exists')) return (actual !== undefined) === value.$exists;
    if (value && Object.hasOwn(value, '$in')) return value.$in.includes(actual);
    return JSON.stringify(actual) === JSON.stringify(value);
  });
}

function fixture(t) {
  const previous = Object.fromEntries(['CONFIG', 'CLASSES', 'SERVICE', 'UTILS'].map(key => [key, global[key]]));
  t.after(() => Object.assign(global, previous));
  const config = { defaultTenant: 'authority', defaultEnterprise: 'PLATFORM',
    enterpriseManagement: { teamAdministration: { genericMutationGuard: { enabled: true } } },
    identityGovernance: { principalPolicy: { allowedTypes: ['human', 'service', 'customer'],
      serviceType: 'service', serviceGroup: 'serviceAccountUserGroup', minimumServiceApiKeyLength: 32 } } };
  global.CONFIG = { get: key => config[key] };
  global.CLASSES = { NodicsError: class extends Error { constructor(code, message) { super(message || code); this.code = code; } } };
  global.UTILS = { isObject: value => value && typeof value === 'object' };
  const person = { _id: 'native-admin-id', code: 'admin', loginId: 'admin', active: true, principalType: 'human',
    userGroups: ['adminGroup', 'runtimeConfigAdminUserGroup', 'retainedMembership'], password: 'credential-reference', authVersion: 7 };
  const records = [person], permissions = [{ _id: 'full', code: '*', name: 'Full', ownerModule: 'profile', active: true }];
  const groups = [...person.userGroups, groupCode].map(code => ({ _id: code, code, active: true,
    permissions: code === groupCode ? ['*'] : [] }));
  const enterprises = [{ _id: 'platform-id', code: 'PLATFORM', tenant: 'authority', active: true }];
  const state = { fresh: true, bootstrap: false }, writes = [], registered = [], audits = [];
  const envelope = rows => ({ code: 'SUC_READ', count: rows.length, result: structuredClone(rows) });
  const port = rows => ({ get: async request => envelope(rows.filter(row => matches(row, request.query || {}))) });
  const catalogue = { ...catalogueSource, rows: async (name, query) => {
    const rows = name === 'DefaultPermissionService' ? permissions : groups;
    return structuredClone(rows.filter(row => matches(row, query)));
  } };
  const owner = { ...employeeSource, ...port(records), update: async request => {
    SERVICE.DefaultLoggerService.assertSensitiveRequest(request);
    writes.push(structuredClone(request));
    const ownsWrite = value => owner.ownsPlatformAdministratorAdoption(value) ||
      SERVICE.DefaultEnterpriseBusinessAccessService?.ownsEmployeeWrite(value) === true;
    assert.equal(ownsWrite(request), true);
    assert.equal(owner.ownsPlatformAdministratorAdoption({ ...request }), false);
    assert.equal(ownsWrite({ ...request }), false);
    const initializer = require('../../../../nodics.foundation/modules/nDatabase/database/src/service/procs/update/defaultModelsUpdateInitializerService');
    initializer.buildQuery.call({ LOG: { debug() {} } }, request, {}, { nextSuccess() {} });
    assert.equal(ownsWrite(request), true, 'generated update normalization preserves the held proof');
    request.options.upsert = true;
    assert.equal(ownsWrite(request), false);
    delete request.options.upsert;
    request.options.snapshot = true;
    assert.equal(ownsWrite(request), false, 'normalization cannot enable snapshot execution');
    request.options.snapshot = false;
    request.options.explain = true;
    assert.equal(ownsWrite(request), false, 'normalization cannot enable explain execution');
    request.options.explain = false;
    request.schemaModel = { schemaName: 'employee' };
    await team.protectAdministratorEmployee(request, 'update');
    if (state.beforeUpdate) state.beforeUpdate(request);
    await principal.validateUpdate(request);
    await stamps.preparePrincipalUpdate(request);
    const selected = records.filter(row => matches(row, request.query));
    selected.forEach(row => Object.assign(row, structuredClone(request.model)));
    if (selected.length === 1) await stamps.registerPreparedPrincipalUpdate(request);
    if (state.afterUpdate) state.afterUpdate(request);
    return { code: 'SUC_UPDATE', result: { acknowledged: true, matchedCount: selected.length } };
  } };
  global.SERVICE = {
    DefaultLoggerService: { assertSensitiveRequest() {}, inheritRequestPrivacy() {} },
    DefaultEmployeeService: owner, DefaultPrincipalGovernanceService: principal,
    DefaultUserGroupService: port(groups), DefaultEnterpriseService: port(enterprises),
    DefaultIdentityCatalogueService: catalogue, DefaultIdentityCatalogueGovernanceService: catalogueGovernance,
    DefaultPrincipalSecurityStampGovernanceService: stamps,
    DefaultIdentityGovernanceService: { getSystemAuthData: () => ({ isSystem: true }) },
    DefaultEnterpriseManagementService: { isPlatformAdministrator: auth => auth.entCode === 'PLATFORM' && auth.userGroups.includes('adminGroup') },
    DefaultAuthenticationProviderService: { resolveSessionUserGroups: person => person.userGroups.map(group => group.code || group) },
    DefaultEnterpriseMembershipService: {
      verifyAuthenticatedActor: async () => { if (!state.fresh) throw new Error('stale actor'); },
      read: async () => structuredClone(person),
      groups: async (_tenant, codes) => groups.filter(group => codes.includes(group.code)),
    },
    DefaultDataReleaseService: { isIdentityAuthorityReleaseExecution: () => state.bootstrap },
    DefaultPrincipalSecurityStampService: {
      reserveVersion: async (_tenant, minimum) => Math.max(8, minimum),
      register: async (tenant, key, version) => { registered.push({ tenant, key, version }); return true; },
    },
    DefaultAuthAuditService: { record: async event => { audits.push(structuredClone(event)); return event; } },
  };
  const request = { tenant: 'authority', authData: { tenant: 'authority', entCode: 'PLATFORM', loginId: 'admin',
    tokenType: 'access', principalType: 'human', authenticationMethod: 'PASSWORD', userGroups: ['adminGroup'], authVersion: 7 },
    target: { code: 'admin', loginId: 'admin' } };
  const reviewed = async () => ({ ...request, confirmed: true,
    reviewFingerprint: (await owner.inspectPlatformAdministratorAdoption(request)).reviewFingerprint });
  return { config, person, groups, permissions, enterprises, state, owner, catalogue, request, reviewed, writes, registered, audits };
}

test('full access is explicit active vocabulary; shared enterprise groups and roles never gain it', async t => {
  const f = fixture(t);
  assert.equal((await f.catalogue.requirePermissions(['*'])).length, 1);
  assert.throws(() => f.catalogue.codes(['*']));
  f.permissions[0].active = false;
  await assert.rejects(f.catalogue.requirePermissions(['*']));
  const seeds = Object.values(require('../data/init-v001/records/identity/profileUserGroupData'));
  assert.deepEqual(seeds.find(row => row.code === groupCode).permissions, ['*']);
  assert.equal(seeds.find(row => row.code === 'adminGroup').permissions.includes('*'), false);
  const installed = [];
  for (const row of seeds) {
    groupGovernance.validateGraph([row], installed);
    installed.push(row);
  }
  await assert.rejects(groupGovernance.validatePermissions([{ code: 'adminGroup', permissions: ['*'] }]));
  assert.throws(() => groupGovernance.validateGraph([{ code: 'enterpriseRole', active: true, parentGroups: [groupCode] }], f.groups), /cannot be inherited/);
  await assert.rejects(catalogueGovernance.validateRecord('enterpriseRole', {
    code: 'ENTERPRISE_ADMIN', name: 'Enterprise', active: true, scopeType: 'ENTERPRISE', delegable: true,
    groupCodes: [groupCode], assignmentPermissions: [] }));
});

test('principal assignment rejects service, customer, business tenant, enterprise and linked identity paths', async t => {
  const f = fixture(t);
  const base = { tenant: 'authority', schemaModel: { schemaName: 'employee' }, authData: f.request.authData,
    model: { ...f.person, userGroups: [groupCode] } };
  await principal.validateSave(base);
  for (const model of [
    { principalType: 'service', userGroups: [groupCode, 'serviceAccountUserGroup'] },
    { principalType: 'customer' }, { metadata: { enterpriseCode: 'BUSINESS' } },
    { enterpriseCode: 'BUSINESS' }, { registrationAssignmentCode: 'invitation' },
    { authenticationIdentity: { recordId: 'linked' } }, { identityLinkRetirement: true },
    { apiKeyScopes: ['*'] },
  ]) await assert.rejects(principal.validateSave({ ...base, model: { ...base.model, ...model } }));
  await assert.rejects(principal.validateSave({ ...base, tenant: 'business' }));
  await assert.rejects(principal.validateSave({ ...base, schemaModel: { schemaName: 'customer' } }));
  for (const update of [{ $push: { userGroups: groupCode } }, { $set: { 'userGroups.0': groupCode } },
    { $set: { 'metadata.enterpriseCode': 'BUSINESS' } }]) assert.throws(() => principal.applyUpdate(f.person, update));
  f.state.fresh = false;
  await assert.rejects(principal.validateSave(base), /stale actor/);
});

test('private bootstrap creates full-control admin only in authority partition without a public system bypass', async t => {
  const f = fixture(t);
  f.state.fresh = false; f.state.bootstrap = true;
  const request = { tenant: 'authority', schemaModel: { schemaName: 'employee' }, options: { insertOnly: true },
    authData: { isSystem: true }, model: { ...f.person, userGroups: [groupCode] } };
  await principal.validateSave(request);
  await assert.rejects(principal.validateSave({ ...request, tenant: 'business' }));
  f.state.bootstrap = false;
  await assert.rejects(principal.validateSave(request));
});

test('existing owner stamp-only invalidation stays available; system authority cannot alter platform membership', async t => {
  const f = fixture(t);
  f.person.userGroups.push(groupCode);
  const request = { tenant: 'authority', schemaModel: { schemaName: 'employee' },
    authData: { isSystem: true }, query: { _id: f.person._id }, model: { authVersion: 8 } };
  await principal.validateUpdate(request);
  await assert.rejects(principal.validateUpdate({ ...request, model: { userGroups: ['adminGroup'] } }));
  await assert.rejects(principal.validateUpdate({ ...request, model: { userGroups: [...f.person.userGroups] } }));
});

test('reserved group updates by database id and removal require fresh Platform authority', async t => {
  const f = fixture(t);
  const request = { ...f.request, query: { _id: groupCode }, model: { permissions: [] } };
  await groupGovernance.validate(request);
  await groupGovernance.validateRemoval(request);
  f.state.fresh = false;
  await assert.rejects(groupGovernance.validate(request), /stale actor/);
  await assert.rejects(groupGovernance.validateRemoval(request), /stale actor/);
  f.state.fresh = true;
  await assert.rejects(groupGovernance.validate({ ...request, model: { code: 'ordinaryGroup' } }), /identity cannot change/);
});

test('all shared group mutation interceptors require fresh Platform admission, with exact insert-only import exception', async t => {
  const f = fixture(t);
  SERVICE.DefaultUserGroupGovernanceService = groupGovernance;
  const interceptors = Object.values(require('../src/interceptors/interceptors'));
  for (const trigger of ['preSave', 'preUpdate', 'preRemove']) {
    const hook = interceptors.find(item => item.item === 'userGroup' && item.trigger === trigger &&
      item.handler.startsWith('DefaultUserGroupGovernanceService.'));
    assert.ok(hook, trigger);
    const method = hook.handler.split('.')[1];
    const request = { ...f.request, model: { code: trigger === 'preSave' ? 'ordinaryGroup' : 'retainedMembership', active: true, permissions: [] },
      ...(trigger === 'preSave' ? {} : { query: { code: 'retainedMembership' } }) };
    await groupGovernance[method](request);
    for (const override of [{ entCode: 'BUSINESS' }, { principalType: 'service' }, { isSystem: true }])
      await assert.rejects(groupGovernance[method]({ ...request, authData: { ...request.authData, ...override } }));
    f.state.fresh = false;
    await assert.rejects(groupGovernance[method](request), /stale actor/);
    f.state.fresh = true;
  }
  f.state.bootstrap = true;
  const request = { tenant: 'business', authData: { isSystem: true }, options: { insertOnly: true },
    model: { code: 'ordinaryGroup', active: true, permissions: [] } };
  SERVICE.DefaultUserGroupService.save = async command => {
    await groupGovernance.validate(command);
    await assert.rejects(groupGovernance.validate({ ...command }));
    await assert.rejects(groupGovernance.validate({ ...command, query: { code: 'ordinaryGroup' } }));
    return true;
  };
  assert.equal(await catalogueGovernance.createReference(SERVICE.DefaultUserGroupService, request), true);
  await assert.rejects(groupGovernance.validate(request));
});

test('refresh issuance rejects leaked wildcard and linked or non-Platform sessions before writing credentials', async t => {
  fixture(t);
  const authSource = require('../src/service/authentication/defaultAuthenticationProviderService');
  let tokens = 0;
  const authentication = { ...authSource, addToken: async () => { tokens++; return true; } };
  SERVICE.DefaultSecuredRequestPipelineService = require('../../../../nodics.foundation/modules/nRouter/src/service/request/defaultSecuredRequestPipelineService');
  SERVICE.DefaultAuthSecurityService = { validateAuthorizationPolicy: () => {}, getAuthorizationPolicyVersion: () => 1 };
  const session = { principalType: 'human', authenticationMethod: 'PASSWORD', tenant: 'authority', entCode: 'PLATFORM',
    userGroups: [groupCode], permissions: ['*'] };
  await authentication.createRefreshToken(session);
  for (const override of [{ principalType: 'service' }, { principalType: 'customer' }, { entCode: 'BUSINESS' },
    { tenant: 'business' }, { sessionContext: {} }, { authenticationMethod: 'API_KEY' },
    { userGroups: ['adminGroup'] }, { isSystem: true }])
    await assert.rejects(authentication.createRefreshToken({ ...session, ...override }));
  assert.equal(tokens, 1);
});

test('reviewed adoption preserves credentials/memberships and executes real principal/stamp hooks with exact audit', async t => {
  const f = fixture(t), original = structuredClone(f.person);
  const request = await f.reviewed();
  assert.equal(f.writes.length, 0);
  assert.deepEqual(await f.owner.adoptPlatformAdministrator(request), { code: 'admin', changed: true });
  assert.deepEqual(f.person, { ...original, userGroups: [...original.userGroups, groupCode], authVersion: 8 });
  assert.deepEqual(f.writes[0].model, { userGroups: [...original.userGroups, groupCode] });
  assert.deepEqual(f.writes[0].query.userGroups, original.userGroups);
  assert.equal(f.writes[0].query.password, original.password);
  assert.equal(f.writes[0].query.authVersion, original.authVersion);
  assert.deepEqual(f.registered.map(row => row.key), ['admin', 'identity:EMPLOYEE:native-admin-id']);
  assert.deepEqual(f.audits.map(event => event.outcome), ['REQUESTED', 'SUCCESS']);
  assert.equal(f.audits[0].source.targetCode, 'admin');
  assert.equal(f.audits[0].source.targetLoginId, 'admin');
  assert.equal(f.audits[0].source.actorLoginId, 'admin');
  assert.equal(JSON.stringify(f.audits).includes('credential-reference'), false);
  assert.equal(f.owner.ownsPlatformAdministratorAdoption(f.writes[0]), false);
  await assert.rejects(f.owner.adoptPlatformAdministrator(request));
  assert.deepEqual(await f.owner.adoptPlatformAdministrator(await f.reviewed()), { code: 'admin', changed: false });
  assert.equal(f.writes.length, 1);
});

for (const [label, change] of [
  ['groups', f => f.person.userGroups.push('newMembership')],
  ['credential', f => f.person.password = 'new-credential-reference'],
  ['stamp', f => f.person.authVersion++],
  ['group definition', f => f.groups.find(row => row.code === groupCode).name = 'Reviewed later'],
  ['revoked group', f => f.groups.find(row => row.code === groupCode).active = false],
  ['inactive target', f => f.person.active = false],
  ['enterprise placement', f => f.enterprises[0].tenant = 'business'],
  ['stale actor', f => f.state.fresh = false],
]) test('adoption rejects changed ' + label + ' without writes', async t => {
  const f = fixture(t), request = await f.reviewed();
  change(f);
  await assert.rejects(f.owner.adoptPlatformAdministrator(request));
  assert.equal(f.writes.length, 0);
});

test('adoption fences concurrent changes, audit failure and uncertain writes without replay', async t => {
  const f = fixture(t), request = await f.reviewed();
  SERVICE.DefaultAuthAuditService.record = async () => false;
  await assert.rejects(f.owner.adoptPlatformAdministrator(request));
  assert.equal(f.writes.length, 0);
  SERVICE.DefaultAuthAuditService.record = async event => event;
  f.state.beforeUpdate = () => f.person.userGroups.push('concurrent');
  await assert.rejects(f.owner.adoptPlatformAdministrator(request));
  assert.equal(f.writes.length, 1);
  assert.equal(f.person.userGroups.includes(groupCode), false);
  f.state.beforeUpdate = undefined;
  f.groups.push({ code: 'concurrent', active: true });
  f.state.afterUpdate = () => { throw new Error('uncertain acknowledgement'); };
  await assert.rejects(f.owner.adoptPlatformAdministrator(await f.reviewed()), /uncertain acknowledgement/);
  assert.equal(f.person.userGroups.includes(groupCode), true);
  assert.equal(f.writes.length, 2);
});

test('existing migration HTTP family previews/applies for old admin without circular full-access admission', async t => {
  const f = fixture(t);
  const controller = require('../src/controller/identity/defaultIdentityGovernanceController');
  const migration = require('../src/service/identity/defaultIdentityGovernanceMigrationService');
  const router = require('../../../../nodics.foundation/modules/nRouter/src/service/request/defaultSecuredRequestPipelineService');
  const routes = require('../src/router/routers').profile.identityMigration;
  const admitted = new WeakSet(), headers = [];
  SERVICE.DefaultLoggerService = {
    assertSensitiveRequest: request => { if (!admitted.has(request)) throw new Error('private admission required'); },
    inheritRequestPrivacy: (target, source) => { assert.ok(admitted.has(source)); admitted.add(target); },
  };
  SERVICE.DefaultIdentityGovernanceMigrationService = migration;
  SERVICE.DefaultSecuredRequestPipelineService = router;
  SERVICE.DefaultEnterpriseMembershipService.permission = require('../src/service/enterprise/defaultEnterpriseMembershipService').permission;
  SERVICE.DefaultEnterpriseMembershipService.fail = () => { throw new Error('forbidden permission'); };
  const oldGroups = Object.values(require('../data/init-v001/records/identity/profileUserGroupData'))
    .concat(Object.values(require('../../../../nodics.foundation/modules/nConfig/data/init-v001/records/identity/configUserGroupData')))
    .filter(group => ['adminGroup', 'runtimeConfigAdminUserGroup'].includes(group.code));
  f.request.authData.userGroups = oldGroups.map(group => group.code);
  f.request.authData.permissions = [...new Set(oldGroups.flatMap(group => group.permissions || []))];
  assert.equal(f.request.authData.permissions.includes('*'), false);
  f.request.httpRequest = { body: { target: { code: 'admin', loginId: 'admin' } } };
  f.request.httpResponse = { setHeader: (...args) => headers.push(args) };
  admitted.add(f.request);
  for (const definition of [routes.platformAdministratorPreview, routes.platformAdministratorApply]) {
    assert.deepEqual(definition.authTokenTypes, ['access']);
    assert.deepEqual(definition.requestPrivacy, { sensitive: true });
    assert.equal(definition.cache.enabled, false);
    let allowed = false;
    router.checkAccess({ ...f.request, router: definition }, {}, { nextSuccess: () => { allowed = true; }, error: () => {} });
    assert.equal(allowed, true, 'old persisted admin permissions admit the route');
  }
  const preview = await controller.previewPlatformAdministrator(f.request);
  assert.equal(preview.code, 'SUC_SYS_00000');
  assert.equal(f.writes.length, 0);
  assert.equal(JSON.stringify(preview).includes('credential-reference'), false);
  f.request.httpRequest.body = { target: { code: 'admin', loginId: 'admin' }, confirmed: true,
    reviewFingerprint: preview.data.reviewFingerprint };
  const result = await new Promise((resolve, reject) => controller.applyPlatformAdministrator(f.request,
    (error, value) => error ? reject(error) : resolve(value)));
  assert.deepEqual(result.data, { code: 'admin', changed: true });
  assert.deepEqual(headers, [['Cache-Control', 'no-store'], ['Cache-Control', 'no-store']]);
  assert.equal(f.writes.length, 1);
  assert.throws(() => controller.previewPlatformAdministrator({ ...f.request }), /private admission/);
  f.request.identityMigration = { target: f.request.target, tenant: 'business' };
  await assert.rejects(migration.previewPlatformAdministrator(f.request), /Exact Platform/);
  f.request.identityMigration = { target: f.request.target };
  f.request.authData.permissions = [];
  await assert.rejects(migration.previewPlatformAdministrator(f.request), /forbidden permission/);
  assert.equal(f.writes.length, 1);
});

test('business-access native private writes coexist with Platform membership and generated Employee governance', async t => {
  const f = fixture(t);
  f.person.userGroups.push(groupCode, 'businessView');
  f.groups.push({ code: 'businessView', active: true }, { code: 'businessEdit', active: true });
  const original = structuredClone(f.person);
  const context = { tenantCode: 'authority', enterprise: f.enterprises[0],
    roles: { VIEW: { groupCodes: ['businessView'] }, EDIT: { groupCodes: ['businessEdit'] } },
    areas: [{ code: 'products', levels: [{ value: 'view', roleCode: 'VIEW' }, { value: 'edit', roleCode: 'EDIT' }] }],
    groupAreas: new Map([['businessView', 'products'], ['businessEdit', 'products']]) };
  // Isolate already-admitted business context; use the actual change, Team, principal and stamp owners below.
  const business = { ...require('../src/service/enterprise/defaultEnterpriseBusinessAccessService'),
    context: async () => context,
    inventory: async () => [{ person: structuredClone(f.person), groupCodes: [...f.person.userGroups] }],
    rows: async () => [structuredClone(f.person)] };
  SERVICE.DefaultEnterpriseBusinessAccessService = business;
  SERVICE.DefaultEnterpriseMembershipService.permission = () => true;
  const target = (await business.inventory())[0];
  const result = await business.change({ ...f.request, body: { employeeCode: 'admin', operationId: 'business-access-test-001',
    reviewFingerprint: business.projection(target, context).reviewFingerprint,
    changes: [{ businessArea: 'products', accessLevel: 'edit' }] } });
  assert.deepEqual(result, { employeeCode: 'admin', changed: true });
  assert.deepEqual(f.person, { ...original, userGroups: original.userGroups.filter(group => group !== 'businessView').concat('businessEdit'), authVersion: 8 });
  assert.equal(f.registered.length, 2);
  assert.equal(f.audits.every(event => event.eventType === 'identity.business_access.change'), true);
});

test('linked current business groups are effective without inheriting native Platform full access', t => {
  fixture(t);
  const membership = require('../src/service/enterprise/defaultEnterpriseMembershipService');
  const business = require('../src/service/enterprise/defaultEnterpriseBusinessAccessService');
  const router = require('../../../../nodics.foundation/modules/nRouter/src/service/request/defaultSecuredRequestPipelineService');
  SERVICE.DefaultEnterpriseBusinessAccessService = business;
  const item = { groupCodes: ['originalInvitationGroup'], membership: { businessAccess: {
    version: 1, groupCodes: ['currentBusinessEdit'], operationId: 'business-access-test-002' } } };
  assert.deepEqual(membership.currentGroupCodes(item), ['currentBusinessEdit']);
  assert.deepEqual(item.groupCodes, ['originalInvitationGroup']);
  const auth = { tenant: 'authority', entCode: 'PLATFORM', tokenType: 'access', principalType: 'human',
    authenticationMethod: 'PASSWORD', userGroups: [groupCode, ...membership.currentGroupCodes(item)], permissions: ['*'],
    sessionContext: { owner: 'profile.enterpriseMembership' } };
  assert.equal(router.hasPlatformFullAccess({ tenant: 'authority', authData: auth }), false);
  assert.deepEqual(router.getGrantedPermissions({ authData: auth }), []);
});
