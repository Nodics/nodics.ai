/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module wasteCollection/test/wasteAcceptancePolicyContract @description Verifies authoritative accepted-material rule evaluation. @layer test @owner wasteCollection */
const assert = require('assert');
const policy = require('../src/service/defaultWasteAcceptancePolicyService');

const collectionPoint = { code: 'cp-001', collectionPointType: 'RECYCLING_DROP_OFF', acceptanceSummary: { families: ['ELECTRONICS'] } };
const facts = { familyCode: 'ELECTRONICS', categoryCode: 'LAPTOP', itemTypeCode: 'LAPTOP_WORKING', materialTypeCodes: ['LITHIUM_BATTERY'], conditionGrade: 'WORKING', quantity: 1, weight: '2.5' };
const rules = [
    { code: 'rule-accept', collectionPointCode: 'cp-001', categoryCode: 'LAPTOP', decision: 'ACCEPT', requiresPreApproval: true, requiresReceipt: true, status: 'ACTIVE' },
    { code: 'rule-other', collectionPointCode: 'cp-002', categoryCode: 'LAPTOP', decision: 'ACCEPT', status: 'ACTIVE' }
];

let accepted = policy.evaluate({ collectionPoint: collectionPoint, facts: facts, rules: rules });
assert.strictEqual(accepted.accepted, true);
assert.strictEqual(accepted.requiresPreApproval, true);
assert.strictEqual(accepted.requiresReceipt, true);
assert.strictEqual(accepted.matchedRules[0].code, 'rule-accept');

let rejected = policy.evaluate({ collectionPoint: collectionPoint, facts: facts, rules: rules.concat([{ code: 'rule-reject', collectionPointCode: 'cp-001', materialTypeCode: 'LITHIUM_BATTERY', decision: 'REJECT', status: 'ACTIVE' }]) });
assert.strictEqual(rejected.accepted, false);
assert.strictEqual(rejected.reasonCode, 'WASTE_ACCEPTANCE_REJECTED');

let summaryOnly = policy.evaluate({ collectionPoint: collectionPoint, facts: { categoryCode: 'PHONE' }, rules: [] });
assert.strictEqual(summaryOnly.accepted, false);
assert.strictEqual(summaryOnly.reasonCode, 'WASTE_ACCEPTANCE_NO_ACTIVE_RULE');

console.log('Waste acceptance policy contract validated');
