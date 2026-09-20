/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nodics.foundation/modules/nTooling/test/designPrincipleAiGovernanceContract
 * @description Ensures the design-principle audit cannot pass while canonical AI governance is invalid.
 * @layer test
 * @owner nTooling
 * @override Projects may add stricter principle checks while preserving canonical AI-governance validation.
 */

const assert = require('assert');

const {
    auditAiGovernance
} = require('../src/service/quality/defaultDesignPrincipleAuditService');

const calls = [];
const failures = [];
auditAiGovernance(failures, {
    validateRootFiles(target) {
        calls.push('root');
        target.push('root governance failure');
    },
    validatePackageFiles(target) {
        calls.push('packages');
        target.push('package governance failure');
    },
    validateReadmeCasing(target) {
        calls.push('readme-casing');
        target.push('README casing failure');
    },
    validateAgentFiles(target) {
        calls.push('agents');
        target.push('AGENTS inheritance failure');
    }
});

assert.deepStrictEqual(calls, ['root', 'packages', 'readme-casing', 'agents'],
    'principle audit must execute every canonical AI-governance validator');
assert.deepStrictEqual(failures, [
    'root governance failure',
    'package governance failure',
    'README casing failure',
    'AGENTS inheritance failure'
], 'principle audit must preserve AI-governance failures');

const principleService = require('../src/service/quality/defaultDesignPrincipleAuditService');
const path = require('path');
const fs = require('fs');
const foundationRoot = path.resolve(__dirname, '../../..');
const partnerContract = 'modules/nSetup/llm/contracts/customer-project-mode-contract.md';
const context = {
    ...principleService,
    /** Resolve canonical guidance independently of the shell's working directory. */
    corePath(relativePath) { return relativePath; },
    /** Read actual authored governance without booting or modifying a runtime. */
    read(relativePath) { return fs.readFileSync(path.join(foundationRoot, relativePath), 'utf8'); }
};
const intactFailures = [];
context.auditPrincipleContracts(intactFailures);
assert.deepStrictEqual(intactFailures, [], 'authored principle contracts must pass');

// Simulate lost source clauses without changing the checkout or generated data.
[
    ...['nodics-principles.md', 'ai-coding-and-customization-contract.md'].map(fileName => [
        'modules/nSetup/llm/contracts/' + fileName,
        '## Mandatory Ownership, Placement And Scope Review'
    ]),
    ...[
        'contracts/developer-implementation-contract.md',
        'contracts/customer-config-classification-contract.md',
        'contracts/module-structure-contract.md',
        'playbooks/change-gate-contract.md',
        'playbooks/daily-change-checklist.md',
        'prompts/review-prompt.md',
        'ai-enablement-index.md'
    ].map(relativePath => [
        'modules/nSetup/llm/' + relativePath,
        'ai-coding-and-customization-contract.md#mandatory-ownership-placement-and-scope-review'
    ]),
    [partnerContract, 'Partners write only to their customer-owned backend and frontend repositories.'],
    [partnerContract, '## Ownership And Dependency Direction'],
    [partnerContract, '## Schema Ownership And Data Contributions'],
    [partnerContract, '## Separate Contribution And Release Channel'],
    [partnerContract, 'Promotion is never an automatic partner action.'],
    ['modules/nSetup/llm/contracts/ai-coding-and-customization-contract.md', 'customer-project-mode-contract.md'],
    ['modules/nSetup/llm/contracts/developer-implementation-contract.md', 'customer-project-mode-contract.md'],
    ['modules/nSetup/llm/ai-enablement-index.md', 'Partners write only to customer-owned repositories']
].forEach(([targetPath, clause]) => {
    const driftedFailures = [];
    const drifted = {
        ...context,
        /** Model documentation drift at a single ownership or discovery boundary. */
        read(relativePath) {
            const content = context.read(relativePath);
            return relativePath === targetPath ? content.split(clause).join('removed') : content;
        }
    };
    drifted.auditPrincipleContracts(driftedFailures);
    assert(driftedFailures.some(message => message.includes(targetPath) && message.includes(clause)),
        'principle audit must reject lost mandatory governance or discovery: ' + clause);
});
const missingFailures = [];
context.auditPrincipleContracts.call({
    ...context,
    /** Model a missing canonical contract using the normal audit read boundary. */
    read(relativePath) {
        if (relativePath === partnerContract) throw new Error('missing contract');
        return context.read(relativePath);
    }
}, missingFailures);
assert(missingFailures.includes('Missing principle audit file: ' + partnerContract),
    'principle audit must reject a missing partner contract');

console.log('Design-principle AI-governance contract validated');
