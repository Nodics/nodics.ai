/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nTooling/test/applicationBuilderSchemaContract
 * @description Verifies versioned Builder schemas accept representative Commerce and domain documents while rejecting secret material, unsafe paths, missing contracts, unknown properties, and malformed integrity evidence.
 * @layer test
 * @owner nTooling
 * @override Additional Builder contract versions must extend these positive and negative fixtures without weakening version-one invariants.
 */
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const contractService = require('../src/service/applicationBuilder/defaultApplicationBuilderContractService');

const fixtureRoot = path.join(__dirname, 'fixtures', 'applicationBuilder');

/**
 * Loads a JSON fixture from the Builder test boundary.
 * @param {string} state Fixture state directory.
 * @param {string} fileName Fixture filename.
 * @returns {Object} Parsed fixture.
 */
function fixture(state, fileName) {
    return JSON.parse(fs.readFileSync(path.join(fixtureRoot, state, fileName), 'utf8'));
}

const validFixtures = {
    solution: ['solution-commerce.json', 'solution-apparel.json', 'solution-electronics.json',
        'solution-telco.json', 'solution-combined.json'],
    capability: ['capability-telco.json'],
    guided: ['guided-request-telco.json'],
    plan: ['generation-plan-apparel.json'],
    lock: ['solution-lock-apparel.json'],
    qualification: ['qualification-report-apparel.json']
};

Object.keys(validFixtures).forEach(kind => {
    validFixtures[kind].forEach(fileName => {
        const result = contractService.validateDocument(kind, fixture('valid', fileName));
        assert.strictEqual(result.valid, true, fileName + ' must satisfy the ' + kind + ' contract:\n' +
            result.errors.join('\n'));
    });
});

const invalidFixtures = {
    'solution-secret-value.json': 'solution',
    'solution-unsafe-path.json': 'solution',
    'solution-unknown-property.json': 'solution',
    'guided-request-bad-preset.json': 'guided',
    'capability-missing-dependencies.json': 'capability',
    'generation-plan-unsafe-target.json': 'plan',
    'solution-lock-bad-digest.json': 'lock'
};

Object.keys(invalidFixtures).forEach(fileName => {
    const result = contractService.validateDocument(invalidFixtures[fileName], fixture('invalid', fileName));
    assert.strictEqual(result.valid, false, fileName + ' must be rejected');
    assert(result.errors.length > 0, fileName + ' must report actionable diagnostics');
});

assert.throws(() => contractService.loadSchema('unknown'), /Unsupported Application Builder contract kind/,
    'Unknown Builder contract kinds must fail closed');

console.log('Application Builder schema contract validated');
