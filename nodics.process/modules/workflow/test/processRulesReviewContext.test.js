'use strict';
const test = require('node:test'), assert = require('node:assert/strict');
const lifecycle = require('../src/service/operation/defaultProcessRuntimeLifecycleService');
const source = require('../../../../nodics.rulesEngine/modules/rulesApi/data/init-v002/records/process/rulesPolicyApprovalDefinitionData').definitions[0];
test('Rules workflow declares permission-bound human approval and exact immutable review identity', () => {
  const version = { ...source, definitionCode: source.code, version: 2, status: 'PUBLISHED' };
  const instance = { definitionCode: source.code, version: 2, context: { ruleSetCode: 'TEST', draftRevision: 3, enterpriseCode: 'default', requestedBy: 'admin', privateValue: 'do-not-project' } };
  assert.deepEqual(lifecycle.taskDecisionContract(source.policy), source.policy.decisionContract);
  assert.deepEqual(lifecycle.taskRulesReviewContext(instance,version), { contractVersion: 1, owner: 'rulesApi', ruleSetCode: 'TEST', draftRevision: 3 });
  assert.equal(lifecycle.taskRulesReviewContext(instance,{ ...version, version: 1 }), undefined);
  assert.equal(lifecycle.taskRulesReviewContext(instance,{ ...version, graph: { nodes: [] } }), undefined);
  assert.equal(lifecycle.taskRulesReviewContext({ ...instance, context: { ...instance.context, draftRevision: '3' } },version), undefined);
});
