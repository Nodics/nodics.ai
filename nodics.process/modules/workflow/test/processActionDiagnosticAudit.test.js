/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';
/**
 * @module workflow/test/actionDiagnosticAudit
 * @description Proves generic optional static-code audit projection excludes arbitrary action output.
 * @layer test
 * @owner workflow
 * @override Later lifecycle layers retain the bounded projection without domain imports.
 */
const test = require('node:test'), assert = require('node:assert/strict');
const lifecycle = require('../src/service/operation/defaultProcessRuntimeLifecycleService');

test('action audit accepts only bounded static codes and never reads private result fields', async () => {
    for (const [code, allowed] of [[undefined, false], ['', false], ['A', true], ['OWNER_2_OK', true],
        ['A'.repeat(64), true], ['A'.repeat(65), false], ['lowercase', false], ['CODE\n', false],
        ['CODE\r\n', false], ['CODE WITH SPACE', false], ['CODE:ID', false], ['É', false],
        ['_CODE', false], ['2_CODE', false], [123, false], [null, false], [{ code: 'PRIVATE' }, false]]) {
        const result = { status: 'COMPLETED', diagnosticCode: code };
        for (const field of ['output', 'message', 'error', 'recipientId', 'intentCode'])
            Object.defineProperty(result, field, { get() { throw new Error('PRIVATE_RESULT_READ'); } });
        const events = [];
        const owner = Object.assign(Object.create(lifecycle), {
            actionAdapterRegistryService: () => ({ execute: async () => result }),
            audit: async (_request, event) => { events.push(event); }
        });
        assert.equal(await owner.executeActionNode({}, { code: 'instance', definitionCode: 'definition' }, {},
            { code: 'action', action: { moduleName: 'owner', operation: 'execute' } }, {}), result);
        assert.deepEqual(events[0].metadata, { nodeCode: 'action', adapter: 'owner.execute', status: 'COMPLETED',
            ...(allowed ? { diagnosticCode: code } : {}) });
        assert.equal(events.length, 1);
    }
});
