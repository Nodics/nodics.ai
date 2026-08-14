/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nodics.foundation/modules/nTooling/test/aiGovernanceValidation
 * @description Verifies that repository-root AI governance and shared memory are owned by modules/nSetup/llm while module-shaped packages retain local llm entrypoints.
 * @layer test
 * @owner nTooling
 * @override Project tooling may add stricter package guidance checks without introducing a repository-root llm authority.
 */

const assert = require('assert');

const {
    ownsDocumentation,
    validateRootFiles,
    validatePackageFiles,
    validateAgentFiles
} = require('../src/service/quality/defaultAiGovernanceValidationService');

assert.strictEqual(ownsDocumentation(require('path').resolve(__dirname, '../../../..', 'nodics.docs')), true,
    'an explicit backend documentation owner must be allowed to keep its canonical docs source tree');
assert.strictEqual(ownsDocumentation(require('path').resolve(__dirname, '..')), false,
    'an ordinary capability package must not gain docs ownership merely by creating a directory');

const rootFailures = [];
validateRootFiles(rootFailures);
assert.deepStrictEqual(rootFailures, [],
    'repository-root AI governance and shared memory must resolve through AGENTS.md and modules/nSetup/llm');

const packageFailures = [];
validatePackageFiles(packageFailures);
assert(!packageFailures.some(failure => failure.includes('./llm/')),
    'the Nodics repository root must not require a parallel llm directory');
assert.deepStrictEqual(packageFailures, [],
    'module-shaped packages must retain their module-local AI/documentation entrypoints');

const agentFailures = [];
validateAgentFiles(agentFailures);
assert.deepStrictEqual(agentFailures, [],
    'AGENTS.md files must retain resolvable root and modules/nSetup/llm guidance links');

console.log('AI governance validation contract validated');
