/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nTest/test/liveTestRunnerServiceLoad
 * @description Verifies guarded live-test runner services remain safe to load during normal runtime service discovery.
 * @layer test
 * @owner nTest
 * @override Projects may extend runner behavior without introducing module-load side effects.
 */
const assert = require('assert');

const crudRunner = require('../src/service/tooling/defaultGeneratedCrudLiveTestRunnerService');
const accessPolicyRunner = require('../src/service/tooling/defaultGeneratedAccessPolicyLiveTestRunnerService');

// @nodics-capability-behavior @nodics-area testing
[crudRunner, accessPolicyRunner].forEach(runner => {
    assert.strictEqual(typeof runner.run, 'function');
    assert.strictEqual(typeof runner.runCli, 'function');
    assert.strictEqual(typeof runner.getArgValue, 'function');
});

console.log('Live generated test runner service loading validated');
