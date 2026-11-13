'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const management = require('../src/service/defaultRuleManagementService');
const facade = require('../src/facade/defaultRuleDefinitionFacade');
const lifecycle = require('../../rulesDefinition/src/service/defaultRuleDefinitionLifecycleService');
const operators = require('../../rulesCore/src/service/defaultRuleOperatorService');
const outcomes = require('../../rulesCore/src/service/defaultRuleOutcomeRegistryService');
const validator = require('../../rulesDefinition/src/service/defaultRuleDefinitionValidationService');
const quality = require('../../rulesEvaluation/src/service/defaultRuleQualityService');

test('authoring projects canonical vocabularies, limits and exact route admission without mutating records', async () => {
  const stored = { code: 'TEST', status: 'DRAFT', draftRevision: 3 };
  global.SERVICE = {
    DefaultRuleDefinitionLifecycleService: { requireRuleSet: async () => stored, assertCode: () => true },
    DefaultRulePropertyCatalogueRegistryService: { getCatalogue: () => ({ code: 'TEST', properties: [] }) },
    DefaultRuleOperatorService: operators, DefaultRuleOutcomeRegistryService: outcomes,
    DefaultRuleDefinitionValidationService: validator, DefaultRuleQualityService: quality,
    DefaultSecuredRequestPipelineService: { hasAcceptedTokenType: () => true, hasAccessGroup: request => request.authData.group === true, hasRoutePermission: request => request.authData.permissions.includes(request.router.permission) },
  };
  try {
    const request = { tenant: 'default', ruleSetCode: 'TEST', authData: { principalType: 'human', tokenType: 'access', principalId: 'reviewer', tenant: 'default', group: true, permissions: ['rules.definition.update'] } };
    const response = await management.getDefinition(request);
    assert.deepEqual(response.data.allowedOperations, ['updateDraft','prepareNextDraft']);
    assert.equal(stored.allowedOperations, undefined);
    assert.equal(management.allowedOperations({ ...request, authData: { ...request.authData, permissions: ['rules.definition.publish'] } }, 'ruleDefinitions').includes('publishDraft'), false);
    assert.deepEqual(management.allowedOperations({ ...request, authData: { ...request.authData, group: false } }, 'ruleDefinitions'), []);
    assert.deepEqual(management.allowedOperations({ ...request, authData: { ...request.authData, principalType: 'service' } }, 'ruleDefinitions'), []);
    assert.deepEqual(management.allowedOperations({ ...request, tenant: 'foreign' }, 'ruleDefinitions'), []);
    const projection = management.propertyCatalogue({ propertyProviderCode: 'TEST' }).data;
    assert.equal(projection.authoring.contractVersion, 1);
    assert.equal(projection.authoring.operators.BETWEEN.valueShape, 'RANGE');
    assert.equal(projection.authoring.operators.IN.valueShape, 'LIST');
    assert.equal(projection.authoring.operators.IS_TRUE.valueShape, 'NONE');
    assert.deepEqual(projection.authoring.limits, validator.limits());
    assert.equal(JSON.stringify(projection).includes('function'), false);
    assert.equal(projection.authoring.outcomeTypes[0].fields[0].code, 'score');
  } finally { delete global.SERVICE; }
});

test('public publication cannot bypass Process even for a publish-capable caller', () => {
  global.CLASSES = { NodicsError: class extends Error { constructor(code,message) { super(message); this.code = code; } } };
  global.SERVICE = { DefaultRuleDefinitionLifecycleService: { publishRuleSetDraft: () => assert.fail('public publisher must not execute') } };
  try { assert.throws(() => facade.publishDraft({ authData: { permissions: ['rules.definition.publish'] }, model: { approvedBy: 'forged' } }), { code: 'ERR_AUTH_00003' }); }
  finally { delete global.CLASSES; delete global.SERVICE; }
});

test('stale explicit draft and unacknowledged compare-and-set cannot become success', () => {
  assert.throws(() => lifecycle.assertExpectedDraft({ model: { expectedDraftRevision: 2 } }, { draftRevision: 3 }), /changed/);
  assert.doesNotThrow(() => lifecycle.assertExpectedDraft({ model: { expectedDraftRevision: 3 } }, { draftRevision: 3 }));
  for (const response of [{ result: { modifiedCount: 0 } }, { result: { acknowledged: true } }, undefined]) assert.throws(() => lifecycle.assertDraftWrite(response), /could not be confirmed/);
  assert.doesNotThrow(() => lifecycle.assertDraftWrite({ result: { modifiedCount: 1 } }));
});
