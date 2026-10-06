/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @file Verifies retention preview never deletes, bypasses holds or reads transcript content. */
'use strict';
const { test, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const owner = require('../src/service/defaultCopilotConversationLifecycleService');
const transcript = require('../src/service/defaultCopilotTranscriptService');
let configuration, request, rows, reads;
beforeEach(() => {
    configuration = {
        retentionDays: 90,
        lifecycle: {
            deletionEnabled: false,
            enterprisePolicies: [
                {
                    tenantCode: 'tenant',
                    enterpriseCode: 'acme',
                    retentionDays: 30,
                    holdAll: false,
                    conversationCodes: ['held'],
                },
            ],
        },
    };
    request = {
        tenant: 'tenant',
        authData: {
            enterpriseCode: 'acme',
            permissions: ['copilot.activity.lifecycle.read'],
        },
    };
    rows = ['held', 'expired', 'active', 'invalid'].map((code) => ({
        code,
        tenantCode: 'tenant',
        enterpriseCode: 'acme',
        updatedAt: code === 'invalid' ? null : '2000-01-01T00:00:00Z',
        state: code === 'active' ? 'OPEN' : 'CLOSED',
    }));
    reads = 0;
    global.CLASSES = {
        NodicsError: class extends Error {
            constructor(code) {
                super(code);
                this.code = code;
            }
        },
    };
    global.CONFIG = { get: () => ({ conversation: configuration }) };
    global.SERVICE = {
        DefaultCopilotActivityService: {
            scope: (r) => ({
                tenantCode: r.tenant,
                enterpriseCode: r.authData.enterpriseCode,
            }),
        },
        DefaultCopilotConversationService: {
            assertStorage: () => 'GENERATED_SERVICE',
        },
        DefaultCopilotTranscriptService: transcript,
        DefaultCopilotConversationRecordService: {
            get: async (r) => {
                reads++;
                assert.deepEqual(r.query, {
                    tenantCode: 'tenant',
                    enterpriseCode: 'acme',
                });
                return { code: 'SUC_TEST', result: rows };
            },
        },
    };
});
test('preview preserves holds, active conversations and unknown dates without content access', async () => {
    const result = await owner.preview(request, configuration);
    assert.deepEqual(
        result.items.map((item) => item.state),
        ['HELD', 'EXPIRED_REVIEW_REQUIRED', 'ACTIVE', 'UNKNOWN'],
    );
    assert.equal(result.policy.destructiveExecution, false);
    assert.equal(reads, 1);
    configuration.lifecycle.enterprisePolicies[0].holdAll = true;
    assert.ok(
        (await owner.preview(request, configuration)).items.every(
            (item) => item.state === 'HELD',
        ),
    );
});
test('malformed policy, duplicate scope, zero duration and destructive enablement fail closed', () => {
    const scope = { tenantCode: 'tenant', enterpriseCode: 'acme' };
    configuration.lifecycle.enterprisePolicies.push(
        configuration.lifecycle.enterprisePolicies[0],
    );
    assert.throws(() => owner.policy(configuration, scope));
    configuration.lifecycle.enterprisePolicies.pop();
    configuration.lifecycle.enterprisePolicies[0].retentionDays = 0;
    assert.throws(() => owner.policy(configuration, scope));
    configuration.lifecycle.enterprisePolicies[0].retentionDays = 30;
    configuration.lifecycle.deletionEnabled = true;
    assert.throws(() => owner.policy(configuration, scope));
});
test('missing grant, foreign results and revoked policy prevent delivery', async () => {
    request.authData.permissions = [];
    await assert.rejects(owner.preview(request, configuration));
    assert.equal(reads, 0);
    request.authData.permissions = ['copilot.activity.lifecycle.read'];
    rows[0].enterpriseCode = 'other';
    await assert.rejects(owner.preview(request, configuration));
    rows[0].enterpriseCode = 'acme';
    const original = SERVICE.DefaultCopilotConversationRecordService.get;
    SERVICE.DefaultCopilotConversationRecordService.get = async (r) => {
        const result = await original(r);
        configuration.lifecycle.enterprisePolicies[0].holdAll = true;
        return result;
    };
    await assert.rejects(owner.preview(request, configuration));
});
