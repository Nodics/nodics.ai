/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module nConfig/test/ScriptsCompletionContract @description Verifies ordered async lifecycle scripts and original failure propagation. @layer test @owner nConfig */
const assert = require('node:assert/strict');
const { test } = require('node:test');
const service = require('../src/service/DefaultScriptsHandlerService');

for (const phase of ['Pre', 'Post']) {
    test(phase + ' scripts await each contribution with its effective receiver', async () => {
        const previous = global.NODICS;
        const events = [];
        let release;
        const pending = new Promise(resolve => { release = resolve; });
        const scripts = {
            first: async function () { events.push('first'); await pending; this.value = 42; events.push('complete'); },
            second: function () { assert.equal(this.value, 42); events.push('second'); }
        };
        global.NODICS = { ['get' + phase + 'Scripts']: () => scripts };
        try {
            let settled = false;
            const running = service['execute' + phase + 'Scripts']().then(result => { settled = true; return result; });
            await new Promise(resolve => setImmediate(resolve));
            assert.equal(settled, false);
            assert.deepEqual(events, ['first']);
            release();
            assert.equal(await running, true);
            assert.deepEqual(events, ['first', 'complete', 'second']);
        } finally { release(); global.NODICS = previous; }
    });
    test(phase + ' scripts preserve async rejection and skip later scripts', async () => {
        const previous = global.NODICS;
        const failure = new Error('required contribution failed');
        let continued = false;
        global.NODICS = { ['get' + phase + 'Scripts']: () => ({
            first: async function () { await Promise.resolve(); throw failure; },
            second: function () { continued = true; }
        }) };
        try {
            await assert.rejects(service['execute' + phase + 'Scripts'](), error => error === failure);
            assert.equal(continued, false);
        } finally { global.NODICS = previous; }
    });
}
