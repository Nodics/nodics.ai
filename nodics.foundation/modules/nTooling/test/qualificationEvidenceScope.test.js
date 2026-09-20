/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module nTooling/test/qualificationEvidenceScope @description Ensures isolated qualification contracts do not claim deployment evidence and preserve failures. @layer test @owner nTooling */
const assert = require('node:assert/strict');
const service = require('../src/service/quality/defaultFrameworkQualificationEvidenceService');
let output,
    fail = false;
const context = {
    ...service,
    runContract: () => ({
        result: { status: fail ? 1 : 0, stderr: fail ? 'contract failed' : '' },
        durationMs: 1,
    }),
};
const log = console.log;
try {
    console.log = (value) => {
        output = JSON.parse(value);
    };
    assert.equal(context.runPublishingInterruptionContracts(), true);
    assert.equal(output.environment, null);
    assert.equal(output.executionScope, 'ISOLATED_CONTRACT_TESTS');
    assert(output.evidence.length > 0);
    assert(output.evidence.every((row) => row.state === 'PASSED'));
    fail = true;
    assert.equal(context.runPublishingInterruptionContracts(), false);
    assert(output.evidence.every((row) => row.state === 'FAILED'));
} finally {
    console.log = log;
}
console.log('Qualification evidence scope validated');
