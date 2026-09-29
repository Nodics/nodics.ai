/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');
const verify = require('./helpers/generatedRuntime.cjs');

test('independent server schema customization is materialized and temporary output is cleaned on success/failure', () => {
    const field = { type: 'string', required: true, description: 'Independent schema fixture field.' };
    const selection = { moduleRoots: [], activeModules: [], role: 'CONTRACT',
        schemas: { worker: { fixtureRecord: false } },
        overlaySchema: { worker: { fixtureRecord: { super: 'base', model: true,
            service: { enabled: true }, router: { enabled: false }, definition: { fixtureLabel: field } } } },
        expectedDefinitions: { worker: { fixtureRecord: { fixtureLabel: field } } },
    };
    const removed = [];
    const original = fs.rmSync;
    try {
        fs.rmSync = (root, options) => { removed.push(root); return original(root, options); };
        verify(selection);
        assert.throws(() => verify({ ...selection, schemas: { worker: { absentSchema: false } } }), /absentSchema must materialize/);
    } finally { fs.rmSync = original; }
    assert.equal(removed.length, 2);
    assert(removed.every(root => !fs.existsSync(root)), 'success and failure must remove their own generated fixture');
});
