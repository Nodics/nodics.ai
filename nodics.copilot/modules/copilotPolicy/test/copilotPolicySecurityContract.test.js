/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const policy = require('../src/service/defaultCopilotPolicyService');
const configuration = require('../config/properties').copilot.policy;

test('security contexts are normalized, immutable, and fail closed', () => {
    const publicContext = policy.normalizeSecurityContext({ channel: 'nexus_public', permissions: ['copilot.record.delete'] }, configuration);
    assert.equal(publicContext.actor, 'anonymous');
    assert.equal(publicContext.principalType, 'ANONYMOUS');
    assert.deepEqual(publicContext.permissions, []);
    assert.equal(Object.isFrozen(publicContext), true);
    assert.equal(Object.isFrozen(publicContext.permissions), true);
    assert.throws(() => policy.normalizeSecurityContext({ channel: 'axis_employee', actor: 'employee' }, configuration), /COPILOT_SECURITY_CONTEXT_INVALID/);
    assert.throws(() => policy.normalizeSecurityContext({ channel: 'unknown' }, configuration), /COPILOT_SECURITY_CONTEXT_INVALID/);
});

test('public Nexus can use only explicitly public read-only capabilities', () => {
    const context = policy.normalizeSecurityContext({ channel: 'NEXUS_PUBLIC' }, configuration);
    assert.equal(policy.decideCapabilityAccess({ code: 'docs.search', riskClass: 'PUBLIC_READ', public: true, mutates: false }, context).allowed, true);
    assert.equal(policy.decideCapabilityAccess({ code: 'employee.list', riskClass: 'SENSITIVE_READ', permission: 'employee.read' }, context).allowed, false);
    assert.equal(policy.decideCapabilityAccess({ code: 'record.create', riskClass: 'CREATE', public: true, mutates: true }, context).allowed, false);
    assert.equal(policy.decideCapabilityAccess({ code: 'data.export', riskClass: 'PUBLIC_READ', public: true, export: true }, context).allowed, false);
    assert.equal(policy.decideCapabilityAccess({ code: 'hidden.read', riskClass: 'PUBLIC_READ', public: false }, context).allowed, false);
    assert.equal(policy.decideCapabilityAccess({ code: 'unknown', riskClass: 'UNCLASSIFIED', public: true }, context).allowed, false);
});

test('source decisions enforce publication, permission, channel, and tenant scope', () => {
    const publicContext = policy.normalizeSecurityContext({ channel: 'NEXUS_PUBLIC' }, configuration);
    const axisViewer = policy.normalizeSecurityContext({ channel: 'AXIS_EMPLOYEE', actor: 'e1', tenant: 't1' }, configuration);
    const axisAdmin = policy.normalizeSecurityContext({ channel: 'AXIS_EMPLOYEE', actor: 'admin', tenant: 't1', permissions: ['copilot.knowledge.internal.read', 'copilot.knowledge.restricted.read', 'copilot.knowledge.customer.read'] }, configuration);
    const publicSource = { classification: 'PUBLIC', public: true, lifecycle: 'ONLINE', allowedChannels: ['NEXUS_PUBLIC', 'AXIS_EMPLOYEE'] };
    const internalSource = { classification: 'INTERNAL', allowedChannels: ['AXIS_EMPLOYEE'], tenantScopes: ['t1'] };
    const restrictedSource = { classification: 'RESTRICTED', allowedChannels: ['AXIS_EMPLOYEE'], tenantScopes: ['t2'] };
    assert.equal(policy.decideSourceAccess(publicSource, publicContext, configuration).allowed, true);
    assert.equal(policy.decideSourceAccess(Object.assign({}, publicSource, { lifecycle: 'STAGED' }), publicContext, configuration).allowed, false);
    assert.equal(policy.decideSourceAccess(internalSource, publicContext, configuration).allowed, false);
    assert.equal(policy.decideSourceAccess(internalSource, axisViewer, configuration).allowed, false);
    assert.equal(policy.decideSourceAccess(internalSource, axisAdmin, configuration).allowed, true);
    assert.equal(policy.decideSourceAccess(restrictedSource, axisAdmin, configuration).reason, 'TENANT_SCOPE_FORBIDDEN');
});

test('confirmation never elevates execution authority', () => {
    const plan = { id: 'p1', schema: 'product', records: [{ code: 'p-1' }], preview: { count: 1 } };
    const confirmation = Object.assign(policy.createConfirmation(plan, { tenant: 't1', actor: 'e1', permissions: ['copilot.mutation.prepare'] }), { confirmed: true });
    assert.throws(() => policy.authorizeExecution(confirmation, { tenant: 't1', actor: 'e1', permissions: [] }, plan), /COPILOT_MUTATION_EXECUTE_FORBIDDEN/);
    assert.equal(policy.authorizeExecution(confirmation, { tenant: 't1', actor: 'e1', permissions: ['copilot.mutation.execute'] }, plan), true);
    assert.throws(() => policy.authorizeExecution(confirmation, { tenant: 't1', actor: 'e1', permissions: ['copilot.mutation.execute'] }, Object.assign({}, plan, { records: [{ code: 'tampered' }] })), /COPILOT_MUTATION_PLAN_MISMATCH/);
});
