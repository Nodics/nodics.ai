'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const workbench = require('../src/service/defaultCopilotWorkbenchService');
const policy = require('../../copilotPolicy/src/service/defaultCopilotPolicyService');

test('product preparation clarifies first and execution is bound to confirmed payload', async () => {
    assert.deepEqual(workbench.prepareProducts({ count: 10, name: 'iPhone Pro Max' }).missing, ['codePrefix', 'catalogVersion', 'priceBookCode', 'currency', 'price']);
    const plan = workbench.validate(workbench.prepareProducts({ count: 10, name: 'iPhone Pro Max', codePrefix: 'iphone-pro-max', catalogVersion: 'electronics-online', priceBookCode: 'uae-retail', currency: 'AED', price: 4999, planId: 'p1' }), () => []);
    const prepareContext = { tenant: 'default', actor: 'admin', permissions: ['copilot.mutation.prepare'] };
    const executeContext = { tenant: 'default', actor: 'admin', permissions: ['copilot.mutation.execute'] };
    const confirmation = Object.assign(workbench.createConfirmation(plan, prepareContext, policy), { confirmed: true });
    const result = await workbench.execute(plan, confirmation, executeContext, async request => ({ accepted: true, count: request.records.length }), policy);
    assert.equal(result.result.count, 10);
    await assert.rejects(workbench.execute(Object.assign({}, plan, { records: plan.records.slice(0, 9) }), confirmation, executeContext, async () => true, policy), /COPILOT_MUTATION_PLAN_MISMATCH/);
});
