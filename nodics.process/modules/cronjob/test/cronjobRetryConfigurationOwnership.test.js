/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module cronjob/test/retryConfigurationOwnership @description Verifies owner retry timing and overrides using captured callbacks without running jobs or consumers. @owner cronjob @layer test */
const test = require('node:test');
const assert = require('node:assert/strict');
const service = require('../src/service/cronjob/defaultCronJobService');
const defaults = require('../config/properties').cronjob;
test('startup waiting reads only its consumer-owned retry delay', (t) => {
    const previous = {
        CONFIG: global.CONFIG,
        NODICS: global.NODICS,
        setTimeout: global.setTimeout,
    };
    t.after(() => Object.assign(global, previous));
    const captured = [];
    global.NODICS = { getServerState: () => 'starting' };
    global.setTimeout = (callback, delay) => captured.push({ callback, delay });
    const instance = { ...service, LOG: { info() {}, debug() {} } };
    for (const delay of [defaults.processRetrySleepTime, 4321]) {
        global.CONFIG = {
            get: (key) => {
                assert.equal(key, 'cronjob');
                return {
                    ...defaults,
                    runOnStartup: true,
                    processRetrySleepTime: delay,
                };
            },
        };
        instance.startOnStartup();
        assert.equal(captured.at(-1).delay, delay);
        assert.equal(typeof captured.at(-1).callback, 'function');
    }
    assert.equal(captured.length, 2);
});
