/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
'use strict';
/** @module inventory/test/inventoryOpeningHumanAdmission @description Proves narrow named schema admission through real generated checks while preserving independent HTTP and opening-owner guards. @layer test @owner inventory */
const test = require('node:test'), assert = require('node:assert/strict');
const path = require('node:path');
const foundation = path.resolve(__dirname, '../../../../../../nodics.foundation/modules');
const database = file => require(path.join(foundation, 'nDatabase/database/src/service', file));
const config = require('../config/properties');
const rawSchemas = require('../src/schemas/schemas').inventory;
const schemaHandler = database('schema/defaultDatabaseSchemaHandlerService');
const access = database('schema/defaultSchemaAccessHandlerService');
const authoring = database('schema/defaultSchemaAuthoringPolicyService');
const owner = require('../src/service/defaultInventoryOpeningReceiptService');
const points = { readAccessPoint: 1, writeAccessPoint: 2, removeAccessPoint: 3, fullAccessPoint: 10 };
const admitted = ['inventoryBalance', 'inventoryMovement', 'inventoryOpeningReceiptRecord'];

/** Materializes the actual named schema policies without generated files or native services. */
function fixture(t, policies = config.schemaPolicies) {
  const previous = { CONFIG: global.CONFIG, SERVICE: global.SERVICE, NODICS: global.NODICS, UTILS: global.UTILS, CLASSES: global.CLASSES };
  t.after(() => Object.assign(global, previous));
  global.CONFIG = { get: key => ({ schemaPolicies: policies, accessPoints: points,
    runtimeRole: { code: 'COMMERCE', publication: 'ONLINE' }, inventory: { publication: { runtimeRole: 'ONLINE' } } })[key] };
  global.UTILS = { isBlank: value => !value || Object.keys(value).length === 0 };
  global.CLASSES = { NodicsError: class extends Error { constructor(code) { super(code); this.code = code; } } };
  const schemas = schemaHandler.applyNamedSchemaPolicies('inventory', structuredClone(rawSchemas));
  global.NODICS = { getModule: () => ({ rawSchema: schemas }) };
  global.SERVICE = { DefaultSchemaAccessHandlerService: access,
    DefaultRecordOwnershipPolicyService: database('access/defaultRecordOwnershipPolicyService'),
    DefaultSecuredRequestPipelineService: {
      getGrantedPermissions: request => request.authData.permissions || [],
      isPermissionGranted: (permission, granted) => granted.includes(permission),
    },
  };
  return schemas;
}

/** Executes the real generated initializer access gate and retains its original request. */
function check(initializer, request) {
  return new Promise((resolve, reject) => initializer.checkAccess.call({ LOG: { debug() {} } }, request, {}, {
    nextSuccess: current => resolve(current), error: (_request, _response, error) => reject(error),
  }));
}

test('only the three opening schemas admit the human group; existing grants and generic authoring guards remain', async t => {
  const schemas = fixture(t), authData = { principalType: 'human', tokenType: 'access', tenant: 'partner',
    enterpriseCode: 'issuer', loginId: 'original-human', userGroups: ['commerceInventoryOpeningUserGroup'],
    permissions: ['commerce.inventory.operate'] };
  const get = database('procs/get/defaultModelsGetInitializerService');
  const save = database('procs/save/defaultModelSaveInitializerService');
  const remove = database('procs/remove/defaultModelsRemoveInitializerService');
  for (const [name, schema] of Object.entries(schemas)) {
    assert.equal(access.getAccessPoint(authData, schema.accessGroups), admitted.includes(name) ? 2 : 0, name);
    for (const group of ['adminGroup', 'commerceOperatorUserGroup', 'serviceAccountUserGroup'])
      assert.equal(access.getAccessPoint({ userGroups: [group] }, schema.accessGroups), 10, name + ':' + group);
  }
  for (const name of admitted) {
    const request = { tenant: 'partner', authData, schemaModel: { rawSchema: schemas[name] }, query: { enterpriseCode: 'issuer' } };
    assert.equal((await check(get, request)).authData, authData);
    assert.equal((await check(save, { ...request, model: {} })).authData, authData);
    await assert.rejects(check(remove, { ...request }), { code: 'ERR_AUTH_00003' });
    await assert.rejects(check(get, { ...request, authData: { userGroups: ['employeeUserGroup'] } }), { code: 'ERR_AUTH_00003' });
  }
  for (const name of ['inventoryBalance', 'inventoryMovement']) {
    assert.deepEqual(schemas[name].backoffice.operations, ['search', 'read']);
    for (const operation of ['create', 'update', 'delete'])
      assert.throws(() => authoring.assertMutationAllowed('inventory', name, operation), { code: 'ERR_AUTH_00003' });
  }
  assert.equal(schemas.inventoryOpeningReceiptRecord.router.enabled, false);
  assert.equal(schemas.inventoryOpeningReceiptRecord.backoffice.enabled, false);
  const request = { tenant: 'partner', authData };
  assert.equal(owner.context(request).authData, authData);
  assert.throws(() => owner.context({ ...request, enterpriseCode: 'foreign' }), { code: 'ERR_AUTH_00003' });
  assert.throws(() => owner.context({ ...request, authData: { ...authData, permissions: ['import.sample.run'] } }), { code: 'ERR_AUTH_00003' });
  assert.throws(() => owner.context({ ...request, authData: { ...authData, principalType: 'service' } }), { code: 'ERR_AUTH_00003' });
});

test('later policy narrowing removes default human admission without touching broad owner grants', t => {
  const policies = structuredClone(config.schemaPolicies);
  policies.inventory.openingReceiptHuman.accessGroups = { partnerReviewedOpeningGroup: 1 };
  const schemas = fixture(t, policies);
  for (const name of admitted) {
    assert.equal(access.getAccessPoint({ userGroups: ['commerceInventoryOpeningUserGroup'] }, schemas[name].accessGroups), 0);
    assert.equal(access.getAccessPoint({ userGroups: ['partnerReviewedOpeningGroup'] }, schemas[name].accessGroups), 1);
    assert.equal(access.getAccessPoint({ userGroups: ['commerceOperatorUserGroup'] }, schemas[name].accessGroups), 10);
  }
});
